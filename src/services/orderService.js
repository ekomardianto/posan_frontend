import { apiRequest } from './apiClient';

export async function fetchBaristaOrders(status = 'all') {
  try {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiRequest(`/orders/barista${query}`, { method: 'GET' });
    return Array.isArray(res) ? res : res.data || res.orders || [];
  } catch (err) {
    console.warn('fetchBaristaOrders error:', err);
    return [];
  }
}

export async function fetchKitchenOrders(status = 'all') {
  try {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiRequest(`/orders/kitchen${query}`, { method: 'GET' });
    return Array.isArray(res) ? res : res.data || res.orders || [];
  } catch (err) {
    console.warn('fetchKitchenOrders error:', err);
    return [];
  }
}

export async function updateOrderItemStatus(itemId, newStatus, processedBy = null) {
  try {
    const payload = { next_status: newStatus };
    if (processedBy) payload.processed_by = processedBy;

    const res = await apiRequest(`/orders/items/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return { success: true, data: res.data || res };
  } catch (err) {
    console.error('updateOrderItemStatus error:', err);
    return { success: false, error: err.message };
  }
}

export const orderService = {
  fetchBaristaOrders,
  fetchKitchenOrders,
  updateOrderItemStatus,
  async getOrders(station, status = 'all') {
    if (station === 'barista') return fetchBaristaOrders(status);
    if (station === 'kitchen') return fetchKitchenOrders(status);
    const res = await apiRequest(`/orders?status=${status}`, { method: 'GET' });
    return Array.isArray(res) ? res : res.data || [];
  },
};

export default orderService;
