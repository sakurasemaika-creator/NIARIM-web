/**
 * NIARIM公式サイト プレミアムプランページ 翻訳辞書
 *
 * 価格・機能はNIARIMアプリ(dev_branch)の docs/AI設計書/01_プロジェクト概要.md
 * に記載の設計仕様(月額550円/年額5500円、無料版=全基本機能+広告あり、
 * プレミアム=広告非表示・エンドロゴ編集・ウォーターマーク・トーンカーブ・
 * レベル補正)に基づく。価格は変更の可能性があるため、その旨をページ内に明記している。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    ja: {
      "meta.premium.title": "プレミアムプラン | NIARIM",
      "meta.premium.description":
        "NIARIMのプレミアムプランでできることと、無料版との違いをご紹介します。",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "プレミアムプラン",
      "premiumPage.lead":
        "無料版でも動画書き出しを含む基本的な制作機能はすべてご利用いただけます。プレミアムプランでは、広告の非表示や仕上げのための追加機能をご利用いただけます。",
      "premiumPage.priceNote":
        "表示されている金額は現時点の想定価格です。正式リリース時に変更となる場合があり、その際は本ページも更新します。最新の価格はGoogle Playのアプリページをご確認ください。",
      "premiumPage.free.title": "無料版",
      "premiumPage.free.price": "0円",
      "premiumPage.free.item1":
        "全ての基本的な制作機能（描画・アニメーション・編集・音声）",
      "premiumPage.free.item2": "動画書き出し（最大1920×1920）",
      "premiumPage.free.item3": "広告表示あり",
      "premiumPage.free.item4":
        "書き出し時にNIARIM公式エンドロゴを自動追加（編集・削除不可）",
      "premiumPage.free.item5": "1作品あたり90秒までの書き出し",
      "premiumPage.premium.title": "プレミアムプラン",
      "premiumPage.premium.monthly.label": "月額プラン",
      "premiumPage.premium.monthly.price": "550円",
      "premiumPage.premium.monthly.unit": "／月（税込）",
      "premiumPage.premium.yearly.label": "年額プラン",
      "premiumPage.premium.yearly.price": "5,500円",
      "premiumPage.premium.yearly.unit": "／年（税込）",
      "premiumPage.premium.yearly.badge.pre": "実質",
      "premiumPage.premium.yearly.badge.main": "2か月分無料",
      "premiumPage.premium.yearly.fullPrice": "6,600円",
      "premiumPage.premium.item1.title": "広告非表示",
      "premiumPage.premium.item1.body":
        "アプリ内の広告表示がすべてなくなります。",
      "premiumPage.premium.item2.title": "エンドロゴの削除・編集",
      "premiumPage.premium.item2.body":
        "書き出し時に自動追加されるNIARIM公式エンドロゴを、削除・非表示にしたり、タイムライン上で長さの変更・差し替えができます。",
      "premiumPage.premium.item3.title": "ユーザーウォーターマーク",
      "premiumPage.premium.item3.body":
        "画像または文字によるオリジナルのウォーターマークを、作品に追加できます。",
      "premiumPage.premium.item4.title": "トーンカーブ",
      "premiumPage.premium.item4.body":
        "明暗のバランスを曲線で細かく調整できる、仕上げ向けの色調補正機能です。",
      "premiumPage.premium.item5.title": "レベル補正",
      "premiumPage.premium.item5.body":
        "黒レベル・白レベル・中間調を調整し、作品の色味を仕上げられます。",
      "premiumPage.premium.item6.title": "書き出し時間の延長",
      "premiumPage.premium.item6.body":
        "1作品あたり最大2時間まで、長尺の作品を制作・書き出しできます。",
      "premiumPage.premium.item7.title": "コミュニティへの投稿数アップ",
      "premiumPage.premium.item7.body":
        "「作品広場」への投稿数が、無料版の1日1作品から1日3作品に増えます。",
      "premiumPage.faq.title": "プレミアムプランについてのご注意",
      "premiumPage.faq.item1":
        "無料版でご利用中の基本制作機能が、プレミアム加入によって制限されることはありません。",
      "premiumPage.faq.item2":
        "購入後のキャンセル・返金については、Google Playの規定が適用されます。",
      "premiumPage.faq.item3":
        "作成した作品（イラスト・アニメーション等）の著作権は、無料版・プレミアム版のいずれでご利用の場合も、権利を有するユーザーに帰属します。",
      "premiumPage.cta.title": "NIARIMを始めよう",
      "premiumPage.cta.body":
        "まずは無料版から、あなたの手でアニメーションを描き始めてみませんか。",
      "premiumPage.cta.link": "アプリをダウンロード",
    },
    en: {
      "meta.premium.title": "Premium Plan | NIARIM",
      "meta.premium.description":
        "See what NIARIM's Premium plan offers and how it differs from the free version.",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "Premium Plan",
      "premiumPage.lead":
        "Even the free version includes every core creation feature, including video export. The Premium plan removes ads and adds extra tools for finishing your work.",
      "premiumPage.priceNote":
        "The prices shown are current planned prices and may change at official launch; this page will be updated if they do. Please check the Google Play listing for the latest pricing.",
      "premiumPage.free.title": "Free",
      "premiumPage.free.price": "¥0",
      "premiumPage.free.item1":
        "Every core creation feature (drawing, animation, editing, audio)",
      "premiumPage.free.item2": "Video export (up to 1920×1920)",
      "premiumPage.free.item3": "Ads are shown",
      "premiumPage.free.item4":
        "The official NIARIM end card is automatically added on export (cannot be edited or removed)",
      "premiumPage.free.item5": "Export limited to 90 seconds per work",
      "premiumPage.premium.title": "Premium",
      "premiumPage.premium.monthly.label": "Monthly plan",
      "premiumPage.premium.monthly.price": "¥550",
      "premiumPage.premium.monthly.unit": "/month (tax included)",
      "premiumPage.premium.yearly.label": "Yearly plan",
      "premiumPage.premium.yearly.price": "¥5,500",
      "premiumPage.premium.yearly.unit": "/year (tax included)",
      "premiumPage.premium.yearly.badge.pre": "Effectively",
      "premiumPage.premium.yearly.badge.main": "2 months free",
      "premiumPage.premium.yearly.fullPrice": "\u00a56,600",
      "premiumPage.premium.item1.title": "No ads",
      "premiumPage.premium.item1.body": "Removes all in-app advertising.",
      "premiumPage.premium.item2.title": "Remove or edit the end card",
      "premiumPage.premium.item2.body":
        "Remove or hide the official NIARIM end card that's added on export, or change its length and replace it on the timeline.",
      "premiumPage.premium.item3.title": "Custom watermark",
      "premiumPage.premium.item3.body":
        "Add your own image or text watermark to your work.",
      "premiumPage.premium.item4.title": "Tone curve",
      "premiumPage.premium.item4.body":
        "A finishing-oriented color correction tool that lets you fine-tune the light/dark balance with a curve.",
      "premiumPage.premium.item5.title": "Levels adjustment",
      "premiumPage.premium.item5.body":
        "Adjust black, white, and midtone levels to finish the coloring of your work.",
      "premiumPage.premium.item6.title": "Longer export time",
      "premiumPage.premium.item6.body":
        "Create and export longer works, up to 2 hours per piece.",
      "premiumPage.premium.item7.title": "More community posts",
      "premiumPage.premium.item7.body":
        "Post up to 3 works a day to the Gallery, up from 1 a day on the free plan.",
      "premiumPage.faq.title": "About the Premium plan",
      "premiumPage.faq.item1":
        "Core creation features available in the free version are never restricted by subscribing to Premium.",
      "premiumPage.faq.item2":
        "Cancellations and refunds after purchase are governed by Google Play's policies.",
      "premiumPage.faq.item3":
        "Copyright for work you create (illustrations, animation, etc.) belongs to the rights-holding user, whether made with the free or Premium version.",
      "premiumPage.cta.title": "Start with NIARIM",
      "premiumPage.cta.body":
        "Why not start animating with your own hands, right from the free version?",
      "premiumPage.cta.link": "Download the App",
    },
    "zh-Hans": {
      "meta.premium.title": "高级会员方案 | NIARIM",
      "meta.premium.description":
        "介绍 NIARIM 高级会员方案能做什么，以及与免费版的区别。",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "高级会员方案",
      "premiumPage.lead":
        "即使是免费版，也能使用包括视频导出在内的全部基础创作功能。高级会员方案可移除广告，并提供用于最终润色的附加功能。",
      "premiumPage.priceNote":
        "所示金额为目前的预计价格，正式上线时可能会有变动，如有变更本页面也会随之更新。最新价格请以 Google Play 应用页面为准。",
      "premiumPage.free.title": "免费版",
      "premiumPage.free.price": "0 日元",
      "premiumPage.free.item1": "全部基础创作功能（绘画・动画・编辑・音频）",
      "premiumPage.free.item2": "视频导出（最高1920×1920）",
      "premiumPage.free.item3": "会显示广告",
      "premiumPage.free.item4":
        "导出时自动添加 NIARIM 官方片尾标志（无法编辑或删除）",
      "premiumPage.free.item5": "单个作品导出时长最多90秒",
      "premiumPage.premium.title": "高级会员",
      "premiumPage.premium.monthly.label": "月付方案",
      "premiumPage.premium.monthly.price": "550 日元",
      "premiumPage.premium.monthly.unit": "／月（含税）",
      "premiumPage.premium.yearly.label": "年付方案",
      "premiumPage.premium.yearly.price": "5,500 日元",
      "premiumPage.premium.yearly.unit": "／年（含税）",
      "premiumPage.premium.yearly.badge.pre": "实质",
      "premiumPage.premium.yearly.badge.main": "2个月免费",
      "premiumPage.premium.yearly.fullPrice": "6,600 日元",
      "premiumPage.premium.item1.title": "移除广告",
      "premiumPage.premium.item1.body": "移除应用内所有广告显示。",
      "premiumPage.premium.item2.title": "删除・编辑片尾标志",
      "premiumPage.premium.item2.body":
        "可删除或隐藏导出时自动添加的 NIARIM 官方片尾标志，也可在时间轴上更改其长度或替换。",
      "premiumPage.premium.item3.title": "自定义水印",
      "premiumPage.premium.item3.body": "可为作品添加自己的图片或文字水印。",
      "premiumPage.premium.item4.title": "色调曲线",
      "premiumPage.premium.item4.body":
        "面向后期润色的色彩校正功能，可通过曲线细致调整明暗平衡。",
      "premiumPage.premium.item5.title": "色阶调整",
      "premiumPage.premium.item5.body":
        "调整黑场、白场与中间调，为作品的色彩做最后润色。",
      "premiumPage.premium.item6.title": "延长导出时长",
      "premiumPage.premium.item6.body": "单个作品最长可制作并导出2小时的内容。",
      "premiumPage.premium.item7.title": "增加社区投稿数量",
      "premiumPage.premium.item7.body":
        "「作品广场」的投稿数量从免费版的每天1个提升为每天3个。",
      "premiumPage.faq.title": "关于高级会员方案的说明",
      "premiumPage.faq.item1":
        "免费版中可使用的基础创作功能，不会因订阅高级会员而受到限制。",
      "premiumPage.faq.item2":
        "购买后的取消・退款，适用 Google Play 的相关规定。",
      "premiumPage.faq.item3":
        "无论使用免费版或高级会员版制作，作品（插画、动画等）的著作权均归拥有该权利的用户所有。",
      "premiumPage.cta.title": "开始使用 NIARIM",
      "premiumPage.cta.body": "不妨先从免费版开始，用你自己的双手绘制动画吧。",
      "premiumPage.cta.link": "下载应用",
    },
    "zh-Hant": {
      "meta.premium.title": "高級會員方案 | NIARIM",
      "meta.premium.description":
        "介紹 NIARIM 高級會員方案能做什麼，以及與免費版的差異。",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "高級會員方案",
      "premiumPage.lead":
        "即使是免費版，也能使用包括影片匯出在內的全部基礎創作功能。高級會員方案可移除廣告，並提供用於最終潤飾的附加功能。",
      "premiumPage.priceNote":
        "所示金額為目前的預計價格，正式上線時可能會有變動，如有變更本頁面也會隨之更新。最新價格請以 Google Play 應用程式頁面為準。",
      "premiumPage.free.title": "免費版",
      "premiumPage.free.price": "0 日圓",
      "premiumPage.free.item1": "全部基礎創作功能（繪圖・動畫・編輯・音訊）",
      "premiumPage.free.item2": "影片匯出（最高1920×1920）",
      "premiumPage.free.item3": "會顯示廣告",
      "premiumPage.free.item4":
        "匯出時自動新增 NIARIM 官方片尾標誌（無法編輯或刪除）",
      "premiumPage.free.item5": "單一作品匯出時長最多90秒",
      "premiumPage.premium.title": "高級會員",
      "premiumPage.premium.monthly.label": "月付方案",
      "premiumPage.premium.monthly.price": "550 日圓",
      "premiumPage.premium.monthly.unit": "／月（含稅）",
      "premiumPage.premium.yearly.label": "年付方案",
      "premiumPage.premium.yearly.price": "5,500 日圓",
      "premiumPage.premium.yearly.unit": "／年（含稅）",
      "premiumPage.premium.yearly.badge.pre": "實質",
      "premiumPage.premium.yearly.badge.main": "2個月免費",
      "premiumPage.premium.yearly.fullPrice": "6,600 日圓",
      "premiumPage.premium.item1.title": "移除廣告",
      "premiumPage.premium.item1.body": "移除應用程式內所有廣告顯示。",
      "premiumPage.premium.item2.title": "刪除・編輯片尾標誌",
      "premiumPage.premium.item2.body":
        "可刪除或隱藏匯出時自動新增的 NIARIM 官方片尾標誌，也可在時間軸上更改其長度或替換。",
      "premiumPage.premium.item3.title": "自訂浮水印",
      "premiumPage.premium.item3.body": "可為作品新增自己的圖片或文字浮水印。",
      "premiumPage.premium.item4.title": "色調曲線",
      "premiumPage.premium.item4.body":
        "面向後製潤飾的色彩校正功能，可透過曲線細緻調整明暗平衡。",
      "premiumPage.premium.item5.title": "色階調整",
      "premiumPage.premium.item5.body":
        "調整黑場、白場與中間調，為作品的色彩做最後潤飾。",
      "premiumPage.premium.item6.title": "延長匯出時長",
      "premiumPage.premium.item6.body": "單一作品最長可製作並匯出2小時的內容。",
      "premiumPage.premium.item7.title": "增加社群投稿數量",
      "premiumPage.premium.item7.body":
        "「作品廣場」的投稿數量從免費版的每天1個提升為每天3個。",
      "premiumPage.faq.title": "關於高級會員方案的說明",
      "premiumPage.faq.item1":
        "免費版中可使用的基礎創作功能，不會因訂閱高級會員而受到限制。",
      "premiumPage.faq.item2":
        "購買後的取消・退款，適用 Google Play 的相關規定。",
      "premiumPage.faq.item3":
        "無論使用免費版或高級會員版製作，作品（插畫、動畫等）的著作權均歸擁有該權利的使用者所有。",
      "premiumPage.cta.title": "開始使用 NIARIM",
      "premiumPage.cta.body": "不妨先從免費版開始，用你自己的雙手繪製動畫吧。",
      "premiumPage.cta.link": "下載應用程式",
    },
    ko: {
      "meta.premium.title": "프리미엄 플랜 | NIARIM",
      "meta.premium.description":
        "NIARIM 프리미엄 플랜으로 할 수 있는 것과 무료 버전과의 차이를 소개합니다.",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "프리미엄 플랜",
      "premiumPage.lead":
        "무료 버전에서도 영상 내보내기를 포함한 모든 기본 제작 기능을 이용할 수 있습니다. 프리미엄 플랜에서는 광고가 사라지고, 마무리 작업을 위한 추가 기능을 이용할 수 있습니다.",
      "premiumPage.priceNote":
        "표시된 금액은 현재 예상 가격입니다. 정식 출시 시 변경될 수 있으며, 그 경우 이 페이지도 업데이트합니다. 최신 가격은 Google Play 앱 페이지를 확인해 주세요.",
      "premiumPage.free.title": "무료 버전",
      "premiumPage.free.price": "0원",
      "premiumPage.free.item1":
        "모든 기본 제작 기능（그리기・애니메이션・편집・오디오）",
      "premiumPage.free.item2": "영상 내보내기（최대 1920×1920）",
      "premiumPage.free.item3": "광고가 표시됩니다",
      "premiumPage.free.item4":
        "내보내기 시 NIARIM 공식 엔드 카드가 자동으로 추가됩니다（편집・삭제 불가）",
      "premiumPage.free.item5": "작품당 최대 90초까지 내보내기 가능",
      "premiumPage.premium.title": "프리미엄",
      "premiumPage.premium.monthly.label": "월간 플랜",
      "premiumPage.premium.monthly.price": "550엔",
      "premiumPage.premium.monthly.unit": "／월（세금 포함）",
      "premiumPage.premium.yearly.label": "연간 플랜",
      "premiumPage.premium.yearly.price": "5,500엔",
      "premiumPage.premium.yearly.unit": "／년（세금 포함）",
      "premiumPage.premium.yearly.badge.pre": "실질",
      "premiumPage.premium.yearly.badge.main": "2개월 무료",
      "premiumPage.premium.yearly.fullPrice": "6,600엔",
      "premiumPage.premium.item1.title": "광고 비표시",
      "premiumPage.premium.item1.body": "앱 내 모든 광고 표시가 사라집니다.",
      "premiumPage.premium.item2.title": "엔드 카드 삭제・편집",
      "premiumPage.premium.item2.body":
        "내보내기 시 자동으로 추가되는 NIARIM 공식 엔드 카드를 삭제・비표시로 하거나, 타임라인에서 길이 변경・교체를 할 수 있습니다.",
      "premiumPage.premium.item3.title": "사용자 워터마크",
      "premiumPage.premium.item3.body":
        "이미지 또는 텍스트로 된 나만의 워터마크를 작품에 추가할 수 있습니다.",
      "premiumPage.premium.item4.title": "톤 커브",
      "premiumPage.premium.item4.body":
        "곡선으로 명암 균형을 세밀하게 조정할 수 있는, 마무리용 색조 보정 기능입니다.",
      "premiumPage.premium.item5.title": "레벨 보정",
      "premiumPage.premium.item5.body":
        "블랙 레벨・화이트 레벨・중간톤을 조정해 작품의 색감을 마무리할 수 있습니다.",
      "premiumPage.premium.item6.title": "내보내기 시간 연장",
      "premiumPage.premium.item6.body":
        "작품당 최대 2시간까지 제작・내보내기할 수 있습니다.",
      "premiumPage.premium.item7.title": "커뮤니티 게시 수 증가",
      "premiumPage.premium.item7.body":
        "'작품광장'에 게시할 수 있는 작품 수가 무료 버전의 하루 1개에서 하루 3개로 늘어납니다.",
      "premiumPage.faq.title": "프리미엄 플랜에 대한 안내",
      "premiumPage.faq.item1":
        "무료 버전에서 이용 중인 기본 제작 기능이 프리미엄 가입으로 인해 제한되는 일은 없습니다.",
      "premiumPage.faq.item2":
        "구매 후 취소・환불에 대해서는 Google Play의 규정이 적용됩니다.",
      "premiumPage.faq.item3":
        "제작한 작품（일러스트・애니메이션 등）의 저작권은 무료 버전・프리미엄 버전 어느 쪽을 이용하더라도 권리를 가진 사용자에게 귀속됩니다.",
      "premiumPage.cta.title": "NIARIM을 시작해 보세요",
      "premiumPage.cta.body":
        "먼저 무료 버전부터, 당신의 손으로 애니메이션을 그려보지 않으시겠어요?",
      "premiumPage.cta.link": "앱 다운로드",
    },
    fr: {
      "meta.premium.title": "Offre Premium | NIARIM",
      "meta.premium.description":
        "Découvrez ce que propose l'offre Premium de NIARIM et ses différences avec la version gratuite.",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "Offre Premium",
      "premiumPage.lead":
        "Même la version gratuite inclut toutes les fonctionnalités de création essentielles, y compris l'export vidéo. L'offre Premium supprime les publicités et ajoute des outils supplémentaires pour la finition.",
      "premiumPage.priceNote":
        "Les prix indiqués sont des prix prévisionnels actuels et pourront changer au lancement officiel ; cette page sera alors mise à jour. Consultez la fiche Google Play pour les tarifs les plus récents.",
      "premiumPage.free.title": "Gratuit",
      "premiumPage.free.price": "0 ¥",
      "premiumPage.free.item1":
        "Toutes les fonctionnalités de création essentielles (dessin, animation, édition, audio)",
      "premiumPage.free.item2": "Export vidéo (jusqu'à 1920×1920)",
      "premiumPage.free.item3": "Publicités affichées",
      "premiumPage.free.item4":
        "Le générique de fin officiel de NIARIM est ajouté automatiquement à l'export (non modifiable ni supprimable)",
      "premiumPage.free.item5": "Export limité à 90 secondes par œuvre",
      "premiumPage.premium.title": "Premium",
      "premiumPage.premium.monthly.label": "Forfait mensuel",
      "premiumPage.premium.monthly.price": "550 ¥",
      "premiumPage.premium.monthly.unit": "/mois (TTC)",
      "premiumPage.premium.yearly.label": "Forfait annuel",
      "premiumPage.premium.yearly.price": "5 500 ¥",
      "premiumPage.premium.yearly.unit": "/an (TTC)",
      "premiumPage.premium.yearly.badge.pre": "Soit",
      "premiumPage.premium.yearly.badge.main": "2 mois offerts",
      "premiumPage.premium.yearly.fullPrice": "6 600 \u00a5",
      "premiumPage.premium.item1.title": "Sans publicité",
      "premiumPage.premium.item1.body":
        "Supprime toutes les publicités dans l'application.",
      "premiumPage.premium.item2.title":
        "Suppression / édition du générique de fin",
      "premiumPage.premium.item2.body":
        "Supprimez ou masquez le générique de fin officiel de NIARIM ajouté à l'export, ou modifiez sa durée et remplacez-le sur la timeline.",
      "premiumPage.premium.item3.title": "Filigrane personnalisé",
      "premiumPage.premium.item3.body":
        "Ajoutez votre propre filigrane (image ou texte) à votre œuvre.",
      "premiumPage.premium.item4.title": "Courbe de tons",
      "premiumPage.premium.item4.body":
        "Un outil de correction des couleurs pour la finition, permettant d'ajuster finement l'équilibre des tons clairs/foncés via une courbe.",
      "premiumPage.premium.item5.title": "Réglage des niveaux",
      "premiumPage.premium.item5.body":
        "Ajustez les niveaux de noir, de blanc et les tons moyens pour finaliser les couleurs de votre œuvre.",
      "premiumPage.premium.item6.title": "Export plus long",
      "premiumPage.premium.item6.body":
        "Créez et exportez des œuvres plus longues, jusqu'à 2 heures chacune.",
      "premiumPage.premium.item7.title": "Plus de publications communautaires",
      "premiumPage.premium.item7.body":
        "Publiez jusqu'à 3 œuvres par jour dans la Galerie, contre 1 par jour avec le plan gratuit.",
      "premiumPage.faq.title": "À propos de l'offre Premium",
      "premiumPage.faq.item1":
        "Les fonctionnalités de création de base disponibles dans la version gratuite ne sont jamais restreintes par l'abonnement Premium.",
      "premiumPage.faq.item2":
        "Les annulations et remboursements après achat sont régis par les règles de Google Play.",
      "premiumPage.faq.item3":
        "Les droits d'auteur des œuvres créées (illustrations, animations, etc.) appartiennent à l'utilisateur titulaire des droits, que ce soit avec la version gratuite ou Premium.",
      "premiumPage.cta.title": "Commencez avec NIARIM",
      "premiumPage.cta.body":
        "Pourquoi ne pas commencer à animer de vos propres mains, dès la version gratuite ?",
      "premiumPage.cta.link": "Télécharger l'application",
    },
    es: {
      "meta.premium.title": "Plan Premium | NIARIM",
      "meta.premium.description":
        "Descubre lo que ofrece el plan Premium de NIARIM y en qué se diferencia de la versión gratuita.",
      "premiumPage.eyebrow": "Premium",
      "premiumPage.title": "Plan Premium",
      "premiumPage.lead":
        "Incluso la versión gratuita incluye todas las funciones de creación básicas, incluida la exportación de video. El plan Premium elimina los anuncios y añade herramientas adicionales para el acabado.",
      "premiumPage.priceNote":
        "Los precios mostrados son precios previstos actuales y podrían cambiar en el lanzamiento oficial; esta página se actualizará si es así. Consulta la ficha de Google Play para conocer los precios más recientes.",
      "premiumPage.free.title": "Gratis",
      "premiumPage.free.price": "0 ¥",
      "premiumPage.free.item1":
        "Todas las funciones de creación básicas (dibujo, animación, edición, audio)",
      "premiumPage.free.item2": "Exportación de video (hasta 1920×1920)",
      "premiumPage.free.item3": "Se muestran anuncios",
      "premiumPage.free.item4":
        "La placa de cierre oficial de NIARIM se añade automáticamente al exportar (no se puede editar ni eliminar)",
      "premiumPage.free.item5": "Exportación limitada a 90 segundos por obra",
      "premiumPage.premium.title": "Premium",
      "premiumPage.premium.monthly.label": "Plan mensual",
      "premiumPage.premium.monthly.price": "550 ¥",
      "premiumPage.premium.monthly.unit": "/mes (impuestos incluidos)",
      "premiumPage.premium.yearly.label": "Plan anual",
      "premiumPage.premium.yearly.price": "5500 ¥",
      "premiumPage.premium.yearly.unit": "/año (impuestos incluidos)",
      "premiumPage.premium.yearly.badge.pre": "Equivale a",
      "premiumPage.premium.yearly.badge.main": "2 meses gratis",
      "premiumPage.premium.yearly.fullPrice": "6600 \u00a5",
      "premiumPage.premium.item1.title": "Sin anuncios",
      "premiumPage.premium.item1.body":
        "Elimina toda la publicidad dentro de la app.",
      "premiumPage.premium.item2.title": "Eliminar o editar la placa de cierre",
      "premiumPage.premium.item2.body":
        "Elimina u oculta la placa de cierre oficial de NIARIM que se añade al exportar, o cambia su duración y reemplázala en la línea de tiempo.",
      "premiumPage.premium.item3.title": "Marca de agua personalizada",
      "premiumPage.premium.item3.body":
        "Añade tu propia marca de agua de imagen o texto a tu obra.",
      "premiumPage.premium.item4.title": "Curva de tonos",
      "premiumPage.premium.item4.body":
        "Una herramienta de corrección de color orientada al acabado que permite ajustar con precisión el equilibrio de luces y sombras mediante una curva.",
      "premiumPage.premium.item5.title": "Ajuste de niveles",
      "premiumPage.premium.item5.body":
        "Ajusta los niveles de negro, blanco y medios tonos para dar el acabado final al color de tu obra.",
      "premiumPage.premium.item6.title": "Exportación más larga",
      "premiumPage.premium.item6.body":
        "Crea y exporta obras más largas, de hasta 2 horas cada una.",
      "premiumPage.premium.item7.title": "Más publicaciones en la comunidad",
      "premiumPage.premium.item7.body":
        "Publica hasta 3 obras al día en la Galería, frente a 1 al día en el plan gratuito.",
      "premiumPage.faq.title": "Sobre el plan Premium",
      "premiumPage.faq.item1":
        "Las funciones de creación básicas disponibles en la versión gratuita nunca se ven restringidas por suscribirte a Premium.",
      "premiumPage.faq.item2":
        "Las cancelaciones y reembolsos posteriores a la compra se rigen por las políticas de Google Play.",
      "premiumPage.faq.item3":
        "Los derechos de autor de las obras que crees (ilustraciones, animaciones, etc.) pertenecen al usuario titular de los derechos, tanto si usas la versión gratuita como la Premium.",
      "premiumPage.cta.title": "Empieza con NIARIM",
      "premiumPage.cta.body":
        "¿Por qué no empezar a animar con tus propias manos, ya desde la versión gratuita?",
      "premiumPage.cta.link": "Descargar la app",
    },
  };
  for (var lang in DATA) {
    if (!DICT[lang]) DICT[lang] = {};
    var entries = DATA[lang];
    for (var key in entries) {
      DICT[lang][key] = entries[key];
    }
  }
})();
