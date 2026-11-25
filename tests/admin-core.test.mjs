// Unit tests for the moderation admin page's helpers (public/js/admin-core.js):
// the API client, the business-day count in Japan time and the safe handling
// of report, work and account text and URLs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const A = require("../public/js/admin-core.js");

const BASE = "https://api.example.invalid/";
const REPORT_ID = "V09SSyNhYmNkZWZnaGlqawpSRVBPUlQ";
const USER = "N" + "0123456789abcdef".repeat(2);

function fakeFetch(handler) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url: new URL(url), init });
    const result = await handler(new URL(url), init, calls.length);
    if (result instanceof Error) throw result;
    const { status = 200, body = {} } = result;
    return new Response(
      typeof body === "string" ? body : JSON.stringify(body),
      {
        status,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  };
  fn.calls = calls;
  return fn;
}

function client(handler, token = "id-token") {
  const fetch = fakeFetch(handler);
  return {
    api: A.createAdminApi({ baseUrl: BASE, getToken: () => token, fetch }),
    fetch,
  };
}

// ---- API client ------------------------------------------------------------

test("every admin call sends the in-memory Google ID token and no cookies", async () => {
  const { api, fetch } = client(() => ({ body: { email: "x", settings: {} } }));
  await api.me();
  const [{ url, init }] = fetch.calls;
  assert.equal(url.href, BASE + "admin/me");
  assert.equal(init.method, "GET");
  assert.equal(init.headers.Authorization, "Bearer id-token");
  assert.equal(init.credentials, "omit");
  assert.equal(init.redirect, "error");
  assert.equal(init.body, undefined);
});

test("without a token (or an expired one) nothing is sent and UNAUTHORIZED is raised", async () => {
  const { api, fetch } = client(() => ({ body: {} }), null);
  await assert.rejects(api.me(), (error) => {
    assert.equal(error.code, "UNAUTHORIZED");
    assert.equal(error.status, 401);
    assert.match(error.message, /もう一度Googleでログイン/);
    return true;
  });
  assert.equal(fetch.calls.length, 0);
});

test("POST bodies are JSON with only the documented fields", async () => {
  const { api, fetch } = client(() => ({ body: { ok: true } }));
  await api.review(REPORT_ID);
  await api.dismiss(REPORT_ID, { note: "  確認しました  " });
  await api.dismiss(REPORT_ID, { note: "   " });
  await api.hide(REPORT_ID, {
    workId: "https://youtu.be/abcdefghijk",
    note: "",
  });
  await api.unhide("abcdefghijk", { keepStrike: false, note: "異議を認めた" });
  await api.suspend(USER, { reason: " 繰り返しの違反 " });
  await api.unsuspend(USER, { resetStrikes: true });
  await api.updateSettings({ aiMode: "off" });
  const sent = fetch.calls.map(({ url, init }) => [
    init.method,
    url.pathname,
    init.headers["Content-Type"],
    JSON.parse(init.body),
  ]);
  assert.deepEqual(sent, [
    ["POST", `/admin/reports/${REPORT_ID}/review`, "application/json", {}],
    [
      "POST",
      `/admin/reports/${REPORT_ID}/dismiss`,
      "application/json",
      { note: "確認しました" },
    ],
    ["POST", `/admin/reports/${REPORT_ID}/dismiss`, "application/json", {}],
    [
      "POST",
      `/admin/reports/${REPORT_ID}/hide`,
      "application/json",
      { workId: "abcdefghijk" },
    ],
    [
      "POST",
      "/admin/works/abcdefghijk/unhide",
      "application/json",
      { keepStrike: false, note: "異議を認めた" },
    ],
    [
      "POST",
      `/admin/users/${USER}/suspend`,
      "application/json",
      { reason: "繰り返しの違反" },
    ],
    [
      "POST",
      `/admin/users/${USER}/unsuspend`,
      "application/json",
      { resetStrikes: true },
    ],
    ["POST", "/admin/settings", "application/json", { aiMode: "off" }],
  ]);
});

