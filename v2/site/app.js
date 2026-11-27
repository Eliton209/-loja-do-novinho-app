// Loja do Novinho — V2 isolada.
// Consulta o catálogo Wix apenas por leitura pública; nenhuma operação de escrita é usada.
const categories = [
  { name: "Eletrônicos", icon: "📱", subtitle: "Celulares e tecnologia" },
  { name: "Casa, móveis e decoração", icon: "🏠", subtitle: "Conforto para seu espaço" },
  { name: "Cama, mesa e banho", icon: "🛁", subtitle: "Cuidados e utilidades" },
  { name: "Cozinha", icon: "🍳", subtitle: "Praticidade no dia a dia" },
  { name: "Informática", icon: "💻", subtitle: "Tecnologia e produtividade" },
  { name: "Acessórios", icon: "⌚", subtitle: "Itens para todos os estilos" },
  { name: "Moda", icon: "👕", subtitle: "Estilo e novidades" },
  { name: "Ofertas", icon: "🏷️", subtitle: "Achadinhos e oportunidades" },
  { name: "Brinquedos e Diversão", icon: "🧸", subtitle: "Brincadeiras para todas as idades" }
];

const categoryList = document.querySelector("#category-list");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const productsTitle = document.querySelector("#products-title");
const resultCount = document.querySelector("#result-count");
const installButton = document.querySelector("#install-app");

let activeCategory = "";
let deferredInstallPrompt = null;
let products = [];
let catalogReady = false;
let activeSearch = "";
let activeQuickFilter = "";

const METRICS_ENDPOINT = "https://cwnkpbwnexzulutpnnoq.supabase.co/functions/v1/store-event-tracking-v2";
const METRICS_SOURCE = "storefront_v2";
const DEVICE_TOKEN_KEY = "ldn_metrics_device_v1";

function getMetricsDeviceToken() {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "";
  }
}

function trackStoreEvent(eventType, source = METRICS_SOURCE) {
  const deviceToken = getMetricsDeviceToken();
  if (!deviceToken) return;
  fetch(METRICS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      source,
      device_token: deviceToken,
      path: location.pathname + location.hash
    }),
    keepalive: true
  }).catch(() => {});
}

trackStoreEvent("store_open");
if (window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true) {
  trackStoreEvent("store_open", "app");
}
document.addEventListener("click", event => {
  const productCard = event.target.closest(".product-card-clickable");
  const link = event.target.closest("a");
  if (link?.href) {
    let destination;
    try { destination = new URL(link.href); } catch { return; }
    if (destination.origin === location.origin) return;
    if (destination.hostname === "chat.whatsapp.com" || destination.hostname.endsWith("whatsapp.com")) return;
  }
  if (productCard || (link && (link.rel.includes("sponsored") || link.classList.contains("buy") || link.classList.contains("platform-niche")))) {
    trackStoreEvent("enter_store_click");
  }
});


