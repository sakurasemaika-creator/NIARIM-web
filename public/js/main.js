/**
 * NIARIM公式サイト 共通UIロジック（ヘッダー・メニュー・FAQ等）
 */
(function () {
  "use strict";

  /**
   * ページ固有CSSの後に、全体の視覚品質を揃える polish.css を読み込む。
   * 既存HTMLを壊さず全ページへ適用するため共通main.jsから一度だけ注入する。
   */
  function loadDesignPolish() {
    if (document.querySelector('link[data-niarim-polish]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/polish.css";
    link.setAttribute("data-niarim-polish", "true");
    document.head.appendChild(link);
  }

  loadDesignPolish();

  /**
   * ヘッダー状態とページトップボタンの表示判定を1本のscroll監視へ集約。
   * scrollイベントのたびにDOMを書き換えず、1フレームにつき最大1回だけ反映する。
   */
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
        window.NIARIM_I18N && window.NIARIM_I18N.translate(lang, "common.scrollTop");
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

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });

    // 各リンクへ個別listenerを付けず、nav内のクリックを1本で処理する。
    nav.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  /** FAQは各項目へlistenerを量産せず、document上の1本で処理する。 */
  function initFaqAccordion() {
    if (!document.querySelector(".faq-item")) return;

    document.addEventListener("click", function (event) {
      var question = event.target.closest && event.target.closest(".faq-question");
      if (!question) return;

      var item = question.closest(".faq-item");
      var answer = item && item.querySelector(".faq-answer");
      if (!item || !answer) return;

      var isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : "0px";
    });
  }

  /**
   * 作品広場のプレビューは3列にきれいに収まる9作品を表示する。
   * 現在はプレースホルダーのため8位カードを複製し、順位だけ9位にする。
   * 実データ接続時はこの補完処理を削除して9件をそのまま描画する。
   */
  function ensureNineCommunityTiles() {
    var gallery = document.querySelector(".community-gallery");
    if (!gallery) return;

    var cards = gallery.querySelectorAll(".community-card:not(.is-more-cta)");
    var more = gallery.querySelector(".community-card.is-more-cta");
    if (cards.length !== 8 || !more) return;

    var ninth = cards[cards.length - 1].cloneNode(true);
    var badge = ninth.querySelector(".rank-badge");
    if (badge) badge.textContent = "9";
    gallery.insertBefore(ninth, more);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initScrollUi();
    initNavToggle();
    initFaqAccordion();
    ensureNineCommunityTiles();
  });
})();
