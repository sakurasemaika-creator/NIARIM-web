/**
 * NIARIM公式サイト 共通UIロジック（ヘッダー・メニュー・FAQ・画面再現図）
 */
(function () {
  "use strict";

  function loadDesignLayers() {
    var styles = [
      ["/css/polish.css", "data-niarim-polish"],
      ["/css/responsive-consistency.css", "data-niarim-responsive-consistency"],
      ["/css/screen-mock-accuracy.css", "data-niarim-screen-mock-accuracy"],
      ["/css/screen-mock-palette.css", "data-niarim-mock-palette"],
      ["/css/screen-mock-layout-fix.css", "data-niarim-mock-layout"],
      ["/css/signature-showcase.css", "data-niarim-signature-showcase"],
      // 改行位置の調整は各ページCSSの word-break 指定より後に効かせたいので最後。
      ["/css/line-break.css", "data-niarim-line-break"],
    ];
    styles.forEach(function (entry) {
      var href = entry[0],
        marker = entry[1];
      if (document.querySelector("link[" + marker + "]")) return;
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute(marker, "true");
      designLayersPending += 1;
      link.addEventListener("load", onDesignLayerSettled);
      link.addEventListener("error", onDesignLayerSettled);
      document.head.appendChild(link);
    });
    if (!designLayersPending) markDesignLayersReady();
  }

  var designLayersPending = 0;
  var designLayersReady = false;
  var designLayersWaiting = [];

  function markDesignLayersReady() {
    if (designLayersReady) return;
    designLayersReady = true;
    var queue = designLayersWaiting;
    designLayersWaiting = [];
    queue.forEach(function (fn) {
      fn();
    });
  }

  function onDesignLayerSettled() {
    designLayersPending -= 1;
    if (designLayersPending <= 0) markDesignLayersReady();
  }

  function whenDesignLayersReady(fn) {
    if (designLayersReady) {
      fn();
      return;
    }
    designLayersWaiting.push(fn);
  }

  loadDesignLayers();

  var ICON_SPRITE = "/assets/icons/ui/sprite.svg#";
  function icon(name, extraClass) {
    return (
      '<svg class="ic' +
      (extraClass ? " " + extraClass : "") +
      '" aria-hidden="true"><use href="' +
      ICON_SPRITE +
      name +
      '"></use></svg>'
    );
  }
  function iconButton(name, extraClass) {
    return (
      '<span class="fd-icon-btn' +
      (extraClass ? " " + extraClass : "") +
      '">' +
      icon(name) +
      "</span>"
    );
  }
  function uploadIconButton() {
    return '<span class="fd-icon-btn"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16h6v-5h4l-7-7-7 7h4v5zm-4 2h14v2H5z" fill="currentColor"/></svg></span>';
  }

  function canvasTopBar() {
    return (
      '<div class="fd-topbar">' +
      iconButton("ic-undo") +
      iconButton("ic-redo") +
      '<span class="fd-spacer"></span>' +
      iconButton("ic-settings") +
      iconButton("ic-home_outlined") +
      "</div>"
    );
  }

  function frameArtwork(variant) {
    var shift = variant === 1 ? 4 : variant === 2 ? -3 : 0;
    return (
      '<svg viewBox="0 0 80 52" aria-hidden="true"><path d="M' +
      (22 + shift) +
      ' 38 C' +
      (25 + shift) +
      ' 15 ' +
      (43 + shift) +
      ' 9 ' +
      (58 + shift) +
      ' 22 C' +
      (48 + shift) +
      ' 26 ' +
      (45 + shift) +
      ' 34 ' +
      (55 + shift) +
      ' 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
    );
  }

  function canvasDrawing(onion) {
    return (
      '<div class="fd-canvas-zone"><div class="fd-app-canvas-stage">' +
      (onion
        ? '<svg viewBox="0 0 320 180" aria-hidden="true"><path class="fd-stroke-prev" d="M88 132 C105 55 155 39 210 70"/><path class="fd-stroke-next" d="M105 136 C123 59 172 45 226 77"/><path class="fd-stroke" d="M97 134 C114 57 164 42 218 74"/></svg>'
        : '<svg viewBox="0 0 320 180" aria-hidden="true"><path class="fd-stroke" d="M97 134 C114 57 164 42 218 74"/></svg>') +
      "</div></div>"
    );
  }

  function brushSlider() {
    return '<div class="fd-brush-slider"><span></span><i style="width:42%"></i><b></b></div>';
  }

  function canvasToolbar() {
    return (
      '<div class="fd-app-toolbar">' +
      iconButton("ic-brush", "is-active") +
      iconButton("ic-eraser_fa") +
      iconButton("ic-format_color_fill") +
      iconButton("ic-colorize") +
      iconButton("ic-pan_tool_alt") +
      iconButton("ic-highlight_alt") +
      iconButton("ic-transform") +
      iconButton("ic-text_fields") +
      iconButton("ic-category") +
      '<span class="fd-app-swatch"></span>' +
      iconButton("ic-tune") +
      iconButton("ic-layers") +
      iconButton("ic-loop") +
      iconButton("ic-save_outlined") +
      iconButton("ic-straighten") +
      iconButton("ic-help_outline") +
      "</div>"
    );
  }

  function frameStrip() {
    var frames = "";
    for (var i = 0; i < 4; i += 1)
      frames +=
        '<span class="fd-app-frame' +
        (i === 1 ? " is-current" : "") +
        '">' +
        frameArtwork(i % 3) +
        "</span>";
    return '<div class="fd-app-frame-strip">' + frames + '<span class="fd-add-frame">+</span></div>';
  }

  function layerPanel() {
    return (
      '<div class="fd-app-layer-panel"><div class="fd-layer-head"><strong data-i18n="fd.layers">レイヤー</strong><span class="fd-spacer"></span>' +
      iconButton("ic-add") +
      "</div>" +
      '<div class="fd-layer-row is-current"><span class="fd-eye"></span><span class="fd-layer-thumb"></span><span data-i18n="fd.layerLineart">線画</span><span class="fd-spacer"></span>' +
      icon("ic-drag_handle") +
      "</div>" +
      '<div class="fd-layer-row"><span class="fd-eye"></span><span class="fd-layer-thumb is-fill"></span><span data-i18n="fd.layerColor">色</span><span class="fd-spacer"></span>' +
      icon("ic-drag_handle") +
      "</div></div>"
    );
  }

  function onionPanel() {
    return (
      '<div class="fd-app-onion-panel"><strong data-i18n="fd.onionSkin">オニオンスキン</strong><div><span class="fd-onion-prev"></span><span data-i18n="fd.prevFrame">前フレーム</span></div><div><span class="fd-onion-next"></span><span data-i18n="fd.nextFrame">次フレーム</span></div></div>'
    );
  }

  function canvasContents(panel) {
    return (
      canvasTopBar() +
      canvasDrawing(panel === "onion") +
      brushSlider() +
      '<div class="fd-collapse-handle"></div>' +
      canvasToolbar() +
      '<div class="fd-collapse-handle fd-frame-collapse"></div>' +
      frameStrip() +
      (panel === "layer" ? layerPanel() : panel === "onion" ? onionPanel() : "")
    );
  }

  function canvasScreen(panel) {
    return (
      '<div class="feature-diagram fd-canvas-screen fd-app-screen" aria-hidden="true">' +
      canvasContents(panel) +
      "</div>"
    );
  }

  function autoLineartScreen() {
    return (
      '<div class="feature-diagram fd-route-screen fd-autolineart-screen" data-mock-screen="auto-lineart" aria-hidden="true">' +
      '<div class="fd-appbar">' +
      iconButton("ic-arrow_back") +
      '<strong data-i18n="fd.autoLineartTitle">自動線画</strong><span class="fd-spacer"></span>' +
      iconButton("ic-help_outline") +
      "</div>" +
      '<div class="fd-route-body fd-autolineart-body">' +
      '<div class="fd-autolineart-preview"><svg viewBox="0 0 280 158" aria-hidden="true"><path class="fd-autolineart-rough" d="M24 128 C48 46 93 31 141 49 C181 63 213 44 256 60"/><path class="fd-autolineart-rough fd-autolineart-rough-b" d="M26 133 C50 52 95 37 143 55 C183 69 215 50 258 66"/><path class="fd-autolineart-guide" d="M25 130 C49 49 94 34 142 52 C182 66 214 47 257 63"/><path class="fd-autolineart-path" d="M25 130 C49 49 94 34 142 52 C182 66 214 47 257 63"/><circle class="fd-autolineart-node" cx="25" cy="130" r="4"/><circle class="fd-autolineart-node" cx="78" cy="48" r="4"/><circle class="fd-autolineart-node is-active" cx="142" cy="52" r="5"/><circle class="fd-autolineart-node" cx="204" cy="53" r="4"/><circle class="fd-autolineart-node" cx="257" cy="63" r="4"/></svg></div>' +
      '<div class="fd-autolineart-controls">' +
      '<div class="fd-autolineart-row"><span data-i18n="fd.autoLineartTolerance">判定許容範囲</span><span class="fd-autolineart-slider"><i style="width:62%"></i><b style="left:62%"></b></span><strong>42</strong></div>' +
      '<div class="fd-autolineart-row"><span data-i18n="fd.autoLineartWidth">線画幅</span><span class="fd-autolineart-slider"><i style="width:38%"></i><b style="left:38%"></b></span><strong>3.0</strong></div>' +
      '<div class="fd-autolineart-row"><span data-i18n="fd.autoLineartStabilization">手振れ補正</span><span class="fd-autolineart-slider"><i style="width:68%"></i><b style="left:68%"></b></span><strong>58</strong></div>' +
      '<div class="fd-autolineart-row"><span data-i18n="fd.autoLineartTaper">入り抜き</span><span class="fd-autolineart-slider"><i style="width:48%"></i><b style="left:48%"></b></span><strong>24</strong></div>' +
      "</div>" +
      '<div class="fd-autolineart-actions"><span class="fd-autolineart-reset" data-i18n="fd.autoLineartReset">リセット</span><span class="fd-autolineart-apply" data-i18n="fd.autoLineartApply">適用</span></div>' +
      "</div></div>"
    );
  }

  function timelineTopBar() {
    return (
      '<div class="fd-timeline-topbar">' +
      '<span class="fd-back-canvas">' +
      icon("ic-arrow_back") +
      icon("ic-palette") +
      "</span>" +
      '<span class="fd-timeline-title" data-i18n="fd.projectName">プロジェクト名</span><span class="fd-spacer"></span>' +
      iconButton("ic-home_outlined") +
      iconButton("ic-undo") +
      iconButton("ic-redo") +
      iconButton("ic-more_vert") +
      iconButton("ic-help_outline") +
      "</div>"
    );
  }

  function timelineToolbar() {
    return (
      '<div class="fd-timeline-toolbar">' +
      iconButton("ic-videocam") +
      iconButton("ic-audiotrack", "is-active") +
      '<span class="fd-watermark-tool">' +
      icon("ic-branding_watermark") +
      icon("ic-lock", "fd-lock-mark") +
      "</span>" +
      iconButton("ic-movie_filter") +
      iconButton("ic-camera") +
      iconButton("ic-push_pin_outlined") +
      uploadIconButton() +
      "</div>"
    );
  }

  function timelineScreen() {
    var frames = "";
    for (var i = 1; i <= 5; i++)
      frames +=
        '<span class="fd-tl-frame' +
        (i === 3 ? " is-current" : "") +
        '">' +
        frameArtwork(i - 1) +
        "</span>";
    return (
      '<div class="feature-diagram fd-timeline-screen fd-app-screen" aria-hidden="true">' +
      timelineTopBar() +
      '<div class="fd-timeline-preview">' +
      frameArtwork(2) +
      '<span class="fd-preview-loading"></span><span class="fd-fullscreen-mark"></span></div>' +
      '<div class="fd-timeline-scrubber"><i></i></div>' +
      '<div class="fd-transport">' +
      iconButton("ic-skip_previous") +
      iconButton("ic-fast_rewind") +
      iconButton("ic-play_arrow") +
      iconButton("ic-fast_forward") +
      iconButton("ic-skip_next") +
      iconButton("ic-loop", "fd-loop-btn is-active") +
      "</div>" +
      timelineToolbar() +
      '<div class="fd-scene-line"><small data-i18n="fd.trackScene">選択</small><span class="fd-scene-pill"><i class="fd-tick"></i>Scene1</span><span class="fd-scene-more">' +
      icon("ic-more_vert") +
      "</span><span>+</span></div>" +
      '<div class="fd-timeline-row"><small data-i18n="fd.trackArt">絵</small><div class="fd-timeline-frames">' +
      frames +
      '<span class="fd-frame-cursor is-error" aria-hidden="true"></span>' +
      "</div></div>" +
      '<div class="fd-timeline-row fd-end-card-row"><small data-i18n="fd.trackEnd">終</small><span data-i18n="fd.endCardTrack">エンドカードトラック</span>' +
      icon("ic-lock", "fd-lock-mark") +
      "</div>" +
      "</div>"
    );
  }

  function audioScreen() {
    var html = timelineScreen().replace(
      "fd-timeline-screen fd-app-screen",
      "fd-timeline-screen fd-app-screen fd-audio-context-screen",
    );
    var sheet =
      '<div class="fd-audio-dim"></div><div class="fd-clip-detail-sheet"><div class="fd-sheet-handle"></div><div class="fd-audio-sheet-head"><strong data-i18n="fd.audioClip">音声クリップ</strong><span>' +
      icon("ic-content_copy") +
      '</span><span class="fd-delete-mark"></span></div><div class="fd-sheet-row"><span data-i18n="fd.volume">音量</span><button>−</button><span class="fd-sheet-slider"><i style="--fd-fill:72%;width:72%"></i></span><button>+</button><b>72%</b><span>⌄</span></div><div class="fd-sheet-row"><span data-i18n="fd.fadeIn">フェードイン</span><button>−</button><span class="fd-sheet-slider"><i style="--fd-fill:6%;width:6%"></i></span><button>+</button><b>0.0s</b><span>⌄</span></div><div class="fd-sheet-row"><span data-i18n="fd.fadeOut">フェードアウト</span><button>−</button><span class="fd-sheet-slider"><i style="--fd-fill:6%;width:6%"></i></span><button>+</button><b>0.0s</b><span>⌄</span></div></div>';
    return html.replace(/<\/div>$/, sheet + "</div>");
  }

  function saveTreeScreen() {
    return '<div class="feature-diagram fd-route-screen fd-save-tree-screen" aria-hidden="true"><div class="fd-appbar">' + iconButton("ic-arrow_back") + '<strong data-i18n="fd.saveTitle">保存</strong><span class="fd-spacer"></span>' + iconButton("ic-help_outline") + '</div><div class="fd-route-body"><div class="fd-save-tree-row"><span class="fd-folder-mark"></span><strong>Scene 1</strong></div><div class="fd-save-tree-row is-child"><span class="fd-file-mark"></span><span>Frame 01</span></div><div class="fd-save-tree-row is-child"><span class="fd-file-mark"></span><span>Frame 02</span></div></div></div>';
  }

  function saveSlotsScreen() {
    return saveTreeScreen();
  }

  function workspaceScreen() {
    var rows = "";
    for (var i = 0; i < 5; i += 1)
      rows += '<div class="fd-workspace-row"><span class="fd-workspace-grip"></span><span data-i18n="fd.workspaceTool">ツール</span><span class="fd-spacer"></span><span class="fd-toggle' + (i < 3 ? " is-on" : "") + '"></span></div>';
    return '<div class="feature-diagram fd-route-screen fd-workspace-screen" aria-hidden="true"><div class="fd-appbar">' + iconButton("ic-arrow_back") + '<strong data-i18n="fd.workspaceTitle">ワークスペース</strong><span class="fd-spacer"></span>' + iconButton("ic-help_outline") + '</div><div class="fd-route-body">' + rows + "</div></div>";
  }

  function themeScreen() {
    return '<div class="feature-diagram fd-route-screen fd-theme-screen" aria-hidden="true"><div class="fd-appbar">' + iconButton("ic-arrow_back") + '<strong data-i18n="fd.themeTitle">テーマ・外観</strong><span class="fd-spacer"></span>' + iconButton("ic-help_outline") + '</div><div class="fd-route-body"><strong class="fd-route-section" data-i18n="fd.themeColorSection">カラーカスタマイズ</strong><div class="fd-theme-color-row"><span data-i18n="fd.themeAccent">アクセント</span><span class="fd-spacer"></span><i></i></div><div class="fd-theme-color-row"><span data-i18n="fd.themeText">文字</span><span class="fd-spacer"></span><i></i></div><div class="fd-theme-preset"><span data-i18n="fd.themePresetDefault">デフォルト</span><span class="fd-spacer"></span>' + icon("ic-star") + icon("ic-drag_handle") + '</div></div></div>';
  }

  function exportScreen() {
    return (
      '<div class="feature-diagram fd-route-screen fd-export-screen" aria-hidden="true">' +
      '<div class="fd-appbar">' + iconButton("ic-arrow_back") + '<strong data-i18n="fd.exportTitle">書き出し</strong><span class="fd-spacer"></span>' + iconButton("ic-help_outline") + '</div>' +
      '<div class="fd-route-body fd-export-body"><strong class="fd-route-section" data-i18n="fd.sectionPreset">プリセット</strong><div class="fd-segmented fd-export-segments"><span class="fd-segment is-active" data-i18n="fd.presetStandard">標準</span><span class="fd-segment" data-i18n="fd.presetHighQuality">高画質</span><span class="fd-segment" data-i18n="fd.presetCustom">カスタム</span></div><strong class="fd-route-section fd-export-format-title" data-i18n="fd.sectionFormat">形式</strong><div class="fd-format-list"><div class="fd-format-row"><span class="fd-radio is-active"></span><span><strong>MP4</strong><small data-i18n="fd.formatMp4Subtitle">汎用動画形式</small></span></div><div class="fd-format-row"><span class="fd-radio"></span><span><strong>GIF</strong><small data-i18n="fd.formatGifSubtitle">アニメーションGIF</small></span></div></div><div class="fd-export-start">' + icon("ic-file_download") + '<span data-i18n="fd.exportStart">書き出し開始</span></div></div></div>'
    );
  }

  function htmlToElement(html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    return wrap.firstElementChild;
  }

  function replaceDiagramNode(selector, html) {
    var old = document.querySelector(selector);
    if (old) old.replaceWith(htmlToElement(html));
  }

  function replaceFeatureDiagram(sectionSelector, html) {
    var section = document.querySelector(sectionSelector);
    if (!section) return;
    var old = section.querySelector(":scope > .feature-diagram");
    if (old) old.replaceWith(htmlToElement(html));
  }

  function findScreenshotCard(selector) {
    var cards = document.querySelectorAll(".screenshot-scroller .screenshot-card");
    for (var i = 0; i < cards.length; i++) if (cards[i].querySelector(selector)) return cards[i];
    return null;
  }

  function replaceCard(card, html) {
    if (!card) return;
    card.replaceChildren(htmlToElement(html));
    card.classList.add("is-code-verified-mock");
  }

  function normalizeScreenMocks() {
    var galleryCanvas = document.querySelector(".screenshot-scroller .screenshot-card:first-child");
    var galleryTimeline = findScreenshotCard(".fd-timeline-title");
    var galleryLayer = findScreenshotCard(".fd-layer-panel-overlay");
    var galleryOnion = findScreenshotCard(".fd-onion-legend");
    var galleryAudio = findScreenshotCard(".fd-audio-track");
    var gallerySave = findScreenshotCard(".fd-slot-list");
    var galleryWorkspace = findScreenshotCard(".fd-setting-row");
    var galleryExport = findScreenshotCard(".fd-segmented");

    var hero = document.querySelector(".hero-visual");
    if (hero) {
      hero.className = "hero-visual fd-canvas-screen fd-app-screen";
      hero.removeAttribute("data-parallax");
      hero.innerHTML = canvasContents(null);
    }
    var heroSource = document.querySelector(".hero-visual");
    var firstFeatureMedia = document.querySelector("#features .feature-row .feature-media");
    if (heroSource && firstFeatureMedia) {
      var featureClone = heroSource.cloneNode(true);
      featureClone.classList.add("hero-visual-reuse");
      firstFeatureMedia.replaceChildren(featureClone);
    }
    if (heroSource && galleryCanvas) {
      var galleryClone = heroSource.cloneNode(true);
      galleryClone.classList.add("hero-visual-reuse");
      galleryCanvas.replaceChildren(galleryClone);
      galleryCanvas.classList.add("is-code-verified-mock");
    }

    replaceFeatureDiagram("#drawing", canvasScreen(null));
    replaceFeatureDiagram("#animation", timelineScreen());
    replaceFeatureDiagram("#editing", canvasScreen("layer"));
    replaceFeatureDiagram("#advanced", autoLineartScreen());
    replaceFeatureDiagram("#audio", audioScreen());
    replaceFeatureDiagram("#save", saveTreeScreen());
    replaceFeatureDiagram("#workspace", workspaceScreen());
    replaceDiagramNode('#workspace [data-mock-screen="theme"]', themeScreen());
    replaceFeatureDiagram("#export", exportScreen());

    var rows = document.querySelectorAll("#features .feature-row");
    if (rows[1]) {
      var m1 = rows[1].querySelector(".feature-media");
      if (m1) m1.replaceChildren(htmlToElement(timelineScreen()));
    }
    if (rows[2]) {
      var m2 = rows[2].querySelector(".feature-media");
      if (m2) m2.replaceChildren(htmlToElement(canvasScreen("layer")));
    }
    if (rows[3]) {
      var m3 = rows[3].querySelector(".feature-media");
      if (m3) m3.replaceChildren(htmlToElement(canvasScreen("onion")));
    }
    if (rows[4]) {
      var m4 = rows[4].querySelector(".feature-media");
      if (m4) m4.replaceChildren(htmlToElement(exportScreen()));
    }

    replaceCard(galleryTimeline, timelineScreen());
    replaceCard(galleryLayer, canvasScreen("layer"));
    replaceCard(galleryOnion, canvasScreen("onion"));
    replaceCard(galleryAudio, audioScreen());
    replaceCard(gallerySave, saveSlotsScreen());
    replaceCard(galleryWorkspace, workspaceScreen());
    replaceCard(galleryExport, exportScreen());
  }

  function initScrollUi() {
    var header = document.querySelector(".site-header");
    var btn = document.createElement("button");
    var scheduled = false;
    btn.type = "button";
    btn.className = "scroll-top-btn";
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';
    document.body.appendChild(btn);
    function applyLabel() {
      var lang = document.documentElement.getAttribute("lang") || "ja";
      var label = window.NIARIM_I18N && window.NIARIM_I18N.translate(lang, "common.scrollTop");
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
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  function initFaqAccordion() {
    document.querySelectorAll(".faq-question").forEach(function (button) {
      button.addEventListener("click", function () {
        var item = button.closest(".faq-item");
        if (!item) return;
        var open = item.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
      });
    });
  }

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

  function settleLayoutForAnchor() {
    var root = document.documentElement;
    if (root.classList.contains("is-anchor-nav")) return;
    root.classList.add("is-anchor-nav");
    void document.body.offsetHeight;
  }

  function initAnchorNav() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      var target = null;
      try { target = document.querySelector(hash); } catch (_) { return; }
      if (target) settleLayoutForAnchor();
    }, true);
    if (window.location.hash && window.location.hash.length > 1) {
      var initial = null;
      try { initial = document.querySelector(window.location.hash); } catch (_) { initial = null; }
      if (initial) {
        settleLayoutForAnchor();
        requestAnimationFrame(function () { initial.scrollIntoView(); });
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    normalizeScreenMocks();
    initScrollUi();
    initNavToggle();
    initFaqAccordion();
    initAnchorNav();
    ensureNineCommunityTiles();

    function fitMockScreens() {
      var mocks = document.querySelectorAll(".fd-app-screen, .fd-route-screen, .feature-section > .feature-diagram");
      Array.prototype.forEach.call(mocks, function (m) {
        m.style.removeProperty("--fd-fit");
        m.style.removeProperty("transform");
        m.style.removeProperty("transform-origin");
        m.style.removeProperty("width");
        m.style.removeProperty("height");
        m.style.removeProperty("margin-bottom");
        m.style.removeProperty("margin-right");
        m.style.removeProperty("max-width");
        m.style.removeProperty("max-height");
        m.classList.remove("is-fit-scaled");
        var need = m.scrollHeight;
        var have = m.clientHeight;
        if (!have || need <= have + 1) return;
        var boxW = m.offsetWidth;
        var boxH = m.offsetHeight;
        var scale = Math.max(0.56, have / need);
        var z = Math.round(scale * 1000) / 1000;
        function applyFit(zoom) {
          m.style.setProperty("--fd-fit", String(zoom));
          m.style.setProperty("transform", "scale(" + zoom + ")", "important");
          m.style.setProperty("transform-origin", "top left", "important");
          m.style.setProperty("width", boxW / zoom + "px", "important");
          m.style.setProperty("height", boxH / zoom + "px", "important");
          m.style.setProperty("margin-right", -(boxW / zoom - boxW) + "px", "important");
          m.style.setProperty("margin-bottom", -(boxH / zoom - boxH) + "px", "important");
          m.style.setProperty("max-width", "none", "important");
          m.style.setProperty("max-height", "none", "important");
        }
        applyFit(z);
        m.classList.add("is-fit-scaled");
        for (var pass = 0; pass < 3; pass += 1) {
          var rest = m.scrollHeight - m.clientHeight;
          if (rest <= 1) break;
          var next = Math.max(0.56, Math.round(((z * have) / (have + rest)) * 1000) / 1000);
          if (next >= z) break;
          z = next;
          applyFit(z);
        }
      });
    }
    function refitNow() { fitMockScreens(true); }
    requestAnimationFrame(refitNow);
    window.addEventListener("load", refitNow);
    whenDesignLayersReady(function () { requestAnimationFrame(refitNow); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refitNow);
    var fitTimer = null;
    function scheduleFit() { clearTimeout(fitTimer); fitTimer = setTimeout(fitMockScreens, 120); }
    window.addEventListener("resize", scheduleFit);
    if (window.ResizeObserver) {
      var fitObserver = new ResizeObserver(scheduleFit);
      Array.prototype.forEach.call(document.querySelectorAll(".fd-app-screen, .fd-route-screen, .feature-section > .feature-diagram"), function (m) {
        if (m.parentElement) fitObserver.observe(m.parentElement);
      });
    }
    if (window.NIARIM_I18N && window.NIARIM_I18N.applyLang) {
      window.NIARIM_I18N.applyLang(document.documentElement.getAttribute("lang") || "ja", { persist: false });
    }
  });
})();