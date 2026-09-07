(function () {
  "use strict";

  function workCard(title, author, views, bookmarks, duration, tone) {
    return (
      '<article class="hero-community-work ' + tone + '">' +
      '<div class="hero-community-thumb">' +
      '<span class="hero-community-play" aria-hidden="true"></span>' +
      '<span class="hero-community-bookmark" aria-hidden="true"></span>' +
      '<span class="hero-community-duration">' + duration + '</span>' +
      '</div>' +
      '<div class="hero-community-meta">' +
      '<strong>' + title + '</strong>' +
      '<span class="hero-community-author">' + author + '</span>' +
      '<span class="hero-community-stats"><span class="hero-community-view-icon" aria-hidden="true"></span><span>' + views + '</span><span class="hero-community-stat-bookmark" aria-hidden="true"></span><span>' + bookmarks + '</span></span>' +
      '</div>' +
      '</article>'
    );
  }

  /* NIARIM/dev_branch の CommunityScreen / CommunityWorkCard を縮小再現。
     AppBar → actions → TabBar → 16:9作品カード → extended FAB の順序・構造を
     アプリ本体と揃える。ヒーロー用の架空ナビや独自見出しは置かない。 */
  function buildCommunityMini() {
    var screen = document.createElement("div");
    screen.className = "hero-community-mini";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML =
      '<div class="hero-community-appbar">' +
      '<strong>作品広場</strong>' +
      '<div class="hero-community-actions">' +
      '<span class="hero-community-action is-notification" aria-hidden="true"><i></i></span>' +
      '<span class="hero-community-action is-filter" aria-hidden="true"><i></i></span>' +
      '<span class="hero-community-action is-search" aria-hidden="true"><i></i></span>' +
      '<span class="hero-community-action is-help" aria-hidden="true">?</span>' +
      '</div>' +
      '</div>' +
      '<div class="hero-community-tabs">' +
      '<span class="is-active">新着</span>' +
      '<span>ランキング</span>' +
      '<span>お気に入り作者</span>' +
      '</div>' +
      '<div class="hero-community-grid">' +
      workCard("夜明けの冒険", "あにめ工房ミラ", "1.2万", "326", "0:42", "is-a") +
      workCard("小さな街", "sakura_draws", "8,921", "211", "1:08", "is-b") +
      workCard("静かな記憶", "ペン先ラボ", "5,306", "148", "0:31", "is-c") +
      workCard("雨上がりの手紙", "よあけスタジオ", "3,744", "96", "0:55", "is-d") +
      '</div>' +
      '<span class="hero-community-fab"><i aria-hidden="true"></i><b>自分の投稿</b></span>';
    return screen;
  }

  function buildPreviewCard(className, content) {
    var card = document.createElement("div");
    card.className = "hero-preview-card " + className;
    card.setAttribute("aria-hidden", "true");
    card.appendChild(content);
    return card;
  }

  function initHeroShowcase() {
    var hero = document.querySelector(".hero");
    var container = hero && hero.querySelector(":scope > .container");
    var canvasVisual = container && container.querySelector(":scope > .hero-visual");
    if (!hero || !container || !canvasVisual) return;
    if (container.querySelector(":scope > .hero-showcase")) return;

    var showcase = document.createElement("div");
    showcase.className = "hero-showcase";
    showcase.setAttribute("aria-label", "NIARIM app previews");

    showcase.appendChild(buildPreviewCard("hero-preview-canvas", canvasVisual));

    var timelineSource = document.querySelector(
      ".feature-row.is-reverse .feature-media .feature-diagram",
    );
    if (timelineSource) {
      var timeline = timelineSource.cloneNode(true);
      timeline.classList.add("hero-timeline-mini");
      timeline.removeAttribute("aria-label");
      timeline.querySelectorAll("[id]").forEach(function (node) {
        node.removeAttribute("id");
      });
      showcase.appendChild(
        buildPreviewCard("hero-preview-timeline", timeline),
      );
    }

    showcase.appendChild(
      buildPreviewCard("hero-preview-community", buildCommunityMini()),
    );

    container.appendChild(showcase);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroShowcase, { once: true });
  } else {
    initHeroShowcase();
  }
})();
