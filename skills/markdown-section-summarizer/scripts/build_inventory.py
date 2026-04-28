#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

import pysbd.languages as _pysbd_langs

from mdsum_core import build_inventory, write_json

SUPPORTED_LANGUAGES = sorted(_pysbd_langs.LANGUAGE_CODES.keys())


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Build per-section sentence inventory from a markdown file.")
    p.add_argument("input", type=Path, help="Input markdown file")
    p.add_argument("-o", "--output", type=Path, required=True, help="Output inventory JSON path")
    p.add_argument(
        "--language",
        required=True,
        choices=SUPPORTED_LANGUAGES,
        metavar="LANG",
        help=(
            "pysbd language code for sentence segmentation. "
            f"Supported: {', '.join(SUPPORTED_LANGUAGES)}"
        ),
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()

    try:
        source_text = args.input.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"ERROR: input file not found: {args.input}")
        return 1
    except UnicodeDecodeError as exc:
        print(f"ERROR: input file is not valid UTF-8 markdown: {args.input} ({exc})")
        return 1
    except OSError as exc:
        print(f"ERROR: failed to read input file {args.input}: {exc}")
        return 1

    inventory = build_inventory(source_text, source_file=str(args.input.resolve()), language=args.language)

    try:
        write_json(args.output, inventory)
    except OSError as exc:
        print(f"ERROR: failed to write inventory file {args.output}: {exc}")
        return 1

    print(f"Wrote inventory: {args.output}")
    print()
    print("Section inventory:")
    print("id\tlevel\tsource_sentences\ttarget_summary_sentences\theading")
    for sec in sorted(inventory["sections"], key=lambda s: s["order"]):
        print(
            f"{sec['id']}\t{sec['level']}\t{sec['source_sentence_count']}\t"
            f"{sec['target_summary_sentences']}\t{sec['heading'] or ''}"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
