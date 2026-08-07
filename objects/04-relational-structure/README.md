# The Invisible Boss — Relational Structures

A D3.js force-directed network visualizing algorithmic management as a socio-technical ecosystem.

## Files
- `index.html` — webpage structure
- `style.css` — visual design
- `graph.js` — D3 visualization and interaction
- `nodes.csv` — 24 network entities
- `edges.csv` — 48 relationships
- `d3.min.js` — local D3 library

## Interaction
- Filter six relationship types
- Scroll to zoom and drag the background to pan
- Drag nodes to reorganize the network
- Click a node to keep its direct relationships highlighted
- Toggle labels and release fixed nodes

## Run locally
Because the project loads CSV files, start a local server in this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
