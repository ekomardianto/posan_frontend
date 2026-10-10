import React, { useState, useMemo } from 'react';
import {
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Timer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Coffee,
  Utensils,
  Receipt,
  Award,
  Zap
} from 'lucide-react';
import ExportDropdown from './ExportDropdown';
import StaffOrderDetailModal from './StaffOrderDetailModal';
import { formatStaffName } from '../../services/staffReportService';

export default function StaffReportTable({
  tableData = [],
  periodLabel = 'Seminggu (7 Hari)',
  searchKeyword = '',
  onExportExcel,
  onExportPDF,
  onExportCSV,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedRowDetail, setSelectedRowDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const rowsPerPage = 8;

  // Effective search keyword (combining parent filter search with local table search if any)
  const activeSearch = (localSearch || searchKeyword || '').toLowerCase().trim();

  // Filter rows by search keyword if provided
  const filteredData = useMemo(() => {
    if (!activeSearch) {
      return tableData;
    }
    return tableData.filter((row) => {
      const matchName = (row.staffName || '').toLowerCase().includes(activeSearch);
      const matchRole =
        (row.staffRole || '').toLowerCase().includes(activeSearch) ||
        (row.roleBadgeLabel || '').toLowerCase().includes(activeSearch);
      const matchDate =
        (row.formattedDate || '').toLowerCase().includes(activeSearch) ||
        (row.dayName || '').toLowerCase().includes(activeSearch);
      const matchDetail = (row.detail || []).some(
        (d) =>
          (d.productName || '').toLowerCase().includes(activeSearch) ||
          (d.receiptNumber || '').toLowerCase().includes(activeSearch) ||
          (d.customerName || '').toLowerCase().includes(activeSearch)
      );
      return matchName || matchRole || matchDate || matchDetail;
    });
  }, [tableData, activeSearch]);

  // Pagination calculation
  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleOpenDetail = (row) => {
    setSelectedRowDetail(row);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedRowDetail(null);
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getRoleIcon = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('kitchen') || r.includes('koki') || r.includes('makan')) return <Utensils size={12} />;
    if (r.includes('kasir')) return <Receipt size={12} />;
    return <Coffee size={12} />;
  };

  return (
    <article className="staff-report-card-container animate-fade-in" aria-label="Tabel Laporan Kinerja Staf">
      {/* 1. Card Top Header Bar */}
      <div className="staff-table-card-header">
        <div className="table-header-title-box">
          <div className="table-live-tag">
            <span className="live-dot-pulse"></span>
            <span className="live-tag-text">KINERJA & PRODUKTIVITAS OPERASIONAL</span>
          </div>
          <h2 className="staff-table-main-title">Laporan Kinerja Staf</h2>
          <p className="staff-table-sub-title">
            Monitoring performa pengerjaan pesanan & kecepatan per staf • Periode:{' '}
            <strong className="text-[#8C5E3C]">{periodLabel}</strong>
          </p>
        </div>

        <div className="table-header-actions-group">
          {/* Quick Search */}
          <div className="staff-table-search-box">
            <Search size={14} className="staff-search-icon" />
            <input
              type="text"
              placeholder="Cari staf / menu / tanggal..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="staff-table-search-input"
            />
          </div>

          {/* Export Dropdown */}
          <ExportDropdown
            onExportExcel={onExportExcel}
            onExportPDF={onExportPDF}
            onExportCSV={onExportCSV}
            disabled={tableData.length === 0}
          />
        </div>
      </div>

      {/* 2. Main Responsive Table */}
      <div className="staff-table-responsive-wrapper">
        <table className="staff-custom-table" role="table">
          <thead>
            <tr>
              <th scope="col" className="col-th col-date">
                <div className="th-content-wrapper">
                  <Calendar size={13} className="th-icon" />
                  <span>HARI / TANGGAL</span>
                </div>
              </th>

              <th scope="col" className="col-th col-staff">
                <div className="th-content-wrapper">
                  <User size={13} className="th-icon" />
                  <span>STAF & POSISI</span>
                </div>
              </th>

              <th scope="col" className="col-th col-completed text-center">
                <div className="th-content-wrapper justify-center">
                  <CheckCircle2 size={13} className="th-icon text-emerald-600" />
                  <span>PESANAN SELESAI</span>
                </div>
              </th>

              <th scope="col" className="col-th col-processing text-center">
                <div className="th-content-wrapper justify-center">
                  <Clock size={13} className="th-icon text-amber-600" />
                  <span>SEDANG DIPROSES</span>
                </div>
              </th>

              <th scope="col" className="col-th col-avg-time">
                <div className="th-content-wrapper">
                  <Timer size={13} className="th-icon text-[#8C5E3C]" />
                  <span>RATA-RATA WAKTU</span>
                </div>
              </th>

              <th scope="col" className="col-th col-efficiency text-center">
                <div className="th-content-wrapper justify-center">
                  <Zap size={13} className="th-icon text-amber-600" />
                  <span>EFISIENSI</span>
                </div>
              </th>

              <th scope="col" className="col-th col-action text-center">
                <span>DETAIL</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="staff-table-empty-cell">
                  <div className="empty-state-inner">
                    <User size={36} className="empty-state-icon" />
                    <strong className="empty-state-title">Tidak Ada Data Kinerja Staf</strong>
                    <p className="empty-state-desc">
                      Tidak ditemukan riwayat pengerjaan pesanan staf untuk filter yang dipilih. Silakan sesuaikan
                      periode atau peran staf.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const staffDisplayName = formatStaffName(row.staffName);
                const roleKey = (row.staffRole || 'barista').toLowerCase();

                return (
                  <tr key={row.id} className="staff-table-row">
                    {/* 1. Hari / Tanggal */}
                    <td className="col-td col-date">
                      <div className="date-cell-box">
                        <div className="date-icon-badge">
                          <Calendar size={14} />
                        </div>
                        <div className="date-text-group">
                          <strong className="date-primary-text">{row.formattedDate || row.dateKey}</strong>
                          <span className="date-secondary-day">{row.dayName || 'Hari Kerja'}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Staf & Posisi */}
                    <td className="col-td col-staff">
                      <div className="staff-cell-box">
                        <div className={`staff-circle-avatar avatar-${roleKey}`}>
                          {getInitials(staffDisplayName)}
                        </div>
                        <div className="staff-info-details">
                          <span className="staff-primary-name">{staffDisplayName}</span>
                          <div className={`staff-station-pill pill-${roleKey}`}>
                            {getRoleIcon(row.staffRole)}
                            <span>{row.roleBadgeLabel || row.staffRole}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Total Pesanan Selesai */}
                    <td className="col-td col-completed text-center">
                      {row.completedCount > 0 ? (
                        <div className="metric-badge-pill pill-completed">
                          <CheckCircle2 size={13} className="badge-icon" />
                          <strong className="badge-value">{row.completedCount}</strong>
                          <span className="badge-label">pesanan</span>
                        </div>
                      ) : (
                        <span className="metric-badge-pill pill-zero">0 pesanan</span>
                      )}
                    </td>

                    {/* 4. Total Pesanan yang Masih Diproses */}
                    <td className="col-td col-processing text-center">
                      {row.processingCount > 0 ? (
                        <div className="metric-badge-pill pill-processing">
                          <span className="processing-pulse-dot"></span>
                          <strong className="badge-value">{row.processingCount}</strong>
                          <span className="badge-label">pesanan</span>
                        </div>
                      ) : (
                        <span className="metric-badge-pill pill-zero">0 pesanan</span>
                      )}
                    </td>

                    {/* 5. Rata-rata Waktu Penyelesaian */}
                    <td className="col-td col-avg-time">
                      <div className="time-metric-cell">
                        <div className="time-val-pill">
                          <Timer size={13} className="time-icon" />
                          <strong className="time-bold-text">{row.formattedAvgDuration || '0s'}</strong>
                        </div>
                        {row.completedCount > 0 && (
                          <span className={`time-speed-hint hint-${row.efficiencyVariant || 'normal'}`}>
                            {row.avgDurationSeconds <= 180
                              ? '⚡ Sangat Cepat'
                              : row.avgDurationSeconds <= 360
                              ? '✨ Optimal'
                              : '✓ Standar'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Rating Efisiensi */}
                    <td className="col-td col-efficiency text-center">
                      <span className={`efficiency-status-badge eff-${row.efficiencyVariant || 'normal'}`}>
                        {row.efficiencyRating || 'Standar ✓'}
                      </span>
                    </td>

                    {/* 7. Aksi / Detail */}
                    <td className="col-td col-action text-center">
                      <button
                        type="button"
                        className="btn-action-detail"
                        onClick={() => handleOpenDetail(row)}
                        title={`Lihat detail pengerjaan pesanan oleh ${staffDisplayName}`}
                      >
                        <Eye size={13} />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Card Pagination Footer */}
      <div className="staff-table-footer-bar">
        <div className="footer-entry-info">
          Menampilkan <strong>{totalRows > 0 ? startIndex + 1 : 0}</strong> -{' '}
          <strong>{Math.min(startIndex + rowsPerPage, totalRows)}</strong> dari{' '}
          <strong>{totalRows}</strong> entri pengerjaan staf
        </div>

        {totalPages > 1 && (
          <div className="footer-pagination-controls" role="navigation" aria-label="Navigasi Halaman">
            <button
              type="button"
              className="page-control-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  type="button"
                  className={`page-num-btn ${currentPage === pNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pNum)}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              type="button"
              className="page-control-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* 4. Interactive Detail Modal Popup */}
      <StaffOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        rowData={selectedRowDetail}
      />
    </article>
  );
}
