/**
 * NIARIM lightweight common UI runtime.
 *
 * Pages without app-screen mockups do not need the large mock construction and
 * fitting runtime in main.js. Keep only shared navigation/FAQ/scroll behavior
 * here. Features still uses main.js for its interactive screen mockups.
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

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

    // On a phone the button sits over the right edge of the text column, so
    // it only shows while the reader is heading back up (or has reached the
    // end of the page). Scrolling down to read hides it again. Wide screens
    // keep it in the margin beside the content, always shown past 480px.
    var narrowScreen = window.matchMedia("(max-width: 900px)");
    var lastY = window.scrollY;

    function applyScrollState() {
      scheduled = false;
      var y = window.scrollY;
      var show = y > 480;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (show && narrowScreen.matches && document.activeElement !== btn) {
        var doc = document.documentElement;
        var nearEnd = y + window.innerHeight * 1.5 >= doc.scrollHeight;
        if (y > lastY + 4) show = nearEnd;
        else if (y >= lastY - 4) show = btn.classList.contains("is-visible");
      }
      if (Math.abs(y - lastY) > 4) lastY = y;
      btn.classList.toggle("is-visible", show);
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
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      // The button hides itself at the top, which dropped keyboard focus to
      // the end of the page. Continue from the top: the brand link.
      var start = document.querySelector(".site-header .brand");
      if (start) start.focus({ preventScroll: true });
    });
  }

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    var narrow = window.matchMedia("(max-width: 900px)");
    var header = toggle.closest(".site-header");
    var covered = Array.from(
      document.querySelectorAll(
        "main, footer, .skip-link, .back-to-top, .site-header .brand",
      ),
    );
    var changed = [];

    function isOpen() {
      return nav.classList.contains("is-open");
    }

    // Keep the accessible name in sync with the disclosure state and locale.
    function applyToggleLabel(lang) {
      var activeLang = lang || document.documentElement.lang || "ja";
      var key = isOpen() ? "common.menuClose" : "common.menuOpen";
      var fallback = isOpen() ? "メニューを閉じる" : "メニューを開く";
      var label =
        window.NIARIM_I18N && window.NIARIM_I18N.translate(activeLang, key);
      toggle.setAttribute(
        "aria-label",
        label && label !== key ? label : fallback,
      );
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.documentElement.classList.remove("mobile-nav-open");
      changed.forEach(function (element) {
        element.inert = false;
      });
      changed = [];
      applyToggleLabel();
      if (returnFocus && narrow.matches) toggle.focus();
    }

    applyToggleLabel();
    document.addEventListener("niarim:langchange", function (event) {
      applyToggleLabel(event.detail && event.detail.lang);
    });

    toggle.addEventListener("click", function () {
      if (isOpen()) {
        close(true);
        return;
      }
      if (!narrow.matches) return;
      changed = covered.filter(function (element) {
        return !element.inert && !element.contains(header);
      });
      changed.forEach(function (element) {
        element.inert = true;
      });
      document.documentElement.classList.add("mobile-nav-open");
      toggle.setAttribute("aria-expanded", "true");
      nav.classList.add("is-open");
      applyToggleLabel();
      toggle.focus();
    });
    narrow.addEventListener("change", function () {
      if (!narrow.matches) close(false);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a[href]")) close(false);
    });
    document.addEventListener("keydown", function (event) {
      if (!isOpen()) return;
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        close(true);
      }
      if (event.key !== "Tab") return;
      var links = Array.from(
        nav.querySelectorAll("a[href], button:not(:disabled), [tabindex='0']"),
      ).filter(function (element) {
        return (
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0 &&
          getComputedStyle(element).visibility === "visible"
        );
      });
      var ring = [toggle].concat(links);
      var focused = ring.indexOf(document.activeElement);
      event.preventDefault();
      var next =
        focused < 0
          ? 0
          : (focused + (event.shiftKey ? -1 : 1) + ring.length) % ring.length;
      ring[next].focus();
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

      if (prefersReducedMotion()) {
        answer.style.maxHeight = isOpen ? "0px" : "none";
        return;
      }

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
