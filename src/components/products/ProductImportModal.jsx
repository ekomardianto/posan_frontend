import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileUp,
  Trash2,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { parseProductImportFile, downloadProductImportTemplate } from '../../utils/exportProductUtils';
import { createProduct } from '../../services/productService';

export default function ProductImportModal({ isOpen, onClose, onSuccess, categories = [] }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setParseError(null);
    setIsImporting(false);
    setImportProgress({ current: 0, total: 0 });
    setImportResult(null);
  };

  const handleFileProcess = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setParseError('Format file tidak didukung. Harap pilih file berekstensi .xlsx, .xls, atau .csv');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setImportResult(null);

    try {
      const rows = await parseProductImportFile(file);
      if (!rows || rows.length === 0) {
        throw new Error('Tidak ada data produk yang valid ditemukan dalam file Excel.');
      }
      setParsedRows(rows);
    } catch (err) {
      console.error('Error parsing excel:', err);
      setParseError(err.message || 'Gagal membaca isi file Excel.');
      setSelectedFile(null);
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setParseError('Tidak ada baris data produk yang valid untuk diimpor.');
      return;
    }

    setIsImporting(true);
    setImportProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    let failCount = 0;
    const errorDetails = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setImportProgress({ current: i + 1, total: validRows.length });

      try {
        const payload = {
          name: row.name,
          price: row.price,
          category: row.category,
          station: row.station,
          status: row.status,
          imageUrl: row.imageUrl,
          description: row.description || row.imageUrl || '',
        };

        const res = await createProduct(payload);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
          errorDetails.push(`Baris ${row.rowNumber} (${row.name}): ${res.error || 'Gagal'}`);
        }
      } catch (err) {
        failCount++;
        errorDetails.push(`Baris ${row.rowNumber} (${row.name}): ${err.message || 'Gagal'}`);
      }
    }

    setIsImporting(false);
    setImportResult({
      total: validRows.length,
      success: successCount,
      failed: failCount,
      errors: errorDetails,
    });

    if (successCount > 0 && onSuccess) {
      onSuccess(successCount);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card product-import-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge import-badge">
              <FileSpreadsheet size={20} color="#10B981" />
            </div>
            <div>
              <h2 className="modal-title">Import Katalog Produk dari Excel</h2>
              <p className="modal-subtitle">
                Unggah file spreadsheet (.xlsx, .xls, .csv) untuk menambahkan banyak produk sekaligus ke database PostgreSQL.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isImporting}
            aria-label="Tutup Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body import-modal-body">
          {/* Section 1: Template Download Banner */}
          {!importResult && (
            <div className="import-template-banner">
              <div className="template-banner-left">
                <Info size={18} className="template-info-icon" />
                <div>
                  <div className="template-banner-title">Belum punya format Excel yang sesuai?</div>
                  <div className="template-banner-desc">
                    Unduh file template resmi POSAN yang sudah dilengkapi petunjuk kolom (Nama, Kategori, Stasiun, Harga, Status).
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-download-template"
                onClick={downloadProductImportTemplate}
                title="Unduh Template Excel (.xlsx)"
              >
                <Download size={14} />
                <span>Unduh Format Template</span>
              </button>
            </div>
          )}

          {/* Section 2: File Upload / Dropzone */}
          {!selectedFile && !importResult && (
            <div
              className={`import-dropzone ${isDragging ? 'dragging' : ''} ${isParsing ? 'parsing' : ''}`}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              {isParsing ? (
                <div className="import-loading-state">
                  <RefreshCw size={28} className="spin-icon" />
                  <div className="dropzone-title">Membaca File Spreadsheet...</div>
                  <div className="dropzone-desc">Memvalidasi kolom dan baris data produk</div>
                </div>
              ) : (
                <>
                  <div className="dropzone-icon-circle">
                    <FileUp size={24} />
                  </div>
                  <div className="dropzone-title">
                    {isDragging ? 'Lepaskan file Excel di sini' : 'Pilih atau Tarik File Excel ke Sini'}
                  </div>
                  <div className="dropzone-desc">
                    Mendukung file berekstensi <strong>.XLSX</strong>, <strong>.XLS</strong>, atau <strong>.CSV</strong>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section 3: Error Message */}
          {parseError && (
            <div className="import-error-alert" role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Section 4: Parsed Data Preview Table */}
          {selectedFile && parsedRows.length > 0 && !importResult && (
            <div className="import-preview-section">
              <div className="import-file-chip">
                <div className="file-chip-left">
                  <FileSpreadsheet size={16} color="#10B981" />
                  <span className="file-chip-name">{selectedFile.name}</span>
                  <span className="file-chip-size">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <div className="file-chip-stats">
                  <span className="stat-pill valid">
                    <CheckCircle2 size={12} />
                    {validCount} Siap Impor
                  </span>
                  {invalidCount > 0 && (
                    <span className="stat-pill invalid">
                      <AlertCircle size={12} />
                      {invalidCount} Dilewati
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn-remove-file"
                    onClick={handleReset}
                    title="Ganti File"
                  >
                    <Trash2 size={13} />
                    <span>Ganti File</span>
                  </button>
                </div>
              </div>

              <div className="import-table-wrapper">
                <table className="import-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '6%' }}>No</th>
                      <th style={{ width: '32%' }}>Nama Menu / Produk</th>
                      <th style={{ width: '20%' }}>Kategori</th>
                      <th style={{ width: '16%' }}>Stasiun</th>
                      <th style={{ width: '16%' }}>Harga Jual</th>
                      <th style={{ width: '10%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? '' : 'row-invalid'}>
                        <td className="cell-number">{idx + 1}</td>
                        <td className="cell-name">
                          <span className="product-name-txt">{row.name}</span>
                          {row.description && (
                            <span className="product-desc-txt">{row.description}</span>
                          )}
                        </td>
                        <td>
                          <span className="category-chip-preview">
                            <Layers size={11} />
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <span className={`station-badge ${row.station}`}>
                            {row.station === 'kitchen' ? 'Kitchen (Dapur)' : 'Barista (Minuman)'}
                          </span>
                        </td>
                        <td className="cell-price">
                          Rp {Number(row.price || 0).toLocaleString('id-ID')}
                        </td>
                        <td>
                          <span className={`status-pill ${row.status === 'Aktif' ? 'active' : 'inactive'}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: Progress Bar during Import */}
          {isImporting && (
            <div className="import-progress-box">
              <div className="progress-header">
                <span>Mengimpor produk ke database PostgreSQL...</span>
                <span className="progress-count">
                  {importProgress.current} dari {importProgress.total} produk
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Section 6: Import Result Summary */}
          {importResult && (
            <div className="import-result-box">
              <div className="result-header">
                <div className="result-icon-circle success">
                  <CheckCircle2 size={32} color="#10B981" />
                </div>
                <h3 className="result-title">Proses Import Selesai!</h3>
                <p className="result-subtitle">
                  Katalog produk telah berhasil disimpan ke database PostgreSQL.
                </p>
              </div>

              <div className="result-stats-grid">
                <div className="result-stat-card">
                  <div className="stat-label">Total Diproses</div>
                  <div className="stat-value">{importResult.total} Item</div>
                </div>
                <div className="result-stat-card success">
                  <div className="stat-label">Berhasil Diimpor</div>
                  <div className="stat-value text-success">{importResult.success} Item</div>
                </div>
                <div className="result-stat-card">
                  <div className="stat-label">Gagal / Dilewati</div>
                  <div className="stat-value text-muted">{importResult.failed} Item</div>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="result-errors-list">
                  <div className="errors-title">Catatan Kesalahan:</div>
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="error-item">
                      • {err}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer import-modal-footer">
          {importResult ? (
            <button
              type="button"
              className="btn-drawer-save"
              onClick={onClose}
            >
              <span>Selesai &amp; Tutup</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-drawer-cancel"
                onClick={onClose}
                disabled={isImporting}
              >
                <span>Batal</span>
              </button>

              <button
                type="button"
                className="btn-start-import"
                onClick={handleExecuteImport}
                disabled={!selectedFile || validCount === 0 || isImporting || isParsing}
              >
                {isImporting ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" />
                    <span>Mengimpor ({importProgress.current}/{importProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Mulai Import ({validCount} Produk)</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
