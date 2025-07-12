$(function () {
  let currentUserId = null;

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
        <tr class="user-row-${user.id}">
          <td>${user.id}</td>
          <td>${user.username || user.name}</td>
          <td>${user.email}</td>
          <td>${user.role || "User"}</td>
          <td>${user.status || "Active"}</td>
          <td class="actions">
            <button class="action-btn view user-view-${
              user.id
            }" title="View" data-id="${user.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit user-edit-${
              user.id
            }" title="Edit" data-id="${user.id}">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    $(".view").on("click", viewUser);
    $(".edit").on("click", openEditModal);
  }

  function viewUser(event) {
    const userId = $(event.currentTarget).data("id");

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-view-modal .loading-indicator").css("display", "block");
    $(".user-view-modal .view-form-content").css("display", "none");

    fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const user = data.data || data;
        $("#viewUserId").val(user.id || "N/A");
        $("#viewName").val(user.username || user.name || "N/A");
        $("#viewEmail").val(user.email || "N/A");
        $("#viewRole").val(user.role || "User");
        $("#viewStatus").val(user.status || "Active");
        $(".user-view-modal .loading-indicator").fadeOut(200);
        $(".user-view-modal .view-form-content").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error viewing user:", err);
        alert("Failed to load user details. Please try again.");
        closeViewModal();
      });
  }

  function openEditModal(event) {
    const userId = $(event.currentTarget).data("id");
    $("#modalTitle").text("Edit User");
    $("#userId").val(userId);
    $("#userForm")[0].reset();
    $("#password").prop("required", false);
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "block");
    $(".user-form-modal form").css("display", "none");

    fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const user = data.data || data;
        $("#name").val(user.username || user.name || "");
        $("#email").val(user.email || "");
        $("#role").val(user.role || "User");
        $("#status").val(user.status || "Active");
        $("#password").val("");
        $(".user-form-modal .loading-indicator").fadeOut(200);
        $(".user-form-modal form").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error loading user for edit:", err);
        alert("Could not load user details.");
        closeModal();
      });
  }

  window.openModal = function () {
    $("#modalTitle").text("Add New User");
    $("#userId").val("");
    $("#userForm")[0].reset();
    $("#role").val("User");
    $("#status").val("Active");
    $("#password").prop("required", true);
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "none");
    $(".user-form-modal form").css("display", "block");
  };

  window.closeModal = function () {
    $("#modalOverlay").fadeOut(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-in")
      .addClass("transform-out");
    $("#userForm")[0].reset();
    $(".user-form-modal .loading-indicator").css("display", "none");
    $(".user-form-modal form").css("display", "block");
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

  $(".popup-btn").click(function (e) {
    openModal();
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
});
