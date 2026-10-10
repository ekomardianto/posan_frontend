import React from 'react';
import {
  Banknote,
  Receipt,
  Coffee,
  TrendingUp,
  Store,
  Users,
  UserRound,
  CreditCard,
  Shield,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const iconMap = {
  Banknote: Banknote,
  Receipt: Receipt,
  Coffee: Coffee,
  TrendingUp: TrendingUp,
  Store: Store,
  Users: Users,
  UserRound: UserRound,
  CreditCard: CreditCard,
  Shield: Shield,
  'cash-register': Banknote,
  receipt: Receipt,
  coffee: Coffee,
  'trending-up': TrendingUp,
};

function SingleCard({ card, index }) {
  if (!card) return null;

  const IconComponent = iconMap[card.icon] || Activity;
  const label = card.label || card.title || 'Statistik';
  const displayValue = card.formattedValue || (card.value !== undefined ? String(card.value) : '0');
  const unit = card.unit || '';
  const trend = card.trend || '';
  const isPositive = card.isPositive !== false;
  const comparisonText = card.comparisonText || card.change || card.subValue || '';
  const highlightTag = card.categoryHighlight || '';
  const highlightText = card.highlightText || '';

  return (
    <article className="stat-card animate-fade-in" aria-label={label}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrapper" aria-hidden="true">
          <IconComponent size={16} strokeWidth={2.2} />
        </div>
      </div>

      <div className="stat-value-box">
        <span className="stat-main-value">{displayValue}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>

      <div className="stat-card-bottom">
        {trend && (
          <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? (
              <ArrowUpRight size={12} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={12} strokeWidth={2.5} />
            )}
            <span>{trend}</span>
          </span>
        )}

        {highlightTag && (
          <span className="highlight-tag">
            <span>{highlightTag}</span>
          </span>
        )}

        {(comparisonText || highlightText) && (
          <span className="stat-comparison-text">
            {comparisonText || highlightText}
          </span>
        )}
      </div>
    </article>
  );
}

export default function StatCards({ stats, stat }) {
  // 1. Single card mode
  if (stat) {
    return <SingleCard card={stat} index={0} />;
  }

  // 2. Multi card mode (object or array)
  if (!stats) return null;

  let cardsList = [];
  if (Array.isArray(stats)) {
    cardsList = stats;
  } else if (typeof stats === 'object') {
    const keys = ['todaySales', 'totalTransactions', 'productsSold', 'averageOrder'];
    cardsList = keys.map((k) => stats[k]).filter(Boolean);
    if (cardsList.length === 0) {
      cardsList = Object.values(stats);
    }
  }

  return (
    <section className="stats-grid" aria-label="Ringkasan Statistik Penjualan">
      {cardsList.map((card, idx) => (
        <SingleCard key={card.id || card.label || card.title || idx} card={card} index={idx} />
      ))}
    </section>
  );
}
