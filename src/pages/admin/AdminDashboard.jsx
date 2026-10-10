import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatCards from '../../components/dashboard/StatCard';
import DailySalesChart from '../../components/dashboard/DailySalesChart';
import PaymentMethodDonut from '../../components/dashboard/PaymentMethodDonut';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import { fetchDashboardData } from '../../services/dashboardService';
import { subscribeToTransactions } from '../../services/transactionService';

const initialDashboardState = {
  summary: {
    todaySales: { label: 'PENJUALAN HARI INI', value: 0, formattedValue: 'Rp 0', trend: '0%', isPositive: true, comparisonText: 'Database Live PostgreSQL', icon: 'cash-register' },
    totalTransactions: { label: 'TOTAL TRANSAKSI', value: 0, formattedValue: '0', trend: '0', isPositive: true, comparisonText: 'pesanan tercatat di PostgreSQL', icon: 'receipt' },
    productsSold: { label: 'PRODUK TERJUAL', value: 0, unit: 'item', formattedValue: '0', categoryHighlight: 'Menu Aktif', highlightText: 'tercatat dari kasir', icon: 'coffee' },
    averageOrder: { label: 'RATA-RATA PESANAN', value: 0, formattedValue: 'Rp 0', trend: '0%', isPositive: true, comparisonText: 'Database live posan_db', icon: 'trending-up' },
  },
  chartData: [],
  chartMeta: { title: 'Tren Penjualan Harian', tag: 'Live PostgreSQL', subtitle: 'Distribusi pergerakan omzet', legend: [], footerNote: 'Data bersumber langsung dari database PostgreSQL posan_db.', serviceHours: 'Operasional Aktif' },
  paymentData: { title: 'Metode Pembayaran', subtitle: 'Proporsi pembayaran transaksi', dominantMethod: { label: 'Terbanyak', name: '-', percentage: 0 }, methods: [] },
  recentTransactions: [],
};

export default function AdminDashboard({ onNavigate }) {
  const [activePeriod, setActivePeriod] = useState('today');
  const [customRange, setCustomRange] = useState({
    start: '2026-09-01',
    end: '2026-09-27',
    label: '01 Sep - 27 Sep 2026'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [dashboardData, setDashboardData] = useState(initialDashboardState);

  const showToast = (title, message) => {
    setToastMessage({ title, message });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadDashboard = async (period = activePeriod, showSyncToast = false, range = customRange) => {
    if (showSyncToast) setIsRefreshing(true);
    try {
      const data = await fetchDashboardData(period, range);
      if (data) {
        setDashboardData(data);
      }
      if (showSyncToast) {
        showToast(
          'Data Dashboard Disinkronkan',
          'Metrik penjualan dan pesanan berhasil diperbarui secara realtime dari database PostgreSQL posan_db.'
        );
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      if (showSyncToast) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard(activePeriod, false, customRange);

    // Subscribe to realtime transactions in Posan Server
    const unsubscribe = subscribeToTransactions(() => {
      loadDashboard(activePeriod, false, customRange);
      showToast('Aktivitas Penjualan Baru', 'Dashboard diperbarui dengan transaksi POS terbaru.');
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activePeriod]);

  const handleRefresh = () => {
    loadDashboard(activePeriod, true, customRange);
  };

  const handlePeriodChange = (periodId) => {
    setActivePeriod(periodId);
    const labels = {
      today: 'Hari Ini (Realtime)',
      '7days': '7 Hari Terakhir',
      '30days': '30 Hari (Bulan Berjalan)',
      custom: `Kustom (${customRange.label})`
    };
    showToast(
      'Periode Diperbarui',
      `Menampilkan analitik performa untuk periode ${labels[periodId] || periodId}.`
    );
  };

  const handleCustomRangeChange = (rangeObj) => {
    setCustomRange(rangeObj);
    setActivePeriod('custom');
    loadDashboard('custom', false, rangeObj);
  };

  return (
    <main className="dashboard-content" role="main">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          <div className="toast-icon-wrapper">
            <CheckCircle2 size={20} />
          </div>
          <div className="toast-content">
            <span className="toast-title">{toastMessage.title}</span>
            <span className="toast-message">{toastMessage.message}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Welcome Greeting & Filter Controls */}
      <WelcomeBanner
        activePeriod={activePeriod}
        onPeriodChange={handlePeriodChange}
        customRange={customRange}
        onCustomRangeChange={handleCustomRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Key Metric Stat Cards */}
      <StatCards stats={dashboardData.summary} />

      {/* 3. Analytics Charts */}
      <section className="analytics-row" aria-label="Analisis Penjualan dan Pembayaran">
        <DailySalesChart
          chartData={dashboardData.chartData}
          chartMeta={dashboardData.chartMeta}
        />
        <PaymentMethodDonut paymentData={dashboardData.paymentData} />
      </section>

      {/* 4. Recent Transactions Table */}
      <RecentTransactions
        onNavigate={onNavigate}
        transactions={dashboardData.recentTransactions}
      />
    </main>
  );
}
