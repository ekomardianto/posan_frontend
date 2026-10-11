import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './SuperAdminSidebar';
import Topbar from './SuperAdminTopbar';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { LogOut, AlertTriangle } from 'lucide-react';

const pageTitles = {
  '/superadmin/dashboard': 'Dashboard',
  '/superadmin/users': 'Manajemen User & Staf',
  '/superadmin/users/kasir': 'Manajemen User - Kasir',
  '/superadmin/users/admin': 'Manajemen User - Admin Café',
  '/superadmin/users/barista': 'Manajemen User - Barista',
  '/superadmin/users/kitchen': 'Manajemen User - Kitchen',
  '/superadmin/products': 'Katalog Produk & Menu',
  '/superadmin/orders': 'Stasiun Pesanan (KDS)',
  '/superadmin/orders/barista': 'Stasiun Barista - Antrean Minuman',
  '/superadmin/orders/kitchen': 'Stasiun Kitchen - Antrean Makanan',
  '/superadmin/transactions': 'Riwayat Transaksi & POS',
  '/superadmin/payment-method': 'Payment Method',
  '/superadmin/merchant': 'Profil Kafe & Gerai',
  '/superadmin/profile': 'Profil Akun Pengguna',
};

export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // Compute title with prefix matching for dynamic user/order sub-routes
  let currentTitle = pageTitles[pathname];
  if (!currentTitle) {
    if (pathname.startsWith('/superadmin/users')) {
      currentTitle = 'Manajemen User & Staf';
    } else if (pathname.startsWith('/superadmin/orders')) {
      currentTitle = 'Stasiun Pesanan (KDS)';
    } else {
      currentTitle = 'Dashboard';
    }
  }

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title={currentTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Keluar Sesi"
        description="Apakah Anda yakin ingin mengakhiri sesi Super Admin POSAN?"
        icon={LogOut}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={LogOut}
              onClick={handleConfirmLogout}
            >
              Ya, Keluar
            </Button>
          </>
        }
      >
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Sesi Super Admin Anda akan diakhiri dengan aman. Anda perlu masuk kembali untuk mengakses panel Super Admin.
          </p>
        </div>
      </Modal>
    </div>
  );
}
