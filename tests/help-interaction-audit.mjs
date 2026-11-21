import assert from "node:assert/strict";
import { chromium } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const base = process.env.NIARIM_AUDIT_BASE_URL || "http://127.0.0.1:8787";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const browser = await chromium.launch(launchOptions());
let passed = 0;

try {
  for (const language of languages) {
    for (const mode of ["pc", "sp"]) {
      const context = await browser.newContext({
        viewport: { width: mode === "pc" ? 1280 : 320, height: 900 },
        isMobile: mode === "sp",
        hasTouch: mode === "sp",
        locale: language,
        reducedMotion: "reduce",
      });
      try {
        const page = await context.newPage();
        await page.goto(`${base}/help/?lang=${language}`, {
          waitUntil: "networkidle",
        });
        await page.waitForFunction(
          (lang) => document.documentElement.lang === lang,
          language,
        );
        const input = page.locator("#help-search-input");
        const categoryOrder = () => page.locator("[data-help-category]").evaluateAll(nodes => nodes.map(el => el.id));
        const topicOrder = () => page.locator("[data-help-card] h3").evaluateAll(nodes => nodes.map(el => el.dataset.i18n));
        const originalCategories = await categoryOrder();
        const originalTopics = await topicOrder();
        const symbols = await page.locator("[data-help-category] .feature-section-icon use")
          .evaluateAll(nodes => nodes.map(el => el.getAttribute("href")));
        assert.equal(new Set(symbols).size, originalCategories.length);
        const resultCount = page.locator("#help-result-count");
        const pressure = await page.locator('[data-i18n="help.entry34.title"]').innerText();
        await input.fill(pressure);
        const visibleTopics = page.locator("[data-help-card]:visible");
        assert.equal(await visibleTopics.first().locator("h3").innerText(), pressure);
        assert.ok(await visibleTopics.first().locator("p").isVisible());
        assert.equal(await page.locator("[data-help-card][open]").count(), 1);
        const countFormat = await page.evaluate(lang => window.NIARIM_I18N.translate(lang, "help.resultCount"), language);
        assert.equal(await resultCount.innerText(), countFormat.replace("{count}", String(await visibleTopics.count())));
        assert.ok(await input.evaluate(el => el === document.activeElement));
        await input.press("Escape");
        assert.equal(await resultCount.textContent(), "");
        assert.deepEqual(await categoryOrder(), originalCategories);
        assert.deepEqual(await topicOrder(), originalTopics);
        const category = page.locator("#help-save");
        const title = (
          await category.locator("[data-help-card] h3").first().textContent()
        ).trim();
        assert.ok(title.length > 0);

        await input.fill(title);
        assert.ok(
          await category.isVisible(),
          `${language}/${mode}: localized search`,
        );
        const heading = (await category.locator("h2").textContent()).trim();
        const firstTopic = category.locator("[data-help-card]").first();
        const summary = firstTopic.locator("summary");
        const clear = page.locator("#help-search-clear");
        for (const query of [title + "　" + heading, heading + "  " + title]) {
          await input.fill(query);
          assert.ok(await firstTopic.isVisible());
          if (!(await firstTopic.locator("p").isVisible())) {
            await summary.press("Enter");
          }
          assert.ok(await firstTopic.locator("p").isVisible());
        }
        await clear.press("Enter");
        assert.equal(await input.inputValue(), "");
        assert.ok(await input.evaluate((el) => el === document.activeElement));
        await summary.press("Enter");
        assert.ok(await firstTopic.locator("p").isVisible());
        await firstTopic.locator("p").click();
        assert.ok(await firstTopic.locator("p").isVisible());
        await input.fill(title + " zz-niarim-missing");
        assert.ok(await page.locator("#help-no-results").isVisible());
        await input.press("Escape");
        assert.equal(await input.inputValue(), "");
        assert.ok(await firstTopic.locator("p").isVisible());
        await summary.press("Space");
        assert.equal(await firstTopic.locator("p").isVisible(), false);
        const cardCount = await category.locator("[data-help-card]").count();
        await input.fill(heading);
        assert.equal(
          await category.locator("[data-help-card]:visible").count(),
          cardCount,
          `${language}/${mode}: a category name matches every entry it contains`,
        );

        assert.ok(await page.locator("[data-help-card][open]").count() <= 1);
        assert.equal(await resultCount.innerText(), countFormat.replace("{count}", String(await visibleTopics.count())));
        const folded = page.locator("#help-brush");
        await input.fill("ブラシ");
        if (language === "ja") {
          const active = await folded
            .locator("[data-help-card]:visible")
            .count();
          assert.ok(active > 0);
          for (const query of ["ぶらし", "ﾌﾞﾗｼ"]) {
            await input.fill(query);
            assert.equal(
              await folded.locator("[data-help-card]:visible").count(),
              active,
            );
          }
        }
        const text = await page.locator("[data-help-card]").allTextContents();
        const asciiQuery = text.join(" ").match(/[a-z0-9]{2,}/i)?.[0];
        assert.ok(
          asciiQuery,
          `${language}/${mode}: search fixture contains letters or digits`,
        );
        const widthQuery = asciiQuery.replace(/[a-z0-9]/gi, (letter) =>
          String.fromCharCode(letter.charCodeAt(0) + 0xfee0),
        );
        await input.fill(widthQuery);
        const wideResults = await page
          .locator("[data-help-card]:visible")
          .count();
        assert.ok(
          wideResults > 0,
          `${language}/${mode}: full-width query finds the matching Help entry`,
        );
        await input.fill(asciiQuery.toLowerCase());
        assert.equal(
          await page.locator("[data-help-card]:visible").count(),
          wideResults,
        );

        await input.fill("zz-niarim-audit-no-match");
        assert.equal(
          await page.locator("[data-help-category]:visible").count(),
          0,
        );
        assert.ok(await page.locator("#help-no-results").isVisible());

        const link = page.locator('.feature-nav a[href="#help-save"]');
        if (mode === "sp") await link.tap();
        else await link.press("Enter");
        assert.equal(
          await input.inputValue(),
          "",
          `${language}/${mode}: category clears search`,
        );
        assert.ok(await category.isVisible());
        assert.equal(await page.locator("#help-no-results").isVisible(), false);
        await page.waitForFunction(() => {
          const heading = document.querySelector("#help-save h2");
          const rect = heading.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });
        assert.equal(new URL(page.url()).hash, "#help-save");
        passed++;
        console.log(
          `PASS help search and category navigation: ${language}/${mode}`,
        );
      } finally {
        await context.close();
      }
    }
  }

  const page = await browser.newPage();
  try {
    const requested = [];
    page.on("request", (request) => {
      const topic = new URL(request.url()).pathname.match(
        /^\/js\/help-topics\/(.+)\.json$/,
      );
      if (topic) requested.push(topic[1]);
    });
    let rejectFrench = true;
    await page.route("**/js/help-topics/fr.json", (route) =>
      rejectFrench
        ? route.fulfill({ status: 503, body: "" })
        : route.continue(),
    );
    await page.goto(`${base}/help/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.documentElement.lang === "en");
    const heading = page.locator('[data-i18n="help.entry1.title"]');
    const initialTitle = await heading.textContent();
    assert.deepEqual(requested, ["en"]);

    async function selectLanguage(lang) {
      await page.locator("[data-lang-trigger]").click();
      await page.locator(`[data-lang-switch="${lang}"]`).click();
      await page.waitForFunction(
        (lang) => document.documentElement.lang === lang,
        lang,
      );
    }

    assert.equal(
      await page.evaluate(() =>
        window.NIARIM_I18N.applyLang("fr", { syncUrl: true }),
      ),
      "en",
    );
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await heading.textContent(), initialTitle);
    assert.equal(new URL(page.url()).searchParams.get("lang"), null);

    rejectFrench = false;
    await selectLanguage("fr");
    assert.equal(await page.locator("html").getAttribute("lang"), "fr");
    assert.notEqual(await heading.textContent(), initialTitle);
    assert.equal(new URL(page.url()).searchParams.get("lang"), "fr");

    await selectLanguage("en");
    assert.equal(await heading.textContent(), initialTitle);
    assert.deepEqual(requested, ["en", "fr", "fr"]);
    console.log("PASS Help loads one locale on demand, retries, and reuses it");
  } finally {
    await page.close();
  }
} finally {
  await browser.close();
}

assert.equal(passed, 14);
console.log(`Help interaction audit passed: ${passed}/14`);
