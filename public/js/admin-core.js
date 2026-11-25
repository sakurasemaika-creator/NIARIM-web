/**
 * NIARIM 通報の管理（/admin/）の、画面を持たない部分。
 *
 * - 管理API（AWSのLambda Function URLの /admin/...）の呼び出しとエラーの日本語化
 * - 待っている営業日（日本時間の月〜金）の数え方
 * - 画面へ出す値の安全な扱い（文字は textContent だけ、URL は http(s) だけ、
 *   サムネイルは YouTube の画像のホストだけ）
 * - サブスクのClaudeでの下見：チャットに貼られたClaudeの答えから見立ての
 *   一覧を取り出して確かめる（parseTriageAnswer）・取り込んだ結果のまとめ
 *
 * ブラウザーでは window.NiarimAdmin、Node（tests/admin-core.test.mjs）では
 * require() で読む。画面の組み立ては /js/admin.js。
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NiarimAdmin = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const STATUSES = ["pending", "reviewing", "resolved"];
  const ORDERS = ["oldest", "newest"];
  const AI_MODES = ["off", "always", "backlog"];
  const DAY_MS = 86400000;
  const JST_OFFSET_MS = 9 * 3600000;
  const TARGET_BUSINESS_DAYS = 10;
  const WARN_BUSINESS_DAYS = 8;
  const THUMBNAIL_HOSTS = ["i.ytimg.com", "img.youtube.com"];
  const YOUTUBE_HOSTS = [
    "www.youtube.com",
    "youtube.com",
    "m.youtube.com",
    "youtu.be",
  ];
  const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
  const USER_ID = /^N[0-9a-f]{32}$/;
  const REPORT_ID = /^[A-Za-z0-9_-]{1,256}$/;
  const NOTE_MAX = 1000;
  const REASON_MAX = 500;
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const TRIAGE_SEVERITIES = ["critical", "high", "medium", "low", "none"];
  const TRIAGE_CATEGORIES = [
    "child_safety",
    "sexual",
    "violence",
    "hate_harassment",
    "self_harm",
    "illegal",
    "privacy",
    "copyright",
    "spam_scam",
    "other",
    "none",
  ];
  const TRIAGE_ACTIONS = ["hide", "keep", "review"];
  const TRIAGE_MAX = 50;
  const RATIONALE_MAX = 300;
  const TRIAGE_PROMPT_LIMIT = 20;
  // A pasted answer longer than this is not a Claude answer about 50 reports.
  const ANSWER_MAX = 200000;

  // ---- Text -------------------------------------------------------------

  /** Any value as display text. Objects and missing values become "". */
  function text(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
    return "";
  }

  /** Shortens by characters (not UTF-16 units), adding "…". */
  function shorten(value, max) {
    const chars = Array.from(text(value));
    return chars.length > max
      ? chars.slice(0, max).join("") + "…"
      : chars.join("");
  }

  /**
   * Builds elements without ever parsing markup: text goes through text
   * nodes, URLs through safeHttpUrl, and event-handler or HTML properties
   * are refused outright.
   */
  function createElementFactory(doc) {
    function append(node, child) {
      if (child === null || child === undefined || child === false) return;
      if (Array.isArray(child)) {
        for (const item of child) append(node, item);
        return;
      }
      if (typeof child === "string" || typeof child === "number") {
        node.appendChild(doc.createTextNode(text(child)));
        return;
      }
      node.appendChild(child);
    }
    return function h(tag, props) {
      if (!/^[a-z][a-z0-9-]*$/.test(tag) || tag === "script")
        throw new Error("unsupported element: " + tag);
      const node = doc.createElement(tag);
      for (const [key, value] of Object.entries(props || {})) {
        if (/^on/i.test(key) || /html|srcdoc|^style$/i.test(key))
          throw new Error("unsafe property: " + key);
        if (value === undefined || value === null || value === false) continue;
        if (key === "text") node.textContent = text(value);
        else if (key === "class") node.setAttribute("class", text(value));
        else if (key === "dataset") {
          for (const [name, data] of Object.entries(value))
            if (data !== undefined && data !== null)
              node.setAttribute(
                "data-" + name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
                text(data),
              );
        } else if (key === "href" || key === "src") {
          const safe = safeHttpUrl(value);
          if (safe) node.setAttribute(key, safe);
        } else if (value === true) node.setAttribute(key, "");
        else node.setAttribute(key, text(value));
      }
      for (let index = 2; index < arguments.length; index++)
        append(node, arguments[index]);
      return node;
    };
  }

  // ---- URLs -------------------------------------------------------------

  /** The URL when it is an absolute http(s) URL without credentials. */
  function safeHttpUrl(value) {
    if (typeof value !== "string" || !value.trim() || value.length > 2048)
      return null;
    let url;
    try {
      url = new URL(value.trim());
    } catch {
      return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.href;
  }

  /** A YouTube thumbnail on i.ytimg.com / img.youtube.com, over https. */
  function safeThumbnailUrl(value, videoId) {
    const href = safeHttpUrl(value);
    if (href) {
      const url = new URL(href);
      if (THUMBNAIL_HOSTS.includes(url.hostname) && !url.port) {
        url.protocol = "https:";
        return url.href;
      }
    }
    if (typeof videoId === "string" && VIDEO_ID.test(videoId))
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return null;
  }

  /** The work's YouTube page: its stored URL on a YouTube host, or one
   *  built from the video ID. */
  function safeYoutubeUrl(value, videoId) {
    const href = safeHttpUrl(value);
    if (href) {
      const url = new URL(href);
      if (YOUTUBE_HOSTS.includes(url.hostname) && !url.port) {
        url.protocol = "https:";
        return url.href;
      }
    }
    if (typeof videoId === "string" && VIDEO_ID.test(videoId))
      return `https://www.youtube.com/watch?v=${videoId}`;
    return null;
  }

  /** A work ID (YouTube video ID) from the ID itself or a YouTube URL. */
  function parseWorkId(input) {
    const value = text(input).trim();
    if (VIDEO_ID.test(value)) return value;
    const href = safeHttpUrl(value);
    if (!href) return null;
    const url = new URL(href);
    if (!YOUTUBE_HOSTS.includes(url.hostname)) return null;
    let id = null;
    if (url.hostname === "youtu.be") id = url.pathname.split("/")[1];
    else if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
      id = match && match[1];
    }
    return id && VIDEO_ID.test(id) ? id : null;
  }

  // ---- Time (Japan) -----------------------------------------------------

  function parseTime(value) {
    if (value instanceof Date) return value.getTime();
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    if (typeof value !== "string" || !value) return NaN;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : NaN;
  }

  /** Days since 1970-01-01 on the Japan-time calendar. */
  function jstDayNumber(ms) {
    return Math.floor((ms + JST_OFFSET_MS) / DAY_MS);
  }

  /** Monday to Friday (day 0, 1970-01-01, was a Thursday). */
  function isBusinessDay(day) {
    const weekday = (((day + 4) % 7) + 7) % 7;
    return weekday !== 0 && weekday !== 6;
  }

  /** Business days in (start, end] — the days after `start` up to `end`. */
  function countBusinessDays(start, end) {
    if (end <= start) return 0;
    const weeks = Math.floor((end - start) / 7);
    let count = weeks * 5;
    for (let day = start + weeks * 7 + 1; day <= end; day++)
      if (isBusinessDay(day)) count++;
    return count;
  }

  /**
   * How many business days (Mon–Fri, Japan time; public holidays are not
   * skipped) a report received at `receivedAt` has waited by `now`. The day
   * it arrived is day 0, the next business day day 1.
   */
  function businessDaysWaiting(receivedAt, now) {
    const from = parseTime(receivedAt);
    const to = parseTime(now === undefined ? Date.now() : now);
    if (Number.isNaN(from) || Number.isNaN(to)) return null;
    return countBusinessDays(jstDayNumber(from), jstDayNumber(to));
  }

  /** The Japan-time day (day number) of the n-th business day after receipt. */
  function businessDeadlineDay(receivedAt, days) {
    const from = parseTime(receivedAt);
    if (Number.isNaN(from)) return null;
    let day = jstDayNumber(from);
    for (
      let count = 0;
      count < (days === undefined ? TARGET_BUSINESS_DAYS : days);

    ) {
      day++;
      if (isBusinessDay(day)) count++;
    }
    return day;
  }

  /** The waiting state shown on a card. */
  function waitingInfo(receivedAt, now) {
    const days = businessDaysWaiting(receivedAt, now);
    if (days === null) return null;
    const deadlineDay = businessDeadlineDay(receivedAt);
    const remaining = TARGET_BUSINESS_DAYS - days;
    const level =
      remaining < 0 ? "overdue" : days >= WARN_BUSINESS_DAYS ? "warn" : "ok";
    let label;
    if (remaining < 0) label = `期限を${-remaining}営業日過ぎています`;
    else if (remaining === 0) label = "今日が期限です";
    else label = `期限まであと${remaining}営業日`;
    return {
      days,
      remaining,
      level,
      deadlineDay,
      deadlineLabel: formatJstDay(deadlineDay),
      summary: `受付から${days}営業日・${label}`,
    };
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  /** "2026/11/25（水）13:05" in Japan time, or "" for a missing value. */
  function formatJstDateTime(value) {
    const ms = parseTime(value);
    if (Number.isNaN(ms)) return "";
    const d = new Date(ms + JST_OFFSET_MS);
    return (
      `${d.getUTCFullYear()}/${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}` +
      `（${WEEKDAYS[d.getUTCDay()]}）${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
    );
  }

  /** "12月9日（水）" for a Japan-time day number. */
  function formatJstDay(day) {
    if (typeof day !== "number" || !Number.isFinite(day)) return "";
    const d = new Date(day * DAY_MS);
    return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WEEKDAYS[d.getUTCDay()]}）`;
  }

  // ---- Sign-in token ----------------------------------------------------

  /** The `exp` of a Google ID token (JWT) in milliseconds, or null. */
  function tokenExpiry(credential) {
    if (typeof credential !== "string") return null;
    const part = credential.split(".")[1];
    if (!part) return null;
    try {
      const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(
        decodeURIComponent(
          Array.from(
            atob(padded),
            (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"),
          ).join(""),
        ),
      );
      return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  // ---- Labels -----------------------------------------------------------

  const STATUS_LABELS = {
    pending: "未対応",
    reviewing: "確認中",
    resolved: "対応済み",
  };
  const DECISION_LABELS = {
    dismiss: "却下（問題なし）",
    hide: "違反として非表示",
    unhide: "作品を再表示",
  };
  const SEVERITY_LABELS = {
    critical: "重大",
    high: "高",
    medium: "中",
    low: "低",
    none: "問題なし",
  };
  const CATEGORY_LABELS = {
    child_safety: "子どもの安全",
    sexual: "性的な内容",
    violence: "暴力",
    hate_harassment: "ヘイト・嫌がらせ",
    self_harm: "自傷",
    illegal: "違法行為",
    privacy: "個人情報",
    copyright: "著作権",
    spam_scam: "スパム・詐欺",
    other: "その他",
    none: "該当なし",
  };
  const ACTION_LABELS = {
    hide: "非表示をすすめる",
    keep: "掲載のままでよい",
    review: "人の確認をすすめる",
  };
  const PRIVACY_LABELS = {
    public: "YouTubeで公開",
    unlisted: "YouTubeで限定公開",
    private: "YouTubeで非公開",
  };

  function labelOf(table, value) {
    return Object.prototype.hasOwnProperty.call(table, value)
      ? table[value]
      : text(value);
  }

  /** Who wrote a triage: the server's API key, the owner's subscription
   *  (the scheduled Claude Code session) or a Claude chat pasted back here.
   *  A triage without `source` was written by the API. */
  const TRIAGE_SOURCE_LABELS = {
    api: "AI（API）",
    subscription: "AI（サブスクの下見）",
    chat: "AI（チャット）",
  };

  /**
   * What to show for a report's AI triage: `summary` (the judgment),
   * `byline` (who wrote it and when: 「判定：AI（チャット）・日時」) and
   * `line` (the one-line form used in the list of related reports).
   */
  function aiTriageView(triage) {
    if (!triage || typeof triage !== "object")
      return {
        state: "none",
        summary: "AI判定なし",
        sourceLabel: "",
        byline: "",
        line: "AI：AI判定なし",
      };
    const source = Object.prototype.hasOwnProperty.call(
      TRIAGE_SOURCE_LABELS,
      triage.source,
    )
      ? triage.source
      : "api";
    const sourceLabel = TRIAGE_SOURCE_LABELS[source];
    const triagedAt = formatJstDateTime(triage.triagedAt);
    const model = triage.status === "ok" ? text(triage.model) : "";
    let view;
    if (triage.status === "refused")
      view = {
        state: "refused",
        summary: "AIが判定できませんでした（人の確認が必要）",
      };
    else if (triage.status !== "ok")
      view = {
        state: "failed",
        summary: "AIの判定に失敗しました（人の確認が必要）",
      };
    else
      view = {
        state: "ok",
        severity: triage.severity,
        summary: [
          `重大度：${labelOf(SEVERITY_LABELS, triage.severity)}`,
          `分類：${labelOf(CATEGORY_LABELS, triage.category)}`,
          `推奨：${labelOf(ACTION_LABELS, triage.recommendedAction)}`,
        ].join("・"),
        rationale: text(triage.rationale),
        model,
      };
    return {
      ...view,
      source,
      sourceLabel,
      triagedAt,
      byline:
        "判定：" + [sourceLabel, triagedAt, model].filter(Boolean).join("・"),
      line: `${sourceLabel}：${view.summary}`,
    };
  }

  /**
   * The state of the triage key (the bearer token of the scheduled Claude
   * Code session) from `settings.triageBot`. A backend without the key
   * (no `triageBot`) reads as not set.
   */
  function triageBotView(bot) {
    if (!bot || typeof bot !== "object" || bot.configured !== true)
      return { configured: false, label: "未設定", details: [] };
    const createdAt = formatJstDateTime(bot.createdAt);
    const lastUsedAt = formatJstDateTime(bot.lastUsedAt);
    const createdBy = text(bot.createdBy);
    return {
      configured: true,
      label: "設定済み",
      details: [
        `作った日時：${createdAt || "不明"}` +
          (createdBy ? `（${createdBy}）` : ""),
        lastUsedAt
          ? `最後に使われた日時：${lastUsedAt}`
          : "まだ使われていません",
      ],
    };
  }

  /** The host of an http(s) URL ("api.example.com"), or "". */
  function hostOf(value) {
    const href = safeHttpUrl(value);
    return href ? new URL(href).host : "";
  }

  // ---- Triage pasted from a Claude chat -------------------------------------

  function tryJson(source) {
    try {
      return { ok: true, value: JSON.parse(source) };
    } catch {
      return { ok: false };
    }
  }

  /** The end index of the JSON array opening at `start` (strings are
   *  skipped), or -1 when it never closes. */
  function arrayEnd(source, start) {
    let depth = 0;
    let inString = false;
    for (let index = start; index < source.length; index++) {
      const c = source[index];
      if (inString) {
        if (c === "\\") index++;
        else if (c === '"') inString = false;
      } else if (c === '"') inString = true;
      else if (c === "[") depth++;
      else if (c === "]" && --depth === 0) return index;
    }
    return -1;
  }

  /** The first top-level JSON array written somewhere in the text. */
  function firstJsonArray(source) {
    let from = 0;
    for (let tries = 0; tries < 200; tries++) {
      const start = source.indexOf("[", from);
      if (start < 0) return undefined;
      const end = arrayEnd(source, start);
      if (end >= 0) {
        const parsed = tryJson(source.slice(start, end + 1));
        if (parsed.ok && Array.isArray(parsed.value)) return parsed.value;
      }
      from = start + 1;
    }
    return undefined;
  }

  const ANSWER_NOT_FOUND =
    "見立ての一覧（JSONの配列）が見つかりませんでした。Claudeの答えを、```json で始まる部分も含めてそのまま貼ってください。";

  function enumValue(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : value;
  }

  /**
   * Reads the judgments out of a Claude chat answer pasted on the page: the
   * first ```json block (else the first ``` block, else the first JSON
   * array in the text), as an array or as { results: [...] }. Each item is
   * checked against the backend's shape; the ones that fail, repeat a
   * report or go over 50 are left out with a Japanese reason in `errors`.
   * Only the five documented fields are kept.
   */
  function parseTriageAnswer(input) {
    const errors = [];
    const results = [];
    const value = typeof input === "string" ? input.trim() : "";
    if (!value) return { results, errors: ["Claudeの答えを貼ってください。"] };
    if (value.length > ANSWER_MAX)
      return {
        results,
        errors: ["貼った文が長すぎます。Claudeの答えだけを貼ってください。"],
      };
    const fence =
      value.match(/```[ \t]*json[ \t]*\r?\n([\s\S]*?)```/i) ||
      value.match(/```[^\n`]*\r?\n([\s\S]*?)```/);
    const body = fence ? fence[1] : value;
    const whole = tryJson(body.trim());
    let data = whole.ok ? whole.value : firstJsonArray(body);
    if (data === undefined) {
      errors.push(
        fence
          ? "```で囲まれた部分を、JSONとして読めませんでした。Claudeの答えをそのまま貼ってください。"
          : ANSWER_NOT_FOUND,
      );
      return { results, errors };
    }
    if (data && typeof data === "object" && !Array.isArray(data))
      data = data.results;
    if (!Array.isArray(data)) return { results, errors: [ANSWER_NOT_FOUND] };
    if (!data.length)
      return { results, errors: ["見立てが1件も入っていませんでした。"] };
    const seen = new Set();
    data.forEach((item, index) => {
      const id =
        item && typeof item === "object" && typeof item.reportId === "string"
          ? item.reportId.trim()
          : "";
      const where = id
        ? `${index + 1}件目（${shorten(id, 40)}）`
        : `${index + 1}件目`;
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        errors.push(`${where}：見立ての形（オブジェクト）ではありません。`);
        return;
      }
      const problems = [];
      if (!id) problems.push("通報のID（reportId）がありません");
      else if (id.length > 256)
        problems.push("通報のID（reportId）が長すぎます");
      const severity = enumValue(item.severity);
      if (!TRIAGE_SEVERITIES.includes(severity))
        problems.push(
          `重大度（severity）「${shorten(text(item.severity), 20)}」は使えません`,
        );
      const category = enumValue(item.category);
      if (!TRIAGE_CATEGORIES.includes(category))
        problems.push(
          `分類（category）「${shorten(text(item.category), 20)}」は使えません`,
        );
      const recommendedAction = enumValue(item.recommendedAction);
      if (!TRIAGE_ACTIONS.includes(recommendedAction))
        problems.push(
          `推奨（recommendedAction）「${shorten(text(item.recommendedAction), 20)}」は使えません`,
        );
      const rationale =
        typeof item.rationale === "string" ? item.rationale.trim() : "";
      // UTF-16 units, the stricter of the two ways the server may count.
      if (!rationale) problems.push("理由（rationale）がありません");
      else if (rationale.length > RATIONALE_MAX)
        problems.push(
          `理由（rationale）が${RATIONALE_MAX}文字を超えています（${rationale.length}文字）`,
        );
      if (problems.length) {
        errors.push(`${where}：${problems.join("。")}。`);
        return;
      }
      if (seen.has(id)) {
        errors.push(`${where}：同じ通報の見立てが前にもあるため、外しました。`);
        return;
      }
      seen.add(id);
      results.push({
        reportId: id,
        severity,
        category,
        recommendedAction,
        rationale,
      });
    });
    if (results.length > TRIAGE_MAX) {
      const rest = results.splice(TRIAGE_MAX);
      errors.push(
        `一度に取り込めるのは${TRIAGE_MAX}件までです。${TRIAGE_MAX + 1}件目からの${rest.length}件は外しました。取り込んだ後に、あらためて頼んでください。`,
      );
    }
    return { results, errors };
  }

  const TRIAGE_RESULT_REASONS = {
    INVALID_TRIAGE: "形が正しくない",
    NOT_FOUND: "通報が見つからない",
    REPORT_RESOLVED: "対応済み",
    ALREADY_TRIAGED: "すでに見立てがある",
  };

  function triageResultReason(code) {
    if (Object.prototype.hasOwnProperty.call(TRIAGE_RESULT_REASONS, code))
      return TRIAGE_RESULT_REASONS[code];
    return text(code)
      ? `取り込めなかった（${text(code)}）`
      : "取り込めなかった";
  }

  /**
   * Counts what POST /admin/triage/results did with the judgments sent:
   * how many were stored, how many hid a work for now (a 「重大」 judgment),
   * and which were refused and why. A judgment the response does not
   * mention counts as refused.
   */
  function summarizeTriageResults(response, sent) {
    const rows =
      response && Array.isArray(response.results) ? response.results : [];
    const byId = new Map();
    for (const row of rows)
      if (row && typeof row.reportId === "string" && !byId.has(row.reportId))
        byId.set(row.reportId, row);
    const ids = Array.isArray(sent)
      ? sent.map((item) => item && item.reportId).filter(Boolean)
      : Array.from(byId.keys());
    let imported = 0;
    let autoHidden = 0;
    const failed = [];
    for (const reportId of ids) {
      const row = byId.get(reportId);
      if (row && row.ok === true) {
        imported++;
        if (row.autoHidden === true) autoHidden++;
      } else
        failed.push({
          reportId,
          code: row ? text(row.code) || null : null,
          reason: row
            ? triageResultReason(row.code)
            : "サーバーから結果が返らなかった",
        });
    }
    return { imported, autoHidden, failed };
  }

  function aiModeOptions(settings) {
    const threshold = settings && settings.aiBacklogThreshold;
    return [
      { value: "off", label: "AIの判定：オフ" },
      { value: "always", label: "常に判定する" },
      {
        value: "backlog",
        label: `通報が多いときだけ（${text(threshold) || "?"}件以上）`,
      },
    ];
  }

  function aiModeLabel(mode, settings) {
    const option = aiModeOptions(settings).find((o) => o.value === mode);
    return option ? option.label : text(mode);
  }

  function aiModeSourceLabel(source) {
    return source === "admin"
      ? "この管理ページで選んだ設定"
      : "サーバーの既定（デプロイの設定）";
  }

  function autoHiddenReasonLabel(reason, settings) {
    if (reason === "ai") return "AIが重大と判定したため";
    if (reason === "reporters") {
      const n = settings && settings.reportHideThreshold;
      return n
        ? `通報した人が${n}人に達したため`
        : "通報した人数が基準に達したため";
    }
    return text(reason);
  }

  // ---- Errors -----------------------------------------------------------

  const ERROR_MESSAGES = {
    ADMIN_DISABLED:
      "管理画面はまだ使えるように設定されていません。AWSのSystems Managerのパラメーター /niarim/moderation/admin-emails に、管理に使うGoogleアカウントのメールアドレスを登録してください（反映まで最長5分）。",
    UNAUTHORIZED:
      "ログインの有効期限が切れたか、確認できませんでした。もう一度Googleでログインしてください。",
    ADMIN_FORBIDDEN:
      "このGoogleアカウントには管理の権限がありません。管理に登録したアカウントでログインし直してください。",
    REPORT_RESOLVED:
      "この通報はすでに対応済みです。最新の状態を読み込み直しました。",
    REPORT_CHANGED:
      "通報の状態がほかの操作で変わりました。最新の状態を確かめてから、もう一度操作してください。",
    WORK_ID_REQUIRED:
      "アカウントへの通報では、非表示にする作品のID（YouTubeの動画ID）を入力してください。",
    WORK_AUTHOR_MISMATCH:
      "入力した作品は、通報された作品・アカウントのものではありません。作品のIDを確かめてください。",
    MODERATION_CHANGED:
      "作品または投稿者の状態が同時に変わりました。最新の状態を確かめてから、もう一度操作してください。",
    INVALID_STATUS: "通報の状態の指定が正しくありません。",
    INVALID_ORDER: "並び順の指定が正しくありません。",
    INVALID_PAGE_SIZE:
      "一度に読み込む件数の指定が正しくありません（1〜50件）。",
    INVALID_PAGE_CURSOR:
      "続きを読み込む位置が古くなりました。一覧を読み込み直してください。",
    INVALID_NOTE: `メモは${NOTE_MAX}文字以内で入力してください。`,
    INVALID_REASON: `停止の理由を1〜${REASON_MAX}文字で入力してください。`,
    INVALID_WORK_ID:
      "作品のIDの形式が正しくありません（YouTubeの動画IDの11文字か、動画のURL）。",
    INVALID_AI_MODE:
      "AIの判定の設定は「オフ」「常に判定する」「通報が多いときだけ」のどれかを選んでください。",
    INVALID_KEEP_STRIKE:
      "送った内容の形式が正しくありません。ページを読み込み直してください。",
    INVALID_RESET_STRIKES:
      "送った内容の形式が正しくありません。ページを読み込み直してください。",
    INVALID_TRIAGE:
      "見立ての形が正しくありません。Claudeの答えをそのまま貼ったか確かめてください（一度に50件まで）。",
    ALREADY_TRIAGED: "この通報には、すでに見立てがあります。",
    NOT_FOUND:
      "対象が見つかりません。削除されたか、IDが正しくない可能性があります。",
    PAYLOAD_TOO_LARGE: "送る内容が大きすぎます。",
    NETWORK:
      "サーバーに接続できませんでした。通信の状態を確かめてください。このページは https://niarim.miranima-studio.com/admin/ で開いたときだけ管理APIにつながります。",
    TIMEOUT:
      "サーバーの応答がありませんでした。しばらくしてからもう一度お試しください。",
    INVALID_RESPONSE:
      "サーバーの応答を読み取れませんでした。しばらくしてからもう一度お試しください。",
  };

  function errorMessage(code, status, serverMessage) {
    if (code && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code))
      return ERROR_MESSAGES[code];
    if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
    if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
    if (status >= 500)
      return "サーバーでエラーが起きました。しばらくしてからもう一度お試しください。";
    const detail = text(serverMessage).trim();
    return detail
      ? `操作を受け付けられませんでした（${status}）：${shorten(detail, 200)}`
      : `操作を受け付けられませんでした（${status}）。`;
  }

  class AdminApiError extends Error {
    constructor({ status, code, serverMessage }) {
      super(errorMessage(code, status, serverMessage));
      this.name = "AdminApiError";
      this.status = status;
      this.code = code || null;
      this.serverMessage = text(serverMessage) || null;
    }
  }

  function localError(code, status) {
    return new AdminApiError({ status: status || 400, code });
  }

  // ---- API client -------------------------------------------------------

  function cleanNote(note) {
    if (note === undefined || note === null) return undefined;
    const value = text(note).trim();
    // The server counts UTF-16 units, as the textarea's maxlength does.
    if (value.length > NOTE_MAX) throw localError("INVALID_NOTE");
    return value || undefined;
  }

  /**
   * The moderation admin API. `getToken()` returns the Google ID token kept
   * in memory, or null when there is none (or it has expired): the call then
   * fails with UNAUTHORIZED without reaching the server.
   */
  function createAdminApi(options) {
    const base = new URL(options.baseUrl);
    if (base.protocol !== "https:" && base.protocol !== "http:")
      throw new Error("the admin API must be http(s)");
    const getToken = options.getToken;
    const fetchImpl = options.fetch || globalThis.fetch.bind(globalThis);
    const timeoutMs = options.timeoutMs || 20000;

    async function request(method, path, { query, body } = {}) {
      const token = getToken();
      if (!token) throw localError("UNAUTHORIZED", 401);
      const url = new URL(path.replace(/^\/+/, ""), base);
      for (const [key, value] of Object.entries(query || {}))
        if (value !== undefined && value !== null && value !== "")
          url.searchParams.set(key, String(value));
      const init = {
        method,
        headers: { Authorization: `Bearer ${token}` },
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
      };
      if (method !== "GET") {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body || {});
      }
      if (typeof AbortSignal !== "undefined" && AbortSignal.timeout)
        init.signal = AbortSignal.timeout(timeoutMs);
      let response;
      try {
        response = await fetchImpl(url.href, init);
      } catch (error) {
        const name = error && error.name;
        throw localError(
          name === "TimeoutError" || name === "AbortError"
            ? "TIMEOUT"
            : "NETWORK",
          0,
        );
      }
      let data = null;
      try {
        const raw = await response.text();
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new AdminApiError({
          status: response.status,
          code: data && typeof data.code === "string" ? data.code : undefined,
          serverMessage:
            data && typeof data.error === "string" ? data.error : undefined,
        });
      }
      if (!data || typeof data !== "object" || Array.isArray(data))
        throw localError("INVALID_RESPONSE", response.status);
      return data;
    }

    function reportPath(reportId, action) {
      if (typeof reportId !== "string" || !REPORT_ID.test(reportId))
        throw localError("NOT_FOUND", 404);
      return (
        `admin/reports/${encodeURIComponent(reportId)}` +
        (action ? `/${action}` : "")
      );
    }

    function userPath(userId, action) {
      if (typeof userId !== "string" || !USER_ID.test(userId))
        throw localError("NOT_FOUND", 404);
      return (
        `admin/users/${encodeURIComponent(userId)}` +
        (action ? `/${action}` : "")
      );
    }

    return {
      me: () => request("GET", "admin/me"),
      updateSettings({ aiMode } = {}) {
        if (!AI_MODES.includes(aiMode))
          return Promise.reject(localError("INVALID_AI_MODE"));
        return request("POST", "admin/settings", { body: { aiMode } });
      },
      listReports({ status = "pending", order, limit = 20, cursor } = {}) {
        if (!STATUSES.includes(status))
          return Promise.reject(localError("INVALID_STATUS"));
        if (order !== undefined && !ORDERS.includes(order))
          return Promise.reject(localError("INVALID_ORDER"));
        if (!Number.isInteger(limit) || limit < 1 || limit > 50)
          return Promise.reject(localError("INVALID_PAGE_SIZE"));
        return request("GET", "admin/reports", {
          query: { status, order, limit, cursor },
        });
      },
      getReport: async (reportId) => request("GET", reportPath(reportId)),
      review: async (reportId) =>
        request("POST", reportPath(reportId, "review"), { body: {} }),
      dismiss: async (reportId, { note } = {}) =>
        request("POST", reportPath(reportId, "dismiss"), {
          body: { note: cleanNote(note) },
        }),
      hide: async (reportId, { workId, note } = {}) => {
        const body = { note: cleanNote(note) };
        if (workId !== undefined && workId !== null && workId !== "") {
          const id = parseWorkId(workId);
          if (!id) throw localError("INVALID_WORK_ID");
          body.workId = id;
        }
        return request("POST", reportPath(reportId, "hide"), { body });
      },
      unhide: async (workId, { keepStrike = false, note } = {}) => {
        if (typeof workId !== "string" || !VIDEO_ID.test(workId))
          throw localError("NOT_FOUND", 404);
        return request(
          "POST",
          `admin/works/${encodeURIComponent(workId)}/unhide`,
          { body: { keepStrike: keepStrike === true, note: cleanNote(note) } },
        );
      },
      getUser: async (userId) => request("GET", userPath(userId)),
      suspend: async (userId, { reason } = {}) => {
        const value = text(reason).trim();
        if (!value || value.length > REASON_MAX)
          throw localError("INVALID_REASON");
        return request("POST", userPath(userId, "suspend"), {
          body: { reason: value },
        });
      },
      unsuspend: async (userId, { resetStrikes = false } = {}) =>
        request("POST", userPath(userId, "unsuspend"), {
          body: { resetStrikes: resetStrikes === true },
        }),
      /** A new triage key for the scheduled Claude Code session; the one
       *  before stops working. The key is in the response only this once. */
      async createTriageToken() {
        const data = await request("POST", "admin/triage/token", { body: {} });
        if (typeof data.token !== "string" || !data.token.trim())
          throw localError("INVALID_RESPONSE", 200);
        return data;
      },
      revokeTriageToken: () =>
        request("POST", "admin/triage/token/revoke", { body: {} }),
      /** The request to paste into a Claude chat, for the reports still
       *  waiting for a judgment. */
      async triagePrompt({ limit = TRIAGE_PROMPT_LIMIT } = {}) {
        if (!Number.isInteger(limit) || limit < 1 || limit > TRIAGE_MAX)
          throw localError("INVALID_PAGE_SIZE");
        const data = await request("GET", "admin/triage/prompt", {
          query: { limit },
        });
        const count = Number(data.reportCount);
        if (
          !Number.isInteger(count) ||
          count < 0 ||
          (count > 0 && (typeof data.prompt !== "string" || !data.prompt))
        )
          throw localError("INVALID_RESPONSE", 200);
        return { ...data, reportCount: count };
      },
      /** Judgments read by parseTriageAnswer (1 to 50). */
      async submitTriageResults(results) {
        if (
          !Array.isArray(results) ||
          !results.length ||
          results.length > TRIAGE_MAX
        )
          throw localError("INVALID_TRIAGE");
        const data = await request("POST", "admin/triage/results", {
          body: { results },
        });
        if (!Array.isArray(data.results))
          throw localError("INVALID_RESPONSE", 200);
        return data;
      },
    };
  }

  /**
   * Pages through one queue with nextCursor. A call made while a page is
   * still loading returns null instead of asking again, so a double click on
   * 「もっと読み込む」 cannot load or show the same page twice.
   */
  function createReportPager(api, { status, order, limit = 20 } = {}) {
    let cursor = null;
    let done = false;
    let loading = false;
    const seen = new Set();
    return {
      get done() {
        return done;
      },
      get loading() {
        return loading;
      },
      async next() {
        if (done || loading) return done ? [] : null;
        loading = true;
        try {
          const page = await api.listReports({ status, order, limit, cursor });
          cursor =
            typeof page.nextCursor === "string" && page.nextCursor
              ? page.nextCursor
              : null;
          done = cursor === null;
          const reports = Array.isArray(page.reports) ? page.reports : [];
          return reports.filter((report) => {
            if (!report || typeof report.reportId !== "string") return false;
            if (seen.has(report.reportId)) return false;
            seen.add(report.reportId);
            return true;
          });
        } finally {
          loading = false;
        }
      },
    };
  }

  /** Groups reports on the same work or account (one decision covers them). */
  function targetKey(report) {
    if (!report) return "";
    if (report.workId) return "work:" + report.workId;
    return "user:" + text(report.targetUserId);
  }

  return {
    STATUSES,
    ORDERS,
    AI_MODES,
    TARGET_BUSINESS_DAYS,
    WARN_BUSINESS_DAYS,
    NOTE_MAX,
    REASON_MAX,
    THUMBNAIL_HOSTS,
    TRIAGE_MAX,
    RATIONALE_MAX,
    TRIAGE_PROMPT_LIMIT,
    TRIAGE_SEVERITIES,
    TRIAGE_CATEGORIES,
    TRIAGE_ACTIONS,
    TRIAGE_SOURCE_LABELS,
    STATUS_LABELS,
    DECISION_LABELS,
    PRIVACY_LABELS,
    ERROR_MESSAGES,
    text,
    shorten,
    labelOf,
    createElementFactory,
    safeHttpUrl,
    safeThumbnailUrl,
    safeYoutubeUrl,
    parseWorkId,
    isVideoId: (value) => typeof value === "string" && VIDEO_ID.test(value),
    isUserId: (value) => typeof value === "string" && USER_ID.test(value),
    jstDayNumber,
    isBusinessDay,
    businessDaysWaiting,
    businessDeadlineDay,
    waitingInfo,
    formatJstDateTime,
    formatJstDay,
    tokenExpiry,
    aiTriageView,
    triageBotView,
    hostOf,
    parseTriageAnswer,
    triageResultReason,
    summarizeTriageResults,
    aiModeOptions,
    aiModeLabel,
    aiModeSourceLabel,
    autoHiddenReasonLabel,
    errorMessage,
    AdminApiError,
    createAdminApi,
    createReportPager,
    targetKey,
  };
});
