import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, devices } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const output = "artifacts/autonomous-browser-audit/contact";
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const browser = await chromium.launch(launchOptions());
await fs.mkdir(output, { recursive: true });
const findings = [];
let passed = 0;

for (const lang of languages) {
  for (const mode of ["pc", "sp"]) {
    for (const hasX of [false, true]) {
      const context = await browser.newContext({
        ...(mode === "sp"
          ? devices["Pixel 7"]
          : { viewport: { width: 1440, height: 1000 } }),
        locale: lang,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const caseName = `${lang}-${mode}-x-${hasX}`;
      const requests = [];
      let result = { status: 200 };
      let responseGate = Promise.resolve();
      // Every submission is intercepted. This suite must never deliver mail.
      await page.route("**/api/contact", async (route) => {
        requests.push(route.request());
        await responseGate;
        if (result.abort) return route.abort("failed");
        return route.fulfill({
          status: result.status,
          contentType: result.html ? "text/html" : "application/json",
          body: result.html
            ? "<h1>Maintenance</h1>"
            : JSON.stringify(
                result.status === 200 ? { ok: true } : { error: "test" },
              ),
        });
      });
      if (hasX) {
        await page.route("**/js/config.js", (route) =>
          route.fulfill({
            contentType: "application/javascript",
            body: 'window.NIARIM_CONFIG = { X_URL: "https://example.invalid/niarim", GOOGLE_PLAY_URL: "https://play.google.com/store/apps/details?id=com.niarim.niarim", GOOGLE_PLAY_BADGE_LANGS: [] };',
          }),
        );
      }
      try {
        await page.goto(`${baseURL}/contact/?lang=${lang}`, {
          waitUntil: "networkidle",
        });
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        const lead = page.locator("[data-contact-lead]");
        assert.equal(
          await lead.getAttribute("data-i18n"),
          hasX ? "contact.lead" : "meta.contact.description",
        );
        assert.ok(
          (await lead.textContent()).trim().length > 10,
          "intro must not be blank",
        );
        assert.equal(await page.locator(".contact-channel").isVisible(), hasX);
        assert.equal(
          await page.locator(".contact-personal-note").isVisible(),
          hasX,
        );
        if (hasX)
          assert.equal(
            await page.locator("#contact-x-link").getAttribute("href"),
            "https://example.invalid/niarim",
          );

        const button = page.locator("#submit-btn");
        await button.click();
        assert.equal(
          await page.evaluate(() => document.activeElement.id),
          "name",
        );
        for (const id of ["name", "email", "message", "agree"]) {
          assert.equal(
            await page.locator(`#${id}`).getAttribute("aria-invalid"),
            "true",
          );
        }
        assert.equal(requests.length, 0);

        const fill = async () => {
          await page.locator("#name").fill("Audit tester");
          await page.locator("#email").fill("audit@example.invalid");
          await page
            .locator("#message")
            .fill(`NIARIM ${lang} contact regression`);
          await page.locator("#agree").check();
        };
        await fill();
        const message = page.locator("#message");
        const longDraft = "a".repeat(1001);
        await message.fill(longDraft);
        assert.equal(await message.inputValue(), longDraft);
        assert.equal(await message.getAttribute("aria-invalid"), "true");
        assert.match(
          await page.locator("#message-count").textContent(),
          /1.?001/,
        );
        await button.click();
        assert.equal(requests.length, 0);
        await fill();

        await page.locator("#attachments").setInputFiles({
          name: "unsupported.html",
          mimeType: "text/html",
          buffer: Buffer.from("test"),
        });
        await button.click();
        assert.equal(
          await page.evaluate(() => document.activeElement.id),
          "attachments-trigger",
        );
        assert.equal(
          await page
            .locator("#attachments-trigger")
            .getAttribute("aria-invalid"),
          "true",
        );
        assert.equal(requests.length, 0);
        const attachmentError = page
          .locator("#attachments")
          .locator("xpath=ancestor::*[contains(@class,'form-row')]")
          .locator(".form-error");
        assert.match(await attachmentError.textContent(), /unsupported[.]html/);
        assert.equal(
          await attachmentError.getAttribute("data-error-key"),
          "contact.error.attachmentFormat",
        );

        const image = {
          name: "drawing.png",
          mimeType: "image/png",
          buffer: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz9sAAAAASUVORK5CYII=",
            "base64",
          ),
        };
        await page
          .locator("#attachments")
          .setInputFiles([image, image, image, image]);
        await button.click();
        assert.equal(
          requests.length,
          0,
          "four attachments must not be submitted",
        );
        assert.equal(
          await attachmentError.getAttribute("data-error-key"),
          "contact.error.attachmentCount",
        );
        await page.locator("#attachments").setInputFiles([
          image,
          {
            name: "too-big.png",
            mimeType: "image/png",
            buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
          },
        ]);
        assert.equal(
          await attachmentError.getAttribute("data-error-key"),
          "contact.error.attachmentSize",
        );
        assert.match(await attachmentError.textContent(), /too-big[.]png/);
        await page
          .locator("#attachments-list li")
          .last()
          .getByRole("button")
          .click();
        assert.deepEqual(
          await page.locator("#attachments-list li span").allTextContents(),
          [image.name],
        );
        assert.equal(
          await page
            .locator("#attachments-trigger")
            .getAttribute("aria-invalid"),
          null,
        );

        let release;
        responseGate = new Promise((resolve) => {
          release = resolve;
        });
        const sent = page.waitForRequest("**/api/contact");
        await button.click();
        await sent;
        assert.equal(await button.isDisabled(), true);
        for (const id of [
          "type",
          "name",
          "email",
          "message",
          "agree",
          "attachments-trigger",
        ]) {
          assert.equal(await page.locator(`#${id}`).isDisabled(), true);
        }
        assert.equal(
          await page.locator("#attachments-list button").isDisabled(),
          true,
        );
        assert.equal(
          await button.locator("span").getAttribute("data-i18n"),
          "contact.form.submitting",
        );
        // Keyboard/programmatic form submission must also respect the in-flight guard.
        await page
          .locator("#contact-form")
          .evaluate((form) => form.requestSubmit());
        release();
        await page.waitForSelector("#form-status.is-success");
        await page.waitForSelector("#submit-btn:not([disabled])");
        assert.equal(
          requests.length,
          1,
          "one in-flight submission must produce one request",
        );
        const request = requests[0];
        const submitted = await new Request(request.url(), {
          method: request.method(),
          headers: request.headers(),
          body: request.postDataBuffer(),
        }).formData();
        assert.equal(submitted.get("email"), "audit@example.invalid");
        assert.equal(submitted.getAll("attachments").length, 1);
        assert.equal(submitted.get("attachments").name, image.name);
        for (const id of ["name", "email", "message"])
          assert.equal(await page.locator(`#${id}`).inputValue(), "");
        assert.equal(await page.locator("#agree").isChecked(), false);
        assert.equal(await page.locator("#attachments-list li").count(), 0);
        assert.match(
          await page.locator("#message-count").textContent(),
          /^0 \//,
        );
        assert.equal(
          await page
            .locator("#attachments")
            .evaluate((input) => input.files.length),
          0,
        );
        assert.equal(
          await button.locator("span").getAttribute("data-i18n"),
          "contact.form.submit",
        );

        responseGate = Promise.resolve();
        await fill();
        for (const failure of [
          { status: 200, html: true },
          { status: 429 },
          { status: 500 },
          { abort: true },
        ]) {
          result = failure;
          const expected =
            failure.status === 429
              ? "contact.status.rateLimitBody"
              : "contact.status.errorBody";
          await button.click();
          await page.waitForSelector(
            `#form-status.is-error p[data-i18n="${expected}"]`,
          );
          await page.waitForSelector("#submit-btn:not([disabled])");
          assert.equal(
            await page.locator("#email").inputValue(),
            "audit@example.invalid",
          );
          assert.equal(
            await page.locator("#message").inputValue(),
            `NIARIM ${lang} contact regression`,
          );
          const errorText = (
            await page.locator("#form-status p").textContent()
          ).trim();
          // Valid Chinese copy is only eight characters; length is not a
          // language-independent test for a missing translation.
          assert.ok(errorText.length > 0, `${expected} must not be blank`);
          assert.notEqual(
            errorText,
            expected,
            "translation key must not leak into the UI",
          );
        }
        result = { status: 413 };
        await page.locator("#attachments").setInputFiles(image);
        await button.click();
        await page.waitForSelector(
          '[data-error-key="contact.error.attachmentTotal"]',
        );
        assert.equal(
          await page.evaluate(() => document.activeElement.id),
          "attachments-trigger",
        );
        assert.equal(await message.isEnabled(), true);
        assert.equal(await page.locator("#attachments-list li").count(), 1);
        assert.equal(requests.length, 6);
        if (!hasX && ["fr", "es"].includes(lang))
          await page.screenshot({
            path: `${output}/${caseName}.png`,
            fullPage: true,
          });
        passed++;
      } catch (error) {
        findings.push({ caseName, message: error.message, stack: error.stack });
        await page.screenshot({
          path: `${output}/${caseName}-failure.png`,
          fullPage: true,
        });
      } finally {
        await context.close();
      }
    }
  }
}
await browser.close();
const report = { passed, total: 28, findings };
await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exitCode = 1;
