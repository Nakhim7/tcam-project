function initHomePage() {
  console.log("✅ initHomePage called at", new Date().toLocaleString());

  let slideInterval;
  let isInitialized = false;

  const $main = $("#home_main");
  const $heroSection = $main.length
    ? $main.find("#heroContainer")
    : $("#heroContainer");

  const $slides = $heroSection.find(".home-hero__slide");
  const $timerCircles = $heroSection.find(".home-hero__timer-circle");

  if (!$heroSection.length || !$slides.length || !$timerCircles.length) {
    console.warn("⚠️ Hero section not found. Skipping slider initialization.");
    return;
  }

  if (isInitialized) {
    clearInterval(slideInterval);
    $timerCircles.off("click");
    $heroSection.off("mouseenter mouseleave");
    console.log("♻️ Re-initializing hero slider...");
  }

  let currentSlide = 0;

  function switchSlide(index) {
    if (index < 0 || index >= $slides.length) return;

    $slides.removeClass("active").attr("aria-hidden", "true");
    $timerCircles.removeClass("active");

    $slides.eq(index).addClass("active").attr("aria-hidden", "false");
    $timerCircles.eq(index).addClass("active");

    const bgImage = $slides.eq(index).data("bg");
    if (bgImage) {
      $heroSection.css("background-image", `url(${bgImage})`);
    } else {
      $heroSection
        .css("background-image", "none")
        .css("background-color", "#f0f0f0");
    }

    const $circle = $timerCircles.eq(index).find(".progress-ring__circle");
    $circle.css("animation", "none");
    void $circle[0].offsetWidth; // Trigger reflow
    $circle.css("animation", "progress 5s linear forwards");

    currentSlide = index;
  }

  function startSlider() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % $slides.length;
      switchSlide(currentSlide);
    }, 5000);
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

  $timerCircles.on("click", function () {
    const index = $(this).data("slide");
    stopSlider();
    switchSlide(index);
    startSlider();
  });

  $heroSection.on("mouseenter", stopSlider).on("mouseleave", startSlider);

  // Preload background images
  $slides.each(function () {
    const bg = $(this).data("bg");
    if (bg) {
      const img = new Image();
      img.src = bg;
    }
  });

  // Preload thumbnails
  $timerCircles.each(function () {
    const src = $(this).find("img").attr("src");
    if (src) {
      const img = new Image();
      img.src = src;
    }
  });

  isInitialized = true;
  console.log("✅ Hero slider initialized successfully");
}
