import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import ExportDropdown from './ExportDropdown';

export default function TransactionSummaryTable({
  tableData = [],
  onExportExcel,
  onExportPDF,
  onExportCSV
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // 4 rows per page matching mockup "Menampilkan 1-4 dari 12 data periode"

  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return tableData.slice(startIdx, startIdx + pageSize);
  }, [tableData, currentPage, pageSize]);

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <article className="report-card report-table-card animate-fade-in" aria-label="Tabel Ringkasan Transaksi">
      {/* Table Header Bar */}
      <div className="report-table-header-bar">
        <div className="table-title-group">
          <h2 className="report-card-title">Ringkasan Transaksi</h2>
          <span className="report-card-subtitle">
            Rincian performa transaksi harian dalam rentang waktu yang ditentukan
          </span>
        </div>

        <div className="table-header-action-group">
          <ExportDropdown
            onExportExcel={onExportExcel}
            onExportPDF={onExportPDF}
            onExportCSV={onExportCSV}
          />
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="report-table-responsive">
        <table className="report-custom-table">
          <thead>
            <tr>
              <th scope="col" className="th-tanggal">TANGGAL</th>
              <th scope="col" className="th-trx">JUMLAH TRANSAKSI</th>
              <th scope="col" className="th-sales">TOTAL PENJUALAN</th>
              <th scope="col" className="th-avg">RATA-RATA TRANSAKSI</th>
              <th scope="col" className="th-status">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.id} className="report-table-row">
                  {/* Tanggal with Calendar Icon */}
                  <td className="td-tanggal">
                    <div className="date-cell-flex">
                      <Calendar size={15} className="date-row-icon" />
                      <span className="date-row-text">{row.date}</span>
                    </div>
                  </td>

                  {/* Jumlah Transaksi */}
                  <td className="td-trx">
                    <span className="trx-count-text">{row.formattedTransactions}</span>
                  </td>

                  {/* Total Penjualan */}
                  <td className="td-sales">
                    <span className="total-sales-text">{row.formattedTotalSales}</span>
                  </td>

                  {/* Rata-rata Transaksi (Warm Bronze Color) */}
                  <td className="td-avg">
                    <span className="avg-trx-text">{row.formattedAvgTransaction}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="td-status">
                    <span className="status-pill-completed">
                      <span className="status-pill-dot" />
                      <span>{row.status}</span>
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table-empty-row">
                  Tidak ada data transaksi untuk filter yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="report-table-pagination-footer">
        <div className="pagination-info-text">
          {totalItems > 0 ? (
            <>Menampilkan {startRecord}–{endRecord} dari {totalItems} data periode</>
          ) : (
            <>Menampilkan 0 data periode</>
          )}
        </div>

        {/* Page Nav Buttons */}
        <div className="pagination-controls" role="navigation" aria-label="Paginasi Halaman Laporan">
          <button
            type="button"
            className="page-nav-arrow-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
              aria-current={currentPage === pageNum ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            className="page-nav-arrow-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            aria-label="Halaman Selanjutnya"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
