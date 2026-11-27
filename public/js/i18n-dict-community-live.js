/* Audience-focused gallery copy, shared by the seven site languages. */
(function(){ "use strict"; var translations={
  "ja": {
    "communityPage.ranking.note": "新着作品や、ブックマークで人気を集めた作品を探せます。",
    "narrative.community.3.body": "ブックマークの多い作品を、デイリー・週間・月間・年間・累計のランキングで見られます。",
  },
  "en": {
    "communityPage.ranking.note": "Discover new works and popular creations based on bookmarks.",
    "narrative.community.3.body": "See the most-bookmarked works in daily, weekly, monthly, yearly and all-time rankings.",
  },
  "zh-Hans": {
    "communityPage.ranking.note": "探索新作品以及受到大家收藏的热门作品。",
    "narrative.community.3.body": "可以在每日、每周、每月、每年和累计排行榜中查看收藏最多的作品。",
  },
  "zh-Hant": {
    "communityPage.ranking.note": "探索新作品以及受到大家喜愛的熱門作品。",
    "narrative.community.3.body": "可以在每日、每週、每月、每年和累計排行榜中查看收藏最多的作品。",
  },
  "ko": {
    "communityPage.ranking.note": "새 작품과 북마크로 사랑받는 인기 작품을 찾아보세요.",
    "narrative.community.3.body": "북마크가 많은 작품을 일간·주간·월간·연간·누적 랭킹으로 볼 수 있습니다.",
  },
  "fr": {
    "communityPage.ranking.note": "Découvrez les nouveautés et les créations populaires auprès des utilisateurs.",
    "narrative.community.3.body": "Consultez les œuvres les plus mises en favori dans les classements du jour, de la semaine, du mois, de l’année et de tous les temps.",
  },
  "es": {
    "communityPage.ranking.note": "Descubre obras nuevas y creaciones populares por sus marcadores.",
    "narrative.community.3.body": "Consulta las obras con más marcadores en los rankings diario, semanal, mensual, anual y total.",
  }
}; var dict=window.NIARIM_I18N_DICT||(window.NIARIM_I18N_DICT={}); Object.keys(translations).forEach(function(locale){dict[locale]=Object.assign(dict[locale]||{},translations[locale]);});})();
