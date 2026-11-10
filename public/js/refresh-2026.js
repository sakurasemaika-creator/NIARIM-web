/* Same 9 x 4 accent matrix as NIARIM/test/app_web_reference_capture_test_v2.dart. */
(function(){
"use strict";
var colors=[
["#3AA6FF","#F2B90F","#B15CFF","#10B981"],
["#FF8A3D","#5C6BFF","#D8A0A6","#8DA9C4"],
["#E85D75","#00A6A6","#CA7A18","#7A6FF0"],
["#2E9B4F","#D45AA6","#567D46","#EF6C57"],
["#4B8FDC","#A46B3C","#8E62B6","#2F9D8F"],
["#C15F35","#6678B8","#B36B86","#6F8F3D"],
["#0086C9","#E08B00","#9A4FD0","#00A36C"],
["#E65F2B","#485CC7","#C76C8A","#607D2D"],
["#00796B","#AD5A00","#6D5BD0","#B04A72"]
];
var names=["canvas","layers","onion-skin","timeline","audio-editor","save-tree","export","workspace","widget"];
/* The screenshot palette is a single source of truth for both renderings and
   their frames, including real-app captures inserted after DOMContentLoaded. */
function apply(variant){
 const n=Math.max(1,Math.min(4,Number(variant)||1));
 const suffix=n===1?"":"-v"+n;
 const revision="aba41189";
 document.querySelectorAll("[data-capture], [data-capture-pc], .feature-diagram--real[data-capture-theme]").forEach(function(figure){
   const isPc=figure.hasAttribute("data-capture-pc") || figure.classList.contains("feature-diagram--pc");
   const raw=figure.getAttribute("data-capture-pc") ||
     figure.getAttribute("data-capture") || figure.getAttribute("data-capture-theme") || "";
   const name=raw.replace(/-v[234]$/,"");
   const i=names.indexOf(name);
   if(i<0)return;
   const color=colors[i][n-1];
   // Some legacy frames use --capture-frame, modern shots --capture-accent.
   // Setting both prevents a border/screen palette mismatch on any page.
   figure.style.setProperty("--capture-accent",color);
   figure.style.setProperty("--capture-frame",color);
   const base="/assets/images/app-captures/"+(isPc?"pc-":"")+name+suffix;
   const source=figure.querySelector('source[type="image/avif"]');
   const img=figure.querySelector("img");
   if(source)source.srcset=base+".avif?v="+revision;
   if(img)img.src=base+".webp?v="+revision;
 });
 document.querySelectorAll(".nr-palette-button").forEach(function(btn){
   const selected=Number(btn.dataset.variant)===n;
   btn.classList.toggle("is-selected",selected);
   btn.setAttribute("aria-pressed",String(selected));
 });
}
window.NIARIM_applyCapturePalette=apply;
document.addEventListener("DOMContentLoaded",function(){
 document.querySelectorAll(".nr-palette-button").forEach(function(btn){
   btn.addEventListener("click",function(){apply(btn.dataset.variant)});
 });
 apply(1);
});
})();
