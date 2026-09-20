
(function(){
  const KEY="teca_aparencia_v1";
  const valid=["cenario","amarelo","azul","menta"];
  function current(){
    const v=localStorage.getItem(KEY);
    return valid.includes(v)?v:"amarelo";
  }
  function setTheme(v){
    if(!valid.includes(v)) v="amarelo";
    document.documentElement.setAttribute("data-teca-theme",v);
    localStorage.setItem(KEY,v);
    document.querySelectorAll(".teca-theme-option").forEach(b=>{
      b.setAttribute("aria-checked",String(b.dataset.theme===v));
    });
  }
  // Apply immediately to minimize flash.
  setTheme(current());

  function build(){
    if(document.querySelector(".teca-appearance")) return;
    const box=document.createElement("div");
    box.className="teca-appearance";
    box.innerHTML=`
      <button class="teca-appearance-toggle" type="button" aria-expanded="false">🎨 Aparência</button>
      <div class="teca-appearance-menu" role="radiogroup" aria-label="Escolha a aparência">
        <div class="teca-appearance-title">Fundo da interface</div>
        <button class="teca-theme-option" type="button" role="radio" data-theme="cenario">
          <span class="teca-swatch cenario"></span><span><b>Cenário TECA</b><br><small>Imagem + interface de vidro</small></span><span class="teca-check">✓</span>
        </button>
        <button class="teca-theme-option" type="button" role="radio" data-theme="amarelo">
          <span class="teca-swatch amarelo"></span><span><b>Pastel Amarelo</b><br><small>Quente e acolhedor</small></span><span class="teca-check">✓</span>
        </button>
        <button class="teca-theme-option" type="button" role="radio" data-theme="azul">
          <span class="teca-swatch azul"></span><span><b>Azul Céu</b><br><small>Claro e tecnológico</small></span><span class="teca-check">✓</span>
        </button>
        <button class="teca-theme-option" type="button" role="radio" data-theme="menta">
          <span class="teca-swatch menta"></span><span><b>Verde Menta</b><br><small>Orgânico e suave</small></span><span class="teca-check">✓</span>
        </button>
      </div>`;
    document.body.appendChild(box);
    const toggle=box.querySelector(".teca-appearance-toggle");
    toggle.addEventListener("click",()=>{
      box.classList.toggle("open");
      toggle.setAttribute("aria-expanded",String(box.classList.contains("open")));
    });
    box.querySelectorAll(".teca-theme-option").forEach(b=>b.addEventListener("click",()=>{
      setTheme(b.dataset.theme); box.classList.remove("open"); toggle.setAttribute("aria-expanded","false");
    }));
    document.addEventListener("click",e=>{
      if(!box.contains(e.target)){box.classList.remove("open");toggle.setAttribute("aria-expanded","false")}
    });
    setTheme(current());
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",build);
  else build();
  window.addEventListener("storage",e=>{if(e.key===KEY)setTheme(current())});
})();