test("invalid input is refused before it reaches the server", async () => {
  const { api, fetch } = client(() => ({ body: { ok: true } }));
  const code = async (promise) => {
    try {
      await promise;
    } catch (error) {
      return error.code;
    }
    return "resolved";
  };
  assert.equal(
    await code(api.suspend(USER, { reason: "   " })),
    "INVALID_REASON",
  );
  assert.equal(
    await code(api.suspend(USER, { reason: "あ".repeat(501) })),
    "INVALID_REASON",
  );
  assert.equal(
    await code(api.dismiss(REPORT_ID, { note: "a".repeat(1001) })),
    "INVALID_NOTE",
  );
  assert.equal(
    await code(api.hide(REPORT_ID, { workId: "not a video" })),
    "INVALID_WORK_ID",
  );
  assert.equal(
    await code(api.updateSettings({ aiMode: "sometimes" })),
    "INVALID_AI_MODE",
  );
  assert.equal(await code(api.getReport("../me")), "NOT_FOUND");
  assert.equal(await code(api.getUser("someone")), "NOT_FOUND");
  assert.equal(
    await code(api.listReports({ status: "open" })),
    "INVALID_STATUS",
  );
  assert.equal(await code(api.listReports({ limit: 51 })), "INVALID_PAGE_SIZE");
  assert.equal(fetch.calls.length, 0);
});

test("every server error code maps to a Japanese message", async () => {
  const codes = [
    [403, "ADMIN_DISABLED", /admin-emails/],
    [401, "UNAUTHORIZED", /ログイン/],
    [403, "ADMIN_FORBIDDEN", /権限がありません/],
    [409, "REPORT_RESOLVED", /対応済み/],
    [409, "REPORT_CHANGED", /ほかの操作で変わりました/],
    [409, "WORK_ID_REQUIRED", /作品のID/],
    [409, "WORK_AUTHOR_MISMATCH", /ものではありません/],
    [409, "MODERATION_CHANGED", /同時に変わりました/],
    [400, "INVALID_STATUS", /状態の指定/],
    [400, "INVALID_PAGE_SIZE", /1〜50件/],
    [400, "INVALID_PAGE_CURSOR", /読み込み直して/],
    [400, "INVALID_NOTE", /1000文字/],
    [400, "INVALID_REASON", /1〜500文字/],
    [400, "INVALID_AI_MODE", /通報が多いときだけ/],
    [404, "NOT_FOUND", /見つかりません/],
  ];
  for (const [status, code, pattern] of codes) {
    const { api } = client(() => ({
      status,
      body: { error: "server text", code },
    }));
    await assert.rejects(api.me(), (error) => {
      assert.ok(error instanceof A.AdminApiError);
      assert.equal(error.status, status);
      assert.equal(error.code, code);
      assert.match(error.message, pattern, code);
      assert.doesNotMatch(error.message, /server text/);
      return true;
    });
  }
  // A code the page does not know shows the server's (Japanese) sentence.
  const unknown = client(() => ({
    status: 400,
    body: { error: "パスが長すぎます", code: "PATH_TOO_LONG" },
  }));
  await assert.rejects(unknown.api.me(), /（400）：パスが長すぎます/);
  const crash = client(() => ({ status: 500, body: "<html>oops</html>" }));
  await assert.rejects(crash.api.me(), /サーバーでエラー/);
  const offline = client(() => new TypeError("Failed to fetch"));
  await assert.rejects(
    offline.api.me(),
    (error) => error.code === "NETWORK" && /接続できません/.test(error.message),
  );
  const slow = client(() =>
    Object.assign(new Error("timeout"), { name: "TimeoutError" }),
  );
  await assert.rejects(slow.api.me(), (error) => error.code === "TIMEOUT");
  const garbage = client(() => ({ status: 200, body: "not json" }));
  await assert.rejects(
    garbage.api.me(),
    (error) => error.code === "INVALID_RESPONSE",
  );
  for (const code of Object.keys(A.ERROR_MESSAGES))
    assert.match(A.errorMessage(code, 400), /[ぁ-ん]/, code);
});

