import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { handleAccountDeletion } from "../src/account-deletion.js";

const origin = "https://niarim.example.invalid";
const nonce = "a".repeat(64);
const receipt = "b".repeat(64);
const env = {
  SITE_ORIGIN: origin,
  NIARIM_PUBLIC_API_BASE_URL: "https://api.example.invalid/",
  ACCOUNT_DELETION_GOOGLE_CLIENT_ID: "test.apps.googleusercontent.com",
};
const request = (action, data, headers = {}) =>
  new Request(`${origin}/api/account-deletion/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Authorization: "Bearer credential",
      Cookie: "__Host-niarim-deletion=" + nonce,
      ...headers,
    },
    body: JSON.stringify(data),
  });
afterEach(() => mock.restoreAll());

test("challenge only opens on a configured HTTPS origin and sets an expiring nonce cookie", async () => {
  const url = `${origin}/api/account-deletion/challenge`;
  const result = await handleAccountDeletion(
    new Request(url),
    env,
    "challenge",
  );
  const body = await result.json();
  assert.match(body.nonce, /^[a-f0-9]{64}$/);
  assert.equal(body.clientId, env.ACCOUNT_DELETION_GOOGLE_CLIENT_ID);
  const cookie = result.headers.get("Set-Cookie");
  assert.ok(cookie.includes(body.nonce));
  for (const control of [
    "Max-Age=300",
    "Secure",
    "HttpOnly",
    "SameSite=Strict",
  ]) {
    assert.ok(cookie.includes(control));
  }
  assert.equal(result.headers.get("Cache-Control"), "no-store");
  assert.equal(
    (await handleAccountDeletion(new Request(url), {}, "challenge")).status,
    503,
  );
});

test("cross-origin requests and mismatched challenge cookies never reach AWS", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => {
    throw Error("unexpected");
  });
  const cross = await handleAccountDeletion(
    request(
      "submit",
      { nonce, confirm: true },
      {
        Origin: "https://other.example.invalid",
      },
    ),
    env,
    "submit",
  );
  assert.equal(cross.status, 403);
  const mismatch = await handleAccountDeletion(
    request("submit", {
      nonce: receipt,
      confirm: true,
    }),
    env,
    "submit",
  );
  assert.equal(mismatch.status, 401);
  assert.equal(upstream.mock.callCount(), 0);
});

test("the Worker forwards only verified-flow fields and drops the nonce after enqueueing", async () => {
  const upstream = mock.method(globalThis, "fetch", async () =>
    Response.json(
      {
        state: "pending",
        receipt,
      },
      { status: 202 },
    ),
  );
  const response = await handleAccountDeletion(
    request("submit", { nonce, confirm: true, userId: "ignored" }),
    env,
    "submit",
  );
  assert.equal(response.status, 202);
  assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
  const [url, init] = upstream.mock.calls[0].arguments;
  assert.equal(url.href, "https://api.example.invalid/account-deletion/submit");
  assert.equal(init.headers.Authorization, "Bearer credential");
  assert.deepEqual(JSON.parse(init.body), { nonce, confirm: true });
  assert.equal(init.redirect, "error");
});

test("following an opaque receipt does not forward Google identity or a cookie", async () => {
  const upstream = mock.method(globalThis, "fetch", async () =>
    Response.json({ state: "complete" }),
  );
  const response = await handleAccountDeletion(
    request("status", { receipt }),
    env,
    "status",
  );
  assert.deepEqual(await response.json(), { state: "complete" });
  const [, init] = upstream.mock.calls[0].arguments;
  assert.deepEqual(init.headers, { "Content-Type": "application/json" });
  assert.deepEqual(JSON.parse(init.body), { receipt });
});
