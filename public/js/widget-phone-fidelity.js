(function () {
  "use strict";

  var SPRITE = "/assets/icons/ui/sprite.svg#";
  var COPY = {
    ja: { title:"ウィジェット設定", desc:"ホーム画面に置く3種類のウィジェットを設定できます。", note:"ウィジェットの追加は、端末のホーム画面を長押しして行います。", artwork:"起動画面", artworkDesc:"好きな作品のフレームを1枚表示します。タップするとNIARIMを開きます。", shownArtwork:"表示する作品", pickArtwork:"作品を選ぶ", create:"作品をつくる", createDesc:"新規プロジェクト作成へすぐ移動できるショートカットです。", plaza:"作品広場", plazaDesc:"作品広場へすぐ移動できるショートカットです。", followTheme:"テーマに合わせる", customColor:"色を選ぶ" },
    en: { title:"Widget settings", desc:"Configure the three widgets you can place on your Home Screen.", note:"Add widgets by touching and holding your device Home Screen.", artwork:"Launch screen", artworkDesc:"Shows one frame from a work you choose. Tap it to open NIARIM.", shownArtwork:"Artwork to show", pickArtwork:"Choose artwork", create:"Create a work", createDesc:"A shortcut straight to creating a new project.", plaza:"Works Plaza", plazaDesc:"A shortcut straight to the Works Plaza.", followTheme:"Follow theme", customColor:"Choose colors" },
    "zh-Hans": { title:"小组件设置", desc:"设置可放在主屏幕上的三种小组件。", note:"请长按设备主屏幕来添加小组件。", artwork:"启动画面", artworkDesc:"显示你选择的作品中的一帧，点击即可打开 NIARIM。", shownArtwork:"显示的作品", pickArtwork:"选择作品", create:"创作作品", createDesc:"直接进入新建项目的快捷方式。", plaza:"作品广场", plazaDesc:"直接进入作品广场的快捷方式。", followTheme:"跟随主题", customColor:"选择颜色" },
    "zh-Hant": { title:"小工具設定", desc:"設定可放在主畫面上的三種小工具。", note:"請長按裝置主畫面來新增小工具。", artwork:"啟動畫面", artworkDesc:"顯示你選擇作品中的一個影格，點一下即可開啟 NIARIM。", shownArtwork:"顯示的作品", pickArtwork:"選擇作品", create:"建立作品", createDesc:"直接進入新增專案的捷徑。", plaza:"作品廣場", plazaDesc:"直接進入作品廣場的捷徑。", followTheme:"跟隨主題", customColor:"選擇顏色" },
    ko: { title:"위젯 설정", desc:"홈 화면에 놓을 수 있는 세 가지 위젯을 설정합니다.", note:"위젯 추가는 기기의 홈 화면을 길게 눌러 진행합니다.", artwork:"시작 화면", artworkDesc:"선택한 작품의 한 프레임을 표시하고 탭하면 NIARIM을 엽니다.", shownArtwork:"표시할 작품", pickArtwork:"작품 선택", create:"작품 만들기", createDesc:"새 프로젝트 만들기로 바로 이동하는 바로가기입니다.", plaza:"작품 광장", plazaDesc:"작품 광장으로 바로 이동하는 바로가기입니다.", followTheme:"테마에 맞추기", customColor:"색상 선택" },
    fr: { title:"Réglages des widgets", desc:"Configurez les trois widgets à placer sur l’écran d’accueil.", note:"Ajoutez un widget en maintenant le doigt sur l’écran d’accueil de l’appareil.", artwork:"Écran de lancement", artworkDesc:"Affiche une image d’une œuvre choisie. Touchez-la pour ouvrir NIARIM.", shownArtwork:"Œuvre affichée", pickArtwork:"Choisir une œuvre", create:"Créer une œuvre", createDesc:"Un raccourci vers la création d’un nouveau projet.", plaza:"Place des œuvres", plazaDesc:"Un raccourci vers la Place des œuvres.", followTheme:"Suivre le thème", customColor:"Choisir les couleurs" },
    es: { title:"Ajustes de widgets", desc:"Configura los tres widgets que puedes colocar en la pantalla de inicio.", note:"Añade widgets manteniendo pulsada la pantalla de inicio del dispositivo.", artwork:"Pantalla de inicio", artworkDesc:"Muestra un fotograma de una obra elegida. Tócalo para abrir NIARIM.", shownArtwork:"Obra mostrada", pickArtwork:"Elegir obra", create:"Crear una obra", createDesc:"Acceso directo a la creación de un proyecto nuevo.", plaza:"Plaza de obras", plazaDesc:"Acceso directo a la Plaza de obras.", followTheme:"Seguir el tema", customColor:"Elegir colores" },
  };

  function icon(name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="' + SPRITE + name + '"></use></svg>';
  }
  function radioRow(text, selected) {
    return '<div class="fd-widget-radio-row"><span class="fd-widget-radio' + (selected ? " is-selected" : "") + '"></span><span>' + text + "</span></div>";
  }
  function shortcutSection(title, desc, c, iconName) {
    return '<section class="fd-widget-section"><strong class="fd-widget-section-title">' + title + '</strong><p class="fd-widget-section-note">' + desc + '</p><div class="fd-widget-shortcut-card"><span class="fd-widget-shortcut-icon">' + icon(iconName) + '</span><div class="fd-widget-shortcut-copy">' + radioRow(c.followTheme, true) + radioRow(c.customColor, false) + "</div></div></section>";
  }
  function markup(c) {
    return '<div class="feature-diagram fd-route-screen fd-widget-settings-screen" data-mock-screen="widget-settings" aria-hidden="true">' +
      '<div class="fd-appbar"><span class="fd-icon-btn">' + icon("ic-arrow_back") + '</span><strong>' + c.title + '</strong></div>' +
      '<div class="fd-widget-scroll"><p class="fd-widget-intro">' + c.desc + '</p><p class="fd-widget-note">' + c.note + '</p>' +
      '<section class="fd-widget-section"><strong class="fd-widget-section-title">' + c.artwork + '</strong><p class="fd-widget-section-note">' + c.artworkDesc + '</p><small class="fd-widget-sublabel">' + c.shownArtwork + '</small><div class="fd-widget-artwork-tile"><span class="fd-widget-artwork-thumb">' + icon("ic-library_add") + '</span><strong>' + c.pickArtwork + '</strong><span class="fd-spacer"></span><span class="fd-widget-chevron" aria-hidden="true"></span></div></section>' +
      shortcutSection(c.create, c.createDesc, c, "ic-add") + shortcutSection(c.plaza, c.plazaDesc, c, "ic-movie_filter") + '</div></div>';
  }
  function render() {
    var section = document.getElementById("widget");
    if (!section) return;
    var old = section.querySelector(":scope > .feature-diagram");
    if (!old) return;
    var lang = document.documentElement.lang || "ja";
    var c = COPY[lang] || COPY.en;
    var wrap = document.createElement("div");
    wrap.innerHTML = markup(c);
    old.replaceWith(wrap.firstElementChild);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  document.addEventListener("niarim:langchange", render);
})();
