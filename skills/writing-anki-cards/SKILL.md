---
name: writing-anki-cards
description: "Generates high-quality Anki flashcards from source material and adds them directly to Anki via AnkiConnect. Produces atomic cloze and Q/A cards, skips duplicates safely, and returns a succinct run report. Use when the user asks to create Anki cards, flashcards, or spaced-repetition prompts from notes, articles, docs, or text."
category: Writing & Communication
compatibility: "Requires Anki desktop running with AnkiConnect addon (2055492159), Python 3, jq, and pyyaml"
---

# Writing Anki Cards (Add-Only)

This skill is **add-only**: generate cards and insert notes into Anki.
Do not run review/update/delete workflows.

Use the bundled deterministic helper script:

```bash
PIPELINE="$(dirname "$SKILL_PATH")/scripts/anki_add_pipeline.py"
```

## Quick start

1. Ensure Anki is running with AnkiConnect.
2. Generate note candidates into a JSON array file.
3. Run script preflight.
4. Run script add-notes.
5. Return the script summary.

## Prerequisites

- Anki + AnkiConnect (2055492159)
- `python3`
- `jq`
- `pyyaml` (recommended: `python3 -m venv .venv && source .venv/bin/activate && pip install pyyaml`)

## Canonical workflow (script-first)

1. **Read source material** and derive card candidates.
2. **Run large-source gate** (required workflow for sources over 2,500 words; see below).
3. **Formulate cards** using:
   - [references/01-card-formulation-principles.md](references/01-card-formulation-principles.md)
   - [references/02-advanced-techniques.md](references/02-advanced-techniques.md)
   - Apply **density and card-type calibration targets** from `Density and card-type calibration (default targets)` before writing notes JSON.
4. **Write notes JSON** to a temp file (contract below).
5. **Run preflight**:
   ```bash
   python3 "$PIPELINE" preflight --deck "<deck>"
   ```
6. **Run add pipeline**:
   ```bash
   python3 "$PIPELINE" add-notes \
     --deck "<deck>" \
     --notes-json "/tmp/anki-notes.json" \
     --source-identity "<source-url-or-path-or-title>" \
     --source-text-file "/tmp/source.txt"
   ```
7. **Return succinct report** from script output.


## Notes JSON contract

Input to `add-notes` must be a JSON array of note objects:

```json
[
  {
    "modelName": "Cloze",
    "fields": {
      "Text": "Warmth is judged before {{c1::competence}}.",
      "Back Extra": ""
    },
    "tags": ["warmth-competence"]
  },
  {
    "modelName": "Basic",
    "fields": {
      "Front": "Why lead with warmth?",
      "Back": "Because competence-first signaling can read as cold before trust is established."
    },
    "tags": ["warmth-competence"]
  }
]
```

Rules:
- `modelName` must be `Cloze` or `Basic`.
- `Cloze` fields must be `Text` and `Back Extra`.
- `Basic` fields must be `Front` and `Back`.
- Optional `tags` is a string array.

## Source-independent wording (required)

Cards must be understandable in isolation and must not reference the source artifact.

Do **not** use phrasing like:
- "this guide" / "the guide"
- "this article" / "this chapter"
- "the author says"
- "in the text/document/source"

Rewrite these to domain wording instead, e.g.:
- "In PBI refinement..."
- "For throughput forecasting..."

## What the script guarantees

The helper script handles deterministic operations:

- AnkiConnect/version preflight
- Model/field preflight (strict):
  - `Basic`: `Front`, `Back`
  - `Cloze`: `Text`, `Back Extra`
- Deck preflight + auto-create if missing
- Deterministic source hash (`sha256(normalized_identity + "\n" + normalized_text)`)
- Stable source tag + batch tag generation
- Tag sanitization
- YAML checklist persistence in `/tmp/anki-add-run-<hash>-<deck>.yaml`
- Resume semantics (`pending|in_progress|done|failed`)
- Duplicate preflight (`canAddNotesWithErrorDetail`)
- Batched insertion (`addNotes`, execution chunk size default 25)
- Newline normalization (`\n` → `<br>` in `Front`, `Back`, `Text`, `Back Extra`)
- Soft warnings:
  - `Front`/`Text` > 220 chars
  - `Back`/`Back Extra` > 600 chars

If checklist YAML is corrupt/unparseable, script renames it to
`*.corrupt.<timestamp>.yaml` and starts a fresh checklist.

## Chunking policy

- **Content chunking (required for >2,500-word sources):** build semantic chunks around chapter/section boundaries at ~2,500 words/chunk and persist the chunk plan file before generating notes.
- Track chunk-level card min/max targets from density rules (5–10 cards per 1,000 words).
- Process chunks to completion; do not stop after partial progress unless user explicitly approves early stop.
- Script execution/checkpoint chunking remains 25 notes by default (`--execution-chunk-size`).

## Density and card-type calibration (default targets)

Use these as planning heuristics (not hard quotas), then enforce card quality rules.

- **Cards per 1,000 words:** **5–10**
- **Cloze:Basic ratio:** **2:1 to 3:1**

Calibration checks:
- If card density is below range, check for under-extraction of key ideas.
- If card density is above range, check for over-splitting, low-value cards, or memorizing material not yet understood.
- If Cloze/Basic mix falls outside range, rebalance unless the source structure strongly justifies it.
- Keep atomicity and single-answer retrieval as higher priority than hitting numeric targets.

## Resume commands

Check run status:

```bash
python3 "$PIPELINE" resume-status --checklist "/tmp/anki-add-run-<hash>-<deck>.yaml"
```

Re-run the same `add-notes` command to resume unfinished chunks.

## Duplicate policy

Do not fail the overall run because of duplicates.
Skip non-addable notes and continue.

## Fallback (manual API reference only)

If script use is impossible, use AnkiConnect directly:
- `version`, `modelNames`, `modelFieldNames`, `deckNames`, `createDeck`
- `canAddNotesWithErrorDetail`
- `addNotes`

## Final response format

- **Deck:** `<deck>`
- **Total words (accurate):** `<n>`
- **Chapter word-count min/max:** `<min>` / `<max>`
- **Source metrics file:** `</tmp/anki-source-metrics-<source-hash>.json>`
- **Chunk plan file:** `</tmp/anki-chunk-plan-<source-hash>.yaml>`
- **Chunks planned/completed:** `<n>` / `<n>`
- **Document card target min/max:** `<min>` / `<max>`
- **Generated:** `<n>`
- **Attempted:** `<n>`
- **Added:** `<n>`
- **Skipped (duplicates/non-addable):** `<n>`
- **Failed:** `<n>`
- **Warnings:** `<n>`
- **Source tag:** `<source::... or source-hash::...>`
- **Batch tag:** `<batch::...>`
- **Checklist file:** `</tmp/anki-add-run-<hash>-<deck>.yaml>`
