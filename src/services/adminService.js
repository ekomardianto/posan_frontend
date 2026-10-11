import { userService } from './userService';

export const adminService = {
  // Fetch all admin users from PostgreSQL
  async getAdmins() {
    try {
      const users = await userService.getUsers();
      // Filter admins (super_admin and admin)
      const adminUsers = users.filter(
        (u) => u.role === 'admin' || u.role === 'super_admin'
      );

      return adminUsers.map((a) => ({
        id: String(a.id),
        name: a.name || 'Admin',
        email: a.email || '-',
        role: a.role === 'super_admin' ? 'Super Admin' : 'Admin Café',
        rawRole: a.role,
        status: a.is_active ? 'Active' : 'Inactive',
        isActive: a.is_active,
        createdAt: a.created_at
          ? new Date(a.created_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Hari ini',
        phone: '-',
        provisionMethod:
          a.role === 'super_admin'
            ? 'Akun Super Admin Utama'
            : 'Admin Backoffice Café',
      }));
    } catch (err) {
      console.error('Error in adminService.getAdmins:', err);
      throw err;
    }
  },

  // Create an admin user
  async createAdmin(adminData) {
    const { name, email, password, role = 'admin', status = 'Active' } = adminData;

    return await userService.createUser({
      name,
      email,
      password,
      role: role === 'Super Admin' ? 'super_admin' : 'admin',
      is_active: status === 'Active' || status === true,
    });
  },

  // Update admin user
  async updateAdmin(id, updateData) {
    const { name, email, role, password, status } = updateData;

    let targetRole = undefined;
    if (role) {
      targetRole =
        role === 'Super Admin' || role === 'super_admin'
          ? 'super_admin'
          : 'admin';
    }

    return await userService.updateUser(id, {
      name,
      email,
      role: targetRole,
      password,
      is_active: status !== undefined ? status === 'Active' || status === true : undefined,
    });
  },

  // Toggle admin active / inactive
  async toggleAdminStatus(id, currentStatus) {
    const isActive = currentStatus === 'Active' || currentStatus === true;
    return await userService.toggleUserStatus(id, isActive);
  },

  // Delete admin user
  async deleteAdmin(id) {
    return await userService.deleteUser(id);
  },
};

export default adminService;
