import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from 'lucide-react';

export default function ExportDropdown({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="export-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="btn-export-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Pilih format ekspor data laporan"
      >
        <Download size={14} strokeWidth={2.2} />
        <span>Unduh Laporan</span>
        <ChevronDown size={13} className={`chevron-indicator ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="export-dropdown-menu animate-fade-in" role="menu">
          <div className="dropdown-header-title">PILIH FORMAT DOKUMEN</div>

          <button
            type="button"
            className="export-menu-item"
            role="menuitem"
            onClick={() => handleSelect(onExportExcel)}
          >
            <div className="menu-item-icon-box excel-theme">
              <FileSpreadsheet size={15} />
            </div>
            <div className="menu-item-text-group">
              <span className="menu-item-title">Export Spreadsheet (.xlsx)</span>
              <span className="menu-item-desc">Workbook Excel lengkap dengan grafik & KPI</span>
            </div>
          </button>

          <button
            type="button"
            className="export-menu-item"
            role="menuitem"
            onClick={() => handleSelect(onExportPDF)}
          >
            <div className="menu-item-icon-box pdf-theme">
              <FileText size={15} />
            </div>
            <div className="menu-item-text-group">
              <span className="menu-item-title">Export Dokumen PDF (.pdf)</span>
              <span className="menu-item-desc">Format cetak resmi Laporan Penjualan POSAN</span>
            </div>
          </button>

          <div className="dropdown-divider" />

          <button
            type="button"
            className="export-menu-item-alt"
            role="menuitem"
            onClick={() => handleSelect(onExportCSV)}
          >
            <FileText size={13} />
            <span>Export Raw Data (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
}
