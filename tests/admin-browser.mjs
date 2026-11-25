// Browser walk-through of the moderation admin page (/admin/).
//
// Google Identity Services and the moderation API are replaced by route
// interception: GIS is a stand-in script that hands the page fake ID tokens,
// and the API is a small in-memory backend with the shapes of
// backend/src/api/routes/admin.ts. The walk signs in, changes the AI triage
// mode, makes, copies, remakes and revokes the triage key of the scheduled
// Claude Code session, pages through the queue, copies the request for a
// Claude chat and takes the pasted answer back in, hides, dismisses, reviews
// (through a REPORT_CHANGED conflict), suspends and unsuspends, re-shows a
// work, opens the detail view, survives an expired sign-in and signs out.
// Report text carrying <script> and <img onerror> must stay text.
//
//   node tests/admin-browser.mjs                       # serves public/ itself
//   ADMIN_BASE_URL=http://127.0.0.1:8790 node tests/admin-browser.mjs
//                                                      # through wrangler dev:
//                                                      # also checks the CSP
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";
import { chromium, devices } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const core = createRequire(import.meta.url)("../public/js/admin-core.js");

const publicDir = normalize(new URL("../public/", import.meta.url).pathname);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

function startStaticServer() {
  const server = createServer(async (request, response) => {
    let path = decodeURIComponent(new URL(request.url, "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(publicDir, path));
    if (!file.startsWith(publicDir)) return response.writeHead(403).end();
    try {
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": TYPES[extname(file)] || "application/octet-stream",
      });
      response.end(body);
    } catch {
      response
        .writeHead(404, { "content-type": "text/plain" })
        .end("not found");
    }
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server)),
  );
}

const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const fakeToken = (n) =>
  `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ exp: Math.floor(Date.now() / 1000) + 3600, n })}.sig${n}`;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const SETTINGS = {
  reportHideThreshold: 3,
  strikeSuspendThreshold: 3,
  aiMode: "backlog",
  aiModeSource: "default",
  aiBacklogThreshold: 20,
  aiDailyCap: 50,
  mailDailyCap: 30,
};
const AUTHOR = "N" + "a".repeat(32);
const TARGET = "N" + "b".repeat(32);
const W1 = "AAAAAAAAAA1";
const W2 = "BBBBBBBBBB2";

