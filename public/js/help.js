/**
 * NIARIM 使い方ガイドページ 検索フィルタ
 * 入力されたキーワードで、表示中の言語のタイトル・説明文に対して
 * 部分一致検索を行い、該当しないカード・カテゴリを非表示にする。
 */
(function () {
  "use strict";

  function initHelpSearch() {
    var input = document.getElementById("help-search-input");
    var noResults = document.getElementById("help-no-results");
    var categories = Array.prototype.slice.call(
      document.querySelectorAll("[data-help-category]"),
    );
    if (!input || !categories.length) return;

    function apply() {
      var query = input.value.trim().toLowerCase();
      var anyVisible = false;

      categories.forEach(function (category) {
        var cards = Array.prototype.slice.call(
          category.querySelectorAll("[data-help-card]"),
        );
        var categoryHasVisible = false;

        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var match = !query || text.indexOf(query) > -1;
          card.style.display = match ? "" : "none";
          if (match) categoryHasVisible = true;
        });

        category.style.display = categoryHasVisible ? "" : "none";
        if (categoryHasVisible) anyVisible = true;
      });

      if (noResults) noResults.classList.toggle("is-visible", !anyVisible);
    }

    input.addEventListener("input", apply);
    // 言語切り替え後、検索文字列は保持したまま再フィルタする
    document.addEventListener("niarim:langchange", apply);
  }

  document.addEventListener("DOMContentLoaded", initHelpSearch);
})();
