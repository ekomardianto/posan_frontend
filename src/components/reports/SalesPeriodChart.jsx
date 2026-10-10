import React, { useState } from 'react';

export default function SalesPeriodChart({ chartData }) {
  const [activeGranularity, setActiveGranularity] = useState('Harian');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Select data based on granularity
  const currentData =
    activeGranularity === 'Harian'
      ? chartData.dailyData
      : activeGranularity === 'Mingguan'
      ? chartData.weeklyData
      : chartData.monthlyData;

  // SVG Chart Layout Calculations
  const svgWidth = 620;
  const svgHeight = 230;
  const padding = { top: 40, right: 35, bottom: 40, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Calculate dynamic max value based on actual data
  const rawMax = Math.max(...(currentData || []).map((d) => Number(d.sales) || 0), 100000);
  const maxVal = Math.ceil(rawMax * 1.2);

  const formatTick = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}K`;
    return String(val);
  };

  const yTicks = [
    { val: maxVal, label: formatTick(maxVal) },
    { val: Math.round(maxVal * 0.75), label: formatTick(Math.round(maxVal * 0.75)) },
    { val: Math.round(maxVal * 0.5), label: formatTick(Math.round(maxVal * 0.5)) },
    { val: Math.round(maxVal * 0.25), label: formatTick(Math.round(maxVal * 0.25)) }
  ];

  // Map data to SVG coordinates
  const points = currentData.map((d, i) => {
    const x = padding.left + (i / Math.max(currentData.length - 1, 1)) * plotWidth;
    const y = padding.top + plotHeight - (d.sales / maxVal) * plotHeight;
    return { ...d, x, y };
  });

  // Construct Line and Area SVG paths
  const linePathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPathD =
    points.length > 0
      ? `${linePathD} L ${points[points.length - 1].x},${padding.top + plotHeight} L ${points[0].x},${padding.top + plotHeight} Z`
      : '';

  // Find peak point for default prominent badge
  const peakPoint = points.find((p) => p.isPeak) || points[points.length - 2] || points[0];

  return (
    <article className="report-card sales-period-card animate-fade-in" aria-label="Grafik Penjualan Berdasarkan Periode">
      {/* Header bar with Granularity Segmented Switch */}
      <div className="report-card-header">
        <div className="report-card-title-group">
          <h2 className="report-card-title">Penjualan Berdasarkan Periode</h2>
          <span className="report-card-subtitle">Total penjualan pada periode yang dipilih</span>
        </div>

        <div className="granularity-segmented-control" role="group" aria-label="Granularitas Grafik">
          {['Harian', 'Mingguan', 'Bulanan'].map((g) => (
            <button
              key={g}
              type="button"
              className={`segment-btn ${activeGranularity === g ? 'active' : ''}`}
              onClick={() => {
                setActiveGranularity(g);
                setHoveredPoint(null);
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line / Area Chart */}
      <div className="report-chart-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="report-chart-svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Warm Coffee subtle area gradient */}
            <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C5E3C" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#8C5E3C" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#8C5E3C" stopOpacity="0.0" />
            </linearGradient>

            <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const yPos = padding.top + plotHeight - (tick.val / maxVal) * plotHeight;
            return (
              <g key={tick.label} className="chart-grid-group">
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="#EFEBE4"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 12}
                  y={yPos + 4}
                  textAnchor="end"
                  className="chart-tick-label"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPathD && (
            <path d={areaPathD} fill="url(#salesAreaGradient)" />
          )}

          {/* Main Line */}
          {linePathD && (
            <path
              d={linePathD}
              fill="none"
              stroke="#221C18"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points & X-Axis Labels */}
          {points.map((pt) => {
            const isHovered = hoveredPoint && hoveredPoint.date === pt.date;
            return (
              <g key={pt.date} className="chart-point-group">
                {/* X Axis Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`chart-x-label ${pt.isPeak ? 'peak-x-label' : ''}`}
                >
                  {pt.date}
                </text>

                {/* Point Outer Ring on Peak */}
                {pt.isPeak && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={7}
                    fill="#F5ECE2"
                    stroke="#221C18"
                    strokeWidth="1.5"
                  />
                )}

                {/* Interactive Node */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : pt.isPeak ? 4.5 : 4}
                  fill="#FFFFFF"
                  stroke="#221C18"
                  strokeWidth={pt.isPeak ? 2.5 : 2}
                  className="chart-interactive-dot"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Prominent Peak Tooltip Marker matching reference design */}
          {peakPoint && !hoveredPoint && (
            <g transform={`translate(${peakPoint.x}, ${peakPoint.y - 12})`} filter="url(#tooltipShadow)">
              {/* Tooltip Background Card */}
              <rect
                x="-55"
                y="-38"
                width="110"
                height="34"
                rx="6"
                fill="#1E1713"
              />
              {/* Tooltip downward caret/pointer */}
              <polygon
                points="-5,-4 5,-4 0,1"
                fill="#1E1713"
              />
              {/* Tooltip Header */}
              <text
                x="0"
                y="-24"
                textAnchor="middle"
                fill="#CFC5B8"
                fontSize="8"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                {peakPoint.peakLabel || `${peakPoint.date} (PUNCAK)`}
              </text>
              {/* Tooltip Sales Value */}
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="800"
              >
                {peakPoint.formattedSales}
              </text>
            </g>
          )}

          {/* Interactive Hover Tooltip if hovering another point */}
          {hoveredPoint && (
            <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 12})`} filter="url(#tooltipShadow)">
              <rect
                x="-55"
                y="-38"
                width="110"
                height="34"
                rx="6"
                fill="#1E1713"
              />
              <polygon
                points="-5,-4 5,-4 0,1"
                fill="#1E1713"
              />
              <text
                x="0"
                y="-24"
                textAnchor="middle"
                fill="#CFC5B8"
                fontSize="8"
                fontWeight="700"
              >
                {hoveredPoint.fullDate || hoveredPoint.date}
              </text>
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="800"
              >
                {hoveredPoint.formattedSales}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Card Footer: 3-column stats banner matching visual design */}
      <div className="report-chart-footer-strip">
        <div className="footer-stat-col">
          <span className="footer-stat-label">{chartData.summaryFooter.average.label}</span>
          <span className="footer-stat-val">{chartData.summaryFooter.average.formattedValue}</span>
        </div>

        <div className="footer-stat-divider" />

        <div className="footer-stat-col">
          <span className="footer-stat-label">{chartData.summaryFooter.lowest.label}</span>
          <span className="footer-stat-val">{chartData.summaryFooter.lowest.formattedValue}</span>
        </div>

        <div className="footer-stat-divider" />

        <div className="footer-stat-col">
          <span className="footer-stat-label">{chartData.summaryFooter.highest.label}</span>
          <span className="footer-stat-val highlight-green">{chartData.summaryFooter.highest.formattedValue}</span>
        </div>
      </div>
    </article>
  );
}
