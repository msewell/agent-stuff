---
name: writing-anki-cards
description: "Generates high-quality Anki flashcards from source material and adds them directly to Anki via AnkiConnect. Produces atomic cloze and Q/A cards, skips duplicates safely, and returns a succinct run report. Use when the user asks to create Anki cards, flashcards, or spaced-repetition prompts from notes, articles, docs, or text."
category: Writing & Communication
compatibility: "Requires Anki desktop running with AnkiConnect addon (2055492159), Python 3, jq, pyyaml, and pi CLI"
---

# Writing Anki Cards (Add-Only)

This skill is **add-only**: generate cards and insert notes into Anki.
Do not run review/update/delete workflows.

## Non-negotiable integrity rules

- **No shortcuts.** Every single card that will be added to Anki must be reviewed before it is added.
- **Evaluator required once for every chunk/card.** Run the evaluator exactly once on each drafted chunk, read its card-by-card verdict, and rewrite the chunk before adding. Do not run repeated evaluator loops after the rewrite unless the evaluator failed/incompletely reviewed the chunk or the user explicitly requests another pass. If the evaluator cannot be run, stop and ask the user how to proceed; do not add unreviewed cards.
- **No mechanical card derivation.** Do not use scripts, regexes, templates, heading extraction, table extraction, sentence clozing, or other automated transformations to derive card contents mechanically from the source. Scripts may be used only for source metrics, YAML validation and merging reviewed note files, AnkiConnect preflight, duplicate checks, and insertion—not for deciding card prompts or answers.
- **Do not imply completion of steps that were skipped.** The final report must accurately reflect which chunks were evaluated and whether any cards were not reviewed.

```bash
SKILL_DIR="$(dirname "$SKILL_PATH")"
PIPELINE="$SKILL_DIR/scripts/anki_add_pipeline.py"
REFS="$SKILL_DIR/references"
```

## Quick start

1. Ensure Anki is running with AnkiConnect.
2. Create a private run directory, save the source there, and run the source gate.
3. Read the card formulation principles.
4. For each chunk: manually generate → evaluate every card once → rewrite → move on.
5. Merge only the reviewed files named in the run’s chunk plan, then preflight, add notes, and report.

## Prerequisites

- Anki + AnkiConnect (2055492159)
- `python3`, `jq`
- `pyyaml`: `python3 -m venv .venv && source .venv/bin/activate && pip install pyyaml`
- `pi` CLI (for the per-chunk evaluator)

## Canonical workflow

**1. Create a private run directory and save the source** to `$RUN_DIR/source.txt`.

```bash
RUN_DIR="$(mktemp -d "${TMPDIR:-/tmp}/anki-add.XXXXXX")" || exit 1
printf 'Run directory: %s\n' "$RUN_DIR"
```

Record the path and reuse it in subsequent shell calls and when resuming this run.
Keep the plan, draft chunks, evaluator output, and merged notes inside this directory.
Do not reuse draft files from another run.

