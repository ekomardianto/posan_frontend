import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, X, BarChart3, Users, Clock, Timer, Sparkles, UserCheck } from 'lucide-react';
import { fetchReportData } from '../../services/reportService';
import { fetchStaffPerformanceReport } from '../../services/staffReportService';
import { fetchAttendanceReport } from '../../services/attendanceService';
import {
  exportReportToExcel,
  exportReportToPDF,
  exportReportToCSV,
  exportStaffReportToExcel,
  exportStaffReportToPDF,
  exportStaffReportToCSV,
  exportAttendanceToExcel,
  exportAttendanceToPDF,
  exportAttendanceToCSV,
} from '../../utils/exportReportUtils';

// Sales Report Components
import ReportHeader from '../../components/reports/ReportHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportKpiCards from '../../components/reports/ReportKpiCards';
import SalesPeriodChart from '../../components/reports/SalesPeriodChart';
import PaymentMethodReport from '../../components/reports/PaymentMethodReport';
import TopSellingProducts from '../../components/reports/TopSellingProducts';
import ProductSalesReportTable from '../../components/reports/ProductSalesReportTable';
import TransactionSummaryTable from '../../components/reports/TransactionSummaryTable';

// Staff Report Components
import StaffReportFilters from '../../components/reports/StaffReportFilters';
import StaffReportKpiCards from '../../components/reports/StaffReportKpiCards';
import StaffProductivityChart from '../../components/reports/StaffProductivityChart';
import StaffLeaderboard from '../../components/reports/StaffLeaderboard';
import StaffStationBreakdown from '../../components/reports/StaffStationBreakdown';
import StaffReportTable from '../../components/reports/StaffReportTable';

// Attendance Report Components (Mobile POS Integration)
import AttendanceReportFilters from '../../components/reports/AttendanceReportFilters';
import AttendanceReportKpiCards from '../../components/reports/AttendanceReportKpiCards';
import AttendanceAnalyticsOverview from '../../components/reports/AttendanceAnalyticsOverview';
import AttendanceReportTable from '../../components/reports/AttendanceReportTable';

const initialEmptySalesReport = {
  kpi: {
    totalTransactions: { label: 'TOTAL TRANSAKSI', value: 0, formattedValue: '0', changeText: '0%', isPositive: true, comparisonText: 'Data Live database', iconType: 'receipt' },
    totalSales: { label: 'TOTAL PENJUALAN', value: 0, formattedValue: 'Rp0', changeText: '0%', isPositive: true, comparisonText: 'Data Live database', iconType: 'wallet' },
    productsSold: { label: 'PRODUK TERJUAL', value: 0, unit: 'item', formattedValue: '0', changeText: '0%', isPositive: true, comparisonText: 'Data Live database', iconType: 'coffee' },
    averageTransaction: { label: 'RATA-RATA TRANSAKSI', value: 0, formattedValue: 'Rp0', changeText: '0%', isPositive: true, comparisonText: 'Data Live database', iconType: 'chart' },
  },
  salesPeriodChart: { granularity: 'Harian', dailyData: [], weeklyData: [], monthlyData: [], summaryFooter: { average: { label: 'Rata-rata', formattedValue: 'Rp0', rawValue: 0 }, lowest: { label: 'Terendah', formattedValue: 'Rp0', rawValue: 0 }, highest: { label: 'Hari Teramai', formattedValue: '-', isHighlight: true } } },
  paymentMethods: { totalPercentage: 0, methods: [] },
  topProducts: [],
  productReportsTable: [],
  dailyTransactionsTable: [],
};

const initialEmptyStaffReport = {
  kpi: {
    totalActiveStaff: { label: 'TOTAL STAF BERTUGAS', value: 0, formattedValue: '0 Orang', comparisonText: 'Barista, Kitchen & Kasir', iconType: 'users' },
    totalCompletedOrders: { label: 'TOTAL PESANAN SELESAI', value: 0, formattedValue: '0 Item', comparisonText: 'Terselesaikan Tepat Waktu', iconType: 'check-circle' },
    totalProcessingOrders: { label: 'PESANAN MASIH DIPROSES', value: 0, formattedValue: '0 Item', comparisonText: 'Dalam Antrean / Proses', iconType: 'flame' },
    averageCompletionTime: { label: 'RATA-RATA WAKTU SELESAI', value: 0, formattedValue: '0s', comparisonText: 'Kecepatan Pelayanan Tim', iconType: 'timer' },
    topPerformer: { label: 'STAF PALING PRODUKTIF', formattedValue: '-', iconType: 'award' },
  },
  staffPerformanceTable: [],
  availableStaffList: [],
};

