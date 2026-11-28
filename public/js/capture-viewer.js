// The viewer uses the same production captures and selected palette as the gallery.
(function () {
  "use strict";

  function init() {
    const gallery = document.querySelector("#nr-gallery");
    const dialog = document.querySelector("#capture-viewer");
    if (!gallery || !dialog || typeof dialog.showModal !== "function") return;

    const title = dialog.querySelector("#capture-title");
    const stage = dialog.querySelector(".capture-stage");
    const zoom = dialog.querySelector(".capture-zoom");
    const deviceButtons = [...dialog.querySelectorAll("[data-device]")];
    const template = document.querySelector("#capture-open-template");
    const count = dialog.querySelector(".capture-count");
    const stepButtons = [...dialog.querySelectorAll("[data-step]")];
    const cards = [...gallery.querySelectorAll(".nr-gallery-item")];
    let selectedCard;
    let trigger;
    let currentDevice;

    const pad = (n) => String(n).padStart(2, "0");

    // Browse the nine screens without closing the viewer: buttons, the
    // arrow keys, and a horizontal swipe on the picture. The device and the
    // zoom choice carry over; focus stays in the dialog.
    function showCard(index) {
      const total = cards.length;
      const next = ((index % total) + total) % total;
      selectedCard = cards[next];
      if (count) count.textContent = pad(next + 1) + " / " + pad(total);
      selectDevice(currentDevice);
    }

    function step(delta) {
      showCard(cards.indexOf(selectedCard) + delta);
    }

    function selectDevice(device) {
      const heading = selectedCard.querySelector("h3").textContent;
      const selector =
        device === "phone" ? "[data-capture]" : "[data-capture-pc]";
      const original = selectedCard.querySelector(selector + " picture");
      if (!original) return;
      const picture = original.cloneNode(true);
      const img = picture.querySelector("img");
      img.loading = "eager";
      const selected = deviceButtons.find(
        (button) => button.dataset.device === device,
      );
      img.alt = heading + " · " + selected.textContent;
      title.textContent = heading;
      stage.replaceChildren(picture);
      currentDevice = device;
      for (const button of deviceButtons) {
        button.setAttribute("aria-pressed", String(button === selected));
      }
      stage.classList.remove("is-native-size");
      zoom.setAttribute("aria-pressed", "false");
      stage.scrollTo(0, 0);
    }

    for (const card of gallery.querySelectorAll(".nr-gallery-item")) {
      const heading = card.querySelector("h3");
      const visual = card.querySelector(".nr-gallery-visual");
      const name = card.querySelector("[data-capture]").dataset.capture;
      const button = template.content.firstElementChild.cloneNode(true);
      const label = button.querySelector("[data-i18n]");
      heading.id = "capture-name-" + name;
      label.id = "capture-action-" + name;
      button.setAttribute("aria-labelledby", label.id + " " + heading.id);
      visual.append(button);
      button.addEventListener("click", () => {
        trigger = button;
        currentDevice = window.matchMedia("(max-width: 740px)").matches
          ? "phone"
          : "desktop";
        showCard(cards.indexOf(card));
        dialog.showModal();
      });
    }

    for (const button of deviceButtons) {
      button.addEventListener("click", () =>
        selectDevice(button.dataset.device),
      );
    }
    for (const button of stepButtons) {
      button.addEventListener("click", () => step(Number(button.dataset.step)));
    }
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      // At actual size the arrow keys scroll the picture instead.
      if (
        stage.classList.contains("is-native-size") &&
        stage.contains(event.target)
      )
        return;
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    });
    let swipe = null;
    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      swipe = { x: event.clientX, y: event.clientY };
    });
    stage.addEventListener("pointerup", (event) => {
      if (!swipe || stage.classList.contains("is-native-size")) {
        swipe = null;
        return;
      }
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5)
        step(dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => {
      swipe = null;
    });
    zoom.addEventListener("click", () => {
      const native = stage.classList.toggle("is-native-size");
      zoom.setAttribute("aria-pressed", String(native));
      stage.scrollTo(0, 0);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX >= box.right ||
        event.clientY < box.top ||
        event.clientY >= box.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      stage.replaceChildren();
      trigger?.focus({ preventScroll: true });
    });

    function localizeCaptures() {
      const lang = document.documentElement.lang;
      const translate = (key) => window.NIARIM_I18N.translate(lang, key);
      for (const label of gallery.querySelectorAll(
        ".capture-open [data-i18n]",
      )) {
        label.textContent = translate(label.dataset.i18n);
      }
      for (const figure of document.querySelectorAll(
        ".nr-shot[data-capture], .nr-shot[data-capture-pc]",
      )) {
        const pc = figure.hasAttribute("data-capture-pc");
        const name = figure.dataset.capturePc || figure.dataset.capture;
        const img = figure.querySelector("img");
        if (img)
          img.alt =
            translate("refresh.screen." + name) +
            " · " +
            translate(pc ? "viewer.desktop" : "viewer.phone");
      }
      if (dialog.open) selectDevice(currentDevice);
    }
    localizeCaptures();
    document.addEventListener("niarim:langchange", localizeCaptures);
  }

  if (
    document.readyState === "loading" ||
    document.readyState === "interactive"
  ) {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else init();
})();

// The wide timeline capture on the top page: the whole picture fits the
// column at every width (nothing is cut off at the sides). Where the column
// is narrow, "Actual size" shows it at the app's own size instead, scrolled
// sideways inside its frame, and the frame takes focus for the arrow keys.
(function () {
  "use strict";

  function init() {
    document.querySelectorAll(".tp-wide-capture").forEach(function (figure) {
      const button = figure.querySelector(".tp-wide-zoom");
      const frame = figure.querySelector(".tp-wide-capture-scroll");
      if (!button || !frame) return;
      // The picture's srcset is chosen for the width it fits; at actual size
      // it is 1280 px wide, so the browser picks the copy for that width.
      const img = frame.querySelector("img");
      const fitSizes = img ? img.getAttribute("sizes") : null;
      figure.classList.add("is-ready");
      button.addEventListener("click", function () {
        const zoomed = button.getAttribute("aria-pressed") !== "true";
        button.setAttribute("aria-pressed", String(zoomed));
        figure.classList.toggle("is-zoomed", zoomed);
        if (img && fitSizes)
          img.setAttribute("sizes", zoomed ? "1280px" : fitSizes);
        if (zoomed) {
          frame.setAttribute("tabindex", "0");
        } else {
          frame.removeAttribute("tabindex");
          frame.scrollLeft = 0;
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else init();
})();
