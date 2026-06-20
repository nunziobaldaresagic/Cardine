---
name: agic-pptx
description: |
   Handle any AGIC `.pptx` task involving presentation files as input or output while preserving the bundled AGIC template, brand colors, fonts, and slide layouts.
   USE FOR: creating AGIC-branded slide decks, editing or analyzing existing PPTX files, extracting presentation text, working with layouts or speaker notes, AGIC slides/decks/presentations, or `.pptx` filenames mentioned by the user.
   DO NOT USE FOR: Word document workflows (use `agic-docx`), spreadsheet tasks, or non-AGIC presentation design that should not use the bundled AGIC template.
---

# AGIC PPTX Skill

## Quick Reference

| Task | Guide |
|------|-------|
| Analyze template layouts | `python scripts/thumbnail.py assets/agic-template.pptx` |
| Analyze slide colors | `python scripts/analyze_colors.py assets/agic-template.pptx` |
| Start new from template | Unpack template, duplicate slides, edit content, pack |
| See available slide types | Read [references/agic-template-layouts.md](references/agic-template-layouts.md) |
| See color palette guide | Read [references/color-palettes.md](references/color-palettes.md) |
| Editing workflow details | Read [references/editing.md](references/editing.md) |
| Create from scratch (pptxgenjs) | Read [references/pptxgenjs.md](references/pptxgenjs.md) |
| Migrate existing PPTX to AGIC | Read [references/migrate_existing.md](references/migrate_existing.md) |
| Find placeholder text | `python scripts/find_placeholders.py output.pptx` |
| Convert slides to images | `python scripts/office/soffice.py --headless --convert-to pdf out.pptx && pdftoppm -jpeg -r 150 out.pdf slide` |

---

## Reading Content

```bash
# Text extraction
python -m markitdown presentation.pptx

# Visual overview
python scripts/thumbnail.py presentation.pptx

# Raw XML
python scripts/office/unpack.py presentation.pptx unpacked/
```

---

## Template

**File**: `assets/agic-template.pptx`  
**Slide size**: 13.33" x 7.5" (LAYOUT_WIDE)  
**Fonts**: Calibri Light (headings) / Calibri (body)  
**Colors**: see [references/color-palettes.md](references/color-palettes.md)

---

## Creating from Scratch

For AGIC presentations, **always start from `assets/agic-template.pptx`** — it provides the brand fonts, colors, and 40 ready-made layouts.

Only use **pptxgenjs** as a supplementary tool when generating complex programmatic content (charts, data-driven slides, icon grids) that is easier to produce via code than XML editing. In that case:

1. Generate content slides with pptxgenjs
2. Merge into an unpacked AGIC template (copy `slide{N}.xml`, update `presentation.xml`, update rels and `[Content_Types].xml`)
3. Pack with `--original assets/agic-template.pptx` to restore AGIC style parts

**Read [references/pptxgenjs.md](references/pptxgenjs.md) for full pptxgenjs usage.**

---

## Phase 0 — Clarify (ask before starting)

Before touching any file, ask the user these 4 questions. All answers shape which slides
to pick and how to structure the deck.

1. **Color palette / Palette colore** — Which visual mood fits the presentation?
   - **Blu Formale** `#4472C4` — institutional, technical, government. *Key slides: 11, 13, 14, 18, 34 + white base.*
   - **Arancione Energico** `#ED7D31` — pitch deck, innovation, sales. *Key slides: 19, 32.*
   - **Navy Scuro** `#44546A` — executive, premium, high-impact. *Key slides: 17, 21–25, 29, 30.*
   - **Bianco Pulito** `#FFFFFF` — training, academic, neutral documentation. *All white/minimal slides.*

2. **Slide count / Numero di slide** — Approximate total (e.g., 10, 15, 20+).

3. **Audience** — Who will see this? (e.g., management, engineers, customers, government).

4. **Presentation type / Tipo di presentazione** — Choose one:
   - Pitch / sales
   - Report tecnico / analisi
   - Formazione / workshop
   - Istituzionale / istituto

Record the answers; reference them in every slide-selection decision below.

---

## Core Workflow

