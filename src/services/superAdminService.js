import { apiRequest } from './apiClient.js';

export async function fetchAllMerchants() {
  try {
    const data = await apiRequest('/merchants');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching all merchants:', err);
    throw err;
  }
}

export async function createNewMerchant(merchantData) {
  try {
    const res = await apiRequest('/merchants', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
    return res;
  } catch (err) {
    console.error('Error creating merchant:', err);
    throw err;
  }
}

export async function updateMerchantDetails(merchantId, updateData) {
  try {
    const res = await apiRequest(`/merchants/${merchantId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return res;
  } catch (err) {
    console.error('Error updating merchant:', err);
    throw err;
  }
}

export async function toggleMerchantActiveStatus(merchantId, nextActiveState) {
  try {
    const res = await apiRequest(`/merchants/${merchantId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: nextActiveState }),
    });
    return res;
  } catch (err) {
    console.error('Error toggling merchant status:', err);
    throw err;
  }
}

export async function fetchAllSystemUsers() {
  try {
    // Fetch users from cashier / users endpoint
    const data = await apiRequest('/cashiers');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching all users:', err);
    return [];
  }
}

export async function createSystemUser(userData) {
  try {
    const res = await apiRequest('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res;
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
}

export async function toggleUserActiveStatus(userId, newStatus) {
  try {
    const res = await apiRequest(`/cashiers/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    return res;
  } catch (err) {
    console.error('Error toggling user status:', err);
    throw err;
  }
}

export async function deleteSystemUser(userId) {
  try {
    const res = await apiRequest(`/cashiers/${userId}`, {
      method: 'DELETE',
    });
    return res;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
}
