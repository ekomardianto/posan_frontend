import React, { useEffect } from 'react';
import { X, User, Calendar, CheckCircle2, Clock, Timer, Coffee, Utensils, Receipt, FileText, ChevronRight } from 'lucide-react';
import { formatStaffName } from '../../services/staffReportService';

export default function StaffOrderDetailModal({
  isOpen,
  onClose,
  rowData,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !rowData) return null;

  const displayName = formatStaffName(rowData.staffName);

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getStationIcon = (station) => {
    const s = (station || '').toLowerCase();
    if (s.includes('kitchen') || s.includes('makan') || s.includes('food')) {
      return <Utensils size={13} className="text-amber-700" />;
    }
    if (s.includes('kasir')) {
      return <Receipt size={13} className="text-blue-700" />;
    }
    return <Coffee size={13} className="text-amber-900" />;
  };

  const details = rowData.detail || [];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="staff-detail-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-top-header">
          <div className="modal-header-profile">
            <div className={`staff-modal-avatar role-${(rowData.staffRole || 'barista').toLowerCase()}`}>
              {getInitials(displayName)}
            </div>
            <div className="modal-header-text">
              <div className="staff-modal-name-row">
                <h3 className="staff-modal-name">{displayName}</h3>
                <span className={`staff-role-pill role-${(rowData.staffRole || 'barista').toLowerCase()}`}>
                  {rowData.roleBadgeLabel || rowData.staffRole || 'Staf'}
                </span>
              </div>
              <div className="staff-modal-date-sub">
                <Calendar size={13} />
                <span>Hari / Tanggal Tugas: <strong>{rowData.formattedDate || rowData.dateKey}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mini KPI Bar inside modal */}
        <div className="staff-modal-kpi-bar">
          <div className="modal-kpi-pill success">
            <CheckCircle2 size={16} />
            <div className="kpi-pill-text">
              <span className="pill-title">Selesai Dikerjakan</span>
              <strong className="pill-val">{rowData.completedCount || 0} Item</strong>
            </div>
          </div>

          <div className="modal-kpi-pill warning">
            <Clock size={16} />
            <div className="kpi-pill-text">
              <span className="pill-title">Sedang Diproses</span>
              <strong className="pill-val">{rowData.processingCount || 0} Item</strong>
            </div>
          </div>

          <div className="modal-kpi-pill brown">
            <Timer size={16} />
            <div className="kpi-pill-text">
              <span className="pill-title">Rata-rata Waktu</span>
              <strong className="pill-val">{rowData.formattedAvgDuration || '0s'}</strong>
            </div>
          </div>
        </div>

        {/* Modal Table Container */}
        <div className="staff-modal-table-section">
          <div className="modal-section-title-row">
            <h4>Rincian Pesanan yang Ditangani ({details.length} Pesanan)</h4>
            <span className="modal-table-subtitle">Data waktu riil pengerjaan per item menu</span>
          </div>

          <div className="modal-table-wrapper">
            {details.length === 0 ? (
              <div className="modal-table-empty">
                <FileText size={32} strokeWidth={1.5} className="empty-icon" />
                <p>Tidak ada rincian pesanan yang tercatat untuk staf ini pada tanggal tersebut.</p>
              </div>
            ) : (
              <table className="staff-modal-table">
                <thead>
                  <tr>
                    <th>No. Struk</th>
                    <th>Pelanggan</th>
                    <th>Menu / Produk</th>
                    <th>Stasiun</th>
                    <th>Waktu Masuk</th>
                    <th>Mulai Proses</th>
                    <th>Selesai</th>
                    <th>Durasi</th>
                    <th>Status</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((item, idx) => (
                    <tr key={item.itemId || idx}>
                      <td>
                        <span className="receipt-code-tag">{item.receiptNumber}</span>
                      </td>
                      <td>
                        <span className="customer-name-text">{item.customerName || 'Pelanggan'}</span>
                      </td>
                      <td>
                        <div className="product-cell-name">
                          <strong>{item.productName}</strong>
                          <span className="product-cell-qty">{item.quantity}x</span>
                        </div>
                      </td>
                      <td>
                        <div className="station-cell-badge">
                          {getStationIcon(item.station)}
                          <span>{item.stationLabel || item.station}</span>
                        </div>
                      </td>
                      <td className="time-col">{item.orderTime || '-'}</td>
                      <td className="time-col">{item.processingTime || '-'}</td>
                      <td className="time-col">{item.completedTime || '-'}</td>
                      <td>
                        <span className={`duration-badge ${item.status === 'completed' ? 'done' : 'running'}`}>
                          <Timer size={11} />
                          {item.formattedDuration}
                        </span>
                      </td>
                      <td>
                        <span className={`item-status-pill status-${item.status || 'pending'}`}>
                          <span className="status-dot" />
                          {item.statusLabel || item.status}
                        </span>
                      </td>
                      <td className="notes-col">{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-row">
          <span className="modal-footer-hint">
            * Durasi dihitung dari waktu pesanan mulai diproses hingga status ditandai selesai.
          </span>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
