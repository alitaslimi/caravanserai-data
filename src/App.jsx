import React, { useState, useEffect, useRef } from 'react';
import Navigation, { NAV_HEIGHT } from './components/Navigation.jsx';
import Chart from './components/Chart.jsx';
import { loadCSV, transformChartData, getAvailableCharts, getChartSeries } from './utils/dataLoader.js';

const BG = '#003B4C';
const BOTTOM_PADDING = 16; // px — lifts chart slightly off the bottom edge

export default function App() {
  const [charts] = useState(() => getAvailableCharts());
  const [currentChart, setCurrentChart] = useState(null);
  const [currentVariation, setCurrentVariation] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Search / title-click state
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  // Seed initial chart + variation on mount
  useEffect(() => {
    if (charts.length > 0) {
      const first = charts[0];
      const firstVariation = Object.keys(first.series)[0];
      setCurrentChart(first);
      setCurrentVariation(firstVariation);
    }
  }, [charts]);

  // Load CSV whenever chart or variation changes
  useEffect(() => {
    if (!currentChart || !currentVariation) return;
    let cancelled = false;

    (async () => {
      try {
        const columns = getChartSeries(currentChart, currentVariation);
        const raw = await loadCSV(`/${currentChart.file}`);
        if (!cancelled) {
          setChartData(transformChartData(raw, columns));
        }
      } catch (err) {
        console.error('Failed to load chart data:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [currentChart, currentVariation]);

  // Focus search input when entering search mode
  useEffect(() => {
    if (searchMode) searchRef.current?.focus();
  }, [searchMode]);

  // Close search on outside click
  useEffect(() => {
    if (!searchMode) return;
    const handler = (e) => {
      if (!e.target.closest('[data-search]')) {
        setSearchMode(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchMode]);

  const filteredCharts = query.trim()
    ? charts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : charts;

  const variations = currentChart
    ? Object.keys(currentChart.series)
    : [];

  const handleChartSelect = (chart) => {
    const firstVariation = Object.keys(chart.series)[0];
    setCurrentChart(chart);
    setCurrentVariation(firstVariation);
    setSearchMode(false);
    setQuery('');
  };

  const handleVariationChange = (v) => {
    setCurrentVariation(v);
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (!chartData) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Raleway, sans-serif',
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: BG, overflow: 'hidden' }}>

      <Navigation
        variations={variations}
        currentVariation={currentVariation}
        onVariationChange={handleVariationChange}
      />

      {/* Chart area — fills remaining space below nav, with small bottom inset */}
      <div
        style={{
          position: 'absolute',
          top: NAV_HEIGHT,
          left: 0,
          right: 0,
          bottom: BOTTOM_PADDING,
        }}
      >
        {/* Search overlay — replaces chart title when active */}
        {searchMode && (
          <div
            data-search
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              width: 360,
            }}
          >
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredCharts.length > 0) handleChartSelect(filteredCharts[0]);
                if (e.key === 'Escape') { setSearchMode(false); setQuery(''); }
              }}
              placeholder="Search charts…"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8,
                padding: '7px 14px',
                color: '#fff',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            {filteredCharts.length > 0 && (
              <div
                style={{
                  marginTop: 4,
                  backgroundColor: 'rgba(0,59,76,0.97)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {filteredCharts.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleChartSelect(c)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 14px',
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {filteredCharts.length === 0 && (
              <div
                style={{
                  marginTop: 4,
                  backgroundColor: 'rgba(0,59,76,0.97)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                No charts found
              </div>
            )}
          </div>
        )}

        <Chart
          data={chartData.data}
          series={chartData.series}
          title={currentChart?.name ?? ''}
          onTitleClick={() => { setSearchMode(true); setQuery(''); }}
          isSearchMode={searchMode}
        />
      </div>
    </div>
  );
}
