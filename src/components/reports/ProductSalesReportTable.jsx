import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Search,
  ArrowUpDown,
  TrendingUp,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function ProductSalesReportTable({
  tableData = [],
  periodLabel = 'Periode Terpilih',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('totalSales'); // 'name' | 'salesCount' | 'totalSales' | 'unitPrice'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    const cats = new Set(tableData.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [tableData]);

  // Filter & Search Logic
  const filteredRows = useMemo(() => {
    return tableData.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [tableData, searchQuery, selectedCategory]);

  // Sorting Logic
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredRows, sortField, sortOrder]);

  // Pagination Logic
  const totalItems = sortedRows.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIdx, startIdx + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  // Total Summary
  const grandTotalQty = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + (r.salesCount || 0), 0);
  }, [filteredRows]);

  const grandTotalRevenue = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + (r.totalSales || 0), 0);
  }, [filteredRows]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  return (
    <article className="report-card report-table-card animate-fade-in" aria-label="Tabel Laporan Penjualan Produk">
      {/* Table Header Bar */}
      <div className="report-table-header-bar flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="table-title-group">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C5E3C] animate-pulse"></span>
            <h2 className="report-card-title">Laporan Penjualan Per Produk</h2>
          </div>
          <span className="report-card-subtitle">
            Rincian performa menu, kuantitas terjual, nominal omzet, dan harga satuan ({periodLabel})
          </span>
        </div>

        {/* Toolbar: Search and Category Filter */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari menu / kategori..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-9 pr-3 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8C5E3C] focus:bg-white transition-all w-48 sm:w-56"
            />
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-[#8C5E3C] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="report-table-responsive overflow-x-auto">
        <table className="report-custom-table w-full">
          <thead>
            <tr>
              {/* 1. Nama Produk */}
              <th
                scope="col"
                className="cursor-pointer select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>NAMA PRODUK</span>
                  <ArrowUpDown size={12} className={sortField === 'name' ? 'text-[#8C5E3C]' : 'opacity-40'} />
                </div>
              </th>

              {/* 2. Penjualan (Performa & Kontribusi Omzet) */}
              <th
                scope="col"
                className="cursor-pointer select-none"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center gap-1.5">
                  <span>PENJUALAN</span>
                  <ArrowUpDown size={12} className={sortField === 'percentage' ? 'text-[#8C5E3C]' : 'opacity-40'} />
                </div>
              </th>

              {/* 3. Jumlah Penjualan */}
              <th
                scope="col"
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('salesCount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>JUMLAH PENJUALAN</span>
                  <ArrowUpDown size={12} className={sortField === 'salesCount' ? 'text-[#8C5E3C]' : 'opacity-40'} />
                </div>
              </th>

              {/* 4. Nominal Penjualan */}
              <th
                scope="col"
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('totalSales')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>NOMINAL PENJUALAN</span>
                  <ArrowUpDown size={12} className={sortField === 'totalSales' ? 'text-[#8C5E3C]' : 'opacity-40'} />
                </div>
              </th>

              {/* 5. Harga Satuan */}
              <th
                scope="col"
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('unitPrice')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>HARGA SATUAN</span>
                  <ArrowUpDown size={12} className={sortField === 'unitPrice' ? 'text-[#8C5E3C]' : 'opacity-40'} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.id} className="report-table-row hover:bg-stone-50/80 transition-colors">
                  {/* 1. Nama Produk */}
                  <td className="td-product">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F6EEE6] text-[#8C5E3C] border border-[#E8E0D5] flex items-center justify-center shrink-0 shadow-xs">
                        <Coffee size={17} strokeWidth={2.2} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm tracking-tight truncate max-w-[200px] sm:max-w-[280px]">
                          {row.name}
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {row.category || 'Menu Kafe'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Penjualan (Status Performa & Progress Kontribusi) */}
                  <td className="td-sales-status">
                    <div className="flex flex-col gap-1.5 min-w-[130px] max-w-[170px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-extrabold uppercase px-2 py-0.5 rounded-full text-[9px] tracking-wider ${
                            row.statusVariant === 'top'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : row.statusVariant === 'high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {row.salesStatus}
                        </span>
                        <span className="font-bold text-stone-700 font-mono">
                          {row.formattedPercentage}
                        </span>
                      </div>
                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                        <div
                          className={`h-full rounded-full ${
                            row.statusVariant === 'top'
                              ? 'bg-emerald-500'
                              : row.statusVariant === 'high'
                              ? 'bg-[#8C5E3C]'
                              : 'bg-stone-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, row.percentage * 3.5))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 3. Jumlah Penjualan */}
                  <td className="td-qty text-right">
                    <span className="inline-flex items-center gap-1 font-extrabold text-stone-900 text-xs sm:text-sm bg-stone-100/90 px-2.5 py-1 rounded-lg border border-stone-200/70 font-mono">
                      <Package size={13} className="text-[#8C5E3C]" />
                      <span>{row.salesCount}</span>
                      <span className="text-[10px] text-stone-500 font-sans font-normal">item</span>
                    </span>
                  </td>

                  {/* 4. Nominal Penjualan */}
                  <td className="td-nominal text-right">
                    <span className="font-extrabold text-[#8C5E3C] text-xs sm:text-sm tracking-tight font-mono">
                      {row.formattedTotalSales}
                    </span>
                  </td>

                  {/* 5. Harga Satuan */}
                  <td className="td-price text-right">
                    <span className="font-bold text-stone-700 text-xs sm:text-sm font-mono">
                      {row.formattedUnitPrice}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table-empty-row py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <Coffee size={20} />
                    </div>
                    <p className="font-semibold text-stone-700 text-xs sm:text-sm">
                      Belum Ada Data Penjualan Produk
                    </p>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Tidak ditemukan item terjual untuk filter dan periode terpilih. Silakan ubah filter periode (misal: "Seminggu" atau "1 Bulan") atau bersihkan kata kunci pencarian.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {/* Table Summary Footer Row */}
          {paginatedRows.length > 0 && (
            <tfoot>
              <tr className="bg-stone-50/90 border-t-2 border-stone-200 font-bold text-xs sm:text-sm">
                <td colSpan={2} className="py-3 px-4 text-stone-700">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#8C5E3C]" />
                    <span>TOTAL RINGKASAN ({filteredRows.length} Produk Terjual)</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-stone-900">
                  {grandTotalQty} item
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#8C5E3C] font-extrabold text-sm">
                  Rp {grandTotalRevenue.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right text-stone-400 text-xs font-normal">
                  -
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="report-table-pagination-footer flex items-center justify-between pt-4 border-t border-stone-100 flex-wrap gap-3">
        <div className="pagination-info-text text-xs text-stone-500">
          {totalItems > 0 ? (
            <>Menampilkan <strong className="text-stone-800">{startRecord}–{endRecord}</strong> dari <strong className="text-stone-800">{totalItems}</strong> produk terjual</>
          ) : (
            <>Menampilkan 0 produk</>
          )}
        </div>

        {/* Page Navigation Controls */}
        <div className="pagination-controls flex items-center gap-1.5" role="navigation" aria-label="Paginasi Laporan Produk">
          <button
            type="button"
            className="page-nav-arrow-btn p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              className={`page-number-btn w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-[#1E1713] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              onClick={() => setCurrentPage(pageNum)}
              aria-current={currentPage === pageNum ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            className="page-nav-arrow-btn p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
