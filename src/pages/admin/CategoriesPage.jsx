import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/categoryService';
import CategoryStats from '../../components/categories/CategoryStats';
import CategoryFilters from '../../components/categories/CategoryFilters';
import CategoryTable from '../../components/categories/CategoryTable';
import CategoryForm from '../../components/categories/CategoryForm';
import CategoryFooterCards from '../../components/categories/CategoryFooterCards';
import CategoryDeleteModal from '../../components/categories/CategoryDeleteModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');

  // Page View Mode: 'list' | 'form'
  const [viewMode, setViewMode] = useState('list');
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadCategories = async (showSyncToast = false) => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data || []);
      if (showSyncToast) {
        showToast('Sinkronisasi Sukses', 'Data kategori telah diperbarui dari database PostgreSQL.');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      showToast('Gagal Memuat Data', err.message || 'Tidak dapat memuat data kategori dari backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTab =
        activeTab === 'all' || c.status.toLowerCase() === activeTab.toLowerCase();

      const matchStation =
        stationFilter === 'all' || (c.station || 'barista').toLowerCase() === stationFilter.toLowerCase();

      return matchSearch && matchTab && matchStation;
    });
  }, [categories, searchQuery, activeTab, stationFilter]);

  const counts = {
    all: categories.length,
    active: categories.filter((c) => c.status === 'Aktif').length,
    inactive: categories.filter((c) => c.status === 'Nonaktif').length
  };

  // Handlers
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setViewMode('form');
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setViewMode('form');
  };

  const handleSaveCategory = async (payload) => {
    setIsSaving(true);
    try {
      if (editingCategory) {
        const targetId = editingCategory.rawId || editingCategory.id;
        const res = await updateCategory(targetId, payload);
        if (res?.success) {
          await loadCategories();
          showToast('Pembaruan Sukses', `Kategori "${payload.name}" berhasil diperbarui di database PostgreSQL.`);
          setViewMode('list');
          setEditingCategory(null);
        } else {
          showToast('Gagal Memperbarui', res?.error || 'Gagal memperbarui kategori.', 'error');
        }
      } else {
        const res = await createCategory(payload);
        if (res?.success) {
          await loadCategories();
          showToast('Penambahan Sukses', `Kategori baru "${payload.name}" tersimpan di database PostgreSQL.`);
          setViewMode('list');
          setEditingCategory(null);
        } else {
          showToast('Gagal Menambahkan', res?.error || 'Gagal menyimpan kategori.', 'error');
        }
      }
    } catch (err) {
      showToast('Terjadi Kesalahan', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = (category) => {
    const nextStatus = category.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id
          ? {
              ...c,
              status: nextStatus,
              updatedAt: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
            }
          : c
      )
    );
    showToast('Status Diperbarui', `Status kategori "${category.name}" diubah menjadi ${nextStatus}.`);
  };

  const handleConfirmDelete = async (categoryId) => {
    const target = categories.find((c) => c.id === categoryId);
    const targetId = target?.rawId || categoryId;

    setIsLoading(true);
    try {
      const res = await deleteCategory(targetId);
      if (res?.success) {
        await loadCategories();
        showToast('Kategori Dihapus', `Kategori "${target ? target.name : ''}" telah dihapus dari database PostgreSQL.`);
      } else {
        showToast('Gagal Menghapus', res?.error || 'Gagal menghapus kategori dari database.', 'error');
      }
    } catch (err) {
      showToast('Gagal Menghapus', err.message, 'error');
    } finally {
      setIsLoading(false);
      setDeletingCategory(null);
    }
  };

  const handleExportCSV = () => {
    const csvHeader = 'ID,Nama Kategori,Deskripsi,Jumlah Produk,Status,Terakhir Diperbarui\n';
    const csvRows = categories
      .map((c) => `"${c.id}","${c.name}","${c.description}","${c.productCount}","${c.status}","${c.updatedAt}"`)
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kategori_menu_posan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor CSV', 'Data kategori menu berhasil diekspor.');
  };

  return (
    <main className="categories-page-container" role="main">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type === 'error' ? 'toast-error' : ''}`} role="alert" style={toastMessage.type === 'error' ? { background: '#450A0A', borderColor: '#991B1B' } : undefined}>
          <div className="toast-icon-wrapper" style={toastMessage.type === 'error' ? { background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' } : undefined}>
            {toastMessage.type === 'error' ? <AlertCircle size={18} strokeWidth={2.5} /> : <CheckCircle2 size={18} strokeWidth={2.5} />}
          </div>
          <div className="toast-content">
            <span className="toast-title" style={toastMessage.type === 'error' ? { color: '#FCA5A5' } : undefined}>{toastMessage.title}</span>
            <span className="toast-message" style={toastMessage.type === 'error' ? { color: '#FECACA' } : undefined}>{toastMessage.message}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup Notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {viewMode === 'form' ? (
        /* Form View (Tambah / Edit Kategori) */
        <CategoryForm
          initialCategory={editingCategory}
          registeredCategories={categories.filter((c) => !editingCategory || c.id !== editingCategory.id)}
          isSaving={isSaving}
          onBack={() => {
            setViewMode('list');
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      ) : (
        /* List View (Table & Overview) */
        <>
          {/* 1. Header Card */}
          <section className="categories-header-card animate-fade-in" aria-label="Header Manajemen Kategori">
            <div className="categories-header-left">
              <div className="categories-overline">
                <span>MANAJEMEN MENU</span>
                <span>&middot;</span>
                <span>POSAN Backend Live Sync</span>
              </div>
              <h1 className="categories-page-title">Kategori</h1>
              <p className="categories-page-subtitle">
                Kelola kategori menu café dan struktur katalog pemesanan terpusat di database PostgreSQL.
              </p>
            </div>

            <button
              type="button"
              className="btn-add-category"
              onClick={handleOpenAdd}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Kategori</span>
            </button>
          </section>

          {/* 2. Stat KPI Cards */}
          <CategoryStats categories={categories} />

          {/* 3. Filter & Search Toolbar */}
          <CategoryFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
            stationFilter={stationFilter}
            onStationFilterChange={setStationFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={() => loadCategories(true)}
            onExport={handleExportCSV}
          />

          {/* 4. Category Table */}
          <CategoryTable
            categories={filteredCategories}
            isLoading={isLoading}
            onEditCategory={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onDeleteCategory={(cat) => setDeletingCategory(cat)}
          />

          {/* 5. Bottom Informational Cards */}
          <CategoryFooterCards />
        </>
      )}

      {/* Delete Modal */}
      {deletingCategory && (
        <CategoryDeleteModal
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </main>
  );
}
