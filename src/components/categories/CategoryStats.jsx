import React from 'react';
import { Layers, Utensils, EyeOff, Check } from 'lucide-react';

export default function CategoryStats({ categories = [] }) {
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'Aktif');
  const inactiveCategories = categories.filter((c) => c.status === 'Nonaktif');

  const totalProducts = categories.reduce((acc, c) => acc + (c.productCount || 0), 0);
  const hiddenProducts = inactiveCategories.reduce((acc, c) => acc + (c.productCount || 0), 0);

  return (
    <section className="category-stats-grid animate-fade-in" aria-label="Statistik Kategori">
      {/* 1. Total Kategori */}
      <article className="category-stat-card">
        <div className="cstat-content">
          <span className="cstat-label">TOTAL KATEGORI</span>
          <span className="cstat-value">{totalCategories}</span>
          <span className="cstat-subtext">Struktur menu aktif</span>
        </div>
        <div className="cstat-icon-box" aria-hidden="true">
          <Layers size={20} strokeWidth={2.2} />
        </div>
      </article>

      {/* 2. Total Terkatalog */}
      <article className="category-stat-card">
        <div className="cstat-content">
          <span className="cstat-label">TOTAL TERKATALOG</span>
          <span className="cstat-value">{totalProducts} Item</span>
          <span className="cstat-subtext" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            <Check size={13} strokeWidth={3} />
            Siap untuk POS
          </span>
        </div>
        <div className="cstat-icon-box green-box" aria-hidden="true">
          <Utensils size={20} strokeWidth={2.2} />
        </div>
      </article>

      {/* 3. Status Nonaktif */}
      <article className="category-stat-card">
        <div className="cstat-content">
          <span className="cstat-label">STATUS NONAKTIF</span>
          <span className="cstat-value">{inactiveCategories.length} Kategori</span>
          <span className="cstat-subtext">
            {hiddenProducts > 0 ? `${hiddenProducts} Produk disembunyikan` : 'Semua kategori tampil'}
          </span>
        </div>
        <div className="cstat-icon-box gray-box" aria-hidden="true">
          <EyeOff size={20} strokeWidth={2} />
        </div>
      </article>
    </section>
  );
}
