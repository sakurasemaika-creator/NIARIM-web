// The app captures exist in every page language, and the Worker and the
// browser pick the same file for a page language (src/capture-url.js and
// captureUrl in public/js/i18n.js).
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  CAPTURE_LANGS,
  CAPTURE_URL,
  localizedCaptureUrl,
} from "../src/capture-url.js";

const dir = new URL("../public/assets/images/app-captures/", import.meta.url);
const screens = [
  "canvas",
  "layers",
  "onion-skin",
  "timeline",
  "audio-editor",
  "save-tree",
  "export",
  "workspace",
  "widget",
];

test("every capture exists in every page language", () => {
  const missing = [];
  for (const screen of screens)
    for (const pc of ["", "pc-"])
      for (const variant of ["", "-v2", "-v3", "-v4"])
        for (const lang of ["", ...CAPTURE_LANGS.map((l) => "-" + l)])
          for (const ext of [".webp", ".avif"]) {
            const name = pc + screen + variant + lang + ext;
            if (!fs.existsSync(new URL(name, dir))) missing.push(name);
          }
  assert.deepEqual(missing, []);
});

test("a capture URL takes the page language, Japanese keeps the plain name", () => {
  const url = "/assets/images/app-captures/pc-canvas-v2.webp?v=1";
  assert.equal(localizedCaptureUrl(url, "ja"), url);
  assert.equal(
    localizedCaptureUrl(url, "zh-Hant"),
    "/assets/images/app-captures/pc-canvas-v2-zh-Hant.webp?v=1",
  );
  assert.equal(
    localizedCaptureUrl("/assets/images/app-captures/onion-skin-en.avif", "ko"),
    "/assets/images/app-captures/onion-skin-ko.avif",
  );
  // Other captures (the Work Plaza: plaza-v2-<lang>.webp, chosen through the
  // dictionary's img.plaza) are left alone by this rule.
  const plaza = "/assets/images/app-captures/plaza-v2-ja.webp";
  assert.equal(localizedCaptureUrl(plaza, "en"), plaza);
});

test("the browser uses the same rule as the Worker", () => {
  const i18n = fs.readFileSync(
    new URL("../public/js/i18n.js", import.meta.url),
    "utf8",
  );
  assert.ok(i18n.includes(CAPTURE_URL.source), "same capture pattern");
  assert.ok(
    i18n.includes(JSON.stringify(CAPTURE_LANGS).replace(/,/g, ", ")),
    "same languages",
  );
});
