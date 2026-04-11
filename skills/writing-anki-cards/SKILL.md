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
2. **Formulate cards** using:
   - [references/01-card-formulation-principles.md](references/01-card-formulation-principles.md)
   - [references/02-advanced-techniques.md](references/02-advanced-techniques.md)
3. **Write notes JSON** to a temp file (contract below).
4. **Run preflight**:
   ```bash
   python3 "$PIPELINE" preflight --deck "<deck>"
   ```
5. **Run add pipeline**:
   ```bash
   python3 "$PIPELINE" add-notes \
     --deck "<deck>" \
     --notes-json "/tmp/anki-notes.json" \
     --source-identity "<source-url-or-path-or-title>" \
     --source-text-file "/tmp/source.txt"
   ```
6. **Return succinct report** from script output.

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

- For large sources (estimated >30 cards), split conceptually by section while generating notes.
- Script execution/checkpoint chunking defaults to 25 notes (`--execution-chunk-size`).

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
- **Generated:** `<n>`
- **Attempted:** `<n>`
- **Added:** `<n>`
- **Skipped (duplicates/non-addable):** `<n>`
- **Failed:** `<n>`
- **Warnings:** `<n>`
- **Source tag:** `<source::... or source-hash::...>`
- **Batch tag:** `<batch::...>`
- **Checklist file:** `</tmp/anki-add-run-<hash>-<deck>.yaml>`
