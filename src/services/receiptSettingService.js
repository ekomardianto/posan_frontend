import { apiRequest } from './apiClient';

export async function fetchReceiptSettings(merchantId) {
  try {
    const res = await apiRequest('/settings/receipt', { method: 'GET' });
    return res.settings || res.data || res || {
      store_name: 'POSAN Coffee',
      header_title: 'POSAN Coffee',
      store_address: '',
      store_phone: '',
      header_subtitle: '',
      show_order_type: true,
      show_cashier_name: true,
      show_date_time: true,
      bank_info: 'BCA : 034-392-4680\nA.N POSAN Cafe',
      thank_you_message: 'Terimakasih Kak.',
      footer_note: 'Powered by POSAN POS',
      paper_size: '58mm',
    };
  } catch (err) {
    console.warn('fetchReceiptSettings fallback:', err);
    return {
      store_name: 'POSAN Coffee',
      header_title: 'POSAN Coffee',
      store_address: '',
      store_phone: '',
      header_subtitle: '',
      show_order_type: true,
      show_cashier_name: true,
      show_date_time: true,
      bank_info: 'BCA : 034-392-4680\nA.N POSAN Cafe',
      thank_you_message: 'Terimakasih Kak.',
      footer_note: 'Powered by POSAN POS',
      paper_size: '58mm',
    };
  }
}

export async function saveReceiptSettings(settingsData, merchantId) {
  const res = await apiRequest('/settings/receipt', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
  return res.settings || res.data || res;
}

export const updateReceiptSettings = saveReceiptSettings;

export async function resetReceiptSettings(merchantId) {
  const res = await apiRequest('/settings/receipt/reset', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return res.settings || res.data || res;
}

export const receiptSettingService = {
  getReceiptSettings: fetchReceiptSettings,
  updateReceiptSettings: saveReceiptSettings,
  saveReceiptSettings,
  resetReceiptSettings,
};

export default receiptSettingService;
