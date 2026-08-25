/**
 * NIARIM公式サイト 共通設定値
 *
 * サイト内で使い回す変更可能な情報をここに集約する。
 * URLやメールアドレスをHTML内に直接大量に記述しないための単一ソース。
 *
 * [要確認] の値は、正式リリース時の情報が確定次第、差し替えること。
 */
window.NIARIM_CONFIG = {
  // アプリ名・キャッチコピー
  APP_NAME: "NIARIM",
  APP_TAGLINE: "描く。動かす。物語にする。",
  APP_DESCRIPTION:
    "NIARIMは、自分の手で描いた絵を動かし、アニメーション作品として書き出せる制作アプリです。",

  // サイトURL（[要確認] 本番ドメイン確定後に差し替え）
  SITE_URL: "https://niarim.example.com",

  // Google Play（[要確認] 公開URL確定後に差し替え）
  GOOGLE_PLAY_URL: "",
  GOOGLE_PLAY_URL_PLACEHOLDER: "PLAY_STORE_URL",

  // 公式X（[要確認] 公式アカウント確定後に差し替え）
  X_URL: "",
  X_URL_PLACEHOLDER: "X_URL",

  // お問い合わせ受信アドレス（[要確認] 本番用アドレス確定後に差し替え）
  CONTACT_EMAIL: "CONTACT_EMAIL_PLACEHOLDER",

  // OGP画像（[要確認] 正式なOGP画像に差し替え）
  OGP_IMAGE: "/assets/images/ogp-default.png",
};
