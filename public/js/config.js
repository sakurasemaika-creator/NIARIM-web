/**
 * NIARIM公式サイト 共通設定値
 *
 * サイト内で使い回す変更可能な情報をここに集約する。
 * URLをHTML内に直接大量に記述しないための単一ソース。
 *
 * [要確認] の値は、正式リリース時の情報が確定次第、差し替えること。
 * ここに置くのは実際にJS側から参照している値のみ（未使用の値は置かない）。
 */
window.NIARIM_CONFIG = {
  // Google Play（[要確認] 公開URL確定後に差し替え）
  GOOGLE_PLAY_URL: "",

  // 公式X（[要確認] 公式アカウント確定後に差し替え）
  X_URL: "",
};

/* Home first-view assets are kept separate from the shared bundle so the
   heavier three-screen showcase is not downloaded on every page. config.js is
   present on Home before main.js, so the stylesheet can start loading early;
   the showcase script itself waits until window.load, after main.js has replaced
   the App Preview cards with the code-verified application mocks. */
(function loadHomeHeroShowcase() {
  var path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && path !== "/index.html") return;

  if (!document.querySelector('link[data-niarim-home-hero]')) {
    var style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "/css/home-hero-fit-628.css?v=20260907b";
    style.setAttribute("data-niarim-home-hero", "true");
    document.head.appendChild(style);
  }

  if (!document.querySelector('script[data-niarim-home-hero]')) {
    var script = document.createElement("script");
    script.src = "/js/home-hero-showcase.js?v=20260907b";
    script.defer = true;
    script.setAttribute("data-niarim-home-hero", "true");
    document.head.appendChild(script);
  }
})();
