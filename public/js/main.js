/**
 * NIARIM公式サイト 共通UIロジック（ヘッダー・メニュー・FAQ等）
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
      link.rel = "stylesheet"; link.href = href; link.setAttribute(marker, "true");
      document.head.appendChild(link);
    });
  }
  loadDesignLayers();

  var ICON_SPRITE = "/assets/icons/ui/sprite.svg#";
  function icon(name, extraClass) { return '<svg class="ic' + (extraClass ? " " + extraClass : "") + '" aria-hidden="true"><use href="' + ICON_SPRITE + name + '"></use></svg>'; }
  function iconButton(name, extraClass) { return '<span class="fd-icon-btn' + (extraClass ? " " + extraClass : "") + '">' + icon(name) + '</span>'; }
  function canvasTopBar() { return '<div class="fd-topbar">' + iconButton("ic-undo") + iconButton("ic-redo") + '<span class="fd-spacer"></span>' + iconButton("ic-settings") + iconButton("ic-home_outlined") + '</div>'; }
  function canvasDrawingSvg(onion) {
    if (onion) return '<svg viewBox="0 0 400 220" aria-hidden="true"><path class="fd-stroke-prev" d="M103 100 A62 62 0 1 0 227 100 A62 62 0 1 0 103 100" /><path class="fd-stroke-next" d="M133 91 A62 62 0 1 0 257 91 A62 62 0 1 0 133 91" /><path class="fd-stroke" d="M118 95 A62 62 0 1 0 242 95 A62 62 0 1 0 118 95" /></svg>';
    return '<svg viewBox="0 0 400 220" aria-hidden="true"><path class="fd-stroke" d="M118 95 A62 62 0 1 0 242 95 A62 62 0 1 0 118 95" /></svg>';
  }
  function brushSlider() { return '<div class="fd-brush-slider"><span class="fd-brush-dot"></span><span class="fd-brush-size">12</span><svg class="ic fd-brush-opacity-ic" viewBox="0 0 24 24"><use href="' + ICON_SPRITE + 'ic-opacity"></use></svg><span class="fd-brush-opacity">80%</span><span class="fd-spacer"></span><span class="fd-brush-toggle">▾</span></div>'; }
  function canvasToolbar() {
    var tools = [["ic-brush","is-active"],["ic-eraser_fa",""],["ic-format_color_fill",""],["ic-colorize",""],["ic-pan_tool_alt",""],["ic-highlight_alt",""],["ic-transform",""],["ic-text_fields",""],["ic-category",""]];
    var actions = ["ic-tune","ic-layers","ic-loop","ic-save_outlined","ic-straighten","ic-help_outline"], html = '<div class="fd-toolbar">';
    tools.forEach(function (tool) { html += iconButton(tool[0], tool[1]); }); html += '<span class="fd-color-swatch"></span>'; actions.forEach(function (name) { html += iconButton(name); }); return html + '</div>';
  }
  function frameStrip() {
    var thumb = '<span class="fd-frame-thumb"><svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="44" fill="#fff"/><circle cx="18" cy="22" r="10" fill="none" stroke="#333" stroke-width="2"/></svg></span>';
    return '<div class="fd-frame-strip"><div class="fd-frame-strip-scroll">' + thumb.repeat(5) + '<span class="fd-frame-add">' + icon("ic-add") + '</span></div><span class="fd-frame-strip-mode" data-i18n="fd.frameListMode">フレーム一覧</span></div>';
  }
  function panelCloseBar() { return '<div class="fd-panel-close-bar"><span></span></div>'; }
  function buildLayerPanelFromExisting(existingPanel) {
    if (existingPanel) { var clone = existingPanel.cloneNode(true); clone.classList.add("fd-app-overlay-panel", "fd-app-layer-panel"); return clone.outerHTML; }
    return '<div class="fd-layer-panel-overlay fd-app-overlay-panel fd-app-layer-panel"><div class="fd-layers">' + panelCloseBar() + '<div class="fd-layer-header"><span>レイヤー</span><span class="fd-spacer"></span>' + iconButton("ic-merge_type") + iconButton("ic-help_outline") + iconButton("ic-search") + '</div><div class="fd-layer-shortcuts"><span class="fd-shortcut-btn">' + icon("ic-add") + '<span>新規</span></span><span class="fd-shortcut-btn">' + icon("ic-folder") + '<span>フォルダ</span></span><span class="fd-shortcut-btn">' + icon("ic-library_add") + '<span>追加</span></span><span class="fd-shortcut-btn">' + icon("ic-image") + '<span>画像</span></span></div><div class="fd-layer-row is-active">' + icon("ic-visibility","ic-eye") + '<span class="ic-type"></span><span class="fd-layer-thumb"></span><span class="fd-layer-name">線画</span>' + icon("ic-drag_handle","ic-drag") + '</div><div class="fd-layer-row">' + icon("ic-visibility","ic-eye") + '<span class="ic-type"></span><span class="fd-layer-thumb"></span><span class="fd-layer-name">色</span>' + icon("ic-drag_handle","ic-drag") + '</div><div class="fd-layer-row">' + icon("ic-visibility","ic-eye") + '<span class="ic-type"></span><span class="fd-layer-thumb"></span><span class="fd-layer-name">背景</span>' + icon("ic-drag_handle","ic-drag") + '</div></div></div>';
  }
  function onionSide(label,color,opacity,frames) { return '<div class="fd-onion-side"><div class="fd-onion-side-head"><strong>' + label + '</strong><span class="fd-mini-switch is-on"></span></div><div class="fd-onion-control"><span class="fd-onion-color" style="--onion-color:' + color + '"></span><span>色</span></div><div class="fd-onion-control"><span>不透明度</span><span class="fd-mini-slider"><i style="width:' + Math.round(opacity*100) + '%"></i></span><b>' + Math.round(opacity*100) + '%</b></div><div class="fd-onion-control"><span>枚数</span><span class="fd-mini-slider"><i style="width:' + (frames*28) + '%"></i></span><b>' + frames + '</b></div></div>'; }
  function onionPanel() { return '<div class="fd-app-overlay-panel fd-app-onion-panel">' + panelCloseBar() + '<div class="fd-onion-title"><strong>オニオンスキン</strong><span class="fd-mini-switch is-on"></span></div><div class="fd-panel-divider"></div>' + onionSide('前フレーム','#ff0000',.35,1) + '<div class="fd-panel-divider"></div>' + onionSide('後フレーム','#0000ff',.35,1) + '<div class="fd-panel-divider"></div><div class="fd-onion-common"><span>フレーム間隔</span><div><b class="is-selected">1</b><b>2</b><b>3</b></div></div><div class="fd-onion-fade"><span>距離に応じて薄くする</span><span class="fd-mini-switch is-on"></span></div></div>'; }
  function buildCanvasMock(options) {
    options = options || {}; var panelHtml = options.panel === 'layer' ? buildLayerPanelFromExisting(options.existingPanel) : options.panel === 'onion' ? onionPanel() : '';
    return '<div class="feature-diagram fd-canvas-screen fd-app-screen" aria-hidden="true">' + canvasTopBar() + '<div class="fd-canvas fd-app-canvas-stage">' + canvasDrawingSvg(options.panel === 'onion') + '</div>' + brushSlider() + '<div class="fd-collapse-handle">⌄</div>' + canvasToolbar() + '<div class="fd-collapse-handle fd-frame-collapse">⌄</div>' + frameStrip() + panelHtml + '</div>';
  }
  function replaceFeatureCanvas(sectionId,panel) { var section=document.querySelector(sectionId); if(!section)return; var old=section.querySelector(":scope > .feature-diagram"); if(!old)return; var existingPanel=panel==='layer'?old.querySelector('.fd-layer-panel-overlay'):null,wrap=document.createElement('div'); wrap.innerHTML=buildCanvasMock({panel:panel,existingPanel:existingPanel}); old.replaceWith(wrap.firstElementChild); }
  function findScreenshotCard(selector) { var cards=document.querySelectorAll('.screenshot-scroller .screenshot-card'); for(var i=0;i<cards.length;i++) if(cards[i].querySelector(selector)) return cards[i]; return null; }
  function replaceHomeCanvasCard(selector,panel) { var card=findScreenshotCard(selector); if(!card)return; var existing=panel==='layer'?card.querySelector('.fd-layer-panel-overlay'):null,wrap=document.createElement('div'); wrap.innerHTML=buildCanvasMock({panel:panel,existingPanel:existing}); card.replaceChildren(wrap.firstElementChild); card.classList.add('is-code-verified-mock'); }

  function normalizeCanvasScreenMocks() {
    replaceFeatureCanvas('#drawing',null); replaceFeatureCanvas('#editing','layer'); replaceFeatureCanvas('#advanced','onion');
    replaceHomeCanvasCard('.fd-layer-panel-overlay','layer'); replaceHomeCanvasCard('.fd-onion-legend','onion');
  }

  function reuseHeroScreenMock() {
    var source=document.querySelector('.hero-visual'); if(!source)return;
    var targets=[document.querySelector('#features .feature-row .feature-media'),document.querySelector('.screenshot-scroller .screenshot-card:first-child')];
    targets.forEach(function(target){if(!target)return;var clone=source.cloneNode(true);clone.removeAttribute('data-parallax');clone.classList.add('hero-visual-reuse');clone.setAttribute('aria-hidden','true');target.replaceChildren(clone);});
  }

  function appendAudioTrack(diagram) {
    var lane=document.createElement('div'); lane.className='fd-audio-lane'; lane.innerHTML='<div class="fd-audio-track"><span class="fd-waveform"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>'+icon('ic-audiotrack')+'<span>音声クリップ</span></div>';
    var frames=diagram.querySelector('.fd-frames'); if(frames)frames.insertAdjacentElement('afterend',lane); else diagram.appendChild(lane);
    var sheet=document.createElement('div'); sheet.className='fd-clip-detail-sheet'; sheet.innerHTML='<div class="fd-sheet-handle"></div><strong>音声クリップ</strong><div class="fd-sheet-row"><span>音量</span><span class="fd-mini-slider"><i style="width:72%"></i></span><b>72%</b></div><div class="fd-sheet-row"><span>フェードイン</span><span>0.0 s</span></div><div class="fd-sheet-row"><span>フェードアウト</span><span>0.0 s</span></div>'; diagram.appendChild(sheet);
  }
  function normalizeAudioMocks() {
    var featureTimeline=document.querySelector('#animation > .feature-diagram'),audioTarget=document.querySelector('#audio > .feature-diagram'); if(featureTimeline&&audioTarget){var clone=featureTimeline.cloneNode(true);clone.classList.add('fd-audio-context-screen');appendAudioTrack(clone);audioTarget.replaceWith(clone);}
    var homeTimelineCard=findScreenshotCard('.fd-timeline-title'),homeAudioCard=findScreenshotCard('.fd-audio-track'); if(homeTimelineCard&&homeAudioCard&&homeTimelineCard!==homeAudioCard){var timelineDiagram=homeTimelineCard.querySelector('.feature-diagram');if(timelineDiagram){var homeClone=timelineDiagram.cloneNode(true);homeClone.classList.add('fd-audio-context-screen');appendAudioTrack(homeClone);homeAudioCard.replaceChildren(homeClone);homeAudioCard.classList.add('is-code-verified-mock');}}
  }
  function appBar(title,help){return '<div class="fd-appbar"><span class="fd-appbar-back">‹</span><strong>'+title+'</strong><span class="fd-spacer"></span>'+(help?iconButton('ic-help_outline'):'')+'</div>';}
  function saveTreeScreen(){return '<div class="feature-diagram fd-route-screen fd-save-tree-screen" aria-hidden="true"><div class="fd-appbar"><span class="fd-appbar-back">‹</span><strong>セーブツリー</strong><span class="fd-spacer"></span>'+iconButton('ic-help_outline')+'<span class="fd-appbar-save">保存</span></div><div class="fd-route-body"><div class="fd-tree-node is-root"><span class="fd-tree-dot"></span><div><strong>現在の編集</strong><small>最新</small></div></div><div class="fd-tree-line"></div><div class="fd-tree-node"><span class="fd-tree-dot"></span><div><strong>保存 03</strong><small>12:48</small></div></div><div class="fd-tree-line"></div><div class="fd-tree-branch"><div class="fd-tree-node"><span class="fd-tree-dot"></span><div><strong>保存 02</strong><small>12:31</small></div></div><div class="fd-tree-node"><span class="fd-tree-dot"></span><div><strong>別案</strong><small>12:36</small></div></div></div><div class="fd-tree-line"></div><div class="fd-tree-node"><span class="fd-tree-dot"></span><div><strong>保存 01</strong><small>12:05</small></div></div></div></div>';}
  function workspaceScreen(){var items=['ペン','消しゴム','バケツ','スポイト'];var rows=items.map(function(name){return '<div class="fd-workspace-row"><span class="fd-check is-on">✓</span><span>'+name+'</span><span class="fd-spacer"></span>'+icon('ic-drag_handle')+'</div>';}).join('');return '<div class="feature-diagram fd-route-screen fd-workspace-screen" aria-hidden="true">'+appBar('ワークスペース設定',true)+'<div class="fd-route-body fd-workspace-body"><strong class="fd-route-section">ツールバー編集</strong><p class="fd-route-hint">表示するツールと並び順を変更できます</p><div class="fd-toolbar-preview">'+iconButton('ic-brush','is-active')+iconButton('ic-eraser_fa')+iconButton('ic-format_color_fill')+iconButton('ic-colorize')+'</div><div class="fd-workspace-card">'+rows+'</div><strong class="fd-route-section">パネル配置</strong><div class="fd-workspace-card"><div class="fd-workspace-row"><span>左利きモード</span><span class="fd-spacer"></span><span class="fd-mini-switch"></span></div></div><strong class="fd-route-section">PC / DeXモード</strong><div class="fd-workspace-card"><div class="fd-workspace-row"><span class="fd-radio is-on"></span><span>自動</span></div><div class="fd-workspace-row"><span class="fd-radio"></span><span>PC固定</span></div></div></div></div>';}
  function addRouteScreenChrome(){var save=document.querySelector('#save > .feature-diagram');if(save){var wrap=document.createElement('div');wrap.innerHTML=saveTreeScreen();save.replaceWith(wrap.firstElementChild);}var workspace=document.querySelector('#workspace > .feature-diagram');if(workspace){var ww=document.createElement('div');ww.innerHTML=workspaceScreen();workspace.replaceWith(ww.firstElementChild);}var exportDiagram=document.querySelector('#export > .feature-diagram');if(exportDiagram&&!exportDiagram.querySelector('.fd-appbar')){exportDiagram.classList.add('fd-route-screen','fd-export-screen');exportDiagram.insertAdjacentHTML('afterbegin',appBar('書き出し',true));var children=Array.prototype.slice.call(exportDiagram.children,1),body=document.createElement('div');body.className='fd-route-body fd-export-body';children.forEach(function(child){body.appendChild(child);});exportDiagram.appendChild(body);}var homeSave=findScreenshotCard('.fd-slot-list');if(homeSave){homeSave.innerHTML=saveTreeScreen();homeSave.classList.add('is-code-verified-mock');}var homeWorkspace=findScreenshotCard('.fd-setting-row');if(homeWorkspace){homeWorkspace.innerHTML=workspaceScreen();homeWorkspace.classList.add('is-code-verified-mock');}var homeExport=findScreenshotCard('.fd-segmented');if(homeExport){var d=homeExport.querySelector('.feature-diagram');if(d&&!d.querySelector('.fd-appbar')){d.classList.add('fd-route-screen','fd-export-screen');d.insertAdjacentHTML('afterbegin',appBar('書き出し',true));}homeExport.classList.add('is-code-verified-mock');}}

  function normalizeHomeFeatureCanvasMocks() {
    var rows=document.querySelectorAll('#features .feature-row');
    [[2,'layer'],[3,'onion']].forEach(function(pair){var row=rows[pair[0]];if(!row)return;var media=row.querySelector('.feature-media');if(!media)return;var existing=pair[1]==='layer'?media.querySelector('.fd-layer-panel-overlay'):null,wrap=document.createElement('div');wrap.innerHTML=buildCanvasMock({panel:pair[1],existingPanel:existing});media.replaceChildren(wrap.firstElementChild);});
  }

  function normalizeHomeTimelinePreview() {
    var card=findScreenshotCard('.fd-timeline-title'); if(!card)return; var diagram=card.querySelector('.feature-diagram'); if(!diagram)return; diagram.classList.add('fd-home-timeline-screen');
  }

  function normalizeScreenMocks(){normalizeCanvasScreenMocks();reuseHeroScreenMock();normalizeHomeFeatureCanvasMocks();normalizeHomeTimelinePreview();normalizeAudioMocks();addRouteScreenChrome();}

  function initScrollUi(){var header=document.querySelector('.site-header'),btn=document.createElement('button'),scheduled=false;btn.type='button';btn.className='scroll-top-btn';btn.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"/></svg>';document.body.appendChild(btn);function applyLabel(){var lang=document.documentElement.getAttribute('lang')||'ja',label=window.NIARIM_I18N&&window.NIARIM_I18N.translate(lang,'common.scrollTop');btn.setAttribute('aria-label',label||'ページトップへ戻る');}function applyScrollState(){scheduled=false;var y=window.scrollY;if(header)header.classList.toggle('is-scrolled',y>8);btn.classList.toggle('is-visible',y>480);}function requestScrollState(){if(scheduled)return;scheduled=true;requestAnimationFrame(applyScrollState);}applyLabel();applyScrollState();document.addEventListener('niarim:langchange',applyLabel);window.addEventListener('scroll',requestScrollState,{passive:true});btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});}
  function initNavToggle(){var toggle=document.querySelector('.nav-toggle'),nav=document.querySelector('.main-nav');if(!toggle||!nav)return;function close(){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}toggle.addEventListener('click',function(){var isOpen=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!isOpen));nav.classList.toggle('is-open',!isOpen);});nav.addEventListener('click',function(event){if(event.target.closest&&event.target.closest('a'))close();});document.addEventListener('keydown',function(event){if(event.key==='Escape')close();});}
  function initFaqAccordion(){if(!document.querySelector('.faq-item'))return;document.addEventListener('click',function(event){var question=event.target.closest&&event.target.closest('.faq-question');if(!question)return;var item=question.closest('.faq-item'),answer=item&&item.querySelector('.faq-answer');if(!item||!answer)return;var isOpen=item.classList.contains('is-open');item.classList.toggle('is-open',!isOpen);question.setAttribute('aria-expanded',String(!isOpen));answer.style.maxHeight=!isOpen?answer.scrollHeight+'px':'0px';});}
  function ensureNineCommunityTiles(){var gallery=document.querySelector('.community-gallery');if(!gallery)return;var cards=gallery.querySelectorAll('.community-card:not(.is-more-cta)'),more=gallery.querySelector('.community-card.is-more-cta');if(cards.length!==8||!more)return;var ninth=cards[cards.length-1].cloneNode(true),badge=ninth.querySelector('.rank-badge');if(badge)badge.textContent='9';gallery.insertBefore(ninth,more);}
  document.addEventListener('DOMContentLoaded',function(){normalizeScreenMocks();initScrollUi();initNavToggle();initFaqAccordion();ensureNineCommunityTiles();});
})();