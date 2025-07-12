const API_BASE = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/backend/login.html";
  }
}

requireAuth();

async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Session expired");
    const data = await res.json();
    return data.data ?? data;
  } catch (err) {
    console.error("Profile fetch failed:", err);
    localStorage.removeItem("token");
    window.location.href = "/backend/login.html";
  }
}

async function insertUserInfo() {
  const profile = await fetchProfile();
  if (profile) {
    $(".username").text(profile.name || "User");
    $(".profile-info strong").text(profile.name || "User");
    $(".profile-info small").text(profile.email || "");
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/backend/login.html";
}

$(function () {
  insertUserInfo();

  $(document).on("click", ".logout", function (e) {
    e.preventDefault();
    logout();
  });
});
