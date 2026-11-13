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
 "coins.compareIntro":"制作機能6つと全広告非表示を個別交換した場合と、プレミアム会員と同内容のコンプリートパックを比較できます。表内の割引率は単品交換との比較です。",
 "coins.yearVsMonthlyLabel":"別の比較：1か月パックを12回交換した場合",
 "coins.yearNote":"1か月パック55,000オパール×12回＝660,000オパール。1年間パック550,000オパールなら110,000オパールお得で、約17% OFFです（月ごとに交換する場合との比較）。",
 "premium.coinsTitle":"オパールでプレミアム機能も無料で使える！"
});
var labels={
 en:["Complete Pack","Separate comparison: 12 monthly packs","12 monthly packs cost 660,000 Opals (55,000 × 12). The annual pack costs 550,000 Opals: 110,000 fewer, around 17% off monthly packs."],
 "zh-Hans":["全功能组合包","另一种比较：连续兑换12次月度组合包","12次月度组合包需660,000欧泊；年度组合包需550,000欧泊，节省110,000欧泊（约17%，相对于月度组合包）。"],
 "zh-Hant":["全功能組合包","另一種比較：每月兌換共12次","12次月度組合包需660,000歐泊；年度組合包需550,000歐泊，節省110,000歐泊（約17%，相對於月度組合包）。"],
 ko:["컴플리트 팩","다른 비교: 월간 팩 12회 교환","월간 팩 12회는 660,000오팔, 연간 팩은 550,000오팔로 110,000오팔(약 17%) 절약됩니다."],
 fr:["Pack complet","Autre comparaison : 12 packs mensuels","12 packs mensuels coûtent 660 000 opales contre 550 000 pour le pack annuel, soit 110 000 de moins (environ 17 %)."],
 es:["Paquete completo","Otra comparación: 12 paquetes mensuales","Doce paquetes mensuales cuestan 660.000 ópalos, frente a 550.000 por el anual: ahorras 110.000 ópalos (aprox. un 17 %)."]
};
Object.keys(labels).forEach(function(locale){
 var t=d[locale],a=labels[locale];
 t["coins.b11"]=a[0];t["coins.compareFull"]=a[0];t["coins.yearVsMonthlyLabel"]=a[1];t["coins.yearNote"]=a[2];
});
})();