const initialEmptyAttendanceReport = {
  kpi: {
    totalRecords: { label: 'TOTAL PRESENSI', value: 0, formattedValue: '0 Kehadiran', comparisonText: 'Tercatat di sistem', iconType: 'calendar' },
    activeWorking: { label: 'STAF AKTIF SAAT INI', value: 0, formattedValue: '0 Orang', comparisonText: 'Sedang bertugas di outlet', iconType: 'user-check' },
    totalWorkHours: { label: 'TOTAL JAM KERJA', value: 0, formattedValue: '0 Jam', comparisonText: 'Akumulasi seluruh shift', iconType: 'clock' },
    avgShiftHours: { label: 'RATA-RATA DURASI SHIFT', value: 0, formattedValue: '0 Jam', comparisonText: 'Standar 8 jam reguler', iconType: 'timer' },
    onTimeRate: { label: 'TINGKAT KETEPATAN WAKTU', value: 100, formattedValue: '100%', comparisonText: 'Tepat waktu', iconType: 'award' },
  },
  attendanceRecords: [],
  availableStaffList: [],
  periodLabel: 'Seminggu (7 Hari)',
};

export default function ReportsPage({ initialTab = 'penjualan' }) {
  // Main Tab State: 'penjualan' | 'staf' | 'absen'
  const [activeTab, setActiveTab] = useState(
    initialTab === 'absen' || initialTab === 'absensi'
      ? 'absen'
      : initialTab === 'staf'
      ? 'staf'
      : 'penjualan'
  );

  // Update tab if initialTab changes externally
  useEffect(() => {
    if (initialTab === 'absen' || initialTab === 'absensi') {
      setActiveTab('absen');
    } else if (initialTab === 'staf') {
      setActiveTab('staf');
    } else if (initialTab === 'penjualan') {
      setActiveTab('penjualan');
    }
  }, [initialTab]);

  // ==========================================
  // 1. Sales Report States
  // ==========================================
  const [activePeriod, setActivePeriod] = useState('7days');
  const [dateRangeText, setDateRangeText] = useState('Seminggu (7 Hari)');
  const [selectedCashier, setSelectedCashier] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [currentReportData, setCurrentReportData] = useState(initialEmptySalesReport);

  // ==========================================
  // 2. Staff Report States
  // ==========================================
  const [staffPeriod, setStaffPeriod] = useState('7days');
  const [staffDateRangeText, setStaffDateRangeText] = useState('Seminggu (7 Hari)');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [staffSearchKeyword, setStaffSearchKeyword] = useState('');
  const [currentStaffData, setCurrentStaffData] = useState(initialEmptyStaffReport);

  // ==========================================
  // 3. Attendance Report States (Mobile POS)
  // ==========================================
  const [attendancePeriod, setAttendancePeriod] = useState('7days');
  const [attendanceDateRangeText, setAttendanceDateRangeText] = useState('Seminggu (7 Hari)');
  const [selectedAttendanceStaff, setSelectedAttendanceStaff] = useState('all');
  const [selectedAttendanceRole, setSelectedAttendanceRole] = useState('all');
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState('all');
  const [attendanceSearchKeyword, setAttendanceSearchKeyword] = useState('');
  const [currentAttendanceData, setCurrentAttendanceData] = useState(initialEmptyAttendanceReport);

  // Shared UI & Feedback States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message) => {
    setToastMessage({ title, message });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Sales Report Data
  const loadSalesReport = async (period = activePeriod, cashier = selectedCashier, method = selectedPaymentMethod, customStart = null, customEnd = null) => {
    try {
      const data = await fetchReportData(period, cashier, method, customStart, customEnd);
      if (data) {
        setCurrentReportData(data);
      }
    } catch (err) {
      console.error('Error loading sales report:', err);
    }
  };

  // Load Staff Report Data
  const loadStaffReport = async (period = staffPeriod, staff = selectedStaff, role = selectedRole, customStart = null, customEnd = null) => {
    try {
      const data = await fetchStaffPerformanceReport(period, staff, role, customStart, customEnd);
      if (data) {
        setCurrentStaffData(data);
      }
    } catch (err) {
      console.error('Error loading staff performance report:', err);
    }
  };

  // Load Attendance Report Data
  const loadAttendanceReport = async (
    period = attendancePeriod,
    staff = selectedAttendanceStaff,
    role = selectedAttendanceRole,
    status = selectedAttendanceStatus,
    search = attendanceSearchKeyword,
    customStart = null,
    customEnd = null
  ) => {
    try {
      const data = await fetchAttendanceReport(period, staff, role, status, search, customStart, customEnd);
      if (data) {
        setCurrentAttendanceData(data);
      }
    } catch (err) {
      console.error('Error loading attendance report:', err);
    }
  };

  // Initial Load
  useEffect(() => {
    loadSalesReport(activePeriod, selectedCashier, selectedPaymentMethod);
    loadStaffReport(staffPeriod, selectedStaff, selectedRole);
    loadAttendanceReport(attendancePeriod, selectedAttendanceStaff, selectedAttendanceRole, selectedAttendanceStatus);
  }, []);


  // Sync Data Handler
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        loadSalesReport(activePeriod, selectedCashier, selectedPaymentMethod),
        loadStaffReport(staffPeriod, selectedStaff, selectedRole),
        loadAttendanceReport(attendancePeriod, selectedAttendanceStaff, selectedAttendanceRole, selectedAttendanceStatus),
      ]);
      showToast(
        'Sinkronisasi Berhasil',
        'Data laporan penjualan, performa staf & presensi POSAN telah diperbarui langsung dari database.'
      );
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // ==========================================
  // Filter Handlers
  // ==========================================
  const handleApplySalesFilters = async (overridePeriod, customStart, customEnd, overrideCashier, overrideMethod) => {
    const periodToUse = overridePeriod || activePeriod;
    const cashierToUse = overrideCashier !== undefined ? overrideCashier : selectedCashier;
    const methodToUse = overrideMethod !== undefined ? overrideMethod : selectedPaymentMethod;

    setIsApplying(true);
    try {
      const updatedData = await fetchReportData(periodToUse, cashierToUse, methodToUse, customStart, customEnd);
      if (updatedData) {
        setCurrentReportData(updatedData);
      }
      const cashierLabel = cashierToUse === 'all' ? 'Semua Kasir' : cashierToUse;
      const methodLabel = methodToUse === 'all' ? 'Semua Metode' : (methodToUse === 'cash' ? 'Tunai' : methodToUse === 'bank' ? 'Bank / Debit' : methodToUse.toUpperCase());
      showToast(
        'Laporan Penjualan Diperbarui',
        `Menampilkan data penjualan untuk periode ${updatedData.periodLabel || periodToUse} • ${cashierLabel} • ${methodLabel}.`
      );
    } catch (err) {
      console.error('Apply sales filters error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyStaffFilters = async (overridePeriod, customStart, customEnd, overrideStaff, overrideRole) => {
    const periodToUse = overridePeriod || staffPeriod;
    const staffToUse = overrideStaff !== undefined ? overrideStaff : selectedStaff;
    const roleToUse = overrideRole !== undefined ? overrideRole : selectedRole;

    setIsApplying(true);
    try {
      const updatedData = await fetchStaffPerformanceReport(periodToUse, staffToUse, roleToUse, customStart, customEnd);
      if (updatedData) {
        setCurrentStaffData(updatedData);
      }
      const staffLabel = staffToUse === 'all' ? 'Semua Staf' : staffToUse;
      const roleLabel = roleToUse === 'all' ? 'Semua Peran' : roleToUse.toUpperCase();
      showToast(
        'Laporan Staf Diperbarui',
        `Menampilkan kinerja staf periode ${updatedData.periodLabel || periodToUse} • ${staffLabel} (${roleLabel}).`
      );
    } catch (err) {
      console.error('Apply staff filters error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyAttendanceFilters = async (overridePeriod, customStart, customEnd, overrideStaff, overrideRole, overrideStatus) => {
    const periodToUse = overridePeriod || attendancePeriod;
    const staffToUse = overrideStaff !== undefined ? overrideStaff : selectedAttendanceStaff;
    const roleToUse = overrideRole !== undefined ? overrideRole : selectedAttendanceRole;
    const statusToUse = overrideStatus !== undefined ? overrideStatus : selectedAttendanceStatus;

    setIsApplying(true);
    try {
      const updatedData = await fetchAttendanceReport(periodToUse, staffToUse, roleToUse, statusToUse, attendanceSearchKeyword, customStart, customEnd);
      if (updatedData) {
        setCurrentAttendanceData(updatedData);
      }
      showToast(
        'Laporan Presensi Diperbarui',
        `Menampilkan data kehadiran untuk periode ${updatedData.periodLabel || periodToUse}.`
      );
    } catch (err) {
      console.error('Apply attendance filters error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // ==========================================
  // Sales Export Handlers
  // ==========================================
  const handleExportSalesExcel = () => {
    try {
      exportReportToExcel(currentReportData, {
        dateRangeText,
        cashierName: selectedCashier === 'all' ? 'Semua Kasir' : selectedCashier,
        paymentMethodName: selectedPaymentMethod === 'all' ? 'Semua Metode' : selectedPaymentMethod
      });
      showToast('Ekspor Excel Berhasil', `File Spreadsheet penjualan periode ${dateRangeText} telah diunduh.`);
    } catch (err) {
      console.error('Failed to export sales Excel:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat memproses spreadsheet.');
    }
  };

  const handleExportSalesPDF = () => {
    try {
      exportReportToPDF(currentReportData, {
        dateRangeText,
        cashierName: selectedCashier === 'all' ? 'Semua Kasir' : selectedCashier,
        paymentMethodName: selectedPaymentMethod === 'all' ? 'Semua Metode' : selectedPaymentMethod
      });
      showToast('Ekspor PDF Berhasil', `Dokumen Laporan Penjualan POSAN (.pdf) telah diunduh.`);
    } catch (err) {
      console.error('Failed to export sales PDF:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat membuat dokumen PDF.');
    }
  };

  const handleExportSalesCSV = () => {
    try {
      exportReportToCSV(currentReportData, {
        dateRangeText,
        cashierName: selectedCashier === 'all' ? 'Semua Kasir' : selectedCashier,
        paymentMethodName: selectedPaymentMethod === 'all' ? 'Semua Metode' : selectedPaymentMethod
      });
      showToast('Ekspor CSV Berhasil', `File raw data (.csv) berhasil diunduh.`);
    } catch (err) {
      console.error('Failed to export sales CSV:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat mengekspor CSV.');
    }
  };

  // ==========================================
  // Staff Export Handlers
  // ==========================================
  const handleExportStaffExcel = () => {
    try {
      exportStaffReportToExcel(currentStaffData, {
        dateRangeText: staffDateRangeText,
        staffName: selectedStaff === 'all' ? 'Semua Staf' : selectedStaff,
        roleName: selectedRole === 'all' ? 'Semua Peran' : selectedRole.toUpperCase()
      });
      showToast('Ekspor Excel Berhasil', `Spreadsheet Laporan Kinerja Staf (${staffDateRangeText}) telah diunduh.`);
    } catch (err) {
      console.error('Failed to export staff Excel:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat mengekspor data staf.');
    }
  };

  const handleExportStaffPDF = () => {
    try {
      exportStaffReportToPDF(currentStaffData, {
        dateRangeText: staffDateRangeText,
        staffName: selectedStaff === 'all' ? 'Semua Staf' : selectedStaff,
        roleName: selectedRole === 'all' ? 'Semua Peran' : selectedRole.toUpperCase()
      });
      showToast('Ekspor PDF Berhasil', `Dokumen PDF Laporan Kinerja Staf telah diunduh.`);
    } catch (err) {
      console.error('Failed to export staff PDF:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat membuat dokumen PDF.');
    }
  };

  const handleExportStaffCSV = () => {
    try {
      exportStaffReportToCSV(currentStaffData, {
        dateRangeText: staffDateRangeText,
        staffName: selectedStaff === 'all' ? 'Semua Staf' : selectedStaff,
        roleName: selectedRole === 'all' ? 'Semua Peran' : selectedRole.toUpperCase()
      });
      showToast('Ekspor CSV Berhasil', `File CSV Laporan Kinerja Staf telah diunduh.`);
    } catch (err) {
      console.error('Failed to export staff CSV:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat mengekspor CSV.');
    }
  };

  // ==========================================
  // Attendance Export Handlers
  // ==========================================
  const handleExportAttendanceExcel = () => {
    try {
      exportAttendanceToExcel(currentAttendanceData, {
        dateRangeText: attendanceDateRangeText,
        staffName: selectedAttendanceStaff === 'all' ? 'Semua Staf' : selectedAttendanceStaff,
        roleName: selectedAttendanceRole === 'all' ? 'Semua Peran' : selectedAttendanceRole.toUpperCase(),
        statusName: selectedAttendanceStatus === 'all' ? 'Semua Status' : selectedAttendanceStatus
      });
      showToast('Ekspor Excel Berhasil', `File Spreadsheet presensi staf (${attendanceDateRangeText}) telah diunduh.`);
    } catch (err) {
      console.error('Failed to export attendance Excel:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat memproses spreadsheet presensi.');
    }
  };

  const handleExportAttendancePDF = () => {
    try {
      exportAttendanceToPDF(currentAttendanceData, {
        dateRangeText: attendanceDateRangeText,
        staffName: selectedAttendanceStaff === 'all' ? 'Semua Staf' : selectedAttendanceStaff,
        roleName: selectedAttendanceRole === 'all' ? 'Semua Peran' : selectedAttendanceRole.toUpperCase(),
        statusName: selectedAttendanceStatus === 'all' ? 'Semua Status' : selectedAttendanceStatus
      });
      showToast('Ekspor PDF Berhasil', `Dokumen PDF Laporan Presensi Staf telah diunduh.`);
    } catch (err) {
      console.error('Failed to export attendance PDF:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat membuat dokumen PDF.');
    }
  };

  const handleExportAttendanceCSV = () => {
    try {
      exportAttendanceToCSV(currentAttendanceData, {
        dateRangeText: attendanceDateRangeText,
        staffName: selectedAttendanceStaff === 'all' ? 'Semua Staf' : selectedAttendanceStaff,
        roleName: selectedAttendanceRole === 'all' ? 'Semua Peran' : selectedAttendanceRole.toUpperCase(),
        statusName: selectedAttendanceStatus === 'all' ? 'Semua Status' : selectedAttendanceStatus
      });
      showToast('Ekspor CSV Berhasil', `File CSV Laporan Presensi Staf telah diunduh.`);
    } catch (err) {
      console.error('Failed to export attendance CSV:', err);
      showToast('Gagal Mengekspor', 'Terjadi kesalahan saat mengekspor CSV presensi.');
    }
  };


  return (
    <main className="reports-page-container" role="main">
      {/* Floating Toast Notification */}
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

      {/* 1. Header Section with Dynamic Title & Realtime Sync Button */}
      <ReportHeader
        onSync={handleSync}
        isSyncing={isSyncing}
        activeTab={activeTab}
      />

      {/* 2. Subtab Navigation Bar */}
      <div className="report-subtab-nav-wrapper">
        <div className="report-subtab-nav" role="tablist" aria-label="Navigasi Jenis Laporan">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'penjualan'}
            className={`report-subtab-btn ${activeTab === 'penjualan' ? 'active' : ''}`}
            onClick={() => setActiveTab('penjualan')}
          >
            <BarChart3 size={15} />
            <span>Laporan Penjualan</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'staf'}
            className={`report-subtab-btn ${activeTab === 'staf' ? 'active' : ''}`}
            onClick={() => setActiveTab('staf')}
          >
            <Users size={15} />
            <span>Laporan Staf</span>
            <span className="report-subtab-badge">Produktivitas</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'absen'}
            className={`report-subtab-btn ${activeTab === 'absen' ? 'active' : ''}`}
            onClick={() => setActiveTab('absen')}
          >
            <UserCheck size={15} />
            <span>Presensi Staf</span>
            <span className="report-subtab-badge" style={{ backgroundColor: '#15803D' }}>Mobile POS</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LAPORAN PENJUALAN & TRANSAKSI
          ========================================================================= */}
      {activeTab === 'penjualan' && (
        <div className="tab-pane animate-fade-in">
          {/* Sales Filter Bar */}
          <ReportFilters
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod}
            dateRangeText={dateRangeText}
            onDateRangeChange={setDateRangeText}
            selectedCashier={selectedCashier}
            onCashierChange={setSelectedCashier}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
            onApplyFilters={handleApplySalesFilters}
            isApplying={isApplying}
          />

          {/* Sales 4 KPI Cards */}
          <ReportKpiCards kpiData={currentReportData.kpi} />

          {/* Sales Analytics Row (Chart & Payment Breakdown) */}
          <section className="report-analytics-row" aria-label="Analisis Grafik dan Peringkat">
            <SalesPeriodChart chartData={currentReportData.salesPeriodChart} />
            <div className="report-right-stack">
              <PaymentMethodReport paymentData={currentReportData.paymentMethods} />
              <TopSellingProducts products={currentReportData.topProducts} />
            </div>
          </section>

          {/* Sales Product Report Table */}
          <ProductSalesReportTable
            tableData={currentReportData.productReportsTable}
            periodLabel={currentReportData.periodLabel || dateRangeText}
          />

          {/* Daily Transaction Summary Table */}
          <TransactionSummaryTable
            tableData={currentReportData.dailyTransactionsTable}
            onExportExcel={handleExportSalesExcel}
            onExportPDF={handleExportSalesPDF}
            onExportCSV={handleExportSalesCSV}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: LAPORAN KINERJA & PRODUKTIVITAS STAF
          ========================================================================= */}
      {activeTab === 'staf' && (
        <div className="tab-pane animate-fade-in">
          {/* Staff Filter Bar: Hari/Tanggal, Staf, Peran, Search */}
          <StaffReportFilters
            activePeriod={staffPeriod}
            onPeriodChange={setStaffPeriod}
            dateRangeText={staffDateRangeText}
            onDateRangeChange={setStaffDateRangeText}
            selectedStaff={selectedStaff}
            onStaffChange={setSelectedStaff}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            searchKeyword={staffSearchKeyword}
            onSearchChange={setStaffSearchKeyword}
            onApplyFilters={handleApplyStaffFilters}
            isApplying={isApplying}
            availableStaffList={currentStaffData.availableStaffList}
          />

          {/* Staff 4 KPI Overview Cards */}
          <StaffReportKpiCards kpiData={currentStaffData.kpi} />

          {/* Staff Middle Analytics Row: Productivity Progress Comparison + Leaderboard & Station Breakdown */}
          <section className="report-analytics-row staff-analytics-row" aria-label="Analisis Performa Staf">
            {/* Left Column: Visual Progress Comparison */}
            <StaffProductivityChart
              staffTableData={currentStaffData.staffPerformanceTable}
              periodLabel={staffDateRangeText}
            />

            {/* Right Column: Leaderboard & Station Breakdown */}
            <div className="report-right-stack">
              <StaffLeaderboard staffTableData={currentStaffData.staffPerformanceTable} />
              <StaffStationBreakdown staffTableData={currentStaffData.staffPerformanceTable} />
            </div>
          </section>

          {/* Main Staff Report Table (Hari/Tanggal, Staf, Selesai, Diproses, Rata2 Waktu, Detail Modal) */}
          <StaffReportTable
            tableData={currentStaffData.staffPerformanceTable}
            periodLabel={currentStaffData.periodLabel || staffDateRangeText}
            searchKeyword={staffSearchKeyword}
            onExportExcel={handleExportStaffExcel}
            onExportPDF={handleExportStaffPDF}
            onExportCSV={handleExportStaffCSV}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: LAPORAN PRESENSI & JAM KERJA STAF (MOBILE POS INTEGRATION)
          ========================================================================= */}
      {activeTab === 'absen' && (
        <div className="tab-pane animate-fade-in">
          {/* Attendance Filter Bar: Hari/Tanggal, Staf, Peran, Status, Search */}
          <AttendanceReportFilters
            activePeriod={attendancePeriod}
            onPeriodChange={setAttendancePeriod}
            dateRangeText={attendanceDateRangeText}
            onDateRangeChange={setAttendanceDateRangeText}
            selectedStaff={selectedAttendanceStaff}
            onStaffChange={setSelectedAttendanceStaff}
            selectedRole={selectedAttendanceRole}
            onRoleChange={setSelectedAttendanceRole}
            selectedStatus={selectedAttendanceStatus}
            onStatusChange={setSelectedAttendanceStatus}
            searchKeyword={attendanceSearchKeyword}
            onSearchChange={setAttendanceSearchKeyword}
            onApplyFilters={handleApplyAttendanceFilters}
            isApplying={isApplying}
            availableStaffList={currentAttendanceData.availableStaffList}
          />

          {/* Attendance 5 KPI Overview Cards */}
          <AttendanceReportKpiCards kpiData={currentAttendanceData.kpi} />

          {/* Attendance Analytics & Real-Time Monitoring */}
          <AttendanceAnalyticsOverview
            attendanceRecords={currentAttendanceData.attendanceRecords}
            kpiData={currentAttendanceData.kpi}
            periodLabel={currentAttendanceData.periodLabel || attendanceDateRangeText}
          />

          {/* Main Attendance Report Table & Detail Modal */}
          <AttendanceReportTable
            tableData={currentAttendanceData.attendanceRecords}
            periodLabel={currentAttendanceData.periodLabel || attendanceDateRangeText}
            searchKeyword={attendanceSearchKeyword}
            onExportExcel={handleExportAttendanceExcel}
            onExportPDF={handleExportAttendancePDF}
            onExportCSV={handleExportAttendanceCSV}
          />
        </div>
      )}
    </main>
  );
}

