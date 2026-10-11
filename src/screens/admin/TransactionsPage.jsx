import React, { useState, useEffect, useMemo } from 'react';
import { Download, RefreshCw, CheckCircle2, X } from 'lucide-react';
import {
  fetchTransactions,
  fetchTransactionDetail,
  computeTransactionStats,
  subscribeToTransactions
} from '../../services/transactionService';
import TransactionStats from '../../components/transactions/TransactionStats';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import TransactionTable from '../../components/transactions/TransactionTable';
import TransactionDetailPanel from '../../components/transactions/TransactionDetailPanel';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [detailedTransaction, setDetailedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Semua Tanggal');
  const [selectedCashier, setSelectedCashier] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Sync animation & Toast state
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, message) => {
    setToastMessage({ title, message });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadTransactions = async (showSyncToast = false) => {
    if (showSyncToast) setIsSyncing(true);
    else setIsLoading(true);

    try {
      const data = await fetchTransactions();
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);

      if (list.length > 0) {
        const activeId = selectedTransactionId || list[0].id;
        setSelectedTransactionId(activeId);
        const match = list.find((d) => d.id === activeId) || list[0];
        if (match && (!detailedTransaction || detailedTransaction.id !== match.id)) {
          fetchTransactionDetail(match.numericId || match.id).then((full) => {
            if (full) setDetailedTransaction(full);
            else setDetailedTransaction(match);
          });
        }
      } else {
        setSelectedTransactionId(null);
        setDetailedTransaction(null);
      }

      if (showSyncToast) {
        showToast('Sinkronisasi Berhasil', 'Data transaksi telah diperbarui secara realtime dari database.');
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      if (showSyncToast) {
        showToast('Sinkronisasi Gagal', 'Gagal memuat data dari database.');
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadTransactions();

    // Subscribe to realtime changes in Posan Server
    const unsubscribe = subscribeToTransactions((newData) => {
      if (newData && newData.length > 0) {
        setTransactions(newData);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      if (!trx) return false;

      // 1. Search filter
      const q = (searchQuery || '').toLowerCase().trim();
      const idStr = (trx.id || '').toString().toLowerCase();
      const receiptStr = (trx.receiptNumber || '').toString().toLowerCase();
      const cashierStr = (trx.cashierName || '').toString().toLowerCase();
      const customerStr = (trx.customerName || '').toString().toLowerCase();
      const methodStr = (trx.paymentMethod || '').toString().toLowerCase();
      const itemsMatch = Array.isArray(trx.items) && trx.items.some((item) => (item?.name || '').toLowerCase().includes(q));

      const matchSearch =
        !q ||
        idStr.includes(q) ||
        receiptStr.includes(q) ||
        cashierStr.includes(q) ||
        customerStr.includes(q) ||
        methodStr.includes(q) ||
        itemsMatch;

      // 2. Cashier filter
      const matchCashier =
        selectedCashier === 'all' ||
        cashierStr.includes(selectedCashier.toLowerCase());

      // 3. Payment Method filter
      const matchMethod =
        selectedPaymentMethod === 'all' ||
        methodStr.includes(selectedPaymentMethod.toLowerCase());

      // 4. Status filter
      const statusStr = (trx.status || '').toString().toLowerCase();
      const matchStatus =
        selectedStatus === 'all' ||
        statusStr === selectedStatus.toLowerCase();

      return matchSearch && matchCashier && matchMethod && matchStatus;
    });
  }, [transactions, searchQuery, selectedCashier, selectedPaymentMethod, selectedStatus]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Active transaction object for detail panel
  const activeTransaction = useMemo(() => {
    if (detailedTransaction && detailedTransaction.id === selectedTransactionId) {
      return detailedTransaction;
    }
    return (
      transactions.find((trx) => trx.id === selectedTransactionId) ||
      paginatedTransactions[0] ||
      null
    );
  }, [transactions, selectedTransactionId, detailedTransaction, paginatedTransactions]);

  // Dynamic statistics
  const dynamicStats = useMemo(() => {
    return computeTransactionStats(transactions);
  }, [transactions]);

  // Handle row selection
  const handleSelectTransaction = async (trx) => {
    if (!trx) return;
    setSelectedTransactionId(trx.id);
    setIsDetailOpen(true);
    setDetailedTransaction(trx);

    // Fetch complete items and logs detail
    try {
      const fullDetail = await fetchTransactionDetail(trx.numericId || trx.id);
      if (fullDetail) {
        setDetailedTransaction(fullDetail);
      }
    } catch (e) {
      console.warn('Failed to load item detail:', e);
    }
  };

  // Handle Sync
  const handleSync = () => {
    loadTransactions(true);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const csvHeader = 'No Transaksi,Kasir,Waktu,Metode Pembayaran,Total,Status,Pelanggan\n';
    const csvRows = filteredTransactions
      .map((trx) => {
        return `"${trx.receiptNumber || trx.id}","${trx.cashierName || 'Kasir'}","${trx.fullTimestamp}","${trx.paymentMethod}","${trx.total}","${trx.status}","${trx.customerName || '-'}"`;
      })
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `riwayat_transaksi_posan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Ekspor Selesai', 'File riwayat transaksi berhasil diunduh dalam format CSV.');
  };

  // Handle Print Receipt
  const handlePrintReceipt = (trx) => {
    showToast('Mencetak Struk', `Perintah cetak ulang struk ${trx.id} dikirim ke printer thermal.`);
  };

  // Handle Send Receipt
  const handleSendReceipt = (trx) => {
    showToast('Bukti Terkirim', `E-Receipt ${trx.id} berhasil dikirimkan ke pelanggan.`);
  };

  return (
    <main className="transactions-page-container" role="main">
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

      {/* 1. Page Header Card */}
      <section className="trx-page-header-card animate-fade-in" aria-label="Header Transaksi">
        <div className="trx-header-left">
          <div className="trx-overline-tag">
            <span>BACKOFFICE PENJUALAN</span>
            <span>&bull;</span>
            <span className="trx-live-indicator">
              <span className="trx-live-dot pulse-indicator" />
              <span>Sinkronisasi database aktif</span>
            </span>
          </div>
          <h1 className="trx-page-title">Transaksi</h1>
          <p className="trx-page-subtitle">
            Riwayat seluruh pesanan dan penerimaan pembayaran online secara real-time tersinkron dari mesin kasir POS.
          </p>
        </div>

        <div className="trx-header-actions">
          <button
            type="button"
            className="btn-export-outline"
            onClick={handleExportCSV}
            title="Unduh Riwayat Transaksi CSV"
          >
            <Download size={15} strokeWidth={2.2} />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            className="btn-sync-dark"
            onClick={handleSync}
            disabled={isSyncing}
            title="Sinkronkan dengan Database POS"
          >
            <RefreshCw size={15} className={isSyncing ? 'spin-icon' : ''} strokeWidth={2.2} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi'}</span>
          </button>
        </div>
      </section>

      {/* 2. Key Metric Stat Cards */}
      <TransactionStats stats={dynamicStats} />

      {/* 3. Search & Filter Bar */}
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedCashier={selectedCashier}
        onCashierChange={(c) => {
          setSelectedCashier(c);
          setCurrentPage(1);
        }}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={(m) => {
          setSelectedPaymentMethod(m);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setCurrentPage(1);
        }}
      />

      {/* 4. Main Split Content Area */}
      <section className="trx-content-layout" aria-label="Daftar Transaksi dan Detail Struk">
        {/* Left Column: Transaction Table */}
        <div className={`trx-table-column ${!isDetailOpen ? 'full-width' : ''}`}>
          <TransactionTable
            transactions={paginatedTransactions}
            selectedTransactionId={isDetailOpen ? activeTransaction?.id : null}
            onSelectTransaction={handleSelectTransaction}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredTransactions.length}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Receipt Detail Panel */}
        {isDetailOpen && activeTransaction && (
          <div className="trx-detail-column">
            <TransactionDetailPanel
              transaction={activeTransaction}
              onClose={() => setIsDetailOpen(false)}
              onPrintReceipt={handlePrintReceipt}
              onSendReceipt={handleSendReceipt}
            />
          </div>
        )}
      </section>
    </main>
  );
}
