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
      // 読み込みに失敗しても、待ち続けて何も起きないより先へ進める。
      link.addEventListener("error", onDesignLayerSettled);
      document.head.appendChild(link);
    });
    if (!designLayersPending) markDesignLayersReady();
  }

  /* これらのCSSは後から足すので、適用された時点でレイアウトが変わる。
     画面再現図の「枠に収まる倍率」を測る処理は、変わり切る前に走ると
     空振りする（実際、スマホのヒーローでツールバーとコマ一覧が枠の下から
     はみ出したまま＝ベゼルで切れたまま表示されていた）。
     全部読み終わったことを知らせて、測り直せるようにしておく。 */
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

  /* ブラシの太さ・不透明度スライダー（brush_size_slider.dart）。
     実機は既定で1行の要約に畳まれているが、この図は「キャンバスで
     絵を描いている画面」の紹介なので、開いた状態を描く。
     開いているときは要約行の矢印が上向きになり、下に
     「スライダー＋数値」の行が太さ・不透明度の2本並ぶ。 */
  function brushSlider() {
    return (
      '<div class="fd-brush-slider is-expanded">' +
      '<div class="fd-brush-summary">' +
      '<span class="fd-brush-dot"></span><span class="fd-brush-size">5</span>' +
      '<svg class="ic fd-brush-opacity-ic" viewBox="0 0 24 24"><use href="' +
      ICON_SPRITE +
      'ic-opacity"></use></svg>' +
      '<span class="fd-brush-opacity">100%</span><span class="fd-spacer"></span>' +
      '<small class="fd-brush-detail" data-i18n="fd.brushDetails">詳細</small>' +
      '<span class="fd-brush-toggle"></span>' +
      "</div>" +
      brushSliderRow("--fd-fill:12%", "5") +
      brushSliderRow("--fd-fill:100%", "100%") +
      "</div>"
    );
  }

  function brushSliderRow(fill, value) {
    return (
      '<div class="fd-brush-row">' +
      '<span class="fd-slider" style="' +
      fill +
      '"><span></span></span>' +
      '<span class="fd-brush-value">' +
      value +
      "</span></div>"
    );
  }

  function canvasToolbar() {
    var tools = [
      ["ic-brush", "is-active"],
      ["ic-eraser_fa", ""],
      ["ic-format_color_fill", ""],
      ["ic-colorize", ""],
      ["ic-pan_tool_alt", ""],
      ["ic-highlight_alt", ""],
      ["ic-transform", ""],
      ["ic-text_fields", ""],
      ["ic-category", ""],
    ];
    var actions = [
      "ic-tune",
      "ic-layers",
      "ic-loop",
      "ic-save_outlined",
      "ic-straighten",
      "ic-help_outline",
    ];
    var html = '<div class="fd-toolbar">';
    tools.forEach(function (tool) {
      html += iconButton(tool[0], tool[1]);
    });
    html += '<span class="fd-color-swatch"></span>';
    actions.forEach(function (name) {
      html += iconButton(name);
    });
    return html + "</div>";
  }

  /* コマごとの絵。ボールが弾む簡単なアニメーションにしてある。
     キャンバスもコマも真っ白のままだと「何も描けていないアプリ」に
     見えてしまうため、図だけで「描いた絵がコマごとに動く」ことが
     伝わるようにする（JavaScriptを切ったときに出る静的なHTML側には
     元々このような絵が入っていた）。 */
  var FRAME_POSES = [
    [62, 116],
    [108, 72],
    [160, 50],
    [212, 72],
    [258, 116],
  ];

  function frameArtwork(index) {
    var pose = FRAME_POSES[index % FRAME_POSES.length];
    return (
      '<svg class="fd-art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<path class="fd-art-ground" d="M34 150H286"/>' +
      '<circle class="fd-art-ball" cx="' +
      pose[0] +
      '" cy="' +
      pose[1] +
      '" r="21"/>' +
      "</svg>"
    );
  }

  function frameStrip() {
    var frames = "";
    // 実機のFrameStripWidgetは、コマ一覧を横スクロールさせて編集中の
    // コマを「画面中央に固定表示された枠」へ合わせる（枠はコマ側では
    // なく一覧に重ねて描く）。再現図でも同じ作りにし、5枚並べた真ん中が
    // 枠に入るようにする。
    // コマ4枚+末尾の追加ボタンで計5マス。中央寄せにすると真ん中の
    // マス＝3枚目のコマがちょうど中央の枠に入る。
    for (var i = 0; i < 4; i++) {
      frames +=
        '<span class="fd-frame-thumb' +
        (i === 2 ? " is-selected" : "") +
        '"><span class="fd-frame-paper">' +
        frameArtwork(i) +
        "</span></span>";
    }
    return (
      '<div class="fd-frame-strip">' +
      '<div class="fd-frame-strip-scroll">' +
      frames +
      '<span class="fd-frame-add">' +
      icon("ic-add") +
      "</span>" +
      // 画面中央に固定表示するコマ枠。色はテーマの更新マーク色。
      '<span class="fd-frame-cursor" aria-hidden="true"></span>' +
      "</div>" +
      '<button type="button" class="fd-frame-mode" aria-label="タイムライン" data-i18n-attr="aria-label:fd.timelineMode" tabindex="-1">' +
      icon("ic-movie_filter") +
      "</button>" +
      "</div>"
    );
  }

  function canvasDrawing(onion) {
    // 編集中のコマ（コマ一覧の3枚目）と同じ絵をキャンバスにも描く。
    var drawing = onion
      ? '<svg viewBox="0 0 320 180" aria-hidden="true"><path class="fd-stroke-prev" d="M105 91c16-43 88-43 107 0"/><path class="fd-stroke-next" d="M118 88c17-35 74-35 93 0"/></svg>'
      : frameArtwork(2);
    return (
      '<div class="fd-canvas-zone"><div class="fd-canvas fd-app-canvas-stage">' +
      drawing +
      "</div></div>"
    );
  }

  function panelCloseBar() {
    return '<div class="fd-panel-close-bar"><span class="fd-panel-close">×</span></div>';
  }

  function layerRow(opt) {
    return (
      '<div class="fd-layer-row' +
      (opt.active ? " is-active" : "") +
      '">' +
      icon("ic-visibility", "ic-eye") +
      (opt.type
        ? icon(opt.type, "ic-layer-type " + (opt.typeClass || ""))
        : '<span class="fd-layer-pencil" aria-hidden="true"></span>') +
      '<span class="fd-layer-thumb">' +
      '<svg class="fd-art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<circle class="fd-art-ball" cx="50" cy="50" r="28" stroke-width="11"/>' +
      "</svg></span>" +
      '<span class="fd-layer-copy">' +
      '<strong class="fd-layer-name" data-i18n="' +
      opt.key +
      '">' +
      opt.fallback +
      "</strong>" +
      (opt.badge
        ? '<small class="fd-layer-badge" data-i18n="' +
          opt.badge +
          '">' +
          opt.badgeText +
          "</small>"
        : "") +
      "</span>" +
      '<span class="fd-layer-menu">' +
      icon("ic-more_vert") +
      "</span>" +
      icon("ic-drag_handle", "ic-drag") +
      "</div>"
    );
  }

  function layerPanel() {
    return (
      '<div class="fd-app-overlay-panel fd-app-layer-panel">' +
      '<div class="fd-layers">' +
      panelCloseBar() +
      '<div class="fd-layer-header"><strong data-i18n="fd.layerPanelTitle">レイヤー</strong><span class="fd-spacer"></span>' +
      iconButton("ic-merge_type") +
      iconButton("ic-help_outline") +
      iconButton("ic-search") +
      "</div>" +
      '<div class="fd-layer-shortcuts">' +
      '<span class="fd-shortcut-btn">' +
      icon("ic-add") +
      '<span data-i18n="fd.newLayer">新規レイヤー</span></span>' +
      '<span class="fd-shortcut-btn">' +
      icon("ic-folder_open") +
      '<span data-i18n="fd.newGroup">グループ</span></span>' +
      '<span class="fd-shortcut-btn">' +
      icon("ic-link") +
      '<span data-i18n="fd.commonLayer">共通</span></span>' +
      "</div>" +
      '<div class="fd-blend-row"><span data-i18n="fd.blendMode">合成モード</span><strong data-i18n="fd.blendNormal">通常</strong><span>⌄</span></div>' +
      '<div class="fd-layer-list">' +
      layerRow({
        active: true,
        key: "fd.layerNormal",
        fallback: "線画",
      }) +
      layerRow({
        type: "ic-link",
        typeClass: "is-common",
        key: "fd.layerCommon",
        fallback: "共通レイヤー",
        badge: "fd.layerRangeAll",
        badgeText: "全フレーム",
      }) +
      layerRow({
        type: "ic-folder",
        key: "fd.layerGroup",
        fallback: "色塗り",
      }) +
      layerRow({
        key: "fd.layerClipped",
        fallback: "影",
        badge: "fd.layerClipping",
        badgeText: "クリッピング",
      }) +
      "</div></div></div>"
    );
  }

  function onionPanel() {
    return (
      '<div class="fd-app-overlay-panel fd-app-onion-panel">' +
      '<div class="fd-onion-head">' +
      panelCloseBar() +
      '<strong data-i18n="fd.onionTitle">オニオンスキン</strong><span class="fd-spacer"></span>' +
      iconButton("ic-help_outline") +
      "</div>" +
      '<div class="fd-onion-row"><span data-i18n="fd.onionEnabled">有効</span><span class="fd-switch is-on"></span></div>' +
      '<div class="fd-onion-row"><span data-i18n="fd.onionPrev">前フレーム</span><span class="fd-color-chip is-prev"></span></div>' +
      '<div class="fd-onion-row"><span data-i18n="fd.onionNext">次フレーム</span><span class="fd-color-chip is-next"></span></div>' +
      '<div class="fd-onion-row"><span data-i18n="fd.onionCount">表示枚数</span><span>2</span></div>' +
      '<div class="fd-onion-row"><span data-i18n="fd.onionOpacity">不透明度</span><span>45%</span></div>' +
      "</div>"
    );
  }

  function canvasContents(panel) {
    return (
      canvasTopBar() +
      brushSlider() +
      canvasToolbar() +
      canvasDrawing(panel === "onion") +
      frameStrip() +
      (panel === "layer" ? layerPanel() : "") +
      (panel === "onion" ? onionPanel() : "")
    );
  }

  function canvasScreen(panel) {
    return (
      '<div class="feature-diagram fd-canvas-screen fd-app-screen" aria-hidden="true">' +
      canvasContents(panel) +
      "</div>"
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
      iconButton("ic-settings") +
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
      "</div>" +
      '<div class="fd-timeline-controls">' +
      iconButton("ic-skip_previous") +
      iconButton("ic-play_arrow", "is-play") +
      iconButton("ic-skip_next") +
      '<span class="fd-spacer"></span><span>12 fps</span></div>' +
      '<div class="fd-timeline-track"><span class="fd-timeline-cursor"></span>' +
      frames +
      "</div></div>"
    );
  }

  function audioScreen() {
    var html = timelineScreen().replace(
      "fd-timeline-screen fd-app-screen",
      "fd-timeline-screen fd-app-screen fd-audio-context-screen",
    );
    var sheet =
      '<div class="fd-audio-dim"></div><div class="fd-clip-detail-sheet">' +
      '<div class="fd-sheet-handle"></div><div class="fd-audio-sheet-head"><strong data-i18n="fd.audioClip">音声クリップ</strong><span>' +
      icon("ic-content_copy") +
      '</span><span class="fd-delete-mark"></span></div>' +
      '<div class="fd-audio-row"><span data-i18n="fd.audioVolume">音量</span><span class="fd-slider"><span></span></span><b>100%</b></div>' +
      '<div class="fd-audio-row"><span data-i18n="fd.audioFadeIn">フェードイン</span><span class="fd-slider is-short"><span></span></span><b>0.0s</b></div>' +
      '<div class="fd-audio-row"><span data-i18n="fd.audioFadeOut">フェードアウト</span><span class="fd-slider is-short"><span></span></span><b>0.0s</b></div>' +
      '<div class="fd-audio-row"><span data-i18n="fd.audioStart">開始</span><span>00:00.00</span></div>' +
      "</div>";
    return html.replace("</div>", "</div>" + sheet);
  }

  function appBar(title, back, key) {
    return (
      '<div class="fd-appbar">' +
      (back ? iconButton("ic-arrow_back") : '<span class="fd-appbar-space"></span>') +
      '<strong' +
      (key ? ' data-i18n="' + key + '"' : "") +
      ">" +
      title +
      '</strong><span class="fd-spacer"></span>' +
      iconButton("ic-help_outline") +
      "</div>"
    );
  }

  function treeRow(depth, continuations, selected, label) {
    var connectors = "";
    for (var i = 0; i < depth; i++)
      connectors +=
        '<span class="fd-tree-line' +
        (continuations[i] ? " is-continuing" : "") +
        '"></span>';
    return (
      '<div class="fd-tree-row2' +
      (selected ? " is-selected" : "") +
      '" style="--fd-tree-depth:' +
      depth +
      '">' +
      connectors +
      '<span class="fd-tree-thumb">' +
      frameArtwork(depth) +
      '</span><span class="fd-tree-copy"><strong>Save ' +
      label +
      '</strong><small data-i18n="fd.saveTreeAuto">自動保存</small></span><span class="fd-spacer"></span>' +
      icon("ic-more_vert") +
      "</div>"
    );
  }

  function saveTreeScreen() {
    return (
      '<div class="feature-diagram fd-route-screen fd-save-tree-screen" aria-hidden="true">' +
      appBar("セーブツリー", true, "fd.saveTreeTitle") +
      '<div class="fd-route-body fd-save-tree-body"><div class="fd-real-tree">' +
      treeRow(0, [], false, "01") +
      treeRow(1, [], false, "02") +
      treeRow(2, [false], false, "03") +
      "</div></div></div>"
    );
  }

  function themeScreen() {
    return (
      '<div class="feature-diagram fd-route-screen fd-theme-screen" data-mock-screen="theme" aria-hidden="true">' +
      appBar("テーマ・外観", true, "fd.themeTitle") +
      '<div class="fd-route-body fd-theme-body">' +
      '<strong class="fd-route-section" data-i18n="fd.themeSection">テーマ</strong>' +
      '<div class="fd-theme-card"><span data-i18n="fd.themeDark">ダーク</span><span class="fd-radio is-active"></span></div>' +
      '<div class="fd-theme-card"><span data-i18n="fd.themeLight">ライト</span><span class="fd-radio"></span></div>' +
      '<strong class="fd-route-section" data-i18n="fd.accentSection">アクセントカラー</strong>' +
      '<div class="fd-accent-row"><span class="fd-accent-dot is-pink"></span><span class="fd-accent-dot is-blue"></span><span class="fd-accent-dot is-green"></span><span class="fd-accent-dot is-orange"></span></div>' +
      "</div></div>"
    );
  }

  function workspaceScreen() {
    var items = [
      ["Gペン", "fd.toolPen"],
      ["消しゴム", "fd.toolEraser"],
      ["バケツ", "fd.toolBucket"],
      ["スポイト", "fd.toolEyedropper"],
      ["指", "fd.toolFinger"],
      ["手のひら", "fd.toolHand"],
      ["選択", "fd.toolSelect"],
    ];
    var rows = items
      .map(function (item) {
        var name = item[0];
        return (
          '<div class="fd-workspace-row"><span class="fd-check is-on"><i class="fd-tick"></i></span><strong data-i18n="' +
          item[1] +
          '">' +
          name +
          "</strong><span class="fd-spacer"></span>" +
          icon("ic-drag_handle") +
          "</div>"
        );
      })
      .join("");
    return (
      '<div class="feature-diagram fd-route-screen fd-workspace-screen" aria-hidden="true">' +
      appBar("ワークスペース設定", false, "fd.workspaceSettingsTitle") +
      '<div class="fd-route-body fd-workspace-body"><strong class="fd-route-section" data-i18n="fd.toolbarEdit">ツールバー編集</strong>' +
      '<p class="fd-route-hint" data-i18n="fd.toolbarEditHint">表示するツールをチェックで選択し、ドラッグで並べ替えます。</p>' +
      '<div class="fd-toolbar-preview">' +
      iconButton("ic-brush", "is-active") +
      iconButton("ic-eraser_fa") +
      iconButton("ic-format_color_fill") +
      iconButton("ic-colorize") +
      iconButton("ic-pan_tool_alt") +
      iconButton("ic-highlight_alt") +
      iconButton("ic-transform") +
      iconButton("ic-text_fields") +
      "</div>" +
      '<div class="fd-workspace-card">' +
      rows +
      "</div></div></div>"
    );
  }

  function exportScreen() {
    return (
      '<div class="feature-diagram fd-route-screen fd-export-screen" aria-hidden="true">' +
      appBar("書き出し", false, "fd.exportTitle") +
      '<div class="fd-route-body fd-export-body"><strong class="fd-route-section" data-i18n="fd.sectionPreset">プリセット</strong>' +
      '<div class="fd-segmented fd-export-segments"><span class="fd-segment is-active" data-i18n="fd.presetStandard">標準</span><span class="fd-segment" data-i18n="fd.presetHighQuality">高画質</span><span class="fd-segment" data-i18n="fd.presetCustom">カスタム</span></div>' +
      '<strong class="fd-route-section fd-export-format-title" data-i18n="fd.sectionFormat">形式</strong>' +
      '<div class="fd-format-list">' +
      '<div class="fd-format-row"><span class="fd-radio is-active"></span><span><strong>MP4</strong><small data-i18n="fd.formatMp4Subtitle">汎用動画形式</small></span></div>' +
      '<div class="fd-format-row"><span class="fd-radio"></span><span><strong>GIF</strong><small data-i18n="fd.formatGifSubtitle">アニメーションGIF</small></span></div>' +
      '<div class="fd-format-row"><span class="fd-radio"></span><span><strong data-i18n="fd.formatWebm">透過WebM</strong><small data-i18n="fd.formatWebmSubtitle">透明背景動画</small></span></div>' +
      '<div class="fd-format-row"><span class="fd-radio"></span><span><strong>AVI</strong><small data-i18n="fd.formatAviShort">互換性重視の動画形式</small></span></div>' +
      '</div><div class="fd-export-start">' +
      icon("ic-file_download") +
      '<span data-i18n="fd.exportStart">書き出し開始</span></div></div></div>'
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
    /* user-request-fixes.js can pair the feature copy/diagram columns on an
       early language-change event before DOMContentLoaded. In that ordering
       the placeholder is already inside .feature-diagram-stack, so only
       looking for a direct child leaves the deployed Features mock empty. */
    var old = section.querySelector(
      ":scope > .feature-diagram, :scope > .feature-pair > .feature-diagram-stack > .feature-diagram",
    );
    if (old) old.replaceWith(htmlToElement(html));
  }

  function findScreenshotCard(selector) {
    var cards = document.querySelectorAll(
      ".screenshot-scroller .screenshot-card",
    );
    for (var i = 0; i < cards.length; i++)
      if (cards[i].querySelector(selector)) return cards[i];
    return null;
  }

  function replaceCard(card, html) {
    if (!card) return;
    card.replaceChildren(htmlToElement(html));
    card.classList.add("is-code-verified-mock");
  }

  function normalizeScreenMocks() {
    var galleryCanvas = document.querySelector(
      ".screenshot-scroller .screenshot-card:first-child",
    );
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
    var firstFeatureMedia = document.querySelector(
      "#features .feature-row .feature-media",
    );
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
    replaceFeatureDiagram("#advanced", canvasScreen("onion"));
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
    replaceCard(gallerySave, saveTreeScreen());
    replaceCard(galleryWorkspace, workspaceScreen());
    replaceCard(galleryExport, exportScreen());
  }

  function initScrollUi() {
    var header = document.querySelector(".site-header");
    var btn = document.createElement("button");
    var scheduled = false;
    btn.type = "button";
    btn.className = "scroll-top-btn";
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';
    btn.setAttribute("aria-label", "ページ上部へ");
    document.body.appendChild(btn);

    function updateScrollUi() {
      scheduled = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (header) header.classList.toggle("is-scrolled", y > 16);
      btn.classList.toggle("is-visible", y > 520);
    }

    function scheduleScrollUi() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateScrollUi);
    }

    window.addEventListener("scroll", scheduleScrollUi, { passive: true });
    updateScrollUi();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initNavToggle() {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!btn || !nav) return;
    var panel = document.createElement("div");
    panel.className = "nav-panel";
    panel.setAttribute("aria-hidden", "true");
    var links = nav.cloneNode(true);
    links.classList.remove("site-nav");
    links.classList.add("nav-panel-links");
    panel.appendChild(links);
    document.body.appendChild(panel);

    function closeNav() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function () {
      var open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  function initFaqAccordion() {
    document.querySelectorAll(".faq-question").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq-item");
        if (!item) return;
        var open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  function initAnchorNav() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", href);
      });
    });

    if (window.location.hash) {
      var initial = null;
      try {
        initial = document.querySelector(window.location.hash);
      } catch (_) {
        initial = null;
      }
      if (initial) {
        settleLayoutForAnchor();
        requestAnimationFrame(function () {
          initial.scrollIntoView();
        });
      }
    }
  }

  function settleLayoutForAnchor() {
    document.documentElement.style.scrollBehavior = "auto";
    requestAnimationFrame(function () {
      document.documentElement.style.scrollBehavior = "";
    });
  }

  function ensureNineCommunityTiles() {
    var gallery = document.querySelector(".community-gallery");
    if (!gallery) return;
    var items = gallery.querySelectorAll(":scope > *");
    if (!items.length || items.length >= 9) return;
    for (var i = items.length; i < 9; i++) {
      var clone = items[i % items.length].cloneNode(true);
      gallery.appendChild(clone);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    normalizeScreenMocks();
    initScrollUi();
    initNavToggle();
    initFaqAccordion();
    initAnchorNav();
    ensureNineCommunityTiles();

    function fitMockScreens(force) {
      var mocks = document.querySelectorAll(
        ".fd-app-screen, .fd-route-screen, .feature-section > .feature-diagram",
      );
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
          m.classList.add("is-fit-scaled");
        }
        applyFit(z);
      });
    }

    function refitNow() {
      fitMockScreens(true);
    }
    requestAnimationFrame(refitNow);
    window.addEventListener("load", refitNow);
    whenDesignLayersReady(function () {
      requestAnimationFrame(refitNow);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refitNow);
    }
    var fitTimer = null;
    function scheduleFit() {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitMockScreens, 120);
    }
    window.addEventListener("resize", scheduleFit);

    if (window.ResizeObserver) {
      var fitObserver = new ResizeObserver(scheduleFit);
      Array.prototype.forEach.call(
        document.querySelectorAll(
          ".fd-app-screen, .fd-route-screen, .feature-section > .feature-diagram",
        ),
        function (m) {
          if (m.parentElement) fitObserver.observe(m.parentElement);
        },
      );
    }

    if (window.NIARIM_I18N && window.NIARIM_I18N.applyLang) {
      window.NIARIM_I18N.applyLang(
        document.documentElement.getAttribute("lang") || "ja",
        { persist: false },
      );
    }
  });
})();
