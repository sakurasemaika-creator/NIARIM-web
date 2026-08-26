/**
 * NIARIM プレミアムプランページ 月額/年額切り替え
 */
(function () {
  "use strict";

  function initPlanToggle() {
    var buttons = document.querySelectorAll("[data-plan-toggle]");
    var monthlyBlock = document.querySelector("[data-plan-block='monthly']");
    var yearlyBlock = document.querySelector("[data-plan-block='yearly']");
    if (!buttons.length || !monthlyBlock || !yearlyBlock) return;

    function setPlan(plan) {
      buttons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-plan-toggle") === plan);
      });
      monthlyBlock.style.display = plan === "monthly" ? "" : "none";
      yearlyBlock.style.display = plan === "yearly" ? "" : "none";
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setPlan(btn.getAttribute("data-plan-toggle"));
      });
    });

    setPlan("monthly");
  }

  document.addEventListener("DOMContentLoaded", initPlanToggle);
})();
