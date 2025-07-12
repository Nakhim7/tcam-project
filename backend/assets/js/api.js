// Ensure API_URL is defined (from config.js)
if (typeof API_URL === "undefined") {
  console.error(
    "API_URL is not defined. Please include config.js before api.js."
  );
}

// Safely retrieve token
function getToken() {
  return localStorage.getItem("token");
}

// Build Authorization headers
function getAuthHeaders(contentType = true) {
  const token = getToken();
  const headers = {};
  if (contentType) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Unified API request handler
async function apiRequest(method, url, data = null) {
  const headers = getAuthHeaders(data instanceof FormData ? false : true);
  const options = {
    method,
    headers,
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(`${API_URL}/${url}`, options);
    const result = await response.json();

    if (!response.ok)
      throw new Error(result.message || `HTTP error: ${response.status}`);
    return result;
  } catch (err) {
    console.error("API Request Error:", err.message, err);
    throw err;
  }
}

// API methods`
const API = {
  login: (data) => apiRequest("POST", "login", data),
  register: (data) => apiRequest("POST", "register", data),
  getProfile: () => apiRequest("GET", "users/me"),
  getServices: (page = 1, search = "") =>
    apiRequest(
      "GET",
      `services?page=${page}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`
    ),
  getService: (id) => apiRequest("GET", `services/${id}`),
  saveService: (id, data) => {
    const method = id ? "PUT" : "POST";
    const url = id ? `services/${id}` : "services";
    return apiRequest(method, url, data);
  },
  deleteService: (id) => apiRequest("DELETE", `services/${id}`),
  getContacts: (page = 1, search = "") =>
    apiRequest(
      "GET",
      `contacts?page=${page}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`
    ),
  getContact: (id) => apiRequest("GET", `contacts/${id}`),
  saveContact: (id, data) => {
    const method = id ? "PUT" : "POST";
    const url = id ? `contacts/${id}` : "contacts";
    return apiRequest(method, url, data);
  },
  deleteContact: (id) => apiRequest("DELETE", `contacts/${id}`),
  sendContact: (data) => apiRequest("POST", "contacts", data),
  getSliders: (page = 1, search = "") =>
    apiRequest(
      "GET",
      `sliders?page=${page}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`
    ),
  getSlider: (id) => apiRequest("GET", `sliders/${id}`),
  saveSlider: (id, data) => {
    const method = id ? "PUT" : "POST";
    const url = id ? `sliders/${id}` : "sliders";
    return apiRequest(method, url, data);
  },
  deleteSlider: (id) => apiRequest("DELETE", `sliders/${id}`),
};

// Make API globally available
window.API = API;
window.getAuthHeaders = getAuthHeaders;
window.getToken = getToken;
window.API_URL = API_URL;
