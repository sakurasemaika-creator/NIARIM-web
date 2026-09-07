(function () {
  "use strict";

  function buildCommunityMini() {
    var screen = document.createElement("div");
    screen.className = "hero-community-mini";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML =
      '<div class="hero-community-bar"><strong>NIARIM</strong><span>Community</span></div>' +
      '<div class="hero-community-tabs"><span class="is-active">Latest</span><span>Daily</span><span>Weekly</span></div>' +
      '<div class="hero-community-grid">' +
      '<span class="hero-community-work is-a"><i>1</i><b></b><small>Artwork</small></span>' +
      '<span class="hero-community-work is-b"><i>2</i><b></b><small>Artwork</small></span>' +
      '<span class="hero-community-work is-c"><i>3</i><b></b><small>Artwork</small></span>' +
      '<span class="hero-community-work is-d"><i>4</i><b></b><small>Artwork</small></span>' +
      "</div>";
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
