# Caravanserai Data Visualization

A modern, avant-garde data visualization website displaying interactive line charts with smooth interactions and data exploration capabilities.

## Features

- **Full-screen chart display** with no scrolling
- **Fixed top navigation bar** with minimalist design
- **Interactive hover widgets** with crosshair guide lines showing exact x and y values
- **Clickable chart titles** that transform into search/selection mode
- **Dataset variation toggle** to switch between different data views
- **Hidden axes** with grid lines for clean aesthetics
- **Legend display** with colored circles and series names

## Tech Stack

- React 18
- Vite
- Recharts
- Tailwind CSS
- Papaparse (CSV parsing)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
├── public/
│   └── historical-ethereum-blocks.csv  # Sample dataset
├── src/
│   ├── components/
│   │   ├── Chart.jsx                   # Main chart component
│   │   └── Navigation.jsx              # Navigation bar component
│   ├── utils/
│   │   └── dataLoader.js               # CSV loading and data transformation
│   ├── App.jsx                         # Main application component
│   ├── main.jsx                        # Entry point
│   └── index.css                       # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Data Format

CSV files should follow this structure:
- First row contains column headers
- Must include a `date` column
- Data columns should contain numeric values

Example:
```csv
date,target_blobs_per_block,max_blobs_per_block,avg_blobs_per_block
2025-12-12 00:00:00.000 UTC,10,15,5.05
```

## Adding New Charts

To add a new chart, update the `getAvailableCharts()` function in `src/utils/dataLoader.js`:

```javascript
{
  id: 'chart-id',
  name: 'Chart Display Name',
  file: 'data-file.csv',
  series: {
    historical: ['column1', 'column2', 'column3'],
    distribution: ['column4', 'column5']
  }
}
```

Place CSV files in the `public/` directory.

## Color Palette

- Background: `#003f5c` (dark navy)
- Series Colors (in order):
  - `#58508d` (purple)
  - `#bc5090` (pink)
  - `#ff6361` (coral)
  - `#ffa600` (orange)

## Future Enhancements

- API integration for dynamic data loading
- Additional chart types
- Export functionality
- More dataset variations
