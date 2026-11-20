import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const page=readFileSync(process.argv[2] ?? "public/opals/index.html","utf8");
if (process.argv[2] && /<title\b[^>]*>[^<]*Cloudflare Access/i.test(page)) {
  throw new Error("The deployed price page requires a Cloudflare Access session.");
}
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
 [1440, 2880, 6470, 8620, 86200],
 [2160, 4320, 9710, 12940, 129400],
 [2160, 4320, 9710, 12940, 129400],
 [1800, 3600, 8090, 10780, 107800],
 [3000, 6000, 13490, 17980, 179800],
 [3000, 6000, 13490, 17980, 179800],
 [1440, 2880, 6470, 8620, 86200],
 [2400, 4800, 10790, 14380, 143800],
 [1920, 3840, 8630, 11500, 115000],
 [1200, 2400, 5390, 7180, 71800],
 [4820, 9580, 21560, 28760, 287600],
 [9190, 18350, 41260, 55000, 550000],
];
function values(row){
 return [...row.matchAll(/<td\b[^>]*>([\d,]+)/g)]
   .map(x=>Number(x[1].replaceAll(",","")));
}
for(const [i,expected] of prices.entries()){
 const row=table.match(new RegExp('<tr[^>]*><th scope="row" data-i18n="coins\\.b'+i+'">[\\s\\S]*?<\\/tr>'))?.[0];
 assert.ok(row,"benefit row "+i);
 assert.deepEqual(values(row),expected,"v8 rate row "+i);
}
const separate=[18380, 36700, 82520, 110000, 1100000];
const saving=[9190, 18350, 41260, 55000, 550000];
for(const [label,expected] of [["coins.compareSeparate",separate],["coins.compareSaving",saving]]){
 const row=table.match(new RegExp('<tr[^>]*><th scope="row" data-i18n="'+label.replace(".","\\.")+'">[\\s\\S]*?<\\/tr>'))?.[0];
 assert.ok(row,"integrated comparison row "+label);
 assert.deepEqual(values(row),expected);
}
const rates=[50,50,50,50,50];
const bundle=table.match(/<tr class="coins-bundle-row">[\s\S]*?<\/tr>/)?.[0];
assert.ok(bundle);
assert.deepEqual([...bundle.matchAll(/aria-label="(\d+)% OFF"/g)].map(x=>Number(x[1])),rates);
assert.deepEqual(prices[11].map((price,i)=>separate[i]-price),saving);
assert.match(table,/data-i18n="coins.b11">コンプリートパック<\/th>/);
assert.match(page,/data-i18n="coins.yearNote"/);
assert.match(page,/data-i18n="coins.rateNote"/);
assert.match(page,/data-i18n="coins.compareCaution">[^<]*オパール交換画面/);
assert.match(page,/無料でもプレミアム機能が使える！/);
assert.doesNotMatch(premium,/NIARIMを始めよう/);
assert.match(css,/coins-table--priced[^{}]*\{[^}]*font-family:\s*var\(--font-sans\)/);
const typeVariables=readFileSync("public/css/variables.css","utf8");
assert.match(typeVariables,/--font-sans:\s*"HakkouMincho"/);
assert.match(css,/Unified Opal price and savings table/);
const context={window:{NIARIM_I18N_DICT:{}}};
for(const file of ["public/js/i18n-dict.js","public/js/i18n-dict-intl.js","public/js/i18n-dict-nav-extra.js","public/js/i18n-dict-premium.js","public/js/i18n-dict-narrative.js","public/js/i18n-dict-refresh-2026.js","public/js/visitor-copy-and-goals.js","public/js/opal-ui-naming.js"]){
 vm.runInNewContext(readFileSync(file,"utf8"),context,{filename:file});
}
const d=context.window.NIARIM_I18N_DICT;
assert.equal(d.ja["coins.title"],"無料でもプレミアム機能が使える！");
assert.equal(d.ja["coins.unit"],"オパール");
assert.equal(d.ja["coins.compareFull"],"コンプリートパック");
assert.match(d.ja["coins.yearNote"],/55,000.+660,000.+550,000.+110,000.+17%/);
for(const language of ["ja","en","fr","es","ko","zh-Hans","zh-Hant"]){
 for(const key of ["coins.rateNote","coins.compareSeparate","coins.compareSaving","coins.tableCaption","coins.yearNote","coins.compareCaution"]){
  assert.ok(typeof d[language]?.[key]==="string" && d[language][key].length>5,language+" "+key);
 }
}
console.log("Opal v8: one tariff, two baselines, 12 price rows, 7 locales OK");
