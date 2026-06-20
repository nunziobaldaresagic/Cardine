---
name: agic-docx
description: |
  Create or edit `.docx` documents that must strictly conform to the bundled AGIC Word template, preserving AGIC styles, numbering, fonts, and theme.
  USE FOR: generating AGIC technical reports, converting Markdown to AGIC DOCX, appending or converting DOCX content to AGIC styles, validating AGIC template integrity, AGIC documentation or template-locked Word workflows.
  DO NOT USE FOR: PowerPoint work (use `agic-pptx`), spreadsheet tasks, or non-AGIC Word styling and freeform DOCX design.
---

# AGIC DOCX Skill

Generate AGIC-styled Word documents with strict template preservation. All scripts use battle-tested Document library copied from docx skill for reliability.

**Template location**: `.agents/skills/agic-docx/assets/agic-template.docx`

## Workflow Decision Tree

### Reading/Analyzing Documents
- **Text extraction** → Use pandoc (see "Text Extraction" section)
- **Complex analysis** → Unpack and read raw XML (see "Advanced: Direct OOXML Manipulation")

### Creating New Documents
- **From markdown** → Use `markdown_to_docx.py`
- **Programmatically** → Use `create_document.py`

### Editing Existing Documents
- **Simple additions** → Use `append_content.py`
- **Document review with tracked changes** → Use "Redlining Workflow" (see below)
- **Style conversion** → Use `convert_to_agic.py`

### Visual Analysis
- **Convert to images** → Use "Document to Images" workflow (see below)

### Validation
- **Verify template integrity** → Use `verify_agic_template_parts.py`
- **Validate OOXML schema** → Use `ooxml/scripts/validate.py`

## Python Environment

**This skill requires Python 3.8+ and `uv`** (fast package manager). Follow these steps before running any script.

### Step 1 — Ensure `uv` is available

```bash
uv --version   # expected: uv 0.4 or higher
```

If missing, install it:

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Step 2 — Run any script with `uv run`

`uv run` creates a temporary environment and installs packages automatically — no manual venv needed:

```bash
uv run --with mistune --with python-docx --with defusedxml \
  python ".agents/skills/agic-docx/scripts/SCRIPT_NAME.py" [args]
```

Replace `SCRIPT_NAME.py` and `[args]` with the specific script and arguments. All **Quick Start** commands below use this pattern.

> **First run only**: uv downloads and caches packages (~5 s). All subsequent runs are instant.

### Advanced: persistent virtual environment

If you need to run many scripts in sequence, set up a venv once to avoid repeating `--with` flags:

```bash
# One-time setup (from repo root)
uv venv ".agents/skills/agic-docx/.venv"
uv pip install --python ".agents/skills/agic-docx/.venv" mistune python-docx defusedxml
```

Then replace `python` with the venv interpreter in all commands:

```bash
# Windows
".agents/skills/agic-docx/.venv/Scripts/python" ".agents/skills/agic-docx/scripts/SCRIPT_NAME.py" [args]

# macOS / Linux
".agents/skills/agic-docx/.venv/bin/python" ".agents/skills/agic-docx/scripts/SCRIPT_NAME.py" [args]
```

---

## Optional system dependencies

**Mermaid diagrams** (detected automatically in code blocks):

Mermaid diagrams render automatically with **no setup required** when internet is available.
The converter uses a 3-tier strategy:

