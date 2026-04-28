---
name: markdown-section-summarizer
description: Summarizes Markdown files section-by-section with strict sentence budgets derived from source section length. Use when you need deterministic per-section summary quotas, inventory-first workflows, and mechanical verification that each section has exactly floor(sqrt(n)) summary sentences.
category: Agent Tooling
---

# Markdown Section Summarizer

Create section-aware Markdown summaries with strict, auditable sentence counts.

## Workflow

1. Build an inventory from the source Markdown, specifying the document language.
2. Generate the summary file directly from the inventory. It contains all section
   headings, preserved image embeds, and per-section sentence-count comment blocks.
3. Fill in each section's content by writing the target number of sentences after
   each comment block.
4. Verify that the summary exactly matches the inventory sentence targets.
5. If verification fails, revise the flagged sections and re-run verification.

## Setup

```bash
python3 -m pip install -r markdown-section-summarizer/scripts/requirements.txt
```

## Commands

```bash
# Step 1 — build inventory (--language is required; use the ISO 639-1 code of the source document)
python3 markdown-section-summarizer/scripts/build_inventory.py input.md --language en -o input.inventory.json

# Step 2 — generate summary file (headings + preserved images + sentence-count placeholders)
python3 markdown-section-summarizer/scripts/generate_summary.py input.inventory.json -o input.summary.md

# Step 3 — fill in input.summary.md: write the target number of sentences after each comment block

# Step 4 — verify
python3 markdown-section-summarizer/scripts/verify_summary.py input.md --inventory input.inventory.json --summary input.summary.md
```

Supported language codes (pysbd): `am ar bg da de el en es fa fr hi hy it ja kk mr my nl pl ru sk ur zh`

## Guarantees

- Section budgets are computed as `floor(sqrt(n))`, where `n` is source sentence count for that section.
- Sentence counting is deterministic and shared across inventory/build/verify scripts.
- The language used at inventory build time is stored in the inventory and automatically reused by the verifier — you never pass `--language` to `verify_summary.py`.
- Summary verification fails on any section count mismatch.
- Source hash is enforced: stale inventory files are rejected.

## Sectioning Rules

- Supports ATX and Setext headings.
- Uses direct-body sectioning: content belongs to the nearest active heading.
- Includes a `_preamble` pseudo-section for text before the first heading.
- Counts prose in paragraphs, list items, and blockquotes.
- Ignores code blocks and tables for sentence counting.
- Strips YAML frontmatter before parsing; frontmatter never appears as a section.
- Image embeds (`![alt](path)`) are extracted from prose and excluded from sentence
  counts. They are preserved in the summary file and do not affect sentence targets.

## Summary File Format

Each section has a heading, followed by any image embeds preserved from the source,
followed by a comment block:

```markdown
## Section Heading
<!-- source: 12 sentences (lines 47–61) | target: 3 sentences -->
![Descriptive caption](path/to/image.png)

## Section Heading (no image)
<!-- source: 12 sentences (lines 47–61) | target: 3 sentences -->

## Empty Section
<!-- source: 0 sentences (lines 95–96) | target: 0 sentences — leave empty -->
```

The comment block is for reference only — the verifier ignores HTML comments.
Image lines are also ignored by the sentence counter.
Sections marked "leave empty" must have no prose in the summary.

## Generation Strategy

- This skill is designed for the current agent to write the summary directly.
- Always generate the summary file with `generate_summary.py` before writing any
  content: it guarantees all section headings are present with correct levels and
  text, and all image embeds are pre-populated. The verifier requires both before
  it can validate any individual sentence count.
- The verifier checks that the summary's section ID list exactly matches the
  inventory before checking individual sentence counts. A partial file (missing
  any headings) fails immediately on the ID check.
- Use the line range in each comment block to locate the original section when
  deciding what to summarise.
- Write prose after the comment block and after any pre-placed image embeds. The
  verifier counts only prose sentences — image lines are ignored.

## Examples

**Input:** `docs/guide.md` (English)

```bash
python3 markdown-section-summarizer/scripts/build_inventory.py docs/guide.md --language en -o docs/guide.inventory.json
python3 markdown-section-summarizer/scripts/generate_summary.py docs/guide.inventory.json -o docs/guide.summary.md
# fill in docs/guide.summary.md — write prose after each comment block
python3 markdown-section-summarizer/scripts/verify_summary.py docs/guide.md --inventory docs/guide.inventory.json --summary docs/guide.summary.md
```

**Expected output:**

- `build_inventory.py` prints a section inventory table.
- `generate_summary.py` prints the output path, language, and section counts.
- Verifier prints `PASS: summary matches inventory targets.` when all sections match.
- Verifier prints `FAIL:` and section-by-section mismatches when any section is off-target.
