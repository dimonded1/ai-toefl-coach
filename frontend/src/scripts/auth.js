// AI TOEFL Coach - small JWT auth and profile sync bridge

const AUTH_TOKEN_KEY = "toefl_coach_auth_token";
const AUTH_USER_KEY = "toefl_coach_current_user";

const AUTH_API_BASE = (() => {
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (window.location.protocol === "file:" || localHosts.has(window.location.hostname)) {
    return "http://localhost:3001/api";
  }
  return "/api";
})();

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function isAuthenticated() {
  return Boolean(getAuthToken());
}

async function registerUser({ name, email, password }) {
  const data = await authRequest("/auth/register", {
    method: "POST",
    body: { name, email, password }
  });
  persistSession(data);
  return data;
}

async function loginUser({ email, password }) {
  const data = await authRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });
  persistSession(data);
  return data;
}

function logoutUser() {
  clearAuthToken();
  setProfileSyncState("local", "Signed out");
}

async function apiGetProfile() {
  const data = await authRequest("/profile", { method: "GET", auth: true });
  return data.profile;
}

async function apiSaveProfile(profile) {
  const data = await authRequest("/profile", {
    method: "PUT",
    auth: true,
    body: profile
  });
  return data.profile;
}

async function refreshCurrentUser() {
  const data = await authRequest("/auth/me", { method: "GET", auth: true });
  setCurrentUser(data.user);
  return data.user;
}

async function authRequest(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAuthToken();
    if (!token) throw new Error("Not signed in");
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${AUTH_API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Cannot reach the backend. Check that the deployed API service is running and connected.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function persistSession(data) {
  if (data.token) setAuthToken(data.token);
  if (data.user) setCurrentUser(data.user);
  setProfileSyncState("synced", "Signed in");
}

function setProfileSyncState(state, message = "") {
  window.dispatchEvent(new CustomEvent("profile-sync-state", {
    detail: { state, message }
  }));
}
