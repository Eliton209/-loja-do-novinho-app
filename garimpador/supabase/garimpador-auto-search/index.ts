import { createClient } from "npm:@supabase/supabase-js@2";
const URL = Deno.env.get("SUPABASE_URL")!;
const AUTH_URL = "https://cwnkpbwnexzulutpnnoq.supabase.co";
const AUTH_ANON = "sb_publishable_pTrQXc1CSpuNwiQbbpYcXA_7HS94_h5";
const ADMIN = "pereiraeliton811@gmail.com";
const GROUPS = [
  ["Eletrônicos", ["fone bluetooth","smart tv","smartphone","caixa de som bluetooth"]],
  ["Casa e decoração", ["organizador para casa","luminária decorativa","utilidades domésticas","decoração para sala"]],
  ["Cozinha", ["air fryer","liquidificador","jogo de panelas"]],
  ["Informática", ["mouse sem fio","teclado mecânico","monitor computador"]],
  ["Moda e acessórios", ["mochila","relógio masculino","tênis casual"]],
  ["Ofertas gerais", ["ofertas produtos casa","produto em promoção","utilidades domésticas"]]
] as const;
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{
 "content-type":"application/json; charset=utf-8","cache-control":"no-store",
 "access-control-allow-origin":"*","access-control-allow-headers":"authorization, apikey, content-type, x-garimpador-cron-token",
 "access-control-allow-methods":"POST, OPTIONS"
}});
const str=(v:unknown,n=500)=>typeof v==="string"?v.trim().slice(0,n):"";
const urlOk=(s:string)=>{try{const u=new URL(s);return ["http:","https:"].includes(u.protocol)?u.toString():""}catch{return ""}};
const affiliateUrlOk=(s:string)=>{const clean=urlOk(s);if(!clean||!clean.startsWith("https://"))return "";try{const host=new URL(clean).hostname.toLowerCase();return /(^|\.)meli\.la$|(^|\.)mercadolivre\.com(\.br)?$|(^|\.)mercadolibre\.com(\.br)?$/.test(host)?clean:""}catch{return ""}};
const getId=(s:string)=>s.match(/\b(MLB-?\d{6,})\b/i)?.[1]?.replace("-","").toUpperCase()||null;
const decode=(s:string)=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
function pageMeta(html:string){
 const pick=(re:RegExp)=>decode(html.match(re)?.[1]||"");
 let image=pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)||pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
 if(image.startsWith("//"))image="https:"+image;
 const priceText=pick(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i);
 let price:number|null=null;
 if(priceText){const n=Number(priceText.replace(/[^\d.,]/g,"").replace(/\./g,"").replace(",", "."));if(Number.isFinite(n)&&n>0)price=n;}
 return {
  title:str(pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)||pick(/<title[^>]*>([^<]+)<\/title>/i),250),
  description:str(pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)||pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),4000),
  image:urlOk(image),price
 };
}
function collectItemIds(source:string){
 const normalized=source.replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;|&#x27;/gi,"'").replace(/&#x2f;|&#47;/gi,"/").replace(/\\u002d/gi,"-").replace(/\\u003d/gi,"=").replace(/\\u0026/gi,"&").replace(/\\\//g,"/");
 const found=new Map<string,string>();
 const add=(raw:string,href="")=>{
  const id=raw.replace(/-/g,"").toUpperCase();
  if(!/^(MLB|MLA|MLM|MCO|MLC)\d{6,}$/.test(id)||found.has(id))return;
  let link="";
  if(href){try{const decoded=decodeURIComponent(href);link=urlOk(decoded.startsWith("//")?"https:"+decoded:decoded.startsWith("/")?"https://www.mercadolivre.com.br"+decoded:decoded);}catch{}}
  found.set(id,link||"https://www.mercadolivre.com.br/p/"+id);
 };
 for(const m of normalized.matchAll(/href=["']([^"'<>]+)["']/gi)){
  const href=m[1],direct=href.match(/\b((?:MLB|MLA|MLM|MCO|MLC)-?\d{6,})\b/i);
  if(direct)add(direct[1],href);
  try{const u=new URL(href.startsWith("//")?"https:"+href:href.startsWith("/")?"https://www.mercadolivre.com.br"+href:href);for(const key of ["item_id","wid"]){const q=(u.searchParams.get(key)||"").match(/\b((?:MLB|MLA|MLM|MCO|MLC)-?\d{6,})\b/i);if(q)add(q[1],href);}}catch{}
 }
 for(const m of normalized.matchAll(/\b((?:MLB|MLA|MLM|MCO|MLC)-?\d{6,})\b/gi)){add(m[1]);if(found.size>=16)break;}
 return found;
}
async function discover(term:string){
 const target="https://html.duckduckgo.com/html/?q="+encodeURIComponent("site:mercadolivre.com.br "+term);
 const found=new Map<string,string>();let html="",httpStatus=0,finalUrl=target;
 try{
  const r=await fetch(target,{redirect:"follow",headers:{"user-agent":"Mozilla/5.0 (compatible; GarimpadorLDN/1.0)","accept":"text/html,application/xhtml+xml","accept-language":"pt-BR,pt;q=0.9"},signal:AbortSignal.timeout(15000)});
  httpStatus=r.status;finalUrl=r.url||target;
  if(r.ok){html=(await r.text()).slice(0,2500000);
   for(const m of html.matchAll(/uddg=([^&"']+)/gi)){try{const u=decodeURIComponent(m[1]);const id=u.match(/\\b((?:MLB|MLA|MLM|MCO|MLC)-?\\d{6,})\\b/i);if(id)found.set(id[1].replace("-","").toUpperCase(),u);}catch{}}
   for(const [id,link] of collectItemIds(html))if(!found.has(id))found.set(id,link);
  }
 }catch{}
 return {items:[...found].slice(0,30).map(([id,link])=>({id,link,price:null,image:"",html})),diagnostic:{term,final_url:finalUrl,http_status:httpStatus,html_chars:html.length,page_title:pageMeta(html).title,ids_found:found.size,source:found.size?"duckduckgo_public_html":"none",looks_blocked:/captcha|robot|access denied|security check/i.test(html.slice(0,30000))}};
}
async function inspect(id:string,link:string,listingHtml:string){
 let title="",description="",image="",price:number|null=null,productUrl=link;
 try{const r=await fetch(link,{redirect:"follow",headers:{"user-agent":"Mozilla/5.0 (compatible; GarimpadorLDN/1.0)","accept":"text/html,application/xhtml+xml,*/*;q=0.8","accept-language":"pt-BR,pt;q=0.9"},signal:AbortSignal.timeout(12000)});
  if(r.ok){const p=pageMeta((await r.text()).slice(0,700000));title=p.title;description=p.description;image=p.image;price=p.price;productUrl=r.url||link;}
 }catch{}
 if(!title||!image||price===null){const p=pageMeta(listingHtml);title||=p.title;description||=p.description;image||=p.image;price??=p.price;}
 return {id,title,description,image:urlOk(image),price,productUrl:productUrl||link};
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return reply({ok:true});
 if(req.method!=="POST")return reply({error:"Método não permitido."},405);
 const jwt=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
 const cronToken=req.headers.get("x-garimpador-cron-token")||"";
 const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 let db:any;
 if(cronToken){
  if(!service)return reply({error:"Configuração interna ausente."},500);
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(cronToken));
  const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
  const admin=createClient(URL,service,{auth:{persistSession:false}});
  const {data,error}=await admin.from("garimpador_cron_config").select("secret_sha256").eq("id",1).maybeSingle();
  if(error||!data?.secret_sha256||data.secret_sha256!==hash)return reply({error:"Rotina agendada não autorizada."},403);
  db=admin;
 }else{
  if(!jwt)return reply({error:"Entre no painel para iniciar."},401);
  const authClient=createClient(AUTH_URL,AUTH_ANON,{auth:{persistSession:false}});
  const {data:authData,error:authError}=await authClient.auth.getUser(jwt);
  if(authError||authData.user?.email?.toLowerCase()!==ADMIN)return reply({error:"Acesso não autorizado."},403);
  if(!service)return reply({error:"Configuração interna ausente."},500);
  db=createClient(URL,service,{auth:{persistSession:false}});
 }
 const input=await req.json().catch(()=>({}));
 const action=typeof input.action==="string"?input.action:"search";
 if(action==="list"){
  const {data,error}=await db.from("garimpador_products").select("*").eq("platform","mercado_livre").in("status",["pending","approved"]).order("first_seen_at",{ascending:false}).limit(100);
  if(error)return reply({error:"Não foi possível carregar as ofertas.",detail:error.message},500);
  return reply({ok:true,items:data||[]});
 }
 if(action==="save_affiliate_link"){
  const id=str(input.id,80),affiliateUrl=affiliateUrlOk(str(input.affiliate_url,3000));
  if(!id)return reply({error:"Identificador da oferta ausente."},400);
  if(!affiliateUrl)return reply({error:"Cole um link HTTPS oficial do Mercado Livre (incluindo meli.la)."},400);
  const {data:current,error:readError}=await db.from("garimpador_products").select("id,affiliate_url,status").eq("id",id).maybeSingle();
  if(readError)return reply({error:"Não foi possível localizar a oferta.",detail:readError.message},500);
  if(!current)return reply({error:"Oferta não encontrada."},404);
  const changed=current.affiliate_url!==affiliateUrl;
  const update:any={affiliate_url:affiliateUrl};
  if(changed&&current.status==="approved")update.status="pending";
  // Deep Link: tenta resolver o redirecionamento e enriquecer os metadados pela página pública.
  try{
   const response=await fetch(affiliateUrl,{redirect:"follow",headers:{"user-agent":"Mozilla/5.0 (compatible; GarimpadorLDN/1.0)","accept":"text/html,application/xhtml+xml,*/*;q=0.8","accept-language":"pt-BR,pt;q=0.9"},signal:AbortSignal.timeout(12000)});
   if(response.ok){
    const finalUrl=urlOk(response.url)||"";
    const meta=pageMeta((await response.text()).slice(0,700000));
    if(finalUrl&&/(^|\\.)mercadolivre\\.com(\\.br)?$/i.test(new URL(finalUrl).hostname))update.product_url=finalUrl;
    if(meta.title)update.title=meta.title;
    if(meta.description)update.description=meta.description;
    if(meta.image)update.image_url=meta.image;
    if(meta.price!==null)update.price=meta.price;
   }
  }catch{}
  const {data,error}=await db.from("garimpador_products").update(update).eq("id",id).select("id,status,title,affiliate_url,product_url,image_url,price").maybeSingle();
  if(error)return reply({error:"Não foi possível salvar o link.",detail:error.message},500);
  return reply({ok:true,item:data,approval_reset:changed&&current.status==="approved"});
 }
 if(action==="approve"||action==="ignore"){
  const id=str(input.id,80);
  if(!id)return reply({error:"Identificador da oferta ausente."},400);
  let update:any={status:action==="approve"?"approved":"ignored"};
  if(action==="approve"){
   const destination=str(input.destination,30);
   if(!["storefront","whatsapp"].includes(destination))return reply({error:"Escolha vitrine ou WhatsApp antes de aprovar."},400);
   const {data:current,error:readError}=await db.from("garimpador_products").select("id,affiliate_url,raw_data").eq("id",id).maybeSingle();
   if(readError)return reply({error:"Não foi possível verificar a oferta.",detail:readError.message},500);
   if(!current||!affiliateUrlOk(str(current.affiliate_url,3000)))return reply({error:"Salve primeiro o link oficial de afiliado desta oferta."},400);
   update.raw_data={...(current.raw_data||{}),approval_destination:destination,approved_at:new Date().toISOString()};
  }
  const {data,error}=await db.from("garimpador_products").update(update).eq("id",id).select("id,status,title,affiliate_url,raw_data").maybeSingle();
  if(error)return reply({error:"Não foi possível atualizar a oferta.",detail:error.message},500);
  if(!data)return reply({error:"Oferta não encontrada."},404);
  return reply({ok:true,item:data});
 }
 if(action!=="search")return reply({error:"Ação não reconhecida."},400);
 const terms=GROUPS.flatMap(([niche,queries])=>queries.map(term=>({niche,term})));
 const discovered=new Map<string,{niche:string,term:string,link:string,html:string,priceHint:number|null,imageHint:string}>();
 const errors:string[]=[];const diagnostics:any[]=[];let searched=0;
 for(let i=0;i<terms.length;i+=4){
  const results=await Promise.all(terms.slice(i,i+4).map(async t=>{try{return {...t,result:await discover(t.term),error:""};}catch(e){return {...t,result:null,error:e instanceof Error?e.message:String(e)};}}));
  for(const r of results){if(r.error||!r.result){errors.push(r.error||"Falha na busca: "+r.term);continue;}searched++;diagnostics.push(r.result.diagnostic);for(const p of r.result.items)if(!discovered.has(p.id))discovered.set(p.id,{niche:r.niche,term:r.term,link:p.link,html:p.html,priceHint:p.priceHint,imageHint:p.imageHint});}
 }
 const entries=[...discovered.entries()];const rows:any[]=[];
 for(let i=0;i<entries.length;i+=8){
  const batch=await Promise.all(entries.slice(i,i+8).map(async([id,v])=>{try{return {id,v,p:await inspect(id,v.link,v.html),error:""};}catch(e){return {id,v,p:null,error:e instanceof Error?e.message:String(e)};}}));
  for(const x of batch){if(x.error||!x.p){errors.push(x.error||"Falha produto "+x.id);continue;}const p=x.p;if(!p.title||!p.productUrl)continue;
   rows.push({platform:"mercado_livre",external_id:p.id,product_url:p.productUrl,title:p.title,description:p.description||null,image_url:p.image||x.v.imageHint||null,price:p.price??x.v.priceHint,original_price:null,discount_percent:null,niche:x.v.niche,source:"automatic",status:"pending",last_seen_at:new Date().toISOString(),last_checked_at:new Date().toISOString(),raw_data:{search_term:x.v.term,discovery_method:"duckduckgo_public_html_search"}});
  }
 }
 const quotas:Record<string,number>={
  "Eletrônicos":4,
  "Casa e decoração":4,
  "Cozinha":3,
  "Informática":3,
  "Moda e acessórios":3,
  "Ofertas gerais":3
 };
 const selected:any[]=[];
 const used=new Set<string>();
 const compareBestPrice=(a:any,b:any)=>{const pa=typeof a.price==="number"&&a.price>0?a.price:Number.POSITIVE_INFINITY;const pb=typeof b.price==="number"&&b.price>0?b.price:Number.POSITIVE_INFINITY;if(pa!==pb)return pa-pb;return (b.image_url?1:0)-(a.image_url?1:0);};
 for(const [niche,limit] of Object.entries(quotas)){
  const candidates=rows.filter(p=>p.niche===niche).sort(compareBestPrice);
  for(const item of candidates.slice(0,limit)){selected.push(item);used.add(item.external_id);}
 }
 if(selected.length<20){
  const remainder=rows.filter(p=>!used.has(p.external_id)).sort(compareBestPrice);
  selected.push(...remainder.slice(0,20-selected.length));
 }
 rows.splice(0,rows.length,...selected);
 const selectedIds=rows.map(p=>p.external_id);
 const {data:existingRows,error:existingError}=await db.from("garimpador_products").select("external_id,affiliate_url,status,price,title").eq("platform","mercado_livre").in("external_id",selectedIds);
 if(existingError)return reply({error:"Não foi possível comparar os preços já salvos.",detail:existingError.message},500);
 const existingById=new Map((existingRows||[]).map((p:any)=>[p.external_id,p]));
 const refreshed=rows.filter(p=>!["ignored","published"].includes(existingById.get(p.external_id)?.status||"")).map(p=>{
  const old=existingById.get(p.external_id);
  if(!old)return p;
  const changed=Number(old.price??0)!==Number(p.price??0)||old.title!==p.title;
  return {...p,affiliate_url:old.affiliate_url||null,status:changed?"pending":old.status};
 });
 rows.splice(0,rows.length,...refreshed);
 let saved=0,saveError:string|null=null;
 for(let i=0;i<rows.length;i+=100){
  const {data,error}=await db.from("garimpador_products").upsert(rows.slice(i,i+100),{onConflict:"platform,external_id",ignoreDuplicates:false}).select("id");
  if(error){saveError=error.message;break;}
  saved+=(data||[]).length;
 }
 console.info("Garimpador LDN", {niches:GROUPS.length,terms:terms.length,searched,ids:discovered.size,found:rows.length,saved,errors:errors.length,saveError,diagnostics:diagnostics.slice(0,5)});
 return reply({ok:!saveError&&searched>0,platform:"Mercado Livre",niches:GROUPS.length,terms_total:terms.length,terms_searched:searched,product_ids_discovered:discovered.size,products_found:rows.length,products_saved:saved,quotas,errors:errors.slice(0,10),diagnostics:diagnostics.slice(0,12),save_error:saveError,warning:!rows.length&&searched?"As buscas responderam, mas nenhum produto foi identificado; consulte diagnostics para verificar bloqueio ou mudança no HTML.":null,note:"Método público do cadastro de afiliados; sem OAuth ou token do Mercado Livre. Produtos ficam pendentes e nada é publicado."},saveError?500:searched?200:502);
});