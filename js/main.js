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

const productsCounter = document.getElementById("productsCounter");

const musicCarousel = document.getElementById("musicCarousel");

const musicCounter = document.getElementById("musicCounter");

// =========================================================
// SUPABASE : RÉCUPÉRATION DES CONTENUS DU SITE
// =========================================================

async function loadSiteContentFromSupabase() {
  const { data: contents, error } = await window.supabaseClient
    .from("site_content")
    .select("content_key, content_value")
    .eq("is_active", true);

  if (error) {
    console.error("❌ Erreur lors du chargement des contenus du site.");
    return;
  }

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
    console.error("❌ Erreur lors du chargement des paramètres globaux.");
    return;
  }

  if (!settings) {
    console.warn("⚠️ Aucun paramètre global trouvé.");
    return;
  }

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
      link.hidden = false;
    });

  // ---------------------------------------------------------
  // CALENDLY
  // ---------------------------------------------------------

  document
    .querySelectorAll('[data-setting="calendly_url"]')
    .forEach((element) => {
      if (!settings.calendly_url) {
        return;
      }

      // Si l'élément est un lien classique
      if (element.tagName === "A") {
        element.href = settings.calendly_url;
        element.hidden = false;
        return;
      }

      // Si l'élément est le widget Calendly
      if (element.classList.contains("calendly-inline-widget")) {
        element.dataset.url = settings.calendly_url;
      }
    });

  // ---------------------------------------------------------
  // WHATSAPP
  // ---------------------------------------------------------

  document.querySelectorAll('[data-setting="whatsapp_url"]').forEach((link) => {
    if (!settings.whatsapp_url) return;

    link.href = settings.whatsapp_url;

    if (link.closest(".contact__links")) {
      link.hidden = false;
    }
  });
}

// =========================================================
// CALENDLY : CHARGEMENT DYNAMIQUE DU WIDGET
// =========================================================

function loadCalendlyWidget() {
  // ---------------------------------------------------------
  // Vérifie si la page contient réellement un widget Calendly
  // ---------------------------------------------------------

  const calendlyWidget = document.querySelector(".calendly-inline-widget");

  // index.html ne possède pas forcément de widget Calendly.
  // Dans ce cas, on arrête simplement la fonction.
  if (!calendlyWidget) {
    return;
  }

  // ---------------------------------------------------------
  // Vérifie qu'une URL Calendly est disponible
  // ---------------------------------------------------------

  const calendlyUrl = calendlyWidget.dataset.url;

  if (!calendlyUrl) {
    console.warn("⚠️ Aucune URL Calendly disponible.");
    return;
  }

  // ---------------------------------------------------------
  // Évite de charger plusieurs fois le script Calendly
  // ---------------------------------------------------------

  if (document.querySelector('script[data-calendly-script="true"]')) {
    return;
  }

  // ---------------------------------------------------------
  // Création dynamique du script officiel Calendly
  // ---------------------------------------------------------

  const calendlyScript = document.createElement("script");

  calendlyScript.src = "https://assets.calendly.com/assets/external/widget.js";

  calendlyScript.async = true;
  calendlyScript.dataset.calendlyScript = "true";

  // ---------------------------------------------------------
  // Confirmation dans la console
  // ---------------------------------------------------------

  calendlyScript.addEventListener("load", () => {});

  // ---------------------------------------------------------
  // Ajout du script dans la page
  // ---------------------------------------------------------

  document.body.appendChild(calendlyScript);
}

loadSiteSettingsFromSupabase().then(() => {
  loadCalendlyWidget();
});

// =========================================================
// SUPABASE : RÉCUPÉRATION DES RÉSEAUX SOCIAUX
// =========================================================

async function loadSocialLinksFromSupabase() {
  const { data: socialLinks, error } = await window.supabaseClient
    .from("social_links")
    .select("slug, label, url, icon_class, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Erreur lors du chargement des réseaux sociaux.");
    return;
  }

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
    console.error("❌ Erreur lors du chargement des produits.");
    return;
  }

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
    console.error("❌ Erreur lors du chargement des releases.");
    return;
  }

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

// =========================================================
// DASHBOARD LOGIN — AUTENTICACIÓN Y ACCESO AL CMS
// =========================================================
// Este bloque gestiona:
//
// - mostrar / ocultar la contraseña;
// - iniciar sesión con Supabase Auth;
// - comprobar que el usuario existe realmente;
// - comprobar que el usuario está autorizado en admin_users;
// - redirigir hacia dashboard.html;
// - mostrar mensajes de error;
// - redirigir automáticamente si ya existe una sesión válida.
//
// Este código solamente se ejecuta si estamos en
// dashboard-login.html.
// =========================================================

// =========================================================
// ELEMENTOS DEL LOGIN
// =========================================================

const dashboardLoginForm = document.querySelector("#dashboard-login-form");

const dashboardEmailInput = document.querySelector("#dashboard-email");

const dashboardPasswordInput = document.querySelector("#dashboard-password");

const dashboardPasswordToggle = document.querySelector(
  "#dashboard-password-toggle",
);

const dashboardPasswordIcon = document.querySelector(
  "#dashboard-password-icon",
);

const dashboardLoginSubmit = document.querySelector("#dashboard-login-submit");

const dashboardLoginMessage = document.querySelector(
  "#dashboard-login-message",
);

// =========================================================
// MENSAJES DEL LOGIN
// =========================================================
// Permite mostrar mensajes de error o éxito sin duplicar
// código dentro del formulario.
// =========================================================

function showDashboardLoginMessage(message, type = "error") {
  if (!dashboardLoginMessage) {
    return;
  }

  dashboardLoginMessage.textContent = message;

  dashboardLoginMessage.classList.remove(
    "dashboard-login__message--error",
    "dashboard-login__message--success",
  );

  dashboardLoginMessage.classList.add(`dashboard-login__message--${type}`);

  dashboardLoginMessage.hidden = false;
}

// =========================================================
// OCULTAR MENSAJE
// =========================================================

function hideDashboardLoginMessage() {
  if (!dashboardLoginMessage) {
    return;
  }

  dashboardLoginMessage.hidden = true;
  dashboardLoginMessage.textContent = "";

  dashboardLoginMessage.classList.remove(
    "dashboard-login__message--error",
    "dashboard-login__message--success",
  );
}

// =========================================================
// ESTADO DEL BOTÓN
// =========================================================
// Evita enviar varias veces el formulario mientras
// Supabase está procesando la conexión.
// =========================================================

function setDashboardLoginLoading(isLoading) {
  if (!dashboardLoginSubmit) {
    return;
  }

  dashboardLoginSubmit.disabled = isLoading;

  dashboardLoginSubmit.innerHTML = isLoading
    ? `
      <span>Conectando...</span>
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `
    : `
      <span>Entrar al dashboard</span>
      <i class="bi bi-arrow-right" aria-hidden="true"></i>
    `;
}

// =========================================================
// MOSTRAR / OCULTAR CONTRASEÑA
// =========================================================

if (
  dashboardPasswordToggle &&
  dashboardPasswordInput &&
  dashboardPasswordIcon
) {
  dashboardPasswordToggle.addEventListener("click", () => {
    const passwordIsHidden = dashboardPasswordInput.type === "password";

    dashboardPasswordInput.type = passwordIsHidden ? "text" : "password";

    dashboardPasswordToggle.setAttribute(
      "aria-pressed",
      String(passwordIsHidden),
    );

    dashboardPasswordToggle.setAttribute(
      "aria-label",
      passwordIsHidden ? "Ocultar contraseña" : "Mostrar contraseña",
    );

    dashboardPasswordIcon.className = passwordIsHidden
      ? "bi bi-eye-slash"
      : "bi bi-eye";
  });
}

// =========================================================
// VERIFICAR AUTORIZACIÓN CMS
// =========================================================
// Supabase Auth confirma la identidad.
//
// Después consultamos admin_users.
// Gracias a RLS, el usuario solamente puede leer
// su propia fila.
//
// Si no existe ninguna fila, el usuario puede estar
// autenticado pero NO está autorizado para entrar al CMS.
// =========================================================

async function getCurrentCmsAdmin() {
  const {
    data: { user },
    error: userError,
  } = await window.supabaseClient.auth.getUser();

  if (userError) {
    console.error("❌ Error al verificar el usuario autenticado.");

    return null;
  }

  if (!user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await window.supabaseClient
    .from("admin_users")
    .select("user_id, display_name, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("❌ Error al comprobar los permisos CMS.");

    return null;
  }

  if (!adminUser) {
    return null;
  }

  if (!["owner", "admin"].includes(adminUser.role)) {
    return null;
  }

  return {
    user,
    adminUser,
  };
}

// =========================================================
// CONEXIÓN AL DASHBOARD
// =========================================================

if (dashboardLoginForm) {
  dashboardLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideDashboardLoginMessage();

    const email = dashboardEmailInput?.value.trim();
    const password = dashboardPasswordInput?.value;

    // -----------------------------------------------------
    // VALIDACIÓN BÁSICA
    // -----------------------------------------------------

    if (!email || !password) {
      showDashboardLoginMessage(
        "Introduce tu correo electrónico y tu contraseña.",
      );

      return;
    }

    setDashboardLoginLoading(true);

    try {
      // ---------------------------------------------------
      // 1. AUTENTICACIÓN SUPABASE
      // ---------------------------------------------------

      const { error: signInError } =
        await window.supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        console.error("❌ Error de autenticación.");

        showDashboardLoginMessage(
          "Correo electrónico o contraseña incorrectos.",
        );

        return;
      }

      // ---------------------------------------------------
      // 2. VERIFICACIÓN DE AUTORIZACIÓN CMS
      // ---------------------------------------------------

      const cmsAdmin = await getCurrentCmsAdmin();

      if (!cmsAdmin) {
        // El usuario existe en Auth, pero no tiene
        // autorización dentro del CMS.

        await window.supabaseClient.auth.signOut({
          scope: "local",
        });

        showDashboardLoginMessage(
          "Tu cuenta no está autorizada para acceder al dashboard.",
        );

        return;
      }

      // ---------------------------------------------------
      // 3. ACCESO AUTORIZADO
      // ---------------------------------------------------

      showDashboardLoginMessage(
        `Bienvenido, ${cmsAdmin.adminUser.display_name}.`,
        "success",
      );

      // Pequeña pausa visual antes de entrar al dashboard.
      window.setTimeout(() => {
        window.location.href = "./dashboard.html";
      }, 500);
    } catch (error) {
      console.error("❌ Error inesperado durante el login.");

      showDashboardLoginMessage(
        "Se ha producido un error inesperado. Inténtalo de nuevo.",
      );
    } finally {
      setDashboardLoginLoading(false);
    }
  });
}

// =========================================================
// USUARIO YA CONECTADO
// =========================================================
// Si el administrador vuelve a dashboard-login.html
// teniendo todavía una sesión válida, no necesitamos
// pedirle otra vez sus credenciales.
// =========================================================

async function redirectAuthenticatedAdminFromLogin() {
  if (!dashboardLoginForm) {
    return;
  }

  try {
    const cmsAdmin = await getCurrentCmsAdmin();

    if (!cmsAdmin) {
      return;
    }

    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("❌ Error al verificar la sesión CMS existente.");
  }
}

redirectAuthenticatedAdminFromLogin();

// =========================================================
// DASHBOARD — INITIALISATION GÉNÉRALE
// =========================================================
// Ce bloc gère la page dashboard.html.
//
// Fonctions actuelles :
// - vérification de l'accès admin;
// - redirection vers le login si nécessaire;
// - affichage du nom et du rôle de l'admin;
// - déconnexion;
// - sidebar responsive;
// - navigation active;
// - chargement des paramètres globaux;
// - sauvegarde des paramètres globaux;
// - ouverture / fermeture du panneau d'édition;
// - notifications.
//
// =========================================================

// =========================================================
// DÉTECTION DE LA PAGE DASHBOARD
// =========================================================

const dashboardPage = document.querySelector(".dashboard-page");

// =========================================================
// ÉLÉMENTS PRINCIPAUX DU DASHBOARD
// =========================================================

const dashboardUserName = document.querySelector("#dashboard-user-name");

const dashboardUserRole = document.querySelector("#dashboard-user-role");

const dashboardLogoutButton = document.querySelector(
  "#dashboard-logout-button",
);

const dashboardSidebar = document.querySelector("#dashboard-sidebar");

const dashboardMenuButton = document.querySelector("#dashboard-menu-button");

const dashboardNavLinks = document.querySelectorAll("[data-dashboard-nav]");

// =========================================================
// ÉDITEUR LATÉRAL
// =========================================================

const dashboardEditor = document.querySelector("#dashboard-editor");

const dashboardEditorTitle = document.querySelector("#dashboard-editor-title");

const dashboardEditorContent = document.querySelector(
  "#dashboard-editor-content",
);

const dashboardEditorCloseButtons = document.querySelectorAll(
  "[data-dashboard-editor-close]",
);

const dashboardEditorButtons = document.querySelectorAll(
  "[data-dashboard-editor]",
);

// =========================================================
// TOAST / NOTIFICATIONS
// =========================================================

const dashboardToast = document.querySelector("#dashboard-toast");

let dashboardToastTimeout = null;

// =========================================================
// FORMULAIRE SETTINGS
// =========================================================

const dashboardSettingsForm = document.querySelector(
  "#dashboard-settings-form",
);

const dashboardSiteNameInput = document.querySelector("#dashboard-site-name");

const dashboardContactEmailInput = document.querySelector(
  "#dashboard-contact-email",
);

const dashboardWhatsappUrlInput = document.querySelector(
  "#dashboard-whatsapp-url",
);

const dashboardCalendlyUrlInput = document.querySelector(
  "#dashboard-calendly-url",
);

const dashboardSettingsSubmit = document.querySelector(
  "#dashboard-settings-submit",
);

// =========================================================
// TOAST
// =========================================================
// Affiche une petite notification en bas à droite.
// =========================================================

function showDashboardToast(message, duration = 3000) {
  if (!dashboardToast) {
    return;
  }

  window.clearTimeout(dashboardToastTimeout);

  dashboardToast.textContent = message;
  dashboardToast.hidden = false;

  dashboardToastTimeout = window.setTimeout(() => {
    dashboardToast.hidden = true;
    dashboardToast.textContent = "";
  }, duration);
}

// =========================================================
// VÉRIFICATION DE L'ADMIN CONNECTÉ
// =========================================================
// Réutilise la fonction getCurrentCmsAdmin()
// créée précédemment pour dashboard-login.html.
//
// Si aucun admin valide n'est trouvé :
// retour immédiat vers dashboard-login.html.
// =========================================================

async function protectDashboardPage() {
  if (!dashboardPage) {
    return null;
  }

  try {
    const cmsAdmin = await getCurrentCmsAdmin();

    if (!cmsAdmin) {
      window.location.replace("./dashboard-login.html");
      return null;
    }

    return cmsAdmin;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du dashboard.");

    window.location.replace("./dashboard-login.html");

    return null;
  }
}

// =========================================================
// AFFICHAGE DE L'ADMIN
// =========================================================

function renderDashboardAdmin(adminUser) {
  if (!adminUser) {
    return;
  }

  if (dashboardUserName) {
    dashboardUserName.textContent = adminUser.display_name || "Administrador";
  }

  if (dashboardUserRole) {
    dashboardUserRole.textContent = adminUser.role || "admin";
  }
}

// =========================================================
// DÉCONNEXION
// =========================================================

if (dashboardLogoutButton) {
  dashboardLogoutButton.addEventListener("click", async () => {
    dashboardLogoutButton.disabled = true;

    try {
      const { error } = await window.supabaseClient.auth.signOut({
        scope: "local",
      });

      if (error) {
        throw error;
      }

      window.location.replace("./dashboard-login.html");
    } catch (error) {
      console.error("❌ Erreur pendant la déconnexion.");

      showDashboardToast("No se pudo cerrar la sesión.");

      dashboardLogoutButton.disabled = false;
    }
  });
}

// =========================================================
// SIDEBAR MOBILE
// =========================================================

if (dashboardMenuButton && dashboardSidebar) {
  dashboardMenuButton.addEventListener("click", () => {
    const sidebarIsOpen = dashboardSidebar.classList.toggle(
      "dashboard-sidebar--open",
    );

    dashboardMenuButton.setAttribute("aria-expanded", String(sidebarIsOpen));
  });
}

// =========================================================
// FERMER LA SIDEBAR APRÈS NAVIGATION MOBILE
// =========================================================

dashboardNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!dashboardSidebar || !dashboardMenuButton) {
      return;
    }

    dashboardSidebar.classList.remove("dashboard-sidebar--open");

    dashboardMenuButton.setAttribute("aria-expanded", "false");
  });
});

// =========================================================
// NAVIGATION ACTIVE
// =========================================================
// Met visuellement à jour le lien actif dans la sidebar
// quand l'utilisateur clique sur une section.
// =========================================================

dashboardNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    dashboardNavLinks.forEach((item) => {
      item.classList.remove("dashboard-sidebar__link--active");
    });

    link.classList.add("dashboard-sidebar__link--active");
  });
});

// =========================================================
// ÉDITEUR LATÉRAL — OUVERTURE
// =========================================================

function openDashboardEditor(title, htmlContent = "") {
  if (!dashboardEditor || !dashboardEditorTitle || !dashboardEditorContent) {
    return;
  }

  dashboardEditorTitle.textContent = title;

  dashboardEditorContent.innerHTML = htmlContent;

  dashboardEditor.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

// =========================================================
// ÉDITEUR LATÉRAL — FERMETURE
// =========================================================

function closeDashboardEditor() {
  if (!dashboardEditor) {
    return;
  }

  dashboardEditor.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

// =========================================================
// BOUTONS DE FERMETURE ÉDITEUR
// =========================================================

dashboardEditorCloseButtons.forEach((button) => {
  button.addEventListener("click", closeDashboardEditor);
});

// =========================================================
// TOUCHE ESC
// =========================================================

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    dashboardEditor?.getAttribute("aria-hidden") === "false"
  ) {
    closeDashboardEditor();
  }
});

// =========================================================
// BOUTONS "EDITAR CONTENIDO"
// =========================================================
// Pour l'instant, on teste seulement le fonctionnement
// du panneau latéral.
//
// La génération réelle des champs depuis site_content
// sera ajoutée dans l'étape suivante.
// =========================================================

dashboardEditorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const editorType = button.dataset.dashboardEditor;

    const editorTitles = {
      hero: "Inicio / Hero",
      classes: "Clases",
      "music-content": "Sección música",
      "products-content": "Sección productos",
      artist: "Artista",
      contact: "Contacto",
      booking: "Videollamada",
      navigation: "Navegación",
    };

    const title = editorTitles[editorType] || "Contenido";

    openDashboardEditor(
      title,
      `
        <div class="dashboard-empty-state dashboard-empty-state--light">
          <i class="bi bi-pencil-square" aria-hidden="true"></i>
        </div>
      `,
    );
  });
});

// =========================================================
// CHARGER SITE SETTINGS
// =========================================================
// Récupère la ligne globale de public.site_settings
// pour pré-remplir le formulaire.
// =========================================================

