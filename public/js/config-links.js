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
  function loadAiTrustCopy() {
    if (document.querySelector('script[data-niarim-ai-trust]')) return;
    var script = document.createElement("script");
    script.src = "/js/i18n-dict-ai-trust.js";
    script.defer = true;
    script.setAttribute("data-niarim-ai-trust", "true");
    document.head.appendChild(script);
  }
  loadAiTrustCopy();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
