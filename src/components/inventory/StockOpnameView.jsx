import React, { useState } from 'react';
import {
  ClipboardCheck,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Plus,
  ArrowRight,
  Download,
  Eye,
  X,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BEBAN_CATEGORIES } from '../../services/inventoryService';

export default function StockOpnameView({
  ingredients = [],
  opnameSessions = [],
  onSubmitOpname,
  isSubmitting = false,
}) {
  const [isCreatingOpname, setIsCreatingOpname] = useState(false);
  const [checkerName, setCheckerName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  // Form rows for ongoing opname session
  const [opnameRows, setOpnameRows] = useState([]);

  // Start new opname session
  const handleStartOpname = () => {
    // Populate all ingredients into the opname table
    const initialRows = ingredients.map((ing) => ({
      ingredientId: ing.id,
      name: ing.name,
      unit: ing.unit,
      costPerUnit: Number(ing.costPerUnit) || 0,
      systemStock: Number(ing.currentStock) || 0,
      physicalStock: String(ing.currentStock), // Default matches system stock
      bebanCategory: 'beban_pemborosan',
      notes: '',
    }));

    setOpnameRows(initialRows);
    setCheckerName('');
    setNotes(`Stock Opname rutin ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    setIsCreatingOpname(true);
  };

  // Update physical stock for a row
  const handleUpdatePhysical = (index, value) => {
    setOpnameRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], physicalStock: value };
      return copy;
    });
  };

  // Update beban category for a row
  const handleUpdateCategory = (index, catId) => {
    setOpnameRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], bebanCategory: catId };
      return copy;
    });
  };

  // Update row note
  const handleUpdateRowNote = (index, noteVal) => {
    setOpnameRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes: noteVal };
      return copy;
    });
  };

  // Calculate live summary
  const liveSummary = React.useMemo(() => {
    let totalBeban = 0;
    let itemsWithDiff = 0;

    opnameRows.forEach((row) => {
      const phys = Number(row.physicalStock) || 0;
      const sys = Number(row.systemStock) || 0;
      const diff = phys - sys;
      if (diff !== 0) {
        itemsWithDiff += 1;
        if (diff < 0) {
          totalBeban += Math.abs(diff) * (Number(row.costPerUnit) || 0);
        }
      }
    });

    return { totalBeban, itemsWithDiff };
  }, [opnameRows]);

  // Submit Opname
  const handleSaveOpname = (e) => {
    e.preventDefault();
    if (!checkerName.trim()) {
      alert('Silakan masukkan nama petugas pemeriksa (Checker / Supervisor).');
      return;
    }

    const payloadItems = opnameRows.map((r) => ({
      ingredientId: r.ingredientId,
      name: r.name,
      unit: r.unit,
      costPerUnit: r.costPerUnit,
      systemStock: r.systemStock,
      physicalStock: Number(r.physicalStock) || 0,
      bebanCategory: r.bebanCategory,
      notes: r.notes,
    }));

    onSubmitOpname({
      checker: checkerName,
      notes,
      opnameItems: payloadItems,
    }).then(() => {
      setIsCreatingOpname(false);
    });
  };

  // Export Opname history to Excel
  const handleExportHistoryExcel = () => {
    const rows = [];
    opnameSessions.forEach((session) => {
      (session.items || []).forEach((item) => {
        rows.push({
          'Kode Sesi': session.code,
          Tanggal: new Date(session.date).toLocaleDateString('id-ID'),
          'Petugas Checker': session.checker,
          'Nama Bahan': item.name,
          'Stok Sistem': item.systemStock,
          'Stok Fisik': item.physicalStock,
          Satuan: item.unit,
          Selisih: item.diff,
          'Alasan / Kategori Beban': item.reasonLabel || '-',
          'Nilai Beban Biaya (Rp)': item.lossValue,
          'Catatan Item': item.notes || '-',
          'Catatan Sesi': session.notes || '-',
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Stock Opname');
    XLSX.writeFile(workbook, `POSAN_Laporan_Stock_Opname_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="opname-view-container animate-fade-in">
      {/* 1. Opname Hero Card */}
      <div className="opname-hero-card">
        <div className="opname-hero-left">
          <div className="opname-hero-badge">
            <ClipboardCheck size={14} />
            <span>MODUL PENGHITUNGAN FISIK &amp; BEBAN (STOCK OF NAME)</span>
          </div>
          <h2 className="opname-hero-title">Stock Opname &amp; Rekapitulasi Beban</h2>
          <p className="opname-hero-desc">
            Cocokkan persediaan fisik aktual di bar &amp; gudang dengan catatan sistem.
            Sistem secara otomatis menghitung selisih, mengklasifikasikan kategori beban (waste/basi/shrinkage),
            serta membebankan nilai kerugian ke pembukuan secara transparan.
          </p>
        </div>

        <div className="opname-hero-stats">
          <div className="opname-hero-stat-box">
            <span className="opname-hero-stat-label">Total Beban Terakumulasi</span>
            <span className="opname-hero-stat-number">
              Rp {opnameSessions.reduce((acc, s) => acc + (s.totalLossValue || 0), 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-400">Dari {opnameSessions.length} sesi opname</span>
          </div>

          {!isCreatingOpname && (
            <button
              type="button"
              className="opname-start-btn"
              onClick={handleStartOpname}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Mulai Stock Opname</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Sheet for Active Opname */}
      {isCreatingOpname && (
        <div className="opname-sheet-card animate-scale-up">
          <div className="opname-sheet-header">
            <div>
              <div className="opname-sheet-title">
                <ClipboardCheck size={20} className="text-amber-700" />
                <span>Lembar Kerja Penghitungan Fisik (Stock Opname)</span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Masukkan hasil hitungan fisik riil di kolom &quot;Stok Fisik Aktual&quot;. Selisih dan beban biaya akan dihitung otomatis.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Estimasi Beban Selisih</span>
                <div className="text-lg font-black text-red-600">
                  Rp {liveSummary.totalBeban.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-gray-400">
                  {liveSummary.itemsWithDiff} bahan mengalami selisih
                </span>
              </div>
              <button
                type="button"
                className="btn-action-icon"
                onClick={() => setIsCreatingOpname(false)}
                title="Batalkan Sesi Opname"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveOpname}>
            {/* Session Inputs */}
            <div className="opname-inputs-row">
              <div className="opname-input-field">
                <label className="required">Petugas Pemeriksa (Checker / Supervisor)</label>
                <input
                  type="text"
                  placeholder="Nama petugas yang melakukan penghitungan fisik..."
                  value={checkerName}
                  onChange={(e) => setCheckerName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="opname-input-field">
                <label>Tanggal &amp; Waktu</label>
                <input
                  type="text"
                  value={new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB'}
                  disabled
                />
              </div>

              <div className="opname-input-field" style={{ gridColumn: 'span 2' }}>
                <label>Catatan &amp; Keterangan Sesi</label>
                <input
                  type="text"
                  placeholder="Misal: Opname mingguan station bar dan chiller gudang bawah..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Opname Comparison Grid */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg mt-3">
              <table className="opname-table">
                <thead>
                  <tr>
                    <th>Bahan Baku</th>
                    <th>Stok Sistem</th>
                    <th style={{ width: '130px' }}>Stok Fisik Riil</th>
                    <th>Satuan</th>
                    <th>Selisih Fisik</th>
                    <th>Kategori Beban</th>
                    <th>Nilai Beban (Rp)</th>
                    <th>Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {opnameRows.map((row, index) => {
                    const sys = Number(row.systemStock) || 0;
                    const phys = Number(row.physicalStock) || 0;
                    const diff = phys - sys;
                    const loss = diff < 0 ? Math.abs(diff) * row.costPerUnit : 0;

                    return (
                      <tr key={row.ingredientId} className={diff !== 0 ? 'bg-amber-50/40' : undefined}>
                        {/* 1. Name */}
                        <td>
                          <div className="font-bold text-gray-900 text-sm">{row.name}</div>
                          <span className="text-[11px] text-gray-400">HPP: Rp {row.costPerUnit.toLocaleString('id-ID')}/{row.unit}</span>
                        </td>

                        {/* 2. System Stock */}
                        <td>
                          <span className="font-bold text-gray-700">{sys.toLocaleString('id-ID')}</span>
                        </td>

                        {/* 3. Physical Input */}
                        <td>
                          <input
                            type="number"
                            step="any"
                            className="input-physical-stock"
                            value={row.physicalStock}
                            onChange={(e) => handleUpdatePhysical(index, e.target.value)}
                          />
                        </td>

                        {/* 4. Unit */}
                        <td>
                          <span className="text-xs font-semibold text-gray-500">{row.unit}</span>
                        </td>

                        {/* 5. Diff Tag */}
                        <td>
                          {diff < 0 && (
                            <span className="diff-tag diff-minus">
                              <span>{diff.toLocaleString('id-ID')}</span>
                            </span>
                          )}
                          {diff > 0 && (
                            <span className="diff-tag diff-plus">
                              <span>+{diff.toLocaleString('id-ID')}</span>
                            </span>
                          )}
                          {diff === 0 && (
                            <span className="diff-tag diff-zero">
                              <span>0 (Cocok)</span>
                            </span>
                          )}
                        </td>

                        {/* 6. Beban Category Selector (Only active if diff !== 0) */}
                        <td>
                          {diff !== 0 ? (
                            <select
                              className="inventory-select text-xs py-1"
                              value={row.bebanCategory}
                              onChange={(e) => handleUpdateCategory(index, e.target.value)}
                            >
                              {BEBAN_CATEGORIES.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-400 italic">-</span>
                          )}
                        </td>

                        {/* 7. Loss Value */}
                        <td>
                          {loss > 0 ? (
                            <span className="beban-loss-value">
                              Rp {loss.toLocaleString('id-ID')}
                            </span>
                          ) : diff > 0 ? (
                            <span className="text-xs font-bold text-emerald-600">Surplus</span>
                          ) : (
                            <span className="text-xs text-gray-400">Rp 0</span>
                          )}
                        </td>

                        {/* 8. Row Note */}
                        <td>
                          <input
                            type="text"
                            placeholder="Alasan selisih..."
                            className="text-xs p-1.5 border border-gray-200 rounded w-full"
                            value={row.notes}
                            onChange={(e) => handleUpdateRowNote(index, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Menyimpan sesi ini akan langsung memperbarui stok sistem bahan baku ke angka fisik riil dan mencatat mutasi beban.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn-drawer-cancel"
                  onClick={() => setIsCreatingOpname(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-add-product !bg-amber-800 hover:!bg-amber-900"
                  disabled={isSubmitting}
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Menyesuaikan Stok...' : 'Simpan & Sesuaikan Stok Sistem'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. History of Past Stock Opnames */}
      <div className="inventory-table-container">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 m-0">Riwayat Sesi Stock Opname &amp; Beban</h3>
            <p className="text-xs text-gray-500 m-0">Log audit historis penghitungan fisik dan beban kerugian selisih bahan.</p>
          </div>
          {opnameSessions.length > 0 && (
            <button
              type="button"
              className="btn-export-csv"
              onClick={handleExportHistoryExcel}
              title="Download Excel Seluruh Sesi Opname"
            >
              <Download size={14} color="#15803D" />
              <span>Ekspor Riwayat Opname (.xlsx)</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Kode Sesi</th>
                <th>Tanggal &amp; Waktu</th>
                <th>Petugas Checker</th>
                <th>Item Dihitung</th>
                <th>Item Berselisih</th>
                <th>Total Beban Kerugian (Rp)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {opnameSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400 text-xs">
                    Belum ada riwayat stock opname tersimpan.
                  </td>
                </tr>
              ) : (
                opnameSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <span className="font-mono font-bold text-xs text-gray-800">{session.code}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="text-gray-400 text-[11px]">
                          {new Date(session.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                        <User size={13} className="text-amber-700" />
                        <span>{session.checker}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-gray-700">{session.totalItemsChecked} bahan</span>
                    </td>
                    <td>
                      <span className={`text-xs font-bold ${session.itemsWithDiff > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
                        {session.itemsWithDiff} item
                      </span>
                    </td>
                    <td>
                      <span className={`text-sm font-extrabold ${session.totalLossValue > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        Rp {Number(session.totalLossValue || 0).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td>
                      <span className="stock-status-pill status-aman text-[11px] py-0.5">
                        <CheckCircle2 size={11} />
                        <span>{session.status}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-action-icon text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => setSelectedSessionDetail(session)}
                        title="Lihat Rincian Item"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Session Detail Modal */}
      {selectedSessionDetail && (
        <div className="recipe-modal-backdrop" onClick={() => setSelectedSessionDetail(null)}>
          <div
            className="recipe-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '780px' }}
          >
            <div className="recipe-modal-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 m-0">
                    Rincian Stock Opname: {selectedSessionDetail.code}
                  </h3>
                  <p className="text-xs text-gray-500 m-0">
                    Checker: <strong>{selectedSessionDetail.checker}</strong> &bull; {new Date(selectedSessionDetail.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedSessionDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="recipe-modal-body">
              {/* Summary box */}
              <div className="recipe-summary-box">
                <div className="recipe-summary-metric">
                  <span className="recipe-summary-label">Total Beban Selisih</span>
                  <span className="recipe-summary-value text-red-600">
                    Rp {Number(selectedSessionDetail.totalLossValue || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="recipe-summary-metric">
                  <span className="recipe-summary-label">Item Berselisih</span>
                  <span className="recipe-summary-value">
                    {selectedSessionDetail.itemsWithDiff} / {selectedSessionDetail.totalItemsChecked}
                  </span>
                </div>
                <div className="recipe-summary-metric">
                  <span className="recipe-summary-label">Catatan Supervisor</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {selectedSessionDetail.notes || '-'}
                  </span>
                </div>
              </div>

              {/* Items detail list */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Bahan</th>
                      <th>Sistem</th>
                      <th>Fisik Riil</th>
                      <th>Selisih</th>
                      <th>Alasan Beban</th>
                      <th>Biaya Beban (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSessionDetail.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="font-bold text-xs text-gray-900">{it.name}</div>
                          {it.notes && <div className="text-[11px] text-gray-500 italic">{it.notes}</div>}
                        </td>
                        <td className="text-xs">{it.systemStock} {it.unit}</td>
                        <td className="text-xs font-bold">{it.physicalStock} {it.unit}</td>
                        <td>
                          {it.diff < 0 && (
                            <span className="diff-tag diff-minus">{it.diff} {it.unit}</span>
                          )}
                          {it.diff > 0 && (
                            <span className="diff-tag diff-plus">+{it.diff} {it.unit}</span>
                          )}
                          {it.diff === 0 && (
                            <span className="diff-tag diff-zero">0</span>
                          )}
                        </td>
                        <td className="text-xs text-gray-700">{it.reasonLabel || '-'}</td>
                        <td className="text-xs font-bold text-red-600">
                          Rp {Number(it.lossValue || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                className="btn-drawer-cancel text-xs"
                onClick={() => setSelectedSessionDetail(null)}
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
