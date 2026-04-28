from __future__ import annotations

import hashlib
import json
import math
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from markdown_it import MarkdownIt
import pysbd

PREAMBLE_ID = "_preamble"
SCHEMA_VERSION = "1.0"

# Matches YAML frontmatter at the very start of a file: ---\n...\n---\n
_FRONTMATTER_RE = re.compile(r'\A---[ \t]*\n.*?\n(?:---|\.\.\.)[ \t]*(?:\n|$)', re.DOTALL)

# Matches inline image embeds: ![alt text](path "optional title")
_IMAGE_RE = re.compile(r'!\[[^\]]*\]\([^)]*\)')


def strip_frontmatter(text: str) -> str:
    """Replace YAML frontmatter with blank lines to preserve source line numbers."""
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return text
    matched = m.group(0)
    return '\n' * matched.count('\n') + text[m.end():]


def _extract_images(text: str) -> tuple[str, list[str]]:
    """Strip image markdown from text, returning (cleaned_text, list_of_image_strings)."""
    images = _IMAGE_RE.findall(text)
    clean = _IMAGE_RE.sub('', text).strip()
    return clean, images


@dataclass
class Section:
    id: str
    order: int
    level: int | None
    heading: str | None
    text_parts: list[str] = field(default_factory=list)
    images: list[str] = field(default_factory=list)
    start_line: int = 1   # 1-indexed line in source file
    end_line: int | None = None  # 1-indexed, inclusive; set after full parse

    @property
    def text(self) -> str:
        return "\n".join(self.text_parts).strip()


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _normalize_inline_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _pop_last(stack: list[str], token_type: str) -> None:
    for i in range(len(stack) - 1, -1, -1):
        if stack[i] == token_type:
            del stack[i]
            return


def parse_markdown_sections(markdown_text: str) -> list[Section]:
    """Parse markdown into direct-body sections.

    Content is assigned to the nearest active heading section.
    Content before the first heading is assigned to PREAMBLE_ID.
    YAML frontmatter is stripped before parsing (replaced with blank lines
    to preserve source line numbers). Image embeds are extracted from prose
    and stored separately; they do not contribute to sentence counts.
    """
    markdown_text = strip_frontmatter(markdown_text)
    md = MarkdownIt("commonmark")
    tokens = md.parse(markdown_text)
    total_lines = len(markdown_text.splitlines())

    sections: list[Section] = [
        Section(id=PREAMBLE_ID, order=0, level=None, heading=None, start_line=1)
    ]
    by_id: dict[str, Section] = {PREAMBLE_ID: sections[0]}

    heading_stack: list[tuple[int, str]] = []  # (level, id)
    heading_counters = [0] * 7  # 1..6 used

    open_stack: list[str] = []

    for i, tok in enumerate(tokens):
        if tok.nesting == 1:
            open_stack.append(tok.type)
        elif tok.nesting == -1:
            open_type = tok.type.replace("_close", "_open")
            _pop_last(open_stack, open_type)

        if tok.type == "heading_open":
            level = int(tok.tag[1]) if tok.tag.startswith("h") else 1
            heading_text = ""
            if i + 1 < len(tokens) and tokens[i + 1].type == "inline":
                heading_text = tokens[i + 1].content.strip()

            while heading_stack and heading_stack[-1][0] >= level:
                heading_stack.pop()

            heading_counters[level] += 1
            for deeper in range(level + 1, 7):
                heading_counters[deeper] = 0

            section_id = ".".join(str(heading_counters[j]) for j in range(1, level + 1))
            start_line = (tok.map[0] + 1) if tok.map else 1
            section = Section(
                id=section_id,
                order=len(sections),
                level=level,
                heading=heading_text,
                start_line=start_line,
            )
            sections.append(section)
            by_id[section_id] = section
            heading_stack.append((level, section_id))
            continue

        if tok.type != "inline":
            continue

        if "heading_open" in open_stack:
            continue

        includable_contexts = {"paragraph_open", "list_item_open", "blockquote_open"}
        if not any(ctx in open_stack for ctx in includable_contexts):
            continue

        current_id = heading_stack[-1][1] if heading_stack else PREAMBLE_ID
        raw = _normalize_inline_text(tok.content)
        clean_text, images = _extract_images(raw)
        if images:
            by_id[current_id].images.extend(images)
        if clean_text:
            by_id[current_id].text_parts.append(clean_text)

    # Compute end lines: each section ends on the line before the next one begins.
    for i, sec in enumerate(sections):
        if i + 1 < len(sections):
            sec.end_line = sections[i + 1].start_line - 1
        else:
            sec.end_line = total_lines

    return sections


def make_sentence_segmenter(language: str = "en") -> pysbd.Segmenter:
    return pysbd.Segmenter(language=language, clean=False, char_span=False)


def split_sentences(text: str, *, segmenter: pysbd.Segmenter | None = None) -> list[str]:
    if not text.strip():
        return []
    seg = segmenter or make_sentence_segmenter("en")
    out: list[str] = []
    for s in seg.segment(text):
        normalized = re.sub(r"\s+", " ", s).strip()
        if normalized:
            out.append(normalized)
    return out