function renderCategories() {
  categoryList.replaceChildren();
  categories.forEach(({ name, icon, subtitle }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-card";
    button.dataset.category = name;
    button.setAttribute("aria-pressed", "false");

    const iconElement = document.createElement("span");
    iconElement.className = "category-icon";
    iconElement.setAttribute("aria-hidden", "true");
    iconElement.textContent = icon;

    const textGroup = document.createElement("span");
    textGroup.className = "category-text";

    const label = document.createElement("span");
    label.className = "category-name";
    label.textContent = name;

    const description = document.createElement("small");
    description.className = "category-description";
    description.textContent = subtitle;

    textGroup.append(label, description);
    button.append(iconElement, textGroup);
    button.addEventListener("click", () => setActiveCategory(name));
    categoryList.append(button);
  });
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function categoryTokens(value) {
  return normalize(value).split(" ").filter(token => token && !["e", "de", "da", "do", "das", "dos"].includes(token));
}

function categoryMatches(product, category) {
  const productTokens = categoryTokens(product.category);
  const selectedTokens = categoryTokens(category);
  if (!productTokens.length || !selectedTokens.length) return false;
  const overlap = selectedTokens.filter(token => productTokens.includes(token)).length;
  // Compara os termos relevantes da categoria, tolerando pontuação, acentos,
  // conectivos e pequenas variações usadas no cadastro do catálogo.
  return overlap === selectedTokens.length || overlap === productTokens.length ||
    overlap / Math.min(productTokens.length, selectedTokens.length) >= 0.75;
}

function productMatchesSearch(product, term) {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return true;
  const haystack = normalize([product.title, product.description, product.platform].join(" "));
  return haystack.includes(normalizedTerm);
}

function categoryNameMatchesSearch(category, term) {
  const normalizedTerm = normalize(term);
  return Boolean(normalizedTerm) && normalize(category).includes(normalizedTerm);
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function makeProductCardClickable(card, affiliateUrl) {
  if (!affiliateUrl) return;
  card.classList.add("product-card-clickable");
  card.setAttribute("role", "link");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "Abrir oferta: " + String(card.querySelector("h3")?.textContent || "produto"));
  const openOffer = () => window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  card.addEventListener("click", event => {
    // O botão "Ver oferta" já é um link real; evita abrir duas abas.
    if (event.target.closest("a, button")) return;
    openOffer();
  });
  card.addEventListener("keydown", event => {
    if (event.target !== card || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    openOffer();
  });
}

function formatPrice(value) {
  if (value === undefined || value === null || String(value).trim() === "") return "";
  const raw = String(value).trim();
  if (/^R\$/i.test(raw)) return raw;
  const numeric = Number(raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numeric) && numeric > 0
    ? numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : raw;
}

function setupProductAdvance(grid, controlsId, itemCount) {
  const controls = document.querySelector("#" + controlsId);
  if (!controls) return;
  controls.hidden = itemCount < 2;
  controls.querySelectorAll("button").forEach(button => {
    button.onclick = () => {
      const card = grid.querySelector(".product-card");
      if (!card) return;
      const direction = button.dataset.direction === "previous" ? -1 : 1;
      grid.scrollBy({
        left: (card.getBoundingClientRect().width + 18) * direction,
        behavior: "smooth"
      });
    };
  });
}

// Produtos ficam parados; o cliente navega manualmente pelo deslize ou pelos botões.
function activateProductMarquee(grid, controlsId) {
  grid.classList.remove("product-marquee");
  grid.style.removeProperty("--marquee-duration");
  setupProductAdvance(grid, controlsId, grid.querySelectorAll(".product-card").length);
}

function parseProductPrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : NaN;
  }
  if (value === undefined || value === null || String(value).trim() === "") return NaN;
  const raw = String(value).trim().replace(/[^\d,.-]/g, "");
  let normalized = raw;
  if (raw.includes(",")) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else if (/\.\d{3}$/.test(raw)) {
    normalized = raw.replace(/\./g, "");
  }
  const price = Number(normalized);
  return Number.isFinite(price) && price > 0 ? price : NaN;
}

function getProductPrice(product) {
  const savedPrice = parseProductPrice(product.price);
  if (Number.isFinite(savedPrice)) return savedPrice;
  // Muitos anúncios do catálogo trazem o preço no próprio título, sem preencher
  // o campo price. Usa o valor final após "R$" como alternativa de leitura.
  const matches = [...String(product.title || "").matchAll(/R\$\s*([\d.]+(?:,\d{1,2})?)/gi)];
  return matches.length ? parseProductPrice(matches[matches.length - 1][1]) : NaN;
}

function isPhoneUnder900(product) {
  const title = normalize(product.title);
  const category = normalize(product.category);
  const belongsToElectronics = category.includes("eletronicos");
  const phone = /\b(smartphone|celular|telefone|moto g\d|galaxy [a-z]?\d|iphone)\b/.test(title);
  const accessory = /(?:^| )(power bank|capa|pelicula|suporte|carregador|fone|acessorio|bateria externa|display avulso|tela avulsa)(?: |$)/.test(title);
  const price = getProductPrice(product);
  return belongsToElectronics && phone && !accessory && Number.isFinite(price) && price <= 900;
}

