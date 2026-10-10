import React from 'react';
import { Search } from 'lucide-react';
import { defaultProductCategories as defaultCategories } from '../../constants/appConstants';

export default function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onReset,
  onApply,
  categories = defaultCategories
}) {
  const categoryOptions = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="filter-toolbar-card animate-fade-in" aria-label="Toolbar Filter Produk">
      <div className="filter-toolbar-left">
        {/* Search Box */}
        <div className="product-search-box">
          <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari nama produk, deskripsi atau kode menu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Pencarian Produk"
          />
        </div>

        {/* Category Select */}
        <select
          className="product-select-dropdown"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter Kategori Produk"
        >
          {categoryOptions.map((cat) => (
            <option key={cat.id || cat.name} value={cat.id || cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          className="product-select-dropdown"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter Status Menu"
        >
          <option value="all">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>

      <div className="filter-toolbar-right">
        <button
          type="button"
          className="btn-filter-reset"
          onClick={onReset}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn-filter-apply"
          onClick={onApply}
        >
          Terapkan
        </button>
      </div>
    </section>
  );
}
