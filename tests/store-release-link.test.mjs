import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const read = (path) =>
  readFileSync(new URL("../public/" + path, import.meta.url), "utf8");
const pages = [
  "index.html",
  "404.html",
  ...readdirSync(new URL("../public/", import.meta.url), {
    withFileTypes: true,
  })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(
          new URL(`../public/${entry.name}/index.html`, import.meta.url),
        ),
    )
    .map((entry) => `${entry.name}/index.html`),
];
const home = read("index.html");
const premium = read("premium/index.html");
const script = read("js/store-release-link.js");
const config = read("js/config.js");
const css = read("css/site.css");
const dictionaries = [
  "i18n-dict",
  "i18n-dict-intl",
  "i18n-dict-nav-extra",
  "i18n-dict-refresh-2026",
  "i18n-dict-visitor-copy-goals",
].map((name) => read("js/" + name + ".js"));
const listing =
  "https://play.google.com/store/apps/details?id=com.niarim.niarim";
const langs = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];

function dictionary() {
  const window = {};
  for (const source of dictionaries) runInNewContext(source, { window });
  return (lang, key) => window.NIARIM_I18N_DICT[lang]?.[key];
}
const translate = dictionary();

function storeLinks(html) {
  return Array.from(
    html.matchAll(
      /<a\b([^>]*\bdata-play-store-link\b[^>]*)>([\s\S]*?)<\/a\s*>/g,
    ),
    ([, opening, inner]) => ({ opening, inner }),
  );
}

// A small stand-in for the DOM the script touches.
function storefront(html, { lang = "ja", badgeLangs } = {}) {
  const listeners = {};
  const links = storeLinks(html).map(({ opening }) => {
    const link = {
      hidden: /\bhidden\b/.test(opening),
      href: opening.match(/\bhref="([^"]+)"/)?.[1],
      target: opening.match(/\btarget="([^"]+)"/)?.[1],
      rel: opening.match(/\brel="([^"]+)"/)?.[1],
      children: [],
      text: { hidden: false },
      hasAttribute: (name) =>
        name === "data-play-badge" && /\bdata-play-badge\b/.test(opening),
      querySelector(selector) {
        assert.equal(selector, ".nr-play-badge-text");
        return this.text;
      },
      appendChild(child) {
        child.parent = this;
        this.children.push(child);
      },
    };
    return link;
  });
  const document = {
    readyState: "complete",
    documentElement: { lang },
    createElement(tag) {
      assert.equal(tag, "img");
      return {
        src: "",
        alt: "",
        hidden: false,
        listeners: {},
        parent: null,
        addEventListener(type, listener) {
          this.listeners[type] = listener;
        },
        remove() {
          if (!this.parent) return;
          this.parent.children = this.parent.children.filter((c) => c !== this);
          this.parent = null;
        },
      };
    },
    querySelectorAll(selector) {
      assert.equal(selector, "[data-play-store-link]");
      return links;
    },
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
  };
  const window = {};
  runInNewContext(config, { window });
  if (badgeLangs) window.NIARIM_CONFIG.GOOGLE_PLAY_BADGE_LANGS = badgeLangs;
  window.NIARIM_I18N = { translate };
  runInNewContext(script, { document, window, URL });
  const badgeOf = (link) => link.children.find((c) => c.className);
  return {
    links,
    badgeOf,
    changeLanguage(next) {
      document.documentElement.lang = next;
      listeners["niarim:langchange"]?.();
    },
  };
}

test("the store links are real, visible links in the HTML", () => {
  assert.equal(storeLinks(home).length, 2);
  assert.equal(storeLinks(premium).length, 1);
  for (const html of [home, premium]) {
    for (const { opening, inner } of storeLinks(html)) {
      assert.doesNotMatch(opening, /\bhidden\b/);
      assert.match(
        opening,
        new RegExp(`\\bhref="${listing.replace(/[?.]/g, "\\$&")}"`),
      );
      assert.match(opening, /\btarget="_blank"/);
      assert.match(opening, /\brel="noopener noreferrer"/);
      assert.match(opening, /\bdata-play-badge\b/);
      // The text label is there for visitors without JavaScript, crawlers and
      // languages without a badge image.
      const label = inner.match(
        /^\s*<span\s+class="nr-play-badge-text"\s+data-i18n="refresh\.playBadge\.alt"\s*>([\s\S]*?)<\/span\s*>\s*$/,
      );
      assert.ok(label, "the link holds only its text label");
      assert.equal(label[1].trim(), translate("ja", "refresh.playBadge.alt"));
    }
  }
  for (const lang of langs) {
    assert.match(translate(lang, "refresh.playBadge.alt"), /Google Play/);
  }
  assert.match(
    config,
    new RegExp(`GOOGLE_PLAY_URL:\\s*"${listing.replace(/[?.]/g, "\\$&")}"`),
  );
});

