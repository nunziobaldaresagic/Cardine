#!/usr/bin/env python3
"""List paragraph/character/table styles in a .docx template.

Outputs JSON to stdout with: styleId, type, name, basedOn, next, default.
"""

from __future__ import annotations

import json
import sys
import zipfile
from xml.etree import ElementTree as ET


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def _w(elem: ET.Element, path: str):
    return elem.find(path, NS)


def _w_attr(elem: ET.Element | None, attr: str) -> str | None:
    if elem is None:
        return None
    return elem.get(f"{{{NS['w']}}}{attr}")


def list_styles(docx_path: str) -> list[dict]:
    with zipfile.ZipFile(docx_path, "r") as z:
        try:
            raw = z.read("word/styles.xml")
        except KeyError:
            raise SystemExit(f"Missing word/styles.xml in: {docx_path}")

    root = ET.fromstring(raw)
    out: list[dict] = []
    for style in root.findall("w:style", NS):
        style_id = _w_attr(style, "styleId")
        style_type = _w_attr(style, "type")
        name = _w_attr(_w(style, "w:name"), "val")
        based_on = _w_attr(_w(style, "w:basedOn"), "val")
        next_style = _w_attr(_w(style, "w:next"), "val")
        default = _w_attr(style, "default")
        out.append(
            {
                "styleId": style_id,
                "type": style_type,
                "name": name,
                "basedOn": based_on,
                "next": next_style,
                "default": default,
            }
        )

    out.sort(key=lambda d: (d.get("type") or "", d.get("name") or "", d.get("styleId") or ""))
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(f"Usage: {argv[0]} <template.docx>", file=sys.stderr)
        return 2

    styles = list_styles(argv[1])
    json.dump(styles, sys.stdout, indent=2, ensure_ascii=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
