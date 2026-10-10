import React from 'react';
import { Search, RotateCw, Download, Coffee, Utensils, PackageX, Filter } from 'lucide-react';

export default function CategoryFilters({
  activeTab = 'all',
  onTabChange,
  counts = { all: 5, active: 4, inactive: 1 },
  stationFilter = 'all',
  onStationFilterChange,
  searchQuery = '',
  onSearchChange,
  onRefresh,
  onExport
}) {
  return (
    <section className="category-toolbar-card animate-fade-in" aria-label="Toolbar Filter Kategori">
      {/* Status Tab Pills */}
      <div className="category-status-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`category-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onTabChange('all')}
        >
          Semua ({counts.all})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'Aktif'}
          className={`category-tab-btn ${activeTab === 'Aktif' ? 'active' : ''}`}
          onClick={() => onTabChange('Aktif')}
        >
          Aktif ({counts.active})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'Nonaktif'}
          className={`category-tab-btn ${activeTab === 'Nonaktif' ? 'active' : ''}`}
          onClick={() => onTabChange('Nonaktif')}
        >
          Nonaktif ({counts.inactive})
        </button>
      </div>

      {/* Search & Actions */}
      <div className="category-toolbar-right">
        {/* Station Filter Dropdown */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <select
            value={stationFilter}
            onChange={(e) => onStationFilterChange && onStationFilterChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #D8CEBE',
              backgroundColor: '#FAF7F2',
              color: '#2A1E17',
              fontSize: '0.78rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">⚡ Semua Stasiun</option>
            <option value="barista">☕ Barista (Minuman)</option>
            <option value="kitchen">🍳 Kitchen (Dapur)</option>
            <option value="none">🚫 Tidak Masuk Dapur</option>
          </select>
        </div>

        <div className="category-search-box">
          <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Cari Kategori"
          />
        </div>

        <button
          type="button"
          className="btn-toolbar-icon"
          onClick={onRefresh}
          title="Segarkan Data Kategori"
          aria-label="Segarkan Data"
        >
          <RotateCw size={14} />
        </button>

        <button
          type="button"
          className="btn-toolbar-export"
          onClick={onExport}
          title="Ekspor CSV Kategori"
        >
          <Download size={13} />
          <span>Ekspor</span>
        </button>
      </div>
    </section>
  );
}
