document.addEventListener("DOMContentLoaded", () => {
  const initNavbar = () => {
    const navToggle = document.querySelector("#nav-toggle");
    const navMenu = document.querySelector("#nav-menu");
    const dropdownItems = document.querySelectorAll(".navigation__item--dropdown");

    if (!navToggle || !navMenu) return;

    // Toggle main menu
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show-menu");
      const icon = navToggle.querySelector("i");
      if (icon) {
        icon.className = navMenu.classList.contains("show-menu")
          ? "ri-close-line"
          : "ri-menu-line";
      }
    });

    // Toggle dropdowns (mobile only)
    dropdownItems.forEach((item) => {
      const link = item.querySelector(".navigation__link");
      if (link) {
        link.addEventListener("click", (e) => {
          if (window.innerWidth <= 1030) {
            e.preventDefault();

            const isOpen = item.classList.contains("show-dropdown");

            // Close all dropdowns
            dropdownItems.forEach((el) => el.classList.remove("show-dropdown"));

            // Open the clicked one if it wasn't already open
            if (!isOpen) {
              item.classList.add("show-dropdown");
            }
          }
        });
      }
    });

    // Close dropdown + menu when clicking any link
    const allLinks = document.querySelectorAll(".navigation__link, .navigation__dropdown a");
    allLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 1030) {
          navMenu.classList.remove("show-menu");
          dropdownItems.forEach((item) => item.classList.remove("show-dropdown"));

          // Reset toggle icon
          const icon = navToggle.querySelector("i");
          if (icon) icon.className = "ri-menu-line";
        }
      });
    });

    // Close dropdowns if click outside
    document.addEventListener("click", (e) => {
      const isClickInsideMenu = navMenu.contains(e.target);
      const isClickInsideToggle = navToggle.contains(e.target);

      if (!isClickInsideMenu && !isClickInsideToggle) {
        dropdownItems.forEach((item) => item.classList.remove("show-dropdown"));
        if (window.innerWidth <= 1030) {
          navMenu.classList.remove("show-menu");
          const icon = navToggle.querySelector("i");
          if (icon) icon.className = "ri-menu-line";
        }
      }
    });

    // Auto-close menu on resize up to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1030) {
        navMenu.classList.remove("show-menu");
        dropdownItems.forEach((item) => item.classList.remove("show-dropdown"));
        const icon = navToggle.querySelector("i");
        if (icon) icon.className = "ri-menu-line";
      }
    });
  };

  // Wait until navbar is injected
  const observer = new MutationObserver(() => {
    if (document.querySelector("#nav-toggle") && document.querySelector("#nav-menu")) {
      initNavbar();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
