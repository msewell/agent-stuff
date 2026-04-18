# pi-extension-markdownlint-on-write

A standalone pi extension package that runs `markdownlint-cli2` after `write`/`edit` tool calls for `.md` files.

## Behavior

- Triggers only for `.md` paths.
- Runs `markdownlint-cli2 <absolute-path>`.
- Adds lint diagnostics to tool output when lint fails.
- Supports global modes:
  - `error` (default): marks the tool result as error
  - `warning`: reports lint issues but does not mark error

## Global config

- `~/.pi/agent/markdownlint-on-write.json`

Example:

```json
{
  "mode": "error"
}
```

## Command

- `/markdownlint-mode` → show current mode
- `/markdownlint-mode error` → strict mode
- `/markdownlint-mode warning` → warning mode

## Requirement

- `markdownlint-cli2` must be available in `PATH`.

## Package manifest

This package exposes its extension via:

- `package.json` -> `pi.extensions: ["./extensions"]`
