(function () {
  "use strict";

  var copy = {
    ja: {
      ctaBody:
        "描きたいと思ったら今すぐにでも始められる。<br>全フレーム手描きでもキーフレームアニメーションでもあなたのお好みで。納得するまでとことんこだわってあなただけのオリジナル作品をつくろう。完成したら作品広場でみんなにみてもらうことができます。逆に、他の人の作品をみることもできます。つくって、公開して、みつけよう。",
      community: "NIARIMでアニメを制作して、作品広場に投稿してみませんか？",
      project: "星降る夜",
      onionNext: "次フレーム",
    },
    en: { community: "Create an animation with NIARIM and share it in the Gallery.", project: "Starlit Night", onionNext: "Next frame" },
    "zh-Hans": { community: "用 NIARIM 制作动画，并投稿到作品广场吧。", project: "星夜", onionNext: "后一帧" },
    "zh-Hant": { community: "用 NIARIM 製作動畫，並投稿到作品廣場吧。", project: "星夜", onionNext: "後一幀" },
    ko: { community: "NIARIM으로 애니메이션을 만들어 작품광장에 올려 보세요.", project: "별이 내리는 밤", onionNext: "다음 프레임" },
    fr: { community: "Créez une animation avec NIARIM et publiez-la dans la Galerie.", project: "Nuit étoilée", onionNext: "Image suivante" },
    es: { community: "Crea una animación con NIARIM y publícala en la Galería.", project: "Noche estrellada", onionNext: "Fotograma siguiente" },
  };

  function lang() {
    var value = document.documentElement.lang || "ja";
    return copy[value] ? value : "ja";
  }

  function installDictionaryOverrides() {
    var dict = window.NIARIM_I18N_DICT;
    if (!dict) return;
    Object.keys(copy).forEach(function (code) {
      if (!dict[code]) dict[code] = {};
      dict[code]["communityPage.cta.body"] = copy[code].community;
      dict[code]["fd.projectName"] = copy[code].project;
      dict[code]["fd.onionNext"] = copy[code].onionNext;
    });
    if (dict.ja) dict.ja["cta.body"] = copy.ja.ctaBody;
  }

  /* main.js が再現図を完成させた後にだけ構造を組む。
     PCでは再現図stackを本文とカードと同じflowの先頭で右floatさせる。
     これにより本文は再現図の左隣、spec-gridは本文の直下から始まり、
     再現図の下端を越えた行から自然に右端まで広がる。 */
  function pairFeatureNarratives(root) {
    (root || document).querySelectorAll?.(".feature-section").forEach(function (section) {
      if (section.querySelector(":scope > .feature-pair")) return;
      var narrative = section.querySelector(":scope > .feature-narrative");
      var diagrams = Array.from(section.querySelectorAll(":scope > .feature-diagram"));
      if (!narrative || !diagrams.length) return;
      var spec = section.querySelector(":scope > .spec-grid");
      var pair = document.createElement("div");
      pair.className = "feature-pair";
      var left = document.createElement("div");
      left.className = "feature-copy-column";
      var stack = document.createElement("div");
      stack.className = "feature-diagram-stack";
      narrative.before(pair);
      pair.append(left);
      left.append(stack, narrative);
      if (spec) left.append(spec);
      diagrams.forEach(function (diagram) { stack.append(diagram); });
    });
  }

  function upgradeLegacyFrameModeControls(root) {
    (root || document).querySelectorAll(".fd-frame-strip-mode").forEach(function (old) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "fd-frame-mode";
      button.tabIndex = -1;
      button.setAttribute("aria-label", "タイムライン");
      button.setAttribute("data-i18n-attr", "aria-label:fd.timelineMode");
      button.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/assets/icons/ui/sprite.svg#ic-movie_filter"></use></svg>';
      old.replaceWith(button);
    });
  }

  function localizeFd(root) {
    var api = window.NIARIM_I18N;
    if (!api || !api.translate) return;
    var code = lang();
    var nodes = [];
    if (root && root.matches && root.matches('[data-i18n^="fd."]')) nodes.push(root);
    (root || document).querySelectorAll?.('[data-i18n^="fd."]').forEach(function (el) { nodes.push(el); });
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var translated = key === "fd.projectName" ? copy[code].project : key === "fd.onionNext" ? copy[code].onionNext : api.translate(code, key);
      if (translated && translated !== key) el.textContent = translated;
    });
  }


  var captureGeometry = {
    "canvas": [320, 569],
    "timeline": [320, 569],
    "layers": [320, 569],
    "onion-skin": [320, 569],
    "export": [320, 569],
    "audio-editor": [320, 569],
    "save-tree": [320, 569],
    "workspace": [320, 569],
    "widget": [320, 569],
  };

  function captureBaseName(name) {
    return name.replace(/-v[2-4]$/, "");
  }

  function realCapture(name, alt) {
    var picture = document.createElement("picture");
    picture.className = "real-app-capture";
    var avif = document.createElement("source");
    avif.type = "image/avif";
    var revision = "612adcd4";
    avif.srcset = "/assets/images/app-captures/" + name + ".avif?v=" + revision;
    var img = document.createElement("img");
    img.src = "/assets/images/app-captures/" + name + ".webp?v=" + revision;
    img.alt = alt || "";
    // Reserve the canonical premium reference capture geometry before lazy decoding.
    var geometry = captureGeometry[captureBaseName(name)] || [320, 569];
    img.width = geometry[0];
    img.height = geometry[1];
    img.loading = "lazy";
    img.decoding = "async";
    picture.append(avif, img);
    return picture;
  }

  function installRealAppCaptures(root) {
    var scope = root || document;
    var featureMap = {
      drawing: ["canvas", "NIARIM canvas"],
      animation: ["timeline", "NIARIM timeline"],
      editing: ["layers", "NIARIM layer panel"],
      advanced: ["onion-skin", "NIARIM onion skin settings"],
      audio: ["audio-editor", "NIARIM audio editor"],
      save: ["save-tree", "NIARIM save tree"],
      workspace: ["workspace", "NIARIM workspace settings"],
      widget: ["widget", "NIARIM widget settings"],
      export: ["export", "NIARIM export settings"],
    };
    Object.keys(featureMap).forEach(function (id) {
      var section = scope.querySelector?.("#" + id);
      if (!section) return;
      var diagrams = Array.prototype.slice.call(section.querySelectorAll(".feature-diagram"));
      if (!diagrams.length) return;
      var primary = diagrams[0];
      primary.className = "feature-diagram feature-diagram--real";
      primary.dataset.captureTheme = featureMap[id][0];
      primary.dataset.captureAccent = ({
        canvas: "#3AA6FF", timeline: "#2E9B4F", layers: "#FF8A3D",
        "onion-skin": "#E85D75", "audio-editor": "#4B8FDC",
        "save-tree": "#C15F35", workspace: "#E65F2B",
        widget: "#00796B", export: "#0086C9"
      })[featureMap[id][0]];
      primary.removeAttribute("data-mock-theme");
      primary.removeAttribute("style");
      primary.replaceChildren(realCapture(featureMap[id][0], featureMap[id][1]));
      // A feature section represents one app screen. Remove every leftover
      // coded reproduction/concept mock in that section so the site never
      // mixes a real capture with stale HTML/CSS screen facsimiles.
      diagrams.slice(1).forEach(function (diagram) {
        diagram.remove();
      });
    });

    var hero = scope.querySelector?.(".hero-visual");
    if (hero && !hero.querySelector(".real-app-capture")) {
      hero.className = "hero-visual hero-visual--real";
      hero.removeAttribute("data-mock-theme");
      hero.removeAttribute("style");
      hero.replaceChildren(realCapture("canvas-v4", "NIARIM canvas"));
    }

    var homeMap = {
      row1: "canvas-v2",
      row2: "timeline-v2",
      row3: "layers-v2",
      row4: "onion-skin-v2",
      row5: "export-v2",
    };
    scope.querySelectorAll?.(".feature-row[data-mock-theme]").forEach(function (row) {
      var name = homeMap[row.dataset.mockTheme];
      var media = row.querySelector(":scope > .feature-media");
      if (!name || !media || media.querySelector(".real-app-capture")) return;
      var diagram = media.querySelector(":scope > .feature-diagram");
      if (diagram) {
        diagram.className = "feature-diagram feature-diagram--real";
        diagram.dataset.captureTheme = name;
        diagram.removeAttribute("data-mock-theme");
        diagram.removeAttribute("style");
        diagram.replaceChildren(realCapture(name, ""));
        return;
      }
      // main.js reuses the Hero mock for Home row1 and therefore removes the
      // original .feature-diagram wrapper. Replace that legacy clone directly
      // so every Home feature uses the same lightweight real app capture path.
      media.replaceChildren(realCapture(name, ""));
    });

    var previewMap = {
      shot1: "canvas-v3",
      shot2: "timeline-v3",
      shot3: "layers-v3",
      shot4: "export-v3",
      shot5: "save-tree-v2",
      shot6: "workspace-v2",
    };
    scope
      .querySelectorAll?.(".screenshot-scroller .screenshot-card[data-mock-theme]")
      .forEach(function (card) {
        var name = previewMap[card.dataset.mockTheme];
        if (!name || card.querySelector(".real-app-capture")) return;
        // Replace the whole gallery card, not only the legacy diagram.
        // main.js can restructure/remove the first coded diagram before this
        // hook runs; replacing the card itself guarantees that no HTML/CSS
        // facsimile, mock ad strip, or stale aspect-ratio wrapper survives.
        card.replaceChildren(realCapture(name, ""));
        card.dataset.captureTheme = name;
      });
  }

  function assertUniqueCapturePlacements(root) {
    var scope = root || document;
    var files = Array.prototype.map.call(
      scope.querySelectorAll(".real-app-capture img"),
      function (img) { return img.src.split("/").pop().split("?")[0]; }
    );
    var seen = new Set();
    var duplicates = files.filter(function (file) {
      if (seen.has(file)) return true;
      seen.add(file);
      return false;
    });
    if (duplicates.length && /(?:localhost|127\.0\.0\.1)/.test(location.hostname)) {
      console.error("Duplicate real capture theme placements:", Array.from(new Set(duplicates)));
    }
  }

  // Stable hook for browser audits. Keeping installation idempotent lets
  // tests invoke the same production path without depending on rAF timing.
  window.__niarimInstallRealAppCaptures = installRealAppCaptures;

  function applyRequestedCopy() {
    installDictionaryOverrides();
    installRealAppCaptures(document);
    pairFeatureNarratives(document);
    var code = lang();
    var finalBody = document.querySelector('.final-cta [data-i18n="cta.body"]');
    if (finalBody && code === "ja") finalBody.innerHTML = copy.ja.ctaBody;
    var communityBody = document.querySelector('[data-i18n="communityPage.cta.body"]');
    if (communityBody) communityBody.textContent = copy[code].community;
    localizeFd(document);
    upgradeLegacyFrameModeControls(document);
  }

  document.addEventListener("DOMContentLoaded", function () {
    installDictionaryOverrides();
    requestAnimationFrame(applyRequestedCopy);
  });
  document.addEventListener("niarim:langchange", applyRequestedCopy);

  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        var scope = node.matches?.(".fd-frame-strip-mode") ? node.parentElement : node;
        upgradeLegacyFrameModeControls(scope);
        localizeFd(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
