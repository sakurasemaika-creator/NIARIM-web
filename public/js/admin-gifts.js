/**
 * NIARIM の管理ページ（/admin/）の「クーポン」「プレゼント」の画面。
 *
 * オパールのクーポン（SNSなどで配るコード）とプレゼント（アプリのプレゼント
 * ボックスに届くもの）を作る・一覧で見る・止める。ログイン・確かめるダイアログ・
 * お知らせは /js/admin.js のものを使う（admin.js が create(ctx) を呼ぶ）。
 * 入力の確かめと送る本文は admin-core.js（buildCouponRequest・
 * buildPresentRequest）、文字はすべて textContent で出す。
 */
(() => {
  "use strict";

  const A = window.NiarimAdmin;
  if (!A) return;
  const byId = (id) => document.getElementById(id);
  const LANGUAGE_TAGS = { zh: "zh-Hans", zh_Hant: "zh-Hant" };
  // Sign-in problems keep the page's own sentence (the sign-in box shows it).
  const AUTH_CODES = ["UNAUTHORIZED", "ADMIN_FORBIDDEN", "ADMIN_DISABLED"];

  function create(ctx) {
    const h = ctx.h;
    const api = () => ctx.api();

    const kinds = {
      coupon: {
        view: "coupons",
        noun: "クーポン",
        key: "coupons",
        idOf: (coupon) => coupon.code,
        list: (options) => api().listCoupons(options),
        build: A.buildCouponRequest,
        create: (body) => api().createCoupon(body),
        deactivate: (id) => api().deactivateCoupon(id),
        accountIds: false,
        fromField: "validFrom",
      },
      present: {
        view: "presents",
        noun: "プレゼント",
        key: "presents",
        idOf: (present) => present.id,
        list: (options) => api().listPresents(options),
        build: A.buildPresentRequest,
        create: (body) => api().createPresent(body),
        deactivate: (id) => api().deactivatePresent(id),
        accountIds: true,
        fromField: "visibleFrom",
      },
    };
    for (const [name, kind] of Object.entries(kinds)) {
      Object.assign(kind, {
        name,
        form: byId(`admin-${name}-form`),
        formError: byId(`admin-${name}-error`),
        target: byId(`admin-${name}-target`),
        listEl: byId(`admin-${name}-list`),
        summary: byId(`admin-${name}-summary`),
        status: byId(`admin-${name}-status`),
        more: byId(`admin-${name}-more`),
        reload: byId(`admin-${name}-reload`),
        items: new Map(),
        pager: null,
        generation: 0,
        // null: never asked; "ok" / "failed": how the first page went.
        loaded: null,
      });
    }
    const presentLimit = byId("admin-present-limit");
    const langsBox = byId("admin-present-langs-box");
    const langsCount = byId("admin-present-langs-count");
    // The present made last: its card has the focus after the dialog.
    let lastCreatedId = null;
    const created = {
      box: byId("admin-coupon-created"),
      code: byId("admin-coupon-created-code"),
      copy: byId("admin-coupon-created-copy"),
      summary: byId("admin-coupon-created-summary"),
      status: byId("admin-coupon-created-status"),
    };

    // ---- Errors ---------------------------------------------------------

    /** The page's message, plus what the backend said and its code. */
    function errorText(error) {
      if (error && error.status === 404 && !error.code)
        return "サーバーがこの操作を受け付けませんでした。バックエンドを最新にデプロイしてから、もう一度お試しください。";
      const message = (error && error.message) || "操作できませんでした。";
      const detail = A.serverDetail(error);
      return detail && !message.includes(error.serverMessage)
        ? `${message}\n${detail}`
        : message;
    }

    /** For the confirmation dialog, which shows `error.message`. */
    async function explained(promise) {
      try {
        return await promise;
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          !AUTH_CODES.includes(error.code)
        )
          error.message = errorText(error);
        throw error;
      }
    }

    // ---- The forms --------------------------------------------------------

    function buildLanguageFields() {
      const list = byId("admin-present-langs");
      list.replaceChildren(
        ...A.PRESENT_LANGUAGES.map((language) => {
          const base = `admin-present-${language.code.toLowerCase().replace("_", "-")}`;
          const lang = LANGUAGE_TAGS[language.code] || language.code;
          const field = (part, label, multiline) => {
            const id = `${base}-${part}`;
            const max =
              part === "title" ? A.PRESENT_TITLE_MAX : A.PRESENT_BODY_MAX;
            return h(
              "div",
              { class: "admin-field" },
              h(
                "label",
                { for: id },
                h(
                  "span",
                  { class: "admin-visually-hidden" },
                  `${language.label}の`,
                ),
                label,
              ),
              h(multiline ? "textarea" : "input", {
                id,
                name: `translations.${language.code}.${part}`,
                type: multiline ? null : "text",
                rows: multiline ? "3" : null,
                lang,
                dir: "auto",
                autocomplete: "off",
                "data-count-max": String(max),
                "aria-describedby": `${id}-count ${id}-error`,
              }),
              h("p", {
                class: "admin-small admin-muted admin-count",
                id: `${id}-count`,
              }),
              h("p", { class: "admin-field-error", id: `${id}-error` }),
            );
          };
          return h(
            "fieldset",
            { class: "admin-lang" },
            h(
              "legend",
              null,
              language.label,
              " ",
              h("span", { class: "admin-lang-native", lang }, language.native),
            ),
            field("title", `題（${A.PRESENT_TITLE_MAX}文字まで）`, false),
            field("body", `本文（任意・${A.PRESENT_BODY_MAX}文字まで）`, true),
          );
        }),
      );
    }

    function readForm(kind) {
      const input = { translations: {} };
      for (const element of kind.form.elements) {
        if (!element.name) continue;
        const match = /^translations\.(\w+)\.(title|body)$/.exec(element.name);
        if (match) {
          input.translations[match[1]] ||= {};
          input.translations[match[1]][match[2]] = element.value;
        } else input[element.name] = element.value;
      }
      return input;
    }

    function fieldOf(kind, name) {
      const field = kind.form.elements.namedItem(name);
      return field && field.id ? field : null;
    }

    function clearFieldError(field) {
      field.removeAttribute("aria-invalid");
      const message = byId(`${field.id}-error`);
      if (message) message.textContent = "";
    }

    function clearErrors(kind) {
      kind.formError.textContent = "";
      for (const field of kind.form.querySelectorAll("[aria-invalid]"))
        clearFieldError(field);
    }

    /** Marks each field, says how many there are and moves to the first. */
    function showErrors(kind, errors) {
      let first = null;
      const loose = [];
      for (const { field: name, message } of errors) {
        const field = fieldOf(kind, name);
        const slot = field && byId(`${field.id}-error`);
        if (!slot) {
          loose.push(message);
          continue;
        }
        field.setAttribute("aria-invalid", "true");
        slot.textContent = message;
        if (!first) first = field;
      }
      const marked = errors.length - loose.length;
      kind.formError.textContent = [
        marked ? `入力を確かめてください（${marked}か所）。` : "",
        ...loose,
      ]
        .filter(Boolean)
        .join("\n");
      if (first) {
        const details = first.closest("details");
        if (details) details.open = true;
        first.focus();
      }
    }

    function updateCounter(field) {
      const max = Number(field.dataset.countMax);
      const slot = byId(`${field.id}-count`);
      if (!slot || !max) return;
      const length = Array.from(field.value.trim()).length;
      // Shown once something is typed (an empty count is only clutter).
      slot.textContent = length
        ? `${A.formatCount(length)} / ${A.formatCount(max)}文字`
        : "";
      if (length > max) slot.dataset.over = "true";
      else delete slot.dataset.over;
    }

    function updateTarget(kind) {
      const input = readForm(kind);
      const eligibility = A.previewEligibility(input, {
        accountIds: kind.accountIds,
      });
      kind.target.textContent = `対象：${A.eligibilitySummary(eligibility)}`;
      if (!kind.accountIds) return;
      const count = byId("admin-present-accounts-count");
      const raw = input.accountIds || "";
      if (!raw.trim()) {
        count.textContent = "";
        return;
      }
      const { ids, invalid } = A.parseAccountIds(raw);
      const parts = [`${A.formatCount(ids.length)}件（重なりは1件に数えます）`];
      if (invalid.length) parts.push(`形の違うもの${invalid.length}件`);
      if (ids.length > A.PRESENT_ACCOUNTS_MAX)
        parts.push(`${A.PRESENT_ACCOUNTS_MAX}件を超えています`);
      count.textContent = parts.join("・");
    }

    function updateLanguages() {
      const filled = A.PRESENT_LANGUAGES.filter((language) =>
        ["title", "body"].some((part) => {
          const field = kinds.present.form.elements.namedItem(
            `translations.${language.code}.${part}`,
          );
          return field && field.value.trim();
        }),
      ).length;
      langsCount.textContent = filled ? `（${filled}言語）` : "";
    }

    /** Back to an empty form whose start is now (in Japan time). */
    function resetForm(kind) {
      kind.form.reset();
      clearErrors(kind);
      fieldOf(kind, kind.fromField).value = A.jstInputValue(Date.now());
      for (const field of kind.form.querySelectorAll("[data-count-max]"))
        updateCounter(field);
      updateTarget(kind);
      if (kind.name === "present") {
        langsBox.open = false;
        updateLanguages();
      }
    }

    function factsList(rows) {
      return h(
        "dl",
        { class: "admin-gift-facts" },
        ...rows
          .filter((row) => row && row[1] !== "" && row[1] !== null)
          .flatMap(([term, value, cls]) => [
            h("dt", null, term),
            h("dd", { class: cls }, value),
          ]),
      );
    }

    function confirmRows(kind, body) {
      if (kind.name === "coupon")
        return [
          [
            "クーポンコード",
            body.code
              ? A.displayCouponCode(body.code)
              : "自動で作ります（12文字）",
          ],
          [
            "配るオパール",
            `${A.formatCount(body.coins)}オパール（1アカウント1回）`,
          ],
          ["使える期間", period(body.validFrom, body.validUntil)],
          [
            "使える回数",
            body.maxRedemptions
              ? `先着${A.formatCount(body.maxRedemptions)}回まで`
              : "上限なし",
          ],
          ["使えるアカウント", A.eligibilitySummary(body.eligibility)],
          ["メモ", body.note || "", "admin-note"],
        ];
      const languages = A.translationLabels(body.translations);
      return [
        ["題", body.title],
        ["本文", body.body || "（なし）", "admin-note"],
        ["ほかの言語", languages.length ? languages.join("・") : "（なし）"],
        [
          "配るオパール",
          `${A.formatCount(body.coins)}オパール（1アカウント1回）`,
        ],
        ["表示と受け取りの期間", period(body.visibleFrom, body.claimUntil)],
        ["受け取れるアカウント", A.eligibilitySummary(body.eligibility)],
        ["メモ", body.note || "", "admin-note"],
      ];
    }

    function onSubmit(kind, event) {
      event.preventDefault();
      clearErrors(kind);
      const result = kind.build(readForm(kind), Date.now());
      if (result.errors.length) {
        showErrors(kind, result.errors);
        return;
      }
      if (
        kind.name === "present" &&
        kind.pager?.done &&
        liveCount() >= A.PRESENT_ACTIVE_MAX
      ) {
        kind.formError.textContent = A.ERROR_MESSAGES.PRESENT_LIMIT_REACHED;
        return;
      }
      const body = result.body;
      const present = kind.name === "present";
      ctx.confirmAction({
        title: present ? "プレゼントを作る" : "クーポンを作る",
        text: [
          present
            ? "次の内容でプレゼントを作ります。表示の開始になると、対象のアカウントのプレゼントボックスに届きます。"
            : "次の内容でクーポンを作ります。コードを知っている対象のアカウントが使えます。",
          "作った後は内容を変えられません（止めることはできます）。",
          factsList(confirmRows(kind, body)),
        ],
        submitLabel: present ? "作って届ける" : "作る",
        keys: [`${kind.name}-create`],
        run: () => explained(kind.create(body)),
        done: (data) => onCreated(kind, data),
        focusAfter: () =>
          present ? cardOf(kind, lastCreatedId) : created.code,
      });
    }

    function onCreated(kind, data) {
      const item = data[kind.name];
      kind.items.set(kind.idOf(item), item);
      resetForm(kind);
      render(kind);
      if (kind.name === "coupon") {
        created.code.value = item.displayCode || A.displayCouponCode(item.code);
        created.summary.textContent = [
          `${A.formatCount(item.coins)}オパール`,
          `使える期限 ${A.formatJstDateTime(item.validUntil)}`,
          A.eligibilitySummary(item.eligibility),
        ].join("・");
        created.status.textContent = "";
        created.box.hidden = false;
        created.code.select();
        return;
      }
      lastCreatedId = item.id;
      ctx.notify(`プレゼント「${A.shorten(item.title, 40)}」を作りました。`);
    }

    async function onCreatedCopy() {
      const code = created.code.value;
      if (!code) return;
      if (await ctx.copyText(code)) {
        created.status.textContent = "コピーしました。";
        return;
      }
      ctx.selectText(created.code);
      created.status.textContent =
        "自動でコピーできませんでした。選んだコードを Ctrl+C（Macは⌘+C）でコピーしてください。";
    }

    // ---- The lists --------------------------------------------------------

    function liveCount() {
      const now = Date.now();
      let count = 0;
      for (const present of kinds.present.items.values())
        if (A.presentCountsTowardLimit(present, now)) count++;
      return count;
    }

    function cardOf(kind, id) {
      if (!id) return null;
      return (
        Array.from(kind.listEl.children).find(
          (card) => card.dataset.id === id,
        ) || null
      );
    }

    function sorted(kind) {
      return Array.from(kind.items.values()).sort((a, b) => {
        const diff =
          (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
        return diff || String(kind.idOf(a)).localeCompare(kind.idOf(b));
      });
    }

    function who(at, by) {
      const time = A.formatJstDateTime(at);
      if (!time) return "";
      return by ? `${time}・${A.text(by)}` : time;
    }

    /** The period, broken only between its start and its end. */
    function period(from, until) {
      return [
        h("span", { class: "admin-nowrap" }, `${formatStart(from)} 〜`),
        " ",
        h("span", { class: "admin-nowrap" }, A.formatJstDateTime(until)),
      ];
    }

    function formatStart(from) {
      return A.formatJstDateTime(from) || "作った時";
    }

    function badge(status) {
      return h(
        "span",
        {
          class: "admin-badge admin-gift-status",
          dataset: { kind: status.key },
        },
        status.label,
      );
    }

    function couponCard(coupon, now) {
      const status = A.couponStatus(coupon, now);
      const code = coupon.displayCode || A.displayCouponCode(coupon.code);
      const headingId = `admin-coupon-card-${coupon.code}`;
      const uses = Number.isSafeInteger(coupon.maxRedemptions)
        ? `${A.formatCount(coupon.redeemedCount || 0)}回 / 上限${A.formatCount(coupon.maxRedemptions)}回`
        : `${A.formatCount(coupon.redeemedCount || 0)}回（上限なし）`;
      return h(
        "article",
        {
          class: "admin-card admin-gift-card",
          dataset: { id: coupon.code, status: status.key },
          tabindex: "-1",
          "aria-labelledby": headingId,
        },
        h(
          "div",
          { class: "admin-gift-card-head" },
          h("h3", { class: "admin-gift-code", id: headingId }, code),
          h("div", { class: "admin-badges" }, badge(status)),
        ),
        factsList([
          ["オパール", `${A.formatCount(coupon.coins)}オパール`],
          ["使える期間", period(coupon.validFrom, coupon.validUntil)],
          ["使われた回数", uses],
          ["使えるアカウント", A.eligibilitySummary(coupon.eligibility)],
          ["メモ", A.text(coupon.note), "admin-note"],
          ["作った", who(coupon.createdAt, coupon.createdBy)],
          ["止めた", who(coupon.deactivatedAt, coupon.deactivatedBy)],
        ]),
        h(
          "div",
          { class: "admin-actions" },
          h(
            "button",
            {
              type: "button",
              class: "admin-button",
              dataset: { giftAction: "copy" },
              "aria-label": `クーポンコード ${code} をコピー`,
            },
            "コードをコピー",
          ),
          coupon.active && status.key !== "expired"
            ? h(
                "button",
                {
                  type: "button",
                  class: "admin-button",
                  dataset: { giftAction: "deactivate" },
                  "aria-label": `クーポン ${code} を止める`,
                },
                "止める",
              )
            : null,
        ),
        h("p", {
          class: "admin-message admin-small",
          role: "status",
          "aria-live": "polite",
          dataset: { giftCopyStatus: "" },
        }),
      );
    }

    function presentCard(present, now) {
      const status = A.presentStatus(present, now);
      const languages = A.translationLabels(present.translations);
      const headingId = `admin-present-card-${present.id}`;
      return h(
        "article",
        {
          class: "admin-card admin-gift-card",
          dataset: { id: present.id, status: status.key },
          tabindex: "-1",
          "aria-labelledby": headingId,
        },
        h(
          "div",
          { class: "admin-gift-card-head" },
          h(
            "h3",
            { class: "admin-gift-title", id: headingId, dir: "auto" },
            A.text(present.title) || "（題なし）",
          ),
          h("div", { class: "admin-badges" }, badge(status)),
        ),
        factsList([
          ["オパール", `${A.formatCount(present.coins)}オパール`],
          ["表示の開始", A.formatJstDateTime(present.visibleFrom)],
          ["受け取りの期限", A.formatJstDateTime(present.claimUntil)],
          ["受け取れるアカウント", A.eligibilitySummary(present.eligibility)],
          ["本文", A.text(present.body), "admin-note"],
          ["ほかの言語", languages.length ? languages.join("・") : "なし"],
          ["メモ", A.text(present.note), "admin-note"],
          ["作った", who(present.createdAt, present.createdBy)],
          ["止めた", who(present.deactivatedAt, present.deactivatedBy)],
          ["ID", h("code", null, A.text(present.id))],
        ]),
        present.active && status.key !== "expired"
          ? h(
              "div",
              { class: "admin-actions" },
              h(
                "button",
                {
                  type: "button",
                  class: "admin-button",
                  dataset: { giftAction: "deactivate" },
                  "aria-label": `プレゼント「${A.shorten(present.title, 40)}」を止める`,
                },
                "止める",
              ),
            )
          : null,
      );
    }

    function renderLimit() {
      const kind = kinds.present;
      if (!kind.loaded) {
        presentLimit.textContent = "";
        delete presentLimit.dataset.full;
        return;
      }
      const count = liveCount();
      const partial = !kind.pager?.done;
      const full = !partial && count >= A.PRESENT_ACTIVE_MAX;
      presentLimit.textContent =
        `期限前のプレゼント（表示前を含む）：${count}件${partial ? "以上" : ""} / 同時に${A.PRESENT_ACTIVE_MAX}件まで` +
        (full ? "。新しく作るには、どれかを止めてください。" : "");
      if (full) presentLimit.dataset.full = "true";
      else delete presentLimit.dataset.full;
    }

    function render(kind) {
      const now = Date.now();
      const items = sorted(kind);
      kind.listEl.replaceChildren(
        ...items.map((item) =>
          kind.name === "coupon"
            ? couponCard(item, now)
            : presentCard(item, now),
        ),
      );
      const more = kind.pager && !kind.pager.done;
      kind.summary.textContent = items.length
        ? `${items.length}件（作った日時の新しい順）` +
          (more ? "。まだ続きがあります。" : "")
        : "";
      if (!items.length && kind.loaded === "ok")
        kind.status.textContent = `まだ${kind.noun}はありません。`;
      else if (kind.status.textContent === `まだ${kind.noun}はありません。`)
        kind.status.textContent = "";
      if (kind.name === "present") renderLimit();
    }

    function reload(kind) {
      kind.generation++;
      kind.items.clear();
      kind.listEl.replaceChildren();
      kind.summary.textContent = "";
      kind.status.textContent = "";
      kind.more.hidden = true;
      kind.loaded = null;
      if (kind.name === "present") renderLimit();
      if (!api()) return;
      kind.pager = A.createGiftPager(kind.list, kind.key, kind.idOf);
      loadMore(kind);
    }

    async function loadMore(kind) {
      const pager = kind.pager;
      if (!pager || pager.loading) return;
      const generation = kind.generation;
      kind.status.textContent = "読み込んでいます…";
      kind.more.disabled = true;
      kind.listEl.setAttribute("aria-busy", "true");
      try {
        const page = await pager.next();
        if (generation !== kind.generation || page === null) return;
        for (const item of page) kind.items.set(kind.idOf(item), item);
        kind.status.textContent = "";
        kind.loaded = "ok";
        render(kind);
      } catch (error) {
        if (generation !== kind.generation) return;
        kind.loaded = kind.loaded || "failed";
        if (ctx.handleAuthError(error)) {
          kind.status.textContent = "";
          return;
        }
        kind.status.textContent = errorText(error);
      } finally {
        if (generation === kind.generation) {
          kind.more.hidden = pager.done;
          kind.more.disabled = false;
          kind.listEl.removeAttribute("aria-busy");
        }
      }
    }

    async function copyCard(card, coupon) {
      const code = coupon.displayCode || A.displayCouponCode(coupon.code);
      const slot = card.querySelector("[data-gift-copy-status]");
      if (await ctx.copyText(code)) {
        slot.textContent = `${code} をコピーしました。`;
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(card.querySelector(".admin-gift-code"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      slot.textContent =
        "自動でコピーできませんでした。選んだコードを Ctrl+C（Macは⌘+C）でコピーしてください。";
    }

    function deactivate(kind, item) {
      const id = kind.idOf(item);
      const coupon = kind.name === "coupon";
      const name = coupon
        ? `「${item.displayCode || A.displayCouponCode(item.code)}」`
        : `「${A.shorten(item.title, 40)}」`;
      ctx.confirmAction({
        title: `${kind.noun}を止める`,
        text: [
          coupon
            ? `クーポン${name}を止めます。止めると、まだ使っていない人もこのコードを使えなくなります。`
            : `プレゼント${name}を止めます。止めると、まだ受け取っていない人のプレゼントボックスから消え、受け取れなくなります。`,
          "すでに受け取ったオパールはそのままです。止めた後は元に戻せません。",
        ],
        submitLabel: "止める",
        keys: [`${kind.name}:${id}`],
        run: () => explained(kind.deactivate(id)),
        done(data) {
          const updated = data[kind.name];
          if (updated && kind.idOf(updated) === id) kind.items.set(id, updated);
          render(kind);
          ctx.notify(`${kind.noun}${name}を止めました。`);
        },
        focusAfter: () => cardOf(kind, id),
        onStale: () => reload(kind),
      });
    }

    function onListClick(kind, event) {
      const button = event.target.closest("button[data-gift-action]");
      if (!button) return;
      const card = button.closest(".admin-gift-card");
      const item = card && kind.items.get(card.dataset.id);
      if (!item) return;
      if (button.dataset.giftAction === "copy") copyCard(card, item);
      else if (button.dataset.giftAction === "deactivate")
        deactivate(kind, item);
    }

    // ---- Wiring -----------------------------------------------------------

    buildLanguageFields();
    for (const kind of Object.values(kinds)) {
      kind.form.addEventListener("submit", (event) => onSubmit(kind, event));
      kind.form.addEventListener("input", (event) => {
        const field = event.target;
        if (field.getAttribute("aria-invalid")) clearFieldError(field);
        if (field.dataset.countMax) updateCounter(field);
        if (field.closest("[data-eligibility]")) updateTarget(kind);
        if (field.name?.startsWith("translations.")) updateLanguages();
      });
      kind.reload.addEventListener("click", () => reload(kind));
      kind.more.addEventListener("click", () => loadMore(kind));
      kind.listEl.addEventListener("click", (event) =>
        onListClick(kind, event),
      );
      resetForm(kind);
    }
    created.copy.addEventListener("click", onCreatedCopy);

    function clearCreated() {
      created.code.value = "";
      created.summary.textContent = "";
      created.status.textContent = "";
      created.box.hidden = true;
    }

    return {
      /** Shows a view: its list is read the first time (and after a failed
       *  first read). */
      show(view) {
        for (const kind of Object.values(kinds))
          if (kind.view === view && kind.loaded !== "ok") {
            if (kind.pager?.loading) return;
            reload(kind);
          }
      },
      /** Everything goes on sign-out or when another account signs in. */
      reset() {
        for (const kind of Object.values(kinds)) {
          kind.generation++;
          kind.items.clear();
          kind.pager = null;
          kind.loaded = null;
          kind.listEl.replaceChildren();
          kind.summary.textContent = "";
          kind.status.textContent = "";
          kind.more.hidden = true;
          resetForm(kind);
        }
        renderLimit();
        clearCreated();
        lastCreatedId = null;
      },
    };
  }

  window.NiarimAdminGifts = { create };
})();
