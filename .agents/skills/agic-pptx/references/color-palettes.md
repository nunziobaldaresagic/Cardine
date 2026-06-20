# AGIC Template — Color Palettes

Derived from `scripts/analyze_colors.py` run on `assets/agic-template.pptx`.
The template's 40 slides fall into **4 palette families**. Mix slides from compatible
families for a coherent deck; avoid combining Dark Navy slides with bright Orange in
the same section.

---

## Palette 1 — Blu Formale (Blue)

**Primary color**: `#4472C4` (accent1)  
**Supporting**: `#0296CD` cyan-blue, `#025978` dark teal, `#013A4F` deep teal, `#5B9BD5` light blue  
**Mood**: Institutional, reliable, technical, corporate authority  
**Best for**: Technical reports, government presentations, institutional briefings

### Slide numbers

| Slide | Role | Notes |
|-------|------|-------|
| 11 | Rich content | Dark teal + blue dominant — rectangles/callouts with orange accent highlights |
| 13 | Rich content | Image + callout + title (5 shapes) — dark teal accent |
| 14 | Rich content | Callout bubbles + image (8 shapes) — dark teal accent |
| 18 | Rich content | SmartArt + teardrop shapes in blue |
| 34 | Photo gallery | Blue accent on multi-image layout |

**Also compatible** (white base + blue accents from master):
Slides 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20, 26, 27, 28, 31, 33, 35, 36, 37, 38, 39, 40

---

## Palette 2 — Arancione Energico (Orange)

**Primary color**: `#ED7D31` (accent2)  
**Supporting**: `#FF6600` vivid orange, `#F68121` amber orange  
**Mood**: Energy, dynamism, innovation, creativity, action  
**Best for**: Pitch decks, product launches, sales presentations, innovation workshops

### Slide numbers

| Slide | Role | Notes |
|-------|------|-------|
| 19 | Photo cards | 3-column photo cards with orange accents (`#F68121` dominant) |
| 32 | Cover | Abstract geometric cover — 120+ shapes in vivid orange (`#FF6600`) — highest visual impact |

---

## Palette 3 — Navy Scuro (Dark Navy)

**Primary color**: `#44546A` (dk2) / `#00188F` deep navy  
**Supporting**: `#000000` black, `#292929` near-black, `#5F5F5F` dark gray  
**Mood**: Premium, authoritative, executive, sophisticated  
**Best for**: Executive briefings, high-impact reports, awards ceremonies, premium proposals

### Slide numbers

| Slide | Role | Notes |
|-------|------|-------|
| 17 | Rich content | Dark multi-point slide with callout labels (#404040 dominant) |
| 21 | Photo gallery | Full photo grid on dark background (#00188F) |
| 22 | Photo gallery | Creative collage on dark — richest layout (41 shapes) |
| 23 | Photo gallery | Freeform shapes + image gallery on dark |
| 24 | Photo gallery | Team / showcase grid on dark (#00188F + black) |
| 25 | Photo gallery | Branded image gallery, 69 shapes — most complex image layout |
| 29 | Cover | Rich branded cover with SmartArt, images, slide number |
| 30 | Content | Images + SmartArt icons on dark base |

---

## Palette 4 — Bianco Pulito (White / Minimal)

**Primary color**: `#FFFFFF` white background  
**Supporting**: `#E7E6E6` light gray, minimal fills  
**Mood**: Clean, neutral, readable, accessible  
**Best for**: Training materials, academic presentations, multi-day workshops, documentation

### Slide numbers

| Slide | Role | Notes |
|-------|------|-------|
| 1 | Cover | Date placeholder + 2 text boxes |
| 2 | Cover | Minimal cover, title + subtitle |
| 3 | Cover | Cover with date + 2 prominent text boxes |
| 4 | Section divider | "Due contenuti" title divider |
| 5 | Simple title | Agenda / table of contents |
| 6 | Simple title | Variant |
| 7 | Simple title | Variant |
| 8 | Section divider | Single title, clean minimal |
| 9 | Section divider | Variant |
| 10 | Section divider | AGIC branded divider (Layout personalizzato) |
| 12 | Section divider | AGIC branded divider (variant) |
| 13 | Rich content | Image + callout + title (blue-teal accent) |
| 14 | Rich content | Callout bubbles + image (blue-teal accent) |
| 15 | Rich content | Image + text box + rectangle |
| 16 | Rich content | Rectangle header + icon grid |
| 20 | Section divider | AGIC branded divider |
| 26 | Photo gallery | Multi-image layout |
| 27 | Photo gallery | SmartArt-heavy |
| 28 | Section divider | AGIC branded divider |
| 31 | Section divider | AGIC branded divider |
| 33 | Section divider | AGIC branded divider |
| 35 | Photo gallery | Simplest image grid (8 shapes) |
| 36 | Section divider | AGIC branded divider |
| 37 | Rich content | Image + diagram + SmartArt |
| 38 | Closing | Minimal closing, single text box |
| 39 | Closing | Closing variant |
| 40 | Section end | Minimal blank |

---

## Combining Palettes

| Goal | Recommended combination |
|------|------------------------|
| Institutional + high-impact opening | Blue base + slide 29 (Navy cover) |
| Energetic pitch | Orange cover (32) + Orange content (11, 19) + White/Blue body |
| Premium executive deck | Navy cover (29) + Dark content (17, 21–24) + minimal transition slides |
| Neutral/accessible training | White throughout — use accents via text color only |
| Mixed / branded default | White base slides with slide 10/12/20 AGIC-branded dividers |

---

## Script Reference

To re-run analysis:

```bash
uv run --with defusedxml python "scripts/analyze_colors.py" "assets/agic-template.pptx"
```

Note: Most slides inherit their background from the slide master/layout rather than
defining it inline. The script detects shape-level explicit colors; slides reported as
"White" may still carry blue or orange accents from the master. Use thumbnails for
definitive visual confirmation.
