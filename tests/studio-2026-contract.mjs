import fs from "node:fs";
import assert from "node:assert/strict";
const routes = ["/","/about/","/features/","/help/","/premium/","/community/","/news/","/faq/","/contact/","/privacy/","/terms/","/font-licenses/"];
const html = route => fs.readFileSync("public"+(route==="/" ? "/index.html":route+"index.html"),"utf8");
for(const path of routes){
  const content=html(path);
  assert.match(content,/studio-unification-2026\.css\?v=20261112-1/,"Missing unified style: "+path);
}
const home=html("/");
assert.match(home,/assets\/images\/app-captures\/community\.webp/);
assert.match(home,/loading="lazy" decoding="async"/);
assert.doesNotMatch(home,/nr-plaza-illustration|nr-illustration-sun|nr-plaza-window/);
const css=fs.readFileSync("public/css/studio-unification-2026.css","utf8");
assert.match(css,/Kuramubon/);
assert.match(css,/HakkouMincho/);
assert.match(css,/prefers-reduced-motion/);
const dict=fs.readFileSync("public/js/i18n-dict-refresh-2026.js","utf8");
assert.match(dict,/"plaza.title":"作品から、次の物語へ。"/);
const image="public/assets/images/app-captures/community.webp";
if(fs.existsSync(image)) {
 const buf=fs.readFileSync(image);
 assert.equal(buf.subarray(0,4).toString("ascii"),"RIFF");
 assert.equal(buf.subarray(8,12).toString("ascii"),"WEBP");
 assert.ok(buf.byteLength>1000 && buf.byteLength<100000);
}
console.log("Studio cross-page font, copy, motion and native capture source contracts OK");
