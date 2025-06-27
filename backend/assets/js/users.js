$(document).ready(function () {
  // Sample data
  let users = [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      password: "pass123",
      address: "123 Main St",
      contact: "555-0123",
      gender: "male",
      role: "admin",
    },
    {
      id: 2,
      username: "jane_smith",
      email: "jane@example.com",
      password: "pass456",
      address: "456 Oak Ave",
      contact: "555-0456",
      gender: "female",
      role: "user",
    },
    {
      id: 3,
      username: "bob_jones",
      email: "bob@example.com",
      password: "pass789",
      address: "789 Pine Rd",
      contact: "555-0789",
      gender: "male",
      role: "user",
    },
    {
      id: 4,
      username: "alice_brown",
      email: "alice@example.com",
      password: "pass101",
      address: "101 Elm St",
      contact: "555-0101",
      gender: "female",
      role: "admin",
    },
    {
      id: 5,
      username: "charlie_davis",
      email: "charlie@example.com",
      password: "pass202",
      address: "202 Birch Ln",
      contact: "555-0202",
      gender: "other",
      role: "user",
    },
    {
      id: 6,
      username: "emma_wilson",
      email: "emma@example.com",
      password: "pass303",
      address: "303 Cedar Dr",
      contact: "555-0303",
      gender: "female",
      role: "user",
    },
  ];

  // Pagination settings
  const usersPerPage = 5;
  let currentPage = 1;

  // Initialize users page after content is loaded
  function initUsersPage() {
    // Get DOM elements
    const userForm = $("#user_form");
    const userIdInput = $("#user_id");
    const usernameInput = $("#user_username");
    const emailInput = $("#user_email");
    const passwordInput = $("#user_password");
    const addressInput = $("#user_address");
    const contactInput = $("#user_contact");
    const genderInput = $("#user_gender");
    const roleInput = $("#user_role");
    const formTitle = $("#user_form_title");
    const cancelBtn = $("#user_cancel_btn");
    const usersTbody = $("#user_tbody");
    const addUserBtn = $("#user_add_btn");
    const userModal = $("#user_modal");
    const closeModal = $("#user_close_modal");
    const prevPageBtn = $("#user_prev_page");
    const nextPageBtn = $("#user_next_page");
    const pageInfo = $("#user_page_info");

    // Render users table with pagination
    function renderUsers() {
      usersTbody.empty();
      const start = (currentPage - 1) * usersPerPage;
      const end = start + usersPerPage;
      const paginatedUsers = users.slice(start, end);

      paginatedUsers.forEach((user) => {
        const row = $(`
          <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>********</td>
            <td>${user.address}</td>
            <td>${user.contact}</td>
            <td>${user.gender}</td>
            <td>${user.role}</td>
            <td>
              <button class="action-btn edit" data-id="${user.id}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" data-id="${user.id}" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `);
        usersTbody.append(row);
      });

      // Update pagination controls
      const totalPages = Math.ceil(users.length / usersPerPage);
      pageInfo.text(`Page ${currentPage} of ${totalPages}`);
      prevPageBtn.prop("disabled", currentPage === 1);
      nextPageBtn.prop("disabled", currentPage === totalPages);
    }

    // Reset form and close modal
    function resetForm() {
      userForm[0].reset();
      userIdInput.val("");
      formTitle.text("Add New User");
      cancelBtn.hide();
      userModal.hide();
    }

    // Populate form for editing
    function populateForm(user) {
      userIdInput.val(user.id);
      usernameInput.val(user.username);
      emailInput.val(user.email);
      passwordInput.val(user.password);
      addressInput.val(user.address);
      contactInput.val(user.contact);
      genderInput.val(user.gender);
      roleInput.val(user.role);
      formTitle.text("Edit User");
      cancelBtn.show();
      userModal.show();
    }

    // Show modal
    function showModal() {
      userModal.show();
    }

    // Handle form submission (Create/Update)
    userForm.on("submit", function (e) {
      e.preventDefault();
      const userId = userIdInput.val();
      const userData = {
        username: usernameInput.val(),
        email: emailInput.val(),
        password: passwordInput.val(),
        address: addressInput.val(),
        contact: contactInput.val(),
        gender: genderInput.val(),
        role: roleInput.val(),
      };

      if (userId) {
        // Update user
        const index = users.findIndex((u) => u.id == userId);
        if (index !== -1) {
          users[index] = { id: parseInt(userId), ...userData };
          // TODO: Add API call, e.g.:
          // $.ajax({
          //   url: `/api/users/${userId}`,
          //   method: "PUT",
          //   contentType: "application/json",
          //   data: JSON.stringify(userData)
          // });
        }
      } else {
        // Create user
        const newUser = { id: users.length + 1, ...userData };
        users.push(newUser);
        // TODO: Add API call, e.g.:
        // $.ajax({
        //   url: "/api/users",
        //   method: "POST",
        //   contentType: "application/json",
        //   data: JSON.stringify(userData)
        // });
      }

      renderUsers();
      resetForm();
    });

    // Handle table actions (Edit/Delete)
    usersTbody.on("click", ".action-btn", function (e) {
      const target = $(this);
      const userId = target.data("id");
      const user = users.find((u) => u.id == userId);

      if (target.hasClass("edit")) {
        // Select user for editing
        populateForm(user);
      } else if (target.hasClass("delete")) {
        // Delete user
        if (confirm(`Are you sure you want to delete ${user.username}?`)) {
          users = users.filter((u) => u.id != userId);
          renderUsers();
          // TODO: Add API call, e.g.:
          // $.ajax({
          //   url: `/api/users/${userId}`,
          //   method: "DELETE"
          // });
        }
      }
    });

    // Handle add user button
    addUserBtn.on("click", function () {
      resetForm();
      showModal();
    });

    // Handle close modal
    closeModal.on("click", resetForm);

    // Handle cancel button
    cancelBtn.on("click", resetForm);

    // Handle pagination
    prevPageBtn.on("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderUsers();
      }
    });

    nextPageBtn.on("click", function () {
      if (currentPage < Math.ceil(users.length / usersPerPage)) {
        currentPage++;
        renderUsers();
      }
    });

    // Initial render
    renderUsers();
  }

  // Ensure users page initializes after content load
  $("#dashboardContent").on("page:users:loaded", initUsersPage);

  // If users page is already loaded, initialize immediately
  if (window.location.hash.includes("users")) {
    initUsersPage();
  }
});
