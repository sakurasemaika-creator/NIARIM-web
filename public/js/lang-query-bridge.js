(function () {
  "use strict";

  var supported = {
    ja: true,
    en: true,
    "zh-Hans": true,
    "zh-Hant": true,
    ko: true,
    fr: true,
    es: true,
  };
  var STORAGE_KEY = "niarim_lang";
  var RESTORE_KEY = "niarim_lang_query_restore";
  var lang;

  try {
    lang = new URL(window.location.href).searchParams.get("lang");
  } catch (_) {
    lang = null;
  }
  if (!lang || !supported[lang]) return;

  document.documentElement.setAttribute("lang", lang);
  if (lang === "en" || lang === "fr" || lang === "es") {
    document.documentElement.setAttribute("data-latin-only", "");
  } else {
    document.documentElement.removeAttribute("data-latin-only");
  }

  try {
    var previous = window.localStorage.getItem(STORAGE_KEY);
    window.sessionStorage.setItem(
      RESTORE_KEY,
      previous === null ? "__NIARIM_NONE__" : previous,
    );
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (_) {
    return;
  }

  document.addEventListener(
    "niarim:langchange",
    function restorePreference(event) {
      if (!event.detail || event.detail.lang !== lang) return;
      try {
        var saved = window.sessionStorage.getItem(RESTORE_KEY);
        if (saved === "__NIARIM_NONE__") window.localStorage.removeItem(STORAGE_KEY);
        else if (saved !== null) window.localStorage.setItem(STORAGE_KEY, saved);
        window.sessionStorage.removeItem(RESTORE_KEY);
      } catch (_) {}
      document.removeEventListener("niarim:langchange", restorePreference);
    },
  );
})();