test("the pager follows nextCursor, stops at the end and never asks twice at once", async () => {
  const pages = {
    "": { reports: [{ reportId: "a" }, { reportId: "b" }], nextCursor: "c1" },
    c1: { reports: [{ reportId: "b" }, { reportId: "c" }], nextCursor: null },
  };
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const { api, fetch } = client(async (url, init, n) => {
    if (n === 1) await gate;
    return {
      body: {
        status: "pending",
        order: "oldest",
        ...pages[url.searchParams.get("cursor") || ""],
      },
    };
  });
  const pager = A.createReportPager(api, {
    status: "pending",
    order: "oldest",
    limit: 2,
  });
  const first = pager.next();
  assert.equal(
    await pager.next(),
    null,
    "a second call while loading is refused",
  );
  release();
  assert.deepEqual(
    (await first).map((r) => r.reportId),
    ["a", "b"],
  );
  assert.equal(pager.done, false);
  assert.deepEqual(
    (await pager.next()).map((r) => r.reportId),
    ["c"],
    "duplicates are dropped",
  );
  assert.equal(pager.done, true);
  assert.deepEqual(await pager.next(), []);
  assert.equal(fetch.calls.length, 2);
  const [one, two] = fetch.calls.map(({ url }) =>
    Object.fromEntries(url.searchParams),
  );
  assert.deepEqual(one, { status: "pending", order: "oldest", limit: "2" });
  assert.deepEqual(two, {
    status: "pending",
    order: "oldest",
    limit: "2",
    cursor: "c1",
  });
});

test("a failed page can be retried from the same cursor", async () => {
  let fail = true;
  const { api, fetch } = client((url) => {
    if (url.searchParams.get("cursor") === "next" && fail) {
      fail = false;
      return { status: 400, body: { code: "INVALID_PAGE_CURSOR" } };
    }
    return {
      body: {
        reports: [{ reportId: url.searchParams.get("cursor") || "first" }],
        nextCursor: url.searchParams.get("cursor") ? null : "next",
      },
    };
  });
  const pager = A.createReportPager(api, {
    status: "resolved",
    order: "newest",
  });
  await pager.next();
  await assert.rejects(
    pager.next(),
    (error) => error.code === "INVALID_PAGE_CURSOR",
  );
  assert.equal(pager.loading, false);
  assert.deepEqual(
    (await pager.next()).map((r) => r.reportId),
    ["next"],
  );
  assert.equal(fetch.calls.at(-1).url.searchParams.get("cursor"), "next");
});

// ---- Business days (Japan time) ---------------------------------------------

test("business days count Monday to Friday on the Japan-time calendar", () => {
  // 2026-11-20 is a Friday. 23:30 UTC on Thursday the 19th is already Friday in Japan.
  const friday = "2026-11-19T23:30:00Z";
  assert.equal(
    A.businessDaysWaiting(friday, "2026-11-20T14:00:00Z"),
    0,
    "Friday 23:00 JST",
  );
  assert.equal(
    A.businessDaysWaiting(friday, "2026-11-21T03:00:00Z"),
    0,
    "Saturday",
  );
  assert.equal(
    A.businessDaysWaiting(friday, "2026-11-22T14:59:00Z"),
    0,
    "Sunday 23:59 JST",
  );
  assert.equal(
    A.businessDaysWaiting(friday, "2026-11-22T15:00:00Z"),
    1,
    "Monday 00:00 JST",
  );
  assert.equal(
    A.businessDaysWaiting(friday, "2026-12-02T01:00:00Z"),
    8,
    "Wednesday after next",
  );
  // Received on a Saturday: the following Monday is day 1.
  assert.equal(
    A.businessDaysWaiting("2026-11-21T01:00:00Z", "2026-11-23T01:00:00Z"),
    1,
  );
  // A long wait uses whole weeks.
  assert.equal(
    A.businessDaysWaiting("2026-01-05T00:00:00Z", "2026-12-28T00:00:00Z"),
    255,
  );
  assert.equal(
    A.businessDaysWaiting("2026-11-20T00:00:00Z", "2026-11-19T00:00:00Z"),
    0,
  );
  assert.equal(A.businessDaysWaiting("not a date", Date.now()), null);
});

test("the 10-business-day deadline and the highlight from 8 business days", () => {
  const received = "2026-11-20T01:00:00Z"; // Friday 10:00 JST
  assert.equal(
    A.formatJstDay(A.businessDeadlineDay(received)),
    "12月4日（金）",
  );
  const at = (iso) => A.waitingInfo(received, iso);
  assert.equal(at("2026-12-01T01:00:00Z").days, 7);
  assert.equal(at("2026-12-01T01:00:00Z").level, "ok");
  assert.equal(at("2026-12-02T01:00:00Z").level, "warn");
  assert.match(
    at("2026-12-02T01:00:00Z").summary,
    /受付から8営業日・期限まであと2営業日/,
  );
  assert.match(at("2026-12-04T01:00:00Z").summary, /今日が期限です/);
  assert.equal(at("2026-12-07T01:00:00Z").level, "overdue");
  assert.match(at("2026-12-07T01:00:00Z").summary, /期限を1営業日過ぎています/);
});

