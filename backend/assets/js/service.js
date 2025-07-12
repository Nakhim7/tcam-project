$(function () {
  let currentServiceId = null;
  let currentPage = 1;
  const rowsPerPage = 5;

  loadServices();

  async function loadServices() {
    try {
      $("#noResults").hide();
      const response = await fetch(`${API_BASE}/services`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch services: ${response.status} ${
            errorData.message || response.statusText
          }`
        );
      }
      const result = await response.json();
      console.log("Services response:", result); // Debug response
      const services = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      if (!services.length) {
        console.warn("No services found in response");
        $("#noResults").show();
        return;
      }

      renderServiceTable(services);
      updatePagination(services);
    } catch (err) {
      console.error("Error loading services:", err.message);
      $("#noResults").show();
      alert(`Failed to load services: ${err.message}`);
    }
  }

  function renderServiceTable(services) {
    const $tbody = $("#serviceTableBody");
    $tbody.empty();

    if (!services.length) {
      $("#noResults").show();
      return;
    }

    $("#noResults").hide();

    services.forEach((service) => {
      //  const imageSrc = `http://127.0.0.1:8000/storage/services/${service.icon_url}`;
      const row = `
        <tr class="service-row-${service.id}">
          <td>${service.id || "N/A"}</td>
          <td>${service.name || "N/A"}</td>
          <td>${service.description || "-"}</td>
           <td>
  <img src="http://127.0.0.1:8000/storage/services/${
    service.icon_url
  }" alt="Icon" width="40" height="40" />



    </td>
          <td>${
            service.created_at
              ? new Date(service.created_at).toLocaleString()
              : "-"
          }</td>
          <td class="actions">
            <button class="action-btn view service-view-${
              service.id
            }" title="View" data-id="${service.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit service-edit-${
              service.id
            }" title="Edit" data-id="${service.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete service-delete-${
              service.id
            }" title="Delete" data-id="${service.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    $(".view").off("click").on("click", viewService); // Prevent multiple bindings
    $(".edit").off("click").on("click", openEditModal);
    $(".delete").off("click").on("click", openDeleteModal);
  }

  function updatePagination(services) {
    const totalPages = Math.ceil(services.length / rowsPerPage) || 1;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rows = document.querySelectorAll(".services-table tbody tr");
    rows.forEach((row, index) => {
      row.style.display = index >= start && index < end ? "" : "none";
    });
    $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
    $("#prevPage").prop("disabled", currentPage === 1);
    $("#nextPage").prop("disabled", currentPage === totalPages);
  }

  function viewService(event) {
    const serviceId = $(event.currentTarget).data("id");

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-view-modal .loading-indicator").css("display", "block");
    $(".user-view-modal .view-form-content").css("display", "none");

    fetch(`${API_BASE}/services/${serviceId}`)
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((errorData) => {
              throw new Error(
                `HTTP error! status: ${res.status} ${
                  errorData.message || res.statusText
                }`
              );
            })
            .catch(() => {
              throw new Error(`HTTP error! status: ${res.status}`);
            });
        }
        return res.json();
      })
      .then((data) => {
        console.log("View service data:", data);
        const service = data.data || data;
        $("#viewServiceId").val(service.id || "N/A");
        $("#viewName").val(service.name || "N/A");
        $("#viewDescription").val(service.description || "-");
        if (service.icon_url) {
          $("#viewIconUrl").attr("src", service.icon_url).show();
        } else {
          $("#viewIconUrl").hide();
        }
        $("#viewCreatedAt").val(
          service.created_at
            ? new Date(service.created_at).toLocaleString()
            : "-"
        );
        $(".user-view-modal .loading-indicator").fadeOut(200);
        $(".user-view-modal .view-form-content").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error viewing service:", err.message);
        alert(`Failed to load service details: ${err.message}`);
        closeViewModal();
      });
  }

  function openEditModal(event) {
    const serviceId = $(event.currentTarget).data("id");
    $("#modalTitle").text("Edit Service");
    $("#serviceId").val(serviceId);
    $("#serviceForm")[0].reset();
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "block");
    $(".user-form-modal form").css("display", "none");

    fetch(`${API_BASE}/services/${serviceId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((errorData) => {
              throw new Error(
                `HTTP error! status: ${res.status} ${
                  errorData.message || res.statusText
                }`
              );
            })
            .catch(() => {
              throw new Error(`HTTP error! status: ${res.status}`);
            });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Edit service data:", data);
        const service = data.data || data;
        $("#name").val(service.name || "");
        $("#description").val(service.description || "");
        $("#icon_url").val(""); // Reset file input
        $("#preview").attr("src", service.icon_url);
        $(".user-form-modal .loading-indicator").fadeOut(200);
        $(".user-form-modal form").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error loading service for edit:", err.message);
        alert(`Could not load service details: ${err.message}`);
        closeModal();
      });
  }

  function openDeleteModal(event) {
    currentServiceId = $(event.currentTarget).data("id");
    $("#deleteModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.delete-user-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
  }

  window.closeModal = function () {
    $("#modalOverlay").fadeOut(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    $("#serviceForm")[0].reset();
    $("#preview").attr("src", "https://placehold.co/100x50");
    $("#warningToast").fadeOut(200);
  };

  window.closeViewModal = function () {
    $("#viewModalOverlay").fadeOut(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    $(".user-view-modal .loading-indicator").css("display", "none");
    $(".user-view-modal .view-form-content").css("display", "none");
  };

  $(".popup-btn").click(function (e) {
    $("#modalTitle").text("Add New Service");
    $("#serviceId").val("");
    $("#serviceForm")[0].reset();
    $("#preview").attr("src", "https://placehold.co/100x50");
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "none");
    $(".user-form-modal form").css("display", "block");
    e.preventDefault();
  });

  $(".popup-close").click(function (e) {
    closeModal();
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

  $(".close-toast").click(function (e) {
    $("#warningToast").fadeOut(200).removeClass("show");
    e.preventDefault();
  });

  $("#icon_url").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#preview").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      $("#preview").attr("src", "https://placehold.co/100x50");
    }
  });

  $("#confirmDelete").on("click", async function () {
    if (!currentServiceId) return;

    try {
      const res = await fetch(`${API_BASE}/services/${currentServiceId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Delete failed: ${res.status} ${errorData.message || res.statusText}`
        );
      }
      console.log("Delete service response:", await res.json());
      closeDeleteModal();
      loadServices();
    } catch (err) {
      console.error("Error deleting service:", err.message);
      alert(`Failed to delete service: ${err.message}`);
    }
  });
});
