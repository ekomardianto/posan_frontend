import React, { useState, useMemo } from 'react';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Tag, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function StockMutationTable({ mutations = [] }) {
  const [filterType, setFilterType] = useState('all');

  const filtered = useMemo(() => {
    return mutations.filter((m) => {
      if (filterType === 'all') return true;
      return m.type === filterType;
    });
  }, [mutations, filterType]);

  const handleExportExcel = () => {
    const dataToExport = filtered.map((m, idx) => ({
      No: idx + 1,
      Tanggal: new Date(m.date).toLocaleString('id-ID'),
      'Nama Bahan Baku': m.ingredientName,
      Tipe: m.type === 'restock' ? 'Stok Masuk (Restock)' : m.type === 'stock_opname' ? 'Stock Opname' : 'Penyesuaian',
      'Perubahan Jumlah': `${m.changeAmount > 0 ? '+' : ''}${m.changeAmount} ${m.unit}`,
      'Biaya Beban (Rp)': m.bebanAmount || 0,
      Referensi: m.reference || '-',
      Keterangan: m.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log Mutasi Stok');
    XLSX.writeFile(workbook, `POSAN_Log_Mutasi_Stok_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="inventory-table-container animate-fade-in">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 m-0">Log Riwayat Mutasi Stok</h3>
          <p className="text-xs text-gray-500 m-0">Catatan kronologis penerimaan barang supplier, penyesuaian opname, dan beban waste.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="inventory-select text-xs"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Semua Jenis Mutasi</option>
            <option value="restock">Stok Masuk (Restock)</option>
            <option value="stock_opname">Stock Opname (Penyesuaian/Beban)</option>
            <option value="initial_stock">Stok Awal</option>
          </select>

          {filtered.length > 0 && (
            <button
              type="button"
              className="btn-export-csv"
              onClick={handleExportExcel}
              title="Download Excel Mutasi"
            >
              <Download size={14} color="#15803D" />
              <span>Ekspor Log (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Waktu &amp; Tanggal</th>
              <th>Bahan Baku</th>
              <th>Tipe Pergerakan</th>
              <th>Perubahan Jumlah</th>
              <th>Nilai Beban Kerugian</th>
              <th>No. Referensi</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                  Tidak ada catatan mutasi stok untuk filter ini.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const isPositive = Number(m.changeAmount) > 0;
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="text-gray-400 text-[11px] font-mono">
                          {new Date(m.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-xs text-gray-900">{m.ingredientName}</span>
                    </td>
                    <td>
                      {m.type === 'restock' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <ArrowDownRight size={12} className="text-emerald-600" />
                          <span>Restock Masuk</span>
                        </span>
                      )}
                      {m.type === 'stock_opname' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          <RefreshCw size={11} className="text-amber-600" />
                          <span>Stock Opname</span>
                        </span>
                      )}
                      {m.type === 'initial_stock' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                          <Tag size={11} className="text-blue-600" />
                          <span>Stok Awal</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`text-xs font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{Number(m.changeAmount).toLocaleString('id-ID')} {m.unit}
                      </span>
                    </td>
                    <td>
                      {m.bebanAmount > 0 ? (
                        <span className="text-xs font-extrabold text-red-600">
                          Rp {Number(m.bebanAmount).toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                        {m.reference || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600">{m.notes || '-'}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
