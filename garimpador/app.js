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
 {id:'magalu',name:'Magalu',label:'Loja do Novinho no Magalu',url:'https://influenciadormagalu.com.br/lojadonovinho'},
 {id:'mercadolivre',name:'Mercado Livre',label:'Achadinhos da Loja do Novinho no Mercado Livre',url:'https://mercadolivre.com/sec/1BcC48a'},
 {id:'amazon',name:'Amazon',label:'Vitrine da Loja do Novinho na Amazon',url:'https://a.co/d/02OBfGU8'}
];
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

const mlCategory=document.getElementById('mlCategory'),mlQueue=document.getElementById('mlOfferQueue'),mlStorageKey='garimpador-ldn-ml-offers-v1';
function storePromo(store){return `🛍️ LOJA DO NOVINHO NA ${String(store.name).toLocaleUpperCase('pt-BR')}\n\nConfira nossa loja e veja os produtos disponíveis:\n${store.url}\n\nPreços e disponibilidade são definidos pela plataforma e podem mudar.`;}
function renderPartnerStores(){document.getElementById('partnerStores').innerHTML=PARTNER_STORES.map(store=>`<article class="partner-store"><div class="partner-store-mark" aria-hidden="true">${escapeHtml(store.name.slice(0,1))}</div><div class="partner-store-info"><b>${escapeHtml(store.label)}</b><span>Link direto para a loja na ${escapeHtml(store.name)}</span><div class="actions"><a class="action" href="${escapeHtml(store.url)}" target="_blank" rel="noopener noreferrer">Ver loja</a><button class="action whatsapp" data-store-action="prepare" data-store-id="${store.id}">Preparar WhatsApp</button><button class="action" data-store-action="copy" data-store-id="${store.id}">Copiar anúncio</button></div></div></article>`).join('');}
document.getElementById('partnerStores').addEventListener('click',async e=>{const button=e.target.closest('[data-store-action]');if(!button)return;const store=PARTNER_STORES.find(item=>item.id===button.dataset.storeId);if(!store)return;const message=storePromo(store);if(button.dataset.storeAction==='prepare'){window.open(`https://wa.me/?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');return}try{await navigator.clipboard.writeText(message);toast('Anúncio da loja copiado com o link direto.')}catch{const box=document.createElement('textarea');box.value=message;box.style.position='fixed';box.style.opacity='0';document.body.append(box);box.select();const copied=document.execCommand('copy');box.remove();toast(copied?'Anúncio da loja copiado com o link direto.':'Não foi possível copiar o anúncio.');}});
renderPartnerStores();
ML_NICHES.forEach(n=>mlCategory.add(new Option(n,n)));
function readMlOffers(){try{return JSON.parse(localStorage.getItem(mlStorageKey)||'[]')}catch{return[]}}
function saveMlOffers(items){try{localStorage.setItem(mlStorageKey,JSON.stringify(items));return true}catch{return false}}
function offerCard(p){
 const image=safeUrl(p.image_url),productUrl=safeUrl(p.product_url),affiliate=safeUrl(p.affiliate_url);
 const price=p.price?escapeHtml(p.price):'Preço não informado';
 const market=escapeHtml(p.marketplace||'Plataforma não identificada');
 const specs=escapeHtml(p.model||'Modelo/versão não informado');
 const seller=escapeHtml(p.seller||'Vendedor não informado');
 const shipping=escapeHtml(p.shipping||'Frete a consultar');
 const checked=fmtDate(p.checked_at||p.added_at);
 return '<article class="review-offer-card" data-ml-id="'+escapeHtml(p.id)+'">'+
 '<div class="review-offer-photo">'+(image?'<img src="'+escapeHtml(image)+'" alt="Foto de '+escapeHtml(p.name)+'" loading="lazy" onerror="this.parentElement.innerHTML=\'<span>Imagem indisponível</span>\'">':'<span>Foto não informada</span>')+'</div>'+
 '<div class="review-offer-content"><div class="review-offer-top"><span class="review-market">'+market+'</span><span class="review-niche">'+escapeHtml(p.category||'Sem nicho')+'</span></div>'+
 '<h3>'+escapeHtml(p.name||'Produto sem nome')+'</h3><div class="review-price">'+price+'</div>'+
 '<div class="review-specs"><span><b>Modelo:</b> '+specs+'</span><span><b>Vendedor:</b> '+seller+'</span><span><b>Entrega:</b> '+shipping+'</span></div>'+
 (p.description?'<p class="review-description">'+escapeHtml(p.description)+'</p>':'')+
 '<small class="review-time">Preço conferido: '+escapeHtml(checked)+' · Informado manualmente</small>'+
 '<div class="actions">'+(productUrl?'<a class="action" href="'+escapeHtml(productUrl)+'" target="_blank" rel="noopener noreferrer">Ver anúncio</a>':'')+
 (affiliate?'<a class="action" href="'+escapeHtml(affiliate)+'" target="_blank" rel="noopener noreferrer">Link afiliado</a>':'<span class="review-pending">Link afiliado pendente</span>')+
 '<button class="action whatsapp" data-ml-action="send" '+(!affiliate?'disabled title="Adicione seu link de afiliado para divulgar"':'')+'>Preparar WhatsApp</button><button class="action" data-ml-action="remove">Remover</button></div></div></article>';
}
function renderMlOffers(){const items=readMlOffers();document.getElementById('mlQueueCount').textContent=items.length+' '+(items.length===1?'produto salvo':'produtos salvos')+' neste aparelho';mlQueue.classList.add('review-offer-queue');mlQueue.innerHTML=items.length?items.map(offerCard).join(''):'<p class="ml-empty">Nenhum produto salvo. Pesquise nas lojas e adicione os dados do anúncio para revisar aqui.</p>';}
function updateOfferPreview(){
 const name=document.getElementById('offerName').value.trim(),image=safeUrl(document.getElementById('offerImage').value),price=document.getElementById('offerPrice').value.trim(),market=document.getElementById('offerMarket').value,desc=document.getElementById('offerDescription').value.trim(),model=document.getElementById('offerModel').value.trim();
 document.getElementById('offerCheckedAt').value=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date());
 document.getElementById('offerDraftPreview').innerHTML=(image?'<img src="'+escapeHtml(image)+'" alt="Prévia do produto" onerror="this.style.display=\'none\'">':'<div class="draft-no-image">Foto ainda não informada</div>')+'<div><span>'+escapeHtml(market)+' · '+escapeHtml(mlCategory.value)+'</span><b>'+escapeHtml(name||'Nome do produto')+'</b><strong>'+escapeHtml(price||'Preço não informado')+'</strong><small>'+escapeHtml(model||desc||'Detalhes do produto aparecerão aqui')+'</small></div>';
}
['offerName','offerImage','offerPrice','offerDescription','offerModel','offerMarket'].forEach(id=>document.getElementById(id).addEventListener('input',updateOfferPreview));
document.getElementById('mlOfferForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=document.getElementById('offerName').value.trim(),productUrl=safeUrl(document.getElementById('offerProductUrl').value),affiliateRaw=document.getElementById('offerAffiliate').value.trim(),affiliate=affiliateRaw?safeUrl(affiliateRaw):'';
 if(!name){toast('Informe o nome do produto.');return}
 if(affiliateRaw&&!affiliate){toast('O link de afiliado precisa começar com https://.');return}
 const existing=readMlOffers(),item={id:'offer-'+Date.now(),marketplace:document.getElementById('offerMarket').value,name,category:mlCategory.value,price:document.getElementById('offerPrice').value.trim(),description:document.getElementById('offerDescription').value.trim(),image_url:safeUrl(document.getElementById('offerImage').value.trim()),product_url:productUrl,model:document.getElementById('offerModel').value.trim(),seller:document.getElementById('offerSeller').value.trim(),shipping:document.getElementById('offerShipping').value.trim(),affiliate_url:affiliate,added_at:new Date().toISOString(),checked_at:new Date().toISOString()};
 if(productUrl&&existing.some(p=>p.product_url===productUrl)){toast('Esse anúncio já está salvo.');return}
 if(!saveMlOffers([item,...existing])){toast('O navegador não conseguiu salvar o produto.');return}
 e.currentTarget.reset();document.getElementById('offerCheckedAt').value='';updateOfferPreview();renderMlOffers();toast('Produto salvo para revisão.');
});
document.getElementById('searchMl').addEventListener('click',()=>{const q=document.getElementById('mlQuery').value.trim()||mlCategory.value;const slug=q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');window.open(`https://lista.mercadolivre.com.br/${encodeURIComponent(slug)}`,'_blank','noopener,noreferrer');});
mlQueue.addEventListener('click',e=>{
 const card=e.target.closest('[data-ml-id]');if(!card)return;
 const items=readMlOffers(),item=items.find(p=>p.id===card.dataset.mlId);if(!item)return;
 if(e.target.dataset.mlAction==='remove'){saveMlOffers(items.filter(p=>p.id!==item.id));renderMlOffers();return}
 if(e.target.dataset.mlAction==='send'){
  if(!safeUrl(item.affiliate_url)){toast('Adicione o link de afiliado antes de preparar a divulgação.');return}
  const price=item.price?'\n💰 '+item.price:'',desc=item.description?'\n\n'+item.description:'',url=item.affiliate_url;
  const message='🔥 OFERTA '+String(item.marketplace||'').toLocaleUpperCase('pt-BR')+'\n\n'+item.name+price+desc+'\n\nConfira a oferta pelo link:\n'+url+'\n\nPreço e disponibilidade podem mudar.';
  window.open('https://wa.me/?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
 }
});
renderMlOffers();


/* Comparador gratuito e assistido: não usa scraping, APIs pagas ou links afiliados automáticos. */
(function initFreeComparison(){
 const panel=document.getElementById('pesquisaML');
 if(!panel||document.getElementById('freeCompare'))return;
 const section=document.createElement('section');section.className='panel free-compare';section.id='freeCompare';
 section.innerHTML='<div class="panel-head"><div><h2>Comparar Mercado Livre × Magalu</h2><p>Pesquisa gratuita, sem serviço pago. Confira os anúncios e registre os dados encontrados.</p></div></div>'+
 '<div class="free-compare-note"><b>Como usar</b><p>Pesquise o mesmo produto nas duas lojas. Confira modelo, capacidade, versão e voltagem e preencha os dados reais. Só marque “mesmo produto” quando a equivalência estiver confirmada.</p></div>'+
 '<div class="compare-search"><label>Produto para pesquisar<input id="compareQuery" type="search" placeholder="Ex.: Air Fryer Mondial 5 litros 220V"></label><div class="actions"><button class="action whatsapp" id="openCompareML" type="button">Pesquisar no Mercado Livre</button><button class="action" id="openCompareMagalu" type="button">Pesquisar no Magalu</button></div></div>'+
 '<div class="compare-grid"><article class="compare-entry"><h3>Mercado Livre</h3><label>Nome/modelo exato<input id="mlName" maxlength="180"></label><label>Preço anunciado (R$)<input id="mlPrice" inputmode="decimal" placeholder="299,90"></label><label>Link direto do produto<input id="mlUrl" type="url" placeholder="https://..."></label><label>Versão / capacidade / voltagem<input id="mlSpec" maxlength="160"></label></article>'+
 '<article class="compare-entry"><h3>Magalu</h3><label>Nome/modelo exato<input id="magaluName" maxlength="180"></label><label>Preço anunciado (R$)<input id="magaluPrice" inputmode="decimal" placeholder="299,90"></label><label>Link direto do produto<input id="magaluUrl" type="url" placeholder="https://..."></label><label>Versão / capacidade / voltagem<input id="magaluSpec" maxlength="160"></label></article></div>'+
 '<label class="same-product"><input id="sameProduct" type="checkbox"> Confirmei que são exatamente o mesmo produto/modelo e a mesma versão</label><button class="action whatsapp" id="comparePrices" type="button">Comparar preços informados</button>'+
 '<div id="compareResult" class="compare-result" aria-live="polite">Preencha os dados dos anúncios. Nenhum preço é capturado automaticamente.</div><p class="compare-foot">Preço anunciado não inclui frete, salvo conferência separada. Valores e disponibilidade podem mudar.</p>';
 panel.after(section);
 const style=document.createElement('style');style.textContent='.free-compare{margin-top:22px}.free-compare-note{background:#eff6ff;border:1px solid #dbeafe;border-radius:12px;padding:14px;margin:14px 0}.free-compare-note p{margin:6px 0 0;color:#475569;line-height:1.5}.compare-search{display:grid;gap:12px;margin:16px 0}.compare-search label,.compare-entry label{display:grid;gap:6px;font-size:13px;font-weight:650;color:#475569}.compare-search input,.compare-entry input{width:100%;min-width:0;padding:12px;border:1px solid #cbd5e1;border-radius:9px;font:inherit}.compare-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.compare-entry{border:1px solid #e2e8f0;border-radius:12px;padding:14px;display:grid;gap:10px;min-width:0}.compare-entry h3{margin:0 0 4px}.same-product{display:flex;align-items:center;gap:9px;margin:16px 0;font-weight:650}.same-product input{width:18px;height:18px}.compare-result{margin-top:14px;padding:14px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;line-height:1.55}.compare-result strong{color:#166534}.compare-foot{font-size:12px;color:#64748b;margin-top:12px}@media(max-width:650px){.compare-grid{grid-template-columns:1fr}.compare-search .actions{display:grid;grid-template-columns:1fr 1fr}}';document.head.append(style);
 const q=()=>document.getElementById('compareQuery').value.trim();
 document.getElementById('openCompareML').addEventListener('click',()=>{if(!q()){toast('Digite o produto que deseja pesquisar.');return}window.open('https://lista.mercadolivre.com.br/'+encodeURIComponent(q().replace(/\s+/g,'-')),'_blank','noopener,noreferrer')});
 document.getElementById('openCompareMagalu').addEventListener('click',()=>{window.open('https://www.influenciadormagalu.com.br/lojadonovinho','_blank','noopener,noreferrer');toast('Na sua loja Magalu, procure o produto dentro do nicho correspondente e confirme se está disponível para divulgação.');});
 const price=v=>{const n=Number(String(v).trim().replace(/\./g,'').replace(',','.'));return Number.isFinite(n)&&n>0?n:null};
 const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 document.getElementById('comparePrices').addEventListener('click',()=>{
  const ml={name:document.getElementById('mlName').value.trim(),price:price(document.getElementById('mlPrice').value),url:safeUrl(document.getElementById('mlUrl').value)};
  const mg={name:document.getElementById('magaluName').value.trim(),price:price(document.getElementById('magaluPrice').value),url:safeUrl(document.getElementById('magaluUrl').value)};
  const out=document.getElementById('compareResult'),stamp=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date());
  if(!ml.name||!mg.name||ml.price===null||mg.price===null||!ml.url||!mg.url){out.textContent='Preencha nome, preço válido e link https dos dois anúncios.';return}
  const links='<p><a href="'+escapeHtml(ml.url)+'" target="_blank" rel="noopener noreferrer">Abrir anúncio Mercado Livre</a> · <a href="'+escapeHtml(mg.url)+'" target="_blank" rel="noopener noreferrer">Abrir anúncio Magalu</a></p>';
  if(!document.getElementById('sameProduct').checked){out.innerHTML='<b>Comparação inconclusiva.</b> Confirme que os dois anúncios são o mesmo modelo e versão antes de escolher.<p>Mercado Livre: '+money(ml.price)+' · Magalu: '+money(mg.price)+'</p>'+links+'<small>Registrado em '+stamp+'.</small>';return}
  const winner=ml.price===mg.price?'Os dois anúncios têm o mesmo preço.':ml.price<mg.price?'Menor preço anunciado: Mercado Livre.':'Menor preço anunciado: Magalu.';
  out.innerHTML='<strong>'+winner+'</strong><p>Mercado Livre: '+money(ml.price)+' · Magalu: '+money(mg.price)+'</p><p>Diferença: '+money(Math.abs(ml.price-mg.price))+'</p>'+links+'<small>Registrado em '+stamp+'. Dados informados manualmente; confira frete, estoque e condições.</small>';
 });
})();

/* Área administrativa autenticada: pesquisa gratuita e revisão individual das ofertas. */
(function initGarimpadorAdmin(){
 const loginArea=document.getElementById('autoLoginArea'),workArea=document.getElementById('autoWorkArea');
 if(!loginArea)return;
 if(!window.supabase?.createClient){document.getElementById('autoLoginStatus').textContent='A biblioteca de acesso não carregou. Confira sua conexão e atualize a página.';return;}
 const SUPABASE_URL='https://cwnkpbwnexzulutpnnoq.supabase.co';
 const SUPABASE_ANON='sb_publishable_pTrQXc1CSpuNwiQbbpYcXA_7HS94_h5';
 const EDGE_URL=SUPABASE_URL+'/functions/v1/garimpador-auto-search';
 const ADMIN_EMAIL='pereiraeliton811@gmail.com';
 const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const status=document.getElementById('autoAuthStatus'),message=document.getElementById('autoSearchStatus'),results=document.getElementById('autoOfferResults');
 let session=null,working=false;
 const setStatus=(text,ok=false)=>{status.textContent=text;status.classList.toggle('is-ready',ok)};
 const api=async(action,extra={})=>{
  if(!session?.access_token)throw new Error('Entre no painel novamente.');
  const response=await fetch(EDGE_URL,{method:'POST',headers:{'content-type':'application/json','apikey':SUPABASE_ANON,'authorization':'Bearer '+session.access_token},body:JSON.stringify({action,...extra})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok===false)throw new Error(data.error||'Não foi possível concluir a solicitação.');
  return data;
 };
 const money=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Preço não informado';
 const card=p=>{
  const img=safeUrl(p.image_url),link=safeUrl(p.product_url),affiliate=safeUrl(p.affiliate_url);
  return '<article class="auto-offer-card" data-auto-id="'+escapeHtml(p.id)+'">'+
   '<div class="auto-offer-image">'+(img?'<img src="'+escapeHtml(img)+'" alt="" loading="lazy" onerror="this.parentElement.innerHTML=\'<span>Foto indisponível</span>\'">':'<span>Foto não fornecida pela loja</span>')+'</div>'+
   '<div class="auto-offer-info"><div class="auto-offer-labels"><span>Mercado Livre</span><span>'+escapeHtml(p.niche||'Sem nicho')+'</span><span class="pending-label">Aguardando sua revisão</span></div>'+
   '<h3>'+escapeHtml(p.title||'Produto sem título')+'</h3><strong class="auto-price">'+money(p.price)+'</strong>'+
   '<p>'+escapeHtml(p.description||'Descrição não fornecida pelo anúncio.')+'</p>'+
   '<small>Primeira captura: '+escapeHtml(fmtDate(p.first_seen_at))+' · Verificado: '+escapeHtml(fmtDate(p.last_checked_at))+'</small>'+
   '<div class="auto-offer-links">'+(link?'<a class="action" href="'+escapeHtml(link)+'" target="_blank" rel="noopener noreferrer">Ver anúncio original</a>':'')+
   (affiliate?'<a class="action" href="'+escapeHtml(affiliate)+'" target="_blank" rel="noopener noreferrer">Ver link afiliado</a>':'')+'</div>'+
   '<label class="affiliate-entry">Seu link oficial de afiliado (opcional por enquanto)<input type="url" data-auto-affiliate placeholder="Cole aqui o link gerado no portal oficial" value="'+escapeHtml(affiliate)+'"></label>'+
   '<div class="actions"><button class="action" data-auto-action="save-link" type="button">Salvar link afiliado</button><button class="action whatsapp" data-auto-action="approve" type="button">Aprovar oferta</button><button class="action" data-auto-action="ignore" type="button">Ignorar</button></div></div></article>';
 };
 const load=async()=>{
  try{const data=await api('list');const items=Array.isArray(data.items)?data.items:[];results.innerHTML=items.length?items.map(card).join(''):'<p class="ml-empty">Ainda não há ofertas pendentes. Toque em “Buscar até 20 ofertas agora”.</p>';message.textContent=items.length+' ofertas aguardando revisão.';}
  catch(e){message.textContent=e.message;toast(e.message);}
 };
 const refreshAuth=async(s)=>{
  session=s;
  if(s?.user?.email?.toLowerCase()===ADMIN_EMAIL){
   loginArea.hidden=true;workArea.hidden=false;setStatus('Acesso autorizado',true);await load();
  }else{
   session=null;loginArea.hidden=false;workArea.hidden=true;setStatus('Aguardando acesso');
  }
 };
 document.getElementById('autoLoginButton').addEventListener('click',async()=>{
  const button=document.getElementById('autoLoginButton');button.disabled=true;
  try{const {error}=await client.auth.signInWithOtp({email:ADMIN_EMAIL,options:{emailRedirectTo:window.location.href.split('#')[0]}});if(error)throw error;document.getElementById('autoLoginStatus').textContent='Link de acesso enviado para o e-mail cadastrado. Abra a mensagem no mesmo aparelho e toque no link.';toast('Confira o e-mail cadastrado.');}
  catch(e){document.getElementById('autoLoginStatus').textContent=e.message||'Não foi possível enviar o link de acesso.';toast(document.getElementById('autoLoginStatus').textContent);}
  finally{button.disabled=false;}
 });
 document.getElementById('runAutoSearch').addEventListener('click',async()=>{
  if(working)return;working=true;const button=document.getElementById('runAutoSearch');button.disabled=true;message.textContent='Pesquisando produtos públicos em vários nichos. Isso pode levar alguns minutos…';
  try{const data=await api('search');message.textContent='Pesquisa concluída: '+data.products_found+' ofertas encontradas e '+data.products_saved+' salvas para revisão. Termos pesquisados: '+data.terms_searched+'/'+data.terms_total+'.';if(data.errors?.length)message.textContent+=' Algumas pesquisas não responderam; confira os avisos.';await load();}
  catch(e){message.textContent='A pesquisa não foi concluída: '+e.message;toast(e.message);}
  finally{working=false;button.disabled=false;}
 });
 document.getElementById('refreshAutoOffers').addEventListener('click',load);
 document.getElementById('autoLogout').addEventListener('click',async()=>{await client.auth.signOut();await refreshAuth(null);});
 results.addEventListener('click',async e=>{
  const button=e.target.closest('[data-auto-action]');if(!button)return;
  const article=button.closest('[data-auto-id]');if(!article)return;
  const id=article.dataset.autoId,action=button.dataset.autoAction;
  button.disabled=true;
  try{
   if(action==='save-link'){const field=article.querySelector('[data-auto-affiliate]');const value=field.value.trim();if(!value){throw new Error('Cole primeiro o link oficial de afiliado.')}await api('save_affiliate_link',{id,affiliate_url:value});toast('Link afiliado salvo.');await load();}
   if(action==='approve'){await api('approve',{id});toast('Oferta aprovada.');await load();}
   if(action==='ignore'){await api('ignore',{id});toast('Oferta ignorada.');await load();}
  }catch(err){toast(err.message||'Não foi possível atualizar a oferta.');button.disabled=false;}
 });
 client.auth.onAuthStateChange((_event,s)=>{setTimeout(()=>refreshAuth(s),0);});
 client.auth.getSession().then(({data})=>refreshAuth(data.session));
})();
