# pi-extension-code-last

A pi extension that adds `/code-last` to open the last assistant message in a new VS Code window.

## What it does

- Finds the last assistant message on the current session branch.
- Uses `/copy`-equivalent extraction semantics (text blocks only, trimmed).
- Writes the content to a timestamped Markdown file in the system temp directory.
- Opens the file with `code -n`.

## Requirements

- `code` must be available in your `PATH`.
- In VS Code, run: `Shell Command: Install 'code' command in PATH` if needed.

## Usage

Load directly:

```bash
pi -e ./extensions/code-last.ts
```

Or install this package (manually later) and run:

```text
/code-last
```

## Package manifest

This package exposes its extension via:

- `package.json` -> `pi.extensions: ["./extensions"]`
