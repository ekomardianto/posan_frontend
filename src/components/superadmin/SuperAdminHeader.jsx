import React from 'react';
import { Database, ShieldCheck, Calendar } from 'lucide-react';

export default function SuperAdminHeader({ activeNav }) {
  const getNavTitle = (nav) => {
    switch (nav) {
      case 'super-dashboard':
        return 'Monitoring Sistem & Ekosistem Multi-Kafe';
      case 'super-merchants':
        return 'Daftar & Manajemen Kafe / Coffee Shop';
      case 'super-users':
        return 'Manajemen Pengguna Sistem (Admin, Kasir, Barista, Kitchen)';
      case 'super-receipts':
        return 'Konfigurasi Format & Branding Struk Thermal Pusat';
      case 'super-profile':
        return 'Pengaturan Akun Super Admin Pusat';
      default:
        return 'Portal Manajemen Super Admin POSAN';
    }
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="superadmin-header">
      <div>
        <div className="superadmin-header-title">{getNavTitle(activeNav)}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#94A3B8' }}>
          <Calendar size={14} color="#F59E0B" />
          <span>{todayFormatted}</span>
        </div>

        <div className="superadmin-header-badge">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
          <span>Database aktif</span>
        </div>
      </div>
    </header>
  );
}
