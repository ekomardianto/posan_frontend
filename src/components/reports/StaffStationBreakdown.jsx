import React from 'react';
import { Coffee, Utensils, Receipt, Layers } from 'lucide-react';

export default function StaffStationBreakdown({ staffTableData = [] }) {
  let baristaCount = 0;
  let kitchenCount = 0;
  let cashierCount = 0;

  (staffTableData || []).forEach((row) => {
    (row.detail || []).forEach((det) => {
      const st = (det.station || '').toLowerCase();
      if (st.includes('kitchen') || st.includes('makan') || st.includes('food')) {
        kitchenCount += det.quantity || 1;
      } else if (st.includes('kasir')) {
        cashierCount += det.quantity || 1;
      } else {
        baristaCount += det.quantity || 1;
      }
    });
  });

  const total = baristaCount + kitchenCount + cashierCount || 1;
  const baristaPct = Math.round((baristaCount / total) * 100);
  const kitchenPct = Math.round((kitchenCount / total) * 100);
  const cashierPct = Math.max(0, 100 - baristaPct - kitchenPct);

  const stations = [
    {
      id: 'barista',
      name: 'Stasiun Barista (Minuman)',
      count: baristaCount,
      pct: baristaPct,
      color: '#8C5E3C',
      icon: Coffee,
      bg: '#F5ECE3',
    },
    {
      id: 'kitchen',
      name: 'Stasiun Kitchen (Makanan)',
      count: kitchenCount,
      pct: kitchenPct,
      color: '#D97706',
      icon: Utensils,
      bg: '#FEF3C7',
    },
    {
      id: 'kasir',
      name: 'Kasir & Pembayaran',
      count: cashierCount,
      pct: cashierPct,
      color: '#2563EB',
      icon: Receipt,
      bg: '#EFF6FF',
    },
  ];

  return (
    <div className="staff-station-card animate-fade-in" aria-label="Distribusi Stasiun Kerja">
      <div className="station-card-header">
        <div className="station-icon-box">
          <Layers size={17} className="text-accent-brown" />
        </div>
        <div>
          <h3 className="station-title">Distribusi Pesanan per Stasiun</h3>
          <span className="station-subtitle">Beban kerja stasiun barista, kitchen & kasir</span>
        </div>
      </div>

      <div className="station-progress-bar-group">
        <div className="multi-progress-track">
          <div className="multi-progress-fill barista" style={{ width: `${baristaPct}%` }} title={`Barista: ${baristaPct}%`} />
          <div className="multi-progress-fill kitchen" style={{ width: `${kitchenPct}%` }} title={`Kitchen: ${kitchenPct}%`} />
          <div className="multi-progress-fill cashier" style={{ width: `${cashierPct}%` }} title={`Kasir: ${cashierPct}%`} />
        </div>
      </div>

      <div className="station-items-list">
        {stations.map((st) => {
          const IconComp = st.icon;
          return (
            <div key={st.id} className="station-item-row">
              <div className="station-item-left">
                <div className="station-item-icon" style={{ backgroundColor: st.bg, color: st.color }}>
                  <IconComp size={14} />
                </div>
                <div className="station-item-text">
                  <strong className="station-item-name">{st.name}</strong>
                  <span className="station-item-count">{st.count} item diproses</span>
                </div>
              </div>
              <div className="station-item-right">
                <strong className="station-pct-val" style={{ color: st.color }}>{st.pct}%</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
