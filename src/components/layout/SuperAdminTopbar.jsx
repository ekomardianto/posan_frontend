import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProgressRouter } from '../../context/NavigationProgressContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function Topbar({ onToggleSidebar, title = 'Dashboard', onLogoutClick }) {
  const router = useProgressRouter();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const activities = await dashboardService.getRecentActivities();
      const mapped = activities.map((act) => ({
        id: act.id,
        title: act.title,
        message: act.details,
        time: act.time,
        unread: true,
        type: act.type,
      }));
      setNotifications(mapped);
    } catch (err) {
      console.warn('Failed to load notifications from database:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const userName = user?.name || 'Pengguna POSAN';
  const userEmail = user?.email || 'user@posan.com';

  const { roleName, roleBadge } = React.useMemo(() => {
    switch (user?.role) {
      case 'super_admin':
        return { roleName: 'Super Admin', roleBadge: 'SUPER ADMIN' };
      case 'admin':
        return { roleName: 'Admin Café', roleBadge: 'ADMIN OUTLET' };
      case 'kasir':
        return { roleName: 'Kasir POS', roleBadge: 'KASIR' };
      case 'barista':
        return { roleName: 'Barista', roleBadge: 'BARISTA' };
      case 'kitchen':
        return { roleName: 'Kitchen', roleBadge: 'KITCHEN' };
      default:
        return { roleName: 'Pengguna', roleBadge: 'USER' };
    }
  }, [user?.role]);

  const initials = React.useMemo(() => {
    if (!userName) return 'SA';
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'SA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userName]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoToProfile = (tab = 'account') => {
    setShowProfileMenu(false);
    router.push('/superadmin/profile');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left side: Hamburger Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Database terhubung
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Simple Search Input */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari data super admin..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Menu Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-dropdown border border-slate-100 py-3 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Notifikasi Database</h3>
                  <p className="text-[11px] text-slate-400">Log aktivitas sistem database</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Tidak ada notifikasi baru di database.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50/80 transition-colors ${
                        n.unread ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {n.type === 'system' ? (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-slate-200/80">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 leading-tight">{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{roleName}</p>
            </div>
          </button>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-dropdown border border-slate-100 py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div
                onClick={() => handleGoToProfile('account')}
                className="px-4 py-2.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {roleBadge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleGoToProfile('account')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profil Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGoToProfile('security')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Keamanan & Sandi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGoToProfile('preferences')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Sistem</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogoutClick) onLogoutClick();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