/** A tiny in-memory stand-in for backend/src/api/routes/admin.ts. */
function makeBackend(tokens) {
  const now = Date.now();
  const ago = (ms) => new Date(now - ms).toISOString();
  const settings = { ...SETTINGS };
  const users = {
    [AUTHOR]: {
      userId: AUTHOR,
      available: true,
      displayName: '<img src=x onerror="window.__xss=3">作者A',
      avatarUrl: "",
      youtubeChannelId: "UCxxxx",
      strikeCount: 1,
      lastStrikeAt: ago(40 * 86400000),
      postingSuspended: false,
      postingSuspendedAt: null,
      postingSuspendedReason: null,
      postingSuspendedBy: null,
    },
    [TARGET]: {
      userId: TARGET,
      available: true,
      displayName: "アカウントC",
      avatarUrl: "",
      youtubeChannelId: null,
      strikeCount: 2,
      lastStrikeAt: null,
      postingSuspended: false,
      postingSuspendedAt: null,
      postingSuspendedReason: null,
      postingSuspendedBy: null,
    },
  };
  const baseWork = (workId, extra) => ({
    workId,
    available: true,
    deleted: false,
    title: "",
    description: "",
    tags: [],
    youtubeVideoId: workId,
    youtubeUrl: `https://www.youtube.com/watch?v=${workId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${workId}/hqdefault.jpg`,
    authorId: AUTHOR,
    channelName: "作者A",
    postedAt: ago(60 * 86400000),
    isNiarimPublished: true,
    youtubePrivacyStatus: "public",
    moderationHidden: false,
    autoHidden: false,
    autoHiddenReason: null,
    autoHiddenAt: null,
    hiddenAt: null,
    hiddenBy: null,
    strikeRecorded: false,
    ...extra,
  });
  const works = {
    [W1]: baseWork(W1, {
      title: "<script>window.__xss=1</script>題1",
      description: '説明<img src=x onerror="window.__xss=2">',
      tags: ["<b>tag</b>", "アニメ"],
      moderationHidden: true,
      autoHidden: true,
      autoHiddenReason: "reporters",
      autoHiddenAt: ago(86400000),
    }),
    [W2]: baseWork(W2, {
      title: "作品2",
      thumbnailUrl: "https://evil.example/pixel.png",
      youtubeUrl: "javascript:alert(1)",
    }),
  };
  const report = (reportId, createdAt, extra) => ({
    reportId,
    status: "pending",
    createdAt,
    reason: "",
    reporterId: "N" + "c".repeat(32),
    decision: null,
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null,
    aiTriage: null,
    targetType: "work",
    workId: null,
    targetUserId: null,
    ...extra,
  });
  const reports = [
    report("rep1AAAA", ago(13 * 86400000), {
      workId: W1,
      reason:
        '<script>window.__xss=4</script><img src=x onerror="window.__xss=5">理由1',
      aiTriage: {
        status: "ok",
        severity: "critical",
        category: "privacy",
        recommendedAction: "hide",
        rationale: "<b>個人情報</b>が見えています",
        model: "claude-opus-5-5",
        triagedAt: ago(13 * 86400000 - 60000),
      },
    }),
    report("rep3CCCC", ago(2 * 3600000), {
      targetType: "account",
      targetUserId: TARGET,
      reason: "アカウントへの通報",
    }),
    report("rep2BBBB", ago(3600000), {
      workId: W2,
      reason: "理由2",
      aiTriage: {
        status: "refused",
        refusalCategory: "cyber",
        triagedAt: ago(3500000),
      },
    }),
    report("rep4DDDD", ago(1800000), {
      workId: W1,
      reason: "同じ作品への2件目",
    }),
  ];
  const keyOf = (r) =>
    r.workId ? "work:" + r.workId : "user:" + r.targetUserId;
  const authorOf = (r) =>
    r.workId ? works[r.workId].authorId : r.targetUserId;
  const view = (r) => {
    const same = reports.filter((o) => keyOf(o) === keyOf(r));
    const open = same.filter((o) => o.status !== "resolved");
    return {
      ...r,
      reporterCount: open.length,
      openReportCount: open.length,
      totalReportCount: same.length,
      work: r.workId ? { ...works[r.workId] } : null,
      author: { ...users[authorOf(r)] },
    };
  };
  const summary = (r) => {
    const { targetType, workId, targetUserId, ...rest } = r;
    return rest;
  };
  const resolveTarget = (key, decision, note) => {
    let count = 0;
    for (const r of reports)
      if (keyOf(r) === key && r.status !== "resolved") {
        Object.assign(r, {
          status: "resolved",
          decision,
          reviewedAt: new Date().toISOString(),
          reviewedBy: "test-moderator",
          reviewNote: note ?? null,
        });
        count++;
      }
    return count;
  };

  const state = {
    settings,
    users,
    works,
    reports,
    triageToken: null,
    triageTokens: 0,
    log: [],
    revoked: new Set(),
    conflictOnce: new Set(["rep3CCCC:review"]),
    expireNext: false,
  };

  function handle(method, path, query, body, authorization) {
    const token = authorization?.replace(/^Bearer /, "");
    if (state.expireNext && token) {
      state.expireNext = false;
      state.revoked.add(token);
    }
    if (!token || !tokens.includes(token) || state.revoked.has(token))
      return [
        401,
        { error: "IDトークンの検証に失敗しました", code: "UNAUTHORIZED" },
      ];
    let match;
    if (method === "GET" && path === "/admin/me")
      return [200, { email: "test-moderator", settings }];
    if (method === "POST" && path === "/admin/settings") {
      if (!["off", "always", "backlog"].includes(body.aiMode))
        return [400, { error: "x", code: "INVALID_AI_MODE" }];
      Object.assign(settings, { aiMode: body.aiMode, aiModeSource: "admin" });
      return [200, { ok: true, settings }];
    }
    // The triage endpoints (a backend without them has no settings.triageBot:
    // the first /admin/me here has none, as an older backend would answer).
    if (method === "POST" && path === "/admin/triage/token") {
      const token = `nt_test_${++state.triageTokens}_${"k".repeat(40)}`;
      const createdAt = new Date().toISOString();
      settings.triageBot = {
        configured: true,
        createdAt,
        createdBy: "test-moderator",
        lastUsedAt: null,
      };
      state.triageToken = token;
      return [200, { token, createdAt, settings }];
    }
    if (method === "POST" && path === "/admin/triage/token/revoke") {
      settings.triageBot = {
        configured: false,
        createdAt: null,
        createdBy: null,
        lastUsedAt: null,
      };
      state.triageToken = null;
      return [200, { ok: true, settings }];
    }
    if (method === "GET" && path === "/admin/triage/prompt") {
      const waiting = reports
        .filter((r) => r.status === "pending" && r.aiTriage?.status !== "ok")
        .slice(0, Number(query.get("limit")));
      return [
        200,
        {
          prompt: waiting.length
            ? [
                "次の通報を見立てて、```json の配列で答えてください。",
                ...waiting.map((r) => `- ${r.reportId}：${r.reason}`),
              ].join("\n")
            : "",
          reportCount: waiting.length,
          reportIds: waiting.map((r) => r.reportId),
        },
      ];
    }
    if (method === "POST" && path === "/admin/triage/results") {
      if (!Array.isArray(body.results) || !body.results.length)
        return [400, { error: "x", code: "INVALID_TRIAGE" }];
      const results = body.results.map((item) => {
        const r = reports.find((o) => o.reportId === item.reportId);
        const fail = (code) => ({ reportId: item.reportId, ok: false, code });
        if (!r) return fail("NOT_FOUND");
        if (r.status === "resolved") return fail("REPORT_RESOLVED");
        if (r.aiTriage?.status === "ok") return fail("ALREADY_TRIAGED");
        const { reportId, ...judgment } = item;
        const triagedAt = new Date().toISOString();
        r.aiTriage = { status: "ok", source: "chat", ...judgment, triagedAt };
        const work = r.workId && works[r.workId];
        const autoHidden =
          item.severity === "critical" &&
          Boolean(work) &&
          !work.moderationHidden;
        if (autoHidden)
          Object.assign(work, {
            moderationHidden: true,
            autoHidden: true,
            autoHiddenReason: "ai",
            autoHiddenAt: triagedAt,
          });
        return { reportId, ok: true, autoHidden };
      });
      return [200, { results }];
    }
    if (method === "GET" && path === "/admin/reports") {
      const status = query.get("status");
      const order = query.get("order");
      const list = reports
        .filter((r) => r.status === status)
        .sort(
          (a, b) =>
            (order === "newest" ? -1 : 1) *
            a.createdAt.localeCompare(b.createdAt),
        );
      const page =
        query.get("cursor") === "page2" ? list.slice(3) : list.slice(0, 3);
      const nextCursor =
        !query.get("cursor") && list.length > 3 ? "page2" : null;
      return [200, { status, order, reports: page.map(view), nextCursor }];
    }
    if ((match = path.match(/^\/admin\/reports\/([\w-]+)(?:\/(\w+))?$/))) {
      const r = reports.find((o) => o.reportId === match[1]);
      if (!r)
        return [404, { error: "通報が見つかりません", code: "NOT_FOUND" }];
      const action = match[2];
      if (method === "GET" && !action)
        return [
          200,
          {
            report: view(r),
            relatedReports: reports
              .filter((o) => keyOf(o) === keyOf(r))
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map(summary),
          },
        ];
      if (state.conflictOnce.delete(`${r.reportId}:${action}`))
        return [
          409,
          { error: "通報の状態が変わりました", code: "REPORT_CHANGED" },
        ];
      if (r.status === "resolved")
        return [409, { error: "対応済み", code: "REPORT_RESOLVED" }];
      if (action === "review") {
        Object.assign(r, { status: "reviewing", reviewedBy: "test-moderator" });
        return [200, { ok: true, report: view(r) }];
      }
      if (action === "dismiss") {
        const work = r.workId && works[r.workId];
        const unhidden = Boolean(work?.autoHidden);
        if (unhidden)
          Object.assign(work, { moderationHidden: false, autoHidden: false });
        const resolved = resolveTarget(keyOf(r), "dismiss", body.note);
        return [200, { ok: true, resolved, unhidden, report: view(r) }];
      }
      if (action === "hide") {
        const workId = r.workId || body.workId;
        if (!workId) return [409, { error: "x", code: "WORK_ID_REQUIRED" }];
        const work = works[workId];
        const user = users[work.authorId];
        const strikeAdded = !work.strikeRecorded;
        Object.assign(work, {
          moderationHidden: true,
          autoHidden: false,
          autoHiddenReason: null,
          hiddenAt: new Date().toISOString(),
          hiddenBy: "test-moderator",
          strikeRecorded: true,
        });
        if (strikeAdded) user.strikeCount++;
        const resolved = resolveTarget(keyOf(r), "hide", body.note);
        return [
          200,
          {
            ok: true,
            workId,
            resolved,
            strikeAdded,
            strikeCount: user.strikeCount,
            postingSuspended: user.postingSuspended,
            suspendedNow: false,
            report: view(r),
          },
        ];
      }
    }
    if (
      method === "POST" &&
      (match = path.match(/^\/admin\/works\/([\w-]{11})\/unhide$/))
    ) {
      const work = works[match[1]];
      const user = users[work.authorId];
      const strikeRemoved = work.strikeRecorded && body.keepStrike === false;
      if (strikeRemoved) user.strikeCount--;
      Object.assign(work, {
        moderationHidden: false,
        hiddenAt: null,
        hiddenBy: null,
        strikeRecorded: work.strikeRecorded && !strikeRemoved,
      });
      const resolved = resolveTarget(
        "work:" + work.workId,
        "unhide",
        body.note,
      );
      return [
        200,
        {
          ok: true,
          unhidden: true,
          strikeRemoved,
          strikeCount: strikeRemoved ? user.strikeCount : undefined,
          suspensionLifted: false,
          resolved,
          work: { ...work },
        },
      ];
    }
    if ((match = path.match(/^\/admin\/users\/(N[0-9a-f]{32})(?:\/(\w+))?$/))) {
      const user = users[match[1]];
      if (!user) return [404, { error: "x", code: "NOT_FOUND" }];
      if (method === "GET" && !match[2]) return [200, { user: { ...user } }];
      if (match[2] === "suspend") {
        if (typeof body.reason !== "string" || !body.reason.trim())
          return [400, { error: "x", code: "INVALID_REASON" }];
        Object.assign(user, {
          postingSuspended: true,
          postingSuspendedAt: new Date().toISOString(),
          postingSuspendedReason: body.reason,
          postingSuspendedBy: "test-moderator",
        });
        return [200, { ok: true, user: { ...user } }];
      }
      if (match[2] === "unsuspend") {
        Object.assign(user, {
          postingSuspended: false,
          postingSuspendedAt: null,
          postingSuspendedReason: null,
          postingSuspendedBy: null,
          strikeCount: body.resetStrikes === true ? 0 : user.strikeCount,
        });
        return [200, { ok: true, user: { ...user } }];
      }
    }
    return [404, { error: `該当するルートがありません: ${method} ${path}` }];
  }

  state.route = async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const origin = request.headers().origin;
    const cors = {
      "access-control-allow-origin": origin || "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "authorization, content-type",
      vary: "origin",
    };
    if (request.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: cors, body: "" });
    const body = request.postData() ? JSON.parse(request.postData()) : {};
    const [status, json] = handle(
      request.method(),
      url.pathname,
      url.searchParams,
      body,
      request.headers().authorization,
    );
    state.log.push({
      method: request.method(),
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      body,
      status,
      authorization: request.headers().authorization,
    });
    return route.fulfill({
      status,
      headers: { ...cors, "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(json),
    });
  };
  return state;
}

