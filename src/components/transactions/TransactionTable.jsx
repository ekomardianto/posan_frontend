import React from 'react';
import {
  QrCode,
  Banknote,
  Landmark,
  Radio,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';

export default function TransactionTable({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  currentPage = 1,
  pageSize = 6,
  totalCount = 124,
  onPageChange
}) {
  const renderPaymentBadge = (method) => {
    switch (method.toLowerCase()) {
      case 'qris':
        return (
          <span className="trx-badge-method badge-qris">
            <QrCode size={12} strokeWidth={2.2} />
            <span>QRIS</span>
          </span>
        );
      case 'tunai':
        return (
          <span className="trx-badge-method badge-cash">
            <Banknote size={13} strokeWidth={2.2} />
            <span>Tunai</span>
          </span>
        );
      case 'bank transfer':
      case 'bank':
        return (
          <span className="trx-badge-method badge-bank">
            <Landmark size={12} strokeWidth={2.2} />
            <span>Bank Transfer</span>
          </span>
        );
      default:
        return (
          <span className="trx-badge-method badge-neutral">
            <span>{method}</span>
          </span>
        );
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages
    ];
  };

  const paginationItems = getPaginationItems();

  return (
    <div className="trx-table-card animate-fade-in" aria-label="Tabel Riwayat Transaksi">
      {/* Table Card Header */}
      <div className="trx-table-header-row">
        <div className="trx-table-title-group">
          <h2 className="trx-table-title">Daftar Transaksi</h2>
          <span className="trx-count-pill">{totalCount} Transaksi</span>
        </div>

        <div className="trx-realtime-badge">
          <Radio size={12} className="pulse-indicator" />
          <span>Realtime Feed</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="trx-table-responsive">
        <table className="trx-main-table">
          <thead>
            <tr>
              <th scope="col" className="col-trx-id">NO. TRANSAKSI</th>
              <th scope="col" className="col-cashier">KASIR</th>
              <th scope="col" className="col-time">WAKTU</th>
              <th scope="col" className="col-method">METODE</th>
              <th scope="col" className="col-total">TOTAL</th>
              <th scope="col" className="col-status">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx) => {
              const isSelected = selectedTransactionId === trx.id;

              return (
                <tr
                  key={trx.id}
                  className={`trx-table-row ${isSelected ? 'row-selected' : ''}`}
                  onClick={() => onSelectTransaction && onSelectTransaction(trx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTransaction && onSelectTransaction(trx);
                    }
                  }}
                  title={`Klik untuk melihat detail struk ${trx.id}`}
                >
                  {/* NO. TRANSAKSI */}
                  <td className="cell-trx-id">
                    <div className="trx-id-wrapper">
                      {isSelected && <span className="trx-selected-accent-bar" />}
                      <span className="trx-id-code">{trx.id}</span>
                    </div>
                  </td>

                  {/* KASIR */}
                  <td className="cell-cashier">
                    <div className="trx-cashier-group">
                      <span className="trx-cashier-name">{trx.cashierName}</span>
                      {trx.cashierRole && (
                        <span className="trx-cashier-role">{trx.cashierRole}</span>
                      )}
                    </div>
                  </td>

                  {/* WAKTU */}
                  <td className="cell-time">
                    <div className="trx-time-group">
                      <span className="trx-date-line">{trx.date}</span>
                      <span className="trx-time-line">{trx.time}</span>
                    </div>
                  </td>

                  {/* METODE */}
                  <td className="cell-method">
                    {renderPaymentBadge(trx.paymentMethod)}
                  </td>

                  {/* TOTAL */}
                  <td className="cell-total">
                    <span className="trx-total-price">
                      {trx.formattedTotal || `Rp${trx.total.toLocaleString('id-ID')}`}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="cell-status">
                    <span className="trx-status-pill status-paid">
                      <span className="trx-status-dot" />
                      <span>{trx.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}

            {transactions.length === 0 && (
              <tr>
                <td colSpan="6" className="trx-empty-state">
                  <Receipt size={32} className="trx-empty-icon" />
                  <p className="trx-empty-title">Tidak ada transaksi ditemukan</p>
                  <p className="trx-empty-desc">
                    Coba sesuaikan kata kunci pencarian atau filter yang Anda pilih.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="trx-table-footer">
        <span className="trx-pagination-info">
          Menampilkan {startItem}–{endItem} dari {totalCount} Transaksi
        </span>

        <div className="trx-pagination-controls">
          <button
            type="button"
            className="trx-page-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            aria-label="Halaman Sebelumnya"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>

          {paginationItems.map((item, index) => {
            if (item === '...') {
              return (
                <span key={`ellipsis-${index}`} className="trx-page-ellipsis">
                  &hellip;
                </span>
              );
            }

            const page = Number(item);
            return (
              <button
                key={page}
                type="button"
                className={`trx-page-btn page-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange && onPageChange(page)}
                aria-label={`Halaman ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            className="trx-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            aria-label="Halaman Selanjutnya"
            title="Halaman Selanjutnya"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
