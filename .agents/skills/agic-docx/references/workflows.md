# Complete Workflows for AGIC DOCX

End-to-end examples for common document operations with AGIC template preservation.

## Table of Contents

- [Workflow 1: Markdown to AGIC DOCX](#workflow-1-markdown-to-agic-docx)
- [Workflow 2: Document Review with Tracked Changes](#workflow-2-document-review-with-tracked-changes)
- [Workflow 3: Converting Generic DOCX to AGIC](#workflow-3-converting-generic-docx-to-agic)
- [Workflow 4: Adding Content to Existing Document](#workflow-4-adding-content-to-existing-document)
- [Workflow 5: Visual Document Analysis](#workflow-5-visual-document-analysis)

---

## Workflow 1: Markdown to AGIC DOCX

**Goal**: Convert a markdown technical report to AGIC-styled Word document.

### Input
```markdown
# Technical Report

## Executive Summary

This report provides analysis of system performance.

### Key Findings

- Response time: 150ms
- Throughput: 10k req/s
- Error rate: 0.01%

## Methodology

We conducted load testing using...
```

### Steps

1. **Convert markdown to DOCX**:
   ```bash
   python .agents/skills/agic-docx/scripts/markdown_to_docx.py report.md output.docx
   ```

2. **Verify template integrity**:
   ```bash
   python .agents/skills/agic-docx/scripts/verify_agic_template_parts.py \
     --template .agents/skills/agic-docx/assets/agic-template.docx \
     --doc output.docx
   ```

3. **Validate OOXML schema**:
   ```bash
   python .agents/skills/agic-docx/ooxml/scripts/validate.py output.docx
   ```

### Expected Output
- AGIC-styled DOCX with:
  - H1 → cover-page/document title (`Titolo` content control), not a body paragraph
  - H2 → AGICTitoloParagrafo
  - H3 → AGICTitolo2
  - Paragraphs → AGICcorpo
  - Lists → AMElencopuntato
- All style parts unchanged
- Valid OOXML structure

### Troubleshooting
- **Verification fails**: Check if markdown_to_docx.py modified styles.xml
- **Validation fails**: Check element ordering in generated XML
- **Mermaid diagrams not rendering**: Install `npm install -g @mermaid-js/mermaid-cli`

---

## Workflow 2: Document Review with Tracked Changes

**Goal**: Review legal document with suggestions in batches.

### Scenario
Contract needs 12 changes:
- Batch 1: Update dates (3 changes)
- Batch 2: Change party names (4 changes)
- Batch 3: Modify terms (5 changes)

### Steps

#### Setup

1. **Extract current content to markdown**:
   ```bash
   pandoc --track-changes=all contract.docx -o current.md
   ```

2. **Review and identify changes**:
   - Read current.md
   - Plan all 12 changes
   - Group into 3 batches

3. **Unpack document**:
   ```bash
   python .agents/skills/agic-docx/ooxml/scripts/unpack.py contract.docx unpacked/
   ```
   Note the suggested RSID (e.g., `00AB1234`)

#### Batch 1: Update Dates (3 changes)

4. **Grep to find text locations**:
   ```bash
   grep -n "January 15, 2024" unpacked/word/document.xml
   # Output: 42:    <w:t>January 15, 2024</w:t>
   ```

5. **Create batch1_dates.py**:
   ```python
   from document import Document
   
   doc = Document("unpacked", author="Agic", initials="A")
   doc_xml = doc["word/document.xml"]
   
   # Change 1: January 15 → February 1
   node1 = doc_xml.get_node(line_number=42, tag="w:t")
   doc_xml.suggest_deletion(node1.parentNode)
   
   # Insert new date
   parent = node1.parentNode.parentNode
   ins = doc_xml.dom.createElement("w:ins")
   ins.setAttribute("w:author", "Agic")
   ins.setAttribute("w:date", doc_xml._get_current_timestamp())
   run = doc_xml.dom.createElement("w:r")
   t = doc_xml.dom.createElement("w:t")
   t.appendChild(doc_xml.dom.createTextNode("February 1, 2024"))
   run.appendChild(t)
   ins.appendChild(run)
   parent.appendChild(ins)
   
   # Repeat for changes 2 and 3...
   
   doc.save()
   ```

6. **Run batch 1**:
   ```bash
   python batch1_dates.py
   ```

7. **Verify batch 1**:
   ```bash
   python .agents/skills/agic-docx/ooxml/scripts/pack.py unpacked/ contract_batch1.docx
   pandoc --track-changes=all contract_batch1.docx -o verify1.md
   grep "February 1" verify1.md  # Should find
   ```

#### Batch 2: Change Party Names (4 changes)

8. **Grep for new locations** (line numbers changed after batch 1):
   ```bash
   grep -n "Acme Corp" unpacked/word/document.xml
   ```

9. **Create and run batch2_parties.py** (similar structure)

10. **Verify batch 2**

#### Batch 3: Modify Terms (5 changes)

11. **Create and run batch3_terms.py**

12. **Final verification**:
    ```bash
    python .agents/skills/agic-docx/ooxml/scripts/pack.py unpacked/ contract_final.docx
    pandoc --track-changes=all contract_final.docx -o final.md
    
    # Check all 12 changes present
    grep "February 1" final.md
    grep "NewCorp Inc" final.md
    # ... check all changes
    ```

### Best Practices
- Always grep before each batch (line numbers change)
- Test each batch independently
- Keep batches small (3-10 changes)
- Only mark text that actually changes
- Preserve original RSIDs for unchanged content

---

## Workflow 3: Converting Generic DOCX to AGIC

**Goal**: Convert Microsoft Word document to AGIC styling.

### Steps

1. **Check source document structure**:
   ```bash
   pandoc generic.docx -o check.md
   # Review heading levels and content structure
   ```

2. **Convert to AGIC styling**:
   ```bash
   python .agents/skills/agic-docx/scripts/convert_to_agic.py generic.docx agic-output.docx
   ```

3. **Verify template integrity**:
   ```bash
   python .agents/skills/agic-docx/scripts/verify_agic_template_parts.py \
     --template .agents/skills/agic-docx/assets/agic-template.docx \
     --doc agic-output.docx
   ```

4. **Manual review**:
   - Open agic-output.docx in Word
   - Check that styles applied correctly
   - Verify no formatting lost

### Common Issues
- **Generic styles not mapped**: Edit STYLE_CONVERSION_MAP in convert_to_agic.py
- **Verification fails**: Source document may have modified styles; start from AGIC template instead
- **Formatting lost**: Some custom formatting can't map to AGIC styles; may need manual adjustment

---

## Workflow 4: Adding Content to Existing Document

**Goal**: Add new section to existing AGIC report.

### Steps

1. **Add content**:
   ```bash
   python .agents/skills/agic-docx/scripts/append_content.py report.docx \
     --heading "New Findings" \
     --text "Recent analysis revealed additional patterns..."
   ```

2. **Verify integrity**:
   ```bash
   python .agents/skills/agic-docx/scripts/verify_agic_template_parts.py \
     --template .agents/skills/agic-docx/assets/agic-template.docx \
     --doc report.docx
   ```

3. **Add complex content via markdown**:
   ```bash
   # Create section in markdown
   echo "## Additional Analysis" > section.md
   echo "" >> section.md
   echo "Key findings:" >> section.md
   echo "- Finding 1" >> section.md
   echo "- Finding 2" >> section.md
   
   # Convert section to temp DOCX
   python .agents/skills/agic-docx/scripts/markdown_to_docx.py section.md section.docx
   
   # Manually merge or use append_content.py multiple times
   ```

### Best Practices
- Use append_content.py for simple additions
- Use markdown_to_docx.py for complex formatted sections
- Always verify after modifications
- Keep backups before editing

---

## Workflow 5: Visual Document Analysis

**Goal**: Convert DOCX to images for presentation or review.

### Steps

1. **Convert to PDF**:
   ```bash
   soffice --headless --convert-to pdf report.docx
   # Creates report.pdf
   ```

2. **Convert to JPEG images**:
   ```bash
   # All pages at 150 DPI
   pdftoppm -jpeg -r 150 report.pdf page
   # Creates: page-1.jpg, page-2.jpg, ...
   ```

3. **Convert specific pages at higher resolution**:
   ```bash
   # Pages 3-5 at 300 DPI
   pdftoppm -jpeg -r 300 -f 3 -l 5 report.pdf page
   # Creates: page-3.jpg, page-4.jpg, page-5.jpg
   ```

4. **Convert to PNG for transparency**:
   ```bash
   pdftoppm -png -r 150 report.pdf page
   ```

### Use Cases
- Creating presentation slides from report pages
- Sharing document previews without full DOCX
- Visual comparison of versions
- Document thumbnails for cataloging

### Dependencies
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice poppler-utils

# macOS
brew install libreoffice poppler
```

---

## Quick Reference: Command Cheatsheet

```bash
# Markdown conversion
python .agents/skills/agic-docx/scripts/markdown_to_docx.py input.md output.docx

# Text extraction
pandoc document.docx -o output.md
pandoc --track-changes=all document.docx -o output.md

# OOXML operations
python .agents/skills/agic-docx/ooxml/scripts/unpack.py doc.docx unpacked/
python .agents/skills/agic-docx/ooxml/scripts/pack.py unpacked/ doc.docx

# Verification
python .agents/skills/agic-docx/scripts/verify_agic_template_parts.py --template template.docx --doc output.docx
python .agents/skills/agic-docx/ooxml/scripts/validate.py output.docx

# Document operations
python .agents/skills/agic-docx/scripts/create_document.py output.docx --title "Title"
python .agents/skills/agic-docx/scripts/append_content.py doc.docx --heading "Section" --text "Content"
python .agents/skills/agic-docx/scripts/convert_to_agic.py input.docx output.docx

# Visualization
soffice --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```
