/**
 * NIARIM公式サイト 多言語対応 (i18n.js)
 *
 * data-i18n="key" を持つ要素のtextContentを、選択言語の辞書で置き換える。
 * data-i18n-attr="attr1:key1|attr2:key2" で属性値(placeholder, aria-label等)を置き換える。
 * data-i18n-html="key" はリンク等のインラインタグを含む簡易HTMLを許可する（辞書側で用途を限定）。
 *
 * 初期表示ではHTML内の辞書scriptから日本語だけを同期的に受け取る。
 * 別言語へ切り替える場合だけ、そのページで使用中の辞書scriptを ?lang=XX 付きで
 * 追加取得する。辞書が一部存在するだけで「読込済み」と誤判定しないよう、
 * 言語単位の完了状態を明示的に管理する。
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
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var languageLoads = {};
  var loadedLanguages = { ja: true };

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
      if (LANGS[j].code.toLowerCase().indexOf(short) === 0) {
        return LANGS[j].code;
      }
    }
    return "ja";
  }

  function detectLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeLang(saved);
    } catch (_) {}
    return normalizeLang(navigator.language || "ja");
  }

  function t(lang, key) {
    var table = DICT[lang] || {};
    var fallback = DICT.ja || {};
    return Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : Object.prototype.hasOwnProperty.call(fallback, key)
        ? fallback[key]
        : key;
  }

  function getDictionarySources() {
    var seen = {};
    var sources = [];
    document.querySelectorAll('script[src*="/js/i18n-dict"]').forEach(function (script) {
      var src = script.getAttribute("src");
      if (!src) return;
      var url = new URL(src, window.location.href);
      url.search = "";
      var normalized = url.pathname;
      if (seen[normalized]) return;
      seen[normalized] = true;
      sources.push(normalized);
    });
    return sources;
  }

  function loadScript(src, lang) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src + "?lang=" + encodeURIComponent(lang);
      script.async = true;
      script.onload = function () {
        script.remove();
        resolve();
      };
      script.onerror = function () {
        script.remove();
        reject(new Error("Failed to load translation dictionary: " + src));
      };
      document.head.appendChild(script);
    });
  }

  function loadLanguage(lang) {
    lang = normalizeLang(lang);

    if (loadedLanguages[lang]) return Promise.resolve(lang);
    if (languageLoads[lang]) return languageLoads[lang];

    var sources = getDictionarySources();
    if (!sources.length) return Promise.resolve("ja");

    languageLoads[lang] = Promise.all(
      sources.map(function (src) {
        return loadScript(src, lang);
      })
    ).then(function () {
      loadedLanguages[lang] = true;
      delete languageLoads[lang];
      return lang;
    }).catch(function (err) {
      delete languageLoads[lang];
      console.error(err);
      return "ja";
    });

    return languageLoads[lang];
  }

  function applyLangNow(lang) {
    lang = normalizeLang(lang);
    if (!DICT[lang] || !Object.keys(DICT[lang]).length) lang = "ja";

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

  function applyLang(lang) {
    lang = normalizeLang(lang);
    return loadLanguage(lang).then(applyLangNow);
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
        button.disabled = true;
        applyLang(lang.code).finally(function () {
          button.disabled = false;
          var dropdown = mount.closest("[data-lang-dropdown]");
          if (dropdown) dropdown.setAttribute("data-open", "false");
        });
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
    loadLanguage: loadLanguage,
  };
})();
