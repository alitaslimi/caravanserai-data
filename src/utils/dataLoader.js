import Papa from 'papaparse';

const SERIES_COLORS = ['#58508d', '#bc5090', '#ff6361', '#ffa600'];

/**
 * Load and parse a CSV file from the public directory.
 * Phase 2: replace this with an API fetch.
 */
export async function loadCSV(filePath) {
  const response = await fetch(filePath);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

/**
 * Transform raw CSV rows into Recharts-compatible data + series config.
 */
export function transformChartData(csvData, seriesColumns, dateColumn = 'date') {
  if (!csvData || csvData.length === 0) return { data: [], series: [] };

  const data = csvData
    .filter((row) => row[dateColumn])
    .map((row) => {
      const entry = {
        // Store timestamp for sorting, human-readable label for display
        _ts: new Date(row[dateColumn]).getTime(),
        dateLabel: row[dateColumn].split(' ')[0],
      };
      seriesColumns.forEach((col) => {
        const v = parseFloat(row[col]);
        entry[col] = isNaN(v) ? null : v;
      });
      return entry;
    })
    .sort((a, b) => a._ts - b._ts);

  const series = seriesColumns.map((col, i) => ({
    key: col,
    name: formatSeriesName(col),
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }));

  return { data, series };
}

function formatSeriesName(name) {
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Registry of available charts.
 * Each chart's `series` object keys become the variation toggle options.
 * File naming convention: `[chart-name].[variation].csv` (ready for Phase 2 automation).
 */
export function getAvailableCharts() {
  return [
    {
      id: 'ethereum-blobs',
      name: 'Ethereum Blobs per Block',
      file: 'historical-ethereum-blocks.csv',
      series: {
        historical: [
          'target_blobs_per_block',
          'max_blobs_per_block',
          'avg_blobs_per_block',
        ],
        distribution: [
          'avg_blob_gas_used',
          'total_blob_gas_used',
          'avg_blob_gas_price',
        ],
      },
    },
  ];
}

/**
 * Return the series columns for a given chart + variation.
 */
export function getChartSeries(chart, variation) {
  if (chart.series && typeof chart.series === 'object') {
    return chart.series[variation] || chart.series[Object.keys(chart.series)[0]];
  }
  return Array.isArray(chart.series) ? chart.series : [];
}
