$(function () {
  $("#header").load("partials/header.html");
  $("#navigation").load("partials/navigation.html", setupNavigation);
  $("#footer").load("partials/footer.html");

  function setupNavigation() {
    $(document).on("click", ".navigation__link", function (e) {
      const page = $(this).data("page");
      if (page) {
        e.preventDefault();
        loadPage(page);
        history.pushState(null, "", `#${page}`);
      }
    });
  }

  // Load page content into #main-content
  function loadPage(page) {
    const $main = $("#main-content");
    $main.fadeOut(150, function () {
      $main.load(`pages/${page}.html .main`, function (response, status, xhr) {
        if (status === "error") {
          console.error(`Failed to load ${page}: ${xhr.status}`);
          $main.html("<p>Failed to load content.</p>");
        } else {
          console.log(`${page}.html loaded`);
        }
        $main.fadeIn(150);
      });
    });
  }

  // Handle page load on browser refresh or direct link
  function handleHashRouting() {
    const hash = location.hash.replace("#", "") || "home";
    loadPage(hash);
  }

  // Trigger on first load
  handleHashRouting();

  // Reload content when hash changes
  window.addEventListener("hashchange", handleHashRouting);
});
