import React from 'react';
import { Banknote } from 'lucide-react';

export default function PaymentMethodReport({ paymentData }) {
  const methods = paymentData?.methods || [];

  // Donut SVG calculations
  const size = 110;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const slices = methods.map((method) => {
    const pct = Number(method.percentage) || 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += (pct / 100) * circumference;

    return {
      ...method,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <article className="report-card payment-method-card animate-fade-in" aria-label="Distribusi Metode Pembayaran">
      {/* Header */}
      <div className="report-card-header">
        <div className="report-card-title-group">
          <h2 className="report-card-title">Metode Pembayaran</h2>
          <span className="report-card-subtitle">Distribusi omzet berdasarkan tipe bayar</span>
        </div>
        <div className="report-card-icon" aria-hidden="true">
          <Banknote size={17} strokeWidth={1.8} />
        </div>
      </div>

      {/* Content: Donut + Legend */}
      <div className="payment-report-body">
        {/* Donut Chart with Centered Total 100% */}
        <div className="payment-donut-container">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="payment-donut-svg">
            {slices.map((slice) => (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            ))}
          </svg>

          <div className="payment-donut-center-label">
            <span className="total-text">TOTAL</span>
            <span className="percent-text">100%</span>
          </div>
        </div>

        {/* Legend List matching visual design */}
        <div className="payment-legend-list">
          {methods.map((method) => (
            <div key={method.id} className="payment-legend-item">
              <span className="legend-dot" style={{ backgroundColor: method.color }} />
              <div className="legend-text-row">
                <span className="legend-name">
                  {method.name} ({method.percentage}%)
                </span>
                <span className="legend-nominal">{method.formattedNominal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
