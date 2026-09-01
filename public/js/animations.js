/**
 * NIARIM公式サイト アニメーション制御
 * 見た目は維持しつつ、常時rAF・mousemoveごとのlayout計測を避ける。
 * アプリ画面の再現図はスクロール演出を付けず、最初から静止表示する。
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function canHover() {
    return window.matchMedia && window.matchMedia("(any-hover: hover)").matches;
  }

  /**
   * 画面再現図は最初から表示済みにする。
   * 対象クラスを明示し、広い部分一致セレクタを使わない。
   * feature-diagram / frame-mock は既に overflow:hidden の静的な図なので、
   * paint containment で再描画の影響範囲も図の内部に限定する。
   */
  function showScreenMocks() {
    document
      .querySelectorAll(".screenshot-scroller, .feature-diagram, .frame-mock")
      .forEach(function (mock) {
        if (mock.classList.contains("feature-diagram") || mock.classList.contains("frame-mock")) {
          mock.style.contain = "paint";
          mock.style.userSelect = "none";
        }

        var reveal = mock.classList.contains("reveal") ? mock : mock.closest(".reveal");
        if (!reveal) return;
        reveal.classList.add("is-visible");
        reveal.style.transitionDelay = "";
      });
  }

  function initReveal() {
    showScreenMocks();

    var targets = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!targets.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
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
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initStaggerGrids() {
    var grids = document.querySelectorAll(
      ".spec-grid, .community-gallery, .faq-list, .pricing-list"
    );
    if (!grids.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
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
          entry.target.querySelectorAll(":scope > *").forEach(function (item, index) {
            item.style.transitionDelay = Math.min(index * STEP_MS, MAX_DELAY_MS) + "ms";
            item.classList.add("is-visible");
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" }
    );

    grids.forEach(function (grid) {
      observer.observe(grid);
    });
  }

  function initMagneticButtons() {
    if (prefersReducedMotion() || !canHover()) return;

    var buttons = document.querySelectorAll(".btn-primary, .btn-accent");
    if (!buttons.length) return;

    var PULL = 0.28;
    var MAX_OFFSET = 8;

    buttons.forEach(function (btn) {
      var rect = null;
      var pointerX = 0;
      var pointerY = 0;
      var rafId = 0;

      function render() {
        rafId = 0;
        if (!rect) rect = btn.getBoundingClientRect();
        var x = pointerX - (rect.left + rect.width / 2);
        var y = pointerY - (rect.top + rect.height / 2);
        var offsetX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x * PULL));
        var offsetY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y * PULL));
        btn.style.transform =
          "translate(" + offsetX.toFixed(1) + "px, " + (offsetY - 2).toFixed(1) + "px)";
      }

      btn.addEventListener("mouseenter", function () {
        rect = btn.getBoundingClientRect();
        btn.style.transitionDuration = "0.12s";
      });

      btn.addEventListener("mousemove", function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!rafId) rafId = requestAnimationFrame(render);
      });

      btn.addEventListener("mouseleave", function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        rect = null;
        btn.style.transitionDuration = "";
        btn.style.transform = "";
      });
    });
  }

  /**
   * ペン先カーソル。マウス移動中と追従が収束するまでだけ描画し、
   * 静止時・非表示時はrequestAnimationFrameを停止する。
   */
  function initCursorOrbit() {
    if (prefersReducedMotion()) return;
    if (
      !window.matchMedia ||
      !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches
    ) {
      return;
    }

    var CLICKABLE =
      "a[href], button:not([disabled]), [role='button'], input[type='submit'], input[type='button'], label[for]";
    var ring = document.createElement("div");
    ring.className = "cursor-orbit";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);

    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var curScale = 1;
    var shown = false;
    var insidePage = false;
    var rafId = 0;

    function schedule() {
      if (!rafId && insidePage && document.visibilityState !== "hidden") {
        rafId = requestAnimationFrame(loop);
      }
    }

    function loop() {
      rafId = 0;
      if (!insidePage || document.visibilityState === "hidden") return;

      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      var wantScale = ring.classList.contains("is-active") ? 1.6 : 1;
      curScale += (wantScale - curScale) * 0.25;
      ring.style.transform =
        "translate3d(" +
        curX.toFixed(1) +
        "px, " +
        curY.toFixed(1) +
        "px, 0) scale(" +
        curScale.toFixed(2) +
        ")";

      var moving =
        Math.abs(targetX - curX) > 0.15 ||
        Math.abs(targetY - curY) > 0.15 ||
        Math.abs(wantScale - curScale) > 0.01;
      if (moving) schedule();
    }

    document.addEventListener("mousemove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
      insidePage = true;
      if (!shown) {
        shown = true;
        curX = targetX;
        curY = targetY;
      }
      ring.classList.add("is-visible");
      var hit = event.target.closest && event.target.closest(CLICKABLE);
      ring.classList.toggle("is-active", !!hit);
      schedule();
    });

    document.addEventListener("mouseleave", function () {
      insidePage = false;
      ring.classList.remove("is-visible");
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        return;
      }
      if (shown && insidePage) {
        ring.classList.add("is-visible");
        schedule();
      }
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
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
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
    initMagneticButtons();
    initCursorOrbit();
    initFeatureNavSpy();
    initHeroUnderline();
  });
})();