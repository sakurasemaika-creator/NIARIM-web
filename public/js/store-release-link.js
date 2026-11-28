/**
 * Google Play links.
 *
 * The HTML already carries the NIARIM listing URL and a text label ("Get it on
 * Google Play" in the page language), so the link works without JavaScript and
 * for crawlers. Google's official badge (unaltered, one per language at
 * /assets/badges/google-play/<lang>.webp: Google's PNG from
 * https://play.google.com/intl/en_us/badges/, kept beside it, stored as
 * lossless WebP with the same pixels) takes the label's place only for
 * the languages listed in NIARIM_CONFIG.GOOGLE_PLAY_BADGE_LANGS, and only once
 * the image has loaded. A badge that is not listed, missing or broken leaves
 * the text link as it is: the link is never hidden, no broken image is shown,
 * and nothing imitates Google's badge.
 *
 * The languages are listed rather than probed so that a badge file that has
 * not been added yet does not cost every visitor a failed request.
 */
(function () {
  "use strict";

  const BADGE_DIR = "/assets/badges/google-play/";
  const LISTING_ID = "com.niarim.niarim";

  function configuredListing() {
    const candidate =
      window.NIARIM_PLAY_STORE_URL || window.NIARIM_CONFIG?.GOOGLE_PLAY_URL;
    if (typeof candidate !== "string" || !candidate) return "";
    try {
      const url = new URL(candidate);
      return url.origin === "https://play.google.com" &&
        url.pathname === "/store/apps/details" &&
        url.searchParams.get("id") === LISTING_ID
        ? url.href
        : "";
    } catch {
      return "";
    }
  }

  function badgeLangs() {
    const langs = window.NIARIM_CONFIG?.GOOGLE_PLAY_BADGE_LANGS;
    return Array.isArray(langs) ? langs : [];
  }

  function currentLang() {
    return document.documentElement.lang || "ja";
  }

  function translate(lang, key) {
    return window.NIARIM_I18N ? window.NIARIM_I18N.translate(lang, key) : "";
  }

  function showText(entry) {
    if (entry.badge) {
      entry.badge.remove();
      entry.badge = null;
    }
    if (entry.text) entry.text.hidden = false;
  }

  function showBadge(entry) {
    const lang = currentLang();
    const request = ++entry.request;
    showText(entry);
    if (!badgeLangs().includes(lang)) return;

    const badge = document.createElement("img");
    badge.className = "nr-play-badge";
    badge.width = 646;
    badge.height = 250;
    badge.decoding = "async";
    badge.alt = translate(lang, "refresh.playBadge.alt");
    badge.hidden = true;
    badge.addEventListener("load", () => {
      if (request !== entry.request) return;
      badge.hidden = false;
      if (entry.text) entry.text.hidden = true;
    });
    badge.addEventListener("error", () => {
      if (request !== entry.request) return;
      showText(entry);
    });
    entry.badge = badge;
    entry.link.appendChild(badge);
    badge.src = BADGE_DIR + lang + ".webp";
  }

  function init() {
    const listing = configuredListing();
    const entries = [];
    document.querySelectorAll("[data-play-store-link]").forEach((link) => {
      if (listing) link.href = listing;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.hidden = false;
      if (!link.hasAttribute("data-play-badge")) return;
      entries.push({
        link,
        text: link.querySelector(".nr-play-badge-text"),
        badge: null,
        request: 0,
      });
    });
    entries.forEach(showBadge);
    document.addEventListener("niarim:langchange", () => {
      entries.forEach(showBadge);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
