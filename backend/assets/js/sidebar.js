document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("tsb-toggle");
  const sidebar = document.querySelector(".tsb-sidebar");

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
    const sidebarLinks = document.querySelectorAll(".tsb-link");
    const currentHash = window.location.hash.replace("#", "");
    const currentPath = window.location.pathname;

    sidebarLinks.forEach((link) => {
      link.classList.remove("active");
    });

    let activeLink = null;
    sidebarLinks.forEach((link) => {
      const page = link.getAttribute("data-page");
      const href = link.getAttribute("href").replace("#", "");

      const matchesHash = page && page === currentHash;
      const matchesPath = href && currentPath === href;

      if (matchesHash || matchesPath) {
        activeLink = link;
      }
    });

    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  setActiveSidebarLink();
  window.addEventListener("hashchange", setActiveSidebarLink);

  document
    .getElementById("tsb-sidebar")
    .addEventListener("click", function (e) {
      const link = e.target.closest(".tsb-link");
      if (link) {
        const sidebarLinks = document.querySelectorAll(".tsb-link");
        sidebarLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        setTimeout(setActiveSidebarLink, 100);
      }
    });
});
