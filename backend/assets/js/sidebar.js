document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".custom-sidebar");

  if (toggleButton && sidebar) {
    toggleButton.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.classList.toggle("collapsed");
      }
    });
  }

  function setActiveSidebarLink() {
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const currentHash = window.location.hash.replace("#", "");
    const currentPath = window.location.pathname;

    // Remove active class from all links first
    sidebarLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Find the best match and set active link
    let activeLink = null;
    sidebarLinks.forEach((link) => {
      const page = link.getAttribute("data-page");
      const href = link.getAttribute("href").replace("#", "");

      const matchesHash = page && page === currentHash;
      const matchesPath = href && currentPath === href; // Exact path match

      if (matchesHash || matchesPath) {
        activeLink = link;
      }
    });

    // Apply active class to the matched link
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  setActiveSidebarLink();
  window.addEventListener("hashchange", setActiveSidebarLink);

  // Handle click to set active link immediately
  document.getElementById("sidebar").addEventListener("click", function (e) {
    const link = e.target.closest(".sidebar-link");
    if (link) {
      const sidebarLinks = document.querySelectorAll(".sidebar-link");
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      setTimeout(setActiveSidebarLink, 100); // Sync with hash/path changes
    }
  });
});
