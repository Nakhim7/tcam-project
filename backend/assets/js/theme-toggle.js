document.addEventListener("DOMContentLoaded", function () {
  const toggleThemeBtn = document.querySelector(
    '.icon-btn[title="Toggle Theme"]'
  );
  if (!toggleThemeBtn) {
    console.error("Theme toggle button not found. Ensure it's in the header.");
    return;
  }

  const icon = toggleThemeBtn.querySelector("i");
  if (!icon) {
    console.error("Icon element not found in theme toggle button");
    return;
  }

  // Initialize theme based on localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  console.log("Initial theme from localStorage:", savedTheme);
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    document.body.classList.remove("dark-theme");
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }

  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");
    console.log("Toggled theme to:", isDark ? "dark" : "light");

    // Switch icon and save preference
    icon.classList.toggle("fa-sun", isDark);
    icon.classList.toggle("fa-moon", !isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Force style refresh for sidebar and body
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      const sidebarStyle = sidebar.style;
      sidebarStyle.display = "none";
      sidebarStyle.offsetHeight; // Trigger reflow
      sidebarStyle.display = "";
    }
    document.body.style.display = "none";
    setTimeout(() => {
      document.body.style.display = "";
    }, 0);
  });
});