function renderProducts() {
  const categoryMode = Boolean(activeCategory);
  const quickMode = activeQuickFilter === "phones-under-900";
  const grid = document.querySelector(quickMode ? "#quick-phones-grid" : (categoryMode ? "#category-product-grid" : "#product-grid"));
  const section = document.querySelector("#vitrine");
  const count = document.querySelector(quickMode ? "#quick-phones-count" : (categoryMode ? "#category-result-count" : "#result-count"));
  if (!grid || !section || !count) return;

  // O filtro rápido consulta todos os produtos publicados, sem depender
  // do texto usado no campo de categoria do cadastro Wix.
  let visible = quickMode
    ? products.filter(isPhoneUnder900)
    : products.filter(product => !activeCategory || categoryMatches(product, activeCategory));

  // ETAPA 2: depois de identificar e abrir o nicho, procura o termo somente
  // dentro dos produtos daquele nicho. Se o termo foi o próprio nome do nicho
  // (ex.: "cama"), exibe os produtos do nicho em vez de esconder todos.
  if (activeSearch && activeCategory) {
    // Mantém somente os produtos que realmente correspondem à busca.
    // Não volta a exibir todo o nicho quando nenhum produto combina.
    visible = visible.filter(product => productMatchesSearch(product, activeSearch));
  } else if (activeSearch) {
    visible = products.filter(product => productMatchesSearch(product, activeSearch));
  }

  const categoryView = document.querySelector("#category-view");
  categoryView.hidden = !categoryMode;
  const quickModal = document.querySelector("#quick-phones-modal");
  const quickButton = document.querySelector("#quick-phones-filter");
  const quickActions = document.querySelector("#category-quick-actions");
  if (quickModal) quickModal.hidden = !quickMode;
  if (quickButton) quickButton.setAttribute("aria-expanded", String(quickMode));
  if (quickActions) quickActions.hidden = normalize(activeCategory) !== "eletronicos";
  document.body.classList.toggle("category-open", categoryMode);
  section.hidden = categoryMode || !activeSearch;
  if (categoryMode) document.querySelector("#category-products-title").textContent = activeCategory;
  else productsTitle.textContent = activeSearch ? "Resultados da busca" : "Vitrine";
  count.textContent = catalogReady
    ? visible.length + " produto(s)"
    : "Carregando catálogo…";
  grid.replaceChildren();

  if (!catalogReady) {
    const state = document.createElement("div");
    state.className = "catalog-state";
    state.textContent = "Conectando ao catálogo publicado da Loja do Novinho…";
    grid.append(state);
    return;
  }

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "catalog-state";
    empty.textContent = activeQuickFilter
      ? "No momento, não encontramos celulares publicados por até R$ 900. Confira novamente em breve."
      : "Nenhum produto encontrado nesta categoria ou busca.";
    grid.append(empty);
    return;
  }

  for (const product of visible) {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageUrl = safeHttpsUrl(product.imageUrl);
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = String(product.title || "Produto da Loja do Novinho");
      image.loading = "lazy";
      image.decoding = "async";
      card.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "product-placeholder";
      placeholder.textContent = "🛍️";
      card.append(placeholder);
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const platform = document.createElement("span");
    platform.className = "platform";
    platform.textContent = String(product.platform || "Loja parceira");

    const title = document.createElement("h3");
    title.textContent = String(product.title || "Produto");

    body.append(platform, title);

    const numericPrice = getProductPrice(product);
    const price = Number.isFinite(numericPrice)
      ? numericPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : formatPrice(product.price);
    if (price) {
      const priceElement = document.createElement("p");
      priceElement.className = "price";
      priceElement.textContent = price;
      body.append(priceElement);
    }

    const description = document.createElement("p");
    description.className = "desc";
    description.textContent = String(product.description || "Confira detalhes e disponibilidade na loja parceira.");
    body.append(description);

    const affiliateUrl = safeHttpsUrl(product.affiliateUrl);
    makeProductCardClickable(card, affiliateUrl);
    if (affiliateUrl) {
      const link = document.createElement("a");
      link.className = "buy";
      link.href = affiliateUrl;
      link.target = "_blank";
      link.rel = "sponsored nofollow noopener";
      link.textContent = "Ver oferta";
      body.append(link);
    }

    card.append(body);
    grid.append(card);
  }
  activateProductMarquee(grid, categoryMode ? "category-product-controls" : "product-controls");
}


function getCheapestProductsPerCategory(items, limit = 6) {
  const groups = new Map();
  for (const product of items) {
    const category = String(product.category || "").trim();
    const price = getProductPrice(product);
    if (!category || !Number.isFinite(price)) continue;
    const key = normalize(category);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ product, price });
  }

  const selected = [];
  for (const group of groups.values()) {
    group.sort((a, b) => a.price - b.price);
    // Até seis por categoria: se houver menos, todos os produtos com preço válido entram.
    selected.push(...group.slice(0, limit));
  }
  return selected
    .sort((a, b) => a.price - b.price)
    .map(item => item.product);
}

