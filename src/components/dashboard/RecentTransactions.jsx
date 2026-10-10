import React, { useState } from 'react';
import { Search, ArrowRight, Info, QrCode, Banknote, Landmark } from 'lucide-react';
import { defaultAdminProfile as adminProfile } from '../../constants/appConstants';
import TransactionModal from './TransactionModal';

export default function RecentTransactions({ onNavigate, transactions = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const transactionList = Array.isArray(transactions) ? transactions : [];

  const filteredTransactions = transactionList.filter((trx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      trx.id.toLowerCase().includes(q) ||
      (trx.cashierName && trx.cashierName.toLowerCase().includes(q)) ||
      (trx.paymentMethod && trx.paymentMethod.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || trx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderPaymentBadge = (method = '') => {
    switch (method.toLowerCase()) {
      case 'qris':
        return (
          <span className="payment-badge qris">
            <QrCode size={11} strokeWidth={2.2} />
            <span>QRIS</span>
          </span>
        );
      case 'tunai':
      case 'cash':
        return (
          <span className="payment-badge tunai">
            <Banknote size={12} strokeWidth={2} />
            <span>Tunai</span>
          </span>
        );
      case 'bank':
      case 'bank transfer':
        return (
          <span className="payment-badge bank">
            <Landmark size={11} strokeWidth={2} />
            <span>Bank</span>
          </span>
        );
      default:
        return <span className="payment-badge">{method}</span>;
    }
  };

  return (
    <>
      <article className="transactions-card animate-fade-in" aria-label="Daftar Transaksi Terbaru">
        {/* Header and Filter Controls */}
        <div className="transactions-header-row">
          <div className="card-title-group">
            <div className="card-title-row">
              <h2 className="card-title">Transaksi Terbaru</h2>
              <span className="trans-title-badge">Realtime Database</span>
            </div>
            <span className="card-subtitle">
              Catatan pesanan kasir yang selesai secara realtime dari database POSAN
            </span>
          </div>

          <div className="transactions-actions">
            <div className="search-input-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nomor transaksi / kasir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Pencarian Transaksi"
              />
            </div>

            <select
              className="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter Status"
            >
              <option value="ALL">Semua Status</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
            </select>

            <button
              type="button"
              className="btn-view-all"
              onClick={() => onNavigate && onNavigate('transaksi')}
              title="Lihat Halaman Transaksi Lengkap"
            >
              <span>Lihat Semua</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th scope="col">ID TRANSAKSI</th>
                <th scope="col">KASIR BERTUGAS</th>
                <th scope="col">WAKTU PESAN</th>
                <th scope="col">METODE</th>
                <th scope="col">TOTAL NOMINAL</th>
                <th scope="col">STATUS</th>
                <th scope="col">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((trx) => (
                <tr key={trx.id}>
                  <td className="trx-id">{trx.id}</td>
                  <td>
                    <div className="cashier-cell">
                      <div
                        className="cashier-avatar-badge"
                        style={{
                          backgroundColor: trx.cashierColor || '#F5EBE1',
                          color: trx.cashierTextColor || '#7D5537'
                        }}
                      >
                        {trx.cashierInitial || 'K'}
                      </div>
                      <span className="cashier-name">{trx.cashierName}</span>
                    </div>
                  </td>
                  <td className="time-cell">{trx.time}</td>
                  <td>{renderPaymentBadge(trx.paymentMethod)}</td>
                  <td className="nominal-cell">{trx.formattedNominal}</td>
                  <td>
                    <span className="status-badge">{trx.status}</span>
                  </td>
                  <td className="action-cell">
                    <button
                      type="button"
                      className="btn-detail"
                      onClick={() => setSelectedTransaction(trx)}
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Tidak ada transaksi yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informational Footer Banner */}
        <div className="table-footer-banner">
          <div className="footer-banner-left">
            <Info size={15} style={{ flexShrink: 0 }} />
            <span>
              Terkoneksi langsung ke Posan Database Server. Semua transaksi terpusat dan aman.
            </span>
          </div>
          <div className="footer-engine-badge">
            {adminProfile.engineVersion}
          </div>
        </div>
      </article>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onOpenFullTransaction={() => {
            setSelectedTransaction(null);
            if (onNavigate) onNavigate('transaksi');
          }}
        />
      )}
    </>
  );
}
