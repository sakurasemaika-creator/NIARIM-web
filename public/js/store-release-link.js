/** Reveal the download links once the official NIARIM listing is configured. */
(function () {
  "use strict";

  // Google's official "Get it on Google Play" badges, unaltered, one per
  // language (downloaded from https://play.google.com/intl/en_us/badges/ and
  // placed here before release). A link is shown only after its badge image
  // has loaded, so a missing file never shows a broken image or an imitation.
  const BADGE_DIR = "/assets/badges/google-play/";
  const BADGE_LANGS = ["ja", "en", "fr", "es", "ko", "zh-Hans", "zh-Hant"];

  function currentLang() {
    const lang = document.documentElement.lang || "ja";
    return BADGE_LANGS.includes(lang) ? lang : "en";
  }

  function translate(lang, key) {
    return window.NIARIM_I18N ? window.NIARIM_I18N.translate(lang, key) : "";
  }

  function setBadge(badge, lang) {
    badge.src = BADGE_DIR + lang + ".png";
    badge.alt = translate(lang, "refresh.playBadge.alt");
  }

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
    const badges = [];
    document.querySelectorAll("[data-play-store-link]").forEach((link) => {
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const badge = link.querySelector?.("img[data-play-badge]");
      if (!badge) {
        link.hidden = false;
        return;
      }
      badges.push(badge);
      badge.addEventListener("load", () => {
        link.hidden = false;
      });
      badge.addEventListener("error", () => {
        link.hidden = true;
      });
      setBadge(badge, currentLang());
    });
    document.querySelectorAll("[data-play-release-only]").forEach((element) => {
      element.hidden = false;
    });
    document.addEventListener?.("niarim:langchange", () => {
      badges.forEach((badge) => setBadge(badge, currentLang()));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
