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

  /**
   * サイト全体に表示する、円形に回転するテキストを持つ常時フローティング
   * ダウンロード誘導バッジ。ホバー中・reduced-motion環境では回転を止める。
   * 言語切替（niarim:langchange）にも追従してテキストを再生成する。
   */
  function initSpinBadge() {
    if (document.querySelector(".spin-badge")) return;

    var NS = "http://www.w3.org/2000/svg";
    var PATH_ID = "spinBadgeCirclePath";

    function currentLang() {
      return document.documentElement.getAttribute("lang") || "ja";
    }

    function badgeText() {
      var dict = window.NIARIM_I18N_DICT || {};
      var table = dict[currentLang()] || dict.ja || {};
      var fallback = dict.ja || {};
      var phrase =
        table["common.spinBadge"] || fallback["common.spinBadge"] || "";
      if (!phrase) return "";
      // 円周（viewBox 100x100、半径42）を埋めるのに十分な長さになるまで
      // 「フレーズ ・」を繰り返す。厳密な文字幅計算はせず、実用上ギャップが
      // 目立たない程度の長さ（全角換算で約34文字分）を目安にする。
      var unit = phrase + " ・ ";
      var out = "";
      while (out.length < 34) {
        out += unit;
      }
      return out;
    }

    function phraseOnly() {
      var dict = window.NIARIM_I18N_DICT || {};
      var table = dict[currentLang()] || dict.ja || {};
      var fallback = dict.ja || {};
      return table["common.spinBadge"] || fallback["common.spinBadge"] || "";
    }

    var link = document.createElement("a");
    link.className = "spin-badge";
    link.href = "/#download";
    link.setAttribute("aria-label", phraseOnly());

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "spin-badge-ring");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");

    var defs = document.createElementNS(NS, "defs");
    var circlePath = document.createElementNS(NS, "path");
    circlePath.setAttribute("id", PATH_ID);
    circlePath.setAttribute(
      "d",
      "M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0"
    );
    defs.appendChild(circlePath);

    var text = document.createElementNS(NS, "text");
    text.setAttribute("font-size", "8.4");
    text.setAttribute("font-weight", "700");
    text.setAttribute("letter-spacing", "0.5");
    text.setAttribute("fill", "currentColor");
    var textPath = document.createElementNS(NS, "textPath");
    textPath.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "#" + PATH_ID
    );
    textPath.setAttribute("href", "#" + PATH_ID);
    textPath.textContent = badgeText();
    text.appendChild(textPath);

    svg.appendChild(defs);
    svg.appendChild(text);

    var core = document.createElement("span");
    core.className = "spin-badge-core";
    core.innerHTML =
      '<svg class="ic" aria-hidden="true"><use href="/assets/icons/ui/sprite.svg#ic-file_download"></use></svg>';

    link.appendChild(svg);
    link.appendChild(core);
    document.body.appendChild(link);

    document.addEventListener("niarim:langchange", function () {
      textPath.textContent = badgeText();
      link.setAttribute("aria-label", phraseOnly());
    });

    if (!prefersReducedMotion()) {
      var onScroll = function () {
        link.classList.toggle("is-visible", window.scrollY > 320);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      link.classList.add("is-visible");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initParallaxTilt();
    initFeatureNavSpy();
    initSpinBadge();
  });
})();
