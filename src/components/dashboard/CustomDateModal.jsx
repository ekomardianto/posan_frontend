import React, { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';

export default function CustomDateModal({ isOpen, onClose, onApply, currentRange }) {
  const [startDate, setStartDate] = useState(currentRange?.start || '2026-09-01');
  const [endDate, setEndDate] = useState(currentRange?.end || '2026-09-25');

  if (!isOpen) return null;

  const handlePresetClick = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const formatDateStr = (dStr) => {
      const d = new Date(dStr);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const label = `${formatDateStr(startDate)} - ${formatDateStr(endDate)}`;
    onApply({
      start: startDate,
      end: endDate,
      label
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card custom-date-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-circle">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="modal-title">Rentang Tanggal Kustom</h3>
              <p className="modal-sub">Pilih tanggal awal dan akhir untuk menyaring analitik dashboard</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleApply} className="custom-date-form-body">
          {/* Quick Presets */}
          <div className="custom-date-presets-section">
            <span className="preset-section-label">PILIHAN CEPAT:</span>
            <div className="preset-buttons-grid">
              <button
                type="button"
                className="preset-btn"
                onClick={() => handlePresetClick('2026-09-19', '2026-09-25')}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handlePresetClick('2026-09-12', '2026-09-25')}
              >
                14 Hari Terakhir
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handlePresetClick('2026-09-01', '2026-09-25')}
              >
                Bulan Ini (Sep 2026)
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => handlePresetClick('2026-08-01', '2026-08-31')}
              >
                Bulan Lalu (Agu 2026)
              </button>
            </div>
          </div>

          {/* Date Pickers */}
          <div className="date-inputs-row">
            <div className="date-input-box">
              <label className="date-label" htmlFor="custom-start-date">
                Dari Tanggal:
              </label>
              <input
                id="custom-start-date"
                type="date"
                className="date-native-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="date-input-box">
              <label className="date-label" htmlFor="custom-end-date">
                Sampai Tanggal:
              </label>
              <input
                id="custom-end-date"
                type="date"
                className="date-native-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary-dark"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Terapkan Rentang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
