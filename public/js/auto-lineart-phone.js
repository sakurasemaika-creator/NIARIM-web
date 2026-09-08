(function () {
  "use strict";
  var SPRITE = "/assets/icons/ui/sprite.svg#";
  var COPY = {
    ja:["自動線画","判定許容範囲","線画幅","手振れ補正","入り抜き","リセット","適用"],
    en:["Auto lineart","Tolerance","Line width","Stabilization","Taper","Reset","Apply"],
    "zh-Hans":["自动线稿","判定容差","线稿宽度","防抖","收笔","重置","应用"],
    "zh-Hant":["自動線稿","判定容差","線稿寬度","防手震","收筆","重設","套用"],
    ko:["자동 선화","판정 범위","선 굵기","손떨림 보정","테이퍼","초기화","적용"],
    fr:["Lineart auto","Tolérance","Épaisseur","Stabilisation","Effilement","Réinitialiser","Appliquer"],
    es:["Lineart auto","Tolerancia","Grosor","Estabilización","Remate","Restablecer","Aplicar"]
  };
  function icon(name) { return '<span class="fd-icon-btn"><svg class="ic" aria-hidden="true"><use href="' + SPRITE + name + '"></use></svg></span>'; }
  function row(label, value, fill) { return '<div class="fd-autolineart-row"><span>' + label + '</span><span class="fd-autolineart-slider"><i style="width:' + fill + '"></i><b style="left:' + fill + '"></b></span><strong>' + value + '</strong></div>'; }
  function markup(c) {
    return '<div class="feature-diagram fd-route-screen fd-autolineart-screen" data-mock-screen="auto-lineart" aria-hidden="true"><div class="fd-appbar">' + icon("ic-arrow_back") + '<strong>' + c[0] + '</strong><span class="fd-spacer"></span>' + icon("ic-help_outline") + '</div><div class="fd-route-body fd-autolineart-body"><div class="fd-autolineart-preview"><svg viewBox="0 0 280 158" aria-hidden="true"><path class="fd-autolineart-rough" d="M24 128 C48 46 93 31 141 49 C181 63 213 44 256 60"/><path class="fd-autolineart-rough fd-autolineart-rough-b" d="M26 133 C50 52 95 37 143 55 C183 69 215 50 258 66"/><path class="fd-autolineart-guide" d="M25 130 C49 49 94 34 142 52 C182 66 214 47 257 63"/><path class="fd-autolineart-path" d="M25 130 C49 49 94 34 142 52 C182 66 214 47 257 63"/><circle class="fd-autolineart-node" cx="25" cy="130" r="4"/><circle class="fd-autolineart-node" cx="78" cy="48" r="4"/><circle class="fd-autolineart-node is-active" cx="142" cy="52" r="5"/><circle class="fd-autolineart-node" cx="204" cy="53" r="4"/><circle class="fd-autolineart-node" cx="257" cy="63" r="4"/></svg></div><div class="fd-autolineart-controls">' + row(c[1],"42","62%") + row(c[2],"3.0","38%") + row(c[3],"58","68%") + row(c[4],"24","48%") + '</div><div class="fd-autolineart-actions"><span class="fd-autolineart-reset">' + c[5] + '</span><span class="fd-autolineart-apply">' + c[6] + '</span></div></div></div>';
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
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
  document.addEventListener("niarim:langchange", render);
})();
