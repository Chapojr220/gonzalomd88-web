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
   Fonctionne aussi avec les lecteurs créés dynamiquement
   ========================================================= */

  document.addEventListener(
    "play",
    (event) => {
      const currentPlayer = event.target;

      if (
        !(currentPlayer instanceof HTMLAudioElement) ||
        !currentPlayer.closest(".track")
      ) {
        return;
      }

      const audioPlayers = document.querySelectorAll(".track audio");

      audioPlayers.forEach((otherPlayer) => {
        if (otherPlayer !== currentPlayer) {
          otherPlayer.pause();
        }
      });
    },
    true,
  );

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
// SUPABASE : RÉCUPÉRATION DES CONTENUS DU SITE
// =========================================================

async function loadSiteContentFromSupabase() {
  const { data: contents, error } = await window.supabaseClient
    .from("site_content")
    .select("content_key, content_value")
    .eq("is_active", true);

  if (error) {
    console.error("❌ Erreur lors du chargement des contenus du site :", error);
    return;
  }

  console.log("✅ Contenus récupérés depuis Supabase :", contents);

  contents.forEach((content) => {
    const element = document.querySelector(
      `[data-content-key="${content.content_key}"]`,
    );

    if (!element) {
      return;
    }

    element.textContent = content.content_value;
  });
}

loadSiteContentFromSupabase();

// =========================================================
// SUPABASE : RÉCUPÉRATION DES PARAMÈTRES GLOBAUX
// =========================================================

async function loadSiteSettingsFromSupabase() {
  const { data: settings, error } = await window.supabaseClient
    .from("site_settings")
    .select("site_name, contact_email, calendly_url, whatsapp_url")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "❌ Erreur lors du chargement des paramètres globaux :",
      error,
    );
    return;
  }

  if (!settings) {
    console.warn("⚠️ Aucun paramètre global trouvé.");
    return;
  }

  console.log("✅ Paramètres globaux récupérés :", settings);

  // ---------------------------------------------------------
  // NOM DU SITE
  // ---------------------------------------------------------

  document.querySelectorAll('[data-setting="site_name"]').forEach((element) => {
    if (!settings.site_name) return;

    element.textContent = settings.site_name;
  });

  // ---------------------------------------------------------
  // EMAIL
  // ---------------------------------------------------------

  document
    .querySelectorAll('[data-setting="contact_email"]')
    .forEach((link) => {
      if (!settings.contact_email) return;

      link.textContent = settings.contact_email;
      link.href = `mailto:${settings.contact_email}`;
    });

  // ---------------------------------------------------------
  // CALENDLY
  // ---------------------------------------------------------

  document.querySelectorAll('[data-setting="calendly_url"]').forEach((link) => {
    if (!settings.calendly_url) return;

    link.href = settings.calendly_url;
  });

  // ---------------------------------------------------------
  // WHATSAPP
  // ---------------------------------------------------------

  document.querySelectorAll('[data-setting="whatsapp_url"]').forEach((link) => {
    if (!settings.whatsapp_url) return;

    link.href = settings.whatsapp_url;
  });
}

loadSiteSettingsFromSupabase();

// =========================================================
// SUPABASE : RÉCUPÉRATION DES RÉSEAUX SOCIAUX
// =========================================================

async function loadSocialLinksFromSupabase() {
  const { data: socialLinks, error } = await window.supabaseClient
    .from("social_links")
    .select("slug, label, url, icon_class, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Erreur lors du chargement des réseaux sociaux :", error);
    return;
  }

  console.log("✅ Réseaux sociaux récupérés :", socialLinks);

  const socialContainers = document.querySelectorAll(
    '[data-social-links="global"]',
  );

  socialContainers.forEach((container) => {
    container.innerHTML = "";

    const displayMode = container.dataset.socialDisplay || "icon";

    socialLinks.forEach((social) => {
      if (!social.url) {
        return;
      }

      const link = document.createElement("a");

      link.href = social.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", social.label);

      if (displayMode === "text") {
        const listItem = document.createElement("li");

        link.textContent = social.label;

        listItem.appendChild(link);
        container.appendChild(listItem);

        return;
      }

      link.innerHTML = `
        <i class="${social.icon_class}" aria-hidden="true"></i>
      `;

      container.appendChild(link);
    });
  });
}

loadSocialLinksFromSupabase();

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
      ),
      release_links (
        id,
        platform,
        url,
        display_order,
        is_visible,
        music_platforms (
          slug,
          label,
          icon_class,
          is_active
        )
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

    const visibleLinks = (release.release_links || [])
      .filter((link) => link.is_visible && link.music_platforms?.is_active)
      .sort((a, b) => a.display_order - b.display_order);

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

        ${
          visibleLinks.length > 0
            ? `
              <div class="release-card__platforms">
                ${visibleLinks
                  .map(
                    (link) => `
                      <a
                        href="${link.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${link.music_platforms.label}"
                        title="${link.music_platforms.label}"
                      >
                        <i
                          class="${link.music_platforms.icon_class}"
                          aria-hidden="true"
                        ></i>
                      </a>
                    `,
                  )
                  .join("")}
              </div>
            `
            : ""
        }
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
