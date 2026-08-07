# Structures of the Unseen — Final Website

**Author:** Yizhang Mu (he/him)  
**Course:** Columbia GSAPP Computational Design Workflows  
**Year:** 2026

This repository combines seven course assignments into one final website titled **Structures of the Unseen**.

## Unified visual system
The final site uses one restrained palette—warm ivory, sage, stone, charcoal, and muted clay—across all seven objects. See `context/STYLE.md` for priority order and interface rules.


## Revised temporal structure
Object 03 was rebuilt around NYC Open Data. It visualizes 1979–2024 Department of Environmental Protection water-consumption records using an external CSV, D3 time and linear scales, tooltips, transitions, year-over-year change bars, and a normalized comparison view.

## Run locally
Some objects load CSV or GeoJSON files and require HTTP:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Publish with GitHub Pages
Upload this folder’s contents to the repository root, then use **Settings → Pages → Deploy from a branch → main → / (root)**.

## Security
The original browser-side OpenAI demo was not included. The final agent is a safe local context-retrieval object. Revoke any OpenAI key previously committed or shared.


## Orbital chapter directory
The final landing page includes a custom HTML Canvas navigation sphere. Its seven nodes correspond to the seven assignment chapters. The sphere supports pointer and touch dragging, chapter focus, direct section navigation, responsive resizing, and reduced-motion behavior without an additional JavaScript library.

## Final typography and object covers
The interface uses only **Instrument Serif** for H1–H3 and **Inter** for body text, captions, controls, navigation, and data labels. The shared type scale is documented in `context/STYLE.md`.

The homepage uses seven bespoke inline SVG covers. Each cover summarizes the actual visual logic of its object—archive, orbit, time series, network, map, live poll, and context retrieval—within one restrained palette and consistent framing system.


## Revised landing layout
The opening title is **Structures of the Unseen**. The chapter directory uses seven individually spaced controls rather than one continuous strip, and the object index uses separated editorial cards for clearer scanning.


## Latest refinement

- Added a top quick-directory with all seven works.
- Redesigned the seven chapter covers to preserve clear text hierarchy.
- Adjusted figure captions and internal cover layout so no cover text is blocked by labels.
- Added more layered motion and a calmer sense of flow on page load.
# computaional-design-workflows
# computaional-design-workflows
