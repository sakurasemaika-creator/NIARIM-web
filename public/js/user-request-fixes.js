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
    en: {
      community: "Create an animation with NIARIM and share it in the Gallery.",
      project: "Starlit Night",
      onionNext: "Next frame",
    },
    "zh-Hans": {
      community: "用 NIARIM 制作动画，并投稿到作品广场吧。",
      project: "星夜",
      onionNext: "后一帧",
    },
    "zh-Hant": {
      community: "用 NIARIM 製作動畫，並投稿到作品廣場吧。",
      project: "星夜",
      onionNext: "後一幀",
    },
    ko: {
      community: "NIARIM으로 애니메이션을 만들어 작품광장에 올려 보세요.",
      project: "별이 내리는 밤",
      onionNext: "다음 프레임",
    },
    fr: {
      community:
        "Créez une animation avec NIARIM et publiez-la dans la Galerie.",
      project: "Nuit étoilée",
      onionNext: "Image suivante",
    },
    es: {
      community: "Crea una animación con NIARIM y publícala en la Galería.",
      project: "Noche estrellada",
      onionNext: "Fotograma siguiente",
    },
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

  function upgradeLegacyFrameModeControls(root) {
    (root || document)
      .querySelectorAll(".fd-frame-strip-mode")
      .forEach(function (old) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "fd-frame-mode";
        button.tabIndex = -1;
        button.setAttribute("aria-label", "タイムライン");
        button.setAttribute("data-i18n-attr", "aria-label:fd.timelineMode");
        button.innerHTML =
          '<svg class="ic" aria-hidden="true"><use href="/assets/icons/ui/sprite.svg#ic-movie_filter"></use></svg>';
        old.replaceWith(button);
      });
  }

  function localizeFd(root) {
    var api = window.NIARIM_I18N;
    if (!api || !api.translate) return;
    var code = lang();
    var nodes = [];
    if (root && root.matches && root.matches('[data-i18n^="fd."]'))
      nodes.push(root);
    (root || document)
      .querySelectorAll?.('[data-i18n^="fd."]')
      .forEach(function (el) {
        nodes.push(el);
      });
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent =
        key === "fd.projectName"
          ? copy[code].project
          : key === "fd.onionNext"
            ? copy[code].onionNext
            : api.translate(code, key);
    });
  }

  function applyRequestedCopy() {
    installDictionaryOverrides();
    var code = lang();
    var finalBody = document.querySelector('.final-cta [data-i18n="cta.body"]');
    if (finalBody && code === "ja") finalBody.innerHTML = copy.ja.ctaBody;
    var communityBody = document.querySelector(
      '[data-i18n="communityPage.cta.body"]',
    );
    if (communityBody) communityBody.textContent = copy[code].community;
    localizeFd(document);
    upgradeLegacyFrameModeControls(document);
  }

  document.addEventListener("DOMContentLoaded", function () {
    installDictionaryOverrides();
    applyRequestedCopy();
    requestAnimationFrame(applyRequestedCopy);
  });
  document.addEventListener("niarim:langchange", applyRequestedCopy);

  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        var scope = node.matches?.(".fd-frame-strip-mode")
          ? node.parentElement
          : node;
        upgradeLegacyFrameModeControls(scope);
        localizeFd(node);
      });
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
