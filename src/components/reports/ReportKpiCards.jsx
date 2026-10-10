import React from 'react';
import { Receipt, Wallet, Coffee, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const iconMap = {
  receipt: Receipt,
  wallet: Wallet,
  coffee: Coffee,
  chart: BarChart3
};

export default function ReportKpiCards({ kpiData }) {
  const cards = [
    {
      key: 'totalTransactions',
      ...kpiData.totalTransactions
    },
    {
      key: 'totalSales',
      ...kpiData.totalSales
    },
    {
      key: 'productsSold',
      ...kpiData.productsSold
    },
    {
      key: 'averageTransaction',
      ...kpiData.averageTransaction
    }
  ];

  return (
    <section className="report-kpi-grid" aria-label="Ringkasan Metrik Utama">
      {cards.map((card) => {
        const IconComponent = iconMap[card.iconType] || Receipt;
        return (
          <article key={card.key} className="report-kpi-card animate-fade-in">
            {/* Top row: Label & Icon */}
            <div className="kpi-card-header">
              <span className="kpi-card-label">{card.label}</span>
              <div className="kpi-icon-wrapper" aria-hidden="true">
                <IconComponent size={18} strokeWidth={1.8} />
              </div>
            </div>

            {/* Middle row: Big Main Value */}
            <div className="kpi-value-row">
              <span className="kpi-main-val">{card.formattedValue}</span>
              {card.unit && <span className="kpi-unit-suffix"> {card.unit}</span>}
            </div>

            {/* Bottom row: Trend badge & Comparison text */}
            <div className="kpi-trend-row">
              <span className={`kpi-trend-pill ${card.isPositive ? 'positive' : 'negative'}`}>
                {card.isPositive ? (
                  <TrendingUp size={12} strokeWidth={2.2} />
                ) : (
                  <TrendingDown size={12} strokeWidth={2.2} />
                )}
                <span>{card.changeText}</span>
              </span>
              <span className="kpi-comparison-text">{card.comparisonText}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
