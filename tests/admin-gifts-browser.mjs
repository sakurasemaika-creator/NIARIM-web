// Browser walk-through of the 「クーポン」「プレゼント」 views of the admin page
// (/admin/). Google Identity Services and the backend are replaced by route
// interception, as in tests/admin-browser.mjs; the backend here is a small
// in-memory stand-in with the shapes and checks of
// backend/src/api/routes/opalGiftsAdmin.ts and backend/src/lib/opalGifts.ts.
//
// The walk signs in, opens the coupons, checks the list (Japan time, uses,
// who may use it, states), refuses a bad form before sending, shows the
// server's answer (COUPON_CODE_TAKEN) in the dialog, makes a coupon with a
// generated code and copies it, stops one, then does the same for presents
// (translations, account IDs, the 20-present limit, one request for a double
// click) and signs out. Text carrying <img onerror> must stay text.
//
//   node tests/admin-gifts-browser.mjs
//   ADMIN_SHOTS=artifacts/admin-gifts node tests/admin-gifts-browser.mjs
//   ADMIN_BASE_URL=http://127.0.0.1:8787 node tests/admin-gifts-browser.mjs
//                                   # through wrangler dev (the page's CSP)
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const core = createRequire(import.meta.url)("../public/js/admin-core.js");

const publicDir = normalize(new URL("../public/", import.meta.url).pathname);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
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
      response.writeHead(404).end("not found");
    }
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server)),
  );
}

const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const fakeToken = (n) =>
  `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ exp: Math.floor(Date.now() / 1000) + 3600, n })}.sig${n}`;

const DAY = 86400000;
const USER_A = "N" + "a".repeat(32);
const USER_B = "N" + "b".repeat(32);

