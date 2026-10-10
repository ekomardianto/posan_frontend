import React from 'react';
import { Smartphone, Clock } from 'lucide-react';
import { securityProtocolInfo, lastAuditInfo } from '../../constants/appConstants';

export default function CashierFooterCards() {
  return (
    <section className="cashier-footer-cards-grid animate-fade-in" aria-label="Informasi Keamanan dan Audit Kasir">
      {/* 1. Protokol Keamanan Kasir */}
      <div className="cashier-security-card">
        <div className="security-card-icon-box icon-protocol">
          <Smartphone size={20} strokeWidth={2.2} />
        </div>
        <div className="security-card-text-group">
          <h3 className="security-card-title">{securityProtocolInfo.title}</h3>
          <p className="security-card-desc">{securityProtocolInfo.description}</p>
        </div>
      </div>

      {/* 2. Audit Otentikasi Terakhir */}
      <div className="cashier-security-card">
        <div className="security-card-icon-box icon-audit">
          <Clock size={20} strokeWidth={2.2} />
        </div>
        <div className="security-card-text-group">
          <h3 className="security-card-title">{lastAuditInfo.title}</h3>
          <p className="security-card-desc">{lastAuditInfo.description}</p>
        </div>
      </div>
    </section>
  );
}
