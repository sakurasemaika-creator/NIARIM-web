(function () {
  "use strict";

  var COPY = {
    ja: {
      title: "自動線画",
      body: "ラフの線の中心を捉えて、自動で線画を作成します。判定許容範囲、線画幅、入り抜き、手振れ補正をプレビューしながら調整でき、必要なら制御点をドラッグして線の流れまで細かく整えられます。生成AIで絵を描き替える機能ではなく、自分で描いたラフをもとに線画づくりを支援する機能です。",
    },
    en: {
      title: "Auto lineart",
      body: "Auto lineart follows the centre of your rough strokes to create editable lineart. You can adjust detection tolerance, line width, taper and stabilization while previewing the result, then drag control points to refine the flow. It works from the rough drawing you made; it does not replace your drawing with generative AI.",
    },
    "zh-Hans": {
      title: "自动线稿",
      body: "自动线稿会沿草稿线条的中心生成可编辑线稿。你可以边看预览边调整判定容差、线稿宽度、收笔和防抖，并通过拖动控制点进一步修整线条走向。它以你画出的草稿为基础，并不是用生成式 AI 替换原画。",
    },
    "zh-Hant": {
      title: "自動線稿",
      body: "自動線稿會沿草稿線條的中心產生可編輯線稿。你可以邊看預覽邊調整判定容差、線稿寬度、收筆與防手震，並透過拖曳控制點進一步修整線條走向。它以你畫出的草稿為基礎，並不是用生成式 AI 取代原畫。",
    },
    ko: {
      title: "자동 선화",
      body: "러프 선의 중심을 따라 편집 가능한 선화를 자동으로 생성합니다. 미리보기를 보면서 판정 허용 범위, 선 굵기, 테이퍼, 손떨림 보정을 조절하고 필요하면 제어점을 드래그해 선의 흐름까지 세밀하게 다듬을 수 있습니다. 직접 그린 러프를 바탕으로 선화 제작을 돕는 기능이며 생성형 AI로 그림을 바꾸는 기능은 아닙니다.",
    },
    fr: {
      title: "Lineart automatique",
      body: "Le lineart automatique suit le centre des traits du croquis pour créer un lineart modifiable. Vous pouvez régler la tolérance de détection, l’épaisseur, le taper et la stabilisation tout en prévisualisant le résultat, puis déplacer les points de contrôle pour affiner le tracé. Il part de votre propre croquis et ne remplace pas votre dessin par une IA générative.",
    },
    es: {
      title: "Lineart automático",
      body: "El lineart automático sigue el centro de los trazos del boceto para crear un lineart editable. Puedes ajustar la tolerancia de detección, el grosor, el remate y la estabilización mientras ves la previsualización, y después arrastrar los puntos de control para afinar el trazo. Parte de tu propio boceto y no sustituye tu dibujo con IA generativa.",
    },
  };

  function currentCopy() {
    var lang = document.documentElement.lang || "ja";
    return COPY[lang] || COPY.en;
  }

  function normalizeAdvancedNarrative() {
    var section = document.getElementById("advanced");
    if (!section) return;

    var special = section.querySelector(".signature-feature-layout");
    if (special) special.remove();

    var narrative = section.querySelector(".feature-narrative");
    if (!narrative) return;

    var block = narrative.querySelector(".feature-narrative-block.is-auto-lineart-narrative");
    if (!block) {
      block = document.createElement("div");
      block.className = "feature-narrative-block is-auto-lineart-narrative";
      block.innerHTML = '<h3></h3><p></p>';
      narrative.insertBefore(block, narrative.firstElementChild);
    }

    var c = currentCopy();
    block.querySelector("h3").textContent = c.title;
    block.querySelector("p").textContent = c.body;
  }

  var observer = null;
  function startObserver() {
    var section = document.getElementById("advanced");
    if (!section || observer) return;
    observer = new MutationObserver(function () {
      if (section.querySelector(".signature-feature-layout")) {
        normalizeAdvancedNarrative();
      }
    });
    observer.observe(section, { childList: true, subtree: true });
  }

  function init() {
    normalizeAdvancedNarrative();
    startObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("niarim:langchange", normalizeAdvancedNarrative);
})();