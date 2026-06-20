# Editing AGIC Presentations

## Quick Edit (text-only changes)

Use this minimal path when you only need to change text content with no structural changes (no slide adds/deletes/reorders).

1. **Unpack**: `python scripts/office/unpack.py input.pptx unpacked/`
2. **Edit** text in the relevant `slide{N}.xml` files
3. **Pack**: `python scripts/office/pack.py unpacked/ output.pptx --original assets/agic-template.pptx`

> **Skip `clean.py`** when you have only edited text and have NOT deleted any slides or shapes. `clean.py` is required after structural changes (slide deletion, shape removal) to remove orphaned files.

---

## Template-Based Workflow

Always start from `assets/agic-template.pptx`. Never start from a blank file.

1. **Analyze** template slides:
   ```bash
   python scripts/thumbnail.py assets/agic-template.pptx
   python -m markitdown assets/agic-template.pptx
   ```
   Review `thumbnails.jpg` for layouts; markitdown output for existing text content.

2. **Plan slide mapping**: For each content section, choose a template slide.
   See [agic-template-layouts.md](agic-template-layouts.md) for all 40 slides categorized.

   Use **varied layouts** — monotonous same-layout slides are a common failure mode.

3. **Unpack**: `python scripts/office/unpack.py assets/agic-template.pptx unpacked/`

4. **Restructure** (do this yourself, not with subagents):
   - Delete unwanted slides (remove from `<p:sldIdLst>` in `ppt/presentation.xml`)
   - Duplicate slides you want to reuse: `python scripts/add_slide.py unpacked/ slide2.xml` (auto-updates `presentation.xml`)
   - Reorder slides in `<p:sldIdLst>`
   - **Complete all structural changes before step 5**

5. **Edit content** in each `slide{N}.xml`.  
   Use subagents if available — slides are separate XML files, so subagents can edit in parallel.  
   Include in subagent prompts: the slide file path, **"Use the Edit tool for all changes"**, and the formatting rules below.

6. **Clean**: `python scripts/clean.py unpacked/`

7. **Pack**: `python scripts/office/pack.py unpacked/ output.pptx --original assets/agic-template.pptx`

---

## Scripts Reference

| Script | Command |
|--------|---------|
| Unpack | `python scripts/office/unpack.py input.pptx unpacked/` |
| Add/duplicate slide | `python scripts/add_slide.py unpacked/ slide2.xml` — auto-updates `presentation.xml` |
| Create from layout | `python scripts/add_slide.py unpacked/ slideLayout2.xml` — auto-updates `presentation.xml` |
| Clean orphaned files | `python scripts/clean.py unpacked/` |
| Pack | `python scripts/office/pack.py unpacked/ output.pptx --original assets/agic-template.pptx` |
| Thumbnails | `python scripts/thumbnail.py input.pptx [prefix] [--cols N]` |

---

## Slide Operations

Slide order is in `ppt/presentation.xml` → `<p:sldIdLst>`.

- **Reorder**: Rearrange `<p:sldId>` elements.
- **Delete**: Remove `<p:sldId>`, then run `clean.py`.
- **Add**: Use `add_slide.py`. Never manually copy slide files.

---

## Editing Content

For each slide:
1. Read the slide XML
2. Identify ALL placeholder content — text, images, charts, icons, captions
3. Replace each placeholder with final content

**Use the Edit tool, not sed or Python scripts.**

### Formatting Rules

- **Bold all headers, subheadings, inline labels**: `b="1"` on `<a:rPr>`
- **Never use unicode bullets (•)**: Use `<a:buChar>` or `<a:buAutoNum>`
- **Inherited bullets**: Let bullets inherit from the layout unless overriding
- **AGIC fonts**: Never override `typeface` — let theme fonts (Calibri Light / Calibri) apply
- **AGIC colors**: Never hardcode arbitrary colors. Use theme colors or the documented AGIC palette

### Multi-Item Content

Create separate `<a:p>` elements — never concatenate items into one string.

```xml
<!-- CORRECT: separate paragraphs -->
<a:p>
  <a:pPr algn="l"><a:lnSpc><a:spcPts val="3919"/></a:lnSpc></a:pPr>
  <a:r><a:rPr lang="it-IT" sz="2799" b="1"/><a:t>Step 1</a:t></a:r>
</a:p>
<a:p>
  <a:pPr algn="l"><a:lnSpc><a:spcPts val="3919"/></a:lnSpc></a:pPr>
  <a:r><a:rPr lang="it-IT" sz="2799"/><a:t>Description of step 1.</a:t></a:r>
</a:p>
```

### Smart Quotes

Use XML entities when inserting text with quotes:

| Character | Entity |
|-----------|--------|
| `"` left double | `&#x201C;` |
| `"` right double | `&#x201D;` |
| `'` left single | `&#x2018;` |
| `'` right single | `&#x2019;` |

---

## Common Pitfalls

### Template Adaptation

- Remove excess shapes entirely (not just clear text) when your content has fewer items than the template
- Run visual QA after structural changes — one fix often reveals another problem
- Template slot count ≠ your content count: if template has 4 items and you have 3, delete the 4th shape group

### Preserving AGIC Branding

- **Never modify** `ppt/theme/`, `ppt/slideMasters/`, or `ppt/slideLayouts/` — these hold the AGIC brand
- Only edit content in `ppt/slides/slide{N}.xml`
- The `--original` flag in `pack.py` ensures style parts are preserved from the source template

### Language

The template's XML may use Italian language tags (`lang="it-IT"`). Preserve these when editing existing text runs. For new text runs, you may use `lang="it-IT"` or `lang="en-US"` depending on the presentation language.

---

## Visual QA

```bash
# Content check
python -m markitdown output.pptx

# Find leftover AGIC placeholder text
python -m markitdown output.pptx | grep -iE "qui|here|testo|placeholder|lorem|ipsum|xxxx"

# Thumbnails
python scripts/thumbnail.py output.pptx output_check

# Full-resolution images (requires LibreOffice)
soffice --headless --convert-to png --outdir slides/ output.pptx
```

After generating images, prompt a subagent:

```
Visually inspect these AGIC presentation slides. Find issues.
Look for: overlapping elements, text overflow, leftover placeholder text,
elements breaking AGIC brand colors, inconsistent fonts, low-contrast text.
List all issues found, including minor ones.
```
