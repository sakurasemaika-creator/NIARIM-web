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
    const imageDimensions=await page.locator(".nr-hero-showcase").evaluate(el=>({
      sp:[el.querySelector("[data-capture='canvas'] img")?.naturalWidth,el.querySelector("[data-capture='canvas'] img")?.naturalHeight],
      pc:[el.querySelector("[data-capture-pc='canvas'] img")?.naturalWidth,el.querySelector("[data-capture-pc='canvas'] img")?.naturalHeight]
    }));
    if(imageDimensions.sp[0]!==640||imageDimensions.sp[1]!==1138)log("SP screenshot native size",width,JSON.stringify(imageDimensions.sp));
    if(imageDimensions.pc[0]!==1440||imageDimensions.pc[1]!==900)log("PC screenshot native size",width,JSON.stringify(imageDimensions.pc));
    const oldScripts=await page.locator('script[src*="home-hero-showcase"],script[src*="popup-mock"],script[src*="user-request-fixes"]').count();
    if(oldScripts){const sources=await page.locator('script[src*="home-hero-showcase"],script[src*="popup-mock"],script[src*="user-request-fixes"]').evaluateAll(ns=>ns.map(n=>n.getAttribute("src")));log("Obsolete mock runtime loaded on landing",width,JSON.stringify(sources));}
    const stagePC = await page.locator(".nr-hero-showcase [data-capture-pc='canvas']").count();
    if(stagePC!==1)log("PC hero capture missing",width);
    const missingPair=await page.evaluate(()=>[...document.querySelectorAll("figure.nr-shot[data-capture]:not(.nr-hero-showcase *)")].filter(f=>!f.closest(".nr-duo")).length);
    if(missingPair)log("Unpaired mobile captures",width,missingPair);
    const count = await page.locator(".nr-gallery-item").count();
    if(count!==9) log("Gallery count",width,count);
    if(width===390 || width===1440){
      // Full-page snapshots do not naturally scroll through lazy screenshots.
      // Decode all real SP/PC captures first so visual evidence is complete,
      // not a grid of border-only rectangles below the initial viewport.
      const missing = await page.locator('img[src*="/assets/images/app-captures/"]').evaluateAll(async (images) => {
        await Promise.all(images.map(async (img) => {
          img.loading = "eager";
          try { await img.decode(); } catch (_) { /* checked below */ }
        }));
        return images.filter(img => !img.naturalWidth).map(img => img.currentSrc || img.src);
      });
      if(missing.length) log("Unloaded screenshots",width,JSON.stringify(missing));
      await fs.mkdir("artifacts/refresh-2026",{recursive:true});
      await page.screenshot({path:"artifacts/refresh-2026/home-"+width+".png",fullPage:true,animations:"disabled"});
    }
    if(width===390){
      const fonts = await page.evaluate(() => ({
        heading: getComputedStyle(document.querySelector("#nr-statement-title")).fontFamily,
        body: getComputedStyle(document.querySelector(".nr-hero-lead")).fontFamily
      }));
      if(!fonts.heading.includes("Kuramubon"))log("Brand display font missing",JSON.stringify(fonts));
      if(!fonts.body.includes("HakkouMincho"))log("Brand body font missing",JSON.stringify(fonts));
      const store = page.locator("[data-play-store-button]");
      if(await store.count()){
        if(!(await store.isDisabled()))log("Pre-release Play Store CTA must not imply download");
      }
    }
    if(width===390) {
      for(const variant of [1,2,3,4,1]){
        await page.locator(".nr-palette-button[data-variant='"+variant+"']").click();
        const state=await page.locator(".nr-gallery-item").first().evaluate(el=>({
          src:el.querySelector("img").getAttribute("src"),
          color:el.querySelector(".nr-shot").style.getPropertyValue("--capture-accent")
        }));
        const expectedTail=variant===1?"":"-v"+variant;
        if(!new URL(state.src,base).pathname.endsWith("canvas"+expectedTail+".webp"))log("Variant switch",variant,JSON.stringify(state));
        const expectedColors=["#3AA6FF","#F2B90F","#B15CFF","#10B981"];
        if(state.color.toUpperCase()!==expectedColors[variant-1])log("Theme/frame mismatch",variant,state.color);
        const desktop=await page.locator(".nr-gallery-item").first().locator("[data-capture-pc]").evaluate(el=>({
          src:el.querySelector("img")?.getAttribute("src"),
          accent:el.style.getPropertyValue("--capture-accent")
        }));
        if(!new URL(desktop.src,base).pathname.endsWith("pc-canvas"+expectedTail+".webp"))log("PC gallery variant mismatch",variant,desktop.src);
        if(desktop.accent.toUpperCase()!==expectedColors[variant-1])log("PC/SP accent mismatch",variant,desktop.accent);

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
    const status=await page.evaluate(() => {
      const heroHeading=document.querySelector("#nr-hero-title");
      const heroLogo=heroHeading?.querySelector("img");
      const headerLogo=document.querySelector("header .brand-title");
      // The post-launch hero uses the exact header logo image rather than text.
      // Its accessible name comes from the image alt, not h1.textContent.
      return {
        lang:document.documentElement.lang,
        title:document.title,
        heroName:(heroHeading?.textContent?.trim() || heroLogo?.getAttribute("alt")?.trim() || ""),
        heroLogoSrc:heroLogo?.getAttribute("src"),
        headerLogoSrc:headerLogo?.getAttribute("src"),
        missing:[...document.querySelectorAll('[data-i18n^="refresh."],[data-i18n-html^="refresh."]')].map(n=>n.getAttribute("data-i18n")||n.getAttribute("data-i18n-html")).filter(k=>!Object.hasOwn(window.NIARIM_I18N_DICT[document.documentElement.lang]||{},k))
      };
    });
    if(status.lang!==lang || !status.title || !status.heroName.includes("NIARIM") || !status.heroLogoSrc || status.heroLogoSrc!==status.headerLogoSrc || status.missing.length)log("Localization",lang,JSON.stringify(status));
    await page.goto(base+"/coins/?lang="+encodeURIComponent(lang),{waitUntil:"networkidle"});
    const localizedCoins=await page.evaluate(()=>{
      const language=document.documentElement.lang;
      const dict=window.NIARIM_I18N_DICT?.[language]||{};
      const main=document.querySelector(".coins-main");
      const keys=[...main.querySelectorAll("[data-i18n]")].map(el=>el.getAttribute("data-i18n"));
      return {
        language,
        missingKeys:keys.filter(key=>!Object.hasOwn(dict,key)),
        pricedCells:main.querySelectorAll(".coins-table--priced .coins-unit").length,
        unitLabels:[...main.querySelectorAll(".coins-table--priced .coins-unit")].filter(el=>!el.textContent.trim()).length,
        numericRewards:/\d[\d,]*\s*(?:COINS?|コイン|金币|金幣|코인|pièces|monedas)/i.test(main.querySelector("#earning")?.textContent||""),
        rawJapanese:language!=="ja"&&main.querySelector("[data-i18n='coins.earn']")?.textContent.trim()==="コインを集める",
        technical:/サーバー|SSV|安全性審査|実装済|未実装|本番交換|server validation|security review|backend|servidor|serveur|服务器|伺服器|서버/i.test(main.textContent)
      };
    });
    if(localizedCoins.language!==lang||localizedCoins.missingKeys.length||localizedCoins.pricedCells!==48||
       localizedCoins.unitLabels||localizedCoins.numericRewards||localizedCoins.rawJapanese||localizedCoins.technical){
      log("Coins visitor copy / localization",lang,JSON.stringify(localizedCoins));
    }
    await page.close();
  }
  const page=await browsers.newPage({viewport:{width:1280,height:960}});
  for(const [path,selector] of [["/features/",".nr-curated"],["/premium/",".nr-notice"],["/coins/",".coins-compare-table"],["/help/","#help-search-input"],["/community/",".community-banner"]]){
    page.on("pageerror",e=>log("Interior JS",path,e.message));
    const response=await page.goto(base+path,{waitUntil:"networkidle"});
    if(response?.status()!==200||!(await page.locator(selector).count()))log("Interior missing",path,selector);
  }
  await page.goto(base+"/features/",{waitUntil:"networkidle"});
  const featurePairs=await page.evaluate(()=>{
    const sp=[...document.querySelectorAll(".feature-diagram--real[data-capture-theme]:not(.feature-diagram--pc)")];
    const bad=sp.filter(x=>!x.closest(".nr-feature-duo")||!x.closest(".nr-feature-duo").querySelector(".feature-diagram--pc"));
    return {sp:sp.length,bad:bad.length};
  });
  if(featurePairs.sp!==9||featurePairs.bad)log("Feature PC pairing incomplete",JSON.stringify(featurePairs));
  // Check that the priced coin benefits page is actually usable, not just
  // advertised in landing-page copy, and that the cross-links work both ways.
  await page.goto(base+"/coins/",{waitUntil:"networkidle"});
  const coins=await page.evaluate(()=>{
    const rows=[...document.querySelectorAll("#benefits .coins-table:not(.coins-compare-table) tbody tr")];
    const comparison=[...document.querySelectorAll(".coins-compare-table tbody tr")];
    const prices=comparison.map(row=>({
      kind:row.getAttribute("data-compare"),
      single:Number(row.querySelector("[data-compare-single]")?.getAttribute("data-compare-single")),
      full:Number(row.querySelector("[data-compare-full]")?.getAttribute("data-compare-full")),
      saved:Number(row.querySelector("[data-compare-saving]")?.getAttribute("data-compare-saving"))
    }));
    return {
      benefitRows:rows.length,
      eachBenefitHasFourDurations:rows.every(row=>row.querySelectorAll("td").length===4),
      missionAccordions:document.querySelectorAll("#missions details.coins-accordion").length,
      loginMilestones:document.querySelectorAll("#coin-login-bonus .coins-milestone-grid li").length,
      missionGoalSections:document.querySelectorAll("#missions .coins-goal-group").length,
      loginAccordion:!!document.querySelector("#coin-login-bonus:not([open])"),
      hasPremiumLink:!!document.querySelector(".coins-conversion-panel a[href='/premium/']"),
      units:document.querySelectorAll("#benefits .coins-table--priced tbody .coins-unit").length,
      comparisonUnits:document.querySelectorAll(".coins-compare-table tbody .coins-unit").length,
      hasCurrencyLabel:/円|JPY|¥/.test(document.querySelector("#benefits .coins-table--priced caption")?.textContent||""),
      hasCoinCaption:/コイン/.test(document.querySelector("#benefits .coins-table--priced caption")?.textContent||""),
      hasCoinAmountHeading:/引き換えに必要なコイン数/.test(document.querySelector(".coins-list-title")?.textContent||""),
      earningShowsFixedRewards:/(?:[0-9０-９][,，0-9０-９]*\s*(?:枚|コイン|coins)|(?:コイン|coins)\s*[0-9０-９])/.test(document.querySelector("#earning")?.textContent||""),
      marketingExplainsInternals:/(?:サーバー|バックエンド|検証済み|未実装|API|内部処理)/.test(document.querySelector(".coins-main")?.textContent||""),
      prices
    };
  });
  const expectedCoinComparison=[
    {kind:"hour",single:1010,full:500,saved:510},
    {kind:"day",single:4280,full:2500,saved:1780},
    {kind:"week",single:32200,full:18000,saved:14200},
    {kind:"month",single:119000,full:55000,saved:64000}
  ];
  if(coins.benefitRows!==12||!coins.eachBenefitHasFourDurations||
     coins.missionAccordions!==4||coins.loginMilestones!==54||coins.missionGoalSections!==13||!coins.loginAccordion||!coins.hasPremiumLink||
     coins.units!==48||coins.comparisonUnits!==12||coins.hasCurrencyLabel||!coins.hasCoinCaption||
     !coins.hasCoinAmountHeading||coins.earningShowsFixedRewards||coins.marketingExplainsInternals||
     JSON.stringify(coins.prices)!==JSON.stringify(expectedCoinComparison)){
    log("Coin catalog / accordion / pricing contract",JSON.stringify(coins));
  }
  await page.locator("#coin-login-bonus summary").click();
  if(!(await page.locator("#coin-login-bonus").evaluate(el=>el.open)))log("Login reward accordion does not expand");
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(base+"/coins/",{waitUntil:"networkidle"});
    await page.evaluate(()=>document.fonts.ready);
    const layout=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,win:innerWidth}));
    if(layout.doc>layout.win+2)log("Coins horizontal overflow",width,JSON.stringify(layout));
    await page.screenshot({path:"artifacts/refresh-2026/coins-"+width+".png",fullPage:true,animations:"disabled"});
  }
  await page.goto(base+"/premium/",{waitUntil:"networkidle"});
  if(!(await page.locator(".premium-coin-panel a[href='/coins/']").count()))log("Premium to coins cross-link missing");

  // The newly linked stylesheet must really style the Premium -> Coins panel.
  const premiumContrast=await page.evaluate(()=>{
    const panel=document.querySelector(".premium-coin-panel");
    const heading=panel?.querySelector("h2");
    const panelBg=panel&&getComputedStyle(panel).backgroundColor;
    const headingFg=heading&&getComputedStyle(heading).color;
    function rgb(value){return (value.match(/[0-9.]+/g)||[]).slice(0,3).map(Number)}
    function lum(value){const a=rgb(value).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]}
    const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    return {hasStylesheet:!!document.querySelector('link[href*="/css/pages/coins.css"]'),panelBg,headingFg,contrast:headingFg&&panelBg?ratio(headingFg,panelBg):0};
  });
  if(!premiumContrast.hasStylesheet||premiumContrast.contrast<4.5)log("Premium coin panel contrast",JSON.stringify(premiumContrast));

  await page.goto(base+"/help/",{waitUntil:"networkidle"});
  const helpCards=await page.locator("[data-help-card]").count();
  if(helpCards!==79)log("Help must expose all 79 app topics",helpCards);
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
