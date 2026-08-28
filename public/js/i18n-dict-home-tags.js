/**
 * NIARIM公式サイト トップページ「主要機能」セクションのタグチップ翻訳辞書
 *
 * 元々 index.html に直接ハードコードされていたため、日本語以外の言語に
 * 切り替えても翻訳されない不具合があった。featuresPage.* で既に使っている
 * 訳語と表記を揃えている。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    "ja": {
      "home.tag.gpen": "Gペン",
      "home.tag.airbrush": "エアブラシ",
      "home.tag.opacity": "不透明度",
      "home.tag.zoomPan": "ズーム・パン",
      "home.tag.frame": "フレーム",
      "home.tag.timeline": "タイムライン",
      "home.tag.preview": "プレビュー",
      "home.tag.tolerance": "許容値調整",
      "home.tag.fill": "塗りつぶし",
      "home.tag.layer": "レイヤー",
      "home.tag.onionSkin": "オニオンスキン",
      "home.tag.tone": "トーン",
      "home.tag.stampRuler": "スタンプ・定規",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "縦横比自由設定",
      "home.tag.videoExport": "動画書き出し"
    },
    "en": {
      "home.tag.gpen": "G-Pen",
      "home.tag.airbrush": "Airbrush",
      "home.tag.opacity": "Opacity",
      "home.tag.zoomPan": "Zoom & Pan",
      "home.tag.frame": "Frames",
      "home.tag.timeline": "Timeline",
      "home.tag.preview": "Preview",
      "home.tag.tolerance": "Adjustable tolerance",
      "home.tag.fill": "Fill",
      "home.tag.layer": "Layers",
      "home.tag.onionSkin": "Onion skin",
      "home.tag.tone": "Tone",
      "home.tag.stampRuler": "Stamps & ruler",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "Free aspect ratio",
      "home.tag.videoExport": "Video export"
    },
    "zh-Hans": {
      "home.tag.gpen": "G 笔",
      "home.tag.airbrush": "喷枪",
      "home.tag.opacity": "不透明度",
      "home.tag.zoomPan": "缩放・平移",
      "home.tag.frame": "帧画面",
      "home.tag.timeline": "时间轴",
      "home.tag.preview": "预览",
      "home.tag.tolerance": "容差调整",
      "home.tag.fill": "填充",
      "home.tag.layer": "图层",
      "home.tag.onionSkin": "洋葱皮（Onion Skin）",
      "home.tag.tone": "网点纸（Tone）",
      "home.tag.stampRuler": "图章・标尺",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "自由设定画面比例",
      "home.tag.videoExport": "视频导出"
    },
    "zh-Hant": {
      "home.tag.gpen": "G 筆",
      "home.tag.airbrush": "噴槍",
      "home.tag.opacity": "不透明度",
      "home.tag.zoomPan": "縮放・平移",
      "home.tag.frame": "影格",
      "home.tag.timeline": "時間軸",
      "home.tag.preview": "預覽",
      "home.tag.tolerance": "容許值調整",
      "home.tag.fill": "填色",
      "home.tag.layer": "圖層",
      "home.tag.onionSkin": "洋蔥皮（Onion Skin）",
      "home.tag.tone": "網點紙（Tone）",
      "home.tag.stampRuler": "圖章・尺規",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "自由設定畫面比例",
      "home.tag.videoExport": "影片匯出"
    },
    "ko": {
      "home.tag.gpen": "G펜",
      "home.tag.airbrush": "에어브러시",
      "home.tag.opacity": "불투명도",
      "home.tag.zoomPan": "확대・이동",
      "home.tag.frame": "프레임",
      "home.tag.timeline": "타임라인",
      "home.tag.preview": "미리보기",
      "home.tag.tolerance": "허용값 조절",
      "home.tag.fill": "채우기",
      "home.tag.layer": "레이어",
      "home.tag.onionSkin": "어니언 스킨",
      "home.tag.tone": "톤(스크린톤)",
      "home.tag.stampRuler": "스탬프・자",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "화면 비율 자유 설정",
      "home.tag.videoExport": "영상 내보내기"
    },
    "fr": {
      "home.tag.gpen": "Stylo G",
      "home.tag.airbrush": "Aérographe",
      "home.tag.opacity": "Opacité",
      "home.tag.zoomPan": "Zoom et panoramique",
      "home.tag.frame": "Images",
      "home.tag.timeline": "Timeline",
      "home.tag.preview": "Aperçu",
      "home.tag.tolerance": "Tolérance réglable",
      "home.tag.fill": "Remplissage",
      "home.tag.layer": "Calques",
      "home.tag.onionSkin": "Pelure d'oignon",
      "home.tag.tone": "Trames",
      "home.tag.stampRuler": "Tampons et règle",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "Format libre",
      "home.tag.videoExport": "Export vidéo"
    },
    "es": {
      "home.tag.gpen": "Lápiz G",
      "home.tag.airbrush": "Aerógrafo",
      "home.tag.opacity": "Opacidad",
      "home.tag.zoomPan": "Zoom y desplazamiento",
      "home.tag.frame": "Cuadros",
      "home.tag.timeline": "Línea de tiempo",
      "home.tag.preview": "Vista previa",
      "home.tag.tolerance": "Tolerancia ajustable",
      "home.tag.fill": "Relleno",
      "home.tag.layer": "Capas",
      "home.tag.onionSkin": "Piel de cebolla",
      "home.tag.tone": "Tramas",
      "home.tag.stampRuler": "Sellos y regla",
      "home.tag.fullHD": "Full HD",
      "home.tag.aspectRatio": "Relación de aspecto libre",
      "home.tag.videoExport": "Exportación de video"
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
