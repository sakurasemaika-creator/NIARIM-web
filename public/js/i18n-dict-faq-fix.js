/**
 * NIARIM公式サイト FAQ修正（アプリ実データに基づく訂正）
 *
 * NIARIMアプリ(dev_branch)の実装・規約から判明した事実に基づき、当初[要確認]と
 * していた2項目を確定情報へ更新する。
 * - faq.a3: pubspec.yaml記載および利用規約第2条によりAndroid向け提供と確定
 * - faq.a6: プライバシーポリシー第2条・利用規約第4条・第8条により、
 *   本アプリはサーバーへのデータ送信・アカウント機能を持たないことが確定
 *   （プロジェクトデータは端末内保存のみ、クラウド同期機能なし）
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "faq.a3": "本アプリはAndroid端末向けに提供されています。対応OSのバージョン等の詳細はGoogle Playのアプリページをご確認ください。",
    "faq.a6": "アカウント登録は不要です。作成した作品やプロジェクトデータは、開発者のサーバーへ送信されることなく、端末内にのみ保存されます。"
  },
  "en": {
    "faq.a3": "The app is provided for Android devices. Please check the Google Play listing for details on supported OS versions.",
    "faq.a6": "No account registration is required. Your projects and creations are stored only on your device and are never sent to the developer's servers."
  },
  "zh-Hans": {
    "faq.a3": "本应用面向Android设备提供。支持的系统版本等详情请以Google Play应用页面为准。",
    "faq.a6": "无需注册账号。您创作的作品和项目数据不会发送到开发者的服务器，仅保存在您的设备内。"
  },
  "zh-Hant": {
    "faq.a3": "本應用程式面向Android裝置提供。支援的系統版本等詳情請以Google Play應用程式頁面為準。",
    "faq.a6": "無需註冊帳號。您創作的作品與專案資料不會傳送至開發者的伺服器，僅保存在您的裝置內。"
  },
  "ko": {
    "faq.a3": "본 앱은 Android 기기용으로 제공됩니다. 지원 OS 버전 등 자세한 내용은 Google Play 앱 페이지를 확인해 주세요.",
    "faq.a6": "계정 등록은 필요하지 않습니다. 제작한 작품과 프로젝트 데이터는 개발자의 서버로 전송되지 않고 기기 내에만 저장됩니다."
  },
  "fr": {
    "faq.a3": "L'application est proposée pour les appareils Android. Veuillez consulter la fiche Google Play pour le détail des versions du système compatibles.",
    "faq.a6": "Aucune création de compte n'est nécessaire. Vos projets et créations restent stockés uniquement sur votre appareil et ne sont jamais envoyés aux serveurs du développeur."
  },
  "es": {
    "faq.a3": "La aplicación está disponible para dispositivos Android. Consulta la ficha de Google Play para conocer el detalle de las versiones del sistema compatibles.",
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