test("every page shows the released state, with no pending copy left", () => {
  for (const page of pages) {
    const html = read(page);
    assert.doesNotMatch(
      html,
      /data-play-release|release\.pending|nav\.releaseInfo/,
      page,
    );
    const header = html.match(/<a\s+class="nav-release"[^>]*>/)?.[0];
    if (header) assert.match(header, /data-i18n="nav\.download"/, page);
  }
  for (const source of dictionaries) {
    assert.doesNotMatch(source, /refresh\.release\.pending\.|nav\.releaseInfo/);
  }
  for (const key of [
    "refresh.hero.storeNote",
    "refresh.playBadge.trademark",
    "refresh.launch.title",
    "refresh.launch.body",
    "refresh.launch.status",
  ]) {
    const element = home.match(
      new RegExp(`<p\\b[^>]*data-i18n="${key.replaceAll(".", "\\.")}"[^>]*>`),
    )?.[0];
    assert.ok(element, key);
    assert.doesNotMatch(element, /\bhidden\b/, key);
    for (const lang of langs)
      assert.ok(translate(lang, key)?.trim(), `${lang} ${key}`);
  }
  assert.match(premium, /data-i18n="refresh\.hero\.storeNote"/);
  for (const lang of langs) {
    assert.match(translate(lang, "refresh.playBadge.trademark"), /Google LLC/);
  }
});

test("a language without a listed badge keeps the text link as it is", () => {
  for (const lang of langs) {
    const { links, badgeOf } = storefront(home, { lang, badgeLangs: [] });
    assert.equal(links.length, 2);
    for (const link of links) {
      assert.equal(link.hidden, false);
      assert.equal(link.href, listing);
      assert.equal(link.target, "_blank");
      assert.equal(link.rel, "noopener noreferrer");
      assert.equal(link.text.hidden, false);
      assert.equal(badgeOf(link), undefined, "no image is requested");
    }
  }
});

test("Google's badge replaces the text only once it has loaded", () => {
  for (const lang of langs) {
    const { links, badgeOf } = storefront(home, { lang, badgeLangs: langs });
    for (const link of links) {
      const badge = badgeOf(link);
      assert.ok(badge);
      assert.equal(badge.className, "nr-play-badge");
      assert.equal(badge.width, 646);
      assert.equal(badge.height, 250);
      assert.equal(badge.src, `/assets/badges/google-play/${lang}.png`);
      assert.equal(badge.alt, translate(lang, "refresh.playBadge.alt"));
      assert.equal(badge.hidden, true);
      assert.equal(link.text.hidden, false);
      badge.listeners.load();
      assert.equal(badge.hidden, false);
      assert.equal(link.text.hidden, true);
      assert.equal(link.hidden, false);
    }
  }
});

test("a missing badge image keeps the visible text link, never a broken image", () => {
  const { links, badgeOf } = storefront(premium, { badgeLangs: ["ja"] });
  for (const link of links) {
    const badge = badgeOf(link);
    badge.listeners.error();
    assert.equal(badgeOf(link), undefined);
    assert.equal(link.text.hidden, false);
    assert.equal(link.hidden, false);
    assert.equal(link.href, listing);
  }
});

test("changing the language swaps the badge and ignores the old image", () => {
  const view = storefront(home, { badgeLangs: ["ja", "fr"] });
  const [link] = view.links;
  const japanese = view.badgeOf(link);
  view.changeLanguage("fr");
  const french = view.badgeOf(link);
  assert.notEqual(french, japanese);
  assert.equal(french.src, "/assets/badges/google-play/fr.png");
  assert.equal(french.alt, translate("fr", "refresh.playBadge.alt"));
  japanese.listeners.load();
  assert.equal(link.text.hidden, false, "a stale image does not hide the text");
  french.listeners.load();
  assert.equal(link.text.hidden, true);
  view.changeLanguage("ko");
  assert.equal(view.badgeOf(link), undefined, "no Korean badge is listed");
  assert.equal(link.text.hidden, false);
});

test("the store link is Google's badge or a plain site button, not an imitation", () => {
  for (const html of [home, premium]) {
    assert.doesNotMatch(html, /nr-play-mark|▶/);
    for (const { inner } of storeLinks(html)) {
      assert.doesNotMatch(inner, /<(?:img|svg|use|picture)\b/);
    }
  }
  assert.doesNotMatch(css, /nr-play-badge-text[^{]*::(?:before|after)/);
  const rule = css.match(/\.nr-play-badge-text\s*\{([^}]*)\}/)?.[1];
  assert.ok(rule, "the text label is styled");
  assert.match(rule, /background:\s*var\(--pencil-ink\)/);
  assert.match(rule, /color:\s*var\(--color-white\)/);
  assert.ok(Number(rule.match(/min-height:\s*(\d+)px/)?.[1]) >= 48);
  assert.match(
    css,
    /\.nr-play-badge-link \[hidden\]\s*\{\s*display:\s*none !important;/,
  );
});

test("every language has Google's official badge, unaltered and listed", () => {
  const window = {};
  runInNewContext(config, { window });
  assert.deepEqual(
    [...window.NIARIM_CONFIG.GOOGLE_PLAY_BADGE_LANGS].sort(),
    [...langs].sort(),
  );
  for (const lang of langs) {
    const file = new URL(
      `../public/assets/badges/google-play/${lang}.png`,
      import.meta.url,
    );
    assert.ok(existsSync(file), `${lang}.png`);
    const png = readFileSync(file);
    assert.equal(
      png.subarray(0, 8).toString("hex"),
      "89504e470d0a1a0a",
      `${lang}.png is a PNG`,
    );
    // Google ships every badge at 646 x 250; the page reserves that size.
    assert.equal(png.readUInt32BE(16), 646, `${lang}.png width`);
    assert.equal(png.readUInt32BE(20), 250, `${lang}.png height`);
  }
});
