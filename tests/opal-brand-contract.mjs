import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const page=readFileSync("public/coins/index.html","utf8");
const premium=readFileSync("public/premium/index.html","utf8");
const css=readFileSync("public/css/pages/coins.css","utf8");
const table=page.match(/<table class="coins-table coins-table--priced">[\s\S]*?<\/table>/)?.[0];
assert.ok(table,"pricing table is present");
for(const [key,unit] of Object.entries({tableHour:"1h",tableDay:"1day",tableWeek:"1week",tableMonth:"1month",tableYear:"1year"})){
 assert.match(table,new RegExp('data-i18n="coins\\.'+key+'">'+unit+'<'));
}
assert.match(table,/data-i18n="coins.b11">コンプリートパック<\/th>/);
const bundle=table.match(/<tr><th scope="row" data-i18n="coins.b11">[\s\S]*?<\/tr>/)?.[0];
assert.ok(bundle,"complete pack row");
for(const [amount,rate] of [["5,000","22"],["10,000","35"],["30,000","61"],["55,000","64"],["550,000","70"]]){
 assert.ok(bundle.includes(amount)&&bundle.includes(rate+"% OFF"),amount+" bundle discount");
}
assert.match(page,/data-i18n="coins.yearNote"/);
assert.match(page,/data-i18n="coins.compareFull">コンプリートパック/);
assert.match(page,/無料でもプレミアム機能が使える！/);
assert.doesNotMatch(premium,/NIARIMを始めよう/);
assert.match(css,/coins-compare-table[\s\S]*?HakkouMincho/);
const scope={window:{NIARIM_I18N_DICT:{}}};
for(const path of ["public/js/i18n-dict.js","public/js/i18n-dict-intl.js","public/js/i18n-dict-nav-extra.js","public/js/i18n-dict-premium.js","public/js/i18n-dict-narrative.js","public/js/i18n-dict-refresh-2026.js","public/js/visitor-copy-and-goals.js","public/js/opal-ui-naming.js"]){
 vm.runInNewContext(readFileSync(path,"utf8"),scope,{filename:path});
}
const d=scope.window.NIARIM_I18N_DICT;
assert.equal(d.ja["coins.title"],"無料でもプレミアム機能が使える！");
assert.equal(d.ja["coins.unit"],"オパール");
assert.equal(d.ja["coins.b11"],"コンプリートパック");
assert.equal(d.ja["coins.compareFull"],"コンプリートパック");
assert.match(d.ja["coins.yearNote"],/17% OFF/);
assert.match(d.en["coins.yearNote"],/17%/);
assert.match(d.ko["coins.unit"],/오팔/);
assert.match(d["zh-Hant"]["coins.unit"],/歐泊/);
console.log("Opal currency name, glyph-safe columns, and both discount baselines: OK");