1. **Clarify** — complete Phase 0 above
2. **Analyze** template: `python scripts/thumbnail.py assets/agic-template.pptx`
3. **Plan** which of the 40 template slides to use for each content section — constrained by the chosen palette (see [references/agic-template-layouts.md](references/agic-template-layouts.md) and [references/color-palettes.md](references/color-palettes.md))
4. **Unpack**: `python scripts/office/unpack.py assets/agic-template.pptx unpacked/`
5. **Restructure** slides (delete/duplicate/reorder) — complete before editing content
6. **Edit** slide content in each `slide{N}.xml`
7. **Clean**: `python scripts/clean.py unpacked/`
8. **Pack**: `python scripts/office/pack.py unpacked/ output.pptx --original assets/agic-template.pptx`

**Read [references/editing.md](references/editing.md) before editing slides.**

---

## Slide Selection Principles

The template contains 40 slides organized in categories. Key rules:

- **Covers / title slides**: Use slides 1, 3, or 29 for main cover; slide 32 for abstract geometric cover
- **Section dividers**: Use slides 4, 5, 8, 9, or any "Layout personalizzato" slide (10, 12, 20, 28, 31, 33, 36)
- **Text + image content**: Use slides 13, 15, 17, or 18
- **Multi-column / grouped content**: Use slides 11, 16, or 19
- **Photo galleries / image grids**: Use slides 21-27, 34-35
- **Closing slides**: Use slides 38 or 39

Use varied layouts — monotonous slides with the same layout repeated are a failure mode. Mix covers, section dividers, content, and image slides.

### Palette constraints

Apply these rules after the user has chosen a palette in Phase 0.

| If palette = | Cover | Section dividers | Content slides | Photo/gallery | Closing |
|---|---|---|---|---|---|
| **Blu Formale** | 1, 2, or 3 | 10, 12, 20 (AGIC-branded) | 11, 13, 14, 15, 16, 18, 37 | 34, 26, 35 | 38 or 39 |
| **Arancione Energico** | 32 (geometric) or 3 | 9, 28, 33, 36 | 15, 19, 37 | 26, 35 | 38 or 39 |
| **Navy Scuro** | 29 (rich branded) | 8, 31, 40 | 17, 30 | 21, 22, 23, 24, 25 | 38 or 39 |
| **Bianco Pulito** | 2 or 38 | 5, 6, 7, 4 | 15, 16, 37, 27 | 26, 35, 27 | 39 |

For **mixed decks** (e.g., white body with a strong cover): use the cover and dividers from the accent palette, white slides for body content.

---

## Design Ideas

**Don't create boring slides.** Plain bullets on a white background won't impress anyone. Consider these ideas for each slide.

### Before Starting

- **AGIC palette is fixed**: The mood is set by your Phase 0 choice (Blu Formale, Arancione, Navy, Bianco Pulito). Within that palette, pick the dominant color and use 1–2 supporting tones. One color should dominate (60–70% visual weight) — never give all colors equal weight.
- **Dark/light contrast**: Use a dark cover + light body slides ("sandwich" structure), or commit to dark throughout for a premium feel.
- **Commit to a visual motif**: Pick ONE distinctive element and repeat it — rounded image frames, icons in colored circles, thick single-side borders. Carry it across every slide.

### For Each Slide

**Every slide needs a visual element** — image, chart, icon, or shape. Text-only slides are forgettable.

**Layout options:**
- Two-column (text left, illustration right)
- Icon + text rows (icon in colored circle, bold header, description below)
- 2×2 or 2×3 grid (image on one side, content blocks on other)
- Half-bleed image (full left or right side) with content overlay

**Data display:**
- Large stat callouts (big numbers 60–72pt with small labels below)
- Comparison columns (before/after, pros/cons, side-by-side options)
- Timeline or process flow (numbered steps, arrows)

**Visual polish:**
- Icons in small colored circles next to section headers
- Italic accent text for key stats or taglines

### Typography

AGIC fonts are fixed: **Calibri Light** for headings, **Calibri** for body. Use size contrast to create hierarchy:

| Element | Size |
|---------|------|
| Slide title | 36–44pt bold |
| Section header | 20–24pt bold |
| Body text | 14–16pt |
| Captions | 10–12pt muted |

### Spacing

- 0.5" minimum margins from slide edges
- 0.3–0.5" between content blocks
- Leave breathing room — don't fill every inch

### Avoid (Common Mistakes)

