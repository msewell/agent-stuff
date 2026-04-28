---
name: writing-anki-cards
description: "Generates high-quality Anki flashcards from source material and adds them directly to Anki via AnkiConnect. Produces atomic cloze and Q/A cards, skips duplicates safely, and returns a succinct run report. Use when the user asks to create Anki cards, flashcards, or spaced-repetition prompts from notes, articles, docs, or text."
category: Writing & Communication
compatibility: "Requires Anki desktop running with AnkiConnect addon (2055492159), Python 3, jq, pyyaml, and pi CLI"
---

# Writing Anki Cards (Add-Only)

This skill is **add-only**: generate cards and insert notes into Anki.
Do not run review/update/delete workflows.

```bash
SKILL_DIR="$(dirname "$SKILL_PATH")"
PIPELINE="$SKILL_DIR/scripts/anki_add_pipeline.py"
REFS="$SKILL_DIR/references"
```

## Quick start

1. Ensure Anki is running with AnkiConnect.
2. Save source to `/tmp/source.txt` and run the source gate.
3. Read the card formulation principles.
4. For each chunk: generate → evaluate → fix.
5. Merge, preflight, add notes, return report.

## Prerequisites

- Anki + AnkiConnect (2055492159)
- `python3`, `jq`
- `pyyaml`: `python3 -m venv .venv && source .venv/bin/activate && pip install pyyaml`
- `pi` CLI (for the per-chunk evaluator)

## Canonical workflow

**1. Save source material** to `/tmp/source.txt`.

