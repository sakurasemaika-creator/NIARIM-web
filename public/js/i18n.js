/**
 * NIARIM公式サイト 多言語対応 (i18n.js)
 *
 * data-i18n="key" を持つ要素のtextContentを、選択言語の辞書で置き換える。
 * data-i18n-attr="attr1:key1|attr2:key2" で属性値(placeholder, aria-label等)を置き換える。
 * data-i18n-html="key" はリンク等のインラインタグを含む簡易HTMLを許可する（辞書側で用途を限定）。
 *
 * 対応言語: 日本語(ja) / 英語(en) / 簡体字中国語(zh-Hans) / 繁体字中国語(zh-Hant) /
 *           韓国語(ko) / フランス語(fr) / スペイン語(es)
 *
 * 法的文書(プライバシーポリシー・利用規約)の本文は誤訳リスクを避けるため
 * 日本語を正本としてHTMLに直接記述し、i18nでは案内バナーのみ翻訳する。
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

  function detectLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && DICT[saved]) return saved;
    } catch (e) {
      /* localStorage無効環境は無視 */
    }
    var nav = (navigator.language || "ja").toLowerCase();
    if (nav.indexOf("zh") === 0) {
      return nav.indexOf("hant") > -1 ||
        nav.indexOf("tw") > -1 ||
        nav.indexOf("hk") > -1
        ? "zh-Hant"
        : "zh-Hans";
    }
    var short = nav.split("-")[0];
    var found = LANGS.filter(function (l) {
      return l.code.toLowerCase().indexOf(short) === 0;
    });
    return found[0] ? found[0].code : "ja";
  }

  function t(lang, key) {
    var table = DICT[lang] || DICT.ja || {};
    var fallback = DICT.ja || {};
    return Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : fallback[key] || key;
  }

  function applyLang(lang) {
    if (!DICT[lang]) lang = "ja";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute(
      "dir",
      lang === "ar" ? "rtl" : "ltr"
    );

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(lang, el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var pairs = el.getAttribute("data-i18n-attr").split("|");
      pairs.forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0];
        var key = parts[1];
        if (attr && key) el.setAttribute(attr, t(lang, key));
      });
    });

    var titleKey = document.body.getAttribute("data-i18n-title");
    if (titleKey) document.title = t(lang, titleKey);

    var descKey = document.body.getAttribute("data-i18n-description");
    if (descKey) {
      var metaDesc = document.querySelector('meta[name="description"]');
      var ogDesc = document.querySelector('meta[property="og:description"]');
      var twDesc = document.querySelector('meta[name="twitter:description"]');
      [metaDesc, ogDesc, twDesc].forEach(function (m) {
        if (m) m.setAttribute("content", t(lang, descKey));
      });
    }

    document
      .querySelectorAll("[data-lang-switch]")
      .forEach(function (button) {
        var isCurrent = button.getAttribute("data-lang-switch") === lang;
        button.setAttribute("aria-pressed", String(isCurrent));
      });

    var currentLabelEl = document.querySelector("[data-current-lang-label]");
    if (currentLabelEl) {
      var current = LANGS.filter(function (l) {
        return l.code === lang;
      })[0];
      currentLabelEl.textContent = current ? current.label : lang;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* 保存できない場合は無視（プライベートブラウジング等） */
    }

    document.dispatchEvent(
      new CustomEvent("niarim:langchange", { detail: { lang: lang } })
    );
  }

  function buildLangMenu() {
    var mount = document.querySelector("[data-lang-menu]");
    if (!mount) return;
    mount.innerHTML = "";
    LANGS.forEach(function (l) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = l.label;
      button.setAttribute("data-lang-switch", l.code);
      button.addEventListener("click", function () {
        applyLang(l.code);
        mount.closest("[data-lang-dropdown]") &&
          mount
            .closest("[data-lang-dropdown]")
            .setAttribute("data-open", "false");
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
      var isOpen = dropdown.getAttribute("data-open") === "true";
      dropdown.setAttribute("data-open", String(!isOpen));
    });
    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        dropdown.setAttribute("data-open", "false");
      }
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
