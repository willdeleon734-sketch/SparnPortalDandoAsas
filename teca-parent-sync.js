/* TECA V6 — sistema de design global controlado pelo index pai */
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
    if(own){try{config=JSON.parse(own.textContent);return config}catch(e){}}
    try{
      const r=await fetch("index.html?teca_config=6",{cache:"no-store"});
      if(r.ok){
        const t=await r.text();
        config=configFromIndexDoc(new DOMParser().parseFromString(t,"text/html"));
      }
    }catch(e){}
    return config||{
      appearance:{storageKey:FALLBACK_KEY,default:"amarelo",themes:{
        amarelo:{background:"#f8df85",surface:"rgba(255,239,160,.58)",surfaceStrong:"rgba(255,235,137,.78)",card:"rgba(255,245,190,.66)",text:"#10283a",muted:"#355263",border:"rgba(83,68,18,.16)",shadow:"0 16px 42px rgba(83,62,0,.12)",accent:"#008fa9",accent2:"#9b356f",isDark:false}
      }},
      courseAppearance:{blur:"16px",radius:"22px",moduleRadius:"16px"}
    };
  }

  function themeKey(c){return c?.appearance?.storageKey||FALLBACK_KEY}
  function savedTheme(c){
    const def=c?.appearance?.default||"amarelo";
    const value=localStorage.getItem(themeKey(c));
    return c?.appearance?.themes?.[value]?value:def;
  }
  function setVar(name,value){if(value!==undefined&&value!==null)document.documentElement.style.setProperty(name,String(value))}
  function applyTheme(c,name){
    const themes=c?.appearance?.themes||{};
    const fallbackName=c?.appearance?.default||"amarelo";
    const actual=themes[name]?name:fallbackName;
    const t=themes[actual]||{};
    const ca=c?.courseAppearance||{};
    const root=document.documentElement;
    const b=document.body;
    root.dataset.tecaTheme=actual;
    root.dataset.tecaMode=t.isDark?"dark":"light";

    setVar("--teca-bg",t.background||"#f8df85");
    setVar("--teca-bg-image",t.image?`url("${t.image}")`:"none");
    setVar("--teca-surface",t.surface||"rgba(255,249,215,.72)");
    setVar("--teca-surface-strong",t.surfaceStrong||t.surface||"rgba(255,249,215,.86)");
    setVar("--teca-card",t.card||t.surface||"rgba(255,249,215,.72)");
    setVar("--teca-text",t.text||"#10283a");
    setVar("--teca-ink",t.text||"#10283a");
    setVar("--teca-muted",t.muted||"#40596a");
    setVar("--teca-border",t.border||"rgba(16,40,58,.16)");
    setVar("--teca-shadow",t.shadow||"0 16px 42px rgba(0,0,0,.12)");
    setVar("--teca-accent",t.accent||"#00aeca");
    setVar("--teca-accent-2",t.accent2||"#9c6cff");
    setVar("--teca-blur",ca.blur||"16px");
    setVar("--teca-radius",ca.radius||"22px");
    setVar("--teca-module-radius",ca.moduleRadius||"16px");

    if(b){
      b.style.setProperty("background-color",t.background||"#f8df85","important");
      b.style.setProperty("background-image",t.image?`url("${t.image}")`:"none","important");
      b.style.setProperty("background-size",t.image?"cover":"auto","important");
      b.style.setProperty("background-position","center","important");
      b.style.setProperty("background-repeat","no-repeat","important");
      b.style.setProperty("background-attachment","fixed","important");
      b.style.setProperty("color",t.text||"#10283a","important");
    }
  }

  function applyIdentity(c){
    document.querySelectorAll("header .brand img,.teca-brand img").forEach(img=>{
      if(c.logo)img.src=c.logo;
      img.style.width=(c.logoSize?.width||42)+"px";
      img.style.height=(c.logoSize?.height||42)+"px";
      img.style.objectFit="contain";
    });
  }

  function currentCourse(){return location.pathname.split("/").pop()||"index.html"}
  function applyCourseAssets(c){
    const m=c?.courses?.[currentCourse()];
    if(!m)return;
    document.querySelectorAll("[data-teca-course-image]").forEach(img=>{
      const role=img.dataset.tecaCourseImage;
      if(m[role]){
        img.src=m[role]; img.hidden=false;
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
    panel.id="teca-top-theme-panel"; panel.hidden=true;
    const themes=c?.appearance?.themes||{};
    panel.innerHTML=`<div class="teca-theme-choices">${
      Object.entries(themes).map(([k,t])=>`<button type="button" data-theme="${k}">${t.label||k}</button>`).join("")
    }</div><div class="teca-theme-actions"><button type="button" id="teca-theme-save">💾 Salvar aparência</button></div>`;
    document.body.appendChild(panel);
    draftTheme=savedTheme(c);
    applyTheme(c,draftTheme);

    function pos(){
      const r=trigger.getBoundingClientRect();
      panel.style.top=(r.bottom+8)+"px";
      panel.style.left=Math.max(10,Math.min(innerWidth-panel.offsetWidth-10,r.right-panel.offsetWidth))+"px";
    }
    trigger.onclick=e=>{
      e.stopPropagation();panel.hidden=!panel.hidden;
      trigger.setAttribute("aria-expanded",String(!panel.hidden));
      if(!panel.hidden)pos();
    };
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
