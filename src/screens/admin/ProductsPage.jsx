import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, X, FileUp } from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { fetchAllRecipes } from '../../services/inventoryService';
import ProductStats from '../../components/products/ProductStats';
import ProductFilters from '../../components/products/ProductFilters';
import ProductTable from '../../components/products/ProductTable';
import ProductDrawer from '../../components/products/ProductDrawer';
import ProductDeleteModal from '../../components/products/ProductDeleteModal';
import ProductImportModal from '../../components/products/ProductImportModal';
import ProductRecipeModal from '../../components/products/ProductRecipeModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Semua Kategori' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [recipeProduct, setRecipeProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load data from Express Backend (database) on mount
  const loadData = async (showSyncToast = false) => {
    if (showSyncToast) setIsSyncing(true);
    else setIsLoading(true);

    try {
      const [prodData, catData, recipeMap] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchAllRecipes(),
      ]);

      const enrichedProducts = (prodData || []).map((p) => {
        const key = p.rawId || p.id || p.name;
        const matchingRecipe = (recipeMap && (recipeMap[key] || recipeMap[p.name])) || [];
        return {
          ...p,
          recipe: matchingRecipe,
        };
      });

      setProducts(enrichedProducts);
      if (catData && catData.length > 0) {
        const catFilterList = [
          { id: 'all', name: 'Semua Kategori' },
          ...catData.map(c => ({ id: c.name, name: c.name, rawId: c.rawId || c.id }))
        ];
        setCategories(catFilterList);
      } else {
        setCategories([{ id: 'all', name: 'Semua Kategori' }]);
      }

      if (showSyncToast) {
        showToast('Sinkronisasi Sukses', 'Katalog produk dan resep telah disinkronkan dengan database.');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      showToast('Gagal Memuat Data', err.message || 'Tidak dapat terhubung ke backend POSAN.', 'error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query Filter (name & description)
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category Filter
      const matchCategory =
        selectedCategory === 'all' ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      // 3. Status Filter (Aktif / Nonaktif)
      const matchStatus =
        selectedStatus === 'all' ||
        p.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // Handler: Open Add Product Drawer
  const handleOpenAddDrawer = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  // Handler: Open Edit Product Drawer
  const handleOpenEditDrawer = (product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  // Handler: Save Product (Create or Update)
  const handleSaveProduct = async (productData) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        const targetId = editingProduct.rawId || editingProduct.id;
        const res = await updateProduct(targetId, productData);
        if (res?.success) {
          await loadData();
          showToast('Produk Diperbarui', `Menu "${productData.name}" berhasil diperbarui di database.`);
          setIsDrawerOpen(false);
          setEditingProduct(null);
        } else {
          showToast('Gagal Memperbarui', res?.error || 'Gagal memperbarui di database.', 'error');
        }
      } else {
        const res = await createProduct(productData);
        if (res?.success) {
          await loadData();
          showToast('Produk Ditambahkan', `Menu baru "${productData.name}" tersimpan di database.`);
          setIsDrawerOpen(false);
          setEditingProduct(null);
        } else {
          showToast('Gagal Menambahkan', res?.error || 'Gagal menyimpan ke database.', 'error');
        }
      }
    } catch (err) {
      showToast('Terjadi Kesalahan', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Toggle Product Status (Aktif <-> Nonaktif)
  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    const targetId = product.rawId || product.id;

    const res = await toggleProductStatus(targetId, newStatus);
    if (res?.success) {
      await loadData();
      showToast('Status Diperbarui', `Status "${product.name}" diubah menjadi ${newStatus}.`);
    } else {
      showToast('Gagal Mengubah Status', res?.error || 'Gagal mengubah status di database.', 'error');
    }
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = async (productId) => {
    const target = products.find((p) => p.id === productId);
    const targetId = target?.rawId || productId;

    setIsLoading(true);
    try {
      const res = await deleteProduct(targetId);
      if (res?.success) {
        await loadData();
        showToast('Produk Dihapus', `Menu "${target?.name || ''}" telah dihapus dari database.`);
      } else {
        showToast('Gagal Menghapus', res?.error || 'Gagal menghapus produk dari database.', 'error');
      }
    } catch (err) {
      showToast('Gagal Menghapus', err.message, 'error');
    } finally {
      setIsLoading(false);
      setDeletingProduct(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  return (
    <main className="products-page-container" role="main">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type === 'error' ? 'toast-error' : ''}`} role="status" aria-live="polite" style={toastMessage.type === 'error' ? { background: '#450A0A', borderColor: '#991B1B' } : undefined}>
          <div className="toast-icon-wrapper" style={toastMessage.type === 'error' ? { background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' } : undefined}>
            {toastMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="toast-content">
            <span className="toast-title" style={toastMessage.type === 'error' ? { color: '#FCA5A5' } : undefined}>{toastMessage.title}</span>
            <span className="toast-message" style={toastMessage.type === 'error' ? { color: '#FECACA' } : undefined}>{toastMessage.message}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Page Header Card */}
      <section className="products-header-card animate-fade-in" aria-label="Header Katalog Produk">
        <div className="products-header-left">
          <div className="products-breadcrumb-overline">
            <span>Beranda</span>
            <ChevronRight size={12} />
            <span>Produk</span>
            <span>&middot;</span>
            <span>KATALOG MENU &bull; POSAN Backend Live Sync</span>
          </div>
          <h1 className="products-page-title">Katalog Menu &amp; Produk</h1>
          <p className="products-page-subtitle">
            Kelola daftar menu minuman dan makanan kafe Anda yang tersinkronisasi langsung dengan database.
          </p>
        </div>

        <div className="products-header-actions">
          <button
            type="button"
            className="btn-export-csv"
            onClick={() => loadData(true)}
            disabled={isSyncing}
            title="Sinkronkan dengan database"
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi'}</span>
          </button>

          <button
            type="button"
            className="btn-export-csv"
            onClick={() => setIsImportModalOpen(true)}
            title="Import Katalog Produk Massal dari File Excel / CSV (.xlsx, .csv)"
          >
            <FileUp size={15} color="#3B82F6" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            className="btn-add-product"
            onClick={handleOpenAddDrawer}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </section>

      {/* 2. Key Metric Stat Cards */}
      <ProductStats products={products} />

      {/* 3. Filter and Search Toolbar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onReset={handleResetFilters}
        onApply={() => {}}
        categories={categories}
      />

      {/* 4. Products Table */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        onEditProduct={handleOpenEditDrawer}
        onToggleStatus={handleToggleStatus}
        onDeleteProduct={(product) => setDeletingProduct(product)}
        onManageRecipe={(product) => setRecipeProduct(product)}
      />

      {/* 5. Add / Edit Slide-Over Drawer */}
      <ProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        categories={categories}
        isSaving={isSaving}
      />

      {/* 6. Delete Confirmation Modal */}
      {deletingProduct && (
        <ProductDeleteModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* 7. Import Excel / CSV Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(count) => {
          loadData(true);
          showToast('Import Berhasil', `${count} produk baru berhasil diimpor dan disimpan ke database.`);
        }}
        categories={categories}
      />

      {/* 8. Manage Recipe (BOM) Modal */}
      {recipeProduct && (
        <ProductRecipeModal
          isOpen={Boolean(recipeProduct)}
          onClose={() => setRecipeProduct(null)}
          product={recipeProduct}
          onRecipeSaved={() => {
            loadData(false);
            showToast('Resep Disimpan', `Komposisi resep menu "${recipeProduct?.name}" berhasil diperbarui.`);
          }}
        />
      )}
    </main>
  );
}

