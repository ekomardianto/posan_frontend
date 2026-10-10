import { apiRequest } from './apiClient';

function mapCategoryRow(row) {
  if (!row) return null;
  const nameLower = (row.name || '').toLowerCase();
  let iconType = 'other';
  if (nameLower.includes('kopi') || nameLower.includes('coffee') || nameLower.includes('espresso')) {
    iconType = 'coffee';
  } else if (nameLower.includes('minum') || nameLower.includes('tea') || nameLower.includes('soda') || nameLower.includes('juice') || nameLower.includes('latte')) {
    iconType = 'beverage';
  } else if (nameLower.includes('makan') || nameLower.includes('food') || nameLower.includes('mie') || nameLower.includes('nasi') || nameLower.includes('pasta')) {
    iconType = 'food';
  } else if (nameLower.includes('snack') || nameLower.includes('dessert') || nameLower.includes('kue') || nameLower.includes('pastry') || nameLower.includes('roti') || nameLower.includes('bakery')) {
    iconType = 'dessert';
  }

  const dateObj = row.created_at ? new Date(row.created_at) : new Date();
  const timeFormatted = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const resolvedStation = row.station !== undefined && row.station !== null
    ? row.station
    : (iconType === 'food' || iconType === 'dessert' ? 'kitchen' : 'barista');

  return {
    id: row.id,
    rawId: row.id,
    name: row.name || 'Kategori Tanpa Nama',
    description: row.description || 'Tidak ada deskripsi',
    station: resolvedStation,
    status: row.is_active === false ? 'Nonaktif' : 'Aktif',
    productCount: Number(row.product_count) || 0,
    iconType,
    updatedAt: timeFormatted,
    merchant_id: row.merchant_id,
  };
}

export async function fetchCategories(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/categories?${queryParams}` : '/categories';
    const res = await apiRequest(endpoint, { method: 'GET' });
    const rawList = Array.isArray(res) ? res : (res.data || res.categories || []);
    return rawList.map(mapCategoryRow);
  } catch (err) {
    console.warn('fetchCategories error:', err);
    return [];
  }
}

export async function createCategory(categoryData) {
  try {
    const payload = {
      name: categoryData.name,
      description: categoryData.description || null,
      station: categoryData.station !== undefined ? categoryData.station : 'barista',
    };
    const res = await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, data: mapCategoryRow(res) };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal menambahkan kategori.' };
  }
}

export async function updateCategory(id, categoryData) {
  try {
    const payload = {
      name: categoryData.name,
      description: categoryData.description || null,
      station: categoryData.station !== undefined ? categoryData.station : 'barista',
    };
    const res = await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { success: true, data: mapCategoryRow(res) };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal memperbarui kategori.' };
  }
}

export async function deleteCategory(id) {
  try {
    const res = await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
    return { success: true, data: res };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal menghapus kategori.' };
  }
}

export const categoryService = {
  getCategories: fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