function gisScript(tokens) {
  return `(() => {
    const tokens = ${JSON.stringify(tokens)};
    let next = 0;
    window.__gisInit = null;
    window.google = { accounts: { id: {
      initialize(options) { window.__gisInit = { client_id: options.client_id, auto_select: options.auto_select }; this.callback = options.callback; },
      renderButton(mount) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "テスト用のGoogleログイン";
        button.addEventListener("click", () => this.callback({ credential: tokens[Math.min(next++, tokens.length - 1)] }));
        mount.append(button);
      },
      disableAutoSelect() { window.__gisSignedOut = true; },
    } } };
  })();`;
}

const external = process.env.ADMIN_BASE_URL?.replace(/\/$/, "");
const server = external ? null : await startStaticServer();
const base = external || `http://127.0.0.1:${server.address().port}`;
let config = {
  clientId: "test-client.apps.googleusercontent.com",
  apiBaseUrl: "https://api.example.invalid/",
};
if (external) {
  const response = await fetch(`${base}/api/admin/config`);
  assert.equal(
    response.status,
    200,
    "wrangler dev must serve /api/admin/config",
  );
  config = await response.json();
  const page = await fetch(`${base}/admin/`);
  const csp = page.headers.get("content-security-policy");
  assert.ok(
    csp.includes(new URL(config.apiBaseUrl).origin),
    "CSP allows the API origin",
  );
  assert.ok(csp.includes("https://accounts.google.com/gsi/client"));
  assert.match(page.headers.get("x-robots-tag"), /noindex/);
}
const apiOrigin = new URL(config.apiBaseUrl).origin;

const browser = await chromium.launch(launchOptions());
let cases = 0;

