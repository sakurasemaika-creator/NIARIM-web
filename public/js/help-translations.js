/* Load only the language used by the Help page. */
(function () {
  "use strict";

  var locales = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "fr", "es"];
  var requested = new URL(window.location.href).searchParams.get("lang");
  var initial = locales.includes(requested) ? requested : "en";
  var serverLocale = document.documentElement.getAttribute("data-help-locale");
  var pending = new Map();

  function load(lang) {
    if (!pending.has(lang)) {
      pending.set(lang, fetch("/js/help-topics/" + lang + ".json")
        .then(function (response) {
          if (!response.ok) throw new Error("Could not load Help translations");
          return response.json();
        })
        .catch(function (error) {
          pending.delete(lang);
          throw error;
        }));
    }
    return pending.get(lang);
  }

  window.NIARIM_HELP_TRANSLATIONS = { load: load };
  if (serverLocale !== initial) load(initial).catch(function () {});
})();
