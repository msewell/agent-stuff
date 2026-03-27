---
name: searching-and-extracting-web-with-parallel-cli
description: Runs Parallel CLI web search and URL extraction in non-interactive, JSON-first mode for AI agents. Chooses between `parallel-cli search` and `parallel-cli extract`, applies fast defaults, and adds source/date filters when needed. Use when the user asks to discover current web sources, gather citations from specific domains, or extract targeted information from known URLs.
category: Agent Tooling
allowed-tools: Bash
---

# Searching and Extracting Web Content with Parallel CLI

## Quick start

1. Verify auth once:
   - `parallel-cli auth --json`
2. For topic discovery, run search in JSON mode:
   - `parallel-cli search "<objective>" --mode fast --max-results 8 --json`
3. For known URLs, run extract in JSON mode:
   - `parallel-cli extract <url1> [url2 ...] --json`

## Prerequisites

- Require `parallel-cli` to be installed and authenticated.
- Avoid assuming `jq`/`xargs` are available; keep commands portable.

## Non-goals

- General file/URL-to-markdown conversion tasks.
- OCR, image description, or audio transcription.
- Unbounded browsing without a concrete search or extraction objective.

## Workflow

1. Determine intent:
   - Use `search` when the user provides a question/topic and needs source discovery.
   - Use `extract` when the user provides specific URLs and needs targeted extraction.
   - Use both when the user needs discovery first, then page-level extraction.
   - If the task is only to convert already-known sources into markdown, use a direct conversion command instead.

2. Run `search` with agent-safe defaults:
   - Always include `--json`.
   - Default to `--mode fast --max-results 8`.
   - If user names trusted sources, map them to `--include-domains`.
   - If recency matters, add `--after-date YYYY-MM-DD`.

3. Run `extract` for selected URLs:
   - Always include `--json`.
   - Add `--objective "..."` when the user wants targeted extraction.
   - Add `--full-content` only when full page text is explicitly needed.

4. Return structured results:
   - For search, report: `search_id`, top results (`title`, `url`, optional `publish_date`), and warnings.
   - For extract, report: `extract_id`, per-URL result status/content, and errors.

5. Handle failures deterministically:
   - Exit code `3`: auth issue → ask for login/API key setup.
   - Exit code `4`: API failure → retry once with simplified arguments.
   - Exit code `5`: timeout → retry with narrower scope (fewer results or fewer URLs).

## Examples

### Search with source and date constraints

```bash
parallel-cli search "latest EU AI Act implementation guidance" \
  --mode fast \
  --max-results 8 \
  --include-domains europa.eu \
  --after-date YYYY-MM-DD \
  --json
```

### Extract specific content from known URLs

```bash
parallel-cli extract \
  https://example.com/report \
  https://example.com/faq \
  --objective "Extract pricing changes and effective dates" \
  --json
```

### Discover first, then extract top 3 URLs

```bash
parallel-cli search "SOC 2 compliance automation tools" \
  --mode fast \
  --max-results 8 \
  --json \
  --output search.json

# Then extract the URLs selected from search.json
parallel-cli extract <url1> <url2> <url3> --json
```

## Edge cases

- No auth: stop and request auth instead of continuing with partial behavior.
- Empty search results: suggest relaxing domain/date filters before retrying.
- Large content responses: avoid `--full-content` unless explicitly requested.
- Long prompt text: pass via stdin:
  - `echo "<objective>" | parallel-cli search - --json`
