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

const NAME_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 1000;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_ATTACHMENTS = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 画像1枚あたり5MB
const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 動画1本あたり15MB
// Resend(メール送信サービス)は1通あたりの合計サイズに上限があり、
// 添付はメール送信時にbase64化されて約1.33倍に膨らむため、合計サイズにも
// 別途上限を設ける（動画を1本含めても収まるよう、画像上限×3より大きい値にする）。
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Map([
  ["image/png", [MAX_IMAGE_BYTES, "png"]],
  ["image/jpeg", [MAX_IMAGE_BYTES, "jpg"]],
  ["image/webp", [MAX_IMAGE_BYTES, "webp"]],
  ["image/gif", [MAX_IMAGE_BYTES, "gif"]],
  ["video/mp4", [MAX_VIDEO_BYTES, "mp4"]],
  ["video/quicktime", [MAX_VIDEO_BYTES, "mov"]],
  ["video/webm", [MAX_VIDEO_BYTES, "webm"]],
]);
// 本文(テキスト)のサイズ上限＋添付合計の上限を踏まえたリクエスト全体の上限。
// multipartのオーバーヘッド分の余裕も持たせる。
const MAX_BODY_BYTES = MAX_TOTAL_ATTACHMENT_BYTES + 256 * 1024;

const INQUIRY_TYPES = new Set(["bug", "request", "usage", "account", "other"]);
const INQUIRY_TYPE_LABELS = {
  bug: "不具合報告",
  request: "機能要望",
  usage: "使い方について",
  account: "アカウントについて",
  other: "その他",
};

export async function handleContact(request, env) {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }
  const expectedOrigin = new URL(request.url).origin;
  const acceptedOrigins = [env.SITE_ORIGIN, env.CONTACT_SITE_ORIGIN]
    .filter(Boolean)
    .map((value) => new URL(value).origin);
  const origin = request.headers.get("Origin");
  if (
    (acceptedOrigins.length > 0 && !acceptedOrigins.includes(expectedOrigin)) ||
    (origin === null
      ? request.headers.get("Sec-Fetch-Site") !== "same-origin"
      : origin !== expectedOrigin)
  ) {
    return jsonResponse(403, { error: "forbidden_origin" });
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonResponse(415, { error: "unsupported_media_type" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "payload_too_large" });
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  const limiter = env.CONTACT_RATE_LIMITER?.getByName(clientIp);
  if (!limiter) return jsonResponse(503, { error: "internal_error" });
  if (await limiter.isLimited()) {
    return jsonResponse(429, { error: "rate_limited" });
  }

  let form;
  try {
    form = await readLimitedFormData(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return jsonResponse(413, { error: "payload_too_large" });
    }
    return jsonResponse(400, { error: "invalid_body" });
  }

  const body = {
    type: form.get("type"),
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
    agree: form.get("agree") === "true",
    company: form.get("company"),
  };

  // honeypot: ボットは通常この隠しフィールドまで埋めてしまうため、
  // 値が入っていた場合はユーザーには成功したように見せかけ、実際の送信は行わない。
  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return jsonResponse(200, { ok: true });
  }

  const validation = validateInput(body);
  if (!validation.ok) {
    return jsonResponse(400, {
      error: "validation_error",
      field: validation.field,
    });
  }
  const data = validation.data;

  const attachmentFiles = form
    .getAll("attachments")
    .filter(
      (entry) =>
        typeof entry === "object" &&
        typeof entry.arrayBuffer === "function" &&
        entry.size > 0,
    );
  if (attachmentFiles.length > MAX_ATTACHMENTS) {
    return jsonResponse(400, {
      error: "validation_error",
      field: "attachments",
    });
  }
  let totalAttachmentBytes = 0;
  for (const file of attachmentFiles) {
    const [maxBytes] = ALLOWED_ATTACHMENT_TYPES.get(file.type) || [];
    if (!maxBytes || file.size > maxBytes) {
      return jsonResponse(400, {
        error: "validation_error",
        field: "attachments",
      });
    }
    totalAttachmentBytes += file.size;
  }
  if (totalAttachmentBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    return jsonResponse(400, {
      error: "validation_error",
      field: "attachments",
    });
  }

  const attachments = [];
  const attachmentNames = [];
  try {
    for (const [index, file] of attachmentFiles.entries()) {
      const buffer = await file.arrayBuffer();
      if (!matchesAttachmentType(new Uint8Array(buffer), file.type)) {
        return jsonResponse(400, {
          error: "validation_error",
          field: "attachments",
        });
      }
      const [, extension] = ALLOWED_ATTACHMENT_TYPES.get(file.type);
      const filename = `attachment-${index + 1}.${extension}`;
      attachmentNames.push({
        filename,
        originalName: sanitizeFilename(file.name),
      });
      attachments.push({
        filename,
        content: arrayBufferToBase64(buffer),
      });
    }
  } catch (err) {
    console.error("Failed to read attachments", err);
    return jsonResponse(400, { error: "invalid_body" });
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    // 秘密情報・宛先未設定時はユーザーには汎用エラーのみ返し、詳細はログにのみ記録する。
    console.error(
      "Contact API misconfigured: missing RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL",
    );
    return jsonResponse(500, { error: "internal_error" });
  }

  // Reserve before calling the mail provider. Simultaneous requests may all
  // pass the early check, but only one can reserve a slot for the same IP.
  if (!(await limiter.reserve())) {
    return jsonResponse(429, { error: "rate_limited" });
  }
  const sent = await sendViaResend(env, data, attachments, attachmentNames);
  if (!sent.ok) {
    console.error("Resend send failed", sent.status, sent.detail);
    return jsonResponse(502, { error: "mail_send_failed" });
  }

  return jsonResponse(200, { ok: true });
}

