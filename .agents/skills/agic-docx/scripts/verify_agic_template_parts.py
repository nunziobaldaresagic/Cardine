#!/usr/bin/env python3
"""Verify an output DOCX preserves AGIC template style parts.

This compares selected OOXML parts byte-for-byte between:
- a template .docx (reference)
- a generated/edited .docx (candidate)

Exit codes:
- 0: all checked parts match
- 1: at least one part differs or is missing
- 2: usage / input errors
"""

from __future__ import annotations

import argparse
import hashlib
import sys
import zipfile


DEFAULT_PARTS = [
    "word/styles.xml",
    "word/stylesWithEffects.xml",
    "word/numbering.xml",
    "word/fontTable.xml",
    "word/theme/theme1.xml",
]

STRICT_EXTRA_PARTS = [
    "word/settings.xml",
    "word/webSettings.xml",
    "word/endnotes.xml",
    "word/footnotes.xml",
]


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _read_part(z: zipfile.ZipFile, part: str) -> bytes | None:
    try:
        return z.read(part)
    except KeyError:
        return None


def verify(template_path: str, doc_path: str, *, strict: bool) -> int:
    parts = list(DEFAULT_PARTS)
    if strict:
        parts.extend(STRICT_EXTRA_PARTS)

    ok = True
    with zipfile.ZipFile(template_path, "r") as zt, zipfile.ZipFile(doc_path, "r") as zd:
        for part in parts:
            t = _read_part(zt, part)
            d = _read_part(zd, part)

            # If template doesn't have it, don't enforce it.
            if t is None:
                continue

            if d is None:
                print(f"MISSING: {part}")
                ok = False
                continue

            ht = _sha256(t)
            hd = _sha256(d)
            if ht != hd:
                print(f"DIFF: {part} template={ht[:12]} doc={hd[:12]}")
                ok = False

    if ok:
        print("OK: template style parts preserved")
        return 0
    return 1


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description="Verify DOCX preserves template style parts")
    ap.add_argument("--template", required=True, help="Path to AGIC template .docx")
    ap.add_argument("--doc", required=True, help="Path to output .docx")
    ap.add_argument("--strict", action="store_true", help="Compare a broader set of parts")
    args = ap.parse_args(argv[1:])

    try:
        return verify(args.template, args.doc, strict=args.strict)
    except zipfile.BadZipFile as e:
        print(f"ERROR: not a valid .docx/.zip: {e}", file=sys.stderr)
        return 2
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
