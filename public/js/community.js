/**
 * NIARIM みんなの作品を見るページ タブ切り替え（プレースホルダー表示のみ）
 */
(function () {
  "use strict";

  function initTabs() {
    var buttons = document.querySelectorAll("[data-community-tab]");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        // 実データ未実装のため、タブ切り替えは見た目のみ（プレースホルダー表示は共通）。
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initTabs);
})();
