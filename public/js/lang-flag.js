/**
 * 表示言語を第一描画より前に判定して <html> に印を付ける（フォント転送量の削減）。
 *
 * ■ 判定順
 *   SEO/共有用の ?lang=xx を使い、指定なし・未対応の値は英語で表示する。
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

  var lang;
  try {
    lang = new URL(window.location.href).searchParams.get("lang");
  } catch (_) {
    lang = null;
  }
  if (lang === "ja" || lang === "ko" || lang === "zh-Hans" || lang === "zh-Hant") {
    document.documentElement.removeAttribute("data-latin-only");
  } else {
    document.documentElement.setAttribute("data-latin-only", "");
  }
})();
