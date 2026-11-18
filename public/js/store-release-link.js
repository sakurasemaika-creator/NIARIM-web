/** Reveal the download links once the official NIARIM listing is configured. */
(function () {
  "use strict";

  function init() {
    const candidate =
      window.NIARIM_PLAY_STORE_URL || window.NIARIM_CONFIG?.GOOGLE_PLAY_URL;
    if (typeof candidate !== "string" || !candidate) return;

    let url;
    try {
      url = new URL(candidate);
    } catch {
      return;
    }
    if (
      url.origin !== "https://play.google.com" ||
      url.pathname !== "/store/apps/details" ||
      url.searchParams.get("id") !== "com.niarim.niarim"
    ) {
      return;
    }

    document.querySelectorAll("[data-play-release-i18n]").forEach((element) => {
      const key = element.dataset.playReleaseI18n;
      element.setAttribute("data-i18n", key);
      if (window.NIARIM_I18N) {
        element.textContent = window.NIARIM_I18N.translate(
          document.documentElement.lang || "ja",
          key,
        );
      }
    });
    document.querySelectorAll("[data-play-store-link]").forEach((link) => {
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.hidden = false;
    });
    document.querySelectorAll("[data-play-release-only]").forEach((element) => {
      element.hidden = false;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
