import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const browsers = await chromium.launch({headless:true});
const findings = [];
const widths = [320, 390, 768, 1280, 1440];
const langs = ["ja","en","zh-Hans","zh-Hant","ko","fr","es"];
const source = await fs.readFile("public/assets/images/app-captures/source.txt","utf8");
const screenshotMeta = Object.fromEntries(source.trim().split("\n").map(line => line.split("=",2)));
const captureNames = ["canvas","layers","onion-skin","timeline","audio-editor","save-tree","export","workspace","widget"];
const log = (...args) => findings.push(args.join(" · "));
try {
  assert.equal(screenshotMeta.premium, "true");
  assert.equal(screenshotMeta.ads, "false");
  assert.equal(screenshotMeta.screens, "9");
  assert.equal(screenshotMeta.variants_per_screen, "4");
} catch(e) { log("Capture source",e.message); }

try {
  for (const width of widths) {
    const page = await browsers.newPage({viewport:{width,height:900}});
    page.on("pageerror", e => log("Browser JS",width,e.message));
    const res = await page.goto(base + "/",{waitUntil:"networkidle"});
    if(!res || res.status()>=400) log("Home HTTP",width,res?.status());
    await page.evaluate(() => document.fonts.ready);
    const dims = await page.evaluate(() => ({doc:document.documentElement.scrollWidth,win:innerWidth}));
    if(dims.doc>dims.win+2) log("Horizontal overflow",width,JSON.stringify(dims));
    const hero = await page.locator("#nr-hero-title").innerHTML();
    if(!hero.includes("NIARIM")) log("Brand wordmark missing",width);
    const paired = await page.locator(".nr-gallery-item .nr-duo[data-paired-capture]").count();
    if(paired!==9) log("PC/SP paired gallery count",width,paired);
    const stagePC = await page.locator(".nr-hero-showcase [data-capture-pc='canvas']").count();
    if(stagePC!==1)log("PC hero capture missing",width);
    const missingPair=await page.evaluate(()=>[...document.querySelectorAll("figure.nr-shot[data-capture]:not(.nr-hero-showcase *)")].filter(f=>!f.closest(".nr-duo")).length);
    if(missingPair)log("Unpaired mobile captures",width,missingPair);
    const count = await page.locator(".nr-gallery-item").count();
    if(count!==9) log("Gallery count",width,count);
    if(width===390 || width===1440){
      await fs.mkdir("artifacts/refresh-2026",{recursive:true});
      await page.screenshot({path:"artifacts/refresh-2026/home-"+width+".png",fullPage:true,animations:"disabled"});
    }
    if(width===390) {
      for(const variant of [1,2,3,4,1]){
        await page.locator(".nr-palette-button[data-variant='"+variant+"']").click();
        const state=await page.locator(".nr-gallery-item").first().evaluate(el=>({
          src:el.querySelector("img").getAttribute("src"),
          color:el.querySelector(".nr-shot").style.getPropertyValue("--capture-accent")
        }));
        const expectedTail=variant===1?"":"-v"+variant;
        if(!state.src.endsWith("canvas"+expectedTail+".webp"))log("Variant switch",variant,JSON.stringify(state));
        const expectedColors=["#3AA6FF","#F2B90F","#B15CFF","#10B981"];
        if(state.color.toUpperCase()!==expectedColors[variant-1])log("Theme/frame mismatch",variant,state.color);
      }
      for(const name of captureNames){
        for(const variant of [1,2,3,4]){
          const suffix=variant===1?"":"-v"+variant;
          const url=base+"/assets/images/app-captures/"+name+suffix+".webp";
          const result=await page.request.get(url);
          if(result.status()!==200) log("Missing screenshot",url,result.status());
          const pc=await page.request.get(base+"/assets/images/app-captures/pc-"+name+suffix+".webp");
          if(pc.status()!==200) log("Missing PC screenshot",name,variant,pc.status());
        }
      }
    }
    await page.close();
  }
  for(const lang of langs){
    const page=await browsers.newPage({viewport:{width:390,height:844}});
    page.on("pageerror",e=>log("Browser JS",lang,e.message));
    await page.goto(base+"/?lang="+encodeURIComponent(lang),{waitUntil:"networkidle"});
    const status=await page.evaluate(() => ({lang:document.documentElement.lang,title:document.title,body:document.querySelector("#nr-hero-title")?.textContent,missing:[...document.querySelectorAll('[data-i18n^="refresh."],[data-i18n-html^="refresh."]')].map(n=>n.getAttribute("data-i18n")||n.getAttribute("data-i18n-html")).filter(k=>!Object.hasOwn(window.NIARIM_I18N_DICT[document.documentElement.lang]||{},k))}));
    if(status.lang!==lang || !status.title || !status.body || status.missing.length)log("Localization",lang,JSON.stringify(status));
    await page.close();
  }
  const page=await browsers.newPage({viewport:{width:1280,height:960}});
  for(const [path,selector] of [["/features/",".nr-curated"],["/premium/",".nr-notice"],["/community/",".community-banner"]]){
    page.on("pageerror",e=>log("Interior JS",path,e.message));
    const response=await page.goto(base+path,{waitUntil:"networkidle"});
    if(response?.status()!==200||!(await page.locator(selector).count()))log("Interior missing",path,selector);
  }
  await page.close();
} catch(error){log("Unexpected error",error.stack||error.message)}
finally {await browsers.close()}
await fs.mkdir("artifacts/refresh-2026",{recursive:true});
await fs.writeFile("artifacts/refresh-2026/report.json",JSON.stringify({testedAt:new Date().toISOString(),widths,langs,findings},null,2));
if(findings.length){
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("NIARIM refreshed site: five widths, seven locales, 36 images, four theme variants and core interior pages pass");
