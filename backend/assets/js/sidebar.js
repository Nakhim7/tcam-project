document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".custom-sidebar");

  if (toggleButton && sidebar) {
    toggleButton.addEventListener("click", () => {
      const isCollapsed = sidebar.classList.contains("collapsed");
      sidebar.classList.toggle("collapsed");
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.classList.toggle("collapsed");
      }
      // Reset transform to ensure visibility when showing
      if (!isCollapsed) {
        sidebar.style.transform = "none";
      }
    });
  }
});
