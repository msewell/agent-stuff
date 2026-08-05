# pi-extension-agent-comment-watcher

A Pi extension that watches explicitly named directory trees for `@agent` review
comments and reports matching `rg` output into the active Pi session. It gives a
reviewer a file-based way to interrupt work without relying on a terminal
background-task feature.

## Install

From this repository:

```sh
pi install ./extensions/pi-extension-agent-comment-watcher
```

Pi registers a local package by path, so subsequent runs load the version in
this checkout.

## Usage

Ask Pi to start watching the directories you want reviewed. Every directory
must be named explicitly; for example:

> Start watching `.` for `@agent` comments.

The `watch_agent_comments` tool supports:

- `start` — requires a non-empty `directories` array, such as `["."]` or
  `["src", "tests"]`.
- `status` — reports whether the current session has an active watcher.
- `stop` — stops the current session's watcher.

The matching slash command works without an LLM tool call, which is useful in
sessions whose tool schema predates the extension:

```text
/watch-agent-comments start .
/watch-agent-comments status
/watch-agent-comments stop
```

Starting performs a scan immediately, then polls every five seconds. A match
is injected as a Pi custom message containing only the raw `rg` output. The
message uses Pi's `steer` delivery mode, so it is handled immediately after the
current tool batch. Identical output is reported only once; a later changed
result is reported again.

## Search behavior

The watcher matches literal `@agent` text with four lines of context and
excludes `.git`, `node_modules`, `dist`, `build`, `.next`, and `coverage`.
It uses `rg -uu`, so hidden and ignored files are included.

Using `rg -uu` can expose secret values in nearby context from files
such as `.env`. Only watch directories whose content you are willing to add to
the active Pi session.

## Requirements

- Pi
- [`rg` (ripgrep)](https://github.com/BurntSushi/ripgrep) in `PATH`

## Development

```sh
npm install
npm run typecheck
npm test
```

The tests mock Pi's extension API and verify the explicit-directory contract,
search arguments, initial reporting, deduplication, and session shutdown.
