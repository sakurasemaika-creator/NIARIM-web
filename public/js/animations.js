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

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initParallaxTilt();
  });
})();
