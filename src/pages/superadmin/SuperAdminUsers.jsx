import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Coffee,
  ChefHat,
  Monitor,
  Trash2,
  Lock,
  KeyRound
} from 'lucide-react';
import {
  fetchAllMerchants,
  fetchAllSystemUsers,
  createSystemUser,
  toggleUserActiveStatus,
  deleteSystemUser
} from '../../services/superAdminService.js';

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedMerchantId, setSelectedMerchantId] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    merchant_id: '',
  });

  const showFeedback = (title, message, type = 'success') => {
    setFeedback({ title, message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, merchantsData] = await Promise.all([
        fetchAllSystemUsers(),
        fetchAllMerchants(),
      ]);
      setUsers(usersData);
      setMerchants(merchantsData);
      if (merchantsData.length > 0 && !formData.merchant_id) {
        setFormData((prev) => ({ ...prev, merchant_id: merchantsData[0].id }));
      }
    } catch (err) {
      showFeedback('Gagal Memuat Data', err.message || 'Tidak dapat mengambil data pengguna.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q);

    const matchRole = selectedRole === 'all' || u.role?.toLowerCase() === selectedRole.toLowerCase();
    const matchMerchant =
      selectedMerchantId === 'all' ||
      String(u.merchant_id || u.merchantId) === String(selectedMerchantId);

    return matchSearch && matchRole && matchMerchant;
  });

  const handleToggleStatus = async (user) => {
    const currentStatus = user.status === 'Aktif' || user.is_active === true;
    const nextStatus = currentStatus ? 'Nonaktif' : 'Aktif';
    try {
      await toggleUserActiveStatus(user.id, nextStatus);
      await loadData();
      showFeedback('Status Diperbarui', `Akun "${user.name}" diubah menjadi ${nextStatus}.`);
    } catch (err) {
      showFeedback('Gagal Mengubah Status', err.message, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Yakin ingin menghapus akun "${user.name}"?`)) return;
    try {
      await deleteSystemUser(user.id);
      await loadData();
      showFeedback('Akun Dihapus', `Akun "${user.name}" telah dihapus dari database.`);
    } catch (err) {
      showFeedback('Gagal Menghapus Akun', err.message, 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showFeedback('Form Tidak Lengkap', 'Nama, email, dan kata sandi wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSystemUser(formData);
      await loadData();
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        merchant_id: merchants[0]?.id || 1,
      });
      showFeedback('Akun Dibuat', `Akun ${formData.role} "${formData.name}" berhasil dibuat.`);
    } catch (err) {
      showFeedback('Gagal Membuat Akun', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'super_admin') return { label: 'Super Admin', bg: 'rgba(217, 119, 6, 0.2)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.4)' };
    if (r === 'admin') return { label: 'Admin Outlet', bg: 'rgba(59, 130, 246, 0.18)', text: '#93C5FD', border: 'rgba(59, 130, 246, 0.35)' };
    if (r === 'kasir') return { label: 'Kasir POS', bg: 'rgba(16, 185, 129, 0.18)', text: '#6EE7B7', border: 'rgba(16, 185, 129, 0.35)' };
    if (r === 'barista') return { label: 'Barista (KDS)', bg: 'rgba(245, 158, 11, 0.18)', text: '#FDE68A', border: 'rgba(245, 158, 11, 0.35)' };
    if (r === 'kitchen') return { label: 'Kitchen (Dapur)', bg: 'rgba(239, 68, 68, 0.18)', text: '#FCA5A5', border: 'rgba(239, 68, 68, 0.35)' };
    return { label: role, bg: 'rgba(255, 255, 255, 0.1)', text: '#E2E8F0', border: 'transparent' };
  };

  return (
    <main className="superadmin-page-container">
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
            <h1 className="superadmin-card-title">Manajemen Seluruh Pengguna Sistem</h1>
            <p className="superadmin-card-subtitle">
              Kelola akun Admin Kafe, Kasir, Barista, dan Staf Dapur lintas seluruh outlet
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
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0F172A', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', flex: 1, minWidth: 260 }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Cari nama pengguna, email, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#F8FAFC', outline: 'none', fontSize: '0.82rem' }}
            />
          </div>

          {/* Filter Role */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 12, background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin Outlet</option>
            <option value="kasir">Kasir POS</option>
            <option value="barista">Barista</option>
            <option value="kitchen">Kitchen (Dapur)</option>
          </select>

          {/* Filter Merchant */}
          <select
            value={selectedMerchantId}
            onChange={(e) => setSelectedMerchantId(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 12, background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="all">Semua Kafe / Outlet</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                Kafe #{m.id}: {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="superadmin-table-wrapper">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>ID</th>
                <th style={{ width: '24%' }}>Nama &amp; Kontak</th>
                <th style={{ width: '18%' }}>Email Login</th>
                <th style={{ width: '14%' }}>Role / Jabatan</th>
                <th style={{ width: '20%' }}>Penempatan Outlet</th>
                <th style={{ width: '18%' }}>Status &amp; Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    {isLoading ? 'Memuat pengguna...' : 'Tidak ada pengguna yang cocok dengan filter.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const isUserActive = u.status === 'Aktif' || u.is_active === true;
                  const merchantName =
                    u.merchant?.name ||
                    merchants.find((m) => String(m.id) === String(u.merchant_id || u.merchantId))?.name ||
                    'Semua Kafe (Pusat)';

                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 800, color: '#94A3B8' }}>#{u.id}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.86rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{u.phone || 'PIN: ' + (u.auth_pin || '889900')}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#93C5FD', fontSize: '0.76rem' }}>{u.email}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ color: '#E2E8F0', fontWeight: 600 }}>{merchantName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{u.shift || 'Shift Utama'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            style={{
                              background: isUserActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              border: `1px solid ${isUserActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                              color: isUserActive ? '#34D399' : '#F87171',
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isUserActive ? 'Aktif' : 'Nonaktif'}
                          </button>

                          {u.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              title="Hapus Akun"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: 4,
                                borderRadius: 4,
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Tambah User Baru */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 26, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Tambah Pengguna Baru</h3>
                  <p style={{ fontSize: '0.74rem', color: '#94A3B8', margin: 0 }}>Daftarkan akun staf atau admin kafe</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                  Nama Lengkap Staf *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                    Role / Jabatan *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  >
                    <option value="admin">Admin Outlet</option>
                    <option value="kasir">Kasir POS</option>
                    <option value="barista">Barista (KDS)</option>
                    <option value="kitchen">Kitchen (Dapur)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                    Kafe / Merchant *
                  </label>
                  <select
                    value={formData.merchant_id}
                    onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  >
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                  Email Login Akun *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staf@posan.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                  Kata Sandi (Password) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
