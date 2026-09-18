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

    // Match the in-app Help interaction: entries are a single vertical list
    // and each title toggles its explanation open/closed.
    categories.forEach(function (category) {
      category.querySelectorAll("[data-help-card]").forEach(function (card, index) {
        var title = card.querySelector("h3");
        var body = card.querySelector("p");
        if (!title || !body) return;

        var panelId = (category.id || "help") + "-entry-" + index;
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-expanded", "false");
        card.setAttribute("aria-controls", panelId);
        body.id = panelId;

        function toggle() {
          card.setAttribute(
            "aria-expanded",
            card.getAttribute("aria-expanded") === "true" ? "false" : "true",
          );
        }

        card.addEventListener("click", toggle);
        card.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        });
      });
    });

    if (noResults) {
      noResults.setAttribute("role", "status");
      noResults.setAttribute("aria-live", "polite");
      noResults.setAttribute("aria-atomic", "true");
    }

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
          card.hidden = !match;
          // Search results expose matching explanations immediately; clearing
          // the query restores the normal collapsed app-help presentation.
          card.setAttribute("aria-expanded", query && match ? "true" : "false");
          if (match) categoryHasVisible = true;
        });

        category.hidden = !categoryHasVisible;
        if (categoryHasVisible) anyVisible = true;
      });

      if (noResults) noResults.classList.toggle("is-visible", !anyVisible);
    }

    input.addEventListener("input", apply);
    // Category navigation leaves the search results and opens the full section.
    // Restore its content before native/smooth anchor scrolling measures it.
    document
      .querySelectorAll('.feature-nav a[href^="#help-"]')
      .forEach(function (link) {
        link.addEventListener("click", function (event) {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          if (input.value) {
            input.value = "";
            apply();
          }
        });
      });
    // 言語切り替え後、検索文字列は保持したまま再フィルタする
    document.addEventListener("niarim:langchange", apply);
  }

  document.addEventListener("DOMContentLoaded", initHelpSearch);
})();
