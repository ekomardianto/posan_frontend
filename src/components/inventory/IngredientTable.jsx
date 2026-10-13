import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Download,
  Filter,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function IngredientTable({
  ingredients = [],
  onEdit,
  onDelete,
  onRestock,
  onOpenAddDrawer,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(ingredients.map(i => i.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [ingredients]);

  // Filtered List
  const filtered = useMemo(() => {
    return ingredients.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [ingredients, searchQuery, selectedCategory, selectedStatus]);

  // Count items below minimum tolerance
  const criticalItems = useMemo(() => {
    return ingredients.filter(i => i.status === 'Menipis' || i.status === 'Habis');
  }, [ingredients]);

  // Export to Excel handler
  const handleExportExcel = () => {
    const dataToExport = filtered.map((item, idx) => ({
      No: idx + 1,
      'Kode SKU': item.sku,
      'Nama Bahan': item.name,
      Kategori: item.category,
      'Stok Saat Ini': item.currentStock,
      Satuan: item.unit,
      'Toleransi Min Stok': item.minimumStock,
      'Status Stok': item.status,
      'HPP Satuan (Rp)': item.costPerUnit,
      'Total Nilai (Rp)': item.currentStock * item.costPerUnit,
      Supplier: item.supplier || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Bahan Baku');
    XLSX.writeFile(workbook, `POSAN_Stok_Bahan_Baku_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Alert Banner jika ada bahan di bawah toleransi minimum */}
      {criticalItems.length > 0 && selectedStatus !== 'Menipis' && (
        <div className="inventory-alert-banner">
          <div className="inventory-alert-banner-left">
            <div className="inventory-alert-icon-box">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="inventory-alert-title">
                Peringatan Toleransi Stok: {criticalItems.length} Bahan Baku Perlu Segera Direstock!
              </div>
              <div className="inventory-alert-desc">
                Beberapa bahan baku berada pada atau di bawah batas minimum toleransi stock kafe. Segera lakukan pemesanan ke supplier.
              </div>
            </div>
          </div>
          <div className="inventory-alert-banner-right">
            <button
              type="button"
              className="inventory-alert-btn"
              onClick={() => setSelectedStatus('Menipis')}
            >
              Lihat Bahan Kritis ({criticalItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Card */}
      <div className="inventory-filters-card">
        <div className="inventory-search-box">
          <Search size={16} className="inventory-search-icon" />
          <input
            type="text"
            className="inventory-search-input"
            placeholder="Cari nama bahan, kode SKU, atau supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="inventory-filter-group">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              className="inventory-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            className="inventory-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Semua Status Stok</option>
            <option value="Aman">Stok Aman</option>
            <option value="Menipis">Menipis (Batas Toleransi)</option>
            <option value="Habis">Habis (0 Stock)</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              className="btn-action-icon"
              onClick={handleResetFilters}
              title="Reset Filter"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* Export to Excel */}
          <button
            type="button"
            className="btn-export-csv"
            onClick={handleExportExcel}
            title="Download Excel (.xlsx)"
          >
            <Download size={14} color="#15803D" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <div className="overflow-x-auto">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Bahan Baku &amp; SKU</th>
                <th>Kategori</th>
                <th>Stok Saat Ini</th>
                <th>Toleransi Minimum</th>
                <th>Biaya / HPP Satuan</th>
                <th>Estimasi Nilai</th>
                <th>Status Stok</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <AlertOctagon size={36} strokeWidth={1.5} />
                      <div className="font-semibold text-gray-600 text-sm">Tidak ada bahan baku ditemukan</div>
                      <p className="text-xs text-gray-400 max-w-sm">
                        {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                          ? 'Coba sesuaikan kata kunci pencarian atau reset filter yang dipilih.'
                          : 'Belum ada bahan baku terdaftar. Klik "Tambah Bahan" untuk mulai mendaftarkan persediaan kafe Anda.'}
                      </p>
                      {onOpenAddDrawer && (
                        <button
                          type="button"
                          className="btn-add-product mt-2"
                          onClick={onOpenAddDrawer}
                        >
                          <Sparkles size={14} />
                          <span>Daftarkan Bahan Pertama</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const current = Number(item.currentStock) || 0;
                  const min = Number(item.minimumStock) || 0;
                  const percentOfMin = min > 0 ? Math.min(100, Math.round((current / (min * 2)) * 100)) : 100;
                  const isLow = current <= min && current > 0;
                  const isOut = current <= 0;
                  const totalValue = current * (Number(item.costPerUnit) || 0);

                  return (
                    <tr key={item.id} className="transition-colors">
                      {/* 1. Name & SKU */}
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                          <span className="text-xs text-gray-500 font-mono tracking-wider">{item.sku}</span>
                          {item.supplier && item.supplier !== '-' && (
                            <span className="text-[11px] text-amber-800/80">Supplier: {item.supplier}</span>
                          )}
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td>
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F5EBE1] text-[#7D5537]">
                          {item.category}
                        </span>
                      </td>

                      {/* 3. Current Stock */}
                      <td>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-extrabold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                            {current.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                        </div>
                      </td>

                      {/* 4. Minimum Tolerance Bar */}
                      <td>
                        <div className="stock-tolerance-bar-container">
                          <div className="stock-tolerance-bar-track">
                            <div
                              className={`stock-tolerance-bar-fill ${
                                isOut ? 'fill-red' : isLow ? 'fill-amber' : 'fill-green'
                              }`}
                              style={{ width: `${Math.max(5, percentOfMin)}%` }}
                            />
                          </div>
                          <div className="stock-tolerance-subtext">
                            <span>Min: {min.toLocaleString('id-ID')} {item.unit}</span>
                            <span>{min > 0 ? `${Math.round((current / min) * 100)}%` : '-'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Cost Per Unit */}
                      <td>
                        <div className="text-sm font-semibold text-gray-700">
                          Rp {(Number(item.costPerUnit) || 0).toLocaleString('id-ID')}
                          <span className="text-xs font-normal text-gray-400">/{item.unit}</span>
                        </div>
                      </td>

                      {/* 6. Total Asset Value */}
                      <td>
                        <div className="text-sm font-bold text-gray-900">
                          Rp {totalValue.toLocaleString('id-ID')}
                        </div>
                      </td>

                      {/* 7. Status Pill */}
                      <td>
                        {item.status === 'Aman' && (
                          <span className="stock-status-pill status-aman">
                            <CheckCircle2 size={12} />
                            <span>Stok Aman</span>
                          </span>
                        )}
                        {item.status === 'Menipis' && (
                          <span className="stock-status-pill status-menipis" title="Di bawah toleransi minimum">
                            <AlertTriangle size={12} />
                            <span>Menipis (Restock)</span>
                          </span>
                        )}
                        {item.status === 'Habis' && (
                          <span className="stock-status-pill status-habis">
                            <AlertOctagon size={12} />
                            <span>Stok Habis</span>
                          </span>
                        )}
                      </td>

                      {/* 8. Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Restock Button */}
                          <button
                            type="button"
                            className="btn-action-icon text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                            onClick={() => onRestock && onRestock(item)}
                            title="Restock (Tambah Stok Masuk)"
                          >
                            <PlusCircle size={15} />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => onEdit && onEdit(item)}
                            title="Edit Bahan & Toleransi Minimum"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="btn-action-icon btn-delete"
                            onClick={() => onDelete && onDelete(item)}
                            title="Hapus Bahan Baku"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
