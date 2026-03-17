---
name: writing-anki-cards
description: "Generates and reviews Anki flashcards following spaced-repetition best practices, then pushes them directly into Anki via AnkiConnect. Produces atomic, precisely-worded cloze and Q/A cards from source material. Reviews existing cards for formulation problems and updates them in place. Use when the user asks to create Anki cards, flashcards, or spaced-repetition prompts from text, notes, articles, or documentation, or when asked to review, improve, or fix existing Anki cards."
category: Writing & Communication
compatibility: "Requires Anki desktop running with AnkiConnect addon (2055492159)"
---

# Writing Anki Cards

## Workflow: Generate cards from source material

1. **Verify AnkiConnect.**
   ```bash
   curl -s localhost:8765 -X POST -d '{"action":"version","version":6}'
   ```
   Expected: `{"result":6,"error":null}`. If this fails, stop and tell the user to open Anki with AnkiConnect installed (addon 2055492159).

2. **Determine target deck.** Use the deck name the user provides. If none specified, ask. AnkiConnect auto-creates new decks on first note insertion.

3. **Read source material.** Read the provided text, file, or content.

4. **Formulate cards.** Consult [references/01-card-formulation-principles.md](references/01-card-formulation-principles.md) for the full rules. Key defaults:
   - **Cloze** (`modelName: "Cloze"`) for factual and contextual knowledge — one `{{c1::...}}` deletion per card, keep deletions short and specific
   - **Basic** (`modelName: "Basic"`) for "why" and "how" questions
   - Decompose aggressively — one atomic fact per card
   - Add a topic prefix for disambiguation (e.g., `*Electronics*: ...`)
   - Target 5–20 cards per well-studied source

5. **Self-review.** Check every card against this checklist:
   - Atomic: tests exactly one thing
   - Precise: admits exactly one answer
   - Context-free: comprehensible in isolation
   - Trim: no unnecessary words
   - Not a list, not yes/no
   - Volatile facts date-stamped
   Fix any violations before proceeding. For deeper review criteria, consult [references/02-advanced-techniques.md](references/02-advanced-techniques.md).

