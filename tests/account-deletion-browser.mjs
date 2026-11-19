import assert from "node:assert/strict";
import { chromium, devices } from "playwright";
import { launchOptions } from "./browser-launch.mjs";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browser = await chromium.launch(launchOptions());
const languages = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
const nonce = "a".repeat(64);
const receipt = "b".repeat(64);
let cases = 0;

try {
  for (const lang of languages) {
    for (const viewport of [
      devices["Pixel 7"],
      { viewport: { width: 1440, height: 1000 } },
    ]) {
      const context = await browser.newContext({ ...viewport });
      try {
        const page = await context.newPage();
        let submissions = 0;
        await page.route("https://accounts.google.com/gsi/client", (route) =>
          route.fulfill({
            contentType: "application/javascript",
            body: `window.google = { accounts: { id: {
            initialize(options) { this.callback = options.callback; },
            renderButton(mount) {
              const button = document.createElement("button");
              button.textContent = "Test Google sign-in";
              button.onclick = () => this.callback({ credential: "test-credential" });
              mount.append(button);
            }
          } } };`,
          }),
        );
        await page.route("**/api/account-deletion/*", async (route) => {
          const request = route.request();
          const action = new URL(request.url()).pathname.split("/").at(-1);
          if (action === "challenge")
            return route.fulfill({
              json: { clientId: "test.apps.googleusercontent.com", nonce },
            });
          if (action === "verify") {
            assert.equal(
              request.headers().authorization,
              "Bearer test-credential",
            );
            assert.deepEqual(request.postDataJSON(), { nonce });
            return route.fulfill({
              json: { email: "audit@example.invalid", state: "ready" },
            });
          }
          if (action === "submit") {
            submissions++;
            assert.deepEqual(request.postDataJSON(), { nonce, confirm: true });
            return route.fulfill({
              status: 202,
              json: { state: "pending", receipt },
            });
          }
          assert.equal(action, "status");
          assert.deepEqual(request.postDataJSON(), { receipt });
          assert.equal(request.headers().authorization, undefined);
          return route.fulfill({ json: { state: "complete" } });
        });
        await page.goto(`${baseUrl}/privacy/?lang=${lang}`);
        await page.locator('main a[href^="/account-deletion/"]').click();
        await page.getByRole("button", { name: "Test Google sign-in" }).click();
        await page.locator("#delete-email").waitFor();
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(
          await page.locator("#delete-email").textContent(),
          "audit@example.invalid",
        );
        assert.equal(await page.locator("#delete-submit").isDisabled(), true);
        assert.equal(submissions, 0);
        await page.locator("#delete-understood").check();
        await page.locator("#delete-submit").click();
        await page
          .locator('#delete-status[data-i18n="accountDeletion.complete"]')
          .waitFor();
        assert.equal(submissions, 1);
        assert.equal(await page.locator("#delete-confirm").isVisible(), false);
        cases++;
      } finally {
        await context.close();
      }
    }
  }
  console.log(`Account deletion confirmation passed in ${cases} cases`);
} finally {
  await browser.close();
}
