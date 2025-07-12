$(function () {
  let currentContactId = null;
  let currentPage = 1;
  const rowsPerPage = 10; // Updated to match backend pagination

  loadContacts();

  async function loadContacts(page = 1, search = "") {
    try {
      $("#noResults").hide();
      const url = search
        ? `${API_BASE}/contacts?search=${encodeURIComponent(
            search
          )}&page=${page}`
        : `${API_BASE}/contacts?page=${page}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const result = await response.json();
      const contacts = result.data || [];
      const pagination = result.meta || {
        current_page: result.current_page || 1,
        last_page: result.last_page || 1,
      };

      currentPage = pagination.current_page;
      renderContactTable(contacts);
      updatePagination(pagination);
    } catch (err) {
      console.error("Error loading contacts:", err);
      $("#noResults").show();
    }
  }

  function renderContactTable(contacts) {
    const $tbody = $("#contactTableBody");
    $tbody.empty();

    if (!contacts.length) {
      $("#noResults").show();
      return;
    }

    $("#noResults").hide();

    contacts.forEach((contact) => {
      const messagePreview =
        contact.message && contact.message.length > 30
          ? contact.message.slice(0, 30) + "..."
          : contact.message || "-";
      const row = `
        <tr class="contact-row-${contact.id}">
          <td>${contact.id}</td>
          <td>${contact.name}</td>
          <td>${contact.email}</td>
          <td>${messagePreview}</td>
          <td>${new Date(contact.submitted_at).toLocaleString()}</td>
          <td class="actions">
            <button class="action-btn view contact-view-${
              contact.id
            }" title="View" data-id="${contact.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit contact-edit-${
              contact.id
            }" title="Edit" data-id="${contact.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete contact-delete-${
              contact.id
            }" title="Delete" data-id="${contact.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    $(".view").on("click", viewContact);
    $(".edit").on("click", openEditModal);
    $(".delete").on("click", openDeleteModal);
  }

  function updatePagination(pagination) {
    const totalPages = pagination.last_page || 1;
    $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
    $("#pagination .btn").prop("disabled", false);
    if (currentPage === 1)
      $("#pagination .btn:first-child").prop("disabled", true);
    if (currentPage === totalPages)
      $("#pagination .btn:last-child").prop("disabled", true);
  }

  function viewContact(event) {
    const contactId = $(event.currentTarget).data("id");

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-view-modal .loading-indicator").css("display", "block");
    $(".user-view-modal .view-form-content").css("display", "none");

    fetch(`${API_BASE}/contacts/${contactId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Contact not found");
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("View contact data:", data);
        const contact = data.data || data;
        $("#viewContactId").val(contact.id || "N/A");
        $("#viewName").val(contact.name || "N/A");
        $("#viewEmail").val(contact.email || "N/A");
        $("#viewMessage").val(contact.message || "-");
        $("#viewSubmittedAt").val(
          contact.submitted_at
            ? new Date(contact.submitted_at).toLocaleString()
            : "-"
        );
        $(".user-view-modal .loading-indicator").fadeOut(200);
        $(".user-view-modal .view-form-content").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error viewing contact:", err);
        alert(
          err.message || "Failed to load contact details. Please try again."
        );
        closeViewModal();
      });
  }

  function openEditModal(event) {
    const contactId = $(event.currentTarget).data("id");
    $("#modalTitle").text("Edit Contact");
    $("#contactId").val(contactId);
    $("#contactForm")[0].reset();
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "block");
    $(".user-form-modal form").css("display", "none");

    fetch(`${API_BASE}/contacts/${contactId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Contact not found");
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const contact = data.data || data;
        $("#name").val(contact.name || "");
        $("#email").val(contact.email || "");
        $("#message").val(contact.message || "");
        $(".user-form-modal .loading-indicator").fadeOut(200);
        $(".user-form-modal form").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error loading contact for edit:", err);
        alert(err.message || "Could not load contact details.");
        closeModal();
      });
  }

  function openDeleteModal(event) {
    currentContactId = $(event.currentTarget).data("id");
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
    $("#contactForm")[0].reset();
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
    currentContactId = null;
  };

  window.changePage = function (page) {
    if (page < 1) return;
    const searchTerm = $("#searchInput").val();
    loadContacts(page, searchTerm);
  };

  $("#contactForm").on("submit", async function (e) {
    e.preventDefault();

    const contactId = $("#contactId").val();
    const method = contactId ? "PUT" : "POST";
    const url = contactId
      ? `${API_BASE}/contacts/${contactId}`
      : `${API_BASE}/contacts`;

    const formData = new FormData();
    formData.append("name", $("#name").val());
    formData.append("email", $("#email").val());
    formData.append("message", $("#message").val());

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
        const errorData = await response.json();
        throw new Error(errorData.error || "Save failed");
      }

      const result = await response.json();
      alert(result.message || "Contact saved successfully");
      closeModal();
      loadContacts(currentPage);
    } catch (err) {
      console.error("Error saving contact:", err);
      alert(err.message || "Failed to save contact.");
    }
  });

  $("#searchInput").on("input", function () {
    const term = $(this).val();
    currentPage = 1;
    loadContacts(1, term);
  });

  $(".popup-btn").click(function (e) {
    $("#modalTitle").text("Add New Contact");
    $("#contactId").val("");
    $("#contactForm")[0].reset();
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
    if (!currentContactId) return;

    try {
      const res = await fetch(`${API_BASE}/contacts/${currentContactId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }

      closeDeleteModal();
      loadContacts(currentPage);
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert(err.message || "Failed to delete contact.");
    }
  });
});
