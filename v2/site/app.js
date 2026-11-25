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

function categoryMatches(product, category) {
  const productCategory = normalize(product.category);
  const selectedCategory = normalize(category);
  if (!productCategory || !selectedCategory) return false;
  // Aceita o nome do nicho e suas variações de cadastro, sem misturar categorias distintas.
  return productCategory === selectedCategory ||
    productCategory.startsWith(selectedCategory + " ") ||
    selectedCategory.startsWith(productCategory + " ");
}

function productMatchesSearch(product, term) {
  const haystack = normalize([
    product.title,
    product.description,
    product.category,
    product.platform
  ].join(" "));
  return haystack.includes(normalize(term));
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
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
  const grid = document.querySelector("#product-grid");
  const section = document.querySelector("#vitrine");
  const count = document.querySelector("#result-count");
  if (!grid || !section || !count) return;

  const visible = products.filter(product => {
    const inCategory = !activeCategory || categoryMatches(product, activeCategory);
    const inSearch = !activeSearch || productMatchesSearch(product, activeSearch);
    return inCategory && inSearch;
  });

  section.hidden = !activeCategory && !activeSearch;
  productsTitle.textContent = activeCategory || (activeSearch ? "Resultados da busca" : "Vitrine");
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
  activateProductMarquee(grid, "product-controls");
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

function setActiveCategory(category) {
  activeCategory = activeCategory === category ? "" : category;
  categoryList.querySelectorAll("button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });
  renderProducts();
  if (activeCategory) {
    document.querySelector("#vitrine").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  activeSearch = searchInput.value.trim();
  renderProducts();
  if (activeSearch) {
    document.querySelector("#vitrine").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

searchInput.addEventListener("input", () => {
  if (!searchInput.value.trim()) {
    activeSearch = "";
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
