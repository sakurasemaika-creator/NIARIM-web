/**
 * NIARIM lightweight common UI runtime.
 *
 * Pages without app-screen mockups do not need the large mock construction and
 * fitting runtime in main.js. Keep only shared navigation/FAQ/scroll behavior
 * here; Home and Features continue to use main.js.
 */
(function () {
  "use strict";

  function initScrollUi() {
    var header = document.querySelector(".site-header");
    var btn = document.createElement("button");
    var scheduled = false;

    btn.type = "button";
    btn.className = "scroll-top-btn";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';
    document.body.appendChild(btn);

    function applyLabel() {
      var lang = document.documentElement.getAttribute("lang") || "ja";
      var label =
        window.NIARIM_I18N &&
        window.NIARIM_I18N.translate(lang, "common.scrollTop");
      btn.setAttribute("aria-label", label || "ページトップへ戻る");
    }

    function applyScrollState() {
      scheduled = false;
      var y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      btn.classList.toggle("is-visible", y > 480);
    }

    function requestScrollState() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(applyScrollState);
    }

    applyLabel();
    applyScrollState();
    document.addEventListener("niarim:langchange", applyLabel);
    window.addEventListener("scroll", requestScrollState, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    function close(returnFocus) {
      var wasOpen = nav.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      if (returnFocus && wasOpen) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a")) close(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close(true);
    });
  }

  function initFaqAccordion() {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item, index) {
      var question = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;
      if (!answer.id) answer.id = "faq-answer-" + index;
      if (!question.id) question.id = "faq-question-" + index;
      question.setAttribute("aria-controls", answer.id);
      question.setAttribute(
        "aria-expanded",
        String(item.classList.contains("is-open")),
      );
      answer.setAttribute("role", "region");
      answer.setAttribute("aria-labelledby", question.id);
    });

    document.addEventListener("click", function (event) {
      var question =
        event.target.closest && event.target.closest(".faq-question");
      if (!question) return;

      var item = question.closest(".faq-item");
      var answer = item && item.querySelector(".faq-answer");
      if (!item || !answer) return;

      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));

      if (isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        void answer.offsetHeight;
        answer.style.maxHeight = "0px";
      } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });

    document.addEventListener(
      "transitionend",
      function (event) {
        if (event.propertyName !== "max-height") return;
        var answer = event.target;
        if (!answer.classList || !answer.classList.contains("faq-answer")) {
          return;
        }

        var item = answer.closest(".faq-item");
        if (item && item.classList.contains("is-open")) {
          answer.style.maxHeight = "none";
        }
      },
      true,
    );

    function releaseOpenHeights() {
      document
        .querySelectorAll(".faq-item.is-open .faq-answer")
        .forEach(function (answer) {
          answer.style.maxHeight = "none";
        });
    }

    var resizeTimer = null;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(releaseOpenHeights, 150);
      },
      { passive: true },
    );
    document.addEventListener("niarim:langchange", function () {
      requestAnimationFrame(releaseOpenHeights);
    });
  }

  function settleLayoutForAnchor() {
    var root = document.documentElement;
    if (root.classList.contains("is-anchor-nav")) return;
    root.classList.add("is-anchor-nav");
    void document.body.offsetHeight;
  }

  function initAnchorNav() {
    document.addEventListener(
      "click",
      function (event) {
        var link = event.target.closest && event.target.closest('a[href^="#"]');
        if (!link) return;

        var hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        try {
          if (document.querySelector(hash)) settleLayoutForAnchor();
        } catch (_) {}
      },
      true,
    );

    if (!window.location.hash || window.location.hash.length <= 1) return;

    var initial = null;
    try {
      initial = document.querySelector(window.location.hash);
    } catch (_) {}
    if (!initial) return;

    settleLayoutForAnchor();
    requestAnimationFrame(function () {
      initial.scrollIntoView();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initScrollUi();
    initNavToggle();
    initFaqAccordion();
    initAnchorNav();
  });
})();
