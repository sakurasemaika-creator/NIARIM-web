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

    const resultCount = document.getElementById("help-result-count");
    const cardsByCategory = new Map(categories.map(category => [
      category, Array.from(category.querySelectorAll("[data-help-card]")),
    ]));
    let openBeforeSearch = null;

    // Sort from the catalogue order so ties and a cleared search are stable.
    function orderResults(nodes, ranks, selector) {
      const parent = nodes[0].parentElement;
      let next = parent.querySelector(selector);
      for (const node of [...nodes].sort((a, b) => ranks.get(a) - ranks.get(b))) {
        if (node === next) next = next.nextElementSibling;
        else parent.insertBefore(node, next);
      }
    }

    function matchRank(card, category, terms, query) {
      if (!query) return 0;
      const title = foldSearchText(card.querySelector("h3").textContent.trim());
      if (title === query) return 0;
      if (terms.every(term => title.includes(term))) return 1;
      const heading = title + " " + category;
      if (terms.every(term => heading.includes(term))) return 2;
      const text = heading + " " + foldSearchText(card.querySelector("p").textContent);
      return terms.every(term => text.includes(term)) ? 3 : Infinity;
    }

    function apply() {
      const query = foldSearchText(input.value).trim();
      const terms = query ? query.split(/\s+/) : [];
      if (clear) clear.hidden = !input.value;
      if (!query && !openBeforeSearch) return;
      if (query && !openBeforeSearch) {
        openBeforeSearch = new Set(document.querySelectorAll("[data-help-card][open]"));
      }

      const ranks = new Map();
      let matches = 0;
      let best = Infinity;
      let bestCount = 0;
      for (const [category, cards] of cardsByCategory) {
        const heading = foldSearchText(category.querySelector("h2").textContent);
        let categoryRank = Infinity;
        for (const card of cards) {
          const rank = matchRank(card, heading, terms, query);
          ranks.set(card, rank);
          card.hidden = !Number.isFinite(rank);
          if (card.hidden) continue;
          matches++;
          categoryRank = Math.min(categoryRank, rank);
          if (rank < best) {
            best = rank;
            bestCount = 1;
          } else if (rank === best) {
            bestCount++;
          }
        }
        ranks.set(category, categoryRank);
        category.hidden = !Number.isFinite(categoryRank);
        orderResults(cards, ranks, "[data-help-card]");
      }
      orderResults(categories, ranks, "[data-help-category]");

      // A single clear answer opens immediately. Broad queries remain scannable.
      const openBest = matches === 1 || (bestCount === 1 && best < 3);
      for (const cards of cardsByCategory.values()) {
        for (const card of cards) {
          card.open = query ? openBest && ranks.get(card) === best : openBeforeSearch.has(card);
        }
      }
      if (!query) openBeforeSearch = null;
      if (noResults) noResults.hidden = !query || matches > 0;
      if (resultCount) {
        const label = query && matches
          ? window.NIARIM_I18N.translate(document.documentElement.lang, "help.resultCount")
              .replace("{count}", String(matches))
          : "";
        if (resultCount.textContent !== label) resultCount.textContent = label;
      }
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
