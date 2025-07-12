$(function () {
  let currentContactId = null;
  let currentPage = 1;
  const rowsPerPage = 10;

  // Check authentication
  if (!getToken()) {
    alert("Please log in to view contacts.");
    window.location.href = "/login"; // Adjust to your login page
    return;
  }
  loadContacts();

  // Fetch and display contacts
  async function loadContacts(page = 1, search = "") {
    try {
      $("#noResults").hide();
      console.log("Fetching contacts with page:", page, "search:", search);
      const result = await API.getContacts(page, search);
      console.log("API Response:", JSON.stringify(result, null, 2));

      const contacts = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      const pagination = result.meta || {
        current_page: result.current_page || 1,
        last_page: result.last_page || 1,
      };

      currentPage = pagination.current_page;
      if (!contacts.length) {
        console.warn("No contacts found in response");
        $("#noResults").show();
        return;
      }

      renderContactTable(contacts);
      updatePagination(pagination);
    } catch (err) {
      console.error("Error loading contacts:", err.message, err);
      $("#noResults").show();
      alert(`Failed to load contacts: ${err.message || "Unknown error"}`);
    }
  }

  // Render contacts table
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
          <td>${contact.id || "N/A"}</td>
          <td>${contact.name || "N/A"}</td>
          <td>${contact.email || "N/A"}</td>
          <td>${messagePreview}</td>
          <td>${
            contact.submitted_at
              ? new Date(contact.submitted_at).toLocaleString()
              : "-"
          }</td>
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

    // Bind event handlers
    $(".view").off("click").on("click", viewContact);
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

  // View contact details
  async function viewContact(event) {
    const contactId = $(event.currentTarget).data("id");

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-view-modal .loading-indicator").css("display", "block");
    $(".user-view-modal .view-form-content").css("display", "none");

    try {
      const data = await API.getContact(contactId);
      console.log("View contact data:", JSON.stringify(data, null, 2));
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
    } catch (err) {
      console.error("Error viewing contact:", err.message, err);
      alert(
        `Failed to load contact details: ${err.message || "Unknown error"}`
      );
      closeViewModal();
    }
  }

  // Open edit modal
  async function openEditModal(event) {
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

    try {
      const data = await API.getContact(contactId);
      console.log("Edit contact data:", JSON.stringify(data, null, 2));
      const contact = data.data || data;
      $("#name").val(contact.name || "");
      $("#email").val(contact.email || "");
      $("#message").val(contact.message || "");
      $(".user-form-modal .loading-indicator").fadeOut(200);
      $(".user-form-modal form").fadeIn(200);
    } catch (err) {
      console.error("Error loading contact for edit:", err.message, err);
      alert(
        `Could not load contact details: ${err.message || "Unknown error"}`
      );
      closeModal();
    }
  }

  // Open delete modal
  function openDeleteModal(event) {
    currentContactId = $(event.currentTarget).data("id");
    $("#deleteModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.delete-user-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
  }

  // Close modals
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

  // Pagination
  window.changePage = function (page) {
    if (page < 1) return;
    const searchTerm = $("#searchInput").val();
    loadContacts(page, searchTerm);
  };

  // Bind pagination buttons
  $("#prevPage").on("click", () => changePage(currentPage - 1));
  $("#nextPage").on("click", () => changePage(currentPage + 1));

  // Handle form submission
  $("#contactForm").on("submit", async function (e) {
    e.preventDefault();

    const contactId = $("#contactId").val();
    const data = {
      name: $("#name").val(),
      email: $("#email").val(),
      message: $("#message").val(),
    };

    try {
      const result = await API.saveContact(contactId, data);
      console.log("Save contact response:", JSON.stringify(result, null, 2));
      alert(result.message || "Contact saved successfully");
      closeModal();
      loadContacts(currentPage);
    } catch (err) {
      console.error("Error saving contact:", err.message, err);
      alert(`Failed to save contact: ${err.message || "Unknown error"}`);
    }
  });

  // Search functionality
  $("#searchInput").on("input", function () {
    const term = $(this).val();
    currentPage = 1;
    loadContacts(1, term);
  });

  // Open add contact modal
  $(".popup-btn").click(function (e) {
    const modalType = $(this).data("modal");
    $("#modalTitle").text(
      modalType === "add" ? "Add New Contact" : "Edit Contact"
    );
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

  // Close modal on overlay click
  $("#modalOverlay").on("click", function (e) {
    if (e.target.id === "modalOverlay") {
      $("#warningToast").fadeIn(200).addClass("show");
      setTimeout(() => {
        $("#warningToast").fadeOut(200).removeClass("show");
      }, 2000);
    }
  });

  // Close toast
  $(".close-toast").click(function (e) {
    $("#warningToast").fadeOut(200).removeClass("show");
    e.preventDefault();
  });

  // Confirm delete
  $("#confirmDelete").on("click", async function () {
    if (!currentContactId) return;

    try {
      const result = await API.deleteContact(currentContactId);
      console.log("Delete contact response:", JSON.stringify(result, null, 2));
      closeDeleteModal();
      loadContacts(currentPage);
    } catch (err) {
      console.error("Error deleting contact:", err.message, err);
      alert(`Failed to delete contact: ${err.message || "Unknown error"}`);
    }
  });
});