test("times are shown in Japan time", () => {
  assert.equal(
    A.formatJstDateTime("2026-11-24T15:05:00Z"),
    "2026/11/25（水）00:05",
  );
  assert.equal(A.formatJstDateTime(null), "");
  assert.equal(A.formatJstDateTime("garbage"), "");
});

// ---- Text and URLs ------------------------------------------------------------

function fakeDocument() {
  class Node {
    constructor(tag) {
      this.tagName = tag;
      this.attributes = {};
      this.childNodes = [];
      this._text = null;
    }
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    }
    appendChild(child) {
      this.childNodes.push(child);
      return child;
    }
    set textContent(value) {
      this.childNodes = [{ nodeType: 3, data: String(value) }];
    }
    get textContent() {
      return this.childNodes
        .map((c) => (c.nodeType === 3 ? c.data : c.textContent))
        .join("");
    }
  }
  return {
    createElement: (tag) => new Node(tag),
    createTextNode: (data) => ({ nodeType: 3, data: String(data) }),
  };
}

test("report, work and account text is only ever set as text", () => {
  const h = A.createElementFactory(fakeDocument());
  const payload = '<script>alert(1)</script><img src=x onerror="alert(2)">';
  const node = h("p", { dir: "auto" }, payload, h("span", { text: payload }));
  assert.equal(node.childNodes[0].nodeType, 3);
  assert.equal(node.childNodes[0].data, payload);
  assert.equal(node.textContent, payload + payload);
  assert.equal(node.childNodes.length, 2);
  for (const key of [
    "onerror",
    "onclick",
    "innerHTML",
    "outerHTML",
    "srcdoc",
    "style",
  ])
    assert.throws(() => h("img", { [key]: "x" }), /unsafe property/, key);
  assert.throws(() => h("script", null), /unsupported element/);
  const link = h("a", { href: "javascript:alert(1)" }, "x");
  assert.equal(link.attributes.href, undefined);
  const image = h("img", { src: "data:text/html,<script>alert(1)</script>" });
  assert.equal(image.attributes.src, undefined);
  assert.equal(
    h("a", { href: "https://www.youtube.com/watch?v=abcdefghijk" }).attributes
      .href,
    "https://www.youtube.com/watch?v=abcdefghijk",
  );
  const data = h("article", { dataset: { reportId: "r1", status: null } });
  assert.deepEqual(data.attributes, { "data-report-id": "r1" });
  assert.equal(A.text({ toString: () => "<b>" }), "");
  assert.equal(A.text(undefined), "");
  assert.equal(A.shorten("あいうえお🎨か", 6), "あいうえお🎨…");
});

test("links and images accept only http(s), and thumbnails only YouTube's image hosts", () => {
  for (const bad of [
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "vbscript:x",
    "//evil.example/x",
    "/relative",
    "https://user:pass@example.com/",
    " ",
    42,
    null,
  ])
    assert.equal(A.safeHttpUrl(bad), null, String(bad));
  assert.equal(
    A.safeHttpUrl("http://example.com/a?b=1"),
    "http://example.com/a?b=1",
  );
  assert.equal(
    A.safeThumbnailUrl("https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"),
    "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
  );
  assert.equal(
    A.safeThumbnailUrl("http://img.youtube.com/vi/abcdefghijk/0.jpg"),
    "https://img.youtube.com/vi/abcdefghijk/0.jpg",
  );
  for (const bad of [
    "https://evil.example/track.png",
    "https://i.ytimg.com.evil.example/x.jpg",
    "https://i.ytimg.com:8443/x.jpg",
    "javascript:alert(1)",
  ])
    assert.equal(A.safeThumbnailUrl(bad), null, bad);
  assert.equal(
    A.safeThumbnailUrl("https://evil.example/x.png", "abcdefghijk"),
    "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
  );
  assert.equal(A.safeThumbnailUrl(null, "<bad>"), null);
  assert.equal(
    A.safeYoutubeUrl("https://evil.example/watch?v=abcdefghijk", "abcdefghijk"),
    "https://www.youtube.com/watch?v=abcdefghijk",
  );
  assert.equal(
    A.safeYoutubeUrl("https://youtu.be/abcdefghijk"),
    "https://youtu.be/abcdefghijk",
  );
  assert.equal(A.safeYoutubeUrl("javascript:alert(1)", "bad"), null);
  for (const [input, id] of [
    ["abcdefghijk", "abcdefghijk"],
    [" https://www.youtube.com/watch?v=abc_efg-ijk&t=3 ", "abc_efg-ijk"],
    ["https://youtu.be/abcdefghijk?si=x", "abcdefghijk"],
    ["https://youtube.com/shorts/abcdefghijk", "abcdefghijk"],
    ["https://evil.example/watch?v=abcdefghijk", null],
    ["abcdefghij", null],
  ])
    assert.equal(A.parseWorkId(input), id, input);
});