def target_sentence_count(n_source_sentences: int) -> int:
    return int(math.floor(math.sqrt(max(0, n_source_sentences))))


def build_inventory(markdown_text: str, *, source_file: str | None = None, language: str = "en") -> dict[str, Any]:
    sections = parse_markdown_sections(markdown_text)
    segmenter = make_sentence_segmenter(language)

    inv_sections = []
    for sec in sections:
        n = len(split_sentences(sec.text, segmenter=segmenter))
        inv_sections.append(
            {
                "id": sec.id,
                "order": sec.order,
                "level": sec.level,
                "heading": sec.heading,
                "start_line": sec.start_line,
                "end_line": sec.end_line,
                "source_sentence_count": n,
                "target_summary_sentences": target_sentence_count(n),
                "images": sec.images,
            }
        )

    return {
        "schema_version": SCHEMA_VERSION,
        "generated_at_utc": utc_now_iso(),
        "source_file": source_file,
        "source_sha256": sha256_text(markdown_text),
        "settings": {
            "sentence_counter": f"pysbd/{language}",
            "language": language,
            "section_mode": "direct-body",
            "counted_block_types": ["paragraph", "list_item", "blockquote"],
            "ignored_block_types": ["code_block", "fence", "table"],
            "formula": "floor(sqrt(n))",
        },
        "sections": inv_sections,
    }


def write_json(path: Path, obj: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_json(path: Path) -> dict[str, Any]:
    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise ValueError(f"Inventory file not found: {path}") from exc
    except OSError as exc:
        raise ValueError(f"Failed to read inventory file {path}: {exc}") from exc

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid inventory JSON in {path}: {exc}") from exc

    if not isinstance(data, dict):
        raise ValueError(f"Invalid inventory format in {path}: expected JSON object at top level.")

    return data


def sections_to_index(sections: list[Section]) -> dict[str, Section]:
    return {s.id: s for s in sections}


def validate_inventory_against_source(inventory: dict[str, Any], source_text: str) -> list[str]:
    errors: list[str] = []
    if inventory.get("schema_version") != SCHEMA_VERSION:
        errors.append(
            f"Unsupported schema_version: {inventory.get('schema_version')} (expected {SCHEMA_VERSION})"
        )

    expected_hash = sha256_text(source_text)
    if inventory.get("source_sha256") != expected_hash:
        errors.append("Inventory source hash does not match current source file content.")

    source_sections = parse_markdown_sections(source_text)
    source_inv_like = [
        {
            "id": s.id,
            "order": s.order,
            "level": s.level,
            "heading": s.heading,
        }
        for s in source_sections
    ]

    inv_sections = inventory.get("sections", [])
    inv_shape = [
        {
            "id": s.get("id"),
            "order": s.get("order"),
            "level": s.get("level"),
            "heading": s.get("heading"),
        }
        for s in inv_sections
    ]

    if source_inv_like != inv_shape:
        errors.append("Inventory section structure does not match source section structure.")

    return errors


def verify_summary(
    *,
    source_text: str,
    summary_text: str,
    inventory: dict[str, Any],
) -> dict[str, Any]:
    report: dict[str, Any] = {
        "ok": True,
        "errors": [],
        "section_results": [],
    }

    inv_errors = validate_inventory_against_source(inventory, source_text)
    if inv_errors:
        report["ok"] = False
        report["errors"].extend(inv_errors)
        return report

    summary_sections = parse_markdown_sections(summary_text)
    summary_by_id = sections_to_index(summary_sections)

    inv_sections = sorted(inventory["sections"], key=lambda s: s["order"])
    summary_ids = [s.id for s in summary_sections]
    inv_ids = [s["id"] for s in inv_sections]

    if summary_ids != inv_ids:
        report["ok"] = False
        report["errors"].append("Summary section IDs/order do not match inventory.")

    language = inventory.get("settings", {}).get("language", "en")
    seg = make_sentence_segmenter(language)

    for inv in inv_sections:
        sid = inv["id"]
        expected_level = inv["level"]
        expected_heading = inv["heading"]
        expected_target = inv["target_summary_sentences"]

        if sid not in summary_by_id:
            report["ok"] = False
            report["section_results"].append(
                {
                    "id": sid,
                    "ok": False,
                    "error": "Missing section in summary.",
                }
            )
            continue

        sec = summary_by_id[sid]
        sec_errors: list[str] = []

        if sec.level != expected_level:
            sec_errors.append(f"Heading level mismatch: expected {expected_level}, got {sec.level}")
        if sec.heading != expected_heading:
            sec_errors.append("Heading text mismatch.")

        actual_count = len(split_sentences(sec.text, segmenter=seg))
        if actual_count != expected_target:
            sec_errors.append(
                f"Sentence count mismatch: expected {expected_target}, got {actual_count}"
            )

        ok = not sec_errors
        if not ok:
            report["ok"] = False

        report["section_results"].append(
            {
                "id": sid,
                "level": sec.level,
                "heading": sec.heading,
                "expected_sentences": expected_target,
                "actual_sentences": actual_count,
                "ok": ok,
                "errors": sec_errors,
            }
        )

    return report


