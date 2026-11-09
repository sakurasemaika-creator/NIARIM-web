import test from "node:test";
import assert from "node:assert/strict";
import {handleCommunityFeed} from "../src/community-feed.js";

const env={NIARIM_PUBLIC_API_BASE_URL:"https://example.lambda-url.ap-northeast-1.on.aws/"};
const valid={
  workId:"dQw4w9WgXcQ",title:"Original animation",channelName:"Creator",
  thumbnailUrl:"https://unsafe.example.invalid/phish",
  youtubeUrl:"javascript:alert(1)",bookmarkCount:21,isNiarimPublished:true
};
test("latest uses app endpoint and excludes unsafe upstream URLs",async()=>{
 let endpoint="";
 const res=await handleCommunityFeed(new Request("https://test.example/api/community?view=latest"),env,async url=>{
   endpoint=url;
   return new Response(JSON.stringify({works:[valid]}),{status:200});
 });
 assert.equal(res.status,200);
 assert.match(endpoint,/\/works\/latest\?limit=9$/);
 const obj=await res.json();
 assert.equal(obj.works.length,1);
 assert.equal(obj.works[0].title,valid.title);
 assert.match(obj.works[0].youtubeUrl,/^https:\/\/www\.youtube\.com\/watch\?v=/);
 assert.match(obj.works[0].thumbnailUrl,/^https:\/\/i\.ytimg\.com\/vi\//);
});
test("overall ranking uses the same bookmarks endpoint as Flutter",async()=>{
 let endpoint="";
 const res=await handleCommunityFeed(new Request("https://test.example/api/community?view=overall"),env,async url=>{
   endpoint=url;return Response.json({works:[valid]});
 });
 assert.match(endpoint,/\/ranking\/bookmarks\?limit=9$/);
 assert.equal((await res.json()).works.length,1);
});
test("daily, weekly, monthly and yearly use the app's real period ranking",async()=>{
 for(const view of ["daily","weekly","monthly","yearly"]){
  let called="";
  const res=await handleCommunityFeed(new Request("https://test.example/api/community?view="+view),env,async url=>{
    called=url;return Response.json({period:view,metric:"periodBookmarks",windowId:"20261109",works:[
      {...valid,periodBookmarkCount:5}
    ]});
  });
  assert.match(called,new RegExp("/ranking/"+view+"\\?limit=9$"));
  const body=await res.json();
  assert.equal(body.unavailableReason,null);
  assert.equal(body.metric,"periodBookmarks");
  assert.equal(body.works[0].periodBookmarkCount,5);
  assert.equal(body.works[0].bookmarkCount,21);
 }
});
test("period not implemented is never substituted with made-up ranking",async()=>{
 const res=await handleCommunityFeed(new Request("https://test.example/api/community?view=daily"),env,async()=>Response.json({works:[],unavailableReason:"BOOKMARK_PERIOD_NOT_IMPLEMENTED"}));
 assert.deepEqual((await res.json()).works,[]);
});
test("invalid view and missing configuration fail closed",async()=>{
 const a=await handleCommunityFeed(new Request("https://test.example/api/community?view=made-up"),env,async()=>Response.json({works:[valid]}));
 const b=await handleCommunityFeed(new Request("https://test.example/api/community"),{},async()=>Response.json({works:[valid]}));
 assert.equal(a.status,400);assert.equal(b.status,503);
});
test("hidden/unavailable works never expose private titles",async()=>{
 const r=await handleCommunityFeed(new Request("https://test.example/api/community"),env,async()=>Response.json({works:[valid,{...valid,isNiarimPublished:false,title:"Private"},{...valid,isUnavailable:true,title:"Unavailable"}]}));
 const obj=await r.json();assert.equal(obj.works.length,1);assert.equal(obj.works[0].title,"Original animation");
});
