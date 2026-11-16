import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.0';
const ML_AUTH_URL='https://cwnkpbwnexzulutpnnoq.supabase.co';
const ML_AUTH_KEY='sb_publishable_pTrQXc1CSpuNwiQbbpYcXA_7HS94_h5';
const ML_FUNCTION_URL='https://xjvdhaqfzizioppoaaoq.supabase.co/functions/v1/garimpador-auto-search';
const ML_ADMIN_EMAIL='pereiraeliton811@gmail.com';
const mlAuth=createClient(ML_AUTH_URL,ML_AUTH_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const data=window.GARIMPADOR_PRODUCT_DATA;
const tbody=document.getElementById('productRows');
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalizeCategory=s=>s==='Ofertas'?'Ofertas e promoções':s==='Moda'?'Moda e acessórios':s||'Sem categoria';
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return ''}};
const fmtDate=s=>{if(!s)return'—';const d=new Date(s);return Number.isNaN(+d)?'—':new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(d)};
const priceDisplay=p=>p.price_text||'Sem preço capturado';
const ML_NICHES=['Eletrônicos','Celulares e acessórios','Informática','Casa e decoração','Cozinha','Móveis','Cama, mesa e banho','Moda e acessórios','Beleza e cuidados pessoais','Ferramentas','Eletrodomésticos','Ofertas e promoções'];
const PARTNER_STORES=[
 {id:'shopee',name:'Shopee',label:'Loja do Novinho na Shopee',url:'https://collshp.com/elitonpereira892700?view=storefront'},
  {id:'mercadolivre',name:'Mercado Livre',label:'Achadinhos da Loja do Novinho no Mercado Livre',url:'https://mercadolivre.com/sec/1BcC48a'},
 {id:'amazon',name:'Amazon',label:'Vitrine da Loja do Novinho na Amazon',url:'https://a.co/d/02OBfGU8'}
];
function renderPartnerStores(){
 const container=document.getElementById('partnerStores');
 if(!container)return;
 container.innerHTML=PARTNER_STORES.map(store=>`<article class="partner-store">
  <div class="partner-store-mark">${store.id==='shopee'?'S':store.id==='amazon'?'A':'ML'}</div>
  <div class="partner-store-info"><b>${escapeHtml(store.label)}</b><span>${escapeHtml(store.name)}</span>
   <div class="actions"><a class="action" href="${escapeHtml(safeUrl(store.url))}" target="_blank" rel="noopener noreferrer">Abrir loja</a></div>
  </div></article>`).join('');
}
renderPartnerStores();
let products=Array.isArray(data?.products)?data.products.map(p=>({...p,category_display:normalizeCategory(p.category)})):[];
const search=document.getElementById('search'),marketFilter=document.getElementById('marketFilter'),categoryFilter=document.getElementById('categoryFilter');
function init(){if(!data||!products.length){tbody.innerHTML='<tr><td colspan="6" class="empty">Nenhum produto real está disponível neste snapshot.</td></tr>';return}
 document.getElementById('totalProducts').textContent=data.total_published;
 document.getElementById('totalMarkets').textContent=Object.keys(data.summary.marketplaces||{}).length;
 document.getElementById('marketNames').textContent=Object.keys(data.summary.marketplaces||{}).join(', ')||'Sem marketplace informado';
 document.getElementById('totalCategories').textContent=Object.keys(data.summary.categories||{}).length;
 document.getElementById('affiliateLinks').textContent=products.filter(p=>safeUrl(p.affiliate_url)).length;
 document.getElementById('snapshotDate').textContent=fmtDate(data.extracted_at);
 document.getElementById('catalogMeta').textContent=`${data.displayed} produtos · ${data.duplicate_links_removed} links repetidos removidos nesta cópia`;
 const fieldMissing=data.summary.missing_price_field||0;
 document.getElementById('priceNote').textContent=`${fieldMissing} de ${data.displayed} itens não têm preço numérico separado no Wix. O valor exibido foi lido do título ou da descrição e pode estar desatualizado; confira a página do marketplace antes de divulgar.`;
 document.getElementById('sourceText').textContent=`Leitura feita em ${fmtDate(data.extracted_at)} a partir do site Wix aberto pelo aplicativo Loja do Novinho. Esta cópia contém ${data.displayed} produtos publicados e não leva credenciais para o navegador.`;
 [...new Set(products.map(p=>p.marketplace).filter(Boolean))].sort().forEach(v=>marketFilter.add(new Option(v,v)));
 [...new Set(products.map(p=>p.category_display))].sort().forEach(v=>categoryFilter.add(new Option(v,v)));
 render();}
