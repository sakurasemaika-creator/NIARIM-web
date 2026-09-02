/**
 * NIARIM公式サイト 外部リンク差し込み (config-links.js)
 *
 * config.js の NIARIM_CONFIG に入っているURL（Google Play・公式X）を、
 * 対応するIDを持つ要素の href へ差し込む。
 *
 * 以前は同じ処理を全ページの末尾にインラインの<script>として重複して
 * 書いていたが、(1)11ファイルに同じロジックが散らばって保守しづらい
 * (2)インラインスクリプトを許可するためCSPに 'unsafe-inline' が必要になる
 * という2点の問題があったため、共通の外部スクリプトへ集約した。
 *
 * URLが未設定（正式リリース前）の場合の扱い:
 *   href="#" のまま残すと、クリックしてもページ先頭へ飛ぶだけの
 *   「壊れたリンク」に見えてしまう。そのため未設定時は
 *   - フッターの公式Xリンク/アイコン、本文中のXリンク → 要素ごと非表示
 *   - Google PlayボタンなどのCTA → hrefを外し、押せない状態であることを
 *     aria-disabled と .is-unavailable（CSS側で淡色・カーソル既定）で明示
 *   とし、「押せるのに何も起きない」状態を作らない。
 */
(function () {
  "use strict";

  // id → 設定キー。未設定時に「非表示」にするか「無効表示」にするかを type で分ける。
  var LINKS = [
    { id: "google-play-link", key: "GOOGLE_PLAY_URL", fallback: "disable" },
    { id: "footer-x-link", key: "X_URL", fallback: "hide" },
    { id: "footer-x-icon", key: "X_URL", fallback: "hide" },
    { id: "contact-x-link", key: "X_URL", fallback: "hide" },
  ];

  function apply() {
    var config = window.NIARIM_CONFIG || {};

    LINKS.forEach(function (link) {
      var el = document.getElementById(link.id);
      if (!el) return;

      var url = config[link.key];
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("rel", "noopener noreferrer");
        return;
      }

      if (link.fallback === "hide") {
        // リストアイテムごと消せる場合は親のliごと隠し、
        // 空の箇条書き記号や余白が残らないようにする。
        var host = el.closest("li") || el;
        host.hidden = true;
      } else {
        // 押せないことを支援技術にも伝える。hrefを外すとフォーカスも
        // 当たらなくなるため、キーボード操作でも空振りしない。
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-unavailable");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
