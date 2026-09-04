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

  function showScreenMocks() {
    document
      .querySelectorAll(
        ".screenshot-scroller, .feature-diagram, .frame-mock, .fd-app-screen, .fd-route-screen",
      )
      .forEach(function (mock) {
        if (
          mock.classList.contains("feature-diagram") ||
          mock.classList.contains("frame-mock") ||
          mock.classList.contains("fd-app-screen") ||
          mock.classList.contains("fd-route-screen")
        ) {
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
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = entry.target.getAttribute("data-reveal-delay");
        if (delay) entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { observer.observe(el); });
  }

  function initStaggerGrids() {
    var grids = document.querySelectorAll(".spec-grid, .community-gallery, .faq-list, .pricing-list");
    if (!grids.length) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      grids.forEach(function (grid) {
        grid.querySelectorAll(":scope > *").forEach(function (item) { item.classList.add("is-visible"); });
      });
      return;
    }
    var STEP_MS = 55;
    var MAX_DELAY_MS = 420;
    grids.forEach(function (grid) { grid.classList.add("stagger-grid"); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(":scope > *").forEach(function (item, index) {
          item.style.transitionDelay = Math.min(index * STEP_MS, MAX_DELAY_MS) + "ms";
          item.classList.add("is-visible");
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    grids.forEach(function (grid) { observer.observe(grid); });
  }

  function initMagneticButtons() {
    if (prefersReducedMotion() || !canHover()) return;
    var buttons = document.querySelectorAll(".btn-primary, .btn-accent");
    if (!buttons.length) return;
    var PULL = 0.28;
    var MAX_OFFSET = 8;
    buttons.forEach(function (btn) {
      var rect = null, pointerX = 0, pointerY = 0, rafId = 0;
      function render() {
        rafId = 0;
        if (!rect) rect = btn.getBoundingClientRect();
        var x = pointerX - (rect.left + rect.width / 2);
        var y = pointerY - (rect.top + rect.height / 2);
        var offsetX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x * PULL));
        var offsetY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y * PULL));
        btn.style.transform = "translate(" + offsetX.toFixed(1) + "px, " + (offsetY - 2).toFixed(1) + "px)";
      }
      btn.addEventListener("mouseenter", function () {
        rect = btn.getBoundingClientRect();
        btn.style.transitionDuration = "0.12s";
      });
      btn.addEventListener("mousemove", function (event) {
        pointerX = event.clientX; pointerY = event.clientY;
        if (!rafId) rafId = requestAnimationFrame(render);
      });
      btn.addEventListener("mouseleave", function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0; rect = null; btn.style.transitionDuration = ""; btn.style.transform = "";
      });
    });
  }

  function initCursorOrbit() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia || !window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) return;
    var CLICKABLE = "a[href], button:not([disabled]), [role='button'], input[type='submit'], input[type='button'], label[for]";
    var ring = document.createElement("div");
    ring.className = "cursor-orbit";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    var targetX = 0, targetY = 0, curX = 0, curY = 0, curScale = 1, shown = false, insidePage = false, rafId = 0;
    function schedule() {
      if (!rafId && insidePage && document.visibilityState !== "hidden") rafId = requestAnimationFrame(loop);
    }
    function loop() {
      rafId = 0;
      if (!insidePage || document.visibilityState === "hidden") return;
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      var wantScale = ring.classList.contains("is-active") ? 1.6 : 1;
      curScale += (wantScale - curScale) * 0.25;
      ring.style.transform = "translate3d(" + curX.toFixed(1) + "px, " + curY.toFixed(1) + "px, 0) scale(" + curScale.toFixed(2) + ")";
      var moving = Math.abs(targetX - curX) > 0.15 || Math.abs(targetY - curY) > 0.15 || Math.abs(wantScale - curScale) > 0.01;
      if (moving) schedule();
    }
    document.addEventListener("mousemove", function (event) {
      targetX = event.clientX; targetY = event.clientY; insidePage = true;
      if (!shown) { shown = true; curX = targetX; curY = targetY; }
      ring.classList.add("is-visible");
      var hit = event.target.closest && event.target.closest(CLICKABLE);
      ring.classList.toggle("is-active", !!hit);
      schedule();
    });
    document.addEventListener("mouseleave", function () {
      insidePage = false; ring.classList.remove("is-visible");
      if (rafId) cancelAnimationFrame(rafId); rafId = 0;
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        if (rafId) cancelAnimationFrame(rafId); rafId = 0; return;
      }
      if (shown && insidePage) { ring.classList.add("is-visible"); schedule(); }
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
      links.forEach(function (link) { link.classList.toggle("is-active", link.getAttribute("href") === "#" + id); });
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function initHeroUnderline() {
    var textEl = document.querySelector(".hero-subtitle-text");
    if (!textEl) return;
    var rafId = 0;
    function rebuild() {
      rafId = 0;
      textEl.querySelectorAll(".hero-underline-line").forEach(function (el) { el.remove(); });
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
    function scheduleRebuild() { if (!rafId) rafId = requestAnimationFrame(rebuild); }
    scheduleRebuild();
    document.addEventListener("niarim:langchange", scheduleRebuild);
    if ("ResizeObserver" in window) new ResizeObserver(scheduleRebuild).observe(textEl);
    else window.addEventListener("resize", scheduleRebuild, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleRebuild).catch(function () {});
  }

  /*
   * Creator trust note: NIARIM does not use user-created or posted works as
   * training data for generative-AI models. Add the statement to every FAQ
   * list (home and /faq/) without changing the existing language switcher.
   */
  function initAiTrainingReassurance() {
    var lists = document.querySelectorAll(".faq-list");
    if (!lists.length) return;

    var copy = {
      ja: ["作品はAIの学習に使用されますか？", "いいえ。NIARIMでは、ユーザーが作成・投稿したイラスト、アニメーション、プロジェクトデータなどの作品を、生成AIモデルの学習データとして使用しません。制作データは原則として端末内に保存され、ユーザー自身が作品広場へ投稿する場合を除き、開発者のサーバーへ送信・保存する機能もありません。"],
      en: ["Are my works used to train AI?", "No. NIARIM does not use illustrations, animations, project data, or other works created or posted by users as training data for generative AI models. Creation data is generally stored on your device, and NIARIM has no feature that sends or stores it on the developer's server unless you choose to publish a work to the Gallery."],
      "zh-Hans": ["我的作品会被用于训练 AI 吗？", "不会。NIARIM 不会将用户创作或发布的插画、动画、项目数据等作品用作生成式 AI 模型的训练数据。创作数据原则上保存在您的设备中；除非您主动将作品发布到「作品广场」，否则 NIARIM 不提供将这些数据发送或保存到开发者服务器的功能。"],
      "zh-Hant": ["我的作品會被用於訓練 AI 嗎？", "不會。NIARIM 不會將使用者創作或發布的插畫、動畫、專案資料等作品用作生成式 AI 模型的訓練資料。創作資料原則上保存在您的裝置中；除非您主動將作品發布到「作品廣場」，否則 NIARIM 不提供將這些資料傳送或儲存到開發者伺服器的功能。"],
      ko: ["제 작품이 AI 학습에 사용되나요?", "아니요. NIARIM은 사용자가 제작하거나 게시한 일러스트, 애니메이션, 프로젝트 데이터 등의 작품을 생성형 AI 모델의 학습 데이터로 사용하지 않습니다. 제작 데이터는 원칙적으로 기기 안에 저장되며, 사용자가 직접 작품 광장에 게시하는 경우를 제외하면 개발자 서버로 전송하거나 저장하는 기능도 없습니다."],
      fr: ["Mes œuvres sont-elles utilisées pour entraîner une IA ?", "Non. NIARIM n'utilise pas les illustrations, animations, données de projet ou autres œuvres créées ou publiées par les utilisateurs comme données d'entraînement pour des modèles d'IA générative. Les données de création restent en principe sur votre appareil et ne sont ni envoyées ni stockées sur le serveur du développeur, sauf si vous choisissez de publier une œuvre dans la Galerie."],
      es: ["¿Se usan mis obras para entrenar IA?", "No. NIARIM no utiliza ilustraciones, animaciones, datos de proyectos ni otras obras creadas o publicadas por los usuarios como datos de entrenamiento para modelos de IA generativa. Los datos de creación se guardan, por regla general, en tu dispositivo y no se envían ni almacenan en el servidor del desarrollador, salvo cuando decides publicar una obra en la Galería."],
    };

    function currentCopy() {
      var lang = document.documentElement.getAttribute("lang") || "ja";
      return copy[lang] || copy.en;
    }

    lists.forEach(function (list) {
      if (list.querySelector("[data-ai-training-faq]")) return;
      var item = document.createElement("div");
      item.className = "faq-item";
      item.setAttribute("data-ai-training-faq", "");
      item.innerHTML = '<button class="faq-question" aria-expanded="false"><span data-ai-training-q></span><span class="icon" aria-hidden="true"></span></button><div class="faq-answer"><p data-ai-training-a></p></div>';
      list.appendChild(item);
    });

    function applyCopy() {
      var text = currentCopy();
      document.querySelectorAll("[data-ai-training-faq]").forEach(function (item) {
        var q = item.querySelector("[data-ai-training-q]");
        var a = item.querySelector("[data-ai-training-a]");
        if (q) q.textContent = text[0];
        if (a) a.textContent = text[1];
      });
    }

    applyCopy();
    document.addEventListener("niarim:langchange", applyCopy);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAiTrainingReassurance();
    initReveal();
    initStaggerGrids();
    initMagneticButtons();
    initCursorOrbit();
    initFeatureNavSpy();
    initHeroUnderline();
  });
})();
