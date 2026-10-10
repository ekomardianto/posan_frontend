import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
export default function DailySalesChart({
  chartData = [],
  chartMeta = {}
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // SVG Chart Dimensions
  const svgWidth = 680;
  const svgHeight = 210;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const dataList = Array.isArray(chartData) && chartData.length > 0 ? chartData : [];
  const rawMax = dataList.length > 0 ? Math.max(...dataList.map((d) => d.sales || 0), 10000) : 10000;
  const maxVal = Math.ceil(rawMax * 1.15);

  const formatTick = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return String(val);
  };

  const yTicks = [
    { val: maxVal, label: formatTick(maxVal) },
    { val: Math.round(maxVal * 0.66), label: formatTick(Math.round(maxVal * 0.66)) },
    { val: Math.round(maxVal * 0.33), label: formatTick(Math.round(maxVal * 0.33)) },
    { val: 0, label: '0' }
  ];

  // Map data to SVG coordinates
  const points = chartData.map((d, i) => {
    const x = padding.left + (i / Math.max(chartData.length - 1, 1)) * plotWidth;
    const y = padding.top + plotHeight - (d.sales / maxVal) * plotHeight;
    return { ...d, x, y };
  });

  // Construct Line and Area Path
  const linePathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x},${padding.top + plotHeight} L ${points[0].x},${padding.top + plotHeight} Z`
    : '';

  // Dynamic peak period shading based on isPeak item
  const peakIdx = points.findIndex((p) => p.isPeak);
  let peakShadeD = '';
  if (peakIdx !== -1 && points.length > 1) {
    const startIdx = Math.max(0, peakIdx - 1);
    const endIdx = Math.min(points.length - 1, peakIdx + 1);
    const pStart = points[startIdx];
    const pPeak = points[peakIdx];
    const pEnd = points[endIdx];
    peakShadeD = `M ${pStart.x},${pStart.y} L ${pPeak.x},${pPeak.y} L ${pEnd.x},${pEnd.y} L ${pEnd.x},${padding.top + plotHeight} L ${pStart.x},${padding.top + plotHeight} Z`;
  }

  const activeMeta = chartMeta || hourlyChartMeta;

  return (
    <article className="dashboard-card animate-fade-in" aria-label="Grafik Tren Penjualan Harian">
      {/* Header */}
      <div className="card-header-bar">
        <div className="card-title-group">
          <div className="card-title-row">
            <h2 className="card-title">{activeMeta.title}</h2>
            <span className="tag-badge">{activeMeta.tag}</span>
          </div>
          <span className="card-subtitle">{activeMeta.subtitle}</span>
        </div>

        {/* Legend */}
        <div className="chart-legend-group">
          {activeMeta.legend ? (
            activeMeta.legend.map((leg) => (
              <div className="legend-item" key={leg.label}>
                <span
                  className={leg.type === 'circle' ? 'legend-symbol-circle' : 'legend-symbol-square'}
                  style={{ backgroundColor: leg.color }}
                />
                <span>{leg.label}</span>
              </div>
            ))
          ) : (
            <>
              <div className="legend-item">
                <span className="legend-symbol-square" />
                <span>Omzet (Rp)</span>
              </div>
              <div className="legend-item">
                <span className="legend-symbol-circle" />
                <span>Puncak Transaksi</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="chart-container-box">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="chart-svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft Warm Gradient matching reference design */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C5E3C" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#8C5E3C" stopOpacity="0.01" />
            </linearGradient>

            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7D5537" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#7D5537" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const yPos = padding.top + plotHeight - (tick.val / maxVal) * plotHeight;
            return (
              <g key={tick.label}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  className="chart-grid-line"
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Peak Region Background Polygonal Fill */}
          {peakShadeD && <path d={peakShadeD} fill="url(#peakGradient)" />}

          {/* Main Area Fill */}
          {areaPathD && <path d={areaPathD} className="chart-area-path" />}

          {/* Main Line Stroke */}
          {linePathD && <path d={linePathD} className="chart-line-path" />}

          {/* Data Points & X-Axis Labels */}
          {points.map((pt) => (
            <g key={pt.time}>
              {/* X Axis Label */}
              <text
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className={`chart-axis-label ${pt.isPeak ? 'peak-label' : ''}`}
              >
                {pt.time}
              </text>

              {/* Peak Accent Highlight Line */}
              {pt.isPeak && (
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={padding.top + plotHeight}
                  stroke="#221C18"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
              )}

              {/* Interactive Node */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={pt.isPeak ? 5 : 4}
                className={`chart-node ${pt.isPeak ? 'peak-node' : ''}`}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100}%`
            }}
          >
            <strong>{hoveredPoint.time}</strong>
            <div>Omzet: Rp {hoveredPoint.sales.toLocaleString('id-ID')}</div>
            <div>{hoveredPoint.transactions} Transaksi {hoveredPoint.isPeak ? `(${hoveredPoint.peakLabel || 'Puncak'})` : ''}</div>
          </div>
        )}
      </div>

      {/* Footer Inside Chart Card */}
      <div className="chart-footer-banner">
        <div className="banner-left">
          <Sparkles size={14} className="banner-icon" />
          <span>{activeMeta.footerNote}</span>
        </div>
        <div className="banner-right-badge">
          {activeMeta.serviceHours}
        </div>
      </div>
    </article>
  );
}
