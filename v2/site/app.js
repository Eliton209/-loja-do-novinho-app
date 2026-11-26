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

function renderProducts() {
  const categoryMode = Boolean(activeCategory);
  const grid = document.querySelector(categoryMode ? "#category-product-grid" : "#product-grid");
  const section = document.querySelector("#vitrine");
  const count = document.querySelector(categoryMode ? "#category-result-count" : "#result-count");
  if (!grid || !section || !count) return;

  let visible = products.filter(product =>
    !activeCategory || categoryMatches(product, activeCategory)
  );

  // ETAPA 2: depois de identificar e abrir o nicho, procura o termo somente
  // dentro dos produtos daquele nicho. Se o termo foi o próprio nome do nicho
  // (ex.: "cama"), exibe os produtos do nicho em vez de esconder todos.
  if (activeSearch && activeCategory) {
    const withinCategory = visible.filter(product => productMatchesSearch(product, activeSearch));
    visible = withinCategory.length ? withinCategory : visible;
  } else if (activeSearch) {
    visible = products.filter(product => productMatchesSearch(product, activeSearch));
  }

  const categoryView = document.querySelector("#category-view");
  categoryView.hidden = !categoryMode;
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
    empty.textContent = "Nenhum produto encontrado nesta categoria ou busca.";
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

    const price = formatPrice(product.price);
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


function isMercadoLivre(product) {
  const platform = normalize(product.platform);
  return platform.includes("mercado livre") || platform.includes("mercadolivre");
}

function renderCuradoria() {
  const section = document.querySelector("#curadoria-mercado-livre");
  const grid = document.querySelector("#curated-grid");
  if (!section || !grid) return;

  const featured = products.filter(isMercadoLivre);
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
    platform.textContent = "Mercado Livre";
    const title = document.createElement("h3");
    title.textContent = String(product.title || "Produto");
    body.append(platform, title);

    const price = formatPrice(product.price);
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
  searchInput.value = "";
  categoryList.querySelectorAll("button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });
  renderProducts();
}

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
  const hasMatches = activeSearch
    ? categories.some(category => categoryNameMatchesSearch(category.name, activeSearch)) ||
      products.some(product => productMatchesSearch(product, activeSearch))
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

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    resultCount.textContent = "Para instalar, abra o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”.";
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
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
