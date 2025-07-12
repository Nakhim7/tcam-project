$(function () {
  let currentProductId = null;
  let currentPage = 1;

  loadProducts();

  async function loadProducts() {
    try {
      $("#noResults").hide();
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok)
        throw new Error(`Failed to fetch products: ${response.status}`);
      const result = await response.json();
      console.log("Products response:", result); // Debug response
      const products = result.data || result;
      renderProductTable(products);
    } catch (err) {
      console.error("Error loading products:", err);
      $("#noResults").show();
    }
  }

  function renderProductTable(products) {
    const $tbody = $("#productTableBody");
    $tbody.empty();

    if (!products.length) {
      $("#noResults").show();
      return;
    }

    $("#noResults").hide();

    products.forEach((product) => {
      const row = `
        <tr class="user-row-${product.id}">
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.p_code}</td>
          <td>${product.description || "-"}</td>
         <td><img src="${
           product.image_url || "https://placehold.it/50x50"
         }" alt="Product Image" class="preview-img" /></td>
          <td>${product.created_by || "-"}</td>
          <td>${product.updated_by || "-"}</td>
          <td class="actions">
            <button class="action-btn view user-view-${
              product.id
            }" title="View" data-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit user-edit-${
              product.id
            }" title="Edit" data-id="${product.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete user-delete-${
              product.id
            }" title="Delete" data-id="${product.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
      $tbody.append(row);
    });

    $(".view").on("click", viewProduct);
    $(".edit").on("click", openEditModal);
    $(".delete").on("click", openDeleteModal);
  }

  function viewProduct(event) {
    const productId = $(event.currentTarget).data("id");

    $("#viewModalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-view-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-view-modal .loading-indicator").css("display", "block");
    $(".user-view-modal .view-form-content").css("display", "none");

    fetch(`${API_BASE}/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("View product data:", data); // Debug response
        const product = data.data || data;
        $("#viewProductId").val(product.id || "N/A");
        $("#viewName").val(product.name || "N/A");
        $("#viewPCode").val(product.p_code || "N/A");
        $("#viewDescription").val(product.description || "-");
        $("#viewCreatedBy").val(product.created_by || "-");
        $("#viewUpdatedBy").val(product.updated_by || "-");
        if (product.image_url) {
          $("#viewImage").attr("src", product.image_url).show();
        } else {
          $("#viewImage").hide();
        }
        $(".user-view-modal .loading-indicator").fadeOut(200);
        $(".user-view-modal .view-form-content").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error viewing product:", err);
        alert("Failed to load product details. Please try again.");
        closeViewModal();
      });
  }

  function openEditModal(event) {
    const productId = $(event.currentTarget).data("id");
    $("#modalTitle").text("Edit Product");
    $("#productId").val(productId);
    $("#productForm")[0].reset();
    $("#modalOverlay").css("display", "flex").fadeIn(200);
    $(".popup-box.user-form-modal")
      .removeClass("transform-out")
      .addClass("transform-in");
    $(".user-form-modal .loading-indicator").css("display", "block");
    $(".user-form-modal form").css("display", "none");

    fetch(`${API_BASE}/products/${productId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Edit product data:", data); // Debug response
        const product = data.data || data;
        $("#name").val(product.name || "");
        $("#p_code").val(product.p_code || "");
        $("#description").val(product.description || "");
        $("#image_file").val("");
        $("#preview").attr(
          "src",
          product.image_url || "https://placehold.it/80x80"
        );
        $("#status").val(product.status || "Inactive");
        $(".user-form-modal .loading-indicator").fadeOut(200);
        $(".user-form-modal form").fadeIn(200);
      })
      .catch((err) => {
        console.error("Error loading product for edit:", err);
        alert("Could not load product details.");
        closeModal();
      });
  }

  function openDeleteModal(event) {
    currentProductId = $(event.currentTarget).data("id");
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
    $("#productForm")[0].reset();
    $("#preview").attr("src", "https://placehold.it/80x80");
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
    currentProductId = null;
  };

  $("#productForm").on("submit", async function (e) {
    e.preventDefault();

    const productId = $("#productId").val();
    const method = productId ? "PUT" : "POST";
    const url = productId
      ? `${API_BASE}/products/${productId}`
      : `${API_BASE}/products`;

    const formData = new FormData();
    formData.append("name", $("#name").val());
    formData.append("p_code", $("#p_code").val());
    formData.append("description", $("#description").val());
    formData.append("status", $("#status").val());

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

      if (!response.ok) throw new Error(`Save failed: ${response.status}`);
      console.log("Save product response:", await response.json()); // Debug response
      closeModal();
      loadProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    }
  });

  $("#searchInput").on("input", function () {
    const term = $(this).val().toLowerCase();

    fetch(`${API_BASE}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Search products response:", data); // Debug response
        let products = data.data || data;
        products = products.filter((p) =>
          [p.name, p.p_code, p.description].some((field) =>
            field?.toLowerCase().includes(term)
          )
        );
        renderProductTable(products);
      })
      .catch((err) => {
        console.error("Error searching products:", err);
        $("#noResults").show();
      });
  });

  $("#statusFilter").on("change", function () {
    const selectedStatus = $(this).val();

    fetch(`${API_BASE}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Filter products response:", data); // Debug response
        let products = data.data || data;
        if (selectedStatus) {
          products = products.filter((p) => p.status === selectedStatus);
        }
        renderProductTable(products);
      })
      .catch((err) => {
        console.error("Error filtering products:", err);
        $("#noResults").show();
      });
  });

  $(".popup-btn").click(function (e) {
    $("#modalTitle").text("Add New Product");
    $("#productId").val("");
    $("#productForm")[0].reset();
    $("#status").val("Inactive");
    $("#preview").attr("src", "https://placehold.it/80x80");
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

  $("#image_file").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#preview").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      $("#preview").attr("src", "https://placehold.it/80x80");
    }
  });

  $("#confirmDelete").on("click", async function () {
    if (!currentProductId) return;

    try {
      const res = await fetch(`${API_BASE}/products/${currentProductId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      console.log("Delete product response:", await res.json()); // Debug response
      closeDeleteModal();
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  });
});
