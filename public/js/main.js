/**
 * NIARIM公式サイト 共通UIロジック（ヘッダー・メニュー・FAQ等）
 */
(function () {
  "use strict";

  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  function initScrollTopButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scroll-top-btn";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';
    document.body.appendChild(btn);

    var applyLabel = function () {
      var lang = document.documentElement.getAttribute("lang") || "ja";
      var label =
        window.NIARIM_I18N && window.NIARIM_I18N.translate(lang, "common.scrollTop");
      btn.setAttribute("aria-label", label || "ページトップへ戻る");
    };
    applyLabel();
    document.addEventListener("niarim:langchange", applyLabel);

    var toggle = function () {
      btn.classList.toggle("is-visible", window.scrollY > 480);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initFaqAccordion() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var question = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;

      question.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        question.setAttribute("aria-expanded", String(!isOpen));
        answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : "0px";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    initNavToggle();
    initFaqAccordion();
    initScrollTopButton();
  });
})();
