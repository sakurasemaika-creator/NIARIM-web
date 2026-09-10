(function () {
  "use strict";

  function workCard(title, author, views, bookmarks, duration, tone) {
    return (
      '<article class="hero-community-work ' +
      tone +
      '">' +
      '<div class="hero-community-thumb">' +
      '<span class="hero-community-play" aria-hidden="true"></span>' +
      '<span class="hero-community-bookmark" aria-hidden="true"></span>' +
      '<span class="hero-community-duration">' +
      duration +
      "</span>" +
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
    ["--fd-fit", "transform", "transform-origin", "width", "height", "margin", "margin-inline", "margin-left", "margin-right", "margin-bottom"].forEach(function (name) { node.style.removeProperty(name); });
  }

  function clonePreviewCard(index, themeClass) {
    var source = document.querySelector(".screenshot-scroller .screenshot-card:nth-child(" + index + ") > :first-child");
    if (!source) return null;
    var clone = source.cloneNode(true);
    clone.classList.add("hero-app-preview-source", themeClass);
    resetPreviewFit(clone);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach(function (node) { node.removeAttribute("id"); });
    ["--fd-accent", "--fd-ink", "--fd-text", "--fd-muted", "--fd-outside", "--fd-surface", "--fd-bg", "--fd-panel", "--fd-panel-2"].forEach(function (name) { clone.style.setProperty(name, "inherit", "important"); });
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
    if (!card) return;
    var source = card.querySelector(":scope > .hero-app-preview-source");
    if (!source) return;
    var width = card.getBoundingClientRect().width;
    if (!width) return;
    var zoom = width / 320;
    card.style.setProperty("display", "block", "important");
    card.style.setProperty("border", "0", "important");
    card.style.setProperty("box-shadow", "0 14px 30px rgba(25, 22, 31, 0.12)", "important");
    source.style.setProperty("position", "relative", "important");
    source.style.setProperty("left", "0", "important");
    source.style.setProperty("right", "auto", "important");
    source.style.setProperty("inset-inline-start", "0", "important");
    source.style.setProperty("inset-inline-end", "auto", "important");
    source.style.setProperty("align-self", "start", "important");
    source.style.setProperty("justify-self", "start", "important");
    source.style.setProperty("width", "320px", "important");
    source.style.setProperty("height", "569px", "important");
    source.style.setProperty("max-width", "none", "important");
    source.style.setProperty("max-height", "none", "important");
    source.style.setProperty("margin", "0", "important");
    source.style.setProperty("margin-inline", "0", "important");
    source.style.setProperty("margin-inline-start", "0", "important");
    source.style.setProperty("margin-inline-end", "0", "important");
    source.style.setProperty("margin-left", "0", "important");
    source.style.setProperty("margin-right", "0", "important");
    source.style.setProperty("border", "0", "important");
    source.style.setProperty("border-radius", "0", "important");
    source.style.setProperty("box-shadow", "none", "important");
    source.style.setProperty("transform-origin", "top left", "important");
    source.style.setProperty("transform", "scale(" + zoom + ")", "important");
  }

  function fitHeroPreviews(showcase) {
    if (!showcase) return;
    var cards = showcase.querySelectorAll(".hero-preview-card");
    Array.prototype.forEach.call(cards, fitHeroPreview);
    if (typeof MutationObserver === "function") {
      Array.prototype.forEach.call(cards, function (card) {
        var source = card.querySelector(":scope > .hero-app-preview-source");
        if (!source) return;
        var styleObserver = new MutationObserver(function () {
          styleObserver.disconnect(); fitHeroPreview(card);
          styleObserver.observe(source, { attributes: true, attributeFilter: ["style"] });
        });
        styleObserver.observe(source, { attributes: true, attributeFilter: ["style"] });
      });
    }
    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(function (entries) { entries.forEach(function (entry) { fitHeroPreview(entry.target); }); });
      Array.prototype.forEach.call(cards, function (card) { observer.observe(card); });
    }
    window.addEventListener("resize", function () { requestAnimationFrame(function () { Array.prototype.forEach.call(cards, fitHeroPreview); }); });
    [0, 120, 400].forEach(function (delay) { window.setTimeout(function () { Array.prototype.forEach.call(cards, fitHeroPreview); }, delay); });
  }

  function installCompactHeroPolish() {
    if (document.getElementById("niarim-compact-hero-polish")) return;
    var style = document.createElement("style");
    style.id = "niarim-compact-hero-polish";
    style.textContent =
      "html body .hero-preview-card{position:relative!important}" +
      "html body .hero-preview-card::after{content:'';position:absolute;inset:0;box-sizing:border-box;border:6px solid var(--hero-bezel);border-radius:inherit;pointer-events:none;z-index:5}" +
      "html body .hero-preview-community::after{display:none!important}" +
      "@media (max-width:339px){" +
      "html body .hero-title{font-size:clamp(3.15rem,14.8vw,3.5rem)!important;line-height:.92!important}" +
      "html body .hero-subtitle{font-size:1.12rem!important;line-height:1.24!important}" +
      "html body .hero-lead{font-size:.8rem!important;line-height:1.44!important}" +
      "html body .hero .container{grid-template-columns:minmax(0,1fr) 144px!important;column-gap:.5rem!important}" +
      "html body .hero-showcase{width:144px!important;max-width:144px!important}" +
      "}" +
      "@media (min-width:340px) and (max-width:559px){" +
      "html body .hero{padding-top:.9rem!important;padding-bottom:.9rem!important}" +
      "html body .hero-title{font-size:clamp(5.05rem,20.5vw,6rem)!important;line-height:.84!important}" +
      "html body .hero-subtitle{font-size:clamp(1.82rem,6.7vw,2.1rem)!important;line-height:1.12!important}" +
      "html body .hero-lead{font-size:clamp(.98rem,3.7vw,1.1rem)!important;line-height:1.42!important}" +
      "html body .hero .container{grid-template-columns:minmax(0,1fr) clamp(164px,46vw,188px)!important;column-gap:clamp(.5rem,2.2vw,.75rem)!important}" +
      "html body .hero-showcase{width:clamp(164px,46vw,188px)!important;max-width:188px!important;justify-self:end!important}" +
      "html body .hero-actions .btn{min-height:43px!important;font-size:clamp(.77rem,2.8vw,.88rem)!important}" +
      "html body .hero-bridge{font-size:clamp(.68rem,2.25vw,.78rem)!important}" +
      "}";
    document.head.appendChild(style);
  }

  function initHeroShowcase() {
    var hero = document.querySelector(".hero");
    var container = hero && hero.querySelector(":scope > .container");
    if (!hero || !container) return;
    installCompactHeroPolish();
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
    var canvasCard = buildPreviewCard("hero-preview-canvas", canvas, "hero-theme-ocean");
    var timelineCard = buildPreviewCard("hero-preview-timeline", timeline, "hero-theme-sand");
    var communityCard = buildPreviewCard("hero-preview-community", buildCommunityMini(), "hero-theme-violet");
    showcase.appendChild(canvasCard); showcase.appendChild(timelineCard); showcase.appendChild(communityCard);
    container.appendChild(showcase);
    requestAnimationFrame(function () { fitHeroPreviews(showcase); });
  }

  if (document.readyState === "complete") initHeroShowcase();
  else window.addEventListener("load", initHeroShowcase, { once: true });
})();
