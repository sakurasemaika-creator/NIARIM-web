/**
 * NIARIM公式サイト 多言語対応 (i18n.js)
 *
 * data-i18n="key" を持つ要素のtextContentを、選択言語の辞書で置き換える。
 * data-i18n-attr="attr1:key1|attr2:key2" で属性値(placeholder, aria-label等)を置き換える。
 * data-i18n-html="key" はリンク等のインラインタグを含む簡易HTMLを許可する（辞書側で用途を限定）。
 *
 * 対応言語: 日本語(ja) / 英語(en) / 簡体字中国語(zh-Hans) / 繁体字中国語(zh-Hant) /
 *           韓国語(ko) / フランス語(fr) / スペイン語(es)
 */
(function () {
  "use strict";

  var LANGS = [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" },
    { code: "zh-Hans", label: "简体中文" },
    { code: "zh-Hant", label: "繁體中文" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
  ];

  var DEFAULT_LANG = "en";
  var DICT = window.NIARIM_I18N_DICT || {};
  var OG_LOCALES = {
    ja: "ja_JP",
    en: "en_US",
    "zh-Hans": "zh_CN",
    "zh-Hant": "zh_TW",
    ko: "ko_KR",
    fr: "fr_FR",
    es: "es_ES",
  };

  function matchSupportedLang(value) {
    if (!value) return null;
    var raw = String(value);
    for (var i = 0; i < LANGS.length; i += 1) {
      if (LANGS[i].code === raw) return LANGS[i].code;
    }

    var lower = raw.toLowerCase();
    if (lower.indexOf("zh") === 0) {
      return lower.indexOf("hant") > -1 ||
        lower.indexOf("tw") > -1 ||
        lower.indexOf("hk") > -1 ||
        lower.indexOf("mo") > -1
        ? "zh-Hant"
        : "zh-Hans";
    }

    var short = lower.split("-")[0];
    for (var j = 0; j < LANGS.length; j += 1) {
      if (LANGS[j].code.toLowerCase().split("-")[0] === short)
        return LANGS[j].code;
    }
    return null;
  }

  function normalizeLang(value) {
    return matchSupportedLang(value) || DEFAULT_LANG;
  }

  function detectLang() {
    return normalizeLang(window.NIARIM_INITIAL_LOCALE);
  }

  function t(lang, key) {
    var table = DICT[lang] || DICT.ja || {};
    var fallback = DICT.ja || {};
    return Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : fallback[key] || key;
  }

  function syncCurrentUrl(lang) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    } catch (_) {}
  }

  function localizeInternalLinks(lang) {
    var current = new URL(window.location.href).searchParams.get("lang");
    // Keep automatically negotiated navigation URLs shareable without a
    // language override. A chosen language follows explicit links.
    if (
      !LANGS.some(function (item) {
        return item.code === current;
      })
    )
      return;
    document.querySelectorAll("a[href]").forEach(function (anchor) {
      var raw = anchor.getAttribute("href");
      if (!raw || raw.charAt(0) === "#") return;
      try {
        var url = new URL(raw, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname.indexOf("/api/") === 0) return;
        if (
          anchor.hasAttribute("download") ||
          (/\.[^/]+$/.test(url.pathname) &&
            !url.pathname.endsWith("/index.html"))
        )
          return;
        url.searchParams.set("lang", lang);
        anchor.setAttribute("href", url.pathname + url.search + url.hash);
      } catch (_) {}
    });
  }

  var helpRequest = 0;
  var helpLanguage;

  function applyLang(lang, options) {
    var help = window.NIARIM_HELP_TRANSLATIONS;
    if (!help) return renderLang(lang, options);

    lang = normalizeLang(lang);
    var request = ++helpRequest;
    if (
      !helpLanguage &&
      lang === document.documentElement.getAttribute("data-help-locale")
    ) {
      helpLanguage = renderLang(lang, options);
      return Promise.resolve(helpLanguage);
    }
    return help.load(lang).then(
      function (topics) {
        if (request !== helpRequest) return helpLanguage;
        Object.assign(DICT[lang] || (DICT[lang] = {}), topics);
        helpLanguage = renderLang(lang, options);
        return helpLanguage;
      },
      function () {
        // The document contains a complete Japanese fallback. If a later
        // request fails, keep the last rendered language and allow retry.
        if (request === helpRequest && !helpLanguage) {
          helpLanguage = renderLang("ja");
        }
        return helpLanguage;
      },
    );
  }

  // Headings keep each word on one line: a line breaks only between words.
  // Chinese has no spaces, so the browser otherwise breaks inside a word
  // (「手|机」); a long Japanese katakana word or a long French or Korean word
  // also broke wherever the line ran out. Each word becomes a no-wrap span, and
  // when one word is wider than the heading, the heading's text is made smaller
  // until the word fits (instead of breaking it).
  var WORD_HOLDERS = "h1, h2, h3, h4, h5, h6, summary, .faq-question";
  var wordPatterns = null;
  try {
    wordPatterns = {
      kana: new RegExp("^[\\p{Script=Katakana}\\u30FC\\u30FB]{2,}$", "u"),
      han: new RegExp("^\\p{Script=Han}{2,}$", "u"),
      latin: /^[A-Za-z0-9À-ɏ][A-Za-z0-9À-ɏ.\-+'’]+$/,
    };
  } catch (_) {}

  function keepWordTokens(lang, text) {
    // Returns [text, keep] pieces, or null when nothing needs keeping.
    var pieces = [];
    var any = false;
    if (lang === "ja" || lang === "zh-Hans" || lang === "zh-Hant") {
      if (!window.Intl || !Intl.Segmenter) return null;
      var segmenter = new Intl.Segmenter(lang, { granularity: "word" });
      var it = segmenter.segment(text)[Symbol.iterator]();
      for (var step = it.next(); !step.done; step = it.next()) {
        var word = step.value.segment;
        var keep =
          step.value.isWordLike &&
          (wordPatterns.han.test(word) ||
            wordPatterns.latin.test(word) ||
            (lang === "ja" && wordPatterns.kana.test(word)));
        if (keep) any = true;
        pieces.push([word, keep]);
      }
    } else {
      // Split at ordinary spaces only, so a no-break space (French « : »)
      // stays inside its word.
      text.split(/([ \t\n\r]+)/).forEach(function (part) {
        if (!part) return;
        var keep = !/^[ \t\n\r]+$/.test(part) && part.length > 1;
        if (keep) any = true;
        pieces.push([part, keep]);
      });
    }
    return any ? pieces : null;
  }

  function keepHeadingWords(lang) {
    if (!wordPatterns) return;
    var holders = Array.prototype.slice.call(
      document.querySelectorAll(WORD_HOLDERS),
    );
    // Read everything first, then change the DOM, then measure, so the page
    // is styled and laid out once rather than once per heading.
    var texts = [];
    var seen = new Set();
    holders.forEach(function (holder) {
      var walker = document.createTreeWalker(holder, NodeFilter.SHOW_TEXT);
      for (var node = walker.nextNode(); node; node = walker.nextNode()) {
        var parent = node.parentElement;
        if (!parent || parent.closest(".nw, svg, script, style")) continue;
        // A heading inside another holder (a <summary> with an <h3>) is
        // walked twice; each text is changed once.
        if (!node.data.trim() || seen.has(node)) continue;
        seen.add(node);
        // In a flex or grid box every child is its own item, so the words
        // stay together in one inline wrapper there.
        texts.push([node, /flex|grid/.test(getComputedStyle(parent).display)]);
      }
    });
    texts.forEach(function (entry) {
      var node = entry[0];
      var pieces = keepWordTokens(lang, node.data);
      if (!pieces) return;
      var target = document.createDocumentFragment();
      var fragment = target;
      if (entry[1]) {
        fragment = document.createElement("span");
        target.appendChild(fragment);
      }
      pieces.forEach(function (piece) {
        if (!piece[1]) {
          fragment.appendChild(document.createTextNode(piece[0]));
          return;
        }
        var span = document.createElement("span");
        span.className = "nw";
        span.textContent = piece[0];
        fragment.appendChild(span);
      });
      node.parentNode.replaceChild(target, node);
    });
    holders.forEach(fitHeadingWords);
    if (wordObserver)
      holders.forEach(function (holder) {
        wordObserver.observe(holder);
      });
  }

  function contentWidth(element) {
    var style = getComputedStyle(element);
    return (
      element.clientWidth -
      (parseFloat(style.paddingLeft) || 0) -
      (parseFloat(style.paddingRight) || 0)
    );
  }

  function blockOf(word, holder) {
    for (
      var el = word.parentElement;
      el && el !== holder;
      el = el.parentElement
    )
      if (!/^inline/.test(getComputedStyle(el).display) || el === holder)
        return el;
    return holder;
  }

  function fitHeadingWords(holder) {
    var words = holder.querySelectorAll(".nw");
    if (!words.length) return;
    if (holder.hasAttribute("data-fit-size")) {
      holder.style.fontSize = "";
      holder.removeAttribute("data-fit-size");
      words.forEach(function (word) {
        word.style.whiteSpace = "";
      });
    }
    var worst = 1;
    for (var round = 0; round < 3; round += 1) {
      worst = 1;
      for (var i = 0; i < words.length; i += 1) {
        var width = words[i].getBoundingClientRect().width;
        var room = contentWidth(blockOf(words[i], holder));
        if (width > 0 && room > 0 && width > room + 0.5)
          worst = Math.min(worst, room / width);
      }
      if (worst === 1) return;
      var size = parseFloat(getComputedStyle(holder).fontSize);
      holder.style.fontSize = (size * worst * 0.98).toFixed(2) + "px";
      holder.setAttribute("data-fit-size", "");
    }
    // A width set in em shrinks with the text and never makes room: let the
    // words that still do not fit break as before.
    words.forEach(function (word) {
      var room = contentWidth(blockOf(word, holder));
      if (word.getBoundingClientRect().width > room + 0.5)
        word.style.whiteSpace = "normal";
    });
  }

  var wordObserver = null;
  var fittedWidth = new WeakMap();
  if (window.ResizeObserver) {
    wordObserver = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        var width = Math.round(entry.contentRect.width);
        if (fittedWidth.get(entry.target) === width) return;
        fittedWidth.set(entry.target, width);
        fitHeadingWords(entry.target);
      });
    });
  }
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener("loadingdone", function () {
      document.querySelectorAll(WORD_HOLDERS).forEach(fitHeadingWords);
    });
  }

  function renderLang(lang, options) {
    lang = normalizeLang(lang);
    if (!DICT[lang]) lang = DICT[DEFAULT_LANG] ? DEFAULT_LANG : "ja";
    options = options || {};

    if (options.syncUrl === true) syncCurrentUrl(lang);
    if (options.remember === true) {
      try {
        document.cookie =
          "niarim_lang=" +
          lang +
          "; Path=/; Max-Age=31536000; SameSite=Lax" +
          (window.location.protocol === "https:" ? "; Secure" : "");
      } catch (_) {}
    }

    document.documentElement.setAttribute("lang", lang);

    // ラテン系の言語のときは、font-familyからCJKサブセットを外す印を付ける
    // （lang-flag.js が第一描画前に付けるのと同じ属性）。ページを開いたまま
    // 言語を切り替えたときは、ここで付け直さないと「英語で開いてから日本語に
    // 切り替えた」場合に日本語がOSのフォントで描かれたままになる。
    if (lang === "en" || lang === "fr" || lang === "es") {
      document.documentElement.setAttribute("data-latin-only", "");
    } else {
      document.documentElement.removeAttribute("data-latin-only");
    }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var translated = t(lang, key);
      if (translated !== key) {
        // Dictionary markup for line breaks/emphasis is rendered as safe DOM,
        // never as literal <br> text or arbitrary innerHTML.
        if (/<br\s*\/?>|<\/?(?:em|strong)>/i.test(translated)) {
          var fragment = document.createDocumentFragment();
          var stack = [fragment];
          translated
            .split(/(<br\s*\/?>|<\/?em>|<\/?strong>)/gi)
            .forEach(function (part) {
              if (/^<br\s*\/?>$/i.test(part))
                stack[stack.length - 1].appendChild(
                  document.createElement("br"),
                );
              else if (/^<(em|strong)>$/i.test(part)) {
                var tag = part.slice(1, -1).toLowerCase();
                var item = document.createElement(tag);
                stack[stack.length - 1].appendChild(item);
                stack.push(item);
              } else if (/^<\/(em|strong)>$/i.test(part)) {
                if (stack.length > 1) stack.pop();
              } else if (part)
                stack[stack.length - 1].appendChild(
                  document.createTextNode(part),
                );
            });
          el.replaceChildren(fragment);
        } else el.textContent = translated;
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var translated = t(lang, key);
      if (translated !== key) el.innerHTML = translated;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split("|")
        .forEach(function (pair) {
          var parts = pair.split(":");
          if (parts[0] && parts[1])
            el.setAttribute(parts[0], t(lang, parts[1]));
        });
    });

    var titleKey = document.body.getAttribute("data-i18n-title");
    if (titleKey) {
      var title = t(lang, titleKey);
      document.title = title;
      [
        document.querySelector('meta[property="og:title"]'),
        document.querySelector('meta[name="twitter:title"]'),
      ].forEach(function (meta) {
        if (meta) meta.setAttribute("content", title);
      });
    }

    var descKey = document.body.getAttribute("data-i18n-description");
    if (descKey) {
      var description = t(lang, descKey);
      [
        document.querySelector('meta[name="description"]'),
        document.querySelector('meta[property="og:description"]'),
        document.querySelector('meta[name="twitter:description"]'),
      ].forEach(function (meta) {
        if (meta) meta.setAttribute("content", description);
      });
    }

    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", OG_LOCALES[lang] || "ja_JP");

    localizeInternalLinks(lang);

    document.querySelectorAll("[data-lang-switch]").forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-lang-switch") === lang),
      );
    });

    var currentLabelEl = document.querySelector("[data-current-lang-label]");
    if (currentLabelEl) {
      for (var i = 0; i < LANGS.length; i += 1) {
        if (LANGS[i].code === lang) {
          currentLabelEl.textContent = LANGS[i].label;
          break;
        }
      }
    }

    localizeCaptures(lang);

    // Layout help only: a failure here must never stop the language switch.
    try {
      keepHeadingWords(lang);
    } catch (_) {}

    document.dispatchEvent(
      new CustomEvent("niarim:langchange", { detail: { lang: lang } }),
    );

    return lang;
  }

  // App screen captures are taken in every page language: Japanese is
  // <name>.webp (and .avif), the others <name>-<lang>.webp next to it. The
  // Worker rewrites the static <img>/<source> (src/capture-url.js, the same
  // rule); scripts that build capture URLs pass them through captureUrl().
  var CAPTURE_LANGS = ["en", "es", "fr", "ko", "zh-Hans", "zh-Hant"];
  var CAPTURE_URL =
    /^(.*\/assets\/images\/app-captures\/(?:pc-)?(?:canvas|layers|onion-skin|timeline|audio-editor|save-tree|export|workspace|widget)(?:-v[234])?)(?:-(?:en|es|fr|ko|zh-Hans|zh-Hant))?(\.(?:webp|avif)(?:\?.*)?)$/;

  function captureUrl(url, lang) {
    var match = CAPTURE_URL.exec(url || "");
    if (!match) return url;
    lang = lang || document.documentElement.lang || "ja";
    var suffix = CAPTURE_LANGS.indexOf(lang) >= 0 ? "-" + lang : "";
    return match[1] + suffix + match[2];
  }

  function localizeCaptures(lang) {
    document
      .querySelectorAll(
        'img[src*="/app-captures/"], source[srcset*="/app-captures/"]',
      )
      .forEach(function (el) {
        var attribute = el.tagName === "SOURCE" ? "srcset" : "src";
        var value = el.getAttribute(attribute);
        var next = captureUrl(value, lang);
        if (next !== value) el.setAttribute(attribute, next);
      });
  }

  function setLangDropdownOpen(dropdown, open, restoreFocus) {
    dropdown.setAttribute("data-open", String(open));
    var trigger = dropdown.querySelector("[data-lang-trigger]");
    if (trigger) {
      trigger.setAttribute("aria-expanded", String(open));
      if (restoreFocus) trigger.focus();
    }
  }

  function buildLangMenu() {
    var mount = document.querySelector("[data-lang-menu]");
    if (!mount) return;
    mount.innerHTML = "";

    LANGS.forEach(function (lang) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = lang.label;
      button.setAttribute("data-lang-switch", lang.code);
      button.addEventListener("click", function () {
        applyLang(lang.code, { syncUrl: true, remember: true });
        var dropdown = mount.closest("[data-lang-dropdown]");
        if (dropdown) setLangDropdownOpen(dropdown, false, true);
      });
      li.appendChild(button);
      mount.appendChild(li);
    });
  }

  function initLangDropdownToggle() {
    var dropdown = document.querySelector("[data-lang-dropdown]");
    if (!dropdown) return;
    var trigger = dropdown.querySelector("[data-lang-trigger]");
    if (!trigger) return;

    var downloadLink = dropdown.parentElement.querySelector(
      ":scope > a.nav-release",
    );
    if (downloadLink) {
      var mobileNav = window.matchMedia("(max-width: 900px)");
      function alignNavOrder() {
        var next = mobileNav.matches ? dropdown : dropdown.nextElementSibling;
        if (next === downloadLink || downloadLink.nextElementSibling === next)
          return;
        var restoreFocus = document.activeElement === downloadLink;
        dropdown.parentElement.insertBefore(downloadLink, next);
        if (restoreFocus) downloadLink.focus({ preventScroll: true });
      }
      alignNavOrder();
      mobileNav.addEventListener("change", alignNavOrder);
    }

    var menu = dropdown.querySelector("[data-lang-menu]");
    if (menu) {
      if (!menu.id) menu.id = "language-menu";
      trigger.setAttribute("aria-controls", menu.id);
    }
    setLangDropdownOpen(dropdown, false);

    trigger.addEventListener("click", function () {
      var willOpen = dropdown.getAttribute("data-open") !== "true";
      setLangDropdownOpen(dropdown, willOpen);
      // スマホではこの切替がメニューパネルの下端付近にあり、開いた一覧が
      // 画面外へ出て「言語が3つしか無い」ように見えていた。パネルは
      // スクロールできるので、開いたら一覧が見える位置まで送ってやる。
      if (!willOpen) return;
      var menu = dropdown.querySelector("[data-lang-menu]");
      if (!menu || !menu.scrollIntoView) return;
      requestAnimationFrame(function () {
        var rect = menu.getBoundingClientRect();
        if (rect.bottom <= window.innerHeight) return;
        menu.scrollIntoView({
          block: "end",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target))
        setLangDropdownOpen(dropdown, false);
    });

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        dropdown.getAttribute("data-open") === "true"
      ) {
        event.preventDefault();
        setLangDropdownOpen(dropdown, false, true);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildLangMenu();
    initLangDropdownToggle();
    applyLang(detectLang());
  });

  window.NIARIM_I18N = {
    languages: LANGS,
    translate: t,
    applyLang: applyLang,
    captureUrl: captureUrl,
  };
})();