6. **Push to Anki.** Batch-push all cards using `addNotes` (see [AnkiConnect payloads](#ankiconnect-payloads) below). Check the response array — `null` entries indicate failures.

7. **Report results.** Show the user: card count, deck name, and the full list of cards generated with their types.

## Workflow: Review existing cards

1. **Verify AnkiConnect** (same as generate workflow).

2. **Fetch cards.** Get a search query from the user (deck name, tags, or Anki search syntax). Retrieve note IDs with `findNotes`, then contents with `notesInfo`.

3. **Analyze.** Review each card against [references/01-card-formulation-principles.md](references/01-card-formulation-principles.md). Flag:
   - Multi-part answers (atomicity violation)
   - Ambiguous prompts admitting multiple valid answers
   - Missing topic context
   - Yes/no questions wasting retrieval capacity
   - Unordered sets or step enumerations
   - Excess wording

4. **Fix and update.** Rewrite problem cards and push fixes via `updateNoteFields`. When a card must be split (atomicity violation), delete the original with `deleteNotes` and push replacement cards with `addNotes`. Report all changes made.

## Example

**Source material:**

> The blood-brain barrier (BBB) is a highly selective semipermeable border of endothelial cells that prevents solutes in the circulating blood from non-selectively crossing into the extracellular fluid of the central nervous system. It allows the passage of water, some gases, and lipid-soluble molecules by passive diffusion, as well as the selective transport of glucose and amino acids. Its dysfunction is implicated in neurodegenerative diseases such as Alzheimer's and multiple sclerosis.

**Generated cards:**

Cloze — `modelName: "Cloze"`, field `Text`:
1. `The blood-brain barrier is formed by {{c1::endothelial cells}} that line brain capillaries.`
2. `The blood-brain barrier allows {{c1::lipid-soluble}} molecules to cross by passive diffusion.`
3. `Glucose crosses the blood-brain barrier via {{c1::selective active transport}}, not passive diffusion.`
4. `*Neurology*: Dysfunction of the {{c1::blood-brain barrier}} is implicated in Alzheimer's disease and multiple sclerosis.`

Basic — `modelName: "Basic"`, fields `Front`/`Back`:
5. `Front: Why can't most blood-borne solutes enter the brain freely?` / `Back: The blood-brain barrier's tight endothelial junctions block non-selective crossing into CNS extracellular fluid.`

Each card tests one fact, admits one answer, and is comprehensible in isolation.

## Card type defaults

| Type | When | Model | Fields |
|---|---|---|---|
| **Cloze** (default) | Facts, definitions, terminology, contextual knowledge | `Cloze` | `Text`, `Extra` |
| **Basic** | "Why" and "how" questions, explanations, causal reasoning | `Basic` | `Front`, `Back` |
| **Basic (and reversed card)** | Only when bidirectional recall is genuinely needed (foreign vocabulary, symbol↔name) | `Basic (and reversed card)` | `Front`, `Back` |

Default to Cloze. Reserve reversed cards for cases where both recognition and production are needed — every reversal doubles review load.

## AnkiConnect payloads

All requests: `POST http://localhost:8765`, JSON body, always include `"version": 6`.

**Batch add notes:**
```json
{
  "action": "addNotes",
  "version": 6,
  "params": {
    "notes": [
      {
        "deckName": "Target Deck",
        "modelName": "Cloze",
        "fields": {
          "Text": "The {{c1::mitochondria}} is the powerhouse of the cell.",
          "Extra": ""
        },
        "tags": ["biology", "cell-biology"]
      },
      {
        "deckName": "Target Deck",
        "modelName": "Basic",
        "fields": {
          "Front": "Why do mitochondria have their own DNA?",
          "Back": "They originated as independent prokaryotes engulfed by ancestral eukaryotic cells (endosymbiotic theory)."
        },
        "tags": ["biology", "cell-biology"]
      }
    ]
  }
}
```

**Update note fields:**
```json
{
  "action": "updateNoteFields",
  "version": 6,
  "params": {
    "note": {
      "id": 1234567890,
      "fields": {"Front": "Updated question", "Back": "Updated answer"}
    }
  }
}
```

**Delete notes:**
```json
{"action": "deleteNotes", "version": 6, "params": {"notes": [1234567890]}}
```

**Find and retrieve notes:**
```json
{"action": "findNotes", "version": 6, "params": {"query": "deck:MyDeck"}}
```
```json
{"action": "notesInfo", "version": 6, "params": {"notes": [1234567890, 1234567891]}}
```

### Gotchas

- Use `<br>` for newlines in fields — raw `\n` won't render.
- All model fields must be present as keys (use `""` for empty fields).
- Duplicates are rejected by default (same first field + model + deck).
- `addNotes` doesn't roll back on partial failure — check each returned ID for `null`.
- Cloze `Text` field must contain at least one `{{c1::...}}` deletion or the note will fail.

## Tagging

Auto-generate tags from the source material's topic hierarchy. Use lowercase, hyphenated: `machine-learning`, `linear-algebra`. When the source is identifiable, add a source tag: `source::deep-learning-book-ch3`.

## Edge cases

- **Unclear source material**: If the material is too dense or ambiguous to decompose into atomic cards, flag it. Do not generate cards for content the user hasn't understood — suggest they study it first.
- **Procedural knowledge**: Decompose into decision points, critical steps, and rationale — never enumerate steps as a list. See Principle 17 in [references/02-advanced-techniques.md](references/02-advanced-techniques.md).
- **Interfering concepts**: When generating cards for similar items, add distinguishing context and create explicit comparison cards ("How does X differ from Y?").
- **Large source material**: For sources that would yield 30+ cards, break into logical sections and process each separately to maintain quality.

## Reference material

- **Core principles (1–9)**: [references/01-card-formulation-principles.md](references/01-card-formulation-principles.md) — atomicity, precision, understanding, sets, yes/no, context-free, wording, interference, cloze defaults
- **Advanced techniques (10–19)**: [references/02-advanced-techniques.md](references/02-advanced-techniques.md) — conceptual depth, imagery, personalization, editing, redundancy, procedural decomposition, salience prompts, date-stamping, quick-reference checklist
