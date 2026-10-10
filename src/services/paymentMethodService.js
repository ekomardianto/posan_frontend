import { apiRequest } from './apiClient';

export async function fetchPaymentMethods(filters = {}) {
  try {
    const res = await apiRequest('/payment-methods', { method: 'GET' });
    return res.data || res.paymentMethods || res || [];
  } catch (err) {
    console.warn('fetchPaymentMethods error:', err);
    return [];
  }
}

export async function createPaymentMethod(data) {
  const res = await apiRequest('/payment-methods', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function updatePaymentMethod(id, data) {
  const res = await apiRequest(`/payment-methods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function deletePaymentMethod(id) {
  const res = await apiRequest(`/payment-methods/${id}`, {
    method: 'DELETE',
  });
  return res.data || res;
}

export async function togglePaymentMethodStatus(id, isActive) {
  const res = await apiRequest(`/payment-methods/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  return res.data || res;
}

export async function updatePaymentMethodConfig(id, config) {
  const res = await apiRequest(`/payment-methods/${id}/config`, {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });
  return res.data || res;
}

export const paymentMethodService = {
  getPaymentMethods: fetchPaymentMethods,
  getPaymentMethodById: async (id) => {
    const res = await apiRequest(`/payment-methods/${id}`, { method: 'GET' });
    return res.data || res;
  },
  createPaymentMethod,
  updatePaymentMethod,
  updatePaymentMethodConfig,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  toggleStatus: togglePaymentMethodStatus,
};

export default paymentMethodService;
