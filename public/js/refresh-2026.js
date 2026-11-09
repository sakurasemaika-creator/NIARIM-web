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
function apply(variant){
 var n=Math.max(1,Math.min(4,Number(variant)||1)),tail=n===1?"":"-v"+n;
 document.querySelectorAll("[data-capture], [data-capture-pc]").forEach(function(figure){
   var isPc=figure.hasAttribute("data-capture-pc");
   var name=figure.getAttribute(isPc?"data-capture-pc":"data-capture"),i=names.indexOf(name);if(i<0)return;
   figure.style.setProperty("--capture-accent",colors[i][n-1]);
   var base="/assets/images/app-captures/"+(isPc?"pc-":"")+name+tail;
   var source=figure.querySelector("source"),img=figure.querySelector("img");
   if(source)source.srcset=base+".avif";
   if(img)img.src=base+".webp";
 });
 document.querySelectorAll(".nr-palette-button").forEach(function(btn){
   var selected=Number(btn.dataset.variant)===n;
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
