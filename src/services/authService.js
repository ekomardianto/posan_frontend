import { apiRequest, setAuthToken, setStoredUser, getStoredUser, getAuthToken, clearAuth } from './apiClient';

export { getAuthToken, setAuthToken, clearAuth };

export function getStoredUserSession() {
  return getStoredUser();
}

export function setStoredUserSession(user) {
  setStoredUser(user);
}

export async function loginWithEmail(email, password, remember = true) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Email wajib diisi.' };
  }
  if (!password || !password.trim()) {
    return { success: false, error: 'Password wajib diisi.' };
  }

  try {
    const payload = {
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.token && res.user) {
      const userRole = (res.user.rawRole || res.user.role || '').toLowerCase();
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        clearAuth();
        const roleName = res.user.role === 'kasir' ? 'Kasir' : res.user.role === 'barista' ? 'Barista' : res.user.role === 'kitchen' ? 'Kitchen' : res.user.role;
        return {
          success: false,
          error: `Akses Ditolak: Akun "${roleName}" tidak memiliki hak akses ke Web Admin Café. Akun operasional (Kasir/Barista/Kitchen) hanya dapat digunakan pada Aplikasi POS Mobile / Tablet.`,
        };
      }

      setAuthToken(res.token);
      setStoredUser(res.user);
      return { success: true, user: res.user, token: res.token };
    }

    return { success: false, error: res.message || 'Login gagal.' };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal terhubung ke server backend.' };
  }
}

export async function logoutUser() {
  clearAuth();
  return { success: true };
}

export async function fetchCurrentUser() {
  try {
    const res = await apiRequest('/auth/me', { method: 'GET' });
    if (res.user) {
      const userRole = (res.user.rawRole || res.user.role || '').toLowerCase();
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        clearAuth();
        return null;
      }
      setStoredUser(res.user);
      return res.user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(userData) {
  try {
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (res.user) {
      setStoredUser(res.user);
    }
    return { success: true, user: res.user || userData };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal memperbarui profil.' };
  }
}

export async function changeUserPassword(currentPassword, newPassword) {
  try {
    const res = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { success: true, message: res.message || 'Kata sandi berhasil diperbarui.' };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal mengubah kata sandi.' };
  }
}

export const updateAdminPassword = changeUserPassword;

export const authService = {
  async checkHealthDb() {
    try {
      const data = await apiRequest('/health/db', { method: 'GET' });
      return {
        connected: data.connected === true,
        database: data.database || 'posan_db',
        serverTime: data.serverTime,
      };
    } catch (err) {
      return {
        connected: false,
        error: err.message,
      };
    }
  },

  async login({ email, password }) {
    const res = await loginWithEmail(email, password);
    if (!res.success) {
      throw new Error(res.error || 'Login gagal.');
    }
    return res;
  },

  async getProfile() {
    return fetchCurrentUser();
  },

  logout() {
    clearAuth();
  },

  updateUserProfile,
};

export default authService;
