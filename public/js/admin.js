/**
 * NIARIM 通報の管理（/admin/）の画面。
 *
 * GoogleのIDトークンはこのタブのメモリーにだけ置き（localStorage・Cookieには
 * 書かない）、期限が切れたら・401が返ったら、もう一度ログインしてもらう。
 * 通報・作品・アカウントの文字はすべて textContent で出す（admin-core.js の
 * createElementFactory。HTMLとして解釈する経路を持たない）。
 */
(() => {
  "use strict";

  const A = window.NiarimAdmin;
  if (!A) return;
  const h = A.createElementFactory(document);
  const byId = (id) => document.getElementById(id);

  const el = {
    setup: byId("admin-setup"),
    setupDetail: byId("admin-setup-detail"),
    setupRetry: byId("admin-setup-retry"),
    signIn: byId("admin-sign-in"),
    google: byId("admin-google"),
    signInStatus: byId("admin-sign-in-status"),
    signInRetry: byId("admin-sign-in-retry"),
    app: byId("admin-app"),
    account: byId("admin-account"),
    email: byId("admin-email"),
    signOut: byId("admin-sign-out"),
    notice: byId("admin-notice"),
    aiForm: byId("admin-ai-form"),
    aiOptions: byId("admin-ai-options"),
    aiCurrent: byId("admin-ai-current"),
    aiSave: byId("admin-ai-save"),
    aiNote: byId("admin-ai-note"),
    rules: byId("admin-rules"),
    tabs: Array.from(document.querySelectorAll('[role="tab"][data-status]')),
    order: byId("admin-order"),
    reload: byId("admin-reload"),
    queueSummary: byId("admin-queue-summary"),
    queueStatus: byId("admin-queue-status"),
    queue: byId("admin-queue"),
    more: byId("admin-more"),
    confirm: byId("admin-confirm"),
    confirmForm: byId("admin-confirm-form"),
    confirmTitle: byId("admin-confirm-title"),
    confirmText: byId("admin-confirm-text"),
    confirmFields: byId("admin-confirm-fields"),
    confirmError: byId("admin-confirm-error"),
    confirmCancel: byId("admin-confirm-cancel"),
    confirmSubmit: byId("admin-confirm-submit"),
    detail: byId("admin-detail"),
    detailStatus: byId("admin-detail-status"),
    detailContent: byId("admin-detail-content"),
    detailClose: byId("admin-detail-close"),
  };

  const AUTH_CODES = ["UNAUTHORIZED", "ADMIN_FORBIDDEN", "ADMIN_DISABLED"];
  const STALE_CODES = [
    "REPORT_RESOLVED",
    "REPORT_CHANGED",
    "MODERATION_CHANGED",
    "NOT_FOUND",
  ];
  const TOKEN_MARGIN_MS = 60000;

  const state = {
    api: null,
    gis: null,
    clientId: "",
    token: null,
    tokenExpiresAt: 0,
    email: "",
    settings: null,
    tab: "pending",
    orders: { pending: "oldest", reviewing: "oldest", resolved: "newest" },
    pager: null,
    generation: 0,
    reports: new Map(),
    cards: new Map(),
    busy: new Set(),
    detailId: null,
    detailReport: null,
    detailRelated: [],
    detailGeneration: 0,
    detailReturnFocus: null,
    confirmJob: null,
  };

  let fieldCount = 0;
  const fieldId = () => `admin-field-${++fieldCount}`;

  // ---- Sign-in -----------------------------------------------------------

  function getToken() {
    if (!state.token) return null;
    if (Date.now() >= state.tokenExpiresAt - TOKEN_MARGIN_MS) {
      state.token = null;
      return null;
    }
    return state.token;
  }

  function showSignInMessage(message) {
    el.signInStatus.textContent = message || "";
  }

  function renderGoogleButton() {
    if (!state.gis) return;
    el.google.replaceChildren();
    try {
      state.gis.renderButton(el.google, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        locale: "ja",
      });
    } catch {
      showSignInMessage(
        "Googleのログインのボタンを出せませんでした。読み込み直してください。",
      );
      el.signInRetry.hidden = false;
    }
  }

  function loadGoogle() {
    return new Promise((resolve, reject) => {
      const ready = () => window.google?.accounts?.id;
      if (ready()) return resolve(ready());
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => (ready() ? resolve(ready()) : reject(new Error()));
      script.onerror = () => reject(new Error());
      document.head.append(script);
    });
  }

  /** The app's data stays on screen (inert) until the same account is back. */
  function requireSignIn(message) {
    state.token = null;
    state.tokenExpiresAt = 0;
    closeConfirm(false);
    closeDetail();
    el.signIn.hidden = false;
    el.signInRetry.hidden = true;
    showSignInMessage(message);
    if (!el.app.hidden) {
      el.app.inert = true;
      el.app.classList.add("is-locked");
    }
    renderGoogleButton();
    el.signIn.scrollIntoView({ block: "start" });
    const heading = el.signIn.querySelector("h2");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }

  function handleAuthError(error) {
    if (!error || !AUTH_CODES.includes(error.code)) return false;
    requireSignIn(error.message);
    return true;
  }

  async function onCredential(response) {
    const credential = response && response.credential;
    if (typeof credential !== "string" || !credential) {
      showSignInMessage(
        "Googleのログインを確かめられませんでした。もう一度お試しください。",
      );
      return;
    }
    state.token = credential;
    state.tokenExpiresAt = A.tokenExpiry(credential) || Date.now() + 55 * 60000;
    showSignInMessage("管理の権限を確かめています…");
    let me;
    try {
      me = await state.api.me();
    } catch (error) {
      state.token = null;
      if (error.code === "ADMIN_FORBIDDEN") state.gis?.disableAutoSelect?.();
      showSignInMessage(error.message);
      return;
    }
    const sameAccount = state.email && state.email === me.email;
    const resumed = sameAccount && !el.app.hidden;
    state.email = A.text(me.email);
    state.settings =
      me.settings && typeof me.settings === "object" ? me.settings : {};
    el.email.textContent = state.email;
    el.account.hidden = false;
    el.signIn.hidden = true;
    showSignInMessage("");
    el.app.hidden = false;
    el.app.inert = false;
    el.app.classList.remove("is-locked");
    renderSettings();
    if (resumed) {
      notify("もう一度ログインしました。続けて操作できます。");
      syncBusy();
      // The list was being (re)loaded when the sign-in ran out.
      if (!state.reports.size) reloadList();
    } else {
      closeDetail();
      el.notice.hidden = true;
      selectTab(state.tab);
    }
  }

  function signOut() {
    state.token = null;
    state.tokenExpiresAt = 0;
    state.email = "";
    state.settings = null;
    state.gis?.disableAutoSelect?.();
    closeConfirm(false);
    closeDetail();
    state.generation++;
    state.pager = null;
    state.reports.clear();
    state.cards.clear();
    el.queue.replaceChildren();
    el.queueSummary.textContent = "";
    setQueueStatus("");
    el.more.hidden = true;
    el.aiOptions.replaceChildren();
    el.aiCurrent.textContent = "";
    el.rules.replaceChildren();
    el.notice.hidden = true;
    el.app.hidden = true;
    el.app.inert = false;
    el.app.classList.remove("is-locked");
    el.account.hidden = true;
    el.email.textContent = "";
    el.signIn.hidden = false;
    showSignInMessage("ログアウトしました。");
    renderGoogleButton();
  }

  async function initialize() {
    el.setup.hidden = true;
    el.signIn.hidden = false;
    el.signInRetry.hidden = true;
    showSignInMessage("読み込んでいます…");
    let response;
    let config = null;
    try {
      response = await fetch("/api/admin/config", {
        cache: "no-store",
        credentials: "same-origin",
      });
      config = await response.json().catch(() => null);
    } catch {
      showSignInMessage(
        "管理ページの設定を読み込めませんでした。通信の状態を確かめて、読み込み直してください。",
      );
      el.signInRetry.hidden = false;
      return;
    }
    if (
      !response.ok ||
      !config ||
      typeof config.clientId !== "string" ||
      !A.safeHttpUrl(config.apiBaseUrl)
    ) {
      el.signIn.hidden = true;
      el.setup.hidden = false;
      const missing = Array.isArray(config?.missing)
        ? config.missing.map(A.text).filter(Boolean)
        : [];
      el.setupDetail.textContent = missing.length
        ? `次の設定がありません：${missing.join("、")}`
        : `設定を読み込めませんでした（${response.status}）。このページはサイトのWorker（本番か wrangler dev）から開いてください。`;
      return;
    }
    state.clientId = config.clientId;
    state.api = A.createAdminApi({ baseUrl: config.apiBaseUrl, getToken });
    showSignInMessage("Googleのログインを読み込んでいます…");
    try {
      state.gis = await loadGoogle();
      state.gis.initialize({
        client_id: state.clientId,
        callback: onCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        ux_mode: "popup",
      });
      renderGoogleButton();
      showSignInMessage("");
    } catch {
      showSignInMessage(
        "Googleのログインを読み込めませんでした。広告やスクリプトを止める拡張機能・通信の状態を確かめて、読み込み直してください。",
      );
      el.signInRetry.hidden = false;
    }
  }

  // ---- Notices -----------------------------------------------------------

  function notify(message) {
    el.notice.replaceChildren(
      h("span", { class: "admin-notice-text" }, message),
      h(
        "button",
        { type: "button", class: "admin-button admin-notice-close" },
        "閉じる",
      ),
    );
    el.notice.hidden = false;
  }

  function setQueueStatus(message) {
    el.queueStatus.textContent = message || "";
  }

  // ---- Settings ------------------------------------------------------------

  function selectedAiMode() {
    return el.aiOptions.querySelector('input[name="ai-mode"]:checked')?.value;
  }

  function renderSettings() {
    const s = state.settings || {};
    el.aiOptions.replaceChildren(
      ...A.aiModeOptions(s).map((option) =>
        h(
          "label",
          { class: "admin-choice" },
          h("input", {
            type: "radio",
            name: "ai-mode",
            value: option.value,
            checked: option.value === s.aiMode,
          }),
          h("span", null, option.label),
        ),
      ),
    );
    el.aiCurrent.textContent = `いまの設定：${A.aiModeLabel(s.aiMode, s)}（${A.aiModeSourceLabel(s.aiModeSource)}）`;
    el.aiSave.disabled = true;
    el.aiNote.textContent =
      "AIは、サーバーにAPIキー（/niarim/moderation/anthropic-api-key）が設定されているときだけ動きます。" +
      `費用の目安は通報1件あたり約$0.01〜0.02です。判定は1日${A.text(s.aiDailyCap) || "?"}件までで、それを超えた分は判定しません。` +
      "AIの判定は参考で、決めるのは運営です。";
    const rule = (term, value) => [h("dt", null, term), h("dd", null, value)];
    el.rules.replaceChildren(
      ...rule(
        "自動で一時非表示",
        s.reportHideThreshold > 0
          ? `未対応の通報をした人が${s.reportHideThreshold}人に達したとき`
          : "しない",
      ),
      ...rule(
        "投稿の自動停止",
        s.strikeSuspendThreshold > 0
          ? `違反が${s.strikeSuspendThreshold}回になったとき`
          : "しない",
      ),
      ...rule(
        "通報のお知らせメール",
        `1日${A.text(s.mailDailyCap) || "?"}通まで`,
      ),
    );
  }

  function onAiSubmit(event) {
    event.preventDefault();
    const s = state.settings || {};
    const mode = selectedAiMode();
    if (!mode || mode === s.aiMode) return;
    confirmAction({
      title: "AIの判定の設定を変える",
      text: [
        `「${A.aiModeLabel(s.aiMode, s)}」から「${A.aiModeLabel(mode, s)}」に変えます。`,
        "ここで選んだ設定は、サーバーの既定（デプロイの設定）より優先されます。通報の処理に効くまで最長1分ほどかかります。",
      ],
      submitLabel: "変える",
      keys: ["settings"],
      run: () => state.api.updateSettings({ aiMode: mode }),
      done(result) {
        state.settings = { ...state.settings, ...(result.settings || {}) };
        renderSettings();
        notify(
          `AIの判定の設定を「${A.aiModeLabel(state.settings.aiMode, state.settings)}」にしました。`,
        );
      },
      focusAfter: () => el.aiSave,
    });
  }

  // ---- Queue ---------------------------------------------------------------

  function selectTab(status, focus) {
    state.tab = status;
    for (const tab of el.tabs) {
      const on = tab.dataset.status === status;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    }
    el.queue.setAttribute("aria-labelledby", `admin-tab-${status}`);
    el.order.value = state.orders[status];
    reloadList();
  }

  function reloadList() {
    state.generation++;
    state.reports.clear();
    state.cards.clear();
    el.queue.replaceChildren();
    el.queueSummary.textContent = "";
    el.more.hidden = true;
    if (!state.api) return;
    state.pager = A.createReportPager(state.api, {
      status: state.tab,
      order: state.orders[state.tab],
      limit: 20,
    });
    loadMore();
  }

  function emptyMessage() {
    return `${A.STATUS_LABELS[state.tab]}の通報はありません。`;
  }

  function updateSummary() {
    const reports = Array.from(state.reports.values());
    if (!reports.length) {
      el.queueSummary.textContent = "";
      return;
    }
    let summary = `表示中：${reports.length}件`;
    if (state.tab !== "resolved") {
      const late = reports.filter((report) => {
        const waiting =
          report.status !== "resolved" && A.waitingInfo(report.createdAt);
        return waiting && waiting.level !== "ok";
      }).length;
      summary += `・${A.WARN_BUSINESS_DAYS}営業日以上待っている通報：${late}件`;
    }
    el.queueSummary.textContent = summary;
  }

  async function loadMore() {
    const pager = state.pager;
    if (!pager || pager.loading || pager.done) return;
    const generation = state.generation;
    el.more.disabled = true;
    el.more.textContent = "読み込んでいます…";
    setQueueStatus("読み込んでいます…");
    try {
      const reports = await pager.next();
      if (generation !== state.generation || reports === null) return;
      for (const report of reports) {
        state.reports.set(report.reportId, report);
        const card = renderCard(report);
        state.cards.set(report.reportId, card);
        el.queue.append(card);
      }
      setQueueStatus(state.reports.size ? "" : emptyMessage());
      updateSummary();
    } catch (error) {
      if (generation !== state.generation) return;
      setQueueStatus(error.message || "通報を読み込めませんでした。");
      handleAuthError(error);
    } finally {
      if (generation === state.generation) {
        el.more.disabled = false;
        el.more.textContent = "もっと読み込む";
        el.more.hidden = pager.done;
      }
    }
  }

  // ---- Cards -----------------------------------------------------------------

  function badge(label, kind) {
    return h("span", { class: "admin-badge", dataset: { kind } }, label);
  }

  function block(title, ...children) {
    return h(
      "section",
      { class: "admin-block" },
      h("h4", null, title),
      ...children,
    );
  }

  function targetName(report) {
    return report.targetType === "account" ? "アカウント" : "作品";
  }

  function busyKeys(report) {
    if (!report) return [];
    return [
      "report:" + report.reportId,
      report.workId && "work:" + report.workId,
      report.author?.userId && "user:" + report.author.userId,
    ].filter(Boolean);
  }

  function isBusy(report) {
    return busyKeys(report).some((key) => state.busy.has(key));
  }

  function renderWork(work, detailed) {
    if (!work) return null;
    if (!work.available) {
      return block(
        "作品",
        h(
          "p",
          null,
          work.deleted ? "作品は削除されています。" : "作品が見つかりません。",
        ),
        h(
          "p",
          { class: "admin-small admin-muted" },
          `作品ID：${A.text(work.workId)}`,
        ),
      );
    }
    const s = state.settings || {};
    const thumbnail = A.safeThumbnailUrl(
      work.thumbnailUrl,
      work.youtubeVideoId,
    );
    const link = A.safeYoutubeUrl(work.youtubeUrl, work.youtubeVideoId);
    const badges = [];
    if (work.moderationHidden) {
      badges.push(
        work.autoHidden
          ? badge(
              `自動で一時非表示（${A.autoHiddenReasonLabel(work.autoHiddenReason, s)}）`,
              "warn",
            )
          : badge("運営が非表示", "hidden"),
      );
    }
    if (work.strikeRecorded) badges.push(badge("違反を記録済み", "hidden"));
    if (work.isNiarimPublished === false)
      badges.push(badge("作品広場に非公開"));
    if (work.youtubePrivacyStatus)
      badges.push(
        badge(A.labelOf(A.PRIVACY_LABELS, work.youtubePrivacyStatus)),
      );
    const tags = Array.isArray(work.tags)
      ? work.tags.map(A.text).filter(Boolean)
      : [];
    const hiddenAt = work.hiddenAt || work.autoHiddenAt;
    return h(
      "section",
      { class: "admin-block admin-work" },
      h("h4", null, "作品"),
      h(
        "div",
        { class: "admin-work-body" },
        thumbnail
          ? h("img", {
              class: "admin-thumb",
              src: thumbnail,
              alt: "",
              width: "320",
              height: "180",
              loading: "lazy",
              decoding: "async",
              referrerpolicy: "no-referrer",
            })
          : null,
        h(
          "div",
          { class: "admin-work-text" },
          h(
            "p",
            { class: "admin-work-title", dir: "auto" },
            A.text(work.title) || "（題なし）",
          ),
          badges.length ? h("p", { class: "admin-badges" }, badges) : null,
          work.description
            ? h(
                "p",
                { class: "admin-description", dir: "auto" },
                detailed
                  ? A.text(work.description)
                  : A.shorten(work.description, 240),
              )
            : null,
          tags.length
            ? h(
                "ul",
                { class: "admin-tags", "aria-label": "タグ" },
                tags.map((tag) => h("li", { dir: "auto" }, tag)),
              )
            : null,
          h(
            "p",
            { class: "admin-small admin-muted" },
            `投稿：${A.formatJstDateTime(work.postedAt) || "不明"}・作品ID：${A.text(work.workId)}`,
          ),
          hiddenAt
            ? h(
                "p",
                { class: "admin-small admin-muted" },
                `非表示にした日時：${A.formatJstDateTime(hiddenAt)}` +
                  (work.hiddenBy ? `（${A.text(work.hiddenBy)}）` : ""),
              )
            : null,
          link
            ? h(
                "p",
                null,
                h(
                  "a",
                  {
                    class: "admin-link",
                    href: link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                  "YouTubeで開く（新しいタブ）",
                ),
              )
            : null,
        ),
      ),
    );
  }

  function renderAuthor(report) {
    const author = report.author;
    const title =
      report.targetType === "account" ? "通報されたアカウント" : "投稿者";
    if (!author) return null;
    if (!author.available) {
      return block(
        title,
        h("p", null, "アカウントは削除されたか、見つかりません。"),
        h(
          "p",
          { class: "admin-small admin-muted" },
          `ID：${A.text(author.userId)}`,
        ),
      );
    }
    const s = state.settings || {};
    const count = Number(author.strikeCount) || 0;
    const strikes =
      s.strikeSuspendThreshold > 0
        ? `違反：${count}回 / ${s.strikeSuspendThreshold}回（${s.strikeSuspendThreshold}回で投稿を自動停止）`
        : `違反：${count}回`;
    return block(
      title,
      h(
        "p",
        { class: "admin-author-name", dir: "auto" },
        A.text(author.displayName) || "（名前なし）",
      ),
      h(
        "p",
        { class: "admin-small admin-muted" },
        `ID：${A.text(author.userId)}`,
      ),
      h(
        "p",
        { class: "admin-strikes" },
        strikes,
        author.lastStrikeAt
          ? `・最後の違反：${A.formatJstDateTime(author.lastStrikeAt)}`
          : "",
      ),
      author.postingSuspended
        ? h(
            "div",
            { class: "admin-suspension" },
            h(
              "p",
              null,
              badge("投稿停止中", "warn"),
              ` ${A.formatJstDateTime(author.postingSuspendedAt)}・` +
                (author.postingSuspendedBy === "auto"
                  ? "違反の回数で自動停止"
                  : `${A.text(author.postingSuspendedBy) || "運営"}が停止`),
            ),
            author.postingSuspendedReason
              ? h(
                  "p",
                  { dir: "auto" },
                  `理由：${A.text(author.postingSuspendedReason)}`,
                )
              : null,
          )
        : h("p", null, badge("投稿できます", "ok")),
    );
  }

  function renderReview(report) {
    if (!report.reviewedAt && !report.reviewedBy && !report.reviewNote)
      return null;
    const parts = [];
    if (report.decision)
      parts.push(A.labelOf(A.DECISION_LABELS, report.decision));
    if (report.reviewedAt) parts.push(A.formatJstDateTime(report.reviewedAt));
    if (report.reviewedBy)
      parts.push(
        report.status === "reviewing"
          ? `確認を始めた人：${A.text(report.reviewedBy)}`
          : A.text(report.reviewedBy),
      );
    return block(
      "対応の記録",
      h("p", null, parts.join("・")),
      report.reviewNote
        ? h(
            "p",
            { class: "admin-note", dir: "auto" },
            `メモ：${A.text(report.reviewNote)}`,
          )
        : null,
    );
  }

  function actionButton(report, action, label, busy) {
    return h(
      "button",
      {
        type: "button",
        class: "admin-button",
        dataset: { action, reportId: report.reportId },
        disabled: busy && action !== "detail",
      },
      label,
    );
  }

  function renderActions(report, detailed) {
    const busy = isBusy(report);
    const buttons = [];
    const add = (action, label) =>
      buttons.push(actionButton(report, action, label, busy));
    if (report.status === "pending") add("review", "確認中にする");
    if (report.status !== "resolved") {
      add("dismiss", "却下（問題なし）");
      add("hide", "違反として非表示");
    }
    if (report.work?.available && report.work.moderationHidden)
      add("unhide", "作品を再表示");
    if (report.author?.available)
      add(
        report.author.postingSuspended ? "unsuspend" : "suspend",
        report.author.postingSuspended ? "停止を解除" : "投稿を停止",
      );
    if (!detailed) add("detail", "詳細を見る");
    return h("div", { class: "admin-actions" }, buttons);
  }

  function renderCard(report, options) {
    const detailed = Boolean(options && options.detailed);
    const s = state.settings || {};
    const waiting =
      report.status !== "resolved" ? A.waitingInfo(report.createdAt) : null;
    const titleId = `admin-card-${report.reportId}${detailed ? "-detail" : ""}`;
    const status = A.labelOf(A.STATUS_LABELS, report.status);
    const triage = A.aiTriageView(report.aiTriage);
    const badges = [badge(status, report.status)];
    if (report.decision)
      badges.push(badge(A.labelOf(A.DECISION_LABELS, report.decision)));
    if (waiting && waiting.level !== "ok")
      badges.push(
        badge(waiting.level === "overdue" ? "期限超過" : "期限が近い", "warn"),
      );
    const card = h(
      "article",
      {
        class: "admin-card",
        tabindex: "-1",
        "aria-labelledby": titleId,
        "aria-busy": isBusy(report) ? "true" : null,
        dataset: {
          reportId: report.reportId,
          status: report.status,
          waiting: waiting ? waiting.level : null,
        },
      },
      h(
        "header",
        { class: "admin-card-head" },
        h(
          "h3",
          { id: titleId, class: "admin-card-title" },
          `${targetName(report)}への通報`,
        ),
        h("p", { class: "admin-badges" }, badges),
        h(
          "p",
          { class: "admin-meta" },
          `受付：${A.formatJstDateTime(report.createdAt) || "不明"}`,
          waiting
            ? h(
                "span",
                { class: "admin-waiting" },
                waiting.summary,
                h(
                  "span",
                  { class: "admin-nowrap" },
                  `（期限の目安：${waiting.deadlineLabel}）`,
                ),
              )
            : null,
        ),
      ),
      block(
        "通報の理由",
        h("p", { class: "admin-reason", dir: "auto" }, A.text(report.reason)),
      ),
      h(
        "p",
        { class: "admin-counts" },
        `この${targetName(report)}への未対応の通報：${A.text(report.openReportCount) || 0}件` +
          `（通報した人：${A.text(report.reporterCount) || 0}人）・これまでの通報：${A.text(report.totalReportCount) || 0}件` +
          (s.reportHideThreshold > 0 && report.targetType !== "account"
            ? `・${s.reportHideThreshold}人で自動の一時非表示`
            : ""),
      ),
      h(
        "section",
        {
          class: "admin-block admin-ai",
          dataset: { ai: triage.state, severity: triage.severity },
        },
        h("h4", null, "AIの判定（参考）"),
        h("p", null, triage.summary),
        triage.rationale
          ? h("p", { class: "admin-rationale", dir: "auto" }, triage.rationale)
          : null,
        triage.triagedAt
          ? h(
              "p",
              { class: "admin-small admin-muted" },
              `判定：${triage.triagedAt}${triage.model ? `・${triage.model}` : ""}`,
            )
          : null,
      ),
      renderWork(report.work, detailed),
      renderAuthor(report),
      renderReview(report),
      renderActions(report, detailed),
    );
    return card;
  }

  function relatedList(report, related) {
    if (!Array.isArray(related) || !related.length) return null;
    return h(
      "section",
      { class: "admin-related" },
      h(
        "h3",
        null,
        `同じ${targetName(report)}への通報（${related.length}件・新しい順）`,
      ),
      h(
        "ol",
        { class: "admin-related-list" },
        related.map((item) =>
          h(
            "li",
            { class: "admin-related-item" },
            h(
              "p",
              { class: "admin-badges" },
              badge(A.labelOf(A.STATUS_LABELS, item.status), item.status),
              item.decision
                ? badge(A.labelOf(A.DECISION_LABELS, item.decision))
                : null,
              item.reportId === report.reportId
                ? badge("この通報", "current")
                : null,
            ),
            h(
              "p",
              { class: "admin-small admin-muted" },
              `受付：${A.formatJstDateTime(item.createdAt)}・通報者ID：${A.text(item.reporterId)}`,
            ),
            h("p", { class: "admin-reason", dir: "auto" }, A.text(item.reason)),
            h(
              "p",
              { class: "admin-small" },
              `AI：${A.aiTriageView(item.aiTriage).summary}`,
            ),
            item.reviewedAt || item.reviewedBy
              ? h(
                  "p",
                  { class: "admin-small admin-muted" },
                  `対応：${A.formatJstDateTime(item.reviewedAt)} ${A.text(item.reviewedBy)}`.trim(),
                )
              : null,
            item.reviewNote
              ? h(
                  "p",
                  { class: "admin-note", dir: "auto" },
                  `メモ：${A.text(item.reviewNote)}`,
                )
              : null,
          ),
        ),
      ),
    );
  }

  function renderDetail() {
    const report = state.detailReport;
    if (!report) {
      el.detailContent.replaceChildren();
      return;
    }
    el.detailContent.replaceChildren(
      renderCard(report, { detailed: true }),
      relatedList(report, state.detailRelated) || "",
    );
  }

  function focusCard(reportId, action) {
    const card =
      (el.detail.open && state.detailId === reportId
        ? el.detailContent.querySelector(".admin-card")
        : null) || state.cards.get(reportId);
    if (!card || !card.isConnected) return;
    const button = action
      ? Array.from(card.querySelectorAll("button[data-action]")).find(
          (b) => b.dataset.action === action && !b.disabled,
        )
      : null;
    (button || card).focus();
  }

  /** Replaces a report everywhere it is shown, keeping keyboard focus. */
  function putReport(report) {
    if (!report || typeof report.reportId !== "string") return;
    const id = report.reportId;
    const old = state.cards.get(id);
    if (old) {
      const active = document.activeElement;
      const focused = old.contains(active) ? active.dataset.action || "" : null;
      state.reports.set(id, report);
      const next = renderCard(report);
      old.replaceWith(next);
      state.cards.set(id, next);
      if (focused !== null) focusCard(id, focused);
    }
    if (state.detailId === id) {
      const active = document.activeElement;
      const focused = el.detailContent.contains(active)
        ? active.dataset.action || ""
        : null;
      state.detailReport = report;
      renderDetail();
      if (focused !== null) focusCard(id, focused);
    }
    updateSummary();
  }

  function shownReports() {
    const reports = new Map(state.reports);
    if (state.detailReport)
      reports.set(state.detailReport.reportId, state.detailReport);
    return Array.from(reports.values());
  }

  function propagateUser(user) {
    if (!user || !user.userId) return;
    for (const report of shownReports())
      if (report.author && report.author.userId === user.userId)
        putReport({ ...report, author: user });
  }

  function propagateWork(work) {
    if (!work || !work.workId) return;
    for (const report of shownReports())
      if (report.workId === work.workId) putReport({ ...report, work });
  }

  async function refreshReport(reportId) {
    try {
      const result = await state.api.getReport(reportId);
      putReport(result.report);
    } catch (error) {
      if (!handleAuthError(error) && error.code === "NOT_FOUND") {
        const card = state.cards.get(reportId);
        if (card) card.dataset.stale = "true";
      }
    }
  }

  /** One decision resolves every open report on the same target. */
  async function refreshSiblings(acted, workId, includeActed) {
    const key = A.targetKey(acted);
    const others = shownReports().filter(
      (report) =>
        (includeActed || report.reportId !== acted.reportId) &&
        report.status !== "resolved" &&
        (A.targetKey(report) === key || (workId && report.workId === workId)),
    );
    for (const report of others) await refreshReport(report.reportId);
    if (el.detail.open && state.detailId) loadDetail(state.detailId);
  }

  function syncBusy() {
    const apply = (card, report) => {
      if (!card || !report) return;
      const busy = isBusy(report);
      if (busy) card.setAttribute("aria-busy", "true");
      else card.removeAttribute("aria-busy");
      for (const button of card.querySelectorAll("button[data-action]"))
        if (button.dataset.action !== "detail") button.disabled = busy;
    };
    for (const [id, card] of state.cards) apply(card, state.reports.get(id));
    apply(el.detailContent.querySelector(".admin-card"), state.detailReport);
    el.aiSave.disabled =
      state.busy.has("settings") ||
      !selectedAiMode() ||
      selectedAiMode() === state.settings?.aiMode;
  }

  function setBusy(keys, on) {
    for (const key of keys || []) {
      if (on) state.busy.add(key);
      else state.busy.delete(key);
    }
    syncBusy();
  }

  // ---- Confirmation dialog ------------------------------------------------------

  function noteField() {
    const id = fieldId();
    const input = h("textarea", {
      id,
      name: "note",
      rows: "3",
      maxlength: String(A.NOTE_MAX),
    });
    return {
      name: "note",
      node: h(
        "div",
        { class: "admin-field" },
        h(
          "label",
          { for: id },
          `メモ（任意・運営だけが見られます。${A.NOTE_MAX}文字まで）`,
        ),
        input,
      ),
      read: () => input.value,
    };
  }

  function checkboxField(name, label, checked, help) {
    const id = fieldId();
    const input = h("input", { id, name, type: "checkbox", checked });
    return {
      name,
      node: h(
        "div",
        { class: "admin-field admin-field-check" },
        h("label", { for: id }, input, h("span", null, label)),
        help ? h("p", { class: "admin-small admin-muted" }, help) : null,
      ),
      read: () => input.checked,
    };
  }

  function textField(
    name,
    label,
    { multiline, maxlength, required, help } = {},
  ) {
    const id = fieldId();
    const input = h(multiline ? "textarea" : "input", {
      id,
      name,
      rows: multiline ? "3" : null,
      type: multiline ? null : "text",
      maxlength: maxlength ? String(maxlength) : null,
      required,
      autocomplete: "off",
      spellcheck: "false",
    });
    return {
      name,
      node: h(
        "div",
        { class: "admin-field" },
        h("label", { for: id }, label),
        input,
        help ? h("p", { class: "admin-small admin-muted" }, help) : null,
      ),
      read: () => input.value,
    };
  }

  function confirmAction(job) {
    if (state.confirmJob) return;
    if ((job.keys || []).some((key) => state.busy.has(key))) return;
    if (!getToken()) {
      requireSignIn(A.ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }
    const fields = (job.fields || []).filter(Boolean);
    state.confirmJob = {
      ...job,
      fields,
      inFlight: false,
      returnFocus: document.activeElement,
    };
    el.confirmTitle.textContent = job.title;
    el.confirmText.replaceChildren(
      ...job.text.filter(Boolean).map((line) => h("p", null, line)),
    );
    el.confirmFields.replaceChildren(...fields.map((field) => field.node));
    el.confirmError.textContent = "";
    el.confirmSubmit.textContent = job.submitLabel;
    el.confirmSubmit.disabled = false;
    el.confirmCancel.disabled = false;
    el.confirm.showModal();
  }

  function closeConfirm(restoreFocus) {
    const job = state.confirmJob;
    state.confirmJob = null;
    if (el.confirm.open) el.confirm.close();
    if (restoreFocus && job?.returnFocus?.isConnected) job.returnFocus.focus();
  }

  async function onConfirmSubmit(event) {
    event.preventDefault();
    const job = state.confirmJob;
    if (!job || job.inFlight) return;
    const values = {};
    for (const field of job.fields) values[field.name] = field.read();
    const invalid = job.validate ? job.validate(values) : null;
    if (invalid) {
      el.confirmError.textContent = invalid;
      return;
    }
    job.inFlight = true;
    setBusy(job.keys, true);
    const label = el.confirmSubmit.textContent;
    el.confirmSubmit.disabled = true;
    el.confirmCancel.disabled = true;
    el.confirmSubmit.textContent = "送っています…";
    el.confirmError.textContent = "";
    let result;
    try {
      result = await job.run(values);
    } catch (error) {
      setBusy(job.keys, false);
      job.inFlight = false;
      if (handleAuthError(error)) return;
      if (state.confirmJob === job) {
        el.confirmSubmit.disabled = false;
        el.confirmCancel.disabled = false;
        el.confirmSubmit.textContent = label;
        el.confirmError.textContent = error.message || "操作できませんでした。";
      }
      if (STALE_CODES.includes(error.code) && job.onStale) job.onStale();
      return;
    }
    setBusy(job.keys, false);
    job.inFlight = false;
    closeConfirm(false);
    try {
      job.done(result);
    } finally {
      const target = job.focusAfter ? job.focusAfter() : null;
      if (target) target.focus();
      else if (job.reportId) focusCard(job.reportId, job.action);
    }
  }

  // ---- Actions ----------------------------------------------------------------

  function workIdValidator(values) {
    const raw = A.text(values.workId).trim();
    if (!raw) return A.ERROR_MESSAGES.WORK_ID_REQUIRED;
    return A.parseWorkId(raw) ? null : A.ERROR_MESSAGES.INVALID_WORK_ID;
  }

  function startAction(action, report) {
    const id = report.reportId;
    const s = state.settings || {};
    const common = {
      reportId: id,
      action,
      keys: busyKeys(report),
      onStale: () => refreshReport(id),
    };
    const author = report.author;
    const work = report.work;
    switch (action) {
      case "detail":
        openDetail(id);
        return;
      case "review":
        confirmAction({
          ...common,
          title: "確認中にする",
          text: [
            "この通報を「確認中」にします。対応を決めるまで「確認中」の一覧に残ります。",
          ],
          submitLabel: "確認中にする",
          run: () => state.api.review(id),
          done(result) {
            putReport(result.report);
            notify("通報を「確認中」にしました。");
          },
        });
        return;
      case "dismiss":
        confirmAction({
          ...common,
          title: "却下（問題なし）",
          text: [
            `問題なしとして、この${targetName(report)}への未対応の通報（${A.text(report.openReportCount) || 1}件）をまとめて対応済みにします。`,
            work?.autoHidden
              ? "自動で一時非表示になっている作品は、作品広場に戻ります。"
              : work?.moderationHidden
                ? "運営が非表示にした作品は、非表示のままです。"
                : null,
          ],
          fields: [noteField()],
          submitLabel: "却下する",
          run: (values) => state.api.dismiss(id, { note: values.note }),
          done(result) {
            putReport(result.report);
            if (result.report?.work) propagateWork(result.report.work);
            refreshSiblings(result.report || report);
            notify(
              `却下しました。まとめて対応済みにした通報：${A.text(result.resolved) || 0}件。` +
                (result.unhidden
                  ? "自動で一時非表示にしていた作品を作品広場に戻しました。"
                  : ""),
            );
          },
        });
        return;
      case "hide": {
        const account = report.targetType === "account";
        confirmAction({
          ...common,
          title: "違反として非表示",
          text: [
            account
              ? "通報されたアカウントの作品のうち、規約に反する作品を作品広場から非表示にします。下に作品のID（YouTubeの動画ID）か動画のURLを入れてください。"
              : "この作品を作品広場から非表示にします（YouTubeの動画は消えません）。",
            "投稿者の違反を1回数えます（同じ作品で2回は数えません）。" +
              (s.strikeSuspendThreshold > 0
                ? `違反が${s.strikeSuspendThreshold}回になると、投稿を自動で停止します。`
                : ""),
            "その作品への未対応の通報は、まとめて対応済みになります。",
          ],
          fields: [
            account
              ? textField(
                  "workId",
                  "非表示にする作品のID（YouTubeの動画ID・11文字）か動画のURL（必須）",
                  {
                    required: true,
                    maxlength: 2048,
                  },
                )
              : null,
            noteField(),
          ],
          validate: account ? workIdValidator : null,
          submitLabel: "非表示にする",
          run: (values) =>
            state.api.hide(id, {
              workId: account ? A.parseWorkId(values.workId) : undefined,
              note: values.note,
            }),
          done(result) {
            putReport(result.report);
            if (result.report?.author) propagateUser(result.report.author);
            if (result.report?.work) propagateWork(result.report.work);
            refreshSiblings(result.report || report, result.workId);
            const count = A.text(result.strikeCount) || 0;
            notify(
              `非表示にしました。投稿者の違反：${count}回` +
                (result.strikeAdded
                  ? "。"
                  : "（この作品の違反は記録済みのため、数えていません）。") +
                (result.suspendedNow
                  ? "違反の回数が上限に達したため、投稿を自動で停止しました。"
                  : result.postingSuspended
                    ? "このアカウントは投稿停止中です。"
                    : "") +
                `まとめて対応済みにした通報：${A.text(result.resolved) || 0}件。`,
            );
          },
        });
        return;
      }
      case "unhide":
        if (!work?.workId) return;
        confirmAction({
          ...common,
          title: "作品を再表示",
          text: [
            "非表示にしていた作品を、作品広場に戻します。異議を認めたときや、誤って非表示にしたときに使います。",
            "この作品への未対応の通報は、まとめて対応済みになります。",
          ],
          fields: [
            checkboxField(
              "removeStrike",
              "違反の記録も取り消す",
              true,
              "この作品で数えた違反を1回取り消します。違反が基準を下回れば、自動の投稿停止も一緒に解除されます。",
            ),
            noteField(),
          ],
          submitLabel: "再表示する",
          run: (values) =>
            state.api.unhide(work.workId, {
              keepStrike: !values.removeStrike,
              note: values.note,
            }),
          done(result) {
            propagateWork(result.work);
            refreshSiblings(report, work.workId, true).then(() => {
              if (
                author?.userId &&
                (result.strikeRemoved || result.suspensionLifted)
              )
                return refreshUser(author.userId);
            });
            notify(
              (result.unhidden
                ? "作品を再表示しました。"
                : "作品はすでに表示されていました。") +
                (result.strikeRemoved
                  ? `違反を1回取り消しました（いま${A.text(result.strikeCount) || 0}回）。`
                  : "") +
                (result.suspensionLifted
                  ? "自動の投稿停止も解除しました。"
                  : "") +
                `まとめて対応済みにした通報：${A.text(result.resolved) || 0}件。`,
            );
          },
        });
        return;
      case "suspend":
        if (!author?.userId) return;
        confirmAction({
          ...common,
          title: "投稿を停止",
          text: [
            `「${A.text(author.displayName) || author.userId}」の作品広場への新しい投稿と、非公開から公開に戻す操作を止めます。すでに公開している作品はそのままです。`,
            `理由は記録に残ります（1〜${A.REASON_MAX}文字）。`,
          ],
          fields: [
            textField("reason", `停止の理由（必須・${A.REASON_MAX}文字まで）`, {
              multiline: true,
              maxlength: A.REASON_MAX,
              required: true,
            }),
          ],
          validate: (values) => {
            const reason = A.text(values.reason).trim();
            return !reason || reason.length > A.REASON_MAX
              ? A.ERROR_MESSAGES.INVALID_REASON
              : null;
          },
          submitLabel: "停止する",
          run: (values) =>
            state.api.suspend(author.userId, { reason: values.reason }),
          done(result) {
            propagateUser(result.user);
            notify(
              `「${A.text(author.displayName) || author.userId}」の投稿を停止しました。`,
            );
          },
        });
        return;
      case "unsuspend":
        if (!author?.userId) return;
        confirmAction({
          ...common,
          title: "停止を解除",
          text: [
            `「${A.text(author.displayName) || author.userId}」の投稿の停止を解除します。`,
          ],
          fields: [
            checkboxField(
              "resetStrikes",
              "違反の記録もリセット",
              false,
              "違反の回数を0に戻します。戻さないと、次の違反ですぐにまた自動で停止することがあります。",
            ),
          ],
          submitLabel: "解除する",
          run: (values) =>
            state.api.unsuspend(author.userId, {
              resetStrikes: values.resetStrikes,
            }),
          done(result) {
            propagateUser(result.user);
            notify(
              `「${A.text(author.displayName) || author.userId}」の投稿の停止を解除しました。` +
                (result.user && Number(result.user.strikeCount) === 0
                  ? "違反の回数は0回です。"
                  : ""),
            );
          },
        });
        return;
      default:
    }
  }

  async function refreshUser(userId) {
    try {
      const result = await state.api.getUser(userId);
      propagateUser(result.user);
    } catch (error) {
      handleAuthError(error);
    }
  }

  function onActionClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;
    const id = button.dataset.reportId;
    const report =
      state.reports.get(id) ||
      (state.detailReport && state.detailReport.reportId === id
        ? state.detailReport
        : null);
    if (!report) return;
    if (button.dataset.action !== "detail" && isBusy(report)) return;
    startAction(button.dataset.action, report);
  }

  // ---- Detail -----------------------------------------------------------------

  async function loadDetail(id) {
    const generation = ++state.detailGeneration;
    el.detailStatus.textContent = "読み込んでいます…";
    try {
      const result = await state.api.getReport(id);
      if (generation !== state.detailGeneration || state.detailId !== id)
        return;
      state.detailRelated = Array.isArray(result.relatedReports)
        ? result.relatedReports
        : [];
      el.detailStatus.textContent = "";
      putReport(result.report);
    } catch (error) {
      if (generation !== state.detailGeneration) return;
      if (handleAuthError(error)) return;
      el.detailStatus.textContent =
        error.message || "通報を読み込めませんでした。";
    }
  }

  function openDetail(id) {
    state.detailId = id;
    state.detailReport = state.reports.get(id) || null;
    state.detailRelated = [];
    state.detailReturnFocus = document.activeElement;
    renderDetail();
    if (!el.detail.open) el.detail.showModal();
    loadDetail(id);
  }

  function closeDetail() {
    if (el.detail.open) el.detail.close();
    state.detailId = null;
    state.detailReport = null;
    state.detailRelated = [];
    state.detailReturnFocus = null;
    state.detailGeneration++;
    el.detailContent.replaceChildren();
  }

  // ---- Events -------------------------------------------------------------------

  el.setupRetry.addEventListener("click", () => window.location.reload());
  el.signInRetry.addEventListener("click", () => window.location.reload());
  el.signOut.addEventListener("click", signOut);
  el.notice.addEventListener("click", (event) => {
    if (event.target.closest(".admin-notice-close")) el.notice.hidden = true;
  });
  el.aiOptions.addEventListener("change", syncBusy);
  el.aiForm.addEventListener("submit", onAiSubmit);
  for (const tab of el.tabs) {
    tab.addEventListener("click", () => {
      if (tab.getAttribute("aria-selected") !== "true")
        selectTab(tab.dataset.status, true);
    });
    tab.addEventListener("keydown", (event) => {
      const index = el.tabs.indexOf(tab);
      const last = el.tabs.length - 1;
      const next = {
        ArrowRight: index === last ? 0 : index + 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectTab(el.tabs[next].dataset.status, true);
    });
  }
  el.order.addEventListener("change", () => {
    if (!A.ORDERS.includes(el.order.value)) return;
    state.orders[state.tab] = el.order.value;
    reloadList();
  });
  el.reload.addEventListener("click", () => {
    reloadList();
    state.api
      ?.me()
      .then((me) => {
        if (me.settings && !state.busy.has("settings")) {
          state.settings = me.settings;
          renderSettings();
        }
      })
      .catch(handleAuthError);
  });
  el.more.addEventListener("click", loadMore);
  el.queue.addEventListener("click", onActionClick);
  el.detailContent.addEventListener("click", onActionClick);
  el.confirmForm.addEventListener("submit", onConfirmSubmit);
  el.confirmCancel.addEventListener("click", () => {
    if (!state.confirmJob?.inFlight) closeConfirm(true);
  });
  el.confirm.addEventListener("cancel", (event) => {
    if (state.confirmJob?.inFlight) event.preventDefault();
  });
  el.confirm.addEventListener("close", () => {
    const job = state.confirmJob;
    if (job && !job.inFlight) closeConfirm(true);
  });
  el.detailClose.addEventListener("click", () => el.detail.close());
  el.detail.addEventListener("click", (event) => {
    if (event.target === el.detail) el.detail.close();
  });
  el.detail.addEventListener("close", () => {
    const back = state.detailReturnFocus;
    const id = state.detailId;
    closeDetail();
    if (state.confirmJob) return;
    if (back && back.isConnected) back.focus();
    else if (id) focusCard(id, "detail");
  });

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
