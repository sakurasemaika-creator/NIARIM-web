/* Audience-focused gallery copy, shared by the seven site languages. */
(function(){ "use strict"; var translations={
  "ja": {
    "communityPage.comingSoon": "NIARIMの作品広場で、新しいアニメに出会いましょう。気になった作品はブックマークして、あとから楽しめます。",
    "communityPage.ranking.note": "新着作品や、ブックマークで人気を集めた作品を探せます。",
    "narrative.community.3.body": "たくさんの作品からお気に入りを発見。ブックマークを集めた作品もチェックして、新しいアイデアを見つけよう。",
    "communityPage.update.body": "新しい作品や人気の作品を探せます。気になる作品を見つけたら、ブックマークして後からゆっくり楽しめます。"
  },
  "en": {
    "communityPage.comingSoon": "Discover animations in the NIARIM gallery. Bookmark your favorites to enjoy again later.",
    "communityPage.ranking.note": "Discover new works and popular creations based on bookmarks.",
    "narrative.community.3.body": "Find new inspiration among everyone's creations, including works loved by the community.",
    "communityPage.update.body": "Explore new and popular works. Bookmark the ones you love and return to them anytime."
  },
  "zh-Hans": {
    "communityPage.comingSoon": "在 NIARIM 作品广场发现新动画。喜欢的作品可以收藏，随时重温。",
    "communityPage.ranking.note": "探索新作品以及受到大家收藏的热门作品。",
    "narrative.community.3.body": "在各种作品中寻找灵感，也可以看看大家喜欢收藏的创作。",
    "communityPage.update.body": "探索新作品和热门作品。发现喜欢的作品就收藏起来，以后再慢慢欣赏。"
  },
  "zh-Hant": {
    "communityPage.comingSoon": "在 NIARIM 作品廣場發現新動畫。喜歡的作品可以加入書籤，隨時重溫。",
    "communityPage.ranking.note": "探索新作品以及受到大家喜愛的熱門作品。",
    "narrative.community.3.body": "在各種作品中尋找靈感，也可以看看大家喜愛收藏的創作。",
    "communityPage.update.body": "探索新作品和熱門作品。發現喜歡的作品就加入書籤，以後再慢慢欣賞。"
  },
  "ko": {
    "communityPage.comingSoon": "NIARIM 작품 광장에서 새로운 애니메이션을 만나 보세요. 마음에 드는 작품을 북마크해 다시 즐길 수 있어요.",
    "communityPage.ranking.note": "새 작품과 북마크로 사랑받는 인기 작품을 찾아보세요.",
    "narrative.community.3.body": "다양한 작품에서 영감을 얻고 다른 사람들이 좋아하는 작품도 둘러보세요.",
    "communityPage.update.body": "새 작품과 인기 작품을 둘러보세요. 마음에 드는 작품을 북마크하고 언제든 다시 감상하세요."
  },
  "fr": {
    "communityPage.comingSoon": "Découvrez des animations dans la galerie NIARIM. Enregistrez vos favorites pour les revoir.",
    "communityPage.ranking.note": "Découvrez les nouveautés et les créations populaires auprès des utilisateurs.",
    "narrative.community.3.body": "Trouvez l'inspiration parmi les créations de la communauté et ses œuvres favorites.",
    "communityPage.update.body": "Parcourez les nouveautés et les œuvres populaires. Enregistrez celles que vous aimez pour y revenir."
  },
  "es": {
    "communityPage.comingSoon": "Descubre animaciones en la galería NIARIM. Guarda tus favoritas para volver a disfrutarlas.",
    "communityPage.ranking.note": "Descubre obras nuevas y creaciones populares por sus marcadores.",
    "narrative.community.3.body": "Encuentra inspiración entre las creaciones de la comunidad y sus obras favoritas.",
    "communityPage.update.body": "Explora obras nuevas y populares. Guarda las que te gusten para volver a verlas cuando quieras."
  }
}; var dict=window.NIARIM_I18N_DICT||(window.NIARIM_I18N_DICT={}); Object.keys(translations).forEach(function(locale){dict[locale]=Object.assign(dict[locale]||{},translations[locale]);});})();