async function loadDashboardSiteSettings() {
  if (!dashboardSettingsForm) {
    return;
  }

  const { data: settings, error } = await window.supabaseClient
    .from("site_settings")
    .select("id, site_name, contact_email, whatsapp_url, calendly_url")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("❌ Erreur lors du chargement des paramètres du site.");

    showDashboardToast("Error al cargar los ajustes globales.");

    return;
  }

  if (!settings) {
    console.warn("⚠️ Aucun site_settings trouvé.");

    return;
  }

  if (dashboardSiteNameInput) {
    dashboardSiteNameInput.value = settings.site_name || "";
  }

  if (dashboardContactEmailInput) {
    dashboardContactEmailInput.value = settings.contact_email || "";
  }

  if (dashboardWhatsappUrlInput) {
    dashboardWhatsappUrlInput.value = settings.whatsapp_url || "";
  }

  if (dashboardCalendlyUrlInput) {
    dashboardCalendlyUrlInput.value = settings.calendly_url || "";
  }

  dashboardSettingsForm.dataset.settingsId = settings.id;
}

// =========================================================
// ÉTAT DU BOUTON SETTINGS
// =========================================================

function setDashboardSettingsLoading(isLoading) {
  if (!dashboardSettingsSubmit) {
    return;
  }

  dashboardSettingsSubmit.disabled = isLoading;

  dashboardSettingsSubmit.innerHTML = isLoading
    ? `
      Guardando...
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `
    : `
      Guardar cambios
      <i class="bi bi-arrow-right" aria-hidden="true"></i>
    `;
}

// =========================================================
// SAUVEGARDER SITE SETTINGS
// =========================================================
// Supabase update() doit être accompagné d'un filtre,
// ici .eq("id", settingsId), afin de cibler uniquement
// la ligne globale voulue.
// =========================================================

if (dashboardSettingsForm) {
  dashboardSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const settingsId = dashboardSettingsForm.dataset.settingsId;

    if (!settingsId) {
      showDashboardToast("No se ha encontrado la configuración global.");

      return;
    }

    const siteName = dashboardSiteNameInput?.value.trim() || "";

    const contactEmail = dashboardContactEmailInput?.value.trim() || "";

    const whatsappUrl = dashboardWhatsappUrlInput?.value.trim() || "";

    const calendlyUrl = dashboardCalendlyUrlInput?.value.trim() || "";

    if (!siteName) {
      showDashboardToast("El nombre del sitio no puede estar vacío.");

      return;
    }

    setDashboardSettingsLoading(true);

    try {
      const { error } = await window.supabaseClient
        .from("site_settings")
        .update({
          site_name: siteName,
          contact_email: contactEmail,
          whatsapp_url: whatsappUrl,
          calendly_url: calendlyUrl,
        })
        .eq("id", settingsId);

      if (error) {
        throw error;
      }

      showDashboardToast("Ajustes guardados correctamente.");

      // Mise à jour immédiate du nom visible
      // dans le dashboard actuel.
      document
        .querySelectorAll('[data-setting="site_name"]')
        .forEach((element) => {
          element.textContent = siteName;
        });
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde des paramètres du site.");

      showDashboardToast("No se pudieron guardar los cambios.");
    } finally {
      setDashboardSettingsLoading(false);
    }
  });
}

// =========================================================
// INITIALISATION DU DASHBOARD
// =========================================================

async function initializeDashboard() {
  if (!dashboardPage) {
    return;
  }

  const cmsAdmin = await protectDashboardPage();

  if (!cmsAdmin) {
    return;
  }

  // -------------------------------------------------------
  // ADMIN
  // -------------------------------------------------------

  renderDashboardAdmin(cmsAdmin.adminUser);

  // -------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------

  await loadDashboardSiteSettings();
}

// =========================================================
// LANCEMENT
// =========================================================

initializeDashboard();

// =========================================================
// DASHBOARD — CONEXIÓN REAL CON LOS DATOS DEL CMS
// =========================================================
// Este bloque conecta el dashboard con:
//
// - site_content
// - social_links
// - releases
// - products
//
// Los datos existentes en Supabase se muestran
// automáticamente en el dashboard.
//
// También permite modificar registros existentes
// desde el panel lateral.
// =========================================================

// =========================================================
// CONTENEDORES DEL DASHBOARD
// =========================================================

const dashboardReleasesList = document.querySelector(
  "#dashboard-releases-list",
);

const dashboardProductsList = document.querySelector(
  "#dashboard-products-list",
);

const dashboardSocialLinksList = document.querySelector(
  "#dashboard-social-links-list",
);

// =========================================================
// DATOS CARGADOS EN MEMORIA
// =========================================================
// Conservamos temporalmente los datos recuperados.
// Esto evita volver a consultar Supabase cada vez que
// abrimos un editor.
// =========================================================

let dashboardSiteContent = [];
let dashboardSocialLinks = [];
let dashboardReleases = [];
let dashboardProducts = [];

// =========================================================
// ESCAPAR TEXTO HTML
// =========================================================
// Evita insertar directamente contenido recibido desde
// la base de datos dentro de innerHTML.
// =========================================================

function escapeDashboardHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =========================================================
// OBTENER UN TÍTULO LEGIBLE
// =========================================================
// Algunas tablas pueden utilizar "title", otras "name",
// otras "slug".
//
// Buscamos automáticamente el primer campo disponible.
// =========================================================

function getDashboardRecordTitle(record) {
  const possibleFields = [
    "title",
    "name",
    "product_name",
    "release_title",
    "label",
    "slug",
  ];

  for (const field of possibleFields) {
    if (record?.[field]) {
      return record[field];
    }
  }

  return `Registro ${record?.id ?? ""}`.trim();
}

// =========================================================
// OBTENER UNA DESCRIPCIÓN LEGIBLE
// =========================================================

function getDashboardRecordDescription(record) {
  const possibleFields = [
    "description",
    "short_description",
    "subtitle",
    "excerpt",
    "artist",
    "type",
    "slug",
  ];

  for (const field of possibleFields) {
    if (record?.[field]) {
      return record[field];
    }
  }

  return "Sin descripción.";
}

// =========================================================
// CARGAR SITE CONTENT
// =========================================================

async function loadDashboardSiteContent() {
  if (!dashboardPage) {
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("site_content")
    .select("content_key, content_value, section, display_order, is_active")
    .order("section", {
      ascending: true,
    })
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error("❌ Error al cargar el contenido del dashboard.");

    showDashboardToast("No se pudieron cargar los contenidos.");

    return;
  }

  dashboardSiteContent = data || [];
}

// =========================================================
// CARGAR REDES SOCIALES
// =========================================================

async function loadDashboardSocialLinks() {
  if (!dashboardSocialLinksList) {
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("social_links")
    .select("*")
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error("❌ Error al cargar los enlaces sociales del dashboard.");

    dashboardSocialLinksList.innerHTML = `
      <div class="dashboard-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <p>No se pudieron cargar las redes sociales.</p>
      </div>
    `;

    return;
  }

  dashboardSocialLinks = data || [];

  renderDashboardSocialLinks();
}

// =========================================================
// MOSTRAR REDES SOCIALES
// =========================================================

function renderDashboardSocialLinks() {
  if (!dashboardSocialLinksList) {
    return;
  }

  if (!dashboardSocialLinks.length) {
    dashboardSocialLinksList.innerHTML = `
      <div class="dashboard-empty-state">
        <i class="bi bi-share"></i>
        <p>No hay redes sociales configuradas.</p>
      </div>
    `;

    return;
  }

  dashboardSocialLinksList.innerHTML = dashboardSocialLinks
    .map((social) => {
      const status = social.is_visible === false ? "Oculto" : "Visible";

      return `
          <article class="dashboard-record-row">
            <div class="dashboard-record-row__icon">
              <i
                class="${escapeDashboardHtml(
                  social.icon_class || "bi bi-link-45deg",
                )}"
                aria-hidden="true"
              ></i>
            </div>

            <div class="dashboard-record-row__main">
              <p class="dashboard-record-row__eyebrow">
                ${escapeDashboardHtml(social.slug || "social")}
              </p>

              <h3>
                ${escapeDashboardHtml(
                  social.label || social.slug || "Red social",
                )}
              </h3>

              <p>
                ${escapeDashboardHtml(social.url || "Sin URL")}
              </p>
            </div>

            <div class="dashboard-record-row__status">
              ${status}
            </div>

            <button
              class="dashboard-record-row__edit"
              type="button"
              data-edit-social="${escapeDashboardHtml(social.slug)}"
            >
              Editar
              <i class="bi bi-arrow-right"></i>
            </button>
          </article>
        `;
    })
    .join("");

  document.querySelectorAll("[data-edit-social]").forEach((button) => {
    button.addEventListener("click", () => {
      const social = dashboardSocialLinks.find(
        (item) => item.slug === button.dataset.editSocial,
      );

      if (social) {
        openDashboardRecordEditor("social_links", social, "Red social");
      }
    });
  });
}

// =========================================================
// CARGAR RELEASES
// =========================================================

