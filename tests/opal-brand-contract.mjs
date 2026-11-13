import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const page=readFileSync("public/coins/index.html","utf8");
const premium=readFileSync("public/premium/index.html","utf8");
const css=readFileSync("public/css/pages/coins.css","utf8");
const table=page.match(/<table class="coins-table coins-table--priced">[\s\S]*?<\/table>/)?.[0];
assert.ok(table,"pricing table");
assert.equal((page.match(/coins-table--priced/g)||[]).length,1,"one priced table");
assert.equal((page.match(/coins-compare-table/g)||[]).length,0,"no second comparison table");
assert.doesNotMatch(page,/<section class="coins-compare"/);
for(const [key,unit] of Object.entries({tableHour:"1h",tableDay:"1day",tableWeek:"1week",tableMonth:"1month",tableYear:"1year"})){
 assert.match(table,new RegExp('data-i18n="coins\\.'+key+'">'+unit+'<'));
}
const prices=[
 [2000,4000,9000,12000,144000],
 [3000,6000,13500,18000,216000],
 [3000,6000,13500,18000,216000],
 [2500,5000,11250,15000,180000],
 [4170,8340,18750,25000,300000],
 [4170,8340,18750,25000,300000],
 [2000,4000,9000,12000,144000],
 [3340,6670,15000,20000,240000],
 [2670,5340,12000,16000,192000],
 [1670,3340,7500,10000,120000],
 [6670,13340,30000,40000,480000],
 [10000,25000,45000,55000,550000],
];
function values(row){
 return [...row.matchAll(/<td\b[^>]*>([\d,]+)/g)]
   .map(x=>Number(x[1].replaceAll(",","")));
}
for(const [i,expected] of prices.entries()){
 const row=table.match(new RegExp('<tr[^>]*><th scope="row" data-i18n="coins\\.b'+i+'">[\\s\\S]*?<\\/tr>'))?.[0];
 assert.ok(row,"benefit row "+i);
 assert.deepEqual(values(row),expected,"v5 rate row "+i);
}
const separate=[25510,51020,114750,153000,1836000];
const saving=[15510,26020,69750,98000,1286000];
for(const [label,expected] of [["coins.compareSeparate",separate],["coins.compareSaving",saving]]){
 const row=table.match(new RegExp('<tr[^>]*><th scope="row" data-i18n="'+label.replace(".","\\.")+'">[\\s\\S]*?<\\/tr>'))?.[0];
 assert.ok(row,"integrated comparison row "+label);
 assert.deepEqual(values(row),expected);
}
const rates=[61,51,61,64,70];
const bundle=table.match(/<tr class="coins-bundle-row">[\s\S]*?<\/tr>/)?.[0];
assert.ok(bundle);
assert.deepEqual([...bundle.matchAll(/aria-label="(\d+)% OFF"/g)].map(x=>Number(x[1])),rates);
assert.match(table,/data-i18n="coins.b11">コンプリートパック<\/th>/);
assert.match(page,/data-i18n="coins.yearNote"/);
assert.match(page,/data-i18n="coins.rateNote"/);
assert.match(page,/無料でもプレミアム機能が使える！/);
assert.doesNotMatch(premium,/NIARIMを始めよう/);
assert.match(css,/coins-table--priced[\s\S]*?HakkouMincho/);
assert.match(css,/Unified Opal price and savings table/);
const context={window:{NIARIM_I18N_DICT:{}}};
for(const file of ["public/js/i18n-dict.js","public/js/i18n-dict-intl.js","public/js/i18n-dict-nav-extra.js","public/js/i18n-dict-premium.js","public/js/i18n-dict-narrative.js","public/js/i18n-dict-refresh-2026.js","public/js/visitor-copy-and-goals.js","public/js/opal-ui-naming.js"]){
 vm.runInNewContext(readFileSync(file,"utf8"),context,{filename:file});
}
const d=context.window.NIARIM_I18N_DICT;
assert.equal(d.ja["coins.title"],"無料でもプレミアム機能が使える！");
assert.equal(d.ja["coins.unit"],"オパール");
assert.equal(d.ja["coins.compareFull"],"コンプリートパック");
assert.match(d.ja["coins.yearNote"],/17% OFF/);
for(const language of ["ja","en","fr","es","ko","zh-Hans","zh-Hant"]){
 for(const key of ["coins.rateNote","coins.compareSeparate","coins.compareSaving","coins.tableCaption","coins.yearNote"]){
  assert.ok(typeof d[language]?.[key]==="string" && d[language][key].length>5,language+" "+key);
 }
}
console.log("Opal v5: one tariff, two baselines, 12 price rows, 7 locales OK");
