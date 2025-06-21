$(function () {
  console.log("Navigation script loaded.");

  function loadPageContent(href, title = "") {
    const $main = $("#main-content");

    if (!href.endsWith(".html")) return;

    $main.fadeOut(150, function () {
      $main.load(href + " .main", function (response, status, xhr) {
        if (status === "error") {
          console.error(`Failed to load ${href}: ${xhr.statusText}`);
          $main.html("<p>Error loading content.</p>");
        } else {
          console.log(`Loaded ${href}`);
        }
        $main.fadeIn(150);
      });
    });

    // Optionally update browser history
    if (window.history.pushState && title) {
      window.history.pushState({}, title, href);
    }
  }

  // Delegate clicks from navigation links
  $(document).on(
    "click",
    ".navigation__link, .navigation__dropdown-link, .contact-btn",
    function (e) {
      const href = $(this).attr("href");

      // Only intercept internal links
      if (
        href &&
        href.startsWith("/frontend/pages/") &&
        href.endsWith(".html")
      ) {
        e.preventDefault();
        loadPageContent(href, $(this).text().trim());
      }
    }
  );

  // Handle back/forward navigation
  window.onpopstate = function () {
    const path = location.pathname;
    if (path.endsWith(".html")) {
      loadPageContent(path);
    }
  };
});
