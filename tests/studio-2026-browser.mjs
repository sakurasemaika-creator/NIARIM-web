/* Playwright site-level regression checks: real product capture, two Japanese
 * typography roles, keyboard-friendly motion and cross-width correctness. */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { launchOptions } from "./browser-launch.mjs";
const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8787";
const routes=["/","/about/","/features/","/help/","/premium/","/community/","/news/","/faq/","/contact/","/privacy/","/terms/","/font-licenses/","/404.html"];
const widths=[390,1280];
const output="artifacts/studio-2026";
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch(launchOptions());
const findings=[];
const bad=[];
try {
  for(const width of widths) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:"reduce"});
    await context.addInitScript(() => localStorage.setItem("niarim_lang","ja"));
    const page=await context.newPage();
    page.on("pageerror", e=>bad.push("JS "+width+" "+e.message));
    page.on("response",r=>{
      if(r.status()>=400 && r.url().includes("/assets/")) bad.push("Asset "+r.status()+" "+r.url());
    });
    for(const route of routes) {
      const response=await page.goto(base+route,{waitUntil:"domcontentloaded"});
      if(!response || response.status()>=400)bad.push("HTTP "+width+" "+route+" "+response?.status());
      await page.evaluate(()=>document.fonts.ready);
      const results=await page.evaluate(()=>{
        const visible=el=>{
          const st=getComputedStyle(el),r=el.getBoundingClientRect();
          return st.display!=="none" && st.visibility!=="hidden" && r.width>0 && r.height>0;
        };
        const headings=[...document.querySelectorAll("h1,h2,h3")]
          .filter(el=>visible(el)&&!el.closest(".fd-app-screen,.fd-route-screen,.feature-diagram--real"));
        return {
          overflow:document.documentElement.scrollWidth-innerWidth,
          headings:headings.filter(el=>!getComputedStyle(el).fontFamily.includes("Kuramubon"))
             .slice(0,6).map(el=>({text:el.textContent.trim().slice(0,50),family:getComputedStyle(el).fontFamily})),
          body:getComputedStyle(document.body).fontFamily
        };
      });
      if(results.overflow>3) bad.push("Horizontal overflow "+width+" "+route+" "+results.overflow);
      if(results.headings.length) bad.push("Non-Kuramubon heading "+width+" "+route+" "+JSON.stringify(results.headings));
      if(!results.body.includes("HakkouMincho"))bad.push("Body font "+width+" "+route+" "+results.body);
      if(route==="/") {
        const screenshot=page.locator(".nr-plaza-capture-image");
        await screenshot.scrollIntoViewIfNeeded();
        await screenshot.evaluate(img=>img.decode());
        const size=await screenshot.evaluate(img=>[img.naturalWidth,img.naturalHeight]);
        if(size[0]!==360||size[1]!==760)bad.push("Native community capture "+width+" "+JSON.stringify(size));
        const reduced=await page.locator(".nr-hero-pc-view").evaluate(el=>getComputedStyle(el).transitionDuration);
        if(reduced.split(",").some(v=>parseFloat(v)>0.01))bad.push("Reduced-motion transition "+width+" "+reduced);
        await page.screenshot({path:path.join(output,"home-"+width+".png"),fullPage:true,animations:"disabled"});
      }
      if(["/features/","/community/"].includes(route)){
        await page.screenshot({path:path.join(output,route.slice(1,-1)+"-"+width+".png"),fullPage:true,animations:"disabled"});
      }
      findings.push({width,route,overflow:results.overflow,headings:results.headings.length});
    }
    await context.close();
  }
  // Exercise motion with normal user preference, not only reduced-motion CSS.
  const live=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:"no-preference"});
  const motion=await live.newPage();
  await motion.goto(base+"/",{waitUntil:"networkidle"});
  const scene=motion.locator(".nr-hero-showcase");
  const pc=motion.locator(".nr-hero-pc-view");
  const startTransform=await pc.evaluate(el=>getComputedStyle(el).transform);
  await scene.hover();
  await motion.waitForTimeout(900);
  const endTransform=await pc.evaluate(el=>getComputedStyle(el).transform);
  if(startTransform===endTransform)bad.push("Normal-motion hero hover did not change device transform");
  const bar=motion.locator(".brand-reading-progress");
  await bar.waitFor({state:"attached"});
  await motion.evaluate(()=>window.scrollTo(0,Math.min(700,document.documentElement.scrollHeight-innerHeight)));
  await motion.waitForTimeout(180);
  const progress=await bar.evaluate(el=>getComputedStyle(el).transform);
  if(progress==="none"||/^matrix\(0(?:\.0+)?,/.test(progress)) {
    bad.push("Header scroll progress failed to update: "+progress);
  }
  await live.close();
}finally{await browser.close();}
await fs.writeFile(path.join(output,"report.json"),JSON.stringify({checked:findings.length,findings,bad},null,2));
if(bad.length){console.error("Studio browser audit failures:\n"+bad.join("\n"));process.exit(1);}
console.log("Studio browser audit OK:",findings.length,"page-size combinations across 390/1280px. Captures saved.");
