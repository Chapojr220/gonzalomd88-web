/* =========================================================
   MAIN.JS — GONZALO MD88
   Menu mobile, carrousels et lecteurs audio
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     01. MENU HAMBURGER MOBILE
     ========================================================= */

  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".navbar__toggle");
  const navbarMenu = document.querySelector(".navbar__menu");

  /**
   * Ferme complètement le menu mobile.
   */
  function closeMobileMenu() {
    if (!menuToggle || !navbarMenu) return;

    menuToggle.classList.remove("is-active");
    navbarMenu.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú de navegación");

    document.body.classList.remove("menu-open");
  }

  if (header && menuToggle && navbarMenu) {
    /* Ouvrir ou fermer avec le bouton hamburger */
    menuToggle.addEventListener("click", () => {
      const menuIsOpen = navbarMenu.classList.toggle("is-open");

      menuToggle.classList.toggle("is-active", menuIsOpen);

      menuToggle.setAttribute("aria-expanded", String(menuIsOpen));

      menuToggle.setAttribute(
        "aria-label",
        menuIsOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación",
      );

      document.body.classList.toggle("menu-open", menuIsOpen);
    });

    /* Fermer automatiquement après un clic sur un lien */
    navbarMenu.querySelectorAll(".navbar__link").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    /* Fermer en cliquant en dehors du header */
    document.addEventListener("click", (event) => {
      const clickedOutsideHeader = !header.contains(event.target);

      if (navbarMenu.classList.contains("is-open") && clickedOutsideHeader) {
        closeMobileMenu();
      }
    });

    /* Fermer avec la touche Escape */
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navbarMenu.classList.contains("is-open")) {
        closeMobileMenu();
        menuToggle.focus();
      }
    });

    /* Nettoyer l’état lorsque l’on revient sur desktop */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    });
  }

  /* =========================================================
     02. CARRUSEL DE PROYECTOS MUSICALES
     ========================================================= */

  const musicCarousel = document.querySelector(".music-carousel");

  const previousMusicButton = document.querySelector(
    ".music-carousel__button--prev",
  );

  const nextMusicButton = document.querySelector(
    ".music-carousel__button--next",
  );

  if (musicCarousel && previousMusicButton && nextMusicButton) {
    /**
     * Calcule la distance nécessaire pour avancer
     * d’une carte complète dans le carrousel.
     */
    const getMusicScrollDistance = () => {
      const firstCard = musicCarousel.querySelector(".release-card");

      if (!firstCard) {
        return 420;
      }

      const cardWidth = firstCard.getBoundingClientRect().width;

      const carouselGap = 24;

      return cardWidth + carouselGap;
    };

    previousMusicButton.addEventListener("click", () => {
      musicCarousel.scrollBy({
        left: -getMusicScrollDistance(),
        behavior: "smooth",
      });
    });

    nextMusicButton.addEventListener("click", () => {
      musicCarousel.scrollBy({
        left: getMusicScrollDistance(),
        behavior: "smooth",
      });
    });
  }

  /* =========================================================
     03. LECTEURS AUDIO
     Empêche plusieurs morceaux de jouer simultanément
     ========================================================= */

  const audioPlayers = document.querySelectorAll(".track audio");

  audioPlayers.forEach((currentPlayer) => {
    currentPlayer.addEventListener("play", () => {
      audioPlayers.forEach((otherPlayer) => {
        if (otherPlayer !== currentPlayer) {
          otherPlayer.pause();
        }
      });
    });
  });

  /* =========================================================
     04. CARRUSEL DE PRODUITS
     ========================================================= */

  const productsCarousel = document.querySelector(".products__grid");

  const previousProductButton = document.querySelector(
    ".products-carousel__button--prev",
  );

  const nextProductButton = document.querySelector(
    ".products-carousel__button--next",
  );

  if (productsCarousel && previousProductButton && nextProductButton) {
    /**
     * Calcule la distance nécessaire pour avancer
     * d’une carte produit complète.
     */
    const getProductScrollDistance = () => {
      const firstProductCard = productsCarousel.querySelector(".product-card");

      if (!firstProductCard) {
        return 414;
      }

      const cardWidth = firstProductCard.getBoundingClientRect().width;

      const carouselGap = 24;

      return cardWidth + carouselGap;
    };

    previousProductButton.addEventListener("click", () => {
      productsCarousel.scrollBy({
        left: -getProductScrollDistance(),
        behavior: "smooth",
      });
    });

    nextProductButton.addEventListener("click", () => {
      productsCarousel.scrollBy({
        left: getProductScrollDistance(),
        behavior: "smooth",
      });
    });
  }
});

