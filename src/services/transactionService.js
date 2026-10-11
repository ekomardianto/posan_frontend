import { apiRequest } from './apiClient';

/**
 * Normalizes a transaction object from the backend into the shape required by the UI
 */
export function normalizeTransaction(t) {
  if (!t) return null;
  const amount = Number(t.total_amount) || Number(t.total) || 0;
  const paid = Number(t.amount_paid) || amount;
  const change = Number(t.change_amount) || 0;
  const receiptNo = t.receipt_number || (t.id ? `#TRX-${t.id}` : 'TRX-UNKNOWN');
  const cashier = t.cashier_name || t.cashierName || 'Kasir';
  const method = t.payment_method_name || t.payment_method || t.paymentMethod || 'Tunai';
  const createdDate = t.created_at ? new Date(t.created_at) : new Date();
  const dateStr = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Hari ini';
  const timeStr = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    : 'Baru saja';
  const fullTimestampStr = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleString('id-ID')
    : 'Hari ini';

  const rawStatus = (t.status || 'completed').toString().toLowerCase();
  const isPaid = rawStatus === 'completed' || rawStatus === 'paid' || rawStatus === 'sukses';

  const items = Array.isArray(t.items)
    ? t.items.map((i) => ({
        id: i.id,
        productId: i.product_id || i.productId,
        name: i.product_name || i.name || 'Menu',
        qty: Number(i.quantity) || Number(i.qty) || 1,
        price: Number(i.unit_price) || Number(i.price) || 0,
        subtotal: Number(i.subtotal) || (Number(i.quantity) || 1) * (Number(i.unit_price) || 0),
        station: i.station || 'barista',
        notes: i.notes || '',
        status: i.item_status || 'pending',
        category: i.category || 'Menu Kafe',
        processed_by: i.processed_by || null,
        created_at_millis: i.created_at_millis || null,
        processing_at_millis: i.processing_at_millis || null,
        completed_at_millis: i.completed_at_millis || null,
      }))
    : [];

  return {
    id: receiptNo,
    numericId: t.id,
    receiptNumber: receiptNo,
    cashierId: t.cashier_id,
    cashierName: cashier,
    cashierRole: 'Kasir Utama',
    customerName: t.customer_name || 'Pelanggan POSAN',
    notes: t.notes || '',
    date: dateStr,
    time: timeStr,
    fullTimestamp: fullTimestampStr,
    paymentMethod: method,
    paymentDetail: `${method} (Lunas)`,
    paymentRef: t.notes || 'POS-ONLINE',
    total: amount,
    formattedTotal: `Rp ${amount.toLocaleString('id-ID')}`,
    subtotal: amount,
    discount: 0,
    tax: 0,
    amountPaid: paid,
    changeAmount: change,
    status: isPaid ? 'PAID' : rawStatus.toUpperCase(),
    statusLabel: isPaid ? 'LUNAS / SUKSES' : rawStatus.toUpperCase(),
    items,
    itemCount: Number(t.item_count || t.itemCount || items.length || 1),
    created_at: t.created_at,
  };
}

export async function fetchTransactions(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/transactions?${queryParams}` : '/transactions';
    const res = await apiRequest(endpoint, { method: 'GET' });
    const rawList = Array.isArray(res) ? res : (res.data || res.transactions || []);
    return rawList.map(normalizeTransaction).filter(Boolean);
  } catch (err) {
    console.warn('fetchTransactions fallback:', err);
    return [];
  }
}

export async function fetchTransactionDetail(id) {
  try {
    const res = await apiRequest(`/transactions/${id}`, { method: 'GET' });
    const rawData = res.data || res.transaction || res;
    return normalizeTransaction(rawData);
  } catch (err) {
    console.error('fetchTransactionDetail error:', err);
    return null;
  }
}

export async function filterTransactions(criteria) {
  return fetchTransactions(criteria);
}

export function parseTrxDate(dateStr) {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function computeTransactionStats(transactions = []) {
  const list = Array.isArray(transactions) ? transactions : [];
  const totalRevenue = list.reduce((sum, t) => sum + (Number(t.total) || Number(t.total_amount) || 0), 0);
  const totalTransactions = list.length;
  const avgOrder = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const cashCount = list.filter((t) => (t.paymentMethod || t.payment_method || '').toLowerCase().includes('tunai') || (t.paymentMethod || '').toLowerCase().includes('cash')).length;
  const nonCashCount = totalTransactions - cashCount;

  return {
    totalRevenue,
    totalTransactions,
    cashCount,
    nonCashCount,
    dailyVolume: {
      label: 'VOLUME TRANSAKSI',
      value: totalTransactions,
      unit: 'Tiket',
      comparisonText: 'Sinkronisasi Live database',
    },
    dailyRevenue: {
      label: 'TOTAL OMZET',
      value: totalRevenue,
      formattedValue: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      subtitle: 'Net gross seluruh transaksi tercatat',
    },
    averageOrderValue: {
      label: 'RATA-RATA TIKET (AOV)',
      value: avgOrder,
      formattedValue: `Rp ${Math.round(avgOrder).toLocaleString('id-ID')}`,
      subtitle: 'Berdasarkan transaksi tercatat',
    },
  };
}

export function subscribeToTransactions(callback) {
  const interval = setInterval(async () => {
    try {
      const data = await fetchTransactions({ limit: 10 });
      if (callback) callback(data);
    } catch {
      // ignore
    }
  }, 15000);

  return () => clearInterval(interval);
}

export const transactionService = {
  getTransactions: fetchTransactions,
  getTransactionById: fetchTransactionDetail,
  filterTransactions,
  computeTransactionStats,
  parseTrxDate,
  subscribeToTransactions,
};

export default transactionService;
