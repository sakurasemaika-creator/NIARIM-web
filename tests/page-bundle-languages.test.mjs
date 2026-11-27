import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// The Worker gives each page the translations of its own language only
// (public/js/generated/i18n-<page>.<lang>.js, about a seventh of the bundle
// with every language), and i18n.js fetches another language's file when the
// visitor switches. These tests keep the files and the switch equivalent to
// the bundle with every language.
const root = path.resolve(import.meta.dirname, "..");
const generatedDir = path.join(root, "public", "js", "generated");
const langs = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];

// Values made in a vm context have that context's prototypes.
const plain = (value) => JSON.parse(JSON.stringify(value));

function run(file, window) {
  vm.runInContext(
    fs.readFileSync(path.join(generatedDir, file), "utf8"),
    vm.createContext({ window }),
  );
  return window;
}

function pages() {
  return fs
    .readdirSync(generatedDir)
    .filter((file) => /^i18n-[\w-]+\.js$/.test(file))
    .map((file) => file.slice("i18n-".length, -".js".length));
}

test("each language's file holds that language of the page bundle", () => {
  execFileSync(process.execPath, ["tools/generate-seo-i18n.mjs"], {
    cwd: root,
    stdio: "ignore",
  });
  const all = pages();
  assert.ok(all.length >= 13, `only ${all.length} bundles`);
  for (const page of all) {
    const every = run(`i18n-${page}.js`, {
      NIARIM_I18N_DICT: {},
    }).NIARIM_I18N_DICT;
    for (const lang of langs) {
      const window = run(`i18n-${page}.${lang}.js`, {});
      assert.deepEqual(
        plain(Object.keys(window.NIARIM_I18N_DICT)),
        [lang],
        `${page}.${lang}: only its own language`,
      );
      assert.deepEqual(
        plain(window.NIARIM_I18N_DICT[lang]),
        plain(every[lang]),
        `${page}.${lang}: same table as the bundle with every language`,
      );
      assert.equal(window.NIARIM_I18N_PAGE_BUNDLE.page, page);
      assert.deepEqual(plain(window.NIARIM_I18N_PAGE_BUNDLE.loaded), {
        [lang]: true,
      });
    }
  }
});

test("a language loaded later keeps the overrides scripts made before it", () => {
  // user-request-fixes.js runs after the page's bundle and sets some keys
  // for every language. A language fetched later must not put the bundle's
  // value back over them.
  const window = run("i18n-home.ja.js", {});
  window.NIARIM_I18N_DICT.fr = { "nav.features": "override" };
  run("i18n-home.fr.js", window);
  assert.equal(window.NIARIM_I18N_DICT.fr["nav.features"], "override");
  assert.ok(window.NIARIM_I18N_DICT.fr["nav.community"]);
  assert.deepEqual(plain(window.NIARIM_I18N_PAGE_BUNDLE.loaded), {
    ja: true,
    fr: true,
  });
});

// A small stand-in for the parts of the DOM that i18n.js touches.
function fakePage(initialLang, loadedLangs, dictionary) {
  const appended = [];
  const listeners = {};
  const html = {
    attrs: { lang: initialLang },
    getAttribute(name) {
      return this.attrs[name] ?? null;
    },
    setAttribute(name, value) {
      this.attrs[name] = String(value);
    },
    removeAttribute(name) {
      delete this.attrs[name];
    },
    get lang() {
      return this.attrs.lang;
    },
  };
  const heading = {
    textContent: "",
    getAttribute: (name) => (name === "data-i18n" ? "nav.features" : null),
  };
  const document = {
    documentElement: html,
    body: { getAttribute: () => null },
    head: {
      appendChild(script) {
        appended.push(script);
      },
    },
    cookie: "",
    querySelector: () => null,
    querySelectorAll(selector) {
      return selector === "[data-i18n]" ? [heading] : [];
    },
    createElement: () => ({ remove() {} }),
    addEventListener(type, fn) {
      (listeners[type] = listeners[type] || []).push(fn);
    },
    dispatchEvent() {},
  };
  const window = {
    NIARIM_INITIAL_LOCALE: initialLang,
    location: { href: "https://example.test/", protocol: "https:" },
    history: { replaceState() {} },
  };
  if (dictionary) window.NIARIM_I18N_DICT = dictionary;
  for (const lang of loadedLangs) run(`i18n-home.${lang}.js`, window);
  const context = vm.createContext({
    window,
    document,
    URL,
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init && init.detail;
      }
    },
    NodeFilter: { SHOW_TEXT: 4 },
    getComputedStyle: () => ({ display: "block" }),
  });
  vm.runInContext(
    fs.readFileSync(path.join(root, "public", "js", "i18n.js"), "utf8"),
    context,
  );
  return { window, document, html, heading, appended, listeners };
}

