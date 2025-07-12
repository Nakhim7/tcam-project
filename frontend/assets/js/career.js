function initCareerPage() {
  console.log("✅ Career page initialized");

  const accordionItems = document.querySelectorAll(".accordion__item");

  accordionItems.forEach((item) => {
    const button = item.querySelector(".accordion__button");
    const content = item.querySelector(".accordion__content");

    if (!button || !content) return;

    // Initialize button text
    if (
      !button.textContent.includes("(Show more)") &&
      !button.textContent.includes("(Hide)")
    ) {
      button.textContent += " (Show more)";
    }

    // Hover: show content
    item.addEventListener("mouseenter", () => {
      if (!content.classList.contains("active")) {
        content.classList.add("active");
        content.style.maxHeight = `${content.scrollHeight}px`;
        button.textContent = button.textContent.replace(
          " (Show more)",
          " (Hide)"
        );
      }
    });

    // Mouse leave: hide content
    item.addEventListener("mouseleave", () => {
      if (content.classList.contains("active")) {
        content.classList.remove("active");
        content.style.maxHeight = "0";
        button.textContent = button.textContent.replace(
          " (Hide)",
          " (Show more)"
        );
      }
    });

    // Click toggle
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = content.classList.contains("active");

      if (isActive) {
        content.classList.remove("active");
        content.style.maxHeight = "0";
        button.textContent = button.textContent.replace(
          " (Hide)",
          " (Show more)"
        );
      } else {
        content.classList.add("active");
        content.style.maxHeight = `${content.scrollHeight}px`;
        button.textContent = button.textContent.replace(
          " (Show more)",
          " (Hide)"
        );
      }
    });
  });
}
