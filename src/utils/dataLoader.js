import Papa from 'papaparse';

const SERIES_COLORS = ['#58508d', '#bc5090', '#ff6361', '#ffa600'];

/**
 * Load and parse CSV file
 */
export async function loadCSV(filePath) {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}

/**
 * Transform CSV data for chart display
 */
export function transformChartData(csvData, seriesColumns, dateColumn = 'date') {
  if (!csvData || csvData.length === 0) return { data: [], series: [] };

  const data = csvData
    .filter(row => row[dateColumn]) // Filter out rows without dates
    .map(row => {
      const entry = {
        date: new Date(row[dateColumn]).getTime(), // Convert to timestamp for easier handling
        dateLabel: row[dateColumn].split(' ')[0], // Just the date part for display
      };

      seriesColumns.forEach((col, index) => {
        const value = parseFloat(row[col]);
        entry[col] = isNaN(value) ? null : value;
      });

      return entry;
    })
    .sort((a, b) => a.date - b.date); // Sort by date

  const series = seriesColumns.map((col, index) => ({
    key: col,
    name: formatSeriesName(col),
    color: SERIES_COLORS[index % SERIES_COLORS.length],
  }));

  return { data, series };
}

/**
 * Format series name for display
 */
function formatSeriesName(name) {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get available charts configuration
 */
export function getAvailableCharts() {
  return [
    {
      id: 'ethereum-blobs',
      name: 'Ethereum Blobs per Block',
      file: 'historical-ethereum-blocks.csv',
      series: {
        historical: ['target_blobs_per_block', 'max_blobs_per_block', 'avg_blobs_per_block'],
        distribution: ['avg_blob_gas_used', 'total_blob_gas_used', 'avg_blob_gas_price']
      }
    }
  ];
}

/**
 * Get series for a chart based on variation
 */
export function getChartSeries(chart, variation) {
  if (chart.series && typeof chart.series === 'object') {
    return chart.series[variation] || chart.series.historical || [];
  }
  return chart.series || [];
}