function renderCuradoria() {
  const section = document.querySelector("#curadoria-mercado-livre");
  const grid = document.querySelector("#curated-grid");
  if (!section || !grid) return;

  const featured = getCheapestProductsPerCategory(products, 6);
  section.hidden = !catalogReady || featured.length === 0;
  grid.replaceChildren();
  if (!catalogReady || !featured.length) return;

  for (const product of featured) {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageUrl = safeHttpsUrl(product.imageUrl);
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = String(product.title || "Produto do Mercado Livre");
      image.loading = "lazy";
      image.decoding = "async";
      card.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "product-placeholder";
      placeholder.textContent = "🛍️";
      card.append(placeholder);
    }

    const body = document.createElement("div");
    body.className = "product-body";
    const platform = document.createElement("span");
    platform.className = "platform";
    platform.textContent = String(product.platform || "Loja parceira");
    const title = document.createElement("h3");
    title.textContent = String(product.title || "Produto");
    body.append(platform, title);

    const numericPrice = getProductPrice(product);
    const price = Number.isFinite(numericPrice)
      ? numericPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : formatPrice(product.price);
    if (price) {
      const priceElement = document.createElement("p");
      priceElement.className = "price";
      priceElement.textContent = price;
      body.append(priceElement);
    }
    const description = document.createElement("p");
    description.className = "desc";
    description.textContent = String(product.description || "Confira detalhes e disponibilidade na loja parceira.");
    body.append(description);

    const affiliateUrl = safeHttpsUrl(product.affiliateUrl);
    makeProductCardClickable(card, affiliateUrl);
    if (affiliateUrl) {
      const link = document.createElement("a");
      link.className = "buy";
      link.href = affiliateUrl;
      link.target = "_blank";
      link.rel = "sponsored nofollow noopener";
      link.textContent = "Ver oferta";
      body.append(link);
    }
    card.append(body);
    grid.append(card);
  }
  activateProductMarquee(grid, "curated-controls");
}

function closeCategoryView() {
  activeCategory = "";
  activeSearch = "";
  activeQuickFilter = "";
  searchInput.value = "";
  categoryList.querySelectorAll("button").forEach(button => {
    button.setAttribute("aria-pressed", "false");
  });
  document.body.classList.remove("category-open", "returned-to-categories");
  renderProducts();
  // Retorna direto ao título e aos nichos, sem animar a passagem pelo banner.
  requestAnimationFrame(() => {
    document.querySelector("#categories-title").scrollIntoView({ behavior: "instant", block: "start" });
  });
}

function registerCategoryHistory() {
  if (!history.state?.ldnCategoryOpen) {
    history.pushState({ ldnCategoryOpen: true }, "", "#nicho");
  }
}

function setActiveCategory(category) {
  registerCategoryHistory();
  document.body.classList.remove("returned-to-categories");
  activeCategory = category;
  activeSearch = "";
  activeQuickFilter = "";
  const quickButton = document.querySelector("#quick-phones-filter");
  if (quickButton) {
    quickButton.setAttribute("aria-pressed", "false");
    quickButton.innerHTML = '<span aria-hidden="true">📱</span> Celulares até R$ 900';
  }
  searchInput.value = "";
  categoryList.querySelectorAll("button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });
  renderProducts();
  // Ao abrir um nicho, reposiciona a tela no topo da página de produtos.
  // Isso evita manter a rolagem antiga da lista de categorias após ocultá-la.
  // Espera o layout do nicho estabilizar antes de posicionar a tela.
  const scrollToCategoryProducts = () => {
    const categoryView = document.querySelector("#category-view");
    if (!categoryView || categoryView.hidden) return;
    const top = categoryView.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 12), behavior: "instant" });
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToCategoryProducts);
    window.setTimeout(scrollToCategoryProducts, 350);
  });
}

document.querySelector("#quick-phones-filter").addEventListener("click", () => {
  activeQuickFilter = "phones-under-900";
  activeSearch = "";
  searchInput.value = "";
  renderProducts();
});
document.querySelector("#close-quick-phones").addEventListener("click", () => {
  activeQuickFilter = "";
  renderProducts();
});
document.querySelector("#quick-phones-modal").addEventListener("click", event => {
  if (event.target.matches("[data-close-quick-filter]")) {
    activeQuickFilter = "";
      renderProducts();
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && activeQuickFilter) {
    activeQuickFilter = "";
      renderProducts();
  }
});

