// The Worker side of the moderation admin page: the config endpoint that
// hands the page the public OAuth client ID (the same variable as the
// account-deletion page) and the /admin/-only headers.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { adminContentSecurityPolicy, handleAdminConfig } from "../src/admin.js";

// The Worker imports src/generated/seo-i18n.js, which only the generator
// writes (it is not checked in). Write it before loading the Worker: on a
// fresh checkout this file would otherwise pass or fail depending on whether
// another test file had run the generator first.
execFileSync(process.execPath, ["tools/generate-seo-i18n.mjs"], {
  cwd: new URL("..", import.meta.url),
  stdio: "ignore",
});
const { default: worker } = await import("../src/index.js");

// Node has no HTMLRewriter; the page rewriting itself is checked against
// wrangler dev (tests/worker-seo-runtime-audit.mjs). Headers are what this
// file is about.
globalThis.HTMLRewriter ??= class {
  on() {
    return this;
  }
  transform(response) {
    return response;
  }
};

const origin = "https://niarim.example.invalid";
const lambda = "https://abc123.lambda-url.ap-northeast-1.on.aws/";
const env = {
  SITE_ORIGIN: origin,
  NIARIM_PUBLIC_API_BASE_URL: lambda,
  ACCOUNT_DELETION_GOOGLE_CLIENT_ID: "test-client.apps.googleusercontent.com",
  ASSETS: {
    fetch: async (request) =>
      new Response("<!doctype html><title>t</title>", {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-asset-path": new URL(request.url).pathname,
        },
      }),
  },
};

test("the config endpoint returns the public client ID and the API location", async () => {
  const response = handleAdminConfig(
    new Request(`${origin}/api/admin/config`),
    env,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    clientId: env.ACCOUNT_DELETION_GOOGLE_CLIENT_ID,
    apiBaseUrl: lambda,
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("x-robots-tag"), /noindex/);
});

test("without the client ID (or with a non-https API) the page gets a setup answer", async () => {
  const unset = handleAdminConfig(new Request(`${origin}/api/admin/config`), {
    NIARIM_PUBLIC_API_BASE_URL: lambda,
  });
  assert.equal(unset.status, 503);
  assert.deepEqual(await unset.json(), {
    error: "unavailable",
    missing: ["ACCOUNT_DELETION_GOOGLE_CLIENT_ID"],
  });
  const insecure = handleAdminConfig(
    new Request(`${origin}/api/admin/config`),
    {
      ACCOUNT_DELETION_GOOGLE_CLIENT_ID: "not a client id",
      NIARIM_PUBLIC_API_BASE_URL: "http://api.example.invalid/",
    },
  );
  assert.deepEqual((await insecure.json()).missing, [
    "ACCOUNT_DELETION_GOOGLE_CLIENT_ID",
    "NIARIM_PUBLIC_API_BASE_URL",
  ]);
  const post = handleAdminConfig(
    new Request(`${origin}/api/admin/config`, { method: "POST" }),
    env,
  );
  assert.equal(post.status, 405);
});

test("the Worker serves the config route with the site's security headers", async () => {
  const response = await worker.fetch(
    new Request(`${origin}/api/admin/config`),
    env,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(
    (await response.json()).clientId,
    env.ACCOUNT_DELETION_GOOGLE_CLIENT_ID,
  );
});

test("/admin/ gets its own CSP (GIS, the Lambda origin, YouTube thumbnails) and noindex", async () => {
  for (const path of ["/admin/", "/admin/index.html", "/admin"]) {
    const response = await worker.fetch(new Request(origin + path), env);
    const csp = response.headers.get("content-security-policy");
    const directives = Object.fromEntries(
      csp.split(/;\s*/).map((part) => {
        const [name, ...values] = part.split(/\s+/);
        return [name, values];
      }),
    );
    assert.deepEqual(directives["script-src"], [
      "'self'",
      "https://accounts.google.com/gsi/client",
    ]);
    assert.deepEqual(directives["connect-src"], [
      "'self'",
      "https://accounts.google.com/gsi/",
      new URL(lambda).origin,
    ]);
    assert.deepEqual(directives["frame-src"], [
      "https://accounts.google.com/gsi/",
    ]);
    assert.deepEqual(directives["img-src"], [
      "'self'",
      "data:",
      "https://i.ytimg.com",
      "https://img.youtube.com",
    ]);
    assert.ok(
      directives["style-src"].includes("https://accounts.google.com/gsi/style"),
    );
    assert.deepEqual(directives["frame-ancestors"], ["'none'"]);
    assert.deepEqual(directives["object-src"], ["'none'"]);
    assert.equal(
      response.headers.get("x-robots-tag"),
      "noindex, nofollow",
      path,
    );
    assert.equal(
      response.headers.get("cross-origin-opener-policy"),
      "same-origin-allow-popups",
    );
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
  }
});

test("other pages keep the site's CSP unchanged", async () => {
  const source = readFileSync(
    new URL("../src/index.js", import.meta.url),
    "utf8",
  );
  const siteCsp = source
    .match(/const CSP = \[([\s\S]*?)\]\.join/)[1]
    .match(/"([^"]+)"/g)
    .map((value) => value.slice(1, -1))
    .join("; ");
  for (const path of [
    "/",
    "/privacy/",
    "/news/",
    "/404.html",
    "/administrator/",
  ]) {
    const response = await worker.fetch(
      new Request(`${origin}${path}?lang=ja`),
      env,
    );
    assert.equal(response.status, 200, path);
    assert.equal(
      response.headers.get("content-security-policy"),
      siteCsp,
      path,
    );
    assert.equal(response.headers.get("x-robots-tag"), null, path);
    assert.doesNotMatch(
      response.headers.get("content-security-policy"),
      /accounts\.google|lambda-url/,
    );
  }
  assert.doesNotMatch(
    adminContentSecurityPolicy({}),
    /lambda-url|undefined|null/,
  );
});

test("the admin page is in no sitemap, robots list or page list", async () => {
  const sitemap = await worker.fetch(new Request(`${origin}/sitemap.xml`), env);
  assert.doesNotMatch(await sitemap.text(), /\/admin/);
  for (const file of [
    "../public/sitemap.xml",
    "../src/seo.js",
    "../tools/generate-seo-i18n.mjs",
    "../tools/audit-site.js",
    "../tests/i18n-completeness-audit.mjs",
  ])
    assert.doesNotMatch(
      readFileSync(new URL(file, import.meta.url), "utf8"),
      /["/]admin\//,
      file,
    );
  // Nothing on the public site links to it.
  // The entry types come with the listing: a separate stat of each name
  // failed when another test file's generator renamed one of its temporary
  // files in public/js/generated/ between the listing and the stat.
  const { readdirSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = new URL("../public/", import.meta.url).pathname;
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === "admin" ? [] : walk(path);
      return /\.html$/.test(entry.name) ? [path] : [];
    });
  for (const page of walk(root))
    assert.doesNotMatch(readFileSync(page, "utf8"), /href="\/admin\//, page);
});
