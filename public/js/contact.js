/**
 * NIARIM お問い合わせフォーム 送信ロジック
 * POST /api/contact へ送信し、二重送信防止・成功/失敗UIを制御する。
 */
(function () {
  "use strict";

  var MAX_MESSAGE_LENGTH = 1000;
  var MAX_ATTACHMENTS = 3;
  var MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 画像1枚あたり5MB
  var MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 動画1本あたり15MB
  var MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 添付合計の上限
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    var descriptions = (target.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter(function (id) {
        return id && (!errorEl || id !== errorEl.id);
      });
    if (show) {
      target.setAttribute("aria-invalid", "true");
      if (errorEl) descriptions.push(errorEl.id);
    } else {
      target.removeAttribute("aria-invalid");
    }
    if (descriptions.length)
      target.setAttribute("aria-describedby", descriptions.join(" "));
    else target.removeAttribute("aria-describedby");
  }

  function renderAttachmentError(field, key, filename) {
    var row = field.closest(".form-row");
    var error = row.querySelector(".form-error");
    error.dataset.errorKey = key || "";
    error.dataset.filename = filename || "";
    error.textContent = key
      ? t(key).replace("%s", function () {
          return filename || "";
        })
      : "";
    setFieldError(row, !!key, document.getElementById("attachments-trigger"));
  }

  function validateAttachments(field) {
    var files = Array.from(field.files || []);
    var totalBytes = 0;
    if (files.length > MAX_ATTACHMENTS) {
      renderAttachmentError(field, "contact.error.attachmentCount");
      return false;
    }
    for (var file of files) {
      var maxBytes = ATTACHMENT_MAX_BYTES_BY_TYPE[file.type];
      if (!maxBytes || !file.size) {
        renderAttachmentError(
          field,
          "contact.error.attachmentFormat",
          file.name,
        );
        return false;
      }
      if (file.size > maxBytes) {
        renderAttachmentError(field, "contact.error.attachmentSize", file.name);
        return false;
      }
      totalBytes += file.size;
    }
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      renderAttachmentError(field, "contact.error.attachmentTotal");
      return false;
    }
    renderAttachmentError(field);
    return true;
  }

  function validate(form) {
    var valid = true;
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;
    var agree = form.elements.agree;

    // The server trims these fields and requires a dotted email domain.
    // Use the HTML validity state for the remaining field constraints.
    [name, email, message].forEach(function (field) {
      var row = field.closest(".form-row");
      var errorEl = row.querySelector(".form-error");
      var state = field.validity;

      if (state.valueMissing || !field.value.trim()) {
        errorEl.setAttribute("data-i18n", "contact.error.required");
        errorEl.textContent = t("contact.error.required");
        setFieldError(row, true, field);
        valid = false;
      } else if (
        state.tooLong ||
        (field === message && field.value.length > MAX_MESSAGE_LENGTH)
      ) {
        errorEl.setAttribute("data-i18n", "contact.error.tooLong");
        errorEl.textContent = t("contact.error.tooLong");
        setFieldError(row, true, field);
        valid = false;
      } else if (
        field === email &&
        (state.typeMismatch || !EMAIL_RE.test(email.value.trim()))
      ) {
        errorEl.setAttribute("data-i18n", "contact.error.email");
        errorEl.textContent = t("contact.error.email");
        setFieldError(row, true, field);
        valid = false;
      } else {
        setFieldError(row, false, field);
      }
    });

    var agreeRow = agree.closest(".form-row");
    if (agree.validity.valueMissing) {
      setFieldError(agreeRow, true, agree);
      valid = false;
    } else {
      setFieldError(agreeRow, false, agree);
    }

    var attachments = form.elements.attachments;
    if (attachments && !validateAttachments(attachments)) valid = false;

    return valid;
  }

  function showServerFieldError(form, name, key) {
    if (!["name", "email", "message", "agree", "attachments"].includes(name))
      return false;
    var field = form.elements[name];
    var row = field?.closest(".form-row");
    if (!row) return false;
    var target =
      name === "attachments"
        ? document.getElementById("attachments-trigger") || field
        : field;
    if (name === "attachments") {
      renderAttachmentError(field, key || "contact.error.attachmentRejected");
    } else {
      var messageKey = {
        name: "contact.error.required",
        email: "contact.error.email",
        message: "contact.error.tooLong",
        agree: "contact.error.agree",
      }[name];
      var error = row.querySelector(".form-error");
      error.setAttribute("data-i18n", messageKey);
      error.textContent = t(messageKey);
      setFieldError(row, true, target);
    }
    target.focus();
    return true;
  }

  function showStatus(statusEl, type, titleKey, bodyKey) {
    statusEl.className = "form-status is-visible is-" + type;
    statusEl.querySelector("h2").setAttribute("data-i18n", titleKey);
    statusEl.querySelector("h2").textContent = t(titleKey);
    statusEl.querySelector("p").setAttribute("data-i18n", bodyKey);
    statusEl.querySelector("p").textContent = t(bodyKey);
    statusEl.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
    });
  }

  function initFileField() {
    var input = document.getElementById("attachments");
    var trigger = document.getElementById("attachments-trigger");
    var list = document.getElementById("attachments-list");
    var status = document.getElementById("attachments-status");
    if (!input || !trigger || !list || !status) return;

    trigger.addEventListener("click", function () {
      input.click();
    });

    function updateFileStatus() {
      var files = Array.from(input.files || []);
      status.textContent = files.length
        ? t("contact.form.attachmentsCount").replace("%d", files.length)
        : t("contact.form.attachmentsEmpty");
      list.replaceChildren();
      files.forEach(function (file, index) {
        var row = document.createElement("li");
        var filename = document.createElement("span");
        filename.textContent = file.name;
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "form-file-button";
        remove.textContent = t("contact.form.attachmentRemove");
        remove.setAttribute(
          "aria-label",
          t("contact.form.attachmentRemoveNamed").replace("%s", function () {
            return file.name;
          }),
        );
        remove.addEventListener("click", function () {
          var remaining = new DataTransfer();
          files.forEach(function (entry, entryIndex) {
            if (entryIndex !== index) remaining.items.add(entry);
          });
          input.files = remaining.files;
          filesChanged();
          (
            list.querySelectorAll("button")[index] ||
            list.querySelector("li:last-child button") ||
            trigger
          ).focus();
        });
        row.append(filename, remove);
        list.append(row);
      });
    }

    function filesChanged() {
      updateFileStatus();
      validateAttachments(input);
    }

    input.addEventListener("change", filesChanged);
    document.addEventListener("niarim:langchange", function () {
      updateFileStatus();
      var error = input.closest(".form-row").querySelector(".form-error");
      renderAttachmentError(
        input,
        error.dataset.errorKey,
        error.dataset.filename,
      );
    });
    input.form.addEventListener("reset", function () {
      queueMicrotask(filesChanged);
    });
    updateFileStatus();
  }

  function initMessageCounter(form) {
    var message = form.elements.message;
    var counter = document.getElementById("message-count");
    if (!counter) return;
    var row = message.closest(".form-row");
    var error = row.querySelector(".form-error");

    function updateCount() {
      var length = message.value.length;
      counter.value =
        new Intl.NumberFormat(document.documentElement.lang).format(length) +
        " / " +
        new Intl.NumberFormat(document.documentElement.lang).format(
          MAX_MESSAGE_LENGTH,
        );
    }

    message.addEventListener("input", function () {
      updateCount();
      if (message.value.length > MAX_MESSAGE_LENGTH) {
        error.setAttribute("data-i18n", "contact.error.tooLong");
        error.textContent = t("contact.error.tooLong");
        setFieldError(row, true, message);
      } else {
        setFieldError(row, false, message);
      }
    });
    form.addEventListener("reset", function () {
      queueMicrotask(updateCount);
    });
    document.addEventListener("niarim:langchange", updateCount);
    updateCount();
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var submitBtn = document.getElementById("submit-btn");
    var statusEl = document.getElementById("form-status");
    var submitLabel = submitBtn.querySelector("span");

    var fields = document.getElementById("contact-fields");
    initMessageCounter(form);
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (submitBtn.disabled) return; // 二重送信防止
      statusEl.className = "form-status";

      if (!validate(form)) {
        var firstRow = form.querySelector(".form-row.has-error");
        var firstError =
          firstRow &&
          (firstRow.querySelector("#attachments-trigger") ||
            firstRow.querySelector(
              ".form-control, input:not([type=hidden]), select, textarea",
            ));
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
      fields.disabled = true;
      submitLabel.setAttribute("data-i18n", "contact.form.submitting");
      submitLabel.textContent = t("contact.form.submitting");

      // Content-Typeは指定しない（ブラウザがmultipart/form-dataの
      // boundaryを含めて自動設定するため、手動指定すると壊れる）。
      var controller = new AbortController();
      var timeout = setTimeout(function () {
        controller.abort();
      }, 30000);
      var response;
      var data;
      try {
        response = await fetch("/api/contact", {
          method: "POST",
          body: payload,
          signal: controller.signal,
        });
        data = await response.json().catch(function () {
          return null;
        });
      } catch (_) {
        // Network failures keep the current draft available for retry.
      } finally {
        clearTimeout(timeout);
        fields.disabled = false;
        submitBtn.disabled = false;
        submitLabel.setAttribute("data-i18n", "contact.form.submit");
        submitLabel.textContent = t("contact.form.submit");
        // The disabled button dropped keyboard focus to <body>; give it back
        // so the next Tab continues from the form, not from the page top.
        if (
          typeof submitBtn.focus === "function" &&
          (!document.activeElement || document.activeElement === document.body)
        )
          submitBtn.focus();
      }

      if (response?.ok && data?.ok === true) {
        form.reset();
        showStatus(
          statusEl,
          "success",
          "contact.status.successTitle",
          "contact.status.successBody",
        );
      } else if (response?.status === 413 && form.elements.attachments) {
        showServerFieldError(
          form,
          "attachments",
          "contact.error.attachmentTotal",
        );
      } else if (
        !(
          data?.error === "validation_error" &&
          showServerFieldError(form, data.field)
        )
      ) {
        showStatus(
          statusEl,
          "error",
          "contact.status.errorTitle",
          response?.status === 429
            ? "contact.status.rateLimitBody"
            : "contact.status.errorBody",
        );
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initContactForm();
    initFileField();
  });
})();
