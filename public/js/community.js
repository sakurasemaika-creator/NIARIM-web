/**
 * NIARIM みんなの作品を見るページ専用UI。
 */
(function () {
  "use strict";

  function initTabs() {
    var buttons = document.querySelectorAll("[data-community-tab]");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (button) {
          button.classList.toggle("is-active", button === btn);
        });
        // 実データ未実装のため、タブ切り替えは見た目のみ（プレースホルダー表示は共通）。
      });
    });
  }

  function ensureNineCommunityTiles() {
    var gallery = document.querySelector(".community-gallery");
    if (!gallery) return;

    var cards = gallery.querySelectorAll(".community-card:not(.is-more-cta)");
    var more = gallery.querySelector(".community-card.is-more-cta");
    if (cards.length !== 8 || !more) return;

    var ninth = cards[cards.length - 1].cloneNode(true);
    var badge = ninth.querySelector(".rank-badge");
    if (badge) badge.textContent = "9";
    gallery.insertBefore(ninth, more);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTabs();
    ensureNineCommunityTiles();
  });
})();
