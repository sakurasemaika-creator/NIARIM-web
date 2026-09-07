(function () {
  "use strict";

  function workCard(title, author, views, bookmarks, duration, tone) {
    return (
      '<article class="hero-community-work ' + tone + '">' +
      '<div class="hero-community-thumb">' +
      '<span class="hero-community-play">▶</span>' +
      '<span class="hero-community-bookmark">♡</span>' +
      '<span class="hero-community-duration">' + duration + '</span>' +
      '</div>' +
      '<div class="hero-community-meta">' +
      '<strong>' + title + '</strong>' +
      '<span class="hero-community-author">' + author + '</span>' +
      '<span class="hero-community-stats">▶ ' + views + '　◆ ' + bookmarks + '</span>' +
      '</div>' +
      '</article>'
    );
  }

  /* NIARIM/dev_branch CommunityScreen + CommunityWorkCard の縮小再現。 */
  function buildCommunityMini() {
    var screen = document.createElement("div");
    screen.className = "hero-community-mini";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML =
      '<div class="hero-community-appbar">' +
      '<strong>作品広場</strong>' +
      '<div class="hero-community-actions">' +
      '<span>♢</span>' +
      '<span class="hero-community-filter">⌁<small>総合</small>⌄</span>' +
      '<span>⌕</span>' +
      '<span>?</span>' +
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
      '<span class="hero-community-fab"><b>▣</b>自分の投稿</span>';
    return screen;
  }

  function buildPreviewCard(label, className, content) {
    var card = document.createElement("div");
    card.className = "hero-preview-card " + className;
    card.setAttribute("aria-hidden", "true");
    var labelEl = document.createElement("span");
    labelEl.className = "hero-preview-label";
    labelEl.textContent = label;
    card.appendChild(labelEl);
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

    var canvasCard = document.createElement("div");
    canvasCard.className = "hero-preview-card hero-preview-canvas";
    var canvasLabel = document.createElement("span");
    canvasLabel.className = "hero-preview-label";
    canvasLabel.textContent = "Canvas";
    canvasCard.appendChild(canvasLabel);
    canvasCard.appendChild(canvasVisual);
    showcase.appendChild(canvasCard);

    var timelineSource = document.querySelector(
      ".feature-row.is-reverse .feature-media .feature-diagram",
    );
    if (timelineSource) {
      var timeline = timelineSource.cloneNode(true);
      timeline.classList.add("hero-timeline-mini");
      showcase.appendChild(
        buildPreviewCard("Timeline", "hero-preview-timeline", timeline),
      );
    }

    showcase.appendChild(
      buildPreviewCard(
        "Community",
        "hero-preview-community",
        buildCommunityMini(),
      ),
    );

    container.appendChild(showcase);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroShowcase, { once: true });
  } else {
    initHeroShowcase();
  }
})();
