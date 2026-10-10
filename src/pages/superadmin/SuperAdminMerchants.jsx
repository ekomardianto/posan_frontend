import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Lock,
  Edit2
} from 'lucide-react';
import {
  fetchAllMerchants,
  createNewMerchant,
  toggleMerchantActiveStatus
} from '../../services/superAdminService.js';

export default function SuperAdminMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New Merchant Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Specialty Coffee & Eatery',
    city: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminPassword: '',
  });

  const showFeedback = (title, message, type = 'success') => {
    setFeedback({ title, message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllMerchants();
      setMerchants(data);
    } catch (err) {
      showFeedback('Gagal Memuat', err.message || 'Tidak dapat mengambil daftar kafe.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMerchants = merchants.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.city || '').toLowerCase().includes(q) ||
      (m.address || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  });

  const handleToggleStatus = async (merchant) => {
    const nextState = !merchant.isActive;
    try {
      await toggleMerchantActiveStatus(merchant.id, nextState);
      await loadData();
      showFeedback(
        'Status Diperbarui',
        `Kafe "${merchant.name}" sekarang ${nextState ? 'Aktif' : 'Nonaktif'}.`
      );
    } catch (err) {
      showFeedback('Gagal Mengubah Status', err.message, 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showFeedback('Form Tidak Lengkap', 'Nama kafe dan email admin wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createNewMerchant(formData);
      await loadData();
      setIsModalOpen(false);
      setFormData({
        name: '',
        category: 'Specialty Coffee & Eatery',
        city: '',
        address: '',
        phone: '',
        email: '',
        adminName: '',
        adminPassword: '',
      });
      showFeedback(
        'Kafe Berhasil Dibuat',
        `Outlet baru "${formData.name}" dan akun adminnya telah aktif di database PostgreSQL.`
      );
    } catch (err) {
      showFeedback('Gagal Membuat Kafe', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="superadmin-page-container">
      {/* Toast Notification */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: feedback.type === 'error' ? '#7F1D1D' : '#064E3B',
            color: '#FFFFFF',
            padding: '14px 20px',
            borderRadius: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: `1px solid ${feedback.type === 'error' ? '#EF4444' : '#10B981'}`,
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={20} color="#FCA5A5" /> : <CheckCircle2 size={20} color="#6EE7B7" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{feedback.title}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>{feedback.message}</div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <section className="superadmin-card">
        <div className="superadmin-card-header">
          <div>
            <h1 className="superadmin-card-title">Manajemen Kafe &amp; Coffee Shop</h1>
            <p className="superadmin-card-subtitle">
              Kelola seluruh tenant kafe yang terdaftar pada sistem cloud POSAN
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn-superadmin-primary"
              style={{ background: '#334155', color: '#F8FAFC' }}
              onClick={loadData}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
              <span>Sinkron</span>
            </button>

            <button
              type="button"
              className="btn-superadmin-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span>Tambah Kafe Baru</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0F172A', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama kafe, kota, alamat, atau email admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#F8FAFC', outline: 'none', fontSize: '0.82rem' }}
          />
        </div>

        {/* Merchants Table */}
        <div className="superadmin-table-wrapper">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>ID</th>
                <th style={{ width: '26%' }}>Nama Outlet &amp; Kategori</th>
                <th style={{ width: '22%' }}>Lokasi / Alamat</th>
                <th style={{ width: '16%' }}>Kontak &amp; Email</th>
                <th style={{ width: '16%' }}>Admin &amp; Staf</th>
                <th style={{ width: '14%' }}>Aksi / Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    {isLoading ? 'Memuat data kafe...' : 'Tidak ada data kafe yang cocok.'}
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 800, color: '#F59E0B' }}>#{m.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.88rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#F59E0B', marginTop: 2 }}>{m.category || 'Specialty Coffee'}</div>
                    </td>
                    <td>
                      <div style={{ color: '#E2E8F0' }}>{m.city || 'Indonesia'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{m.address || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', color: '#93C5FD', fontSize: '0.76rem' }}>{m.email}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{m.phone || '-'}</div>
                    </td>
                    <td>
                      <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{m.adminCount || 1} Admin Outlet</div>
                      <div style={{ fontSize: '0.72rem', color: '#34D399' }}>{m.cashierCount || 0} Kasir / Staf</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m)}
                        style={{
                          background: m.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${m.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: m.isActive ? '#34D399' : '#F87171',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {m.isActive ? '✅ Aktif' : '⛔ Nonaktif'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Tambah Kafe Baru */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 540, padding: 26, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Tambah Kafe / Merchant Baru</h3>
                  <p style={{ fontSize: '0.74rem', color: '#94A3B8', margin: 0 }}>Membuat data outlet dan akun admin sekaligus</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                  Nama Kafe / Coffee Shop *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senopati Coffee & Roastery"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta Selatan"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                    Nomor Telepon Kafe
                  </label>
                  <input
                    type="text"
                    placeholder="+62 812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                  Alamat Lengkap Kafe
                </label>
                <input
                  type="text"
                  placeholder="Jl. Senopati Raya No. 45"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F59E0B', marginBottom: 8 }}>
                  Akun Admin Penanggung Jawab Outlet
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                      Email Login Admin *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@kafe.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                      Password Login Admin
                    </label>
                    <input
                      type="text"
                      placeholder="Default: admin123"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8', padding: '8px 18px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-superadmin-primary"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan & Aktifkan Kafe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
