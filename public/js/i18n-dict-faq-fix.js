/**
 * NIARIM公式サイト FAQ修正（アプリ実データに基づく訂正）
 *
 * NIARIMアプリ(dev_branch)の実装・規約・設計書から判明した事実に基づき、
 * 当初「」としていた項目を確定情報へ更新する。
 * - faq.a2: docs/AI設計書/01_プロジェクト概要.md により、無料版でも
 *   全基本制作機能・動画書き出しが利用可能であることが確定
 *   （具体的な料金額は変更の可能性があるためサイトには掲載しない）
 * - faq.a3: pubspec.yaml・利用規約第2条・docs/AI設計書/01_プロジェクト概要.md
 *   により、Android向け提供であること、および板タブ・液晶タブレット接続、
 *   Galaxy DeXモード・Sペンに対応していることが確定
 * - faq.a6: プライバシーポリシー第2条・利用規約第4条・第8条により、
 *   本アプリはサーバーへのデータ送信・アカウント機能を持たないことが確定
 *   （プロジェクトデータは端末内保存のみ、クラウド同期機能なし）。
 *   ただし作品広場への投稿・公開にはGoogleアカウントでのログインが必要
 *   なため、「制作する上では不要」という書き方に修正した。
 * - faq.a7.html: お問い合わせ導線をcontact.leadと揃え、まず公式Xへ、
 *   個人情報関連のみお問い合わせフォームへ誘導する形に統一した。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    ja: {
      "faq.viewAll": "すべての質問を見る",
      "faq.a2":
        "無料版でも、動画書き出しを含む全ての基本的な制作機能をご利用いただけます。広告表示およびNIARIM公式エンドロゴの自動追加があります。具体的な料金プランはGoogle Playのアプリページでご確認いただけます。",
      "faq.a3":
        "本アプリはAndroid端末向けに提供されています。板タブ・液晶タブレットの接続や、Galaxy端末のDeXモード・Sペンにも対応しています。対応OSのバージョン等の詳細はGoogle Playのアプリページをご確認ください。",
      "faq.a6":
        "作品を制作する上ではアカウント登録は不要です。作成した作品やプロジェクトデータは、開発者のサーバーへ送信されることなく、端末内にのみ保存されます。ただし、作品を公開するにはGoogleアカウントでのログインが必要です。",
      "faq.a7.html":
        '不具合報告・機能要望・使い方に関するご質問は、まず公式Xへお気軽にご連絡ください。アカウントやメールアドレスなど個人情報に関わるお問い合わせは、Xではお答えできませんので、<a href="/contact/">お問い合わせフォーム</a>からご連絡ください。',
    },
    en: {
      "faq.viewAll": "View all questions",
      "faq.a2":
        "Even the free version includes every core creation feature, including video export. It shows ads and automatically adds the official NIARIM end card. Specific pricing plans are available on the Google Play listing.",
      "faq.a3":
        "The app is provided for Android devices. It also supports connecting a drawing tablet or pen display, as well as Galaxy DeX mode and the S Pen. Please check the Google Play listing for details on supported OS versions.",
      "faq.a6":
        "No account registration is required to create your work. Your projects and creations are stored only on your device and are never sent to the developer's servers. However, signing in with a Google account is required to publish your work.",
      "faq.a7.html":
        'For bug reports, feature requests, or how-to questions, please reach out via our official X account first. We can\'t handle inquiries involving personal information (like your account or email address) on X, so please use the <a href="/contact/">contact form</a> for those instead.',
    },
    "zh-Hans": {
      "faq.viewAll": "查看全部问题",
      "faq.a2":
        "即使是免费版，也可使用包括视频导出在内的全部基础创作功能。免费版会显示广告并自动添加 NIARIM 官方片尾标志。具体资费方案可在 Google Play 应用页面查看。",
      "faq.a3":
        "本应用面向 Android 设备提供。同时支持连接数位板、数位屏，以及 Galaxy 设备的 DeX 模式与 S Pen。支持的系统版本等详情请以 Google Play 应用页面为准。",
      "faq.a6":
        "在创作作品方面无需注册账号。您创作的作品和项目数据不会发送到开发者的服务器，仅保存在您的设备内。但如果要公开发布作品，则需要使用 Google 账号登录。",
      "faq.a7.html":
        '如有故障报告、功能建议或使用方法相关的问题，请先通过官方 X 账号联系我们。涉及账号、邮箱等个人信息的咨询无法在 X 上处理，请改用<a href="/contact/">联系表单</a>与我们联系。',
    },
    "zh-Hant": {
      "faq.viewAll": "查看全部問題",
      "faq.a2":
        "即使是免費版，也可使用包括影片匯出在內的全部基礎創作功能。免費版會顯示廣告並自動新增 NIARIM 官方片尾標誌。具體資費方案可在 Google Play 應用程式頁面查看。",
      "faq.a3":
        "本應用程式面向 Android 裝置提供。同時支援連接繪圖板、繪圖螢幕，以及 Galaxy 裝置的 DeX 模式與 S Pen。支援的系統版本等詳情請以 Google Play 應用程式頁面為準。",
      "faq.a6":
        "在創作作品方面無需註冊帳號。您創作的作品與專案資料不會傳送至開發者的伺服器，僅保存在您的裝置內。但若要公開發布作品，則需要使用 Google 帳號登入。",
      "faq.a7.html":
        '如有問題回報、功能建議或使用方法相關疑問，請先透過官方 X 帳號與我們聯絡。涉及帳號、電子郵件等個人資料的洽詢無法在 X 上處理，請改用<a href="/contact/">聯絡表單</a>與我們聯絡。',
    },
    ko: {
      "faq.viewAll": "모든 질문 보기",
      "faq.a2":
        "무료 버전에서도 영상 내보내기를 포함한 모든 기본 제작 기능을 이용할 수 있습니다. 무료 버전에는 광고가 표시되며 NIARIM 공식 엔드 카드가 자동으로 추가됩니다. 구체적인 요금제는 Google Play 앱 페이지에서 확인하실 수 있습니다.",
      "faq.a3":
        "본 앱은 Android 기기용으로 제공됩니다. 판 타블릿・액정 타블릿 연결과 Galaxy 기기의 DeX 모드・S펜에도 대응합니다. 지원 OS 버전 등 자세한 내용은 Google Play 앱 페이지를 확인해 주세요.",
      "faq.a6":
        "작품을 제작하는 데에는 계정 등록이 필요하지 않습니다. 제작한 작품과 프로젝트 데이터는 개발자의 서버로 전송되지 않고 기기 내에만 저장됩니다. 다만 작품을 공개하려면 Google 계정으로 로그인해야 합니다.",
      "faq.a7.html":
        '오류 신고, 기능 요청, 사용법 관련 문의는 먼저 공식 X 계정으로 편하게 연락해 주세요. 계정이나 이메일 주소 등 개인정보와 관련된 문의는 X에서 답변드릴 수 없으니, <a href="/contact/">문의 양식</a>을 이용해 주세요.',
    },
    fr: {
      "faq.viewAll": "Voir toutes les questions",
      "faq.a2":
        "Même la version gratuite inclut toutes les fonctionnalités de création essentielles, y compris l'export vidéo. Elle affiche des publicités et ajoute automatiquement le générique de fin officiel de NIARIM. Les tarifs précis sont disponibles sur la fiche Google Play.",
      "faq.a3":
        "L'application est proposée pour les appareils Android. Elle prend également en charge la connexion d'une tablette graphique ou d'un écran-tablette, ainsi que le mode Galaxy DeX et le S Pen. Veuillez consulter la fiche Google Play pour le détail des versions du système compatibles.",
      "faq.a6":
        "Aucune création de compte n'est nécessaire pour créer votre œuvre. Vos projets et créations restent stockés uniquement sur votre appareil et ne sont jamais envoyés aux serveurs du développeur. Cependant, la connexion avec un compte Google est nécessaire pour publier votre œuvre.",
      "faq.a7.html":
        "Pour signaler un bug, demander une fonctionnalité ou poser une question sur l'utilisation, contactez-nous d'abord via notre compte X officiel. Nous ne pouvons pas répondre sur X aux demandes impliquant des informations personnelles (comme votre compte ou votre adresse e-mail) — utilisez plutôt le <a href=\"/contact/\">formulaire de contact</a> pour cela.",
    },
    es: {
      "faq.viewAll": "Ver todas las preguntas",
      "faq.a2":
        "Incluso la versión gratuita incluye todas las funciones de creación básicas, incluida la exportación de video. Muestra anuncios y añade automáticamente la placa de cierre oficial de NIARIM. Los planes de precios concretos están disponibles en la ficha de Google Play.",
      "faq.a3":
        "La aplicación está disponible para dispositivos Android. También admite la conexión de una tableta gráfica o pantalla-tableta, así como el modo Galaxy DeX y el S Pen. Consulta la ficha de Google Play para conocer el detalle de las versiones del sistema compatibles.",
      "faq.a6":
        "No es necesario registrar una cuenta para crear tu obra. Tus proyectos y creaciones se guardan únicamente en tu dispositivo y nunca se envían a los servidores del desarrollador. Sin embargo, para publicar tu obra necesitas iniciar sesión con una cuenta de Google.",
      "faq.a7.html":
        'Para reportar errores, solicitar funciones o hacer preguntas sobre el uso, contáctanos primero a través de nuestra cuenta oficial de X. No podemos responder en X a consultas que impliquen información personal (como tu cuenta o correo electrónico); para eso, usa el <a href="/contact/">formulario de contacto</a>.',
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
