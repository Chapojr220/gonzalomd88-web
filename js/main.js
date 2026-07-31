/* =========================================================
   CARRUSEL DE PROYECTOS MUSICALES
========================================================= */

const musicCarousel = document.querySelector(".music-carousel");
const previousMusicButton = document.querySelector(
  ".music-carousel__button--prev",
);
const nextMusicButton = document.querySelector(".music-carousel__button--next");

if (musicCarousel && previousMusicButton && nextMusicButton) {
  const getScrollDistance = () => {
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
      left: -getScrollDistance(),
      behavior: "smooth",
    });
  });

  nextMusicButton.addEventListener("click", () => {
    musicCarousel.scrollBy({
      left: getScrollDistance(),
      behavior: "smooth",
    });
  });
}

/* Impide que varios tracks se reproduzcan al mismo tiempo */
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
   CARRUSEL DE PRODUCTOS
========================================================= */

// Recuperamos el carrusel y sus dos botones.
const productsCarousel = document.querySelector(".products__grid");
const previousProductButton = document.querySelector(
  ".products-carousel__button--prev",
);
const nextProductButton = document.querySelector(
  ".products-carousel__button--next",
);

// Solo ejecutamos el código si los tres elementos existen.
if (productsCarousel && previousProductButton && nextProductButton) {
  /**
   * Calcula cuánto debe desplazarse el carrusel.
   * Utilizamos el ancho real de una tarjeta más el espacio entre tarjetas.
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

  // Desplazamiento hacia la izquierda.
  previousProductButton.addEventListener("click", () => {
    productsCarousel.scrollBy({
      left: -getProductScrollDistance(),
      behavior: "smooth",
    });
  });

  // Desplazamiento hacia la derecha.
  nextProductButton.addEventListener("click", () => {
    productsCarousel.scrollBy({
      left: getProductScrollDistance(),
      behavior: "smooth",
    });
  });
}
