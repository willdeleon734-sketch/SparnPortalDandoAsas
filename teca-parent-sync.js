
(function(){
  const FALLBACK_KEY="teca_aparencia_v1";
  let config=null, draftTheme=null;

  function configFromIndexDoc(doc){
    const n=doc.getElementById("teca-global-config");
    if(!n) return null;
    try{return JSON.parse(n.textContent)}catch(e){return null}
  }
  async function getConfig(){
    if(config) return config;
    const own=document.getElementById("teca-global-config");
    if(own){ try{config=JSON.parse(own.textContent); return config}catch(e){} }
    try{
      const r=await fetch("index.html?teca_config=5",{cache:"no-store"});
      const t=await r.text();
      config=configFromIndexDoc(new DOMParser().parseFromString(t,"text/html"));
    }catch(e){}
    return config||{};
  }
  function themeKey(c){return c?.appearance?.storageKey||FALLBACK_KEY}
  function savedTheme(c){
    const key=themeKey(c), def=c?.appearance?.default||"amarelo";
    return localStorage.getItem(key)||def;
  }
  function applyTheme(c,name){
    const themes=c?.appearance?.themes||{};
    const t=themes[name]||themes[c?.appearance?.default]||{};
    if(!t) return;
    document.documentElement.dataset.tecaTheme=name;
    const b=document.body;
    if(!b)return;
    b.style.setProperty("background-color",t.background||"#f8df85","important");
    b.style.setProperty("background-image",t.image?`url("${t.image}")`:"none","important");
    b.style.setProperty("background-size",t.image?"cover":"auto","important");
    b.style.setProperty("background-position","center","important");
    b.style.setProperty("background-repeat","no-repeat","important");
    b.style.setProperty("background-attachment","fixed","important");
    document.documentElement.style.setProperty("--teca-glass",t.surface||"rgba(255,249,215,.72)");
    document.documentElement.style.setProperty("--teca-surface",t.surface||"rgba(255,249,215,.72)");
    document.documentElement.style.setProperty("--teca-ink",t.text||"#10283a");
    document.documentElement.style.setProperty("--teca-text",t.text||"#10283a");
    document.documentElement.style.setProperty("--teca-muted",t.muted||"#40596a");
  }
  function applyIdentity(c){
    document.querySelectorAll("header .brand img,.teca-brand img").forEach(img=>{
      if(c.logo) img.src=c.logo;
      img.style.width=(c.logoSize?.width||42)+"px";
      img.style.height=(c.logoSize?.height||42)+"px";
      img.style.objectFit="contain";
    });
  }
  function currentCourse(){
    return location.pathname.split("/").pop()||"index.html";
  }
  function applyCourseAssets(c){
    const fn=currentCourse(), m=c?.courses?.[fn];
    if(!m)return;
    document.querySelectorAll("[data-teca-course-image]").forEach(img=>{
      const role=img.dataset.tecaCourseImage;
      if(m[role]){
        img.src=m[role];
        img.hidden=false;
        img.onerror=()=>{img.hidden=true};
      }
    });
  }
  function buildPicker(c){
    const trigger=document.getElementById("teca-top-appearance");
    if(!trigger)return;
    let panel=document.getElementById("teca-top-theme-panel");
    if(panel)panel.remove();
    panel=document.createElement("div");
    panel.id="teca-top-theme-panel";
    panel.hidden=true;
    const themes=c?.appearance?.themes||{};
    const choices=Object.entries(themes).map(([k,t])=>
      `<button type="button" data-theme="${k}">${t.label||k}</button>`).join("");
    panel.innerHTML=`<div class="teca-theme-choices">${choices}</div>
      <div class="teca-theme-actions">
        <button type="button" id="teca-theme-save">💾 Salvar aparência</button>
      </div>`;
    document.body.appendChild(panel);
    draftTheme=savedTheme(c);
    applyTheme(c,draftTheme);
    function pos(){
      const r=trigger.getBoundingClientRect();
      panel.style.top=(r.bottom+8)+"px";
      panel.style.left=Math.max(10,Math.min(innerWidth-panel.offsetWidth-10,r.right-panel.offsetWidth))+"px";
    }
    trigger.onclick=(e)=>{e.stopPropagation();panel.hidden=!panel.hidden;trigger.setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden)pos()};
    panel.addEventListener("click",e=>{
      e.stopPropagation();
      const b=e.target.closest("[data-theme]");
      if(b){draftTheme=b.dataset.theme;applyTheme(c,draftTheme);return}
      if(e.target.closest("#teca-theme-save")){
        localStorage.setItem(themeKey(c),draftTheme||c.appearance.default);
        applyTheme(c,draftTheme||c.appearance.default);
        panel.hidden=true;trigger.setAttribute("aria-expanded","false");
        trigger.textContent="✓ Aparência salva";
        setTimeout(()=>trigger.textContent="🎨 Aparência",1300);
      }
    });
    document.addEventListener("click",()=>{panel.hidden=true;trigger.setAttribute("aria-expanded","false")});
    addEventListener("resize",()=>{if(!panel.hidden)pos()});
  }
  async function boot(){
    const c=await getConfig();
    applyIdentity(c);
    applyTheme(c,savedTheme(c));
    applyCourseAssets(c);
    buildPicker(c);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  addEventListener("storage",async e=>{
    const c=await getConfig();
    if(e.key===themeKey(c))applyTheme(c,e.newValue||c.appearance.default);
  });
})();
