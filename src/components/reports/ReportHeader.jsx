import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

const formatSyncTime = () => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

export default function ReportHeader({
  onSync,
  isSyncing = false,
  activeTab = 'penjualan',
  title,
  subtitle,
  overline
}) {
  const [syncTime, setSyncTime] = useState(formatSyncTime);

  useEffect(() => {
    setSyncTime(formatSyncTime());
  }, [isSyncing]);

  const defaultOverline = activeTab === 'staf' ? 'PRODUKTIVITAS & KINERJA TIM' : 'RINGKASAN ANALITIK BISNIS';
  const defaultTitle = activeTab === 'staf' ? 'Laporan Staf' : 'Laporan Penjualan';
  const defaultSubtitle = activeTab === 'staf'
    ? 'Monitoring performa barista, kitchen, dan kasir, kecepatan pengerjaan pesanan, dan rincian tugas'
    : 'Analisis penjualan, omzet, dan riwayat transaksi café tersinkronisasi realtime database';

  return (
    <div className="report-header-section animate-fade-in">
      <div className="report-header-left">
        <span className="report-overline-tag">{overline || defaultOverline}</span>
        <h1 className="report-main-title">{title || defaultTitle}</h1>
        <p className="report-sub-title">{subtitle || defaultSubtitle}</p>
      </div>

      <div className="report-header-right">
        <button
          type="button"
          className="report-sync-badge-btn"
          onClick={onSync}
          disabled={isSyncing}
          title="Klik untuk menyinkronkan data analitik terbaru dari database"
        >
          {isSyncing ? (
            <RefreshCw size={13} className="spin-icon text-accent-brown" />
          ) : (
            <Clock size={13} className="text-accent-brown" />
          )}
          <span>Data sinkron: {syncTime}</span>
        </button>
      </div>
    </div>
  );
}
