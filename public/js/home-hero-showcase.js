(function () {
  "use strict";

  function icon(name, className) {
    return (
      '<svg class="hero-community-icon ' + (className || "") + '" aria-hidden="true">' +
      '<use href="/assets/icons/ui/sprite.svg#' + name + '"></use>' +
      "</svg>"
    );
  }

  function workCard(title, author, views, bookmarks, duration, tone) {
    return (
      '<article class="hero-community-work ' + tone + '">' +
      '<div class="hero-community-thumb">' +
      '<span class="hero-community-play">▶</span>' +
      '<span class="hero-community-bookmark" aria-hidden="true"></span>' +
      '<span class="hero-community-duration">' + duration + '</span>' +
      '</div>' +
      '<div class="hero-community-meta">' +
      '<strong>' + title + '</strong>' +
      '<span class="hero-community-author">' + author + '</span>' +
      '<span class="hero-community-stats"><span>▶ ' + views + '</span><span class="hero-community-bookmark-stat">◆ ' + bookmarks + '</span></span>' +
      '</div>' +
      '</article>'
    );
  }

  /* NIARIM/dev_branch CommunityScreen + CommunityWorkCard +
     VideoTypeFilterButton の縮小再現。
     AppBar → actions → TabBar → 16:9 work grid → extended FAB の順序を本体と一致させる。 */
  function buildCommunityMini() {
    var screen = document.createElement("div");
    screen.className = "hero-community-mini";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML =
      '<div class="hero-community-appbar">' +
      '<strong>作品広場</strong>' +
      '<div class="hero-community-actions">' +
      '<span class="hero-community-action hero-community-notification"><i></i></span>' +
      '<span class="hero-community-video-filter">' +
      '<i class="hero-community-filter-icon" aria-hidden="true"></i>' +
      '<span>総合</span>' +
      '<i class="hero-community-filter-arrow" aria-hidden="true"></i>' +
      '</span>' +
      '<span class="hero-community-action">' + icon("ic-search") + '</span>' +
      '<span class="hero-community-action">' + icon("ic-help_outline") + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="hero-community-tabs">' +
      '<span class="is-active">新着</span>' +
      '<span>ランキング</span>' +
      '<span>お気に入り作者</span>' +
      '</div>' +
      '<div class="hero-community-grid">' +
      workCard("夜明けの冒険", "あにめ工房ミラ", "12,480", "326", "0:42", "is-a") +
      workCard("小さな街", "sakura_draws", "8,921", "211", "1:08", "is-b") +
      workCard("静かな記憶", "ペン先ラボ", "5,306", "148", "0:31", "is-c") +
      workCard("雨上がりの手紙", "よあけスタジオ", "3,744", "96", "0:55", "is-d") +
      '</div>' +
      '<span class="hero-community-fab"><b class="hero-community-fab-icon">▣</b>自分の投稿</span>';
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
