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
  var MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 画像1枚あたり5MB
  var MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 動画1本あたり15MB
  var MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 添付合計の上限
  var ATTACHMENT_MAX_BYTES_BY_TYPE = {
    "image/png": MAX_IMAGE_BYTES,
    "image/jpeg": MAX_IMAGE_BYTES,
    "image/webp": MAX_IMAGE_BYTES,
    "image/gif": MAX_IMAGE_BYTES,
    "video/mp4": MAX_VIDEO_BYTES,
    "video/quicktime": MAX_VIDEO_BYTES,
    "video/webm": MAX_VIDEO_BYTES,
  };

  function t(key) {
    var lang = document.documentElement.getAttribute("lang") || "ja";
    if (window.NIARIM_I18N) return window.NIARIM_I18N.translate(lang, key);
    return key;
  }

  // エラー表示はCSSのクラス切り替えだけでなく、支援技術にも伝える。
  // 以前は .has-error を付けるだけで、入力欄自体が「エラー状態である」
  // ことも「どのメッセージが対応するのか」もスクリーンリーダーからは
  // 分からなかった。aria-invalid と aria-describedby で結び付ける。
  function setFieldError(row, show, field) {
    row.classList.toggle("has-error", !!show);

    var errorEl = row.querySelector(".form-error");
    if (errorEl && !errorEl.id) {
      errorEl.id =
        "form-error-" +
        (field && (field.name || field.id)
          ? field.name || field.id
          : Math.random().toString(36).slice(2));
    }

    var target =
      field || row.querySelector(".form-control, input, select, textarea");
    if (!target) return;

    if (show) {
      target.setAttribute("aria-invalid", "true");
      if (errorEl) target.setAttribute("aria-describedby", errorEl.id);
    } else {
      target.removeAttribute("aria-invalid");
      target.removeAttribute("aria-describedby");
    }
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
      var badEmail =
        field === email && !isEmpty && !EMAIL_RE.test(field.value.trim());

      if (isEmpty) {
        errorEl.textContent = t("contact.error.required");
        setFieldError(row, true, field);
        valid = false;
      } else if (tooLong) {
        errorEl.textContent = t("contact.error.tooLong");
        setFieldError(row, true, field);
        valid = false;
      } else if (badEmail) {
        errorEl.textContent = t("contact.error.email");
        setFieldError(row, true, field);
        valid = false;
      } else {
        setFieldError(row, false, field);
      }
    });

    var agreeRow = agree.closest(".form-row");
    if (!agree.checked) {
      setFieldError(agreeRow, true, agree);
      valid = false;
    } else {
      setFieldError(agreeRow, false, agree);
    }

    var attachments = form.elements.attachments;
    if (attachments) {
      var attachmentsRow = attachments.closest(".form-row");
      var files = Array.prototype.slice.call(attachments.files || []);
      var totalBytes = 0;
      var attachmentsInvalid =
        files.length > MAX_ATTACHMENTS ||
        files.some(function (file) {
          var maxBytes = ATTACHMENT_MAX_BYTES_BY_TYPE[file.type];
          totalBytes += file.size;
          return !maxBytes || file.size > maxBytes;
        }) ||
        totalBytes > MAX_TOTAL_ATTACHMENT_BYTES;
      setFieldError(attachmentsRow, attachmentsInvalid, attachments);
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
        var firstError = form.querySelector(
          ".form-row.has-error .form-control",
        );
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
        Array.prototype.forEach.call(
          form.elements.attachments.files || [],
          function (file) {
            payload.append("attachments", file, file.name);
          },
        );
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
              "contact.status.successBody",
            );
          } else if (result.status === 429) {
            showStatus(
              statusEl,
              "error",
              "contact.status.errorTitle",
              "contact.status.rateLimitBody",
            );
          } else {
            showStatus(
              statusEl,
              "error",
              "contact.status.errorTitle",
              "contact.status.errorBody",
            );
          }
        })
        .catch(function () {
          showStatus(
            statusEl,
            "error",
            "contact.status.errorTitle",
            "contact.status.errorBody",
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
