import { afterEach, test, mock } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "../src/contact.js";

const origin = "https://example.invalid";
const env = {
  CONTACT_RATE_LIMITER: {
    getByName: () => ({
      isLimited: async () => false,
      reserve: async () => true,
    }),
  },
  SITE_ORIGIN: origin,
  RESEND_API_KEY: "test",
  CONTACT_FROM_EMAIL: "sender@example.invalid",
  CONTACT_TO_EMAIL: "recipient@example.invalid",
};
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
    headers: { Origin: origin },
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
      headers: {
        "Content-Type": "multipart/form-data; boundary=boundary",
        Origin: origin,
      },
      body: stream,
      duplex: "half",
    });
    if (length !== null) request.headers.set("Content-Length", length);
    const result = await handleContact(request, env);
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

test("the custom domain can submit its own form without accepting cross-origin posts", async () => {
  const custom = "https://niarim.miranima-studio.com";
  const customEnv = { ...env, CONTACT_SITE_ORIGIN: custom };
  const fetch = mock.method(
    globalThis,
    "fetch",
    async () => new Response("{}"),
  );
  async function submit(source) {
    return handleContact(
      new Request(custom + "/api/contact", {
        method: "POST",
        headers: { Origin: source },
        body: await formRequest().formData(),
      }),
      customEnv,
    );
  }
  assert.equal((await submit(origin)).status, 403);
  assert.equal((await submit(custom)).status, 200);
  assert.equal(fetch.mock.callCount(), 1);
});

test("rate-limited requests are rejected before consuming the upload", async () => {
  const request = formRequest();
  const response = await handleContact(request, {
    ...env,
    CONTACT_RATE_LIMITER: {
      getByName: () => ({ isLimited: async () => true }),
    },
  });
  assert.equal(response.status, 429);
  assert.equal(request.bodyUsed, false);
});

test("honeypots and invalid input never send mail", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => {
    throw new Error("must not send");
  });
  assert.equal(
    (await handleContact(formRequest({ company: "spam" }), env)).status,
    200,
  );
  for (const invalid of [
    { agree: "false" },
    { email: "bad\nemail" },
    { name: "a".repeat(101) },
    { message: "" },
  ]) {
    assert.equal((await handleContact(formRequest(invalid), env)).status, 400);
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
    assert.equal((await handleContact(request, env)).status, 400);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("malformed multipart returns a controlled input error", async () => {
  const request = new Request("https://example.invalid/api/contact", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data", Origin: origin },
    body: "broken",
  });
  assert.equal((await handleContact(request, env)).status, 400);
});

test("origin checks run before parsing or contacting the mail service", async () => {
  const send = mock.method(globalThis, "fetch", async () =>
    Response.json({ id: "test" }),
  );
  for (const [source, fetchSite] of [
    ["https://other.example.invalid", "same-origin"],
    ["null", "same-origin"],
    [null, "same-site"],
    [null, null],
  ]) {
    const request = formRequest();
    if (source === null) request.headers.delete("Origin");
    else request.headers.set("Origin", source);
    if (fetchSite) request.headers.set("Sec-Fetch-Site", fetchSite);
    assert.equal((await handleContact(request, env)).status, 403);
    assert.equal(request.bodyUsed, false);
  }
  const sameOrigin = formRequest();
  sameOrigin.headers.delete("Origin");
  sameOrigin.headers.set("Sec-Fetch-Site", "same-origin");
  assert.equal((await handleContact(sameOrigin, env)).status, 200);
  assert.equal(send.mock.callCount(), 1);
});

test("valid media types use numbered filenames with the verified extension", async () => {
  const send = mock.method(globalThis, "fetch", async () =>
    Response.json({ id: "test" }),
  );
  const examples = [
    [
      "image/png",
      "png",
      new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48,
        0x44, 0x52,
      ]),
    ],
    ["image/jpeg", "jpg", new Uint8Array([0xff, 0xd8, 0xff, 0xe0])],
    ["image/gif", "gif", "GIF89a"],
    ["image/webp", "webp", "RIFF\x00\x00\x00\x00WEBPVP8L"],
    ["video/mp4", "mp4", "\x00\x00\x00\x10ftypmp42\x00\x00\x00\x00"],
    ["video/quicktime", "mov", "\x00\x00\x00\x10ftypqt  \x00\x00\x00\x00"],
    [
      "video/webm",
      "webm",
      new Uint8Array([
        0x1a, 0x45, 0xdf, 0xa3, 0x87, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d,
      ]),
    ],
  ];
  for (const [type, extension, bytes] of examples) {
    const response = await handleContact(
      formRequest({}, (form) => {
        form.append(
          "attachments",
          new Blob([bytes], { type }),
          "元の&添付.data",
        );
      }),
      env,
    );
    assert.equal(response.status, 200, type);
    const payload = JSON.parse(send.mock.calls.at(-1).arguments[1].body);
    assert.equal(payload.attachments[0].filename, `attachment-1.${extension}`);
    assert.match(payload.text, /元の&添付\.data/);
    assert.match(payload.html, /元の&amp;添付\.data/);
  }
});

test("a supported MIME label cannot substitute for matching file contents", async () => {
  const send = mock.method(globalThis, "fetch", async () =>
    Response.json({ id: "test" }),
  );
  const response = await handleContact(
    formRequest({}, (form) => {
      form.append(
        "attachments",
        new Blob(["plain text"], { type: "image/png" }),
        "sample.png",
      );
    }),
    env,
  );
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "validation_error",
    field: "attachments",
  });
  assert.equal(send.mock.callCount(), 0);
});

test("concurrent calls must reserve a slot before they can send mail", async () => {
  const send = mock.method(globalThis, "fetch", async () =>
    Response.json({ id: "test" }),
  );
  const clients = new Set();
  const rateLimited = {
    ...env,
    CONTACT_RATE_LIMITER: {
      getByName: (ip) => ({
        isLimited: async () => false, // All early checks pass in this test.
        async reserve() {
          if (clients.has(ip)) return false;
          clients.add(ip);
          return true;
        },
      }),
    },
  };
  const submit = (ip) => {
    const request = formRequest();
    request.headers.set("CF-Connecting-IP", ip);
    return handleContact(request, rateLimited);
  };
  const replies = await Promise.all(
    Array.from({ length: 10 }, () => submit("192.0.2.5")),
  );
  assert.equal(replies.filter((reply) => reply.status === 200).length, 1);
  assert.equal(replies.filter((reply) => reply.status === 429).length, 9);
  assert.equal((await submit("192.0.2.6")).status, 200);
  assert.equal(send.mock.callCount(), 2);
});
