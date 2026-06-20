#!/usr/bin/env python3
"""Create new AGIC-styled Word documents programmatically.

Uses the Document library to create documents from scratch with AGIC template
styling. Supports structured content input.

Usage:
    python create_document.py output.docx --title "Report Title"
    python create_document.py output.docx --template agic-template.docx

Part of the agic-docx skill.
"""

import argparse
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Dict

from document import Document, _generate_hex_id
from style_mapper import AGICStyleMapper


def create_agic_document(
    output_path: Path,
    template_path: Path,
    title: str = "",
    sections: list = None
):
    """Create a new AGIC-styled document.
    
    Args:
        output_path: Path to output DOCX file
        template_path: Path to AGIC template DOCX
        title: Document title for the template cover page (optional)
        sections: List of section dicts with 'heading' and 'content' (optional)
    """
    sections = sections or []
    style_mapper = AGICStyleMapper()
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir) / "unpacked"
        
        # Unpack template
        shutil.unpack_archive(str(template_path), str(temp_path), "zip")
        
        # Initialize Document
        doc = Document(str(temp_path), author="Agic", initials="A")
        doc_xml = doc["word/document.xml"]
        
        # Get body element
        body = doc_xml.dom.getElementsByTagName("w:body")[0]
        
        # Keep the template body intact so cover page/title controls remain available.
        sect_pr = None
        for child in body.childNodes:
            if child.nodeType == child.ELEMENT_NODE and child.tagName == "w:sectPr":
                sect_pr = child
                break
        
        # Populate the cover page title if provided.
        if title:
            _set_document_title(doc, title)
        
        # Add sections
        for section in sections:
            # Section heading
            if section.get("heading"):
                para = _create_paragraph(
                    doc_xml,
                    section["heading"],
                    style_mapper.get_style_for_heading(2)
                )
                _append_to_body(body, para, sect_pr)
            
            # Section content
            if section.get("content"):
                para = _create_paragraph(
                    doc_xml,
                    section["content"],
                    style_mapper.get_style_for_paragraph()
                )
                _append_to_body(body, para, sect_pr)
        
        # Save
        doc.save()
        
        # Pack to output
        shutil.make_archive(str(output_path.with_suffix("")), "zip", temp_path)
        shutil.move(str(output_path.with_suffix(".zip")), str(output_path))


def _create_paragraph(doc_xml, text: str, style_id: str):
    """Create Word paragraph element."""
    dom = doc_xml.dom
    para = dom.createElement("w:p")
    para.setAttribute("w:rsidR", doc_xml.rsid)
    para.setAttribute("w:rsidRDefault", doc_xml.rsid)
    para.setAttribute("w:rsidP", doc_xml.rsid)
    para.setAttribute("w14:paraId", _generate_hex_id())
    para.setAttribute("w14:textId", _generate_hex_id())
    
    # Paragraph properties
    pPr = dom.createElement("w:pPr")
    pStyle = dom.createElement("w:pStyle")
    pStyle.setAttribute("w:val", style_id)
    pPr.appendChild(pStyle)
    para.appendChild(pPr)
    
    # Text run
    if text:
        run = dom.createElement("w:r")
        run.setAttribute("w:rsidR", doc_xml.rsid)
        t = dom.createElement("w:t")
        t.setAttribute("xml:space", "preserve")
        t.appendChild(dom.createTextNode(text))
        run.appendChild(t)
        para.appendChild(run)
    
    return para


def _append_to_body(body, node, sect_pr):
    """Append a node before sectPr when present."""
    if sect_pr is not None and sect_pr.parentNode is body:
        body.insertBefore(node, sect_pr)
        return
    body.appendChild(node)


def _set_document_title(doc: Document, title: str):
    """Populate the template cover page and core properties title."""
    _update_core_title(doc["docProps/core.xml"].dom, title)
    for xml_path in _iter_title_control_parts(doc):
        _update_content_controls(doc[xml_path].dom, {"Titolo": title})


def _update_core_title(dom, title: str):
    """Set dc:title in docProps/core.xml."""
    nodes = dom.getElementsByTagName("dc:title")
    if nodes:
        node = nodes[0]
        while node.firstChild:
            node.removeChild(node.firstChild)
        node.appendChild(dom.createTextNode(title))


def _update_content_controls(dom, mappings: Dict[str, str]):
    """Update content controls by alias in a minidom document."""
    for sdt in dom.getElementsByTagName("w:sdt"):
        aliases = sdt.getElementsByTagName("w:alias")
        if not aliases:
            continue

        alias = aliases[0].getAttribute("w:val")
        value = mappings.get(alias)
        if value:
            _set_content_control_text(dom, sdt, value)


def _set_content_control_text(dom, sdt, text: str):
    """Replace the first text node inside an sdt content block."""
    contents = sdt.getElementsByTagName("w:sdtContent")
    if not contents:
        return

    content = contents[0]
    text_nodes = content.getElementsByTagName("w:t")
    if text_nodes:
        node = text_nodes[0]
        while node.firstChild:
            node.removeChild(node.firstChild)
        node.appendChild(dom.createTextNode(text))
        return

    para = dom.createElement("w:p")
    run = dom.createElement("w:r")
    text_node = dom.createElement("w:t")
    text_node.appendChild(dom.createTextNode(text))
    run.appendChild(text_node)
    para.appendChild(run)
    content.appendChild(para)


def _iter_title_control_parts(doc: Document):
    """Yield XML parts that may contain a Titolo content control."""
    yield "word/document.xml"

    for pattern in ("header*.xml", "footer*.xml"):
        for path in sorted(doc.word_path.glob(pattern)):
            yield str(path.relative_to(doc.unpacked_path)).replace("\\", "/")
def main():
    parser = argparse.ArgumentParser(description="Create new AGIC-styled document")
    parser.add_argument("output", type=Path, help="Output DOCX file")
    parser.add_argument(
        "--title",
        default="",
        help="Document title written to the template cover page",
    )
    parser.add_argument(
        "--template",
        type=Path,
        default=Path(__file__).parent.parent / "assets" / "agic-template.docx",
        help="AGIC template DOCX"
    )
    
    args = parser.parse_args()
    
    if not args.template.exists():
        print(f"Error: Template not found: {args.template}", file=sys.stderr)
        sys.exit(1)
    
    try:
        create_agic_document(args.output, args.template, title=args.title)
        print(f"✓ Created {args.output}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
