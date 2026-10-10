import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  Users,
  Receipt,
  LogOut,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SuperAdminSidebar({ activeNav, onSelectNav }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'super-dashboard', label: 'Dashboard Sistem', icon: LayoutDashboard },
    { id: 'super-merchants', label: 'Manajemen Kafe / Outlet', icon: Store },
    { id: 'super-users', label: 'Manajemen Seluruh Pengguna', icon: Users },
    { id: 'super-receipts', label: 'Pengaturan Struk Pusat', icon: Receipt },
    { id: 'super-profile', label: 'Profil Super Admin', icon: Settings },
  ];

  return (
    <aside className="superadmin-sidebar">
      <div>
        {/* Brand Header */}
        <div className="superadmin-brand">
          <div className="superadmin-brand-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="superadmin-brand-title">POSAN SYSTEM</div>
            <span className="superadmin-badge-super">Super Admin Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="superadmin-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`superadmin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectNav(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div className="superadmin-sidebar-footer">
        <div className="superadmin-user-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="superadmin-user-avatar">
              <ShieldCheck size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Super Admin'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                superadmin@posan.com
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-superadmin-logout"
            onClick={logout}
            title="Keluar dari Akun Super Admin"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
