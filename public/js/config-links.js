/** NIARIM公式サイト 外部リンク差し込み */
(function () {
  "use strict";
  var LINKS = [
    { id: "google-play-link", key: "GOOGLE_PLAY_URL", fallback: "disable" },
    { id: "footer-x-link", key: "X_URL", fallback: "hide" },
    { id: "footer-x-icon", key: "X_URL", fallback: "hide" },
    { id: "contact-x-link", key: "X_URL", fallback: "hide" },
  ];
  function apply() {
    var config = window.NIARIM_CONFIG || {};
    LINKS.forEach(function (link) {
      var el = document.getElementById(link.id);
      if (!el) return;
      var url = config[link.key];
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("rel", "noopener noreferrer");
        return;
      }
      if (link.fallback === "hide") {
        var host = el.closest("li") || el;
        host.hidden = true;
      } else {
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-unavailable");
      }
    });
  }

  /* かつてここでは、main.js の fitMockScreens() がヒーローの端末枠へ
     付けた inline の width / height / transform を毎回消していた。
     当時の fitMockScreens は width も height も「100/倍率 %」で広げて
     いたため、端末の縦横比が崩れることがあったからである。
     いまは倍率を掛けたあとの見た目の大きさが元の枠とぴったり同じに
     なるよう（width = 元の幅/倍率、height = 必要な高さ、はみ出したぶんは
     負のマージンで打ち消す）作り直したので、比率は崩れない。
     消し続けると逆に、スマホでツールバーとコマ一覧が枠の下からはみ出して
     ベゼルに切られたままになる（実測で106pxはみ出していた）ため、
     この打ち消しはやめる。 */

  /* 50x50セルのcurrentを実際のスクローラ中央へ合わせる。
     visual-audit-tail.css の左右paddingだけでは先頭セルが中央になるため、
     3枚目をcurrentにした現在のDOMでは約100pxずれる。offsetLeftから計算し、
     SP/PC・モック幅に依存せず中央へ揃える。 */
  function centerCurrentFrames() {
    document
      .querySelectorAll(".fd-frame-strip-scroll")
      .forEach(function (strip) {
        var current = strip.querySelector(
          ".fd-frame-thumb.is-current, .fd-frame.is-current",
        );
        if (!current || !strip.clientWidth) return;
        var target =
          current.offsetLeft + current.offsetWidth / 2 - strip.clientWidth / 2;
        var max = Math.max(0, strip.scrollWidth - strip.clientWidth);
        strip.scrollLeft = Math.max(0, Math.min(max, target));
      });
  }

  function scheduleFrameCentering() {
    requestAnimationFrame(function () {
      requestAnimationFrame(centerCurrentFrames);
    });
    setTimeout(centerCurrentFrames, 240);
  }

  /* Features の再現図だけに適用する実装同期補正。
     大きな features/index.html を置換せず、本体 dev_branch で確認した
     UI寸法・接続規則を小さなDOM補正として反映する。 */
  function syncFeatureMockFidelity() {
    if (!document.getElementById("audio") && !document.getElementById("widget")) return;

    if (!document.getElementById("niarim-feature-fidelity-style")) {
      var style = document.createElement("style");
      style.id = "niarim-feature-fidelity-style";
      style.textContent =
        ".fd-audio-track{overflow:hidden;padding-inline:8px}" +
        ".fd-clip-resize-handle{position:absolute;top:0;bottom:0;width:8px;background:rgba(245,241,240,.25);z-index:3}" +
        ".fd-clip-resize-handle.is-left{left:0}.fd-clip-resize-handle.is-right{right:0}" +
        ".fd-tree-row2[data-niarim-leaf='true'] .fd-tree-dot{box-shadow:0 0 0 2px rgba(255,92,122,.18)}" +
        ".fd-widget-tile--art.is-settings-summary{display:grid;grid-template-columns:44px minmax(0,1fr) 18px;grid-template-rows:auto auto;align-items:center;column-gap:10px;min-height:64px}" +
        ".fd-widget-tile--art.is-settings-summary .fd-widget-frame{grid-column:1;grid-row:1/3;width:44px;height:44px;margin:0;border-radius:6px}" +
        ".fd-widget-tile--art.is-settings-summary .fd-widget-name{grid-column:2;grid-row:1;align-self:end}" +
        ".fd-widget-tile--art.is-settings-summary .fd-widget-sub{grid-column:2;grid-row:2;align-self:start}" +
        ".fd-widget-chevron{grid-column:3;grid-row:1/3;font-size:22px;line-height:1;color:var(--fd-text-muted)}";
      document.head.appendChild(style);
    }

    document.querySelectorAll(".fd-audio-track").forEach(function (track) {
      if (track.querySelector(".fd-clip-resize-handle")) return;
      var left = document.createElement("span");
      left.className = "fd-clip-resize-handle is-left";
      var right = document.createElement("span");
      right.className = "fd-clip-resize-handle is-right";
      track.appendChild(left);
      track.appendChild(right);
    });

    var treeRows = document.querySelectorAll(".fd-tree-list--bottom-up .fd-tree-row2");
    if (treeRows.length >= 4) {
      var connectors = [
        "",
        '<svg class="fd-tree-connector" width="20" height="36" viewBox="0 0 20 36" aria-hidden="true"><path d="M10 0V36M10 18H20" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/></svg>',
        '<svg class="fd-tree-connector" width="40" height="36" viewBox="0 0 40 36" aria-hidden="true"><path d="M10 0V36M10 18H40" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/></svg>',
        '<svg class="fd-tree-connector" width="40" height="36" viewBox="0 0 40 36" aria-hidden="true"><path d="M10 18V36M10 18H40" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/></svg>',
      ];
      Array.prototype.forEach.call(treeRows, function (row, index) {
        var old = row.querySelector(".fd-tree-connector");
        if (old) old.remove();
        if (connectors[index]) row.insertAdjacentHTML("afterbegin", connectors[index]);
        row.toggleAttribute("data-niarim-leaf", index >= 2);
      });
    }

    document.querySelectorAll(".fd-widget-tile--art").forEach(function (tile) {
      tile.classList.add("is-settings-summary");
      if (!tile.querySelector(".fd-widget-chevron")) {
        var chevron = document.createElement("span");
        chevron.className = "fd-widget-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.textContent = "›";
        tile.appendChild(chevron);
      }
    });
  }

  function loadAiTrustCopy() {
    if (document.querySelector("script[data-niarim-ai-trust]")) return;
    var script = document.createElement("script");
    script.src = "/js/i18n-dict-ai-trust.js";
    script.defer = true;
    script.setAttribute("data-niarim-ai-trust", "true");
    document.head.appendChild(script);
  }
  loadAiTrustCopy();

  function init() {
    apply();
    syncFeatureMockFidelity();
    scheduleFrameCentering();
    window.addEventListener("load", function () {
      syncFeatureMockFidelity();
      scheduleFrameCentering();
    });
    window.addEventListener("resize", scheduleFrameCentering, {
      passive: true,
    });
    document.addEventListener("niarim:langchange", function () {
      syncFeatureMockFidelity();
      scheduleFrameCentering();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFrameCentering);
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