async function loadDashboardReleases() {
  if (!dashboardReleasesList) {
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("releases")
    .select(
      `
    *,
    tracks (
      id,
      created_at,
      release_id,
      title,
      track_number,
      audio_url,
      display_order,
      is_published,
      updated_at
    ),
    release_links (
      id,
      release_id,
      platform,
      url,
      display_order,
      is_visible
    )
  `,
    )
    .order("track_number", {
      referencedTable: "tracks",
      ascending: true,
    });

  if (error) {
    console.error("❌ Error al cargar los releases del dashboard.");

    dashboardReleasesList.innerHTML = `
      <div class="dashboard-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <p>No se pudieron cargar los releases.</p>
      </div>
    `;

    return;
  }

  dashboardReleases = data || [];

  renderDashboardReleases();
}

// =========================================================
// MOSTRAR RELEASES
// =========================================================

function renderDashboardReleases() {
  if (!dashboardReleasesList) {
    return;
  }

  if (!dashboardReleases.length) {
    dashboardReleasesList.innerHTML = `
      <div class="dashboard-empty-state">
        <i class="bi bi-vinyl"></i>
        <p>No hay releases todavía.</p>
      </div>
    `;

    return;
  }

  dashboardReleasesList.innerHTML = dashboardReleases
    .map((release, index) => {
      const title = getDashboardRecordTitle(release);

      const description = getDashboardRecordDescription(release);

      const published =
        release.is_published === false ? "Borrador" : "Publicado";

      return `
          <article class="dashboard-data-card">
            <div class="dashboard-data-card__top">
              <span>
                ${String(index + 1).padStart(2, "0")}
              </span>

              <span class="dashboard-data-card__status">
                ${published}
              </span>
            </div>

            <div class="dashboard-data-card__content">
              <i
                class="bi bi-vinyl dashboard-data-card__icon"
                aria-hidden="true"
              ></i>

              <h3>
                ${escapeDashboardHtml(title)}
              </h3>

              <p>
                ${escapeDashboardHtml(description)}
              </p>
            </div>

            <button
              class="dashboard-data-card__button"
              type="button"
              data-edit-release="${escapeDashboardHtml(release.id)}"
            >
              Editar release

              <i class="bi bi-arrow-right"></i>
            </button>
          </article>
        `;
    })
    .join("");

  document.querySelectorAll("[data-edit-release]").forEach((button) => {
    button.addEventListener("click", () => {
      const release = dashboardReleases.find(
        (item) => String(item.id) === button.dataset.editRelease,
      );

      if (release) {
        openDashboardReleaseEditor(release);
      }
    });
  });
}

// =========================================================
// CARGAR PRODUCTOS
// =========================================================

async function loadDashboardProducts() {
  if (!dashboardProductsList) {
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("products")
    .select("*");

  if (error) {
    console.error("❌ Error al cargar los productos del dashboard.");

    dashboardProductsList.innerHTML = `
      <div class="dashboard-empty-state dashboard-empty-state--light">
        <i class="bi bi-exclamation-circle"></i>
        <p>No se pudieron cargar los productos.</p>
      </div>
    `;

    return;
  }

  dashboardProducts = data || [];

  renderDashboardProducts();
  ensureDashboardLicensesSection();
  await loadDashboardLicenses();
}

function ensureDashboardLicensesSection() {
  if (!dashboardProductsList || document.querySelector("#dashboard-licenses")) {
    return;
  }

  dashboardProductsList.insertAdjacentHTML(
    "afterend",
    `
      <div id="dashboard-licenses" class="dashboard-product-licenses">
        <div class="dashboard-action-bar dashboard-action-bar--light">
          <div>
            <p class="dashboard-action-bar__eyebrow">GESTIÓN GLOBAL</p>
            <h3>LICENCIAS</h3>
          </div>

          <button
            class="button button--dark"
            id="dashboard-add-license"
            type="button"
          >
            NUEVA LICENCIA
          </button>
        </div>

        <div class="dashboard-data-grid" id="dashboard-licenses-list">
          <div class="dashboard-empty-state dashboard-empty-state--light">
            <p>No hay licencias creadas.</p>
          </div>
        </div>
      </div>
    `,
  );

  const addLicenseButton = document.querySelector("#dashboard-add-license");

  if (addLicenseButton) {
    addLicenseButton.addEventListener("click", openDashboardLicenseEditor);
  }
}

function openDashboardLicenseEditor() {
  openDashboardEditor(
    "Nueva licencia",
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-license-create-form"
      >
        <div class="dashboard-editor-form__fields">
          <div class="dashboard-editor-field">
            <label for="license-title">Título</label>
            <input
              id="license-title"
              name="license_title"
              type="text"
              required
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="license-slug">Slug</label>
            <input
              id="license-slug"
              name="license_slug"
              type="text"
              placeholder="licencia-estandar"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="license-short-description">
              Descripción corta
            </label>
            <input
              id="license-short-description"
              name="license_short_description"
              type="text"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="license-terms">Términos</label>
            <textarea
              id="license-terms"
              name="license_terms"
              rows="8"
            ></textarea>
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input
                name="license_is_active"
                type="checkbox"
                checked
              />
              <span>Activa</span>
            </label>
          </div>
        </div>

        <div class="dashboard-editor-form__footer">
          <button
            class="button button--dark"
            id="dashboard-license-create-submit"
            type="submit"
          >
            Crear licencia
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </form>
    `,
  );

  const form = document.querySelector("#dashboard-license-create-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await createDashboardLicense(form);
  });
}

async function createDashboardLicense(form) {
  const formData = new FormData(form);
  const isProductLicenseCreation = Boolean(
    form.querySelector('[name="new_license_title"]'),
  );
  const title =
    formData
      .get(isProductLicenseCreation ? "new_license_title" : "license_title")
      ?.trim() || "";
  const enteredSlug = isProductLicenseCreation
    ? ""
    : formData.get("license_slug")?.trim() || "";
  const slug = createDashboardSlug(enteredSlug || title);
  const shortDescription =
    formData
      .get(
        isProductLicenseCreation
          ? "new_license_short_description"
          : "license_short_description",
      )
      ?.trim() || null;
  const terms =
    formData
      .get(isProductLicenseCreation ? "new_license_terms" : "license_terms")
      ?.trim() || null;
  const isActive =
    formData.get(
      isProductLicenseCreation ? "new_license_is_active" : "license_is_active",
    ) === "on";
  const submitButton = form.querySelector(
    isProductLicenseCreation
      ? "#dashboard-product-license-create-submit"
      : "#dashboard-license-create-submit",
  );
  const message = form.querySelector("[data-license-form-message]");

  if (
    !title ||
    !slug ||
    (isProductLicenseCreation && (!shortDescription || !terms))
  ) {
    const validationMessage = isProductLicenseCreation
      ? "Completa todos los campos obligatorios de la licencia."
      : "El título de la licencia es obligatorio.";

    if (message) {
      message.textContent = validationMessage;
    } else {
      showDashboardToast(validationMessage);
    }

    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = `
      Creando...
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `;
  }

  try {
    const { data: lastLicense, error: orderError } = await window.supabaseClient
      .from("licenses")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    const displayOrder = lastLicense
      ? Number(lastLicense.display_order || 0) + 1
      : 0;

    const { data: duplicateLicense, error: duplicateError } =
      await window.supabaseClient
        .from("licenses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (duplicateLicense) {
      if (message) {
        message.textContent = "Ya existe una licencia con ese slug.";
      } else {
        showDashboardToast("Ya existe una licencia con ese slug.", 5000);
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = isProductLicenseCreation
          ? `
              CREAR LICENCIA
              <i class="bi bi-arrow-right" aria-hidden="true"></i>
            `
          : `
              Crear licencia
              <i class="bi bi-arrow-right" aria-hidden="true"></i>
            `;
      }

      return;
    }

    const { error: insertError } = await window.supabaseClient
      .from("licenses")
      .insert({
        title,
        slug,
        short_description: shortDescription,
        terms,
        display_order: displayOrder,
        is_active: isActive,
      });

    if (insertError) {
      throw insertError;
    }

    if (isProductLicenseCreation) {
      const productLicenseEditor = document.querySelector(
        "#dashboard-product-license-create-form-container",
      );
      const productLicenseSelect = document.querySelector(
        "#product-license-id",
      );
      const productLicenseOption = document.createElement("option");

      productLicenseOption.value = "";
      productLicenseOption.textContent = title;
      productLicenseOption.selected = true;

      if (productLicenseSelect) {
        productLicenseSelect.appendChild(productLicenseOption);
      }

      productLicenseEditor?.remove();

      return;
    }

    closeDashboardEditor();
    await loadDashboardLicenses();
  } catch (error) {
    console.error("❌ Error al crear la licencia del dashboard.");
    showDashboardToast("No se pudo crear la licencia.", 5000);

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `
        Crear licencia
        <i class="bi bi-arrow-right" aria-hidden="true"></i>
      `;
    }
  }
}

async function loadDashboardLicenses() {
  const licensesContainer = document.querySelector("#dashboard-licenses-list");

  if (!licensesContainer) {
    return;
  }

  const { data: licenses, error } = await window.supabaseClient
    .from("licenses")
    .select("id, title, slug, short_description, display_order, is_active")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Error al cargar las licencias del dashboard.");
    return;
  }

  if (!licenses?.length) {
    licensesContainer.innerHTML = `
      <div class="dashboard-empty-state dashboard-empty-state--light">
        <p>No hay licencias creadas.</p>
      </div>
    `;
    return;
  }

  licensesContainer.innerHTML = licenses
    .map(
      (license, index) => `
        <article class="dashboard-data-card dashboard-data-card--light">
          <div class="dashboard-data-card__top">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <span class="dashboard-data-card__status">
              ${license.is_active ? "PUBLICADA" : "OCULTA"}
            </span>
          </div>

          <div class="dashboard-data-card__content">
            <i
              class="bi bi-file-earmark-text dashboard-data-card__icon"
              aria-hidden="true"
            ></i>

            <h3>${escapeDashboardHtml(license.title || "Sin título")}</h3>

            ${
              license.short_description
                ? `<p>${escapeDashboardHtml(license.short_description)}</p>`
                : ""
            }
          </div>
        </article>
      `,
    )
    .join("");
}

// =========================================================
// MOSTRAR PRODUCTOS
// =========================================================

function renderDashboardProducts() {
  if (!dashboardProductsList) {
    return;
  }

  if (!dashboardProducts.length) {
    dashboardProductsList.innerHTML = `
      <div class="dashboard-empty-state dashboard-empty-state--light">
        <i class="bi bi-box-seam"></i>
        <p>No hay productos todavía.</p>
      </div>
    `;

    return;
  }

  dashboardProductsList.innerHTML = dashboardProducts
    .map((product, index) => {
      const title = getDashboardRecordTitle(product);

      const description = getDashboardRecordDescription(product);

      const published =
        product.is_published === false ? "Borrador" : "Publicado";

      return `
          <article class="dashboard-data-card dashboard-data-card--light">
            <div class="dashboard-data-card__top">
              <span>
                ${String(index + 1).padStart(2, "0")}
              </span>

              <span class="dashboard-data-card__status">
                ${published}
              </span>
            </div>

            <div class="dashboard-data-card__content">
              <i
                class="bi bi-box-seam dashboard-data-card__icon"
                aria-hidden="true"
              ></i>

              <h3>
                ${escapeDashboardHtml(title)}
              </h3>

              <p>
                ${escapeDashboardHtml(description)}
              </p>
            </div>

            <button
              class="dashboard-data-card__button"
              type="button"
              data-edit-product="${escapeDashboardHtml(product.id)}"
            >
              Editar producto

              <i class="bi bi-arrow-right"></i>
            </button>
          </article>
        `;
    })
    .join("");

  document.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = dashboardProducts.find(
        (item) => String(item.id) === button.dataset.editProduct,
      );

      if (product) {
        openDashboardProductEditEditor(product);
      }
    });
  });
}

// =========================================================
// CAMPOS QUE NO SE MODIFICAN MANUALMENTE
// =========================================================

const dashboardProtectedFields = new Set([
  "id",
  "created_at",
  "updated_at",
  "user_id",
]);

// =========================================================
// CREAR CAMPO DE FORMULARIO AUTOMÁTICO
// =========================================================
// Esto permite editar las columnas reales existentes
// sin inventar nombres de columnas.
//
// Boolean  -> checkbox
// Número   -> number
// Texto largo -> textarea
// Otros    -> input text
// =========================================================

function createDashboardEditorField(fieldName, value) {
  if (dashboardProtectedFields.has(fieldName)) {
    return "";
  }

  const safeName = escapeDashboardHtml(fieldName);

  const label = fieldName.replaceAll("_", " ").toUpperCase();

  if (typeof value === "boolean") {
    return `
      <div class="dashboard-editor-field dashboard-editor-field--checkbox">
        <label>
          <input
            type="checkbox"
            name="${safeName}"
            ${value ? "checked" : ""}
          />

          <span>${escapeDashboardHtml(label)}</span>
        </label>
      </div>
    `;
  }

  if (typeof value === "number") {
    return `
      <div class="dashboard-editor-field">
        <label for="editor-${safeName}">
          ${escapeDashboardHtml(label)}
        </label>

        <input
          id="editor-${safeName}"
          name="${safeName}"
          type="number"
          value="${escapeDashboardHtml(value)}"
        />
      </div>
    `;
  }

  const stringValue =
    value === null || value === undefined ? "" : String(value);

  if (
    stringValue.length > 100 ||
    fieldName.includes("description") ||
    fieldName.includes("content") ||
    fieldName.includes("bio")
  ) {
    return `
      <div class="dashboard-editor-field">
        <label for="editor-${safeName}">
          ${escapeDashboardHtml(label)}
        </label>

        <textarea
          id="editor-${safeName}"
          name="${safeName}"
          rows="6"
        >${escapeDashboardHtml(stringValue)}</textarea>
      </div>
    `;
  }

  return `
    <div class="dashboard-editor-field">
      <label for="editor-${safeName}">
        ${escapeDashboardHtml(label)}
      </label>

      <input
        id="editor-${safeName}"
        name="${safeName}"
        type="text"
        value="${escapeDashboardHtml(stringValue)}"
      />
    </div>
  `;
}

// =========================================================
// ABRIR EDITOR GENÉRICO DE REGISTRO
// =========================================================

function openDashboardRecordEditor(tableName, record, editorTitle) {
  if (!record) {
    return;
  }

  const fields = Object.entries(record)
    .map(([fieldName, value]) => createDashboardEditorField(fieldName, value))
    .join("");

  openDashboardEditor(
    `${editorTitle} · ${getDashboardRecordTitle(record)}`,
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-record-editor-form"
      >
        <div class="dashboard-editor-form__fields">
          ${fields}
        </div>

        <div class="dashboard-editor-form__footer">
          <button
            class="button button--dark dashboard-product-image-control"
            type="submit"
          >
            Guardar cambios
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </form>
    `,
  );

  const form = document.querySelector("#dashboard-record-editor-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await saveDashboardRecord(tableName, record, form);
  });
}

// =========================================================
// RELEASE — ÉDITEUR DÉDIÉ
// =========================================================
// Cet éditeur est différent de l'éditeur générique.
//
// Il gère:
// - les informations du release;
// - la cover actuelle;
// - les tracks liés au release;
// =========================================================

function openDashboardReleaseEditor(release) {
  if (!release) {
    return;
  }

  // -------------------------------------------------------
  // TRACKS EXISTANTS
  // -------------------------------------------------------

  const tracks = Array.isArray(release.tracks)
    ? [...release.tracks].sort((a, b) => {
        const numberA = Number(a.track_number ?? a.display_order ?? 0);

        const numberB = Number(b.track_number ?? b.display_order ?? 0);

        return numberA - numberB;
      })
    : [];

  const releaseLinks = Array.isArray(release.release_links)
    ? release.release_links
    : [];

  const getReleasePlatformUrl = (platform) => {
    const link = releaseLinks.find((item) => item.platform === platform);

    return link?.url || "";
  };

  // -------------------------------------------------------
  // HTML DES TRACKS
  // -------------------------------------------------------

  const tracksHtml = tracks.length
    ? tracks
        .map((track, index) => {
          const trackNumber = index + 1;

          return `
            <article
              class="dashboard-track-row"
              data-release-track
              data-track-id="${escapeDashboardHtml(track.id)}"
              data-current-audio-url="${escapeDashboardHtml(
                track.audio_url || "",
              )}"
            >
              <div class="dashboard-track-row__number">
                ${String(trackNumber).padStart(2, "0")}
              </div>

              <div class="dashboard-track-row__fields">

                <!-- TITRE ACTUEL -->
                <input
                  name="track_title"
                  type="text"
                  value="${escapeDashboardHtml(track.title || "")}"
                  placeholder="Título del track"
                />

                <!-- AUDIO ACTUEL -->
                ${
                  track.audio_url
                    ? `
                      <div class="dashboard-track-current-audio">
                        <span>
                          Audio actual
                        </span>

                        <audio
                          controls
                          preload="none"
                          controlslist="nodownload noplaybackrate"
                        >
                          <source
                            src="${escapeDashboardHtml(track.audio_url)}"
                          />
                        </audio>
                      </div>
                    `
                    : `
                      <div class="dashboard-track-current-audio">
                        <span>
                          Sin audio actual
                        </span>
                      </div>
                    `
                }

                <!-- REMPLACER AUDIO -->
                <label class="dashboard-track-upload">
                  <span class="dashboard-track-upload__button">
                    <i class="bi bi-music-note-beamed"></i>

                    Reemplazar archivo audio
                  </span>

                  <span
                    class="dashboard-track-upload__filename"
                    data-track-filename
                  >
                    Mantener archivo actual
                  </span>

                  <input
                    name="track_audio_file"
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/mp4,audio/aac"
                    data-track-audio-file
                  />
                </label>

              </div>

              <!-- ORDEN + SUPRESIÓN TRACK -->
              <div class="dashboard-track-row__actions">

                <button
                  class="dashboard-track-row__move"
                  type="button"
                  data-move-release-track="up"
                  aria-label="Mover track hacia arriba"
                  title="Subir"
                  >
                  <i class="bi bi-arrow-up"></i>
                </button>

                <button
                  class="dashboard-track-row__move"
                  type="button"
                  data-move-release-track="down"
                  aria-label="Mover track hacia abajo"
                  title="Bajar"
                  >
                  <i class="bi bi-arrow-down"></i>
                </button>

                <button
                  class="dashboard-track-row__remove"
                  type="button"
                  data-remove-edit-release-track
                  aria-label="Eliminar track"
                  title="Eliminar"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : `
        <div
          class="dashboard-empty-state dashboard-empty-state--light"
          id="dashboard-release-edit-no-tracks"
        >
          <i class="bi bi-music-note-beamed"></i>

          <p>
            Este release todavía no contiene tracks.
          </p>
        </div>
      `;

  // -------------------------------------------------------
  // OUVERTURE DU PANEL
  // -------------------------------------------------------

  openDashboardEditor(
    `Release · ${getDashboardRecordTitle(release)}`,
    `
      <form
        class="dashboard-release-form"
        id="dashboard-release-edit-form"
        data-release-id="${escapeDashboardHtml(release.id)}"
      >

        <!-- ==============================================
             01 — INFORMACIÓN
        =============================================== -->

        <section class="dashboard-editor-section">

          <div class="dashboard-editor-section__heading">
            <span>01</span>

            <div>
              <p>INFORMACIÓN</p>

              <h3>
                Datos principales
              </h3>
            </div>
          </div>

          <div class="dashboard-editor-form__fields">

            <!-- TITLE -->
            <div class="dashboard-editor-field">
              <label for="edit-release-title">
                Título
              </label>

              <input
                id="edit-release-title"
                name="title"
                type="text"
                value="${escapeDashboardHtml(release.title || "")}"
                required
              />
            </div>


            <!-- SLUG -->
            <div class="dashboard-editor-field">
              <label for="edit-release-slug">
                Slug
              </label>

              <input
                id="edit-release-slug"
                name="slug"
                type="text"
                value="${escapeDashboardHtml(release.slug || "")}"
                required
              />
            </div>


            <!-- TYPE -->
            <div class="dashboard-editor-field">
              <label for="edit-release-type">
                Tipo de release
              </label>

              <select
                id="edit-release-type"
                name="release_type"
              >

                <option
                  value="Single"
                  ${release.release_type === "Single" ? "selected" : ""}
                >
                  Single
                </option>

                <option
                  value="EP"
                  ${release.release_type === "EP" ? "selected" : ""}
                >
                  EP
                </option>

                <option
                  value="Album"
                  ${release.release_type === "Album" ? "selected" : ""}
                >
                  Album
                </option>

                <option
                  value="Mixtape"
                  ${release.release_type === "Mixtape" ? "selected" : ""}
                >
                  Mixtape
                </option>

              </select>
            </div>


            <!-- YEAR -->
            <div class="dashboard-editor-field">
              <label for="edit-release-year">
                Año
              </label>

              <input
                id="edit-release-year"
                name="release_year"
                type="number"
                min="1900"
                max="2100"
                value="${escapeDashboardHtml(
                  release.release_year || new Date().getFullYear(),
                )}"
              />
            </div>


            <!-- GENRE -->
            <div class="dashboard-editor-field">
              <label for="edit-release-genre">
                Género
              </label>

              <input
                id="edit-release-genre"
                name="genre"
                type="text"
                value="${escapeDashboardHtml(release.genre || "")}"
              />
            </div>


            <!-- DESCRIPTION -->
            <div class="dashboard-editor-field">
              <label for="edit-release-description">
                Descripción
              </label>

              <textarea
                id="edit-release-description"
                name="description"
                rows="5"
              >${escapeDashboardHtml(release.description || "")}</textarea>
            </div>

          </div>
        </section>


        <!-- ==============================================
             02 — COVER
        =============================================== -->

        <section class="dashboard-editor-section">

          <div class="dashboard-editor-section__heading">
            <span>02</span>

            <div>
              <p>COVER</p>

              <h3>
                Imagen del release
              </h3>
            </div>
          </div>


          ${
            release.cover_image_url
              ? `
                <div class="dashboard-release-cover__preview">
                  <img
                    src="${escapeDashboardHtml(release.cover_image_url)}"
                    alt="Portada actual de ${escapeDashboardHtml(
                      release.title || "release",
                    )}"
                  />
                </div>
              `
              : ""
          }


          <div class="dashboard-release-cover">

            <label
              class="dashboard-upload-zone"
              for="edit-release-cover-file"
            >

              <i
                class="bi bi-image"
                aria-hidden="true"
              ></i>

              <strong>
                Reemplazar imagen
              </strong>

              <span>
                JPG, PNG o WEBP
              </span>

              <input
                id="edit-release-cover-file"
                name="cover_file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />

            </label>


            <div
              class="dashboard-release-cover__preview"
              id="edit-release-cover-preview"
              hidden
            >

              <img
                id="edit-release-cover-preview-image"
                src=""
                alt="Nueva portada"
              />

            </div>

          </div>
        </section>


        <!-- ==============================================
             03 — TRACKS
        =============================================== -->

        <section class="dashboard-editor-section">

          <div class="dashboard-editor-section__heading">
            <span>03</span>

            <div>
              <p>TRACKS</p>

              <h3>
                Lista de canciones
              </h3>
            </div>
          </div>


          <div
            class="dashboard-tracks-editor"
            id="dashboard-release-tracks"
          >
            ${tracksHtml}
          </div>


          <button
            class="dashboard-editor-add-button"
            id="dashboard-add-edit-release-track"
            type="button"
          >
            <i class="bi bi-plus-lg"></i>

            Añadir track
          </button>

        </section>


        <!-- ==============================================
             04 — PLATAFORMAS
        =============================================== -->

        <section class="dashboard-editor-section">

          <div class="dashboard-editor-section__heading">
            <span>04</span>

            <div>
              <p>PLATAFORMAS</p>

              <h3>
                Enlaces externos
              </h3>
            </div>
          </div>


          <div class="dashboard-editor-form__fields">

            <div class="dashboard-editor-field">
              <label for="edit-release-spotify-url">
                Spotify
              </label>

              <input
                id="edit-release-spotify-url"
                name="spotify_url"
                type="url"
                value="${escapeDashboardHtml(getReleasePlatformUrl("spotify"))}"
                placeholder="https://..."
              />
            </div>


            <div class="dashboard-editor-field">
              <label for="edit-release-soundcloud-url">
                SoundCloud
              </label>

              <input
                id="edit-release-soundcloud-url"
                name="soundcloud_url"
                type="url"
                value="${escapeDashboardHtml(getReleasePlatformUrl("soundcloud"))}"
                placeholder="https://..."
              />
            </div>


            <div class="dashboard-editor-field">
              <label for="edit-release-bandcamp-url">
                Bandcamp
              </label>

              <input
                id="edit-release-bandcamp-url"
                name="bandcamp_url"
                type="url"
                value="${escapeDashboardHtml(getReleasePlatformUrl("bandcamp"))}"
                placeholder="https://..."
              />
            </div>


            <div class="dashboard-editor-field">
              <label for="edit-release-youtube-url">
                YouTube
              </label>

              <input
                id="edit-release-youtube-url"
                name="youtube_url"
                type="url"
                value="${escapeDashboardHtml(getReleasePlatformUrl("youtube"))}"
                placeholder="https://..."
              />
            </div>

          </div>
        </section>


        <!-- ==============================================
             05 — PUBLICACIÓN
        =============================================== -->

        <section class="dashboard-editor-section">

          <div class="dashboard-editor-section__heading">
            <span>05</span>

            <div>
              <p>PUBLICACIÓN</p>

              <h3>
                Estado del release
              </h3>
            </div>
          </div>


          <label class="dashboard-toggle-row">

            <div>
              <strong>
                Publicar en el sitio
              </strong>

              <span>
                El release será visible públicamente.
              </span>
            </div>


            <input
              name="is_published"
              type="checkbox"
              ${release.is_published ? "checked" : ""}
            />

          </label>
        </section>


        <!-- ==============================================
             FOOTER
        =============================================== -->

        <div class="dashboard-editor-form__footer">

          <div class="dashboard-editor-form__footer-actions">

            <button
              class="button button--danger"
              id="dashboard-delete-release"
              type="button"
            >
              Eliminar release

              <i
                class="bi bi-trash3"
                aria-hidden="true"
              ></i>
            </button>

            <button
              class="button button--dark"
              id="dashboard-edit-release-submit"
              type="submit"
            >
              Guardar cambios

              <i
                class="bi bi-arrow-right"
                aria-hidden="true"
              ></i>
            </button>

          </div>

        </div>

      </form>
    `,
  );

  // =======================================================
  // INITIALISATION DE L'ÉDITEUR
  // =======================================================

  initializeDashboardReleaseEditEditor(release);
}

// =========================================================
// RELEASE — SUPPRESSION COMPLÈTE
// =========================================================

async function deleteDashboardRelease(release) {
  if (!release?.id) {
    throw new Error("Release inválido.");
  }

  try {
    // =====================================================
    // 1 — RÉCUPÉRER LES TRACKS DU RELEASE
    // =====================================================

    const { data: tracks, error: tracksFetchError } =
      await window.supabaseClient
        .from("tracks")
        .select("id, audio_url")
        .eq("release_id", release.id);

    if (tracksFetchError) {
      throw tracksFetchError;
    }

    // =====================================================
    // 2 — SUPPRIMER LES AUDIOS DU STORAGE
    // =====================================================

    const audioPaths = (tracks || [])
      .map((track) => getDashboardReleaseAudioStoragePath(track.audio_url))
      .filter(Boolean);

    if (audioPaths.length > 0) {
      const { error: audioStorageError } = await window.supabaseClient.storage
        .from("release-audio")
        .remove(audioPaths);

      if (audioStorageError) {
        throw audioStorageError;
      }
    }

    // =====================================================
    // 3 — SUPPRIMER LA COVER DU STORAGE
    // =====================================================

    const coverPath = getDashboardReleaseCoverStoragePath(
      release.cover_image_url,
    );

    if (coverPath) {
      const { error: coverStorageError } = await window.supabaseClient.storage
        .from("release-covers")
        .remove([coverPath]);

      if (coverStorageError) {
        throw coverStorageError;
      }
    }

    // =====================================================
    // 4 — SUPPRIMER LES LIENS PLATEFORMES
    // =====================================================

    const { error: linksError } = await window.supabaseClient
      .from("release_links")
      .delete()
      .eq("release_id", release.id);

    if (linksError) {
      throw linksError;
    }

    // =====================================================
    // 5 — SUPPRIMER LES TRACKS
    // =====================================================

    const { error: tracksDeleteError } = await window.supabaseClient
      .from("tracks")
      .delete()
      .eq("release_id", release.id);

    if (tracksDeleteError) {
      throw tracksDeleteError;
    }

    // =====================================================
    // 6 — SUPPRIMER LE RELEASE
    // =====================================================

    const { error: releaseDeleteError } = await window.supabaseClient
      .from("releases")
      .delete()
      .eq("id", release.id);

    if (releaseDeleteError) {
      throw releaseDeleteError;
    }

    // =====================================================
    // 7 — RAFRAÎCHIR LE DASHBOARD
    // =====================================================

    showDashboardToast("Release eliminado correctamente.");

    closeDashboardEditor();

    await loadDashboardReleases();
  } catch (error) {
    console.error("❌ Error al eliminar el release.");

    showDashboardToast(
      error?.message || "No se pudo eliminar el release.",
      5000,
    );
  }
}

// =========================================================
// RELEASE — INITIALISER L'ÉDITEUR DE MODIFICATION
// =========================================================

function initializeDashboardReleaseEditEditor(release) {
  const form = document.querySelector("#dashboard-release-edit-form");

  const coverInput = document.querySelector("#edit-release-cover-file");

  const coverPreview = document.querySelector("#edit-release-cover-preview");

  const coverPreviewImage = document.querySelector(
    "#edit-release-cover-preview-image",
  );

  const addTrackButton = document.querySelector(
    "#dashboard-add-edit-release-track",
  );

  if (!form) {
    return;
  }

  const deleteReleaseButton = document.querySelector(
    "#dashboard-delete-release",
  );

  if (deleteReleaseButton) {
    deleteReleaseButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        `¿Seguro que quieres eliminar "${release.title}"? Esta acción no se puede deshacer.`,
      );

      if (!confirmed) {
        return;
      }

      deleteDashboardRelease(release);
    });
  }

  // =======================================================
  // PREVIEW NOUVELLE COVER
  // =======================================================

  if (coverInput && coverPreview && coverPreviewImage) {
    coverInput.addEventListener("change", () => {
      const file = coverInput.files?.[0];

      if (!file) {
        coverPreview.hidden = true;
        coverPreviewImage.src = "";

        return;
      }

      const previewUrl = URL.createObjectURL(file);

      coverPreviewImage.src = previewUrl;

      coverPreview.hidden = false;
    });
  }

  // =======================================================
  // AFFICHER LE NOM DES NOUVEAUX FICHIERS AUDIO
  // =======================================================

  connectDashboardTrackFileInputs();
  connectDashboardReleaseTrackMoveButtons();

  // =======================================================
  // AJOUTER UN NOUVEAU TRACK
  // =======================================================

  if (addTrackButton) {
    addTrackButton.addEventListener("click", () => {
      // L'ancienne fonction sait déjà créer
      // une nouvelle ligne correctement.

      addDashboardReleaseTrackRow();

      const emptyState = document.querySelector(
        "#dashboard-release-edit-no-tracks",
      );

      if (emptyState) {
        emptyState.remove();
      }
    });
  }

  // =======================================================
  // SUPPRIMER UN TRACK DU FORMULAIRE
  // =======================================================
  // Le track est retiré visuellement ici.
  //
  // Lors de GUARDAR CAMBIOS,
  // syncDashboardReleaseTracks() comparera les IDs
  // encore présents avec les tracks originaux.
  //
  // Les tracks disparus seront ensuite supprimés
  // réellement de Supabase et de Storage.
  // =======================================================

  document
    .querySelectorAll("[data-remove-edit-release-track]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const row = button.closest("[data-release-track]");

        if (!row) {
          return;
        }

        row.remove();

        refreshDashboardReleaseTrackNumbers();
      });
    });

  // =======================================================
  // SUBMIT — SAUVEGARDE DU RELEASE
  // =======================================================
  // Envoie les modifications principales du release
  // vers Supabase.
  //
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await submitDashboardReleaseEditForm(form, release);
  });
}

// =========================================================
// RELEASE — SYNCHRONISER LES LIENS PLATEFORMES
// =========================================================

async function syncDashboardReleaseLinks(originalRelease, platformUrls) {
  const existingLinks = Array.isArray(originalRelease.release_links)
    ? originalRelease.release_links
    : [];

  const platforms = [
    {
      platform: "spotify",
      url: platformUrls.spotify,
      display_order: 1,
    },
    {
      platform: "soundcloud",
      url: platformUrls.soundcloud,
      display_order: 2,
    },
    {
      platform: "bandcamp",
      url: platformUrls.bandcamp,
      display_order: 3,
    },
    {
      platform: "youtube",
      url: platformUrls.youtube,
      display_order: 4,
    },
  ];

  for (const item of platforms) {
    const existingLink = existingLinks.find(
      (link) => link.platform === item.platform,
    );

    // -----------------------------------------------------
    // URL présente + lien existant = UPDATE
    // -----------------------------------------------------

    if (item.url && existingLink) {
      const { error } = await window.supabaseClient
        .from("release_links")
        .update({
          url: item.url,
          display_order: item.display_order,
          is_visible: true,
        })
        .eq("id", existingLink.id);

      if (error) {
        throw error;
      }

      continue;
    }

    // -----------------------------------------------------
    // URL présente + aucun lien = INSERT
    // -----------------------------------------------------

    if (item.url && !existingLink) {
      const { error } = await window.supabaseClient
        .from("release_links")
        .insert({
          release_id: originalRelease.id,
          platform: item.platform,
          url: item.url,
          display_order: item.display_order,
          is_visible: true,
        });

      if (error) {
        throw error;
      }

      continue;
    }

    // -----------------------------------------------------
    // Champ vide + lien existant = DELETE
    // -----------------------------------------------------

    if (!item.url && existingLink) {
      const { error } = await window.supabaseClient
        .from("release_links")
        .delete()
        .eq("id", existingLink.id);

      if (error) {
        throw error;
      }
    }
  }
}

// =========================================================
// RELEASE — GUARDAR MODIFICACIONES
// =========================================================

async function submitDashboardReleaseEditForm(form, originalRelease) {
  const formData = new FormData(form);

  const title = formData.get("title")?.trim() || "";

  const slug = formData.get("slug")?.trim() || "";

  const releaseType = formData.get("release_type")?.trim() || "Single";

  const releaseYearRaw = formData.get("release_year");

  const releaseYear = releaseYearRaw
    ? Number(releaseYearRaw)
    : new Date().getFullYear();

  const genre = formData.get("genre")?.trim() || null;

  const description = formData.get("description")?.trim() || null;

  const spotifyUrl = formData.get("spotify_url")?.trim() || null;

  const soundcloudUrl = formData.get("soundcloud_url")?.trim() || null;

  const bandcampUrl = formData.get("bandcamp_url")?.trim() || null;

  const youtubeUrl = formData.get("youtube_url")?.trim() || null;

  const isPublished = formData.get("is_published") === "on";

  const coverFile = formData.get("cover_file");

  const hasNewCover = coverFile instanceof File && coverFile.size > 0;

  // =======================================================
  // VALIDATION
  // =======================================================

  if (!title || !slug) {
    showDashboardToast("El título y el slug son obligatorios.", 5000);

    return;
  }

  if (
    !Number.isInteger(releaseYear) ||
    releaseYear < 1900 ||
    releaseYear > 2100
  ) {
    showDashboardToast("Introduce un año válido.", 5000);

    return;
  }

  // =======================================================
  // BOUTON LOADING
  // =======================================================

  const submitButton = form.querySelector("#dashboard-edit-release-submit");

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.innerHTML = `
      Guardando...
      <i
        class="bi bi-arrow-repeat"
        aria-hidden="true"
      ></i>
    `;
  }

  try {
    // =====================================================
    // COVER — REMPLACEMENT OPTIONNEL
    // =====================================================

    let newCoverUrl = null;

    if (hasNewCover) {
      newCoverUrl = await uploadDashboardReleaseCover(coverFile, slug);
    }

    // =====================================================
    // DONNÉES PRINCIPALES DU RELEASE
    // =====================================================

    const releaseData = {
      title,
      slug,
      release_type: releaseType,
      release_year: releaseYear,
      genre,
      description,
      is_published: isPublished,
    };

    if (newCoverUrl) {
      releaseData.cover_image_url = newCoverUrl;
    }

    // =====================================================
    // UPDATE DU RELEASE
    // =====================================================

    const { data: updatedRelease, error: releaseError } =
      await window.supabaseClient
        .from("releases")
        .update(releaseData)
        .eq("id", originalRelease.id)
        .select()
        .single();

    if (releaseError) {
      throw releaseError;
    }

    // =====================================================
    // SYNCHRONISATION DES LIENS PLATEFORMES
    // =====================================================

    await syncDashboardReleaseLinks(originalRelease, {
      spotify: spotifyUrl,
      soundcloud: soundcloudUrl,
      bandcamp: bandcampUrl,
      youtube: youtubeUrl,
    });

    // =====================================================
    // SYNCHRONISATION DES TRACKS
    // =====================================================

    await syncDashboardReleaseTracks(form, originalRelease, slug, isPublished);

    // =====================================================
    // NETTOYAGE DE L'ANCIENNE COVER
    // =====================================================

    if (
      newCoverUrl &&
      originalRelease.cover_image_url &&
      originalRelease.cover_image_url !== newCoverUrl
    ) {
      const oldCoverPath = getDashboardReleaseCoverStoragePath(
        originalRelease.cover_image_url,
      );

      if (oldCoverPath) {
        const { error: deleteOldCoverError } =
          await window.supabaseClient.storage
            .from("release-covers")
            .remove([oldCoverPath]);

        if (deleteOldCoverError) {
          console.error(
            "⚠️ La nueva portada fue guardada, pero no se pudo eliminar la antigua.",
          );
        }
      }
    }

    // =====================================================
    // SUCCÈS COMPLET
    // =====================================================

    showDashboardToast("Release y tracks actualizados correctamente.");

    closeDashboardEditor();

    await loadDashboardReleases();
  } catch (error) {
    console.error("❌ Error al actualizar el release.");

    showDashboardToast(
      error?.message || "No se pudo actualizar el release.",
      5000,
    );

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.innerHTML = `
        Guardar cambios
        <i
          class="bi bi-arrow-right"
          aria-hidden="true"
        ></i>
      `;
    }
  }
}

// =========================================================
// RELEASE — SYNCHRONISER LES TRACKS
// =========================================================
// Cette fonction gère:
//
// - modification du titre;
// - modification de l'ordre;
// - remplacement du fichier audio;
// - ajout d'un nouveau track;
// - suppression d'un track;
// - nettoyage des anciens fichiers Storage.
// =========================================================

async function syncDashboardReleaseTracks(
  form,
  originalRelease,
  releaseSlug,
  isPublished,
) {
  const tracksContainer = form.querySelector("#dashboard-release-tracks");

  if (!tracksContainer) {
    return;
  }

  const rows = Array.from(
    tracksContainer.querySelectorAll("[data-release-track]"),
  );

  const originalTracks = Array.isArray(originalRelease.tracks)
    ? originalRelease.tracks
    : [];

  // -------------------------------------------------------
  // IDs ENCORE PRÉSENTS DANS LE FORMULAIRE
  // -------------------------------------------------------

  const remainingTrackIds = rows
    .map((row) => row.dataset.trackId)
    .filter(Boolean);

  // -------------------------------------------------------
  // TRACKS SUPPRIMÉS VISUELLEMENT
  // -------------------------------------------------------

  const deletedTracks = originalTracks.filter(
    (track) => !remainingTrackIds.includes(String(track.id)),
  );

  // -------------------------------------------------------
  // FICHIERS À NETTOYER APRÈS SUCCÈS
  // -------------------------------------------------------

  const oldAudioPathsToDelete = [];

  // -------------------------------------------------------
  // NOUVEAUX FICHIERS UPLOADÉS
  // -------------------------------------------------------
  // En cas d'erreur, ils pourront être supprimés.
  // -------------------------------------------------------

  const newlyUploadedPaths = [];

  try {
    // =====================================================
    // PHASE 1 — LIBÉRER LES NUMÉROS DE TRACK
    // =====================================================
    // Les tracks existants sont déplacés temporairement
    // vers des numéros élevés.
    //
    // Cela évite les collisions avec la contrainte UNIQUE
    // (release_id + track_number) pendant un changement
    // d'ordre.
    // =====================================================

    const existingRows = rows.filter((row) => row.dataset.trackId);

    for (let index = 0; index < existingRows.length; index += 1) {
      const row = existingRows[index];

      const temporaryTrackNumber = 10000 + index + 1;

      const { error: temporaryNumberError } = await window.supabaseClient
        .from("tracks")
        .update({
          track_number: temporaryTrackNumber,
        })
        .eq("id", row.dataset.trackId);

      if (temporaryNumberError) {
        throw temporaryNumberError;
      }
    }

    // =====================================================
    // SUPPRIMER LES TRACKS RETIRÉS AVEC X
    // =====================================================

    for (const deletedTrack of deletedTracks) {
      const { error: deleteTrackError } = await window.supabaseClient
        .from("tracks")
        .delete()
        .eq("id", deletedTrack.id);

      if (deleteTrackError) {
        throw deleteTrackError;
      }

      const deletedAudioPath = getDashboardReleaseAudioStoragePath(
        deletedTrack.audio_url,
      );

      if (deletedAudioPath) {
        oldAudioPathsToDelete.push(deletedAudioPath);
      }
    }

    // =====================================================
    // TRAITEMENT DES TRACKS PRÉSENTS
    // =====================================================

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];

      const trackNumber = index + 1;

      const titleInput = row.querySelector('[name="track_title"]');

      const audioInput = row.querySelector('[name="track_audio_file"]');

      const title = titleInput?.value.trim() || "";

      const newAudioFile = audioInput?.files?.[0] || null;

      const trackId = row.dataset.trackId || null;

      const currentAudioUrl = row.dataset.currentAudioUrl || null;

      // ---------------------------------------------------
      // VALIDATION TITRE
      // ---------------------------------------------------

      if (!title) {
        throw new Error(`El track ${trackNumber} necesita un título.`);
      }

      // ===================================================
      // A. TRACK EXISTANT
      // ===================================================

      if (trackId) {
        const trackData = {
          title,
          track_number: trackNumber,
          display_order: trackNumber - 1,
          is_published: isPublished,
        };

        // -------------------------------------------------
        // REMPLACEMENT AUDIO
        // -------------------------------------------------

        if (newAudioFile) {
          const { publicUrl, storagePath } = await uploadDashboardTrackAudio(
            newAudioFile,
            releaseSlug,
            title,
            trackNumber,
          );

          newlyUploadedPaths.push(storagePath);

          trackData.audio_url = publicUrl;

          // Ancien fichier à supprimer seulement
          // après la réussite de la modification.
          const oldStoragePath =
            getDashboardReleaseAudioStoragePath(currentAudioUrl);

          if (oldStoragePath) {
            oldAudioPathsToDelete.push(oldStoragePath);
          }
        }

        // -------------------------------------------------
        // UPDATE TRACK
        // -------------------------------------------------

        const { error: updateTrackError } = await window.supabaseClient
          .from("tracks")
          .update(trackData)
          .eq("id", trackId);

        if (updateTrackError) {
          throw updateTrackError;
        }

        continue;
      }

      // ===================================================
      // B. NOUVEAU TRACK
      // ===================================================

      if (!newAudioFile) {
        throw new Error(
          `El nuevo track ${trackNumber} necesita un archivo de audio.`,
        );
      }

      const { publicUrl, storagePath } = await uploadDashboardTrackAudio(
        newAudioFile,
        releaseSlug,
        title,
        trackNumber,
      );

      newlyUploadedPaths.push(storagePath);

      const { error: insertTrackError } = await window.supabaseClient
        .from("tracks")
        .insert({
          release_id: originalRelease.id,
          title,
          track_number: trackNumber,
          audio_url: publicUrl,
          display_order: trackNumber - 1,
          is_published: isPublished,
        });

      if (insertTrackError) {
        throw insertTrackError;
      }
    }

    // =====================================================
    // NETTOYAGE DES ANCIENS AUDIOS
    // =====================================================

    const uniqueOldPaths = [...new Set(oldAudioPathsToDelete)];

    if (uniqueOldPaths.length > 0) {
      const { error: storageCleanupError } = await window.supabaseClient.storage
        .from("release-audio")
        .remove(uniqueOldPaths);

      if (storageCleanupError) {
        console.error(
          "⚠️ Tracks actualizados pero algunos audios antiguos no pudieron eliminarse.",
        );
      }
    }
  } catch (error) {
    // =====================================================
    // NETTOYAGE DES NOUVEAUX UPLOADS EN CAS D'ERREUR
    // =====================================================

    if (newlyUploadedPaths.length > 0) {
      const { error: rollbackStorageError } =
        await window.supabaseClient.storage
          .from("release-audio")
          .remove(newlyUploadedPaths);

      if (rollbackStorageError) {
        console.error(
          "⚠️ No se pudieron limpiar algunos audios después del error.",
        );
      }
    }

    throw error;
  }
}

// =========================================================
// STORAGE — EXTRAIRE LE CHEMIN D'UN AUDIO DEPUIS SON URL
// =========================================================

function getDashboardReleaseAudioStoragePath(publicUrl) {
  if (!publicUrl) {
    return null;
  }

  const marker = "/storage/v1/object/public/release-audio/";

  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = publicUrl.slice(markerIndex + marker.length);

  try {
    return decodeURIComponent(encodedPath);
  } catch (error) {
    return encodedPath;
  }
}

// =========================================================
// STORAGE — EXTRAIRE LE CHEMIN D'UNE COVER
// =========================================================

function getDashboardReleaseCoverStoragePath(publicUrl) {
  if (!publicUrl) {
    return null;
  }

  const marker = "/storage/v1/object/public/release-covers/";

  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = publicUrl.slice(markerIndex + marker.length);

  try {
    return decodeURIComponent(encodedPath);
  } catch (error) {
    return encodedPath;
  }
}

// =========================================================
// GUARDAR REGISTRO GENÉRICO
// =========================================================

async function saveDashboardRecord(tableName, originalRecord, form) {
  const formData = new FormData(form);

  const updatedValues = {};

  Object.entries(originalRecord).forEach(([fieldName, originalValue]) => {
    if (dashboardProtectedFields.has(fieldName)) {
      return;
    }

    const field = form.elements.namedItem(fieldName);

    if (!field) {
      return;
    }

    if (typeof originalValue === "boolean") {
      updatedValues[fieldName] = field.checked;

      return;
    }

    if (typeof originalValue === "number") {
      const numberValue = formData.get(fieldName);

      updatedValues[fieldName] =
        numberValue === "" ? null : Number(numberValue);

      return;
    }

    updatedValues[fieldName] = formData.get(fieldName);
  });

  try {
    const { error } = await window.supabaseClient
      .from(tableName)
      .update(updatedValues)
      .eq("id", originalRecord.id);

    if (error) {
      throw error;
    }

    showDashboardToast("Cambios guardados correctamente.");

    closeDashboardEditor();

    // Recargamos únicamente la tabla modificada.

    if (tableName === "products") {
      await loadDashboardProducts();
    }

    if (tableName === "releases") {
      await loadDashboardReleases();
    }

    if (tableName === "social_links") {
      await loadDashboardSocialLinks();
    }
  } catch (error) {
    console.error("❌ Error al actualizar el registro.");

    showDashboardToast("No se pudieron guardar los cambios.");
  }
}

// =========================================================
// EDITOR REAL DE SITE CONTENT
// =========================================================

async function openDashboardContentEditor(section, title) {
  // Si todavía no hemos cargado site_content,
  // lo recuperamos primero.

  if (!dashboardSiteContent.length) {
    await loadDashboardSiteContent();
  }

  const sectionContent = dashboardSiteContent.filter(
    (item) => item.section === section,
  );

  if (!sectionContent.length) {
    openDashboardEditor(
      title,
      `
        <div class="dashboard-empty-state dashboard-empty-state--light">
          <i class="bi bi-exclamation-circle"></i>

          <p>
            No se encontró contenido para esta sección.
          </p>
        </div>
      `,
    );

    return;
  }

  const fields = sectionContent
    .map((item) => {
      return `
        <div class="dashboard-editor-field">
          <label
            for="content-${escapeDashboardHtml(item.content_key)}"
          >
            ${escapeDashboardHtml(
              item.content_key.replaceAll("_", " ").toUpperCase(),
            )}
          </label>

          <textarea
            id="content-${escapeDashboardHtml(item.content_key)}"
            name="${escapeDashboardHtml(item.content_key)}"
            rows="4"
          >${escapeDashboardHtml(item.content_value)}</textarea>
        </div>
      `;
    })
    .join("");

  openDashboardEditor(
    title,
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-content-editor-form"
      >
        <div class="dashboard-editor-form__fields">
          ${fields}
        </div>

        <div class="dashboard-editor-form__footer">
          <p>
            Estos textos se mostrarán directamente
            en el sitio público.
          </p>

          <button
            class="button button--dark dashboard-product-image-control"
            type="submit"
          >
            Guardar contenido

            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </form>
    `,
  );

  const form = document.querySelector("#dashboard-content-editor-form");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    await saveDashboardContentSection(sectionContent, form);
  });
}