function render(){const q=search.value.trim().toLocaleLowerCase('pt-BR'),m=marketFilter.value,c=categoryFilter.value;const shown=products.filter(p=>(!q||`${p.name} ${p.description} ${p.marketplace} ${p.category_display}`.toLocaleLowerCase('pt-BR').includes(q))&&(!m||p.marketplace===m)&&(!c||p.category_display===c));
 if(!shown.length){tbody.innerHTML='<tr><td colspan="6" class="empty">Nenhum produto real corresponde aos filtros.</td></tr>'}else{tbody.innerHTML=shown.map(p=>{const image=safeUrl(p.image_url),affiliate=safeUrl(p.affiliate_url);return `<tr data-id="${escapeHtml(p.id)}"><td><div class="product">${image?`<img class="thumb" src="${escapeHtml(image)}" alt="" loading="lazy">`:'<span class="thumb missing">Imagem indisponível</span>'}<div><div class="pname">${escapeHtml(p.name||p.title||'Sem nome cadastrado')}</div><div class="pdesc">${escapeHtml(p.description||'Sem descrição cadastrada.')}</div></div></div></td><td><span class="market">${escapeHtml(p.marketplace||'Não identificado')}</span></td><td><span class="price">${escapeHtml(priceDisplay(p))}<small>${escapeHtml(p.price_source||'Preço não informado')}</small></span></td><td><span class="category">${escapeHtml(p.category_display)}</span></td><td><span class="published-chip">Publicado</span></td><td><div class="actions"><button class="action" data-action="details">Detalhes</button>${affiliate?`<a class="action" href="${escapeHtml(affiliate)}" target="_blank" rel="noopener noreferrer">Oferta</a>`:''}${affiliate?'<button class="action whatsapp" data-action="copy-offer">Preparar oferta</button><button class="action" data-action="whatsapp">Abrir WhatsApp</button>':''}</div></td></tr>`}).join('')}
 document.getElementById('resultCount').textContent=`Exibindo ${shown.length} de ${data.displayed} produtos publicados.`;}
function offerText(p){const price=p.price_text?`\n💰 ${p.price_text}`:'';return `🔥 OFERTA ${String(p.marketplace||'').toLocaleUpperCase('pt-BR')}\n\n${p.name||p.title||''}${price}\n\n${p.description||''}\n\nConfira a oferta pelo link:\n${p.affiliate_url}\n\nPreço e disponibilidade podem mudar.`;}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600);}
function copyOffer(p){const preview=document.getElementById('offerText');preview.value=offerText(p);document.getElementById('offerProductName').textContent=p.name||p.title||'Oferta';document.getElementById('offerLinkStatus').textContent=safeUrl(p.affiliate_url)?'Link de afiliado incluído: '+p.affiliate_url:'Este produto não tem link de afiliado válido cadastrado.';document.getElementById('offerPreview').showModal();}
async function copyPreparedOffer(){const preview=document.getElementById('offerText');try{await navigator.clipboard.writeText(preview.value);toast('Oferta copiada. Cole no grupo do WhatsApp.')}catch{preview.focus();preview.select();const ok=document.execCommand('copy');toast(ok?'Oferta copiada. Cole no grupo do WhatsApp.':'Selecione e copie o texto da oferta.');}}
function share(p){const msg=offerText(p);window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');}
function detail(p){const dlg=document.getElementById('details'),image=safeUrl(p.image_url),aff=safeUrl(p.affiliate_url);document.getElementById('detailContent').innerHTML=`${image?`<div class="detail-head"><img class="detail-image" src="${escapeHtml(image)}" alt=""><div><h2 class="detail-title">${escapeHtml(p.name||p.title||'Sem nome cadastrado')}</h2><div class="detail-meta">${escapeHtml(p.marketplace)} · ${escapeHtml(p.category_display)}<br>${escapeHtml(priceDisplay(p))} · ${escapeHtml(p.price_source||'Preço não informado')}</div></div></div>`:`<h2 class="detail-title">${escapeHtml(p.name||p.title||'Sem nome cadastrado')}</h2>`}<div class="detail-description">${escapeHtml(p.description||'Sem descrição cadastrada.')}</div><div class="detail-links">${aff?`<a class="action" target="_blank" rel="noopener noreferrer" href="${escapeHtml(aff)}">Abrir link afiliado</a><button class="action whatsapp" data-detail-copy="${escapeHtml(p.id)}">Preparar oferta</button><button class="action" data-detail-share="${escapeHtml(p.id)}">Abrir WhatsApp</button>`:''}</div>`;dlg.showModal();}
search.addEventListener('input',render);marketFilter.addEventListener('change',render);categoryFilter.addEventListener('change',render);
tbody.addEventListener('click',e=>{const row=e.target.closest('tr[data-id]');if(!row)return;const p=products.find(x=>String(x.id)===row.dataset.id);if(!p)return;const action=e.target.dataset.action;if(action==='details')detail(p);if(action==='whatsapp')share(p);if(action==='copy-offer')copyOffer(p)});
document.getElementById('detailContent').addEventListener('click',e=>{const copyId=e.target.dataset.detailCopy,shareId=e.target.dataset.detailShare;if(copyId){const p=products.find(x=>String(x.id)===copyId);if(p)copyOffer(p)}if(shareId){const p=products.find(x=>String(x.id)===shareId);if(p)share(p)}});
document.getElementById('copyPreparedOffer').addEventListener('click',copyPreparedOffer);
document.getElementById('closeOfferPreview').addEventListener('click',()=>document.getElementById('offerPreview').close());
document.getElementById('closeDetails').addEventListener('click',()=>document.getElementById('details').close());
document.getElementById('details').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close()});
init();


