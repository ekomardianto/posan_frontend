/**
 * Centralized API Client for POSAN Super Admin
 * Connects directly to Node.js / Express backend (PostgreSQL posan_db)
 */

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('192.168.1.18')) {
    // If accessing via IP address from another device and envUrl is localhost, use current host IP
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:3000/api`;
    }
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:3000/api`;
  }
  return 'http://localhost:3000/api';
}

const API_BASE_URL = getApiBaseUrl();
const TOKEN_KEY = 'posan_auth_token';
const USER_KEY = 'posan_auth_user';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Universal API Request Handler
 */
export async function apiRequest(endpoint, options = {}) {
  // Support relative or absolute endpoint
  let url;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Handle root-level endpoints like /api/health/db or direct routes
    url = `${getApiBaseUrl()}${cleanEndpoint}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        data.message ||
        data.error ||
        `Permintaan gagal dengan kode status HTTP ${res.status}`;
      
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or connection refused error
    const networkError = new Error(
      'Gagal terhubung ke server backend POSAN (http://localhost:3000). Pastikan backend sedang berjalan.'
    );
    networkError.status = 0;
    networkError.originalError = err;
    throw networkError;
  }
}

export default {
  apiRequest,
  getAuthToken,
  setAuthToken,
  getStoredUser,
  setStoredUser,
  clearAuth,
};
