# pi-queue

A Claude Code mod that adds [pi](https://github.com/badlogic/pi-mono)'s
follow-up queue next to Claude Code's own steering.

- **Enter** while Claude works steers, as Claude Code does on its own.
- **Option+Enter** holds the message until Claude finishes the turn, then
  sends it as a turn of its own, oldest first.
- **Option+Up** puts held follow-ups back into the input box. Esc, `/clear`
  and a resume do too.

A follow-up with an image or other attachment isn't held; it stays in the
input box.

## Setup

Load the folder in every session, in the `env` block of Claude Code's `settings.json`:

```json
"CLAUDE_CODE_PLUGIN_DIRS": "/path/to/claude-pi-queue"
```

Bind the keys in `keybindings.json` next to it:

```json
{
  "context": "Chat",
  "bindings": {
    "meta+enter": "chat:queueSubmit",
    "meta+up": "command:pi-queue-take-back"
  }
}
```

## Develop

Claude Code writes the editor types into `.claude-plugin/types/` the first
time it loads the mod; `tsconfig.json` extends them.

```sh
claude plugin validate .
claude plugin test .
npx -p typescript tsc -p . --noEmit
```
