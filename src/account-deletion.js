import { jsonResponse } from "./utils.js";

const NONCE_COOKIE = "__Host-niarim-deletion";
const hex = /^[a-f0-9]{64}$/;
const actions = new Set(["verify", "submit", "status"]);
const clientIdPattern = /^[a-z0-9-]+\.apps\.googleusercontent\.com$/i;

function privateResponse(status, value, cookie) {
  const response = jsonResponse(status, value);
  response.headers.set("Cache-Control", "no-store");
  if (cookie) response.headers.append("Set-Cookie", cookie);
  return response;
}

async function readSmallJson(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(text + decoder.decode());
      bytes += value.byteLength;
      if (bytes > 12 * 1024) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function handleAccountDeletion(request, env, action) {
  const url = new URL(request.url);
  const origin = url.origin;
  const clientId = env.ACCOUNT_DELETION_GOOGLE_CLIENT_ID;
  const configuredOrigins = [env.SITE_ORIGIN, env.CONTACT_SITE_ORIGIN]
    .filter(Boolean)
    .map((value) => new URL(value).origin);
  const enabled =
    url.protocol === "https:" &&
    configuredOrigins.includes(origin) &&
    typeof clientId === "string" &&
    clientIdPattern.test(clientId) &&
    env.NIARIM_PUBLIC_API_BASE_URL;
  if (!enabled) return privateResponse(503, { error: "unavailable" });

  if (action === "challenge" && request.method === "GET") {
    const nonce = Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    return privateResponse(
      200,
      { clientId, nonce },
      `${NONCE_COOKIE}=${nonce}; Path=/; Max-Age=300; Secure; HttpOnly; SameSite=Strict`,
    );
  }
  if (request.method !== "POST" || !actions.has(action)) {
    return privateResponse(405, { error: "method_not_allowed" });
  }
  if (request.headers.get("Origin") !== origin) {
    return privateResponse(403, { error: "forbidden_origin" });
  }
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
    return privateResponse(415, { error: "unsupported_media_type" });
  }
  const data = await readSmallJson(request);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return privateResponse(400, { error: "invalid_body" });
  }

  const headers = { "Content-Type": "application/json" };
  let body;
  if (action === "status") {
    if (typeof data.receipt !== "string" || !hex.test(data.receipt)) {
      return privateResponse(400, { error: "invalid_receipt" });
    }
    body = { receipt: data.receipt };
  } else {
    const nonce = (request.headers.get("Cookie") || "")
      .split(/;\s*/)
      .find((cookie) => cookie.startsWith(NONCE_COOKIE + "="))
      ?.slice(NONCE_COOKIE.length + 1);
    const authorization = request.headers.get("Authorization");
    if (
      !nonce ||
      !hex.test(nonce) ||
      typeof data.nonce !== "string" ||
      nonce !== data.nonce ||
      !authorization?.startsWith("Bearer ")
    ) {
      return privateResponse(401, { error: "reauthenticate" });
    }
    headers.Authorization = authorization;
    body = {
      nonce,
      ...(action === "submit" ? { confirm: data.confirm === true } : {}),
    };
  }

  const upstreamUrl = new URL(
    `/account-deletion/${action}`,
    env.NIARIM_PUBLIC_API_BASE_URL,
  );
  if (upstreamUrl.protocol !== "https:")
    return privateResponse(503, { error: "unavailable" });
  try {
    const result = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(12_000),
    });
    const response = await result.json();
    const cookie =
      action === "submit" && result.status === 202
        ? `${NONCE_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`
        : undefined;
    return privateResponse(result.status, response, cookie);
  } catch {
    return privateResponse(502, { error: "unavailable" });
  }
}
