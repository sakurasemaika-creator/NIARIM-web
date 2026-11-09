/**
 * Safe release-state toggle. Default is NOT RELEASED.
 * Set window.NIARIM_PLAY_STORE_URL to the verified official Play Store
 * listing after publication; only Google Play app-details links are accepted.
 */
(function(){
"use strict";
function init(){
 const button=document.querySelector("[data-play-store-button]");
 if(!button)return;
 const candidate=window.NIARIM_PLAY_STORE_URL;
 if(typeof candidate!=="string")return;
 let url;try{url=new URL(candidate)}catch(_){return}
 if(url.protocol!=="https:"||url.hostname!=="play.google.com"||url.pathname!=="/store/apps/details"||!url.searchParams.get("id"))return;
 const link=document.createElement("a");
 link.className=button.className+" is-live";
 link.href=url.href;link.target="_blank";link.rel="noopener noreferrer";
 link.innerHTML=button.innerHTML;
 link.querySelector("strong").textContent="Google Playで入手";
 button.replaceWith(link);
 const note=document.querySelector("#nr-store-notice");
 if(note)note.textContent="Google Playにて配信中";
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
