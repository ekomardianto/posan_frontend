import React, { useState, useMemo } from 'react';
import {
  Calendar,
  User,
  Clock,
  Timer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Utensils,
  Receipt,
  Sparkles,
  UserCheck,
  FileSpreadsheet,
  Download,
  Filter
} from 'lucide-react';
import ExportDropdown from './ExportDropdown';
import AttendanceDetailModal from './AttendanceDetailModal';
import { formatIndonesianDate, formatTimeOnly, checkIsOnTime, formatDuration } from '../../services/attendanceService';

export default function AttendanceReportTable({
  tableData = [],
  periodLabel = 'Seminggu (7 Hari)',
  searchKeyword = '',
  onExportExcel,
  onExportPDF,
  onExportCSV,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const rowsPerPage = 8;

  // Active combined search
  const activeSearch = (localSearch || searchKeyword || '').toLowerCase().trim();

  // Filter rows
  const filteredData = useMemo(() => {
    if (!activeSearch) {
      return tableData;
    }
    return tableData.filter((row) => {
      const matchName = (row.user_name || '').toLowerCase().includes(activeSearch);
      const matchRole = (row.role || '').toLowerCase().includes(activeSearch);
      const matchDate = (row.date || '').toLowerCase().includes(activeSearch);
      const matchNotes = (row.notes || '').toLowerCase().includes(activeSearch);
      return matchName || matchRole || matchDate || matchNotes;
    });
  }, [tableData, activeSearch]);

  // Pagination
  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleOpenDetail = (row) => {
    setSelectedRecordDetail(row);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedRecordDetail(null);
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getRoleIcon = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('kitchen') || r.includes('koki')) return <Utensils size={12} />;
    if (r.includes('kasir')) return <Receipt size={12} />;
    return <Coffee size={12} />;
  };

  const getRoleBadgeClass = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('kitchen')) return 'badge-kitchen';
    if (r.includes('kasir')) return 'badge-kasir';
    return 'badge-barista';
  };

  const getRoleLabel = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('kitchen')) return 'Kitchen';
    if (r.includes('kasir')) return 'Kasir';
    return 'Barista';
  };

  return (
    <article className="attendance-table-card animate-fade-in" aria-label="Tabel Laporan Presensi Staf">
      {/* 1. Card Top Control Bar */}
      <div className="att-table-header-bar">
        <div className="att-table-title-group">
          <div className="att-table-pill-indicator">
            <span className="live-ping-mini" />
            <span className="live-dot-mini" />
            <span>LOG RESMI PRESENSI STAF</span>
          </div>
          <h2 className="att-table-main-title">Riwayat Absensi Masuk & Keluar Shift</h2>
          <p className="att-table-sub-caption">
            Sinkronisasi otomatis dari perangkat Mobile POS ({periodLabel})
          </p>
        </div>

        {/* Action Controls: Search & Export Dropdown */}
        <div className="att-table-actions-group">
          <div className="att-table-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Cari di tabel presensi..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <ExportDropdown
            onExportExcel={onExportExcel}
            onExportPDF={onExportPDF}
            onExportCSV={onExportCSV}
          />
        </div>
      </div>

      {/* 2. Responsive Table View */}
      <div className="att-table-responsive-wrapper">
        <table className="att-custom-data-table">
          <thead>
            <tr>
              <th scope="col" className="col-idx">No</th>
              <th scope="col" className="col-date">Hari / Tanggal</th>
              <th scope="col" className="col-staff">Staf / Karyawan</th>
              <th scope="col" className="col-role">Stasiun / Peran</th>
              <th scope="col" className="col-in">Jam Masuk</th>
              <th scope="col" className="col-out">Jam Pulang</th>
              <th scope="col" className="col-duration">Durasi Shift</th>
              <th scope="col" className="col-status">Status</th>
              <th scope="col" className="col-action">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="att-empty-table-row">
                  <div className="att-empty-state-card">
                    <UserCheck size={38} className="empty-state-icon" strokeWidth={1.5} />
                    <h3 className="empty-state-heading">Tidak Ada Data Presensi</h3>
                    <p className="empty-state-sub">
                      Tidak ada riwayat kehadiran yang sesuai dengan filter atau pencarian Anda.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => {
                const globalIndex = startIndex + index + 1;
                const isOnTime = checkIsOnTime(row.check_in_time);
                const isWorking = row.status === 'working';
                const roleClass = getRoleBadgeClass(row.role);
                const roleIcon = getRoleIcon(row.role);
                const roleName = getRoleLabel(row.role);
                const inTimeStr = formatTimeOnly(row.check_in_time);
                const outTimeStr = row.check_out_time ? formatTimeOnly(row.check_out_time) : null;
                const durationClean = row.durationSeconds
                  ? formatDuration(row.durationSeconds)
                  : (row.formattedDuration || '-').replace(/\s*\(berjalan\)/gi, '');

                return (
                  <tr key={row.id || index} className="att-data-row animate-row-appear">
                    {/* Index */}
                    <td className="col-idx">
                      <span className="att-row-idx">{globalIndex}</span>
                    </td>

                    {/* Date */}
                    <td className="col-date">
                      <div className="att-date-col">
                        <span className="att-date-main">{formatIndonesianDate(row.date)}</span>
                        <span className="att-date-iso">{row.date}</span>
                      </div>
                    </td>

                    {/* Staff Name & Avatar */}
                    <td className="col-staff">
                      <div className="att-staff-profile-col">
                        <div className="att-avatar-circle">
                          <span>{getInitials(row.user_name)}</span>
                          {isWorking && <span className="avatar-online-dot" />}
                        </div>
                        <div className="att-staff-text-group">
                          <span className="att-staff-full-name">{row.user_name}</span>
                          <span className="att-staff-id-tag">ID: {row.user_id || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Station */}
                    <td className="col-role">
                      <span className={`att-station-badge ${roleClass}`}>
                        {roleIcon}
                        <span>{roleName}</span>
                      </span>
                    </td>

                    {/* Check-In */}
                    <td className="col-in">
                      <div className="att-time-cell-box">
                        <span className="time-val-bold">{inTimeStr}</span>
                        <span className={`time-punctuality-micro ${isOnTime ? 'micro-ontime' : 'micro-late'}`}>
                          {isOnTime ? '✓ Tepat Waktu' : 'Terlambat'}
                        </span>
                      </div>
                    </td>

                    {/* Check-Out */}
                    <td className="col-out">
                      {isWorking ? (
                        <span className="time-ongoing-dash" title="Shift masih berlangsung">—</span>
                      ) : (
                        <span className="time-val-bold text-out-time">{outTimeStr || '-'}</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="col-duration">
                      <div className={`att-duration-badge ${isWorking ? 'duration-active' : 'duration-done'}`}>
                        <Timer size={12} className="duration-icon" />
                        <span>{durationClean}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="col-status">
                      {isWorking ? (
                        <span className="att-status-pill pill-working">
                          <span className="pulse-dot-beacon" />
                          <span>Sedang Bekerja</span>
                        </span>
                      ) : (
                        <span className="att-status-pill pill-completed">
                          <CheckCircle2 size={12} />
                          <span>Shift Selesai</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="col-action">
                      <button
                        type="button"
                        className="att-action-pill-btn"
                        onClick={() => handleOpenDetail(row)}
                        title="Buka rincian lengkap presensi staf"
                      >
                        <Eye size={12} />
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

      {/* 3. Table Pagination Footer */}
      <div className="att-table-pagination-footer">
        <div className="pagination-count-summary">
          <span>
            Menampilkan <strong>{paginatedRows.length}</strong> dari <strong>{totalRows}</strong> riwayat presensi
          </span>
        </div>

        <div className="pagination-controls-row">
          <button
            type="button"
            className="att-pag-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={14} />
            <span>Sebelumnya</span>
          </button>

          <span className="att-pag-indicator">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            type="button"
            className="att-pag-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            aria-label="Halaman selanjutnya"
          >
            <span>Selanjutnya</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecordDetail && (
        <AttendanceDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetail}
          record={selectedRecordDetail}
        />
      )}
    </article>
  );
}
