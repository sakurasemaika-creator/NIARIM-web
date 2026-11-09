/**
 * Production Flutter screenshots paired by screen AND palette: SP 320x569 and PC
 * 1440x900. No facsimile, desktop browser resizing, or SP image stretching.
 */
(function(){
"use strict";
const root="/assets/images/app-captures/";
const accent={canvas:"#3AA6FF",timeline:"#2E9B4F",layers:"#FF8A3D","onion-skin":"#E85D75",
"audio-editor":"#4B8FDC","save-tree":"#C15F35",export:"#0086C9",workspace:"#E65F2B",widget:"#00796B"};
const variantFor=(name)=>{const m=String(name).match(/-v([234])$/);return m?"-v"+m[1]:"";};
const canonical=(name)=>String(name||"").replace(/-v[234]$/,"");
function desktopPicture(name, variant, alt){
 const p=document.createElement("picture");
 const base=root+"pc-"+name+variant;
 const source=document.createElement("source");
 source.type="image/avif";source.srcset=base+".avif";
 const img=document.createElement("img");
 img.src=base+".webp";img.alt=alt;img.width=1440;img.height=900;
 img.loading="lazy";img.decoding="async";
 p.append(source,img);return p;
}
function label(text){const s=document.createElement("span");s.className="nr-device-label";s.textContent=text;return s;}
function pairFigure(figure){
 if (figure.closest(".nr-hero")||figure.closest(".nr-duo"))return;
 const raw=figure.getAttribute("data-capture"),name=canonical(raw);
 if(!Object.hasOwn(accent,name))return;
 const duo=document.createElement("div");duo.className="nr-duo";
 duo.dataset.pairedCapture=name;
 figure.before(duo);
 duo.append(figure);
 const pc=document.createElement("figure");
 pc.className="nr-shot nr-shot--pc";
 pc.setAttribute("data-capture-pc",name);
 pc.style.setProperty("--capture-accent",accent[name]);
 pc.append(desktopPicture(name,variantFor(raw),"NIARIM PC版 "+name+" 画面"));
 duo.append(pc);
 const mobile=label("SMARTPHONE");const desktop=label("PC / DEX");
 mobile.classList.add("nr-device-label--sp");desktop.classList.add("nr-device-label--pc");
 duo.prepend(mobile);duo.append(desktop);
}
function pairFeature(diagram){
 if(diagram.closest(".nr-feature-duo"))return;
 const raw=diagram.getAttribute("data-capture-theme"),name=canonical(raw);
 if(!Object.hasOwn(accent,name))return;
 const duo=document.createElement("div");duo.className="nr-feature-duo";
 duo.dataset.pairedCapture=name;
 diagram.before(duo);duo.append(diagram);
 const pc=document.createElement("div");
 pc.className="feature-diagram feature-diagram--real feature-diagram--pc";
 pc.setAttribute("data-capture-theme",name);
 pc.style.setProperty("--capture-frame",accent[name]);
 const picture=desktopPicture(name,variantFor(raw),"NIARIM PC版 "+name+" 画面");
 picture.className="real-app-capture";
 pc.append(picture);
 duo.append(pc);
}
function pairScroller(picture){
 if(picture.closest(".nr-feature-duo")||picture.closest(".nr-duo")||picture.closest(".feature-diagram--real"))return;
 const img=picture.querySelector("img");
 if(!img)return;
 const match=(img.getAttribute("src")||"").match(/\/(canvas|layers|onion-skin|timeline|audio-editor|save-tree|export|workspace|widget)(-v[234])?\.(?:webp|avif)/);
 if(!match)return;
 const duo=document.createElement("div");duo.className="nr-feature-duo nr-scroller-duo";
 picture.before(duo);duo.append(picture);
 const pc=desktopPicture(match[1],match[2]||"","NIARIM PC版 "+match[1]+" 画面");
 pc.className="real-app-capture real-app-capture--pc";
 duo.append(pc);
}
function pair(){
 document.querySelectorAll("figure.nr-shot[data-capture]").forEach(pairFigure);
 document.querySelectorAll(".feature-diagram--real[data-capture-theme]:not(.feature-diagram--pc)").forEach(pairFeature);
 document.querySelectorAll(".screenshot-card picture.real-app-capture").forEach(pairScroller);
 window.NIARIM_applyCapturePalette?.(document.querySelector(".nr-palette-button.is-selected")?.dataset.variant||1);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",pair,{once:true});else pair();
window.addEventListener("load",pair,{once:true});
})();