document.querySelector("#back-to-categories").addEventListener("click", () => {
  if (history.state?.ldnCategoryOpen) {
    history.back();
    return;
  }
  closeCategoryView();
});

window.addEventListener("popstate", () => {
  if (activeCategory) closeCategoryView();
});

searchForm.addEventListener("submit", event => {
  activeQuickFilter = "";
  const quickButton = document.querySelector("#quick-phones-filter");
  if (quickButton) {
    quickButton.setAttribute("aria-pressed", "false");
    quickButton.innerHTML = '<span aria-hidden="true">📱</span> Celulares até R$ 900';
  }
  event.preventDefault();
  activeSearch = searchInput.value.trim();
  activeCategory = "";

  if (activeSearch && catalogReady) {
    // ETAPA 1: identifica o nicho a partir do próprio termo pesquisado ou
    // da categoria dos produtos cujo nome/descrição corresponde à pesquisa.
    const directCategory = categories.find(category => categoryNameMatchesSearch(category.name, activeSearch));
    const productMatches = products.filter(product => productMatchesSearch(product, activeSearch));
    const categoryCounts = categories
      .map(category => ({
        name: category.name,
        count: productMatches.filter(product => categoryMatches(product, category.name)).length
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);

    if (directCategory) {
      activeCategory = directCategory.name;
    } else if (categoryCounts.length) {
      activeCategory = categoryCounts[0].name;
    }
    if (activeCategory) registerCategoryHistory();
  }

  categoryList.querySelectorAll("button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });

  const feedback = document.querySelector("#search-feedback");
  // A busca só é considerada encontrada quando há produto correspondente.
  // Reconhecer o nome do nicho serve para filtrar, mas não substitui o produto.
  const hasMatches = activeSearch
    ? products.some(product => productMatchesSearch(product, activeSearch))
    : Boolean(activeCategory);

  if (activeSearch && catalogReady && !hasMatches) {
    // Sem resultados: mensagem junto à busca, sem deslocar a página.
    feedback.textContent = "Não encontramos esse produto. Tente outro nome.";
    feedback.hidden = false;
    document.querySelector("#vitrine").hidden = true;
    document.querySelector("#category-view").hidden = true;
    return;
  }

  feedback.hidden = true;
  renderProducts();

  if (activeCategory) {
    document.querySelector("#category-view").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

searchInput.addEventListener("input", () => {
  if (!searchInput.value.trim()) {
    activeSearch = "";
    document.querySelector("#search-feedback").hidden = true;
    document.querySelector("#vitrine").hidden = false;
    renderProducts();
  }
});

// O botão fica oculto somente quando a vitrine já está instalada (standalone).
const standaloneDisplayMode = window.matchMedia("(display-mode: standalone)");

function syncInstallButtonVisibility() {
  const isStandalone = standaloneDisplayMode.matches || window.navigator.standalone === true;
  installButton.hidden = isStandalone;
}

syncInstallButtonVisibility();
standaloneDisplayMode.addEventListener?.("change", syncInstallButtonVisibility);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncInstallButtonVisibility();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
  trackStoreEvent("install_confirmed", "app");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    resultCount.textContent = "Para instalar, abra o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”.";
    return;
  }
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  try {
    await promptEvent.prompt();
    await promptEvent.userChoice;
  } finally {
    syncInstallButtonVisibility();
  }
});

renderCategories();
renderProducts();

import("./catalog.js")
  .then(({ loadPublishedProducts }) => loadPublishedProducts())
  .then(items => {
    products = items;
    catalogReady = true;
    renderProducts();
    renderCuradoria();
  })
  .catch(error => {
    catalogReady = true;
    const grid = document.querySelector("#product-grid");
    const state = document.createElement("div");
    state.className = "catalog-state";
    state.textContent = "Não foi possível carregar o catálogo agora. Tente novamente mais tarde.";
    grid.replaceChildren(state);
    renderCuradoria();
    console.error("Falha na leitura do catálogo Wix:", error);
  });

// Registra o service worker na raiz para controlar a vitrine e permitir o modo instalado.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(error => {
      console.warn("Não foi possível registrar o service worker:", error);
    });
  });
}
