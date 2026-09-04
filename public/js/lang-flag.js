/**
 * 表示言語を第一描画より前に判定して <html> に印を付ける（フォント転送量の削減）。
 *
 * ■ なぜ必要か
 *   HTMLには初期表示用の日本語がそのまま書かれており、i18n.js がそれを各言語へ
 *   置き換えるのは DOMContentLoaded の後になる。その一瞬だけ日本語が描画される
 *   ため、英語・フランス語・スペイン語を読む閲覧者にも漢字サブセット
 *   （白光明朝305KB＋くらむぼん540KB＝845KB）が必ず転送されていた
 *   （実測：DOMContentLoadedの約380ms前にフォント要求が飛ぶ）。
 *   ここでラテン系の言語だと分かった場合だけ data-latin-only を付け、
 *   CSS側で font-family から CJK サブセットを外す（variables.css 参照）。
 *   置き換わるまでのごく短い間、その日本語はOS標準のフォントで描かれる。
 *
 * ■ 判定順
 *   i18n.js と同じく「保存された選択 -> ブラウザの優先言語」。
 *   どちらでも決まらなければ何も付けない（＝従来どおり日本語で表示）。
 *
 * ■ 読み込み方
 *   CSSより前に同期実行する必要があるため <head> で defer なしに読み込む。
 *   インラインにできればリクエストを1つ減らせるが、それには CSP の
 *   script-src に 'unsafe-inline' かハッシュが要る。ハッシュは12ページの
 *   同期漏れで容易に壊れるため、外部ファイルにしている。
 */
(function () {
  "use strict";

  var LATIN = { en: 1, fr: 1, es: 1 };

  function pick(value) {
    if (!value) return null;
    var lower = String(value).toLowerCase();
    // 中国語は簡体・繁体のどちらもCJKなので、細かく分けずまとめて弾く。
    if (lower.indexOf("zh") === 0) return "zh";
    var short = lower.split("-")[0];
    return { ja: 1, en: 1, ko: 1, fr: 1, es: 1 }[short] ? short : null;
  }

  var lang = null;
  try {
    lang = pick(window.localStorage.getItem("niarim_lang"));
  } catch (e) {
    lang = null;
  }

  if (!lang) {
    var list =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];
    for (var i = 0; i < list.length && !lang; i += 1) lang = pick(list[i]);
  }

  if (lang && LATIN[lang])
    document.documentElement.setAttribute("data-latin-only", "");
})();
