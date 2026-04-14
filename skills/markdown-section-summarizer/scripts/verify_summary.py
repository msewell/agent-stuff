#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from mdsum_core import load_json, verify_summary


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Verify markdown summary sentence counts against an inventory.")
    p.add_argument("source", type=Path, help="Source markdown file used to build inventory")
    p.add_argument("--inventory", type=Path, required=True, help="Inventory JSON path")
    p.add_argument("--summary", type=Path, required=True, help="Summary markdown path to verify")
    p.add_argument("--report", type=Path, default=None, help="Optional JSON report output path")
    return p.parse_args()


def main() -> int:
    args = parse_args()

    try:
        source_text = args.source.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"ERROR: source file not found: {args.source}")
        return 1
    except UnicodeDecodeError as exc:
        print(f"ERROR: source file is not valid UTF-8 markdown: {args.source} ({exc})")
        return 1
    except OSError as exc:
        print(f"ERROR: failed to read source file {args.source}: {exc}")
        return 1

    try:
        summary_text = args.summary.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"ERROR: summary file not found: {args.summary}")
        return 1
    except UnicodeDecodeError as exc:
        print(f"ERROR: summary file is not valid UTF-8 markdown: {args.summary} ({exc})")
        return 1
    except OSError as exc:
        print(f"ERROR: failed to read summary file {args.summary}: {exc}")
        return 1

    try:
        inventory = load_json(args.inventory)
    except ValueError as exc:
        print(f"ERROR: {exc}")
        return 1

    report = verify_summary(source_text=source_text, summary_text=summary_text, inventory=inventory)

    if args.report:
        try:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        except OSError as exc:
            print(f"ERROR: failed to write report file {args.report}: {exc}")
            return 1

    if report["ok"]:
        print("PASS: summary matches inventory targets.")
        return 0

    print("FAIL: summary does not match inventory targets.")
    for err in report["errors"]:
        print(f"- {err}")

    for sec in report["section_results"]:
        if sec.get("ok", False):
            continue
        sid = sec.get("id", "?")
        heading = sec.get("heading") or ""
        print(f"- Section {sid} {heading!r}:")
        for e in sec.get("errors", []):
            print(f"    * {e}")

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