class PayloadTooLargeError extends Error {}

// Content-Lengthが無い・偽装されているリクエストも、実際に読んだバイト数で
// 制限する。未使用フィールドやmultipartのオーバーヘッドも上限に含める。
async function readLimitedFormData(request) {
  if (!request.body) throw new TypeError("Empty body");
  const reader = request.body.getReader();
  let bytes = 0;
  let tooLarge = false;
  const bounded = new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        bytes += value.byteLength;
        if (bytes > MAX_BODY_BYTES) {
          tooLarge = true;
          controller.error(new PayloadTooLargeError());
          await reader.cancel();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  try {
    return await new Response(bounded, {
      headers: { "Content-Type": request.headers.get("Content-Type") },
    }).formData();
  } catch (error) {
    if (tooLarge) throw new PayloadTooLargeError();
    throw error;
  } finally {
    reader.releaseLock();
  }
}

function validateInput(body) {
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const agree = body.agree === true;

  if (!INQUIRY_TYPES.has(type)) return { ok: false, field: "type" };
  if (!name || name.length > NAME_MAX_LENGTH)
    return { ok: false, field: "name" };
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

// パス区切り(../ 等)がメール本文へそのまま渡らないよう、パス部分を
// 取り除く（日本語ファイル名やスペースはそのまま許可する）。
function sanitizeFilename(name) {
  if (typeof name !== "string") return "";
  const base = name.split(/[\\/]/).pop() || "";
  return base
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "")
    .trim()
    .slice(-100);
}

function matchesAttachmentType(bytes, type) {
  const ascii = (start, end) =>
    String.fromCharCode(...bytes.subarray(start, end));
  const hasPrefix = (signature) =>
    signature.every((byte, index) => bytes[index] === byte);
  switch (type) {
    case "image/png":
      return (
        hasPrefix([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) &&
        ascii(12, 16) === "IHDR"
      );
    case "image/jpeg":
      return hasPrefix([0xff, 0xd8, 0xff]);
    case "image/gif":
      return /^GIF8[79]a$/.test(ascii(0, 6));
    case "image/webp":
      return ascii(0, 4) === "RIFF" && /^WEBPVP8[ LX]$/.test(ascii(8, 16));
    case "video/webm":
      return (
        hasPrefix([0x1a, 0x45, 0xdf, 0xa3]) &&
        ascii(4, 64).includes("\x42\x82\x84webm")
      );
    case "video/mp4":
    case "video/quicktime": {
      if (bytes.length < 16 || ascii(4, 8) !== "ftyp") return false;
      const length = new DataView(bytes.buffer, bytes.byteOffset).getUint32(0);
      if (length < 16 || length > bytes.length || length % 4 !== 0)
        return false;
      const brand = ascii(8, 12);
      if (type === "video/quicktime") return brand === "qt  ";
      return /^(isom|iso[2-9]|mp4[12]|avc1|dash|M4V |MSNV|cmfc|cmfs)$/.test(
        brand,
      );
    }
    default:
      return false;
  }
}

// Workers環境にはNode.jsのBufferがないため、ArrayBufferを手動でbase64化する。
// spread演算子で大きな配列を一度に展開するとスタックオーバーフローの
// 危険があるため、chunk単位でString.fromCharCodeへ渡す。
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + CHUNK_SIZE),
    );
  }
  return btoa(binary);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendViaResend(env, data, attachments, attachmentNames) {
  const typeLabel = INQUIRY_TYPE_LABELS[data.type] || data.type;
  const originals = attachmentNames.map(({ filename, originalName }) =>
    originalName ? `${filename}: ${originalName}` : filename,
  );
  const textBody = [
    `お問い合わせ種別: ${typeLabel}`,
    `お名前: ${data.name}`,
    `メールアドレス: ${data.email}`,
    "",
    "お問い合わせ内容:",
    data.message,
    ...(originals.length ? ["", "添付ファイルの元の名前:", ...originals] : []),
  ].join("\n");

  const htmlBody = `
    <p><strong>お問い合わせ種別:</strong> ${escapeHtml(typeLabel)}</p>
    <p><strong>お名前:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>メールアドレス:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>お問い合わせ内容:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
    ${originals.length ? `<p>添付ファイルの元の名前:<br>${originals.map(escapeHtml).join("<br>")}</p>` : ""}
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
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
        attachments:
          attachments && attachments.length ? attachments : undefined,
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
