/**
 * Same read-only API endpoints the NIARIM Flutter community client uses:
 * GET /works/latest and GET /ranking/{period}. No credentials are forwarded.
 * The period-ranking backend currently returns unavailableReason for daily,
 * weekly, monthly and yearly. Preserve this fact rather than inventing data.
 */
const ALLOWED = new Map([
  ["latest", "/works/latest?limit=9"],
  ["overall", "/ranking/bookmarks?limit=9"],
  ["daily", "/ranking/daily?limit=9"],
  ["weekly", "/ranking/weekly?limit=9"],
  ["monthly", "/ranking/monthly?limit=9"],
  ["yearly", "/ranking/yearly?limit=9"],
]);
const safeString = (value, max = 180) =>
  typeof value === "string" ? value.slice(0, max) : "";
function safeYoutubeVideoId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{11}$/.test(value) ? value : "";
}
function publicWork(value) {
  if (!value || typeof value !== "object" || value.isUnavailable === true || value.isNiarimPublished === false) {
    return null;
  }
  const id = safeYoutubeVideoId(value.workId);
  if (!id) return null;
  const title = safeString(value.title, 220);
  if (!title) return null;
  return {
    workId: id,
    title,
    channelName: safeString(value.channelName, 110),
    postedAt: safeString(value.postedAt, 40),
    bookmarkCount: Number.isFinite(value.bookmarkCount) ? Math.max(0, Math.floor(value.bookmarkCount)) : 0,
    thumbnailUrl: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=" + id,
  };
}
function json(body, status=200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=60" : "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
export async function handleCommunityFeed(request, env, fetchPublic = fetch) {
  if (request.method !== "GET") return json({error:"method_not_allowed"},405);
  const url = new URL(request.url);
  const view = url.searchParams.get("view") || "latest";
  const route = ALLOWED.get(view);
  if (!route) return json({error:"invalid_view"},400);
  const base = env.NIARIM_PUBLIC_API_BASE_URL;
  if (typeof base !== "string" || !/^https:\/\/[a-z0-9.-]+\/?$/i.test(base)) {
    return json({error:"not_configured"},503);
  }
  const endpoint = new URL(route.slice(1),base.endsWith("/")?base:base+"/");
  if(endpoint.protocol !== "https:") return json({error:"invalid_upstream"},503);
  let response;
  try {
    response = await fetchPublic(endpoint.toString(), {
      method: "GET",
      headers: {"accept":"application/json"},
      redirect: "error",
      signal: AbortSignal.timeout(7000),
    });
  } catch (_) {
    return json({error:"upstream_unavailable"},502);
  }
  if(!response.ok) return json({error:"upstream_unavailable"},502);
  try {
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.works)) return json({error:"bad_response"},502);
    return json({
      view,
      works: payload.works.slice(0,9).map(publicWork).filter(Boolean),
      unavailableReason: payload.unavailableReason === "BOOKMARK_PERIOD_NOT_IMPLEMENTED"
        ? "BOOKMARK_PERIOD_NOT_IMPLEMENTED" : null,
    });
  } catch (_) {
    return json({error:"bad_response"},502);
  }
}
