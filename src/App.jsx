import React, { useState, useEffect, useRef } from 'react';
import Chart from './components/Chart';
import Navigation from './components/Navigation';
import { loadCSV, transformChartData, getAvailableCharts, getChartSeries } from './utils/dataLoader';

function App() {
  const [chartData, setChartData] = useState(null);
  const [currentChart, setCurrentChart] = useState(null);
  const [currentVariation, setCurrentVariation] = useState('historical');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCharts, setAvailableCharts] = useState([]);
  const [filteredCharts, setFilteredCharts] = useState([]);
  const searchInputRef = useRef(null);

  // Initialize available charts
  useEffect(() => {
    const charts = getAvailableCharts();
    setAvailableCharts(charts);
    setFilteredCharts(charts);
    if (charts.length > 0) {
      setCurrentChart(charts[0]);
    }
  }, []);

  // Load chart data when chart or variation changes
  useEffect(() => {
    if (!currentChart) return;

    const loadData = async () => {
      try {
        // Construct file path based on variation
        const fileName = currentChart.file;
        const filePath = `/${fileName}`;
        
        // Get series for current variation
        const seriesColumns = getChartSeries(currentChart, currentVariation);
        
        const csvData = await loadCSV(filePath);
        const { data, series } = transformChartData(csvData, seriesColumns);
        
        setChartData({ data, series });
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    };

    loadData();
  }, [currentChart, currentVariation]);

  // Handle search input
  useEffect(() => {
    if (isSearchMode && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchMode]);

  const handleTitleClick = () => {
    setIsSearchMode(true);
    setSearchQuery('');
    setFilteredCharts(availableCharts);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === '') {
      setFilteredCharts(availableCharts);
    } else {
      const filtered = availableCharts.filter(chart =>
        chart.name.toLowerCase().includes(query)
      );
      setFilteredCharts(filtered);
    }
  };

  const handleChartSelect = (chart) => {
    setCurrentChart(chart);
    setIsSearchMode(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredCharts.length > 0) {
      handleChartSelect(filteredCharts[0]);
    } else if (e.key === 'Escape') {
      setIsSearchMode(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSearchMode && !e.target.closest('.search-container')) {
        setIsSearchMode(false);
        setSearchQuery('');
      }
    };

    if (isSearchMode) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isSearchMode]);

  // Get variations from current chart, or use defaults
  const variations = currentChart?.series && typeof currentChart.series === 'object' 
    ? Object.keys(currentChart.series)
    : ['historical'];

  if (!currentChart || !chartData) {
    return (
      <div className="w-screen h-screen bg-[#003B4C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#003B4C] overflow-hidden">
      <Navigation
        variations={variations}
        currentVariation={currentVariation}
        onVariationChange={setCurrentVariation}
      />
      
      <div className="pt-16 h-full w-full relative" style={{ padding: 0, margin: 0, left: 0, right: 0 }}>
        <div className="relative w-full h-full" style={{ padding: 0, margin: 0, width: '100%', left: 0, right: 0 }}>
          {isSearchMode ? (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 search-container">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white text-lg w-96 focus:outline-none focus:border-white/50"
                placeholder="Search charts..."
              />
              {filteredCharts.length > 0 && (
                <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
                  {filteredCharts.slice(0, 5).map((chart) => (
                    <button
                      key={chart.id}
                      onClick={() => handleChartSelect(chart)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors"
                    >
                      {chart.name}
                    </button>
                  ))}
                </div>
              )}
              {filteredCharts.length === 0 && searchQuery && (
                <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 text-white/70">
                  No charts found
                </div>
              )}
            </div>
          ) : null}
          
          <Chart
            data={chartData.data}
            series={chartData.series}
            title={currentChart.name}
            onTitleClick={handleTitleClick}
            isSearchMode={isSearchMode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

