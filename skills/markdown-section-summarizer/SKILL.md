---
name: markdown-section-summarizer
description: Summarizes Markdown files section-by-section with strict sentence budgets derived from source section length. Use when you need deterministic per-section summary quotas, inventory-first workflows, and mechanical verification that each section has exactly floor(sqrt(n)) summary sentences.
category: Agent Tooling
---

# Markdown Section Summarizer

Create section-aware Markdown summaries with strict, auditable sentence counts.

## Workflow

1. Build an inventory from the source Markdown.
2. Write a section-by-section summary that follows the inventory sentence targets.
3. Verify that the summary exactly matches the inventory sentence targets.
4. If verification fails, revise and re-run verification until it passes.

## Setup

```bash
python3 -m pip install -r markdown-section-summarizer/scripts/requirements.txt
```

## Commands

```bash
python3 markdown-section-summarizer/scripts/build_inventory.py input.md -o input.inventory.json
# write input.summary.md with the current agent, following inventory targets
python3 markdown-section-summarizer/scripts/verify_summary.py input.md --inventory input.inventory.json --summary input.summary.md
```

## Guarantees

- Section budgets are computed as `floor(sqrt(n))`, where `n` is source sentence count for that section.
- Sentence counting is deterministic and shared across inventory/build/verify scripts.
- Summary verification fails on any section count mismatch.
- Source hash is enforced: stale inventory files are rejected.

## Sectioning Rules

- Supports ATX and Setext headings.
- Uses direct-body sectioning: content belongs to the nearest active heading.
- Includes a `_preamble` pseudo-section for text before the first heading.
- Counts prose in paragraphs, list items, and blockquotes.
- Ignores code blocks and tables for sentence counting.

## Generation Strategy

- This skill is designed for the current agent to write the summary directly.
- The verifier is the hard gate for exact section sentence budgets.

## Examples

**Input:** `docs/guide.md`

1. Build inventory:
   `python3 markdown-section-summarizer/scripts/build_inventory.py docs/guide.md -o docs/guide.inventory.json`
2. Ask the agent to write `docs/guide.summary.md` with exact per-section sentence targets from the inventory.
3. Verify:
   `python3 markdown-section-summarizer/scripts/verify_summary.py docs/guide.md --inventory docs/guide.inventory.json --summary docs/guide.summary.md`

**Expected output:**

- Verifier prints `PASS: summary matches inventory targets.` when all sections match.
- Verifier prints `FAIL:` and section-by-section mismatches when any section is off-target.
