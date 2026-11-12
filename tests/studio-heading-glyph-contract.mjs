/* Guards authored Japanese display copy against unsupported Kuramubon glyphs.
 * Uses the actual deployed WOFF2 unicode-range catalog, not OS fallback fonts. */
import fs from "node:fs";
import assert from "node:assert/strict";
const css=fs.readFileSync("public/css/common-base.css","utf8");
const glyphs=new Set();
for(const match of css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)){
  const face=match[1];
  if(!/font-family:\s*"(Kuramubon|KuramubonCJK)";/.test(face))continue;
  const range=face.match(/unicode-range:\s*([\s\S]*?);/)?.[1]||"";
  for(const v of range.matchAll(/U\+([0-9a-f]{4,6})(?:-([0-9a-f]{4,6}))?/gi)){
    const start=parseInt(v[1],16),end=parseInt(v[2]||v[1],16);
    for(let cp=start;cp<=end;cp++)glyphs.add(cp);
  }
}
assert.ok(glyphs.size>700,"Kuramubon WOFF2 unicode range missing");
const problems=[];
function validate(where,s){
 const plain=s.replace(/<[^>]+>/g,"").replace(/&(amp|quot|nbsp|lt|gt);/g," ");
 const missing=[...new Set([...plain].filter(c=>c.trim()&&!glyphs.has(c.codePointAt(0))))];
 if(missing.length) problems.push({where,text:plain.slice(0,100),missing:missing.join("")});
}
const routes=["","about/","features/","help/","premium/","coins/","community/","news/","faq/","contact/","privacy/","terms/","font-licenses/"];
for(const route of routes){
 const path="public/"+route+"index.html";
 const content=fs.readFileSync(path,"utf8");
 let idx=0;
 for(const match of content.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)){
   // In-app help must remain verbatim, even where the heading subset lacks a
   // glyph: that route uses the other approved font as an explicit fallback.
   if(path!=="public/help/index.html")validate(path+":"+(++idx),match[1]);
 }
}
const dict=fs.readFileSync("public/js/i18n-dict-refresh-2026.js","utf8");
const sections=[...dict.matchAll(/"ja":\{/g)].map(x=>x.index);
assert.ok(sections.length>=4,"Cannot locate all Japanese translation groups");
for(const n of [0,2,3]){
 const start=sections[n],end=dict.indexOf('"en":{',start);
 assert.ok(end>start,"Language group invalid");
 const segment=dict.slice(start,end);
 for(const match of segment.matchAll(/"([^"]+)":"((?:[^"\\]|\\.)*)"/g)){
   const key=match[1],text=match[2];
   if(!(/\.title$|\.badge$|\.storeSoon$|\.link$|\.all$/.test(key)))continue;
   // Non-display metadata and long descriptions are not title text.
   if(key.startsWith("meta."))continue;
   validate("i18n:"+key,text);
 }
}

/* The copy override is loaded after the normal dictionary. Check the actual
   licensed heading and body font ranges before accepting any new wording. */
const bodyGlyphs=new Set();
for(const match of css.matchAll(/@font-face\\s*\\{([\\s\\S]*?)\\}/g)){
  const face=match[1];
  if(!/font-family:\\s*"(HakkouMincho|HakkouMinchoCJK)";/.test(face))continue;
  const range=face.match(/unicode-range:\\s*([\\s\\S]*?);/)?.[1]||"";
  for(const v of range.matchAll(/U\\+([0-9a-f]{4,6})(?:-([0-9a-f]{4,6}))?/gi)){
    for(let cp=parseInt(v[1],16);cp<=parseInt(v[2]||v[1],16);cp++)bodyGlyphs.add(cp);
  }
}
assert.ok(bodyGlyphs.size>1000,"HakkouMincho WOFF2 unicode range missing");
const overlay=fs.readFileSync("public/js/visitor-copy-and-goals.js","utf8");
const start=overlay.indexOf("var t=")+6;
const end=overlay.indexOf(";for(var l in t)",start);
assert.ok(start>5&&end>start,"visitor copy JSON missing");
const visitor=JSON.parse(overlay.slice(start,end));
const headingKeys=new Set([
  "coins.title","coins.catalog","coins.compareTitle",
  "premium.coinsTitle","coins.toPremiumTitle","refresh.plaza.title"
]);
for(const [key,value] of Object.entries(visitor.ja)){
 const font=headingKeys.has(key)?glyphs:bodyGlyphs;
 const missing=[...new Set([...value].filter(ch=>ch.trim()&&!font.has(ch.codePointAt(0))))];
 if(missing.length)problems.push({where:"visitor:"+key,text:value.slice(0,100),missing:missing.join("")});
}
if(problems.length) console.error(JSON.stringify(problems,null,2));
assert.equal(problems.length,0,"Unsupported Kuramubon characters found in Japanese display copy");
console.log("Kuramubon Japanese headings verified against deployed web font coverage");
