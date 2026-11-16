/* UI-only naming: existing API fields, wallet, /coins URL remain stable. */
(function(){
"use strict";
var d=window.NIARIM_I18N_DICT||(window.NIARIM_I18N_DICT={});
var rules={
 "ja":[[/特典コンプリートパック/g,"コンプリートパック"],[/コイン/g,"オパール"]],
 "en":[[/\bcoins\b/gi,"Opals"],[/\bcoin\b/gi,"Opal"]],
 "zh-Hans":[[/金币/g,"欧泊"]],"zh-Hant":[[/金幣/g,"歐泊"]],
 "ko":[[/코인/g,"오팔"]],
 "fr":[[/pièces/gi,"opales"],[/pièce/gi,"opale"]],
 "es":[[/monedas/gi,"ópalos"],[/moneda/gi,"ópalo"]]
};
var periods=["1h","1day","1week","1month","1year"];
var keys=["coins.tableHour","coins.tableDay","coins.tableWeek","coins.tableMonth","coins.tableYear"];
Object.keys(rules).forEach(function(locale){
 var t=d[locale]||(d[locale]={});
 Object.keys(t).forEach(function(key){
  if(typeof t[key]!=="string")return;
  var v=t[key];rules[locale].forEach(function(pair){v=v.replace(pair[0],pair[1]);});
  t[key]=v;
 });
 keys.forEach(function(key,i){t[key]=periods[i];});
});
Object.assign(d.ja,{
 "coins.title":"無料でもプレミアム機能が使える！",
 "coins.lead":"ログインやミッションでオパールを集めれば、プレミアム機能も追加料金なしで使えます。好きな機能と期間を選んで交換できます。",
 "coins.meta.title":"オパール・ミッション | NIARIM",
 "coins.catalog":"引き換えに必要なオパール数",
 "coins.b11":"コンプリートパック",
 "coins.compareFull":"コンプリートパック",
 "coins.compareCaption":"制作機能6つ＋全広告非表示を個別交換した場合との比較。表内の%OFFは単品交換が基準",
 "coins.yearVsMonthlyLabel":"別の比較：1か月パックを12回交換した場合",
 "coins.yearNote":"1か月パック44,000オパール×12回＝528,000オパール。1年間パック440,000オパールなら88,000オパールお得で、約17% OFFです（月ごとに交換する場合との比較）。",
 "premium.coinsTitle":"オパールでプレミアム機能も無料で使える！",
 "coins.catalogCaution":"使いたい機能と期間に応じた必要オパール数です。単品とコンプリートパックを一つの表で比較できます。",
 "coins.rateNote":"参考レートは100オパール＝1円相当。換金はできません。毎日のログインで10オパール、対象のリワード広告1回で10オパール、ほかのミッションでもオパールをもらえます。",
 "coins.tableCaption":"オパールで交換する制作機能6つと全広告非表示の単品合計、コンプリートパック、節約数を期間別に比較した表",
 "coins.compareSeparate":"制作機能6つ＋全広告非表示の単品合計",
 "coins.compareSaving":"パックで節約できるオパール数",
 "coins.compareIntro":"制作機能6つと全広告非表示の単品合計は、1か月が55,000オパール、1年間が550,000オパールです。プレミアムの月額550円・年額5,500円に相当します。表の%OFFは単品合計からの割引率です。",
 "coins.compareCaution":"全広告非表示には各画面の広告非表示が含まれます。短時間だけなら単品交換も選べます。"

});
var labels={
 en:["Complete Pack","Separate comparison: 12 monthly packs","12 monthly packs cost 528,000 Opals (44,000 × 12). The annual pack costs 440,000 Opals: 88,000 fewer, around 17% off monthly packs."],
 "zh-Hans":["全功能组合包","另一种比较：连续兑换12次月度组合包","12次月度组合包需528,000欧泊；年度组合包需440,000欧泊，节省88,000欧泊（约17%，相对于月度组合包）。"],
 "zh-Hant":["全功能組合包","另一種比較：每月兌換共12次","12次月度組合包需528,000歐泊；年度組合包需440,000歐泊，節省88,000歐泊（約17%，相對於月度組合包）。"],
 ko:["컴플리트 팩","다른 비교: 월간 팩 12회 교환","월간 팩 12회는 528,000오팔, 연간 팩은 440,000오팔로 88,000오팔(약 17%) 절약됩니다."],
 fr:["Pack complet","Autre comparaison : 12 packs mensuels","12 packs mensuels coûtent 528 000 opales contre 440 000 pour le pack annuel, soit 88 000 de moins (environ 17 %)."],
 es:["Paquete completo","Otra comparación: 12 paquetes mensuales","Doce paquetes mensuales cuestan 528.000 ópalos, frente a 440.000 por el anual: ahorras 88.000 ópalos (aprox. un 17 %)."]
};
Object.keys(labels).forEach(function(locale){
 var t=d[locale],a=labels[locale];
 t["coins.b11"]=a[0];t["coins.compareFull"]=a[0];t["coins.yearVsMonthlyLabel"]=a[1];t["coins.yearNote"]=a[2];
});

/* Unified table labels: the comparisons have different denominators. */
var details={
en:{
 "coins.rateNote":"Reference only: 100 Opals correspond to ¥1; Opals cannot be cashed out. Daily sign-in grants 10, eligible rewarded ads grant 10 per view, and missions offer more.",
 "coins.catalogCaution":"Compare individual tools and the Complete Pack for each duration.",
 "coins.tableCaption":"Compare the Opals needed for six tools and removing all ads individually, the Complete Pack, and the savings for each duration.",
 "coins.compareSeparate":"Six tools + all ads individually",
 "coins.compareSaving":"Opals saved with pack",
 "coins.compareIntro":"Six tools plus Remove All Ads cost 55,000 Opals for one month and 550,000 for one year, equivalent to Premium at ¥550 monthly or ¥5,500 annually. The table shows the discount from the individual total.",
 "coins.compareCaution":"Remove All Ads covers individual ad placements. Individual tools are available for shorter use."
},
"zh-Hans":{
 "coins.rateNote":"参考换算为100欧泊约等于1日元，不能兑换现金。每日登录得10欧泊，符合条件的激励广告每次得10欧泊，完成任务还可获得更多。",
 "coins.catalogCaution":"在同一张表中比较单项功能与全功能组合包。",
 "coins.tableCaption":"按使用期限比较六项工具和全部去广告的单项合计、全功能组合包及节省的欧泊数量。",
 "coins.compareSeparate":"六项功能＋全部去广告单项合计",
 "coins.compareSaving":"组合包节省的欧泊",
 "coins.compareIntro":"六项功能与全部去广告的单项合计为每月55,000欧泊、每年550,000欧泊，相当于Premium月费550日元、年费5,500日元。表中折扣按单项合计计算。",
 "coins.compareCaution":"全部去广告包含各区域去广告。短时间也可以选择单项兑换。"
},
"zh-Hant":{
 "coins.rateNote":"參考換算為100歐泊約等於1日圓，不能兌換現金。每日登入得10歐泊，符合條件的獎勵廣告每次得10歐泊，完成任務還能獲得更多。",
 "coins.catalogCaution":"在同一表格比較單項功能與全功能組合包。",
 "coins.tableCaption":"依使用期間比較六項工具和全部去廣告的單項總額、全功能組合包及節省的歐泊數量。",
 "coins.compareSeparate":"六項功能＋全部去廣告單項合計",
 "coins.compareSaving":"組合包省下的歐泊",
 "coins.compareIntro":"六項功能與全部去廣告的單項總額為每月55,000歐泊、每年550,000歐泊，相當於Premium月費550日圓、年費5,500日圓。表中折扣按單項總額計算。",
 "coins.compareCaution":"全部去廣告包括各區域去廣告。短時間也可以選擇單項兌換。"
},
ko:{
 "coins.rateNote":"참고 기준은 100오팔=1엔이며 현금 교환은 불가능합니다. 매일 로그인 10오팔, 대상 보상형 광고 1회당 10오팔, 미션으로도 획득할 수 있습니다.",
 "coins.catalogCaution":"단일 기능과 컴플리트 팩의 기간별 가격을 한 표에서 비교하세요.",
 "coins.tableCaption":"기간별로 제작 도구 6개와 전체 광고 제거의 단품 합계, 컴플리트 팩, 절약하는 오팔 수를 비교한 표.",
 "coins.compareSeparate":"제작 도구 6개＋전체 광고 제거 단품 합계",
 "coins.compareSaving":"팩으로 절약하는 오팔",
 "coins.compareIntro":"제작 도구 6개와 전체 광고 제거의 단품 합계는 한 달 55,000오팔, 1년 550,000오팔입니다. Premium 구독료 월 550엔, 연 5,500엔에 해당합니다. 표의 할인율은 단품 합계 기준입니다.",
 "coins.compareCaution":"전체 광고 제거에는 각 화면의 광고가 포함됩니다. 짧은 이용에는 개별 교환도 가능합니다."
},
fr:{
 "coins.rateNote":"À titre indicatif, 100 opales correspondent à 1 ¥; elles ne sont pas convertibles en argent. Connexion quotidienne : 10 opales, annonce récompensée éligible : 10 opales, plus les missions.",
 "coins.catalogCaution":"Comparez les outils seuls et le Pack complet dans un seul tableau.",
 "coins.tableCaption":"Comparez, pour chaque durée, le coût en opales des six outils et de la suppression des annonces à l’unité, du Pack complet et les économies.",
 "coins.compareSeparate":"Six outils + suppression des pubs séparément",
 "coins.compareSaving":"Opales économisées",
 "coins.compareIntro":"Les six outils et la suppression de toutes les pubs coûtent 55 000 opales pour un mois et 550 000 pour un an, soit l’équivalent de Premium à 550 ¥ par mois ou 5 500 ¥ par an. Les remises du tableau sont calculées sur ce total.",
 "coins.compareCaution":"La suppression des pubs couvre aussi chaque emplacement. Pour un usage bref, choisissez un outil seul."
},
es:{
 "coins.rateNote":"Referencia: 100 ópalos equivalen a 1 ¥; no se pueden cambiar por dinero. Inicio diario: 10 ópalos, anuncio recompensado válido: 10 ópalos y más con misiones.",
 "coins.catalogCaution":"Compara funciones individuales y el Paquete completo en una sola tabla.",
 "coins.tableCaption":"Comparación por duración del coste en ópalos de las seis herramientas y la eliminación de anuncios por separado, el Paquete completo y el ahorro.",
 "coins.compareSeparate":"Seis funciones + quitar anuncios por separado",
 "coins.compareSaving":"Ópalos ahorrados",
 "coins.compareIntro":"Las seis herramientas y la eliminación de todos los anuncios cuestan 55.000 ópalos por un mes y 550.000 por un año, el equivalente a Premium por 550 ¥ al mes o 5.500 ¥ al año. Los descuentos de la tabla se calculan sobre el total individual.",
 "coins.compareCaution":"Quitar todos los anuncios incluye cada ubicación. Para periodos breves puedes canjear una función sola."
}
};
Object.keys(details).forEach(function(locale){Object.assign(d[locale]||(d[locale]={}),details[locale]);});
})();
