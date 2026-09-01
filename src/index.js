/**
 * NIARIM公式サイト Workerエントリポイント
 *
 * /api/* のみWorkerで処理し、それ以外は Workers Static Assets (env.ASSETS) が
 * public/ ディレクトリの静的ファイルを配信する。
 * wrangler.jsonc の assets.run_worker_first で /api/* が本Workerを先に通るよう設定している。
 */
import { handleContact } from "./contact.js";
import { jsonResponse } from "./utils.js";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
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
      // Worker内部のエラー詳細をユーザーへ返さない。ログにのみ記録する。
      console.error("Unhandled error", err);
      return withSecurityHeaders(
        jsonResponse(500, { error: "internal_error" })
      );
    }
  },
};
