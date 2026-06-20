# Migrating an Existing PPTX to AGIC Branding

Use this workflow when you have an existing (non-AGIC) presentation and want to apply AGIC branding while preserving slide content.

> **Note**: This workflow replaces the visual theme (fonts, colors, slide masters) with AGIC branding. Slide content (text, images, shapes) is preserved but may need visual adjustments afterward.

---

## When to Use

- You have a client/legacy PPTX with good content but wrong branding
- You want to "AGIC-ify" an existing deck
- You need to match AGIC style but cannot rebuild from scratch

---

## Workflow

### Step 1 — Unpack both files

```bash
python scripts/office/unpack.py existing.pptx unpacked_existing/
python scripts/office/unpack.py assets/agic-template.pptx unpacked_template/
```

### Step 2 — Replace style-bearing OOXML parts

Copy the following from `unpacked_template/` into `unpacked_existing/`, overwriting:

```
ppt/theme/theme1.xml
ppt/slideMasters/         (all files)
ppt/slideMasters/_rels/   (all .rels files)
ppt/slideLayouts/         (all files)
ppt/slideLayouts/_rels/   (all .rels files)
```

PowerShell:
```powershell
Copy-Item "unpacked_template\ppt\theme\theme1.xml" "unpacked_existing\ppt\theme\theme1.xml" -Force
Copy-Item "unpacked_template\ppt\slideMasters\*" "unpacked_existing\ppt\slideMasters\" -Recurse -Force
Copy-Item "unpacked_template\ppt\slideLayouts\*" "unpacked_existing\ppt\slideLayouts\" -Recurse -Force
```

### Step 3 — Verify slide layout references

Each slide in `unpacked_existing/ppt/slides/_rels/slide{N}.xml.rels` references a `slideLayout`. After replacing layouts, verify each slide still points to a valid layout file.

If a slide referenced `../slideLayouts/slideLayout5.xml` and that layout no longer exists in AGIC template, update the reference to the closest AGIC layout.

See [agic-template-layouts.md](agic-template-layouts.md) for layout descriptions.

### Step 4 — Update [Content_Types].xml

If the number of slideMasters or slideLayouts changed, update `[Content_Types].xml` to reflect only the files that exist:

```bash
python scripts/clean.py unpacked_existing/
```

### Step 5 — Pack

```bash
python scripts/office/pack.py unpacked_existing/ output_agic.pptx --original assets/agic-template.pptx
```

The `--original` flag ensures the AGIC style parts are authoritative.

---

## Post-Migration QA

After packing, run visual QA — font and color changes often cause text overflow or layout breaks:

```bash
python scripts/thumbnail.py output_agic.pptx migrated_thumbs
```

Check for:
- Text overflow (font changes can affect text box sizing)
- Wrong background colors (slides that had custom backgrounds)
- Mismatched layout (slides that used layouts not in AGIC template)

---

## Limitations

- **Custom fonts** in the original deck are replaced by Calibri Light / Calibri
- **Custom color themes** are replaced by AGIC palette
- **Embedded charts/SmartArt** may retain original colors — update manually
- Slides with heavy custom positioning may need manual adjustment after migration