const productsGrid = document.getElementById("productsGrid");

console.log("✅ Grille produits trouvée :", productsGrid);

const productsCounter = document.getElementById("productsCounter");

console.log("✅ Compteur produits trouvé :", productsCounter);

const musicCarousel = document.getElementById("musicCarousel");

console.log("✅ Carrousel musique trouvé :", musicCarousel);

const musicCounter = document.getElementById("musicCounter");

console.log("✅ Compteur musique trouvé :", musicCounter);

// =========================================================
// SUPABASE : RÉCUPÉRATION DES PRODUITS
// =========================================================

async function loadProductsFromSupabase() {
  const { data: products, error } = await window.supabaseClient
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Erreur lors du chargement des produits :", error);
    return;
  }

  console.log("✅ Produits récupérés depuis Supabase :", products);

  if (!products || products.length === 0) {
    console.warn("⚠️ Aucun produit publié trouvé.");
    return;
  }

  productsCounter.textContent = `${String(products.length).padStart(2, "0")} PRODUCTOS DIGITALES`;

  products.forEach((product) => {
    const dynamicCard = document.createElement("article");
    dynamicCard.classList.add("product-card");

    dynamicCard.innerHTML = `
    <div class="product-card__image">
      <img
        src="${product.cover_image_url}"
        alt="Portada de ${product.title}"
      />
    </div>

    <div class="product-card__content">
      <p class="product-card__type">
        ${product.product_type}
      </p>

      <h3 class="product-card__title">
        ${product.title}
      </h3>

      <p class="product-card__description">
        ${
          product.short_description ||
          "Producto digital diseñado para productores."
        }
      </p>

      <div class="product-card__footer">
        <p class="product-card__price">
          $${Number(product.price ?? 0).toFixed(2)} ${product.currency}
        </p>

        <a class="button button--dark" href="#">
          Descubrir
        </a>
      </div>
    </div>
  `;

    productsGrid.appendChild(dynamicCard);
  });
}

if (!productsGrid) {
  console.error("❌ La grille #productsGrid est introuvable.");
} else {
  loadProductsFromSupabase();
}

// =========================================================
// SUPABASE : RÉCUPÉRATION DES RELEASES
// =========================================================

async function loadReleasesFromSupabase() {
  const { data: releases, error } = await window.supabaseClient
    .from("releases")
    .select(
      `
  *,
  tracks (
    id,
    title,
    track_number,
    audio_url,
    display_order,
    is_published
  )
`,
    )
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Erreur Supabase :", error);
    console.log("Releases :", releases);
    return;
  }

  console.log("❗Erreur éventuelle :", error);
  console.log("✅ Releases récupérées depuis Supabase :", releases);

  const totalTracks = releases.reduce((total, release) => {
    return total + (release.tracks || []).length;
  }, 0);

  musicCounter.textContent =
    `${String(releases.length).padStart(2, "0")} PROYECTOS · ` +
    `${String(totalTracks).padStart(2, "0")} TRACKS`;

  musicCarousel.innerHTML = "";

  releases.forEach((release) => {
    const releaseCard = document.createElement("article");

    releaseCard.classList.add("release-card");

    releaseCard.innerHTML = `
    <div class="release-card__image">
      <img
        src="${release.cover_image_url}"
        alt="Portada de ${release.title}"
      />
    </div>

    <div class="release-card__content">
      <p class="release-card__type">
        ${release.release_type}
      </p>

      <h3 class="release-card__title">
        ${release.title}
      </h3>

      <p class="release-card__meta">
        ${release.release_year} · ${release.genre}
      </p>

      <div class="track-list">
  ${(release.tracks || [])
    .filter((track) => track.is_published)
    .sort((a, b) => a.display_order - b.display_order)
    .map(
      (track) => `
        <div class="track">
          <p class="track__name">
            ${String(track.track_number).padStart(2, "0")}. ${track.title}
          </p>

          <audio
            controls
            preload="none"
            controlslist="nodownload noplaybackrate"
            oncontextmenu="return false;"
          >
            <source
              src="${track.audio_url}"
              type="audio/mpeg"
            />
          </audio>
        </div>
      `,
    )
    .join("")}
</div>
    </div>
  `;

    musicCarousel.appendChild(releaseCard);
  });
}

if (!musicCarousel) {
  console.error("❌ Le carrousel musique est introuvable.");
} else {
  loadReleasesFromSupabase();
}
