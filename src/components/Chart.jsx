import React, { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const { dateLabel } = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#003B4C',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6,
        padding: '8px 12px',
        fontFamily: 'inherit',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>
        {dateLabel}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color, fontSize: 12, margin: '2px 0' }}>
          {entry.name}: {entry.value != null ? entry.value.toFixed(2) : 'N/A'}
        </p>
      ))}
    </div>
  );
};

// ─── Custom active dot ─────────────────────────────────────────────────────────
const ActiveDot = ({ cx, cy, fill }) => (
  <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#fff" strokeWidth={2} />
);

// ─── Custom legend ─────────────────────────────────────────────────────────────
const CustomLegend = ({ payload }) => {
  if (!payload || !payload.length) return null;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        paddingTop: 16,
        fontFamily: 'inherit',
      }}
    >
      {payload.map((entry) => (
        <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Module-level flag — survives re-renders and re-mounts, only resets on full page reload
let hasAnimatedOnce = false;

// ─── Chart ─────────────────────────────────────────────────────────────────────
const Chart = ({ data, series, title, onTitleClick, isSearchMode }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  // Start active only if we haven't animated yet; once the first animation
  // completes naturally, hasAnimatedOnce flips and no re-render ever re-enables it
  const [animationActive, setAnimationActive] = useState(!hasAnimatedOnce);

  const handleAnimationEnd = useCallback(() => {
    if (!hasAnimatedOnce) {
      hasAnimatedOnce = true;
      setAnimationActive(false);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (e?.activePayload?.[0]) {
      setHoveredDate(e.activePayload[0].payload.dateLabel);
    }
  }, []);

  const handleMouseLeave = useCallback(() => setHoveredDate(null), []);

  // Y-axis domain: pull min down slightly so the lowest values aren't glued
  // to the grid baseline, and add a small headroom above max.
  const yDomain = [
    (min) => {
      const span = Math.max(Math.abs(min), 1);
      return min - span * 0.12;
    },
    (max) => {
      const span = Math.max(Math.abs(max), 1);
      return max + span * 0.05;
    },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Chart title (clickable → search mode) ── */}
      {!isSearchMode && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            onClick={onTitleClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'inherit',
              opacity: 0.9,
              padding: 0,
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 1)}
            onMouseLeave={(e) => (e.target.style.opacity = 0.9)}
          >
            {title}
          </button>
        </div>
      )}

      {/* ── Recharts ── */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 52, right: 10, left: 10, bottom: 8 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Horizontal grid lines only — avoids visual "border" from vertical lines */}
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="rgba(255,255,255,0.1)"
          />

          {/* X axis — invisible, just provides the data key */}
          <XAxis
            dataKey="dateLabel"
            hide={true}
          />

          {/* Y axis — invisible, domain adds breathing room at bottom */}
          <YAxis
            hide={true}
            domain={yDomain}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="bottom"
            content={<CustomLegend />}
          />

          {/* Vertical crosshair on hover */}
          {hoveredDate && (
            <ReferenceLine
              x={hoveredDate}
              stroke="rgba(255,255,255,0.25)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}

          {/* Series lines */}
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={<ActiveDot />}
              connectNulls
              isAnimationActive={animationActive}
              onAnimationEnd={i === 0 ? handleAnimationEnd : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
