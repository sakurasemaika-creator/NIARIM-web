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

  function brushSlider() {
    return (
      '<div class="fd-brush-slider">' +
      '<span class="fd-brush-dot"></span><span class="fd-brush-size">5</span>' +
      '<svg class="ic fd-brush-opacity-ic" viewBox="0 0 24 24"><use href="' +
      ICON_SPRITE +
      'ic-opacity"></use></svg>' +
      '<span class="fd-brush-opacity">100%</span><span class="fd-spacer"></span><span class="fd-brush-toggle">▾</span>' +
      "</div>"
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
      '<span class="fd-frame-mode"><span class="is-selected" data-i18n="fd.frameListMode">フレーム一覧</span><span data-i18n="fd.timelineMode">タイムライン</span></span>' +
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
      icon("ic-folder") +
      '<span data-i18n="fd.newFolder">新規フォルダ</span></span>' +
      '<span class="fd-shortcut-btn">' +
      icon("ic-library_add") +
      '<span data-i18n="fd.addLayer">追加</span></span>' +
      '<span class="fd-shortcut-btn">' +
      icon("ic-image") +
      '<span data-i18n="fd.importImage">画像読み込み</span></span>' +
      "</div>" +
      '<div class="fd-layer-row is-active">' +
      icon("ic-visibility", "ic-eye") +
      '<span class="fd-layer-pencil">⌁</span><span class="fd-layer-thumb"></span>' +
      '<strong class="fd-layer-name" data-i18n="fd.layer1">レイヤー1</strong><span class="fd-layer-menu">⋮</span>' +
      icon("ic-drag_handle", "ic-drag") +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function onionSide(label, color, opacity, key) {
    return (
      '<div class="fd-onion-side">' +
      '<div class="fd-onion-side-head">' +
      (key ? '<strong data-i18n="' + key + '">' : "<strong>") +
      label +
      '</strong><span class="fd-mini-switch is-on"></span></div>' +
      '<div class="fd-onion-control"><span class="fd-onion-color" style="--onion-color:' +
      color +
      '"></span><span data-i18n="fd.onionColor">色</span></div>' +
      '<div class="fd-onion-control"><span data-i18n="fd.onionOpacity">不透明度</span><span class="fd-mini-slider"><i style="width:' +
      opacity +
      '%"></i></span><b>' +
      opacity +
      "%</b></div>" +
      '<div class="fd-onion-control"><span data-i18n="fd.onionCount">枚数</span><span class="fd-mini-slider"><i style="width:28%"></i></span><b>1</b></div>' +
      "</div>"
    );
  }

  function onionPanel() {
    return (
      '<div class="fd-app-overlay-panel fd-app-onion-panel">' +
      panelCloseBar() +
      '<div class="fd-onion-title"><strong data-i18n="fd.onionSkin">オニオンスキン</strong><span class="fd-mini-switch is-on"></span></div>' +
      '<div class="fd-panel-divider"></div>' +
      onionSide("前フレーム", "#ff5c7a", 35, "fd.prevFrame") +
      '<div class="fd-panel-divider"></div>' +
      onionSide("後フレーム", "#5374ff", 35, "fd.onionNext") +
      '<div class="fd-panel-divider"></div>' +
      '<div class="fd-onion-common"><span data-i18n="fd.onionInterval">フレーム間隔</span><div><b class="is-selected">1</b><b>2</b><b>3</b></div></div>' +
      '<div class="fd-onion-fade"><span data-i18n="fd.onionFade">距離に応じて薄くする</span><span class="fd-mini-switch is-on"></span></div>' +
      "</div>"
    );
  }

  function canvasContents(panel) {
    return (
      canvasTopBar() +
      canvasDrawing(panel === "onion") +
      brushSlider() +
      '<div class="fd-collapse-handle">⌄</div>' +
      canvasToolbar() +
      '<div class="fd-collapse-handle fd-frame-collapse">⌄</div>' +
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
      "<small>🔒</small></span>" +
      iconButton("ic-movie_filter") +
      iconButton("ic-camera") +
      iconButton("ic-push_pin_outlined") +
      uploadIconButton() +
      "</div>"
    );
  }

  function timelineScreen() {
    var frames = "";
    // 5マスを中央寄せにして、真ん中のコマが中央固定の赤枠に入るようにする
    // （実機のTimelineScreenと同じ見え方）。
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
      // プレビュー欄は再生中のコマが出る場所。真っ白のままだと
      // 何を映しているのか分からないので、編集中のコマと同じ絵を出す。
      '<div class="fd-timeline-preview">' +
      frameArtwork(2) +
      '<span class="fd-preview-loading"></span><span class="fd-fullscreen-mark">⌗</span></div>' +
      '<div class="fd-timeline-scrubber"><i></i></div>' +
      '<div class="fd-transport">' +
      iconButton("ic-skip_previous") +
      iconButton("ic-fast_rewind") +
      iconButton("ic-play_arrow") +
      iconButton("ic-fast_forward") +
      iconButton("ic-skip_next") +
      '<span class="fd-spacer"></span><span class="fd-loop-mark">↔</span></div>' +
      timelineToolbar() +
      '<div class="fd-scene-line"><small data-i18n="fd.trackScene">選択</small><span class="fd-scene-pill">✓ Scene1</span><span>⋮</span><span>+</span></div>' +
      '<div class="fd-timeline-row"><small data-i18n="fd.trackArt">絵</small><div class="fd-timeline-frames">' +
      frames +
      // 実機のTimelineScreenは、コマ一覧の中央に固定した赤枠で現在位置を
      // 示す（再生位置を貫く縦線は存在しない）。
      '<span class="fd-frame-cursor is-error" aria-hidden="true"></span>' +
      "</div></div>" +
      '<div class="fd-timeline-row fd-end-card-row"><small data-i18n="fd.trackEnd">終</small><span data-i18n="fd.endCardTrack">エンドカードトラック</span><span>🔒</span></div>' +
      "</div>"
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
      '</span><span class="fd-delete-mark">▮</span></div>' +
      '<div class="fd-sheet-row"><span data-i18n="fd.volume">音量</span><button>−</button><span class="fd-sheet-slider"><i style="width:72%"></i></span><button>+</button><b>72%</b><span>⌄</span></div>' +
      '<div class="fd-sheet-row"><span data-i18n="fd.fadeIn">フェードイン</span><button>−</button><span class="fd-sheet-slider"><i style="width:18%"></i></span><button>+</button><b>0.0s</b><span>⌄</span></div>' +
      '<div class="fd-sheet-row"><span data-i18n="fd.fadeOut">フェードアウト</span><button>−</button><span class="fd-sheet-slider"><i style="width:18%"></i></span><button>+</button><b>0.0s</b><span>⌄</span></div>' +
      "</div>";
    return html.replace(/<\/div>$/, sheet + "</div>");
  }

  function appBar(title, treeMode, key) {
    return (
      '<div class="fd-appbar">' +
      iconButton("ic-arrow_back") +
      (key ? '<strong data-i18n="' + key + '">' : "<strong>") +
      title +
      '</strong><span class="fd-spacer"></span>' +
      iconButton("ic-help_outline") +
      (treeMode
        ? '<span class="fd-tree-save-btn">' +
          icon("ic-save_outlined") +
          '<b data-i18n="fd.saveButton">保存</b></span>'
        : "") +
      "</div>"
    );
  }

  function saveSlotsScreen() {
    var slots = "";
    for (var i = 1; i <= 5; i++) {
      slots +=
        '<div class="fd-save-slot"><span class="fd-save-thumb">+</span><span class="fd-save-copy"><strong><span data-i18n="fd.slotPrefix">スロット</span>' +
        i +
        '</strong><small data-i18n="fd.slotEmpty">保存データなし</small></span><span class="fd-save-plus">+</span></div>';
    }
    return (
      '<div class="feature-diagram fd-route-screen fd-save-slots-screen" aria-hidden="true">' +
      appBar("セーブスロット", false, "fd.saveSlotsTitle") +
      '<div class="fd-route-body fd-save-slots-body">' +
      slots +
      "</div></div>"
    );
  }

  // SaveTreeScreen の再現。アプリ側 _TreeConnectorPainter と同じ規則で線を引く。
  //  ・接続線の欄は深さ1つにつき20px。線は各20px欄の中央(10px)を通る。
  //  ・祖先の欄は、そこからまだ枝分かれが続く場合だけ全高の縦線。
  //  ・自分の欄は上半分が必ず縦線。下に続く兄弟がいる場合だけ下半分も引く。
  //  ・自分の欄の中央から右のタイルへ横線。
  //  ・深さ0の行には接続線の欄そのものが無い。
  function treeRow(depth, ancestorContinues, hasNextSibling, num) {
    var cols = "";
    for (var i = 0; i < depth; i++) {
      var isSelf = i === depth - 1;
      var cls = "fd-tree-col";
      if (isSelf) cls += " is-self" + (hasNextSibling ? " is-continue" : "");
      else if (ancestorContinues[i]) cls += " is-through";
      cols += '<i class="' + cls + '"></i>';
    }
    return (
      '<div class="fd-tree-row">' +
      (depth ? '<span class="fd-tree-lines">' + cols + "</span>" : "") +
      '<span class="fd-tree-commit" aria-hidden="true"></span>' +
      '<span class="fd-tree-copy"><strong><span data-i18n="fd.savePointPrefix">保存</span> ' +
      num +
      "</strong><small>2026/09/01 23:34</small></span>" +
      '<span class="fd-tree-more">⋮</span></div>'
    );
  }

  function saveTreeScreen() {
    return (
      '<div class="feature-diagram fd-route-screen fd-save-tree-screen" aria-hidden="true">' +
      appBar("セーブツリー", true, "fd.saveTreeTitle") +
      '<div class="fd-route-body fd-save-tree-body"><div class="fd-real-tree">' +
      // 親が上、子が下。アプリの _flattenTreeRows と同じ深さ優先の並び。
      treeRow(0, [], false, "01") +
      treeRow(1, [], false, "02") +
      treeRow(2, [false], false, "03") +
      "</div></div></div>"
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
          '<div class="fd-workspace-row"><span class="fd-check is-on">✓</span><strong data-i18n="' +
          item[1] +
          '">' +
          name +
          '</strong><span class="fd-spacer"></span><span class="fd-drag-mark" aria-hidden="true"></span></div>'
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

  function replaceFeatureDiagram(sectionSelector, html) {
    var section = document.querySelector(sectionSelector);
    if (!section) return;
    var old = section.querySelector(":scope > .feature-diagram");
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
    /* capture the original gallery targets before replacing any DOM */
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

    /* hero = actual CanvasScreen baseline; first feature and first app preview reuse it exactly */
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

    /* Features page: 保存は実Tree mode、Galleryは既定のセーブスロットを使い分ける。 */
    replaceFeatureDiagram("#drawing", canvasScreen(null));
    replaceFeatureDiagram("#animation", timelineScreen());
    replaceFeatureDiagram("#editing", canvasScreen("layer"));
    replaceFeatureDiagram("#advanced", canvasScreen("onion"));
    replaceFeatureDiagram("#audio", audioScreen());
    replaceFeatureDiagram("#save", saveTreeScreen());
    replaceFeatureDiagram("#workspace", workspaceScreen());
    replaceFeatureDiagram("#export", exportScreen());

    /* Home main-feature rows */
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

    /* Home app-preview gallery */
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
    // Escapeで閉じたときにフォーカスが画面外の（非表示になった）メニュー項目に
    // 残ると、キーボード操作の現在地を見失うため、開閉ボタンへ明示的に戻す。
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

    // 開閉ボタンと中身を aria-controls / aria-labelledby で結び付ける。
    // 以前は aria-expanded のみで、支援技術からは「このボタンがどの領域を
    // 開くのか」が辿れなかった。
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

    // 開閉はイベント委譲で扱う（後から差し込まれた項目にも効くため）。
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
        // 閉じるときは、いまの高さをpxに戻してから0へ動かす。
        answer.style.maxHeight = answer.scrollHeight + "px";
        void answer.offsetHeight;
        answer.style.maxHeight = "0px";
      } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });

    // 開き切ったら高さの上限を外す。px固定のままだと、測った値と実際の
    // 高さが数px食い違って最終行の下が切れることがある（フォントの
    // 読み込み完了や行の丸めで生じる）。
    document.addEventListener(
      "transitionend",
      function (event) {
        if (event.propertyName !== "max-height") return;
        var answer = event.target;
        if (!answer.classList || !answer.classList.contains("faq-answer"))
          return;
        var item = answer.closest(".faq-item");
        if (item && item.classList.contains("is-open"))
          answer.style.maxHeight = "none";
      },
      true,
    );

    // 開いたまま画面幅が変わったり言語を切り替えたりすると、px固定の
    // max-heightが実際の内容の高さと合わなくなり、答えが途中で切れる
    // （逆に余白が余る）ため、開いている項目の高さを測り直す。
    function remeasure() {
      // 開いている項目は上限を外しておけば、幅の変化や言語切り替えで
      // 中身の高さが変わっても勝手に追従する（px固定だと合わなくなる）。
      document
        .querySelectorAll(".faq-item.is-open .faq-answer")
        .forEach(function (answer) {
          answer.style.maxHeight = "none";
        });
    }

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(remeasure, 150);
    });
    document.addEventListener("niarim:langchange", function () {
      requestAnimationFrame(remeasure);
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

  /**
   * ページ内リンクの着地点がずれるのを防ぐ。
   *
   * 画面外のセクションは content-visibility: auto で描画を遅らせているが、
   * まだ描画していないセクションの高さはブラウザが見積り値（720px）で
   * 扱う。実際の機能セクションはこれよりずっと高いため、ページを開いた
   * 直後に機能ページのタブを押すと、目的の見出しより手前で止まってしまう
   * （実測で最大1155pxのずれ。押した直後に is-active が1つ前の節を指す
   * のもこれが原因）。
   *
   * リンクを押した時点で見積りをやめ、実寸で並べ直してからスクロールさせる。
   * 一度きりの切り替えなので、初回表示の描画を軽くする効果は保たれる。
   */
  function settleLayoutForAnchor() {
    var root = document.documentElement;
    if (root.classList.contains("is-anchor-nav")) return;
    root.classList.add("is-anchor-nav");
    // ここで一度レイアウトを確定させておかないと、ブラウザは見積りの
    // ままスクロール位置を決めてしまう。
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
        var target = null;
        try {
          target = document.querySelector(hash);
        } catch (_) {
          return;
        }
        if (target) settleLayoutForAnchor();
      },
      // ブラウザ既定のスクロールより前に走らせる必要があるため捕捉フェーズ。
      true,
    );

    // /features/#export のようにハッシュ付きで開かれた場合も同じ理由で
    // ずれるため、並べ直したうえで目的地へ入れ直す。
    if (window.location.hash && window.location.hash.length > 1) {
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

  document.addEventListener("DOMContentLoaded", function () {
    normalizeScreenMocks();
    initScrollUi();
    initNavToggle();
    initFaqAccordion();
    initAnchorNav();
    ensureNineCommunityTiles();
    // 画面図はこのファイルがJavaScriptで組み立てているため、i18n.jsが
    // 最初に翻訳を当てた時点ではまだDOMに存在しない。そのままだと図の中の
    // ラベルだけ日本語のまま残る（実際に英語表示でも「フレーム一覧」等が
    // 出ていた）。組み立て後に現在の言語で翻訳し直す。
    // 以後の言語切り替えは i18n.js が [data-i18n] を都度走査するため、
    // この一度の再適用だけで足りる。
    // 画面再現図は実機と同じ寸法のUIを、実機より小さい枠に積んでいる。
    // 枠に収まりきらない画面は、下の段が切れたまま表示されてしまうので、
    // 収まる倍率を測って縮める（レイアウトは等倍のまま見た目だけ縮小）。
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
        // 極端に縮むと文字が読めないので下限を設ける。320px幅の端末では
        // 枠自体が小さく、0.62では収まりきらずコマ一覧の下端が数px
        // 切れていたため、0.56まで許容する。
        var scale = Math.max(0.56, have / need);
        var z = Math.round(scale * 1000) / 1000;
        // 幅・高さは他のレイヤーが !important で 100% に固定しているため、
        // インラインの !important で上書きする必要がある。
        m.style.setProperty("--fd-fit", String(z));
        m.style.setProperty("transform", "scale(" + z + ")", "important");
        m.style.setProperty("transform-origin", "top left", "important");
        var cw = m.clientWidth;
        m.style.setProperty("width", cw / z + "px", "important");
        m.style.setProperty("margin-right", -(cw / z - cw) + "px", "important");
        // 高さは % ではなく実測のpxで持たせ、広げたぶんを負のマージンで
        // 取り消す。transform はレイアウト上の大きさを変えないため、
        // % で広げると「枠が伸びる→親の行が伸びる→また測り直す」の
        // 堂々巡りになり、スマホのヒーローで倍率が付いたり消えたりしていた。
        // 見た目の高さ（need * z = have）とレイアウト上の高さを一致させる。
        m.style.setProperty("height", need + "px", "important");
        m.style.setProperty(
          "margin-bottom",
          -(need - have) + "px",
          "important",
        );
        // 他のレイヤーが max-width/max-height を 100% で固定しているため、
        // 広げた分が clamp されないよう外す。
        m.style.setProperty("max-width", "none", "important");
        m.style.setProperty("max-height", "none", "important");
        m.classList.add("is-fit-scaled");

        // 幅を広げたぶん行の折り返しが変わり、縮めたあとでも数pxだけ
        // はみ出しが残ることがある。残っていたら、その実測でもう一度だけ
        // 詰める（何度も繰り返すと文字が読めない大きさになるので3回まで）。
        for (var pass = 0; pass < 3; pass += 1) {
          var rest = m.scrollHeight - m.clientHeight;
          if (rest <= 1) break;
          z = Math.max(
            0.56,
            Math.round(((z * have) / (have + rest)) * 1000) / 1000,
          );
          m.style.setProperty("--fd-fit", String(z));
          m.style.setProperty("transform", "scale(" + z + ")", "important");
          m.style.setProperty("width", cw / z + "px", "important");
          m.style.setProperty(
            "margin-right",
            -(cw / z - cw) + "px",
            "important",
          );
          m.style.setProperty("height", have / z + "px", "important");
          m.style.setProperty(
            "margin-bottom",
            -(have / z - have) + "px",
            "important",
          );
        }
      });
    }
    // 初期表示直後はまだ高さが確定していないことがあるので、
    // レイアウト後・フォント読み込み後にも測り直す。
    // レイアウトが確定していく途中の測定は当てにならないので、節目ごとに
    // キャッシュを無視して測り直す（force）。以降のリサイズは幅が
    // 変わったときだけで足りる。
    function refitNow() {
      fitMockScreens(true);
    }
    requestAnimationFrame(refitNow);
    window.addEventListener("load", refitNow);
    // 後から足しているデザイン用CSSが当たると枠の大きさが変わるため、
    // それが出揃ってから必ず測り直す。
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

    // 画面幅ではなく「枠そのものの大きさ」が変わることでも収まりは崩れる。
    // スマホのヒーローでは枠の幅がレイアウト確定後に決まるため、
    // 初回の測定が空振りして、ツールバーやコマ一覧が枠の下からはみ出した
    // まま（＝ベゼルで切れたまま）表示されていた。
    // 枠自身は倍率調整でwidth/heightを書き換えるので、監視するのは
    // 「こちらが触らない親要素」にして、自分の書き換えで再発火しないようにする。
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
