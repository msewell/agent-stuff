# pi-copy-latest-macos

Minimal pi extension for macOS.

It adds a single command:

- `/copy` — copies the latest assistant output to your clipboard using `pbcopy`

## Behavior

- Looks at the current branch of the conversation.
- Finds the latest assistant message (skipping aborted+empty assistant messages).
- Extracts text blocks only.
- Trims outer whitespace.
- Copies result via `pbcopy`.
- If there is no copyable assistant text, it does nothing.

## Install

```bash
# From local path
pi install /absolute/path/to/pi-copy-latest-macos

# Or temporary for one run
pi -e /absolute/path/to/pi-copy-latest-macos
```

## Development

```bash
npm install
npm test
npm run coverage
```

## Package metadata

This is a pi package. `package.json` contains:

```json
{
  "pi": {
    "extensions": ["./extensions"]
  }
}
```

## License

GPL-3.0-only
