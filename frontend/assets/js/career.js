function initCareerPage() {
  console.log("✅ Career page initialized");

  const accordionButtons = document.querySelectorAll(".accordion__button");
  if (!accordionButtons.length) return;

  accordionButtons.forEach((button) => {
    const targetId = button.getAttribute("data-target");
    const targetContent = document.querySelector(targetId);
    if (!targetContent) return;

    // Ensure text has label
    if (
      !button.textContent.includes("(Show more)") &&
      !button.textContent.includes("(Hide)")
    ) {
      button.textContent += " (Show more)";
    }

    // Hover: show only its own detail
    button.addEventListener("mouseenter", () => {
      if (!targetContent.classList.contains("active")) {
        targetContent.classList.add("active");
        targetContent.style.maxHeight = `${targetContent.scrollHeight}px`;
        targetContent.setAttribute("aria-expanded", "true");
        button.setAttribute("aria-expanded", "true");
        button.textContent = button.textContent.replace(
          " (Show more)",
          " (Hide)"
        );
      }
    });

    // Click: toggle this only — don’t touch others
    button.addEventListener("click", () => {
      const isActive = targetContent.classList.contains("active");

      if (isActive) {
        // Hide
        targetContent.classList.remove("active");
        targetContent.style.maxHeight = "0";
        targetContent.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-expanded", "false");
        button.textContent = button.textContent.replace(
          " (Hide)",
          " (Show more)"
        );
      } else {
        // Show
        targetContent.classList.add("active");
        targetContent.style.maxHeight = `${targetContent.scrollHeight}px`;
        targetContent.setAttribute("aria-expanded", "true");
        button.setAttribute("aria-expanded", "true");
        button.textContent = button.textContent.replace(
          " (Show more)",
          " (Hide)"
        );
      }
    });
  });
}
