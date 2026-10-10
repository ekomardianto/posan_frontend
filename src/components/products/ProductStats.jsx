import React from 'react';
import { Store, CheckCircle2, PauseCircle } from 'lucide-react';

export default function ProductStats({ products = [] }) {
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'Aktif').length;
  const inactiveCount = products.filter((p) => p.status === 'Nonaktif').length;

  const uniqueCategories = new Set(products.map((p) => p.category)).size;
  const activePercentage = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <section className="product-stats-grid animate-fade-in" aria-label="Statistik Katalog Menu">
      {/* 1. Total Menu */}
      <article className="product-stat-card">
        <div className="pstat-content">
          <span className="pstat-label">TOTAL MENU</span>
          <div className="pstat-value-row">
            <span className="pstat-value">{totalCount} Item</span>
            <span className="pstat-badge">{uniqueCategories} Kategori</span>
          </div>
        </div>
        <div className="pstat-icon-wrapper" aria-hidden="true">
          <Store size={20} strokeWidth={2} />
        </div>
      </article>

      {/* 2. Aktif di Kasir */}
      <article className="product-stat-card">
        <div className="pstat-content">
          <span className="pstat-label">AKTIF DI KASIR</span>
          <div className="pstat-value-row">
            <span className="pstat-value">{activeCount} Item</span>
            <span className="pstat-percentage">{activePercentage}%</span>
          </div>
        </div>
        <div className="pstat-icon-wrapper active-icon" aria-hidden="true">
          <CheckCircle2 size={20} strokeWidth={2.2} />
        </div>
      </article>

      {/* 3. Menu Nonaktif */}
      <article className="product-stat-card">
        <div className="pstat-content">
          <span className="pstat-label">MENU NONAKTIF</span>
          <div className="pstat-value-row">
            <span className="pstat-value">{inactiveCount} Item</span>
            <span className="pstat-badge">Tersimpan</span>
          </div>
        </div>
        <div className="pstat-icon-wrapper inactive-icon" aria-hidden="true">
          <PauseCircle size={20} strokeWidth={2} />
        </div>
      </article>
    </section>
  );
}
