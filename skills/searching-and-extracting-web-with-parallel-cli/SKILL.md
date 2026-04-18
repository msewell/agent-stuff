---
name: searching-and-extracting-web-with-parallel-cli
description: Runs Parallel CLI web search and URL extraction in non-interactive, text-first mode for AI agents. Chooses between `parallel-cli search` and `parallel-cli extract`, applies fast defaults, and adds source/date filters when needed. Use when the user asks to discover current web sources, gather citations from specific domains, or extract targeted information from known URLs.
category: Agent Tooling
allowed-tools: Bash
---

# Searching and Extracting Web Content with Parallel CLI

## Prerequisites

- `parallel-cli` must be installed and available on `PATH`.
- Verify authentication once per task when needed:
  - `parallel-cli auth`

## Non-goals

- General file/URL-to-markdown conversion tasks.
- OCR, image description, or audio transcription.
- Unbounded browsing without a concrete search or extraction objective.
- Interactive browser automation workflows (click/fill/login/stateful
  navigation).
- Single-page interaction loops where the agent must act on DOM elements by
  node ID.
- `parallel-cli` setup and account provisioning guidance.

## Default command profiles

### Search (default)

```bash
parallel-cli search "<objective>" \
  --mode fast \
  --max-results 5 \
  --excerpt-max-chars-per-result 800 \
  --excerpt-max-chars-total 6000
```

### Search with source/recency constraints

```bash
parallel-cli search "<objective>" \
  --mode fast \
  --max-results 5 \
  --include-domains <domain1,domain2> \
  --after-date YYYY-MM-DD \
  --excerpt-max-chars-per-result 800 \
  --excerpt-max-chars-total 6000
```

### Extract

Use only selected URLs (best few first), and keep excerpts small.

```bash
parallel-cli extract <url1> <url2> <url3> \
  --objective "<what to pull out>" \
  --excerpt-max-chars-per-result 700 \
  --excerpt-max-chars-total 2100
```

Notes:

- `extract --no-excerpts` alone is invalid (it errors unless full content is requested).

## Refinement strategy

If results are weak or noisy, refine automatically in this order:

1. Narrow query terms (more specific entities/version/date).
2. Add `--include-domains` for trusted sources.
3. Add `--after-date` for recency-sensitive tasks.

## Failure handling

- Exit code `3` (auth): report auth issue and required setup.
- Exit code `4` (API failure): retry once with simpler args (fewer filters/URLs).
- Exit code `5` (timeout): retry with reduced scope (fewer results, fewer URLs, tighter objective).

## Output format to user

Return only high-signal results:

- Key findings (concise bullets)
- Source list (title + URL, optional date)
- Notable uncertainty/gaps
