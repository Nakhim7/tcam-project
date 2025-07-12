$(function () {
  console.log("banner.js initialized");
  let currentSliderId = null;
  let currentPage = 1;
  const rowsPerPage = 5;

  // Check authentication
  if (!window.getToken()) {
    alert("Please log in to view sliders.");
    window.location.href = "/login"; // Adjust to your login page
    return;
  }
  loadSliders();

  async function loadSliders(page = 1, search = "") {
    try {
      console.log("Fetching sliders with page:", page, "search:", search);
      $(".loading-indicator").show();
      $("#noResults").hide();
      const result = await window.API.getSliders(page, search);
      console.log("API Response:", JSON.stringify(result, null, 2));

      if (!result || typeof result !== "object") {
        throw new Error("Invalid API response");
      }

      const sliders = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      const pagination = result.meta || {
        current_page: result.current_page || 1,
        last_page: result.last_page || 1,
      };

      currentPage = pagination.current_page;
      if (!sliders.length) {
        console.warn("No sliders found in response");
        $("#noResults").show();
        return;
      }

      renderSliderTable(sliders);
      updatePagination(pagination);
    } catch (err) {
      console.error("Error loading sliders:", err.message, err);
      $("#noResults").show();
      alert(`Failed to load sliders: ${err.message || "Unknown error"}`);
    } finally {
      $(".loading-indicator").hide();
    }
  }

  // Render sliders table
  function renderSliderTable(sliders) {
    const $tbody = $("#bannersTbody");
    $tbody.empty();

    if (!sliders.length) {
      $("#noResults").show();
      return;
    }

    $("#noResults").hide();

    sliders.forEach((slider) => {
      const row = `
        <tr class="banner-row-${slider.id}" data-id="${slider.id}">
          <td>${slider.id || "N/A"}</td>
          <td><img src="${
            slider.image_url || "https://via.placeholder.com/100x50"
          }" alt="Slider Image" class="preview-img"></td>
          <td>${slider.title || "-"}</td>
          <td>${slider.link_url || "-"}</td>
          <td>${slider.order || "0"}</td>
          <td>${slider.status ? "Yes" : "No"}</td>
          <td>${
            slider.created_at
              ? new Date(slider.created_at).toLocaleString()
              : "-"
          }</td>
          <td class="actions">
            <button class="action-btn view" title="View" data-id="${slider.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit" title="Edit" data-id="${slider.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" title="Delete" data-id="${
              slider.id
            }">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    // Bind event handlers
    $(".view").off("click").on("click", viewSlider);
    $(".edit").off("click").on("click", openEditModal);
    $(".delete").off("click").on("click", openDeleteModal);
  }

  // Update pagination controls
  function updatePagination(pagination) {
    const totalPages = pagination.last_page || 1;
    $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
    $("#prevPage").prop("disabled", currentPage === 1);
    $("#nextPage").prop("disabled", currentPage === totalPages);
  }

  // View slider details
  async function viewSlider(event) {
    const sliderId = $(event.currentTarget).data("id");
    console.log("Viewing slider:", sliderId);

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".view-banner-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".loading-indicator").show();
    $(".view-banner-body").hide();

    try {
      const data = await window.API.getSlider(sliderId);
      console.log("View slider data:", JSON.stringify(data, null, 2));
      const slider = data.data || data;
      $("#viewBannerId").text(slider.id || "N/A");
      $("#viewTitle").text(slider.title || "-");
      $("#viewShortDescription").text(slider.short_description || "-");
      $("#viewLink").text(slider.link_url || "-");
      $("#viewOrder").text(slider.order || "0");
      $("#viewActive").text(slider.status ? "Yes" : "No");
      $("#viewCreatedAt").text(
        slider.created_at ? new Date(slider.created_at).toLocaleString() : "-"
      );
      $("#viewImage")
        .attr("src", slider.image_url || "https://via.placeholder.com/100x50")
        .toggle(!!slider.image_url);
      $(".loading-indicator").fadeOut(200);
      $(".view-banner-body").fadeIn(200);
    } catch (err) {
      console.error("Error viewing slider:", err.message, err);
      alert(`Failed to load slider details: ${err.message || "Unknown error"}`);
      closeViewModal();
    }
  }

  // Open edit modal
  async function openEditModal(event) {
    currentSliderId = $(event.currentTarget).data("id");
    console.log("Editing slider:", currentSliderId);
    $("#modalTitle").text("Edit Slider");
    $("#bannerId").val(currentSliderId);
    $("#bannerForm")[0].reset();
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".banner-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".loading-indicator").show();
    $(".banner-form-modal form").hide();

    try {
      const data = await window.API.getSlider(currentSliderId);
      console.log("Edit slider data:", JSON.stringify(data, null, 2));
      const slider = data.data || data;
      $("#title").val(slider.title || "");
      $("#short_description").val(slider.short_description || "");
      $("#link").val(slider.link_url || "");
      $("#order").val(slider.order || "0");
      $("#active").val(slider.status.toString());
      $("#image_file").prop("required", false); // Image not required for edit
      $("#preview").attr(
        "src",
        slider.image_url ||
          "https://via.placeholder.com/100x100.png?text=Preview"
      );
      $(".banner-form-modal form").fadeIn(200);
    } catch (err) {
      console.error("Error loading slider for edit:", err.message, err);
      alert(`Could not load slider details: ${err.message || "Unknown error"}`);
      closeModal();
    } finally {
      $(".loading-indicator").fadeOut(200);
    }
  }

  // Open delete modal
  function openDeleteModal(event) {
    currentSliderId = $(event.currentTarget).data("id");
    console.log("Deleting slider:", currentSliderId);
    $("#deleteModalOverlay").css("display", "flex").fadeIn(200);
    $(".delete-banner-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
  }

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();
    const sliderId = $("#bannerId").val();
    const formData = new FormData();
    formData.append("title", $("#title").val());
    formData.append("short_description", $("#short_description").val());
    formData.append("link_url", $("#link").val());
    formData.append("order", $("#order").val());
    formData.append("status", $("#active").val() === "true");
    const imageFile = $("#image_file")[0].files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const result = await window.API.saveSlider(sliderId, formData);
      console.log("Save slider response:", JSON.stringify(result, null, 2));
      alert(result.message || "Slider saved successfully");
      closeModal();
      loadSliders(currentPage);
    } catch (err) {
      console.error("Error saving slider:", err.message, err);
      alert(`Failed to save slider: ${err.message || "Unknown error"}`);
    }
  }

  // Delete slider
  async function deleteSlider() {
    if (!currentSliderId) return;
    try {
      const result = await window.API.deleteSlider(currentSliderId);
      console.log("Delete slider response:", JSON.stringify(result, null, 2));
      closeDeleteModal();
      loadSliders(currentPage);
    } catch (err) {
      console.error("Error deleting slider:", err.message, err);
      alert(`Failed to delete slider: ${err.message || "Unknown error"}`);
    }
  }

  // Close modals
  window.closeModal = function () {
    $("#modalOverlay").fadeOut(200);
    $(".banner-form-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    $("#bannerForm")[0].reset();
    $("#warningToast").fadeOut(200);
    currentSliderId = null;
  };

  window.closeViewModal = function () {
    $("#viewModalOverlay").fadeOut(200);
    $(".view-banner-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    $(".view-banner-body").hide();
  };

  window.closeDeleteModal = function () {
    $("#deleteModalOverlay").fadeOut(200);
    $(".delete-banner-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    currentSliderId = null;
  };

  // Pagination
  window.changePage = function (page) {
    if (page < 1) return;
    const searchTerm = $("#searchInput").val();
    loadSliders(page, searchTerm);
  };

  // Bind events
  $("#prevPage").on("click", () => changePage(currentPage - 1));
  $("#nextPage").on("click", () => changePage(currentPage + 1));
  $("#bannerForm").on("submit", handleFormSubmit);
  $("#confirmDelete").on("click", deleteSlider);
  $(".popup-btn").on("click", function (e) {
    $("#modalTitle").text("Add New Slider");
    $("#bannerId").val("");
    $("#bannerForm")[0].reset();
    $("#active").val("false");
    $("#image_file").prop("required", true);
    $("#preview").attr(
      "src",
      "https://via.placeholder.com/100x100.png?text=Preview"
    );
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".banner-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".loading-indicator").hide();
    $(".banner-form-modal form").show();
    e.preventDefault();
  });
  $("#modalOverlay").on("click", function (e) {
    if (e.target.id === "modalOverlay") {
      $("#warningToast").fadeIn(200).addClass("show");
      setTimeout(() => {
        $("#warningToast").fadeOut(200).removeClass("show");
      }, 2000);
    }
  });
  $(".popup-close").on("click", closeModal);
  $(".close-toast").on("click", function (e) {
    $("#warningToast").fadeOut(200).removeClass("show");
    e.preventDefault();
  });
  $("#image_file").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#preview").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      $("#preview").attr(
        "src",
        "https://via.placeholder.com/100x100.png?text=Preview"
      );
    }
  });

  // Search functionality
  $("#searchInput").on("input", function () {
    const term = $(this).val();
    currentPage = 1;
    loadSliders(1, term);
  });
});
