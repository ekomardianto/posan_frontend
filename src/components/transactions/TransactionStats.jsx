import React from 'react';
import { FileText, Banknote, BarChart3 } from 'lucide-react';
export default function TransactionStats({ stats }) {
  const dailyVolume = stats?.dailyVolume || { label: 'VOLUME TRANSAKSI', value: 0, unit: 'Tiket', comparisonText: 'Sinkronisasi Live Cloud' };
  const dailyRevenue = stats?.dailyRevenue || { label: 'TOTAL OMZET', value: 0, formattedValue: 'Rp0', subtitle: 'Net gross setelah diskon' };
  const averageOrderValue = stats?.averageOrderValue || { label: 'RATA-RATA TIKET (AOV)', value: 0, formattedValue: 'Rp0', subtitle: 'Berdasarkan transaksi tercatat' };

  return (
    <section className="trx-stats-grid" aria-label="Ringkasan Metrik Transaksi">
      {/* 1. Volume Hari Ini */}
      <div className="trx-stat-card animate-fade-in">
        <div className="trx-stat-main">
          <span className="trx-stat-label">{dailyVolume?.label || 'VOLUME TRANSAKSI'}</span>
          <div className="trx-stat-val-group">
            <span className="trx-stat-number">{dailyVolume?.value ?? 0}</span>
            <span className="trx-stat-unit">{dailyVolume?.unit || 'Tiket'}</span>
          </div>
          <span className="trx-stat-subtext text-positive">
            {dailyVolume?.comparisonText || 'Sinkronisasi database realtime'}
          </span>
        </div>
        <div className="trx-stat-icon-wrapper">
          <FileText size={20} strokeWidth={2.2} />
        </div>
      </div>

      {/* 2. Total Omzet Hari Ini */}
      <div className="trx-stat-card animate-fade-in">
        <div className="trx-stat-main">
          <span className="trx-stat-label">{dailyRevenue?.label || 'TOTAL OMZET'}</span>
          <div className="trx-stat-val-group">
            <span className="trx-stat-number">{dailyRevenue?.formattedValue || 'Rp0'}</span>
          </div>
          <span className="trx-stat-subtext">
            {dailyRevenue?.subtitle || 'Net gross setelah diskon'}
          </span>
        </div>
        <div className="trx-stat-icon-wrapper">
          <Banknote size={20} strokeWidth={2.2} />
        </div>
      </div>

      {/* 3. Rata-Rata Tiket (AOV) */}
      <div className="trx-stat-card animate-fade-in">
        <div className="trx-stat-main">
          <span className="trx-stat-label">{averageOrderValue?.label || 'RATA-RATA TIKET (AOV)'}</span>
          <div className="trx-stat-val-group">
            <span className="trx-stat-number">{averageOrderValue?.formattedValue || 'Rp0'}</span>
          </div>
          <span className="trx-stat-subtext">
            {averageOrderValue?.subtitle || 'Stabil pada jam sibuk'}
          </span>
        </div>
        <div className="trx-stat-icon-wrapper">
          <BarChart3 size={20} strokeWidth={2.2} />
        </div>
      </div>
    </section>
  );
}
