/**
 * Public-only live community views. Same API paths as the production Flutter
 * CommunityApi. No fabricated cards, credentials or local ranking metrics.
 */
(function(){
  "use strict";
  const buttons = [...document.querySelectorAll("[data-community-tab]")];
  const gallery = document.querySelector("[data-community-gallery]");
  if (!gallery || !buttons.length) return;
  let current = buttons.find(b=>b.classList.contains("is-active"))?.dataset.communityTab || "latest";
  let state = {kind:"loading",works:[]};
  let requestCounter = 0;

  const labels = {
    ja: {
      loading:"公開作品を読み込んでいます。",
      empty:"現在表示できる公開作品はありません。公開後、作品が投稿されるとここに表示されます。",
      unavailable:"ランキングのデータを準備しています。しばらくしてから再度ご確認ください。",
      periodCount:"期間内ブックマーク",
      error:"作品データを取得できませんでした。時間をおいて再度ご確認ください。",
      hidden:"この作品は非公開になりました。",
      count:"ブックマーク",
      title:"作品をYouTubeで開く"
    },
    en: {
      loading:"Loading published works...",
      empty:"No published works are available yet. They will appear here after release.",
      unavailable:"This ranking is not available yet. Please try again later.",
      periodCount:"Bookmarks this period",
      error:"Couldn't load published works. Please try again later.",
      hidden:"This work is no longer public.",
      count:"Bookmarks",title:"Open on YouTube"
    },
    "zh-Hans": {hidden:"该作品已设为私密。",periodCount:"本期收藏",loading:"正在读取公开作品……",empty:"暂无可显示的公开作品，发布后将自动出现。",unavailable:"应用尚未提供该期间的排行，请查看累计或最新。",error:"作品加载失败，请稍后重试。",count:"收藏",title:"在 YouTube 打开"},
    "zh-Hant": {hidden:"這部作品已設為私人。",periodCount:"本期書籤",loading:"正在讀取公開作品……",empty:"目前沒有公開作品，發布後將自動顯示。",unavailable:"應用程式尚未提供這段期間的排行，請查看累計或最新。",error:"作品載入失敗，請稍後再試。",count:"書籤",title:"在 YouTube 開啟"},
    ko: {hidden:"이 작품은 비공개로 전환되었습니다.",periodCount:"기간 내 북마크",loading:"공개 작품을 불러오는 중...",empty:"아직 공개된 작품이 없습니다. 출시 후 이곳에 표시됩니다.",unavailable:"이 기간의 순위는 아직 제공되지 않습니다. 누적 또는 최신을 확인하세요.",error:"작품을 불러오지 못했습니다. 나중에 다시 시도하세요.",count:"북마크",title:"YouTube에서 열기"},
    fr: {hidden:"Cette œuvre n’est plus publique.",periodCount:"Favoris de la période",loading:"Chargement des œuvres publiques…",empty:"Aucune œuvre publique pour le moment. Elles apparaîtront ici après le lancement.",unavailable:"Ce classement périodique n'est pas encore disponible. Consultez les nouveautés ou le classement général.",error:"Impossible de charger les œuvres. Réessayez plus tard.",count:"Favoris",title:"Ouvrir sur YouTube"},
    es: {hidden:"Esta obra ya no es pública.",periodCount:"Marcadores del período",loading:"Cargando obras públicas…",empty:"Aún no hay obras públicas. Aparecerán aquí después del lanzamiento.",unavailable:"Este ranking por período aún no está disponible. Consulta Novedades o Acumulado.",error:"No se pudieron cargar las obras. Inténtalo más tarde.",count:"Marcadores",title:"Abrir en YouTube"}
  };
  function copy(){
    const lang=document.documentElement.lang;
    return labels[lang] || labels.ja;
  }
  function clear(){gallery.replaceChildren()}
  function message(kind){
    const p=document.createElement("p");
    p.className="community-live-message";
    p.textContent=copy()[kind] || copy().error;
    clear();gallery.append(p);
  }
  async function getVisibility(ids) {
    if (!ids.length) return {};
    const response=await fetch("/api/community?ids="+encodeURIComponent(ids.join(",")),{
      headers:{"accept":"application/json"},credentials:"omit",cache:"no-store"
    });
    if (!response.ok) throw Error("Visibility status unavailable");
    const reply=await response.json();
    if (!reply || typeof reply.visibility!=="object" ||
        reply.visibility===null) throw Error("Invalid visibility reply");
    return reply.visibility;
  }
  function card(work, index, ranked){
    const hidden=work.isUnavailable===true;
    const a=document.createElement(hidden?"div":"a");
    a.className="community-card community-card--live"+
      (hidden?" community-card--unavailable":"");
    if(hidden){
      a.setAttribute("aria-disabled","true");
    }else{
      a.href=work.youtubeUrl;
      a.target="_blank";a.rel="noopener noreferrer";
      a.setAttribute("aria-label",copy().title+": "+work.title);
      a.addEventListener("click",async event=>{
        // Guard privacy even between a ranking fetch and the actual click.
        event.preventDefault();
        const requestAtClick=requestCounter;
        try{
          const visible=await getVisibility([work.workId]);
          if(requestAtClick!==requestCounter)return;
          if(visible[work.workId]!==true){select(current);return;}
          window.location.assign(work.youtubeUrl);
        }catch(_){
          // Fail closed: never open a stale item when status is unknown.
        }
      });
    }
    const thumb=document.createElement("div");thumb.className="thumb";
    if(hidden){
      const fallback=document.createElement("span");
      fallback.className="community-thumb-fallback";
      fallback.setAttribute("aria-hidden","true");
      fallback.textContent="⊘";
      thumb.append(fallback);
    }else{
      const image=document.createElement("img");
      image.loading="lazy";image.decoding="async";image.alt="";
      image.src=work.thumbnailUrl;
      image.addEventListener("error",()=>{
        image.remove();
        const fallback=document.createElement("span");
        fallback.className="community-thumb-fallback";fallback.textContent="✦";
        thumb.append(fallback);
      },{once:true});
      thumb.append(image);
    }
    if(ranked){
      const badge=document.createElement("span");badge.className="rank-badge";
      badge.textContent=String(index+1);thumb.append(badge);
    }
    const meta=document.createElement("div");meta.className="meta";
    const h=document.createElement("h3");
    h.textContent=hidden?copy().hidden:work.title;
    meta.append(h);
    if(!hidden){
      const author=document.createElement("p");
      author.textContent=work.channelName || "NIARIM";
      const count=document.createElement("span");count.className="community-count";
      const period=["daily","weekly","monthly","yearly"].includes(current);
      const score=period && Number.isSafeInteger(work.periodBookmarkCount)
        ? work.periodBookmarkCount : null;
      count.textContent=(score===null?copy().count:copy().periodCount)+
        ": "+String(score===null?work.bookmarkCount:score);
      meta.append(author,count);
    }
    a.append(thumb,meta);
    return a;
  }
  function render(){
    gallery.setAttribute("aria-busy",String(state.kind==="loading"));
    if(state.kind!=="ready"){message(state.kind);return;}
    clear();
    state.works.forEach((w,i)=>gallery.append(card(w,i,current!=="latest")));
    if(!state.works.length) message("empty");
  }
  function select(view){
    current=view;
    buttons.forEach(b=>{
      const pressed=b.dataset.communityTab===view;
      b.classList.toggle("is-active",pressed);
      b.setAttribute("aria-pressed",String(pressed));
    });
    const thisRequest=++requestCounter;
    state={kind:"loading",works:[]};render();
    fetch("/api/community?view="+encodeURIComponent(view),{
      headers:{"accept":"application/json"},
      credentials:"omit",
      cache:"no-store"
    }).then(async res=>{
      if(!res.ok) throw Error("Community API status "+res.status);
      return res.json();
    }).then(body=>{
      if(thisRequest!==requestCounter)return;
      if(body.unavailableReason==="BOOKMARK_PERIOD_NOT_IMPLEMENTED"){
        state={kind:"unavailable",works:[]};
      } else if(Array.isArray(body.works)){
        state={kind:"ready",works:body.works.filter(work=>
          work && work.isUnavailable!==true && work.isNiarimPublished!==false)};
      } else {
        state={kind:"error",works:[]};
      }
      render();
    }).catch(()=>{
      if(thisRequest!==requestCounter)return;
      state={kind:"error",works:[]};render();
    });
  }
  buttons.forEach(button=>button.addEventListener("click",()=>select(button.dataset.communityTab)));
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)select(current);
  });
  document.addEventListener("niarim:langchange",render);
  select(current);
})();
