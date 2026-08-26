/**
 * NIARIM公式サイト /faq/ ページ追加項目 翻訳辞書
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "meta.faq.title": "よくある質問 | NIARIM",
    "meta.faq.description": "NIARIMに関するよくある質問と回答をまとめています。",
    "faq.q8": "プレミアムプランでは何ができますか？",
    "faq.a8": "広告非表示、エンドロゴの編集・削除、ユーザーウォーターマーク、トーンカーブ、レベル補正などをご利用いただけます。詳しくはプレミアムプランのページをご覧ください。"
  },
  "en": {
    "meta.faq.title": "FAQ | NIARIM",
    "meta.faq.description": "Frequently asked questions and answers about NIARIM.",
    "faq.q8": "What can I do with the Premium plan?",
    "faq.a8": "Premium removes ads and adds end-card editing/removal, a custom watermark, a tone curve, and levels adjustment. See the Premium plan page for details."
  },
  "zh-Hans": {
    "meta.faq.title": "常见问题 | NIARIM",
    "meta.faq.description": "汇总了关于 NIARIM 的常见问题与解答。",
    "faq.q8": "高级会员方案能做什么？",
    "faq.a8": "可移除广告、编辑或删除片尾标志、使用自定义水印、色调曲线、色阶调整等。详情请参阅高级会员方案页面。"
  },
  "zh-Hant": {
    "meta.faq.title": "常見問題 | NIARIM",
    "meta.faq.description": "彙整了關於 NIARIM 的常見問題與解答。",
    "faq.q8": "高級會員方案能做什麼？",
    "faq.a8": "可移除廣告、編輯或刪除片尾標誌、使用自訂浮水印、色調曲線、色階調整等。詳情請參閱高級會員方案頁面。"
  },
  "ko": {
    "meta.faq.title": "자주 묻는 질문 | NIARIM",
    "meta.faq.description": "NIARIM에 관한 자주 묻는 질문과 답변을 정리했습니다.",
    "faq.q8": "프리미엄 플랜으로 무엇을 할 수 있나요?",
    "faq.a8": "광고 비표시, 엔드 카드 편집・삭제, 사용자 워터마크, 톤 커브, 레벨 보정 등을 이용하실 수 있습니다. 자세한 내용은 프리미엄 플랜 페이지를 확인해 주세요."
  },
  "fr": {
    "meta.faq.title": "FAQ | NIARIM",
    "meta.faq.description": "Questions fréquentes et réponses à propos de NIARIM.",
    "faq.q8": "Que puis-je faire avec l'offre Premium ?",
    "faq.a8": "Premium supprime les publicités et ajoute l'édition/suppression du générique de fin, un filigrane personnalisé, une courbe de tons et le réglage des niveaux. Voir la page Premium pour plus de détails."
  },
  "es": {
    "meta.faq.title": "Preguntas frecuentes | NIARIM",
    "meta.faq.description": "Preguntas frecuentes y respuestas sobre NIARIM.",
    "faq.q8": "¿Qué puedo hacer con el plan Premium?",
    "faq.a8": "Premium elimina los anuncios y añade edición/eliminación de la placa de cierre, marca de agua personalizada, curva de tonos y ajuste de niveles. Consulta la página de Premium para más detalles."
  }
};
  for (var lang in DATA) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = DATA[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