// =========================================================
// GUARDAR UNA SECCIÓN DE SITE CONTENT
// =========================================================

async function saveDashboardContentSection(sectionContent, form) {
  const formData = new FormData(form);

  try {
    for (const item of sectionContent) {
      const newValue = formData.get(item.content_key);

      const { error } = await window.supabaseClient
        .from("site_content")
        .update({
          content_value: newValue,
        })
        .eq("content_key", item.content_key);

      if (error) {
        throw error;
      }
    }

    showDashboardToast("Contenido actualizado correctamente.");

    closeDashboardEditor();

    await loadDashboardSiteContent();
  } catch (error) {
    console.error("❌ Error al guardar el contenido del sitio.");

    showDashboardToast("No se pudo actualizar el contenido.");
  }
}

// =========================================================
// CONECTAR LOS BOTONES DE CONTENIDO CON LAS SECCIONES
// =========================================================
// Aquí sustituimos el editor temporal que habíamos creado
// anteriormente.
// =========================================================

function connectDashboardContentEditors() {
  const sectionMap = {
    hero: {
      section: "hero",
      title: "Inicio / Hero",
    },

    classes: {
      section: "classes",
      title: "Clases",
    },

    "music-content": {
      section: "music",
      title: "Sección música",
    },

    "products-content": {
      section: "products",
      title: "Sección productos",
    },

    artist: {
      section: "artist",
      title: "Artista",
    },

    contact: {
      section: "contact",
      title: "Contacto",
    },

    booking: {
      section: "booking",
      title: "Videollamada",
    },

    navigation: {
      section: "navigation",
      title: "Navegación",
    },
  };

  dashboardEditorButtons.forEach((button) => {
    const type = button.dataset.dashboardEditor;

    const config = sectionMap[type];

    if (!config) {
      return;
    }

    // Clonamos el botón para eliminar el listener
    // temporal creado anteriormente.

    const cleanButton = button.cloneNode(true);

    button.replaceWith(cleanButton);

    cleanButton.addEventListener("click", () => {
      openDashboardContentEditor(config.section, config.title);
    });
  });
}

