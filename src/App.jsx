import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';

// Admin Outlet Components & Pages
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductsPage from './pages/admin/ProductsPage.jsx';
import CategoriesPage from './pages/admin/CategoriesPage.jsx';
import TransactionsPage from './pages/admin/TransactionsPage.jsx';
import CashiersPage from './pages/admin/CashiersPage.jsx';
import PaymentMethodsPage from './pages/admin/PaymentMethodsPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import ProfilePage from './pages/admin/ProfilePage.jsx';
import ReceiptSettingsPage from './pages/admin/ReceiptSettingsPage.jsx';
import BaristaOrdersPage from './pages/barista/BaristaOrdersPage.jsx';
import KitchenOrdersPage from './pages/kitchen/KitchenOrdersPage.jsx';

// Super Admin Layout & Pages (Matching POSAN Superadmin)
import SuperAdminLayout from './components/layout/SuperAdminLayout.jsx';
import SuperAdminDashboard from './pages/superadmin/Dashboard.jsx';
import SuperAdminUsers from './pages/superadmin/Users.jsx';
import SuperAdminMerchant from './pages/superadmin/Merchant.jsx';
import SuperAdminPaymentMethod from './pages/superadmin/PaymentMethod.jsx';
import SuperAdminReceiptSettings from './pages/superadmin/ReceiptSettings.jsx';
import SuperAdminProfile from './pages/superadmin/Profile.jsx';
import SuperAdminProducts from './pages/superadmin/Products.jsx';
import SuperAdminOrders from './pages/superadmin/Orders.jsx';
import SuperAdminTransactions from './pages/superadmin/Transactions.jsx';

import LoadingPage from './components/ui/LoadingPage.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import { AlertProvider } from './context/AlertContext.jsx';

// Loading Spinner Screen
function LoadingScreen() {
  return (
    <LoadingPage
      title="Memuat Sesi POSAN Cloud..."
      message="Menghubungkan ke PostgreSQL Cloud posan_db & menyinkronkan data..."
      tip="Aplikasi POS Mobile & Web Admin terintegrasi realtime."
    />
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, isSuperAdmin, isAdmin, rawRole } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Non-admin roles (kasir, barista, kitchen) are never permitted in Web Admin
  if (rawRole === 'kasir' || rawRole === 'barista' || rawRole === 'kitchen') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(rawRole) ||
      (allowedRoles.includes('super_admin') && isSuperAdmin) ||
      (allowedRoles.includes('admin') && isAdmin);

    if (!isAllowed) {
      if (isSuperAdmin) {
        return <Navigate to="/superadmin/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

// Admin Café Layout Container (Khusus Admin Outlet)
function AdminPortalLayout() {
  const [adminNav, setAdminNav] = useState('dashboard');

  const renderAdminContent = () => {
    switch (adminNav) {
      case 'dashboard':
      case 'beranda':
        return <AdminDashboard onNavigate={setAdminNav} />;
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
      <Sidebar activeNav={adminNav} onSelectNav={setAdminNav} />
      <div className="main-wrapper">
        <Header onSelectNav={setAdminNav} />
        {renderAdminContent()}
      </div>
    </div>
  );
}

// Smart Root Redirect based on Role
function RootRedirect() {
  const { isAuthenticated, isLoading, isSuperAdmin, isAdmin } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated || (!isSuperAdmin && !isAdmin)) return <Navigate to="/login" replace />;

  if (isSuperAdmin) {
    return <Navigate to="/superadmin/dashboard" replace />;
  }
  return <Navigate to="/admin" replace />;
}

// Login Page Wrapper (Redirects if already authenticated as admin/superadmin)
function LoginRoute() {
  const { isAuthenticated, isLoading, isSuperAdmin, isAdmin } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && (isSuperAdmin || isAdmin)) {
    if (isSuperAdmin) {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Auth Route */}
      <Route path="/login" element={<LoginRoute />} />

      {/* 2. Super Admin Workspace (Super Admin Only) */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="users" element={<Navigate to="/superadmin/users/admin" replace />} />
        <Route path="users/:roleTab" element={<SuperAdminUsers />} />
        <Route path="merchant" element={<SuperAdminMerchant />} />
        <Route path="payment-method" element={<SuperAdminPaymentMethod />} />
        <Route path="receipt-settings" element={<SuperAdminReceiptSettings />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="products" element={<SuperAdminProducts />} />
        <Route path="orders" element={<SuperAdminOrders />} />
        <Route path="transactions" element={<SuperAdminTransactions />} />
        <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
      </Route>

      {/* 3. Admin Outlet Workspace (Admin Only) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminPortalLayout />
          </ProtectedRoute>
        }
      />

      {/* Root and Fallbacks */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AlertProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AlertProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}