test("AI triage, AI mode and token expiry are read defensively", () => {
  assert.equal(A.aiTriageView(null).summary, "AI判定なし");
  assert.equal(
    A.aiTriageView({ status: "refused", triagedAt: "x" }).summary,
    "AIが判定できませんでした（人の確認が必要）",
  );
  assert.match(A.aiTriageView({ status: "failed" }).summary, /人の確認が必要/);
  const ok = A.aiTriageView({
    status: "ok",
    severity: "critical",
    category: "privacy",
    recommendedAction: "hide",
    rationale: "<b>住所</b>",
    triagedAt: "2026-11-24T15:05:00Z",
  });
  assert.equal(
    ok.summary,
    "重大度：重大・分類：個人情報・推奨：非表示をすすめる",
  );
  assert.equal(ok.rationale, "<b>住所</b>");
  assert.deepEqual(
    A.aiModeOptions({ aiBacklogThreshold: 20 }).map((o) => o.label),
    ["AIの判定：オフ", "常に判定する", "通報が多いときだけ（20件以上）"],
  );
  assert.equal(A.aiModeSourceLabel("admin"), "この管理ページで選んだ設定");
  assert.equal(
    A.aiModeSourceLabel("default"),
    "サーバーの既定（デプロイの設定）",
  );
  const payload = Buffer.from(
    JSON.stringify({ exp: 1800000000, name: "テスト" }),
  ).toString("base64url");
  assert.equal(A.tokenExpiry(`x.${payload}.y`), 1800000000 * 1000);
  assert.equal(A.tokenExpiry("garbage"), null);
  assert.equal(A.tokenExpiry(undefined), null);
});

// ---- Triage with the owner's Claude subscription ----------------------------

test("the triage endpoints use the documented paths and bodies", async () => {
  const { api, fetch } = client((url) => {
    if (url.pathname === "/admin/triage/token")
      return {
        body: {
          token: "nt_secret",
          createdAt: "2026-11-25T01:00:00Z",
          settings: { triageBot: { configured: true } },
        },
      };
    if (url.pathname === "/admin/triage/prompt")
      return {
        body: { prompt: "次の2件を…", reportCount: 2, reportIds: ["a", "b"] },
      };
    if (url.pathname === "/admin/triage/results")
      return {
        body: { results: [{ reportId: "a", ok: true, autoHidden: false }] },
      };
    return { body: { ok: true, settings: {} } };
  });
  assert.equal((await api.createTriageToken()).token, "nt_secret");
  await api.revokeTriageToken();
  const prompt = await api.triagePrompt();
  assert.equal(prompt.reportCount, 2);
  await api.triagePrompt({ limit: 5 });
  const item = {
    reportId: "a",
    severity: "low",
    category: "none",
    recommendedAction: "keep",
    rationale: "問題なし",
  };
  await api.submitTriageResults([item]);
  assert.deepEqual(
    fetch.calls.map(({ url, init }) => [
      init.method,
      url.pathname + url.search,
      init.headers.Authorization,
      init.body === undefined ? undefined : JSON.parse(init.body),
    ]),
    [
      ["POST", "/admin/triage/token", "Bearer id-token", {}],
      ["POST", "/admin/triage/token/revoke", "Bearer id-token", {}],
      ["GET", "/admin/triage/prompt?limit=20", "Bearer id-token", undefined],
      ["GET", "/admin/triage/prompt?limit=5", "Bearer id-token", undefined],
      ["POST", "/admin/triage/results", "Bearer id-token", { results: [item] }],
    ],
  );
});

