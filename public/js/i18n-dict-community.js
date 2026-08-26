/**
 * NIARIM公式サイト コミュニティ(みんなの作品を見る)ページ 翻訳辞書
 *
 * NIARIMアプリ(dev_branch)の
 * docs/AI設計書/29_動画投稿・ランキング機能仕様.md に基づく。
 * 同ドキュメント冒頭に明記の通り、本機能は「仕様検討・確定済みだが
 * コード実装には未着手」の段階であるため、本ページも「準備中の機能紹介」
 * として構成し、実装済みであるとは記載していない。
 * - ランキング種類: 累計/年間/月間/週間/デイリーの5種、Top50表示(8章)
 * - 更新頻度: 初期1日2〜4回、基本1日2回(14章)
 * - 閲覧(新着・ランキング・作者別一覧含む)はログイン不要、投稿・通報・
 *   ブロックのみGoogleログイン必須(2章)
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
  "ja": {
    "meta.community.title": "みんなの作品を見る | NIARIM",
    "meta.community.description": "NIARIMで作られた作品を、新着やランキングから発見できるコミュニティ機能のご紹介です。",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "みんなの作品を見る",
    "communityPage.lead": "NIARIMで制作された作品を発見できるコミュニティ機能です。閲覧はログイン不要で、誰でも気軽に楽しめます。",
    "communityPage.comingSoon": "本ページはNIARIM正式リリースに向けて準備中の機能を紹介するページです。仕様は確定していますが、実装は今後行われます。画面キャプチャは後日、実際の画面に差し替えます。",
    "communityPage.login.title": "見るだけならログイン不要",
    "communityPage.login.body": "アニメを描いて遊ぶことはもちろん、みんなの作品の閲覧・新着・ランキングの表示・作者の作品一覧の閲覧は、ログインなしでお楽しみいただけます。作品の投稿・通報・ブロックにはGoogleアカウントでのログインが必要です。",
    "communityPage.tabs.overall": "累計",
    "communityPage.tabs.yearly": "年間",
    "communityPage.tabs.monthly": "月間",
    "communityPage.tabs.weekly": "週間",
    "communityPage.tabs.daily": "デイリー",
    "communityPage.tabs.latest": "新着",
    "communityPage.ranking.note": "各ランキングはTOP50を表示予定です。",
    "communityPage.update.title": "毎日更新される、集まる場所に",
    "communityPage.update.body": "新着は投稿され次第すぐに反映されます。ランキングは1日2回（作品数に応じて最大4回）更新を予定しており、いつ訪れても新しい発見がある、毎日集まりたくなる場所を目指しています。",
    "communityPage.bookmark.title": "ブックマーク機能",
    "communityPage.bookmark.body": "お気に入りの作品はブックマークして、あとから見返せます（ブックマークにはログインが必要です）。",
    "communityPage.placeholder.label": "作品プレースホルダー",
    "communityPage.cta.title": "あなたの作品も、ここに。",
    "communityPage.cta.body": "NIARIMで手描きアニメーションを制作して、いつか、みんなの作品欄に投稿してみませんか。",
    "communityPage.cta.link": "アプリをダウンロード"
  },
  "en": {
    "meta.community.title": "Community Gallery | NIARIM",
    "meta.community.description": "Discover works made with NIARIM through new arrivals and rankings — an introduction to the community feature.",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "Community Gallery",
    "communityPage.lead": "A community feature for discovering work made with NIARIM. Browsing requires no login, so anyone can enjoy it casually.",
    "communityPage.comingSoon": "This page introduces a feature being prepared for NIARIM's official launch. The specification is finalized, but implementation is still to come. Screenshots here will be replaced with the real screens later.",
    "communityPage.login.title": "No login needed just to browse",
    "communityPage.login.body": "Drawing and animating, plus browsing everyone's work, new arrivals, rankings, and an author's work list, are all available without logging in. Posting, reporting, and blocking require signing in with a Google account.",
    "communityPage.tabs.overall": "All-time",
    "communityPage.tabs.yearly": "Yearly",
    "communityPage.tabs.monthly": "Monthly",
    "communityPage.tabs.weekly": "Weekly",
    "communityPage.tabs.daily": "Daily",
    "communityPage.tabs.latest": "New",
    "communityPage.ranking.note": "Each ranking is planned to show the Top 50.",
    "communityPage.update.title": "Updated daily, built to be a gathering place",
    "communityPage.update.body": "New arrivals appear as soon as they're posted. Rankings are planned to update twice a day (up to 4 times as the number of works grows), so there's something new to discover whenever you visit — a place people want to come back to every day.",
    "communityPage.bookmark.title": "Bookmarks",
    "communityPage.bookmark.body": "Bookmark your favorite works to find them again later (bookmarking requires signing in).",
    "communityPage.placeholder.label": "Work placeholder",
    "communityPage.cta.title": "Your work could be here too.",
    "communityPage.cta.body": "Create a hand-drawn animation with NIARIM, and one day, why not post it here for everyone to see?",
    "communityPage.cta.link": "Download the App"
  },
  "zh-Hans": {
    "meta.community.title": "看看大家的作品 | NIARIM",
    "meta.community.description": "介绍可通过新作与排行榜发现 NIARIM 创作作品的社区功能。",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "看看大家的作品",
    "communityPage.lead": "可发现使用 NIARIM 制作的作品的社区功能。浏览无需登录，任何人都能轻松享受。",
    "communityPage.comingSoon": "本页面介绍的是为 NIARIM 正式上线而准备中的功能。规格已确定，但具体实现将在今后进行。此处的截图将于日后替换为实际画面。",
    "communityPage.login.title": "仅浏览无需登录",
    "communityPage.login.body": "制作动画、浏览大家的作品、查看新作与排行榜、查看作者作品列表，均无需登录即可使用。投稿作品、举报、屏蔽用户则需要使用 Google 账号登录。",
    "communityPage.tabs.overall": "累计",
    "communityPage.tabs.yearly": "年度",
    "communityPage.tabs.monthly": "月度",
    "communityPage.tabs.weekly": "周度",
    "communityPage.tabs.daily": "每日",
    "communityPage.tabs.latest": "新作",
    "communityPage.ranking.note": "各排行榜预计显示前 50 名。",
    "communityPage.update.title": "每日更新，打造大家聚集的场所",
    "communityPage.update.body": "新作一经投稿即会立即显示。排行榜预计每日更新2次（视作品数量最多可达4次），无论何时造访都能有新发现，力求打造让大家每天都想来的场所。",
    "communityPage.bookmark.title": "收藏功能",
    "communityPage.bookmark.body": "可将喜欢的作品加入收藏，方便日后查看（收藏功能需要登录）。",
    "communityPage.placeholder.label": "作品预留位",
    "communityPage.cta.title": "你的作品，也能在这里展示。",
    "communityPage.cta.body": "用 NIARIM 创作手绘动画，未来不妨投稿到这里，与大家分享。",
    "communityPage.cta.link": "下载应用"
  },
  "zh-Hant": {
    "meta.community.title": "看看大家的作品 | NIARIM",
    "meta.community.description": "介紹可透過新作與排行榜發現 NIARIM 創作作品的社群功能。",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "看看大家的作品",
    "communityPage.lead": "可發現使用 NIARIM 製作的作品的社群功能。瀏覽無需登入，任何人都能輕鬆享受。",
    "communityPage.comingSoon": "本頁面介紹的是為 NIARIM 正式上線而準備中的功能。規格已確定，但具體實作將於今後進行。此處的截圖將於日後替換為實際畫面。",
    "communityPage.login.title": "僅瀏覽無需登入",
    "communityPage.login.body": "製作動畫、瀏覽大家的作品、查看新作與排行榜、查看作者作品列表，均無需登入即可使用。投稿作品、檢舉、封鎖使用者則需要使用 Google 帳號登入。",
    "communityPage.tabs.overall": "累計",
    "communityPage.tabs.yearly": "年度",
    "communityPage.tabs.monthly": "月度",
    "communityPage.tabs.weekly": "週度",
    "communityPage.tabs.daily": "每日",
    "communityPage.tabs.latest": "新作",
    "communityPage.ranking.note": "各排行榜預計顯示前 50 名。",
    "communityPage.update.title": "每日更新，打造大家聚集的場所",
    "communityPage.update.body": "新作一經投稿即會立即顯示。排行榜預計每日更新2次（視作品數量最多可達4次），無論何時造訪都能有新發現，力求打造讓大家每天都想來的場所。",
    "communityPage.bookmark.title": "收藏功能",
    "communityPage.bookmark.body": "可將喜歡的作品加入收藏，方便日後查看（收藏功能需要登入）。",
    "communityPage.placeholder.label": "作品預留位",
    "communityPage.cta.title": "你的作品，也能在這裡展示。",
    "communityPage.cta.body": "用 NIARIM 創作手繪動畫，未來不妨投稿到這裡，與大家分享。",
    "communityPage.cta.link": "下載應用程式"
  },
  "ko": {
    "meta.community.title": "모두의 작품 보기 | NIARIM",
    "meta.community.description": "NIARIM으로 만든 작품을 신작과 랭킹에서 발견할 수 있는 커뮤니티 기능을 소개합니다.",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "모두의 작품 보기",
    "communityPage.lead": "NIARIM으로 제작된 작품을 발견할 수 있는 커뮤니티 기능입니다. 열람은 로그인 없이 가능해 누구나 부담 없이 즐길 수 있습니다.",
    "communityPage.comingSoon": "이 페이지는 NIARIM 정식 출시를 위해 준비 중인 기능을 소개하는 페이지입니다. 사양은 확정되었으나 구현은 앞으로 진행됩니다. 화면 캡처는 추후 실제 화면으로 교체됩니다.",
    "communityPage.login.title": "보기만 한다면 로그인 불필요",
    "communityPage.login.body": "애니메이션 제작은 물론, 모두의 작품 열람・신작・랭킹 표시・작가별 작품 목록 열람은 로그인 없이 즐기실 수 있습니다. 작품 투고・신고・차단에는 Google 계정 로그인이 필요합니다.",
    "communityPage.tabs.overall": "누적",
    "communityPage.tabs.yearly": "연간",
    "communityPage.tabs.monthly": "월간",
    "communityPage.tabs.weekly": "주간",
    "communityPage.tabs.daily": "데일리",
    "communityPage.tabs.latest": "신작",
    "communityPage.ranking.note": "각 랭킹은 TOP 50을 표시할 예정입니다.",
    "communityPage.update.title": "매일 업데이트되는, 모두가 모이는 공간으로",
    "communityPage.update.body": "신작은 투고되는 즉시 반영됩니다. 랭킹은 하루 2회（작품 수에 따라 최대 4회） 업데이트를 예정하고 있어, 언제 방문해도 새로운 발견이 있는, 매일 찾고 싶어지는 공간을 목표로 합니다.",
    "communityPage.bookmark.title": "북마크 기능",
    "communityPage.bookmark.body": "마음에 드는 작품은 북마크해 두고 나중에 다시 볼 수 있습니다（북마크에는 로그인이 필요합니다）.",
    "communityPage.placeholder.label": "작품 플레이스홀더",
    "communityPage.cta.title": "당신의 작품도, 이곳에.",
    "communityPage.cta.body": "NIARIM으로 손그림 애니메이션을 제작해, 언젠가 모두의 작품란에 투고해 보지 않으시겠어요?",
    "communityPage.cta.link": "앱 다운로드"
  },
  "fr": {
    "meta.community.title": "Galerie de la communauté | NIARIM",
    "meta.community.description": "Découvrez les œuvres créées avec NIARIM via les nouveautés et les classements — présentation de la fonctionnalité communautaire.",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "Galerie de la communauté",
    "communityPage.lead": "Une fonctionnalité communautaire pour découvrir les œuvres créées avec NIARIM. La consultation ne nécessite aucune connexion, pour que chacun en profite facilement.",
    "communityPage.comingSoon": "Cette page présente une fonctionnalité en préparation pour le lancement officiel de NIARIM. Le cahier des charges est finalisé, mais le développement reste à venir. Les captures d'écran ici seront remplacées plus tard par les écrans réels.",
    "communityPage.login.title": "Aucune connexion nécessaire pour simplement consulter",
    "communityPage.login.body": "Dessiner et animer, ainsi que parcourir les œuvres de tous, les nouveautés, les classements et la liste des œuvres d'un auteur, sont accessibles sans connexion. Publier, signaler et bloquer nécessitent de se connecter avec un compte Google.",
    "communityPage.tabs.overall": "Total",
    "communityPage.tabs.yearly": "Annuel",
    "communityPage.tabs.monthly": "Mensuel",
    "communityPage.tabs.weekly": "Hebdo",
    "communityPage.tabs.daily": "Quotidien",
    "communityPage.tabs.latest": "Nouveautés",
    "communityPage.ranking.note": "Chaque classement affichera le Top 50 prévu.",
    "communityPage.update.title": "Mise à jour quotidienne, pensée comme un lieu de rendez-vous",
    "communityPage.update.body": "Les nouveautés apparaissent dès leur publication. Les classements devraient être mis à jour deux fois par jour (jusqu'à 4 fois selon le nombre d'œuvres), pour qu'il y ait toujours quelque chose de nouveau à découvrir — un lieu où l'on a envie de revenir chaque jour.",
    "communityPage.bookmark.title": "Favoris",
    "communityPage.bookmark.body": "Ajoutez vos œuvres préférées en favoris pour les retrouver plus tard (nécessite une connexion).",
    "communityPage.placeholder.label": "Emplacement d'une œuvre",
    "communityPage.cta.title": "Votre œuvre pourrait aussi être ici.",
    "communityPage.cta.body": "Créez une animation dessinée à la main avec NIARIM, et pourquoi pas la publier ici un jour pour que tout le monde la voie ?",
    "communityPage.cta.link": "Télécharger l'application"
  },
  "es": {
    "meta.community.title": "Galería de la comunidad | NIARIM",
    "meta.community.description": "Descubre las obras creadas con NIARIM a través de novedades y clasificaciones: una introducción a la función de comunidad.",
    "communityPage.eyebrow": "Community",
    "communityPage.title": "Galería de la comunidad",
    "communityPage.lead": "Una función de comunidad para descubrir obras creadas con NIARIM. Consultar no requiere iniciar sesión, así que cualquiera puede disfrutarlo con facilidad.",
    "communityPage.comingSoon": "Esta página presenta una función en preparación para el lanzamiento oficial de NIARIM. Las especificaciones están definidas, pero la implementación aún está por llegar. Las capturas aquí se sustituirán más adelante por las pantallas reales.",
    "communityPage.login.title": "No hace falta iniciar sesión solo para consultar",
    "communityPage.login.body": "Dibujar y animar, así como consultar las obras de todos, las novedades, las clasificaciones y la lista de obras de un autor, están disponibles sin iniciar sesión. Publicar, denunciar y bloquear requieren iniciar sesión con una cuenta de Google.",
    "communityPage.tabs.overall": "Total",
    "communityPage.tabs.yearly": "Anual",
    "communityPage.tabs.monthly": "Mensual",
    "communityPage.tabs.weekly": "Semanal",
    "communityPage.tabs.daily": "Diaria",
    "communityPage.tabs.latest": "Novedades",
    "communityPage.ranking.note": "Cada clasificación mostrará el Top 50 previsto.",
    "communityPage.update.title": "Actualizada a diario, pensada como lugar de encuentro",
    "communityPage.update.body": "Las novedades aparecen en cuanto se publican. Las clasificaciones se actualizarán previsiblemente dos veces al día (hasta 4 veces según crezca el número de obras), para que siempre haya algo nuevo que descubrir: un lugar al que apetece volver cada día.",
    "communityPage.bookmark.title": "Marcadores",
    "communityPage.bookmark.body": "Guarda tus obras favoritas como marcador para volver a verlas más tarde (requiere iniciar sesión).",
    "communityPage.placeholder.label": "Espacio reservado para una obra",
    "communityPage.cta.title": "Tu obra también podría estar aquí.",
    "communityPage.cta.body": "Crea una animación dibujada a mano con NIARIM y, algún día, publícala aquí para que todos la vean.",
    "communityPage.cta.link": "Descargar la app"
  }
};
  for (var lang in DATA) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = DATA[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
