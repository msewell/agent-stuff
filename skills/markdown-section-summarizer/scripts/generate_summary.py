#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description=(
            "Generate a summary file from an inventory JSON. "
            "Each section heading is followed by any preserved image embeds, "
            "then a comment block showing the source sentence count, target "
            "sentence count, and line range in the original file. "
            "Fill in the summary by writing the required number of sentences "
            "after each comment block."
        )
    )
    p.add_argument("inventory", type=Path, help="Inventory JSON produced by build_inventory.py")
    p.add_argument("-o", "--output", type=Path, required=True, help="Output summary Markdown path")
    return p.parse_args()


def _comment(source_n: int, target_n: int, start: int | None, end: int | None) -> str:
    line_range = f"lines {start}–{end}" if start is not None and end is not None else "lines unknown"
    if target_n == 0:
        return f"<!-- source: {source_n} sentences ({line_range}) | target: 0 sentences — leave empty -->"
    return f"<!-- source: {source_n} sentences ({line_range}) | target: {target_n} sentences -->"


def main() -> int:
    args = parse_args()

    try:
        raw = args.inventory.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"ERROR: inventory file not found: {args.inventory}")
        return 1
    except OSError as exc:
        print(f"ERROR: failed to read inventory: {exc}")
        return 1

    try:
        inventory = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid inventory JSON: {exc}")
        return 1

    sections = sorted(inventory.get("sections", []), key=lambda s: s["order"])
    language = inventory.get("settings", {}).get("language", "en")

    lines: list[str] = []
    content_sections = 0
    nonempty_sections = 0

    for sec in sections:
        sid = sec["id"]
        level = sec["level"]
        heading = sec["heading"]
        source_n = sec["source_sentence_count"]
        target_n = sec["target_summary_sentences"]
        start_line = sec.get("start_line")
        end_line = sec.get("end_line")
        images = sec.get("images", [])

        if sid == "_preamble":
            if target_n > 0:
                lines.append(_comment(source_n, target_n, start_line, end_line))
                for img in images:
                    lines.append(img)
                lines.append("")
                nonempty_sections += 1
            elif images:
                for img in images:
                    lines.append(img)
                lines.append("")
            continue

        hashes = "#" * level
        lines.append(f"{hashes} {heading}")
        lines.append(_comment(source_n, target_n, start_line, end_line))
        for img in images:
            lines.append(img)
        lines.append("")
        content_sections += 1
        if target_n > 0:
            nonempty_sections += 1

    output_text = "\n".join(lines).rstrip("\n") + "\n"

    try:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output_text, encoding="utf-8")
    except OSError as exc:
        print(f"ERROR: failed to write summary: {exc}")
        return 1

    print(f"Wrote summary: {args.output}")
    print(f"Language: {language} | Sections: {content_sections} headings, {nonempty_sections} with content targets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