test("triage calls refuse bad input before sending and bad responses after", async () => {
  const { api, fetch } = client(() => ({ body: { ok: true } }));
  const code = async (promise) => {
    try {
      await promise;
    } catch (error) {
      return error.code;
    }
    return "resolved";
  };
  assert.equal(await code(api.submitTriageResults([])), "INVALID_TRIAGE");
  assert.equal(
    await code(api.submitTriageResults(Array(51).fill({ reportId: "a" }))),
    "INVALID_TRIAGE",
  );
  assert.equal(await code(api.submitTriageResults(null)), "INVALID_TRIAGE");
  assert.equal(await code(api.triagePrompt({ limit: 0 })), "INVALID_PAGE_SIZE");
  assert.equal(
    await code(api.triagePrompt({ limit: 51 })),
    "INVALID_PAGE_SIZE",
  );
  assert.equal(fetch.calls.length, 0);
  // A response without the key, the prompt or the results is not shown.
  const empty = client(() => ({ body: { ok: true } })).api;
  assert.equal(await code(empty.createTriageToken()), "INVALID_RESPONSE");
  assert.equal(await code(empty.triagePrompt()), "INVALID_RESPONSE");
  assert.equal(
    await code(empty.submitTriageResults([{ reportId: "a" }])),
    "INVALID_RESPONSE",
  );
  const none = client(() => ({
    body: { prompt: "", reportCount: 0, reportIds: [] },
  })).api;
  assert.deepEqual(await none.triagePrompt(), {
    prompt: "",
    reportCount: 0,
    reportIds: [],
  });
  for (const code of ["INVALID_TRIAGE", "ALREADY_TRIAGED"])
    assert.match(A.errorMessage(code, 400), /見立て/, code);
});

const judgment = (reportId, extra) => ({
  reportId,
  severity: "low",
  category: "none",
  recommendedAction: "keep",
  rationale: "問題は見当たりません",
  ...extra,
});

test("parseTriageAnswer reads the ```json block of a Claude answer", () => {
  const answer = [
    "通報を確認しました。",
    "```text",
    "メモ：[参考] これは見立てではありません",
    "```",
    "```json",
    JSON.stringify(
      [
        judgment("rep1", { severity: "critical", recommendedAction: "hide" }),
        judgment("rep2", { extra: "捨てる", rationale: "  前後の空白  " }),
      ],
      null,
      2,
    ),
    "```",
    "以上です。",
  ].join("\n");
  const { results, errors } = A.parseTriageAnswer(answer);
  assert.deepEqual(errors, []);
  assert.deepEqual(results, [
    judgment("rep1", { severity: "critical", recommendedAction: "hide" }),
    judgment("rep2", { rationale: "前後の空白" }),
  ]);
  // A plain ``` block, Windows line ends, and upper-case values.
  const plain = A.parseTriageAnswer(
    "```\r\n" +
      JSON.stringify([judgment("rep3", { severity: "High" })]) +
      "\r\n```",
  );
  assert.deepEqual(plain.results, [judgment("rep3", { severity: "high" })]);
});

test("parseTriageAnswer finds a bare array or an object with results", () => {
  const bare = A.parseTriageAnswer(
    `見立ては次のとおりです [注] ${JSON.stringify([judgment("a")])} ご確認ください。`,
  );
  assert.deepEqual(bare, { results: [judgment("a")], errors: [] });
  const object = A.parseTriageAnswer(
    JSON.stringify({ results: [judgment("b")] }),
  );
  assert.deepEqual(object, { results: [judgment("b")], errors: [] });
  const fencedObject = A.parseTriageAnswer(
    "```json\n" + JSON.stringify({ results: [judgment("c")] }) + "\n```",
  );
  assert.deepEqual(fencedObject.results, [judgment("c")]);
  // A ] inside a string does not end the array.
  const bracket = A.parseTriageAnswer(
    "答え：" + JSON.stringify([judgment("d", { rationale: "記号 ] と [ " })]),
  );
  assert.deepEqual(bracket.results, [
    judgment("d", { rationale: "記号 ] と [" }),
  ]);
});