async function newPage(context, { configResponse } = {}) {
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (error) => problems.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      /Content Security Policy/i.test(message.text())
    )
      problems.push("console: " + message.text());
  });
  const outside = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/evil\.example|^javascript:/.test(url)) outside.push(url);
  });
  if (configResponse || !external)
    await page.route(`${base}/api/admin/config`, (route) =>
      route.fulfill(configResponse || { status: 200, json: config }),
    );
  await page.route("https://i.ytimg.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
  );
  return { page, problems, outside };
}

// The Clipboard API stand-in: what the page copies, and a switch to make the
// browser refuse (the page then shows the text selected to copy by hand).
function clipboardStub() {
  window.__copied = [];
  window.__clipboardFails = false;
  const clipboard = {
    async writeText(value) {
      if (window.__clipboardFails)
        throw new DOMException("Write permission denied.", "NotAllowedError");
      window.__copied.push(String(value));
    },
  };
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    get: () => clipboard,
  });
}

const verdict = (reportId, extra) => ({
  reportId,
  severity: "low",
  category: "none",
  recommendedAction: "keep",
  rationale: "規約に反する所は見当たりません",
  ...extra,
});

const card = (page, id) =>
  page.locator(`#admin-queue > .admin-card[data-report-id="${id}"]`);
const confirmDialog = (page) => page.locator("#admin-confirm");

async function confirm(page, { fill, check } = {}) {
  const dialog = confirmDialog(page);
  await dialog.waitFor({ state: "visible" });
  if (fill)
    for (const [label, value] of Object.entries(fill))
      await dialog.getByLabel(label).fill(value);
  if (check) for (const label of check) await dialog.getByLabel(label).check();
  await dialog.locator("#admin-confirm-submit").click();
}

async function waitNotice(page, pattern) {
  await page.waitForFunction(
    (source) =>
      new RegExp(source).test(
        document.getElementById("admin-notice")?.textContent || "",
      ),
    pattern.source,
  );
}

// ADMIN_SHOTS=artifacts/admin keeps screenshots of the main states.
const shotsDir = process.env.ADMIN_SHOTS;
async function shot(page, name, fullPage = true) {
  if (!shotsDir) return;
  await mkdir(shotsDir, { recursive: true });
  await page.screenshot({
    path: join(shotsDir, name + ".png"),
    fullPage,
  });
}

async function noHorizontalScroll(page, label) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  assert.ok(overflow <= 0, `${label}: horizontal scroll of ${overflow}px`);
}

