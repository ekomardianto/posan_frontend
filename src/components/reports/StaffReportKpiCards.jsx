import React from 'react';
import { Users, CheckCircle2, Clock, Timer, Flame, Award, TrendingUp } from 'lucide-react';

const iconConfig = {
  users: { component: Users, bgClass: 'icon-box-coffee', stroke: '#8C5E3C' },
  'check-circle': { component: CheckCircle2, bgClass: 'icon-box-green', stroke: '#15803D' },
  flame: { component: Flame, bgClass: 'icon-box-amber', stroke: '#D97706' },
  timer: { component: Timer, bgClass: 'icon-box-dark', stroke: '#221C18' },
  award: { component: Award, bgClass: 'icon-box-gold', stroke: '#B45309' },
};

export default function StaffReportKpiCards({ kpiData }) {
  if (!kpiData) return null;

  const parseValueAndUnit = (formattedValue, rawValue, defaultUnit = '') => {
    if (!formattedValue) return { value: rawValue || 0, unit: defaultUnit };
    const str = String(formattedValue).trim();
    // e.g. "13 Item" -> value: "13", unit: "Item"
    // e.g. "1 Orang" -> value: "1", unit: "Orang"
    // e.g. "2m 40s" -> value: "2m 40s", unit: ""
    const match = str.match(/^([\d.,]+)\s*([a-zA-Z]+)$/);
    if (match) {
      return { value: match[1], unit: match[2] };
    }
    return { value: str, unit: defaultUnit };
  };

  const cards = [
    {
      key: 'totalActiveStaff',
      data: kpiData.totalActiveStaff || {},
      label: 'TOTAL STAF BERTUGAS',
      defaultIcon: 'users',
      defaultUnit: 'Orang',
      badgeType: 'info',
      badgeText: 'LIVE',
      defaultComparison: 'Barista, Kitchen & Kasir',
    },
    {
      key: 'totalCompletedOrders',
      data: kpiData.totalCompletedOrders || {},
      label: 'TOTAL PESANAN SELESAI',
      defaultIcon: 'check-circle',
      defaultUnit: 'Item',
      badgeType: 'positive',
      badgeText: '✓ SELESAI',
      defaultComparison: 'Terselesaikan Tepat Waktu',
    },
    {
      key: 'totalProcessingOrders',
      data: kpiData.totalProcessingOrders || {},
      label: 'PESANAN MASIH DIPROSES',
      defaultIcon: 'flame',
      defaultUnit: 'Item',
      badgeType: 'warning',
      badgeText: '⏳ AKTIF',
      defaultComparison: 'Dalam Antrean / Proses',
    },
    {
      key: 'averageCompletionTime',
      data: kpiData.averageCompletionTime || {},
      label: 'RATA-RATA WAKTU SELESAI',
      defaultIcon: 'timer',
      defaultUnit: '',
      badgeType: 'info',
      badgeText: 'LIVE',
      defaultComparison: 'Kecepatan Pelayanan Tim',
    },
  ];

  return (
    <section className="report-kpi-grid animate-fade-in" aria-label="Ringkasan Metrik Staf">
      {cards.map(({ key, data, label, defaultIcon, defaultUnit, badgeType, badgeText, defaultComparison }) => {
        const iconKey = data.iconType || defaultIcon;
        const iconInfo = iconConfig[iconKey] || iconConfig.timer;
        const IconComponent = iconInfo.component;

        const { value, unit } = parseValueAndUnit(data.formattedValue, data.value, defaultUnit);

        return (
          <article key={key} className="report-kpi-card">
            {/* Top row: Label & Themed Icon */}
            <div className="kpi-card-header">
              <span className="kpi-card-label">{data.label || label}</span>
              <div className={`kpi-icon-wrapper ${iconInfo.bgClass}`} aria-hidden="true">
                <IconComponent size={18} strokeWidth={2.2} color={iconInfo.stroke} />
              </div>
            </div>

            {/* Middle row: Big Bold Value & Unit */}
            <div className="kpi-value-row">
              <span className="kpi-main-val">{value}</span>
              {unit && <span className="kpi-unit-suffix">{unit}</span>}
            </div>

            {/* Bottom row: Trend badge & Comparison text */}
            <div className="kpi-trend-row">
              <span className={`kpi-trend-pill ${badgeType}`}>
                {badgeType === 'info' && <span className="live-dot-pulse-sm" />}
                <span>{badgeText}</span>
              </span>
              <span className="kpi-comparison-text">{data.comparisonText || defaultComparison}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
