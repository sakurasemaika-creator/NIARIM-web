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
      "<strong>" +
      title +
      "</strong>" +
      '<span class="hero-community-author">' +
      author +
      "</span>" +
      '<span class="hero-community-stats"><span class="hero-community-view-icon" aria-hidden="true"></span><span>' +
      views +
      '</span><span class="hero-community-stat-bookmark" aria-hidden="true"></span><span>' +
      bookmarks +
      "</span></span>" +
      "</div>" +
      "</article>"
    );
  }

  /* CommunityScreen / CommunityWorkCardの実装構造を、App Previewと同じ
     320:569の端末面へ縮小再現する。HeroとApp Previewで同じDOMを使い、
     片方だけ見た目が古くならないようにする。 */
  function buildCommunityMini() {
    var screen = document.createElement("div");
    screen.className = "hero-community-mini hero-theme-violet";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML =
      '<div class="hero-community-appbar">' +
      "<strong>作品広場</strong>" +
      '<div class="hero-community-actions">' +
      '<span class="hero-community-action is-notification" aria-hidden="true"><i></i></span>' +
      '<span class="hero-community-action is-filter" aria-hidden="true"><i></i></span>' +
      '<span class="hero-community-action is-search" aria-hidden="true"><i></i></span>' +
      '<span class="hero-community-action is-help" aria-hidden="true">?</span>' +
      "</div>" +
      "</div>" +
      '<div class="hero-community-tabs">' +
      '<span class="is-active">新着</span>' +
      "<span>ランキング</span>" +
      "<span>お気に入り作者</span>" +
      "</div>" +
      '<div class="hero-community-grid">' +
      workCard(
        "夜明けの冒険",
        "あにめ工房ミラ",
        "1.2万",
        "326",
        "0:42",
        "is-a",
      ) +
      workCard("小さな街", "sakura_draws", "8,921", "211", "1:08", "is-b") +
      workCard("静かな記憶", "ペン先ラボ", "5,306", "148", "0:31", "is-c") +
      workCard(
        "雨上がりの手紙",
        "よあけスタジオ",
        "3,744",
        "96",
        "0:55",
        "is-d",
      ) +
      "</div>" +
      '<span class="hero-community-fab"><i aria-hidden="true"></i><b>自分の投稿</b></span>';
    return screen;
  }

  function appendCommunityAppPreview() {
    var scroller = document.querySelector(".screenshot-scroller");
    if (!scroller || scroller.querySelector(".screenshot-card-community"))
      return;

    var card = document.createElement("div");
    card.className = "screenshot-card screenshot-card-community";
    card.setAttribute("data-mock-theme", "shot-community");
    card.appendChild(buildCommunityMini());
    scroller.appendChild(card);
  }

  /* App PreviewのfitMockScreens()は320x569の実寸DOMを各カード幅へ縮小し、
     transform/width/height/marginをinline !importantで保持する。
     そのままcloneするとHeroへ「複製元カード用の倍率」まで持ち込み、
     Heroのベゼル幅を変えたときに中身だけ別倍率のまま残る。
     Heroではベゼル自身の実幅を正本にするため、複製時にfit値を切り離す。 */
  function resetPreviewFit(node) {
    [
      "--fd-fit",
      "transform",
      "transform-origin",
      "width",
      "height",
      "margin-right",
      "margin-bottom",
    ].forEach(function (name) {
      node.style.removeProperty(name);
    });
  }

  function clonePreviewCard(index, themeClass) {
    var source = document.querySelector(
      ".screenshot-scroller .screenshot-card:nth-child(" +
        index +
        ") > :first-child",
    );
    if (!source) return null;
    var clone = source.cloneNode(true);
    clone.classList.add("hero-app-preview-source", themeClass);
    resetPreviewFit(clone);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach(function (node) {
      node.removeAttribute("id");
    });

    /* App Previewの各モックは複製元カード固有のカスタムプロパティを
       自身に保持している。Heroでは外側カードがOcean/Sandを正本とするので、
       複製元のピンク等が内部UIへ残らないようテーマ値を親から継承させる。 */
    [
      "--fd-accent",
      "--fd-ink",
      "--fd-text",
      "--fd-muted",
      "--fd-outside",
      "--fd-surface",
      "--fd-bg",
      "--fd-panel",
      "--fd-panel-2",
    ].forEach(function (name) {
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

  /* Canvas/Timelineは実アプリと同じ320x569 logical pxで組まれている。
     Heroでは外枠の実測幅を倍率の唯一の正本にし、内容を同じ比率で縮小する。
     actual borderで内容領域を狭めると横と縦で縮尺が変わるため、ベゼルは
     inset shadowとして上から描画し、画面面積そのものは320:569を保つ。 */
  function fitHeroPreview(card) {
    if (!card) return;
    var source = card.querySelector(":scope > .hero-app-preview-source");
    if (!source) return;
    var width = card.getBoundingClientRect().width;
    if (!width) return;
    var zoom = width / 320;

    card.style.setProperty("border", "0", "important");
    card.style.setProperty(
      "box-shadow",
      "inset 0 0 0 6px var(--hero-bezel), 0 14px 30px rgba(25, 22, 31, 0.12)",
      "important",
    );

    source.style.setProperty("width", "320px", "important");
    source.style.setProperty("height", "569px", "important");
    source.style.setProperty("max-width", "none", "important");
    source.style.setProperty("max-height", "none", "important");
    source.style.setProperty("margin", "0", "important");
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

    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          fitHeroPreview(entry.target);
        });
      });
      Array.prototype.forEach.call(cards, function (card) {
        observer.observe(card);
      });
    } else {
      window.addEventListener("resize", function () {
        Array.prototype.forEach.call(cards, fitHeroPreview);
      });
    }
  }

  /* SPはfirst fold下部にまだ余白がある。translate等で見かけだけを動かさず、
     タイトル・説明・端末そのものを一段大きくして情報密度を上げる。
     340px未満は横幅を守り、340px以上は端末を最大176pxまで育てる。 */
  function installCompactHeroPolish() {
    if (document.getElementById("niarim-compact-hero-polish")) return;
    var style = document.createElement("style");
    style.id = "niarim-compact-hero-polish";
    style.textContent =
      "@media (max-width:339px){" +
      "html body .hero-title{font-size:clamp(2.5rem,12vw,2.75rem)!important;line-height:.96!important}" +
      "html body .hero-subtitle{font-size:.96rem!important;line-height:1.3!important}" +
      "html body .hero-lead{font-size:.86rem!important;line-height:1.5!important}" +
      "html body .hero .container{grid-template-columns:minmax(0,1fr) 144px!important;column-gap:.5rem!important}" +
      "html body .hero-showcase{width:144px!important;max-width:144px!important}" +
      "}" +
      "@media (min-width:340px) and (max-width:559px){" +
      "html body .hero{padding-top:1rem!important;padding-bottom:1rem!important}" +
      "html body .hero-title{font-size:clamp(2.55rem,10.6vw,3.05rem)!important;line-height:.96!important}" +
      "html body .hero-subtitle{font-size:clamp(1rem,3.5vw,1.08rem)!important;line-height:1.3!important}" +
      "html body .hero-lead{font-size:clamp(.9rem,3.2vw,1rem)!important;line-height:1.52!important}" +
      "html body .hero .container{grid-template-columns:minmax(0,1fr) clamp(158px,44vw,176px)!important;column-gap:clamp(.55rem,2.4vw,.8rem)!important;row-gap:clamp(.48rem,2vw,.68rem)!important}" +
      "html body .hero-showcase{width:clamp(158px,44vw,176px)!important;max-width:176px!important;justify-self:end!important}" +
      "html body .hero-actions .btn{min-height:42px!important;font-size:clamp(.75rem,2.7vw,.86rem)!important}" +
      "html body .hero-bridge{font-size:clamp(.66rem,2.2vw,.76rem)!important}" +
      "}";
    document.head.appendChild(style);
  }

  function initHeroShowcase() {
    var hero = document.querySelector(".hero");
    var container = hero && hero.querySelector(":scope > .container");
    if (!hero || !container) return;

    installCompactHeroPolish();

    /* main.jsのnormalizeScreenMocks()がApp Previewをアプリ本体準拠へ
       差し替えた後に、作品広場を同じギャラリーへ追加する。 */
    appendCommunityAppPreview();

    if (container.querySelector(":scope > .hero-showcase")) return;

    /* main.jsのnormalizeScreenMocks()がApp Previewをアプリ本体準拠へ
       差し替えた後に、その完成版を複製する。Hero側で別実装を持たない。 */
    var canvas = clonePreviewCard(1, "hero-theme-ocean");
    var timeline = clonePreviewCard(2, "hero-theme-sand");
    if (!canvas || !timeline) return;

    var originalHeroVisual = container.querySelector(":scope > .hero-visual");
    if (originalHeroVisual) originalHeroVisual.remove();

    var showcase = document.createElement("div");
    showcase.className = "hero-showcase";
    showcase.setAttribute("aria-label", "NIARIM app previews");

    var canvasCard = buildPreviewCard(
      "hero-preview-canvas",
      canvas,
      "hero-theme-ocean",
    );
    var timelineCard = buildPreviewCard(
      "hero-preview-timeline",
      timeline,
      "hero-theme-sand",
    );
    var communityCard = buildPreviewCard(
      "hero-preview-community",
      buildCommunityMini(),
      "hero-theme-violet",
    );

    showcase.appendChild(canvasCard);
    showcase.appendChild(timelineCard);
    showcase.appendChild(communityCard);
    container.appendChild(showcase);

    requestAnimationFrame(function () {
      fitHeroPreviews(showcase);
    });
  }

  /* App Previewのコード検証済みDOMはmain.jsのDOMContentLoaded処理で作られる。
     その後が保証されるwindow.loadで複製し、静的HTMLの古いモックを拾わない。 */
  if (document.readyState === "complete") {
    initHeroShowcase();
  } else {
    window.addEventListener("load", initHeroShowcase, { once: true });
  }
})();
