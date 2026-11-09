/**
 * 表示言語を第一描画より前に判定して <html> に印を付ける（フォント転送量の削減）。
 *
 * ■ 判定順
 *   SEO/共有用の ?lang=xx -> 保存された選択 -> ブラウザの優先言語。
 *   URLで明示された言語は、検索結果のmetadataと本文を一致させるため最優先する。
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

  var LATIN = { en: 1, fr: 1, es: 1 };

  function pick(value) {
    if (!value) return null;
    var raw = String(value);
    if (raw === "zh-Hans" || raw === "zh-Hant") return "zh";
    var lower = raw.toLowerCase();
    if (lower.indexOf("zh") === 0) return "zh";
    var short = lower.split("-")[0];
    return { ja: 1, en: 1, ko: 1, fr: 1, es: 1 }[short] ? short : null;
  }

  var lang = null;
  try {
    lang = pick(new URL(window.location.href).searchParams.get("lang"));
  } catch (e) {
    lang = null;
  }

  if (!lang) {
    try {
      lang = pick(window.localStorage.getItem("niarim_lang"));
    } catch (e) {
      lang = null;
    }
  }

  if (!lang) {
    var list =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];
    for (var i = 0; i < list.length && !lang; i += 1) lang = pick(list[i]);
  }

  if (lang && LATIN[lang])
    document.documentElement.setAttribute("data-latin-only", "");
})();
