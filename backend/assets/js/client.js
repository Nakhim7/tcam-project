$(function () {
  let currentClientId = null;
  let currentPage = 1;
  const rowsPerPage = 10;
  let categories = [];

  loadCategories();
  loadClients();

  async function loadCategories() {
    try {
      const response = await fetch(`${API_BASE}/client-categories`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch categories: ${response.status} ${
            errorData.message || response.statusText
          }`
        );
      }
      const result = await response.json();
      console.log("Categories response:", result);
      categories = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      populateCategoryDropdown();
    } catch (err) {
      console.error("Error loading categories:", err.message);
      alert(`Failed to load categories: ${err.message}`);
    }
  }

  function populateCategoryDropdown(selectedId = null) {
    const $select = $("#client_category_id");
    $select.empty().append('<option value="">Select a category</option>');
    categories.forEach((category) => {
      const selected = category.id == selectedId ? "selected" : "";
      $select.append(
        `<option value="${category.id}" ${selected}>${category.name}</option>`
      );
    });
  }

  async function loadClients() {
    try {
      $("#noResults").hide();
      const response = await fetch(`${API_BASE}/clients`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch clients: ${response.status} ${
            errorData.message || response.statusText
          }`
        );
      }
      const result = await response.json();
      console.log("Clients response:", result);
      const clients = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      if (!clients.length) {
        console.warn("No clients found in response");
        $("#noResults").show();
        return;
      }
      renderClientTable(clients);
      updatePagination(clients);
    } catch (err) {
      console.error("Error loading clients:", err.message);
      $("#noResults").show();
      alert(`Failed to load clients: ${err.message}`);
    }
  }

  function renderClientTable(clients) {
    const $tbody = $("#clientTableBody");
    $tbody.empty();

    if (!clients.length) {
      $("#noResults").show();
      return;
    }

    $("#noResults").hide();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedClients = clients.slice(start, end);

    paginatedClients.forEach((client) => {
      const logoImg = client.logo_url
        ? `<img src="${client.logo_url}" alt="${
            client.name || "Logo"
          } logo" class="preview-img" />`
        : "-";
      const row = `
        <tr class="client-row-${client.id}">
          <td>${client.id || "N/A"}</td>
          <td>${client.name || "N/A"}</td>
          <td>${logoImg}</td>
          <td>${client.category?.name || "-"}</td>
          <td>${
            client.created_at
              ? new Date(client.created_at).toLocaleString()
              : "-"
          }</td>
          <td class="actions">
            <button class="action-btn view client-view-${
              client.id
            }" title="View" data-id="${client.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit client-edit-${
              client.id
            }" title="Edit" data-id="${client.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete client-delete-${
              client.id
            }" title="Delete" data-id="${client.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    $(".view").off("click").on("click", viewClient);
    $(".edit").off("click").on("click", openEditModal);
    $(".delete").off("click").on("click", openDeleteModal);
  }

  function updatePagination(clients) {
    const totalPages = Math.ceil(clients.length / rowsPerPage) || 1;
    $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
    $("#pagination .btn").prop("disabled", false);
    if (currentPage === 1) {
      $("#pagination .btn:first-child").prop("disabled", true);
    }
    if (currentPage === totalPages) {
      $("#pagination .btn:last-child").prop("disabled", true);
    }
  }

  function viewClient(event) {
    const clientId = $(event.currentTarget).data("id");

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-view-modal .loading-indicator").css("display", "block");
    $(".user-view-modal .view-form-content").css("display", "none");

    fetch(`${API_BASE}/clients/${clientId}`)
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
        console.log("View client data:", data);
        const client = data.data || data;
        $("#viewClientId").val(client.id || "N/A");
        $("#viewName").val(client.name || "N/A");
        $("#viewCategory").val(client.category?.name || "-");
        $("#viewCreatedAt").val(
          client.created_at ? new Date(client.created_at).toLocaleString() : "-"
        );
        $("#viewLogoPreview").html(
          client.logo_url
            ? `<img src="${client.logo_url}" alt="${
                client.name || "Logo"
              } logo" class="preview-img" />`
            : "-"
        );
        $(".user-view-modal .loading-indicator").fadeOut(200);
        $(".user-view-modal .view-form-content").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error viewing client:", err.message);
        alert(`Failed to load client details: ${err.message}`);
        closeViewModal();
      });
  }

  function openEditModal(event) {
    const clientId = $(event.currentTarget).data("id");
    $("#modalTitle").text("Edit Client");
    $("#clientId").val(clientId);
    $("#clientForm")[0].reset();
    $("#logoPreview").empty();
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "block");
    $(".user-form-modal form").css("display", "none");

    fetch(`${API_BASE}/clients/${clientId}`, {
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
        console.log("Edit client data:", data);
        const client = data.data || data;
        $("#name").val(client.name || "");
        populateCategoryDropdown(client.client_category_id);
        $("#logoPreview").html(
          client.logo_url
            ? `<img src="${client.logo_url}" alt="${
                client.name || "Logo"
              } logo" class="preview-img" />`
            : ""
        );
        $(".user-form-modal .loading-indicator").fadeOut(200);
        $(".user-form-modal form").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error loading client for edit:", err.message);
        alert(`Could not load client details: ${err.message}`);
        closeModal();
      });
  }

  function openDeleteModal(event) {
    currentClientId = $(event.currentTarget).data("id");
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
    $("#clientForm")[0].reset();
    $("#logoPreview").empty();
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

  window.closeDeleteModal = function () {
    $("#deleteModalOverlay").fadeOut(200);
    $(".popup-box.delete-user-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    currentClientId = null;
  };

  window.changePage = function (page) {
    if (page < 1) return;
    fetch(`${API_BASE}/clients`)
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
        console.log("Pagination clients response:", data);
        const clients = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        const totalPages = Math.ceil(clients.length / rowsPerPage) || 1;
        if (page > totalPages) return;
        currentPage = page;
        renderClientTable(clients);
        updatePagination(clients);
      })
      .catch((err) => {
        console.error("Error changing page:", err.message);
        $("#noResults").show();
        alert(`Failed to change page: ${err.message}`);
      });
  };

  $("#clientForm").on("submit", async function (e) {
    e.preventDefault();

    const clientId = $("#clientId").val();
    const method = clientId ? "PUT" : "POST";
    const url = clientId
      ? `${API_BASE}/clients/${clientId}`
      : `${API_BASE}/clients`;

    const formData = new FormData();
    formData.append("name", $("#name").val());
    formData.append("client_category_id", $("#client_category_id").val());
    const logoFile = $("#logo")[0].files[0];
    if (logoFile) formData.append("logo", logoFile);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: getAuthHeaders().Authorization,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Save failed: ${response.status} ${
            errorData.message || response.statusText
          }`
        );
      }

      console.log("Save client response:", await response.json());
      alert(
        clientId ? "Client updated successfully" : "Client created successfully"
      );
      closeModal();
      loadClients();
    } catch (err) {
      console.error("Error saving client:", err.message);
      alert(`Failed to save client: ${err.message}`);
    }
  });

  $("#logo").on("change", function (e) {
    const file = e.target.files[0];
    $("#logoPreview").empty();
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#logoPreview").html(
          `<img src="${e.target.result}" alt="Logo preview" class="preview-img" />`
        );
      };
      reader.readAsDataURL(file);
    }
  });

  $("#searchInput").on("input", function () {
    const term = $(this).val().toLowerCase();
    fetch(`${API_BASE}/clients`)
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
        console.log("Search clients response:", data);
        let clients = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        clients = clients.filter((c) =>
          [c.name, c.id.toString(), c.category?.name].some((field) =>
            field?.toLowerCase().includes(term)
          )
        );
        currentPage = 1;
        renderClientTable(clients);
        updatePagination(clients);
      })
      .catch((err) => {
        console.error("Error searching clients:", err.message);
        $("#noResults").show();
        alert(`Failed to search clients: ${err.message}`);
      });
  });

  $(".popup-btn").click(function (e) {
    $("#modalTitle").text("Add New Client");
    $("#clientId").val("");
    $("#clientForm")[0].reset();
    $("#logoPreview").empty();
    populateCategoryDropdown();
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

  $("#confirmDelete").on("click", async function () {
    if (!currentClientId) return;

    try {
      const res = await fetch(`${API_BASE}/clients/${currentClientId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Delete failed: ${res.status} ${errorData.message || res.statusText}`
        );
      }

      console.log("Delete client response:", await res.json());
      alert("Client deleted successfully");
      closeDeleteModal();
      loadClients();
    } catch (err) {
      console.error("Error deleting client:", err.message);
      alert(`Failed to delete client: ${err.message}`);
    }
  });
});
