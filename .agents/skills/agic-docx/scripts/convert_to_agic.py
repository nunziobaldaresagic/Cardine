#!/usr/bin/env python3
"""Convert non-AGIC Word documents to AGIC styling.

Remaps styles from generic Word documents to AGIC template styles, preserving
content while applying proper AGIC formatting.

Usage:
    python convert_to_agic.py input.docx output.docx
    python convert_to_agic.py input.docx output.docx --template agic-template.docx

Part of the agic-docx skill.
"""

import argparse
import shutil
import sys
import tempfile
from pathlib import Path

from document import Document
from style_mapper import AGICStyleMapper


# Map common Word styles to AGIC equivalents
STYLE_CONVERSION_MAP = {
    "Heading1": "AGICTitoloParagrafo",
    "Heading2": "AGICTitolo2",
    "Heading3": "AGICTitolo2",
    "Heading4": "AGICTitolo2",
    "Heading5": "AGICTitolo2",
    "Heading6": "AGICTitolo2",
    "Normal": "AGICcorpo",
    "BodyText": "AGICcorpo",
    "ListParagraph": "AMElencopuntato",
}


def convert_to_agic(
    input_path: Path,
    output_path: Path,
    template_path: Path
):
    """Convert document to AGIC styling.
    
    Args:
        input_path: Path to input DOCX file
        output_path: Path to output DOCX file
        template_path: Path to AGIC template DOCX
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        input_unpacked = Path(temp_dir) / "input"
        template_unpacked = Path(temp_dir) / "template"
        
        # Unpack both documents
        shutil.unpack_archive(str(input_path), str(input_unpacked), "zip")
        shutil.unpack_archive(str(template_path), str(template_unpacked), "zip")
        
        # Load input document
        input_doc = Document(str(input_unpacked))
        input_xml = input_doc["word/document.xml"]
        
        # Copy template style parts to input
        template_files = [
            "word/styles.xml",
            "word/numbering.xml",
            "word/fontTable.xml",
            "word/theme/theme1.xml",
        ]
        
        for file in template_files:
            src = template_unpacked / file
            dst = input_unpacked / file
            if src.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
        
        # Remap paragraph styles in document.xml
        paragraphs = input_xml.dom.getElementsByTagName("w:p")
        
        for para in paragraphs:
            # Find pStyle element
            pPr = None
            for child in para.childNodes:
                if child.nodeType == child.ELEMENT_NODE and child.tagName == "w:pPr":
                    pPr = child
                    break
            
            if pPr:
                for child in pPr.childNodes:
                    if child.nodeType == child.ELEMENT_NODE and child.tagName == "w:pStyle":
                        old_style = child.getAttribute("w:val")
                        new_style = STYLE_CONVERSION_MAP.get(old_style)
                        
                        if new_style:
                            child.setAttribute("w:val", new_style)
        
        # Save modified document
        input_doc.save()
        
        # Pack to output
        shutil.make_archive(str(output_path.with_suffix("")), "zip", input_unpacked)
        shutil.move(str(output_path.with_suffix(".zip")), str(output_path))


def main():
    parser = argparse.ArgumentParser(description="Convert document to AGIC styling")
    parser.add_argument("input", type=Path, help="Input DOCX file")
    parser.add_argument("output", type=Path, help="Output DOCX file")
    parser.add_argument(
        "--template",
        type=Path,
        default=Path(__file__).parent.parent / "assets" / "agic-template.docx",
        help="AGIC template DOCX"
    )
    
    args = parser.parse_args()
    
    if not args.input.exists():
        print(f"Error: Input not found: {args.input}", file=sys.stderr)
        sys.exit(1)
    
    if not args.template.exists():
        print(f"Error: Template not found: {args.template}", file=sys.stderr)
        sys.exit(1)
    
    try:
        convert_to_agic(args.input, args.output, args.template)
        print(f"✓ Converted {args.input} → {args.output}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
