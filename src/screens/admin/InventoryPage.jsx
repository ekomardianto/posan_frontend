import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  ClipboardCheck,
  History,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  fetchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  restockIngredient,
  fetchStockOpnames,
  submitStockOpname,
  fetchStockMutations,
} from '../../services/inventoryService';
import InventoryStats from '../../components/inventory/InventoryStats';
import IngredientTable from '../../components/inventory/IngredientTable';
import IngredientDrawer from '../../components/inventory/IngredientDrawer';
import RestockModal from '../../components/inventory/RestockModal';
import StockOpnameView from '../../components/inventory/StockOpnameView';
import StockMutationTable from '../../components/inventory/StockMutationTable';
import { useAlert } from '../../context/AlertContext';

export default function InventoryPage() {
  const alert = useAlert();

  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'opname' | 'mutasi'
  const [ingredients, setIngredients] = useState([]);
  const [opnameSessions, setOpnameSessions] = useState([]);
  const [mutations, setMutations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [restockingIngredient, setRestockingIngredient] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load all data
  const loadData = async (showSyncToast = false) => {
    if (showSyncToast) setIsSyncing(true);
    else setIsLoading(true);

    try {
      const [ings, opns, muts] = await Promise.all([
        fetchIngredients(),
        fetchStockOpnames(),
        fetchStockMutations(),
      ]);

      setIngredients(ings || []);
      setOpnameSessions(opns || []);
      setMutations(muts || []);

      if (showSyncToast) {
        showToast('Sinkronisasi Sukses', 'Data inventori, bahan baku, dan riwayat beban telah disinkronkan.');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      showToast('Gagal Memuat Data', err.message || 'Gagal memuat inventori.', 'error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Ingredients
  const handleOpenAddDrawer = () => {
    setEditingIngredient(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item) => {
    setEditingIngredient(item);
    setIsDrawerOpen(true);
  };

  const handleSaveIngredient = async (formData) => {
    setIsSaving(true);
    try {
      if (editingIngredient) {
        const res = await updateIngredient(editingIngredient.id, formData);
        if (res.success) {
          await loadData();
          showToast('Bahan Diperbarui', `Bahan baku "${formData.name}" berhasil diperbarui.`);
          setIsDrawerOpen(false);
          setEditingIngredient(null);
        } else {
          showToast('Gagal Menyimpan', res.error, 'error');
        }
      } else {
        const res = await createIngredient(formData);
        if (res.success) {
          await loadData();
          showToast('Bahan Ditambahkan', `Bahan baku "${formData.name}" berhasil didaftarkan ke inventori.`);
          setIsDrawerOpen(false);
        } else {
          showToast('Gagal Mendaftarkan', res.error, 'error');
        }
      }
    } catch (err) {
      showToast('Terjadi Kesalahan', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIngredient = async (item) => {
    const confirmed = await alert.confirm({
      title: 'Hapus Bahan Baku?',
      message: `Apakah Anda yakin ingin menghapus bahan baku "${item.name}"? Produk yang menggunakan bahan ini mungkin terpengaruh.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await deleteIngredient(item.id);
      if (res.success) {
        await loadData();
        showToast('Bahan Dihapus', `Bahan baku "${item.name}" berhasil dihapus.`);
      }
    } catch (err) {
      showToast('Gagal Menghapus', err.message, 'error');
    }
  };

  // Restock Handler
  const handleConfirmRestock = async (restockPayload) => {
    setIsSaving(true);
    try {
      const res = await restockIngredient(restockPayload.ingredientId, restockPayload);
      if (res.success) {
        await loadData();
        showToast('Restock Berhasil', `Stok ${restockingIngredient.name} berhasil ditambahkan.`);
        setRestockingIngredient(null);
      } else {
        showToast('Gagal Restock', res.error, 'error');
      }
    } catch (err) {
      showToast('Gagal Restock', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Stock Opname
  const handleSubmitOpname = async (opnamePayload) => {
    setIsSaving(true);
    try {
      const res = await submitStockOpname(opnamePayload);
      if (res.success) {
        await loadData();
        showToast(
          'Stock Opname Disimpan',
          `Sesi ${res.data.code} berhasil dicatat dan stok sistem telah disesuaikan.`
        );
      } else {
        showToast('Gagal Menyimpan Opname', res.error, 'error');
      }
    } catch (err) {
      showToast('Terjadi Kesalahan', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Low stock count for alert badge
  const lowStockCount = ingredients.filter(i => i.status === 'Menipis' || i.status === 'Habis').length;

  return (
    <main className="inventory-page-container" role="main">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`toast-notification ${toastMessage.type === 'error' ? 'toast-error' : ''}`}
          role="status"
          style={toastMessage.type === 'error' ? { background: '#450A0A', borderColor: '#991B1B' } : undefined}
        >
          <div
            className="toast-icon-wrapper"
            style={toastMessage.type === 'error' ? { background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' } : undefined}
          >
            {toastMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="toast-content">
            <span className="toast-title" style={toastMessage.type === 'error' ? { color: '#FCA5A5' } : undefined}>
              {toastMessage.title}
            </span>
            <span className="toast-message" style={toastMessage.type === 'error' ? { color: '#FECACA' } : undefined}>
              {toastMessage.message}
            </span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Page Header Card */}
      <section className="inventory-header-card animate-fade-in" aria-label="Header Inventori">
        <div className="inventory-header-left">
          <div className="inventory-breadcrumb">
            <span>Beranda</span>
            <ChevronRight size={12} />
            <span>Inventori &amp; Bahan Baku</span>
            <span>&bull;</span>
            <span>Toleransi Minimum Stock &amp; Beban Opname</span>
          </div>
          <h1 className="inventory-page-title">Inventori Bahan &amp; Stock Opname</h1>
          <p className="inventory-page-subtitle">
            Kelola persediaan bahan baku produk kafe, pantau batas toleransi minimum stok, dan catat beban kerugian selisih stock opname.
          </p>
        </div>

        <div className="inventory-header-actions">
          <button
            type="button"
            className="btn-export-csv"
            onClick={() => loadData(true)}
            disabled={isSyncing}
            title="Sinkronkan data persediaan"
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi'}</span>
          </button>

          <button
            type="button"
            className="btn-add-product"
            onClick={handleOpenAddDrawer}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Bahan Baku</span>
          </button>
        </div>
      </section>

      {/* 2. Key Metric Stat Cards */}
      <InventoryStats ingredients={ingredients} opnames={opnameSessions} />

      {/* 3. Tab Navigation Bar */}
      <div className="inventory-tabs-container animate-fade-in">
        <button
          type="button"
          className={`inventory-tab-btn ${activeTab === 'katalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('katalog')}
        >
          <Package size={16} />
          <span>Katalog Bahan &amp; Stok</span>
          {lowStockCount > 0 && (
            <span className="inventory-tab-badge badge-alert">
              {lowStockCount} Perlu Restock
            </span>
          )}
        </button>

        <button
          type="button"
          className={`inventory-tab-btn ${activeTab === 'opname' ? 'active' : ''}`}
          onClick={() => setActiveTab('opname')}
        >
          <ClipboardCheck size={16} />
          <span>Beban / Stock Opname</span>
          <span className="inventory-tab-badge">
            {opnameSessions.length} Sesi
          </span>
        </button>

        <button
          type="button"
          className={`inventory-tab-btn ${activeTab === 'mutasi' ? 'active' : ''}`}
          onClick={() => setActiveTab('mutasi')}
        >
          <History size={16} />
          <span>Riwayat Mutasi Stok</span>
          <span className="inventory-tab-badge">
            {mutations.length} Log
          </span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'katalog' && (
        <IngredientTable
          ingredients={ingredients}
          onEdit={handleOpenEditDrawer}
          onDelete={handleDeleteIngredient}
          onRestock={(item) => setRestockingIngredient(item)}
          onOpenAddDrawer={handleOpenAddDrawer}
        />
      )}

      {activeTab === 'opname' && (
        <StockOpnameView
          ingredients={ingredients}
          opnameSessions={opnameSessions}
          onSubmitOpname={handleSubmitOpname}
          isSubmitting={isSaving}
        />
      )}

      {activeTab === 'mutasi' && (
        <StockMutationTable mutations={mutations} />
      )}

      {/* 5. Add / Edit Ingredient Drawer */}
      <IngredientDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingIngredient(null);
        }}
        onSave={handleSaveIngredient}
        initialData={editingIngredient}
        isSaving={isSaving}
      />

      {/* 6. Quick Restock Modal */}
      {restockingIngredient && (
        <RestockModal
          isOpen={Boolean(restockingIngredient)}
          onClose={() => setRestockingIngredient(null)}
          onConfirm={handleConfirmRestock}
          ingredient={restockingIngredient}
          isSubmitting={isSaving}
        />
      )}
    </main>
  );
}
