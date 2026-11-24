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
      ".spec-grid:not([data-help-category] .spec-grid), .community-gallery, .faq-list, .pricing-list",
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
          entry.target.classList.add("is-visible");
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

    // Items put into a grid after it was revealed (the community cards
    // re-rendered when a ranking tab is chosen, an FAQ entry added by a
    // script) would otherwise stay at opacity 0: the reveal above only marks
    // the children present when the grid first came into view.
    if ("MutationObserver" in window) {
      var added = new MutationObserver(function (records) {
        records.forEach(function (record) {
          if (!record.target.classList.contains("is-visible")) return;
          record.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) node.classList.add("is-visible");
          });
        });
      });
      grids.forEach(function (grid) {
        added.observe(grid, { childList: true });
      });
    }
  }

  /* On narrow screens the section tabs are one row that scrolls sideways.
     A fade in the paper colour (CSS: [data-edge-fades]) sits at an edge only
     while more tabs are off that side, so a tab cut at the edge reads as
     "more this way". --nav-gap lets the fades take no room in the row, and
     --nav-pad-start/-end put them at the very edges. The
     current tab is scrolled into the row when the reader moves through the
     page, without moving the page itself. */
  function initNavEdges(nav) {
    var scheduled = false;
    function update() {
      scheduled = false;
      var style = getComputedStyle(nav);
      nav.style.setProperty(
        "--nav-gap",
        (parseFloat(style.columnGap) || 0) + "px",
      );
      // The fades stick to the edges of the row's padding box.
      nav.style.setProperty("--nav-pad-start", style.paddingLeft);
      nav.style.setProperty("--nav-pad-end", style.paddingRight);
      var max = nav.scrollWidth - nav.clientWidth;
      var left = Math.abs(nav.scrollLeft);
      nav.toggleAttribute("data-more-start", max > 1 && left > 1);
      nav.toggleAttribute("data-more-end", max > 1 && left < max - 1);
    }
    function request() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }
    update();
    nav.setAttribute("data-edge-fades", "");
    nav.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(request);
    return {
      reveal: function (link) {
        var max = nav.scrollWidth - nav.clientWidth;
        if (max <= 1) return;
        var navBox = nav.getBoundingClientRect();
        var box = link.getBoundingClientRect();
        // Keep the tab clear of the fades (about 3em on each side).
        var room = Math.min(48, navBox.width / 6);
        var delta = 0;
        if (box.left < navBox.left + room)
          delta = box.left - navBox.left - room;
        else if (box.right > navBox.right - room)
          delta = box.right - navBox.right + room;
        if (!delta) return;
        nav.scrollTo({
          left: Math.max(0, Math.min(max, nav.scrollLeft + delta)),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      },
    };
  }

  function initFeatureNavSpy() {
    var nav = document.querySelector(".feature-nav");
    var sections = document.querySelectorAll(".feature-section[id]");
    if (!nav || !sections.length || !("IntersectionObserver" in window)) return;

    var links = nav.querySelectorAll("a[href^='#']");
    var currentId = "";
    var edges = initNavEdges(nav);
    function setActive(id) {
      if (id === currentId) return;
      currentId = id;
      links.forEach(function (link) {
        var active = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
          edges.reveal(link);
        } else link.removeAttribute("aria-current");
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
          // Back above the first section (the page heading and the links):
          // no section is current, rather than the last one passed.
          else if (
            entry.target === sections[0] &&
            entry.boundingClientRect.top > 0
          )
            setActive("");
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
