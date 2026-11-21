/* Help search and navigation translations. Topic translations are synchronized separately. */
(function () {
  "use strict";
  var dict = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var labels = {
    "ja": {
      "help.title": "ヘルプ",
      "help.searchHint": "検索...",
      "help.clearSearch": "検索をやめる",
      "help.resultCount": "検索結果 {count}件",
      "help.noResults": "該当する項目が見つかりません"
    },
    "en": {
      "help.title": "Help",
      "help.searchHint": "Search...",
      "help.clearSearch": "Clear search",
      "help.resultCount": "Results ({count})",
      "help.noResults": "No matching items found"
    },
    "zh-Hans": {
      "help.title": "帮助",
      "help.searchHint": "搜索...",
      "help.clearSearch": "清除搜索",
      "help.resultCount": "搜索结果（{count}）",
      "help.noResults": "未找到相关项目"
    },
    "zh-Hant": {
      "help.title": "說明",
      "help.searchHint": "搜尋...",
      "help.clearSearch": "清除搜尋",
      "help.resultCount": "搜尋結果（{count}）",
      "help.noResults": "找不到相符的項目"
    },
    "ko": {
      "help.title": "도움말",
      "help.searchHint": "검색...",
      "help.clearSearch": "검색 지우기",
      "help.resultCount": "검색 결과 {count}개",
      "help.noResults": "해당하는 항목을 찾을 수 없습니다"
    },
    "fr": {
      "help.title": "Aide",
      "help.searchHint": "Rechercher...",
      "help.clearSearch": "Effacer la recherche",
      "help.resultCount": "Résultats ({count})",
      "help.noResults": "Aucun élément correspondant trouvé"
    },
    "es": {
      "help.title": "Ayuda",
      "help.searchHint": "Buscar...",
      "help.clearSearch": "Borrar búsqueda",
      "help.resultCount": "Resultados ({count})",
      "help.noResults": "No se encontraron elementos coincidentes"
    }
  };
  Object.keys(labels).forEach(function (lang) {
    Object.assign(dict[lang] || (dict[lang] = {}), labels[lang]);
  });
})();