// =========================================================
// RECARGAR TODOS LOS DATOS DEL DASHBOARD
// =========================================================

async function loadDashboardCmsData() {
  if (!dashboardPage) {
    return;
  }

  await Promise.all([
    loadDashboardSiteContent(),
    loadDashboardSocialLinks(),
    loadDashboardReleases(),
    loadDashboardProducts(),
  ]);

  connectDashboardContentEditors();
}

// =========================================================
// LANZAMIENTO
// =========================================================
// Esperamos a que initializeDashboard() haya podido
// comprobar primero que el usuario es administrador.
// =========================================================

if (dashboardPage) {
  loadDashboardCmsData();
}

// =========================================================
// DASHBOARD — CREACIÓN DE RELEASES Y PRODUCTOS
// =========================================================
// Este bloque activa:
//
// + NUEVO RELEASE
// + NUEVO PRODUCTO
//
// La estructura del formulario se construye utilizando
// las columnas reales recuperadas desde Supabase.
//
// De esta forma evitamos duplicar la estructura de las
// tablas dentro del JavaScript.
// =========================================================

// =========================================================
// BOTONES
// =========================================================

const dashboardAddReleaseButton = document.querySelector(
  "#dashboard-add-release",
);

const dashboardAddProductButton = document.querySelector(
  "#dashboard-add-product",
);

// =========================================================
// CAMPOS QUE NO SE CREAN MANUALMENTE
// =========================================================
// Estos valores normalmente son gestionados por PostgreSQL,
// Supabase o por la propia estructura de la base de datos.
// =========================================================

const dashboardCreateProtectedFields = new Set([
  "id",
  "created_at",
  "updated_at",
]);

// =========================================================
// CREAR UN VALOR VACÍO SEGÚN EL TIPO ORIGINAL
// =========================================================

function getDashboardEmptyValue(originalValue) {
  if (typeof originalValue === "boolean") {
    return false;
  }

  if (typeof originalValue === "number") {
    return "";
  }

  return "";
}

// =========================================================
// CREAR CAMPO PARA NUEVO REGISTRO
// =========================================================

function createDashboardCreateField(fieldName, originalValue) {
  if (dashboardCreateProtectedFields.has(fieldName)) {
    return "";
  }

  const safeName = escapeDashboardHtml(fieldName);

  const label = fieldName.replaceAll("_", " ").toUpperCase();

  // -------------------------------------------------------
  // BOOLEAN
  // -------------------------------------------------------

  if (typeof originalValue === "boolean") {
    return `
      <div
        class="dashboard-editor-field
               dashboard-editor-field--checkbox"
      >
        <label>
          <input
            type="checkbox"
            name="${safeName}"
          />

          <span>
            ${escapeDashboardHtml(label)}
          </span>
        </label>
      </div>
    `;
  }

  // -------------------------------------------------------
  // NUMBER
  // -------------------------------------------------------

  if (typeof originalValue === "number") {
    return `
      <div class="dashboard-editor-field">
        <label for="create-${safeName}">
          ${escapeDashboardHtml(label)}
        </label>

        <input
          id="create-${safeName}"
          name="${safeName}"
          type="number"
        />
      </div>
    `;
  }

  // -------------------------------------------------------
  // URL
  // -------------------------------------------------------

  if (fieldName.includes("url") || fieldName.includes("link")) {
    return `
      <div class="dashboard-editor-field">
        <label for="create-${safeName}">
          ${escapeDashboardHtml(label)}
        </label>

        <input
          id="create-${safeName}"
          name="${safeName}"
          type="url"
          placeholder="https://..."
        />
      </div>
    `;
  }

  // -------------------------------------------------------
  // TEXTO LARGO
  // -------------------------------------------------------

  if (
    fieldName.includes("description") ||
    fieldName.includes("content") ||
    fieldName.includes("bio") ||
    fieldName.includes("excerpt")
  ) {
    return `
      <div class="dashboard-editor-field">
        <label for="create-${safeName}">
          ${escapeDashboardHtml(label)}
        </label>

        <textarea
          id="create-${safeName}"
          name="${safeName}"
          rows="6"
        ></textarea>
      </div>
    `;
  }

  // -------------------------------------------------------
  // TEXTO NORMAL
  // -------------------------------------------------------

  return `
    <div class="dashboard-editor-field">
      <label for="create-${safeName}">
        ${escapeDashboardHtml(label)}
      </label>

      <input
        id="create-${safeName}"
        name="${safeName}"
        type="text"
      />
    </div>
  `;
}

// =========================================================
// ABRIR FORMULARIO DE CREACIÓN
// =========================================================

function openDashboardCreateEditor(tableName, records, editorTitle) {
  // -------------------------------------------------------
  // NECESITAMOS UN REGISTRO COMO MODELO
  // -------------------------------------------------------
  // Como ya tenemos productos y releases existentes,
  // utilizamos el primero únicamente para conocer
  // las columnas y los tipos.
  // -------------------------------------------------------

  const template = records[0];

  if (!template) {
    showDashboardToast(
      `No existe todavía un registro de referencia en ${tableName}.`,
    );

    return;
  }

  const fields = Object.entries(template)
    .map(([fieldName, value]) => {
      return createDashboardCreateField(fieldName, value);
    })
    .join("");

  // -------------------------------------------------------
  // ABRIR PANEL
  // -------------------------------------------------------

  openDashboardEditor(
    editorTitle,
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-create-record-form"
      >
        <div class="dashboard-create-intro">
          <p class="dashboard-create-intro__eyebrow">
            NUEVO REGISTRO
          </p>

          <p>
            Completa la información principal.
            Podrás modificarla nuevamente después
            de crear el registro.
          </p>
        </div>

        <div class="dashboard-editor-form__fields">
          ${fields}
        </div>

        <div class="dashboard-editor-form__footer">

          <button
            class="button button--dark"
            type="submit"
            id="dashboard-create-submit"
          >
            Crear

            <i
              class="bi bi-arrow-right"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </form>
    `,
  );

  // -------------------------------------------------------
  // FORMULARIO
  // -------------------------------------------------------

  const form = document.querySelector("#dashboard-create-record-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await createDashboardRecord(tableName, template, form);
  });
}

// =========================================================
// CREAR REGISTRO EN SUPABASE
// =========================================================

async function createDashboardRecord(tableName, template, form) {
  const formData = new FormData(form);

  const newRecord = {};

  // =======================================================
  // CONSTRUIR OBJETO
  // =======================================================

  Object.entries(template).forEach(([fieldName, originalValue]) => {
    if (dashboardCreateProtectedFields.has(fieldName)) {
      return;
    }

    const field = form.elements.namedItem(fieldName);

    if (!field) {
      return;
    }

    // ---------------------------------------------------
    // BOOLEAN
    // ---------------------------------------------------

    if (typeof originalValue === "boolean") {
      newRecord[fieldName] = field.checked;

      return;
    }

    // ---------------------------------------------------
    // NUMBER
    // ---------------------------------------------------

    if (typeof originalValue === "number") {
      const rawValue = formData.get(fieldName);

      newRecord[fieldName] = rawValue === "" ? null : Number(rawValue);

      return;
    }

    // ---------------------------------------------------
    // AUTRES
    // ---------------------------------------------------

    const rawValue = formData.get(fieldName);

    newRecord[fieldName] = rawValue === "" ? null : rawValue;
  });

  // =======================================================
  // BOUTON LOADING
  // =======================================================

  const submitButton = form.querySelector("#dashboard-create-submit");

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.innerHTML = `
      Guardando...
      <i
        class="bi bi-arrow-repeat"
        aria-hidden="true"
      ></i>
    `;
  }

  // =======================================================
  // INSERT
  // =======================================================

  try {
    const { data, error } = await window.supabaseClient
      .from(tableName)
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      throw error;
    }

    showDashboardToast(
      tableName === "releases"
        ? "Release creado correctamente."
        : "Producto creado correctamente.",
    );

    closeDashboardEditor();

    // =====================================================
    // ACTUALIZAR LISTA
    // =====================================================

    if (tableName === "releases") {
      await loadDashboardReleases();
    }

    if (tableName === "products") {
      await loadDashboardProducts();
    }
  } catch (error) {
    console.error("❌ Error al crear el registro.");

    showDashboardToast(
      "No se pudo crear el registro. Revisa los campos obligatorios.",
      5000,
    );

    // -----------------------------------------------------
    // RESTAURAR BOTÓN
    // -----------------------------------------------------

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.innerHTML = `
        Crear
        <i
          class="bi bi-arrow-right"
          aria-hidden="true"
        ></i>
      `;
    }
  }
}

// =========================================================
// NUEVO RELEASE
// =========================================================

if (dashboardAddReleaseButton) {
  dashboardAddReleaseButton.addEventListener("click", () => {
    openDashboardCreateEditor("releases", dashboardReleases, "Nuevo release");
  });
}

// =========================================================
// NUEVO PRODUCTO
// =========================================================

function createDashboardProductSlug(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function openDashboardProductCreateEditor() {
  openDashboardEditor(
    "Nuevo producto",
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-product-create-form"
      >
        <div class="dashboard-editor-form__fields">
          <div class="dashboard-editor-field">
            <label for="product-create-title">Título</label>
            <input
              id="product-create-title"
              name="title"
              type="text"
              required
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-type">Tipo de producto</label>
            <input
              id="product-create-type"
              name="product_type"
              type="text"
              required
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-cover">PORTADA DEL PRODUCTO</label>
            <input
              id="product-create-cover"
              name="cover_file"
              type="file"
              accept="image/*"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-short-description">
              Descripción corta
            </label>
            <textarea
              id="product-create-short-description"
              name="short_description"
              rows="4"
            ></textarea>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-full-description">
              Descripción completa
            </label>
            <textarea
              id="product-create-full-description"
              name="full_description"
              rows="6"
            ></textarea>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-price">Precio</label>
            <input
              id="product-create-price"
              name="price"
              type="number"
              step="0.01"
              value="0"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-old-price">Precio anterior</label>
            <input
              id="product-create-old-price"
              name="old_price"
              type="number"
              step="0.01"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-currency">Divisa</label>
            <select id="product-create-currency" name="currency">
              <option value="USD" selected>USD</option>
              <option value="EUR">EUR</option>
              <option value="CHF">CHF</option>
            </select>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-compatibility">Compatibilidad</label>
            <input
              id="product-create-compatibility"
              name="compatibility"
              type="text"
            />
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input name="is_free" type="checkbox" />
              <span>Producto gratuito</span>
            </label>
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input name="is_featured" type="checkbox" />
              <span>Producto destacado</span>
            </label>
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input name="is_published" type="checkbox" />
              <span>Publicado</span>
            </label>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-display-order">Orden de visualización</label>
            <input
              id="product-create-display-order"
              name="display_order"
              type="number"
              value="0"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-create-release-date">Fecha de lanzamiento</label>
            <input
              id="product-create-release-date"
              name="release_date"
              type="date"
            />
          </div>
        </div>

        <div class="dashboard-editor-form__footer">
          <button
            class="button button--dark"
            id="dashboard-product-create-submit"
            type="submit"
          >
            Crear
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </form>
    `,
  );

  const form = document.querySelector("#dashboard-product-create-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await createDashboardProduct(form);
  });
}

async function createDashboardProduct(form) {
  const formData = new FormData(form);
  const title = formData.get("title")?.trim() || "";
  const productType = formData.get("product_type")?.trim() || "";
  const coverFile = formData.get("cover_file");
  const submitButton = form.querySelector("#dashboard-product-create-submit");

  if (!title || !productType) {
    showDashboardToast("El título y el tipo de producto son obligatorios.");

    return;
  }

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.innerHTML = `
      Guardando...
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `;
  }

  const productSlug = createDashboardProductSlug(title);

  const productData = {
    title,
    slug: productSlug,
    product_type: productType,
    short_description: formData.get("short_description")?.trim() || null,
    full_description: formData.get("full_description")?.trim() || null,
    price: Number(formData.get("price") || 0),
    old_price: formData.get("old_price")
      ? Number(formData.get("old_price"))
      : null,
    currency: formData.get("currency") || "USD",
    compatibility: formData.get("compatibility")?.trim() || null,
    is_free: formData.get("is_free") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_published: formData.get("is_published") === "on",
    display_order: Number(formData.get("display_order") || 0),
    release_date: formData.get("release_date") || null,
  };

  try {
    if (coverFile instanceof File && coverFile.size > 0) {
      productData.cover_image_url = await uploadDashboardProductCover(
        coverFile,
        productSlug,
      );
    }

    const { error } = await window.supabaseClient
      .from("products")
      .insert(productData);

    if (error) {
      throw error;
    }

    showDashboardToast("Producto creado correctamente.");

    closeDashboardEditor();

    await loadDashboardProducts();
  } catch (error) {
    const uploadedCoverPath = getDashboardProductCoverStoragePath(
      productData.cover_image_url,
    );

    if (uploadedCoverPath) {
      await window.supabaseClient.storage
        .from("product-images")
        .remove([uploadedCoverPath]);
    }

    console.error("❌ Error al crear el producto.");

    showDashboardToast("No se pudo crear el producto.", 5000);

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.innerHTML = `
        Crear
        <i class="bi bi-arrow-right" aria-hidden="true"></i>
      `;
    }
  }
}

