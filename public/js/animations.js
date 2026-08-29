/**
 * NIARIM公式サイト スクロールアニメーション
 * .reveal クラスを持つ要素を、画面内に入ったタイミングでフェード＋スライドイン表示する。
 * prefers-reduced-motion が有効な場合はアニメーションを行わず即時表示する。
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function initReveal() {
    var targets = document.querySelectorAll(".reveal");
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
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute("data-reveal-delay");
            if (delay) {
              entry.target.style.transitionDelay = delay + "ms";
            }
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initParallaxTilt() {
    var el = document.querySelector("[data-parallax]");
    if (!el || prefersReducedMotion()) return;
    // タッチ端末ではホバー相当の操作がないため対象外（"any-hover"でマウス操作可能な環境のみ）
    if (!window.matchMedia || !window.matchMedia("(any-hover: hover)").matches) {
      return;
    }

    var maxTilt = 6; // deg

    el.addEventListener("mousemove", function (event) {
      var rect = el.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform =
        "perspective(1200px) rotateX(" +
        (-y * maxTilt).toFixed(2) +
        "deg) rotateY(" +
        (x * maxTilt).toFixed(2) +
        "deg)";
    });

    el.addEventListener("mouseleave", function () {
      el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    });
  }

  /**
   * .spec-grid（Features/Premium/Community等で多用するカードグリッド）が
   * 画面内に入ったら、カードを1枚ずつ少しずつ間をおいて表示する。
   * グリッド全体を一括フェードインさせるより、実際に手が動いて並んで
   * いくような質感を出す狙い。1グリッドあたりの遅延上限を設けて、
   * カード数が多い場合でも待たされすぎないようにする。
   */
  function initStaggerGrids() {
    var grids = document.querySelectorAll(".spec-grid");
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
          var items = entry.target.querySelectorAll(":scope > *");
          items.forEach(function (item, index) {
            var delay = Math.min(index * STEP_MS, MAX_DELAY_MS);
            item.style.transitionDelay = delay + "ms";
            item.classList.add("is-visible");
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    grids.forEach(function (grid) {
      observer.observe(grid);
    });
  }

  /**
   * 主要CTAボタン（btn-primary / btn-accent）に、カーソルへわずかに
   * 吸い寄せられるような「マグネティックホバー」を付与する。
   * タッチ端末・reduced-motion環境・ホバー不可環境では何もしない。
   */
  function initMagneticButtons() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia || !window.matchMedia("(any-hover: hover)").matches) {
      return;
    }

    var buttons = document.querySelectorAll(".btn-primary, .btn-accent");
    if (!buttons.length) return;

    var PULL = 0.28;
    var MAX_OFFSET = 8;

    buttons.forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        btn.style.transitionDuration = "0.12s";
      });

      btn.addEventListener("mousemove", function (event) {
        var rect = btn.getBoundingClientRect();
        var x = event.clientX - (rect.left + rect.width / 2);
        var y = event.clientY - (rect.top + rect.height / 2);
        var offsetX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x * PULL));
        var offsetY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y * PULL));
        btn.style.transform =
          "translate(" + offsetX.toFixed(1) + "px, " + (offsetY - 2).toFixed(1) + "px)";
      });

      btn.addEventListener("mouseleave", function () {
        btn.style.transitionDuration = "";
        btn.style.transform = "";
      });
    });
  }

  /**
   * ペン先を模したカーソルリング。OSのカーソルはそのまま残し、少し遅れて
   * 追従する円を添えるだけの装飾（お絵かきアプリらしい「ペン先」の質感）。
   * 実際にクリックできる要素（a[href]・button・role=buttonなど）の上に
   * 来たときだけ大きく開く。それ以外の要素の上では一切変化させない
   * （クリックできると誤認させないため）。
   * マウス操作可能なPC環境かつreduced-motionでない場合のみ動作する。
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

    function loop() {
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      var wantScale = ring.classList.contains("is-active") ? 1.6 : 1;
      curScale += (wantScale - curScale) * 0.25;
      ring.style.transform =
        "translate3d(" + curX.toFixed(1) + "px, " + curY.toFixed(1) + "px, 0) scale(" +
        curScale.toFixed(2) + ")";
      requestAnimationFrame(loop);
    }

    document.addEventListener("mousemove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!shown) {
        shown = true;
        curX = targetX;
        curY = targetY;
        ring.classList.add("is-visible");
      }
      var hit = event.target.closest && event.target.closest(CLICKABLE);
      ring.classList.toggle("is-active", !!hit);
    });

    document.addEventListener("mouseleave", function () {
      ring.classList.remove("is-visible");
    });

    requestAnimationFrame(loop);
  }

  /**
   * 機能紹介ページ: 画面内に入ったセクションに対応するタブへ
   * is-active を付与するスクロールスパイ（/features/ のみ動作）。
   */
  function initFeatureNavSpy() {
    var nav = document.querySelector(".feature-nav");
    var sections = document.querySelectorAll(".feature-section[id]");
    if (!nav || !sections.length || !("IntersectionObserver" in window)) return;

    var links = nav.querySelectorAll("a[href^='#']");

    function setActive(id) {
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initParallaxTilt();
    initStaggerGrids();
    initMagneticButtons();
    initCursorOrbit();
    initFeatureNavSpy();
  });
})();
