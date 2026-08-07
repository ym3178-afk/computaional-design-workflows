# Style System

## Overall Direction

The final website uses one quiet, low-saturation visual system across all seven objects. The interface should feel editorial, structured, and calm rather than decorative or technology-driven.

## Priority Order

1. **Legibility** — hierarchy and reading comfort come first.
2. **Cross-object coherence** — the seven exercises share one type and color system.
3. **Object-first presentation** — real project previews replace generic decorative thumbnails.
4. **Restrained motion** — animation supports navigation and orientation without visual noise.

## Typography

Only two typefaces are used site-wide:

- **Instrument Serif** for H1, H2, and H3.
- **Inter** for body text, captions, metadata, controls, code labels, and navigation, with the stack `Inter, -apple-system, "Segoe UI", sans-serif`.

Responsive type scale:

- H1: `clamp(52px, 6vw, 72px)`
- H2: `clamp(34px, 4vw, 44px)`
- H3: `clamp(22px, 2.3vw, 28px)`
- Body: `16px`
- Caption: `13px`

Heading rules:

- Weight: `700`
- Line height: `1.08`
- Letter spacing: `-0.02em`

Body rules:

- Weight: `400`
- Line height: `1.6`
- Color: `#333`
- Maximum line length: `65ch`

Caption rules:

- Weight: `400`
- Color: `#888`

No third font, monospace family, or decorative display face is used in the website interface.

## Color

- Warm ivory: `#F3F0E8`
- Soft surface: `#FAF8F3`
- Mist: `#EBE6DC`
- Sage: `#819389`
- Deep sage: `#52635B`
- Charcoal: `#2F3632`
- Muted clay: `#9F796C`

## Project Covers

Each object uses a real screenshot of its own interface as the homepage cover. A shared crop, soft desaturation, thin inset frame, and restrained caption treatment create consistency without hiding the individuality of each exercise.


## Chapter Spacing
The opening chapter directory is not a continuous segmented bar. Each chapter has its own low-contrast bordered tile with an `8px` gap, rounded corners, and a distinct hover/active state. The seven object summaries also sit in separate cards with small vertical gaps.
