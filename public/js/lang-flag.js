/**
 * 表示言語を第一描画より前に判定して <html> に印を付ける（フォント転送量の削減）。
 *
 * Workerの言語を引き継ぎ、静的プレビューではブラウザーの言語を検出する。
 */
(function () {
  "use strict";

  // Legacy mock/panel patches remain necessary on the detailed feature pages,
  // but the rebuilt landing page exclusively uses current Flutter captures.
  // Do not load old mocks or their CSS during first paint of the new Home.
  var currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  var modernHome = currentPath === "/" || currentPath === "/index.html";
  if (!modernHome) {
    var fixStyle = document.createElement("link");
    fixStyle.rel = "stylesheet";
    fixStyle.href = "/css/user-request-fixes.css?v=20261109";
    document.head.appendChild(fixStyle);
    var fixScript = document.createElement("script");
    fixScript.src = "/js/user-request-fixes.js?v=20261109";
    fixScript.defer = true;
    document.head.appendChild(fixScript);
  }

  var supported = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
  var root = document.documentElement;
  var query = new URL(window.location.href).searchParams.get("lang");
  var locale = root.getAttribute("data-niarim-locale");
  var saved;
  try {
    saved = document.cookie.match(/(?:^|;\s*)niarim_lang=([^;]*)/);
  } catch (_) {}

  function matchBrowserLanguage(tag) {
    var subtags = tag.toLowerCase().split("-");
    var language = subtags.shift();
    if (language === "zh") {
      if (subtags.includes("hans")) return "zh-Hans";
      return subtags.some(function (part) {
        return ["hant", "tw", "hk", "mo"].includes(part);
      }) ? "zh-Hant" : "zh-Hans";
    }
    return supported.includes(language) ? language : null;
  }

  var preferences = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ""];
  var lang = [query, locale, saved && saved[1]].find(function (candidate) {
    return supported.includes(candidate);
  }) || preferences.map(matchBrowserLanguage).find(Boolean) || "en";

  window.NIARIM_INITIAL_LOCALE = lang;
  root.setAttribute("lang", lang);
  if (lang === "ja" || lang === "ko" || lang === "zh-Hans" || lang === "zh-Hant") {
    root.removeAttribute("data-latin-only");
  } else {
    root.setAttribute("data-latin-only", "");
  }
})();
