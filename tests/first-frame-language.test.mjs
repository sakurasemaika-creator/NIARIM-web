import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// /features/ builds its screen mocks from markup written in Japanese and
// translated a moment later. The page laid that Japanese out first, so English
// and Spanish visitors downloaded parts of the Japanese text font for words
// they never saw. The mocks are now translated before they are inserted.
const root = path.resolve(import.meta.dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

function element(attrs, text = "") {
  return {
    attrs: { ...attrs },
    textContent: text,
    getAttribute(name) {
      return this.attrs[name] ?? null;
    },
    setAttribute(name, value) {
      this.attrs[name] = String(value);
    },
    matches(selector) {
      const name = selector.slice(1, -1);
      return name in this.attrs;
    },
  };
}

function i18nWithDictionary(lang, dictionary) {
  const html = element({ lang });
  Object.defineProperty(html, "lang", { get: () => html.attrs.lang });
  const document = {
    documentElement: html,
    body: element({}),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => element({}),
  };
  const window = { NIARIM_I18N_DICT: dictionary, location: { href: "" } };
  vm.runInContext(
    read("public", "js", "i18n.js"),
    vm.createContext({ window, document, URL }),
  );
  return window.NIARIM_I18N;
}

test("localize() translates markup that is not in the page yet", () => {
  const i18n = i18nWithDictionary("en", {
    ja: { "fd.layers": "レイヤー", "fd.add": "追加" },
    en: { "fd.layers": "Layers", "fd.add": "Add" },
  });
  const label = element({ "data-i18n": "fd.layers" }, "レイヤー");
  const button = element({ "data-i18n-attr": "aria-label:fd.add" });
  const wrap = element({ "data-i18n": "fd.layers" }, "レイヤー");
  wrap.querySelectorAll = (selector) =>
    [label, button].filter((el) => el.matches(selector));
  i18n.localize(wrap);
  assert.equal(label.textContent, "Layers");
  assert.equal(wrap.textContent, "Layers", "the root itself too");
  assert.equal(button.getAttribute("aria-label"), "Add");
});

test("main.js translates each mock before inserting it", () => {
  const main = read("public", "js", "main.js");
  const build = main.match(
    /function htmlToElement\(html\) \{([\s\S]*?)\n {2}\}/,
  )?.[1];
  assert.ok(build, "htmlToElement is there");
  assert.ok(
    build.includes("localizeMock(wrap)") &&
      build.indexOf("localizeMock(wrap)") <
        build.indexOf("return wrap.firstElementChild"),
    "translated before it is returned for insertion",
  );
  assert.match(
    main,
    /hero\.innerHTML = canvasContents\(null\);\s*localizeMock\(hero\);/,
  );
});
