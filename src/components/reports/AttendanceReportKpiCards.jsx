import React from 'react';
import {
  Calendar,
  UserCheck,
  Clock,
  Timer,
  Award,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';

const cardColorThemes = {
  totalRecords: {
    gradient: 'linear-gradient(135deg, rgba(140, 94, 60, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
    border: '#E8DED3',
    iconBg: '#F5ECE3',
    iconColor: '#8C5E3C',
    accentColor: '#8C5E3C',
    glow: 'rgba(140, 94, 60, 0.15)',
  },
  activeWorking: {
    gradient: 'linear-gradient(135deg, rgba(21, 128, 61, 0.09) 0%, rgba(255, 255, 255, 0.9) 100%)',
    border: '#BBF7D0',
    iconBg: '#DCFCE7',
    iconColor: '#15803D',
    accentColor: '#15803D',
    glow: 'rgba(21, 128, 61, 0.2)',
  },
  totalWorkHours: {
    gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
    border: '#FDE68A',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    accentColor: '#D97706',
    glow: 'rgba(217, 119, 6, 0.15)',
  },
  avgShiftHours: {
    gradient: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
    border: '#E0E7FF',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    accentColor: '#4F46E5',
    glow: 'rgba(79, 70, 229, 0.15)',
  },
  onTimeRate: {
    gradient: 'linear-gradient(135deg, rgba(180, 83, 9, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
    border: '#FED7AA',
    iconBg: '#FFEDD5',
    iconColor: '#C2410C',
    accentColor: '#C2410C',
    glow: 'rgba(180, 83, 9, 0.15)',
  },
};

export default function AttendanceReportKpiCards({ kpiData }) {
  if (!kpiData) return null;

  const parseValueAndUnit = (formattedValue, rawValue, defaultUnit = '') => {
    if (!formattedValue) return { value: rawValue || 0, unit: defaultUnit };
    const str = String(formattedValue).trim();
    const match = str.match(/^([\d.,]+)\s*([a-zA-Z%]+.*)$/);
    if (match) {
      return { value: match[1], unit: match[2] };
    }
    return { value: str, unit: defaultUnit };
  };

  const cards = [
    {
      key: 'totalRecords',
      data: kpiData.totalRecords || {},
      label: 'TOTAL PRESENSI',
      icon: Calendar,
      defaultUnit: 'Kehadiran',
      badgeText: 'TERCATAT',
      badgeType: 'coffee',
      defaultComparison: 'Sistem Cloud POS',
      progressPct: 100,
    },
    {
      key: 'activeWorking',
      data: kpiData.activeWorking || {},
      label: 'STAF AKTIF SAAT INI',
      icon: UserCheck,
      defaultUnit: 'Orang',
      badgeText: 'LIVE SHIFT',
      badgeType: 'emerald',
      defaultComparison: 'Sedang bertugas di outlet',
      isLive: true,
      progressPct: Math.min(100, (Number(kpiData.activeWorking?.value || 0) / 6) * 100),
    },
    {
      key: 'totalWorkHours',
      data: kpiData.totalWorkHours || {},
      label: 'TOTAL JAM KERJA',
      icon: Clock,
      defaultUnit: 'Jam',
      badgeText: 'AKUMULASI',
      badgeType: 'amber',
      defaultComparison: 'Durasi seluruh staf',
      progressPct: Math.min(100, (Number(kpiData.totalWorkHours?.value || 0) / 100) * 100),
    },
    {
      key: 'avgShiftHours',
      data: kpiData.avgShiftHours || {},
      label: 'RATA-RATA SHIFT',
      icon: Timer,
      defaultUnit: 'Jam / Shift',
      badgeText: 'STANDAR REGULER',
      badgeType: 'indigo',
      defaultComparison: 'Target 8 jam normal',
      progressPct: Math.min(100, (Number(kpiData.avgShiftHours?.value || 0) / 8) * 100),
    },
    {
      key: 'onTimeRate',
      data: kpiData.onTimeRate || {},
      label: 'TINGKAT KETEPATAN',
      icon: Award,
      defaultUnit: '%',
      badgeText: 'KEDISIPLINAN',
      badgeType: 'gold',
      defaultComparison: 'Batas masuk <= 08:10 WIB',
      progressPct: Number(kpiData.onTimeRate?.value || 100),
    },
  ];

  return (
    <section className="attendance-kpi-showcase animate-fade-in" aria-label="Ringkasan Metrik Presensi Staf">
      <div className="attendance-kpi-grid-premium">
        {cards.map(({ key, data, label, icon: IconComponent, defaultUnit, badgeText, badgeType, defaultComparison, isLive, progressPct }) => {
          const theme = cardColorThemes[key] || cardColorThemes.totalRecords;
          const { value, unit } = parseValueAndUnit(data.formattedValue, data.value, defaultUnit);

          return (
            <article
              key={key}
              className={`attendance-kpi-card-v2 card-theme-${badgeType}`}
              style={{
                background: theme.gradient,
                borderColor: theme.border,
              }}
            >
              {/* Top Row: Label & Dual-Tone Icon */}
              <div className="att-kpi-header">
                <span className="att-kpi-label">{data.label || label}</span>
                <div
                  className="att-kpi-icon-bubble"
                  style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
                >
                  <IconComponent size={19} strokeWidth={2.4} />
                  {isLive && <span className="att-kpi-radar-ring" />}
                </div>
              </div>

              {/* Middle Row: Massive Modern Value Display */}
              <div className="att-kpi-value-block">
                <span className="att-kpi-number" style={{ color: '#221C18' }}>
                  {value}
                </span>
                {unit && (
                  <span className="att-kpi-unit" style={{ color: theme.accentColor }}>
                    {unit}
                  </span>
                )}
              </div>

              {/* Progress Micro-Bar */}
              <div className="att-kpi-meter-track">
                <div
                  className={`att-kpi-meter-fill fill-${badgeType}`}
                  style={{
                    width: `${Math.max(8, Math.min(100, progressPct || 50))}%`,
                    backgroundColor: theme.accentColor,
                  }}
                />
              </div>

              {/* Bottom Row: Badge & Description */}
              <div className="att-kpi-footer">
                <span className={`att-kpi-chip chip-${badgeType}`}>
                  {isLive && <span className="pulse-dot-emerald" />}
                  <span>{badgeText}</span>
                </span>
                <span className="att-kpi-desc" title={data.comparisonText || defaultComparison}>
                  {data.comparisonText || defaultComparison}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
