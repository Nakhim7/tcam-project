$(function () {
  // Load layout components
  $("#header").load("partials/header.html");
  $("#navigation").load("partials/navigation.html", setupNavigation);
  $("#footer").load("partials/footer.html");

  // Setup navigation link behavior
  function setupNavigation() {
    $(document).on("click", ".navigation__link", function (e) {
      const page = $(this).data("page");
      if (page) {
        e.preventDefault();
        navigateToPage(page);
      }
    });
  }

  // Navigate to page and update URL
  function navigateToPage(page) {
    loadPage(page);
    history.pushState(null, "", `#${page}`);
  }

  // Load content page and its script
  function loadPage(page) {
    const $main = $("#main-content");

    $main.fadeOut(150, function () {
      $main.load(`pages/${page}.html .main`, function (response, status, xhr) {
        if (status === "error") {
          console.error(`Failed to load ${page}: ${xhr.status}`);
          $main.html("<p>Failed to load content.</p>");
        } else {
          console.log(`${page}.html loaded`);
          loadPageScript(page);
        }
        $main.fadeIn(150);
      });
    });
  }

  // Load and execute JS file for the page
  function loadPageScript(page) {
    const initFunction = `init${capitalize(page)}Page`;

    // If already loaded (function exists), just run it
    if (typeof window[initFunction] === "function") {
      window[initFunction]();
      return;
    }

    // Otherwise, try to dynamically load JS file
    const scriptPath = `assets/js/${page}.js`;
    $.getScript(scriptPath)
      .done(() => {
        console.log(`${scriptPath} loaded`);
        if (typeof window[initFunction] === "function") {
          window[initFunction]();
        } else {
          console.warn(`No ${initFunction}() found in ${scriptPath}`);
        }
      })
      .fail(() => {
        console.warn(`No JS file found for page: ${page}`);
      });
  }

  // Capitalize first letter helper
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Handle initial load
  function handleInitialRouting() {
    const page = location.hash.replace("#", "") || "home";
    loadPage(page);
  }

  // Handle back/forward navigation
  window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "home";
    loadPage(page);
  });

  // Load initial content
  handleInitialRouting();
});
