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

  function resetPreviewFit(clone) {
    /* App Preview側のfitMockScreens()は、そのカード自身の実寸へ収めるため
       width/height/transform等をインライン!importantで付ける。Heroでは
       別の320:569ベゼルへ入れ直すため、そのfit結果までcloneすると外枠と
       内部画面が別倍率になってしまう。DOM内容だけを再利用し、Heroの
       実際のベゼル寸法に対して改めてfitする。 */
    [
      "width",
      "height",
      "max-width",
      "max-height",
      "margin-bottom",
      "margin-right",
      "transform",
      "transform-origin",
      "position",
      "left",
      "top",
    ].forEach(function (name) {
      clone.style.removeProperty(name);
    });
    clone.classList.remove("is-fit-scaled");
  }

  function fitHeroPreviewCard(card) {
    var source = card.querySelector(":scope > .hero-app-preview-source");
    if (!source || card.clientWidth < 1 || card.clientHeight < 1) return;

    resetPreviewFit(source);
    var width = card.clientWidth;
    var height = card.clientHeight;
    var scale = 1;

    /* Heroカードは外枠寸法を正本とする。内部DOMはその寸法より広い仮想面へ
       レイアウトしてから全体を等比縮小することで、ツールバー等の固定px
       UIも含めて外枠と同じ基準で縮む。元App Previewで計算済みの倍率を
       使い回さず、現在のカード寸法から最大4回だけ収束させる。 */
    for (var pass = 0; pass < 4; pass += 1) {
      var layoutWidth = width / scale;
      var layoutHeight = height / scale;
      source.style.setProperty("position", "absolute", "important");
      source.style.setProperty("left", "0", "important");
      source.style.setProperty("top", "0", "important");
      source.style.setProperty("width", layoutWidth + "px", "important");
      source.style.setProperty("height", layoutHeight + "px", "important");
      source.style.setProperty("max-width", "none", "important");
      source.style.setProperty("max-height", "none", "important");
      source.style.setProperty("transform-origin", "top left", "important");
      source.style.setProperty(
        "transform",
        "scale(" + scale + ")",
        "important",
      );

      var overflow = Math.max(
        source.scrollWidth / Math.max(1, source.clientWidth),
        source.scrollHeight / Math.max(1, source.clientHeight),
      );
      if (overflow <= 1.005) break;
      scale = Math.max(0.42, scale / overflow);
    }

    source.classList.add("is-fit-scaled");
  }

  function fitHeroShowcase(showcase) {
    showcase.querySelectorAll(".hero-preview-card").forEach(function (card) {
      fitHeroPreviewCard(card);
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
    resetPreviewFit(clone);
    clone.classList.add("hero-app-preview-source", themeClass);
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

  function initHeroShowcase() {
    var hero = document.querySelector(".hero");
    var container = hero && hero.querySelector(":scope > .container");
    if (!hero || !container) return;

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
      fitHeroShowcase(showcase);
    });

    var resizeFrame = 0;
    window.addEventListener("resize", function () {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(function () {
        fitHeroShowcase(showcase);
      });
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
