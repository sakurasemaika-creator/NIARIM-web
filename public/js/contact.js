/**
 * NIARIM お問い合わせフォーム 送信ロジック
 * POST /api/contact へ送信し、二重送信防止・成功/失敗UIを制御する。
 */
(function () {
  "use strict";

  var MESSAGE_MAX_LENGTH = 1000;
  var NAME_MAX_LENGTH = 100;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MAX_ATTACHMENTS = 3;
  var MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 1枚あたり5MB
  var ALLOWED_ATTACHMENT_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ];

  function t(key) {
    var lang = document.documentElement.getAttribute("lang") || "ja";
    if (window.NIARIM_I18N) return window.NIARIM_I18N.translate(lang, key);
    return key;
  }

  function setFieldError(row, show) {
    row.classList.toggle("has-error", !!show);
  }

  function validate(form) {
    var valid = true;
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;
    var agree = form.elements.agree;

    [name, email, message].forEach(function (field) {
      var row = field.closest(".form-row");
      var errorEl = row.querySelector(".form-error");
      var isEmpty = field.value.trim().length === 0;
      var tooLong =
        field === message
          ? field.value.length > MESSAGE_MAX_LENGTH
          : field === name
          ? field.value.length > NAME_MAX_LENGTH
          : false;
      var badEmail = field === email && !isEmpty && !EMAIL_RE.test(field.value.trim());

      if (isEmpty) {
        errorEl.textContent = t("contact.error.required");
        setFieldError(row, true);
        valid = false;
      } else if (tooLong) {
        errorEl.textContent = t("contact.error.tooLong");
        setFieldError(row, true);
        valid = false;
      } else if (badEmail) {
        errorEl.textContent = t("contact.error.email");
        setFieldError(row, true);
        valid = false;
      } else {
        setFieldError(row, false);
      }
    });

    var agreeRow = agree.closest(".form-row");
    if (!agree.checked) {
      setFieldError(agreeRow, true);
      valid = false;
    } else {
      setFieldError(agreeRow, false);
    }

    var attachments = form.elements.attachments;
    if (attachments) {
      var attachmentsRow = attachments.closest(".form-row");
      var files = Array.prototype.slice.call(attachments.files || []);
      var attachmentsInvalid =
        files.length > MAX_ATTACHMENTS ||
        files.some(function (file) {
          return (
            file.size > MAX_ATTACHMENT_BYTES ||
            ALLOWED_ATTACHMENT_TYPES.indexOf(file.type) === -1
          );
        });
      setFieldError(attachmentsRow, attachmentsInvalid);
      if (attachmentsInvalid) valid = false;
    }

    return valid;
  }

  function showStatus(statusEl, type, titleKey, bodyKey) {
    statusEl.className = "form-status is-visible is-" + type;
    statusEl.querySelector("h2").textContent = t(titleKey);
    statusEl.querySelector("p").textContent = t(bodyKey);
    statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var submitBtn = document.getElementById("submit-btn");
    var statusEl = document.getElementById("form-status");
    var submitLabel = submitBtn.querySelector("span");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (submitBtn.disabled) return; // 二重送信防止
      statusEl.className = "form-status";

      if (!validate(form)) {
        var firstError = form.querySelector(".form-row.has-error .form-control");
        if (firstError) firstError.focus();
        return;
      }

      var payload = new FormData();
      payload.set("type", form.elements.type.value);
      payload.set("name", form.elements.name.value.trim());
      payload.set("email", form.elements.email.value.trim());
      payload.set("message", form.elements.message.value.trim());
      payload.set("agree", form.elements.agree.checked ? "true" : "false");
      payload.set("company", form.elements.company.value); // honeypot
      if (form.elements.attachments) {
        Array.prototype.forEach.call(form.elements.attachments.files || [], function (file) {
          payload.append("attachments", file, file.name);
        });
      }

      submitBtn.disabled = true;
      submitLabel.textContent = t("contact.form.submitting");

      // Content-Typeは指定しない（ブラウザがmultipart/form-dataの
      // boundaryを含めて自動設定するため、手動指定すると壊れる）。
      fetch("/api/contact", {
        method: "POST",
        body: payload,
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: res.ok, status: res.status, data: data };
            });
        })
        .then(function (result) {
          if (result.ok) {
            form.reset();
            showStatus(
              statusEl,
              "success",
              "contact.status.successTitle",
              "contact.status.successBody"
            );
          } else if (result.status === 429) {
            showStatus(
              statusEl,
              "error",
              "contact.status.errorTitle",
              "contact.status.rateLimitBody"
            );
          } else {
            showStatus(
              statusEl,
              "error",
              "contact.status.errorTitle",
              "contact.status.errorBody"
            );
          }
        })
        .catch(function () {
          showStatus(
            statusEl,
            "error",
            "contact.status.errorTitle",
            "contact.status.errorBody"
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitLabel.textContent = t("contact.form.submit");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", initContactForm);
})();
