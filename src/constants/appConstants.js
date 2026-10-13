/**
 * POSAN Admin Café - UI Constants & Configuration
 * Navigation, filter configurations, and system defaults
 */

export const navigationMenu = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    subtitle: 'Ringkasan & Analitik',
    icon: 'LayoutGrid'
  },
  {
    id: 'produk',
    name: 'Produk',
    subtitle: 'Katalog & Menu',
    icon: 'Coffee'
  },
  {
    id: 'kategori',
    name: 'Kategori',
    subtitle: 'Grup & Klasifikasi',
    icon: 'Layers'
  },
  {
    id: 'transaksi',
    name: 'Transaksi',
    subtitle: 'Riwayat & Detail',
    icon: 'Receipt'
  },
  {
    id: 'laporan',
    name: 'Laporan',
    subtitle: 'Laporan Penjualan',
    icon: 'BarChart3'
  },
  {
    id: 'kasir',
    name: 'Staf Kasir',
    subtitle: 'Kelola Akses Kasir',
    icon: 'Users'
  }
];

export const filterRanges = [
  { id: 'today', label: 'Hari Ini' },
  { id: '7days', label: '7 Hari Terakhir' },
  { id: '30days', label: '30 Hari' },
  { id: 'custom', label: 'Kustom Rentang' }
];

export const quickCategorySuggestions = [
  { label: '+ Kopi', value: 'Kopi Espresso Base', description: 'Menu berbasis espresso dan seduh manual', station: 'barista' },
  { label: '+ Non-Kopi', value: 'Signature Mocktail', description: 'Minuman segar non-kopi, artisan tea & mocktail', station: 'barista' },
  { label: '+ Makanan', value: 'Cemilan & Snack', description: 'Makanan ringan, hidangan utama & gorengan', station: 'kitchen' },
  { label: '+ Pastry & Bakery', value: 'Pastry & Bakery', description: 'Croissant, donat dan aneka kue hangat', station: 'kitchen' },
  { label: '+ Retail / Non-Dapur', value: 'Merchandise & Retail', description: 'Biji kopi kemasan, tumbler & aksesoris', station: 'none' }
];

export const defaultProductCategories = [
  { id: 'all', name: 'Semua Kategori' },
  { id: 'Coffee', name: 'Coffee' },
  { id: 'Beverage', name: 'Beverage' },
  { id: 'Food', name: 'Food' },
  { id: 'Dessert', name: 'Dessert' }
];

export const defaultStoreInfo = {
  brandName: 'POSAN Coffee',
  subBrand: '',
  branch: '',
  city: '',
  phone: '',
  fullLocation: '',
  receiptFooterMessage: 'Terima kasih atas kunjungan Anda!'
};

export const defaultAdminProfile = {
  name: 'Admin POSAN',
  shortName: 'Admin',
  role: 'Admin Café',
  outletName: 'Kopi Kenangan Senopati',
  branch: 'Cabang Sudirman',
  city: 'Pekanbaru',
  fullLocation: 'Cabang Sudirman, Pekanbaru',
  syncStatus: 'database Terkoneksi',
  isSynced: true,
  lastUpdated: '1 menit yang lalu',
  systemTime: 'Hari ini',
  engineVersion: 'POSAN Engine v2.4',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const securityProtocolInfo = {
  title: 'Protokol Keamanan Staf',
  description: 'Setiap akun staf (Kasir, Barista, Kitchen) memiliki kredensial resmi pada database. Penggantian PIN & password disarankan berkala minimal 30 hari.'
};

export const lastAuditInfo = {
  title: 'Audit Keamanan & Sesi',
  description: 'Otentikasi terhubung langsung dengan database via Express Backend.'
};

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'Sistem Terhubung',
    message: 'database aktif & tersinkronisasi.',
    time: 'Baru saja',
    isRead: false,
    type: 'system'
  }
];
