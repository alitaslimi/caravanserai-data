import React, { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const Chart = ({ data, series, title, onTitleClick, isSearchMode }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const handleMouseMove = useCallback((e) => {
    if (e && e.activePayload && e.activePayload[0]) {
      setHoveredPoint(e.activePayload[0].payload);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  // Custom tooltip that shows crosshair values
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-[#003f5c] border border-white/20 rounded px-3 py-2 shadow-lg">
        <p className="text-white/80 text-sm mb-1">{data.dateLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(2) ?? 'N/A'}
          </p>
        ))}
      </div>
    );
  };

  // Custom dot for hover indicator
  const CustomActiveDot = (props) => {
    return (
      <circle cx={props.cx} cy={props.cy} r={4} fill={props.fill} stroke="#fff" strokeWidth={2} />
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Chart Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        {!isSearchMode && (
          <button
            onClick={onTitleClick}
            className="text-white text-2xl font-semibold hover:text-white/80 transition-colors cursor-pointer"
          >
            {title}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 flex gap-6">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-white/90 text-sm">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 80, right: 20, left: 20, bottom: 20 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          
          {/* Hidden X Axis */}
          <XAxis
            dataKey="dateLabel"
            stroke="#ffffff00"
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          
          {/* Hidden Y Axis */}
          <YAxis
            stroke="#ffffff00"
            tick={false}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Crosshair Reference Lines */}
          {hoveredPoint && (
            <>
              <ReferenceLine
                x={hoveredPoint.dateLabel}
                stroke="#ffffff40"
                strokeDasharray="2 2"
                strokeWidth={1}
              />
              {series.map((s) => {
                const value = hoveredPoint[s.key];
                if (value != null) {
                  return (
                    <ReferenceLine
                      key={s.key}
                      y={value}
                      stroke="#ffffff40"
                      strokeDasharray="2 2"
                      strokeWidth={1}
                    />
                  );
                }
                return null;
              })}
            </>
          )}

          {/* Data Lines */}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={<CustomActiveDot />}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;

