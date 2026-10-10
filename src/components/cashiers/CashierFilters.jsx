import React from 'react';
import { Search } from 'lucide-react';

export default function CashierFilters({
  searchQuery,
  onSearchChange,
  activeTab = 'all',
  onTabChange,
  counts = { all: 1, active: 1, inactive: 0 }
}) {
  return (
    <section className="cashier-filter-bar animate-fade-in" aria-label="Pencarian dan Filter Kasir">
      {/* Search Input on Left */}
      <div className="cashier-search-box">
        <Search size={16} className="cashier-search-icon" />
        <input
          type="text"
          placeholder="Cari nama atau email kasir... (e.g. zul, user)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="cashier-search-input"
          aria-label="Pencarian Kasir"
        />
        <div className="cashier-search-shortcut">⌘K</div>
      </div>

      {/* Segmented Filter Pills on Right */}
      <div className="cashier-tabs-group" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`cashier-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onTabChange('all')}
        >
          Semua Staf ({counts.all || 0})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'active'}
          className={`cashier-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => onTabChange('active')}
        >
          Staf Aktif ({counts.active || 0})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inactive'}
          className={`cashier-tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => onTabChange('inactive')}
        >
          Nonaktif ({counts.inactive || 0})
        </button>
      </div>
    </section>
  );
}


