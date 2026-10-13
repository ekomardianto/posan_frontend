import React from 'react';
import { Package, CheckCircle2, AlertTriangle, AlertOctagon, TrendingDown, Coins } from 'lucide-react';

export default function InventoryStats({ ingredients = [], opnames = [] }) {
  const totalItems = ingredients.length;
  
  const safeCount = ingredients.filter(i => i.status === 'Aman').length;
  const lowCount = ingredients.filter(i => i.status === 'Menipis').length;
  const outCount = ingredients.filter(i => i.status === 'Habis').length;

  const totalAssetValue = ingredients.reduce((sum, item) => {
    return sum + ((Number(item.currentStock) || 0) * (Number(item.costPerUnit) || 0));
  }, 0);

  // Total Beban Kerugian dari Stock Opname bulan ini / seluruh sesi
  const totalBebanValue = opnames.reduce((sum, opn) => {
    return sum + (Number(opn.totalLossValue) || 0);
  }, 0);

  return (
    <div className="inventory-stats-grid animate-fade-in">
      {/* 1. Total Bahan Baku */}
      <div className="inventory-stat-card">
        <div className="inventory-stat-header">
          <span className="inventory-stat-label">Total Bahan Baku</span>
          <div className="inventory-stat-icon-wrapper" style={{ backgroundColor: '#F5EBE1', color: '#8C5E3C' }}>
            <Package size={18} />
          </div>
        </div>
        <div className="inventory-stat-value">{totalItems} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Item</span></div>
        <div className="inventory-stat-subtext">
          <span>Katalog resep & operasional bar</span>
        </div>
      </div>

      {/* 2. Stok Aman */}
      <div className="inventory-stat-card">
        <div className="inventory-stat-header">
          <span className="inventory-stat-label">Stok Aman</span>
          <div className="inventory-stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-green-bg)', color: 'var(--accent-green)' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="inventory-stat-value" style={{ color: 'var(--accent-green)' }}>
          {safeCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Bahan</span>
        </div>
        <div className="inventory-stat-subtext">
          <span>Di atas toleransi minimum</span>
        </div>
      </div>

      {/* 3. Stok Menipis (Di Bawah Toleransi Minimum) */}
      <div className={`inventory-stat-card ${lowCount > 0 ? 'stat-warning' : ''}`}>
        <div className="inventory-stat-header">
          <span className="inventory-stat-label">Perlu Restock</span>
          <div className="inventory-stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="inventory-stat-value" style={{ color: '#D97706' }}>
          {lowCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Menipis</span>
          {outCount > 0 && (
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#DC2626', marginLeft: '6px' }}>
              ({outCount} Habis)
            </span>
          )}
        </div>
        <div className="inventory-stat-subtext" style={{ color: lowCount > 0 ? '#B45309' : undefined }}>
          <span>{lowCount > 0 ? 'Menyentuh toleransi minimum' : 'Semua bahan tercukupi'}</span>
        </div>
      </div>

      {/* 4. Total Beban Selisih Stock Opname */}
      <div className={`inventory-stat-card ${totalBebanValue > 0 ? 'stat-alert' : ''}`}>
        <div className="inventory-stat-header">
          <span className="inventory-stat-label">Total Beban Selisih</span>
          <div className="inventory-stat-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <TrendingDown size={18} />
          </div>
        </div>
        <div className="inventory-stat-value" style={{ color: '#DC2626' }}>
          Rp {totalBebanValue.toLocaleString('id-ID')}
        </div>
        <div className="inventory-stat-subtext">
          <span>Akumulasi waste & shrinkage opname</span>
        </div>
      </div>

      {/* 5. Total Estimasi Nilai Stok */}
      <div className="inventory-stat-card">
        <div className="inventory-stat-header">
          <span className="inventory-stat-label">Nilai Aset Bahan</span>
          <div className="inventory-stat-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
            <Coins size={18} />
          </div>
        </div>
        <div className="inventory-stat-value" style={{ color: '#1E40AF', fontSize: '1.45rem' }}>
          Rp {totalAssetValue.toLocaleString('id-ID')}
        </div>
        <div className="inventory-stat-subtext">
          <span>Total valuasi stok gudang</span>
        </div>
      </div>
    </div>
  );
}
