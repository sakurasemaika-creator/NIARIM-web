import assert from "node:assert/strict";
import test from "node:test";
import { canonicalRedirect } from "../src/canonical-host.js";

const env = { SITE_ORIGIN: "https://niarim.miranima-studio.com" };

test("pages opened on the legacy Workers host move to the canonical domain", () => {
  for (const path of ["/", "/features/?lang=en", "/opals/", "/help/#search"]) {
    const response = canonicalRedirect(
      new Request("https://niarim-web.niarim.workers.dev" + path),
      env,
    );
    assert.equal(response.status, 301);
    const expected = new URL(path, env.SITE_ORIGIN);
    expected.hash = "";
    assert.equal(response.headers.get("Location"), expected.toString());
  }
});

test("API calls, form posts, preview hosts and the canonical domain are not redirected", () => {
  const cases = [
    new Request("https://niarim-web.niarim.workers.dev/api/community"),
    new Request("https://niarim-web.niarim.workers.dev/contact/", {
      method: "POST",
      body: "x",
    }),
    new Request("https://abc123-niarim-web.niarim.workers.dev/"),
    new Request("https://niarim.miranima-studio.com/"),
  ];
  for (const request of cases) {
    assert.equal(canonicalRedirect(request, env), null);
  }
  assert.equal(
    canonicalRedirect(
      new Request("https://niarim-web.niarim.workers.dev/"),
      {},
    ),
    null,
  );
});

test("static pages, robots and sitemap name only the canonical domain", async () => {
  const { readFileSync, readdirSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(html|xml|txt)$/.test(name)) files.push(path);
    }
  };
  walk(new URL("../public", import.meta.url).pathname);
  const offenders = files.filter((path) =>
    readFileSync(path, "utf8").includes("niarim-web.niarim.workers.dev"),
  );
  assert.deepEqual(offenders, []);
  const robots = readFileSync(
    new URL("../public/robots.txt", import.meta.url),
    "utf8",
  );
  assert.match(robots, /Sitemap: https:\/\/niarim\.miranima-studio\.com\//);
});
