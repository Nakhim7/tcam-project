// banner.js

window.initBannerPage = function () {
  const API_BASE = window.API_BASE_URL || "/api";

  const getAuthHeaders = window.getAuthHeadersMultipart; // or getAuthHeadersJson for JSON

  console.log("banner.js initialized");
  let currentSliderId = null;
  let currentPage = 1;
  const rowsPerPage = 5;

  loadSliders();

  async function loadSliders() {
    try {
      console.log("Loading sliders...");
      $(".loading-indicator").show();
      $("#noResults").hide();
      const response = await fetch(`${API_BASE}/sliders`, {
        headers: getAuthHeaders(),
      });
      console.log("Fetch response:", response.status);
      if (!response.ok)
        throw new Error(`Failed to fetch sliders: ${response.statusText}`);
      const result = await response.json();
      console.log("Sliders data:", result);
      const sliders = result.data || result;
      renderSliderTable(sliders);
    } catch (err) {
      console.error("Error loading sliders:", err);
      $("#noResults").show();
    } finally {
      $(".loading-indicator").hide();
    }
  }

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
          <td>${slider.id}</td>
          <td><img src="${
            slider.image_url || "https://via.placeholder.com/100x50"
          }" alt="Slider Image" class="preview-img"></td>
          <td>${slider.title || "-"}</td>
          <td>${slider.link_url || "-"}</td>
          <td>${slider.order}</td>
          <td>${slider.status ? "Yes" : "No"}</td>
          <td>${slider.created_at}</td>
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

    updatePagination();
  }

  async function viewSlider(event) {
    const sliderId = $(event.currentTarget).data("id");
    console.log("Viewing slider:", sliderId);
    try {
      const res = await fetch(`${API_BASE}/sliders/${sliderId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      const slider = data.data || data;
      $("#viewBannerId").text(slider.id);
      $("#viewTitle").text(slider.title || "-");
      $("#viewShortDescription").text(slider.short_description || "-");
      $("#viewLink").text(slider.link_url || "-");
      $("#viewOrder").text(slider.order);
      $("#viewActive").text(slider.status ? "Yes" : "No");
      $("#viewCreatedAt").text(slider.created_at);
      $("#viewImage")
        .attr("src", slider.image_url || "")
        .toggle(!!slider.image_url);
      $("#viewModalOverlay").fadeIn(300);
      $(".view-banner-modal")
        .removeClass("transform-out")
        .addClass("transform-in");
    } catch (err) {
      console.error("Error viewing slider:", err);
      alert("Failed to load slider details.");
    }
  }

  async function openEditModal(event) {
    currentSliderId = $(event.currentTarget).data("id");
    console.log("Editing slider:", currentSliderId);
    $("#modalTitle").text("Edit Slider");
    $("#bannerId").val(currentSliderId);
    $("#bannerForm")[0].reset();
    $("#modalOverlay").fadeIn(300);
    $(".popup-box").removeClass("transform-out").addClass("transform-in");
    $(".loading-indicator").show();
    $(".banner-form-modal form").hide();

    try {
      const res = await fetch(`${API_BASE}/sliders/${currentSliderId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      const slider = data.data || data;
      $("#title").val(slider.title || "");
      $("#short_description").val(slider.short_description || "");
      $("#link").val(slider.link_url || "");
      $("#order").val(slider.order);
      $("#active").val(slider.status.toString());
      $(".custom-file-label").text(
        slider.image_url ? slider.image_url.split("/").pop() : "Choose file"
      );
      $("#preview").attr(
        "src",
        slider.image_url || "https://via.placeholder.com/100x50"
      );
      $(".banner-form-modal form").show();
    } catch (err) {
      console.error("Error loading slider for edit:", err);
      alert("Could not load slider details.");
      closeModal();
    } finally {
      $(".loading-indicator").hide();
    }
  }

  function openDeleteModal(event) {
    currentSliderId = $(event.currentTarget).data("id");
    console.log("Deleting slider:", currentSliderId);
    $("#deleteModalOverlay").fadeIn(300);
    $(".delete-banner-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const sliderId = $("#bannerId").val();
    const method = sliderId ? "PUT" : "POST";
    const url = sliderId
      ? `${API_BASE}/sliders/${sliderId}`
      : `${API_BASE}/sliders`;

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
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: getAuthHeaders().Authorization,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) throw new Error(`Save failed: ${response.statusText}`);
      console.log("Slider saved successfully");
      closeModal();
      loadSliders();
    } catch (err) {
      console.error("Error saving slider:", err);
      alert("Failed to save slider.");
    }
  }

  async function deleteSlider() {
    if (!currentSliderId) return;
    try {
      const response = await fetch(`${API_BASE}/sliders/${currentSliderId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error(`Delete failed: ${response.statusText}`);
      console.log("Slider deleted successfully");
      closeDeleteModal();
      loadSliders();
    } catch (err) {
      console.error("Error deleting slider:", err);
      alert("Failed to delete slider.");
    }
  }

  function updatePagination() {
    const rows = $("#bannersTbody tr");
    const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    rows.each((i, row) => {
      $(row).css("display", i >= start && i < end ? "" : "none");
    });

    $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
    $("#prevPage").prop("disabled", currentPage === 1);
    $("#nextPage").prop("disabled", currentPage === totalPages);
  }

  // Bind events once
  $(document).on("click", ".view", viewSlider);
  $(document).on("click", ".edit", openEditModal);
  $(document).on("click", ".delete", openDeleteModal);
  $(document).on("click", "#confirmDelete", deleteSlider);
  $(document).on("submit", "#bannerForm", handleFormSubmit);

  $(document).on("input", "#searchInput", function () {
    const term = $(this).val().toLowerCase();
    console.log("Searching for:", term);
    fetch(`${API_BASE}/sliders`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        let sliders = data.data || data;
        sliders = sliders.filter((s) =>
          [s.id, s.title, s.short_description].some((field) =>
            field?.toString().toLowerCase().includes(term)
          )
        );
        renderSliderTable(sliders);
      })
      .catch((err) => {
        console.error("Error searching sliders:", err);
        $("#noResults").show();
      });
  });

  $(document).on("click", ".popup-btn", function (e) {
    $("#modalTitle").text("Add New Slider");
    $("#bannerId").val("");
    $("#bannerForm")[0].reset();
    $("#active").val("false");
    $(".custom-file-label").text("Choose file");
    $("#preview").attr("src", "https://via.placeholder.com/100x50");
    $("#modalOverlay").fadeIn(300);
    $(".popup-box").removeClass("transform-out").addClass("transform-in");
    $(".loading-indicator").hide();
    $(".banner-form-modal form").show();
    e.preventDefault();
  });

  $(document).on("click", ".popup-close", function (e) {
    closeModal();
    e.preventDefault();
  });

  $(document).on("click", ".banner-form-popup", function (e) {
    if (e.target.classList.contains("banner-form-popup")) {
      $("#warningToast").fadeIn(200).addClass("toast-show");
      setTimeout(() => {
        $("#warningToast").fadeOut(200).removeClass("toast-show");
      }, 2000);
    }
  });

  $(document).on("click", ".close-toast", function (e) {
    $("#warningToast").fadeOut(200).removeClass("toast-show");
    e.preventDefault();
  });

  $(document).on("change", "#image_file", function () {
    const file = this.files[0];
    if (file) {
      $(".custom-file-label").text(file.name);
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#preview").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      $(".custom-file-label").text("Choose file");
      $("#preview").attr("src", "https://via.placeholder.com/100x50");
    }
  });

  function closeModal() {
    $("#modalOverlay").fadeOut(300);
    $(".popup-box").removeClass("transform-in").addClass("transform-out");
    $("#bannerForm")[0].reset();
    $("#warningToast").hide();
    currentSliderId = null;
  }

  function closeViewModal() {
    $("#viewModalOverlay").fadeOut(300);
    $(".view-banner-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
  }

  function closeDeleteModal() {
    $("#deleteModalOverlay").fadeOut(300);
    $(".delete-banner-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    currentSliderId = null;
  }

  // Expose close functions globally if needed
  window.closeModal = closeModal;
  window.closeViewModal = closeViewModal;
  window.closeDeleteModal = closeDeleteModal;

  $(document).on("click", "#prevPage", () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });

  $(document).on("click", "#nextPage", () => {
    const rows = $("#bannersTbody tr");
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });
};
