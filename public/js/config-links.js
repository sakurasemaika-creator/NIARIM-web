/** NIARIM公式サイト 外部リンク差し込み */
(function () {
  "use strict";
  var LINKS = [
    { id: "google-play-link", key: "GOOGLE_PLAY_URL", fallback: "disable" },
    { id: "footer-x-link", key: "X_URL", fallback: "hide" },
    { id: "footer-x-icon", key: "X_URL", fallback: "hide" },
    { id: "contact-x-link", key: "X_URL", fallback: "hide" },
  ];
  function apply() {
    var config = window.NIARIM_CONFIG || {};
    LINKS.forEach(function (link) {
      var el = document.getElementById(link.id);
      if (!el) return;
      var url = config[link.key];
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("rel", "noopener noreferrer");
        return;
      }
      if (link.fallback === "hide") {
        var host = el.closest("li") || el;
        host.hidden = true;
      } else {
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-unavailable");
      }
    });
  }

  /* かつてここでは、main.js の fitMockScreens() がヒーローの端末枠へ
     付けた inline の width / height / transform を毎回消していた。
     当時の fitMockScreens は width も height も「100/倍率 %」で広げて
     いたため、端末の縦横比が崩れることがあったからである。
     いまは倍率を掛けたあとの見た目の大きさが元の枠とぴったり同じに
     なるよう（width = 元の幅/倍率、height = 必要な高さ、はみ出したぶんは
     負のマージンで打ち消す）作り直したので、比率は崩れない。
     消し続けると逆に、スマホでツールバーとコマ一覧が枠の下からはみ出して
     ベゼルに切られたままになる（実測で106pxはみ出していた）ため、
     この打ち消しはやめる。 */

  /* 50x50セルのcurrentを実際のスクローラ中央へ合わせる。
     visual-audit-tail.css の左右paddingだけでは先頭セルが中央になるため、
     3枚目をcurrentにした現在のDOMでは約100pxずれる。offsetLeftから計算し、
     SP/PC・モック幅に依存せず中央へ揃える。 */
  function centerCurrentFrames() {
    document
      .querySelectorAll(".fd-frame-strip-scroll")
      .forEach(function (strip) {
        var current = strip.querySelector(
          ".fd-frame-thumb.is-current, .fd-frame.is-current",
        );
        if (!current || !strip.clientWidth) return;
        var target =
          current.offsetLeft + current.offsetWidth / 2 - strip.clientWidth / 2;
        var max = Math.max(0, strip.scrollWidth - strip.clientWidth);
        strip.scrollLeft = Math.max(0, Math.min(max, target));
      });
  }

  function scheduleFrameCentering() {
    requestAnimationFrame(function () {
      requestAnimationFrame(centerCurrentFrames);
    });
    setTimeout(centerCurrentFrames, 240);
  }

  function loadAiTrustCopy() {
    if (document.querySelector("script[data-niarim-ai-trust]")) return;
    var script = document.createElement("script");
    script.src = "/js/i18n-dict-ai-trust.js";
    script.defer = true;
    script.setAttribute("data-niarim-ai-trust", "true");
    document.head.appendChild(script);
  }
  loadAiTrustCopy();

  function init() {
    apply();
    scheduleFrameCentering();
    window.addEventListener("load", scheduleFrameCentering);
    window.addEventListener("resize", scheduleFrameCentering, {
      passive: true,
    });
    document.addEventListener("niarim:langchange", scheduleFrameCentering);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFrameCentering);
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
