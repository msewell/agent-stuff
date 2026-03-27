# CLI modes and failure handling

## Deterministic output modes

Use `--json` when downstream logic parses fields such as `success`, `markdown`,
`title`, or `error`.

```bash
markit <source> --json
```

Use `-q` when raw markdown is the final artifact or passed to another command.

```bash
markit <source> -q
```

## Typical commands

```bash
# Local file to markdown
markit report.pdf -q

# URL to markdown
markit https://example.com/article -q

# Write result to file
markit slides.pptx -o slides.md

# Check supported formats
markit formats
```

## Failure triage

1. Verify CLI availability:
   ```bash
   markit --version
   ```
2. If missing, install globally:
   ```bash
   npm install -g markit-ai
   ```
3. For unsupported formats, check `markit formats` and pick a supported source.
4. For file errors, re-check absolute/relative path and current working directory.
5. For URL failures, retry once, then surface the failing URL and command output.
6. For missing AI provider keys, continue with non-AI extraction where possible.
