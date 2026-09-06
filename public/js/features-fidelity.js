/**
 * NIARIM Features mock fidelity sync.
 *
 * Keep the website's reconstructed UI aligned with the Flutter implementation
 * without rebuilding the large Features page at runtime. Geometry belongs in
 * the Features fidelity CSS layers; this file only supplies DOM elements whose
 * shape cannot be expressed from the existing static markup alone.
 */
(function () {
  "use strict";

  function ensureFidelityStyles() {
    if (document.querySelector("link[data-niarim-feature-fidelity-style]")) return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/features-fidelity.css";
    link.setAttribute("data-niarim-feature-fidelity-style", "true");
    document.head.appendChild(link);
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

        var frame = tile.querySelector(".fd-widget-frame");
        if (frame && !frame.querySelector(".fd-widget-frame-icon")) {
          frame.insertAdjacentHTML(
            "afterbegin",
            '<svg class="ic fd-widget-frame-icon" aria-hidden="true"><use href="/assets/icons/ui/sprite.svg#ic-image"></use></svg>',
          );
        }

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
    ensureFidelityStyles();
    syncSaveTreeConnectors();
    syncArtworkWidgetSummary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
