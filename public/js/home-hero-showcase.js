(function () {
  "use strict";

  function workCard(title, author, views, bookmarks, duration, tone) {
    return (
      '<article class="hero-community-work ' + tone + '">' +
      '<div class="hero-community-thumb">' +
      '<span class="hero-community-play" aria-hidden="true"></span>' +
      '<span class="hero-community-bookmark" aria-hidden="true"></span>' +
      '<span class="hero-community-duration">' + duration + "</span>" +
      "</div>" +
      '<div class="hero-community-meta">' +
      "<strong>" + title + "</strong>" +
      '<span class="hero-community-author">' + author + "</span>" +
      '<span class="hero-community-stats"><span class="hero-community-view-icon" aria-hidden="true"></span><span>' + views + '</span><span class="hero-community-stat-bookmark" aria-hidden="true"></span><span>' + bookmarks + "</span></span>" +
      "</div></article>"
    );
  }

  function buildCommunityMini() {
    var screen = document.createElement("div");
    screen.className = "hero-community-mini hero-theme-violet";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML =
      '<div class="hero-community-appbar"><strong>作品広場</strong><div class="hero-community-actions"><span class="hero-community-action is-notification" aria-hidden="true"><i></i></span><span class="hero-community-action is-filter" aria-hidden="true"><i></i></span><span class="hero-community-action is-search" aria-hidden="true"><i></i></span><span class="hero-community-action is-help" aria-hidden="true">?</span></div></div>' +
      '<div class="hero-community-tabs"><span class="is-active">新着</span><span>ランキング</span><span>お気に入り作者</span></div>' +
      '<div class="hero-community-grid">' +
      workCard("夜明けの冒険", "あにめ工房ミラ", "1.2万", "326", "0:42", "is-a") +
      workCard("小さな街", "sakura_draws", "8,921", "211", "1:08", "is-b") +
      workCard("静かな記憶", "ペン先ラボ", "5,306", "148", "0:31", "is-c") +
      workCard("雨上がりの手紙", "よあけスタジオ", "3,744", "96", "0:55", "is-d") +
      "</div>" +
      '<span class="hero-community-fab"><i aria-hidden="true"></i><b>自分の投稿</b></span>';
    return screen;
  }

  function appendCommunityAppPreview() {
    var scroller = document.querySelector(".screenshot-scroller");
    if (!scroller || scroller.querySelector(".screenshot-card-community")) return;
    var card = document.createElement("div");
    card.className = "screenshot-card screenshot-card-community";
    card.setAttribute("data-mock-theme", "shot-community");
    card.appendChild(buildCommunityMini());
    scroller.appendChild(card);
  }

  function resetPreviewFit(node) {
    ["--fd-fit", "transform", "transform-origin", "width", "height", "margin", "margin-inline", "margin-left", "margin-right", "margin-bottom"].forEach(function (name) {
      node.style.removeProperty(name);
    });
  }

  function clonePreviewCard(index, themeClass) {
    var source = document.querySelector(".screenshot-scroller .screenshot-card:nth-child(" + index + ") > :first-child");
    if (!source) return null;
    var clone = source.cloneNode(true);
    clone.classList.add("hero-app-preview-source", themeClass);
    resetPreviewFit(clone);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach(function (node) { node.removeAttribute("id"); });
    ["--fd-accent", "--fd-ink", "--fd-text", "--fd-muted", "--fd-outside", "--fd-surface", "--fd-bg", "--fd-panel", "--fd-panel-2"].forEach(function (name) {
      clone.style.setProperty(name, "inherit", "important");
    });
    return clone;
  }

  function buildPreviewCard(className, content, themeClass) {
    if (!content) return null;
    var card = document.createElement("div");
    card.className = "hero-preview-card " + className + " " + themeClass;
    card.setAttribute("aria-hidden", "true");
    card.appendChild(content);
    return card;
  }

  function fitHeroPreview(card) {
    var source = card && card.querySelector(":scope > .hero-app-preview-source");
    if (!source) return;
    var width = card.getBoundingClientRect().width;
    if (!width) return;

    card.style.setProperty("display", "block", "important");
    card.style.setProperty("border", "0", "important");
    card.style.setProperty("box-shadow", "0 14px 30px rgba(25, 22, 31, 0.12)", "important");

    source.style.setProperty("position", "relative", "important");
    source.style.setProperty("inset", "0 auto auto 0", "important");
    source.style.setProperty("align-self", "start", "important");
    source.style.setProperty("justify-self", "start", "important");
    source.style.setProperty("width", "320px", "important");
    source.style.setProperty("height", "569px", "important");
    source.style.setProperty("max-width", "none", "important");
    source.style.setProperty("max-height", "none", "important");
    source.style.setProperty("margin", "0", "important");
    source.style.setProperty("border", "0", "important");
    source.style.setProperty("border-radius", "0", "important");
    source.style.setProperty("box-shadow", "none", "important");
    source.style.setProperty("transform-origin", "top left", "important");
    source.style.setProperty("transform", "scale(" + width / 320 + ")", "important");
  }

  function fitHeroPreviews(showcase) {
    if (!showcase) return;
    var cards = showcase.querySelectorAll(".hero-preview-card");
    Array.prototype.forEach.call(cards, fitHeroPreview);

    /* Card width is the only input to the fit calculation. ResizeObserver
       already covers viewport/layout changes, so the former MutationObservers,
       window resize listener and three delayed refits only repeated the same
       style writes and layout reads. */
    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { fitHeroPreview(entry.target); });
      });
      Array.prototype.forEach.call(cards, function (card) { observer.observe(card); });
    }
  }

  function initHeroShowcase() {
    var hero = document.querySelector(".hero");
    var container = hero && hero.querySelector(":scope > .container");
    if (!hero || !container) return;

    appendCommunityAppPreview();
    if (container.querySelector(":scope > .hero-showcase")) return;

    var canvas = clonePreviewCard(1, "hero-theme-ocean");
    var timeline = clonePreviewCard(2, "hero-theme-sand");
    if (!canvas || !timeline) return;

    var originalHeroVisual = container.querySelector(":scope > .hero-visual");
    if (originalHeroVisual) originalHeroVisual.remove();

    var showcase = document.createElement("div");
    showcase.className = "hero-showcase";
    showcase.setAttribute("aria-label", "NIARIM app previews");
    showcase.appendChild(buildPreviewCard("hero-preview-canvas", canvas, "hero-theme-ocean"));
    showcase.appendChild(buildPreviewCard("hero-preview-timeline", timeline, "hero-theme-sand"));
    showcase.appendChild(buildPreviewCard("hero-preview-community", buildCommunityMini(), "hero-theme-violet"));
    container.appendChild(showcase);

    requestAnimationFrame(function () { fitHeroPreviews(showcase); });
  }

  if (document.readyState === "complete") initHeroShowcase();
  else window.addEventListener("load", initHeroShowcase, { once: true });
})();
