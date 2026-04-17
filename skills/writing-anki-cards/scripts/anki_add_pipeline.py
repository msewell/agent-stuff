#!/usr/bin/env python3
"""
Deterministic add pipeline for Anki notes via AnkiConnect.

Subcommands:
- preflight: verify AnkiConnect/models/fields/deck
- add-notes: preflight + tag/hash/checklist + duplicate preflight + batched add
- resume-status: print checklist summary
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import shutil
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

try:
    import yaml  # type: ignore
except Exception:
    print(
        "Missing dependency: pyyaml. Install with one of:\n"
        "  python3 -m venv .venv && source .venv/bin/activate && pip install pyyaml\n"
        "  python3 -m pip install --user --break-system-packages pyyaml",
        file=sys.stderr,
    )
    sys.exit(1)

REQUEST_TIMEOUT_SECONDS = 30
DEFAULT_ANKI_URL = "http://localhost:8765"
CHECKLIST_VERSION = 1


class PipelineError(RuntimeError):
    pass


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat()


def utc_batch_stamp() -> str:
    return utc_now().strftime("%Y%m%d-%H%M")


def anki_invoke(anki_url: str, action: str, params: dict[str, Any] | None = None) -> Any:
    body = json.dumps(
        {"action": action, "version": 6, "params": params or {}}, ensure_ascii=False
    ).encode("utf-8")
    req = urllib.request.Request(
        anki_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as e:
        raise PipelineError(f"Failed to reach AnkiConnect at {anki_url}: {e}") from e

    if payload.get("error") is not None:
        raise PipelineError(f"AnkiConnect action '{action}' failed: {payload['error']}")
    return payload.get("result")


def normalize_identity(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def normalize_text(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n").strip()
    return re.sub(r"\s+", " ", s)


def slugify_segment(s: str) -> str:
    s = s.strip().lower().replace("_", " ")
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9-]", "", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "x"


def sanitize_tag(tag: str) -> str:
    # Preserve namespace separators by sanitizing each segment independently.
    parts = [slugify_segment(part) for part in tag.split("::")]
    return "::".join(parts)


def derive_source_slug(source_identity: str) -> str | None:
    candidate = source_identity.strip()
    if candidate.startswith(("http://", "https://")):
        candidate = candidate.rstrip("/").split("/")[-1]
    else:
        candidate = Path(candidate).name
    candidate = re.sub(r"\.[A-Za-z0-9]+$", "", candidate)
    slug = slugify_segment(candidate)
    return slug if len(slug) >= 3 and slug != "x" else None


def compute_source_hash(source_identity: str, source_text: str) -> str:
    data = normalize_identity(source_identity) + "\n" + normalize_text(source_text)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def convert_newlines_to_br(value: str) -> str:
    if "\n" not in value:
        return value
    return value.replace("\n", "<br>")


def ensure_text(value: Any, field_name: str) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    raise PipelineError(f"Field '{field_name}' must be a string")


def read_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise PipelineError("Checklist root must be a mapping")
    return data


def write_yaml(path: Path, data: dict[str, Any]) -> None:
    data.setdefault("meta", {})
    data["meta"]["updated_at"] = iso_now()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)


def move_corrupt_checklist(path: Path) -> Path:
    stamp = utc_now().strftime("%Y%m%d-%H%M%S")
    corrupt = path.with_name(f"{path.stem}.corrupt.{stamp}.yaml")
    shutil.move(path, corrupt)
    return corrupt


def validate_checklist_schema(data: dict[str, Any]) -> None:
    required_root = {"meta", "totals", "chunks"}
    missing = required_root - set(data.keys())
    if missing:
        raise PipelineError(f"Checklist missing keys: {sorted(missing)}")

    if not isinstance(data["meta"], dict):
        raise PipelineError("Checklist meta must be a mapping")
    if not isinstance(data["totals"], dict):
        raise PipelineError("Checklist totals must be a mapping")
    if not isinstance(data["chunks"], list):
        raise PipelineError("Checklist chunks must be a list")

    for idx, chunk in enumerate(data["chunks"]):
        if not isinstance(chunk, dict):
            raise PipelineError(f"Checklist chunk[{idx}] must be a mapping")
        if "status" not in chunk:
            raise PipelineError(f"Checklist chunk[{idx}] missing status")
        if chunk["status"] not in {"pending", "in_progress", "done", "failed"}:
            raise PipelineError(f"Checklist chunk[{idx}] has invalid status: {chunk['status']}")


def init_checklist(
    deck: str,
    source_tag: str,
    batch_tag: str,
    source_hash_short: str,
    chunk_count: int,
    notes_count: int,
    chunk_size: int,
) -> dict[str, Any]:
    return {
        "meta": {
            "checklist_version": CHECKLIST_VERSION,
            "deck": deck,
            "source_tag": source_tag,
            "batch_tag": batch_tag,
            "source_hash_short": source_hash_short,
            "notes_count": notes_count,
            "chunk_size": chunk_size,
            "created_at": iso_now(),
            "updated_at": iso_now(),
        },
        "totals": {
            "generated": 0,
            "attempted": 0,
            "added": 0,
            "skipped": 0,
            "failed": 0,
            "warnings": 0,
        },
        "chunks": [
            {
                "id": f"chunk-{i+1:02d}",
                "status": "pending",
                "generated": 0,
                "attempted": 0,
                "added": 0,
                "skipped": 0,
                "failed": 0,
                "warnings": 0,
                "error": "",
            }
            for i in range(chunk_count)
        ],
    }


def recompute_totals(checklist: dict[str, Any]) -> None:
    totals = {
        "generated": 0,
        "attempted": 0,
        "added": 0,
        "skipped": 0,
        "failed": 0,
        "warnings": 0,
    }
    for chunk in checklist["chunks"]:
        for key in totals:
            totals[key] += int(chunk.get(key, 0))
    checklist["totals"] = totals


def summarize(checklist: dict[str, Any], checklist_path: Path) -> dict[str, Any]:
    return {
        "deck": checklist["meta"]["deck"],
        "generated": checklist["totals"]["generated"],
        "attempted": checklist["totals"]["attempted"],
        "added": checklist["totals"]["added"],
        "skipped": checklist["totals"]["skipped"],
        "failed": checklist["totals"]["failed"],
        "warnings": checklist["totals"]["warnings"],
        "source_tag": checklist["meta"]["source_tag"],
        "batch_tag": checklist["meta"]["batch_tag"],
        "checklist": str(checklist_path),
        "chunks": [
            {
                "id": c["id"],
                "status": c["status"],
                "generated": c["generated"],
                "attempted": c["attempted"],
                "added": c["added"],
                "skipped": c["skipped"],
                "failed": c["failed"],
                "warnings": c["warnings"],
            }
            for c in checklist["chunks"]
        ],
    }


def preflight_or_raise(anki_url: str, deck: str, create_deck_if_missing: bool = True) -> dict[str, Any]:
    version = anki_invoke(anki_url, "version")
    if version != 6:
        raise PipelineError(f"Unsupported AnkiConnect version: {version} (expected 6)")

    models = set(anki_invoke(anki_url, "modelNames"))
    for required in ("Basic", "Cloze"):
        if required not in models:
            raise PipelineError(f"Missing required model: {required}")

    basic_fields = set(anki_invoke(anki_url, "modelFieldNames", {"modelName": "Basic"}))
    cloze_fields = set(anki_invoke(anki_url, "modelFieldNames", {"modelName": "Cloze"}))

    if not {"Front", "Back"}.issubset(basic_fields):
        missing = sorted({"Front", "Back"} - basic_fields)
        raise PipelineError(f"Basic missing required fields: {missing}")

    # Strict policy per project decision: Cloze must use Text + Back Extra.
    if not {"Text", "Back Extra"}.issubset(cloze_fields):
        missing = sorted({"Text", "Back Extra"} - cloze_fields)
        raise PipelineError(f"Cloze missing required fields: {missing}")

    decks = set(anki_invoke(anki_url, "deckNames"))
    created = False
    if deck not in decks:
        if not create_deck_if_missing:
            raise PipelineError(f"Deck '{deck}' does not exist")
        anki_invoke(anki_url, "createDeck", {"deck": deck})
        created = True

    return {
        "version": version,
        "deck": deck,
        "deck_created": created,
        "basic_fields": sorted(basic_fields),
        "cloze_fields": sorted(cloze_fields),
    }


def load_notes(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        if path.suffix in (".yaml", ".yml"):
            data = yaml.safe_load(f)
        else:
            data = json.load(f)
    if not isinstance(data, list):
        raise PipelineError("Notes file must be a YAML or JSON array")
    if not data:
        raise PipelineError("Notes file is empty")
    out: list[dict[str, Any]] = []
    for idx, raw in enumerate(data):
        if not isinstance(raw, dict):
            raise PipelineError(f"notes[{idx}] must be an object")

        model = raw.get("modelName") or raw.get("model")
        if model not in {"Basic", "Cloze"}:
            raise PipelineError(f"notes[{idx}] modelName must be Basic or Cloze")

        fields = raw.get("fields")
        if not isinstance(fields, dict):
            raise PipelineError(f"notes[{idx}] fields must be an object")

        tags = raw.get("tags") or []
        if not isinstance(tags, list) or any(not isinstance(t, str) for t in tags):
            raise PipelineError(f"notes[{idx}] tags must be a string array")

        out.append({"modelName": model, "fields": fields, "tags": tags})
    return out


def normalize_note_for_add(
    note: dict[str, Any],
    deck: str,
    source_tag: str,
    batch_tag: str,
) -> tuple[dict[str, Any], int]:
    model = note["modelName"]
    fields_in = note["fields"]
    warnings = 0

    if model == "Basic":
        front = ensure_text(fields_in.get("Front", ""), "Front")
        back = ensure_text(fields_in.get("Back", ""), "Back")
        if len(front) > 220:
            warnings += 1
        if len(back) > 600:
            warnings += 1
        fields_out = {
            "Front": convert_newlines_to_br(front),
            "Back": convert_newlines_to_br(back),
        }
    else:
        text = ensure_text(fields_in.get("Text", ""), "Text")
        back_extra = ensure_text(fields_in.get("Back Extra", ""), "Back Extra")
        if len(text) > 220:
            warnings += 1
        if len(back_extra) > 600:
            warnings += 1
        fields_out = {
            "Text": convert_newlines_to_br(text),
            "Back Extra": convert_newlines_to_br(back_extra),
        }

    tag_list = [source_tag, batch_tag] + [sanitize_tag(t) for t in note.get("tags", [])]
    seen: set[str] = set()
    dedup_tags: list[str] = []
    for t in tag_list:
        if t and t not in seen:
            dedup_tags.append(t)
            seen.add(t)

    note_out = {
        "deckName": deck,
        "modelName": model,
        "fields": fields_out,
        "tags": dedup_tags,
    }
    return note_out, warnings


def chunk_list(items: list[Any], chunk_size: int) -> list[list[Any]]:
    return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]


def print_json(data: dict[str, Any]) -> None:
    print(json.dumps(data, indent=2, ensure_ascii=False))


def cmd_preflight(args: argparse.Namespace) -> None:
    result = preflight_or_raise(args.anki_url, args.deck, create_deck_if_missing=True)
    print_json(result)


def cmd_resume_status(args: argparse.Namespace) -> None:
    checklist_path = Path(args.checklist)
    if not checklist_path.exists():
        raise PipelineError(f"Checklist not found: {checklist_path}")
    checklist = read_yaml(checklist_path)
    validate_checklist_schema(checklist)
    print_json(summarize(checklist, checklist_path))


def cmd_add_notes(args: argparse.Namespace) -> None:
    preflight_or_raise(args.anki_url, args.deck, create_deck_if_missing=True)

    notes = load_notes(Path(args.notes_file))

    source_identity = args.source_identity
    source_text = Path(args.source_text_file).read_text(encoding="utf-8")
    source_hash = compute_source_hash(source_identity, source_text)
    source_hash_short = source_hash[:10]

    source_slug = derive_source_slug(source_identity)
    source_tag = sanitize_tag(
        f"source::{source_slug}" if source_slug else f"source-hash::{source_hash_short}"
    )
    batch_tag = sanitize_tag(f"batch::{utc_batch_stamp()}")

    deck_slug = slugify_segment(args.deck)
    checklist_path = Path(
        args.checklist
        or f"/tmp/anki-add-run-{source_hash_short}-{deck_slug}.yaml"
    )

    execution_chunk_size = args.execution_chunk_size
    note_chunks = chunk_list(notes, execution_chunk_size)

    checklist: dict[str, Any]
    if checklist_path.exists():
        try:
            checklist = read_yaml(checklist_path)
            validate_checklist_schema(checklist)
        except Exception:
            corrupt = move_corrupt_checklist(checklist_path)
            checklist = init_checklist(
                deck=args.deck,
                source_tag=source_tag,
                batch_tag=batch_tag,
                source_hash_short=source_hash_short,
                chunk_count=len(note_chunks),
                notes_count=len(notes),
                chunk_size=execution_chunk_size,
            )
            write_yaml(checklist_path, checklist)
            print_json({
                "warning": "Corrupt checklist moved; initialized fresh checklist",
                "moved_to": str(corrupt),
                "checklist": str(checklist_path),
            })
    else:
        checklist = init_checklist(
            deck=args.deck,
            source_tag=source_tag,
            batch_tag=batch_tag,
            source_hash_short=source_hash_short,
            chunk_count=len(note_chunks),
            notes_count=len(notes),
            chunk_size=execution_chunk_size,
        )
        write_yaml(checklist_path, checklist)

    # Resume compatibility checks
    meta = checklist.get("meta", {})
    if int(meta.get("notes_count", len(notes))) != len(notes):
        raise PipelineError(
            "Checklist notes_count does not match current notes JSON; use a new checklist path"
        )
    if int(meta.get("chunk_size", execution_chunk_size)) != execution_chunk_size:
        raise PipelineError(
            "Checklist chunk_size does not match current execution chunk size; use a new checklist path"
        )
    if str(meta.get("deck")) != args.deck:
        raise PipelineError("Checklist deck does not match current deck")

    chunks_state = checklist["chunks"]
    if len(chunks_state) != len(note_chunks):
        raise PipelineError(
            "Checklist chunk count does not match current notes/chunk configuration"
        )

    if chunks_state and all(c.get("status") == "done" for c in chunks_state):
        print_json({"status": "already-complete", **summarize(checklist, checklist_path)})
        return

    for idx, chunk_notes in enumerate(note_chunks):
        cstate = chunks_state[idx]
        status = cstate.get("status")
        if status == "done":
            continue
        if status not in {"pending", "failed", "in_progress"}:
            raise PipelineError(f"Invalid chunk status at index {idx}: {status}")

        cstate["status"] = "in_progress"
        cstate["error"] = ""
        write_yaml(checklist_path, checklist)

        try:
            prepared_notes: list[dict[str, Any]] = []
            warnings = 0
            for note in chunk_notes:
                prepped, note_warnings = normalize_note_for_add(note, args.deck, source_tag, batch_tag)
                warnings += note_warnings
                prepared_notes.append(prepped)

            cstate["generated"] = len(prepared_notes)
            cstate["warnings"] = warnings

            preflight = anki_invoke(
                args.anki_url,
                "canAddNotesWithErrorDetail",
                {"notes": prepared_notes},
            )
            addable: list[dict[str, Any]] = []
            skipped = 0
            for note, status_obj in zip(prepared_notes, preflight):
                if status_obj.get("canAdd"):
                    addable.append(note)
                else:
                    skipped += 1

            attempted = len(addable)
            added = 0
            failed = 0

            if addable:
                results = anki_invoke(args.anki_url, "addNotes", {"notes": addable})
                for note_id in results:
                    if note_id is None:
                        failed += 1
                    else:
                        added += 1

            cstate["attempted"] = attempted
            cstate["added"] = added
            cstate["skipped"] = skipped
            cstate["failed"] = failed
            cstate["status"] = "done"
            cstate["error"] = ""

            recompute_totals(checklist)
            write_yaml(checklist_path, checklist)
        except Exception as e:
            cstate["status"] = "failed"
            cstate["error"] = str(e)
            recompute_totals(checklist)
            write_yaml(checklist_path, checklist)
            raise

    recompute_totals(checklist)
    write_yaml(checklist_path, checklist)
    print_json(summarize(checklist, checklist_path))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Anki add pipeline helper")
    parser.add_argument("--anki-url", default=DEFAULT_ANKI_URL, help="AnkiConnect URL")

    sub = parser.add_subparsers(dest="command", required=True)

    p_preflight = sub.add_parser("preflight", help="Verify Anki environment and deck")
    p_preflight.add_argument("--deck", required=True)
    p_preflight.set_defaults(func=cmd_preflight)

    p_resume = sub.add_parser("resume-status", help="Print checklist status")
    p_resume.add_argument("--checklist", required=True)
    p_resume.set_defaults(func=cmd_resume_status)

    p_add = sub.add_parser("add-notes", help="Add pre-generated notes deterministically")
    p_add.add_argument("--deck", required=True)
    p_add.add_argument("--notes-file", required=True, help="Path to notes YAML file (or JSON)")
    p_add.add_argument("--source-identity", required=True, help="Source URL/path/title")
    p_add.add_argument("--source-text-file", required=True, help="Path to source text content")
    p_add.add_argument(
        "--execution-chunk-size",
        type=int,
        default=25,
        help="Chunk size for execution/checkpointing",
    )
    p_add.add_argument(
        "--checklist",
        default="",
        help="Optional checklist path override (default: /tmp/anki-add-run-<hash>-<deck>.yaml)",
    )
    p_add.set_defaults(func=cmd_add_notes)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except PipelineError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