function openDashboardProductEditEditor(product) {
  openDashboardEditor(
    `Editar producto · ${getDashboardRecordTitle(product)}`,
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-product-edit-form"
      >
        <div class="dashboard-editor-form__fields">
          <div class="dashboard-editor-field">
            <label for="product-edit-title">Título</label>
            <input
              id="product-edit-title"
              name="title"
              type="text"
              value="${escapeDashboardHtml(product.title || "")}" 
              required
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-type">Tipo de producto</label>
            <input
              id="product-edit-type"
              name="product_type"
              type="text"
              value="${escapeDashboardHtml(product.product_type || "")}" 
              required
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-cover">PORTADA DEL PRODUCTO</label>
            <input
              id="product-edit-cover"
              name="cover_file"
              type="file"
              accept="image/*"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-short-description">
              Descripción corta
            </label>
            <textarea
              id="product-edit-short-description"
              name="short_description"
              rows="4"
            >${escapeDashboardHtml(product.short_description || "")}</textarea>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-full-description">
              Descripción completa
            </label>
            <textarea
              id="product-edit-full-description"
              name="full_description"
              rows="6"
            >${escapeDashboardHtml(product.full_description || "")}</textarea>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-file-title">ARCHIVO DEL PRODUCTO</label>
            <input
              id="product-edit-file-title"
              name="product_file_title"
              type="text"
              placeholder="Nombre visible del archivo"
            />
            <input
              id="product-edit-file"
              name="product_file"
              type="file"
            />

            <div id="product-edit-existing-files"></div>
          </div>

          <div class="dashboard-editor-field">
            <p>IMÁGENES DEL PRODUCTO</p>
            <input
              name="product_image_alt"
              type="text"
              placeholder="Texto alternativo"
            />
            <input
              name="product_image_file"
              type="file"
              accept="image/*"
            />
            <div id="product-edit-existing-images"></div>
          </div>

          <div class="dashboard-editor-field">
            <p>LICENCIAS DEL PRODUCTO</p>
            <div id="dashboard-product-existing-licenses">
              Este producto no tiene licencias asociadas.
            </div>
            <button
              class="button button--dark"
              id="dashboard-product-add-license"
              type="button"
            >
              + AÑADIR LICENCIA
            </button>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-price">Precio</label>
            <input
              id="product-edit-price"
              name="price"
              type="number"
              step="0.01"
              value="${escapeDashboardHtml(product.price ?? 0)}"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-old-price">Precio anterior</label>
            <input
              id="product-edit-old-price"
              name="old_price"
              type="number"
              step="0.01"
              value="${escapeDashboardHtml(product.old_price ?? "")}"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-currency">Divisa</label>
            <select id="product-edit-currency" name="currency">
              <option value="USD" ${product.currency === "USD" ? "selected" : ""}>USD</option>
              <option value="EUR" ${product.currency === "EUR" ? "selected" : ""}>EUR</option>
              <option value="CHF" ${product.currency === "CHF" ? "selected" : ""}>CHF</option>
            </select>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-compatibility">Compatibilidad</label>
            <input
              id="product-edit-compatibility"
              name="compatibility"
              type="text"
              value="${escapeDashboardHtml(product.compatibility || "")}"
            />
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input name="is_free" type="checkbox" ${product.is_free ? "checked" : ""} />
              <span>Producto gratuito</span>
            </label>
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input name="is_featured" type="checkbox" ${product.is_featured ? "checked" : ""} />
              <span>Producto destacado</span>
            </label>
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input name="is_published" type="checkbox" ${product.is_published ? "checked" : ""} />
              <span>Publicado</span>
            </label>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-display-order">Orden de visualización</label>
            <input
              id="product-edit-display-order"
              name="display_order"
              type="number"
              value="${escapeDashboardHtml(product.display_order ?? 0)}"
            />
          </div>

          <div class="dashboard-editor-field">
            <label for="product-edit-release-date">Fecha de lanzamiento</label>
            <input
              id="product-edit-release-date"
              name="release_date"
              type="date"
              value="${escapeDashboardHtml(product.release_date || "")}"
            />
          </div>
        </div>

        <div class="dashboard-editor-form__footer">
          <button
            class="button button--danger dashboard-product-delete-button"
            id="dashboard-delete-product"
            type="button"
          >
            ELIMINAR PRODUCTO

            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>

          <button
            class="button button--dark dashboard-product-save-button"
            id="dashboard-product-edit-submit"
            type="submit"
          >
            Guardar cambios
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </form>
    `,
  );

  const form = document.querySelector("#dashboard-product-edit-form");

  if (!form) {
    return;
  }

  loadDashboardProductFiles(product.id);
  loadDashboardProductImages(product.id);
  loadDashboardProductLicenses(product.id);

  const addProductLicenseButton = document.querySelector(
    "#dashboard-product-add-license",
  );

  if (addProductLicenseButton) {
    addProductLicenseButton.addEventListener("click", async () => {
      await openDashboardProductLicenseEditor(product);
    });
  }

  const deleteProductButton = document.querySelector(
    "#dashboard-delete-product",
  );

  if (deleteProductButton) {
    deleteProductButton.addEventListener("click", async () => {
      const confirmed = window.confirm(
        `¿Eliminar definitivamente "${product.title}"?`,
      );

      if (!confirmed) {
        return;
      }

      await deleteDashboardProduct(product, deleteProductButton);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await updateDashboardProduct(product, form);
  });
}

async function loadDashboardProductLicenses(productId) {
  const licensesContainer = document.querySelector(
    "#dashboard-product-existing-licenses",
  );

  if (!licensesContainer) {
    return;
  }

  licensesContainer.innerHTML = "";

  const { data: productLicenses, error } = await window.supabaseClient
    .from("product_licenses")
    .select(
      "id, license_id, price, currency, display_order, is_active, licenses(id, title, short_description, terms)",
    )
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Error al cargar las licencias del producto.");
    return;
  }

  if (!productLicenses?.length) {
    licensesContainer.textContent =
      "Este producto no tiene licencias asociadas.";
    return;
  }

  licensesContainer.innerHTML = productLicenses
    .map((productLicense) => {
      const license = productLicense.licenses;
      const price =
        Number(productLicense.price) === 0
          ? "INCLUIDA EN EL PRECIO DEL PRODUCTO"
          : productLicense.price === null || productLicense.price === undefined
            ? ""
            : `${productLicense.price} ${productLicense.currency || ""}`.trim();

      return `
        <article class="dashboard-product-license">
          <div>
            <h4>${escapeDashboardHtml(license?.title || "Sin título")}</h4>
            ${
              license?.short_description
                ? `<p>${escapeDashboardHtml(license.short_description)}</p>`
                : ""
            }
            ${price ? `<span>${escapeDashboardHtml(price)}</span>` : ""}
          </div>
          <div>
            <span class="dashboard-data-card__status">
              ${productLicense.is_active ? "ACTIVA" : "OCULTA"}
            </span>
            <button
              class="button button--danger dashboard-product-image-control"
              type="button"
              data-delete-product-license
              data-product-license-id="${escapeDashboardHtml(productLicense.id)}"
              aria-label="Quitar licencia del producto"
              title="Quitar licencia"
            >
              ×
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  licensesContainer
    .querySelectorAll("[data-delete-product-license]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmed = window.confirm("¿Quitar esta licencia del producto?");

        if (!confirmed) {
          return;
        }

        await deleteDashboardProductLicense(
          productId,
          button.dataset.productLicenseId,
          button,
        );
      });
    });
}

async function deleteDashboardProductLicense(
  productId,
  productLicenseId,
  button,
) {
  if (button) {
    button.disabled = true;
  }

  try {
    const { error } = await window.supabaseClient
      .from("product_licenses")
      .delete()
      .eq("id", productLicenseId);

    if (error) {
      throw error;
    }

    await loadDashboardProductLicenses(productId);
  } catch (error) {
    console.error("❌ Error al quitar la licencia del producto.");

    const licensesContainer = document.querySelector(
      "#dashboard-product-existing-licenses",
    );

    if (licensesContainer) {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "No se pudo quitar la licencia del producto.";
      licensesContainer.appendChild(errorMessage);
    }

    if (button) {
      button.disabled = false;
    }
  }
}

async function openDashboardProductLicenseEditor(product) {
  const { data: licenses, error } = await window.supabaseClient
    .from("licenses")
    .select("id, title, short_description, is_active")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("❌ Error al cargar las licencias disponibles.");
    return;
  }

  openDashboardEditor(
    "Añadir licencia al producto",
    `
      <form
        class="dashboard-editor-form"
        id="dashboard-product-license-form"
      >
        <div class="dashboard-editor-form__fields">
          <div class="dashboard-editor-field">
            <label for="product-license-id">LICENCIA</label>
            <select id="product-license-id" name="license_id" required>
              <option value="">Selecciona una licencia</option>
              ${(licenses || [])
                .map(
                  (license) => `
                    <option value="${escapeDashboardHtml(license.id)}">
                      ${escapeDashboardHtml(license.title || "Sin título")}
                    </option>
                  `,
                )
                .join("")}
            </select>
            <button
              class="button button--dark"
              id="dashboard-create-product-license"
              type="button"
            >
              + CREAR NUEVA LICENCIA
            </button>
          </div>

          <div
            class="dashboard-editor-field"
            id="dashboard-product-license-create-form-container"
            hidden
          >
            <div id="dashboard-product-license-create-form">
              <label for="new-license-title">NOMBRE DE LA LICENCIA *</label>
              <input
                id="new-license-title"
                name="new_license_title"
                type="text"
              />

              <label for="new-license-short-description">
                DESCRIPCIÓN CORTA *
              </label>
              <textarea
                id="new-license-short-description"
                name="new_license_short_description"
                rows="3"
              ></textarea>

              <label for="new-license-terms">
                CONDICIONES / TÉRMINOS *
              </label>
              <textarea
                id="new-license-terms"
                name="new_license_terms"
                rows="5"
              ></textarea>

              <label class="dashboard-editor-field--checkbox">
                <input
                  name="new_license_is_active"
                  type="checkbox"
                  checked
                />
                <span>ACTIVA</span>
              </label>

              <p data-license-form-message role="alert"></p>

              <button
                class="button button--dark"
                id="dashboard-product-license-create-submit"
                type="button"
              >
                CREAR LICENCIA
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-license-price">PRECIO</label>
            <input
              id="product-license-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input
                id="product-license-included"
                name="product_license_included"
                type="checkbox"
                checked
              />
              <span>Incluida en el precio del producto</span>
            </label>
          </div>

          <div class="dashboard-editor-field">
            <label for="product-license-currency">MONEDA</label>
            <select id="product-license-currency" name="currency">
              <option value="CHF" selected>CHF</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div class="dashboard-editor-field dashboard-editor-field--checkbox">
            <label>
              <input
                name="is_active"
                type="checkbox"
                checked
              />
              <span>ACTIVA</span>
            </label>
          </div>

          <p id="dashboard-product-license-message" role="alert"></p>
        </div>

        <div class="dashboard-editor-form__footer">
          <button
            class="button button--dark"
            id="dashboard-product-license-submit"
            type="submit"
            ${licenses?.length ? "" : "disabled"}
          >
            AÑADIR LICENCIA
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </form>
    `,
  );

  const form = document.querySelector("#dashboard-product-license-form");

  if (!form) {
    return;
  }

  const createProductLicenseButton = document.querySelector(
    "#dashboard-create-product-license",
  );
  const createProductLicenseContainer = document.querySelector(
    "#dashboard-product-license-create-form-container",
  );
  const createProductLicenseForm = document.querySelector(
    "#dashboard-product-license-create-form",
  );

  createProductLicenseButton?.addEventListener("click", () => {
    if (createProductLicenseContainer) {
      createProductLicenseContainer.hidden = false;
    }

    createProductLicenseForm
      ?.querySelectorAll('[name^="new_license_"]')
      .forEach((field) => {
        if (field.name !== "new_license_is_active") {
          field.required = true;
        }
      });

    createProductLicenseButton.disabled = true;
  });

  document
    .querySelector("#dashboard-product-license-create-submit")
    ?.addEventListener("click", async () => {
      await createDashboardLicense(form);
    });

  if (!licenses?.length) {
    const message = document.querySelector(
      "#dashboard-product-license-message",
    );

    if (message) {
      message.textContent = "No hay licencias globales activas disponibles.";
    }

    return;
  }

  const includedCheckbox = form.querySelector("#product-license-included");
  const priceInput = form.querySelector("#product-license-price");

  const updatePriceState = () => {
    if (!includedCheckbox || !priceInput) {
      return;
    }

    priceInput.disabled = includedCheckbox.checked;
    priceInput.required = !includedCheckbox.checked;
  };

  includedCheckbox?.addEventListener("change", updatePriceState);
  updatePriceState();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await createDashboardProductLicense(product.id, form);
  });
}

async function createDashboardProductLicense(productId, form) {
  const formData = new FormData(form);
  const licenseId = formData.get("license_id")?.trim() || "";
  const isIncluded = formData.get("product_license_included") === "on";
  const rawPrice = formData.get("price")?.trim() || "";
  const price = isIncluded ? 0 : Number(rawPrice);
  const currency = formData.get("currency")?.trim() || "CHF";
  const isActive = formData.get("is_active") === "on";
  const submitButton = form.querySelector("#dashboard-product-license-submit");
  const message = form.querySelector("#dashboard-product-license-message");

  if (
    !licenseId ||
    (!isIncluded && (!rawPrice || !Number.isFinite(price) || price < 0))
  ) {
    if (message) {
      message.textContent =
        "Selecciona una licencia e introduce un precio válido.";
    }

    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = `
      Añadiendo...
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `;
  }

  try {
    const { data: existingLicense, error: duplicateError } =
      await window.supabaseClient
        .from("product_licenses")
        .select("id")
        .eq("product_id", productId)
        .eq("license_id", licenseId)
        .maybeSingle();

    if (duplicateError) {
      throw duplicateError;
    }

    if (existingLicense) {
      if (message) {
        message.textContent = "Esta licencia ya está asociada a este producto.";
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
          AÑADIR LICENCIA
          <i class="bi bi-arrow-right" aria-hidden="true"></i>
        `;
      }

      return;
    }

    const { data: lastProductLicense, error: orderError } =
      await window.supabaseClient
        .from("product_licenses")
        .select("display_order")
        .eq("product_id", productId)
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    const displayOrder = lastProductLicense
      ? Number(lastProductLicense.display_order || 0) + 1
      : 0;

    const { error: insertError } = await window.supabaseClient
      .from("product_licenses")
      .insert({
        product_id: productId,
        license_id: licenseId,
        price,
        currency,
        display_order: displayOrder,
        is_active: isActive,
      });

    if (insertError) {
      throw insertError;
    }

    closeDashboardEditor();
    openDashboardProductEditEditor(
      dashboardProducts.find(
        (product) => String(product.id) === String(productId),
      ) || {
        id: productId,
      },
    );
  } catch (error) {
    console.error("❌ Error al asociar la licencia al producto.");

    if (message) {
      message.textContent = "No se pudo asociar la licencia al producto.";
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `
        AÑADIR LICENCIA
        <i class="bi bi-arrow-right" aria-hidden="true"></i>
      `;
    }
  }
}

async function loadDashboardProductImages(productId) {
  const imagesContainer = document.querySelector(
    "#product-edit-existing-images",
  );

  if (!imagesContainer) {
    return;
  }

  imagesContainer.innerHTML = "";

  const { data: productImages, error } = await window.supabaseClient
    .from("product_images")
    .select("id, image_url, alt_text, display_order, is_active")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Error al cargar las imágenes del producto.");
    return;
  }

  if (!productImages?.length) {
    imagesContainer.textContent = "Sin imágenes";
    return;
  }

  imagesContainer.innerHTML = productImages
    .map(
      (productImage, productImageIndex) => `
        <figure>
          <img
            src="${escapeDashboardHtml(productImage.image_url || "")}"
            alt="${escapeDashboardHtml(productImage.alt_text || "")}"
          />
          ${
            productImage.alt_text
              ? `<figcaption>${escapeDashboardHtml(productImage.alt_text)}</figcaption>`
              : ""
          }
          <div class="dashboard-product-image-controls">
            <span>Orden: ${escapeDashboardHtml(productImage.display_order ?? "")}</span>
            <button
              class="button button--dark dashboard-product-image-control"
              type="button"
              data-move-product-image="up"
              data-image-id="${escapeDashboardHtml(productImage.id)}"
              aria-label="Subir imagen"
              title="Subir"
              ${productImageIndex === 0 ? "disabled" : ""}
            >
              ↑
            </button>
            <button
              class="button button--dark dashboard-product-image-control"
              type="button"
              data-move-product-image="down"
              data-image-id="${escapeDashboardHtml(productImage.id)}"
              aria-label="Bajar imagen"
              title="Bajar"
              ${productImageIndex === productImages.length - 1 ? "disabled" : ""}
            >
              ↓
            </button>
            <button
              class="button button--danger dashboard-product-image-control"
              type="button"
              data-delete-product-image
              data-image-id="${escapeDashboardHtml(productImage.id)}"
            >
              ×
            </button>
          </div>
        </figure>
      `,
    )
    .join("");

  imagesContainer
    .querySelectorAll("[data-move-product-image]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const currentIndex = productImages.findIndex(
          (productImage) =>
            String(productImage.id) === String(button.dataset.imageId),
        );
        const direction = button.dataset.moveProductImage;

        if (currentIndex === -1) {
          console.error("❌ Error al encontrar la imagen del producto.");
          return;
        }

        await moveDashboardProductImage(
          productId,
          productImages,
          currentIndex,
          direction,
        );
      });
    });

  imagesContainer
    .querySelectorAll("[data-delete-product-image]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmed = window.confirm(
          "¿Eliminar esta imagen? Esta acción no se puede deshacer.",
        );

        if (!confirmed) {
          return;
        }

        const image = productImages.find(
          (productImage) =>
            String(productImage.id) === String(button.dataset.imageId),
        );

        if (!image) {
          console.error("❌ Error al encontrar la imagen del producto.");
          return;
        }

        await deleteDashboardProductImage(productId, image, button);
      });
    });
}

async function moveDashboardProductImage(
  productId,
  images,
  currentIndex,
  direction,
) {
  const adjacentIndex =
    direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const currentImage = images[currentIndex];
  const adjacentImage = images[adjacentIndex];
  const imagesContainer = document.querySelector(
    "#product-edit-existing-images",
  );

  if (!currentImage || !adjacentImage || !imagesContainer) {
    return;
  }

  const movementButtons = Array.from(
    imagesContainer.querySelectorAll("[data-move-product-image]"),
  ).filter((button) => {
    const imageId = String(button.dataset.imageId);

    return (
      imageId === String(currentImage.id) ||
      imageId === String(adjacentImage.id)
    );
  });

  movementButtons.forEach((button) => {
    button.disabled = true;
  });

  try {
    const displayOrders = images
      .map((image) => Number(image.display_order))
      .filter(Number.isFinite);
    const maximumDisplayOrder = Math.max(...displayOrders, -1);
    const temporaryCurrentOrder = maximumDisplayOrder + 1000;
    const temporaryAdjacentOrder = maximumDisplayOrder + 1001;

    const { error: currentTemporaryError } = await window.supabaseClient
      .from("product_images")
      .update({ display_order: temporaryCurrentOrder })
      .eq("id", currentImage.id)
      .eq("product_id", productId);

    if (currentTemporaryError) {
      throw currentTemporaryError;
    }

    const { error: adjacentTemporaryError } = await window.supabaseClient
      .from("product_images")
      .update({ display_order: temporaryAdjacentOrder })
      .eq("id", adjacentImage.id)
      .eq("product_id", productId);

    if (adjacentTemporaryError) {
      throw adjacentTemporaryError;
    }

    const { error: currentFinalError } = await window.supabaseClient
      .from("product_images")
      .update({ display_order: adjacentImage.display_order })
      .eq("id", currentImage.id)
      .eq("product_id", productId);

    if (currentFinalError) {
      throw currentFinalError;
    }

    const { error: adjacentFinalError } = await window.supabaseClient
      .from("product_images")
      .update({ display_order: currentImage.display_order })
      .eq("id", adjacentImage.id)
      .eq("product_id", productId);

    if (adjacentFinalError) {
      throw adjacentFinalError;
    }

    await loadDashboardProductImages(productId);
  } catch (error) {
    console.error("❌ Error al reordenar las imágenes del producto.");
    await loadDashboardProductImages(productId);
  }
}

function getDashboardProductImageStoragePath(publicUrl) {
  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = publicUrl?.indexOf(marker) ?? -1;

  if (markerIndex === -1) {
    throw new Error("No se pudo obtener la ruta de la imagen del producto.");
  }

  const encodedPath = publicUrl.slice(markerIndex + marker.length);
  const storagePath = decodeURIComponent(encodedPath);

  if (!storagePath) {
    throw new Error("No se pudo obtener la ruta de la imagen del producto.");
  }

  return storagePath;
}

async function deleteDashboardProductImage(productId, image, deleteButton) {
  if (deleteButton) {
    deleteButton.disabled = true;
  }

  try {
    const storagePath = getDashboardProductImageStoragePath(image.image_url);
    const { error: storageError } = await window.supabaseClient.storage
      .from("product-images")
      .remove([storagePath]);

    if (storageError) {
      throw storageError;
    }

    const { error: databaseError } = await window.supabaseClient
      .from("product_images")
      .delete()
      .eq("id", image.id)
      .eq("product_id", productId);

    if (databaseError) {
      throw databaseError;
    }

    await loadDashboardProductImages(productId);
  } catch (error) {
    console.error("❌ Error al eliminar la imagen del producto.");

    if (deleteButton) {
      deleteButton.disabled = false;
    }
  }
}

async function loadDashboardProductFiles(productId) {
  const filesContainer = document.querySelector("#product-edit-existing-files");

  if (!filesContainer) {
    return;
  }

  filesContainer.innerHTML = "";

  const { data: productFiles, error } = await window.supabaseClient
    .from("product_files")
    .select("id, title, file_url, file_type, file_size_bytes")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("❌ Error al cargar los archivos del producto.");
    return;
  }

  if (!productFiles?.length) {
    return;
  }

  filesContainer.innerHTML = `
    <div class="dashboard-product-files">
      <p>Archivos existentes</p>
      <ul>
        ${productFiles
          .map((productFile) => {
            const fileSizeMb =
              Number(productFile.file_size_bytes || 0) / (1024 * 1024);

            return `
              <li>
                <span>${escapeDashboardHtml(productFile.title || "Archivo")}</span>
                <span>${escapeDashboardHtml(productFile.file_type || "Tipo desconocido")}</span>
                <span>${fileSizeMb.toFixed(2)} MB</span>
                <button
                  class="button button--danger"
                  type="button"
                  data-delete-product-file
                  data-file-id="${escapeDashboardHtml(productFile.id)}"
                  data-file-path="${escapeDashboardHtml(productFile.file_url)}"
                >
                  ELIMINAR
                </button>
              </li>
            `;
          })
          .join("")}
      </ul>
    </div>
  `;

  filesContainer
    .querySelectorAll("[data-delete-product-file]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmed = window.confirm(
          `¿Eliminar definitivamente "${button.closest("li")?.querySelector("span")?.textContent || "este archivo"}"?`,
        );

        if (!confirmed) {
          return;
        }

        await deleteDashboardProductFile(
          button.dataset.fileId,
          button.dataset.filePath,
          productId,
          button,
        );
      });
    });
}

async function deleteDashboardProductFile(
  fileId,
  filePath,
  productId,
  deleteButton,
) {
  if (deleteButton) {
    deleteButton.disabled = true;
  }

  try {
    const { error: storageError } = await window.supabaseClient.storage
      .from("product-files")
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    const { error: databaseError } = await window.supabaseClient
      .from("product_files")
      .delete()
      .eq("id", fileId);

    if (databaseError) {
      throw databaseError;
    }

    await loadDashboardProductFiles(productId);
  } catch (error) {
    console.error("❌ Error al eliminar el archivo del producto.");

    if (deleteButton) {
      deleteButton.disabled = false;
    }
  }
}

async function updateDashboardProduct(product, form) {
  const formData = new FormData(form);
  const title = formData.get("title")?.trim() || "";
  const productType = formData.get("product_type")?.trim() || "";
  const coverFile = formData.get("cover_file");
  const productFile = formData.get("product_file");
  const productFileTitle = formData.get("product_file_title")?.trim() || "";
  const productImageAlt = formData.get("product_image_alt")?.trim() || "";
  const productImageFile = formData.get("product_image_file");
  const hasNewProductImage =
    productImageFile instanceof File && productImageFile.size > 0;
  const submitButton = form.querySelector("#dashboard-product-edit-submit");
  let uploadedCoverPath = null;

  if (!title || !productType) {
    showDashboardToast("El título y el tipo de producto son obligatorios.");

    return;
  }

  if (
    productFile instanceof File &&
    productFile.size > 0 &&
    !productFileTitle
  ) {
    showDashboardToast("El nombre del archivo es obligatorio.");

    return;
  }

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.innerHTML = `
      Guardando...
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `;
  }

  const productData = {
    title,
    product_type: productType,
    short_description: formData.get("short_description")?.trim() || null,
    full_description: formData.get("full_description")?.trim() || null,
    price: Number(formData.get("price") || 0),
    old_price: formData.get("old_price")
      ? Number(formData.get("old_price"))
      : null,
    currency: formData.get("currency") || "USD",
    compatibility: formData.get("compatibility")?.trim() || null,
    is_free: formData.get("is_free") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_published: formData.get("is_published") === "on",
    display_order: Number(formData.get("display_order") || 0),
    release_date: formData.get("release_date") || null,
  };

  if (title !== (product.title || "")) {
    productData.slug = createDashboardProductSlug(title);
  }

  try {
    let newCoverUrl = null;

    if (coverFile instanceof File && coverFile.size > 0) {
      const productSlug =
        productData.slug || product.slug || createDashboardProductSlug(title);

      newCoverUrl = await uploadDashboardProductCover(coverFile, productSlug);
      productData.cover_image_url = newCoverUrl;
      uploadedCoverPath = getDashboardProductCoverStoragePath(newCoverUrl);
    }

    const { error } = await window.supabaseClient
      .from("products")
      .update(productData)
      .eq("id", product.id);

    if (error) {
      throw error;
    }

    if (productFile instanceof File && productFile.size > 0) {
      const productSlug =
        productData.slug || product.slug || createDashboardProductSlug(title);

      await createDashboardProductFile(
        product,
        productFile,
        productFileTitle,
        productSlug,
      );
    }

    if (hasNewProductImage) {
      const productSlug =
        productData.slug || product.slug || createDashboardProductSlug(title);

      await createDashboardProductImage(
        product,
        productImageFile,
        productImageAlt,
        productSlug,
      );

      await loadDashboardProductImages(product.id);
    }

    showDashboardToast("Producto actualizado correctamente.");

    if (newCoverUrl && product.cover_image_url) {
      const oldCoverPath = getDashboardProductCoverStoragePath(
        product.cover_image_url,
      );

      if (oldCoverPath) {
        const { error: oldCoverDeleteError } =
          await window.supabaseClient.storage
            .from("product-images")
            .remove([oldCoverPath]);

        if (oldCoverDeleteError) {
          console.error(
            "❌ Error al eliminar la portada anterior del producto.",
          );
        }
      }
    }

    if (hasNewProductImage) {
      await loadDashboardProducts();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
          Guardar cambios
          <i class="bi bi-arrow-right" aria-hidden="true"></i>
        `;
      }

      return;
    }

    closeDashboardEditor();

    await loadDashboardProducts();
  } catch (error) {
    if (uploadedCoverPath) {
      await window.supabaseClient.storage
        .from("product-images")
        .remove([uploadedCoverPath]);
    }

    console.error("❌ Error al actualizar el producto.");

    showDashboardToast("No se pudieron guardar los cambios.", 5000);

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.innerHTML = `
        Guardar cambios
        <i class="bi bi-arrow-right" aria-hidden="true"></i>
      `;
    }
  }
}

