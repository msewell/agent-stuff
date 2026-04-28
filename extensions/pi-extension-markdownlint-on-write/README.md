# pi-extension-markdownlint-on-write

A standalone pi extension package that runs `markdownlint-cli2` after `write`/`edit` tool calls for `.md` files.

## Behavior

- Triggers only for `.md` paths.
- Runs:
  - `markdownlint-cli2 <absolute-path> --config ~/.pi/agent/markdownlint-on-write.json --configPointer /rules`
- Adds lint diagnostics to tool output when lint fails.
- Supports global modes:
  - `error` (default): marks the tool result as error
  - `warning`: reports lint issues but does not mark error
- Global extension rules are the base config; local project `.markdownlint*` files can override them.
- Fails fast for invalid extension config JSON/shape.

## Global config

- `~/.pi/agent/markdownlint-on-write.json`
- Auto-seeded on first run if missing.

Default seeded config:

```json
{
  "mode": "error",
  "rules": {
    "MD013": false
  }
}
```

`rules` accepts a full markdownlint rule config object.

## Command

- `/markdownlint-mode` → show current mode
- `/markdownlint-mode error` → strict mode
- `/markdownlint-mode warning` → warning mode

## Requirement

- `markdownlint-cli2` must be available in `PATH`.

## Package manifest

This package exposes its extension via:

- `package.json` -> `pi.extensions: ["./extensions"]`
