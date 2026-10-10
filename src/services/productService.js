import { apiRequest } from './apiClient';

function mapProductRow(row) {
  if (!row) return null;
  const priceNum = Number(row.price) || 0;
  const formattedPrice = `Rp ${priceNum.toLocaleString('id-ID')}`;
  const dateObj = row.created_at ? new Date(row.created_at) : new Date();
  const timeFormatted = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    id: row.id,
    rawId: row.id,
    name: row.name || 'Produk Tanpa Nama',
    category: row.category_name || row.category || 'Umum',
    category_id: row.category_id,
    price: priceNum,
    formattedPrice,
    status: row.is_active === false ? 'Nonaktif' : 'Aktif',
    is_active: row.is_active !== false,
    description: row.description || '',
    station: row.station || 'barista',
    imageUrl: row.image_url || row.image || '',
    updatedAt: timeFormatted,
    merchant_id: row.merchant_id,
  };
}

export async function fetchProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/products?${queryParams}` : '/products';
    const res = await apiRequest(endpoint, { method: 'GET' });
    const rawList = Array.isArray(res) ? res : (res.data || res.products || []);
    return rawList.map(mapProductRow);
  } catch (err) {
    console.warn('fetchProducts error:', err);
    return [];
  }
}

export async function createProduct(productData) {
  try {
    const res = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return { success: true, data: mapProductRow(res) };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal menambahkan produk.' };
  }
}

export async function updateProduct(id, productData) {
  try {
    const res = await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return { success: true, data: mapProductRow(res) };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal memperbarui produk.' };
  }
}

export async function deleteProduct(id) {
  try {
    const res = await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
    return { success: true, data: res };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal menghapus produk.' };
  }
}

export async function toggleProductStatus(id, newStatus) {
  try {
    const isActive = newStatus === 'Aktif' || newStatus === true;
    const res = await apiRequest(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
    return { success: true, data: mapProductRow(res) };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal mengubah status produk.' };
  }
}

export async function uploadProductImage(file) {
  if (!file) return '';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const productService = {
  getProducts: fetchProducts,
  getProductById: async (id) => {
    const res = await apiRequest(`/products/${id}`, { method: 'GET' });
    return mapProductRow(res);
  },
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  uploadProductImage,
};

export default productService;
