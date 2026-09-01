/**
 * NIARIM公式サイト 共通UIロジック（ヘッダー・メニュー・FAQ・画面再現図）
 */
(function () {
  "use strict";

  function loadDesignLayers() {
    var styles = [
      ["/css/polish.css", "data-niarim-polish"],
      ["/css/responsive-consistency.css", "data-niarim-responsive-consistency"],
      ["/css/screen-mock-accuracy.css", "data-niarim-screen-mock-accuracy"]
    ];
    styles.forEach(function (entry) {
      var href = entry[0], marker = entry[1];
      if (document.querySelector("link[" + marker + "]")) return;
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute(marker, "true");
      document.head.appendChild(link);
    });
  }
  loadDesignLayers();

  var ICON_SPRITE = "/assets/icons/ui/sprite.svg#";
  function icon(name, extraClass) {
    return '<svg class="ic' + (extraClass ? " " + extraClass : "") + '" aria-hidden="true"><use href="' + ICON_SPRITE + name + '"></use></svg>';
  }
  function iconButton(name, extraClass) {
    return '<span class="fd-icon-btn' + (extraClass ? " " + extraClass : "") + '">' + icon(name) + '</span>';
  }

  function canvasTopBar() {
    return '<div class="fd-topbar">' +
      iconButton("ic-undo") + iconButton("ic-redo") +
      '<span class="fd-spacer"></span>' +
      iconButton("ic-settings") + iconButton("ic-home_outlined") +
    '</div>';
  }

  function brushSlider() {
    return '<div class="fd-brush-slider">' +
      '<span class="fd-brush-dot"></span><span class="fd-brush-size">5</span>' +
      '<svg class="ic fd-brush-opacity-ic" viewBox="0 0 24 24"><use href="' + ICON_SPRITE + 'ic-opacity"></use></svg>' +
      '<span class="fd-brush-opacity">100%</span><span class="fd-spacer"></span><span class="fd-brush-toggle">▾</span>' +
    '</div>';
  }

  function canvasToolbar() {
    var tools = [
      ["ic-brush", "is-active"], ["ic-eraser_fa", ""], ["ic-format_color_fill", ""],
      ["ic-colorize", ""], ["ic-pan_tool_alt", ""], ["ic-highlight_alt", ""],
      ["ic-transform", ""], ["ic-text_fields", ""], ["ic-category", ""]
    ];
    var actions = ["ic-tune", "ic-layers", "ic-loop", "ic-save_outlined", "ic-straighten", "ic-help_outline"];
    var html = '<div class="fd-toolbar">';
    tools.forEach(function (tool) { html += iconButton(tool[0], tool[1]); });
    html += '<span class="fd-color-swatch"></span>';
    actions.forEach(function (name) { html += iconButton(name); });
    return html + '</div>';
  }

  function frameStrip() {
    var frames = '';
    for (var i = 0; i < 4; i++) {
      frames += '<span class="fd-frame-thumb' + (i === 0 ? ' is-current' : '') + '"><span class="fd-frame-paper"></span></span>';
    }
    return '<div class="fd-frame-strip">' +
      '<div class="fd-frame-strip-scroll">' + frames + '<span class="fd-frame-add">' + icon("ic-add") + '</span></div>' +
      '<span class="fd-frame-mode"><span class="is-selected">フレーム一覧</span><span>タイムライン</span></span>' +
    '</div>';
  }

  function canvasDrawing(onion) {
    var drawing = onion
      ? '<svg viewBox="0 0 320 180" aria-hidden="true"><path class="fd-stroke-prev" d="M105 91c16-43 88-43 107 0"/><path class="fd-stroke-next" d="M118 88c17-35 74-35 93 0"/></svg>'
      : '';
    return '<div class="fd-canvas-zone"><div class="fd-canvas fd-app-canvas-stage">' + drawing + '</div></div>';
  }

  function panelCloseBar() {
    return '<div class="fd-panel-close-bar"><span class="fd-panel-close">×</span></div>';
  }

  function layerPanel() {
    return '<div class="fd-app-overlay-panel fd-app-layer-panel">' +
      '<div class="fd-layers">' + panelCloseBar() +
        '<div class="fd-layer-header"><strong>レイヤー</strong><span class="fd-spacer"></span>' +
          iconButton("ic-merge_type") + iconButton("ic-help_outline") + iconButton("ic-search") +
        '</div>' +
        '<div class="fd-layer-shortcuts">' +
          '<span class="fd-shortcut-btn">' + icon("ic-add") + '<span>新規レイヤー</span></span>' +
          '<span class="fd-shortcut-btn">' + icon("ic-folder") + '<span>新規フォルダ</span></span>' +
          '<span class="fd-shortcut-btn">' + icon("ic-library_add") + '<span>追加</span></span>' +
          '<span class="fd-shortcut-btn">' + icon("ic-image") + '<span>画像読み込み</span></span>' +
        '</div>' +
        '<div class="fd-layer-row is-active">' +
          icon("ic-visibility", "ic-eye") + '<span class="fd-layer-pencil">⌁</span><span class="fd-layer-thumb"></span>' +
          '<strong class="fd-layer-name">レイヤー1</strong><span class="fd-layer-menu">⋮</span>' + icon("ic-drag_handle", "ic-drag") +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function onionSide(label, color, opacity) {
    return '<div class="fd-onion-side">' +
      '<div class="fd-onion-side-head"><strong>' + label + '</strong><span class="fd-mini-switch is-on"></span></div>' +
      '<div class="fd-onion-control"><span class="fd-onion-color" style="--onion-color:' + color + '"></span><span>色</span></div>' +
      '<div class="fd-onion-control"><span>不透明度</span><span class="fd-mini-slider"><i style="width:' + opacity + '%"></i></span><b>' + opacity + '%</b></div>' +
      '<div class="fd-onion-control"><span>枚数</span><span class="fd-mini-slider"><i style="width:28%"></i></span><b>1</b></div>' +
    '</div>';
  }

  function onionPanel() {
    return '<div class="fd-app-overlay-panel fd-app-onion-panel">' + panelCloseBar() +
      '<div class="fd-onion-title"><strong>オニオンスキン</strong><span class="fd-mini-switch is-on"></span></div>' +
      '<div class="fd-panel-divider"></div>' + onionSide('前フレーム', '#ff5c7a', 35) +
      '<div class="fd-panel-divider"></div>' + onionSide('後フレーム', '#5374ff', 35) +
      '<div class="fd-panel-divider"></div>' +
      '<div class="fd-onion-common"><span>フレーム間隔</span><div><b class="is-selected">1</b><b>2</b><b>3</b></div></div>' +
      '<div class="fd-onion-fade"><span>距離に応じて薄くする</span><span class="fd-mini-switch is-on"></span></div>' +
    '</div>';
  }

  function canvasContents(panel) {
    return canvasTopBar() + canvasDrawing(panel === 'onion') + brushSlider() +
      '<div class="fd-collapse-handle">⌄</div>' + canvasToolbar() +
      '<div class="fd-collapse-handle fd-frame-collapse">⌄</div>' + frameStrip() +
      (panel === 'layer' ? layerPanel() : panel === 'onion' ? onionPanel() : '');
  }

  function canvasScreen(panel) {
    return '<div class="feature-diagram fd-canvas-screen fd-app-screen" aria-hidden="true">' + canvasContents(panel) + '</div>';
  }

  function timelineTopBar() {
    return '<div class="fd-timeline-topbar">' +
      iconButton('ic-arrow_back') + iconButton('ic-palette') + iconButton('ic-home_outlined') +
      '<span class="fd-spacer"></span>' + iconButton('ic-undo') + iconButton('ic-redo') + iconButton('ic-more_vert') + iconButton('ic-help_outline') +
    '</div>';
  }

  function timelineScreen() {
    var frames = '';
    for (var i = 1; i <= 6; i++) frames += '<span class="fd-tl-frame' + (i === 4 ? ' is-current' : '') + '">' + i + '</span>';
    return '<div class="feature-diagram fd-timeline-screen fd-app-screen" aria-hidden="true">' +
      timelineTopBar() +
      '<div class="fd-timeline-preview"><span class="fd-preview-loading"></span><span class="fd-fullscreen-mark">⌗</span></div>' +
      '<div class="fd-timeline-scrubber"><i></i></div>' +
      '<div class="fd-transport">' + iconButton('ic-skip_previous') + iconButton('ic-fast_rewind') + iconButton('ic-play_arrow') + iconButton('ic-fast_forward') + iconButton('ic-skip_next') + '<span class="fd-spacer"></span><span class="fd-loop-mark">↔</span></div>' +
      '<div class="fd-timeline-toolbar">' + iconButton('ic-videocam') + iconButton('ic-audiotrack', 'is-active') + iconButton('ic-image') + iconButton('ic-photo_camera') + iconButton('ic-text_fields') + iconButton('ic-file_download') + '</div>' +
      '<div class="fd-scene-line"><small>選択</small><span class="fd-scene-pill">✓ Scene1</span><span>⋮</span><span>＋</span></div>' +
      '<div class="fd-timeline-row"><small>絵</small><div class="fd-timeline-frames">' + frames + '</div></div>' +
      '<div class="fd-timeline-row fd-end-card-row"><small>終</small><span>エンドカードトラック</span><span>🔒</span></div>' +
      '<span class="fd-playhead"></span>' +
    '</div>';
  }

  function audioScreen() {
    var html = timelineScreen().replace('fd-timeline-screen fd-app-screen', 'fd-timeline-screen fd-app-screen fd-audio-context-screen');
    var sheet = '<div class="fd-audio-dim"></div><div class="fd-clip-detail-sheet">' +
      '<div class="fd-sheet-handle"></div><div class="fd-audio-sheet-head"><strong>音声クリップ</strong><span>' + icon('ic-content_copy') + '</span><span class="fd-delete-mark">▮</span></div>' +
      '<div class="fd-sheet-row"><span>音量</span><button>−</button><span class="fd-sheet-slider"><i style="width:72%"></i></span><button>＋</button><b>72%</b><span>⌄</span></div>' +
      '<div class="fd-sheet-row"><span>フェードイン</span><button>−</button><span class="fd-sheet-slider"><i style="width:18%"></i></span><button>＋</button><b>0.0s</b><span>⌄</span></div>' +
      '<div class="fd-sheet-row"><span>フェードアウト</span><button>−</button><span class="fd-sheet-slider"><i style="width:18%"></i></span><button>＋</button><b>0.0s</b><span>⌄</span></div>' +
    '</div>';
    return html.replace('</div>', '</div>').replace(/<\/div>$/, sheet + '</div>');
  }

  function appBar(title) {
    return '<div class="fd-appbar">' + iconButton('ic-arrow_back') + '<strong>' + title + '</strong><span class="fd-spacer"></span>' + iconButton('ic-help_outline') + '</div>';
  }

  function saveSlotsScreen() {
    var slots = '';
    for (var i = 1; i <= 5; i++) {
      slots += '<div class="fd-save-slot"><span class="fd-save-thumb">＋</span><span class="fd-save-copy"><strong>スロット' + i + '</strong><small>保存データなし</small></span><span class="fd-save-plus">＋</span></div>';
    }
    return '<div class="feature-diagram fd-route-screen fd-save-slots-screen" aria-hidden="true">' + appBar('セーブスロット') + '<div class="fd-route-body fd-save-slots-body">' + slots + '</div></div>';
  }

  function workspaceScreen() {
    var items = ['Gペン', '消しゴム', 'バケツ', 'スポイト', '指', '手のひら', '選択'];
    var rows = items.map(function (name) {
      return '<div class="fd-workspace-row"><span class="fd-check is-on">✓</span><strong>' + name + '</strong><span class="fd-spacer"></span><span class="fd-drag-mark">＝</span></div>';
    }).join('');
    return '<div class="feature-diagram fd-route-screen fd-workspace-screen" aria-hidden="true">' + appBar('ワークスペース設定') +
      '<div class="fd-route-body fd-workspace-body"><strong class="fd-route-section">ツールバー編集</strong>' +
      '<p class="fd-route-hint">表示するツールをチェックで選択し、ドラッグで並べ替えます。</p>' +
      '<div class="fd-toolbar-preview">' + iconButton('ic-brush', 'is-active') + iconButton('ic-eraser_fa') + iconButton('ic-format_color_fill') + iconButton('ic-colorize') + iconButton('ic-pan_tool_alt') + iconButton('ic-highlight_alt') + iconButton('ic-transform') + iconButton('ic-text_fields') + '</div>' +
      '<div class="fd-workspace-card">' + rows + '</div></div></div>';
  }

  function exportScreen() {
    return '<div class="feature-diagram fd-route-screen fd-export-screen" aria-hidden="true">' + appBar('書き出し') +
      '<div class="fd-route-body fd-export-body"><strong class="fd-route-section">プリセット</strong>' +
      '<div class="fd-segmented fd-export-segments"><span class="fd-segment is-active">標準</span><span class="fd-segment">高画質</span><span class="fd-segment">カスタム</span></div>' +
      '<strong class="fd-route-section fd-export-format-title">形式</strong>' +
      '<div class="fd-format-list">' +
        '<div class="fd-format-row"><span class="fd-radio is-active"></span><span><strong>MP4</strong><small>汎用動画形式</small></span></div>' +
        '<div class="fd-format-row"><span class="fd-radio"></span><span><strong>GIF</strong><small>アニメーションGIF</small></span></div>' +
        '<div class="fd-format-row"><span class="fd-radio"></span><span><strong>透過WebM</strong><small>透明背景動画</small></span></div>' +
        '<div class="fd-format-row"><span class="fd-radio"></span><span><strong>AVI</strong><small>互換性重視の動画形式</small></span></div>' +
      '</div><div class="fd-export-start">' + icon('ic-file_download') + '<span>書き出し開始</span></div></div></div>';
  }

  function htmlToElement(html) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    return wrap.firstElementChild;
  }

  function replaceFeatureDiagram(sectionSelector, html) {
    var section = document.querySelector(sectionSelector);
    if (!section) return;
    var old = section.querySelector(':scope > .feature-diagram');
    if (old) old.replaceWith(htmlToElement(html));
  }

  function findScreenshotCard(selector) {
    var cards = document.querySelectorAll('.screenshot-scroller .screenshot-card');
    for (var i = 0; i < cards.length; i++) if (cards[i].querySelector(selector)) return cards[i];
    return null;
  }

  function replaceCard(card, html) {
    if (!card) return;
    card.replaceChildren(htmlToElement(html));
    card.classList.add('is-code-verified-mock');
  }

  function normalizeScreenMocks() {
    /* capture the original gallery targets before replacing any DOM */
    var galleryCanvas = document.querySelector('.screenshot-scroller .screenshot-card:first-child');
    var galleryTimeline = findScreenshotCard('.fd-timeline-title');
    var galleryLayer = findScreenshotCard('.fd-layer-panel-overlay');
    var galleryOnion = findScreenshotCard('.fd-onion-legend');
    var galleryAudio = findScreenshotCard('.fd-audio-track');
    var gallerySave = findScreenshotCard('.fd-slot-list');
    var galleryWorkspace = findScreenshotCard('.fd-setting-row');
    var galleryExport = findScreenshotCard('.fd-segmented');

    /* hero = actual CanvasScreen baseline; first feature and first app preview reuse it exactly */
    var hero = document.querySelector('.hero-visual');
    if (hero) {
      hero.className = 'hero-visual fd-canvas-screen fd-app-screen';
      hero.removeAttribute('data-parallax');
      hero.innerHTML = canvasContents(null);
    }
    var heroSource = document.querySelector('.hero-visual');
    var firstFeatureMedia = document.querySelector('#features .feature-row .feature-media');
    if (heroSource && firstFeatureMedia) {
      var featureClone = heroSource.cloneNode(true);
      featureClone.classList.add('hero-visual-reuse');
      firstFeatureMedia.replaceChildren(featureClone);
    }
    if (heroSource && galleryCanvas) {
      var galleryClone = heroSource.cloneNode(true);
      galleryClone.classList.add('hero-visual-reuse');
      galleryCanvas.replaceChildren(galleryClone);
      galleryCanvas.classList.add('is-code-verified-mock');
    }

    /* Features page */
    replaceFeatureDiagram('#drawing', canvasScreen(null));
    replaceFeatureDiagram('#animation', timelineScreen());
    replaceFeatureDiagram('#editing', canvasScreen('layer'));
    replaceFeatureDiagram('#advanced', canvasScreen('onion'));
    replaceFeatureDiagram('#audio', audioScreen());
    replaceFeatureDiagram('#save', saveSlotsScreen());
    replaceFeatureDiagram('#workspace', workspaceScreen());
    replaceFeatureDiagram('#export', exportScreen());

    /* Home main-feature rows */
    var rows = document.querySelectorAll('#features .feature-row');
    if (rows[1]) { var m1 = rows[1].querySelector('.feature-media'); if (m1) m1.replaceChildren(htmlToElement(timelineScreen())); }
    if (rows[2]) { var m2 = rows[2].querySelector('.feature-media'); if (m2) m2.replaceChildren(htmlToElement(canvasScreen('layer'))); }
    if (rows[3]) { var m3 = rows[3].querySelector('.feature-media'); if (m3) m3.replaceChildren(htmlToElement(canvasScreen('onion'))); }
    if (rows[4]) { var m4 = rows[4].querySelector('.feature-media'); if (m4) m4.replaceChildren(htmlToElement(exportScreen())); }

    /* Home app-preview gallery */
    replaceCard(galleryTimeline, timelineScreen());
    replaceCard(galleryLayer, canvasScreen('layer'));
    replaceCard(galleryOnion, canvasScreen('onion'));
    replaceCard(galleryAudio, audioScreen());
    replaceCard(gallerySave, saveSlotsScreen());
    replaceCard(galleryWorkspace, workspaceScreen());
    replaceCard(galleryExport, exportScreen());
  }

  function initScrollUi() {
    var header = document.querySelector('.site-header');
    var btn = document.createElement('button');
    var scheduled = false;
    btn.type = 'button';
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';
    document.body.appendChild(btn);
    function applyLabel() {
      var lang = document.documentElement.getAttribute('lang') || 'ja';
      var label = window.NIARIM_I18N && window.NIARIM_I18N.translate(lang, 'common.scrollTop');
      btn.setAttribute('aria-label', label || 'ページトップへ戻る');
    }
    function applyScrollState() {
      scheduled = false;
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      btn.classList.toggle('is-visible', y > 480);
    }
    function requestScrollState() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(applyScrollState);
    }
    applyLabel();
    applyScrollState();
    document.addEventListener('niarim:langchange', applyLabel);
    window.addEventListener('scroll', requestScrollState, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function initNavToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;
    function close() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.addEventListener('click', function (event) { if (event.target.closest && event.target.closest('a')) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
  }

  function initFaqAccordion() {
    if (!document.querySelector('.faq-item')) return;
    document.addEventListener('click', function (event) {
      var question = event.target.closest && event.target.closest('.faq-question');
      if (!question) return;
      var item = question.closest('.faq-item');
      var answer = item && item.querySelector('.faq-answer');
      if (!item || !answer) return;
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : '0px';
    });
  }

  function ensureNineCommunityTiles() {
    var gallery = document.querySelector('.community-gallery');
    if (!gallery) return;
    var cards = gallery.querySelectorAll('.community-card:not(.is-more-cta)');
    var more = gallery.querySelector('.community-card.is-more-cta');
    if (cards.length !== 8 || !more) return;
    var ninth = cards[cards.length - 1].cloneNode(true);
    var badge = ninth.querySelector('.rank-badge');
    if (badge) badge.textContent = '9';
    gallery.insertBefore(ninth, more);
  }

  document.addEventListener('DOMContentLoaded', function () {
    normalizeScreenMocks();
    initScrollUi();
    initNavToggle();
    initFaqAccordion();
    ensureNineCommunityTiles();
  });
})();