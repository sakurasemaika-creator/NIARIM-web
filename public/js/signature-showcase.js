(function () {
  "use strict";

  var COPY = {
    ja: {
      autoEyebrow: "AUTO LINEART",
      autoTitle: "ラフから線画へ。調整まで、ひとつの画面で。",
      autoLead:
        "ラフの線の中心を捉えて、自動で線画を作成します。判定許容範囲、線画幅、入り抜き、手振れ補正をプレビューしながら調整でき、必要なら制御点をドラッグして線の流れまで細かく整えられます。生成AIで絵を描き替える機能ではなく、自分で描いたラフをもとに線画づくりを支援する機能です。",
      autoPoints: [
        "ラフの中心から線画化",
        "判定許容範囲を調整",
        "線画幅・入り抜きを調整",
        "手振れ補正＋制御点ドラッグ",
      ],
      panel: "フィルター",
      canvas: "プレビュー",
      filters: ["自動線画", "プリズム", "色調", "ぼかし"],
      controls: [
        ["判定許容範囲", "42"],
        ["線画幅", "3.0"],
        ["手振れ補正", "58"],
        ["入り抜き", "24"],
      ],
      dragHint: "制御点をドラッグして調整",
      apply: "適用",
    },
    en: {
      autoEyebrow: "AUTO LINEART",
      autoTitle:
        "From rough sketch to lineart, with the controls still in your hands.",
      autoLead:
        "Auto lineart follows the centre of your rough strokes to construct editable lineart. Adjust detection tolerance, line width, taper and stabilization while previewing the result, then drag control points wherever the flow needs a final touch. It works from the rough drawing you made; it does not replace your drawing with generative AI.",
      autoPoints: [
        "Lineart from stroke centres",
        "Detection tolerance",
        "Width & taper controls",
        "Stabilization + control-point drag",
      ],
      panel: "Filters",
      canvas: "Preview",
      filters: ["Auto lineart", "Prism", "Colour", "Blur"],
      controls: [
        ["Tolerance", "42"],
        ["Line width", "3.0"],
        ["Stabilization", "58"],
        ["Taper", "24"],
      ],
      dragHint: "Drag control points to refine",
      apply: "Apply",
    },
    "zh-Hans": {
      autoEyebrow: "AUTO LINEART",
      autoTitle: "从草稿到线稿，自动生成，也能自己细调。",
      autoLead:
        "自动线稿会沿草稿线条的中心生成可编辑线稿。你可以边看预览边调整判定容差、线稿宽度、收笔和防抖，并通过拖动控制点进一步修整线条走向。它以你画出的草稿为基础，并不是用生成式 AI 替换原画。",
      autoPoints: [
        "沿草稿中心生成线稿",
        "调节判定容差",
        "调节线宽与收笔",
        "防抖＋拖动控制点",
      ],
      panel: "滤镜",
      canvas: "预览",
      filters: ["自动线稿", "棱镜", "色调", "模糊"],
      controls: [
        ["判定容差", "42"],
        ["线稿宽度", "3.0"],
        ["防抖", "58"],
        ["收笔", "24"],
      ],
      dragHint: "拖动控制点进行细调",
      apply: "应用",
    },
    "zh-Hant": {
      autoEyebrow: "AUTO LINEART",
      autoTitle: "從草稿到線稿，自動產生，也能自己細調。",
      autoLead:
        "自動線稿會沿草稿線條的中心產生可編輯線稿。你可以邊看預覽邊調整判定容差、線稿寬度、收筆與防手震，並透過拖曳控制點進一步修整線條走向。它以你畫出的草稿為基礎，並不是用生成式 AI 取代原畫。",
      autoPoints: [
        "沿草稿中心產生線稿",
        "調整判定容差",
        "調整線寬與收筆",
        "防手震＋拖曳控制點",
      ],
      panel: "濾鏡",
      canvas: "預覽",
      filters: ["自動線稿", "稜鏡", "色調", "模糊"],
      controls: [
        ["判定容差", "42"],
        ["線稿寬度", "3.0"],
        ["防手震", "58"],
        ["收筆", "24"],
      ],
      dragHint: "拖曳控制點進行細調",
      apply: "套用",
    },
    ko: {
      autoEyebrow: "AUTO LINEART",
      autoTitle: "러프에서 선화까지. 자동으로 만들고, 직접 다듬습니다.",
      autoLead:
        "자동 선화는 러프 선의 중심을 따라 편집 가능한 선화를 만듭니다. 미리보기를 보며 판정 허용 범위, 선 굵기, 테이퍼, 손떨림 보정을 조절하고, 필요하면 제어점을 직접 드래그해 선의 흐름을 다듬을 수 있습니다. 사용자가 그린 러프를 바탕으로 작동하며 생성형 AI로 그림을 대체하지 않습니다.",
      autoPoints: [
        "러프 중심에서 선화 생성",
        "판정 허용 범위 조절",
        "선 굵기·테이퍼 조절",
        "손떨림 보정＋제어점 드래그",
      ],
      panel: "필터",
      canvas: "미리보기",
      filters: ["자동 선화", "프리즘", "색조", "블러"],
      controls: [
        ["판정 범위", "42"],
        ["선 굵기", "3.0"],
        ["손떨림 보정", "58"],
        ["테이퍼", "24"],
      ],
      dragHint: "제어점을 드래그해 조정",
      apply: "적용",
    },
    fr: {
      autoEyebrow: "AUTO LINEART",
      autoTitle: "Du rough au lineart, automatiquement — sans perdre la main.",
      autoLead:
        "Le lineart automatique suit le centre des traits de votre rough pour construire un lineart éditable. Ajustez la tolérance de détection, l’épaisseur, l’effilement et la stabilisation dans l’aperçu, puis déplacez les points de contrôle pour affiner la courbe. Il part de votre propre rough et ne remplace pas votre dessin par une IA générative.",
      autoPoints: [
        "Lineart depuis le centre du rough",
        "Tolérance de détection",
        "Épaisseur et effilement",
        "Stabilisation＋points déplaçables",
      ],
      panel: "Filtres",
      canvas: "Aperçu",
      filters: ["Lineart auto", "Prisme", "Couleur", "Flou"],
      controls: [
        ["Tolérance", "42"],
        ["Épaisseur", "3.0"],
        ["Stabilisation", "58"],
        ["Effilement", "24"],
      ],
      dragHint: "Déplacez les points pour affiner",
      apply: "Appliquer",
    },
    es: {
      autoEyebrow: "AUTO LINEART",
      autoTitle: "Del boceto al lineart, automáticamente y con control total.",
      autoLead:
        "El lineart automático sigue el centro de los trazos del boceto para construir un lineart editable. Ajusta la tolerancia de detección, el grosor, el remate y la estabilización mientras ves la previsualización, y arrastra los puntos de control para afinar la curva. Parte de tu propio boceto; no sustituye tu dibujo con IA generativa.",
      autoPoints: [
        "Lineart desde el centro del boceto",
        "Tolerancia de detección",
        "Grosor y remate",
        "Estabilización＋puntos arrastrables",
      ],
      panel: "Filtros",
      canvas: "Vista previa",
      filters: ["Lineart auto", "Prisma", "Color", "Desenfoque"],
      controls: [
        ["Tolerancia", "42"],
        ["Grosor", "3.0"],
        ["Estabilización", "58"],
        ["Remate", "24"],
      ],
      dragHint: "Arrastra los puntos para afinar",
      apply: "Aplicar",
    },
  };

  function copy() {
    var lang = document.documentElement.lang || "ja";
    return COPY[lang] || COPY.en;
  }

  function screenMarkup(c) {
    var widths = ["62%", "38%", "68%", "48%"];
    return (
      '<div class="autolineart-app-mock" data-mock-theme="ink" aria-label="' +
      c.autoTitle +
      '">' +
      '<div class="autolineart-topbar"><span class="autolineart-brand-dot"></span><strong>NIARIM</strong><span class="autolineart-project">LINEART_01</span><span class="spacer"></span><span class="autolineart-icon">↶</span><span class="autolineart-icon">↷</span><span class="autolineart-icon">⌂</span></div>' +
      '<div class="autolineart-workspace">' +
      '<div class="autolineart-canvas-pane"><div class="autolineart-canvas-label">' +
      c.canvas +
      '</div><div class="autolineart-preview"><svg viewBox="0 0 320 200" aria-hidden="true"><path class="autolineart-rough autolineart-rough-a" d="M36 158 C56 76 100 43 153 57 C191 67 225 48 279 69"/><path class="autolineart-rough autolineart-rough-b" d="M38 163 C61 82 101 50 155 63 C193 73 228 53 281 75"/><path class="autolineart-guide" d="M37 160 C59 79 101 47 154 60 C192 70 227 51 280 72"/><path class="autolineart-path" d="M37 160 C59 79 101 47 154 60 C192 70 227 51 280 72"/><circle class="autolineart-node" cx="37" cy="160" r="5"/><circle class="autolineart-node" cx="83" cy="78" r="5"/><circle class="autolineart-node is-active" cx="154" cy="60" r="6"/><circle class="autolineart-node" cx="219" cy="61" r="5"/><circle class="autolineart-node" cx="280" cy="72" r="5"/></svg></div><div class="autolineart-drag-hint"><span></span>' +
      c.dragHint +
      "</div></div>" +
      '<div class="autolineart-panel"><div class="autolineart-panel-head"><strong>' +
      c.panel +
      '</strong><span>☆</span><span>⌕</span></div><div class="autolineart-filters">' +
      c.filters
        .map(function (name, i) {
          return (
            '<div class="autolineart-filter' +
            (i === 0 ? " is-active" : "") +
            '"><span class="autolineart-filter-icon"></span>' +
            name +
            "</div>"
          );
        })
        .join("") +
      '</div><div class="autolineart-controls">' +
      c.controls
        .map(function (row, i) {
          return (
            '<div class="autolineart-control-row"><span>' +
            row[0] +
            '</span><span class="autolineart-slider"><i style="width:' +
            widths[i] +
            '"></i><em style="left:' +
            widths[i] +
            '"></em></span><b>' +
            row[1] +
            "</b></div>"
          );
        })
        .join("") +
      '</div><button class="autolineart-apply" type="button" tabindex="-1">' +
      c.apply +
      "</button></div></div></div>"
    );
  }

  function renderFeatures() {
    var section = document.getElementById("advanced");
    if (!section) return;
    var head = section.querySelector(".feature-section-head");
    if (!head) return;

    var old = section.querySelector(".signature-feature-layout");
    if (old) old.remove();

    var c = copy();
    var el = document.createElement("div");
    el.className = "signature-feature-layout";
    el.innerHTML =
      '<div class="signature-feature-copy"><span class="eyebrow">' +
      c.autoEyebrow +
      "</span><h3>" +
      c.autoTitle +
      "</h3><p>" +
      c.autoLead +
      '</p><div class="signature-feature-points">' +
      c.autoPoints
        .map(function (item) {
          return '<div class="signature-feature-point">' + item + "</div>";
        })
        .join("") +
      "</div></div>" +
      screenMarkup(c);
    head.insertAdjacentElement("afterend", el);
  }

  function render() {
    renderFeatures();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  document.addEventListener("niarim:langchange", render);
})();
