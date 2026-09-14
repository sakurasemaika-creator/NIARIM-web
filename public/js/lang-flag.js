/**
 * 表示言語を第一描画より前に判定して <html> に印を付ける（フォント転送量の削減）。
 *
 * ■ 判定順
 *   SEO/共有用の ?lang=xx -> 保存された選択 -> ブラウザの優先言語。
 *   URLで明示された言語は、検索結果のmetadataと本文を一致させるため最優先する。
 */
(function () {
  "use strict";

  var LATIN = { en: 1, fr: 1, es: 1 };

  function pick(value) {
    if (!value) return null;
    var raw = String(value);
    if (raw === "zh-Hans" || raw === "zh-Hant") return "zh";
    var lower = raw.toLowerCase();
    if (lower.indexOf("zh") === 0) return "zh";
    var short = lower.split("-")[0];
    return { ja: 1, en: 1, ko: 1, fr: 1, es: 1 }[short] ? short : null;
  }

  var lang = null;
  try {
    lang = pick(new URL(window.location.href).searchParams.get("lang"));
  } catch (e) {
    lang = null;
  }

  if (!lang) {
    try {
      lang = pick(window.localStorage.getItem("niarim_lang"));
    } catch (e) {
      lang = null;
    }
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

  /* 日本語CTAはサイト共通i18n辞書を正本として表示する。
   * このheadスクリプトは辞書本体より先に読み込まれるため、DOMContentLoaded時に
   * 辞書へ承認済みコピーを反映する。以後の言語切替でも同じja値が使われる。 */
  document.addEventListener("DOMContentLoaded", function () {
    var dict = window.NIARIM_I18N_DICT;
    if (!dict || !dict.ja) return;
    dict.ja["cta.title"] = "実際にアニメーションを つくってみよう！";
    dict.ja["cta.body"] =
      "描きたいと思ったら今すぐにでも始められる。全フレーム手描きでもキーフレームアニメーションでもあなたのお好みで。納得するまでとことんこだわってあなただけのオリジナル作品をつくろう。完成したら作品広場でみんなにみてもらうことができます。逆に、他の人の作品をみることもできます。つくって、公開して、みつけよう。";
  });
})();