- **Don't repeat the same layout** — vary columns, cards, and callouts across slides
- **Don't center body text** — left-align paragraphs and lists; center only titles
- **Don't skimp on size contrast** — titles need 36pt+ to stand out from 14–16pt body
- **Don't mix spacing randomly** — choose 0.3" or 0.5" gaps and use consistently
- **Don't create text-only slides** — add images, icons, charts, or visual elements
- **Don't forget text box padding** — set `margin: 0` on text boxes when aligning with shapes or icons
- **Don't use low-contrast elements** — icons AND text need strong contrast against the background
- **NEVER use accent lines under titles** — AGIC style uses clean whitespace instead
- **Don't style one slide and leave the rest plain** — commit fully or keep it simple throughout

---

## Design Rules

- Never deviate from AGIC brand colors above
- Never switch fonts away from Calibri Light / Calibri
- Never add accent lines under titles (AGIC style uses clean whitespace)
- Use the template's existing graphic elements (shapes, SmartArt, icons) — they carry AGIC brand identity
- Preserve all OOXML style-bearing parts — only edit content in slide XML files

---

## QA (Required)

**Assume there are problems. Your job is to find them.**

Your first render is almost never correct. Approach QA as a bug hunt, not a confirmation step. If you found zero issues on first inspection, you weren't looking hard enough.

### Content QA

```bash
# Content check (bash/macOS)
python -m markitdown output.pptx

# Check for leftover placeholders (bash/macOS)
python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum|qui|here|placeholder"

# Check for leftover placeholders (PowerShell / Windows)
python -m markitdown output.pptx | Select-String -Pattern 'xxxx|lorem|ipsum|placeholder' -CaseSensitive:$false

# Or use the dedicated finder script
python scripts/find_placeholders.py output.pptx

# Visual thumbnails
python scripts/thumbnail.py output.pptx output_thumbs
```

Convert slides to images via `soffice` for full-resolution visual QA:

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

This creates `slide-01.jpg`, `slide-02.jpg`, etc.

**⚠️ USE SUBAGENTS** — even for 2–3 slides. You've been staring at the code and will see what you expect, not what's there. Subagents have fresh eyes.

Use this prompt:

```
Visually inspect these AGIC presentation slides. Assume there are issues — find them.

Look for:
- Overlapping elements (text through shapes, lines through words, stacked elements)
- Text overflow or cut off at edges/box boundaries
- Decorative lines positioned for single-line text but title wrapped to two lines
- Source citations or footers colliding with content above
- Elements too close (< 0.3" gaps) or cards/sections nearly touching
- Uneven gaps (large empty area in one place, cramped in another)
- Insufficient margin from slide edges (< 0.5")
- Columns or similar elements not aligned consistently
- Low-contrast text, icons, or shapes against background
- Text boxes too narrow causing excessive wrapping
- Leftover placeholder content (qui, here, testo, lorem, ipsum, xxxx)
- Elements breaking AGIC brand colors or fonts

For each slide, list issues or areas of concern, even if minor.

Read and analyze these images:
1. /path/to/slide-01.jpg (Expected: [brief description])
2. /path/to/slide-02.jpg (Expected: [brief description])

Report ALL issues found, including minor ones.
```

To re-render specific slides after fixes:

```bash
pdftoppm -jpeg -r 150 -f N -l N output.pdf slide-fixed
```

### Verification Loop

1. Generate slides → Convert to images → Inspect with subagent
2. **List issues found** (if none found, look again more critically)
3. Fix issues in slide XML
4. **Re-verify affected slides** — one fix often creates another problem
5. Repeat until a full pass reveals no new issues

**Do not declare success until you've completed at least one fix-and-verify cycle.**

---

## Dependencies

```bash
uv pip install -r requirements.txt
```r

Or individually:
- `pip install "markitdown[pptx]"` - text extraction
- `pip install Pillow` - thumbnail grids
- `npm install -g pptxgenjs` - creating from scratch
- LibreOffice (`soffice`) - PDF conversion (auto-configured for sandboxed environments via `scripts/office/soffice.py`)
- Poppler (`pdftoppm`) - PDF to images

### Windows Setup

Install LibreOffice (required for `thumbnail.py` and PDF/image conversion):

```powershell
winget install TheDocumentFoundation.LibreOffice
```r

Or via Chocolatey:
```powershell
choco install libreoffice-fresh
```r

Install Poppler (required for `pdftoppm`):
```powershell
winget install oscarfonts.poppler
```r

Or download from https://github.com/oschwartz10612/poppler-windows/releases and add `bin/` to PATH.

**Verify installation:**
```powershell
soffice --version
pdftoppm -v
```r

> If `soffice` is not in PATH after LibreOffice install, add `C:\Program Files\LibreOffice\program\` to your system PATH.
