function initHomePage() {
  console.log("✅ initHomePage called at", new Date().toLocaleString());

  let slideInterval;
  let isInitialized = false;

  const $main = $("#home_main");
  const $heroSection = $main.length
    ? $main.find("#heroContainer")
    : $("#heroContainer");

  const $slides = $heroSection.find(".home-hero__slide");
  const $progressLine = $heroSection.find(".home-hero__progress-line");

  if (!$heroSection.length || !$slides.length || !$progressLine.length) {
    console.warn(
      "⚠️ Hero section or progress line not found. Skipping slider initialization."
    );
    return;
  }

  if (isInitialized) {
    clearInterval(slideInterval);
    $progressLine.off("click");
    $heroSection.off("mouseenter mouseleave");
    console.log("♻️ Re-initializing hero slider...");
  }

  let currentSlide = 0;

  function switchSlide(index) {
    if (index < 0 || index >= $slides.length) return;

    $slides.removeClass("active").attr("aria-hidden", "true");
    $progressLine.removeClass("active");

    $slides.eq(index).addClass("active").attr("aria-hidden", "false");
    $progressLine.addClass("active");

    const bgImage = $slides.eq(index).data("bg");
    if (bgImage) {
      $heroSection.css("background-image", `url(${bgImage})`);
    } else {
      $heroSection
        .css("background-image", "none")
        .css("background-color", "#f0f0f0");
    }

    $progressLine.css("animation", "none");
    void $progressLine[0].offsetWidth;
    $progressLine.css("animation", "progress 7s linear forwards");

    currentSlide = index;
  }

  function startSlider() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % $slides.length;
      switchSlide(currentSlide);
    }, 7000);
    console.log("▶️ Slider started");
  }

  function stopSlider() {
    clearInterval(slideInterval);
    console.log("⏸️ Slider paused");
  }

  try {
    $slides.attr("aria-hidden", "true");
    switchSlide(0);
    startSlider();
  } catch (err) {
    console.error("❌ Error starting slider:", err);
  }

  $progressLine.on("click", function () {
    stopSlider();
    currentSlide = (currentSlide + 1) % $slides.length;
    switchSlide(currentSlide);
    startSlider();
  });

  $heroSection.on("mouseenter", stopSlider).on("mouseleave", startSlider);

  $slides.each(function () {
    const bg = $(this).data("bg");
    if (bg) {
      const img = new Image();
      img.src = bg;
    }
  });

  isInitialized = true;
  console.log("✅ Hero slider initialized successfully");
}

// 👇 Make it globally accessible for load-components.js
window.initHomePage = initHomePage;
