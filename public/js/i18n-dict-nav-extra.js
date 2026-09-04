/**
 * NIARIM公式サイト ナビゲーション追加項目(About/Guide)翻訳辞書
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    ja: {
      "a11y.skipToMain": "本文へスキップ",
      "a11y.globalNav": "グローバルナビゲーション",
      "a11y.openMenu": "メニューを開く",
      "a11y.switchLang": "言語を切り替える",
      "a11y.categoryList": "カテゴリ一覧",
      "a11y.featureList": "機能一覧",
      "nav.premium": "プレミアム",
      "nav.community": "作品広場",
      "common.scrollTop": "ページトップへ戻る",
      "nav.about": "NIARIMとは",
      "nav.help": "使い方ガイド",
      "meta.about.title": "NIARIMとは | NIARIM",
      "meta.about.description":
        "手描きアニメ制作アプリNIARIMのコンセプト、対応環境、他にはない特徴的な機能をご紹介します。",
      "meta.help.title": "使い方ガイド | NIARIM",
      "meta.help.description":
        "NIARIMの使い方を、アプリ内ヘルプと同じ内容でウェブからも検索・閲覧できます。",
      "help.lead":
        "アプリ内の「ヘルプ」画面とほぼ同じ内容を、ウェブからも検索・閲覧いただけます。気になるキーワードを入力してください。",
      "help.backToTop": "カテゴリ一覧へ戻る",
    },
    en: {
      "a11y.skipToMain": "Skip to main content",
      "a11y.globalNav": "Global navigation",
      "a11y.openMenu": "Open menu",
      "a11y.switchLang": "Change language",
      "a11y.categoryList": "Categories",
      "a11y.featureList": "Features",
      "nav.premium": "Premium",
      "nav.community": "Gallery",
      "common.scrollTop": "Back to top",
      "nav.about": "About",
      "nav.help": "Guide",
      "meta.about.title": "About NIARIM | NIARIM",
      "meta.about.description":
        "Learn about NIARIM's concept, supported environments, and the features that set it apart.",
      "meta.help.title": "Guide | NIARIM",
      "meta.help.description":
        "Search and browse the same content as the app's built-in Help screen, right from the web.",
      "help.lead":
        "This mirrors the app's built-in Help screen. Type a keyword to search.",
      "help.backToTop": "Back to categories",
    },
    "zh-Hans": {
      "a11y.skipToMain": "跳至主要内容",
      "a11y.globalNav": "全局导航",
      "a11y.openMenu": "打开菜单",
      "a11y.switchLang": "切换语言",
      "a11y.categoryList": "分类列表",
      "a11y.featureList": "功能列表",
      "nav.premium": "高级会员",
      "nav.community": "作品广场",
      "common.scrollTop": "返回顶部",
      "nav.about": "关于",
      "nav.help": "使用指南",
      "meta.about.title": "关于 NIARIM | NIARIM",
      "meta.about.description":
        "介绍手绘动画制作应用 NIARIM 的理念、支持环境以及独有的特色功能。",
      "meta.help.title": "使用指南 | NIARIM",
      "meta.help.description":
        "可在网页上搜索、浏览与应用内「帮助」画面几乎相同的内容。",
      "help.lead":
        "这里的内容与应用内的「帮助」画面基本相同，可在网页上搜索浏览。请输入想查找的关键词。",
      "help.backToTop": "返回分类列表",
    },
    "zh-Hant": {
      "a11y.skipToMain": "跳至主要內容",
      "a11y.globalNav": "全域導覽",
      "a11y.openMenu": "開啟選單",
      "a11y.switchLang": "切換語言",
      "a11y.categoryList": "分類列表",
      "a11y.featureList": "功能列表",
      "nav.premium": "高級會員",
      "nav.community": "作品廣場",
      "common.scrollTop": "返回頂部",
      "nav.about": "關於",
      "nav.help": "使用指南",
      "meta.about.title": "關於 NIARIM | NIARIM",
      "meta.about.description":
        "介紹手繪動畫製作應用程式 NIARIM 的理念、支援環境以及獨有的特色功能。",
      "meta.help.title": "使用指南 | NIARIM",
      "meta.help.description":
        "可在網頁上搜尋、瀏覽與應用程式內「說明」畫面幾乎相同的內容。",
      "help.lead":
        "這裡的內容與應用程式內的「說明」畫面基本相同，可在網頁上搜尋瀏覽。請輸入想查詢的關鍵字。",
      "help.backToTop": "返回分類列表",
    },
    ko: {
      "a11y.skipToMain": "본문으로 건너뛰기",
      "a11y.globalNav": "전체 내비게이션",
      "a11y.openMenu": "메뉴 열기",
      "a11y.switchLang": "언어 변경",
      "a11y.categoryList": "카테고리 목록",
      "a11y.featureList": "기능 목록",
      "nav.premium": "프리미엄",
      "nav.community": "작품 광장",
      "common.scrollTop": "위로 이동",
      "nav.about": "소개",
      "nav.help": "이용 가이드",
      "meta.about.title": "NIARIM 소개 | NIARIM",
      "meta.about.description":
        "손그림 애니메이션 제작 앱 NIARIM의 콘셉트, 지원 환경, 다른 앱에 없는 특징적인 기능을 소개합니다.",
      "meta.help.title": "이용 가이드 | NIARIM",
      "meta.help.description":
        "앱 내 도움말 화면과 거의 동일한 내용을 웹에서도 검색·열람할 수 있습니다.",
      "help.lead":
        '앱 내 "도움말" 화면과 거의 동일한 내용을 웹에서도 검색·열람하실 수 있습니다. 찾고 싶은 키워드를 입력해 주세요.',
      "help.backToTop": "카테고리 목록으로 돌아가기",
    },
    fr: {
      "a11y.skipToMain": "Passer au contenu principal",
      "a11y.globalNav": "Navigation principale",
      "a11y.openMenu": "Ouvrir le menu",
      "a11y.switchLang": "Changer de langue",
      "a11y.categoryList": "Catégories",
      "a11y.featureList": "Fonctionnalités",
      "nav.premium": "Premium",
      "nav.community": "Galerie",
      "common.scrollTop": "Retour en haut",
      "nav.about": "À propos",
      "nav.help": "Guide",
      "meta.about.title": "À propos de NIARIM | NIARIM",
      "meta.about.description":
        "Découvrez le concept de NIARIM, les environnements pris en charge et les fonctionnalités qui le distinguent.",
      "meta.help.title": "Guide | NIARIM",
      "meta.help.description":
        "Recherchez et parcourez depuis le web le même contenu que l'écran d'aide intégré à l'application.",
      "help.lead":
        "Ce contenu reprend l'écran d'aide intégré à l'application. Saisissez un mot-clé pour rechercher.",
      "help.backToTop": "Retour aux catégories",
    },
    es: {
      "a11y.skipToMain": "Saltar al contenido principal",
      "a11y.globalNav": "Navegación principal",
      "a11y.openMenu": "Abrir el menú",
      "a11y.switchLang": "Cambiar de idioma",
      "a11y.categoryList": "Categorías",
      "a11y.featureList": "Funciones",
      "nav.premium": "Premium",
      "nav.community": "Galería",
      "common.scrollTop": "Volver arriba",
      "nav.about": "Acerca de",
      "nav.help": "Guía",
      "meta.about.title": "Acerca de NIARIM | NIARIM",
      "meta.about.description":
        "Descubre el concepto de NIARIM, los entornos compatibles y las funciones que lo distinguen.",
      "meta.help.title": "Guía | NIARIM",
      "meta.help.description":
        "Busca y consulta desde la web el mismo contenido que la pantalla de ayuda integrada en la app.",
      "help.lead":
        "Este contenido refleja la pantalla de ayuda integrada en la app. Escribe una palabra clave para buscar.",
      "help.backToTop": "Volver a las categorías",
    },
  };
  for (var lang in DATA) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = DATA[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
