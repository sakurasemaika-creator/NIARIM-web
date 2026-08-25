/**
 * /api/contact ハンドラー
 *
 * お問い合わせフォームの送信を受け取り、バリデーション・スパム対策・
 * レート制限を行ったうえで、Resend経由でメールを送信する。
 *
 * メール送信サービスについて（README.mdにも記載）:
 *   - サービス名: Resend
 *   - 無料枠: 3,000通/月、100通/日
 *   - Cloudflare Workers/Pages からのメール送信チュートリアルが公式に提供されている
 *   - RESEND_API_KEY は `wrangler secret put RESEND_API_KEY` で設定し、コードに直接記載しない
 */
import { jsonResponse } from "./utils.js";

const MAX_BODY_BYTES = 10 * 1024; // リクエストサイズ上限（10KB）
const NAME_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 1000;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INQUIRY_TYPES = new Set(["bug", "request", "usage", "account", "other"]);
const INQUIRY_TYPE_LABELS = {
  bug: "不具合報告",
  request: "機能要望",
  usage: "使い方について",
  account: "アカウントについて",
  other: "その他",
};

const RATE_LIMIT_WINDOW_SECONDS = 60; // 同一IPにつき60秒に1回まで
const RATE_LIMIT_DAILY_MAX = 20; // 同一IPにつき1日20通まで

export async function handleContact(request, env, ctx) {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(415, { error: "unsupported_media_type" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "payload_too_large" });
  }

  let raw;
  try {
    raw = await request.text();
  } catch {
    return jsonResponse(400, { error: "invalid_body" });
  }

  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "payload_too_large" });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonResponse(400, { error: "malformed_json" });
  }

  if (!body || typeof body !== "object") {
    return jsonResponse(400, { error: "malformed_json" });
  }

  // honeypot: ボットは通常この隠しフィールドまで埋めてしまうため、
  // 値が入っていた場合はユーザーには成功したように見せかけ、実際の送信は行わない。
  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return jsonResponse(200, { ok: true });
  }

  const validation = validateInput(body);
  if (!validation.ok) {
    return jsonResponse(400, { error: "validation_error", field: validation.field });
  }
  const data = validation.data;

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

  if (env.RATE_LIMIT_KV) {
    const limited = await isRateLimited(env.RATE_LIMIT_KV, clientIp);
    if (limited) {
      return jsonResponse(429, { error: "rate_limited" });
    }
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    // 秘密情報・宛先未設定時はユーザーには汎用エラーのみ返し、詳細はログにのみ記録する。
    console.error("Contact API misconfigured: missing RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL");
    return jsonResponse(500, { error: "internal_error" });
  }

  const sent = await sendViaResend(env, data);
  if (!sent.ok) {
    console.error("Resend send failed", sent.status, sent.detail);
    return jsonResponse(502, { error: "mail_send_failed" });
  }

  if (env.RATE_LIMIT_KV) {
    ctx.waitUntil(recordSubmission(env.RATE_LIMIT_KV, clientIp));
  }

  return jsonResponse(200, { ok: true });
}

function validateInput(body) {
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const agree = body.agree === true;

  if (!INQUIRY_TYPES.has(type)) return { ok: false, field: "type" };
  if (!name || name.length > NAME_MAX_LENGTH) return { ok: false, field: "name" };
  if (!email || email.length > EMAIL_MAX_LENGTH || !EMAIL_RE.test(email)) {
    return { ok: false, field: "email" };
  }
  if (!message || message.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, field: "message" };
  }
  if (!agree) return { ok: false, field: "agree" };

  // メールヘッダ・本文への改行注入対策（ヘッダインジェクション対策）
  if (/[\r\n]/.test(name) || /[\r\n]/.test(email) || /[\r\n]/.test(type)) {
    return { ok: false, field: "invalid_characters" };
  }

  return { ok: true, data: { type, name, email, message, agree } };
}

async function isRateLimited(kv, clientIp) {
  const shortKey = `contact:short:${clientIp}`;
  const dailyKey = `contact:daily:${clientIp}`;

  const [shortHit, dailyCountRaw] = await Promise.all([
    kv.get(shortKey),
    kv.get(dailyKey),
  ]);

  if (shortHit) return true;

  const dailyCount = Number(dailyCountRaw || 0);
  if (dailyCount >= RATE_LIMIT_DAILY_MAX) return true;

  return false;
}

async function recordSubmission(kv, clientIp) {
  const shortKey = `contact:short:${clientIp}`;
  const dailyKey = `contact:daily:${clientIp}`;

  const dailyCountRaw = await kv.get(dailyKey);
  const dailyCount = Number(dailyCountRaw || 0) + 1;

  await Promise.all([
    kv.put(shortKey, "1", { expirationTtl: RATE_LIMIT_WINDOW_SECONDS }),
    kv.put(dailyKey, String(dailyCount), { expirationTtl: 60 * 60 * 24 }),
  ]);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendViaResend(env, data) {
  const typeLabel = INQUIRY_TYPE_LABELS[data.type] || data.type;
  const textBody = [
    `お問い合わせ種別: ${typeLabel}`,
    `お名前: ${data.name}`,
    `メールアドレス: ${data.email}`,
    "",
    "お問い合わせ内容:",
    data.message,
  ].join("\n");

  const htmlBody = `
    <p><strong>お問い合わせ種別:</strong> ${escapeHtml(typeLabel)}</p>
    <p><strong>お名前:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>メールアドレス:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>お問い合わせ内容:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        // ユーザー入力のメールアドレスをreply-toに設定し、そのまま返信できるようにする。
        // fromには使用しない（メールインジェクション・なりすまし対策）。
        reply_to: data.email,
        subject: `【NIARIM お問い合わせ】${typeLabel}`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, status: res.status, detail };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, status: 0, detail: String(err) };
  }
}
