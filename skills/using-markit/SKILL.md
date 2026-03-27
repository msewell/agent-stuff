---
name: using-markit
description: Converts files and URLs to markdown with markit for agent workflows. Selects deterministic modes (--json for machine-readable parsing, -q for raw markdown output), handles installation and conversion failures, and applies safe defaults for optional AI description/transcription. Use when users ask to convert or extract text, turn a document or webpage into markdown, transcribe audio, or describe images from PDF, DOCX, PPTX, XLSX, HTML, EPUB, CSV, JSON, XML, ZIP, URL, image, or audio sources.
category: Agent Tooling
---

# Using Markit

Use this skill to run `markit` reliably in terminal-based agent workflows.

## Scope

- Convert files and URLs to markdown.
- Use deterministic output modes for downstream automation.
- Troubleshoot common failures.

Do not cover plugin authoring, provider authoring, or onboarding context files unless the user explicitly asks.

## Defaults

1. Prefer the global `markit` command.
2. If `markit` is missing, install globally with `npm install -g markit-ai`.
3. Use `--json` when the result will be parsed or used for branching decisions.
4. Use `-q` when raw markdown should be piped/copied as-is.
5. Do not mutate config/provider settings unless the user asks.
6. Do not run `markit onboard`.

## Workflow

1. **Validate source and intent**
   - Identify source type: local file, URL, or stdin.
   - For binary formats (PDF, DOCX, images, audio), prefer file paths over stdin.
   - Confirm whether output should be parsed (`--json`) or emitted as markdown (`-q`).

2. **Preflight command availability**
   - Check tool presence:
     - `markit --version`
   - If missing:
     - `npm install -g markit-ai`
     - Re-run `markit --version`

3. **Run conversion with the correct mode**
   - Structured mode:
     - `markit <source> --json`
   - Raw markdown mode:
     - `markit <source> -q`
   - Write to file:
     - `markit <source> -o <output.md>`
   - URL conversion:
     - `markit https://example.com/article -q`

4. **Handle result deterministically**
   - In `--json` mode, read:
     - `success`
     - `markdown` (or `error`)
     - `title` when present
   - If writing to file (`-o`), verify success from command exit/output.

5. **Recover from failures**
   - Unsupported format:
     - Run `markit formats` and choose a supported input path.
   - File not found:
     - Recheck path and working directory.
   - URL fetch failure:
     - Retry once; then report status and source URL.
   - AI description/transcription missing:
     - Continue with non-AI extraction and report missing provider/key setup.

## Output mode policy

- Choose `--json` when you need reliable machine parsing.
- Choose `-q` when markdown is the final artifact or will be piped.
- Avoid plain human mode in automated chains unless the user asks for human-readable terminal output.

## AI features (optional, only when requested)

Use for image description and audio transcription.

- OpenAI provider (default) supports image description + transcription.
- Anthropic provider supports image description (no transcription in current built-in provider).

Typical setup:

```bash
export OPENAI_API_KEY=sk-...
markit photo.jpg -q
markit recording.mp3 -q
```

Prompt focus for images:

```bash
markit receipt.jpg -p "Extract all line items and prices as a table" -q
```

## Examples

**Input:** Convert a PDF and parse result in an automated flow.
**Command:** `markit report.pdf --json`
**Output:** JSON with `success`, `source`, optional `title`, and `markdown` (or `error` on failure).

**Input:** Convert a DOCX and pass raw markdown to another tool.
**Command:** `markit document.docx -q`
**Output:** Markdown only (no extra decoration).

**Input:** Convert a webpage to markdown.
**Command:** `markit https://example.com -q`
**Output:** Markdown extracted from fetched page content.

**Input:** Convert slides and persist the result.
**Command:** `markit slides.pptx -o slides.md`
**Output:** `slides.md` written to disk; command success confirms write.

**Input:** Confirm whether a format is supported before conversion.
**Command:** `markit formats`
**Output:** List of built-in and plugin-provided formats.

## Guardrails

- Prefer explicit file paths for binary documents.
- Do not assume AI keys exist; detect and degrade gracefully.
- Keep conversion steps idempotent and reproducible.
- Report exact failing command and error when conversion fails.

## Reference material

- [CLI modes and failure handling](references/01-cli-modes-and-failures.md)
