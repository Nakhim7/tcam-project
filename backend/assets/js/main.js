$(function () {
  // Load sidebar and attach click events
  $("#sidebar").load("partials/sidebar.html", function () {
    setupNav();
    setupSidebarToggle();
  });

  // Load header and then initialize theme toggle
  $("#header").load("partials/header.html", function () {
    initThemeToggle(); // <-- Fix applied here
  });

  // Load initial page based on hash
  const initialPage = window.location.hash.replace("#", "") || "dashboard";
  loadPage(initialPage);

  function loadPage(page) {
    $("#dashboardContent").load(
      `pages/${page}.html`,
      function (response, status) {
        if (status === "error") {
          $("#dashboardContent").html(
            `<p style="padding:2rem;">❌ Page not found: ${page}</p>`
          );
        } else {
          $(".nav-link").removeClass("active");
          $(`.nav-link[data-page="${page}"]`).addClass("active");
        }
      }
    );
  }

  function setupNav() {
    $("#sidebar").on("click", ".nav-link[data-page]", function (e) {
      e.preventDefault();
      const page = $(this).data("page");
      if (!page) return;
      window.location.hash = page;
      loadPage(page);
    });
  }

  function setupSidebarToggle() {
    $("#toggleSidebar").on("click", function () {
      const sidebar = $(".custom-sidebar");
      const mainContent = $(".main-content");
      const isCollapsed = sidebar.hasClass("collapsed");
      sidebar.toggleClass("collapsed");
      mainContent.toggleClass("collapsed");
      if (isCollapsed) {
        sidebar.css("transform", "none");
        sidebar.css("display", "flex");
      }
    });
  }

  // Handle back/forward navigation
  $(window).on("hashchange", function () {
    const page = window.location.hash.replace("#", "") || "dashboard";
    loadPage(page);
  });
});

// Init theme toggle (called after header is loaded)
function initThemeToggle() {
  const toggleBtn = document.querySelector('.icon-btn[title="Toggle Theme"]');
  if (!toggleBtn) return;

  const icon = toggleBtn.querySelector("i");

  // Load saved theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");

    if (isDark) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    }
  });
}
