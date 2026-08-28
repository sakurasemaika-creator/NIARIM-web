/**
 * NIARIM公式サイト Features「保存・共有」セクション 翻訳辞書
 *
 * save_tree_service.dart（セーブスロット/セーブツリー）・project_service.dart
 * （自動保存はクラッシュ復元専用）・niapro_serializer.dart（.niashare は
 * 素材・フォント同梱の共有形式）・niatra_serializer.dart（.niatra は設定・
 * ブラシ・トーン・スタンプ・オートフィルプリセット・テーマの引き継ぎ形式）
 * の実装に基づく。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "featuresPage.nav.save": "保存・共有",
    "featuresPage.save.title": "Save & Share｜保存・データ管理",
    "featuresPage.save.lead": "作品を守り、育て、別の端末へも届ける。柔軟な保存のしくみ。",
    "featuresPage.save.item1.title": "自動保存",
    "featuresPage.save.item1.body": "不意にアプリが終了しても、直前の状態からすぐ復帰できるクラッシュ復元専用の保存です。",
    "featuresPage.save.item2.title": "セーブスロット",
    "featuresPage.save.item2.body": "決まった数のスロットに保存し、好きなタイミングで呼び出せます。",
    "featuresPage.save.item3.title": "セーブツリー",
    "featuresPage.save.item3.body": "保存回数の制限なく、枝分かれした履歴として制作過程を残せます。",
    "featuresPage.save.item4.title": "作品を共有（.niashare）",
    "featuresPage.save.item4.body": "使用した素材・フォントも一緒に書き出せる共有ファイル形式で、別の端末でもそのまま開けます。",
    "featuresPage.save.item5.title": "環境を引き継ぐ（.niatra）",
    "featuresPage.save.item5.body": "設定・ブラシ・トーン・スタンプ・オートフィルプリセット・テーマなど、選んだ項目だけをまとめて別端末へ移行できます。"
  },
  "en": {
    "featuresPage.nav.save": "Save & Share",
    "featuresPage.save.title": "Save & Share｜Data Management",
    "featuresPage.save.lead": "Protect your work, grow it over time, and bring it to another device — a flexible way to save.",
    "featuresPage.save.item1.title": "Autosave",
    "featuresPage.save.item1.body": "A crash-recovery-only save that lets you pick right back up from the last moment, even if the app closes unexpectedly.",
    "featuresPage.save.item2.title": "Save slots",
    "featuresPage.save.item2.body": "Save to a fixed number of slots and load any of them whenever you like.",
    "featuresPage.save.item3.title": "Save tree",
    "featuresPage.save.item3.body": "Keep a branching history of your work in progress, with no limit on how many times you save.",
    "featuresPage.save.item4.title": "Share your work (.niashare)",
    "featuresPage.save.item4.body": "A share file format that bundles the materials and fonts you used, so it opens exactly as-is on another device.",
    "featuresPage.save.item5.title": "Carry your setup over (.niatra)",
    "featuresPage.save.item5.body": "Bundle just the items you choose — settings, brushes, tones, stamps, auto-fill presets, themes — and move them to another device."
  },
  "zh-Hans": {
    "featuresPage.nav.save": "保存・共享",
    "featuresPage.save.title": "Save & Share｜保存与数据管理",
    "featuresPage.save.lead": "守护你的作品，让它不断成长，也能带去其他设备。灵活的保存机制。",
    "featuresPage.save.item1.title": "自动保存",
    "featuresPage.save.item1.body": "即使应用意外退出，也能立即从上一刻的状态恢复，是专用于崩溃恢复的保存。",
    "featuresPage.save.item2.title": "存档栏位",
    "featuresPage.save.item2.body": "保存到固定数量的栏位中，可在任意时刻调出。",
    "featuresPage.save.item3.title": "存档树",
    "featuresPage.save.item3.body": "保存次数没有限制，可以像分支一样保留制作过程的历史记录。",
    "featuresPage.save.item4.title": "分享作品（.niashare）",
    "featuresPage.save.item4.body": "一种会将所用素材、字体一并导出的共享文件格式，在其他设备上也能原样打开。",
    "featuresPage.save.item5.title": "迁移环境（.niatra）",
    "featuresPage.save.item5.body": "可将设置、画笔、网点纸、图章、自动上色预设、主题等，仅选择所需项目打包迁移到其他设备。"
  },
  "zh-Hant": {
    "featuresPage.nav.save": "保存・共享",
    "featuresPage.save.title": "Save & Share｜保存與資料管理",
    "featuresPage.save.lead": "守護你的作品，讓它不斷成長，也能帶去其他裝置。靈活的保存機制。",
    "featuresPage.save.item1.title": "自動保存",
    "featuresPage.save.item1.body": "即使應用程式意外結束，也能立即從上一刻的狀態恢復，是專用於當機復原的保存。",
    "featuresPage.save.item2.title": "存檔欄位",
    "featuresPage.save.item2.body": "保存到固定數量的欄位中，可在任意時刻叫出。",
    "featuresPage.save.item3.title": "存檔樹",
    "featuresPage.save.item3.body": "保存次數沒有限制，可以像分支一樣保留製作過程的歷史紀錄。",
    "featuresPage.save.item4.title": "分享作品（.niashare）",
    "featuresPage.save.item4.body": "一種會將使用的素材、字型一併匯出的共享檔案格式，在其他裝置上也能原樣開啟。",
    "featuresPage.save.item5.title": "轉移環境（.niatra）",
    "featuresPage.save.item5.body": "可將設定、筆刷、網點紙、圖章、自動上色預設、主題等，僅選擇所需項目打包轉移到其他裝置。"
  },
  "ko": {
    "featuresPage.nav.save": "저장・공유",
    "featuresPage.save.title": "Save & Share｜저장・데이터 관리",
    "featuresPage.save.lead": "작품을 지키고, 발전시키고, 다른 기기로도 전달한다. 유연한 저장 구조.",
    "featuresPage.save.item1.title": "자동 저장",
    "featuresPage.save.item1.body": "앱이 갑자기 종료되어도 직전 상태에서 바로 복구할 수 있는, 크래시 복원 전용 저장입니다.",
    "featuresPage.save.item2.title": "세이브 슬롯",
    "featuresPage.save.item2.body": "정해진 수의 슬롯에 저장해두고, 원하는 시점에 불러올 수 있습니다.",
    "featuresPage.save.item3.title": "세이브 트리",
    "featuresPage.save.item3.body": "저장 횟수 제한 없이, 가지가 갈라지는 이력으로 제작 과정을 남길 수 있습니다.",
    "featuresPage.save.item4.title": "작품 공유(.niashare)",
    "featuresPage.save.item4.body": "사용한 소재・글꼴까지 함께 내보낼 수 있는 공유 파일 형식으로, 다른 기기에서도 그대로 열 수 있습니다.",
    "featuresPage.save.item5.title": "환경 이전(.niatra)",
    "featuresPage.save.item5.body": "설정・브러시・톤・스탬프・오토필 프리셋・테마 등 원하는 항목만 골라 다른 기기로 한 번에 옮길 수 있습니다."
  },
  "fr": {
    "featuresPage.nav.save": "Enregistrer et partager",
    "featuresPage.save.title": "Save & Share｜Gestion des données",
    "featuresPage.save.lead": "Protégez votre travail, faites-le grandir, et emportez-le sur un autre appareil — un système d'enregistrement flexible.",
    "featuresPage.save.item1.title": "Sauvegarde automatique",
    "featuresPage.save.item1.body": "Une sauvegarde réservée à la récupération après un arrêt inattendu de l'application, pour reprendre aussitôt là où vous en étiez.",
    "featuresPage.save.item2.title": "Emplacements de sauvegarde",
    "featuresPage.save.item2.body": "Enregistrez dans un nombre fixe d'emplacements et rappelez-les quand vous le souhaitez.",
    "featuresPage.save.item3.title": "Arbre de sauvegardes",
    "featuresPage.save.item3.body": "Conservez l'historique de votre travail sous forme d'arbre ramifié, sans limite du nombre d'enregistrements.",
    "featuresPage.save.item4.title": "Partager votre œuvre (.niashare)",
    "featuresPage.save.item4.body": "Un format de fichier de partage qui embarque aussi les éléments et polices utilisés, pour s'ouvrir tel quel sur un autre appareil.",
    "featuresPage.save.item5.title": "Transférer votre configuration (.niatra)",
    "featuresPage.save.item5.body": "Regroupez uniquement les éléments que vous choisissez — réglages, pinceaux, trames, tampons, préréglages de remplissage automatique, thèmes — pour les transférer vers un autre appareil."
  },
  "es": {
    "featuresPage.nav.save": "Guardar y compartir",
    "featuresPage.save.title": "Save & Share｜Gestión de datos",
    "featuresPage.save.lead": "Protege tu obra, hazla crecer y llévala a otro dispositivo: un sistema de guardado flexible.",
    "featuresPage.save.item1.title": "Guardado automático",
    "featuresPage.save.item1.body": "Un guardado exclusivo para recuperarte de un cierre inesperado de la app, retomando justo desde el último momento.",
    "featuresPage.save.item2.title": "Ranuras de guardado",
    "featuresPage.save.item2.body": "Guarda en un número fijo de ranuras y recupéralas cuando quieras.",
    "featuresPage.save.item3.title": "Árbol de guardado",
    "featuresPage.save.item3.body": "Conserva el historial de tu trabajo como un árbol ramificado, sin límite en el número de guardados.",
    "featuresPage.save.item4.title": "Comparte tu obra (.niashare)",
    "featuresPage.save.item4.body": "Un formato de archivo para compartir que incluye también los materiales y fuentes usados, así se abre tal cual en otro dispositivo.",
    "featuresPage.save.item5.title": "Traslada tu configuración (.niatra)",
    "featuresPage.save.item5.body": "Agrupa solo los elementos que elijas: ajustes, pinceles, tramas, sellos, preajustes de relleno automático, temas, y llévalos a otro dispositivo."
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
