import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './screens/auth/LoginPage.jsx';

// Admin Outlet Components & Pages
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import AdminDashboard from './screens/admin/AdminDashboard.jsx';
import ProductsPage from './screens/admin/ProductsPage.jsx';
import CategoriesPage from './screens/admin/CategoriesPage.jsx';
import TransactionsPage from './screens/admin/TransactionsPage.jsx';
import CashiersPage from './screens/admin/CashiersPage.jsx';
import PaymentMethodsPage from './screens/admin/PaymentMethodsPage.jsx';
import ReportsPage from './screens/admin/ReportsPage.jsx';
import ProfilePage from './screens/admin/ProfilePage.jsx';
import ReceiptSettingsPage from './screens/admin/ReceiptSettingsPage.jsx';
import BaristaOrdersPage from './screens/barista/BaristaOrdersPage.jsx';
import KitchenOrdersPage from './screens/kitchen/KitchenOrdersPage.jsx';

// Super Admin Layout & Pages (Matching POSAN Superadmin)
import SuperAdminLayout from './components/layout/SuperAdminLayout.jsx';
import SuperAdminDashboard from './screens/superadmin/Dashboard.jsx';
import SuperAdminUsers from './screens/superadmin/Users.jsx';
import SuperAdminMerchant from './screens/superadmin/Merchant.jsx';
import SuperAdminPaymentMethod from './screens/superadmin/PaymentMethod.jsx';
import SuperAdminReceiptSettings from './screens/superadmin/ReceiptSettings.jsx';
import SuperAdminProfile from './screens/superadmin/Profile.jsx';
import SuperAdminProducts from './screens/superadmin/Products.jsx';
import SuperAdminOrders from './screens/superadmin/Orders.jsx';
import SuperAdminTransactions from './screens/superadmin/Transactions.jsx';

import { LoadingProvider } from './context/LoadingContext.jsx';
import { AlertProvider } from './context/AlertContext.jsx';
import { NavigationProgressProvider, useProgressRouter, useNavigationProgress } from './context/NavigationProgressContext.jsx';

// Loading Spinner Screen
function LoadingScreen() {
  return null;
}

function AuthProgressBridge() {
  const { isLoading } = useAuth();
  const { startNavigation, finishNavigation } = useNavigationProgress();

  useEffect(() => {
    if (isLoading) startNavigation();
    else finishNavigation();
  }, [isLoading, startNavigation, finishNavigation]);

  return null;
}

function ClientRedirect({ to }) {
  const router = useProgressRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return null;
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, isSuperAdmin, isAdmin, rawRole } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <ClientRedirect to="/login" />;
  }

  // Non-admin roles (kasir, barista, kitchen) are never permitted in Web Admin
  if (rawRole === 'kasir' || rawRole === 'barista' || rawRole === 'kitchen') {
    return <ClientRedirect to="/login" />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(rawRole) ||
      (allowedRoles.includes('super_admin') && isSuperAdmin) ||
      (allowedRoles.includes('admin') && isAdmin);

    if (!isAllowed) {
      if (isSuperAdmin) {
        return <ClientRedirect to="/superadmin/dashboard" />;
      }
      return <ClientRedirect to="/login" />;
    }
  }

  return children;
}

