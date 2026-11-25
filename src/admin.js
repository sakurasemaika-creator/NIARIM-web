/**
 * 通報の管理ページ（/admin/）のためのWorker側の部分。
 *
 * - GET /api/admin/config：Googleログインに使うOAuthのWebクライアントIDと、
 *   管理APIのある場所（Lambda Function URL）を返す。アカウント削除の
 *   ページ（/api/account-deletion/challenge）と同じ ACCOUNT_DELETION_GOOGLE_CLIENT_ID
 *   を使う（バックエンドの GOOGLE_CLIENT_ID と同じ公開の値）。管理API自体は
 *   ブラウザーがLambdaへ直接呼ぶ（バックエンドが /admin/ だけCORSで
 *   このサイトの正規のオリジンを許す）ので、Workerはトークンを中継しない。
 * - /admin/ のページだけのヘッダー：Googleのログイン（GIS）とLambdaへの通信、
 *   YouTubeのサムネイルを許すContent-Security-Policy、検索に出さない
 *   X-Robots-Tag。ほかのページのCSPは変えない。
 */
import { jsonResponse } from "./utils.js";

// Same check as the account-deletion page uses for this variable.
const clientIdPattern = /^[a-z0-9-]+\.apps\.googleusercontent\.com$/i;

export function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** The https origin of the admin API (the backend's Function URL), or null. */
export function adminApiUrl(env) {
  try {
    const url = new URL(env.NIARIM_PUBLIC_API_BASE_URL);
    return url.protocol === "https:" && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

export function handleAdminConfig(request, env) {
  const respond = (status, body) => {
    const response = jsonResponse(status, body);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const response = respond(405, { error: "method_not_allowed" });
    response.headers.set("Allow", "GET, HEAD");
    return response;
  }
  const clientId = env.ACCOUNT_DELETION_GOOGLE_CLIENT_ID;
  const api = adminApiUrl(env);
  const missing = [];
  if (typeof clientId !== "string" || !clientIdPattern.test(clientId))
    missing.push("ACCOUNT_DELETION_GOOGLE_CLIENT_ID");
  if (!api) missing.push("NIARIM_PUBLIC_API_BASE_URL");
  if (missing.length) return respond(503, { error: "unavailable", missing });
  return respond(200, { clientId, apiBaseUrl: api.href });
}

/** The /admin/ page's Content-Security-Policy. */
export function adminContentSecurityPolicy(env) {
  const api = adminApiUrl(env);
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' https://accounts.google.com/gsi/client",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
    "font-src 'self'",
    "img-src 'self' data: https://i.ytimg.com https://img.youtube.com",
    "connect-src 'self' https://accounts.google.com/gsi/" +
      (api ? " " + api.origin : ""),
    "frame-src https://accounts.google.com/gsi/",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Adds the admin page's headers on top of the site's security headers. */
export function withAdminPageHeaders(response, env) {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", adminContentSecurityPolicy(env));
  // The Google sign-in popup reports back to this window.
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
