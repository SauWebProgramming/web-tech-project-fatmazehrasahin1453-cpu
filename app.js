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
    if (searchText && !item.title.toLowerCase().includes(searchText)) {
      return false;
    }

    // Tür filtresi
    if (typeValue !== "all" && item.type !== typeValue) {
      return false;
    }

    // Yıl filtresi (2000 ve sonrası, 2010 ve sonrası, 2020 ve sonrası)
    if (yearValue !== "all" && item.year < Number(yearValue)) {
      return false;
    }

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

    // BONUS A11y: kartı buton gibi erişilebilir yap
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${item.title} detayını aç`);

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
          ${
            favoriteIds.includes(item.id)
              ? "Favoriden Çıkar"
              : "Favorilere Ekle"
          }
        </button>
      </div>
    `;

    // Kart tıklanınca detay panelini güncelle
    card.addEventListener("click", (e) => {
      // Favori butonuna tıklandıysa detay tetiklenmesin
      if (e.target.classList.contains("favorite-btn")) return;
      renderDetail(item);
    });

    // BONUS A11y: klavye ile Enter veya Space basınca da detay aç
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        renderDetail(item);
      }
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
    <div class="detail-content">
      <img 
        src="${item.poster}" 
        alt="${item.title}" 
        class="detail-poster"
        onerror="this.style.display='none';"
      />
      <div class="detail-text">
        <h2>${item.title}</h2>
        <p class="detail-meta">
          ${item.year} · ${item.type} · ${item.category} · ⭐ ${item.rating}
        </p>
        <p>${item.description}</p>
      </div>
    </div>
  `;

  // Detay panelinin iç kaydırmasını en yukarı al
  detailPanelEl.scrollTop = 0;

  // BONUS: Detay panelini görünür alana getir (başlığı yukarıdan görebil)
  detailPanelEl.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
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

// İsimle arama
searchInputEl.addEventListener("input", () => {
  renderMediaList();
});

// Tür filtresi
typeFilterEl.addEventListener("change", () => {
  renderMediaList();
});

// Yıl filtresi
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

// Filtreleri Sıfırla butonu
resetFiltersEl.addEventListener("click", () => {
  searchInputEl.value = "";
  typeFilterEl.value = "all";
  yearFilterEl.value = "all";
  showingFavoritesOnly = false;
  favoritesToggleEl.textContent = "⭐ Favorilerim";
  renderMediaList();
});

// Sayfa yüklendiğinde verileri çek
loadMediaData();
