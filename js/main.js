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
