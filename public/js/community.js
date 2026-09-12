/**
 * NIARIM みんなの作品を見るページ専用UI。
 */
(function () {
  "use strict";

  function initTabs() {
    var buttons = document.querySelectorAll("[data-community-tab]");
    if (!buttons.length) return;

    function select(active) {
      buttons.forEach(function (button) {
        var selected = button === active;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    }

    var initial = document.querySelector("[data-community-tab].is-active");
    select(initial || buttons[0]);

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        select(btn);
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
