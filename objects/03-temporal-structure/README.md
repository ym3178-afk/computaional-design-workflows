# Temporal Structure — A City Learns to Use Less

## Theme
An interactive D3.js study of New York City water consumption from 1979 to 2024.

## Attempt
The exercise compares population, total daily water consumption, and per-capita demand to show how long-term temporal structure can reveal divergence between urban growth and resource use.

## Dataset
- **Title:** Water Consumption in the City of New York
- **Publisher:** NYC Open Data / New York City Department of Environmental Protection
- **Dataset ID:** `ia2d-e54m`
- **Source:** https://data.cityofnewyork.us/d/ia2d-e54m
- **Included snapshot:** 46 annual records, 1979–2024

## Files
- `index.html` — contextual statement and visualization containers
- `style.css` — restrained ivory, sage, stone, charcoal, and muted-clay interface
- `d3.min.js` — local D3 v7 library copy for reliable loading
- `chart.js` — D3 CSV loading, parsing, scales, axes, data binding, tooltips, transitions, and responsive redraw
- `data/nyc-water-consumption.csv` — local data snapshot

## Interactions
1. Switch among per-capita demand, total consumption, and population.
2. Hover the line chart to inspect a year.
3. Read coordinated year-over-year bars for the selected metric.
4. Compare normalized trajectories with a 1979 baseline of 100.

## Tutorial concepts used
- `d3.csv()` external data loading
- numeric and date parsing
- SVG data binding
- `scaleTime()` and `scaleLinear()`
- axes and grid lines
- line, area, and bar marks
- hover tooltips
- transitions
- responsive redraw

## Run locally
Because the page loads a CSV, use a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/objects/03-temporal-structure/`.

## Limitation
The annual citywide dataset does not show seasonal demand, borough differences, household inequality, building type, leakage, or pricing. Population values are census-based estimates supplied with the dataset.

## Compatibility repair

- The visualization code now matches the bundled local D3 v3.5.6 library.
- The page first attempts to load `data/nyc-water-consumption.csv`.
- When a browser blocks local CSV requests, it automatically uses an embedded copy of the same 46 records.
- The object can therefore be opened from the final website, GitHub Pages, Live Server, or directly from the extracted folder.
