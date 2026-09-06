/**
 * NIARIM Features mock fidelity sync.
 *
 * Keep the website's reconstructed UI aligned with the Flutter implementation
 * without rebuilding the large Features page at runtime. Geometry belongs in
 * features-source-normalization.css; this file only supplies DOM elements whose
 * shape cannot be expressed from the existing static markup alone.
 */
(function () {
  "use strict";

  function addAudioResizeHandles() {
    document.querySelectorAll(".fd-audio-track").forEach(function (track) {
      if (track.querySelector(".fd-clip-resize-handle")) return;

      var left = document.createElement("span");
      left.className = "fd-clip-resize-handle is-left";
      left.setAttribute("aria-hidden", "true");

      var right = document.createElement("span");
      right.className = "fd-clip-resize-handle is-right";
      right.setAttribute("aria-hidden", "true");

      track.appendChild(left);
      track.appendChild(right);
    });
  }

  function syncSaveTreeConnectors() {
    var rows = document.querySelectorAll(
      ".fd-tree-list--bottom-up .fd-tree-row2",
    );
    if (rows.length < 4) return;

    /* save_tree_screen.dart / _TreeConnectorPainter:
       - 20px per depth column
       - ancestor continuation on x=10
       - current depth on x=30 for the two depth-2 siblings
       - the first sibling continues through the full row; the last stops at
         the row center. features.css flips these SVGs vertically because the
         web list uses column-reverse to model ListView(reverse:true). */
    var connectors = [
      "",
      '<svg class="fd-tree-connector" width="20" height="36" viewBox="0 0 20 36" aria-hidden="true"><line x1="10" y1="0" x2="10" y2="18" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><line x1="10" y1="18" x2="20" y2="18" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/></svg>',
      '<svg class="fd-tree-connector" width="40" height="36" viewBox="0 0 40 36" aria-hidden="true"><line x1="10" y1="0" x2="10" y2="36" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><line x1="30" y1="0" x2="30" y2="36" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><line x1="30" y1="18" x2="40" y2="18" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/></svg>',
      '<svg class="fd-tree-connector" width="40" height="36" viewBox="0 0 40 36" aria-hidden="true"><line x1="10" y1="0" x2="10" y2="36" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><line x1="30" y1="0" x2="30" y2="18" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/><line x1="30" y1="18" x2="40" y2="18" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/></svg>',
    ];

    Array.prototype.forEach.call(rows, function (row, index) {
      var old = row.querySelector(".fd-tree-connector");
      if (old) old.remove();
      if (connectors[index]) {
        row.insertAdjacentHTML("afterbegin", connectors[index]);
      }
    });
  }

  function syncArtworkWidgetSummary() {
    document
      .querySelectorAll(".fd-widget-tile--art")
      .forEach(function (tile) {
        tile.classList.add("is-settings-summary");
        if (tile.querySelector(".fd-widget-chevron")) return;

        var chevron = document.createElement("span");
        chevron.className = "fd-widget-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.textContent = "›";
        tile.appendChild(chevron);
      });
  }

  function init() {
    if (!document.getElementById("audio") && !document.getElementById("widget")) {
      return;
    }
    addAudioResizeHandles();
    syncSaveTreeConnectors();
    syncArtworkWidgetSummary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
