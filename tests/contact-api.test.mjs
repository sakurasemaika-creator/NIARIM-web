import { afterEach, test, mock } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "../src/contact.js";

const env = {
  RESEND_API_KEY: "test",
  CONTACT_FROM_EMAIL: "sender@example.invalid",
  CONTACT_TO_EMAIL: "recipient@example.invalid",
};
const ctx = { waitUntil() {} };
afterEach(() => mock.restoreAll());
function formRequest(overrides = {}, extra) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    type: "bug",
    name: "Tester",
    email: "user@example.invalid",
    message: "Test message",
    agree: "true",
    ...overrides,
  }))
    form.set(key, value);
  extra?.(form);
  return new Request("https://example.invalid/api/contact", {
    method: "POST",
    body: form,
  });
}

test("valid multipart sends one escaped email and keeps reply-to separate", async () => {
  const fetch = mock.method(globalThis, "fetch", async () =>
    Response.json({ id: "test" }),
  );
  const response = await handleContact(
    formRequest({ name: "<Tester>", message: "<script>test</script>" }),
    env,
    ctx,
  );
  assert.equal(response.status, 200);
  assert.equal(fetch.mock.callCount(), 1);
  const payload = JSON.parse(fetch.mock.calls[0].arguments[1].body);
  assert.equal(payload.reply_to, "user@example.invalid");
  assert.equal(payload.from, env.CONTACT_FROM_EMAIL);
  assert.ok(payload.html.includes("&lt;script&gt;"));
});

test("oversized actual body is rejected without trusting Content-Length", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => {
    throw new Error("must not send");
  });
  for (const length of [null, "1"]) {
    // Model incoming HTTP bytes; Node's outgoing FormData encoder does not
    // support cancellation while its Blob iterator is still enqueuing.
    let chunk = 0;
    let cancelled = false;
    const stream = new ReadableStream({
      pull(controller) {
        if (chunk++ === 0)
          controller.enqueue(
            new TextEncoder().encode(
              '--boundary\r\nContent-Disposition: form-data; name="unused"\r\n\r\n',
            ),
          );
        else if (chunk < 30)
          controller.enqueue(new Uint8Array(1024 * 1024).fill(97));
        else controller.close();
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request("https://example.invalid/api/contact", {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data; boundary=boundary" },
      body: stream,
      duplex: "half",
    });
    if (length !== null) request.headers.set("Content-Length", length);
    const result = await handleContact(request, env, ctx);
    assert.equal(result.status, 413);
    assert.equal((await result.json()).error, "payload_too_large");
    assert.equal(cancelled, true);
    assert.ok(
      chunk < 30,
      "must stop reading before the entire oversized body arrives",
    );
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("rate-limited requests are rejected before consuming the upload", async () => {
  const request = formRequest();
  const response = await handleContact(
    request,
    { ...env, RATE_LIMIT_KV: { get: async () => "1" } },
    ctx,
  );
  assert.equal(response.status, 429);
  assert.equal(request.bodyUsed, false);
});

test("honeypots and invalid input never send mail", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => {
    throw new Error("must not send");
  });
  assert.equal(
    (await handleContact(formRequest({ company: "spam" }), env, ctx)).status,
    200,
  );
  for (const invalid of [
    { agree: "false" },
    { email: "bad\nemail" },
    { name: "a".repeat(101) },
    { message: "" },
  ]) {
    assert.equal(
      (await handleContact(formRequest(invalid), env, ctx)).status,
      400,
    );
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("attachment type and count limits are enforced", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => {
    throw new Error("must not send");
  });
  for (const [type, count] of [
    ["text/html", 1],
    ["image/png", 4],
  ]) {
    const request = formRequest({}, (form) => {
      for (let i = 0; i < count; i++)
        form.append("attachments", new Blob(["test"], { type }), `file-${i}`);
    });
    assert.equal((await handleContact(request, env, ctx)).status, 400);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("malformed multipart returns a controlled input error", async () => {
  const request = new Request("https://example.invalid/api/contact", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: "broken",
  });
  assert.equal((await handleContact(request, env, ctx)).status, 400);
});
