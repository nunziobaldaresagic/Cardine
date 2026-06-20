#!/usr/bin/env python3
"""Append content to existing AGIC Word documents.

Uses the Document library to add new content while preserving template integrity.

Usage:
    python append_content.py document.docx --text "New paragraph content"
    python append_content.py document.docx --heading "New Section" --text "Content"

Part of the agic-docx skill.
"""

import argparse
import shutil
import sys
import tempfile
from pathlib import Path

from document import Document
from style_mapper import AGICStyleMapper


def append_to_agic_document(
    docx_path: Path,
    heading: str = None,
    text: str = None
):
    """Append content to existing AGIC document.
    
    Args:
        docx_path: Path to DOCX file (modified in place)
        heading: Optional heading to add
        text: Optional paragraph text to add
    """
    if not heading and not text:
        raise ValueError("Must provide heading or text")
    
    style_mapper = AGICStyleMapper()
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir) / "unpacked"
        
        # Unpack document
        shutil.unpack_archive(str(docx_path), str(temp_path), "zip")
        
        # Initialize Document
        doc = Document(str(temp_path), author="Agic", initials="A")
        doc_xml = doc["word/document.xml"]
        
        # Get body element
        body = doc_xml.dom.getElementsByTagName("w:body")[0]
        
        # Find sectPr (must stay at end)
        sect_pr = None
        for child in body.childNodes:
            if child.nodeType == child.ELEMENT_NODE and child.tagName == "w:sectPr":
                sect_pr = child
                break
        
        # Remove sectPr temporarily
        if sect_pr:
            body.removeChild(sect_pr)
        
        # Add heading if provided
        if heading:
            para = _create_paragraph(
                doc_xml,
                heading,
                style_mapper.get_style_for_heading(2)
            )
            body.appendChild(para)
        
        # Add text if provided
        if text:
            para = _create_paragraph(
                doc_xml,
                text,
                style_mapper.get_style_for_paragraph()
            )
            body.appendChild(para)
        
        # Restore sectPr at end
        if sect_pr:
            body.appendChild(sect_pr)
        
        # Save
        doc.save()
        
        # Pack back to original location
        shutil.make_archive(str(docx_path.with_suffix("")), "zip", temp_path)
        shutil.move(str(docx_path.with_suffix(".zip")), str(docx_path))


def _create_paragraph(doc_xml, text: str, style_id: str):
    """Create Word paragraph element."""
    dom = doc_xml.dom
    para = dom.createElement("w:p")
    
    # Paragraph properties
    pPr = dom.createElement("w:pPr")
    pStyle = dom.createElement("w:pStyle")
    pStyle.setAttribute("w:val", style_id)
    pPr.appendChild(pStyle)
    pPr.setAttribute("w:rsidR", doc_xml.rsid)
    pPr.setAttribute("w:rsidRDefault", doc_xml.rsid)
    para.appendChild(pPr)
    
    # Text run
    if text:
        run = dom.createElement("w:r")
        t = dom.createElement("w:t")
        t.setAttribute("xml:space", "preserve")
        t.appendChild(dom.createTextNode(text))
        run.appendChild(t)
        para.appendChild(run)
    
    return para


def main():
    parser = argparse.ArgumentParser(description="Append content to AGIC document")
    parser.add_argument("document", type=Path, help="DOCX file to modify")
    parser.add_argument("--heading", help="Heading to add")
    parser.add_argument("--text", help="Paragraph text to add")
    
    args = parser.parse_args()
    
    if not args.document.exists():
        print(f"Error: Document not found: {args.document}", file=sys.stderr)
        sys.exit(1)
    
    if not args.heading and not args.text:
        print("Error: Must provide --heading or --text", file=sys.stderr)
        sys.exit(1)
    
    try:
        append_to_agic_document(args.document, args.heading, args.text)
        print(f"✓ Updated {args.document}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
