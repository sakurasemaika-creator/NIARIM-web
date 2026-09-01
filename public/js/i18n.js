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

  function normalizeLang(value) {
    if (!value) return "ja";
    var raw = String(value);
    for (var i = 0; i < LANGS.length; i += 1) {
      if (LANGS[i].code === raw) return LANGS[i].code;
    }

    var lower = raw.toLowerCase();
    if (lower.indexOf("zh") === 0) {
      return lower.indexOf("hant") > -1 ||
        lower.indexOf("tw") > -1 ||
        lower.indexOf("hk") > -1
        ? "zh-Hant"
        : "zh-Hans";
    }

    var short = lower.split("-")[0];
    for (var j = 0; j < LANGS.length; j += 1) {
      if (LANGS[j].code.toLowerCase().indexOf(short) === 0) return LANGS[j].code;
    }
    return "ja";
  }

  function detectLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && DICT[normalizeLang(saved)]) return normalizeLang(saved);
    } catch (_) {}

    var detected = normalizeLang(navigator.language || "ja");
    return DICT[detected] ? detected : "ja";
  }

  function t(lang, key) {
    var table = DICT[lang] || DICT.ja || {};
    var fallback = DICT.ja || {};
    return Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : fallback[key] || key;
  }

  function applyLang(lang) {
    lang = normalizeLang(lang);
    if (!DICT[lang]) lang = "ja";

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(lang, el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split("|").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts[0] && parts[1]) el.setAttribute(parts[0], t(lang, parts[1]));
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
        String(button.getAttribute("data-lang-switch") === lang)
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

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}

    document.dispatchEvent(
      new CustomEvent("niarim:langchange", { detail: { lang: lang } })
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
        applyLang(lang.code);
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
      dropdown.setAttribute(
        "data-open",
        String(dropdown.getAttribute("data-open") !== "true")
      );
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) dropdown.setAttribute("data-open", "false");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") dropdown.setAttribute("data-open", "false");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildLangMenu();
    initLangDropdownToggle();
    applyLang(detectLang());
  });

  window.NIARIM_I18N = {
    languages: LANGS,
    translate: t,
    applyLang: applyLang,
  };
})();
