/**
 * NIARIM公式サイト 機能紹介ページの図解（feature-diagram）内テキスト翻訳辞書
 *
 * レイヤー名・書き出しプリセット名などは、アプリ本体の実際の画面構成を
 * 再現した図解の中で使う文言。元々ハードコードされ日本語のままだったため
 * 追加した。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    "ja": {
      "fd.layer4": "レイヤー4（自動塗り・下書き）",
      "fd.layer3": "レイヤー3（自動塗り）",
      "fd.layer2": "レイヤー2（共通レイヤー）",
      "fd.layer1": "レイヤー1",
      "fd.prevFrame": "前フレーム",
      "fd.nextFrame": "次フレーム",
      "fd.audioClip": "音声クリップ",
      "fd.volume": "音量",
      "fd.presetStandard": "標準",
      "fd.presetHighQuality": "高画質",
      "fd.presetCustom": "カスタム",
      "fd.formatMp4Subtitle": "汎用動画形式",
      "fd.formatGifSubtitle": "アニメーションGIF",
      "fd.formatWebm": "透過WebM",
      "fd.formatWebmSubtitle": "透明背景動画",
      "fd.exportStart": "書き出し開始",
      "fd.saveSlotsLabel": "セーブスロット（最大10）",
      "fd.saveTreeLabel": "セーブツリー（保存数の制限なし）"
    },
    "en": {
      "fd.layer4": "Layer 4 (Auto-fill, sketch)",
      "fd.layer3": "Layer 3 (Auto-fill)",
      "fd.layer2": "Layer 2 (Common layer)",
      "fd.layer1": "Layer 1",
      "fd.prevFrame": "Previous frame",
      "fd.nextFrame": "Next frame",
      "fd.audioClip": "Audio clip",
      "fd.volume": "Volume",
      "fd.presetStandard": "Standard",
      "fd.presetHighQuality": "High quality",
      "fd.presetCustom": "Custom",
      "fd.formatMp4Subtitle": "General-purpose video format",
      "fd.formatGifSubtitle": "Animated GIF",
      "fd.formatWebm": "Transparent WebM",
      "fd.formatWebmSubtitle": "Transparent-background video",
      "fd.exportStart": "Start export",
      "fd.saveSlotsLabel": "Save slots (up to 10)",
      "fd.saveTreeLabel": "Save tree (unlimited saves)"
    },
    "zh-Hans": {
      "fd.layer4": "图层4（自动上色・草稿）",
      "fd.layer3": "图层3（自动上色）",
      "fd.layer2": "图层2（公共图层）",
      "fd.layer1": "图层1",
      "fd.prevFrame": "前一帧",
      "fd.nextFrame": "后一帧",
      "fd.audioClip": "音频片段",
      "fd.volume": "音量",
      "fd.presetStandard": "标准",
      "fd.presetHighQuality": "高画质",
      "fd.presetCustom": "自定义",
      "fd.formatMp4Subtitle": "通用视频格式",
      "fd.formatGifSubtitle": "动画GIF",
      "fd.formatWebm": "透明WebM",
      "fd.formatWebmSubtitle": "透明背景视频",
      "fd.exportStart": "开始导出",
      "fd.saveSlotsLabel": "存档栏位（最多10个）",
      "fd.saveTreeLabel": "存档树（保存次数不限）"
    },
    "zh-Hant": {
      "fd.layer4": "圖層4（自動上色・草稿）",
      "fd.layer3": "圖層3（自動上色）",
      "fd.layer2": "圖層2（共用圖層）",
      "fd.layer1": "圖層1",
      "fd.prevFrame": "前一影格",
      "fd.nextFrame": "後一影格",
      "fd.audioClip": "音訊片段",
      "fd.volume": "音量",
      "fd.presetStandard": "標準",
      "fd.presetHighQuality": "高畫質",
      "fd.presetCustom": "自訂",
      "fd.formatMp4Subtitle": "通用影片格式",
      "fd.formatGifSubtitle": "動畫GIF",
      "fd.formatWebm": "透明WebM",
      "fd.formatWebmSubtitle": "透明背景影片",
      "fd.exportStart": "開始匯出",
      "fd.saveSlotsLabel": "存檔欄位（最多10個）",
      "fd.saveTreeLabel": "存檔樹（保存次數不限）"
    },
    "ko": {
      "fd.layer4": "레이어4(자동 채색・밑그림)",
      "fd.layer3": "레이어3(자동 채색)",
      "fd.layer2": "레이어2(공통 레이어)",
      "fd.layer1": "레이어1",
      "fd.prevFrame": "이전 프레임",
      "fd.nextFrame": "다음 프레임",
      "fd.audioClip": "오디오 클립",
      "fd.volume": "음량",
      "fd.presetStandard": "표준",
      "fd.presetHighQuality": "고화질",
      "fd.presetCustom": "커스텀",
      "fd.formatMp4Subtitle": "범용 동영상 형식",
      "fd.formatGifSubtitle": "애니메이션 GIF",
      "fd.formatWebm": "투명 WebM",
      "fd.formatWebmSubtitle": "투명 배경 동영상",
      "fd.exportStart": "내보내기 시작",
      "fd.saveSlotsLabel": "세이브 슬롯(최대 10개)",
      "fd.saveTreeLabel": "세이브 트리(저장 횟수 제한 없음)"
    },
    "fr": {
      "fd.layer4": "Calque 4 (remplissage auto, ébauche)",
      "fd.layer3": "Calque 3 (remplissage auto)",
      "fd.layer2": "Calque 2 (calque commun)",
      "fd.layer1": "Calque 1",
      "fd.prevFrame": "Image précédente",
      "fd.nextFrame": "Image suivante",
      "fd.audioClip": "Clip audio",
      "fd.volume": "Volume",
      "fd.presetStandard": "Standard",
      "fd.presetHighQuality": "Haute qualité",
      "fd.presetCustom": "Personnalisé",
      "fd.formatMp4Subtitle": "Format vidéo courant",
      "fd.formatGifSubtitle": "GIF animé",
      "fd.formatWebm": "WebM transparent",
      "fd.formatWebmSubtitle": "Vidéo à fond transparent",
      "fd.exportStart": "Démarrer l'export",
      "fd.saveSlotsLabel": "Emplacements de sauvegarde (jusqu'à 10)",
      "fd.saveTreeLabel": "Arbre de sauvegardes (illimité)"
    },
    "es": {
      "fd.layer4": "Capa 4 (relleno automático, boceto)",
      "fd.layer3": "Capa 3 (relleno automático)",
      "fd.layer2": "Capa 2 (capa común)",
      "fd.layer1": "Capa 1",
      "fd.prevFrame": "Fotograma anterior",
      "fd.nextFrame": "Fotograma siguiente",
      "fd.audioClip": "Clip de audio",
      "fd.volume": "Volumen",
      "fd.presetStandard": "Estándar",
      "fd.presetHighQuality": "Alta calidad",
      "fd.presetCustom": "Personalizado",
      "fd.formatMp4Subtitle": "Formato de video habitual",
      "fd.formatGifSubtitle": "GIF animado",
      "fd.formatWebm": "WebM transparente",
      "fd.formatWebmSubtitle": "Video con fondo transparente",
      "fd.exportStart": "Iniciar exportación",
      "fd.saveSlotsLabel": "Ranuras de guardado (hasta 10)",
      "fd.saveTreeLabel": "Árbol de guardado (ilimitado)"
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
