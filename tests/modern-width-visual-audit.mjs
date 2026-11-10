import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const base=process.env.AUDIT_BASE_URL||"http://127.0.0.1:8787";
const pages=["/","/about/","/features/","/community/","/premium/","/help/","/faq/","/news/","/contact/","/privacy/","/terms/","/404.html"];
const widths=[320,360,390,430,768,1024,1280,1440];
const languages=["ja","en","zh-Hans","zh-Hant","ko","fr","es"];
const issues=[];
const metrics=[];
const browser=await chromium.launch({headless:true});
const dir="artifacts/modern-width-audit";
await fs.mkdir(dir,{recursive:true});
function issue(...parts){issues.push(parts.join(" :: "));}
async function loadPage(page,route){
 try {
   // Always pin Japanese audit pages to ja; the CI browser defaults to en-US
   // otherwise, resulting in English screenshots mislabeled as Japanese.
   const auditRoute=/[?&]lang=/.test(route)?route:route+(route.includes("?")?"&":"?")+"lang=ja";
   const res=await page.goto(base+auditRoute,{waitUntil:"networkidle",timeout:30000});
   if(!res||res.status()>=400)issue(route,"HTTP",res?.status());
   await page.evaluate(()=>document.fonts?.ready);
 }catch(e){issue(route,"navigation",e.message)}
}
async function measure(page,route,width,lang){
 const v=await page.evaluate(()=>{
   const body=document.body;
   const images=[...document.images].filter(x=>x.getBoundingClientRect().width>0&&x.getBoundingClientRect().height>0&&x.getBoundingClientRect().top<innerHeight+100);
   const resources=performance.getEntriesByType("resource");
   const screenshotImages=[...document.querySelectorAll('img[src*="/assets/images/app-captures/"]')];
   const bodyFont=getComputedStyle(document.body).fontFamily;
   const headingFont=document.querySelector("main h1:not(.nr-hero-wordmark),main h2")?getComputedStyle(document.querySelector("main h1:not(.nr-hero-wordmark),main h2")).fontFamily:"";
   const unpaired=screenshotImages.filter(img=>{
     if(img.getAttribute("src")?.includes("/pc-"))return false;
     if(img.closest(".nr-hero-showcase"))return !img.closest(".nr-hero-sp-view");
     return !img.closest(".nr-duo,.nr-feature-duo");
   });
   return {
     screen:innerWidth,doc:document.documentElement.scrollWidth,
     scrollH:document.documentElement.scrollHeight,
     resources:resources.length,
     bytes:resources.reduce((s,r)=>s+(r.transferSize||0),0),
     visibleBroken:images.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src.slice(-120)),
     captured:screenshotImages.length,unpaired:unpaired.map(i=>i.src.slice(-70)),
     headings:[...document.querySelectorAll("h1")].map(n=>n.textContent.trim()).slice(0,3),
     bodyFont,headingFont,
     visible:!!body&&getComputedStyle(body).visibility!=="hidden"
   };
 });
 if(v.doc>width+2)issue(lang,route,width,"horizontal_overflow",v.doc);
 const actualLang=await page.evaluate(()=>document.documentElement.lang);
 if(actualLang!==lang)issue(lang,route,width,"wrong_document_language",actualLang);
 // The website follows NIARIM's original brand font roles, not platform Noto Sans.
 if(lang==="ja"&&!v.bodyFont.includes("HakkouMincho"))
   issue(lang,route,width,"body_font_not_HakkouMincho",v.bodyFont);
 if(lang==="ja"&&v.headingFont&&!v.headingFont.includes("Kuramubon"))
   issue(lang,route,width,"heading_font_not_Kuramubon",v.headingFont);
 if(v.visibleBroken.length)issue(lang,route,width,"broken_visible_images",JSON.stringify(v.visibleBroken));
 if(v.unpaired.length)issue(lang,route,width,"unpaired_SP_captures",JSON.stringify(v.unpaired));
 if(!v.visible||!v.headings.length)issue(lang,route,width,"missing_content");
 metrics.push({lang,route,width,...v});
 if(route==="/"&&v.resources>100)issue(lang,route,width,"too_many_home_resources",v.resources);
}
try{
 for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:width<=430?844:960},reducedMotion:"reduce",deviceScaleFactor:1});
   page.on("pageerror",e=>issue("js_error",width,e.message));
   // Simulate an empty real public catalog instead of pretending that
   // the static local web server can contact AWS.
   await page.route("**/api/community?**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({works:[],unavailableReason:null})}));
   for(const route of pages){
     await loadPage(page,route);
     if(route==="/features/"){
       try {await page.waitForFunction(()=>document.querySelectorAll(".nr-feature-duo[data-paired-capture]").length>=9,{timeout:5000});}
       catch(_){issue("feature_captures_missing",width,"SP/PC pairing was not initialized");}
     }
     await measure(page,route,width,"ja");
     if((width===390||width===1440)&&route!=="/404.html"){
       const name=(route==="/"? "home":route.replaceAll("/","_")).replace(/^_/,"");
       await page.screenshot({path:path.join(dir,"ja-"+width+"-"+name+".png"),fullPage:true,animations:"disabled",timeout:30000});
     }
   }
   await page.close();
 }
 for(const lang of languages){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
   page.on("pageerror",e=>issue("i18n_js_error",lang,e.message));
   await page.route("**/api/community?**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({works:[],unavailableReason:null})}));
   for(const route of ["/","/features/","/community/"]){
     const sep=route.includes("?")?"&":"?";
     await loadPage(page,route+sep+"lang="+encodeURIComponent(lang));
     if(route==="/features/"){
       try {await page.waitForFunction(()=>document.querySelectorAll(".nr-feature-duo[data-paired-capture]").length>=9,{timeout:5000});}
       catch(_){issue("feature_captures_missing",lang,"SP/PC pairing was not initialized");}
     }
     const current=await page.evaluate(()=>document.documentElement.lang);
     if(current!==lang)issue("language",route,lang,current);
     await measure(page,route,390,lang);
   }
   await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route("**/api/community?**",r=>{
   const v=new URL(r.request().url()).searchParams.get("view");
   return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
     works:[],unavailableReason:null
   })});
 });
 await loadPage(page,"/community/");
 for(const view of ["latest","overall","daily","weekly","monthly","yearly"]){
   await page.locator('[data-community-tab="'+view+'"]').click();
   await page.waitForFunction(()=>document.querySelector("[data-community-gallery]")?.getAttribute("aria-busy")==="false");
   const message=await page.locator("[data-community-gallery]").innerText();
   if(!message.trim())issue("community",view,"blank_state");
   if(await page.locator("[data-community-gallery] .community-card").count())issue("community",view,"fabricated_card");
 }
 await page.close();
} catch(e){issue("audit_fatal",e.stack||e.message)}
finally{await browser.close();}
await fs.writeFile(path.join(dir,"report.json"),JSON.stringify({time:new Date().toISOString(),issues,metrics},null,2));
console.log(JSON.stringify({pages:pages.length,widths:widths.length,langs:languages.length,checks:metrics.length,issues:issues.slice(0,35)},null,2));
if(issues.length)process.exit(1);