/** In-memory stand-in for the admin gift routes. */
function makeBackend(tokens) {
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const eligibility = (e = {}) => ({
    newAccountWithinDays: e.newAccountWithinDays ?? null,
    accountCreatedFrom: e.accountCreatedFrom
      ? iso(Date.parse(e.accountCreatedFrom))
      : null,
    accountCreatedUntil: e.accountCreatedUntil
      ? iso(Date.parse(e.accountCreatedUntil))
      : null,
    accountIds: e.accountIds ?? null,
  });
  const coupon = (code, extra) => ({
    code,
    displayCode: core.displayCouponCode(code),
    coins: 500,
    active: true,
    validFrom: iso(now - 5 * DAY),
    validUntil: iso(now + 30 * DAY),
    maxRedemptions: null,
    redeemedCount: 0,
    eligibility: eligibility(),
    note: "",
    createdAt: iso(now - 5 * DAY),
    createdBy: "test-moderator",
    deactivatedAt: null,
    deactivatedBy: null,
    ...extra,
  });
  const coupons = new Map(
    [
      coupon("WELCOME2027", {
        maxRedemptions: 1000,
        redeemedCount: 12,
        eligibility: eligibility({ newAccountWithinDays: 7 }),
        note: 'Xの告知<img src=x onerror="window.__xss=1">',
        createdAt: iso(now - 1 * DAY),
      }),
      coupon("SUMMER2026", {
        validFrom: iso(now - 120 * DAY),
        validUntil: iso(now - 30 * DAY),
        redeemedCount: 340,
        createdAt: iso(now - 120 * DAY),
      }),
      coupon("PQRSTUVWXYZ2", {
        active: false,
        redeemedCount: 3,
        eligibility: eligibility({
          accountCreatedUntil: "2026-11-01T00:00:00+09:00",
        }),
        deactivatedAt: iso(now - 2 * DAY),
        deactivatedBy: "test-moderator",
        createdAt: iso(now - 3 * DAY),
      }),
      coupon("LIMITED100", {
        maxRedemptions: 100,
        redeemedCount: 100,
        createdAt: iso(now - 10 * DAY),
      }),
    ].map((c) => [c.code, c]),
  );
  const present = (id, extra) => ({
    id,
    coins: 300,
    title: "メンテナンスのお詫び",
    body: "ご不便をおかけしました。",
    translations: {},
    active: true,
    visibleFrom: iso(now - 1 * DAY),
    claimUntil: iso(now + 14 * DAY),
    eligibility: eligibility(),
    note: "",
    createdAt: iso(now - 1 * DAY),
    createdBy: "test-moderator",
    deactivatedAt: null,
    deactivatedBy: null,
    ...extra,
  });
  let seq = 0;
  const presentId = () =>
    Date.now().toString(36).padStart(9, "0") +
    String(++seq).padStart(8, "0").slice(-8);
  const presents = new Map(
    [
      present("000000001aaaaaaaa", {
        title: "1周年の<b>お祝い</b>",
        translations: { en: { title: "Our first birthday", body: "" } },
        eligibility: eligibility({
          accountCreatedUntil: "2026-12-01T00:00:00+09:00",
        }),
        note: "お祝い",
        createdAt: iso(now - 2 * DAY),
      }),
      present("000000002bbbbbbbb", {
        title: "年末のプレゼント",
        visibleFrom: iso(now + 10 * DAY),
        claimUntil: iso(now + 40 * DAY),
        eligibility: eligibility({ accountIds: [USER_A, USER_B] }),
        createdAt: iso(now - 3 * DAY),
      }),
      present("000000003cccccccc", {
        title: "夏のプレゼント",
        visibleFrom: iso(now - 90 * DAY),
        claimUntil: iso(now - 60 * DAY),
        createdAt: iso(now - 90 * DAY),
      }),
      present("000000004dddddddd", {
        title: "止めたプレゼント",
        active: false,
        deactivatedAt: iso(now - 4 * DAY),
        deactivatedBy: "test-moderator",
        createdAt: iso(now - 5 * DAY),
      }),
    ].map((p) => [p.id, p]),
  );
  const state = {
    log: [],
    coupons,
    presents,
    generated: "ABCDEFGHJKMN",
    forceLimit: false,
    delay: 0,
  };
  const bad = (code, error) => [400, { error, code }];

  function window(from, until) {
    const start = from === undefined ? Date.now() : Date.parse(from);
    const end = Date.parse(until);
    if (!/[+-]\d{2}:\d{2}$|Z$/.test(String(until)))
      return bad("GIFT_INVALID_TIME", "タイムゾーン付きで");
    if (!(end > start) || !(end > Date.now()) || end - start > 366 * DAY)
      return bad("GIFT_INVALID_WINDOW", "有効期間は366日以内にしてください");
    return null;
  }

  function handle(method, path, body, authorization) {
    const token = authorization?.replace(/^Bearer /, "");
    if (!token || !tokens.includes(token))
      return [
        401,
        { error: "IDトークンの検証に失敗しました", code: "UNAUTHORIZED" },
      ];
    if (method === "GET" && path === "/admin/me")
      return [200, { email: "test-moderator", settings: {} }];
    if (method === "GET" && path === "/admin/reports")
      return [200, { reports: [], nextCursor: null }];
    if (method === "GET" && path === "/admin/gifts/coupons")
      return [200, { coupons: [...coupons.values()], nextCursor: null }];
    if (method === "GET" && path === "/admin/gifts/presents")
      return [200, { presents: [...presents.values()], nextCursor: null }];
    if (method === "POST" && path === "/admin/gifts/coupons") {
      if (!Number.isSafeInteger(body.coins) || body.coins < 1)
        return bad("GIFT_INVALID_COINS", "coinsは1〜1000000の整数です");
      const invalid = window(body.validFrom, body.validUntil);
      if (invalid) return invalid;
      const code = body.code ?? state.generated;
      if (coupons.has(code))
        return [
          409,
          { error: "このコードはすでにあります", code: "COUPON_CODE_TAKEN" },
        ];
      const made = coupon(code, {
        coins: body.coins,
        validFrom: iso(
          body.validFrom ? Date.parse(body.validFrom) : Date.now(),
        ),
        validUntil: iso(Date.parse(body.validUntil)),
        maxRedemptions: body.maxRedemptions ?? null,
        eligibility: eligibility(body.eligibility),
        note: body.note ?? "",
        createdAt: iso(Date.now()),
      });
      coupons.set(code, made);
      return [200, { ok: true, coupon: made }];
    }
    let match = path.match(
      /^\/admin\/gifts\/coupons\/([A-Z0-9]+)\/deactivate$/,
    );
    if (method === "POST" && match) {
      const found = coupons.get(match[1]);
      if (!found)
        return [404, { error: "クーポンが見つかりません", code: "NOT_FOUND" }];
      Object.assign(found, {
        active: false,
        deactivatedAt: iso(Date.now()),
        deactivatedBy: "test-moderator",
      });
      return [200, { ok: true, coupon: found }];
    }
    if (method === "POST" && path === "/admin/gifts/presents") {
      const live = [...presents.values()].filter(
        (p) => p.active && Date.parse(p.claimUntil) > Date.now(),
      ).length;
      if (state.forceLimit || live >= 20)
        return [
          409,
          {
            error:
              "同時に配れるプレゼントは20件までです。終わったものを止めてください",
            code: "PRESENT_LIMIT_REACHED",
          },
        ];
      if (typeof body.title !== "string" || !body.title)
        return bad("GIFT_INVALID_TEXT", "titleを入力してください");
      const invalid = window(body.visibleFrom, body.claimUntil);
      if (invalid) return invalid;
      const made = present(presentId(), {
        coins: body.coins,
        title: body.title,
        body: body.body ?? "",
        translations: body.translations ?? {},
        visibleFrom: iso(
          body.visibleFrom ? Date.parse(body.visibleFrom) : Date.now(),
        ),
        claimUntil: iso(Date.parse(body.claimUntil)),
        eligibility: eligibility(body.eligibility),
        note: body.note ?? "",
        createdAt: iso(Date.now()),
      });
      presents.set(made.id, made);
      return [200, { ok: true, present: made }];
    }
    match = path.match(
      /^\/admin\/gifts\/presents\/([0-9a-z]{17})\/deactivate$/,
    );
    if (method === "POST" && match) {
      const found = presents.get(match[1]);
      if (!found)
        return [
          404,
          { error: "プレゼントが見つかりません", code: "NOT_FOUND" },
        ];
      Object.assign(found, {
        active: false,
        deactivatedAt: iso(Date.now()),
        deactivatedBy: "test-moderator",
      });
      return [200, { ok: true, present: found }];
    }
    return [404, { error: `該当するルートがありません: ${method} ${path}` }];
  }

  state.route = async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const cors = {
      "access-control-allow-origin": request.headers().origin || "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "authorization, content-type",
      vary: "origin",
    };
    if (request.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: cors, body: "" });
    const body = request.postData() ? JSON.parse(request.postData()) : {};
    if (state.delay && request.method() === "POST")
      await new Promise((resolve) => setTimeout(resolve, state.delay));
    const [status, json] = handle(
      request.method(),
      url.pathname,
      body,
      request.headers().authorization,
    );
    state.log.push({
      method: request.method(),
      path: url.pathname,
      body,
      status,
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
    window.google = { accounts: { id: {
      initialize(options) { this.callback = options.callback; },
      renderButton(mount) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "テスト用のGoogleログイン";
        button.addEventListener("click", () => this.callback({ credential: tokens[Math.min(next++, tokens.length - 1)] }));
        mount.append(button);
      },
      disableAutoSelect() {},
    } } };
  })();`;
}

function clipboardStub() {
  window.__copied = [];
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText(value) {
        window.__copied.push(String(value));
      },
    },
  });
}

const shotsDir = process.env.ADMIN_SHOTS;
async function shot(page, name, options = {}) {
  if (!shotsDir) return;
  await mkdir(shotsDir, { recursive: true });
  await page.screenshot({
    path: join(shotsDir, name + ".png"),
    fullPage: true,
    ...options,
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

/** A datetime-local value `days` from now (Japan time). */
const inDays = (days) => core.jstInputValue(Date.now() + days * DAY);

const external = process.env.ADMIN_BASE_URL?.replace(/\/$/, "");
const server = external ? null : await startStaticServer();
const base = external || `http://127.0.0.1:${server.address().port}`;
const config = external
  ? await (await fetch(`${base}/api/admin/config`)).json()
  : {
      clientId: "test-client.apps.googleusercontent.com",
      apiBaseUrl: "https://api.example.invalid/",
    };
