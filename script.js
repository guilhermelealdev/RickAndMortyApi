const API_BASE = "https://rickandmortyapi.com/api/character";
let contador = 0

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const searchButton = document.getElementById("searchButton");
const loadMoreButton = document.getElementById("loadMoreButton");

let currentPage = 1;
let currentName = "";
let currentStatus = "";
let isLoading = false;
let hasMore = true;

// Renderiza um card de personagem
function renderCharacter(character) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${character.image}" alt="${character.name}">
    <h3>${character.name}</h3>
    <p>Espécie: ${character.species}</p>
    <p>Origem: ${character.origin.name}</p>
    <p class="status ${character.status.toLowerCase()}">
      Status: ${character.status}
    </p>
  `;

  gallery.appendChild(card);

  contador++
  document.getElementById("counter").textContent = "Cards criados: " + contador;


}

// Mostra mensagem no grid (ex: nenhum encontrado)
function showMessage(text) {
  const msg = document.createElement("p");
  msg.className = "message";
  msg.textContent = text;
  gallery.appendChild(msg);
}

// Busca personagens na API
async function fetchCharacters({ reset = false } = {}) {
  if (isLoading) return;
  if (!hasMore && !reset) return;

  if (reset) {
    currentPage = 1;
    hasMore = true;
    gallery.innerHTML = "";
  }

  isLoading = true;
  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "Carregando...";

  const params = new URLSearchParams();
  params.set("page", currentPage);
  if (currentName) params.set("name", currentName);
  if (currentStatus) params.set("status", currentStatus);

  try {
    const response = await fetch(`${API_BASE}/?${params.toString()}`);

    if (!response.ok) {
      // 404 na API significa "nenhum resultado encontrado"
      if (response.status === 404) {
        hasMore = false;
        if (reset) {
          showMessage("Nenhum personagem encontrado com esses filtros.");
        }
        return;
      }
      throw new Error("Erro ao buscar personagens");
    }

    const data = await response.json();
    data.results.forEach((character, index) => {
      setTimeout(() => renderCharacter(character), index * 95);
    });

    // Atualiza para próxima página
    currentPage++;
    document.getElementById("counterPages").textContent = "Páginas criadas:" + (currentPage - 1)

    hasMore = Boolean(data.info.next);
  } catch (error) {
    console.error(error);
    if (reset) {
      showMessage("Ocorreu um erro ao carregar os personagens.");
    }
  } finally {
    isLoading = false;
    loadMoreButton.disabled = !hasMore;
    loadMoreButton.textContent = hasMore
      ? "CARREGAR MAIS"
      : "Sem mais resultados";

  }
}

// Dispara busca com filtros atuais
function applyFilters() {
  currentName = searchInput.value.trim();
  currentStatus = statusFilter.value;
  fetchCharacters({ reset: true });
}

// Eventos
searchButton.addEventListener("click", () => {
  applyFilters();
});

// Opcional: aplicar ao trocar o select também
statusFilter.addEventListener("change", () => {
  applyFilters();
});

// Enter no campo de busca também faz busca
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

// Botão "Carregar mais"
loadMoreButton.addEventListener("click", () => {
  fetchCharacters();
});

// Carrega primeira página ao abrir
window.addEventListener("DOMContentLoaded", () => {
  fetchCharacters();
});