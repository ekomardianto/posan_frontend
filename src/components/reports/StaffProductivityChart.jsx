import React, { useState } from 'react';
import { BarChart2, TrendingUp, Clock, Timer, Users, Coffee, Utensils, Receipt, Zap } from 'lucide-react';
import { formatStaffName } from '../../services/staffReportService';

export default function StaffProductivityChart({ staffTableData = [], periodLabel = 'Seminggu' }) {
  const [metricMode, setMetricMode] = useState('orders'); // 'orders' | 'speed'

  // Aggregate by staff across the period
  const staffSummaryMap = {};
  (staffTableData || []).forEach((row) => {
    const sName = formatStaffName(row.staffName);
    if (!staffSummaryMap[sName]) {
      staffSummaryMap[sName] = {
        name: sName,
        role: row.staffRole,
        roleLabel: row.roleBadgeLabel || row.staffRole,
        completed: 0,
        processing: 0,
        totalDuration: 0,
        completedItemsCount: 0,
        daysActive: new Set(),
      };
    }
    staffSummaryMap[sName].completed += row.completedCount || 0;
    staffSummaryMap[sName].processing += row.processingCount || 0;
    staffSummaryMap[sName].totalDuration += (row.avgDurationSeconds || 0) * (row.completedCount || 0);
    staffSummaryMap[sName].completedItemsCount += row.completedCount || 0;
    if (row.dateKey) staffSummaryMap[sName].daysActive.add(row.dateKey);
  });

  const staffList = Object.values(staffSummaryMap).map((st) => {
    const avgSec = st.completedItemsCount > 0 ? Math.round(st.totalDuration / st.completedItemsCount) : 0;
    const m = Math.floor(avgSec / 60);
    const s = Math.round(avgSec % 60);
    const formattedAvg = avgSec > 0 ? (m === 0 ? `${s}s` : s === 0 ? `${m}m` : `${m}m ${s}s`) : '0s';

    return {
      name: st.name,
      role: st.role,
      roleLabel: st.roleLabel,
      completed: st.completed,
      processing: st.processing,
      avgSec,
      formattedAvg,
      daysCount: st.daysActive.size,
    };
  });

  // Sort by completed orders descending
  staffList.sort((a, b) => {
    if (metricMode === 'orders') return b.completed - a.completed;
    return (a.avgSec || 9999) - (b.avgSec || 9999);
  });

  const maxCompleted = Math.max(1, ...staffList.map((s) => s.completed));
  const maxSpeedSec = Math.max(300, ...staffList.map((s) => s.avgSec));

  const totalAllCompleted = staffList.reduce((acc, s) => acc + s.completed, 0);
  const avgStaffCompleted = staffList.length > 0 ? Math.round(totalAllCompleted / staffList.length) : 0;
  const topStaff = staffList[0] || null;

  const getRoleIcon = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'kitchen') return <Utensils size={13} className="text-amber-700" />;
    if (r === 'kasir') return <Receipt size={13} className="text-blue-700" />;
    return <Coffee size={13} className="text-amber-900" />;
  };

  const getRoleGradient = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'kitchen') return 'linear-gradient(135deg, #D97706, #92400E)';
    if (r === 'kasir') return 'linear-gradient(135deg, #2563EB, #1E40AF)';
    return 'linear-gradient(135deg, #8C5E3C, #5C3D26)';
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="staff-chart-card animate-fade-in" aria-label="Grafik Produktivitas Staf">
      {/* Chart Card Header */}
      <div className="staff-chart-header">
        <div className="chart-header-left">
          <span className="chart-overline">KOMPARASI PRODUKTIVITAS TIM</span>
          <h3 className="chart-title">Aktivitas & Kecepatan Staf</h3>
          <p className="chart-subtitle">
            Perbandingan total pesanan selesai dan kecepatan per staf ({periodLabel})
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="chart-mode-pills" role="radiogroup" aria-label="Metrik Grafik">
          <button
            type="button"
            className={`chart-mode-pill ${metricMode === 'orders' ? 'active' : ''}`}
            onClick={() => setMetricMode('orders')}
          >
            <BarChart2 size={13} />
            <span>Total Pesanan</span>
          </button>
          <button
            type="button"
            className={`chart-mode-pill ${metricMode === 'speed' ? 'active' : ''}`}
            onClick={() => setMetricMode('speed')}
          >
            <Zap size={13} />
            <span>Kecepatan (Waktu)</span>
          </button>
        </div>
      </div>

      {/* Main Visual Progress Bars */}
      <div className="staff-chart-body">
        {staffList.length === 0 ? (
          <div className="chart-empty-state">
            <Users size={32} className="text-tertiary" />
            <p>Belum ada data aktivitas staf untuk periode ini.</p>
          </div>
        ) : (
          <div className="staff-progress-list">
            {staffList.map((staff, idx) => {
              const orderPct = Math.round((staff.completed / maxCompleted) * 100);
              const speedPct = staff.avgSec > 0 ? Math.min(100, Math.round(((maxSpeedSec - staff.avgSec + 60) / maxSpeedSec) * 100)) : 0;
              const displayPct = metricMode === 'orders' ? orderPct : speedPct;

              return (
                <div key={staff.name} className="staff-bar-row">
                  {/* Left info: Avatar, Name, Role */}
                  <div className="staff-bar-info">
                    <div
                      className="staff-bar-avatar"
                      style={{ background: getRoleGradient(staff.role) }}
                    >
                      {getInitials(staff.name)}
                    </div>
                    <div className="staff-bar-text-group">
                      <div className="staff-bar-name-row">
                        <strong className="staff-bar-name">{staff.name}</strong>
                        {idx === 0 && (
                          <span className="staff-leader-tag">
                            {metricMode === 'orders' ? '🏆 Terbanyak' : '⚡ Tercepat'}
                          </span>
                        )}
                      </div>
                      <div className="staff-bar-role-tag">
                        {getRoleIcon(staff.role)}
                        <span>{staff.roleLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Progress Bar */}
                  <div className="staff-bar-track-wrapper">
                    <div className="staff-bar-track">
                      <div
                        className={`staff-bar-fill ${metricMode === 'orders' ? 'theme-order' : 'theme-speed'}`}
                        style={{
                          width: `${Math.max(8, displayPct)}%`,
                          background:
                            metricMode === 'orders'
                              ? idx === 0
                                ? 'linear-gradient(90deg, #1E1713 0%, #8C5E3C 100%)'
                                : 'linear-gradient(90deg, #8C5E3C 0%, #D4A373 100%)'
                              : 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Value Display */}
                  <div className="staff-bar-value-box">
                    {metricMode === 'orders' ? (
                      <div className="bar-val-group">
                        <strong className="bar-main-val">{staff.completed}</strong>
                        <span className="bar-unit-val">item selesai</span>
                      </div>
                    ) : (
                      <div className="bar-val-group speed">
                        <Timer size={13} className="text-green-600" />
                        <strong className="bar-main-val">{staff.formattedAvg}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart Footer Summary Cards */}
      <div className="staff-chart-footer">
        <div className="chart-footer-stat">
          <span className="footer-stat-label">Total Pesanan Ditangani</span>
          <strong className="footer-stat-val text-primary">{totalAllCompleted} Item</strong>
        </div>

        <div className="chart-footer-stat">
          <span className="footer-stat-label">Rata-rata per Staf</span>
          <strong className="footer-stat-val text-accent-brown">{avgStaffCompleted} Item / Staf</strong>
        </div>

        <div className="chart-footer-stat highlight">
          <span className="footer-stat-label">Top Performer Periode Ini</span>
          <strong className="footer-stat-val text-highlight">
            {topStaff ? `${topStaff.name} (${topStaff.completed} item)` : '-'}
          </strong>
        </div>
      </div>
    </div>
  );
}
