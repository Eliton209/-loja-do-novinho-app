// Loja do Novinho — V2 isolada.
// Não consulta nem altera o CMS Wix. A conexão será feita após validar leitura pública segura.
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

function setActiveCategory(category) {
  activeCategory = activeCategory === category ? "" : category;
  categoryList.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });
  productsTitle.textContent = activeCategory || "Vitrine";
  document.querySelector("#vitrine").scrollIntoView({ behavior: "smooth", block: "start" });
  // O filtro será aplicado aos produtos reais quando o catálogo Wix for conectado.
}

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

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const term = searchInput.value.trim();
  resultCount.textContent = term ? "A busca será aplicada quando o catálogo estiver conectado." : "";
  if (term) document.querySelector("#vitrine").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  if (!searchInput.value.trim()) resultCount.textContent = "";
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
