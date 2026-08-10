"""
text_cleaner.py — Normalize raw text extracted from PDFs by PyMuPDF.

Pure-function utility with no external dependencies beyond Python stdlib.
"""

import re
import unicodedata


def clean_text(raw: str) -> str:
    """
    Normalize raw PyMuPDF text output into clean, paragraph-separated text.

    Steps:
      1. Normalize Unicode (NFKC) — ligatures (ﬁ→fi), smart quotes, etc.
      2. Remove NULL bytes and control characters (except newlines/tabs).
      3. Fix hyphenated line breaks (e.g. "quan-\\ntum" → "quantum").
      4. Collapse runs of whitespace within lines to single spaces.
      5. Strip trailing whitespace per line.
      6. Normalize multiple blank lines into paragraph breaks (\\n\\n).
      7. Strip leading/trailing whitespace from entire result.
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

    # 5. Process line by line: collapse internal whitespace, strip trailing
    lines = []
    for line in text.split("\n"):
        # Collapse tabs and multiple spaces to single space
        line = re.sub(r"[ \t]+", " ", line)
        lines.append(line.rstrip())

    text = "\n".join(lines)

    # 6. Collapse 3+ consecutive newlines into paragraph break (\n\n)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 7. Final trim
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
