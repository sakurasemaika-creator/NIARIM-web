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

  /* main.js の fitMockScreens() は .fd-app-screen 全体へ inline !important の
     width / height / transform を設定する。hero も fd-app-screen なので、
     リサイズ後の再計測が mobile-first-view.css の端末比率を壊し得る。
     Hero は「縮小対象の中身」ではなく端末外枠そのものなので、外枠には
     fit用inline寸法を一切残さず、CSSの320:569を常に唯一の寸法基準にする。 */
  var restoringHeroAspect = false;
  var heroAspectObserver = null;

  function restoreHeroAspect() {
    var hero = document.querySelector(".hero-visual");
    if (!hero || restoringHeroAspect) return;
    restoringHeroAspect = true;
    hero.style.removeProperty("--fd-fit");
    hero.style.removeProperty("width");
    hero.style.removeProperty("height");
    hero.style.removeProperty("max-width");
    hero.style.removeProperty("max-height");
    hero.style.removeProperty("transform");
    hero.style.removeProperty("transform-origin");
    hero.classList.remove("is-fit-scaled");
    restoringHeroAspect = false;
  }

  function scheduleHeroAspectRestore() {
    requestAnimationFrame(function () {
      requestAnimationFrame(restoreHeroAspect);
    });
    /* main.js の resize debounce(150ms)より後にも必ず復元する。 */
    setTimeout(restoreHeroAspect, 220);
  }

  function watchHeroAspect() {
    var hero = document.querySelector(".hero-visual");
    if (!hero || typeof MutationObserver === "undefined") return;
    if (heroAspectObserver) heroAspectObserver.disconnect();
    heroAspectObserver = new MutationObserver(function (mutations) {
      if (restoringHeroAspect) return;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === "style") {
          scheduleHeroAspectRestore();
          break;
        }
      }
    });
    heroAspectObserver.observe(hero, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

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
    watchHeroAspect();
    scheduleHeroAspectRestore();
    scheduleFrameCentering();
    window.addEventListener("load", function () {
      scheduleHeroAspectRestore();
      scheduleFrameCentering();
    });
    window.addEventListener(
      "resize",
      function () {
        scheduleHeroAspectRestore();
        scheduleFrameCentering();
      },
      { passive: true },
    );
    document.addEventListener("niarim:langchange", scheduleFrameCentering);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        scheduleHeroAspectRestore();
        scheduleFrameCentering();
      });
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
