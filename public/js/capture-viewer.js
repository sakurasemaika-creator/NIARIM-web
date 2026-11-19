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
    let selectedCard;
    let trigger;
    let currentDevice;

    function selectDevice(device) {
      const heading = selectedCard.querySelector("h3").textContent;
      const selector = device === "phone" ? "[data-capture]" : "[data-capture-pc]";
      const original = selectedCard.querySelector(selector + " picture");
      if (!original) return;
      const picture = original.cloneNode(true);
      const img = picture.querySelector("img");
      img.loading = "eager";
      const selected = deviceButtons.find(button => button.dataset.device === device);
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
        selectedCard = card;
        selectDevice(window.matchMedia("(max-width: 740px)").matches ? "phone" : "desktop");
        dialog.showModal();
      });
    }

    for (const button of deviceButtons) {
      button.addEventListener("click", () => selectDevice(button.dataset.device));
    }
    zoom.addEventListener("click", () => {
      const native = stage.classList.toggle("is-native-size");
      zoom.setAttribute("aria-pressed", String(native));
      stage.scrollTo(0, 0);
    });
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX >= box.right ||
          event.clientY < box.top || event.clientY >= box.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      stage.replaceChildren();
      trigger?.focus({ preventScroll: true });
    });

    function localizeCaptures() {
      const lang = document.documentElement.lang;
      const translate = key => window.NIARIM_I18N.translate(lang, key);
      for (const label of gallery.querySelectorAll(".capture-open [data-i18n]")) {
        label.textContent = translate(label.dataset.i18n);
      }
      for (const figure of document.querySelectorAll(".nr-shot[data-capture], .nr-shot[data-capture-pc]")) {
        const pc = figure.hasAttribute("data-capture-pc");
        const name = figure.dataset.capturePc || figure.dataset.capture;
        const img = figure.querySelector("img");
        if (img) img.alt = translate("refresh.screen." + name) + " · " +
          translate(pc ? "viewer.desktop" : "viewer.phone");
      }
      if (dialog.open) selectDevice(currentDevice);
    }
    localizeCaptures();
    document.addEventListener("niarim:langchange", localizeCaptures);
  }

  if (document.readyState === "loading" || document.readyState === "interactive") {
    document.addEventListener("DOMContentLoaded", init, {once: true});
  } else init();
})();
