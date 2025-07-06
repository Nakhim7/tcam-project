$(function () {
  let currentUserId = null;

  // Load users when page loads
  loadUsers();

  async function loadUsers() {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      const users = result.data || result;

      renderUserTable(users);
    } catch (err) {
      console.error("Error loading users:", err);
      $("#noResults").show();
    }
  }

  function renderUserTable(users) {
    const $tbody = $("#userTableBody");
    $tbody.empty();

    if (!users.length) {
      $("#noResults").show();
      return;
    }

    $("#noResults").hide();

    users.forEach((user) => {
      const row = `
        <tr>
          <td>${user.id}</td>
          <td>${user.username || user.name}</td>
          <td>${user.email}</td>
          <td>${user.role || "user"}</td>
          <td>${user.status || "active"}</td>
          <td class="actions">
            <button class="action-btn view" title="View" data-id="${user.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit" title="Edit" data-id="${user.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" title="Delete" data-id="${
              user.id
            }">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    $(".view").on("click", viewUser);
    $(".edit").on("click", openEditModal);
    $(".delete").on("click", openDeleteModal);
  }

  function viewUser(event) {
    const userId = $(event.currentTarget).data("id");

    fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.data || data;
        $("#viewUserId").text(user.id);
        $("#viewName").text(user.username || user.name);
        $("#viewEmail").text(user.email);
        $("#viewRole").text(user.role || "N/A");
        $("#viewStatus").text(user.status || "active");
        $("#viewModalOverlay").show();
      })
      .catch((err) => {
        console.error("Error viewing user:", err);
        alert("Failed to load user details.");
      });
  }

  function openEditModal(event) {
    const userId = $(event.currentTarget).data("id");
    $("#modalTitle").text("Edit User");
    $("#userId").val(userId);

    fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.data || data;
        $("#name").val(user.username || user.name);
        $("#email").val(user.email);
        $("#role").val(user.role || "user");
        $("#status").val(user.status || "active");
        $("#password").val("");
        $("#password").prop("required", false);
        $("#modalOverlay").show();
      })
      .catch((err) => {
        console.error("Error loading user for edit:", err);
        alert("Could not load user details.");
      });
  }

  window.openModal = function (mode) {
    $("#modalTitle").text("Add User");
    $("#userId").val("");
    $("#name").val("");
    $("#email").val("");
    $("#password").val("");
    $("#role").val("user");
    $("#status").val("active");
    $("#password").prop("required", true);
    $("#modalOverlay").show();
  };

  window.closeModal = function () {
    $("#modalOverlay").hide();
    $("#userForm")[0].reset();
  };

  function openDeleteModal(event) {
    currentUserId = $(event.currentTarget).data("id");
    $("#deleteModalOverlay").show();
  }

  window.closeDeleteModal = function () {
    $("#deleteModalOverlay").hide();
    currentUserId = null;
  };

  window.closeViewModal = function () {
    $("#viewModalOverlay").hide();
  };

  $("#userForm").on("submit", async function (e) {
    e.preventDefault();
    const userId = $("#userId").val();
    const payload = {
      username: $("#name").val(),
      email: $("#email").val(),
      role: $("#role").val(),
      status: $("#status").val(),
    };

    const password = $("#password").val();
    if (password) payload.password = password;

    const url = userId ? `${API_BASE}/users/${userId}` : `${API_BASE}/users`;
    const method = userId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Save failed");

      closeModal();
      loadUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Failed to save user.");
    }
  });

  $("#confirmDelete").on("click", async function () {
    if (!currentUserId) return;

    try {
      const res = await fetch(`${API_BASE}/users/${currentUserId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Delete failed");

      closeDeleteModal();
      loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  });

  $("#searchInput").on("input", function () {
    const term = $(this).val().toLowerCase();

    fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        let users = data.data || data;
        users = users.filter((u) => {
          return (
            u.username?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term)
          );
        });
        renderUserTable(users);
      });
  });
});
