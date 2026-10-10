import React, { useState, useEffect } from 'react';
import {
  Store,
  Users,
  Utensils,
  Receipt,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { fetchAllMerchants, fetchAllSystemUsers } from '../../services/superAdminService.js';

export default function SuperAdminDashboard({ onNavigate }) {
  const [merchants, setMerchants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [merchantsData, usersData] = await Promise.all([
        fetchAllMerchants(),
        fetchAllSystemUsers(),
      ]);
      setMerchants(merchantsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading super admin dashboard:', err);
      setErrorMsg(err.message || 'Gagal memuat data dari database PostgreSQL.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = merchants.reduce((sum, m) => sum + (parseFloat(m.totalRevenue) || 0), 0);
  const totalTransactions = merchants.reduce((sum, m) => sum + (parseInt(m.totalTransactions, 10) || 0), 0);
  const totalProducts = merchants.reduce((sum, m) => sum + (parseInt(m.totalProducts, 10) || 0), 0);
  const activeMerchantsCount = merchants.filter((m) => m.isActive).length;

  return (
    <main className="superadmin-page-container">
      {/* 1. Hero Card */}
      <section className="superadmin-hero-card">
        <div className="superadmin-hero-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              PANEL KONTROL PUSAT
            </span>
          </div>
          <h1>Selamat Datang, Super Admin POSAN 👋</h1>
          <p>
            Kelola seluruh ekosistem multi-tenant kafe, pantau performa omzet gabungan, dan kelola otorisasi akun staf secara terpusat langsung ke PostgreSQL.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn-superadmin-primary"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw size={15} className={isLoading ? 'spin-icon' : ''} />
            <span>{isLoading ? 'Menyinkronkan...' : 'Sinkronisasi Database'}</span>
          </button>
        </div>
      </section>

      {/* Error Alert */}
      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', padding: '14px 18px', borderRadius: 12, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} color="#EF4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Stats Grid (4 Cards) */}
      <section className="superadmin-stats-grid">
        <div className="superadmin-stat-card">
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-label">Total Kafe / Outlet</span>
            <span className="superadmin-stat-value">{merchants.length} Kafe</span>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
              {activeMerchantsCount} Outlet Aktif
            </span>
          </div>
          <div className="superadmin-stat-icon-circle amber">
            <Store size={22} />
          </div>
        </div>

        <div className="superadmin-stat-card">
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-label">Total Pengguna Sistem</span>
            <span className="superadmin-stat-value">{users.length} Akun</span>
            <span style={{ fontSize: '0.72rem', color: '#3B82F6', fontWeight: 600 }}>
              Admin, Kasir, Barista &amp; Dapur
            </span>
          </div>
          <div className="superadmin-stat-icon-circle blue">
            <Users size={22} />
          </div>
        </div>

        <div className="superadmin-stat-card">
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-label">Total Menu / Katalog</span>
            <span className="superadmin-stat-value">{totalProducts} Item</span>
            <span style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: 600 }}>
              Lintas Seluruh Outlet
            </span>
          </div>
          <div className="superadmin-stat-icon-circle purple">
            <Utensils size={22} />
          </div>
        </div>

        <div className="superadmin-stat-card">
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-label">Omzet Gabungan Semua Kafe</span>
            <span className="superadmin-stat-value" style={{ color: '#34D399', fontSize: '1.25rem' }}>
              Rp {totalRevenue.toLocaleString('id-ID')}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              {totalTransactions} Transaksi Kasir
            </span>
          </div>
          <div className="superadmin-stat-icon-circle emerald">
            <TrendingUp size={22} />
          </div>
        </div>
      </section>

      {/* 3. Merchants Quick Table */}
      <section className="superadmin-card">
        <div className="superadmin-card-header">
          <div>
            <div className="superadmin-card-title">Daftar Coffee Shop &amp; Roastery Terdaftar</div>
            <div className="superadmin-card-subtitle">
              Pantau status operasional dan admin penanggung jawab masing-masing outlet
            </div>
          </div>
          <button
            type="button"
            className="btn-superadmin-primary"
            onClick={() => onNavigate('super-merchants')}
          >
            <span>Kelola Kafe &amp; Tambah Baru</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="superadmin-table-wrapper">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>ID</th>
                <th style={{ width: '28%' }}>Nama Kafe &amp; Kota</th>
                <th style={{ width: '22%' }}>Email Admin Outlet</th>
                <th style={{ width: '14%' }}>Total Menu</th>
                <th style={{ width: '16%' }}>Total Omzet</th>
                <th style={{ width: '12%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                    {isLoading ? 'Memuat daftar kafe...' : 'Belum ada kafe terdaftar.'}
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 800, color: '#F59E0B' }}>#{m.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{m.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{m.city || m.address || 'Indonesia'}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#93C5FD' }}>{m.email}</td>
                    <td>{m.totalProducts || 0} Produk</td>
                    <td style={{ fontWeight: 700, color: '#34D399' }}>
                      Rp {Number(m.totalRevenue || 0).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span className={`badge-status ${m.isActive ? 'active' : 'inactive'}`}>
                        {m.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
