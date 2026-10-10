import React from 'react';
import { Star } from 'lucide-react';

export default function TopSellingProducts({ products }) {
  return (
    <article className="report-card top-products-card animate-fade-in" aria-label="Peringkat Produk Terlaris">
      {/* Header */}
      <div className="report-card-header">
        <div className="report-card-title-group">
          <h2 className="report-card-title">Produk Terlaris</h2>
          <span className="report-card-subtitle">Peringkat performa penjualan menu</span>
        </div>
        <div className="report-card-star-icon" aria-hidden="true">
          <Star size={17} strokeWidth={1.8} />
        </div>
      </div>

      {/* Top 5 Products List */}
      <div className="top-products-list">
        {products.map((item) => {
          const isTopOne = item.rank === 1;

          return (
            <div key={item.id} className="top-product-item">
              <div className="product-item-main-row">
                {/* Left: Rank Badge + Product Name */}
                <div className="product-rank-name">
                  <span className={`rank-badge ${isTopOne ? 'rank-dark' : 'rank-light'}`}>
                    {item.rank}
                  </span>
                  <span className="product-name-text">{item.name}</span>
                </div>

                {/* Right: Quantity + Sales Nominal */}
                <div className="product-qty-sales">
                  <span className="product-sold-bold">{item.soldCount}</span>
                  <span className="product-nominal-muted"> ({item.formattedSales})</span>
                </div>
              </div>

              {/* Visual Performance Progress Bar */}
              <div className="product-progress-track">
                <div
                  className={`product-progress-fill ${isTopOne ? 'fill-top' : 'fill-regular'}`}
                  style={{ width: `${item.progressPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