**2. Run source gate** — always, regardless of source size.
Produces a chunk plan and source metrics YAML before any cards are written.
See [Source gate](#source-gate-step-2) below.

**3. Read card formulation principles** using the `read` tool — mandatory before writing any cards:
- [Card formulation principles](references/01-card-formulation-principles.md)
- [Advanced techniques](references/02-advanced-techniques.md)
- `read "$REFS/01-card-formulation-principles.md"`
- `read "$REFS/02-advanced-techniques.md"`

**4. For each chunk — manually generate → evaluate every card once → rewrite → move on:**

a. Manually formulate cards from that chunk's source sections. Write the file named
   by `notes_file` in that chunk's plan entry, under `$RUN_DIR`.
   Do not mechanically derive cards with scripts, regexes, heading/table extraction,
   sentence clozing, or template expansion. Card prompts and answers must come from
   deliberate card-design judgment.
b. Run the per-chunk evaluator on that file → read the full free-form output,
   including the card-by-card verdict for every card.
   See [Per-chunk evaluator](#per-chunk-evaluator-step-4b) below.
c. **Rewrite the chunk file completely** based on evaluation output.
   Do not make surgical edits — the evaluator may identify structural issues
   (missing coverage, ratio drift, systematic patterns) that require adding or
   removing cards, not just editing existing ones.
d. Confirm every remaining card has either an evaluator `OK` verdict or was rewritten
   in response to evaluator feedback. Only then mark that plan entry `status: reviewed`.
   Do not change the file after marking it reviewed. The post-rewrite chunk does not
   need a second evaluator pass. If any card was neither reviewed by the evaluator nor
   rewritten in response to evaluator feedback, do not merge or add that chunk.

Process each chunk to completion before starting the next. Do not drop a planned
entry to work around a missing file or failed review. If the user explicitly
approves a narrower scope, record the excluded sections separately in the plan,
list only the approved scope under `chunks`, and report that the run was partial.

**5. Merge only the reviewed files named in the plan.** Read them in plan order, not
by glob: a stale or stray chunk must not reach insertion. Run the same check for a
single chunk. Stop before preflight or insertion if the merge fails.

```bash
python3 - "${RUN_DIR:?Set RUN_DIR to the run directory}" <<'PY'
import sys
from pathlib import Path

import yaml

run_dir = Path(sys.argv[1]).resolve()
output = run_dir / "anki-notes.yaml"
try:
    output.unlink(missing_ok=True)  # Never reuse an older merge after failure.
    plan = yaml.safe_load((run_dir / "chunk-plan.yaml").read_text(encoding="utf-8"))
    chunks = plan["chunks"]
    if not isinstance(chunks, list) or not chunks:
        raise ValueError("The chunk plan must list at least one chunk.")
    notes, seen = [], set()
    for chunk in chunks:
        chunk_id = chunk["id"]
        name = chunk["notes_file"]
        if type(chunk_id) is not int or chunk_id < 1 or name != f"anki-chunk-{chunk_id}.yaml":
            raise ValueError(f"Invalid planned chunk file: {name!r} (id: {chunk_id!r}).")
        if name in seen:
            raise ValueError(f"Duplicate planned chunk: {name}.")
        if chunk["status"] != "reviewed":
            raise ValueError(f"Planned chunk is not reviewed: {name}.")
        path = run_dir / name
        if path.is_symlink() or not path.is_file():
            raise ValueError(f"Missing or not a regular run-local chunk file: {path}.")
        items = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(items, list) or not items:
            raise ValueError(f"Expected a nonempty YAML note list in {path}.")
        seen.add(name)
        notes.extend(items)
    temporary = output.with_suffix(".tmp")
    temporary.write_text(yaml.safe_dump(notes, allow_unicode=True, sort_keys=False,
                                        default_style='"'), encoding="utf-8")
    temporary.replace(output)
except (OSError, ValueError, TypeError, KeyError, yaml.YAMLError) as exc:
    raise SystemExit(f"Cannot merge reviewed chunks: {exc}") from None
PY
```

Retire this separate merge step if the add pipeline later enforces the same
run-local, reviewed-plan boundary itself.

**6. Run preflight:**
```bash
python3 "$PIPELINE" preflight --deck "<deck>"
```

**7. Run add pipeline:**
```bash
python3 "$PIPELINE" add-notes \
  --deck "<deck>" \
  --notes-file "$RUN_DIR/anki-notes.yaml" \
  --source-identity "<source-url-or-path-or-title>" \
  --source-text-file "$RUN_DIR/source.txt"
```

**8. Return succinct report** from script output.

## Source gate (step 2)

Always run — for sources ≤2,500 words, produce a single-chunk plan.

1. Count total words in `$RUN_DIR/source.txt`.
2. List section headings with approximate word counts.
3. Group sections into ~2,500-word semantic chunks. If total ≤2,500 words, one chunk covers the full source.
4. Compute per-chunk card targets (5–10 cards per 1,000 words).
5. Write `$RUN_DIR/source-metrics.yaml`:

```yaml
source_hash: "6f0fa16a8c25"
total_words: 8303
sections:
  - heading: "§1. Introduction"
    words: 225
  - heading: "§2. Manifesto"
    words: 300
```

6. Write `$RUN_DIR/chunk-plan.yaml`. List every chunk in source order and give it
   a unique positive integer `id`, the matching basename `notes_file`, and
   `status: pending`:

```yaml
source_hash: "6f0fa16a8c25"
total_words: 8303
card_target_min: 41
card_target_max: 83
chunks:
  - id: 1
    notes_file: "anki-chunk-1.yaml"
    sections: "§1–§5"
    approx_words: 2100
    card_min: 10
    card_max: 21
    status: pending
```

The hash is the first 12 characters of `sha256(normalized_source_identity + "\n" + normalized_source_text)` — the same value the pipeline script computes internally.

## Per-chunk evaluator (step 4b)

Set `CHUNK_FILE` to the current entry’s `notes_file`. After writing
`$RUN_DIR/$CHUNK_FILE`, build and run the evaluator once. This is mandatory
for every chunk and every card before anything is added to Anki. A rewritten chunk does not
need to be evaluated again unless the evaluator failed/incompletely reviewed it or the user
explicitly requests another pass.
Template: [Evaluator prompt](references/03-evaluator-prompt.md)


```bash
PROMPT=$(python3 -c "
import sys
t = open(sys.argv[1]).read()
c = open(sys.argv[2]).read()
print(t.replace('{{CHUNK_YAML}}', c))
" "$REFS/03-evaluator-prompt.md" "$RUN_DIR/$CHUNK_FILE")

timeout 200 pi --mode json --no-session --no-skills --no-extensions \
   --no-tools --no-context-files \
   --model opencode-go/glm-5.3 "$PROMPT" 2>/dev/null \
   | jq -rj 'select(.type=="message_update" and .assistantMessageEvent.type=="text_delta") | .assistantMessageEvent.delta'
```

Use the newest authenticated GLM chat model available under `opencode-go`: check
`pi --list-models glm` before running the evaluator and update the `--model` value
if a newer model replaces `glm-5.3`. Check that the Pi process exits successfully
and that every card received a verdict; a blank or truncated `jq` output is not
an evaluation.

The evaluator returns three sections: a card-by-card verdict, a chunk-level synthesis
(coverage gaps, ratio, systematic patterns, interference), and a concrete action list.
Read all three before rewriting the chunk. Evaluate the feedback critically — the
evaluator can be wrong, over-strict, or miss domain context. Accept findings that
improve clarity and retrieval; push back on those that would make cards worse.

If the evaluator fails, times out, or cannot review the full chunk, stop and ask the user
whether to reduce chunk size, change evaluator model, or abort. Do not add cards from a
chunk that has not received evaluator review.

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
    Back Extra: "Example: In a kickoff meeting, a technically strong answer can still land poorly if it sounds dismissive before trust exists."
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

## Clarifying examples on card backs

Where applicable, include a brief clarifying example on the back side of the card:
- For `Basic`, put it in `Back`.
- For `Cloze`, put it in `Back Extra`.

Use examples when they make an abstract idea concrete, distinguish likely-confused
concepts, show application, or clarify a "why/how" answer. Omit examples for simple
facts, dates, names, already-concrete definitions, or cases where the example would
become the thing being memorized. Keep examples short and subordinate to the answer;
do not turn the prompt into "give an example" unless example generation is itself the
skill being trained.

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

## Script boundaries

Do not write or use scripts to generate card prompts, cloze deletions, Basic fronts/backs,
or other note contents from the source. Mechanical extraction creates plausible-looking
but unreviewed cards and is prohibited.

The add pipeline script is allowed only after all card contents have been manually written,
evaluated, and rewritten as needed.

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

Re-run the same `add-notes` command with the original `RUN_DIR` and unchanged
merged notes to resume unfinished execution chunks.

## Duplicate policy

Skip non-addable notes and continue. Do not fail the run for duplicates.

## Fallback (manual API reference only)

If script use is impossible: `version`, `modelNames`, `modelFieldNames`, `deckNames`,
`createDeck`, `canAddNotesWithErrorDetail`, `addNotes`.

## Final response format

- **Deck:** `<deck>`
- **Total words (accurate):** `<n>`
- **Section word-count min/max:** `<min>` / `<max>`
- **Source metrics file:** `<run-dir>/source-metrics.yaml`
- **Chunk plan file:** `<run-dir>/chunk-plan.yaml`
- **Chunks planned/completed:** `<n>` / `<n>`
- **Chunks evaluated:** `<n>` / `<n>`
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
