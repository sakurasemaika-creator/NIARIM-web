(function () {
  "use strict";

  var COPY = {
    ja: {
      kicker: "NIARIM SIGNATURE TOOLS",
      title: "描く・仕上げる・動かすを、NIARIMらしく短くする。",
      lead: "一般的なイラスト制作アプリでは脇役になりがちな工程を、NIARIMではアニメ制作の中心に置いています。繰り返し作業を減らしながら、見た目の作り込みはむしろ深く。",
      cards: [
        ["自動線画", "描いた線や画像から線の流れを解析し、線画へ整えます。線幅・滑らかさ・抜きに加え、制御点を直接動かして仕上げられます。"],
        ["自動塗り", "自動塗り設定を使って、同じキャラクターを何枚も描くアニメの色塗りをまとめて効率化。線画を直したフレームも更新対象として分かります。"],
        ["演出フィルター", "仕上げの演出を1フレームずつ繰り返す必要はありません。複数フレームを選び、まとめて同じフィルターを適用できます。"],
        ["トーン塗り", "色だけでなくトーン表現も塗りの工程に組み込み、漫画的な質感や陰影をアニメの各フレームへ取り入れられます。"],
        ["ピクセルモード", "ドット絵向けの描画感へ切り替えて、手描きアニメとピクセル表現を同じ制作環境で行き来できます。"],
        ["外観・テーマ", "プリセットだけでなく、アクセント・文字・パネル・メニュー・選択色まで細かく自分好みに。制作環境そのものを自分の道具にできます。"],
      ],
      autoEyebrow: "NEW · AUTO LINEART",
      autoTitle: "自動線画を、画面そのものまで見せる。",
      autoLead: "最新のNIARIMではフィルターパネルに自動線画が加わりました。プレビューを見ながら線の流れを整え、制御点を直接動かしてから適用できます。生成AIではなく、現在のレイヤーを解析して線画を構成する作画支援機能です。",
      autoPoints: ["200pxプレビュー", "制御点を直接編集", "線幅・滑らかさを調整", "抜き・仕上がり幅を調整"],
      panel: "フィルター",
      filters: ["自動線画", "プリズム", "色調", "ぼかし"],
      controls: [["ラフ線幅", "24"], ["滑らかさ", "45"], ["仕上がり幅", "3"], ["抜き", "18"]],
      apply: "適用",
    },
    en: {
      kicker: "NIARIM SIGNATURE TOOLS",
      title: "Less repetition. More room to make it yours.",
      lead: "NIARIM turns the repetitive parts of animation production into first-class tools, so you can spend less time repeating steps and more time shaping the result.",
      cards: [
        ["Auto lineart", "Analyze the current layer into editable lineart, then tune width, smoothing and taper while moving control points directly."],
        ["Auto fill", "Reuse color rules across repeated character drawings and quickly see which frames need recalculation after lineart changes."],
        ["Bulk effect filters", "Select multiple frames and apply the same finishing effect in one go instead of repeating it frame by frame."],
        ["Tone fill", "Bring manga-like tone textures into the coloring workflow and use them across animation frames."],
        ["Pixel mode", "Switch into a pixel-focused drawing feel without leaving the same animation workspace."],
        ["Appearance & themes", "Tune accent, text, panel, menu and selection colors so the workspace itself feels like your tool."],
      ],
      autoEyebrow: "NEW · AUTO LINEART",
      autoTitle: "A real screen for NIARIM's new auto-lineart tool.",
      autoLead: "Auto lineart now lives in the filter panel. Preview the result, reshape control points directly, then apply it. It is a rule-based drawing aid that analyzes the current layer, not a generative-AI feature.",
      autoPoints: ["200px preview", "Direct control-point editing", "Width & smoothing controls", "Taper & output-width controls"],
      panel: "Filters",
      filters: ["Auto lineart", "Prism", "Color", "Blur"],
      controls: [["Rough width", "24"], ["Smoothing", "45"], ["Output width", "3"], ["Taper", "18"]],
      apply: "Apply",
    },
    "zh-Hans": {
      kicker: "NIARIM SIGNATURE TOOLS", title: "把绘制、润色与动画制作中反复的步骤交给更顺手的工具。", lead: "NIARIM把动画制作里容易重复劳动的环节做成核心功能，让你少做机械操作，把时间留给画面本身。",
      cards: [["自动线稿","分析当前图层并整理成可编辑线稿，可调线宽、平滑与收笔，还能直接移动控制点。"],["自动上色","用既定配色规则减少重复角色逐帧上色的工作量，并能看出哪些帧需要重新计算。"],["批量演出滤镜","选择多个帧后一次应用同一种演出效果，不必逐帧重复。"],["网点上色","把漫画式网点质感直接纳入上色流程，并用于动画帧。"],["像素模式","在同一动画工作区中切换到更适合像素画的绘制体验。"],["外观与主题","从强调色到文字、面板、菜单和选中色都可以细调。"]],
      autoEyebrow:"NEW · AUTO LINEART", autoTitle:"把新增的自动线稿界面也完整展示出来。", autoLead:"自动线稿已加入滤镜面板。可以边看预览边调整线条，并直接移动控制点后再应用。它分析当前图层，不是生成式AI功能。", autoPoints:["200px预览","直接编辑控制点","调节线宽与平滑","调节收笔与成品线宽"], panel:"滤镜", filters:["自动线稿","棱镜","色调","模糊"], controls:[["草稿线宽","24"],["平滑","45"],["成品线宽","3"],["收笔","18"]], apply:"应用"
    },
    "zh-Hant": {
      kicker: "NIARIM SIGNATURE TOOLS", title: "把繪製、收尾與動畫製作中反覆的步驟交給更順手的工具。", lead: "NIARIM把動畫製作裡容易重複勞動的環節做成核心功能，讓你少做機械操作，把時間留給畫面本身。",
      cards: [["自動線稿","分析目前圖層並整理成可編輯線稿，可調線寬、平滑與收筆，還能直接移動控制點。"],["自動上色","用既定配色規則減少重複角色逐格上色的工作量，並能看出哪些影格需要重新計算。"],["批次演出濾鏡","選擇多個影格後一次套用同一種演出效果，不必逐格重複。"],["網點上色","把漫畫式網點質感直接納入上色流程，並用於動畫影格。"],["像素模式","在同一動畫工作區中切換到更適合像素畫的繪製體驗。"],["外觀與主題","從強調色到文字、面板、選單和選取色都可以細調。"]],
      autoEyebrow:"NEW · AUTO LINEART", autoTitle:"把新增的自動線稿介面也完整展示出來。", autoLead:"自動線稿已加入濾鏡面板。可以邊看預覽邊調整線條，並直接移動控制點後再套用。它分析目前圖層，不是生成式AI功能。", autoPoints:["200px預覽","直接編輯控制點","調節線寬與平滑","調節收筆與成品線寬"], panel:"濾鏡", filters:["自動線稿","稜鏡","色調","模糊"], controls:[["草稿線寬","24"],["平滑","45"],["成品線寬","3"],["收筆","18"]], apply:"套用"
    },
    ko: {
      kicker:"NIARIM SIGNATURE TOOLS", title:"그리기·마무리·움직이기의 반복 작업은 줄이고, 표현은 더 깊게.", lead:"NIARIM은 애니메이션 제작에서 반복되기 쉬운 과정을 핵심 기능으로 끌어올려, 같은 작업보다 결과를 다듬는 데 더 많은 시간을 쓸 수 있게 합니다.",
      cards:[["자동 선화","현재 레이어를 분석해 편집 가능한 선화로 정리하고 선 굵기·매끄러움·테이퍼와 제어점을 직접 조정합니다."],["자동 채색","캐릭터의 반복 프레임에 색 규칙을 재사용해 채색 수고를 줄이고 다시 계산할 프레임도 쉽게 확인합니다."],["일괄 연출 필터","여러 프레임을 선택해 같은 마무리 효과를 한 번에 적용합니다."],["톤 채색","만화식 톤 질감을 채색 과정에 넣어 애니메이션 프레임에도 활용합니다."],["픽셀 모드","같은 애니메이션 작업 공간에서 픽셀 드로잉에 맞는 감각으로 전환합니다."],["외관·테마","강조색부터 글자·패널·메뉴·선택색까지 세밀하게 꾸밀 수 있습니다."]],
      autoEyebrow:"NEW · AUTO LINEART", autoTitle:"새 자동 선화 화면도 실제 구조대로 보여드립니다.", autoLead:"자동 선화가 필터 패널에 추가되었습니다. 미리보기를 보며 선을 정리하고 제어점을 직접 옮긴 뒤 적용할 수 있습니다. 현재 레이어를 분석하는 규칙 기반 보조 기능이며 생성형 AI가 아닙니다.", autoPoints:["200px 미리보기","제어점 직접 편집","선 굵기·매끄러움 조절","테이퍼·출력 굵기 조절"], panel:"필터", filters:["자동 선화","프리즘","색조","블러"], controls:[["러프 굵기","24"],["매끄러움","45"],["출력 굵기","3"],["테이퍼","18"]], apply:"적용"
    },
    fr: {
      kicker:"NIARIM SIGNATURE TOOLS", title:"Moins de répétition, plus de temps pour créer.", lead:"NIARIM transforme les étapes répétitives de l’animation en outils de premier plan, pour consacrer davantage de temps au rendu final.",
      cards:[["Lineart automatique","Analyse le calque courant en lineart éditable, avec largeur, lissage, effilement et points de contrôle modifiables."],["Colorisation automatique","Réutilise des règles de couleur sur les dessins répétés d’un personnage et signale les images à recalculer."],["Filtres d’effet en lot","Appliquez le même effet à plusieurs images sélectionnées en une seule opération."],["Remplissage tramé","Intègre des trames de type manga directement au flux de colorisation."],["Mode pixel","Passez à une sensation de dessin pensée pour le pixel art sans quitter l’espace d’animation."],["Apparence et thèmes","Réglez couleur d’accent, texte, panneaux, menus et sélection pour personnaliser l’outil lui-même."]],
      autoEyebrow:"NEW · AUTO LINEART", autoTitle:"Le nouvel écran de lineart automatique, reproduit fidèlement.", autoLead:"Le lineart automatique se trouve désormais dans le panneau des filtres. Prévisualisez le résultat, déplacez directement les points de contrôle, puis appliquez. Il analyse le calque courant : ce n’est pas une fonction d’IA générative.", autoPoints:["Aperçu 200 px","Points de contrôle éditables","Largeur et lissage","Effilement et largeur finale"], panel:"Filtres", filters:["Lineart auto","Prisme","Couleur","Flou"], controls:[["Largeur brute","24"],["Lissage","45"],["Largeur finale","3"],["Effilement","18"]], apply:"Appliquer"
    },
    es: {
      kicker:"NIARIM SIGNATURE TOOLS", title:"Menos repetición. Más tiempo para dar forma a tu animación.", lead:"NIARIM convierte los pasos repetitivos de la producción de animación en herramientas principales para que puedas dedicar más tiempo al resultado.",
      cards:[["Lineart automático","Analiza la capa actual y la convierte en lineart editable, con ancho, suavizado, remate y puntos de control ajustables."],["Relleno automático","Reutiliza reglas de color en dibujos repetidos y muestra qué fotogramas necesitan recalcularse."],["Filtros de efecto por lotes","Selecciona varios fotogramas y aplica el mismo efecto de acabado de una sola vez."],["Relleno de trama","Integra tramas de estilo manga directamente en el flujo de color y animación."],["Modo píxel","Cambia a una experiencia pensada para pixel art sin salir del mismo espacio de animación."],["Apariencia y temas","Ajusta color de acento, texto, paneles, menús y selección para hacer tuyo el entorno."]],
      autoEyebrow:"NEW · AUTO LINEART", autoTitle:"La nueva pantalla de lineart automático, también reproducida.", autoLead:"El lineart automático ya está en el panel de filtros. Previsualiza, mueve puntos de control directamente y aplica el resultado. Analiza la capa actual; no es una función de IA generativa.", autoPoints:["Vista previa de 200 px","Edición directa de puntos","Ancho y suavizado","Remate y ancho final"], panel:"Filtros", filters:["Lineart auto","Prisma","Color","Desenfoque"], controls:[["Ancho base","24"],["Suavizado","45"],["Ancho final","3"],["Remate","18"]], apply:"Aplicar"
    }
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
    el.innerHTML = '<div class="unique-spotlight-head"><span class="unique-spotlight-kicker">' + c.kicker + '</span><h3>' + c.title + '</h3><p>' + c.lead + '</p></div><div class="unique-spotlight-grid">' + c.cards.map(function (item, i) { return '<article class="unique-spotlight-card" data-index="0' + (i + 1) + '"><strong>' + item[0] + '</strong><span>' + item[1] + '</span></article>'; }).join("") + '</div>';
    grid.parentNode.insertBefore(el, grid);
  }

  function screenMarkup(c) {
    var widths = ["58%", "45%", "34%", "66%"];
    return '<div class="autolineart-app-mock" aria-label="' + c.autoTitle + '"><div class="autolineart-topbar"><span>' + c.panel + '</span><span class="spacer"></span><span class="autolineart-icon">☆</span><span class="autolineart-icon">⌕</span></div><div class="autolineart-filters">' + c.filters.map(function (name, i) { return '<div class="autolineart-filter' + (i === 0 ? ' is-active' : '') + '">' + name + '</div>'; }).join("") + '</div><div class="autolineart-preview"><svg viewBox="0 0 200 200" aria-hidden="true"><path class="autolineart-guide" d="M35 150 C55 55 105 40 164 68 C145 94 141 122 161 152"/><path class="autolineart-path" d="M35 150 C55 55 105 40 164 68 C145 94 141 122 161 152"/><circle class="autolineart-node" cx="35" cy="150" r="5"/><circle class="autolineart-node" cx="78" cy="61" r="5"/><circle class="autolineart-node" cx="164" cy="68" r="5"/><circle class="autolineart-node" cx="145" cy="116" r="5"/><circle class="autolineart-node" cx="161" cy="152" r="5"/></svg></div><div class="autolineart-controls">' + c.controls.map(function (row, i) { return '<div class="autolineart-control-row"><span>' + row[0] + '</span><span class="autolineart-slider"><i style="width:' + widths[i] + '"></i></span><b>' + row[1] + '</b></div>'; }).join("") + '</div><button class="autolineart-apply" type="button" tabindex="-1">' + c.apply + '</button></div>';
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
    el.innerHTML = '<div class="signature-feature-copy"><span class="eyebrow">' + c.autoEyebrow + '</span><h3>' + c.autoTitle + '</h3><p>' + c.autoLead + '</p><div class="signature-feature-points">' + c.autoPoints.map(function (item) { return '<div class="signature-feature-point">' + item + '</div>'; }).join("") + '</div></div>' + screenMarkup(c);
    head.insertAdjacentElement("afterend", el);
  }

  function render() {
    renderAbout();
    renderFeatures();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  document.addEventListener("niarim:langchange", render);
})();