test("parseTriageAnswer explains what it could not read", () => {
  for (const input of [
    "",
    "   ",
    null,
    42,
    "すみません、判定できません。",
    "```json\n[{oops\n```",
    "{}",
    JSON.stringify({ results: "none" }),
    "[]",
  ]) {
    const { results, errors } = A.parseTriageAnswer(input);
    assert.deepEqual(results, [], String(input));
    assert.equal(errors.length, 1, String(input));
    assert.match(errors[0], /[ぁ-ん]/, String(input));
  }
  assert.match(A.parseTriageAnswer("").errors[0], /貼ってください/);
  assert.match(
    A.parseTriageAnswer("判定できません").errors[0],
    /見つかりませんでした/,
  );
  assert.match(
    A.parseTriageAnswer("```json\n[{oops\n```").errors[0],
    /JSONとして読めませんでした/,
  );
  assert.match(A.parseTriageAnswer("[]").errors[0], /1件も/);
  assert.match(
    A.parseTriageAnswer("あ".repeat(200001)).errors[0],
    /長すぎます/,
  );
});

test("parseTriageAnswer leaves out items that do not match the backend's shape", () => {
  const { results, errors } = A.parseTriageAnswer(
    JSON.stringify([
      judgment("ok1"),
      judgment("bad-severity", { severity: "severe" }),
      judgment("bad-category", { category: "nudity" }),
      judgment("bad-action", { recommendedAction: "delete" }),
      judgment("", {}),
      judgment("no-rationale", { rationale: "   " }),
      judgment("long", { rationale: "あ".repeat(301) }),
      judgment("just-300", { rationale: "あ".repeat(300) }),
      "not an object",
      [judgment("nested")],
      judgment("ok1", { severity: "high" }),
    ]),
  );
  assert.deepEqual(
    results.map((r) => r.reportId),
    ["ok1", "just-300"],
  );
  assert.equal(results[0].severity, "low", "the first of a duplicate is kept");
  assert.equal(errors.length, 9);
  assert.match(
    errors[0],
    /^2件目（bad-severity）：重大度（severity）「severe」/,
  );
  assert.match(errors[1], /^3件目（bad-category）：分類（category）「nudity」/);
  assert.match(
    errors[2],
    /^4件目（bad-action）：推奨（recommendedAction）「delete」/,
  );
  assert.match(errors[3], /^5件目：通報のID（reportId）がありません/);
  assert.match(errors[4], /理由（rationale）がありません/);
  assert.match(errors[5], /300文字を超えています（301文字）/);
  assert.match(errors[6], /^9件目：見立ての形/);
  assert.match(errors[7], /^10件目：見立ての形/);
  assert.match(errors[8], /^11件目（ok1）：同じ通報の見立てが前にもある/);
});

test("parseTriageAnswer sends at most 50 judgments", () => {
  const many = Array.from({ length: 55 }, (_, i) => judgment(`r${i + 1}`));
  const { results, errors } = A.parseTriageAnswer(JSON.stringify(many));
  assert.equal(results.length, 50);
  assert.equal(results.at(-1).reportId, "r50");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /50件まで.*51件目からの5件は外しました/);
});

test("the import summary counts stored, hidden and refused judgments", () => {
  const sent = ["a", "b", "c", "d", "e", "f", "g"].map((id) => judgment(id));
  const summary = A.summarizeTriageResults(
    {
      results: [
        { reportId: "a", ok: true, autoHidden: false },
        { reportId: "b", ok: true, autoHidden: true },
        { reportId: "c", ok: false, code: "INVALID_TRIAGE" },
        { reportId: "d", ok: false, code: "NOT_FOUND" },
        { reportId: "e", ok: false, code: "REPORT_RESOLVED" },
        { reportId: "f", ok: false, code: "ALREADY_TRIAGED" },
        { reportId: "zzz", ok: true, autoHidden: true },
      ],
    },
    sent,
  );
  assert.equal(summary.imported, 2);
  assert.equal(summary.autoHidden, 1);
  assert.deepEqual(
    summary.failed.map((f) => [f.reportId, f.reason]),
    [
      ["c", "形が正しくない"],
      ["d", "通報が見つからない"],
      ["e", "対応済み"],
      ["f", "すでに見立てがある"],
      ["g", "サーバーから結果が返らなかった"],
    ],
  );
  assert.equal(
    A.triageResultReason("SOMETHING"),
    "取り込めなかった（SOMETHING）",
  );
  assert.deepEqual(A.summarizeTriageResults(null, []), {
    imported: 0,
    autoHidden: 0,
    failed: [],
  });
});

