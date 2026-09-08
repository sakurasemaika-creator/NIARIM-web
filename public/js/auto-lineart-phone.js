(function () {
  "use strict";
  var SPRITE = "/assets/icons/ui/sprite.svg#";
  var COPY = {
    ja: [
      "自動線画",
      "対象ラフ線幅",
      "線画の太さ",
      "入り抜きの長さ",
      "なめらか補正",
      "リセット",
      "適用",
      "線画色",
    ],
    en: [
      "Auto line art",
      "Rough line width",
      "Line art width",
      "Taper length",
      "Smoothing",
      "Reset",
      "Apply",
      "Line color",
    ],
    "zh-Hans": [
      "自动线稿",
      "草稿线宽",
      "线稿宽度",
      "收笔长度",
      "平滑修正",
      "重置",
      "应用",
      "线稿颜色",
    ],
    "zh-Hant": [
      "自動線稿",
      "草稿線寬",
      "線稿寬度",
      "收筆長度",
      "平滑修正",
      "重設",
      "套用",
      "線稿顏色",
    ],
    ko: [
      "자동 선화",
      "러프 선 굵기",
      "선화 굵기",
      "테이퍼 길이",
      "부드럽게",
      "초기화",
      "적용",
      "선화 색상",
    ],
    fr: [
      "Encrage automatique",
      "Épaisseur du brouillon",
      "Épaisseur du trait",
      "Longueur de l’effilé",
      "Lissage",
      "Réinitialiser",
      "Appliquer",
      "Couleur du trait",
    ],
    es: [
      "Entintado automático",
      "Grosor del boceto",
      "Grosor de línea",
      "Longitud del afinado",
      "Suavizado",
      "Restablecer",
      "Aplicar",
      "Color del trazo",
    ],
  };
  function icon(name) {
    return (
      '<span class="fd-icon-btn"><svg class="ic" aria-hidden="true"><use href="' +
      SPRITE +
      name +
      '"></use></svg></span>'
    );
  }
  function row(label, value, fill, parameter) {
    return (
      '<div class="fd-autolineart-row" data-lineart-parameter="' +
      parameter +
      '"><span>' +
      label +
      ": <strong>" +
      value +
      '</strong></span><div class="fd-autolineart-stepper">' +
      '<span class="fd-icon-btn"><i class="fd-autolineart-minus"></i></span>' +
      '<span class="fd-autolineart-slider"><i style="width:' +
      fill +
      '"></i><b style="left:' +
      fill +
      '"></b></span>' +
      icon("ic-add") +
      "</div></div>"
    );
  }
  function markup(c) {
    return (
      '<div class="feature-diagram fd-route-screen fd-autolineart-screen" data-mock-screen="auto-lineart" aria-hidden="true"><div class="fd-appbar">' +
      icon("ic-arrow_back") +
      "<strong>" +
      c[0] +
      '</strong><span class="fd-spacer"></span>' +
      icon("ic-help_outline") +
      '</div><div class="fd-route-body fd-autolineart-body"><div class="fd-autolineart-preview"><svg viewBox="0 0 280 158" aria-hidden="true"><path class="fd-autolineart-rough" d="M24 128 C48 46 93 31 141 49 C181 63 213 44 256 60"/><path class="fd-autolineart-rough fd-autolineart-rough-b" d="M26 133 C50 52 95 37 143 55 C183 69 215 50 258 66"/><path class="fd-autolineart-guide" d="M25 130 C49 49 94 34 142 52 C182 66 214 47 257 63"/><path class="fd-autolineart-path" d="M25 130 C49 49 94 34 142 52 C182 66 214 47 257 63"/><circle class="fd-autolineart-node" cx="25" cy="130" r="4"/><circle class="fd-autolineart-node" cx="78" cy="48" r="4"/><circle class="fd-autolineart-node is-active" cx="142" cy="52" r="5"/><circle class="fd-autolineart-node" cx="204" cy="53" r="4"/><circle class="fd-autolineart-node" cx="257" cy="63" r="4"/></svg></div><div class="fd-autolineart-controls">' +
      row(c[1], "12px", "12.82%", "rough-width") +
      '<div class="fd-autolineart-color"><span>' +
      c[7] +
      "</span><i></i></div>" +
      row(c[2], "2px", "3.45%", "output-width") +
      row(c[3], "8px", "8%", "taper-length") +
      row(c[4], "5", "50%", "smoothing") +
      '</div><div class="fd-autolineart-actions"><span class="fd-autolineart-reset">' +
      c[5] +
      '</span><span class="fd-autolineart-apply">' +
      c[6] +
      "</span></div></div></div>"
    );
  }
  function render() {
    var section = document.getElementById("advanced");
    if (!section) return;
    var old = section.querySelector(":scope > .feature-diagram");
    if (!old) return;
    var lang = document.documentElement.lang || "ja";
    var wrap = document.createElement("div");
    wrap.innerHTML = markup(COPY[lang] || COPY.en);
    old.replaceWith(wrap.firstElementChild);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", render);
  else render();
  document.addEventListener("niarim:langchange", render);
})();