// Admin Café Layout Container (Khusus Admin Outlet)
function AdminPortalLayout() {
  const [adminNav, setAdminNav] = useState('dashboard');
  const { startNavigation, finishNavigation } = useNavigationProgress();

  useEffect(() => {
    finishNavigation();
  }, [adminNav, finishNavigation]);

  const handleSelectNav = (nextNav) => {
    if (nextNav !== adminNav) startNavigation();
    setAdminNav(nextNav);
  };

  const renderAdminContent = () => {
    switch (adminNav) {
      case 'dashboard':
      case 'beranda':
        return <AdminDashboard onNavigate={handleSelectNav} />;
      case 'produk':
      case 'products':
        return <ProductsPage />;
      case 'kategori':
      case 'categories':
        return <CategoriesPage />;
      case 'transaksi':
      case 'transactions':
        return <TransactionsPage />;
      case 'kasir':
      case 'cashiers':
        return <CashiersPage />;
      case 'pembayaran':
      case 'payment-methods':
      case 'payment':
        return <PaymentMethodsPage />;
      case 'laporan':
      case 'reports':
      case 'laporan-penjualan':
        return <ReportsPage initialTab="penjualan" />;
      case 'laporan-staf':
      case 'staff-reports':
      case 'staff-report':
        return <ReportsPage initialTab="staf" />;
      case 'pengaturan-struk':
      case 'receipt-settings':
      case 'struk':
        return <ReceiptSettingsPage />;
      case 'profil':
      case 'profile':
      case 'pengaturan':
      case 'settings':
        return <ProfilePage />;
      default:
        return <AdminDashboard onNavigate={setAdminNav} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeNav={adminNav} onSelectNav={handleSelectNav} />
      <div className="main-wrapper">
        <Header onSelectNav={handleSelectNav} />
        {renderAdminContent()}
      </div>
    </div>
  );
}

// Smart Root Redirect based on Role
function RootRedirect() {
  const { isAuthenticated, isLoading, isSuperAdmin, isAdmin } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated || (!isSuperAdmin && !isAdmin)) return <ClientRedirect to="/login" />;

  if (isSuperAdmin) {
    return <ClientRedirect to="/superadmin/dashboard" />;
  }
  return <ClientRedirect to="/admin" />;
}

// Login Page Wrapper (Redirects if already authenticated as admin/superadmin)
function LoginRoute() {
  const { isAuthenticated, isLoading, isSuperAdmin, isAdmin } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && (isSuperAdmin || isAdmin)) {
    if (isSuperAdmin) {
      return <ClientRedirect to="/superadmin/dashboard" />;
    }
    return <ClientRedirect to="/admin" />;
  }

  return <LoginPage />;
}

function AppRoutes() {
  const pathname = usePathname();

  if (pathname === '/login') return <LoginRoute />;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
        <AdminPortalLayout />
      </ProtectedRoute>
    );
  }

  if (pathname === '/superadmin' || pathname.startsWith('/superadmin/')) {
    const route = pathname.slice('/superadmin/'.length).split('/').filter(Boolean);
    let page;

    if (pathname === '/superadmin') {
      page = <ClientRedirect to="/superadmin/dashboard" />;
    } else if (route[0] === 'dashboard') {
      page = <SuperAdminDashboard />;
    } else if (route[0] === 'users' && !route[1]) {
      page = <ClientRedirect to="/superadmin/users/admin" />;
    } else if (route[0] === 'users') {
      page = <SuperAdminUsers />;
    } else if (route[0] === 'merchant') {
      page = <SuperAdminMerchant />;
    } else if (route[0] === 'payment-method') {
      page = <SuperAdminPaymentMethod />;
    } else if (route[0] === 'receipt-settings') {
      page = <SuperAdminReceiptSettings />;
    } else if (route[0] === 'profile') {
      page = <SuperAdminProfile />;
    } else if (route[0] === 'products') {
      page = <SuperAdminProducts />;
    } else if (route[0] === 'orders') {
      page = <SuperAdminOrders />;
    } else if (route[0] === 'transactions') {
      page = <SuperAdminTransactions />;
    } else {
      page = <ClientRedirect to="/superadmin/dashboard" />;
    }

    return (
      <ProtectedRoute allowedRoles={['super_admin']}>
        <SuperAdminLayout>{page}</SuperAdminLayout>
      </ProtectedRoute>
    );
  }

  return <RootRedirect />;
}

export default function App() {
  return (
    <NavigationProgressProvider>
      <AuthProvider>
        <AuthProgressBridge />
        <LoadingProvider>
          <AlertProvider>
            <AppRoutes />
          </AlertProvider>
        </LoadingProvider>
      </AuthProvider>
    </NavigationProgressProvider>
  );
}
