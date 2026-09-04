/**
 * NIARIM公式サイト 多言語対応 (i18n.js)
 *
 * data-i18n="key" を持つ要素のtextContentを、選択言語の辞書で置き換える。
 * data-i18n-attr="attr1:key1|attr2:key2" で属性値(placeholder, aria-label等)を置き換える。
 * data-i18n-html="key" はリンク等のインラインタグを含む簡易HTMLを許可する（辞書側で用途を限定）。
 *
 * 対応言語: 日本語(ja) / 英語(en) / 簡体字中国語(zh-Hans) / 繁体字中国語(zh-Hant) /
 *           韓国語(ko) / フランス語(fr) / スペイン語(es)
 */
(function () {
  "use strict";

  var LANGS = [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" },
    { code: "zh-Hans", label: "简体中文" },
    { code: "zh-Hant", label: "繁體中文" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
  ];

  var STORAGE_KEY = "niarim_lang";
  var DICT = window.NIARIM_I18N_DICT || {};

  function matchSupportedLang(value) {
    if (!value) return null;
    var raw = String(value);
    for (var i = 0; i < LANGS.length; i += 1) {
      if (LANGS[i].code === raw) return LANGS[i].code;
    }

    var lower = raw.toLowerCase();
    if (lower.indexOf("zh") === 0) {
      return lower.indexOf("hant") > -1 ||
        lower.indexOf("tw") > -1 ||
        lower.indexOf("hk") > -1 ||
        lower.indexOf("mo") > -1
        ? "zh-Hant"
        : "zh-Hans";
    }

    var short = lower.split("-")[0];
    for (var j = 0; j < LANGS.length; j += 1) {
      if (LANGS[j].code.toLowerCase().split("-")[0] === short)
        return LANGS[j].code;
    }
    return null;
  }

  function normalizeLang(value) {
    return matchSupportedLang(value) || "ja";
  }

  function getSavedLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      var matched = matchSupportedLang(saved);
      return matched && DICT[matched] ? matched : null;
    } catch (_) {
      return null;
    }
  }

  function detectBrowserLang() {
    var candidates = [];

    if (navigator.languages && navigator.languages.length) {
      candidates = Array.prototype.slice.call(navigator.languages);
    } else if (navigator.language) {
      candidates = [navigator.language];
    }

    for (var i = 0; i < candidates.length; i += 1) {
      var matched = matchSupportedLang(candidates[i]);
      if (matched && DICT[matched]) return matched;
    }

    // ブラウザ/端末の優先言語に対応言語が1つもない場合は、
    // 国際的に理解されやすい英語をサイトの既定言語として使用する。
    return DICT.en ? "en" : "ja";
  }

  function detectLang() {
    // ユーザーが既存の言語切替メニューで明示的に選んだ言語を最優先する。
    var saved = getSavedLang();
    if (saved) return saved;

    // 手動選択がまだない場合だけ、ブラウザ/端末の優先言語一覧を上から確認する。
    // 自動判定結果は保存しないため、端末側の言語設定を後から変更した場合にも
    // 次回アクセス時から自然に追従できる。
    return detectBrowserLang();
  }

  function t(lang, key) {
    var table = DICT[lang] || DICT.ja || {};
    var fallback = DICT.ja || {};
    return Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : fallback[key] || key;
  }

  function applyLang(lang, options) {
    lang = normalizeLang(lang);
    if (!DICT[lang]) lang = "ja";
    options = options || {};

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(lang, el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split("|")
        .forEach(function (pair) {
          var parts = pair.split(":");
          if (parts[0] && parts[1])
            el.setAttribute(parts[0], t(lang, parts[1]));
        });
    });

    var titleKey = document.body.getAttribute("data-i18n-title");
    if (titleKey) document.title = t(lang, titleKey);

    var descKey = document.body.getAttribute("data-i18n-description");
    if (descKey) {
      [
        document.querySelector('meta[name="description"]'),
        document.querySelector('meta[property="og:description"]'),
        document.querySelector('meta[name="twitter:description"]'),
      ].forEach(function (meta) {
        if (meta) meta.setAttribute("content", t(lang, descKey));
      });
    }

    document.querySelectorAll("[data-lang-switch]").forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-lang-switch") === lang),
      );
    });

    var currentLabelEl = document.querySelector("[data-current-lang-label]");
    if (currentLabelEl) {
      for (var i = 0; i < LANGS.length; i += 1) {
        if (LANGS[i].code === lang) {
          currentLabelEl.textContent = LANGS[i].label;
          break;
        }
      }
    }

    // 自動検出時は保存せず、既存メニュー等からの明示的な切替だけ記憶する。
    if (options.persist !== false) {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch (_) {}
    }

    document.dispatchEvent(
      new CustomEvent("niarim:langchange", { detail: { lang: lang } }),
    );

    return lang;
  }

  function buildLangMenu() {
    var mount = document.querySelector("[data-lang-menu]");
    if (!mount) return;
    mount.innerHTML = "";

    LANGS.forEach(function (lang) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = lang.label;
      button.setAttribute("data-lang-switch", lang.code);
      button.addEventListener("click", function () {
        applyLang(lang.code, { persist: true });
        var dropdown = mount.closest("[data-lang-dropdown]");
        if (dropdown) dropdown.setAttribute("data-open", "false");
      });
      li.appendChild(button);
      mount.appendChild(li);
    });
  }

  function initLangDropdownToggle() {
    var dropdown = document.querySelector("[data-lang-dropdown]");
    if (!dropdown) return;
    var trigger = dropdown.querySelector("[data-lang-trigger]");
    if (!trigger) return;

    trigger.addEventListener("click", function () {
      var willOpen = dropdown.getAttribute("data-open") !== "true";
      dropdown.setAttribute("data-open", String(willOpen));
      // スマホではこの切替がメニューパネルの下端付近にあり、開いた一覧が
      // 画面外へ出て「言語が3つしか無い」ように見えていた。パネルは
      // スクロールできるので、開いたら一覧が見える位置まで送ってやる。
      if (!willOpen) return;
      var menu = dropdown.querySelector("[data-lang-menu]");
      if (!menu || !menu.scrollIntoView) return;
      requestAnimationFrame(function () {
        var rect = menu.getBoundingClientRect();
        if (rect.bottom <= window.innerHeight) return;
        menu.scrollIntoView({ block: "end", behavior: "smooth" });
      });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target))
        dropdown.setAttribute("data-open", "false");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") dropdown.setAttribute("data-open", "false");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildLangMenu();
    initLangDropdownToggle();
    applyLang(detectLang(), { persist: false });
  });

  window.NIARIM_I18N = {
    languages: LANGS,
    translate: t,
    applyLang: applyLang,
  };
})();