const mlResults=document.getElementById('mlResults');
const mlStatus=document.getElementById('mlSearchStatus');
const mlLoginForm=document.getElementById('mlLoginForm');
const mlLoginButton=document.getElementById('mlLoginButton');
const mlLogoutButton=document.getElementById('mlLogoutButton');
const mlSearchButton=document.getElementById('searchMl');
const mlReloadButton=document.getElementById('reloadMl');
let mlSession=null;
let mlItems=[];
const moneyBRL=value=>typeof value==='number'&&Number.isFinite(value)?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value):'Preço não informado';
function setMlStatus(message,isError=false){mlStatus.textContent=message;mlStatus.classList.toggle('error',isError);}
function setMlAuth(session){
 mlSession=session;
 const logged=Boolean(session);
 mlLoginForm.hidden=logged;
 mlLogoutButton.hidden=!logged;
 mlSearchButton.disabled=!logged;
 mlReloadButton.disabled=!logged;
 document.getElementById('mlLoginPassword').value='';
 if(logged){document.getElementById('mlAuthStatus').textContent='Acesso administrativo conectado. Busca e aprovação habilitadas.';}
 else{document.getElementById('mlAuthStatus').textContent='Entre com seu acesso administrativo para pesquisar e gerenciar as oportunidades.';}
}
async function mlRequest(action,extra={}){
 if(!mlSession?.access_token)throw new Error('Sua sessão expirou. Entre novamente no painel.');
 const response=await fetch(ML_FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':ML_AUTH_KEY,'Authorization':`Bearer ${mlSession.access_token}`},body:JSON.stringify({action,...extra})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok||payload.ok===false)throw new Error(payload.error||payload.detail||`Falha na solicitação (${response.status}).`);
 return payload;
}
function mlPriceSort(a,b){
 const pa=typeof a.price==='number'&&a.price>0?a.price:Number.POSITIVE_INFINITY;
 const pb=typeof b.price==='number'&&b.price>0?b.price:Number.POSITIVE_INFINITY;
 return pa-pb||String(a.title||'').localeCompare(String(b.title||''),'pt-BR');
}
function renderMlResults(){
 const q=document.getElementById('mlQuery').value.trim().toLocaleLowerCase('pt-BR');
 const items=mlItems.filter(p=>(!q||`${p.title||''} ${p.description||''} ${p.niche||''}`.toLocaleLowerCase('pt-BR').includes(q))).sort(mlPriceSort);
 if(!items.length){mlResults.innerHTML='<p class="ml-empty">Nenhum produto encontrado com esses filtros. Faça uma nova busca ou altere o filtro.</p>';return;}
 mlResults.innerHTML=items.map(p=>{
  const image=safeUrl(p.image_url),productUrl=safeUrl(p.product_url),affiliate=safeUrl(p.affiliate_url);
  const destination=p.raw_data?.approval_destination||'storefront';
  const status=p.status==='approved'?(destination==='whatsapp'?'Aprovado para WhatsApp':'Aprovado para vitrine · não publicado'):'Aguardando aprovação';
  return `<article class="ml-result-card" data-ml-id="${escapeHtml(p.id)}">
   ${image?`<img class="ml-result-image" src="${escapeHtml(image)}" alt="" loading="lazy">`:'<div class="ml-result-image ml-no-image">Sem imagem</div>'}
   <div class="ml-result-content">
    <div class="ml-result-top"><span class="ml-result-niche">${escapeHtml(p.niche||'Outros')}</span><span class="ml-result-state ${p.status==='approved'?'approved':''}">${status}</span></div>
    <b class="ml-result-title">${escapeHtml(p.title||'Produto sem título')}</b>
    <strong class="ml-result-price">${moneyBRL(p.price)}</strong>
    <p class="ml-result-description">${escapeHtml(p.description||'Sem descrição adicional fornecida pelo anúncio.')}</p>
    <div class="ml-result-actions">${productUrl?`<a class="action" href="${escapeHtml(productUrl)}" target="_blank" rel="noopener noreferrer">Conferir anúncio</a>`:''}</div>
    <label class="ml-affiliate-label">Deep Link — cole seu link oficial de afiliado
     <input class="ml-affiliate-input" data-affiliate-input="${escapeHtml(p.id)}" type="url" value="${escapeHtml(affiliate)}" placeholder="Cole aqui o link gerado na Central de Afiliados">
    </label>
    <label class="ml-destination-label">Destino da oferta
     <select data-destination="${escapeHtml(p.id)}" ${p.status==='approved'?'disabled':''}>
      <option value="storefront" ${destination==='storefront'?'selected':''}>Vitrine da Loja do Novinho (aprovação; não publica ainda)</option>
      <option value="whatsapp" ${destination==='whatsapp'?'selected':''}>WhatsApp (preparar compartilhamento)</option>
     </select>
    </label>
    <div class="actions ml-manage-actions">
     <button class="action" type="button" data-ml-action="save-link">${affiliate?'Atualizar link':'Salvar link de afiliado'}</button>
     ${p.status==='approved'?(destination==='whatsapp'?'<button class="action whatsapp" type="button" data-ml-action="open-whatsapp">Abrir WhatsApp</button>':'<span class="ml-approved-note">Aprovado para a fila da vitrine; ainda não publicado.</span>'):`<button class="action whatsapp" type="button" data-ml-action="approve" ${affiliate?'':'disabled'}>Confirmar destino e aprovar</button>`}
     <button class="action" type="button" data-ml-action="ignore">Excluir da lista</button>
    </div>
   </div>
  </article>`;
 }).join('');
}
async function loadMlItems(){
 setMlStatus('Carregando produtos salvos…');
 try{
  const result=await mlRequest('list');
  mlItems=Array.isArray(result.items)?result.items:[];
  renderMlResults();
  setMlStatus(`${mlItems.length} produtos carregados. Lista ordenada do menor para o maior preço.`);
 }catch(error){setMlStatus(error.message,true);}
}
async function runMlSearch(){
 if(!mlSession)return;
 mlSearchButton.disabled=true;mlReloadButton.disabled=true;
 setMlStatus('Pesquisando oportunidades no Mercado Livre. Isso pode levar alguns instantes…');
 try{
  const result=await mlRequest('search');
  await loadMlItems();
  const found=Number(result.products_found||0),saved=Number(result.products_saved||0);
  setMlStatus(found===0?(result.warning||'O Mercado Livre não retornou produtos nesta busca. A lista continua vazia; tente novamente mais tarde ou '):`Busca concluída: ${found} produtos identificados e ${saved} registros salvos. Confira preços e anúncios antes de aprovar.`,found===0);
 }catch(error){setMlStatus(error.message,true);}
 finally{mlSearchButton.disabled=!mlSession;mlReloadButton.disabled=!mlSession;}
}
mlLoginForm.addEventListener('submit',async event=>{
 event.preventDefault();mlLoginButton.disabled=true;mlLoginButton.textContent='Conectando…';
 try{
  const email=document.getElementById('mlLoginEmail').value.trim().toLowerCase();
  const password=document.getElementById('mlLoginPassword').value;
  const {data,error}=await mlAuth.auth.signInWithPassword({email,password});
  if(error)throw error;
  if(data.user?.email?.toLowerCase()!==ML_ADMIN_EMAIL){await mlAuth.auth.signOut();throw new Error('Este acesso não tem permissão administrativa para o Garimpador.');}
  setMlAuth(data.session);await loadMlItems();
 }catch(error){document.getElementById('mlAuthStatus').textContent=error.message||'Não foi possível entrar.';setMlStatus(error.message||'Falha no acesso.',true);}
 finally{mlLoginButton.disabled=false;mlLoginButton.textContent='Entrar para pesquisar';}
});

mlLogoutButton.addEventListener('click',async()=>{await mlAuth.auth.signOut();mlItems=[];renderMlResults();setMlAuth(null);setMlStatus('Você saiu do painel.');});
mlSearchButton.addEventListener('click',runMlSearch);
mlReloadButton.addEventListener('click',loadMlItems);
document.getElementById('mlQuery').addEventListener('input',renderMlResults);
mlResults.addEventListener('click',async event=>{
 const button=event.target.closest('[data-ml-action]');if(!button)return;
 const card=button.closest('[data-ml-id]');if(!card)return;
 const id=card.dataset.mlId,action=button.dataset.mlAction;
 if(action==='ignore'&&!confirm('Excluir este produto da sua lista? Ele será marcado como ignorado e não aparecerá nas próximas consultas.'))return;
 button.disabled=true;
 try{
  if(action==='save-link'){
   const input=card.querySelector('[data-affiliate-input]');
   const affiliate_url=input?.value.trim()||'';
   await mlRequest('save_affiliate_link',{id,affiliate_url});
   setMlStatus('Link oficial de afiliado salvo. O produto continua pendente até você aprovar.');
  }else if(action==='approve'){
   const destination=card.querySelector('[data-destination]')?.value||'';
   if(!['storefront','whatsapp'].includes(destination))throw new Error('Escolha vitrine ou WhatsApp antes de aprovar.');
   await mlRequest('approve',{id,destination});
   setMlStatus(destination==='whatsapp'?'Destino WhatsApp aprovado. Use “Abrir WhatsApp” para revisar e compartilhar manualmente.':'Destino vitrine aprovado. O produto continua sem publicação até uma etapa própria de publicação Wix.');
  }else if(action==='open-whatsapp'){
   const product=mlItems.find(item=>String(item.id)===id);
   if(!product?.affiliate_url)throw new Error('Salve um link oficial de afiliado antes de compartilhar.');
   const message=`🔥 OFERTA MERCADO LIVRE\n\n${product.title||'Achadinho da Loja do Novinho'}\n${moneyBRL(product.price)}\n\n${product.description||''}\n\nConfira aqui: ${product.affiliate_url}\n\nPreço e disponibilidade podem mudar.`;
   window.open('https://wa.me/?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
   setMlStatus('WhatsApp aberto para você revisar e enviar a mensagem.');
  }else if(action==='ignore'){
   await mlRequest('ignore',{id});
   setMlStatus('Produto excluído da lista. Ele não será publicado.');
  }
  await loadMlItems();
 }catch(error){setMlStatus(error.message,true);}
 finally{button.disabled=false;}
});
(async()=>{
 const {data:sessionData,error}=await mlAuth.auth.getSession();
 if(error){setMlStatus(error.message,true);return;}
 const session=sessionData.session;
 if(session){
  if(session.user?.email?.toLowerCase()!==ML_ADMIN_EMAIL){await mlAuth.auth.signOut();setMlAuth(null);setMlStatus('A sessão encontrada não tem permissão administrativa.',true);return;}
  setMlAuth(session);await loadMlItems();
 }else setMlAuth(null);
})();