test("the AI triage line names who wrote it", () => {
  const base = {
    status: "ok",
    severity: "low",
    category: "none",
    recommendedAction: "keep",
    rationale: "問題なし",
    triagedAt: "2026-11-24T15:05:00Z",
  };
  const view = (extra) => A.aiTriageView({ ...base, ...extra });
  assert.equal(view({}).sourceLabel, "AI（API）", "no source is the API");
  assert.equal(view({ source: "api" }).sourceLabel, "AI（API）");
  assert.equal(
    view({ source: "subscription" }).sourceLabel,
    "AI（サブスクの下見）",
  );
  assert.equal(view({ source: "chat" }).sourceLabel, "AI（チャット）");
  assert.equal(view({ source: "<b>x</b>" }).source, "api");
  assert.equal(
    view({ source: "chat", model: "some-model" }).byline,
    "判定：AI（チャット）・2026/11/25（水）00:05・some-model",
  );
  assert.equal(
    view({ source: "subscription", triagedAt: null }).byline,
    "判定：AI（サブスクの下見）",
  );
  assert.equal(
    view({ source: "chat" }).line,
    "AI（チャット）：重大度：低・分類：該当なし・推奨：掲載のままでよい",
  );
  assert.equal(
    A.aiTriageView({ status: "refused", source: "subscription" }).line,
    "AI（サブスクの下見）：AIが判定できませんでした（人の確認が必要）",
  );
  assert.deepEqual(
    [A.aiTriageView(null).byline, A.aiTriageView(null).line],
    ["", "AI：AI判定なし"],
  );
});

test("the triage key's state reads an old backend as not set", () => {
  for (const bot of [undefined, null, "yes", {}, { configured: "true" }])
    assert.deepEqual(A.triageBotView(bot), {
      configured: false,
      label: "未設定",
      details: [],
    });
  assert.deepEqual(
    A.triageBotView({
      configured: true,
      createdAt: "2026-11-24T15:05:00Z",
      createdBy: "owner",
      lastUsedAt: "2026-11-25T03:30:00Z",
    }),
    {
      configured: true,
      label: "設定済み",
      details: [
        "作った日時：2026/11/25（水）00:05（owner）",
        "最後に使われた日時：2026/11/25（水）12:30",
      ],
    },
  );
  assert.deepEqual(
    A.triageBotView({ configured: true, createdAt: null, lastUsedAt: null })
      .details,
    ["作った日時：不明", "まだ使われていません"],
  );
  assert.equal(
    A.hostOf("https://abc.lambda-url.ap-northeast-1.on.aws/"),
    "abc.lambda-url.ap-northeast-1.on.aws",
  );
  assert.equal(A.hostOf("javascript:alert(1)"), "");
});

test("the page's scripts have no HTML sinks and keep the token out of storage", () => {
  for (const file of ["public/js/admin.js", "public/js/admin-core.js"]) {
    const source = readFileSync(
      new URL("../" + file, import.meta.url),
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    for (const sink of [
      /\.innerHTML\b/,
      /\.outerHTML\b/,
      /insertAdjacentHTML/,
      /document\.write/,
      /\beval\(/,
      /new Function\(/,
      /localStorage/,
      /sessionStorage/,
      /indexedDB/,
      /document\.cookie/,
    ])
      assert.doesNotMatch(source, sink, `${file}: ${sink}`);
  }
  const html = readFileSync(
    new URL("../public/admin/index.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(html, /<html lang="ja">/);
  assert.doesNotMatch(
    html,
    /<script(?![^>]*\bsrc=)[^>]*>/,
    "no inline scripts (CSP)",
  );
  assert.doesNotMatch(html, /\son\w+=/i, "no inline event handlers");
  assert.doesNotMatch(html, /@[\w-]+\.[a-z]/i, "no email address in the page");
});
