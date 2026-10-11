import React from 'react';
import { CreditCard } from 'lucide-react';
export default function PaymentMethodDonut({ paymentData = {} }) {
  const {
    title = 'Metode Pembayaran',
    subtitle = 'Proporsi pembayaran transaksi',
    dominantMethod = { name: '-', percentage: 0 },
    methods = [],
    cloudStatus = 'database POSAN',
    lastUpdate = 'Update: Realtime Live Sync'
  } = paymentData || {};

  // SVG Donut calculation
  const radius = 60;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative stroke dashoffset for each slice
  let accumulatedOffset = 0;
  const slices = (methods || []).map((method) => {
    const pct = Number(method.percentage) || 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (pct / 100) * circumference;

    return {
      ...method,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <article className="dashboard-card animate-fade-in" aria-label="Proporsi Metode Pembayaran">
      {/* Header */}
      <div className="card-header-bar">
        <div className="card-title-group">
          <h2 className="card-title">{title}</h2>
          <span className="card-subtitle">{subtitle}</span>
        </div>
        <div className="payment-card-icon" aria-hidden="true">
          <CreditCard size={18} strokeWidth={1.8} />
        </div>
      </div>

      {/* Donut Chart with Center Highlight */}
      <div className="donut-wrapper">
        <svg viewBox="0 0 160 160" className="donut-svg">
          {slices.map((slice) => (
            <circle
              key={slice.id}
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          ))}
        </svg>

        {/* Donut Center Text */}
        <div className="donut-center-info">
          <span className="donut-sub">{dominantMethod.label}</span>
          <span className="donut-main">{dominantMethod.name}</span>
          <span className="donut-pct">{dominantMethod.percentage}%</span>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="payment-methods-list">
        {methods.map((method) => (
          <div key={method.id} className="payment-item-row">
            <div className="payment-item-left">
              <span className="payment-dot" style={{ backgroundColor: method.color }} />
              <div>
                <span className="payment-name">{method.name}</span>
                <span className="payment-count"> &middot; {method.orderCount} pesanan</span>
              </div>
            </div>

            <div className="payment-item-right">
              <span className="payment-nominal">{method.formattedNominal}</span>
              <span className="payment-percentage">({(Number(method.percentage) || 0).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="payment-footer-status">
        <div className="cloud-status-badge">
          <span className="sync-dot" />
          <span>{cloudStatus}</span>
        </div>
        <span>{lastUpdate}</span>
      </div>
    </article>
  );
}
