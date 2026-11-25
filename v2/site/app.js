// Loja do Novinho — V2 isolada.
// Ainda não consulta nem altera o CMS Wix. A camada de leitura pública será ligada
// somente depois de validar o método de autenticação de visitante sem segredos no navegador.
const categories = [
  "Informática",
  "Cozinha",
  "Cama, mesa e banho",
  "Casa, móveis e decoração",
  "Eletrônicos",
  "Ofertas",
  "Acessórios",
  "Brinquedos e Diversão",
  "Moda"
];

const categoryList = document.querySelector("#category-list");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const productsTitle = document.querySelector("#products-title");
const resultCount = document.querySelector("#result-count");

let activeCategory = "Todas";
let searchTerm = "";

function setActiveCategory(category) {
  activeCategory = category;
  categoryList.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === category));
  });
  productsTitle.textContent = category === "Todas" ? "Vitrine" : category;
  // O filtro será aplicado à lista real após a integração pública somente-leitura.
}

function renderCategories() {
  const all = ["Todas", ...categories];
  categoryList.replaceChildren();
  all.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip";
    button.dataset.category = category;
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => setActiveCategory(category));
    categoryList.append(button);
  });
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchTerm = searchInput.value.trim();
  // A busca será ligada aos campos title e description do catálogo Wix.
  resultCount.textContent = searchTerm ? "Busca preparada" : "";
});

searchInput.addEventListener("input", () => {
  if (!searchInput.value.trim()) {
    searchTerm = "";
    resultCount.textContent = "";
  }
});

renderCategories();