async function createDashboardProductImage(
  product,
  file,
  altText,
  productSlug,
) {
  let uploadedImage = null;

  try {
    uploadedImage = await uploadDashboardProductImage(file, productSlug);

    const { data: lastImage, error: orderError } = await window.supabaseClient
      .from("product_images")
      .select("display_order")
      .eq("product_id", product.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    const nextDisplayOrder = lastImage
      ? Number(lastImage.display_order || 0) + 1
      : 0;

    const { error: insertError } = await window.supabaseClient
      .from("product_images")
      .insert({
        product_id: product.id,
        image_url: uploadedImage.publicUrl,
        alt_text: altText || null,
        display_order: nextDisplayOrder,
        is_active: true,
      });

    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    if (uploadedImage?.path) {
      await window.supabaseClient.storage
        .from("product-images")
        .remove([uploadedImage.path]);
    }

    console.error("❌ Error al crear la imagen del producto.");

    throw error;
  }
}

async function createDashboardProductFile(product, file, title, productSlug) {
  let storagePath = null;

  try {
    storagePath = await uploadDashboardProductFile(file, productSlug);

    const { error } = await window.supabaseClient.from("product_files").insert({
      product_id: product.id,
      title,
      file_url: storagePath,
      file_type: file.type || null,
      file_size_bytes: file.size,
      display_order: 0,
      is_active: true,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    if (storagePath) {
      await window.supabaseClient.storage
        .from("product-files")
        .remove([storagePath]);
    }

    throw error;
  }
}

async function deleteDashboardProduct(product, deleteProductButton) {
  if (deleteProductButton) {
    deleteProductButton.disabled = true;

    deleteProductButton.innerHTML = `
      Eliminando...
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
    `;
  }

  try {
    const { error } = await window.supabaseClient
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      throw error;
    }

    closeDashboardEditor();

    await loadDashboardProducts();
  } catch (error) {
    console.error("❌ Error al eliminar el producto.");

    showDashboardToast("No se pudo eliminar el producto.", 5000);

    if (deleteProductButton) {
      deleteProductButton.disabled = false;

      deleteProductButton.innerHTML = `
        ELIMINAR PRODUCTO
        <i class="bi bi-trash3" aria-hidden="true"></i>
      `;
    }
  }
}

if (dashboardAddProductButton) {
  dashboardAddProductButton.addEventListener("click", () => {
    openDashboardProductCreateEditor();
  });
}

async function uploadDashboardProductCover(coverFile, productSlug) {
  if (!coverFile) {
    return null;
  }

  if (!coverFile.type.startsWith("image/")) {
    throw new Error("La portada debe ser una imagen válida.");
  }

  const maxSize = 8 * 1024 * 1024;

  if (coverFile.size > maxSize) {
    throw new Error("La portada no puede superar los 8 MB.");
  }

  const extension = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  const uniqueId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storagePath = `${productSlug || "product"}/${uniqueId}.${safeExtension}`;

  const { error: uploadError } = await window.supabaseClient.storage
    .from("product-images")
    .upload(storagePath, coverFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: coverFile.type,
    });

  if (uploadError) {
    console.error("❌ Error al enviar la portada del producto.");

    throw uploadError;
  }

  const { data: publicUrlData } = window.supabaseClient.storage
    .from("product-images")
    .getPublicUrl(storagePath);

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    await window.supabaseClient.storage
      .from("product-images")
      .remove([storagePath]);

    throw new Error("No se pudo generar la URL pública de la portada.");
  }

  return publicUrl;
}

async function uploadDashboardProductImage(file, productSlug) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("La imagen del producto no es válida.");
  }

  const extensionByType = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const safeExtension = extensionByType[file.type] || "jpg";
  const uniqueId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storagePath = `${productSlug || "product"}/${uniqueId}.${safeExtension}`;

  const { error: uploadError } = await window.supabaseClient.storage
    .from("product-images")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("❌ Error al subir la imagen del producto.");

    throw uploadError;
  }

  const { data: publicUrlData } = window.supabaseClient.storage
    .from("product-images")
    .getPublicUrl(storagePath);
  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    await window.supabaseClient.storage
      .from("product-images")
      .remove([storagePath]);

    console.error("❌ Error al obtener la URL pública de la imagen.");

    throw new Error("No se pudo generar la URL pública de la imagen.");
  }

  return {
    path: storagePath,
    publicUrl,
  };
}

function getDashboardProductCoverStoragePath(publicUrl) {
  if (!publicUrl) {
    return null;
  }

  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = publicUrl.slice(markerIndex + marker.length);

  try {
    return decodeURIComponent(encodedPath);
  } catch (error) {
    return encodedPath;
  }
}

async function uploadDashboardProductFile(file, productSlug) {
  if (!file) {
    throw new Error("El archivo del producto es obligatorio.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "bin";
  const uniqueId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storagePath = `${productSlug || "product"}/${uniqueId}.${safeExtension}`;

  const { error: uploadError } = await window.supabaseClient.storage
    .from("product-files")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    console.error("❌ Error al enviar el archivo del producto.");

    throw uploadError;
  }

  return storagePath;
}

// =========================================================
// DASHBOARD — ÉDITEUR RELEASE PROFESSIONNEL
// =========================================================
// Remplace progressivement le formulaire générique
// par un éditeur dédié aux releases.
//
// Structure :
// 01 Información
// 02 Cover
// 03 Tracks
// 04 Plataformas
// 05 Publicación
// =========================================================

// =========================================================
// OUVRIR L'ÉDITEUR "NOUVEAU RELEASE"
// =========================================================

function openCreateReleaseEditor() {
  openDashboardEditor(
    "Nuevo release",
    `
      <form
        class="dashboard-release-form"
        id="dashboard-release-create-form"
      >
        <!-- ==============================================
             01 — INFORMACIÓN
        =============================================== -->

        <section class="dashboard-editor-section">
          <div class="dashboard-editor-section__heading">
            <span>01</span>

            <div>
              <p>INFORMACIÓN</p>
              <h3>Datos principales</h3>
            </div>
          </div>

          <div class="dashboard-editor-form__fields">
            <div class="dashboard-editor-field">
              <label for="release-title">
                Título
              </label>

              <input
                id="release-title"
                name="title"
                type="text"
                autocomplete="off"
                required
              />
            </div>

            <div class="dashboard-editor-field">
              <label for="release-slug">
                Slug
              </label>

              <input
                id="release-slug"
                name="slug"
                type="text"
                autocomplete="off"
                placeholder="mi-nuevo-release"
                required
              />
            </div>

            <div class="dashboard-editor-field">
            <label for="release-type">
              Tipo de release
            </label>

            <select
              id="release-type"
              name="release_type"
            >
            <option value="Single">
              Single
            </option>

            <option value="EP">
              EP
            </option>

            <option value="Album">
              Album
            </option>

            <option value="Mixtape">
              Mixtape
            </option>
            </select>
            </div>

            <div class="dashboard-editor-field">
            <label for="release-year">
              Año
            </label>

            <input
              id="release-year"
              name="release_year"
              type="number"
              min="1900"
              max="2100"
              value="${new Date().getFullYear()}"
            />
            </div>

            <div class="dashboard-editor-field">
              <label for="release-genre">
                Género
              </label>

              <input
                id="release-genre"
                name="genre"
                type="text"
                autocomplete="off"
                placeholder="Techno"
              />
            </div>

            <div class="dashboard-editor-field">
              <label for="release-description">
                Descripción
              </label>

              <textarea
                id="release-description"
                name="description"
                rows="5"
              ></textarea>
            </div>
          </div>
        </section>


        <!-- ==============================================
             02 — COVER
        =============================================== -->

        <section class="dashboard-editor-section">
          <div class="dashboard-editor-section__heading">
            <span>02</span>

            <div>
              <p>COVER</p>
              <h3>Imagen del release</h3>
            </div>
          </div>

          <div class="dashboard-release-cover">
            <label
              class="dashboard-upload-zone"
              for="release-cover-file"
            >
              <i
                class="bi bi-image"
                aria-hidden="true"
              ></i>

              <strong>
                Seleccionar imagen
              </strong>

              <span>
                JPG, PNG o WEBP
              </span>

              <input
                id="release-cover-file"
                name="cover_file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>

            <div
              class="dashboard-release-cover__preview"
              id="release-cover-preview"
              hidden
            >
              <img
                id="release-cover-preview-image"
                src=""
                alt="Vista previa de la portada"
              />
            </div>
          </div>
        </section>


        <!-- ==============================================
             03 — TRACKS
        =============================================== -->

        <section class="dashboard-editor-section">
          <div class="dashboard-editor-section__heading">
            <span>03</span>

            <div>
              <p>TRACKS</p>
              <h3>Lista de canciones</h3>
            </div>
          </div>

          <div
            class="dashboard-tracks-editor"
            id="dashboard-release-tracks"
          >
            <!-- Premier track -->
            <article
              class="dashboard-track-row"
              data-release-track
            >
              <div class="dashboard-track-row__number">
                01
              </div>

              <div class="dashboard-track-row__fields">
                <input
                  name="track_title"
                  type="text"
                  placeholder="Título del track"
                />

            <label class="dashboard-track-upload">
              <span class="dashboard-track-upload__button">
                <i class="bi bi-music-note-beamed"></i>
                Seleccionar archivo audio
              </span>

              <span
                class="dashboard-track-upload__filename"
                data-track-filename
              >
                Ningún archivo seleccionado
              </span>

              <input
                name="track_audio_file"
                type="file"
                accept="audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/mp4,audio/aac"
                data-track-audio-file
              />
            </label>
              </div>

              <button
                class="dashboard-track-row__remove"
                type="button"
                data-remove-release-track
                aria-label="Eliminar track"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </article>
          </div>

          <button
            class="dashboard-editor-add-button"
            id="dashboard-add-release-track"
            type="button"
          >
            <i class="bi bi-plus-lg"></i>
            Añadir track
          </button>
        </section>


        <!-- ==============================================
             04 — PLATAFORMAS
        =============================================== -->

        <section class="dashboard-editor-section">
          <div class="dashboard-editor-section__heading">
            <span>04</span>

            <div>
              <p>PLATAFORMAS</p>
              <h3>Enlaces externos</h3>
            </div>
          </div>

          <div class="dashboard-editor-form__fields">
            <div class="dashboard-editor-field">
              <label for="release-spotify-url">
                Spotify
              </label>

              <input
                id="release-spotify-url"
                name="spotify_url"
                type="url"
                placeholder="https://..."
              />
            </div>

            <div class="dashboard-editor-field">
              <label for="release-soundcloud-url">
                SoundCloud
              </label>

              <input
                id="release-soundcloud-url"
                name="soundcloud_url"
                type="url"
                placeholder="https://..."
              />
            </div>

            <div class="dashboard-editor-field">
              <label for="release-bandcamp-url">
                Bandcamp
              </label>

              <input
                id="release-bandcamp-url"
                name="bandcamp_url"
                type="url"
                placeholder="https://..."
              />
            </div>

            <div class="dashboard-editor-field">
              <label for="release-youtube-url">
                YouTube
              </label>

              <input
                id="release-youtube-url"
                name="youtube_url"
                type="url"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>


        <!-- ==============================================
             05 — PUBLICACIÓN
        =============================================== -->

        <section class="dashboard-editor-section">
          <div class="dashboard-editor-section__heading">
            <span>05</span>

            <div>
              <p>PUBLICACIÓN</p>
              <h3>Estado del release</h3>
            </div>
          </div>

          <label class="dashboard-toggle-row">
            <div>
              <strong>
                Publicar en el sitio
              </strong>

              <span>
                El release será visible públicamente.
              </span>
            </div>

            <input
              name="is_published"
              type="checkbox"
            />
          </label>
        </section>


        <!-- ==============================================
             FOOTER
        =============================================== -->

        <div class="dashboard-editor-form__footer">

          <button
            class="button button--dark"
            id="dashboard-create-release-submit"
            type="submit"
          >
            Crear release

            <i
              class="bi bi-arrow-right"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </form>
    `,
  );

  initializeCreateReleaseEditor();
}

// =========================================================
// INITIALISER L'ÉDITEUR RELEASE
// =========================================================

function initializeCreateReleaseEditor() {
  const form = document.querySelector("#dashboard-release-create-form");

  const titleInput = document.querySelector("#release-title");

  const slugInput = document.querySelector("#release-slug");

  const coverInput = document.querySelector("#release-cover-file");

  const coverPreview = document.querySelector("#release-cover-preview");

  const coverPreviewImage = document.querySelector(
    "#release-cover-preview-image",
  );

  const addTrackButton = document.querySelector("#dashboard-add-release-track");

  if (!form) {
    return;
  }

  // =======================================================
  // GÉNÉRATION AUTOMATIQUE DU SLUG
  // =======================================================

  if (titleInput && slugInput) {
    titleInput.addEventListener("input", () => {
      if (slugInput.dataset.manual === "true") {
        return;
      }

      slugInput.value = createDashboardSlug(titleInput.value);
    });

    slugInput.addEventListener("input", () => {
      slugInput.dataset.manual = "true";
    });
  }

  // =======================================================
  // PREVIEW COVER
  // =======================================================

  if (coverInput && coverPreview && coverPreviewImage) {
    coverInput.addEventListener("change", () => {
      const file = coverInput.files?.[0];

      if (!file) {
        coverPreview.hidden = true;
        coverPreviewImage.src = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      coverPreviewImage.src = previewUrl;
      coverPreview.hidden = false;
    });
  }

  // =======================================================
  // AJOUT TRACK
  // =======================================================

  if (addTrackButton) {
    addTrackButton.addEventListener("click", addDashboardReleaseTrackRow);
  }

  // =======================================================
  // SUPPRESSION TRACK
  // =======================================================

  connectDashboardReleaseTrackRemoveButtons();
  connectDashboardTrackFileInputs();

  // =======================================================
  // SUBMIT
  // =======================================================

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await submitDashboardReleaseForm(form);
  });
}

