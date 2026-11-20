/**
 * NIARIM 使い方ガイドページ 検索フィルタ
 * 表示中の言語のタイトル・説明文・カテゴリ名で部分一致検索する。
 */
(function () {
  "use strict";

  // Match the app's Help search: fold width, kana and typographic punctuation.
  function foldSearchText(text) {
    return text
      .normalize("NFKC")
      .replace(/[’‘ʼ‛′]/g, "'")
      .replace(/[ァ-ヶ]/g, function (kana) {
        return String.fromCharCode(kana.charCodeAt(0) - 0x60);
      })
      .toLowerCase();
  }

  function initHelpSearch() {
    var input = document.getElementById("help-search-input");
    var clear = document.getElementById("help-search-clear");
    var noResults = document.getElementById("help-no-results");
    var categories = Array.prototype.slice.call(
      document.querySelectorAll("[data-help-category]"),
    );
    if (!input || !categories.length) return;

    // Keep the existing fragment IDs on the explanation of each topic.
    categories.forEach(function (category) {
      category.querySelectorAll("[data-help-card] p").forEach(function (body, index) {
        body.id = (category.id || "help") + "-entry-" + index;
      });
    });

    if (noResults) {
      noResults.setAttribute("role", "status");
      noResults.setAttribute("aria-live", "polite");
      noResults.setAttribute("aria-atomic", "true");
    }

    var openBeforeSearch = null;
    function apply() {
      var query = foldSearchText(input.value).trim();
      var terms = query ? query.split(/\s+/) : [];
      var anyVisible = false;
      if (query && !openBeforeSearch) {
        openBeforeSearch = new Set(document.querySelectorAll("[data-help-card][open]"));
      }
      if (clear) clear.hidden = input.value.length === 0;

      categories.forEach(function (category) {
        var heading = category.querySelector("h2").textContent;
        var categoryHasVisible = false;
        category.querySelectorAll("[data-help-card]").forEach(function (card) {
          var text = foldSearchText([
            heading, card.querySelector("h3").textContent, card.querySelector("p").textContent
          ].join(" "));
          var match = terms.every(function (term) { return text.includes(term); });
          card.hidden = !match;
          if (query) card.open = match;
          else if (openBeforeSearch) card.open = openBeforeSearch.has(card);
          if (match) categoryHasVisible = true;
        });

        category.hidden = !categoryHasVisible;
        if (categoryHasVisible) anyVisible = true;
      });

      if (!query) openBeforeSearch = null;
      if (noResults) noResults.classList.toggle("is-visible", !anyVisible);
    }

    function clearSearch() {
      input.value = "";
      apply();
      input.focus();
    }
    if (clear) clear.addEventListener("click", clearSearch);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !event.isComposing && input.value) {
        event.preventDefault();
        clearSearch();
      }
    });
    input.addEventListener("input", apply);
    if (input.value) apply();
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
    function revealLinkedTopic() {
      var summary = document.getElementById(window.location.hash.slice(1));
      if (!summary || !summary.matches("[data-help-card] > summary")) return;
      if (input.value) {
        input.value = "";
        apply();
      }
      summary.parentElement.open = true;
      summary.focus({ preventScroll: true });
      summary.scrollIntoView({ block: "start" });
    }
    window.addEventListener("hashchange", revealLinkedTopic);
    revealLinkedTopic();

    // 言語切り替え後、検索文字列は保持したまま再フィルタする
    document.addEventListener("niarim:langchange", apply);
  }

  document.addEventListener("DOMContentLoaded", initHelpSearch);
})();
