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

  function loadFeatureFidelity() {
    if (
      !document.getElementById("audio") &&
      !document.getElementById("widget")
    )
      return;
    if (document.querySelector("script[data-niarim-feature-fidelity]")) return;

    var script = document.createElement("script");
    script.src = "/js/features-fidelity.js";
    script.defer = true;
    script.setAttribute("data-niarim-feature-fidelity", "true");
    document.head.appendChild(script);
  }

  function addStyleOnce(href, marker) {
    if (document.querySelector("link[" + marker + "]")) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(marker, "true");
    document.head.appendChild(link);
  }

  function loadHomeHeroViewport() {
    if (!document.querySelector(".hero + .marquee-section")) return;
    addStyleOnce("/css/home-hero-viewport.css", "data-niarim-home-hero-viewport");
    addStyleOnce("/css/home-hero-fidelity.css", "data-niarim-home-hero-fidelity");
    addStyleOnce("/css/home-hero-fit-628.css", "data-niarim-home-hero-fit-628");

    if (!document.querySelector("script[data-niarim-home-hero-showcase]")) {
      var script = document.createElement("script");
      script.src = "/js/home-hero-showcase.js";
      script.defer = true;
      script.setAttribute("data-niarim-home-hero-showcase", "true");
      document.head.appendChild(script);
    }
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
    loadFeatureFidelity();
    loadHomeHeroViewport();
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
