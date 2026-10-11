import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Utensils,
  FolderTree,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  Tag,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Coffee,
  PackageX
} from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

export default function Products() {
  const { role } = useAuth();
  const canManageProducts = role === 'admin';
  const isSuperAdmin = role === 'super_admin';

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals for Product
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isToggleProductConfirmOpen, setIsToggleProductConfirmOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Modals for Category
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category_id: '',
    description: '',
    is_active: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    station: 'barista',
  });

  // Load live data from PostgreSQL
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading products/categories:', err);
      setErrorMessage(err.message || 'Gagal memuat data dari database PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        categoryFilter === 'ALL' || String(p.category_id) === String(categoryFilter);

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.is_active !== false) ||
        (statusFilter === 'INACTIVE' && p.is_active === false);

      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      return (
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [categories, searchQuery]);

  // Handlers Product
  const handleOpenAddProduct = () => {
    setErrorMessage('');
    setProductForm({
      name: '',
      price: '',
      category_id: categories[0]?.id || '',
      description: '',
      is_active: true,
    });
    setIsAddProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price,
      category_id: prod.category_id || '',
      description: prod.description || '',
      is_active: prod.is_active !== false,
    });
    setIsEditProductModalOpen(true);
  };

  const handleAddProductSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await productService.createProduct(productForm);
      setIsAddProductModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan produk baru.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProductSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedProduct || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await productService.updateProduct(selectedProduct.id, productForm);
      setIsEditProductModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleProductStatus = async () => {
    if (!selectedProduct || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await productService.toggleProductStatus(selectedProduct.id, selectedProduct.is_active !== false);
      setIsToggleProductConfirmOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah status produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProductSubmit = async () => {
    if (!selectedProduct || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await productService.deleteProduct(selectedProduct.id);
      setIsDeleteProductModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus produk.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers Category
  const handleOpenAddCategory = () => {
    setErrorMessage('');
    setCategoryForm({ name: '', description: '', station: 'barista' });
    setIsAddCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '', station: cat.station || 'barista' });
    setIsEditCategoryModalOpen(true);
  };

  const handleAddCategorySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!categoryForm.name.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await categoryService.createCategory(categoryForm);
      setIsAddCategoryModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategorySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCategory || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await categoryService.updateCategory(selectedCategory.id, categoryForm);
      setIsEditCategoryModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategorySubmit = async () => {
    if (!selectedCategory || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await categoryService.deleteCategory(selectedCategory.id);
      setIsDeleteCategoryModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  // Columns for Products
  const productColumns = useMemo(() => {
    const cols = [
      {
        key: 'no',
        title: 'No',
        width: '50px',
        align: 'center',
        render: (_, __, idx) => (
          <span className="font-medium text-slate-400">
            {(currentPage - 1) * itemsPerPage + idx + 1}
          </span>
        ),
      },
      {
        key: 'name',
        title: 'Nama Produk / Menu',
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                {row.name}
              </p>
              <p className="text-[11px] text-slate-400">{row.station === 'kitchen' ? '🍳 Kitchen (Makanan)' : '☕ Barista (Minuman)'}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'category_name',
        title: 'Kategori',
        render: (val) => (
          <span className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{val || 'Tanpa Kategori'}</span>
          </span>
        ),
      },
      {
        key: 'price',
        title: 'Harga Jual',
        render: (val) => (
          <span className="font-mono font-bold text-xs text-slate-900">
            Rp {Number(val).toLocaleString('id-ID')}
          </span>
        ),
      },
      {
        key: 'status',
        title: 'Status Menu',
        render: (_, row) => <Badge status={row.is_active !== false ? 'Active' : 'Inactive'} />,
      },
    ];

    if (canManageProducts) {
      cols.push({
        key: 'actions',
        title: 'Action',
        align: 'right',
        render: (_, row) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="icon"
              size="sm"
              onClick={(e) => handleOpenEditProduct(row, e)}
              title="Edit Produk"
            >
              <Edit2 className="w-4 h-4 text-amber-600 hover:text-amber-700" />
            </Button>

            <Button
              variant="icon"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setErrorMessage('');
                setSelectedProduct(row);
                setIsToggleProductConfirmOpen(true);
              }}
              title={row.is_active !== false ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
            >
              <Power
                className={`w-4 h-4 ${
                  row.is_active !== false
                    ? 'text-emerald-600 hover:text-rose-600'
                    : 'text-slate-400 hover:text-emerald-600'
                }`}
              />
            </Button>

            <Button
              variant="icon"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setErrorMessage('');
                setSelectedProduct(row);
                setIsDeleteProductModalOpen(true);
              }}
              title="Hapus Produk"
            >
              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
            </Button>
          </div>
        ),
      });
    }

    return cols;
  }, [currentPage, itemsPerPage, canManageProducts]);

  // Columns for Categories
  const categoryColumns = useMemo(() => {
    const cols = [
      {
        key: 'id',
        title: 'ID',
        width: '60px',
        align: 'center',
        render: (val) => <span className="font-mono text-xs text-slate-400">#{val}</span>,
      },
      {
        key: 'name',
        title: 'Nama Kategori',
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {row.name}
              </p>
              <p className="text-[11px] text-slate-400">{row.description || '-'}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'station',
        title: 'Stasiun Dapur',
        render: (_, row) => {
          const s = (row.station || 'barista').toLowerCase();
          if (s === 'kitchen') {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                <Utensils className="w-3 h-3 text-amber-600" />
                <span>Kitchen (Dapur)</span>
              </span>
            );
          }
          if (s === 'none') {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                <PackageX className="w-3 h-3 text-slate-500" />
                <span>Tidak Masuk Dapur</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
              <Coffee className="w-3 h-3 text-orange-600" />
              <span>Barista</span>
            </span>
          );
        },
      },
      {
        key: 'product_count',
        title: 'Jumlah Produk',
        render: (val) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
            <Utensils className="w-3 h-3 text-emerald-600" />
            <span>{val || 0} Menu Terdaftar</span>
          </span>
        ),
      },
    ];

    if (canManageProducts) {
      cols.push({
        key: 'actions',
        title: 'Action',
        align: 'right',
        render: (_, row) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="icon"
              size="sm"
              onClick={(e) => handleOpenEditCategory(row, e)}
              title="Edit Kategori"
            >
              <Edit2 className="w-4 h-4 text-blue-600 hover:text-blue-700" />
            </Button>

            <Button
              variant="icon"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setErrorMessage('');
                setSelectedCategory(row);
                setIsDeleteCategoryModalOpen(true);
              }}
              title="Hapus Kategori"
            >
              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
            </Button>
          </div>
        ),
      });
    }

    return cols;
  }, [canManageProducts]);

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Katalog Produk & Kategori
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola menu kopi, makanan, minuman, dan stasiun pengerjaan di database PostgreSQL <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">posan_db</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadData}
            title="Muat ulang data"
          >
            {loading ? 'Menyinkronkan...' : 'Refresh'}
          </Button>

          {canManageProducts && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={activeTab === 'products' ? handleOpenAddProduct : handleOpenAddCategory}
            >
              {activeTab === 'products' ? 'Tambah Produk / Menu' : 'Tambah Kategori'}
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-1.5 shadow-sm flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('products');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Daftar Menu & Produk ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('categories');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Kategori Menu ({categories.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-80">
          <Input
            placeholder={
              activeTab === 'products'
                ? 'Cari nama produk, kategori...'
                : 'Cari nama kategori...'
            }
            icon={Search}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters for Products */}
        {activeTab === 'products' && (
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
              className="w-44 text-xs"
            />

            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'ACTIVE', label: 'Active (Tersedia)' },
                { value: 'INACTIVE', label: 'Inactive (Habis / Nonaktif)' },
              ]}
              className="w-36 text-xs"
            />
          </div>
        )}
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">Mengambil data dari database PostgreSQL...</p>
        </div>
      ) : activeTab === 'products' ? (
        <Table
          columns={productColumns}
          data={paginatedProducts}
          keyField="id"
          emptyMessage="Tidak ada produk ditemukan di database PostgreSQL."
          emptySubtext="Klik tombol Tambah Produk untuk menambahkan menu baru."
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredProducts.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />
      ) : (
        <Table
          columns={categoryColumns}
          data={filteredCategories}
          keyField="id"
          emptyMessage="Tidak ada kategori ditemukan di database PostgreSQL."
          emptySubtext="Klik tombol Tambah Kategori untuk menambahkan kategori menu baru."
        />
      )}

      {/* Modal: Tambah Produk */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => !submitting && setIsAddProductModalOpen(false)}
        title="Tambah Produk / Menu Baru"
        description="Simpan data produk baru ke katalog menu database PostgreSQL posan_db."
        icon={Utensils}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsAddProductModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleAddProductSubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddProductSubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nama Produk / Menu"
            required
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            placeholder="Contoh: Espresso Romano"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Harga Jual (Rp)"
              type="number"
              required
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              placeholder="Contoh: 28000"
            />

            <Select
              label="Kategori Menu"
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          </div>

          <Input
            label="Foto Menu (URL Gambar)"
            value={productForm.image_url}
            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
            placeholder="https://images.unsplash.com/... atau tautan foto menu"
          />
          {productForm.image_url && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <img src={productForm.image_url} alt="Pratinjau" className="w-12 h-12 rounded-lg object-cover border" />
              <span className="text-xs text-slate-600 font-medium">Pratinjau Foto Menu Terpilih</span>
            </div>
          )}

          <Select
            label="Status Ketersediaan"
            value={productForm.is_active ? 'Active' : 'Inactive'}
            onChange={(e) =>
              setProductForm({ ...productForm, is_active: e.target.value === 'Active' })
            }
            options={[
              { value: 'Active', label: 'Active (Tersedia untuk Dipesan)' },
              { value: 'Inactive', label: 'Inactive (Stok Habis / Nonaktif)' },
            ]}
          />
        </form>
      </Modal>

      {/* Modal: Edit Produk */}
      <Modal
        isOpen={isEditProductModalOpen}
        onClose={() => !submitting && setIsEditProductModalOpen(false)}
        title={`Edit Produk - ${selectedProduct?.name}`}
        description="Perbarui informasi harga, kategori, atau status produk di database."
        icon={Edit2}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsEditProductModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleEditProductSubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditProductSubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nama Produk / Menu"
            required
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Harga Jual (Rp)"
              type="number"
              required
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            />

            <Select
              label="Kategori Menu"
              value={productForm.category_id}
              onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          </div>

          <Input
            label="Foto Menu (URL Gambar)"
            value={productForm.image_url}
            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
            placeholder="https://images.unsplash.com/... atau tautan foto menu"
          />
          {productForm.image_url && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <img src={productForm.image_url} alt="Pratinjau" className="w-12 h-12 rounded-lg object-cover border" />
              <span className="text-xs text-slate-600 font-medium">Pratinjau Foto Menu Terpilih</span>
            </div>
          )}

          <Select
            label="Status Ketersediaan"
            value={productForm.is_active ? 'Active' : 'Inactive'}
            onChange={(e) =>
              setProductForm({ ...productForm, is_active: e.target.value === 'Active' })
            }
            options={[
              { value: 'Active', label: 'Active (Tersedia untuk Dipesan)' },
              { value: 'Inactive', label: 'Inactive (Stok Habis / Nonaktif)' },
            ]}
          />
        </form>
      </Modal>

      {/* Modal: Toggle Product Status */}
      <Modal
        isOpen={isToggleProductConfirmOpen}
        onClose={() => !submitting && setIsToggleProductConfirmOpen(false)}
        title={
          selectedProduct?.is_active !== false
            ? 'Nonaktifkan Produk Ini?'
            : 'Aktifkan Kembali Produk Ini?'
        }
        description={`Konfirmasi perubahan ketersediaan menu "${selectedProduct?.name}".`}
        icon={Power}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsToggleProductConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant={selectedProduct?.is_active !== false ? 'danger' : 'success'}
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleToggleProductStatus}
            >
              {submitting
                ? 'Memproses...'
                : selectedProduct?.is_active !== false
                ? 'Ya, Nonaktifkan'
                : 'Ya, Aktifkan'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          {selectedProduct?.is_active !== false
            ? 'Produk yang dinonaktifkan tidak akan muncul pada menu checkout kasir.'
            : 'Produk akan segera kembali tersedia dan dapat dipesan oleh kasir.'}
        </p>
      </Modal>

      {/* Modal: Delete Product */}
      <Modal
        isOpen={isDeleteProductModalOpen}
        onClose={() => !submitting && setIsDeleteProductModalOpen(false)}
        title="Hapus Produk dari Database?"
        description={`Produk "${selectedProduct?.name}" akan dihapus permanen dari PostgreSQL.`}
        icon={Trash2}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsDeleteProductModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleDeleteProductSubmit}
            >
              {submitting ? 'Menghapus...' : 'Ya, Hapus Produk'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Jika produk ini sudah pernah tercatat dalam transaksi penjualan terdahulu, database akan menolak penghapusan untuk melindungi laporan riwayat transaksi. Dalam hal itu, Anda dapat menonaktifkan status produk.
        </p>
      </Modal>

      {/* Modal: Tambah Kategori */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => !submitting && setIsAddCategoryModalOpen(false)}
        title="Tambah Kategori Menu Baru"
        description="Daftarkan kelompok kategori baru ke database PostgreSQL."
        icon={FolderTree}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsAddCategoryModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleAddCategorySubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Kategori'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCategorySubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nama Kategori"
            required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Contoh: Artisan Tea & Mocktail"
          />

          <Select
            label="Alur Masuk Dapur / Stasiun Pembuatan"
            value={categoryForm.station || 'barista'}
            onChange={(e) => setCategoryForm({ ...categoryForm, station: e.target.value })}
            options={[
              { value: 'barista', label: '☕ Barista (Minuman, Kopi & Racikan Bar)' },
              { value: 'kitchen', label: '🍳 Kitchen (Dapur, Makanan & Pastry)' },
              { value: 'none', label: '🚫 Tidak Masuk Dapur (Kasir Langsung / Retail)' },
            ]}
          />

          <Input
            label="Deskripsi Kategori"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            placeholder="Keterangan jenis menu..."
          />
        </form>
      </Modal>

      {/* Modal: Edit Kategori */}
      <Modal
        isOpen={isEditCategoryModalOpen}
        onClose={() => !submitting && setIsEditCategoryModalOpen(false)}
        title={`Edit Kategori - ${selectedCategory?.name}`}
        description="Perbarui nama atau deskripsi kategori di database PostgreSQL."
        icon={Edit2}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsEditCategoryModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleEditCategorySubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditCategorySubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nama Kategori"
            required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          />

          <Select
            label="Alur Masuk Dapur / Stasiun Pembuatan"
            value={categoryForm.station || 'barista'}
            onChange={(e) => setCategoryForm({ ...categoryForm, station: e.target.value })}
            options={[
              { value: 'barista', label: '☕ Barista (Minuman, Kopi & Racikan Bar)' },
              { value: 'kitchen', label: '🍳 Kitchen (Dapur, Makanan & Pastry)' },
              { value: 'none', label: '🚫 Tidak Masuk Dapur (Kasir Langsung / Retail)' },
            ]}
          />

          <Input
            label="Deskripsi Kategori"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Modal: Delete Kategori */}
      <Modal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => !submitting && setIsDeleteCategoryModalOpen(false)}
        title="Hapus Kategori Menu?"
        description={`Kategori "${selectedCategory?.name}" akan dihapus dari database.`}
        icon={Trash2}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsDeleteCategoryModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleDeleteCategorySubmit}
            >
              {submitting ? 'Menghapus...' : 'Ya, Hapus Kategori'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Kategori yang masih memiliki produk di dalamnya tidak dapat dihapus demi menjaga relasi database. Pastikan seluruh produk telah dipindahkan atau dihapus terlebih dahulu.
        </p>
      </Modal>
    </div>
  );
}
