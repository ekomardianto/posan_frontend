import { apiRequest } from './apiClient';

export async function fetchCashiers(filters = {}) {
  try {
    const res = await apiRequest('/users', { method: 'GET' });
    const list = Array.isArray(res) ? res : (res.data || res.users || []);
    return list
      .filter((u) => (u.role || '').toLowerCase() !== 'super_admin')
      .map((u) => {
        const isActive = u.is_active !== false && u.is_active !== 0;
        return {
          ...u,
          rawId: u.id,
          id: u.id ? (String(u.id).startsWith('USR-') ? String(u.id) : `USR-${String(u.id).padStart(3, '0')}`) : 'USR-000',
          role: getRoleLabel(u.role),
          rawRole: normalizeRole(u.role),
          is_active: isActive,
          status: isActive ? 'Aktif' : 'Nonaktif',
          createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Hari ini',
        };
      });
  } catch (err) {
    console.warn('fetchCashiers error:', err);
    return [];
  }
}

export async function fetchOnlyCashiers() {
  const users = await fetchCashiers();
  return users.filter((u) => (u.rawRole || '').toLowerCase() === 'kasir');
}

export function normalizeRole(role) {
  if (!role) return 'kasir';
  const r = role.toLowerCase();
  if (r === 'cashier' || r === 'kasir') return 'kasir';
  if (r === 'barista') return 'barista';
  if (r === 'kitchen' || r === 'chef') return 'kitchen';
  if (r === 'admin') return 'admin';
  return r;
}

export function getRoleLabel(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'admin': return 'Admin Café';
    case 'kasir': return 'Kasir';
    case 'barista': return 'Barista';
    case 'kitchen': return 'Kitchen';
    default: return role;
  }
}

export async function createCashier(cashierData) {
  try {
    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(cashierData),
    });
    return { success: true, data: res.user || res.data || res, message: res.message };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal mendaftarkan staf ke database.' };
  }
}

export async function updateCashier(id, cashierData) {
  try {
    const res = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cashierData),
    });
    return { success: true, data: res.user || res.data || res, message: res.message };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal memperbarui data staf.' };
  }
}

export async function deleteCashier(id) {
  try {
    const res = await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
    return { success: true, message: res.message };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal menghapus akun staf.' };
  }
}

export async function toggleCashierStatus(id, isActive) {
  try {
    const res = await apiRequest(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
    return { success: true, message: res.message };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal mengubah status staf.' };
  }
}

export const cashierService = {
  getCashiers: fetchCashiers,
  fetchOnlyCashiers,
  normalizeRole,
  getRoleLabel,
  createCashier,
  updateCashier,
  deleteCashier,
  toggleCashierStatus,
};

export default cashierService;
