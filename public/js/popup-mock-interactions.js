/** App-parity interactions for floating Canvas tool-panel reconstructions. */
(function () {
  "use strict";

  function dismiss(panel) {
    if (panel) panel.classList.add("is-dismissed");
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;

    var close = target.closest(".fd-panel-close-bar");
    if (close) {
      dismiss(close.closest(".fd-app-overlay-panel"));
      return;
    }

    var screen = target.closest(".fd-canvas-screen");
    if (!screen) return;

    var panel = screen.querySelector(
      ".fd-app-overlay-panel:not(.is-dismissed)",
    );
    if (!panel || panel.contains(target)) return;
    dismiss(panel);
  });
})();
