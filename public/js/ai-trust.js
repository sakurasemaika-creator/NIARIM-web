/** Puts the AI/privacy reassurance (i18n-dict-ai-trust.js) on FAQ and About. */
(function () {
  "use strict";

  // The page language's text, from i18n-dict-ai-trust.js (through the page
  // dictionary, which also holds a language picked later).
  function current() {
    var l = document.documentElement.getAttribute("lang") || "ja";
    var t = function (key) {
      return window.NIARIM_I18N ? window.NIARIM_I18N.translate(l, key) : "";
    };
    return {
      q: t("faq.q10"),
      a: t("faq.a10"),
      about: t("about.aiStance.body"),
      privacy: t("aiTrust.privacy"),
    };
  }

  function ensureFaq() {
    var list = document.querySelector(".faq-list");
    if (!list || list.querySelector("[data-ai-training-faq]")) return;
    var item = document.createElement("div");
    item.className = "faq-item";
    item.setAttribute("data-ai-training-faq", "true");
    // 開閉ボタンと答えの結び付け（aria-controls / role=region）は main.js が
    // DOMContentLoaded 時に一括で行うが、この項目はその後に差し込まれるため
    // 対象から漏れる。ここで同じ関係を張っておく。
    item.innerHTML =
      '<button type="button" class="faq-question" id="faq-question-ai-training" aria-expanded="false" aria-controls="faq-answer-ai-training"><span data-ai-training-q></span><span class="icon" aria-hidden="true"></span></button><div class="faq-answer" id="faq-answer-ai-training" role="region" aria-labelledby="faq-question-ai-training"><p data-ai-training-a></p></div>';
    list.appendChild(item);
    // .stagger-grid の出現演出は「一覧が画面に入った時点の子要素」にしか
    // is-visible を付けない。この項目は後から足すので対象から漏れ、
    // opacity:0 のまま誰にも見えない状態になっていた。
    // すでに演出が済んだ一覧なら、この場で表示済みとして扱う。
    if (
      list.classList.contains("stagger-grid") &&
      list.classList.contains("is-visible")
    ) {
      item.classList.add("is-visible");
    }
  }

  function ensurePrivacyClause() {
    var art2 = document.querySelector('[data-i18n="legal.privacy.art2.body"]');
    if (!art2) return;
    // The policy now carries this clause itself (legal.privacy.art2.aiTraining,
    // the app's own article 2 text), so adding it again printed the same
    // sentence twice in a row.
    if (document.querySelector('[data-i18n="legal.privacy.art2.aiTraining"]'))
      return;
    var clause = document.querySelector("[data-ai-training-privacy]");
    if (!clause) {
      clause = document.createElement("p");
      clause.setAttribute("data-ai-training-privacy", "true");
      art2.insertAdjacentElement("afterend", clause);
    }
  }

  function apply() {
    ensureFaq();
    ensurePrivacyClause();
    var text = current();
    document.querySelectorAll("[data-ai-training-q]").forEach(function (el) {
      el.textContent = text.q;
    });
    document.querySelectorAll("[data-ai-training-a]").forEach(function (el) {
      el.textContent = text.a;
    });
    document
      .querySelectorAll('[data-i18n="about.aiStance.body"]')
      .forEach(function (el) {
        el.textContent = text.about;
      });
    document
      .querySelectorAll("[data-ai-training-privacy]")
      .forEach(function (el) {
        el.textContent = text.privacy;
      });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", apply);
  else apply();
  document.addEventListener("niarim:langchange", function () {
    requestAnimationFrame(apply);
  });
})();
