"""Find placeholder text in PPTX slides.

Searches for common placeholder patterns in slide XML files.
Accepts either a packed .pptx file or an unpacked directory.

Usage:
    python find_placeholders.py output.pptx
    python find_placeholders.py unpacked/

Patterns searched (case-insensitive):
    xxxx, lorem, ipsum, qui, here, testo, placeholder, [testo], [here]
"""

import re
import sys
import zipfile
from pathlib import Path

PATTERNS = [
    r"\bxxxx+\b",
    r"\blorem\b",
    r"\bipsum\b",
    r"\bqui\b",
    r"\bhere\b",
    r"\btesto\b",
    r"\bplaceholder\b",
    r"\[testo\]",
    r"\[here\]",
]

COMBINED = re.compile("|".join(PATTERNS), re.IGNORECASE)

SLIDE_RE = re.compile(r"ppt/slides/slide\d+\.xml$")


def extract_text_runs(xml_bytes: bytes) -> list[str]:
    """Extract plain text from <a:t> elements in slide XML."""
    return re.findall(r"<a:t[^>]*>([^<]+)</a:t>", xml_bytes.decode("utf-8", errors="replace"))


def find_in_pptx(pptx_path: Path) -> dict[str, list[str]]:
    results: dict[str, list[str]] = {}
    with zipfile.ZipFile(pptx_path, "r") as zf:
        slide_files = [n for n in zf.namelist() if SLIDE_RE.match(n)]
        for slide_file in sorted(slide_files, key=lambda x: int(re.search(r"slide(\d+)", x).group(1))):
            xml_bytes = zf.read(slide_file)
            hits = _scan(xml_bytes, slide_file)
            if hits:
                results[slide_file] = hits
    return results


def find_in_dir(unpacked_dir: Path) -> dict[str, list[str]]:
    results: dict[str, list[str]] = {}
    slides_dir = unpacked_dir / "ppt" / "slides"
    if not slides_dir.exists():
        return results
    for slide_file in sorted(slides_dir.glob("slide*.xml"),
                             key=lambda p: int(re.search(r"slide(\d+)", p.name).group(1))):
        xml_bytes = slide_file.read_bytes()
        hits = _scan(xml_bytes, str(slide_file.relative_to(unpacked_dir)))
        if hits:
            results[str(slide_file.name)] = hits
    return results


def _scan(xml_bytes: bytes, label: str) -> list[str]:
    texts = extract_text_runs(xml_bytes)
    hits = []
    for text in texts:
        if COMBINED.search(text):
            hits.append(text.strip())
    return hits


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python find_placeholders.py <file.pptx | unpacked_dir/>", file=sys.stderr)
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_file() and target.suffix.lower() == ".pptx":
        results = find_in_pptx(target)
    elif target.is_dir():
        results = find_in_dir(target)
    else:
        print(f"Error: {target} must be a .pptx file or unpacked directory", file=sys.stderr)
        sys.exit(1)

    if not results:
        print("✅ No placeholder text found.")
        return

    total = sum(len(v) for v in results.values())
    print(f"⚠️  Found {total} placeholder(s) in {len(results)} slide(s):\n")
    for slide, hits in results.items():
        print(f"  {slide}:")
        for hit in hits:
            print(f"    → \"{hit}\"")


if __name__ == "__main__":
    main()