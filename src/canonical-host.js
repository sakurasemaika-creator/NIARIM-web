/**
 * 公開サイトの正規ドメインへの転送。
 *
 * 旧い公開ホスト（Workers の既定のサブドメイン）で開かれたページは、
 * SITE_ORIGIN の正規ドメインへ恒久転送する。API・POST等は転送しない
 * （アプリ・フォームの送信先を変えないため）。プレビューの版のホスト
 * （"<version>-niarim-web..."）は対象外。
 */
export const LEGACY_SITE_HOSTS = ["niarim-web.niarim.workers.dev"];

export function canonicalRedirect(request, env) {
  if (!env || !env.SITE_ORIGIN) return null;
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  if (!LEGACY_SITE_HOSTS.includes(url.hostname)) return null;
  if (url.pathname.startsWith("/api/")) return null;
  let target;
  try {
    target = new URL(env.SITE_ORIGIN);
  } catch {
    return null;
  }
  if (target.hostname === url.hostname) return null;
  target.pathname = url.pathname;
  target.search = url.search;
  return Response.redirect(target.toString(), 301);
}
