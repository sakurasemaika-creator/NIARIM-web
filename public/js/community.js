/**
 * Public-only live community views. Same API paths as the production Flutter
 * CommunityApi. No fabricated cards, credentials or local ranking metrics.
 */
(function () {
  "use strict";
  const buttons = [...document.querySelectorAll("[data-community-tab]")];
  const gallery = document.querySelector("[data-community-gallery]");
  if (!gallery || !buttons.length) return;
  let current =
    buttons.find((b) => b.classList.contains("is-active"))?.dataset
      .communityTab || "latest";
  let state = { kind: "loading", works: [] };
  let requestCounter = 0;
  let playbackRequest = 0;
  let playbackMessage = null;
  const feedback = document.createElement("p");
  feedback.className = "community-playback-message";
  feedback.setAttribute("role", "status");
  feedback.hidden = true;
  gallery.before(feedback);

  const labels = {
    ja: {
      loading: "公開作品を読み込んでいます。",
      empty:
        "現在表示できる公開作品はありません。公開後、作品が投稿されるとここに表示されます。",
      unavailable:
        "現在、この期間のランキングを取得できません。時間をおいてもう一度お試しください。",
      periodCount: "期間内ブックマーク",
      error:
        "作品データを取得できませんでした。時間をおいて再度ご確認ください。",
      hidden: "この作品は非公開になりました。",
      count: "ブックマーク",
      reposts: "リポスト",
      title: "作品をYouTubeで開く",
    },
    en: {
      loading: "Loading published works...",
      empty:
        "No published works are available yet. They will appear here after release.",
      unavailable:
        "We could not load the ranking for this period. Please try again later.",
      periodCount: "Bookmarks this period",
      error: "Couldn't load published works. Please try again later.",
      hidden: "This work is no longer public.",
      count: "Bookmarks",
      reposts: "Reposts",
      title: "Open on YouTube",
    },
    "zh-Hans": {
      hidden: "该作品已设为私密。",
      periodCount: "本期收藏",
      loading: "正在读取公开作品……",
      empty: "暂无可显示的公开作品，发布后将自动出现。",
      unavailable: "暂时无法加载这段时间的排行，请稍后重试。",
      error: "作品加载失败，请稍后重试。",
      count: "收藏",
      reposts: "转发",
      title: "在 YouTube 打开",
    },
    "zh-Hant": {
      hidden: "這部作品已設為私人。",
      periodCount: "本期書籤",
      loading: "正在讀取公開作品……",
      empty: "目前沒有公開作品，發布後將自動顯示。",
      unavailable: "暫時無法載入這段時間的排行，請稍後再試。",
      error: "作品載入失敗，請稍後再試。",
      count: "書籤",
      reposts: "轉發",
      title: "在 YouTube 開啟",
    },
    ko: {
      hidden: "이 작품은 비공개로 전환되었습니다.",
      periodCount: "기간 내 북마크",
      loading: "공개 작품을 불러오는 중...",
      empty: "아직 공개된 작품이 없습니다. 출시 후 이곳에 표시됩니다.",
      unavailable:
        "현재 이 기간의 순위를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.",
      error: "작품을 불러오지 못했습니다. 나중에 다시 시도하세요.",
      count: "북마크",
      reposts: "리포스트",
      title: "YouTube에서 열기",
    },
    fr: {
      hidden: "Cette œuvre n’est plus publique.",
      periodCount: "Favoris de la période",
      loading: "Chargement des œuvres publiques…",
      empty:
        "Aucune œuvre publique pour le moment. Elles apparaîtront ici après le lancement.",
      unavailable:
        "Impossible de charger le classement pour cette période. Réessayez plus tard.",
      error: "Impossible de charger les œuvres. Réessayez plus tard.",
      count: "Favoris",
      reposts: "Repartages",
      title: "Ouvrir sur YouTube",
    },
    es: {
      hidden: "Esta obra ya no es pública.",
      periodCount: "Marcadores del período",
      loading: "Cargando obras públicas…",
      empty:
        "Aún no hay obras públicas. Aparecerán aquí después del lanzamiento.",
      unavailable:
        "No se pudo cargar la clasificación de este período. Inténtalo más tarde.",
      error: "No se pudieron cargar las obras. Inténtalo más tarde.",
      count: "Marcadores",
      reposts: "Republicaciones",
      title: "Abrir en YouTube",
    },
  };
  const playbackErrors = {
    ja: "作品を開けませんでした。時間をおいてもう一度お試しください。",
    en: "Could not open this work. Please try again later.",
    "zh-Hans": "无法打开此作品，请稍后重试。",
    "zh-Hant": "無法開啟此作品，請稍後再試。",
    ko: "작품을 열 수 없습니다. 잠시 후 다시 시도해 주세요.",
    fr: "Impossible d’ouvrir cette œuvre. Réessayez plus tard.",
    es: "No se pudo abrir esta obra. Inténtalo más tarde.",
  };
  function copy() {
    const lang = document.documentElement.lang;
    return labels[lang] || labels.ja;
  }
  function renderFeedback() {
    feedback.hidden = !playbackMessage;
    feedback.textContent =
      playbackMessage === "hidden"
        ? copy().hidden
        : playbackMessage === "error"
          ? playbackErrors[document.documentElement.lang] || playbackErrors.ja
          : "";
  }
  function clear() {
    gallery.replaceChildren();
  }
  function message(kind) {
    const p = document.createElement("p");
    p.className = "community-live-message";
    p.textContent = copy()[kind] || copy().error;
    clear();
    gallery.append(p);
  }
  async function playbackStatus(id) {
    const response = await fetch(
      "/api/community?playbackId=" + encodeURIComponent(id),
      {
        headers: { accept: "application/json" },
        credentials: "omit",
        cache: "no-store",
      },
    );
    if (!response.ok) throw Error("Playback status " + response.status);
    return (await response.json())?.status;
  }
  function card(work, index, ranked) {
    const hidden = work.isUnavailable === true;
    const a = document.createElement(hidden ? "div" : "a");
    a.className =
      "community-card community-card--live" +
      (hidden ? " community-card--unavailable" : "");
    if (hidden) {
      a.setAttribute("aria-disabled", "true");
    } else {
      a.href = work.youtubeUrl;
      a.setAttribute("aria-label", copy().title + ": " + work.title);
      a.addEventListener("click", async (event) => {
        // Guard privacy even between a ranking fetch and the actual click.
        event.preventDefault();
        const requestAtClick = requestCounter;
        const attempt = ++playbackRequest;
        playbackMessage = null;
        renderFeedback();
        try {
          const status = await playbackStatus(work.workId);
          if (requestAtClick !== requestCounter || attempt !== playbackRequest)
            return;
          if (status === "available") {
            window.location.assign(work.youtubeUrl);
            return;
          }
          if (
            status === "private" ||
            status === "deleted" ||
            status === "unavailable"
          ) {
            playbackMessage = "hidden";
            renderFeedback();
            select(current, { keepFeedback: true });
            return;
          }
        } catch (_) {
          // Fail closed: never open a stale item when status is unknown.
        }
        if (requestAtClick === requestCounter && attempt === playbackRequest) {
          playbackMessage = "error";
          renderFeedback();
        }
      });
    }
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    if (hidden) {
      const fallback = document.createElement("span");
      fallback.className = "community-thumb-fallback";
      fallback.setAttribute("aria-hidden", "true");
      fallback.textContent = "⊘";
      thumb.append(fallback);
    } else {
      const image = document.createElement("img");
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = "";
      image.src = work.thumbnailUrl;
      image.addEventListener(
        "error",
        () => {
          image.remove();
          const fallback = document.createElement("span");
          fallback.className = "community-thumb-fallback";
          fallback.textContent = "✦";
          thumb.append(fallback);
        },
        { once: true },
      );
      thumb.append(image);
    }
    if (ranked) {
      const badge = document.createElement("span");
      badge.className = "rank-badge";
      badge.textContent = String(index + 1);
      thumb.append(badge);
    }
    const meta = document.createElement("div");
    meta.className = "meta";
    const h = document.createElement("h3");
    h.textContent = hidden ? copy().hidden : work.title;
    meta.append(h);
    if (!hidden) {
      const author = document.createElement("p");
      author.textContent = work.channelName || "NIARIM";
      const counts = document.createElement("div");
      counts.className = "community-counts";
      const formatter = new Intl.NumberFormat(
        document.documentElement.lang || "ja",
      );
      const appendCount = (label, value) => {
        const count = document.createElement("span");
        count.textContent = label + ": " + formatter.format(value);
        counts.append(count);
      };
      appendCount(copy().count, work.bookmarkCount);
      appendCount(copy().reposts, work.repostCount ?? 0);
      const period = ["daily", "weekly", "monthly", "yearly"].includes(current);
      if (period && Number.isSafeInteger(work.periodBookmarkCount)) {
        appendCount(copy().periodCount, work.periodBookmarkCount);
      }
      meta.append(author, counts);
    }
    a.append(thumb, meta);
    return a;
  }
  function render() {
    gallery.setAttribute("aria-busy", String(state.kind === "loading"));
    if (state.kind !== "ready") {
      message(state.kind);
      return;
    }
    clear();
    state.works.forEach((w, i) =>
      gallery.append(card(w, i, current !== "latest")),
    );
    if (!state.works.length) message("empty");
  }
  function select(view, { keepFeedback = false } = {}) {
    current = view;
    if (!keepFeedback) {
      playbackMessage = null;
      renderFeedback();
    }
    buttons.forEach((b) => {
      const pressed = b.dataset.communityTab === view;
      b.classList.toggle("is-active", pressed);
      b.setAttribute("aria-pressed", String(pressed));
    });
    const thisRequest = ++requestCounter;
    state = { kind: "loading", works: [] };
    render();
    fetch("/api/community?view=" + encodeURIComponent(view), {
      headers: { accept: "application/json" },
      credentials: "omit",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw Error("Community API status " + res.status);
        return res.json();
      })
      .then((body) => {
        if (thisRequest !== requestCounter) return;
        if (body.unavailableReason === "BOOKMARK_PERIOD_NOT_IMPLEMENTED") {
          state = { kind: "unavailable", works: [] };
        } else if (Array.isArray(body.works)) {
          state = {
            kind: "ready",
            works: body.works.filter(
              (work) =>
                work &&
                work.isUnavailable !== true &&
                work.isNiarimPublished !== false,
            ),
          };
        } else {
          state = { kind: "error", works: [] };
        }
        render();
      })
      .catch(() => {
        if (thisRequest !== requestCounter) return;
        state = { kind: "error", works: [] };
        render();
      });
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => select(button.dataset.communityTab)),
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) select(current);
  });
  document.addEventListener("niarim:langchange", () => {
    render();
    renderFeedback();
  });
  select(current);
})();
