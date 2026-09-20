(function(){
 const C=window.SPARN_CONFIG||{};
 const configured=()=>C.supabaseUrl&&!C.supabaseUrl.startsWith("COLE_")&&C.supabaseAnonKey&&!C.supabaseAnonKey.startsWith("COLE_");
 window.SparnAuth={client:null,
 async init(){if(!configured()||!window.supabase)return null;if(!this.client)this.client=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);return this.client},
 async user(){const c=await this.init();if(!c)return null;const {data}=await c.auth.getUser();return data.user||null},
 async profile(){const c=await this.init(),u=await this.user();if(!c||!u)return null;const {data}=await c.from("profiles").select("*").eq("id",u.id).maybeSingle();return data||null},
 async access(){const p=await this.profile();return !!(p&&p.access_status==="active")},
 async requirePaid(){const u=await this.user();if(!u){location.href="login.html?next="+encodeURIComponent(location.pathname.split("/").pop());return false}if(!(await this.access())){location.href="pagamento.html";return false}return true},
 async signOut(){const c=await this.init();if(c)await c.auth.signOut();location.href="index.html"}
 };
})();