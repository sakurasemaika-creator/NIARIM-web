/**
 * NIARIM公式サイト アニメーション制御
 *
 * スクロールで意味のある状態変化だけをJavaScriptで補助する。
 * hover / press の装飾とHero下線はCSSに任せ、pointermove / mousemoveや
 * テキスト行のlayout計測を行う常時インタラクションループは持たない。
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
        var active = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
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

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initStaggerGrids();
    initFeatureNavSpy();
  });
})();
