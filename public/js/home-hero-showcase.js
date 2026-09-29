(function () {
  "use strict";

  function ensureHeroCascadeFinal() {
    var marker = "data-niarim-home-hero-cascade-final";
    var existing = document.querySelector("link[" + marker + "]");
    if (existing) {
      document.head.appendChild(existing);
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/home-hero-cascade-final.css?v=20260914-visible-bezel";
    link.setAttribute(marker, "true");
    document.head.appendChild(link);
  }

  function resetPreviewFit(node) {
    [
      "--fd-fit",
      "transform",
      "transform-origin",
      "width",
      "height",
      "margin",
      "margin-inline",
      "margin-left",
      "margin-right",
      "margin-bottom",
      "max-width",
      "max-height",
    ].forEach(function (name) {
      node.style.removeProperty(name);
    });
  }

  function fitHeroPreview(card, measuredWidth) {
    if (!card) return;

    var width =
      measuredWidth || card.clientWidth || card.getBoundingClientRect().width;
    if (!width) return;

    // The card owns a real 4px bezel. clientWidth is the inner app viewport,
    // so scaling the canonical 320px screen against it keeps the bezel visible
    // without clipping the app's right edge or narrowing full-width controls.
    card.style.setProperty("--hero-preview-scale", String(width / 320));
  }

  function fitHeroPreviews(showcase) {
    if (!showcase) return;

    var cards = showcase.querySelectorAll(".hero-preview-card");
    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          fitHeroPreview(entry.target);
        });
      });
      Array.prototype.forEach.call(cards, function (card) {
        observer.observe(card);
      });
      return;
    }

    Array.prototype.forEach.call(cards, fitHeroPreview);
  }


  function buildRealCapture(name, alt) {
    var picture = document.createElement("picture");
    picture.className = "real-app-capture hero-real-capture";
    var source = document.createElement("source");
    source.type = "image/avif";
    var revision = "612adcd4";
    source.srcset = "/assets/images/app-captures/" + name + ".avif?v=" + revision;
    var img = document.createElement("img");
    img.src = "/assets/images/app-captures/" + name + ".webp?v=" + revision;
    img.alt = alt || "";
    img.width = 320;
    img.height = 569;
    img.decoding = "async";
    picture.append(source, img);
    return picture;
  }

  function initHeroShowcase() {
    var hero = document.querySelector(".hero");
    var container = hero && hero.querySelector(":scope > .container");
    if (!hero || !container) return;

    var currentShowcase = container.querySelector(":scope > .hero-showcase");
    if (currentShowcase) currentShowcase.remove();

    var canvas = buildRealCapture("canvas-v4", "NIARIM canvas");
    var timeline = buildRealCapture("timeline-v4", "NIARIM timeline");
    var workspace = buildRealCapture("workspace-v3", "NIARIM workspace settings");

    var originalHeroVisual = container.querySelector(":scope > .hero-visual");
    if (originalHeroVisual) originalHeroVisual.remove();

    var showcase = document.createElement("div");
    showcase.className = "hero-showcase hero-showcase--real";
    showcase.setAttribute("aria-label", "NIARIM app previews");
    showcase.appendChild(
      buildPreviewCard("hero-preview-canvas", canvas, "hero-theme-ocean"),
    );
    showcase.appendChild(
      buildPreviewCard("hero-preview-timeline", timeline, "hero-theme-sand"),
    );
    showcase.appendChild(
      buildPreviewCard("hero-preview-workspace", workspace, "hero-theme-violet"),
    );
    container.appendChild(showcase);

    ensureHeroCascadeFinal();

    requestAnimationFrame(function () {
      fitHeroPreviews(showcase);
    });
  }

  if (document.readyState === "complete") initHeroShowcase();
  else window.addEventListener("load", initHeroShowcase, { once: true });
})();
