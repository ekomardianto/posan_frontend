import React from 'react';
import {
  LayoutGrid,
  Coffee,
  Layers,
  Receipt,
  Users,
  BarChart3,
  User,
  LogOut,
  Utensils,
  CreditCard,
  Printer,
  UserCheck,
  Package
} from 'lucide-react';
import posanLogo from '../../assets/posan-logo.jpg';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAlert } from '../../context/AlertContext.jsx';

const iconMap = {
  LayoutGrid: LayoutGrid,
  Coffee: Coffee,
  Layers: Layers,
  Receipt: Receipt,
  Users: Users,
  BarChart3: BarChart3,
  Utensils: Utensils,
  CreditCard: CreditCard,
  Printer: Printer,
  UserCheck: UserCheck,
  Package: Package,
};

export default function Sidebar({ activeNav = 'dashboard', onSelectNav }) {
  const { user, merchant, logout } = useAuth();
  const alert = useAlert();
  const outletName = merchant?.name || user?.branch || 'POSAN Cafe';
  const rawRole = (user?.rawRole || user?.role || '').toLowerCase();

  const handleLogout = async () => {
    const confirmed = await alert.confirm({
      title: 'Konfirmasi Keluar Sesi',
      message: 'Apakah Anda yakin ingin mengakhiri sesi kerja POSAN Admin?',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      type: 'danger',
      icon: LogOut,
    });

    if (confirmed) {
      logout();
    }
  };

  // Dynamic Navigation Items for Admin Cafe
  const getNavItems = () => {
    // Admin Cafe Operational Suite
    const items = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        subtitle: 'Ringkasan & Analitik',
        icon: 'LayoutGrid',
      },
      {
        id: 'produk',
        name: 'Produk',
        subtitle: 'Katalog & Menu',
        icon: 'Coffee',
      },
      {
        id: 'kategori',
        name: 'Kategori',
        subtitle: 'Grup & Klasifikasi',
        icon: 'Layers',
      },
      {
        id: 'inventori',
        name: 'Inventori Bahan',
        subtitle: 'Bahan Baku & Stock Opname',
        icon: 'Package',
      },
      {
        id: 'transaksi',
        name: 'Transaksi',
        subtitle: 'Riwayat & Detail',
        icon: 'Receipt',
      },
      {
        id: 'laporan',
        name: 'Laporan',
        subtitle: 'Penjualan, Staf & Absensi',
        icon: 'BarChart3',
      },
      {
        id: 'kasir',
        name: 'Staf & Pengguna',
        subtitle: 'Kasir, Barista & Kitchen',
        icon: 'Users',
      },
      {
        id: 'pengaturan-struk',
        name: 'Pengaturan Struk',
        subtitle: 'Header & Footer Thermal',
        icon: 'Printer',
      },
    ];

    return items;
  };


  const logoSrc = posanLogo?.src || posanLogo || '/posan-logo.jpg';

  const navItems = getNavItems();

  return (
    <aside className="sidebar" aria-label="Navigasi Utama">
      {/* Brand Header */}
      <div className="sidebar-header">
        <a
          href="#dashboard"
          className="brand-wrapper"
          onClick={(e) => {
            e.preventDefault();
            if (onSelectNav) onSelectNav('dashboard');
          }}
        >
          <div className="brand-logo-img-box">
            <img
              src={logoSrc}
              alt="POSAN Logo"
              className="brand-logo-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/posan-logo.jpg';
              }}
            />
          </div>
          <div className="brand-info">
            <div className="brand-title">POSAN</div>
            <div className="brand-subtitle">{outletName}</div>
          </div>
        </a>

        {/* Role Access Badge */}
        <div className="role-badge">
          <span className="role-dot" />
          <span>{user?.role || 'Akses POSAN'}</span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="sidebar-nav-section">
        <div className="nav-section-label">
          {rawRole === 'barista' ? 'STASIUN BARISTA' : rawRole === 'kitchen' ? 'STASIUN KITCHEN' : rawRole === 'kasir' ? 'TERMINAL KASIR' : 'MENU UTAMA'}
        </div>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const IconComponent = iconMap[item.icon] || LayoutGrid;
            const isActive =
              activeNav === item.id ||
              (item.id === 'laporan' &&
                (activeNav === 'absen' ||
                  activeNav === 'absensi' ||
                  activeNav === 'laporan-staf' ||
                  activeNav === 'attendance'));

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectNav && onSelectNav(item.id)}
                >
                  <div className="nav-icon">
                    <IconComponent size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>
                  <div className="nav-text-group">
                    <span className="nav-title">{item.name}</span>
                    <span className="nav-subtitle">{item.subtitle}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Nav Links */}
      <div className="sidebar-footer">
        <button
          type="button"
          className={`nav-item-btn ${activeNav === 'profil' ? 'active' : ''}`}
          onClick={() => onSelectNav && onSelectNav('profil')}
        >
          <div className="nav-icon">
            <User size={18} strokeWidth={activeNav === 'profil' ? 2.2 : 1.8} />
          </div>
          <div className="nav-text-group">
            <span className="nav-title">Profil & Sesi</span>
          </div>
        </button>

        <button
          type="button"
          className="nav-item-btn btn-logout"
          onClick={handleLogout}
          title="Keluar dari Akun"
        >
          <div className="nav-icon">
            <LogOut size={18} strokeWidth={1.8} />
          </div>
          <div className="nav-text-group">
            <span className="nav-title">Keluar</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
