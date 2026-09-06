/**
 * 配信サーバーの場所を自動で見つける。
 *
 * なぜ必要か:
 *   このリポジトリには配信の立て方が2通りあり、ポートが違う。
 *     - npx wrangler dev --port 8788 … 本番と同じ（_headers のCSPも効く）
 *     - python3 -m http.server 8787 --directory public … ネットワーク制限などで
 *       wrangler が使えない環境向けの代替（CIもこちらを使っている）
 *   手順書にポートを1つだけ書くと、もう一方で立てた人が
 *   ERR_CONNECTION_REFUSED を見て「修正が効かない」と誤診する。
 *   立っているほうを自動で拾い、どちらも無ければその旨をはっきり伝える。
 *
 * 明示したいときは AUDIT_BASE_URL で上書きできる（この値が最優先）。
 */

export const SERVER_CANDIDATES = [
  process.env.AUDIT_BASE_URL,
  process.env.BASE_URL,
  "http://localhost:8788",
  "http://localhost:8787",
  "http://127.0.0.1:8788",
  "http://127.0.0.1:8787",
].filter(Boolean);

async function alive(base) {
  try {
    const res = await fetch(base + "/", {
      signal: AbortSignal.timeout(2500),
      redirect: "follow",
    });
    if (!res.ok) return null;
    // wrangler は Worker 経由なので _headers のCSPが付く。
    // 素の静的サーバーには付かない。どちらで見ているかを呼び出し側へ伝える。
    const csp =
      res.headers.get("content-security-policy") ||
      res.headers.get("content-security-policy-report-only");
    return {
      base,
      kind: csp ? "wrangler相当（CSP適用あり）" : "静的サーバー（CSP適用なし）",
    };
  } catch {
    return null;
  }
}

/** 立っている配信サーバーを1つ返す。無ければ null。 */
export async function detectServer() {
  for (const base of SERVER_CANDIDATES) {
    const hit = await alive(base);
    if (hit) return hit;
  }
  return null;
}

/** 見つからなければ、直し方を添えて落とす。 */
export async function requireServer() {
  const found = await detectServer();
  if (found) return found;
  throw new Error(
    "配信サーバーが見つかりません（探した先: " +
      SERVER_CANDIDATES.join(", ") +
      "）\n" +
      "  別ターミナルでどちらかを起動してください:\n" +
      "    npx wrangler dev --port 8788                      # 本番と同じ（推奨）\n" +
      "    python3 -m http.server 8787 --directory public    # wrangler が使えない環境\n" +
      "  別のポート・ホストなら AUDIT_BASE_URL=http://… で指定できます。",
  );
}
