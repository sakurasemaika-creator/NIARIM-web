/**
 * NIARIM公式サイト 特定商取引法に基づく表記（/tokushoho/）翻訳辞書
 *
 * 法律は日本の特定商取引法なので、日本語が元の文。ほかの6言語は項目名と
 * 説明を訳し、販売事業者の名前とメールアドレスはそのまま出す。
 * 代表者・所在地・電話番号は、請求があったときに開示する（所有者の判断、
 * 2026-11-25）。価格は /premium/ の表示（月額550円・年額5,500円、税込）と
 * 同じにすること。フランス語は「:」の前に改行しない空白（U+00A0）、
 * « » の内側にも U+00A0 を入れる。
 */
(function () {
  "use strict";
  var DICT = window.NIARIM_I18N_DICT || (window.NIARIM_I18N_DICT = {});
  var DATA = {
    ja: {
      "meta.tokushoho.title": "特定商取引法に基づく表記 | NIARIM",
      "meta.tokushoho.description":
        "NIARIM Premium（アプリ内の定期購入）の販売事業者、販売価格、支払方法、解約・返品などの表記です。",
      "tokushoho.updated": "最終更新日：2026年11月27日",
      "tokushoho.notice":
        "日本の特定商取引法に基づき、NIARIMのアプリ内で販売する定期購入（NIARIM Premium）について表示しています。",
      "tokushoho.seller.label": "販売事業者",
      "tokushoho.seller.value": "MIRANIMA（ミラニマ）",
      "tokushoho.representative.label": "代表者",
      "tokushoho.representative.value":
        "請求があった場合は、遅滞なく開示いたします。",
      "tokushoho.address.label": "所在地",
      "tokushoho.address.value":
        "請求があった場合は、遅滞なく開示いたします。",
      "tokushoho.phone.label": "電話番号",
      "tokushoho.phone.value": "請求があった場合は、遅滞なく開示いたします。",
      "tokushoho.email.label": "メールアドレス",
      "tokushoho.email.support": "（NIARIMのサポート）",
      "tokushoho.email.contact": "（MIRANIMA Studioの総合窓口）",
      "tokushoho.price.label": "販売価格",
      "tokushoho.price.value":
        "NIARIM Premium 月額プラン 550円（税込）、年額プラン 5,500円（税込）。購入の画面（Google Play）にも表示されます。",
      "tokushoho.fees.label": "商品代金以外の必要料金",
      "tokushoho.fees.value":
        "インターネットの接続に必要な通信料はお客様のご負担となります。",
      "tokushoho.payment.label": "支払方法",
      "tokushoho.payment.value": "Google Playで利用できるお支払い方法",
      "tokushoho.timing.label": "支払時期",
      "tokushoho.timing.value":
        "購入の手続きのときにお支払いが確定します。以後は契約の期間ごとに自動で更新され、更新日にGoogle Playから請求されます。",
      "tokushoho.delivery.label": "提供時期",
      "tokushoho.delivery.value":
        "購入の手続きが完了した後、すぐにご利用いただけます。",
      "tokushoho.trial.label": "無料体験",
      "tokushoho.trial.value": "アプリのダウンロードと基本機能のご利用は無料です。NIARIM Premium（有料の定期購入）に無料期間はありません。",
      "tokushoho.returns.label": "返品・キャンセル",
      "tokushoho.returns.value":
        "デジタルコンテンツの性質上、購入後の返品はお受けできません。定期購入は、Google Playの「定期購入」からいつでも解約でき、解約した後も契約期間の終わりまでご利用いただけます。返金は、Google Playの返金ポリシーに従います。",
      "tokushoho.environment.label": "動作環境",
      "tokushoho.environment.value":
        "Android 7.0以上の端末（Google Playに対応しているもの）",
    },
    en: {
      "meta.tokushoho.title":
        "Notice under the Specified Commercial Transactions Act | NIARIM",
      "meta.tokushoho.description":
        "Seller, prices, payment, cancellation and returns for NIARIM Premium, the subscription sold in the NIARIM app.",
      "tokushoho.updated": "Last updated: November 27, 2026",
      "tokushoho.notice":
        "Under Japan’s Specified Commercial Transactions Act, this page describes NIARIM Premium, the subscription sold in the NIARIM app.",
      "tokushoho.seller.label": "Seller",
      "tokushoho.seller.value": "MIRANIMA",
      "tokushoho.representative.label": "Representative",
      "tokushoho.representative.value":
        "Disclosed without delay upon request.",
      "tokushoho.address.label": "Address",
      "tokushoho.address.value": "Disclosed without delay upon request.",
      "tokushoho.phone.label": "Phone number",
      "tokushoho.phone.value": "Disclosed without delay upon request.",
      "tokushoho.email.label": "Email",
      "tokushoho.email.support": " (NIARIM support)",
      "tokushoho.email.contact": " (MIRANIMA Studio general inquiries)",
      "tokushoho.price.label": "Price",
      "tokushoho.price.value":
        "NIARIM Premium: monthly plan ¥550 (tax included), yearly plan ¥5,500 (tax included). The price is also shown on the purchase screen (Google Play).",
      "tokushoho.fees.label": "Other charges",
      "tokushoho.fees.value":
        "The customer pays the data charges for the internet connection.",
      "tokushoho.payment.label": "Payment methods",
      "tokushoho.payment.value": "The payment methods available on Google Play",
      "tokushoho.timing.label": "Payment timing",
      "tokushoho.timing.value":
        "Payment is confirmed when you complete the purchase. After that, the subscription renews automatically at the end of each period, and Google Play charges you on the renewal date.",
      "tokushoho.delivery.label": "Delivery",
      "tokushoho.delivery.value":
        "Available as soon as the purchase is complete.",
      "tokushoho.trial.label": "Free trial",
      "tokushoho.trial.value": "The app is free to download, and its basic features are free to use. NIARIM Premium (a paid subscription) has no free trial period.",
      "tokushoho.returns.label": "Returns and cancellation",
      "tokushoho.returns.value":
        "Because of the nature of digital content, purchases cannot be returned. You can cancel the subscription at any time from “Subscriptions” in Google Play, and you can keep using it until the end of the current period after you cancel. Refunds follow Google Play’s refund policy.",
      "tokushoho.environment.label": "System requirements",
      "tokushoho.environment.value":
        "A device with Android 7.0 or later that supports Google Play",
    },
    "zh-Hans": {
      "meta.tokushoho.title": "特定商业交易法相关标示 | NIARIM",
      "meta.tokushoho.description":
        "NIARIM Premium（应用内订阅）的销售者、价格、付款方式、取消与退货等信息。",
      "tokushoho.updated": "最后更新日期：2026年11月27日",
      "tokushoho.notice":
        "本页面依据日本的特定商业交易法，标示 NIARIM 应用内销售的订阅（NIARIM Premium）的相关信息。",
      "tokushoho.seller.label": "销售者",
      "tokushoho.seller.value": "MIRANIMA",
      "tokushoho.representative.label": "代表人",
      "tokushoho.representative.value": "如有请求，将及时告知。",
      "tokushoho.address.label": "地址",
      "tokushoho.address.value": "如有请求，将及时告知。",
      "tokushoho.phone.label": "电话号码",
      "tokushoho.phone.value": "如有请求，将及时告知。",
      "tokushoho.email.label": "电子邮箱",
      "tokushoho.email.support": "（NIARIM 用户支持）",
      "tokushoho.email.contact": "（MIRANIMA Studio 综合咨询）",
      "tokushoho.price.label": "销售价格",
      "tokushoho.price.value":
        "NIARIM Premium 月付方案 550 日元（含税），年付方案 5,500 日元（含税）。购买界面（Google Play）上也会显示。",
      "tokushoho.fees.label": "商品价格以外的费用",
      "tokushoho.fees.value": "连接互联网所需的通信费用由用户承担。",
      "tokushoho.payment.label": "付款方式",
      "tokushoho.payment.value": "Google Play 支持的付款方式",
      "tokushoho.timing.label": "付款时间",
      "tokushoho.timing.value":
        "完成购买手续时确定付款。此后按合同期间自动续订，并在续订日由 Google Play 收取费用。",
      "tokushoho.delivery.label": "提供时间",
      "tokushoho.delivery.value": "购买手续完成后即可使用。",
      "tokushoho.trial.label": "免费试用",
      "tokushoho.trial.value": "应用的下载和基本功能的使用均免费。NIARIM Premium（付费订阅）没有免费试用期。",
      "tokushoho.returns.label": "退回与取消",
      "tokushoho.returns.value":
        "由于数字内容的性质，购买后无法退回。订阅可随时在 Google Play 的“订阅”中取消，取消后仍可使用至合同期间结束。退款依照 Google Play 的退款政策办理。",
      "tokushoho.environment.label": "运行环境",
      "tokushoho.environment.value":
        "Android 7.0 及以上、支持 Google Play 的设备",
    },
    "zh-Hant": {
      "meta.tokushoho.title": "特定商業交易法相關標示 | NIARIM",
      "meta.tokushoho.description":
        "NIARIM Premium（應用程式內訂閱）的銷售者、價格、付款方式、取消與退貨等資訊。",
      "tokushoho.updated": "最後更新日期：2026年11月27日",
      "tokushoho.notice":
        "本頁面依據日本的特定商業交易法，標示 NIARIM 應用程式內銷售的訂閱（NIARIM Premium）的相關資訊。",
      "tokushoho.seller.label": "銷售者",
      "tokushoho.seller.value": "MIRANIMA",
      "tokushoho.representative.label": "代表人",
      "tokushoho.representative.value": "如有請求，將及時告知。",
      "tokushoho.address.label": "地址",
      "tokushoho.address.value": "如有請求，將及時告知。",
      "tokushoho.phone.label": "電話號碼",
      "tokushoho.phone.value": "如有請求，將及時告知。",
      "tokushoho.email.label": "電子郵件",
      "tokushoho.email.support": "（NIARIM 使用者支援）",
      "tokushoho.email.contact": "（MIRANIMA Studio 綜合諮詢）",
      "tokushoho.price.label": "銷售價格",
      "tokushoho.price.value":
        "NIARIM Premium 月付方案 550 日圓（含稅），年付方案 5,500 日圓（含稅）。購買畫面（Google Play）上也會顯示。",
      "tokushoho.fees.label": "商品價格以外的費用",
      "tokushoho.fees.value": "連接網際網路所需的通訊費用由使用者負擔。",
      "tokushoho.payment.label": "付款方式",
      "tokushoho.payment.value": "Google Play 支援的付款方式",
      "tokushoho.timing.label": "付款時間",
      "tokushoho.timing.value":
        "完成購買手續時確定付款。此後依合約期間自動續訂，並於續訂日由 Google Play 收取費用。",
      "tokushoho.delivery.label": "提供時間",
      "tokushoho.delivery.value": "購買手續完成後即可使用。",
      "tokushoho.trial.label": "免費試用",
      "tokushoho.trial.value": "應用程式的下載與基本功能的使用皆免費。NIARIM Premium（付費訂閱）沒有免費試用期。",
      "tokushoho.returns.label": "退回與取消",
      "tokushoho.returns.value":
        "由於數位內容的性質，購買後無法退回。訂閱可隨時於 Google Play 的「訂閱」中取消，取消後仍可使用至合約期間結束。退款依照 Google Play 的退款政策辦理。",
      "tokushoho.environment.label": "執行環境",
      "tokushoho.environment.value":
        "Android 7.0 以上、支援 Google Play 的裝置",
    },
    ko: {
      "meta.tokushoho.title": "일본 특정상거래법에 따른 표기 | NIARIM",
      "meta.tokushoho.description":
        "NIARIM Premium(앱 내 정기 결제)의 판매 사업자, 가격, 결제 방법, 해지·반품 등에 관한 표기입니다.",
      "tokushoho.updated": "최종 업데이트: 2026년 11월 27일",
      "tokushoho.notice":
        "일본 특정상거래법에 따라 NIARIM 앱에서 판매하는 정기 결제(NIARIM Premium)에 관한 정보를 표기합니다.",
      "tokushoho.seller.label": "판매 사업자",
      "tokushoho.seller.value": "MIRANIMA",
      "tokushoho.representative.label": "대표자",
      "tokushoho.representative.value": "요청이 있으면 지체 없이 공개합니다.",
      "tokushoho.address.label": "소재지",
      "tokushoho.address.value": "요청이 있으면 지체 없이 공개합니다.",
      "tokushoho.phone.label": "전화번호",
      "tokushoho.phone.value": "요청이 있으면 지체 없이 공개합니다.",
      "tokushoho.email.label": "이메일 주소",
      "tokushoho.email.support": " (NIARIM 고객 지원)",
      "tokushoho.email.contact": " (MIRANIMA Studio 종합 문의)",
      "tokushoho.price.label": "판매 가격",
      "tokushoho.price.value":
        "NIARIM Premium 월간 플랜 550엔(세금 포함), 연간 플랜 5,500엔(세금 포함). 구매 화면(Google Play)에도 표시됩니다.",
      "tokushoho.fees.label": "상품 대금 이외의 필요 요금",
      "tokushoho.fees.value":
        "네트워크 접속에 필요한 통신 요금은 고객이 부담합니다.",
      "tokushoho.payment.label": "결제 방법",
      "tokushoho.payment.value": "Google Play에서 이용할 수 있는 결제 수단",
      "tokushoho.timing.label": "결제 시기",
      "tokushoho.timing.value":
        "구매 절차를 마칠 때 결제가 확정됩니다. 이후에는 계약 기간마다 자동으로 갱신되며, 갱신일에 Google Play에서 청구됩니다.",
      "tokushoho.delivery.label": "제공 시기",
      "tokushoho.delivery.value":
        "구매 절차가 완료된 후 바로 이용하실 수 있습니다.",
      "tokushoho.trial.label": "무료 체험",
      "tokushoho.trial.value": "앱 다운로드와 기본 기능 이용은 무료입니다. NIARIM Premium(유료 정기 결제)에는 무료 체험 기간이 없습니다.",
      "tokushoho.returns.label": "반품·취소",
      "tokushoho.returns.value":
        "디지털 콘텐츠의 특성상 구매 후 반품은 받지 않습니다. 정기 결제는 Google Play의 “정기 결제”에서 언제든지 해지할 수 있으며, 해지한 후에도 계약 기간이 끝날 때까지 이용하실 수 있습니다. 환불은 Google Play의 환불 정책을 따릅니다.",
      "tokushoho.environment.label": "동작 환경",
      "tokushoho.environment.value":
        "Android 7.0 이상, Google Play를 지원하는 기기",
    },
    fr: {
      "meta.tokushoho.title":
        "Mentions selon la loi sur les transactions commerciales spécifiées | NIARIM",
      "meta.tokushoho.description":
        "Vendeur, prix, paiement, résiliation et retours de NIARIM Premium, l’abonnement vendu dans l’application NIARIM.",
      "tokushoho.updated": "Dernière mise à jour : 27 novembre 2026",
      "tokushoho.notice":
        "Conformément à la loi japonaise sur les transactions commerciales spécifiées, cette page présente NIARIM Premium, l’abonnement vendu dans l’application NIARIM.",
      "tokushoho.seller.label": "Vendeur",
      "tokushoho.seller.value": "MIRANIMA",
      "tokushoho.representative.label": "Représentant",
      "tokushoho.representative.value":
        "Information communiquée sans délai sur demande.",
      "tokushoho.address.label": "Adresse",
      "tokushoho.address.value":
        "Information communiquée sans délai sur demande.",
      "tokushoho.phone.label": "Téléphone",
      "tokushoho.phone.value":
        "Information communiquée sans délai sur demande.",
      "tokushoho.email.label": "Adresse e-mail",
      "tokushoho.email.support": " (assistance NIARIM)",
      "tokushoho.email.contact": " (contact général de MIRANIMA Studio)",
      "tokushoho.price.label": "Prix",
      "tokushoho.price.value":
        "NIARIM Premium : formule mensuelle 550 ¥ (TTC), formule annuelle 5 500 ¥ (TTC). Le prix est également indiqué sur l’écran d’achat (Google Play).",
      "tokushoho.fees.label": "Frais supplémentaires",
      "tokushoho.fees.value":
        "Les frais de connexion à Internet sont à la charge du client.",
      "tokushoho.payment.label": "Moyens de paiement",
      "tokushoho.payment.value": "Les moyens de paiement disponibles sur Google Play",
      "tokushoho.timing.label": "Date du paiement",
      "tokushoho.timing.value":
        "Le paiement est confirmé au moment de l’achat. L’abonnement est ensuite renouvelé automatiquement à chaque période, et Google Play vous facture à la date de renouvellement.",
      "tokushoho.delivery.label": "Mise à disposition",
      "tokushoho.delivery.value":
        "Disponible dès que l’achat est finalisé.",
      "tokushoho.trial.label": "Essai gratuit",
      "tokushoho.trial.value": "Le téléchargement de l’application et l’utilisation de ses fonctions de base sont gratuits. NIARIM Premium (abonnement payant) n’a pas de période d’essai gratuit.",
      "tokushoho.returns.label": "Retours et annulation",
      "tokushoho.returns.value":
        "En raison de la nature des contenus numériques, les achats ne peuvent pas être retournés. Vous pouvez résilier l’abonnement à tout moment depuis « Abonnements » dans Google Play, et continuer à l’utiliser jusqu’à la fin de la période en cours après la résiliation. Les remboursements suivent la politique de remboursement de Google Play.",
      "tokushoho.environment.label": "Configuration requise",
      "tokushoho.environment.value":
        "Un appareil sous Android 7.0 ou version ultérieure compatible avec Google Play",
    },
    es: {
      "meta.tokushoho.title":
        "Aviso según la Ley de Transacciones Comerciales Específicas | NIARIM",
      "meta.tokushoho.description":
        "Vendedor, precios, pago, cancelación y devoluciones de NIARIM Premium, la suscripción que se vende en la app NIARIM.",
      "tokushoho.updated": "Última actualización: 27 de noviembre de 2026",
      "tokushoho.notice":
        "Conforme a la Ley de Transacciones Comerciales Específicas de Japón, esta página describe NIARIM Premium, la suscripción que se vende en la app NIARIM.",
      "tokushoho.seller.label": "Vendedor",
      "tokushoho.seller.value": "MIRANIMA",
      "tokushoho.representative.label": "Representante",
      "tokushoho.representative.value":
        "Se comunicará sin demora si se solicita.",
      "tokushoho.address.label": "Dirección",
      "tokushoho.address.value": "Se comunicará sin demora si se solicita.",
      "tokushoho.phone.label": "Teléfono",
      "tokushoho.phone.value": "Se comunicará sin demora si se solicita.",
      "tokushoho.email.label": "Correo electrónico",
      "tokushoho.email.support": " (soporte de NIARIM)",
      "tokushoho.email.contact": " (contacto general de MIRANIMA Studio)",
      "tokushoho.price.label": "Precio",
      "tokushoho.price.value":
        "NIARIM Premium: plan mensual 550 ¥ (impuestos incluidos), plan anual 5500 ¥ (impuestos incluidos). El precio también se muestra en la pantalla de compra (Google Play).",
      "tokushoho.fees.label": "Otros gastos",
      "tokushoho.fees.value":
        "Los gastos de conexión a internet corren por cuenta del cliente.",
      "tokushoho.payment.label": "Formas de pago",
      "tokushoho.payment.value": "Las formas de pago disponibles en Google Play",
      "tokushoho.timing.label": "Momento del pago",
      "tokushoho.timing.value":
        "El pago se confirma al completar la compra. Después, la suscripción se renueva automáticamente en cada período y Google Play realiza el cobro en la fecha de renovación.",
      "tokushoho.delivery.label": "Plazo de entrega",
      "tokushoho.delivery.value":
        "Disponible en cuanto se completa la compra.",
      "tokushoho.trial.label": "Prueba gratuita",
      "tokushoho.trial.value": "La descarga de la app y el uso de sus funciones básicas son gratuitos. NIARIM Premium (suscripción de pago) no tiene periodo de prueba gratuita.",
      "tokushoho.returns.label": "Devoluciones y cancelación",
      "tokushoho.returns.value":
        "Por la naturaleza del contenido digital, no se aceptan devoluciones después de la compra. Puedes cancelar la suscripción en cualquier momento desde «Suscripciones» en Google Play y seguir usándola hasta el final del período en curso después de cancelarla. Los reembolsos se rigen por la política de reembolsos de Google Play.",
      "tokushoho.environment.label": "Requisitos del sistema",
      "tokushoho.environment.value":
        "Un dispositivo con Android 7.0 o posterior compatible con Google Play",
    },
  };
  Object.keys(DATA).forEach(function (lang) {
    DICT[lang] = Object.assign(DICT[lang] || {}, DATA[lang]);
  });
})();