const apiOrigin = new URL(config.apiBaseUrl).origin;
const browser = await chromium.launch(launchOptions());
let cases = 0;

try {
  for (const [label, viewport] of [
    [
      "phone",
      // A browser far from Japan: the page still reads and writes Japan time.
      {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        locale: "en-US",
        timezoneId: "America/Los_Angeles",
      },
    ],
    [
      "desktop",
      {
        viewport: { width: 1280, height: 900 },
        locale: "ja-JP",
        timezoneId: "Asia/Tokyo",
      },
    ],
  ]) {
    const tokens = [fakeToken(1), fakeToken(2)];
    const backend = makeBackend(tokens);
    const context = await browser.newContext({ ...viewport });
    await context.addInitScript(clipboardStub);
    const page = await context.newPage();
    const problems = [];
    page.on("pageerror", (error) =>
      problems.push("pageerror: " + error.message),
    );
    page.on("console", (message) => {
      if (
        message.type() === "error" ||
        /Content Security Policy/i.test(message.text())
      )
        problems.push("console: " + message.text());
    });
    if (!external)
      await page.route(`${base}/api/admin/config`, (route) =>
        route.fulfill({ status: 200, json: config }),
      );
    await page.route("https://accounts.google.com/gsi/client", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: gisScript(tokens),
      }),
    );
    await page.route(`${apiOrigin}/**`, backend.route);
    const posts = (path) =>
      backend.log.filter((e) => e.method === "POST" && e.path === path);
    const dialog = page.locator("#admin-confirm");

    try {
      await page.goto(`${base}/admin/`);
      assert.equal(await page.title(), "管理 | NIARIM");
      await page
        .getByRole("button", { name: "テスト用のGoogleログイン" })
        .click();
      await page
        .locator("#admin-email")
        .filter({ hasText: "test-moderator" })
        .waitFor();

      // ---- The view tabs -------------------------------------------------------------
      const tabs = page.getByRole("tablist", { name: "管理するもの" });
      assert.equal(await tabs.getByRole("tab").count(), 3);
      assert.equal(
        await page
          .getByRole("tab", { name: "通報" })
          .getAttribute("aria-selected"),
        "true",
      );
      assert.equal(
        await page.locator("#admin-view-coupons").isVisible(),
        false,
      );
      assert.equal(
        backend.log.some((e) => e.path.startsWith("/admin/gifts")),
        false,
        "the gift lists are read only when their view is opened",
      );
      // Keyboard: the arrow key moves to the next view and selects it.
      await page.getByRole("tab", { name: "通報" }).focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page
          .getByRole("tab", { name: "クーポン" })
          .getAttribute("aria-selected"),
        "true",
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.textContent.trim()),
        "クーポン",
      );
      assert.equal(new URL(page.url()).hash, "#coupons");
      await page.locator("#admin-view-coupons").waitFor();
      assert.equal(
        await page.locator("#admin-view-reports").isVisible(),
        false,
      );

      // ---- Coupon list -----------------------------------------------------------------
      const couponCards = page.locator("#admin-coupon-list > article");
      await couponCards.first().waitFor();
      assert.equal(await couponCards.count(), 4);
      assert.match(
        await page.locator("#admin-coupon-summary").textContent(),
        /4件（作った日時の新しい順）/,
      );
      const welcome = page.locator(
        '#admin-coupon-list > [data-id="WELCOME2027"]',
      );
      const welcomeText = await welcome.textContent();
      assert.match(welcomeText, /使える/);
      assert.match(welcomeText, /500オパール/);
      assert.match(welcomeText, /12回 \/ 上限1,000回/);
      assert.match(welcomeText, /作ってから7日以内のアカウント/);
      assert.match(welcomeText, /\d{4}\/\d{2}\/\d{2}（.）\d{2}:\d{2} 〜 /);
      assert.match(welcomeText, /<img src=x onerror/, "the note stays text");
      assert.equal(await page.evaluate(() => window.__xss), undefined);
      const states = await couponCards.evaluateAll((cards) =>
        cards.map((card) => [card.dataset.id, card.dataset.status]),
      );
      assert.deepEqual(Object.fromEntries(states), {
        WELCOME2027: "live",
        SUMMER2026: "expired",
        PQRSTUVWXYZ2: "inactive",
        LIMITED100: "full",
      });
      const stopped = page.locator(
        '#admin-coupon-list > [data-id="PQRSTUVWXYZ2"]',
      );
      assert.match(await stopped.textContent(), /PQRS-TUVW-XYZ2/);
      assert.match(
        await stopped.textContent(),
        /2026\/11\/01（日）00:00までに作ったアカウント/,
      );
      assert.equal(
        await stopped.getByRole("button", { name: /止める/ }).count(),
        0,
      );
      assert.equal(
        await page
          .locator('#admin-coupon-list > [data-id="SUMMER2026"]')
          .getByRole("button", { name: /止める/ })
          .count(),
        0,
        "an expired coupon has nothing to stop",
      );
      const couponForm = page.locator("#admin-coupon-form");
      // The start of the period is filled with now (Japan time).
      assert.match(
        await couponForm.getByLabel("使い始め").inputValue(),
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
      );
      await noHorizontalScroll(page, `${label} coupons`);
      await shot(page, `${label}-coupons`);

      // ---- Refused before sending ------------------------------------------------------------
      await couponForm.getByLabel("クーポンコード（任意）").fill("AB");
      await couponForm.getByLabel("使える回数の上限（任意）").fill("0");
      await couponForm.getByLabel("作ってからの日数（任意）").fill("400");
      await couponForm
        .getByRole("button", { name: "内容を確かめて作る" })
        .click();
      assert.match(
        await page.locator("#admin-coupon-error").textContent(),
        /入力を確かめてください（5か所）/,
      );
      for (const [id, pattern] of [
        ["admin-coupon-code", /英数字4〜32文字/],
        ["admin-coupon-coins", /配るオパールの数を入力してください/],
        ["admin-coupon-until", /使える期限を入力してください/],
        ["admin-coupon-uses", /1〜10,000,000/],
        ["admin-coupon-days", /1〜365/],
      ]) {
        assert.equal(
          await page.locator(`#${id}`).getAttribute("aria-invalid"),
          "true",
          id,
        );
        assert.match(
          await page.locator(`#${id}-error`).textContent(),
          pattern,
          id,
        );
      }
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "admin-coupon-code",
        "the first field with a problem has the focus",
      );
      assert.equal(posts("/admin/gifts/coupons").length, 0);
      assert.equal(await dialog.isVisible(), false);
      await shot(page, `${label}-coupon-validation`);
      // Typing in a field clears its message.
      await couponForm.getByLabel("使える回数の上限（任意）").fill("");
      assert.equal(
        await page.locator("#admin-coupon-uses").getAttribute("aria-invalid"),
        null,
      );

      // ---- The server's answer is shown with its code ---------------------------------------
      await couponForm
        .getByLabel("クーポンコード（任意）")
        .fill("welcome-2027");
      await couponForm.getByLabel("配るオパールの数").fill("1,000");
      await couponForm.getByLabel("使える期限").fill(inDays(30));
      await couponForm.getByLabel("作ってからの日数（任意）").fill("");
      assert.equal(
        await page.locator("#admin-coupon-target").textContent(),
        "対象：すべてのアカウント",
      );
      await couponForm
        .getByRole("button", { name: "内容を確かめて作る" })
        .click();
      await dialog.waitFor();
      assert.match(await dialog.textContent(), /WELCOME2027/);
      assert.match(
        await dialog.textContent(),
        /1,000オパール（1アカウント1回）/,
      );
      await dialog.getByRole("button", { name: "作る", exact: true }).click();
      await page
        .locator("#admin-confirm-error")
        .filter({ hasText: "COUPON_CODE_TAKEN" })
        .waitFor();
      const takenText = await page
        .locator("#admin-confirm-error")
        .textContent();
      assert.match(takenText, /このクーポンコードはすでにあります/);
      assert.match(
        takenText,
        /サーバーの答え：このコードはすでにあります（COUPON_CODE_TAKEN）/,
      );
      assert.equal(
        posts("/admin/gifts/coupons").at(-1).body.code,
        "WELCOME2027",
      );
      await shot(page, `${label}-coupon-server-error`, { fullPage: false });
      await dialog.getByRole("button", { name: "キャンセル" }).click();
      await dialog.waitFor({ state: "hidden" });

      // ---- A generated code, copied ----------------------------------------------------------
      const until = inDays(60);
      const from = await couponForm.getByLabel("使い始め").inputValue();
      await couponForm.getByLabel("クーポンコード（任意）").fill("");
      await couponForm.getByLabel("配るオパールの数").fill("５００");
      await couponForm.getByLabel("使える回数の上限（任意）").fill("1000");
      await couponForm.getByLabel("作ってからの日数（任意）").fill("7");
      await couponForm
        .getByLabel("運営のメモ（任意・500文字まで）")
        .fill("  Xの告知  ");
      assert.equal(
        await page.locator("#admin-coupon-target").textContent(),
        "対象：作ってから7日以内のアカウント",
      );
      await couponForm.getByLabel("使える期限").fill(until);
      await couponForm
        .getByRole("button", { name: "内容を確かめて作る" })
        .click();
      await dialog.waitFor();
      assert.match(await dialog.textContent(), /自動で作ります（12文字）/);
      assert.match(await dialog.textContent(), /先着1,000回まで/);
      await dialog.getByRole("button", { name: "作る", exact: true }).click();
      await page.locator("#admin-coupon-created").waitFor();
      assert.deepEqual(posts("/admin/gifts/coupons").at(-1).body, {
        coins: 500,
        validFrom: `${from}:00+09:00`,
        validUntil: `${until}:59+09:00`,
        maxRedemptions: 1000,
        eligibility: { newAccountWithinDays: 7 },
        note: "Xの告知",
      });
      assert.equal(
        await page.locator("#admin-coupon-created-code").inputValue(),
        "ABCD-EFGH-JKMN",
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "admin-coupon-created-code",
      );
      assert.equal(
        await couponForm.getByLabel("配るオパールの数").inputValue(),
        "",
      );
      await page
        .getByRole("button", { name: "クーポンコードをコピー" })
        .click();
      await page
        .locator("#admin-coupon-created-status")
        .filter({ hasText: "コピーしました" })
        .waitFor();
      assert.deepEqual(await page.evaluate(() => window.__copied), [
        "ABCD-EFGH-JKMN",
      ]);
      assert.equal(await couponCards.count(), 5);
      assert.equal(
        await couponCards.first().getAttribute("data-id"),
        "ABCDEFGHJKMN",
      );
      await shot(page, `${label}-coupon-created`);

      // ---- Stop a coupon -------------------------------------------------------------------------
      await welcome
        .getByRole("button", { name: "クーポン WELCOME2027 を止める" })
        .click();
      await dialog.waitFor();
      assert.match(await dialog.textContent(), /元に戻せません/);
      await dialog.getByRole("button", { name: "止める", exact: true }).click();
      await page
        .locator("#admin-notice")
        .filter({ hasText: "止めました" })
        .waitFor();
      assert.equal(
        posts("/admin/gifts/coupons/WELCOME2027/deactivate").length,
        1,
      );
      assert.equal(await welcome.getAttribute("data-status"), "inactive");
      assert.equal(
        await welcome.getByRole("button", { name: /止める/ }).count(),
        0,
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.dataset.id),
        "WELCOME2027",
      );

      // ---- Presents ----------------------------------------------------------------------------
      await page.getByRole("tab", { name: "プレゼント" }).click();
      const presentCards = page.locator("#admin-present-list > article");
      await presentCards.first().waitFor();
      assert.equal(await presentCards.count(), 4);
      assert.equal(
        await page.locator("#admin-present-limit").textContent(),
        "期限前のプレゼント（表示前を含む）：2件 / 同時に20件まで",
      );
      const presentStates = await presentCards.evaluateAll((cards) =>
        cards.map((card) => card.dataset.status),
      );
      assert.deepEqual(presentStates, [
        "live",
        "scheduled",
        "inactive",
        "expired",
      ]);
      const first = presentCards.first();
      assert.match(await first.textContent(), /1周年の<b>お祝い<\/b>/);
      assert.match(await first.textContent(), /ほかの言語英語/);
      assert.match(
        await presentCards.nth(1).textContent(),
        /指定した2件のアカウント/,
      );
      await noHorizontalScroll(page, `${label} presents`);
      await shot(page, `${label}-presents`);

      // Refused before sending: bad account IDs, a body without its title.
      const present = page.locator("#admin-present-form");
      await present.getByLabel("配るオパールの数").fill("300");
      await present.getByLabel("題（80文字まで）").first().fill("お詫び");
      await present.getByLabel("受け取りの期限").fill(inDays(14));
      await present
        .getByLabel("アカウントを指定する（任意・100件まで）")
        .fill(`${USER_A}\n${USER_A}, n123`);
      assert.match(
        await page.locator("#admin-present-accounts-count").textContent(),
        /1件（重なりは1件に数えます）・形の違うもの1件/,
      );
      await page.locator("#admin-present-langs-box summary").click();
      await page
        .locator("#admin-present-ko-body")
        .fill("불편을 드려 죄송합니다.");
      await page.locator("#admin-present-langs-box summary").click();
      await present.getByRole("button", { name: "内容を確かめて作る" }).click();
      assert.match(
        await page.locator("#admin-present-accounts-error").textContent(),
        /n123/,
      );
      assert.match(
        await page.locator("#admin-present-ko-title-error").textContent(),
        /韓国語の題を入力してください/,
      );
      assert.equal(
        await page.locator("#admin-present-langs-box").evaluate((d) => d.open),
        true,
        "the languages open to show their problem",
      );
      assert.equal(posts("/admin/gifts/presents").length, 0);
      await shot(page, `${label}-present-validation`);

      // The 20-present limit, as the server answers it.
      await present
        .getByLabel("アカウントを指定する（任意・100件まで）")
        .fill(`${USER_A}\n${USER_B}`);
      await page.locator("#admin-present-ko-title").fill("점검 사과");
      await page
        .locator("#admin-present-en-title")
        .fill("Sorry for the maintenance");
      assert.match(
        await page.locator("#admin-present-target").textContent(),
        /対象：指定した2件のアカウント/,
      );
      backend.forceLimit = true;
      await present.getByRole("button", { name: "内容を確かめて作る" }).click();
      await dialog.waitFor();
      assert.match(await dialog.textContent(), /英語・韓国語/);
      await dialog.getByRole("button", { name: "作って届ける" }).click();
      await page
        .locator("#admin-confirm-error")
        .filter({ hasText: "PRESENT_LIMIT_REACHED" })
        .waitFor();
      assert.match(
        await page.locator("#admin-confirm-error").textContent(),
        /同時に配れるプレゼントは20件までです/,
      );
      await shot(page, `${label}-present-server-error`, { fullPage: false });

      // A double click sends one request.
      backend.forceLimit = false;
      backend.delay = 400;
      const submit = dialog.getByRole("button", { name: "作って届ける" });
      await submit.click();
      await submit.click({ force: true }).catch(() => {});
      await dialog.waitFor({ state: "hidden" });
      backend.delay = 0;
      await page
        .locator("#admin-notice")
        .filter({ hasText: "作りました" })
        .waitFor();
      const sent = posts("/admin/gifts/presents");
      assert.equal(sent.filter((e) => e.status === 200).length, 1);
      assert.equal(sent.length, 2, "the refused try and one more");
      assert.deepEqual(sent.at(-1).body.translations, {
        en: { title: "Sorry for the maintenance", body: "" },
        ko: { title: "점검 사과", body: "불편을 드려 죄송합니다." },
      });
      assert.deepEqual(sent.at(-1).body.eligibility, {
        accountIds: [USER_A, USER_B],
      });
      assert.match(sent.at(-1).body.claimUntil, /:59\+09:00$/);
      assert.equal(await presentCards.count(), 5);
      assert.equal(
        await page.evaluate(
          () => document.activeElement.closest("article")?.dataset.status,
        ),
        "live",
        "the new present's card has the focus",
      );
      assert.equal(
        await page.locator("#admin-present-limit").textContent(),
        "期限前のプレゼント（表示前を含む）：3件 / 同時に20件まで",
      );
      assert.equal(
        await present.getByLabel("題（80文字まで）").first().inputValue(),
        "",
      );
      assert.equal(
        await page.locator("#admin-present-langs-box").evaluate((d) => d.open),
        false,
      );

      // Stop a present.
      const birthday = page.locator(
        '#admin-present-list > [data-id="000000001aaaaaaaa"]',
      );
      await birthday.getByRole("button", { name: /を止める$/ }).click();
      await dialog.getByRole("button", { name: "止める", exact: true }).click();
      await page
        .locator("#admin-notice")
        .filter({ hasText: /プレゼント「.*」を止めました/ })
        .waitFor();
      assert.equal(await birthday.getAttribute("data-status"), "inactive");
      assert.match(
        await page.locator("#admin-present-limit").textContent(),
        /：2件 \//,
      );
      await noHorizontalScroll(page, `${label} presents after`);

      // ---- Sign out: lists, forms and the code leave with the sign-in ------------------------------
      await page.getByRole("tab", { name: "クーポン" }).click();
      await page
        .getByLabel("運営のメモ（任意・500文字まで）")
        .first()
        .fill("書きかけ");
      await page.getByRole("button", { name: "ログアウト" }).click();
      await page
        .locator("#admin-sign-in-status")
        .filter({ hasText: "ログアウトしました" })
        .waitFor();
      assert.deepEqual(
        await page.evaluate(() => [
          document.querySelectorAll(
            "#admin-coupon-list > *, #admin-present-list > *",
          ).length,
          document.getElementById("admin-coupon-note").value,
          document.getElementById("admin-coupon-created-code").value,
          document.getElementById("admin-coupon-created").hidden,
        ]),
        [0, "", "", true],
      );
      assert.deepEqual(
        problems.filter((p) => !/status of 409/.test(p)),
        [],
        label,
      );
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            label,
            problems,
            couponError: await page
              .locator("#admin-coupon-error")
              .textContent(),
            presentError: await page
              .locator("#admin-present-error")
              .textContent(),
            dialogError: await page
              .locator("#admin-confirm-error")
              .textContent(),
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

  // ---- 360px: the forms and the tabs fit ---------------------------------------------------------
  {
    const tokens = [fakeToken(9)];
    const backend = makeBackend(tokens);
    const context = await browser.newContext({
      viewport: { width: 360, height: 780 },
    });
    const page = await context.newPage();
    if (!external)
      await page.route(`${base}/api/admin/config`, (route) =>
        route.fulfill({ status: 200, json: config }),
      );
    await page.route("https://accounts.google.com/gsi/client", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: gisScript(tokens),
      }),
    );
    await page.route(`${apiOrigin}/**`, backend.route);
    await page.goto(`${base}/admin/#presents`);
    await page
      .getByRole("button", { name: "テスト用のGoogleログイン" })
      .click();
    await page.locator("#admin-present-list > article").first().waitFor();
    assert.equal(
      await page
        .getByRole("tab", { name: "プレゼント" })
        .getAttribute("aria-selected"),
      "true",
      "the address keeps the view",
    );
    await page.locator("#admin-present-langs-box summary").click();
    await noHorizontalScroll(page, "360 presents");
    await page.getByRole("tab", { name: "クーポン" }).click();
    await page.locator("#admin-coupon-list > article").first().waitFor();
    await noHorizontalScroll(page, "360 coupons");
    await context.close();
    cases++;
  }
  console.log(
    `Admin coupon and present views passed in ${cases} cases (${external ? "wrangler dev, CSP enforced" : "static server"})`,
  );
} finally {
  await browser.close();
  server?.close();
}
