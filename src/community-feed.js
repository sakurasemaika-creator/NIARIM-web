/**
 * Same read-only API endpoints the NIARIM Flutter community client uses:
 * GET /works/latest and GET /ranking/{period}. No credentials are forwarded.
 * Period counters come from the same backend used by Flutter. We never
 * invent or locally re-rank scores; old backend responses remain explicit.
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
    periodBookmarkCount: Number.isSafeInteger(value.periodBookmarkCount) &&
      value.periodBookmarkCount >= 0 ? value.periodBookmarkCount : null,
    thumbnailUrl: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=" + id,
  };
}
function json(body, status=200, noStore=false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": noStore ? "no-store" : (status === 200 ? "public, max-age=60" : "no-store"),
      "x-content-type-options": "nosniff",
    },
  });
}
export async function handleCommunityFeed(request, env, fetchPublic = fetch) {
  if (request.method !== "GET") return json({error:"method_not_allowed"},405);
  const url = new URL(request.url);
  const view = url.searchParams.get("view") || "latest";
  // Metadata-free, strongly-consistent status check of a displayed snapshot.
  // Missing IDs and hidden IDs look identical; no title/media can escape.
  const checking = url.searchParams.has("ids");
  const checkingPlayback = url.searchParams.has("playbackId");
  if (checking && checkingPlayback) return json({error:"invalid_query"},400,true);
  const ids = checking ? url.searchParams.get("ids")?.split(",") ?? [] : [];
  if (checking && (ids.length < 1 || ids.length > 50 ||
      new Set(ids).size !== ids.length ||
      ids.some(id=>!/^[A-Za-z0-9_-]{11}$/.test(id)))) {
    return json({error:"invalid_ids"},400,true);
  }
  const playbackId = checkingPlayback
    ? safeYoutubeVideoId(url.searchParams.get("playbackId")) : "";
  if (checkingPlayback && !playbackId) {
    return json({error:"invalid_playback_id"},400,true);
  }
  const route = checkingPlayback
    ? "/works/"+playbackId+"/playback-status"
    : checking
      ? "/ranking/visibility?ids="+encodeURIComponent(ids.join(","))
      : ALLOWED.get(view);
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
      signal: AbortSignal.timeout(checkingPlayback ? 10000 : 7000),
    });
  } catch (_) {
    return json({error:"upstream_unavailable"},502);
  }
  if(!response.ok) return json({error:"upstream_unavailable"},502);
  try {
    const payload = await response.json();
    if (checkingPlayback) {
      // Return only a fixed status label, never a work's private metadata.
      const statuses = ["available","private","deleted","unavailable","unknown"];
      if (!payload || !statuses.includes(payload.status)) {
        return json({error:"bad_response"},502,true);
      }
      return json({status:payload.status},200,true);
    }
    if (checking) {
      if (!payload || typeof payload.visibility !== "object" ||
          payload.visibility === null || Array.isArray(payload.visibility)) {
        return json({error:"bad_response"},502,true);
      }
      const visible=Object.create(null);
      for(const id of ids) visible[id] = payload.visibility[id] === true;
      return json({visibility:visible},200,true);
    }
    if (!payload || !Array.isArray(payload.works)) return json({error:"bad_response"},502);
    return json({
      view,
      metric: payload.metric === "periodBookmarks" ? "periodBookmarks" : "bookmarks",
      windowId: typeof payload.windowId === "string" && /^[0-9W]{4,9}$/.test(payload.windowId)
        ? payload.windowId : null,
      works: payload.works.slice(0,9).map(publicWork).filter(Boolean),
      unavailableReason: payload.unavailableReason === "BOOKMARK_PERIOD_NOT_IMPLEMENTED"
        ? "BOOKMARK_PERIOD_NOT_IMPLEMENTED" : null,
    },200,view !== "latest");
  } catch (_) {
    return json({error:"bad_response"},502);
  }
}
