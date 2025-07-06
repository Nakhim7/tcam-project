const API_BASE_URL = "http://localhost:8000/api"; // change to your Laravel API domain

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(method, url, data = null) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const options = {
    method: method,
    headers: headers,
    body: data ? JSON.stringify(data) : null,
  };

  const response = await fetch(`${API_BASE_URL}/${url}`, options);
  const result = await response.json();

  if (!response.ok) throw result;

  return result;
}

// Exported functions
const API = {
  login: (data) => apiRequest("POST", "login", data),
  register: (data) => apiRequest("POST", "register", data),
  getProfile: () => apiRequest("GET", "users/me"),
  getProducts: () => apiRequest("GET", "products"),
};
