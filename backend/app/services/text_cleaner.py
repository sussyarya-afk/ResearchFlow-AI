"""
text_cleaner.py — Normalize raw text extracted from PDFs by PyMuPDF.

Pure-function utility with no external dependencies beyond Python stdlib.
"""

import re
import unicodedata
from typing import List


# ── Page marker patterns ───────────────────────────────────────────────────────
# Matches common PDF page number/header artifacts:
#   "Page | 32"  "Page|32"  "32 | Page"  "| 32 |"  "Page 32"  "P a g e | 3 2"
_PAGE_MARKER_PATTERNS = [
    re.compile(r'(?i)page\s*\|\s*\d+'),          # "Page | 32"
    re.compile(r'(?i)\|\s*page\s*\d*'),           # "| Page 32"
    re.compile(r'(?i)page\s+\d+\s*$', re.M),     # "Page 32" at end of line
    re.compile(r'(?i)^\s*\d+\s*\|\s*page', re.M),# "32 | Page"
    re.compile(r'(?i)^\s*-\s*\d+\s*-\s*$', re.M),# "- 32 -"
    re.compile(r'(?i)^\s*\[\s*\d+\s*\]\s*$', re.M),# "[32]"
]

# Minimum characters a line must have to be preserved (filters lone numbers,
# decorative separators, and near-empty lines that are just PDF artifacts).
_MIN_LINE_LENGTH = 3


def _strip_page_markers(text: str) -> str:
    """Remove common PDF page number marker patterns from text."""
    for pattern in _PAGE_MARKER_PATTERNS:
        text = pattern.sub('', text)
    return text


def _strip_repeated_short_lines(lines: List[str]) -> List[str]:
    """
    Identify lines that appear repeatedly across the document (likely
    headers/footers) and remove them.  Only removes lines that are short
    (<=80 chars) and appear more than twice, to avoid removing real content.
    """
    from collections import Counter
    # Count occurrences of stripped versions of short lines
    line_counts: Counter = Counter()
    for line in lines:
        stripped = line.strip()
        if 0 < len(stripped) <= 80:
            line_counts[stripped] += 1

    # Build a set of repeated lines to remove (appears 3+ times)
    repeated = {line for line, count in line_counts.items() if count >= 3}
    if not repeated:
        return lines

    return [line for line in lines if line.strip() not in repeated]


def clean_text(raw: str) -> str:
    """
    Normalize raw PyMuPDF text output into clean, paragraph-separated text.

    Steps:
      1. Normalize Unicode (NFKC) — ligatures (ﬁ→fi), smart quotes, etc.
      2. Remove NULL bytes and control characters (except newlines/tabs).
      3. Fix hyphenated line breaks (e.g. "quan-\\ntum" → "quantum").
      4. Strip PDF page marker artifacts (e.g. "Page | 32").
      5. Collapse runs of whitespace within lines to single spaces.
      6. Strip trailing whitespace per line.
      7. Remove lines that are purely numeric or only punctuation/symbols.
      8. Normalize multiple blank lines into paragraph breaks (\\n\\n).
      9. Strip leading/trailing whitespace from entire result.
    """
    if not raw:
        return ""

    # 1. Unicode normalization (NFKC)
    text = unicodedata.normalize("NFKC", raw)

    # 2. Remove NULL bytes and control characters (keep \n, \r, \t)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # 3. Fix hyphenated line breaks: "word-\n" → "word"
    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)

    # 4. Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # 4b. Strip PDF page marker artifacts
    text = _strip_page_markers(text)

    # 5. Process line by line
    lines = []
    for line in text.split("\n"):
        # Collapse tabs and multiple spaces to single space
        line = re.sub(r"[ \t]+", " ", line)
        line = line.rstrip()

        # Skip lines that are purely numeric (page numbers, section numbers)
        stripped = line.strip()
        if stripped and re.match(r'^[\d\s\.\-–—|]+$', stripped):
            continue

        lines.append(line)

    # 6. Remove repeated short lines (headers/footers)
    lines = _strip_repeated_short_lines(lines)

    text = "\n".join(lines)

    # 7. Collapse 3+ consecutive newlines into paragraph break (\n\n)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 8. Final trim
    return text.strip()


def is_content_empty(text: str) -> bool:
    """
    Returns True if the text has no meaningful content.

    Detects scanned/image-only PDFs that yield empty or whitespace/punctuation-only
    text after extraction.
    """
    if not text:
        return True

    # Strip all whitespace and common punctuation
    stripped = re.sub(r"[\s\.\,\;\:\!\?\-\—\–\'\"\(\)\[\]\{\}\/\\]+", "", text)
    # If fewer than 20 meaningful characters remain, consider it empty
    return len(stripped) < 20
