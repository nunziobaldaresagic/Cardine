"""Analyze dominant colors per slide in a PPTX template.

Opens the PPTX as a ZIP archive, parses each slide XML, extracts
solidFill colors from background and shapes, then classifies each
slide into an AGIC color family.

Usage:
    uv run --with defusedxml python "scripts/analyze_colors.py" "assets/agic-template.pptx"
"""

import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

import defusedxml.ElementTree as ET

# AGIC theme color mappings (schemeClr val -> hex)
SCHEME_COLORS = {
    "accent1": "#4472C4",   # Primary blue
    "accent2": "#ED7D31",   # Orange accent
    "accent3": "#A9D18E",   # Light green
    "accent4": "#FFC000",   # Gold accent
    "accent5": "#5B9BD5",   # Blue variant
    "accent6": "#70AD47",   # Green
    "dk1": "#000000",       # Black
    "dk2": "#44546A",       # Dark blue-gray
    "lt1": "#FFFFFF",       # White
    "lt2": "#E7E6E6",       # Light gray
}

# Map hex -> color family name
HEX_TO_FAMILY = {
    "#4472C4": "Blue",
    "#ED7D31": "Orange",
    "#FFC000": "Gold",
    "#44546A": "DarkBlueGray",
    "#70AD47": "Green",
    "#A9D18E": "Green",
    "#5B9BD5": "Blue",
    "#025978": "Blue",   # AGIC dark teal — used in slides 13, 14
    "#0296CD": "Blue",   # AGIC cyan-blue
    "#013A4F": "Blue",   # AGIC deep teal
    "#00188F": "DarkBlueGray",   # Microsoft deep navy — gallery dark slides 21-24
    "#FFFFFF": "White",
    "#E7E6E6": "LightGray",
    "#000000": "Black",
}

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}


def classify_hex(hex_color: str) -> str:
    """Classify a hex color string into an AGIC color family using exact match then heuristics."""
    hex_color = hex_color.upper()
    if hex_color in HEX_TO_FAMILY:
        return HEX_TO_FAMILY[hex_color]

    raw = hex_color.lstrip("#")
    if len(raw) != 6:
        return "Other"

    r = int(raw[0:2], 16)
    g = int(raw[2:4], 16)
    b = int(raw[4:6], 16)

    # White / very light
    if r > 220 and g > 220 and b > 220:
        return "White"
    # Black / very dark
    if r < 40 and g < 40 and b < 40:
        return "Black"
    # Blue: dominant blue channel, moderate red
    if b > 120 and b > r and b > g and r > 30:
        return "Blue"
    # Orange: high red, moderate green, low blue
    if r > 170 and g > 80 and g < 180 and b < 80:
        return "Orange"
    # Gold: high red AND high green, low blue
    if r > 170 and g > 140 and b < 80:
        return "Gold"
    # Dark blue-gray: dark, slight blue tint
    if r < 100 and g < 100 and b < 140 and abs(r - g) < 25:
        return "DarkBlueGray"
    # Green
    if g > r and g > b and g > 100:
        return "Green"
    # Light gray
    if r > 180 and g > 180 and b > 180:
        return "LightGray"

    return "Other"


def colors_from_elem(elem) -> list[str]:
    """Extract all resolved hex colors (srgbClr + schemeClr) from an element subtree."""
    colors = []
    for node in elem.iter():
        tag_local = node.tag.split("}")[-1] if "}" in node.tag else node.tag
        if tag_local == "srgbClr":
            val = node.get("val", "")
            if val:
                colors.append(f"#{val.upper()}")
        elif tag_local == "schemeClr":
            val = node.get("val", "")
            if val in SCHEME_COLORS:
                colors.append(SCHEME_COLORS[val])
    return colors


def analyze_slide(xml_bytes: bytes) -> dict:
    """Return bg_colors and shape_colors lists for a slide."""
    root = ET.fromstring(xml_bytes)

    bg_colors: list[str] = []
    shape_colors: list[str] = []

    # Background element
    for bg in root.iter(f"{{{NS['p']}}}bg"):
        bg_colors += colors_from_elem(bg)

    # All solidFill elements across the slide (shapes, text, etc.)
    for sf in root.iter(f"{{{NS['a']}}}solidFill"):
        shape_colors += colors_from_elem(sf)

    return {"bg_colors": bg_colors, "shape_colors": shape_colors}


def dominant_family(all_colors: list[str]) -> str:
    """Return the most representative AGIC color family for a slide."""
    if not all_colors:
        return "White"

    families = [classify_hex(c) for c in all_colors]

    # Priority order: specific chromatic families first; ignore White/LightGray/Black/Other
    chromatic = [f for f in families if f not in ("White", "LightGray", "Black", "Other")]
    if chromatic:
        return Counter(chromatic).most_common(1)[0][0]

    # Fallback to any non-Other
    non_other = [f for f in families if f != "Other"]
    if non_other:
        return Counter(non_other).most_common(1)[0][0]

    return "Other"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python analyze_colors.py <template.pptx>")
        sys.exit(1)

    pptx_path = Path(sys.argv[1])
    if not pptx_path.exists():
        print(f"Error: {pptx_path} not found", file=sys.stderr)
        sys.exit(1)

    results: dict[int, dict] = {}

    with zipfile.ZipFile(pptx_path, "r") as z:
        slide_files = sorted(
            [n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
            key=lambda x: int(re.search(r"slide(\d+)\.xml", x).group(1)),
        )

        for slide_file in slide_files:
            slide_num = int(re.search(r"slide(\d+)\.xml", slide_file).group(1))
            info = analyze_slide(z.read(slide_file))
            all_colors = info["bg_colors"] + info["shape_colors"]
            family = dominant_family(all_colors)
            results[slide_num] = {
                "family": family,
                "bg_colors": info["bg_colors"][:4],
                "top_shape_colors": Counter(info["shape_colors"]).most_common(5),
            }

    # ── Per-slide table ──────────────────────────────────────────────────────
    print(f"\n{'Slide':<7} {'Family':<14} {'BG Colors':<44} {'Top Shape Colors'}")
    print("─" * 110)

    families_map: dict[str, list[int]] = {}
    for slide_num in sorted(results):
        info = results[slide_num]
        family = info["family"]
        bg = ", ".join(info["bg_colors"]) if info["bg_colors"] else "(none)"
        top = ", ".join(f"{c}×{n}" for c, n in info["top_shape_colors"])
        print(f"{slide_num:<7} {family:<14} {bg:<44} {top}")

        families_map.setdefault(family, []).append(slide_num)

    # ── Summary by family ────────────────────────────────────────────────────
    print("\n\n=== Summary by Color Family ===\n")
    family_order = ["Blue", "Orange", "Gold", "DarkBlueGray", "Green", "White", "LightGray", "Black", "Other"]
    for family in family_order:
        if family in families_map:
            slides = sorted(families_map[family])
            print(f"  {family:<14}: slides {slides}")
    # Any remaining families not in the standard order
    for family, slides in sorted(families_map.items()):
        if family not in family_order:
            print(f"  {family:<14}: slides {sorted(slides)}")

    print(f"\nTotal slides analyzed: {len(results)}")


if __name__ == "__main__":
    main()
