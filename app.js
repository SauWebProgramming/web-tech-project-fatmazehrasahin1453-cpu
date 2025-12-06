// Tüm medyaları tutacağımız dizi
let allMedia = [];
let showingFavoritesOnly = false;

// DOM elemanlarını seçelim
const mediaListEl = document.getElementById("mediaList");
const detailPanelEl = document.getElementById("detailPanel");
const searchInputEl = document.getElementById("searchInput");
const typeFilterEl = document.getElementById("typeFilter");
const yearFilterEl = document.getElementById("yearFilter");
const favoritesToggleEl = document.getElementById("favoritesToggle");
const resetFiltersEl = document.getElementById("resetFilters");

// LocalStorage'tan favorileri oku
const getFavoriteIds = () => {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
};

// LocalStorage'a favorileri yaz
const setFavoriteIds = (ids) => {
  localStorage.setItem("favorites", JSON.stringify(ids));
};

// JSON dosyasından verileri çek
const loadMediaData = async () => {
  try {
    const res = await fetch("media.json");
    if (!res.ok) {
      throw new Error("JSON dosyası yüklenemedi");
    }
    const data = await res.json();
    allMedia = data;
    renderMediaList();
  } catch (err) {
    console.error(err);
    mediaListEl.innerHTML = "<p>Veriler yüklenemedi.</p>";
  }
};

// Uygulanmış filtrelere göre listeyi hesapla
const getFilteredMedia = () => {
  const searchText = searchInputEl.value.toLowerCase().trim();
  const typeValue = typeFilterEl.value;
  const yearValue = yearFilterEl.value;
  const favoriteIds = getFavoriteIds();

  return allMedia.filter((item) => {
    // Sadece favoriler gösteriliyorsa
    if (showingFavoritesOnly && !favoriteIds.includes(item.id)) return false;

    // İsim araması
    if (searchText && !item.title.toLowerCase().includes(searchText)) return false;

    // Tür filtresi
    if (typeValue !== "all" && item.type !== typeValue) return false;

    // Yıl filtresi
    if (yearValue !== "all" && item.year < Number(yearValue)) return false;

    return true;
  });
};

// Listeyi ekrana bas
const renderMediaList = () => {
  const filtered = getFilteredMedia();
  const favoriteIds = getFavoriteIds();

  if (!filtered.length) {
    mediaListEl.innerHTML = "<p>Sonuç bulunamadı.</p>";
    return;
  }

  mediaListEl.innerHTML = "";

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";

    card.innerHTML = `
      <img src="${item.poster}" alt="${item.title}" onerror="this.src='';" />
      <div class="media-card-body">
        <div class="media-card-title">${item.title}</div>
        <div class="media-card-meta">
          <span>${item.year}</span>
          <span class="badge">${item.type}</span>
        </div>
        <div class="media-card-meta">
          <span>${item.category}</span>
          <span>⭐ ${item.rating}</span>
        </div>
        <button class="favorite-btn ${
          favoriteIds.includes(item.id) ? "is-favorite" : ""
        }" data-id="${item.id}">
          ${favoriteIds.includes(item.id) ? "Favoriden Çıkar" : "Favorilere Ekle"}
        </button>
      </div>
    `;

    // Kart tıklanınca detay panelini güncelle
    card.addEventListener("click", (e) => {
      // Favori butonuna tıklandıysa detay tetiklenmesin
      if (e.target.classList.contains("favorite-btn")) return;
      renderDetail(item);
    });

    // Favori butonu tıklaması
    const favBtn = card.querySelector(".favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Kart click eventini tetiklemesin
      toggleFavorite(item.id);
    });

    mediaListEl.appendChild(card);
  });
};

// Sağdaki detay panelini güncelle
const renderDetail = (item) => {
  detailPanelEl.innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.year} · ${item.type} · ${item.category} · ⭐ ${item.rating}</p>
    <p>${item.description}</p>
  `;
};

// Favori ekle / çıkar
const toggleFavorite = (id) => {
  const favoriteIds = getFavoriteIds();
  const index = favoriteIds.indexOf(id);

  if (index === -1) {
    favoriteIds.push(id);
  } else {
    favoriteIds.splice(index, 1);
  }

  setFavoriteIds(favoriteIds);
  renderMediaList();
};

// --- EVENT LISTENER'LAR ---

// İsimle arama (eski mantık: arama + filtre birlikte çalışır)
searchInputEl.addEventListener("input", () => {
  renderMediaList();
});

// Tür filtresi değişince sadece tür filtresi güncellenir
typeFilterEl.addEventListener("change", () => {
  renderMediaList();
});

// Yıl filtresi değişince sadece yıl filtresi güncellenir
yearFilterEl.addEventListener("change", () => {
  renderMediaList();
});

// Favoriler butonu: sadece favorileri göster / hepsini göster
favoritesToggleEl.addEventListener("click", () => {
  showingFavoritesOnly = !showingFavoritesOnly;
  favoritesToggleEl.textContent = showingFavoritesOnly
    ? "⭐ Sadece Favoriler"
    : "⭐ Favorilerim";
  renderMediaList();
});

// YENİ: Filtreleri Sıfırla butonu
resetFiltersEl.addEventListener("click", () => {
  // Arama kutusunu temizle
  searchInputEl.value = "";
  // Tür filtresini sıfırla
  typeFilterEl.value = "all";
  // Yıl filtresini sıfırla
  yearFilterEl.value = "all";
  // Favori modunu kapat
  showingFavoritesOnly = false;
  favoritesToggleEl.textContent = "⭐ Favorilerim";
  // Listeyi başa döndür
  renderMediaList();
});

// Sayfa yüklendiğinde verileri çek
loadMediaData();
