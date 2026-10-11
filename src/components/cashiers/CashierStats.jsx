import React from 'react';
import { Users, ShieldCheck, UserX, FileText } from 'lucide-react';

export default function CashierStats({ cashiers = [] }) {
  const totalCashiers = cashiers.length;
  const activeCashiers = cashiers.filter((c) => c.status === 'Aktif').length;
  const inactiveCashiers = cashiers.filter((c) => c.status === 'Nonaktif').length;
  const activePercentage = totalCashiers > 0 ? ((activeCashiers / totalCashiers) * 100).toFixed(0) : 100;

  return (
    <section className="cashier-stats-grid" aria-label="Ringkasan Status Staf">
      {/* 1. Total Staf */}
      <div className="cashier-stat-card animate-fade-in">
        <div className="cashier-stat-main">
          <span className="cashier-stat-label">TOTAL STAF OPERASIONAL</span>
          <div className="cashier-stat-val-group">
            <span className="cashier-stat-number">{totalCashiers}</span>
          </div>
          <span className="cashier-stat-subtext">Kasir, Barista, Kitchen</span>
        </div>
        <div className="cashier-stat-icon-wrapper icon-terminal">
          <Users size={20} strokeWidth={2.2} />
        </div>
      </div>

      {/* 2. Staf Aktif */}
      <div className="cashier-stat-card animate-fade-in">
        <div className="cashier-stat-main">
          <span className="cashier-stat-label">STAF AKTIF</span>
          <div className="cashier-stat-val-group">
            <span className="cashier-stat-number">{activeCashiers}</span>
          </div>
          <span className="cashier-stat-subtext text-active-ready">
            <strong>{activePercentage}%</strong> Siap bertugas
          </span>
        </div>
        <div className="cashier-stat-icon-wrapper icon-active">
          <ShieldCheck size={20} strokeWidth={2.2} />
        </div>
      </div>

      {/* 3. Staf Nonaktif */}
      <div className="cashier-stat-card animate-fade-in">
        <div className="cashier-stat-main">
          <span className="cashier-stat-label">STAF NONAKTIF</span>
          <div className="cashier-stat-val-group">
            <span className="cashier-stat-number">{inactiveCashiers}</span>
          </div>
          <span className="cashier-stat-subtext text-locked">
            {inactiveCashiers} Akun nonaktif
          </span>
        </div>
        <div className="cashier-stat-icon-wrapper icon-locked">
          <UserX size={20} strokeWidth={2.2} />
        </div>
      </div>

      {/* 4. Sesi Operasional */}
      <div className="cashier-stat-card animate-fade-in">
        <div className="cashier-stat-main">
          <span className="cashier-stat-label">STATUS OTORISASI</span>
          <div className="cashier-stat-val-group">
            <span className="cashier-stat-number" style={{ fontSize: '1.25rem', color: '#15803D' }}>Aktif</span>
          </div>
          <span className="cashier-stat-subtext">Sinkronisasi database</span>
        </div>
        <div className="cashier-stat-icon-wrapper icon-sessions">
          <FileText size={20} strokeWidth={2.2} />
        </div>
      </div>
    </section>
  );
}