| Tier | Method | Requires |
|------|--------|----------|
| 1 | [mermaid.ink](https://mermaid.ink) public API | Internet access (default) |
| 2 | `mmdc` local CLI | Node.js + `npm install -g @mermaid-js/mermaid-cli` |
| 3 | Styled source code fallback | Nothing — diagram source always preserved |

To enable offline rendering (Tier 2):
```bash
npm install -g @mermaid-js/mermaid-cli
```

**Text extraction** (pandoc):
```bash
# Ubuntu/Debian
sudo apt-get install pandoc
# macOS
brew install pandoc
# Windows
choco install pandoc
```

**Document-to-images conversion** (LibreOffice + Poppler):
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice poppler-utils
# macOS
brew install libreoffice poppler
# Windows — install LibreOffice manually; choco install poppler
```

## Quick Start

### Convert Markdown to AGIC DOCX

```bash
uv run --with mistune --with python-docx --with defusedxml \
  python ".agents/skills/agic-docx/scripts/markdown_to_docx.py" input.md output.docx
```

**Features**:
- Filters YAML frontmatter automatically
- Uses Markdown `#` as the document/cover title (`Titolo`) and starts body headings at `##`
- Converts `##` / `###` / deeper headings to AGIC Titolo Paragrafo / AGIC Titolo 2 / AGIC Titolo 3 styles
- Renders native Word tables (not placeholders)
- Preserves inline formatting (bold, italic, code, links)
- Handles bullet and numbered lists
- Code blocks with monospace font
- Full AGIC template preservation

**Supported Markdown**:
- Headings (H1-H6, with `#` reserved for the document title)
- Paragraphs with inline formatting (**bold**, *italic*, `code`, [links](url))
- Tables (converted to native Word tables)
- Bullet and numbered lists
- Code blocks (with Mermaid diagram detection)
- Horizontal rules

### Create New Document

```bash
uv run --with python-docx --with defusedxml \
  python ".agents/skills/agic-docx/scripts/create_document.py" output.docx --title "Report Title"
```

`--title` populates the template cover page title control; section headings should begin at level 2.

### Append Content

```bash
uv run --with python-docx --with defusedxml \
  python ".agents/skills/agic-docx/scripts/append_content.py" document.docx --heading "New Section" --text "Content"
```

### Convert Existing DOCX to AGIC

```bash
uv run --with python-docx --with defusedxml \
  python ".agents/skills/agic-docx/scripts/convert_to_agic.py" input.docx output.docx
```

## Golden Rules

1. **Start from template** - Use bundled `.agents/skills/agic-docx/assets/agic-template.docx`
2. **Apply styles by name** - Never set fonts, sizes, colors manually
3. **Only modify content** - Never change `word/styles.xml`, `numbering.xml`, `theme/`, `fontTable.xml`

## Verify Template Integrity

After generating documents, verify style parts weren't modified:

```bash
uv run --with python-docx --with defusedxml \
  python ".agents/skills/agic-docx/scripts/verify_agic_template_parts.py" \
  --template ".agents/skills/agic-docx/assets/agic-template.docx" --doc "output.docx"
```

### Validate OOXML Schema

Validate document against OOXML schema compliance:

```bash
uv run --with defusedxml \
  python ".agents/skills/agic-docx/ooxml/scripts/validate.py" output.docx
```

This checks:
- XML schema compliance
- Element ordering
- Required attributes
- Relationship integrity

Common validation errors:
- **Invalid element ordering** - Elements in wrong order (e.g., `<w:pStyle>` must come before `<w:spacing>`)
- **Missing attributes** - Required attributes not present
- **Invalid RSID format** - Must be 8-digit hex (e.g., `00AB1234`)
- **Broken relationships** - References to non-existent files

## Available AGIC Styles

View cached style list: `.agents/skills/agic-docx/references/template-styles.json`

Or generate fresh:
```bash
uv run --with python-docx \
  python ".agents/skills/agic-docx/scripts/list_template_styles.py" ".agents/skills/agic-docx/assets/agic-template.docx"
```

## Code Style Guidelines

**IMPORTANT**: When generating code for DOCX operations:
- Write concise code - avoid verbose variable names
- Avoid redundant operations and unnecessary print statements
- Use Document library methods instead of raw XML when possible
- Preserve existing RSIDs for unchanged content
- Batch related changes together (3-10 per script)

Example - Concise tracked change:
```python
# ✅ GOOD - Concise and clear
doc = Document("unpacked")
node = doc["word/document.xml"].get_node(line_number=42)
doc["word/document.xml"].suggest_deletion(node)
doc.save()

# ❌ BAD - Verbose with unnecessary prints
print("Loading document from unpacked directory...")
document_instance = Document("unpacked")
print("Finding node at line 42...")
target_node = document_instance["word/document.xml"].get_node(line_number=42)
print("Suggesting deletion...")
document_instance["word/document.xml"].suggest_deletion(target_node)
print("Saving document...")
document_instance.save()
print("Done!")
```

## Advanced: Direct OOXML Manipulation

For complex scenarios requiring direct XML editing, see:
- **OOXML reference**: `.agents/skills/agic-docx/references/ooxml.md` - Complete XML patterns for headings, lists, tables, formatting, tracked changes, and schema compliance rules
- **JavaScript alternative**: `.agents/skills/agic-docx/references/docx-js.md` - Using docx library with JavaScript/TypeScript instead of Python
- **End-to-end workflows**: `.agents/skills/agic-docx/references/workflows.md` - Complete examples for common tasks
- **Unpack/pack tools**: `.agents/skills/agic-docx/ooxml/scripts/unpack.py` and `pack.py`

Example workflow:
```bash
# Unpack DOCX to XML
uv run --with defusedxml python ".agents/skills/agic-docx/ooxml/scripts/unpack.py" document.docx unpacked/

# Edit unpacked/word/document.xml (see ooxml.md for patterns)

# Repack to DOCX
uv run python ".agents/skills/agic-docx/ooxml/scripts/pack.py" unpacked/ output.docx
```
