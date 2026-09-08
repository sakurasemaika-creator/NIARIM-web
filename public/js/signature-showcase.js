(function () {
  "use strict";

  var COPY = {
    ja: {
      kicker: "ONLY IN NIARIM",
      title: "NIARIMだけの、うれしい機能。",
      lead: "アニメーション制作で何度も繰り返す工程を、ただ省くのではなく、仕上がりまで自分で追い込める道具に。NIARIMならではの作画・仕上げ機能をまとめました。",
      cards: [
        [
          "自動線画",
          "ラフの線の中心を捉えて、自動で線画を作成。判定許容範囲、線画幅、入り抜き、手振れ補正を調整し、制御点のドラッグで線の流れまで追い込めます。",
        ],
        [
          "自動塗り",
          "あらかじめ決めたパーツごとの色・トーン設定を使い、繰り返し描くキャラクターの色塗りを効率化。線画を直したフレームも更新対象として確認できます。",
        ],
        [
          "演出フィルター",
          "複数フレームをまとめて選び、同じ演出フィルターを一括適用。1枚ずつ同じ仕上げを繰り返す手間を減らしながら、作品全体の見た目を揃えられます。",
        ],
        [
          "トーン塗り",
          "色だけでなくトーン表現も塗りの工程に組み込み、漫画的な質感や陰影をアニメーションの各フレームへ自然に取り入れられます。",
        ],
        [
          "ピクセルモード",
          "ドット絵に適した描画感へ切り替え、手描きアニメーションとピクセル表現を同じ制作環境の中で行き来できます。",
        ],
        [
          "外観・テーマ",
          "アクセント、文字、パネル、メニュー、選択色などを細かくカスタマイズ。長く向き合う制作画面そのものを、自分の道具として整えられます。",
        ],
      ],
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
      kicker: "ONLY IN NIARIM",
      title: "Small details that make NIARIM feel different.",
      lead: "NIARIM turns repetitive animation work into tools you can still shape by hand—saving steps without giving up control over the final look.",
      cards: [
        [
          "Auto lineart",
          "Find the centre of rough strokes and build editable lineart automatically. Tune detection tolerance, line width, taper and stabilization, then drag control points to refine the flow.",
        ],
        [
          "Auto fill",
          "Reuse part-by-part colour and tone rules across repeated character drawings, with clear indicators when a frame needs recalculation after lineart changes.",
        ],
        [
          "Bulk effect filters",
          "Select multiple frames and apply the same finishing effect in one pass, keeping the look consistent without repeating the same operation frame by frame.",
        ],
        [
          "Tone fill",
          "Bring manga-style tone textures and shading directly into the colouring workflow for animation frames.",
        ],
        [
          "Pixel mode",
          "Switch to a pixel-focused drawing feel while staying in the same animation workspace.",
        ],
        [
          "Appearance & themes",
          "Tune accent, text, panels, menus and selection colours so the workspace itself feels like your own tool.",
        ],
      ],
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
      kicker: "ONLY IN NIARIM",
      title: "只有 NIARIM 才有的贴心功能。",
      lead: "把动画制作中反复出现的步骤做成既省事、又能继续细调的工具。减少机械操作，同时把最终效果牢牢掌握在自己手里。",
      cards: [
        [
          "自动线稿",
          "沿草稿线条的中心自动生成线稿，可调判定容差、线宽、收笔与防抖，并可拖动控制点继续修整线条走向。",
        ],
        [
          "自动上色",
          "复用角色各部位的颜色与网点规则，减少重复逐帧上色；线稿修改后也能看出哪些帧需要重新计算。",
        ],
        [
          "批量演出滤镜",
          "一次选择多个帧并应用同一种演出效果，减少逐帧重复操作，同时保持整体视觉一致。",
        ],
        ["网点上色", "把漫画式网点和阴影直接纳入动画帧的上色流程。"],
        ["像素模式", "在同一动画工作区中切换到更适合像素画的绘制体验。"],
        [
          "外观与主题",
          "从强调色、文字到面板、菜单和选中色都可以细调，让工作区真正变成自己的工具。",
        ],
      ],
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
      kicker: "ONLY IN NIARIM",
      title: "只有 NIARIM 才有的貼心功能。",
      lead: "把動畫製作中反覆出現的步驟做成既省事、又能繼續細調的工具。減少機械操作，同時把最後效果掌握在自己手裡。",
      cards: [
        [
          "自動線稿",
          "沿草稿線條的中心自動產生線稿，可調判定容差、線寬、收筆與防手震，並可拖曳控制點繼續修整線條走向。",
        ],
        [
          "自動上色",
          "重複使用角色各部位的顏色與網點規則，減少逐格上色；線稿修改後也能看出哪些影格需要重新計算。",
        ],
        [
          "批次演出濾鏡",
          "一次選取多個影格並套用同一種演出效果，減少逐格重複操作，同時保持整體視覺一致。",
        ],
        ["網點上色", "把漫畫式網點與陰影直接納入動畫影格的上色流程。"],
        ["像素模式", "在同一動畫工作區中切換到更適合像素畫的繪製體驗。"],
        [
          "外觀與主題",
          "從強調色、文字到面板、選單與選取色都能細調，讓工作區真正成為自己的工具。",
        ],
      ],
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
      kicker: "ONLY IN NIARIM",
      title: "NIARIM이라서 더 반가운 기능들.",
      lead: "애니메이션 제작에서 반복되는 과정을 줄이되, 결과를 직접 다듬는 감각은 그대로 남겼습니다. 빠르게 만들고, 원하는 만큼 세밀하게 조정할 수 있습니다.",
      cards: [
        [
          "자동 선화",
          "러프 선의 중심을 따라 선화를 자동 생성하고 판정 허용 범위, 선 굵기, 테이퍼, 손떨림 보정을 조절한 뒤 제어점을 드래그해 흐름까지 다듬습니다.",
        ],
        [
          "자동 채색",
          "캐릭터 파츠별 색상·톤 규칙을 반복 프레임에 재사용하고, 선화 수정 뒤 다시 계산해야 할 프레임도 쉽게 확인합니다.",
        ],
        [
          "일괄 연출 필터",
          "여러 프레임을 한 번에 선택해 같은 연출 효과를 적용하고, 반복 작업 없이 작품 전체의 인상을 맞춥니다.",
        ],
        [
          "톤 채색",
          "만화식 톤과 명암 표현을 애니메이션 프레임의 채색 흐름에 바로 넣을 수 있습니다.",
        ],
        [
          "픽셀 모드",
          "같은 애니메이션 작업 공간에서 픽셀 아트에 맞는 드로잉 감각으로 전환합니다.",
        ],
        [
          "외관·테마",
          "강조색, 글자, 패널, 메뉴, 선택색까지 세밀하게 꾸며 작업 공간 자체를 나만의 도구로 만들 수 있습니다.",
        ],
      ],
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
      kicker: "ONLY IN NIARIM",
      title: "Ces petits plus qui rendent NIARIM unique.",
      lead: "NIARIM accélère les étapes répétitives de l’animation sans retirer le contrôle créatif : moins d’actions mécaniques, plus de temps pour affiner le résultat.",
      cards: [
        [
          "Lineart automatique",
          "Suit le centre des traits du rough pour créer un lineart éditable. Réglez tolérance, épaisseur, effilement et stabilisation, puis déplacez les points de contrôle.",
        ],
        [
          "Colorisation automatique",
          "Réutilisez des règles de couleur et de trame par partie du personnage, avec un repère clair pour les images à recalculer après une retouche du lineart.",
        ],
        [
          "Filtres d’effet en lot",
          "Sélectionnez plusieurs images et appliquez le même effet en une seule fois pour conserver une finition cohérente.",
        ],
        [
          "Remplissage tramé",
          "Intégrez directement des trames et ombrages de type manga au flux de colorisation des images d’animation.",
        ],
        [
          "Mode pixel",
          "Passez à une sensation de dessin pensée pour le pixel art sans quitter le même espace d’animation.",
        ],
        [
          "Apparence et thèmes",
          "Réglez accent, texte, panneaux, menus et sélection afin que l’espace de travail devienne réellement le vôtre.",
        ],
      ],
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
      kicker: "ONLY IN NIARIM",
      title: "Pequeñas funciones que hacen diferente a NIARIM.",
      lead: "NIARIM reduce las tareas repetitivas de la animación sin quitarte el control: menos pasos mecánicos y más tiempo para perfeccionar el resultado.",
      cards: [
        [
          "Lineart automático",
          "Sigue el centro de los trazos del boceto para crear lineart editable. Ajusta tolerancia, grosor, remate y estabilización, y arrastra los puntos de control.",
        ],
        [
          "Relleno automático",
          "Reutiliza reglas de color y trama por partes del personaje y detecta qué fotogramas deben recalcularse después de cambiar el lineart.",
        ],
        [
          "Filtros de efecto por lotes",
          "Selecciona varios fotogramas y aplica el mismo acabado de una sola vez para mantener una apariencia coherente.",
        ],
        [
          "Relleno de trama",
          "Integra tramas y sombras de estilo manga directamente en el flujo de color de la animación.",
        ],
        [
          "Modo píxel",
          "Cambia a una experiencia pensada para pixel art sin salir del mismo espacio de animación.",
        ],
        [
          "Apariencia y temas",
          "Personaliza acento, texto, paneles, menús y selección para convertir el espacio de trabajo en tu propia herramienta.",
        ],
      ],
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

  function renderAbout() {
    var heading = document.querySelector('[data-i18n="about.unique.title"]');
    if (!heading) return;
    var section = heading.closest("section");
    var grid = section && section.querySelector(".spec-grid");
    if (!grid) return;

    var old = section.querySelector(".unique-spotlight");
    if (old) old.remove();

    var c = copy();
    var el = document.createElement("div");
    el.className = "unique-spotlight";
    el.innerHTML =
      '<div class="unique-spotlight-head"><span class="unique-spotlight-kicker">' +
      c.kicker +
      "</span><h3>" +
      c.title +
      "</h3><p>" +
      c.lead +
      '</p></div><div class="unique-spotlight-grid">' +
      c.cards
        .map(function (item, i) {
          return (
            '<article class="unique-spotlight-card" data-index="0' +
            (i + 1) +
            '"><strong>' +
            item[0] +
            "</strong><span>" +
            item[1] +
            "</span></article>"
          );
        })
        .join("") +
      "</div>";
    grid.parentNode.insertBefore(el, grid);
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
    renderAbout();
    renderFeatures();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  document.addEventListener("niarim:langchange", render);
})();
