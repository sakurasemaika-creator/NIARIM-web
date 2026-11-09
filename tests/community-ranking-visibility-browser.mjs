import {chromium} from "playwright";
import assert from "node:assert/strict";

const base=process.env.AUDIT_BASE_URL||"http://127.0.0.1:8787";
const ids=["aaaaaaaaaaa","bbbbbbbbbbb","ccccccccccc"];
const available=new Map([[ids[0],true],[ids[1],false],[ids[2],true]]);
let checks=0;
let rankingReads=0;
const app=await chromium.launch({headless:true});
try{
 const page=await app.newPage({viewport:{width:390,height:844},locale:"ja-JP"});
 await page.route("**/api/community?**",async route=>{
   const query=new URL(route.request().url()).searchParams;
   if(query.has("ids")){
     checks++;
     const status=Object.fromEntries((query.get("ids")||"").split(",")
       .map(id=>[id,available.get(id)===true]));
     return route.fulfill({status:200,contentType:"application/json",
       body:JSON.stringify({visibility:status})});
   }
   const view=query.get("view")||"latest";
   if(view==="daily"){
     rankingReads++;
     return route.fulfill({status:200,contentType:"application/json",
       body:JSON.stringify({metric:"periodBookmarks",works:ids.map((id,i)=>({
         workId:id,title:"Secret artwork "+(i+1),channelName:"Creator "+(i+1),
         bookmarkCount:100-i,periodBookmarkCount:10-i,
         thumbnailUrl:"https://i.ytimg.com/vi/"+id+"/hqdefault.jpg",
         youtubeUrl:"https://www.youtube.com/watch?v="+id,
       }))})});
   }
   return route.fulfill({status:200,contentType:"application/json",
     body:JSON.stringify({works:[],unavailableReason:null})});
 });
 await page.route("https://i.ytimg.com/**",route=>route.fulfill({status:404,body:""}));
 await page.goto(base+"/community/?lang=ja",{waitUntil:"domcontentloaded"});
 await page.locator('[data-community-tab="daily"]').click();
 await page.waitForFunction(()=>document.querySelectorAll(
   "[data-community-gallery] .community-card").length===3);
 await page.waitForFunction(()=>document.querySelectorAll(
   "[data-community-gallery] .community-card--unavailable").length===1);
 assert.equal(await page.locator(".community-card").count(),3);
 assert.deepEqual(await page.locator(".community-card .rank-badge").allTextContents(),["1","2","3"]);
 const hidden=page.locator(".community-card").nth(1);
 assert.equal(await hidden.evaluate(el=>el.tagName),"DIV");
 assert.equal(await hidden.getAttribute("aria-disabled"),"true");
 assert.equal(await hidden.locator("img,a,[href]").count(),0);
 assert.ok(!(await hidden.innerText()).includes("Secret artwork 2"));
 assert.ok(!(await hidden.innerText()).includes("Creator 2"));
 assert.ok(!(await hidden.innerText()).includes("100"));
 assert.equal(await page.locator(".community-card").nth(2).evaluate(el=>el.tagName),"A");
 // The HTML snapshot does not re-rank when another already-visible work
 // becomes private after the initial ranking fetch.
 available.set(ids[0],false);
 await page.evaluate(()=>document.dispatchEvent(new Event("visibilitychange")));
 await page.waitForFunction(()=>document.querySelectorAll(
   "[data-community-gallery] .community-card--unavailable").length===2);
 assert.equal(await page.locator(".community-card").nth(0).evaluate(el=>el.tagName),"DIV");
 assert.equal(await page.locator(".community-card").nth(1).evaluate(el=>el.tagName),"DIV");
 assert.deepEqual(await page.locator(".community-card .rank-badge").allTextContents(),["1","2","3"]);
 assert.equal(await page.locator(".community-card").nth(0).locator("img,a,[href]").count(),0);
 assert.ok(!(await page.locator(".community-card").nth(0).innerText()).includes("Secret artwork 1"));
 // Re-fetch is a NEW ranking snapshot; a returned public entry may appear.
 available.set(ids[0],true);
 await page.locator('[data-community-tab="daily"]').click();
 await page.waitForFunction(()=>document.querySelectorAll(
   "[data-community-gallery] .community-card--unavailable").length===1);
 assert.equal(await page.locator(".community-card").nth(0).evaluate(el=>el.tagName),"A");
 assert.deepEqual(await page.locator(".community-card .rank-badge").allTextContents(),["1","2","3"]);
 assert.ok(checks>=3);
 assert.equal(rankingReads,2);
 console.log("Community ranking stability and privacy browser checks passed",{
   rankingReads,checks,ranks:3
 });
}finally{await app.close();}
