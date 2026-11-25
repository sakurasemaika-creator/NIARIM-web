/**
 * NIARIM公式サイト 共通設定値
 *
 * サイト内で使い回す変更可能な情報をここに集約する。
 * URLをHTML内に直接大量に記述しないための単一ソース。
 * ここに置くのは実際にJS側から参照している値のみ（未使用の値は置かない）。
 */
window.NIARIM_CONFIG = {
  // Google PlayのNIARIMのストアページ
  GOOGLE_PLAY_URL:
    "https://play.google.com/store/apps/details?id=com.niarim.niarim",

  // Google Playの公式バッジ画像（/assets/badges/google-play/<言語>.png）を
  // 置いた言語。ここに並べた言語だけ、画像を読み込めたときにバッジを表示する。
  // 並べていない言語では「Google Play で手に入れよう」の文字のボタンを表示する。
  // 使える値: "ja", "en", "fr", "es", "ko", "zh-Hans", "zh-Hant"
  GOOGLE_PLAY_BADGE_LANGS: [],

  // 公式X（空のときは、Xへのリンクを表示しない）
  X_URL: "",
};
