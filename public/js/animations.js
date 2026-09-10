/**
 * NIARIM公式サイト アニメーション制御
 *
 * スクロールで意味のある状態変化だけをJavaScriptで補助する。
 * hover / press の装飾はCSSに任せ、pointermove / mousemove を追跡する
 * 常時インタラクションループは持たない。
 */
(function () {
  "use strict";

  var REDUCED_MOTION =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showScreenMocks() {
    document
      .querySelectorAll(
        ".screenshot-scroller, .feature-diagram, .frame-mock, .fd-app-screen, .fd-route-screen",
      )
      .forEach(function (mock) {
        var reveal = mock.classList.contains("reveal")
          ? mock
          : mock.closest(".reveal");
        if (!reveal) return;
        reveal.classList.add("is-visible");
        reveal.style.transitionDelay = "";
      });
  }

  function initReveal() {
    showScreenMocks();
    var targets = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!targets.length) return;

    if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = entry.target.getAttribute("data-reveal-delay");
          if (delay) entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initStaggerGrids() {
    var grids = document.querySelectorAll(
      ".spec-grid, .community-gallery, .faq-list, .pricing-list",
    );
    if (!grids.length) return;

    if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
      grids.forEach(function (grid) {
        grid.querySelectorAll(":scope > *").forEach(function (item) {
          item.classList.add("is-visible");
        });
      });
      return;
    }

    var STEP_MS = 55;
    var MAX_DELAY_MS = 420;
    grids.forEach(function (grid) {
      grid.classList.add("stagger-grid");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target
            .querySelectorAll(":scope > *")
            .forEach(function (item, index) {
              item.style.transitionDelay =
                Math.min(index * STEP_MS, MAX_DELAY_MS) + "ms";
              item.classList.add("is-visible");
            });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" },
    );

    grids.forEach(function (grid) {
      observer.observe(grid);
    });
  }

  function initFeatureNavSpy() {
    var nav = document.querySelector(".feature-nav");
    var sections = document.querySelectorAll(".feature-section[id]");
    if (!nav || !sections.length || !("IntersectionObserver" in window)) return;

    var links = nav.querySelectorAll("a[href^='#']");
    var currentId = "";
    function setActive(id) {
      if (id === currentId) return;
      currentId = id;
      links.forEach(function (link) {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === "#" + id,
        );
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initHeroUnderline() {
    var textEl = document.querySelector(".hero-subtitle-text");
    if (!textEl) return;

    var rafId = 0;
    function rebuild() {
      rafId = 0;
      textEl.querySelectorAll(".hero-underline-line").forEach(function (el) {
        el.remove();
      });

      var range = document.createRange();
      range.selectNodeContents(textEl);
      var rects = Array.prototype.slice.call(range.getClientRects());
      if (!rects.length) return;

      var containerRect = textEl.getBoundingClientRect();
      var fragment = document.createDocumentFragment();
      rects.forEach(function (rect, index) {
        if (rect.width < 1) return;
        var line = document.createElement("span");
        line.className = "hero-underline-line";
        line.style.left = rect.left - containerRect.left + "px";
        line.style.top = rect.bottom - containerRect.top + 3 + "px";
        line.style.width = rect.width + "px";
        line.style.animationDelay = 1.05 + index * 0.15 + "s";
        fragment.appendChild(line);
      });
      textEl.appendChild(fragment);
    }

    function scheduleRebuild() {
      if (!rafId) rafId = requestAnimationFrame(rebuild);
    }

    scheduleRebuild();
    document.addEventListener("niarim:langchange", scheduleRebuild);

    if ("ResizeObserver" in window) {
      new ResizeObserver(scheduleRebuild).observe(textEl);
    } else {
      window.addEventListener("resize", scheduleRebuild, { passive: true });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleRebuild).catch(function () {});
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initStaggerGrids();
    initFeatureNavSpy();
    initHeroUnderline();
  });
})();
