import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  User,
  LogOut,
  X,
  ShieldCheck,
  Store,
  ChevronDown,
  Monitor,
  Shield,
  Coffee,
  ChefHat,
  Utensils,
  ShoppingBag,
  ListOrdered,
  Printer
} from 'lucide-react';

const userSubMenuItems = [
  {
    name: 'Admin',
    path: '/superadmin/users/admin',
    icon: Shield,
    badgeColor: 'text-indigo-400',
  },
  {
    name: 'Kasir',
    path: '/superadmin/users/kasir',
    icon: Monitor,
    badgeColor: 'text-emerald-400',
  },
  {
    name: 'Barista',
    path: '/superadmin/users/barista',
    icon: Coffee,
    badgeColor: 'text-amber-400',
  },
  {
    name: 'Kitchen',
    path: '/superadmin/users/kitchen',
    icon: ChefHat,
    badgeColor: 'text-rose-400',
  },
];

function ActiveLink({ to, className, children, ...props }) {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      className={typeof className === 'function' ? className({ isActive }) : className}
      {...props}
    >
      {typeof children === 'function' ? children({ isActive }) : children}
    </Link>
  );
}

export default function Sidebar({ isOpen, onClose, onLogoutClick }) {
  const { user, role, isSuperAdmin, isAdmin, isCashier, isBarista, isKitchen } = useAuth();
  const pathname = usePathname();

  // Check if current path is in users menu
  const isUsersRouteActive =
    pathname.startsWith('/superadmin/users') ||
    pathname.startsWith('/superadmin/admin') ||
    pathname.startsWith('/superadmin/cashier');

  // Check if orders menu is active
  const isOrdersRouteActive = pathname.startsWith('/superadmin/orders');

  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(true);
  const [isOrdersMenuOpen, setIsOrdersMenuOpen] = useState(true);

  // Auto-expand users menu if currently on users route
  useEffect(() => {
    if (isUsersRouteActive) {
      setIsUsersMenuOpen(true);
    }
  }, [isUsersRouteActive]);

  useEffect(() => {
    if (isOrdersRouteActive) {
      setIsOrdersMenuOpen(true);
    }
  }, [isOrdersRouteActive]);

  const userName = user?.name || 'Pengguna POSAN';
  const userEmail = user?.email || 'user@posan.com';

  const { roleName, roleBadgeClass, rolePortalTitle } = useMemo(() => {
    switch (role) {
      case 'super_admin':
        return {
          roleName: 'Super Admin',
          roleBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200/70',
          rolePortalTitle: 'Menu Super Admin',
        };
      case 'admin':
        return {
          roleName: 'Admin Café',
          roleBadgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
          rolePortalTitle: 'Menu Admin Café',
        };
      case 'kasir':
        return {
          roleName: 'Kasir POS',
          roleBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
          rolePortalTitle: 'Menu Kasir POS',
        };
      case 'barista':
        return {
          roleName: 'Barista',
          roleBadgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          rolePortalTitle: 'Stasiun Barista Bar',
        };
      case 'kitchen':
        return {
          roleName: 'Kitchen Chef',
          roleBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200/70',
          rolePortalTitle: 'Stasiun Dapur Kitchen',
        };
      default:
        return {
          roleName: 'Staf Kafe',
          roleBadgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          rolePortalTitle: 'Menu Navigasi',
        };
    }
  }, [role]);

  const initials = useMemo(() => {
    if (!userName) return 'SA';
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'SA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userName]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 px-4.5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shadow-xs shrink-0">
              <img src="/logo.png" alt="POSAN Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className="font-extrabold text-slate-900 text-base tracking-tight shrink-0">POSAN</span>
                <span className={`text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full border whitespace-nowrap ${roleBadgeClass}`}>
                  {roleName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">POS Mobile Café</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3.5 py-4 overflow-y-auto">
          <div className="mb-2 px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {rolePortalTitle}
            </p>
          </div>

          <nav className="space-y-1">
            {/* 1. Dashboard (Super Admin) */}
            <ActiveLink
              to="/superadmin/dashboard"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <LayoutDashboard
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>Dashboard</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </ActiveLink>

            {/* 2. Menu User & Staf (Super Admin) */}
            <div className="space-y-1">
              <div
                onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150 select-none ${
                  isUsersRouteActive && !isUsersMenuOpen
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-[18px] h-[18px] transition-colors ${
                      isUsersRouteActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>Manajemen User &amp; Staf</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isUsersMenuOpen ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Collapsible Sub Menus */}
              {isUsersMenuOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-5">
                  {userSubMenuItems.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <ActiveLink
                        key={sub.path}
                        to={sub.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <SubIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-600'
                                }`}
                              />
                              <span className="truncate">{sub.name}</span>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                          </>
                        )}
                      </ActiveLink>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Payment Method */}
            <ActiveLink
              to="/superadmin/payment-method"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <CreditCard
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>Payment Method</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </ActiveLink>

            {/* 4. Profil Kafe & Gerai */}
            <ActiveLink
              to="/superadmin/merchant"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Store
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>Profil Kafe &amp; Gerai</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </ActiveLink>

            {/* 5. Pengaturan Struk & Printer */}
            <ActiveLink
              to="/superadmin/receipt-settings"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Printer
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>Pengaturan Struk</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </ActiveLink>

            {/* 8. Profil Akun (Semua Role) */}
            <ActiveLink
              to="/superadmin/profile"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <User
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>Profil Akun</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </ActiveLink>
          </nav>

          {/* System Status Pill */}
          <div className="mt-6 mx-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">PostgreSQL (posan_db)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Koneksi backend Express port 3000 aktif.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700">Database Terhubung</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer / User & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="px-3 py-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[11px] text-slate-400 truncate font-mono">{userEmail}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
}
