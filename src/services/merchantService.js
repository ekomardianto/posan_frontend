import { apiRequest } from './apiClient';
import { getStoredUser } from './apiClient';

export async function fetchMerchantProfile(merchantId) {
  try {
    const user = getStoredUser();
    const targetId = merchantId || user?.merchant?.id || user?.merchant_id || 1;
    const res = await apiRequest(`/merchants/${targetId}`, { method: 'GET' });
    return res.data || res.merchant || res;
  } catch (err) {
    console.warn('fetchMerchantProfile error, using fallback:', err);
    return {
      id: 1,
      name: 'Bintan Coffee & Roastery',
      address: 'Jl. Pemuda No. 12, Tanjungpinang, Kepulauan Riau',
      phone: '0812-3456-7890',
      email: 'adminbintan@gmail.com',
      operational_hours: '08:00 - 22:00 WIB',
    };
  }
}

export async function updateMerchantProfile(merchantId, data) {
  const user = getStoredUser();
  const targetId = merchantId || user?.merchant?.id || user?.merchant_id || 1;
  const res = await apiRequest(`/merchants/${targetId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export const merchantService = {
  async getMerchants() {
    try {
      const res = await apiRequest('/merchants', { method: 'GET' });
      return res.data || res || [];
    } catch (err) {
      console.warn('getMerchants error:', err);
      return [];
    }
  },

  async getMerchantById(id) {
    return fetchMerchantProfile(id);
  },

  async createMerchant(data) {
    const res = await apiRequest('/merchants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  async updateMerchant(id, data) {
    return updateMerchantProfile(id, data);
  },

  async deleteMerchant(id) {
    const res = await apiRequest(`/merchants/${id}`, { method: 'DELETE' });
    return res.data || res;
  },

  async toggleMerchantStatus(id, isActive) {
    const res = await apiRequest(`/merchants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
    return res.data || res;
  },
};

export default merchantService;