test("switching to a language that is not loaded fetches its file first", async () => {
  const page = fakePage("ja", ["ja"]);
  page.listeners.DOMContentLoaded.forEach((fn) => fn());
  const ja = page.window.NIARIM_I18N_DICT.ja["nav.features"];
  assert.equal(page.heading.textContent, ja);

  const switching = page.window.NIARIM_I18N.applyLang("fr");
  assert.equal(page.appended.length, 1, "the French file is requested");
  assert.equal(page.appended[0].src, "/js/generated/i18n-home.fr.js");
  assert.equal(page.html.lang, "ja", "nothing changes before it arrives");
  assert.equal(page.heading.textContent, ja);

  run("i18n-home.fr.js", page.window);
  page.appended[0].onload();
  assert.equal(await switching, "fr");
  assert.equal(page.html.lang, "fr");
  assert.equal(
    page.heading.textContent,
    page.window.NIARIM_I18N_DICT.fr["nav.features"],
  );

  // A loaded language switches at once, without another request.
  assert.equal(page.window.NIARIM_I18N.applyLang("ja"), "ja");
  assert.equal(page.appended.length, 1);
  assert.equal(page.heading.textContent, ja);
});

test("a failed fetch keeps the language on screen and can be retried", async () => {
  const page = fakePage("en", ["en"]);
  page.listeners.DOMContentLoaded.forEach((fn) => fn());
  const first = page.window.NIARIM_I18N.applyLang("ko");
  page.appended[0].onerror();
  assert.equal(await first, "en");
  assert.equal(page.html.lang, "en");

  const second = page.window.NIARIM_I18N.applyLang("ko");
  assert.equal(page.appended.length, 2, "picking it again retries");
  run("i18n-home.ko.js", page.window);
  page.appended[1].onload();
  assert.equal(await second, "ko");
  assert.equal(page.html.lang, "ko");
});

test("only the last language picked is shown", async () => {
  const page = fakePage("ja", ["ja"]);
  page.listeners.DOMContentLoaded.forEach((fn) => fn());
  const french = page.window.NIARIM_I18N.applyLang("fr");
  const spanish = page.window.NIARIM_I18N.applyLang("es");
  run("i18n-home.es.js", page.window);
  page.appended[1].onload();
  assert.equal(await spanish, "es");
  run("i18n-home.fr.js", page.window);
  page.appended[0].onload();
  await french;
  assert.equal(page.html.lang, "es", "the earlier, slower request is ignored");
});

test("a page without per-language files (static preview) switches at once", () => {
  const page = fakePage("ja", [], {
    ja: { "nav.features": "機能" },
    en: { "nav.features": "Features" },
  });
  page.listeners.DOMContentLoaded.forEach((fn) => fn());
  assert.equal(page.heading.textContent, "機能");
  assert.equal(page.window.NIARIM_I18N.applyLang("en"), "en");
  assert.equal(page.heading.textContent, "Features");
  assert.equal(page.appended.length, 0, "nothing is fetched");
});
