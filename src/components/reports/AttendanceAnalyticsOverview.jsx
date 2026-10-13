import React, { useState } from 'react';
import {
  Coffee,
  Utensils,
  Receipt,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Hourglass,
  Radio,
  Zap,
  TrendingUp,
  User
} from 'lucide-react';
import { formatTimeOnly } from '../../services/attendanceService';

export default function AttendanceAnalyticsOverview({
  attendanceRecords = [],
  kpiData = {},
  periodLabel = 'Seminggu (7 Hari)'
}) {
  const [selectedStationTab, setSelectedStationTab] = useState('all');

  // Active working staff
  const activeWorkingStaff = attendanceRecords.filter((r) => r.status === 'working');

  // Breakdown by role
  const roleBreakdown = attendanceRecords.reduce((acc, r) => {
    const roleKey = (r.role || 'kasir').toLowerCase();
    if (!acc[roleKey]) {
      acc[roleKey] = { count: 0, hoursSec: 0, onTimeCount: 0 };
    }
    acc[roleKey].count += 1;
    acc[roleKey].hoursSec += (r.durationSeconds || 0);
    return acc;
  }, {});

  const getRoleIcon = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('kitchen') || r.includes('koki')) return <Utensils size={13} />;
    if (r.includes('kasir')) return <Receipt size={13} />;
    return <Coffee size={13} />;
  };

  const getRoleLabel = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('kitchen')) return 'Kitchen';
    if (r.includes('kasir')) return 'Kasir';
    return 'Barista';
  };

  const totalRecords = attendanceRecords.length || 1;
  const completedCount = attendanceRecords.filter((r) => r.status === 'completed').length;
  const workingCount = activeWorkingStaff.length;

  const completedPct = Math.round((completedCount / totalRecords) * 100);
  const workingPct = Math.round((workingCount / totalRecords) * 100);

  const totalHoursAccumulated = (
    attendanceRecords.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 3600
  ).toFixed(1);

  // Filtered active working staff by tab
  const filteredActiveStaff = selectedStationTab === 'all'
    ? activeWorkingStaff
    : activeWorkingStaff.filter((s) => (s.role || '').toLowerCase().includes(selectedStationTab));

  return (
    <section className="attendance-analytics-cockpit animate-fade-in" aria-label="Analisis Visual Presensi">
      {/* 1. Left Card: Status & Role Distribution Breakdown */}
      <article className="att-analytics-card att-distribution-card">
        <div className="att-card-top-bar">
          <div className="card-titles">
            <span className="card-badge-tag">DISTRIBUSI & EFISIENSI TIM</span>
            <h2 className="card-title-text">Status Shift & Alokasi Stasiun</h2>
            <p className="card-subtitle-text">Periode: {periodLabel} • Total {totalHoursAccumulated} Jam Kerja</p>
          </div>
          <div className="att-cloud-sync-pill">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Cloud Realtime</span>
          </div>
        </div>

        <div className="att-card-content-body">
          {/* Dual Segment Progress Bar */}
          <div className="att-split-progress-box">
            <div className="progress-labels-row">
              <span className="label-completed">
                <span className="legend-indicator dot-emerald" />
                <span>Shift Selesai: {completedCount} ({completedPct}%)</span>
              </span>
              <span className="label-working">
                <span className="legend-indicator dot-amber" />
                <span>Aktif Bertugas: {workingCount} ({workingPct}%)</span>
              </span>
            </div>

            <div className="progress-dual-track">
              <div
                className="progress-segment segment-completed"
                style={{ width: `${completedPct}%` }}
                title={`Shift Selesai: ${completedPct}%`}
              />
              <div
                className="progress-segment segment-working"
                style={{ width: `${workingPct}%` }}
                title={`Sedang Bekerja: ${workingPct}%`}
              />
            </div>
          </div>

          {/* Stasiun Cards Grid */}
          <div className="att-station-cards-grid">
            {[
              { key: 'barista', label: 'Barista (Minuman)', theme: 'coffee' },
              { key: 'kitchen', label: 'Kitchen (Makanan)', theme: 'amber' },
              { key: 'kasir', label: 'Kasir POS (Kasir)', theme: 'blue' },
            ].map(({ key, label, theme }) => {
              const data = roleBreakdown[key] || { count: 0, hoursSec: 0 };
              const hours = (data.hoursSec / 3600).toFixed(1);
              const countShare = Math.round((data.count / totalRecords) * 100);
              const icon = getRoleIcon(key);

              return (
                <div key={key} className={`att-station-card-item theme-${theme}`}>
                  <div className="station-icon-wrap">
                    {icon}
                  </div>
                  <div className="station-card-details">
                    <span className="station-name-label">{label}</span>
                    <div className="station-metrics-row">
                      <span className="station-count-val">{data.count} Presensi</span>
                      <span className="station-hours-val">{hours} Jam</span>
                    </div>
                    {/* Mini Progress */}
                    <div className="station-micro-meter">
                      <div
                        className="micro-meter-fill"
                        style={{ width: `${Math.max(5, countShare)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Punctuality & Discipline Box */}
          <div className="att-punctuality-highlight-strip">
            <div className="strip-left">
              <Sparkles size={16} className="text-amber" />
              <div className="strip-text">
                <span className="strip-title">Kedisiplinan Masuk Shift:</span>
                <span className="strip-desc">
                  Tingkat ketepatan waktu rata-rata mencapai {kpiData?.onTimeRate?.formattedValue || '100%'}
                </span>
              </div>
            </div>
            <div className="strip-badge">
              <CheckCircle2 size={13} />
              <span>Sangat Baik</span>
            </div>
          </div>
        </div>
      </article>

      {/* 2. Right Card: Live Radar Staf Aktif Bertugas */}
      <article className="att-analytics-card att-live-radar-card">
        <div className="att-card-top-bar">
          <div className="card-titles">
            <span className="card-badge-tag">OUTLET FLOOR RADAR</span>
            <h2 className="card-title-text">Staf Sedang Bertugas</h2>
            <p className="card-subtitle-text">Monitoring kehadiran real-time Mobile POS</p>
          </div>
          <div className="att-radar-beacon-pill">
            <span className="radar-ping" />
            <span className="radar-dot" />
            <span>{workingCount} ON-DUTY</span>
          </div>
        </div>

        {/* Station Filter Tabs for Active Staff */}
        <div className="att-active-station-tabs">
          {[
            { id: 'all', label: `Semua (${activeWorkingStaff.length})` },
            { id: 'barista', label: `☕ Barista (${activeWorkingStaff.filter(s => (s.role||'').toLowerCase().includes('barista')).length})` },
            { id: 'kitchen', label: `🍳 Kitchen (${activeWorkingStaff.filter(s => (s.role||'').toLowerCase().includes('kitchen')).length})` },
            { id: 'kasir', label: `💳 Kasir (${activeWorkingStaff.filter(s => (s.role||'').toLowerCase().includes('kasir')).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`station-tab-chip ${selectedStationTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedStationTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Staff List */}
        <div className="att-active-staff-scrollbox">
          {filteredActiveStaff.length === 0 ? (
            <div className="att-no-active-staff">
              <div className="empty-radar-circle">
                <Clock size={28} strokeWidth={1.5} />
              </div>
              <h3 className="empty-radar-title">Tidak ada staf aktif di filter ini</h3>
              <p className="empty-radar-sub">
                {activeWorkingStaff.length === 0
                  ? 'Seluruh staf telah menyelesaikan shift hari ini atau belum melakukan absensi masuk.'
                  : 'Pilih stasiun lain untuk melihat staf yang sedang bertugas.'}
              </p>
            </div>
          ) : (
            filteredActiveStaff.map((staff) => {
              const inTimeStr = formatTimeOnly(staff.check_in_time);
              const roleIcon = getRoleIcon(staff.role);
              const roleName = getRoleLabel(staff.role);
              const initials = (staff.user_name || 'ST').slice(0, 2).toUpperCase();

              return (
                <div key={staff.id} className="att-active-employee-card animate-fade-in">
                  {/* Avatar with glowing ring */}
                  <div className="employee-avatar-wrapper">
                    <span className="avatar-initials">{initials}</span>
                    <span className="avatar-pulse-beacon" />
                  </div>

                  {/* Info details */}
                  <div className="employee-info-col">
                    <div className="employee-headline">
                      <h4 className="employee-name">{staff.user_name}</h4>
                      <span className={`employee-station-tag role-${(staff.role || 'kasir').toLowerCase()}`}>
                        {roleIcon}
                        <span>{roleName}</span>
                      </span>
                    </div>

                    <div className="employee-meta-row">
                      <span className="clockin-badge">
                        <Clock size={11} /> Masuk: {inTimeStr}
                      </span>
                      <span className="elapsed-badge">
                        <Hourglass size={11} /> {staff.formattedDuration || 'Berjalan'}
                      </span>
                    </div>

                    {staff.notes && (
                      <p className="employee-notes-preview">
                        "{staff.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}