try {
  // ---- Not configured: a clear setup message, no Google request --------------------
  {
    const context = await browser.newContext();
    const { page, problems } = await newPage(context, {
      configResponse: {
        status: 503,
        json: {
          error: "unavailable",
          missing: ["ACCOUNT_DELETION_GOOGLE_CLIENT_ID"],
        },
      },
    });
    const google = [];
    page.on("request", (request) => {
      if (request.url().includes("accounts.google.com"))
        google.push(request.url());
    });
    await page.goto(`${base}/admin/`);
    await page.locator("#admin-setup").waitFor({ state: "visible" });
    assert.match(
      await page.locator("#admin-setup").textContent(),
      /管理ページの設定がまだ済んでいません/,
    );
    assert.match(
      await page.locator("#admin-setup-detail").textContent(),
      /ACCOUNT_DELETION_GOOGLE_CLIENT_ID/,
    );
    assert.equal(await page.locator("#admin-sign-in").isVisible(), false);
    assert.deepEqual(google, []);
    assert.deepEqual(
      problems.filter((p) => !/503/.test(p)),
      [],
    );
    await context.close();
    cases++;
  }

  for (const [label, viewport] of [
    ["phone", devices["Pixel 7"]],
    ["desktop", { viewport: { width: 1440, height: 1000 } }],
  ]) {
    const tokens = [fakeToken(1), fakeToken(2), fakeToken(3)];
    const backend = makeBackend(tokens);
    const context = await browser.newContext({ ...viewport });
    await context.addInitScript(clipboardStub);
    const { page, problems, outside } = await newPage(context);
    await page.route("https://accounts.google.com/gsi/client", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: gisScript(tokens),
      }),
    );
    await page.route(`${apiOrigin}/**`, backend.route);

    try {
      await page.goto(`${base}/admin/`);
      assert.equal(
        await page.locator('meta[name="robots"]').getAttribute("content"),
        "noindex, nofollow",
      );
      assert.equal(await page.locator("html").getAttribute("lang"), "ja");

      // ---- Sign in -------------------------------------------------------------------
      await page
        .getByRole("button", { name: "テスト用のGoogleログイン" })
        .click();
      await page
        .locator("#admin-email")
        .filter({ hasText: "test-moderator" })
        .waitFor();
      assert.deepEqual(await page.evaluate(() => window.__gisInit), {
        client_id: config.clientId,
        auto_select: false,
      });
      assert.equal(await page.locator("#admin-sign-in").isVisible(), false);
      assert.ok(
        backend.log.every(
          (entry) => entry.authorization === `Bearer ${tokens[0]}`,
        ),
      );
      const stored = await page.evaluate(() => [
        localStorage.length,
        sessionStorage.length,
        document.cookie,
      ]);
      assert.deepEqual(
        stored,
        [0, 0, ""],
        "the ID token is kept in memory only",
      );

      // ---- AI triage setting ---------------------------------------------------------------
      const current = page.locator("#admin-ai-current");
      assert.match(
        await current.textContent(),
        /通報が多いときだけ（20件以上）（サーバーの既定（デプロイの設定））/,
      );
      for (const option of [
        "AIの判定：オフ",
        "常に判定する",
        "通報が多いときだけ（20件以上）",
      ])
        await page.getByLabel(option).waitFor();
      assert.match(
        await page.locator("#admin-ai-note").textContent(),
        /\$0\.01〜0\.02.*1日50件まで/,
      );
      assert.equal(await page.locator("#admin-ai-save").isDisabled(), true);
      await page.getByLabel("AIの判定：オフ").check();
      await page.locator("#admin-ai-save").click();
      assert.match(
        await confirmDialog(page).textContent(),
        /「通報が多いときだけ（20件以上）」から「AIの判定：オフ」に変えます/,
      );
      await confirm(page);
      await waitNotice(page, /AIの判定の設定を「AIの判定：オフ」にしました/);
      assert.match(
        await current.textContent(),
        /AIの判定：オフ（この管理ページで選んだ設定）/,
      );
      assert.deepEqual(
        backend.log
          .filter((e) => e.path === "/admin/settings")
          .map((e) => e.body),
        [{ aiMode: "off" }],
      );

      // ---- The triage key of the scheduled Claude Code session --------------------------------
      const botStatus = page.locator("#admin-bot-status");
      const keyBox = page.locator("#admin-bot-token");
      const keyField = page.getByLabel("新しい下見の鍵");
      assert.equal(
        await botStatus.textContent(),
        "状態：未設定",
        "no settings.triageBot (an older backend) reads as not set",
      );
      assert.equal(await page.locator("#admin-bot-revoke").isVisible(), false);
      assert.equal(await keyBox.isVisible(), false);
      await page.getByRole("button", { name: "鍵を作る" }).click();
      await keyField.waitFor();
      const firstKey = await keyField.inputValue();
      assert.equal(firstKey, backend.triageToken);
      assert.equal(await keyField.getAttribute("readonly"), "");
      assert.equal(
        await page.evaluate(() => document.activeElement?.id),
        "admin-bot-token-value",
        "the new key is focused, ready to copy",
      );
      assert.equal(
        await page.locator("#admin-bot-host").textContent(),
        new URL(config.apiBaseUrl).host,
      );
      assert.match(
        await keyBox.textContent(),
        /この鍵はこの画面を閉じると二度と表示されません。Claude\s+Codeの環境の『ネットワークの秘密』に保存してください。チャットには貼らないでください。/,
      );
      assert.equal(await botStatus.textContent(), "状態：設定済み");
      assert.match(
        await page.locator("#admin-bot-details").textContent(),
        /作った日時：\d{4}\/\d\d\/\d\d（.）\d\d:\d\d（test-moderator）まだ使われていません/,
      );
      await page.getByRole("button", { name: "下見の鍵をコピー" }).click();
      await page
        .locator("#admin-bot-copy-status")
        .filter({ hasText: "コピーしました" })
        .waitFor();
      assert.equal(await page.evaluate(() => window.__copied.at(-1)), firstKey);
      assert.deepEqual(
        await page.evaluate(() => [
          localStorage.length,
          sessionStorage.length,
          document.cookie,
        ]),
        [0, 0, ""],
        "the key is not kept in the browser",
      );
      await noHorizontalScroll(page, label + " key");
      await shot(page, `${label}-triage-key`);

      // Making it again asks first: the key before stops working.
      await page.getByRole("button", { name: "鍵を作り直す" }).click();
      assert.match(
        await confirmDialog(page).textContent(),
        /今の鍵は使えなくなります/,
      );
      await confirm(page);
      await waitNotice(page, /下見の鍵を作り直しました/);
      const secondKey = await keyField.inputValue();
      assert.notEqual(secondKey, firstKey);
      assert.equal(secondKey, backend.triageToken);

      // The key is shown once: reading the page again takes it away.
      backend.settings.triageBot.lastUsedAt = new Date().toISOString();
      await page.locator("#admin-reload").click();
      await keyBox.waitFor({ state: "hidden" });
      assert.equal(await keyField.inputValue(), "");
      await page
        .locator("#admin-bot-details")
        .filter({ hasText: "最後に使われた日時" })
        .waitFor();

      await page.getByRole("button", { name: "鍵を無効にする" }).click();
      assert.match(
        await confirmDialog(page).textContent(),
        /自動の下見は止まります/,
      );
      await confirm(page);
      await waitNotice(page, /下見の鍵を無効にしました/);
      assert.equal(await botStatus.textContent(), "状態：未設定");
      await page.getByRole("button", { name: "鍵を作る" }).waitFor();
      assert.equal(await page.locator("#admin-bot-revoke").isVisible(), false);
      assert.deepEqual(
        backend.log
          .filter((e) => e.path.startsWith("/admin/triage/token"))
          .map((e) => [e.method, e.path, e.body]),
        [
          ["POST", "/admin/triage/token", {}],
          ["POST", "/admin/triage/token", {}],
          ["POST", "/admin/triage/token/revoke", {}],
        ],
      );

      // ---- Queue, oldest first, with the waiting days ---------------------------------------
      await card(page, "rep2BBBB").waitFor();
      assert.deepEqual(
        await page
          .locator("#admin-queue > .admin-card")
          .evaluateAll((cards) => cards.map((c) => c.dataset.reportId)),
        ["rep1AAAA", "rep3CCCC", "rep2BBBB"],
      );
      const listQuery = backend.log.find(
        (e) => e.path === "/admin/reports",
      ).query;
      assert.deepEqual(listQuery, {
        status: "pending",
        order: "oldest",
        limit: "20",
      });
      assert.notEqual(
        await card(page, "rep1AAAA").getAttribute("data-waiting"),
        "ok",
        "13 days is at least 9 business days",
      );
      assert.match(
        await card(page, "rep1AAAA").textContent(),
        /受付から(9|10)営業日/,
      );
      assert.match(
        await card(page, "rep1AAAA").textContent(),
        /期限が近い|期限超過/,
      );
      assert.equal(
        await card(page, "rep2BBBB").getAttribute("data-waiting"),
        "ok",
      );
      const recent = backend.reports.find(
        (r) => r.reportId === "rep2BBBB",
      ).createdAt;
      assert.ok(
        (await card(page, "rep2BBBB").textContent()).includes(
          core.waitingInfo(recent).summary,
        ),
      );

      // Injected markup is shown as text and never runs.
      const injected = await page.evaluate(() => ({
        xss: window.__xss,
        scripts: document.querySelectorAll("#admin-queue script").length,
        images: document.querySelectorAll(
          '#admin-queue img[src="x"], #admin-queue [onerror]',
        ).length,
        bold: document.querySelectorAll("#admin-queue b").length,
      }));
      assert.deepEqual(injected, {
        xss: undefined,
        scripts: 0,
        images: 0,
        bold: 0,
      });
      const first = card(page, "rep1AAAA");
      assert.equal(
        await first.locator(".admin-reason").textContent(),
        '<script>window.__xss=4</script><img src=x onerror="window.__xss=5">理由1',
      );
      assert.equal(
        await first.locator(".admin-work-title").textContent(),
        "<script>window.__xss=1</script>題1",
      );
      assert.match(
        await first.locator(".admin-author-name").textContent(),
        /^<img src=x onerror="window\.__xss=3">作者A$/,
      );
      assert.match(
        await first.locator(".admin-tags").textContent(),
        /<b>tag<\/b>/,
      );
      assert.match(
        await first.textContent(),
        /重大度：重大・分類：個人情報・推奨：非表示をすすめる/,
      );
      assert.match(await first.textContent(), /<b>個人情報<\/b>が見えています/);
      assert.match(
        await first.textContent(),
        /自動で一時非表示（通報した人が3人に達したため）/,
      );
      assert.match(await first.textContent(), /違反：1回 \/ 3回/);
      assert.equal(
        await first.locator("img.admin-thumb").getAttribute("src"),
        `https://i.ytimg.com/vi/${W1}/hqdefault.jpg`,
      );
      const second = card(page, "rep2BBBB");
      assert.match(
        await second.textContent(),
        /AIが判定できませんでした（人の確認が必要）/,
      );
      assert.equal(
        await second.locator("img.admin-thumb").getAttribute("src"),
        `https://i.ytimg.com/vi/${W2}/hqdefault.jpg`,
      );
      const link = second.locator("a.admin-link");
      assert.equal(
        await link.getAttribute("href"),
        `https://www.youtube.com/watch?v=${W2}`,
      );
      assert.equal(await link.getAttribute("target"), "_blank");
      assert.match(await link.getAttribute("rel"), /noopener/);
      assert.match(
        await card(page, "rep3CCCC").textContent(),
        /アカウントへの通報[\s\S]*AI判定なし/,
      );
      await noHorizontalScroll(page, label);
      await shot(page, `${label}-queue`);

      // ---- More --------------------------------------------------------------------------
      await page.locator("#admin-more").click();
      await card(page, "rep4DDDD").waitFor();
      assert.equal(
        backend.log.filter((e) => e.path === "/admin/reports").at(-1).query
          .cursor,
        "page2",
      );
      await page.locator("#admin-more").waitFor({ state: "hidden" });

      // ---- Ask a Claude chat now: copy the request, paste the answer back -----------------------
      const copyPrompt = page.getByRole("button", {
        name: "AIに頼む文をコピー",
      });
      const promptStatus = page.locator("#admin-prompt-status");
      const promptBox = page.locator("#admin-prompt-box");
      await copyPrompt.click();
      await promptStatus
        .filter({
          hasText:
            "3件の通報の文をコピーしました。Claudeのチャットに貼ってください。",
        })
        .waitFor();
      assert.deepEqual(
        backend.log.filter((e) => e.path === "/admin/triage/prompt").at(-1)
          .query,
        { limit: "20" },
      );
      const copiedPrompt = await page.evaluate(() => window.__copied.at(-1));
      assert.match(copiedPrompt, /rep3CCCC[\s\S]*rep2BBBB[\s\S]*rep4DDDD/);
      assert.equal(
        await page.locator("#admin-prompt-text").inputValue(),
        copiedPrompt,
      );
      assert.equal(await promptBox.isVisible(), true);
      assert.equal(await promptBox.getAttribute("open"), null, "collapsed");
      // When the browser refuses the clipboard, the request is shown selected.
      await page.evaluate(() => (window.__clipboardFails = true));
      await copyPrompt.click();
      await promptStatus
        .filter({ hasText: "自動でコピーできなかった" })
        .waitFor();
      assert.equal(await promptBox.getAttribute("open"), "");
      assert.deepEqual(
        await page.evaluate(() => {
          const field = document.activeElement;
          return [
            field.id,
            field.selectionStart,
            field.selectionEnd === field.value.length,
          ];
        }),
        ["admin-prompt-text", 0, true],
      );
      await page.evaluate(() => (window.__clipboardFails = false));

      const answer = page.getByLabel("Claudeの答えを貼る");
      const importButton = page.getByRole("button", {
        name: "見立てを取り込む",
      });
      const result = page.locator("#admin-answer-result");
      const criticalOne = verdict("rep2BBBB", {
        severity: "critical",
        category: "privacy",
        recommendedAction: "hide",
        rationale: "<b>住所</b>が読めます",
      });
      await answer.fill(
        [
          "3件を確認しました。",
          "```json",
          JSON.stringify(
            [
              verdict("rep3CCCC"),
              criticalOne,
              verdict("rep1AAAA"),
              verdict("rep9ZZZZ"),
              verdict("rep4DDDD", { severity: "severe" }),
            ],
            null,
            2,
          ),
          "```",
          "判断は運営の方でお願いします。",
        ].join("\n"),
      );
      await importButton.click();
      await result.filter({ hasText: "取り込んだ見立て：2件" }).waitFor();
      assert.deepEqual(
        backend.log
          .filter((e) => e.path === "/admin/triage/results")
          .map((e) => e.body),
        [
          {
            results: [
              verdict("rep3CCCC"),
              criticalOne,
              verdict("rep1AAAA"),
              verdict("rep9ZZZZ"),
            ],
          },
        ],
        "only the judgments that passed the check are sent",
      );
      const resultText = await result.textContent();
      assert.match(
        resultText,
        /取り込んだ見立て：2件（「重大」で作品を一時非表示にしたもの：1件）/,
      );
      assert.match(resultText, /取り込めなかった見立て：2件/);
      assert.match(resultText, /rep1AAAA：すでに見立てがある/);
      assert.match(resultText, /rep9ZZZZ：通報が見つからない/);
      assert.match(
        resultText,
        /送る前に外したもの：5件目（rep4DDDD）：重大度（severity）「severe」は使えません/,
      );
      assert.notEqual(
        await answer.inputValue(),
        "",
        "the answer stays when part of it was not taken in",
      );
      // The queue is read again with the new judgments.
      await card(page, "rep3CCCC")
        .filter({ hasText: "判定：AI（チャット）" })
        .waitFor();
      assert.match(await first.textContent(), /判定：AI（API）・/);
      assert.match(await second.textContent(), /AIが重大と判定したため/);
      assert.match(await second.textContent(), /<b>住所<\/b>が読めます/);
      assert.equal(await page.locator("#admin-queue b").count(), 0);
      assert.equal(await page.evaluate(() => window.__xss), undefined);

      // A clean answer is taken in whole and the box is emptied.
      await answer.fill(JSON.stringify([verdict("rep4DDDD")]));
      await importButton.click();
      await result.filter({ hasText: "取り込んだ見立て：1件" }).waitFor();
      assert.equal(await answer.inputValue(), "");
      assert.doesNotMatch(
        await result.textContent(),
        /取り込めなかった|外した/,
      );
      await noHorizontalScroll(page, label + " triage");
      await shot(page, `${label}-triage-chat`);
      // An answer with nothing usable sends nothing.
      const sentBefore = backend.log.length;
      await answer.fill("すみません、判定できませんでした。");
      await importButton.click();
      await result
        .filter({ hasText: "取り込める見立てがありませんでした" })
        .waitFor();
      assert.equal(backend.log.length, sentBefore);
      await answer.fill("");
      // The list was read again from the start: load its second page back.
      await page.locator("#admin-more").click();
      await card(page, "rep4DDDD")
        .filter({ hasText: "判定：AI（チャット）" })
        .waitFor();

      // ---- Hide (a double click sends one request) ------------------------------------------
      await first.getByRole("button", { name: "違反として非表示" }).click();
      await confirmDialog(page).getByLabel(/メモ/).fill("規約違反");
      await shot(page, `${label}-confirm`, false);
      await noHorizontalScroll(page, label + " confirm");
      await confirmDialog(page).locator("#admin-confirm-submit").dblclick();
      await waitNotice(
        page,
        /非表示にしました。投稿者の違反：2回。まとめて対応済みにした通報：2件/,
      );
      const hides = backend.log.filter((e) => e.path.endsWith("/hide"));
      assert.deepEqual(
        hides.map((e) => [e.path, e.body]),
        [["/admin/reports/rep1AAAA/hide", { note: "規約違反" }]],
      );
      assert.match(
        await first.locator(".admin-badges").first().textContent(),
        /対応済み.*違反として非表示/,
      );
      assert.match(await first.textContent(), /運営が非表示/);
      assert.match(await first.textContent(), /メモ：規約違反/);
      assert.equal(
        await first.getByRole("button", { name: "違反として非表示" }).count(),
        0,
      );
      // The same author's other card and the other report on the same work follow.
      assert.match(await second.textContent(), /違反：2回 \/ 3回/);
      await card(page, "rep4DDDD")
        .locator('.admin-badge[data-kind="resolved"]')
        .waitFor();

      // ---- Dismiss ----------------------------------------------------------------------
      await second.getByRole("button", { name: "却下（問題なし）" }).click();
      await confirm(page);
      await waitNotice(page, /却下しました。まとめて対応済みにした通報：1件/);
      assert.match(
        await second.textContent(),
        /対応済み[\s\S]*却下（問題なし）/,
      );
      assert.deepEqual(
        backend.log
          .filter((e) => e.path.endsWith("/dismiss"))
          .map((e) => e.body),
        [{}],
      );

      // ---- Review, through a conflict --------------------------------------------------------
      const third = card(page, "rep3CCCC");
      await third.getByRole("button", { name: "確認中にする" }).click();
      await confirm(page);
      await page
        .locator("#admin-confirm-error")
        .filter({ hasText: "通報の状態がほかの操作で変わりました" })
        .waitFor();
      assert.equal(
        await confirmDialog(page).isVisible(),
        true,
        "the dialog stays open on an error",
      );
      await confirmDialog(page).locator("#admin-confirm-submit").click();
      await waitNotice(page, /通報を「確認中」にしました/);
      assert.match(
        await third.locator(".admin-badges").first().textContent(),
        /確認中/,
      );
      assert.equal(
        await third.getByRole("button", { name: "確認中にする" }).count(),
        0,
      );

      // ---- Suspend (reason required) and unsuspend ----------------------------------------------
      await third.getByRole("button", { name: "投稿を停止" }).click();
      const before = backend.log.length;
      await confirm(page);
      await page
        .locator("#admin-confirm-error")
        .filter({ hasText: "停止の理由を1〜500文字で入力してください" })
        .waitFor();
      assert.equal(backend.log.length, before, "an empty reason is not sent");
      await confirmDialog(page)
        .getByLabel(/停止の理由/)
        .fill("<i>くり返しの違反</i>");
      await confirmDialog(page).locator("#admin-confirm-submit").click();
      await waitNotice(page, /「アカウントC」の投稿を停止しました/);
      assert.match(
        await third.textContent(),
        /投稿停止中[\s\S]*理由：<i>くり返しの違反<\/i>/,
      );
      assert.deepEqual(
        backend.log.find((e) => e.path.endsWith("/suspend")).body,
        { reason: "<i>くり返しの違反</i>" },
      );
      await third.getByRole("button", { name: "停止を解除" }).click();
      await confirm(page, { check: ["違反の記録もリセット"] });
      await waitNotice(page, /投稿の停止を解除しました。違反の回数は0回です/);
      assert.deepEqual(
        backend.log.find((e) => e.path.endsWith("/unsuspend")).body,
        { resetStrikes: true },
      );
      assert.match(await third.textContent(), /投稿できます/);
      assert.match(await third.textContent(), /違反：0回/);

      // ---- Re-show the hidden work, removing its strike ----------------------------------------
      await first.getByRole("button", { name: "作品を再表示" }).click();
      assert.equal(
        await confirmDialog(page)
          .getByLabel("違反の記録も取り消す")
          .isChecked(),
        true,
      );
      await confirm(page);
      await waitNotice(
        page,
        /作品を再表示しました。違反を1回取り消しました（いま1回）/,
      );
      assert.deepEqual(
        backend.log.find((e) => e.path.endsWith("/unhide")).body,
        {
          keepStrike: false,
        },
      );
      assert.doesNotMatch(await first.textContent(), /運営が非表示/);
      await page.waitForFunction(() =>
        /違反：1回 \/ 3回/.test(
          document.querySelector('.admin-card[data-report-id="rep2BBBB"]')
            ?.textContent || "",
        ),
      );

      await shot(page, `${label}-after-actions`);

      // ---- Detail with the related reports ----------------------------------------------------
      await first.getByRole("button", { name: "詳細を見る" }).click();
      const detail = page.locator("#admin-detail");
      await detail.locator(".admin-related-item").nth(1).waitFor();
      assert.equal(await detail.locator(".admin-related-item").count(), 2);
      assert.match(
        await detail.locator(".admin-related").textContent(),
        /同じ作品への通報（2件・新しい順）[\s\S]*この通報/,
      );
      assert.equal(await page.evaluate(() => window.__xss), undefined);
      await noHorizontalScroll(page, label + " detail");
      await shot(page, `${label}-detail`, false);
      await detail.getByRole("button", { name: "閉じる" }).click();
      await detail.waitFor({ state: "hidden" });

      // ---- The sign-in runs out: sign in again and carry on -------------------------------------
      backend.expireNext = true;
      await page.locator("#admin-reload").click();
      await page.locator("#admin-sign-in").waitFor({ state: "visible" });
      assert.match(
        await page.locator("#admin-sign-in-status").textContent(),
        /有効期限が切れた/,
      );
      assert.equal(
        await page.locator("#admin-app").evaluate((node) => node.inert),
        true,
      );
      await page
        .getByRole("button", { name: "テスト用のGoogleログイン" })
        .click();
      await waitNotice(page, /もう一度ログインしました/);
      assert.equal(
        await page.locator("#admin-app").evaluate((node) => node.inert),
        false,
      );
      // Everything pending was handled above, so the reloaded queue is empty.
      await page
        .locator("#admin-queue-status")
        .filter({ hasText: "未対応の通報はありません。" })
        .waitFor();
      assert.equal(backend.log.at(-1).authorization, `Bearer ${tokens[1]}`);
      await copyPrompt.click();
      await promptStatus
        .filter({ hasText: "見立てを待っている通報はありません。" })
        .waitFor();
      assert.equal(await promptBox.isVisible(), false);

      // ---- Switch tabs (also with the arrow keys) -------------------------------------------------
      await page.getByRole("tab", { name: "未対応" }).focus();
      await page.keyboard.press("ArrowRight");
      await card(page, "rep3CCCC").waitFor();
      assert.equal(
        await page
          .getByRole("tab", { name: "確認中" })
          .getAttribute("aria-selected"),
        "true",
      );
      assert.deepEqual(backend.log.at(-1).query, {
        status: "reviewing",
        order: "oldest",
        limit: "20",
      });
      await page.getByRole("tab", { name: "対応済み" }).click();
      await card(page, "rep4DDDD").waitFor();
      assert.equal(await page.locator("#admin-order").inputValue(), "newest");
      assert.deepEqual(backend.log.at(-1).query, {
        status: "resolved",
        order: "newest",
        limit: "20",
      });

      // ---- Sign out clears everything ----------------------------------------------------------
      await page.getByRole("button", { name: "鍵を作る" }).click();
      await keyField.waitFor();
      await answer.fill("貼りかけの答え");
      await page.getByRole("button", { name: "ログアウト" }).click();
      await page
        .locator("#admin-sign-in-status")
        .filter({ hasText: "ログアウトしました" })
        .waitFor();
      assert.equal(await page.locator("#admin-app").isVisible(), false);
      assert.equal(await page.locator("#admin-queue > *").count(), 0);
      assert.equal(await page.locator("#admin-account").isVisible(), false);
      assert.equal(await page.evaluate(() => window.__gisSignedOut), true);
      assert.deepEqual(
        await page.evaluate(() =>
          ["admin-bot-token-value", "admin-prompt-text", "admin-answer"].map(
            (id) => document.getElementById(id).value,
          ),
        ),
        ["", "", ""],
        "the key, the request and the pasted answer leave with the sign-in",
      );
      assert.equal(await keyBox.isVisible(), false);

      assert.deepEqual(
        outside,
        [],
        "no request to a URL the page should have refused",
      );
      assert.deepEqual(
        problems.filter((p) => !/status of 40[19]|status of 400/.test(p)),
        [],
        label,
      );
    } catch (error) {
      // What the page showed, to see why a step did not happen.
      console.error(
        JSON.stringify(
          {
            label,
            problems,
            queueStatus: await page
              .locator("#admin-queue-status")
              .textContent(),
            notice: await page.locator("#admin-notice").textContent(),
            dialogError: await page
              .locator("#admin-confirm-error")
              .textContent(),
            signIn: await page.locator("#admin-sign-in-status").textContent(),
            requests: backend.log.map(
              (e) => `${e.method} ${e.path} ${e.status}`,
            ),
          },
          null,
          2,
        ),
      );
      throw error;
    }
    await context.close();
    cases++;
  }
  console.log(
    `Admin moderation page passed in ${cases} cases (${external ? "wrangler dev, CSP enforced" : "static server"})`,
  );
} finally {
  await browser.close();
  server?.close();
}
