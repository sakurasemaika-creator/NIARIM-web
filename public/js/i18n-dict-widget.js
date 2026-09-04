/**
 * NIARIM公式サイト Features「ホーム画面ウィジェット（Widget）」セクション 翻訳辞書
 *
 * アプリ本体(dev_branch)の lib/screens/settings/widget_settings_screen.dart
 * ・lib/screens/settings/widget_artwork_picker_screen.dart
 * ・lib/services/home_widget_service.dart の実装に基づく。
 *
 * 節名・説明・色設定の選択肢は、アプリの lib/l10n/app_*.arb にある
 * widgetSection* / widgetColor* / widgetSettingsNote をそのまま転記している
 * （7言語ぶんアプリ側で翻訳済みのため、サイト側で訳し直さない）。
 * リード文・小見出しなどサイト固有の文だけを新規に用意している。
 *
 * 仕様上の注意（実装を読んで確認済み）:
 *  - 置けるウィジェットは3種類。設定画面は「1種類につき1節」の構成。
 *  - 起動画面ウィジェットに背景色の指定は無い（常にテーマに追従）。
 *    作品そのものを表示するため、色を選ぶ余地がない。
 *  - 作品をつくる／作品広場ウィジェットのみ、背景色を
 *    「テーマに合わせる」「色を指定する」の2択で選ぶ（実装はラジオボタン
 *    だが、利用者が読む文にUI部品の名前は書かない）。
 *  - 背景色は種類ごとに独立して保持される（3種を並べて置いたときに
 *    色で見分けられるようにするため）。
 *  - ウィジェットの追加自体はホーム画面の長押しから行う（アプリからは
 *    追加できない）。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    ja: {
      "featuresPage.nav.widget": "ウィジェット",
      "featuresPage.widget.title": "Widget｜ホーム画面ウィジェット",
      "featuresPage.widget.lead":
        "自分の作品を、スマホのホーム画面に置いておけます。",
      "narrative.widget.1.heading":
        "ホーム画面が、自分の作品の置き場所になる。",
      "narrative.widget.1.body":
        "多くのアプリのウィジェットは、決まった見た目のものを置くだけです。NIARIMのウィジェットは、表示する作品もフレームも背景色も自分で決められます。自分の描いた1コマがホーム画面にあること自体が、続きを描く理由になります。",
      "narrative.widget.2.heading": "表示するフレームまで自分で選ぶ",
      "narrative.widget.2.body":
        "作品を選び、シーンを選び、その中の1フレームを選ぶ——という流れで表示内容を決めます。フレーム選択画面には実際に合成したプレビューが並ぶので、書き出さなくても仕上がりのまま選べます。",
      "narrative.widget.3.heading": "色は、種類ごとに自由に",
      "narrative.widget.3.body":
        "「作品をつくる」「作品広場」の2種類は、背景色をアプリのテーマに合わせるか、好きな色を自分で決めるかを選べます。色は種類ごとに独立しているので、3種を並べて置いても一目で見分けられます。",
      "featuresPage.widget.item1.title": "起動画面ウィジェット",
      "featuresPage.widget.item1.body":
        "選んだ作品のフレーム1枚を表示します。タップするとNIARIMが起動します。",
      "featuresPage.widget.item2.title": "作品をつくるウィジェット",
      "featuresPage.widget.item2.body":
        "タップすると「作品をつくる」画面が開きます。背景色はテーマ追従か、指定した色かを選べます。",
      "featuresPage.widget.item3.title": "作品広場ウィジェット",
      "featuresPage.widget.item3.body":
        "タップすると「作品広場」が開きます。背景色はテーマ追従か、指定した色かを選べます。",
      "featuresPage.widget.item4.title": "静止画で表示",
      "featuresPage.widget.item4.body":
        "ホーム画面ウィジェットは動画を再生できないため、選んだ作品の1コマを静止画として表示します。ウィジェットの追加自体はホーム画面の長押しから行ってください。",
      "fd.widgetLaunch": "起動画面",
      "fd.widgetCreate": "作品をつくる",
      "fd.widgetPlaza": "作品広場",
      "fd.widgetColorTheme": "テーマに合わせる",
      "fd.widgetColorCustom": "色を選ぶ",
      "fd.widgetFrameLabel": "3枚目のフレーム",
    },
    en: {
      "featuresPage.nav.widget": "Widgets",
      "featuresPage.widget.title": "Widget｜Home screen widgets",
      "featuresPage.widget.lead":
        "Keep your own work on your phone's home screen.",
      "narrative.widget.1.heading":
        "Your home screen becomes a place for your own work.",
      "narrative.widget.1.body":
        "Most app widgets just sit there looking the way the app decided. With NIARIM you choose the work, the frame and the background colour yourself. Having a frame you drew on your home screen is itself a reason to go back and draw the next one.",
      "narrative.widget.2.heading": "Choose right down to the frame",
      "narrative.widget.2.body":
        "Pick a work, pick a scene, then pick a single frame inside it. The frame picker shows fully composited previews, so you can choose the finished look without exporting anything first.",
      "narrative.widget.3.heading": "Colour each one however you like",
      "narrative.widget.3.body":
        'For the "Create" and "Work Plaza" widgets the background can either follow the app theme or use any colour you choose. Colours are kept separately per widget, so all three can sit side by side and still be told apart at a glance.',
      "featuresPage.widget.item1.title": "Launch screen widget",
      "featuresPage.widget.item1.body":
        "Shows one frame from the work you pick. Tapping it opens NIARIM.",
      "featuresPage.widget.item2.title": "Create widget",
      "featuresPage.widget.item2.body":
        'Tapping it opens the "Create" screen. The background either follows the theme or uses a colour you choose.',
      "featuresPage.widget.item3.title": "Work Plaza widget",
      "featuresPage.widget.item3.body":
        "Tapping it opens the Work Plaza. The background either follows the theme or uses a colour you choose.",
      "featuresPage.widget.item4.title": "Shown as a still image",
      "featuresPage.widget.item4.body":
        "Home screen widgets cannot play video, so a single frame of the chosen work is shown as a still image. Adding the widget itself is done by long-pressing your home screen.",
      "fd.widgetLaunch": "Launch",
      "fd.widgetCreate": "Create",
      "fd.widgetPlaza": "Work Plaza",
      "fd.widgetColorTheme": "Follow the app theme",
      "fd.widgetColorCustom": "Pick a colour",
      "fd.widgetFrameLabel": "Frame 3",
    },
    "zh-Hans": {
      "featuresPage.nav.widget": "小组件",
      "featuresPage.widget.title": "Widget｜主屏幕小组件",
      "featuresPage.widget.lead": "把自己的作品放在手机主屏幕上。",
      "narrative.widget.1.heading": "让主屏幕成为自己作品的展示位。",
      "narrative.widget.1.body":
        "多数应用的小组件只能按既定样式摆放。NIARIM的小组件，显示哪个作品、哪一帧、什么背景色都由你决定。主屏幕上有自己画的一帧，本身就是继续画下去的理由。",
      "narrative.widget.2.heading": "连显示哪一帧都能自己选",
      "narrative.widget.2.body":
        "先选作品，再选场景，然后选其中的一帧。帧选择界面会排列实际合成后的预览，无需导出即可按成品效果挑选。",
      "narrative.widget.3.heading": "颜色按种类自由设定",
      "narrative.widget.3.body":
        "「创作」与「作品广场」两种小组件，背景色可以跟随应用主题，也可以自由指定喜欢的颜色。颜色按种类独立保存，因此三种并排摆放也能一眼分辨。",
      "featuresPage.widget.item1.title": "启动页小组件",
      "featuresPage.widget.item1.body":
        "显示所选作品的一帧画面。点按即可打开 NIARIM。",
      "featuresPage.widget.item2.title": "创作小组件",
      "featuresPage.widget.item2.body":
        "点按即可打开「创作」界面。背景色可跟随主题或使用指定颜色。",
      "featuresPage.widget.item3.title": "作品广场小组件",
      "featuresPage.widget.item3.body":
        "点按即可打开「作品广场」。背景色可跟随主题或使用指定颜色。",
      "featuresPage.widget.item4.title": "以静止图像显示",
      "featuresPage.widget.item4.body":
        "主屏幕小组件无法播放视频，因此以静止图像显示所选作品的一帧。添加小组件本身请长按主屏幕进行。",
      "fd.widgetLaunch": "启动页",
      "fd.widgetCreate": "创作",
      "fd.widgetPlaza": "作品广场",
      "fd.widgetColorTheme": "跟随应用主题",
      "fd.widgetColorCustom": "选择颜色",
      "fd.widgetFrameLabel": "第3帧",
    },
    "zh-Hant": {
      "featuresPage.nav.widget": "小工具",
      "featuresPage.widget.title": "Widget｜主畫面小工具",
      "featuresPage.widget.lead": "把自己的作品放在手機主畫面上。",
      "narrative.widget.1.heading": "讓主畫面成為自己作品的展示位。",
      "narrative.widget.1.body":
        "多數應用程式的小工具只能依既定樣式擺放。NIARIM的小工具，顯示哪個作品、哪一格、什麼背景色都由你決定。主畫面上有自己畫的一格，本身就是繼續畫下去的理由。",
      "narrative.widget.2.heading": "連顯示哪一格都能自己選",
      "narrative.widget.2.body":
        "先選作品，再選場景，然後選其中的一格。選格畫面會排列實際合成後的預覽，不必先匯出就能依成品效果挑選。",
      "narrative.widget.3.heading": "顏色依種類自由設定",
      "narrative.widget.3.body":
        "「創作」與「作品廣場」兩種小工具，背景色可以跟隨應用程式主題，也可以自由指定喜歡的顏色。顏色依種類獨立保存，因此三種並排擺放也能一眼分辨。",
      "featuresPage.widget.item1.title": "啟動頁小工具",
      "featuresPage.widget.item1.body":
        "顯示所選作品的一格畫面。點按即可開啟 NIARIM。",
      "featuresPage.widget.item2.title": "創作小工具",
      "featuresPage.widget.item2.body":
        "點按即可開啟「創作」畫面。背景色可跟隨主題或使用指定顏色。",
      "featuresPage.widget.item3.title": "作品廣場小工具",
      "featuresPage.widget.item3.body":
        "點按即可開啟「作品廣場」。背景色可跟隨主題或使用指定顏色。",
      "featuresPage.widget.item4.title": "以靜止影像顯示",
      "featuresPage.widget.item4.body":
        "主畫面小工具無法播放影片，因此以靜止影像顯示所選作品的一格畫面。新增小工具本身請長按主畫面進行。",
      "fd.widgetLaunch": "啟動頁",
      "fd.widgetCreate": "創作",
      "fd.widgetPlaza": "作品廣場",
      "fd.widgetColorTheme": "跟隨應用程式主題",
      "fd.widgetColorCustom": "選擇顏色",
      "fd.widgetFrameLabel": "第3格",
    },
    ko: {
      "featuresPage.nav.widget": "위젯",
      "featuresPage.widget.title": "Widget｜홈 화면 위젯",
      "featuresPage.widget.lead":
        "자신의 작품을 스마트폰 홈 화면에 둘 수 있습니다.",
      "narrative.widget.1.heading": "홈 화면이 내 작품을 두는 자리가 됩니다.",
      "narrative.widget.1.body":
        "많은 앱의 위젯은 정해진 모습으로 놓을 수 있을 뿐입니다. NIARIM의 위젯은 어떤 작품을, 어떤 컷을, 어떤 배경색으로 보여줄지 직접 정합니다. 내가 그린 한 컷이 홈 화면에 있다는 것 자체가 다음 컷을 그릴 이유가 됩니다.",
      "narrative.widget.2.heading": "표시할 컷까지 직접 선택",
      "narrative.widget.2.body":
        "작품을 고르고, 장면을 고르고, 그 안의 한 컷을 고르는 흐름으로 표시할 내용을 정합니다. 컷 선택 화면에는 실제로 합성한 미리보기가 나열되므로, 내보내지 않아도 완성된 모습 그대로 고를 수 있습니다.",
      "narrative.widget.3.heading": "색은 종류별로 자유롭게",
      "narrative.widget.3.body":
        "「작품 만들기」와 「작품 광장」 두 종류는 배경색을 앱 테마에 맞추거나 원하는 색을 직접 정할 수 있습니다. 색은 종류별로 따로 저장되므로 세 가지를 나란히 두어도 한눈에 구별됩니다.",
      "featuresPage.widget.item1.title": "시작 화면 위젯",
      "featuresPage.widget.item1.body":
        "선택한 작품의 한 컷을 표시합니다. 누르면 NIARIM이 실행됩니다.",
      "featuresPage.widget.item2.title": "작품 만들기 위젯",
      "featuresPage.widget.item2.body":
        "누르면 「작품 만들기」 화면이 열립니다. 배경색은 테마 연동 또는 지정한 색 중에서 선택합니다.",
      "featuresPage.widget.item3.title": "작품 광장 위젯",
      "featuresPage.widget.item3.body":
        "누르면 「작품 광장」이 열립니다. 배경색은 테마 연동 또는 지정한 색 중에서 선택합니다.",
      "featuresPage.widget.item4.title": "정지 화상으로 표시",
      "featuresPage.widget.item4.body":
        "홈 화면 위젯은 동영상을 재생할 수 없으므로, 선택한 작품의 한 컷을 정지 화상으로 표시합니다. 위젯 추가 자체는 홈 화면을 길게 눌러 진행해 주세요.",
      "fd.widgetLaunch": "시작 화면",
      "fd.widgetCreate": "작품 만들기",
      "fd.widgetPlaza": "작품 광장",
      "fd.widgetColorTheme": "앱 테마에 맞추기",
      "fd.widgetColorCustom": "색 선택",
      "fd.widgetFrameLabel": "3번째 컷",
    },
    fr: {
      "featuresPage.nav.widget": "Widgets",
      "featuresPage.widget.title": "Widget｜Widgets d'écran d'accueil",
      "featuresPage.widget.lead":
        "Gardez vos propres œuvres sur l'écran d'accueil de votre téléphone.",
      "narrative.widget.1.heading":
        "Votre écran d'accueil devient la place de vos œuvres.",
      "narrative.widget.1.body":
        "La plupart des widgets se contentent d'afficher ce que l'application a décidé. Avec NIARIM, vous choisissez l'œuvre, l'image et la couleur de fond. Avoir sous les yeux une image que vous avez dessinée est déjà une raison de dessiner la suivante.",
      "narrative.widget.2.heading": "Choisissez jusqu'à l'image près",
      "narrative.widget.2.body":
        "Choisissez une œuvre, puis une scène, puis une seule image à l'intérieur. Le sélecteur affiche des aperçus réellement composités : vous choisissez le rendu final sans rien exporter au préalable.",
      "narrative.widget.3.heading": "Une couleur par type, à votre goût",
      "narrative.widget.3.body":
        "Pour les widgets « Créer » et « Place des œuvres », le fond suit le thème de l'application ou prend la couleur de votre choix. Les couleurs sont mémorisées séparément pour chaque type : les trois peuvent voisiner et rester reconnaissables d'un coup d'œil.",
      "featuresPage.widget.item1.title": "Widget d'écran de démarrage",
      "featuresPage.widget.item1.body":
        "Affiche une image de l'œuvre que vous choisissez. Un appui ouvre NIARIM.",
      "featuresPage.widget.item2.title": "Widget « Créer »",
      "featuresPage.widget.item2.body":
        "Un appui ouvre l'écran « Créer ». Le fond suit le thème ou utilise la couleur que vous choisissez.",
      "featuresPage.widget.item3.title": "Widget « Place des œuvres »",
      "featuresPage.widget.item3.body":
        "Un appui ouvre la Place des œuvres. Le fond suit le thème ou utilise la couleur que vous choisissez.",
      "featuresPage.widget.item4.title": "Affiché en image fixe",
      "featuresPage.widget.item4.body":
        "Les widgets de l'écran d'accueil ne peuvent pas lire de vidéo : une image de l'œuvre choisie est affichée en fixe. L'ajout du widget lui-même se fait par un appui long sur l'écran d'accueil.",
      "fd.widgetLaunch": "Démarrage",
      "fd.widgetCreate": "Créer",
      "fd.widgetPlaza": "Place des œuvres",
      "fd.widgetColorTheme": "Suivre le thème",
      "fd.widgetColorCustom": "Choisir une couleur",
      "fd.widgetFrameLabel": "Image 3",
    },
    es: {
      "featuresPage.nav.widget": "Widgets",
      "featuresPage.widget.title": "Widget｜Widgets de pantalla de inicio",
      "featuresPage.widget.lead":
        "Ten tus propias obras en la pantalla de inicio del móvil.",
      "narrative.widget.1.heading":
        "Tu pantalla de inicio se convierte en el sitio de tus obras.",
      "narrative.widget.1.body":
        "La mayoría de los widgets solo se colocan con el aspecto que decidió la aplicación. En NIARIM eliges tú la obra, el fotograma y el color de fondo. Tener a la vista un fotograma que dibujaste es, por sí solo, un motivo para dibujar el siguiente.",
      "narrative.widget.2.heading": "Eliges hasta el fotograma",
      "narrative.widget.2.body":
        "Eliges una obra, luego una escena y después un solo fotograma dentro de ella. El selector muestra vistas previas realmente compuestas, así que eliges el resultado final sin exportar nada antes.",
      "narrative.widget.3.heading": "Un color por tipo, a tu gusto",
      "narrative.widget.3.body":
        "En los widgets «Crear» y «Plaza de Obras» el fondo puede seguir el tema de la aplicación o tomar el color que prefieras. Los colores se guardan por separado para cada tipo, así que los tres pueden convivir y distinguirse de un vistazo.",
      "featuresPage.widget.item1.title": "Widget de arranque",
      "featuresPage.widget.item1.body":
        "Muestra un fotograma de la obra que elijas. Al tocarlo se abre NIARIM.",
      "featuresPage.widget.item2.title": "Widget «Crear»",
      "featuresPage.widget.item2.body":
        "Al tocarlo se abre la pantalla «Crear». El fondo sigue el tema o usa el color que elijas.",
      "featuresPage.widget.item3.title": "Widget «Plaza de Obras»",
      "featuresPage.widget.item3.body":
        "Al tocarlo se abre la Plaza de Obras. El fondo sigue el tema o usa el color que elijas.",
      "featuresPage.widget.item4.title": "Se muestra como imagen fija",
      "featuresPage.widget.item4.body":
        "Los widgets de la pantalla de inicio no pueden reproducir vídeo, así que se muestra un fotograma de la obra como imagen fija. El widget se añade manteniendo pulsada la pantalla de inicio.",
      "fd.widgetLaunch": "Arranque",
      "fd.widgetCreate": "Crear",
      "fd.widgetPlaza": "Plaza de Obras",
      "fd.widgetColorTheme": "Seguir el tema",
      "fd.widgetColorCustom": "Elegir un color",
      "fd.widgetFrameLabel": "Fotograma 3",
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