// =========================================================
// CRÉER UN SLUG
// =========================================================

function createDashboardSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// =========================================================
// AJOUTER UNE LIGNE TRACK
// =========================================================

function addDashboardReleaseTrackRow() {
  const tracksContainer = document.querySelector("#dashboard-release-tracks");

  if (!tracksContainer) {
    return;
  }

  const index =
    tracksContainer.querySelectorAll("[data-release-track]").length + 1;

  const track = document.createElement("article");

  track.className = "dashboard-track-row";

  track.setAttribute("data-release-track", "");

  track.innerHTML = `
    <div class="dashboard-track-row__number">
      ${String(index).padStart(2, "0")}
    </div>

    <div class="dashboard-track-row__fields">
      <input
        name="track_title"
        type="text"
        placeholder="Título del track"
      />

          <label class="dashboard-track-upload">
      <span class="dashboard-track-upload__button">
        <i class="bi bi-music-note-beamed"></i>
        Seleccionar archivo audio
      </span>

      <span
        class="dashboard-track-upload__filename"
        data-track-filename 
      >
        Ningún archivo seleccionado
      </span>

      <input
        name="track_audio_file"
        type="file"
        accept="audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/mp4,audio/aac"
        data-track-audio-file
      />
    </label>
    </div>

    <div class="dashboard-track-row__actions">

      <button
        class="dashboard-track-row__move"
        type="button"
        data-move-release-track="up"
        aria-label="Mover track hacia arriba"
        title="Subir"
      >
        <i class="bi bi-arrow-up"></i>
      </button>

      <button
        class="dashboard-track-row__move"
        type="button"
        data-move-release-track="down"
        aria-label="Mover track hacia abajo"
        title="Bajar"
      >
        <i class="bi bi-arrow-down"></i>
      </button>

      <button
        class="dashboard-track-row__remove"
        type="button"
        data-remove-release-track
        aria-label="Eliminar track"
        title="Eliminar"
      >
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  tracksContainer.appendChild(track);

  connectDashboardReleaseTrackRemoveButtons();
  connectDashboardTrackFileInputs();
  connectDashboardReleaseTrackMoveButtons();
}

// =========================================================
// AFFICHER LE NOM DU FICHIER AUDIO SÉLECTIONNÉ
// =========================================================

function connectDashboardTrackFileInputs() {
  const inputs = document.querySelectorAll("[data-track-audio-file]");

  inputs.forEach((input) => {
    input.onchange = () => {
      const row = input.closest("[data-release-track]");

      const filename = row?.querySelector("[data-track-filename]");

      const file = input.files?.[0];

      if (!filename) {
        return;
      }

      filename.textContent = file ? file.name : "Ningún archivo seleccionado";
    };
  });
}

// =========================================================
// SUPPRIMER UNE LIGNE TRACK
// =========================================================

function connectDashboardReleaseTrackRemoveButtons() {
  const buttons = document.querySelectorAll("[data-remove-release-track]");

  buttons.forEach((button) => {
    button.onclick = () => {
      const row = button.closest("[data-release-track]");

      if (!row) {
        return;
      }

      const tracksContainer = document.querySelector(
        "#dashboard-release-tracks",
      );

      const rows = tracksContainer?.querySelectorAll("[data-release-track]");

      // On garde toujours au moins une ligne
      if (!rows || rows.length <= 1) {
        const titleInput = row.querySelector('[name="track_title"]');

        const audioInput = row.querySelector('[name="track_audio_file"]');

        if (titleInput) {
          titleInput.value = "";
        }

        if (audioInput) {
          audioInput.value = "";
        }

        return;
      }

      row.remove();

      refreshDashboardReleaseTrackNumbers();
    };
  });
}

// =========================================================
// RENUMÉROTER LES TRACKS
// =========================================================

function refreshDashboardReleaseTrackNumbers() {
  const rows = document.querySelectorAll(
    "#dashboard-release-tracks [data-release-track]",
  );

  rows.forEach((row, index) => {
    const number = row.querySelector(".dashboard-track-row__number");

    if (number) {
      number.textContent = String(index + 1).padStart(2, "0");
    }
  });
}

// =========================================================
// TRACKS — CHANGER L'ORDRE
// =========================================================

function connectDashboardReleaseTrackMoveButtons() {
  const buttons = document.querySelectorAll("[data-move-release-track]");

  buttons.forEach((button) => {
    button.onclick = () => {
      const row = button.closest("[data-release-track]");

      const tracksContainer = row?.parentElement;

      if (!row || !tracksContainer) {
        return;
      }

      const direction = button.dataset.moveReleaseTrack;

      if (direction === "up") {
        const previousRow = row.previousElementSibling;

        if (previousRow && previousRow.matches("[data-release-track]")) {
          tracksContainer.insertBefore(row, previousRow);
        }
      }

      if (direction === "down") {
        const nextRow = row.nextElementSibling;

        if (nextRow && nextRow.matches("[data-release-track]")) {
          tracksContainer.insertBefore(nextRow, row);
        }
      }

      refreshDashboardReleaseTrackNumbers();

      connectDashboardReleaseTrackMoveButtons();
    };
  });
}

// =========================================================
// RELEASE — UPLOAD COVER SUPABASE STORAGE
// =========================================================
// Envoie la cover dans le bucket:
//
// release-covers
//
// Puis retourne l'URL publique qui sera enregistrée
// dans releases.cover_image_url.
// =========================================================

async function uploadDashboardReleaseCover(coverFile, releaseSlug) {
  // -------------------------------------------------------
  // AUCUNE IMAGE
  // -------------------------------------------------------

  if (!coverFile) {
    return null;
  }

  // -------------------------------------------------------
  // VALIDATION DU TYPE
  // -------------------------------------------------------

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(coverFile.type)) {
    throw new Error("La portada debe ser una imagen JPG, PNG o WEBP.");
  }

  // -------------------------------------------------------
  // VALIDATION DE LA TAILLE
  // -------------------------------------------------------

  const maxSize = 8 * 1024 * 1024;

  if (coverFile.size > maxSize) {
    throw new Error("La portada no puede superar los 8 MB.");
  }

  // -------------------------------------------------------
  // EXTENSION
  // -------------------------------------------------------

  const extension = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";

  // -------------------------------------------------------
  // NOM UNIQUE
  // -------------------------------------------------------

  const fileName = `${Date.now()}.${extension}`;

  const storagePath = `${releaseSlug}/${fileName}`;

  // -------------------------------------------------------
  // UPLOAD
  // -------------------------------------------------------

  const { data: uploadedFile, error: uploadError } =
    await window.supabaseClient.storage
      .from("release-covers")
      .upload(storagePath, coverFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: coverFile.type,
      });

  if (uploadError) {
    console.error("❌ Error al enviar la portada.");

    throw uploadError;
  }

  // -------------------------------------------------------
  // URL PUBLIQUE
  // -------------------------------------------------------

  const { data: publicUrlData } = window.supabaseClient.storage
    .from("release-covers")
    .getPublicUrl(storagePath);

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    throw new Error("No se pudo generar la URL pública de la portada.");
  }

  return publicUrl;
}

// =========================================================
// TRACK — UPLOAD AUDIO SUPABASE STORAGE
// =========================================================
// Envoie un fichier audio dans:
//
// release-audio
//
// Puis retourne:
// - l'URL publique;
// - le chemin Storage.
//
// Le chemin Storage sera utile si nous devons nettoyer
// un fichier après une erreur.
// =========================================================

async function uploadDashboardTrackAudio(
  audioFile,
  releaseSlug,
  trackTitle,
  trackNumber,
) {
  // -------------------------------------------------------
  // FICHIER OBLIGATOIRE
  // -------------------------------------------------------

  if (!audioFile) {
    throw new Error(`El track ${trackNumber} necesita un archivo de audio.`);
  }

  // -------------------------------------------------------
  // TYPES AUDIO AUTORISÉS
  // -------------------------------------------------------

  const allowedTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/flac",
    "audio/mp4",
    "audio/aac",
  ];

  if (!allowedTypes.includes(audioFile.type)) {
    throw new Error(
      `El archivo del track ${trackNumber} no tiene un formato de audio permitido.`,
    );
  }

  // -------------------------------------------------------
  // TAILLE MAXIMALE
  // -------------------------------------------------------
  // Ton bucket release-audio est actuellement limité
  // à 50 MB.
  // -------------------------------------------------------

  const maxSize = 50 * 1024 * 1024;

  if (audioFile.size > maxSize) {
    throw new Error(
      `El audio del track ${trackNumber} no puede superar los 50 MB.`,
    );
  }

  // -------------------------------------------------------
  // EXTENSION
  // -------------------------------------------------------

  const extension = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";

  // -------------------------------------------------------
  // NOM DU TRACK SÉCURISÉ
  // -------------------------------------------------------

  const trackSlug = createDashboardSlug(trackTitle) || `track-${trackNumber}`;

  // -------------------------------------------------------
  // CHEMIN STORAGE
  // -------------------------------------------------------
  //
  // Exemple:
  //
  // test-cms/01-mon-track-1724000000000.mp3
  //
  // -------------------------------------------------------

  const fileName =
    `${String(trackNumber).padStart(2, "0")}-` +
    `${trackSlug}-` +
    `${Date.now()}.${extension}`;

  const storagePath = `${releaseSlug}/${fileName}`;

  // -------------------------------------------------------
  // UPLOAD
  // -------------------------------------------------------

  const { data: uploadedFile, error: uploadError } =
    await window.supabaseClient.storage
      .from("release-audio")
      .upload(storagePath, audioFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: audioFile.type,
      });

  if (uploadError) {
    console.error("❌ Error al enviar el archivo de audio.");

    throw uploadError;
  }

  // -------------------------------------------------------
  // URL PUBLIQUE
  // -------------------------------------------------------

  const { data: publicUrlData } = window.supabaseClient.storage
    .from("release-audio")
    .getPublicUrl(storagePath);

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    throw new Error(
      `No se pudo generar la URL pública del track ${trackNumber}.`,
    );
  }

  return {
    publicUrl,
    storagePath,
  };
}

// =========================================================
// TRACKS — ENREGISTRER DANS SUPABASE
// =========================================================
// Pour chaque track:
//
// 1. upload du fichier vers release-audio;
// 2. récupération de l'URL publique;
// 3. création de la ligne dans public.tracks;
// 4. liaison avec releases.id.
// =========================================================

async function createDashboardReleaseTracks(
  trackEntries,
  createdRelease,
  releaseSlug,
  isPublished,
) {
  if (!trackEntries.length) {
    return [];
  }

  const uploadedPaths = [];

  try {
    const trackRecords = [];

    for (const trackEntry of trackEntries) {
      const { title, audioFile, trackNumber } = trackEntry;

      const { publicUrl, storagePath } = await uploadDashboardTrackAudio(
        audioFile,
        releaseSlug,
        title,
        trackNumber,
      );

      uploadedPaths.push(storagePath);

      trackRecords.push({
        release_id: createdRelease.id,

        title,

        track_number: trackNumber,

        audio_url: publicUrl,

        display_order: trackNumber - 1,

        is_published: isPublished,
      });
    }

    // -----------------------------------------------------
    // INSERT DES TRACKS
    // -----------------------------------------------------

    const { data: createdTracks, error: tracksError } =
      await window.supabaseClient.from("tracks").insert(trackRecords).select();

    if (tracksError) {
      throw tracksError;
    }

    return createdTracks || [];
  } catch (error) {
    console.error("❌ Error al crear los tracks.");

    // -----------------------------------------------------
    // NETTOYAGE DES FICHIERS DÉJÀ UPLOADÉS
    // -----------------------------------------------------

    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await window.supabaseClient.storage
        .from("release-audio")
        .remove(uploadedPaths);

      if (cleanupError) {
        console.error("❌ Error al limpiar los archivos de audio.");
      }
    }

    throw error;
  }
}

// =========================================================
// RELEASE — CRÉATION PRINCIPALE
// =========================================================
// Cette fonction:
//
// 1. récupère les données du formulaire;
// 2. valide les champs;
// 3. upload la cover;
// 4. récupère l'URL publique;
// 5. crée le release dans Supabase;
// 6. rafraîchit le dashboard.
//
// =========================================================

async function submitDashboardReleaseForm(form) {
  const formData = new FormData(form);

  // =======================================================
  // INFORMATIONS PRINCIPALES
  // =======================================================

  const title = formData.get("title")?.trim() || "";

  const slug = formData.get("slug")?.trim() || "";

  const releaseType = formData.get("release_type")?.trim() || "Single";

  const releaseYearRaw = formData.get("release_year");

  const releaseYear = releaseYearRaw
    ? Number(releaseYearRaw)
    : new Date().getFullYear();

  const genre = formData.get("genre")?.trim() || null;

  const description = formData.get("description")?.trim() || null;

  const spotifyUrl = formData.get("spotify_url")?.trim() || "";

  const soundcloudUrl = formData.get("soundcloud_url")?.trim() || "";

  const bandcampUrl = formData.get("bandcamp_url")?.trim() || "";

  const youtubeUrl = formData.get("youtube_url")?.trim() || "";

  const isPublished = formData.get("is_published") === "on";

  // =======================================================
  // VALIDATION
  // =======================================================

  if (!title || !slug) {
    showDashboardToast("El título y el slug son obligatorios.");

    return;
  }

  if (
    !Number.isInteger(releaseYear) ||
    releaseYear < 1900 ||
    releaseYear > 2100
  ) {
    showDashboardToast("Introduce un año válido.");

    return;
  }

  // =======================================================
  // COVER
  // =======================================================

  const coverInput = form.querySelector("#release-cover-file");

  const coverFile = coverInput?.files?.[0] || null;

  // =======================================================
  // TRACKS
  // =======================================================
  // On récupère toutes les lignes visibles dans
  // l'éditeur AVANT de modifier Supabase.
  // =======================================================

  const trackRows = Array.from(
    form.querySelectorAll("#dashboard-release-tracks [data-release-track]"),
  );

  const trackEntries = [];

  for (let index = 0; index < trackRows.length; index += 1) {
    const row = trackRows[index];

    const trackNumber = index + 1;

    const titleInput = row.querySelector('[name="track_title"]');

    const audioInput = row.querySelector('[name="track_audio_file"]');

    const trackTitle = titleInput?.value.trim() || "";

    const audioFile = audioInput?.files?.[0] || null;

    // -----------------------------------------------------
    // LIGNE COMPLÈTEMENT VIDE
    // -----------------------------------------------------
    // Elle est simplement ignorée.
    // -----------------------------------------------------

    if (!trackTitle && !audioFile) {
      continue;
    }

    // -----------------------------------------------------
    // TITRE SANS AUDIO
    // -----------------------------------------------------

    if (trackTitle && !audioFile) {
      showDashboardToast(
        `Selecciona un archivo de audio para el track ${trackNumber}.`,
        5000,
      );

      return;
    }

    // -----------------------------------------------------
    // AUDIO SANS TITRE
    // -----------------------------------------------------

    if (!trackTitle && audioFile) {
      showDashboardToast(
        `Introduce un título para el track ${trackNumber}.`,
        5000,
      );

      return;
    }

    // -----------------------------------------------------
    // TRACK VALIDE
    // -----------------------------------------------------

    trackEntries.push({
      title: trackTitle,
      audioFile,
      trackNumber,
    });
  }

  // =======================================================
  // BOUTON LOADING
  // =======================================================

  const submitButton = form.querySelector("#dashboard-create-release-submit");

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.innerHTML = `
      Creando...
      <i
        class="bi bi-arrow-repeat"
        aria-hidden="true"
      ></i>
    `;
  }

  try {
    // =====================================================
    // UPLOAD COVER
    // =====================================================

    let coverImageUrl = null;

    if (coverFile) {
      coverImageUrl = await uploadDashboardReleaseCover(coverFile, slug);
    }

    // =====================================================
    // DONNÉES DU RELEASE
    // =====================================================

    const releaseData = {
      title,
      slug,
      release_type: releaseType,
      release_year: releaseYear,
      genre,
      description,
      cover_image_url: coverImageUrl,
      is_published: isPublished,
    };

    const releaseLinks = [
      {
        platform: "spotify",
        url: spotifyUrl,
        display_order: 1,
      },
      {
        platform: "soundcloud",
        url: soundcloudUrl,
        display_order: 2,
      },
      {
        platform: "bandcamp",
        url: bandcampUrl,
        display_order: 3,
      },
      {
        platform: "youtube",
        url: youtubeUrl,
        display_order: 4,
      },
    ].filter((link) => link.url);

    // =====================================================
    // INSERT SUPABASE
    // =====================================================

    const { data: createdRelease, error: releaseError } =
      await window.supabaseClient
        .from("releases")
        .insert(releaseData)
        .select()
        .single();

    if (releaseError) {
      throw releaseError;
    }

    // =====================================================
    // CRÉATION DES LIENS PLATEFORMES
    // =====================================================

    if (releaseLinks.length > 0) {
      const releaseLinkRecords = releaseLinks.map((link) => ({
        release_id: createdRelease.id,
        platform: link.platform,
        url: link.url,
        display_order: link.display_order,
        is_visible: true,
      }));

      const { error: releaseLinksError } = await window.supabaseClient
        .from("release_links")
        .insert(releaseLinkRecords);

      if (releaseLinksError) {
        throw releaseLinksError;
      }
    }

    // =====================================================
    // CRÉATION DES TRACKS
    // =====================================================

    await createDashboardReleaseTracks(
      trackEntries,
      createdRelease,
      slug,
      isPublished,
    );

    // =====================================================
    // SUCCÈS
    // =====================================================

    showDashboardToast("Release creado correctamente.");

    closeDashboardEditor();

    await loadDashboardReleases();
  } catch (error) {
    console.error("❌ Error al crear el release.");

    showDashboardToast(error?.message || "No se pudo crear el release.", 5000);

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.innerHTML = `
        Crear release
        <i
          class="bi bi-arrow-right"
          aria-hidden="true"
        ></i>
      `;
    }
  }
}

// =========================================================
// REMPLACER LE BOUTON "NUEVO RELEASE"
// =========================================================

if (dashboardAddReleaseButton) {
  const cleanAddReleaseButton = dashboardAddReleaseButton.cloneNode(true);

  dashboardAddReleaseButton.replaceWith(cleanAddReleaseButton);

  cleanAddReleaseButton.addEventListener("click", openCreateReleaseEditor);
}
