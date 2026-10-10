import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  fetchCashiers,
  createCashier,
  updateCashier,
  deleteCashier,
  toggleCashierStatus
} from '../../services/cashierService';
import CashierStats from '../../components/cashiers/CashierStats';
import CashierFilters from '../../components/cashiers/CashierFilters';
import CashierTable from '../../components/cashiers/CashierTable';
import CashierFooterCards from '../../components/cashiers/CashierFooterCards';
import CashierModal from '../../components/cashiers/CashierModal';
import CashierDeleteModal from '../../components/cashiers/CashierDeleteModal';

export default function CashiersPage() {
  const [cashiers, setCashiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'inactive'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState(null);
  const [deletingCashier, setDeletingCashier] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadCashiers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCashiers();
      setCashiers(data || []);
    } catch (err) {
      console.error('Error loading cashiers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCashiers();
  }, []);

  // Counts for status tabs
  const tabCounts = useMemo(() => {
    return {
      all: cashiers.length,
      active: cashiers.filter((c) => c.status === 'Aktif' || c.is_active === true).length,
      inactive: cashiers.filter((c) => c.status === 'Nonaktif' || c.is_active === false).length
    };
  }, [cashiers]);

  // Filtered cashiers
  const filteredCashiers = useMemo(() => {
    return cashiers.filter((c) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q));

      // 2. Status Tab filter
      let matchTab = true;
      if (activeTab === 'active') matchTab = c.status === 'Aktif' || c.is_active === true;
      if (activeTab === 'inactive') matchTab = c.status === 'Nonaktif' || c.is_active === false;

      return matchSearch && matchTab;
    });
  }, [cashiers, searchQuery, activeTab]);

  // Handler: Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCashier(null);
    setIsModalOpen(true);
  };

  // Handler: Open Edit Modal
  const handleOpenEditModal = (cashier) => {
    setEditingCashier(cashier);
    setIsModalOpen(true);
  };

  // Handler: Save Cashier (Create or Update)
  const handleSaveCashier = async (formData) => {
    setIsLoading(true);
    try {
      if (editingCashier) {
        const targetId = editingCashier.rawId || editingCashier.id;
        const res = await updateCashier(targetId, formData);
        if (res?.success) {
          await loadCashiers();
          showToast('Data Diperbarui', `Informasi staf ${formData.name} berhasil diperbarui.`);
        } else {
          showToast('Gagal Memperbarui', res?.error || 'Gagal memperbarui di database PostgreSQL posan_db.', 'error');
        }
      } else {
        const res = await createCashier(formData);
        if (res?.success) {
          await loadCashiers();
          showToast('Staf Ditambahkan', `Akun staf baru ${formData.name} berhasil didaftarkan di PostgreSQL posan_db.`);
        } else {
          showToast('Gagal Menambahkan', res?.error || 'Gagal mendaftarkan staf ke database PostgreSQL posan_db.', 'error');
        }
      }
    } catch (err) {
      showToast('Terjadi Kesalahan', err.message, 'error');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setEditingCashier(null);
    }
  };

  // Handler: Toggle Status
  const handleToggleStatus = async (cashier) => {
    const isCurrentlyActive = cashier.is_active !== false && cashier.status === 'Aktif';
    const isActivating = !isCurrentlyActive;
    const nextStatus = isActivating ? 'Aktif' : 'Nonaktif';
    const targetId = cashier.rawId || cashier.id;

    try {
      const res = await toggleCashierStatus(targetId, isActivating);
      if (res?.success) {
        setCashiers((prev) =>
          prev.map((c) =>
            (c.rawId === targetId || c.id === cashier.id)
              ? { ...c, status: nextStatus, is_active: isActivating }
              : c
          )
        );
        showToast(
          'Status Staf Diubah',
          `Akun ${cashier.name} sekarang berstatus ${nextStatus}.`
        );
      } else {
        showToast('Gagal Mengubah Status', res?.error || 'Gagal mengubah status di database.', 'error');
      }
    } catch (err) {
      showToast('Gagal Mengubah Status', err.message, 'error');
    }
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = async (cashierId) => {
    const target = cashiers.find((c) => c.id === cashierId);
    const targetId = target?.rawId || cashierId;

    const res = await deleteCashier(targetId);
    if (res?.success) {
      await loadCashiers();
      showToast(
        'Kasir Dihapus',
        `Akun kasir ${target?.name || ''} telah dihapus dari sistem POS.`
      );
    } else {
      showToast('Gagal Menghapus', res?.error || 'Gagal menghapus kasir dari database.', 'error');
    }
    setDeletingCashier(null);
  };

  return (
    <main className="cashiers-page-container" role="main">
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

      {/* 1. Page Header */}
      <section className="cashier-page-header-card animate-fade-in" aria-label="Header Kelola Staf">
        <div className="cashier-header-left">
          <div className="cashier-title-row">
            <h1 className="cashier-page-title">Staf &amp; Pengguna</h1>
            <div className="cashier-scope-badge">
              <span className="cashier-scope-dot" />
              <span>POSAN Backend Role Sync</span>
            </div>
          </div>
          <p className="cashier-page-subtitle">
            Kelola akun staf operasional outlet: Kasir (POS), Barista (Minuman), dan Kitchen (Dapur).
          </p>
        </div>

        <button
          type="button"
          className="btn-add-cashier"
          onClick={handleOpenCreateModal}
          title="Tambah Akun Staf Baru"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Staf</span>
        </button>
      </section>

      {/* 2. Metric Stat Cards */}
      <CashierStats cashiers={cashiers} />

      {/* 3. Search & Segmented Filter Bar */}
      <CashierFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
      />

      {/* 4. Cashier Table */}
      <CashierTable
        cashiers={filteredCashiers}
        onEditCashier={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDeleteCashier={(cashier) => setDeletingCashier(cashier)}
        totalCashiers={cashiers.length}
      />

      {/* 5. Bottom Security & Audit Protocol Cards */}
      <CashierFooterCards />

      {/* 6. Add / Edit Modal */}
      <CashierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCashier(null);
        }}
        onSave={handleSaveCashier}
        initialCashier={editingCashier}
        existingCount={cashiers.length}
      />

      {/* 7. Delete Confirmation Modal */}
      {deletingCashier && (
        <CashierDeleteModal
          cashier={deletingCashier}
          onClose={() => setDeletingCashier(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </main>
  );
}


