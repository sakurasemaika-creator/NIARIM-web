/**
 * NIARIM公式サイト Features「作業環境（Workspace）」セクション 翻訳辞書
 *
 * settings_service.dart（左手モード）・gesture_settings_screen.dart
 * （ジェスチャー割り当て、既定値：二本指タップ=undo／三本指タップ=redo／
 * 二本指スワイプ=フレーム移動／長押し=スポイト）・workspace_preset_service.dart
 * （ワークスペースプリセットの保存・切替）・app_theme_preset.dart（26テーマ、
 * 虹の7色ベースのプリセットを含む）の実装に基づく。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "featuresPage.nav.workspace": "作業環境",
    "featuresPage.workspace.title": "Workspace｜自分に合った制作環境へ",
    "featuresPage.workspace.lead": "利き手や操作スタイルに合わせて、UIそのものをカスタマイズできます。",
    "featuresPage.workspace.item1.title": "ワークスペース",
    "featuresPage.workspace.item1.body": "左手モードやPC・DeXモードなどの設定をまとめて名前を付けて保存でき、アニメ用・線画用・背景用など、用途ごとに切り替えられます。",
    "featuresPage.workspace.item2.title": "左手モード",
    "featuresPage.workspace.item2.body": "左利きの方でも操作しやすいよう、UIのレイアウトを反転できます。",
    "featuresPage.workspace.item3.title": "ジェスチャー設定",
    "featuresPage.workspace.item3.body": "二本指タップ・三本指タップ・二本指スワイプ・長押しなどに、元に戻す・やり直す・フレーム移動・スポイトといった操作を割り当てられます。",
    "featuresPage.workspace.item4.title": "テーマ・外観",
    "featuresPage.workspace.item4.body": "虹の7色をベースにしたプリセットなど、26種類のテーマから選んで見た目を自分好みにカスタマイズできます。",
    "fd.leftHandedMode": "左手モード",
    "fd.gestureTwoTap": "二本指タップ",
    "fd.gestureThreeTap": "三本指タップ",
    "fd.gestureTwoSwipe": "二本指スワイプ",
    "fd.gestureLongPress": "長押し",
    "fd.gestureUndo": "元に戻す",
    "fd.gestureRedo": "やり直す",
    "fd.gestureFrameMove": "フレーム移動",
    "fd.gestureEyedropper": "スポイト"
  },
  "en": {
    "featuresPage.nav.workspace": "Workspace",
    "featuresPage.workspace.title": "Workspace｜Make It Yours",
    "featuresPage.workspace.lead": "Customize the UI itself to match your dominant hand and your way of working.",
    "featuresPage.workspace.item1.title": "Workspaces",
    "featuresPage.workspace.item1.body": "Save settings like left-handed mode and PC/DeX mode together under a name, then switch between them for different purposes — animation, line art, backgrounds, and more.",
    "featuresPage.workspace.item2.title": "Left-handed mode",
    "featuresPage.workspace.item2.body": "Flip the UI layout so it's just as comfortable to use if you're left-handed.",
    "featuresPage.workspace.item3.title": "Gesture settings",
    "featuresPage.workspace.item3.body": "Assign actions like undo, redo, frame move, and eyedropper to gestures such as a two-finger tap, three-finger tap, two-finger swipe, or long press.",
    "featuresPage.workspace.item4.title": "Themes & appearance",
    "featuresPage.workspace.item4.body": "Choose from 26 themes, including presets based on the seven colors of the rainbow, to make the look your own.",
    "fd.leftHandedMode": "Left-handed mode",
    "fd.gestureTwoTap": "Two-finger tap",
    "fd.gestureThreeTap": "Three-finger tap",
    "fd.gestureTwoSwipe": "Two-finger swipe",
    "fd.gestureLongPress": "Long press",
    "fd.gestureUndo": "Undo",
    "fd.gestureRedo": "Redo",
    "fd.gestureFrameMove": "Move frame",
    "fd.gestureEyedropper": "Eyedropper"
  },
  "zh-Hans": {
    "featuresPage.nav.workspace": "工作环境",
    "featuresPage.workspace.title": "Workspace｜打造专属制作环境",
    "featuresPage.workspace.lead": "可根据惯用手与操作习惯，自定义整个界面。",
    "featuresPage.workspace.item1.title": "工作区",
    "featuresPage.workspace.item1.body": "可将左手模式、PC/DeX 模式等设置整合并命名保存，按动画用、线稿用、背景用等不同用途切换使用。",
    "featuresPage.workspace.item2.title": "左手模式",
    "featuresPage.workspace.item2.body": "可翻转界面布局，让惯用左手的用户也能顺手操作。",
    "featuresPage.workspace.item3.title": "手势设置",
    "featuresPage.workspace.item3.body": "可为双指点击、三指点击、双指滑动、长按等手势，分配撤销、重做、切换帧、吸管等操作。",
    "featuresPage.workspace.item4.title": "主题与外观",
    "featuresPage.workspace.item4.body": "可从包含彩虹七色预设在内的 26 种主题中选择，自定义喜欢的外观。",
    "fd.leftHandedMode": "左手模式",
    "fd.gestureTwoTap": "双指点击",
    "fd.gestureThreeTap": "三指点击",
    "fd.gestureTwoSwipe": "双指滑动",
    "fd.gestureLongPress": "长按",
    "fd.gestureUndo": "撤销",
    "fd.gestureRedo": "重做",
    "fd.gestureFrameMove": "切换帧",
    "fd.gestureEyedropper": "吸管"
  },
  "zh-Hant": {
    "featuresPage.nav.workspace": "工作環境",
    "featuresPage.workspace.title": "Workspace｜打造專屬製作環境",
    "featuresPage.workspace.lead": "可依慣用手與操作習慣，自訂整個介面。",
    "featuresPage.workspace.item1.title": "工作區",
    "featuresPage.workspace.item1.body": "可將左手模式、PC/DeX 模式等設定整合並命名保存，依動畫用、線稿用、背景用等不同用途切換使用。",
    "featuresPage.workspace.item2.title": "左手模式",
    "featuresPage.workspace.item2.body": "可翻轉介面配置，讓慣用左手的使用者也能順手操作。",
    "featuresPage.workspace.item3.title": "手勢設定",
    "featuresPage.workspace.item3.body": "可為雙指點擊、三指點擊、雙指滑動、長按等手勢，指定復原、重做、切換影格、吸管等操作。",
    "featuresPage.workspace.item4.title": "主題與外觀",
    "featuresPage.workspace.item4.body": "可從包含彩虹七色預設在內的 26 種主題中選擇，自訂喜歡的外觀。",
    "fd.leftHandedMode": "左手模式",
    "fd.gestureTwoTap": "雙指點擊",
    "fd.gestureThreeTap": "三指點擊",
    "fd.gestureTwoSwipe": "雙指滑動",
    "fd.gestureLongPress": "長按",
    "fd.gestureUndo": "復原",
    "fd.gestureRedo": "重做",
    "fd.gestureFrameMove": "切換影格",
    "fd.gestureEyedropper": "吸管"
  },
  "ko": {
    "featuresPage.nav.workspace": "작업 환경",
    "featuresPage.workspace.title": "Workspace｜나에게 맞는 제작 환경으로",
    "featuresPage.workspace.lead": "주로 쓰는 손과 조작 스타일에 맞춰 UI 자체를 커스터마이즈할 수 있습니다.",
    "featuresPage.workspace.item1.title": "워크스페이스",
    "featuresPage.workspace.item1.body": "왼손 모드나 PC・DeX 모드 등의 설정을 한데 모아 이름을 붙여 저장하고, 애니메이션용・선화용・배경용 등 용도별로 전환할 수 있습니다.",
    "featuresPage.workspace.item2.title": "왼손 모드",
    "featuresPage.workspace.item2.body": "왼손잡이도 편하게 조작할 수 있도록 UI 레이아웃을 반전할 수 있습니다.",
    "featuresPage.workspace.item3.title": "제스처 설정",
    "featuresPage.workspace.item3.body": "두 손가락 탭・세 손가락 탭・두 손가락 스와이프・길게 누르기 등에 실행 취소・다시 실행・프레임 이동・스포이드 같은 동작을 할당할 수 있습니다.",
    "featuresPage.workspace.item4.title": "테마・외관",
    "featuresPage.workspace.item4.body": "무지개 7색을 기반으로 한 프리셋 등 26가지 테마 중에서 골라 취향대로 꾸밀 수 있습니다.",
    "fd.leftHandedMode": "왼손 모드",
    "fd.gestureTwoTap": "두 손가락 탭",
    "fd.gestureThreeTap": "세 손가락 탭",
    "fd.gestureTwoSwipe": "두 손가락 스와이프",
    "fd.gestureLongPress": "길게 누르기",
    "fd.gestureUndo": "실행 취소",
    "fd.gestureRedo": "다시 실행",
    "fd.gestureFrameMove": "프레임 이동",
    "fd.gestureEyedropper": "스포이드"
  },
  "fr": {
    "featuresPage.nav.workspace": "Espace de travail",
    "featuresPage.workspace.title": "Workspace｜Un environnement à votre image",
    "featuresPage.workspace.lead": "Personnalisez l'interface elle-même selon votre main directrice et votre façon de travailler.",
    "featuresPage.workspace.item1.title": "Espaces de travail",
    "featuresPage.workspace.item1.body": "Enregistrez sous un nom des réglages comme le mode gaucher ou le mode PC/DeX, puis passez de l'un à l'autre selon l'usage : animation, trait, décor, etc.",
    "featuresPage.workspace.item2.title": "Mode gaucher",
    "featuresPage.workspace.item2.body": "Inversez la disposition de l'interface pour une utilisation tout aussi confortable si vous êtes gaucher.",
    "featuresPage.workspace.item3.title": "Réglages de gestes",
    "featuresPage.workspace.item3.body": "Associez des actions comme annuler, rétablir, changer d'image ou la pipette à des gestes tels que le tap à deux doigts, à trois doigts, le balayage à deux doigts ou l'appui long.",
    "featuresPage.workspace.item4.title": "Thèmes et apparence",
    "featuresPage.workspace.item4.body": "Choisissez parmi 26 thèmes, dont des préréglages inspirés des sept couleurs de l'arc-en-ciel, pour un rendu qui vous ressemble.",
    "fd.leftHandedMode": "Mode gaucher",
    "fd.gestureTwoTap": "Tap à deux doigts",
    "fd.gestureThreeTap": "Tap à trois doigts",
    "fd.gestureTwoSwipe": "Balayage à deux doigts",
    "fd.gestureLongPress": "Appui long",
    "fd.gestureUndo": "Annuler",
    "fd.gestureRedo": "Rétablir",
    "fd.gestureFrameMove": "Changer d'image",
    "fd.gestureEyedropper": "Pipette"
  },
  "es": {
    "featuresPage.nav.workspace": "Espacio de trabajo",
    "featuresPage.workspace.title": "Workspace｜Un entorno a tu medida",
    "featuresPage.workspace.lead": "Personaliza la propia interfaz según tu mano dominante y tu forma de trabajar.",
    "featuresPage.workspace.item1.title": "Espacios de trabajo",
    "featuresPage.workspace.item1.body": "Guarda con un nombre ajustes como el modo zurdo o el modo PC/DeX, y cámbialos según el uso: animación, línea, fondos, y más.",
    "featuresPage.workspace.item2.title": "Modo zurdo",
    "featuresPage.workspace.item2.body": "Invierte la disposición de la interfaz para que sea igual de cómoda si eres zurdo.",
    "featuresPage.workspace.item3.title": "Ajustes de gestos",
    "featuresPage.workspace.item3.body": "Asigna acciones como deshacer, rehacer, mover de fotograma o el cuentagotas a gestos como el toque con dos dedos, con tres dedos, el deslizamiento con dos dedos o la pulsación larga.",
    "featuresPage.workspace.item4.title": "Temas y apariencia",
    "featuresPage.workspace.item4.body": "Elige entre 26 temas, incluidos preajustes basados en los siete colores del arcoíris, para personalizar el aspecto a tu gusto.",
    "fd.leftHandedMode": "Modo zurdo",
    "fd.gestureTwoTap": "Toque con dos dedos",
    "fd.gestureThreeTap": "Toque con tres dedos",
    "fd.gestureTwoSwipe": "Deslizamiento con dos dedos",
    "fd.gestureLongPress": "Pulsación larga",
    "fd.gestureUndo": "Deshacer",
    "fd.gestureRedo": "Rehacer",
    "fd.gestureFrameMove": "Mover de fotograma",
    "fd.gestureEyedropper": "Cuentagotas"
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
