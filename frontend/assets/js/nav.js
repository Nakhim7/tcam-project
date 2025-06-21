document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired, attempting to initialize navigation");
  initializeNavigation();
});

document.addEventListener("navigationLoaded", () => {
  console.log("navigationLoaded event triggered, initializing navigation");
  initializeNavigation();
});

function initializeNavigation() {
  // Select required and optional elements
  const navToggle = document.querySelector("#nav-toggle");
  const navMenu = document.querySelector("#nav-menu");
  const logo = document.querySelector(".navigation__logo");
  const header = document.querySelector(".navbar") || {};
  const topBar = document.querySelector(".top-bar") || {};
  const overlay = document.querySelector(".overlay");
  const heroSection = document.querySelector(".hero-section") || {};
  const dropdownItems = document.querySelectorAll(
    ".navigation__item--dropdown"
  );

  // Log elements for debugging
  console.log("Navigation elements:", {
    navToggle,
    navMenu,
    logo,
    header,
    topBar,
    overlay,
    heroSection,
    dropdownItems: dropdownItems.length,
  });

  // Check for critical elements
  if (!navToggle || !navMenu || !overlay || !logo) {
    console.error("Missing critical navigation elements:", {
      navToggle,
      navMenu,
      overlay,
      logo,
    });
    return;
  }

  // Toggle nav menu
  navToggle.addEventListener("click", () => {
    const isActive = navMenu.classList.contains("active");
    navMenu.classList.toggle("active", !isActive);
    overlay.classList.toggle("show-menu", !isActive);
    navToggle.querySelector("i").className = isActive
      ? "ri-menu-line"
      : "ri-close-line";
    console.log("Menu toggled, active:", !isActive);

    // Toggle dropdowns when menu opens/closes
    if (window.innerWidth <= 1030) {
      dropdownItems.forEach((item) => {
        if (!isActive) {
          item.classList.remove("show-dropdown");
        }
      });
    }
  });

  // Logo click to open index.html
  logo.addEventListener("click", () => {
    window.location.href = "/index.html";
    console.log("Redirecting to index.html");
  });

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target) &&
      navMenu.classList.contains("active")
    ) {
      navMenu.classList.remove("active");
      overlay.classList.remove("show-menu");
      navToggle.querySelector("i").className = "ri-menu-line";
      dropdownItems.forEach((item) => item.classList.remove("show-dropdown"));
      console.log("Menu and dropdowns closed due to outside click");
    }
  });

  // Dropdown behavior
  dropdownItems.forEach((item) => {
    const link = item.querySelector(".navigation__link");
    if (link) {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 1030 && navMenu.classList.contains("active")) {
          e.preventDefault();
          const isActive = item.classList.contains("show-dropdown");
          dropdownItems.forEach((otherItem) =>
            otherItem.classList.remove("show-dropdown")
          );
          if (!isActive) {
            item.classList.add("show-dropdown");
          }
          console.log("Dropdown toggled on mobile:", item);
        }
      });
      link.addEventListener("mouseenter", () => {
        if (window.innerWidth > 1030) {
          dropdownItems.forEach((otherItem) =>
            otherItem.classList.remove("show-dropdown")
          );
          item.classList.add("show-dropdown");
          console.log("Dropdown shown on hover:", item);
        }
      });
      item.addEventListener("mouseleave", () => {
        if (window.innerWidth > 1030) {
          item.classList.remove("show-dropdown");
          console.log("Dropdown hidden on mouseout:", item);
        }
      });
    }
  });

  // Responsive menu reset with smooth transition
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 1030) {
        navMenu.classList.remove("active");
        overlay.classList.remove("show-menu");
        if (navToggle.querySelector("i")) {
          navToggle.querySelector("i").className = "ri-menu-line";
        }
        dropdownItems.forEach((item) => item.classList.remove("show-dropdown"));
        navMenu.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        console.log("Menu and dropdowns reset on resize");
      }
    }, 100); // Debounce resize for smooth transition
  });

  console.log("Navigation initialized successfully");
}
