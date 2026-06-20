"""Markdown parser for AGIC DOCX conversion.

Parses a subset of Markdown commonly used in technical documents:
- Headings (H1-H6) with optional {#anchor} syntax
- Paragraphs with inline formatting (bold, code, links)
- Lists (bullet and ordered)
- Tables
- Code blocks (including ```mermaid)
- Horizontal rules

Part of the agic-docx skill.
"""

import re
from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class HeadingBlock:
    """Markdown heading (H1-H6)."""
    level: int  # 1-6
    text: str


@dataclass(frozen=True)
class ParagraphBlock:
    """Paragraph with inline formatting."""
    lines: List[str]


@dataclass(frozen=True)
class ListBlock:
    """Bullet or ordered list."""
    ordered: bool
    items: List[str]


@dataclass(frozen=True)
class TableBlock:
    """Markdown table."""
    header: List[str]
    rows: List[List[str]]


@dataclass(frozen=True)
class CodeBlock:
    """Fenced code block."""
    lang: str
    content: str


@dataclass(frozen=True)
class HrBlock:
    """Horizontal rule."""
    pass


Block = HeadingBlock | ParagraphBlock | ListBlock | TableBlock | CodeBlock | HrBlock


# Regex patterns
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
_LIST_UL_RE = re.compile(r"^\s*[-*]\s+(.*)$")
_LIST_OL_RE = re.compile(r"^\s*(\d+)\.\s+(.*)$")
_CODE_FENCE_RE = re.compile(r"^\s*```\s*([A-Za-z0-9_-]*)\s*$")
_HR_RE = re.compile(r"^\s*---+\s*$")
_TABLE_SEP_RE = re.compile(r"^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$")


def _strip_anchor(text: str) -> str:
    """Strip {#anchor} from heading text."""
    return re.sub(r"\s*\{#[-_A-Za-z0-9]+\}\s*$", "", text).strip()


def _parse_table_row(line: str) -> List[str]:
    """Parse a single table row."""
    raw = line.strip().strip("|")
    cells = [c.strip() for c in raw.split("|")]
    return cells


def parse_markdown(md: str) -> List[Block]:
    """Parse markdown text into structured blocks.
    
    Args:
        md: Markdown source text
    
    Returns:
        List of parsed blocks
    """
    lines = md.splitlines()
    i = 0
    blocks: List[Block] = []
    
    def at_end() -> bool:
        return i >= len(lines)
    
    def peek() -> str:
        return lines[i]
    
    while not at_end():
        line = peek()
        
        # Skip blank lines
        if not line.strip():
            i += 1
            continue
        
        # Code fence
        m = _CODE_FENCE_RE.match(line)
        if m:
            lang = (m.group(1) or "").strip().lower()
            i += 1
            code_lines: List[str] = []
            while not at_end() and not _CODE_FENCE_RE.match(peek()):
                code_lines.append(peek())
                i += 1
            # Consume closing fence if present
            if not at_end() and _CODE_FENCE_RE.match(peek()):
                i += 1
            blocks.append(CodeBlock(lang=lang, content="\n".join(code_lines)))
            continue
        
        # Heading
        m = _HEADING_RE.match(line)
        if m:
            level = len(m.group(1))
            text = _strip_anchor(m.group(2))
            blocks.append(HeadingBlock(level=level, text=text))
            i += 1
            continue
        
        # Horizontal rule
        if _HR_RE.match(line):
            blocks.append(HrBlock())
            i += 1
            continue
        
        # Table (header + separator)
        if "|" in line:
            # Lookahead for separator
            if i + 1 < len(lines) and _TABLE_SEP_RE.match(lines[i + 1]):
                header = _parse_table_row(line)
                i += 2  # Consume header + sep
                rows: List[List[str]] = []
                while not at_end() and lines[i].strip() and "|" in lines[i]:
                    rows.append(_parse_table_row(lines[i]))
                    i += 1
                blocks.append(TableBlock(header=header, rows=rows))
                continue
        
        # Lists
        m_ul = _LIST_UL_RE.match(line)
        m_ol = _LIST_OL_RE.match(line)
        if m_ul or m_ol:
            ordered = bool(m_ol)
            items: List[str] = []
            while not at_end():
                l = peek()
                mm_ul = _LIST_UL_RE.match(l)
                mm_ol = _LIST_OL_RE.match(l)
                if ordered:
                    if not mm_ol:
                        break
                    items.append(mm_ol.group(2).strip())
                else:
                    if not mm_ul:
                        break
                    items.append(mm_ul.group(1).strip())
                i += 1
            blocks.append(ListBlock(ordered=ordered, items=items))
            continue
        
        # Paragraph: consume until blank line or new block start
        para_lines: List[str] = []
        while not at_end():
            l = peek()
            if not l.strip():
                break
            if _CODE_FENCE_RE.match(l) or _HEADING_RE.match(l) or _HR_RE.match(l):
                break
            if _LIST_UL_RE.match(l) or _LIST_OL_RE.match(l):
                break
            # Stop if table starts
            if "|" in l and i + 1 < len(lines) and _TABLE_SEP_RE.match(lines[i + 1]):
                break
            para_lines.append(l.rstrip("\n"))
            i += 1
        blocks.append(ParagraphBlock(lines=para_lines))
    
    return blocks
