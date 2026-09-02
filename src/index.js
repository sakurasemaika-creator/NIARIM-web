/**
 * NIARIM公式サイト Workerエントリポイント
 *
 * /api/* のみWorkerで処理し、それ以外は Workers Static Assets (env.ASSETS) が
 * public/ ディレクトリの静的ファイルを配信する。
 */
import { handleContact } from "./contact.js";
import { jsonResponse } from "./utils.js";

/**
 * Content-Security-Policy
 *
 * サイト内のJavaScriptはすべて /js/*.js の同一オリジン外部ファイルに
 * 集約してあるため（設定値の差し込み処理も config-links.js へ切り出し済み）、
 * script-src に 'unsafe-inline' / 'unsafe-eval' を一切許可しない。
 * これによりXSSが混入した場合でもスクリプト実行を防げる。
 *
 * style-src のみ 'unsafe-inline' を許可している。本文中の細かな配置調整に
 * style属性を使っている箇所と、404ページのインライン<style>があるため。
 * スタイルの注入はスクリプト実行に比べ影響が限定的なため許容する。
 *
 * フォントは全て自前配信のため、外部ホストは一切許可しない（'self'のみ）。
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * ここで付与するヘッダーが効くのは「Workerが生成した応答」＝ /api/* だけ。
 * wrangler.jsonc の run_worker_first を ["/api/*"] に限定しているため、
 * HTML・CSS・JS等の静的アセットはWorkerを通らずに配信される。
 * 静的アセット側の同等のヘッダーは public/_headers で指定している。
 * 片方だけ直しても全体はカバーできないので、変更時は必ず両方を更新すること。
 */
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  // frame-ancestors に対応しない古いブラウザ向けの保険として併記する。
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": CSP,
  // HTTPSへの固定。Cloudflare側でHTTPSは有効な前提。
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  // 本サイトはカメラ・マイク・位置情報等を一切使わないため明示的に無効化する。
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/contact") {
        const response = await handleContact(request, env, ctx);
        return withSecurityHeaders(response);
      }

      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(
          jsonResponse(404, { error: "not_found" })
        );
      }

      const assetResponse = await env.ASSETS.fetch(request);
      return withSecurityHeaders(assetResponse);
    } catch (err) {
      console.error("Unhandled error", err);
      return withSecurityHeaders(
        jsonResponse(500, { error: "internal_error" })
      );
    }
  },
};
