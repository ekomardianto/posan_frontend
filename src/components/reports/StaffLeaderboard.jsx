import React from 'react';
import { Award, Trophy, Medal, Flame, Timer, Coffee, Utensils, Receipt, CheckCircle2 } from 'lucide-react';
import { formatStaffName } from '../../services/staffReportService';

export default function StaffLeaderboard({ staffTableData = [] }) {
  // Aggregate stats per staff
  const staffMap = {};

  (staffTableData || []).forEach((row) => {
    const sName = formatStaffName(row.staffName);
    if (!staffMap[sName]) {
      staffMap[sName] = {
        name: sName,
        role: row.staffRole,
        roleLabel: row.roleBadgeLabel || row.staffRole,
        completed: 0,
        processing: 0,
        totalDuration: 0,
        completedCount: 0,
      };
    }
    staffMap[sName].completed += row.completedCount || 0;
    staffMap[sName].processing += row.processingCount || 0;
    staffMap[sName].totalDuration += (row.avgDurationSeconds || 0) * (row.completedCount || 0);
    staffMap[sName].completedCount += row.completedCount || 0;
  });

  const rankedStaff = Object.values(staffMap).map((st) => {
    const avgSec = st.completedCount > 0 ? Math.round(st.totalDuration / st.completedCount) : 0;
    const m = Math.floor(avgSec / 60);
    const s = Math.round(avgSec % 60);
    const formattedAvg = avgSec > 0 ? (m === 0 ? `${s}s` : s === 0 ? `${m}m` : `${m}m ${s}s`) : '0s';

    let badge = 'Standar';
    let badgeClass = 'normal';
    if (st.completed >= 10 || (avgSec > 0 && avgSec <= 180)) {
      badge = 'Sangat Cepat ⭐';
      badgeClass = 'top';
    } else if (st.completed >= 5 || (avgSec > 0 && avgSec <= 300)) {
      badge = 'Optimal ✨';
      badgeClass = 'high';
    }

    return {
      name: st.name,
      role: st.role,
      roleLabel: st.roleLabel,
      completed: st.completed,
      processing: st.processing,
      avgSec,
      formattedAvg,
      badge,
      badgeClass,
    };
  });

  // Sort by completed count descending
  rankedStaff.sort((a, b) => b.completed - a.completed);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="rank-badge rank-1" title="Peringkat 1">
          <Trophy size={14} />
          <span>#1</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="rank-badge rank-2" title="Peringkat 2">
          <Medal size={14} />
          <span>#2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="rank-badge rank-3" title="Peringkat 3">
          <Medal size={14} />
          <span>#3</span>
        </div>
      );
    }
    return <span className="rank-badge rank-other">#{rank}</span>;
  };

  const getRoleIcon = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'kitchen') return <Utensils size={12} />;
    if (r === 'kasir') return <Receipt size={12} />;
    return <Coffee size={12} />;
  };

  return (
    <div className="staff-leaderboard-card animate-fade-in" aria-label="Peringkat Kinerja Tim">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="leaderboard-title-group">
          <div className="leaderboard-icon-box">
            <Award size={18} className="text-accent-brown" />
          </div>
          <div>
            <h3 className="leaderboard-title">Peringkat Kinerja Tim</h3>
            <span className="leaderboard-subtitle">Staf paling aktif & efisien</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="leaderboard-list">
        {rankedStaff.length === 0 ? (
          <div className="leaderboard-empty">
            <p>Belum ada data peringkat tim.</p>
          </div>
        ) : (
          rankedStaff.slice(0, 5).map((staff, idx) => (
            <div key={staff.name} className={`leaderboard-item ${idx === 0 ? 'top-item' : ''}`}>
              <div className="leaderboard-item-left">
                {getRankBadge(idx + 1)}
                <div className="leaderboard-staff-info">
                  <span className="leaderboard-staff-name">{staff.name}</span>
                  <div className={`leaderboard-role-tag role-${(staff.role || 'barista').toLowerCase()}`}>
                    {getRoleIcon(staff.role)}
                    <span>{staff.roleLabel}</span>
                  </div>
                </div>
              </div>

              <div className="leaderboard-item-right">
                <div className="leaderboard-score">
                  <strong className="score-count">{staff.completed}</strong>
                  <span className="score-unit">pesanan</span>
                </div>
                <div className="leaderboard-time-pill">
                  <Timer size={11} />
                  <span>{staff.formattedAvg}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
