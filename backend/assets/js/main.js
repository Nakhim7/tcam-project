$(function () {
  // Ensure jQuery is loaded
  if (typeof $ === "undefined") {
    console.error(
      "❌ jQuery is not loaded. Please include jQuery before this script."
    );
    return;
  }

  // Load sidebar and attach click events
  $("#sidebar").load("partials/sidebar.html", function (response, status) {
    if (status === "error") {
      console.error("❌ Failed to load sidebar.html");
    } else {
      setupNav();
      setupSidebarToggle();
      console.log("✅ Sidebar loaded and events attached");
    }
  });

  // Load header and then initialize theme toggle
  $("#header").load("partials/header.html", function (response, status) {
    if (status === "error") {
      console.error("❌ Failed to load header.html");
    } else {
      initThemeToggle();
      console.log("✅ Header loaded and theme toggle initialized");
    }
  });

  // Load initial page based on hash
  const initialPage = window.location.hash.replace("#", "") || "dashboard";
  loadPage(initialPage);

  function loadPage(page) {
    const $container = $("#dashboardContent");

    $container.fadeOut(150, function () {
      $container.load(`pages/${page}.html`, function (response, status) {
        if (status === "error") {
          $container.html(
            `<p style="padding:2rem;">❌ Page not found: ${page}</p>`
          );
          console.error(`❌ Page not found: ${page}`);
        } else {
          $(".nav-link").removeClass("active");
          $(`.nav-link[data-page="${page}"]`).addClass("active");

          loadPageScript(page);

          // Smooth fade in
          $container.fadeIn(150);
          console.log(`✅ Page loaded: ${page}`);
        }
      });
    });
  }

  function loadPageScript(page) {
    const scriptMap = {
      banners: "assets/js/banner.js",
      // Add other pages as needed
      dashboard: "assets/js/dashboard.js",
      // ...
    };

    const scriptUrl = scriptMap[page];
    if (!scriptUrl) {
      console.log(`ℹ️ No script defined for page: ${page}`);
      return;
    }

    $.getScript(scriptUrl)
      .done(function () {
        console.log(`✅ Script loaded: ${scriptUrl}`);
        // Call the init function if it exists
        if (page === "banners" && typeof initBannerPage === "function") {
          try {
            initBannerPage();
            console.log("✅ initBannerPage called for banners page");
          } catch (err) {
            console.error("❌ Error in initBannerPage:", err);
          }
        } else if (
          typeof window[
            `init${page.charAt(0).toUpperCase() + page.slice(1)}Page`
          ] === "function"
        ) {
          try {
            window[`init${page.charAt(0).toUpperCase() + page.slice(1)}Page`]();
            console.log(
              `✅ init${
                page.charAt(0).toUpperCase() + page.slice(1)
              }Page called`
            );
          } catch (err) {
            console.error(
              `❌ Error in init${
                page.charAt(0).toUpperCase() + page.slice(1)
              }Page:`,
              err
            );
          }
        }
      })
      .fail(function (jqxhr, settings, exception) {
        console.error(`❌ Failed to load script: ${scriptUrl}`, exception);
      });
  }

  function setupNav() {
    $("#sidebar").on("click", ".nav-link[data-page]", function (e) {
      e.preventDefault();
      const page = $(this).data("page");
      if (!page) return;
      window.location.hash = page;
      loadPage(page);
      console.log(`🔄 Navigating to page: ${page}`);
    });
  }
  function setupSidebarToggle() {
    $("#toggleSidebar").on("click", function () {
      const sidebar = $(".admin-sidebar");
      const mainContent = $(".main-content");

      sidebar.toggleClass("collapsed");
      mainContent.toggleClass("collapsed"); // ensures main content moves
    });
  }

  // Handle back/forward navigation
  $(window).on("hashchange", function () {
    const page = window.location.hash.replace("#", "") || "dashboard";
    loadPage(page);
    console.log(`🔄 Hash changed, loading page: ${page}`);
  });
});

// Init theme toggle (called after header is loaded)
function initThemeToggle() {
  const toggleBtn = document.querySelector('.icon-btn[title="Toggle Theme"]');
  if (!toggleBtn) {
    console.warn("⚠️ Theme toggle button not found in header.html");
    return;
  }

  const icon = toggleBtn.querySelector("i");
  if (!icon) {
    console.error("❌ Icon element not found in theme toggle button");
    return;
  }

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
    console.log(`🔄 Theme toggled to: ${isDark ? "dark" : "light"}`);
  });
}
