/**
 * NIARIM公式サイト FAQ修正（アプリ実データに基づく訂正）
 *
 * NIARIMアプリ(dev_branch)の実装・規約・設計書から判明した事実に基づき、
 * 当初「[要確認]」としていた項目を確定情報へ更新する。
 * - faq.a2: docs/AI設計書/01_プロジェクト概要.md により、無料版でも
 *   全基本制作機能・動画書き出しが利用可能であることが確定
 *   （具体的な料金額は変更の可能性があるためサイトには掲載しない）
 * - faq.a3: pubspec.yaml・利用規約第2条・docs/AI設計書/01_プロジェクト概要.md
 *   により、Android向け提供であること、および板タブ・液晶タブレット接続、
 *   Galaxy DeXモード・Sペンに対応していることが確定
 * - faq.a6: プライバシーポリシー第2条・利用規約第4条・第8条により、
 *   本アプリはサーバーへのデータ送信・アカウント機能を持たないことが確定
 *   （プロジェクトデータは端末内保存のみ、クラウド同期機能なし）
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    "ja": {
      "faq.a2": "無料版でも、動画書き出しを含む全ての基本的な制作機能をご利用いただけます。広告表示およびNIARIM公式エンドロゴの自動追加があります。具体的な料金プランは、正式リリース時にGoogle Playのアプリページでご確認いただけます。[要確認]",
      "faq.a3": "本アプリはAndroid端末向けに提供されています。板タブ・液晶タブレットの接続や、Galaxy端末のDeXモード・Sペンにも対応しています。対応OSのバージョン等の詳細はGoogle Playのアプリページをご確認ください。",
      "faq.a6": "アカウント登録は不要です。作成した作品やプロジェクトデータは、開発者のサーバーへ送信されることなく、端末内にのみ保存されます。"
    },
    "en": {
      "faq.a2": "Even the free version includes every core creation feature, including video export. It shows ads and automatically adds the official NIARIM end card. Specific pricing plans will be available on the Google Play listing at official launch. [To be confirmed]",
      "faq.a3": "The app is provided for Android devices. It also supports connecting a drawing tablet or pen display, as well as Galaxy DeX mode and the S Pen. Please check the Google Play listing for details on supported OS versions.",
      "faq.a6": "No account registration is required. Your projects and creations are stored only on your device and are never sent to the developer's servers."
    },
    "zh-Hans": {
      "faq.a2": "即使是免费版，也可使用包括视频导出在内的全部基础创作功能。免费版会显示广告并自动添加 NIARIM 官方片尾标志。具体资费方案将在正式上线时于 Google Play 应用页面公布。【待确认】",
      "faq.a3": "本应用面向 Android 设备提供。同时支持连接数位板、数位屏，以及 Galaxy 设备的 DeX 模式与 S Pen。支持的系统版本等详情请以 Google Play 应用页面为准。",
      "faq.a6": "无需注册账号。您创作的作品和项目数据不会发送到开发者的服务器，仅保存在您的设备内。"
    },
    "zh-Hant": {
      "faq.a2": "即使是免費版，也可使用包括影片匯出在內的全部基礎創作功能。免費版會顯示廣告並自動新增 NIARIM 官方片尾標誌。具體資費方案將於正式上線時在 Google Play 應用程式頁面公布。【待確認】",
      "faq.a3": "本應用程式面向 Android 裝置提供。同時支援連接繪圖板、繪圖螢幕，以及 Galaxy 裝置的 DeX 模式與 S Pen。支援的系統版本等詳情請以 Google Play 應用程式頁面為準。",
      "faq.a6": "無需註冊帳號。您創作的作品與專案資料不會傳送至開發者的伺服器，僅保存在您的裝置內。"
    },
    "ko": {
      "faq.a2": "무료 버전에서도 영상 내보내기를 포함한 모든 기본 제작 기능을 이용할 수 있습니다. 무료 버전에는 광고가 표시되며 NIARIM 공식 엔드 카드가 자동으로 추가됩니다. 구체적인 요금제는 정식 출시 시 Google Play 앱 페이지에서 확인하실 수 있습니다. [확인 필요]",
      "faq.a3": "본 앱은 Android 기기용으로 제공됩니다. 판 타블릿・액정 타블릿 연결과 Galaxy 기기의 DeX 모드・S펜에도 대응합니다. 지원 OS 버전 등 자세한 내용은 Google Play 앱 페이지를 확인해 주세요.",
      "faq.a6": "계정 등록은 필요하지 않습니다. 제작한 작품과 프로젝트 데이터는 개발자의 서버로 전송되지 않고 기기 내에만 저장됩니다."
    },
    "fr": {
      "faq.a2": "Même la version gratuite inclut toutes les fonctionnalités de création essentielles, y compris l'export vidéo. Elle affiche des publicités et ajoute automatiquement le générique de fin officiel de NIARIM. Les tarifs précis seront disponibles sur la fiche Google Play lors du lancement officiel. [À confirmer]",
      "faq.a3": "L'application est proposée pour les appareils Android. Elle prend également en charge la connexion d'une tablette graphique ou d'un écran-tablette, ainsi que le mode Galaxy DeX et le S Pen. Veuillez consulter la fiche Google Play pour le détail des versions du système compatibles.",
      "faq.a6": "Aucune création de compte n'est nécessaire. Vos projets et créations restent stockés uniquement sur votre appareil et ne sont jamais envoyés aux serveurs du développeur."
    },
    "es": {
      "faq.a2": "Incluso la versión gratuita incluye todas las funciones de creación básicas, incluida la exportación de video. Muestra anuncios y añade automáticamente la placa de cierre oficial de NIARIM. Los planes de precios concretos estarán disponibles en la ficha de Google Play en el lanzamiento oficial. [Por confirmar]",
      "faq.a3": "La aplicación está disponible para dispositivos Android. También admite la conexión de una tableta gráfica o pantalla-tableta, así como el modo Galaxy DeX y el S Pen. Consulta la ficha de Google Play para conocer el detalle de las versiones del sistema compatibles.",
      "faq.a6": "No es necesario registrar una cuenta. Tus proyectos y creaciones se guardan únicamente en tu dispositivo y nunca se envían a los servidores del desarrollador."
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
