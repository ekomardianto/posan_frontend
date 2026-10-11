import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Pencil,
  Trash2,
  Power,
  RefreshCw,
  QrCode,
  Banknote,
  Building,
  Layers,
  Check,
  Loader2
} from 'lucide-react';
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod
} from '../../services/paymentMethodService.js';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'inactive'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({ name: '', is_active: true });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deletingMethod, setDeletingMethod] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadPaymentMethods = async (showSyncToast = false) => {
    if (showSyncToast) setIsSyncing(true);
    else setIsLoading(true);

    try {
      const data = await fetchPaymentMethods();
      setMethods(data || []);
      if (showSyncToast) {
        showToast('Sinkronisasi Sukses', 'Daftar metode pembayaran telah diperbarui dari database.');
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
      showToast('Gagal Memuat Data', err.message || 'Tidak dapat memuat metode pembayaran dari backend.', 'error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Stats calculation
  const counts = useMemo(() => {
    return {
      all: methods.length,
      active: methods.filter((m) => m.is_active).length,
      inactive: methods.filter((m) => !m.is_active).length,
    };
  }, [methods]);

  // Filtered methods
  const filteredMethods = useMemo(() => {
    return methods.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.type && m.type.toLowerCase().includes(q)) ||
        (m.provider && m.provider.toLowerCase().includes(q));

      let matchTab = true;
      if (activeTab === 'active') matchTab = m.is_active;
      if (activeTab === 'inactive') matchTab = !m.is_active;

      return matchSearch && matchTab;
    });
  }, [methods, searchQuery, activeTab]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMethod(null);
    setFormData({ name: '', is_active: true });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (method) => {
    setEditingMethod(method);
    setFormData({ name: method.name || '', is_active: Boolean(method.is_active) });
    setFormError('');
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama metode pembayaran wajib diisi.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (editingMethod) {
        const res = await updatePaymentMethod(editingMethod.id, formData);
        if (res?.success) {
          await loadPaymentMethods();
          showToast('Pembaruan Sukses', `Metode pembayaran "${formData.name}" berhasil diperbarui.`);
          setIsModalOpen(false);
          setEditingMethod(null);
        } else {
          setFormError(res?.error || 'Gagal memperbarui metode pembayaran.');
        }
      } else {
        const res = await createPaymentMethod(formData);
        if (res?.success) {
          await loadPaymentMethods();
          showToast('Penambahan Sukses', `Metode pembayaran baru "${formData.name}" tersimpan.`);
          setIsModalOpen(false);
          setEditingMethod(null);
        } else {
          setFormError(res?.error || 'Gagal menyimpan metode pembayaran.');
        }
      }
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggle = async (method) => {
    const nextStatus = !method.is_active;
    const res = await togglePaymentMethodStatus(method.id, nextStatus);
    if (res?.success) {
      await loadPaymentMethods();
      showToast(
        'Status Diperbarui',
        `Metode "${method.name}" kini ${nextStatus ? 'Aktif' : 'Nonaktif'}.`
      );
    } else {
      showToast('Gagal Mengubah Status', res?.error || 'Gagal mengubah status di database.', 'error');
    }
  };

  // Delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingMethod) return;
    setIsDeleting(true);

    try {
      const res = await deletePaymentMethod(deletingMethod.id);
      if (res?.success) {
        await loadPaymentMethods();
        showToast('Metode Dihapus', `Metode "${deletingMethod.name}" berhasil dihapus.`);
        setDeletingMethod(null);
      } else {
        showToast('Gagal Menghapus', res?.error || 'Tidak dapat menghapus metode pembayaran.', 'error');
      }
    } catch (err) {
      showToast('Gagal Menghapus', err.message || 'Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('qris') || lower.includes('gopay') || lower.includes('shopee') || lower.includes('dana')) {
      return <QrCode size={18} />;
    }
    if (lower.includes('cash') || lower.includes('tunai')) {
      return <Banknote size={18} />;
    }
    return <Building size={18} />;
  };

  return (
    <main className="dashboard-content" role="main" style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`toast-notification ${toastMessage.type === 'error' ? 'toast-error' : ''}`}
          role="status"
          aria-live="polite"
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
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Page Header Card */}
      <section className="categories-header-card animate-fade-in" aria-label="Header Metode Pembayaran">
        <div className="categories-header-left">
          <div className="categories-overline">
            <span>PENGATURAN KASIR</span>
            <span>&middot;</span>
            <span>POSAN Backend Live Sync</span>
          </div>
          <h1 className="categories-page-title">Metode Pembayaran</h1>
          <p className="categories-page-subtitle">
            Kelola pilihan pembayaran kasir (QRIS Dinamis, Tunai/Cash, Transfer Bank) yang tersinkronisasi di database.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-export-csv"
            onClick={() => loadPaymentMethods(true)}
            disabled={isSyncing}
            title="Sinkronkan dengan Database"
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi'}</span>
          </button>

          <button
            type="button"
            className="btn-add-category"
            onClick={handleOpenAdd}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Metode</span>
          </button>
        </div>
      </section>

      {/* 2. Key Metric Stat Cards */}
      <section className="categories-stats-grid" aria-label="Ringkasan Metode Pembayaran">
        <div className="category-stat-card animate-fade-in">
          <div className="category-stat-main">
            <span className="category-stat-label">TOTAL METODE TERSEDIA</span>
            <div className="category-stat-val-group">
              <span className="category-stat-number">{counts.all}</span>
            </div>
            <span className="category-stat-subtext">Pilihan pembayaran sistem</span>
          </div>
          <div className="category-stat-icon-wrapper" style={{ background: '#F5EBE1', color: '#8C5E3C' }}>
            <CreditCard size={20} strokeWidth={2.2} />
          </div>
        </div>

        <div className="category-stat-card animate-fade-in">
          <div className="category-stat-main">
            <span className="category-stat-label">METODE AKTIF DI KASIR</span>
            <div className="category-stat-val-group">
              <span className="category-stat-number" style={{ color: '#15803D' }}>{counts.active}</span>
            </div>
            <span className="category-stat-subtext text-active-ready">
              Siap digunakan transaksi kasir
            </span>
          </div>
          <div className="category-stat-icon-wrapper" style={{ background: '#DCFCE7', color: '#15803D' }}>
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
        </div>

        <div className="category-stat-card animate-fade-in">
          <div className="category-stat-main">
            <span className="category-stat-label">METODE NONAKTIF</span>
            <div className="category-stat-val-group">
              <span className="category-stat-number" style={{ color: '#DC2626' }}>{counts.inactive}</span>
            </div>
            <span className="category-stat-subtext">Disembunyikan dari kasir</span>
          </div>
          <div className="category-stat-icon-wrapper" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <Power size={20} strokeWidth={2.2} />
          </div>
        </div>
      </section>

      {/* 3. Filter & Search Toolbar */}
      <section className="category-filter-bar animate-fade-in" aria-label="Toolbar Filter">
        <div className="category-search-box">
          <Search size={16} className="category-search-icon" />
          <input
            type="text"
            placeholder="Cari metode pembayaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="category-search-input"
          />
        </div>

        <div className="category-tabs-group" role="tablist">
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Aktif ({counts.active})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveTab('inactive')}
          >
            Nonaktif ({counts.inactive})
          </button>
        </div>
      </section>

      {/* 4. Payment Methods Table */}
      <div className="cashier-table-card animate-fade-in">
        <div className="cashier-table-responsive">
          <table className="cashier-main-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '30%' }}>METODE PEMBAYARAN</th>
                <th scope="col" style={{ width: '25%' }}>TIPE &amp; KATEGORI</th>
                <th scope="col" style={{ width: '15%' }}>STATUS</th>
                <th scope="col" style={{ width: '15%' }}>RIWAYAT TRANSAKSI</th>
                <th scope="col" style={{ width: '15%', textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredMethods.map((method) => {
                const isMethodActive = Boolean(method.is_active);
                return (
                  <tr key={method.id} className="cashier-table-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: isMethodActive ? '#F5EBE1' : '#F3F4F6',
                            color: isMethodActive ? '#8C5E3C' : '#9CA3AF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {renderIcon(method.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                            {method.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            ID: {method.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor:
                            (method.name || '').toLowerCase().includes('qris')
                              ? '#FEF3C7'
                              : (method.name || '').toLowerCase().includes('tunai') || (method.name || '').toLowerCase().includes('cash')
                              ? '#F5EBE1'
                              : '#EFF6FF',
                          color:
                            (method.name || '').toLowerCase().includes('qris')
                              ? '#92400E'
                              : (method.name || '').toLowerCase().includes('tunai') || (method.name || '').toLowerCase().includes('cash')
                              ? '#7D5537'
                              : '#1E40AF'
                        }}
                      >
                        {method.type || ((method.name || '').toLowerCase().includes('qris') ? 'E-Wallet / QRIS' : (method.name || '').toLowerCase().includes('tunai') ? 'Cash' : 'Bank Transfer')}
                      </span>
                    </td>

                    <td>
                      <span className={`cashier-status-badge ${isMethodActive ? 'status-active' : 'status-inactive'}`}>
                        <span className="cashier-status-dot" />
                        <span>{isMethodActive ? 'Aktif' : 'Nonaktif'}</span>
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {method.transaction_count !== undefined ? `${method.transaction_count} Transaksi` : 'Tersambung'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="cashier-actions-wrapper" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => handleToggle(method)}
                          title={isMethodActive ? 'Nonaktifkan Metode' : 'Aktifkan Metode'}
                        >
                          <Power size={15} color={isMethodActive ? '#15803D' : '#9CA3AF'} />
                        </button>

                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => handleOpenEdit(method)}
                          title="Edit Metode"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn-action-icon text-danger"
                          onClick={() => setDeletingMethod(method)}
                          title="Hapus Metode"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMethods.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="cashier-empty-row">
                    <CreditCard size={36} className="cashier-empty-icon" />
                    <p className="cashier-empty-title">Tidak ada metode pembayaran yang sesuai</p>
                    <p className="cashier-empty-desc">
                      Gunakan tombol "Tambah Metode" untuk menambahkan opsi pembayaran kasir.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSaving && setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-card cashier-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-circle">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h2 className="modal-title">
                    {editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                  </h2>
                  <p className="modal-sub">
                    {editingMethod
                      ? 'Perbarui nama dan status metode pembayaran kasir.'
                      : 'Tambahkan opsi pembayaran baru untuk kasir POSAN.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isSaving && setIsModalOpen(false)}
                aria-label="Tutup Dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-body-form">
              <div className="form-group">
                <label className="form-label" htmlFor="pm-name">
                  Nama Metode Pembayaran <span className="text-required">*</span>
                </label>
                <input
                  id="pm-name"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: QRIS Dinamis, Tunai, Transfer BCA"
                  value={formData.name}
                  disabled={isSaving}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                />
                {formError && (
                  <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600, marginTop: '4px' }}>
                    {formError}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Status Pembayaran di Kasir</label>
                <div className="status-radio-group">
                  <label className={`status-radio-card ${formData.is_active ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pm-status"
                      checked={formData.is_active === true}
                      onChange={() => setFormData({ ...formData, is_active: true })}
                    />
                    <span className="radio-dot-green" />
                    <div className="radio-text">
                      <span className="radio-title">Aktif</span>
                      <span className="radio-desc">Tampil pada opsi checkout kasir POS</span>
                    </div>
                  </label>

                  <label className={`status-radio-card ${!formData.is_active ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="pm-status"
                      checked={formData.is_active === false}
                      onChange={() => setFormData({ ...formData, is_active: false })}
                    />
                    <span className="radio-dot-red" />
                    <div className="radio-text">
                      <span className="radio-title">Nonaktif</span>
                      <span className="radio-desc">Sembunyikan dari opsi checkout kasir</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingMethod ? 'Simpan Perubahan' : 'Tambah Metode'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deletingMethod && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeletingMethod(null)} role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-circle" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <Trash2 size={18} />
                </div>
                <div>
                  <h2 className="modal-title">Hapus Metode Pembayaran</h2>
                  <p className="modal-sub">Konfirmasi penghapusan metode dari database</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isDeleting && setDeletingMethod(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus metode pembayaran <strong>"{deletingMethod.name}"</strong>?
              <div style={{ marginTop: '10px', padding: '10px 12px', background: '#FEF3C7', borderRadius: '8px', color: '#92400E', fontSize: '0.8rem' }}>
                <strong>Perhatian:</strong> Metode yang telah memiliki riwayat transaksi penjualan tidak dapat dihapus, namun dapat dinonaktifkan statusnya.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeletingMethod(null)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-add-category"
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
