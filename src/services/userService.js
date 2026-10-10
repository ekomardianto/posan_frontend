import { apiRequest } from './apiClient';

export const userService = {
  // GET /api/users: Fetch all users from PostgreSQL, optionally filtered by role
  async getUsers(role = null) {
    const endpoint = role ? `/users?role=${encodeURIComponent(role)}` : '/users';
    const data = await apiRequest(endpoint, { method: 'GET' });
    return Array.isArray(data) ? data : [];
  },

  // POST /api/users: Create new user (admin, kasir, barista, kitchen, super_admin)
  async createUser(userData) {
    const { name, email, password, role, is_active } = userData;

    if (!name || !name.trim()) throw new Error('Nama pengguna wajib diisi.');
    if (!email || !email.trim()) throw new Error('Alamat email wajib diisi.');
    if (!password || password.trim().length < 6) {
      throw new Error('Kata sandi minimal 6 karakter.');
    }
    if (!role) throw new Error('Role pengguna wajib dipilih.');

    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        is_active: is_active !== false,
      }),
    });

    return res.user || res;
  },

  // PUT /api/users/:id: Update user
  async updateUser(id, updateData) {
    const { name, email, role, password, is_active } = updateData;

    const payload = {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      role,
      is_active: is_active !== false,
    };

    if (password && password.trim().length >= 6) {
      payload.password = password.trim();
    }

    const res = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return res.user || res;
  },

  // PATCH /api/users/:id/status: Toggle active status
  async toggleUserStatus(id, currentStatus) {
    const nextStatus = !currentStatus;
    const res = await apiRequest(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: nextStatus }),
    });

    return res;
  },

  // DELETE /api/users/:id: Delete user
  async deleteUser(id) {
    const res = await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });

    return res;
  },
};

export default userService;