**2. Run source gate** — always, regardless of source size.
Produces a chunk plan and source metrics YAML before any cards are written.
See [Source gate](#source-gate-step-2) below.

**3. Read card formulation principles** using the `read` tool — mandatory before writing any cards:
- [Card formulation principles](references/01-card-formulation-principles.md)
- [Advanced techniques](references/02-advanced-techniques.md)
- `read "$REFS/01-card-formulation-principles.md"`
- `read "$REFS/02-advanced-techniques.md"`

**4. For each chunk — generate → evaluate → fix:**

a. Generate cards from that chunk's source sections → write `/tmp/anki-chunk-N.yaml`
b. Run the per-chunk evaluator → read free-form output.
   See [Per-chunk evaluator](#per-chunk-evaluator-step-4b) below.
c. **Rewrite `/tmp/anki-chunk-N.yaml` completely** based on evaluation output.
   Do not make surgical edits — the evaluator may identify structural issues
   (missing coverage, ratio drift, systematic patterns) that require adding or
   removing cards, not just editing existing ones.

Process each chunk to completion before starting the next. Do not stop mid-source
unless the user explicitly approves an early exit.

**5. Merge all reviewed chunks:**
```bash
cat /tmp/anki-chunk-*.yaml > /tmp/anki-notes.yaml
```

**6. Run preflight:**
```bash
python3 "$PIPELINE" preflight --deck "<deck>"
```

**7. Run add pipeline:**
```bash
python3 "$PIPELINE" add-notes \
  --deck "<deck>" \
  --notes-file "/tmp/anki-notes.yaml" \
  --source-identity "<source-url-or-path-or-title>" \
  --source-text-file "/tmp/source.txt"
```

**8. Return succinct report** from script output.

## Source gate (step 2)

Always run — for sources ≤2,500 words, produce a single-chunk plan.

1. Count total words in `/tmp/source.txt`.
2. List section headings with approximate word counts.
3. Group sections into ~2,500-word semantic chunks. If total ≤2,500 words, one chunk covers the full source.
4. Compute per-chunk card targets (5–10 cards per 1,000 words).
5. Write `/tmp/anki-source-metrics-<hash>.yaml`:

```yaml
source_hash: "6f0fa16a8c25"
total_words: 8303
sections:
  - heading: "§1. Introduction"
    words: 225
  - heading: "§2. Manifesto"
    words: 300
```

6. Write `/tmp/anki-chunk-plan-<hash>.yaml`:

```yaml
source_hash: "6f0fa16a8c25"
total_words: 8303
card_target_min: 41
card_target_max: 83
chunks:
  - id: 1
    sections: "§1–§5"
    approx_words: 2100
    card_min: 10
    card_max: 21
    status: pending
```

The hash is the first 12 characters of `sha256(normalized_source_identity + "\n" + normalized_source_text)` — the same value the pipeline script computes internally.

## Per-chunk evaluator (step 4b)

After writing `/tmp/anki-chunk-N.yaml`, build and run the evaluator.
Template: [Evaluator prompt](references/03-evaluator-prompt.md)


```bash
PROMPT=$(python3 -c "
import sys
t = open(sys.argv[1]).read()
c = open(sys.argv[2]).read()
print(t.replace('{{CHUNK_YAML}}', c))
" "$REFS/03-evaluator-prompt.md" "/tmp/anki-chunk-N.yaml")

timeout 180 pi --mode json --no-session --no-skills --no-extensions \
   --no-tools --no-context-files \
   --model opencode-go/glm-5.1 "$PROMPT" 2>/dev/null \
   | jq -rj '..|.delta? // empty'
```

The evaluator returns three sections: a card-by-card verdict, a chunk-level synthesis
(coverage gaps, ratio, systematic patterns, interference), and a concrete action list.
Read all three before rewriting the chunk. Evaluate the feedback critically — the
evaluator can be wrong, over-strict, or miss domain context. Accept findings that
improve clarity and retrieval; push back on those that would make cards worse.

## Notes YAML contract

Notes files are YAML lists. **Always double-quote all field values** — this single rule
prevents all YAML parse errors (colons in values, boolean-like words, and `{{...}}` syntax
are all safe inside double quotes).

```yaml
# Section comments are native in YAML — use them freely
# === Chunk 1: §1–§5 Foundations (2,100 words) | target: 10–21 cards ===

- modelName: Cloze
  fields:
    Text: "Warmth is judged before {{c1::competence}}."
    Back Extra: ""
  tags: [warmth-competence]

- modelName: Basic
  fields:
    Front: "Why lead with warmth?"
    Back: "Competence-first signaling reads as cold before trust is established."
  tags: [warmth-competence]
```

Rules:
- `modelName` must be `Cloze` or `Basic`.
- `Cloze` fields: `Text` and `Back Extra`.
- `Basic` fields: `Front` and `Back`.
- `tags`: optional flow sequence `[tag1, tag2]`.

## Source-independent and self-contextual wording (required)

Cards must be comprehensible in isolation. Assume the reviewer sees only the card prompt
(`Front` for Basic, `Text` for Cloze) — not deck name, tags, or source metadata.

Before keeping a card, run this check: **if this prompt appeared alone in a mixed-deck
review session, would the topic be unambiguous?** If not, add topic context directly to the
prompt (prefix, field label, or context woven into the sentence).

Do **not** reference the source artifact.

❌ "this guide", "the guide", "this article", "the author says", "in the text/document",
or any proper name unique to a worked example in the source (system names, fictional
entities, organisation names used only as examples).

✅ Rewrite to domain wording with explicit topic context when needed:
"In threat modeling…", "For REST APIs…", "In electronics…", "When designing…"

## What the script guarantees

- AnkiConnect/version preflight
- Model/field preflight (`Basic`: `Front`, `Back`; `Cloze`: `Text`, `Back Extra`)
- Deck preflight + auto-create if missing
- Deterministic source hash (`sha256(normalized_identity + "\n" + normalized_text)`)
- Stable source tag + batch tag; tag sanitization
- YAML checklist at `/tmp/anki-add-run-<hash>-<deck>.yaml`
- Resume semantics (`pending|in_progress|done|failed`)
- Duplicate preflight (`canAddNotesWithErrorDetail`)
- Batched insertion (default execution chunk size: 25)
- Newline normalization (`\n` → `<br>` in all fields)
- Soft warnings: `Front`/`Text` > 220 chars; `Back`/`Back Extra` > 600 chars

## Density and card-type calibration (default targets)

- **Cards per 1,000 words:** 5–10
- **Cloze:Basic ratio:** 2:1 to 3:1

Calibration checks:
- Below density → under-extraction; above → over-splitting or low-value cards.
- Outside ratio range → rebalance unless source structure strongly justifies it.
- Atomicity and single-answer retrieval take priority over hitting numeric targets.

## Resume commands

```bash
python3 "$PIPELINE" resume-status --checklist "/tmp/anki-add-run-<hash>-<deck>.yaml"
```

Re-run the same `add-notes` command to resume unfinished execution chunks.

## Duplicate policy

Skip non-addable notes and continue. Do not fail the run for duplicates.

## Fallback (manual API reference only)

If script use is impossible: `version`, `modelNames`, `modelFieldNames`, `deckNames`,
`createDeck`, `canAddNotesWithErrorDetail`, `addNotes`.

## Final response format

- **Deck:** `<deck>`
- **Total words (accurate):** `<n>`
- **Section word-count min/max:** `<min>` / `<max>`
- **Source metrics file:** `/tmp/anki-source-metrics-<source-hash>.yaml`
- **Chunk plan file:** `/tmp/anki-chunk-plan-<source-hash>.yaml`
- **Chunks planned/completed:** `<n>` / `<n>`
- **Document card target min/max:** `<min>` / `<max>`
- **Generated:** `<n>`
- **Attempted:** `<n>`
- **Added:** `<n>`
- **Skipped (duplicates/non-addable):** `<n>`
- **Failed:** `<n>`
- **Warnings:** `<n>`
- **Source tag:** `<source::...>`
- **Batch tag:** `<batch::...>`
- **Checklist file:** `/tmp/anki-add-run-<hash>-<deck>.yaml`
