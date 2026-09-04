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

  /* main.js の fitMockScreens() は全 .fd-app-screen を対象にするため、
     hero が内容高の都合で fit 対象になると width/height の inline !important が入り、
     SP用 aspect-ratio を壊す。Hero は端末外枠そのものなので、fit 後に inline 寸法を
     解除して CSS の 320:569 比率へ戻す。 */
  function restoreHeroAspect() {
    var hero = document.querySelector(".hero-visual");
    if (!hero) return;
    hero.style.removeProperty("--fd-fit");
    hero.style.removeProperty("width");
    hero.style.removeProperty("height");
    hero.style.removeProperty("max-width");
    hero.style.removeProperty("max-height");
    hero.style.removeProperty("transform");
    hero.style.removeProperty("transform-origin");
    hero.classList.remove("is-fit-scaled");
  }

  function scheduleHeroAspectRestore() {
    requestAnimationFrame(function () {
      requestAnimationFrame(restoreHeroAspect);
    });
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
    scheduleHeroAspectRestore();
    window.addEventListener("load", scheduleHeroAspectRestore);
    window.addEventListener("resize", scheduleHeroAspectRestore, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleHeroAspectRestore);
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
