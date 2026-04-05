# TCR Variants, Implementation Patterns, and Script Reference

## Table of Contents

- [The Original (Hard Revert)](#the-original-hard-revert)
- [The Relaxed (Partial Revert)](#the-relaxed-partial-revert)
- [The Gentle (Stash-Based Recovery)](#the-gentle-stash-based-recovery)
- [Other Variants](#other-variants)
- [Pattern 1: Minimal TCR Script](#pattern-1-minimal-tcr-script)
- [Pattern 2: Relaxed TCR Script](#pattern-2-relaxed-tcr-script)
- [Pattern 3: Agent Loop with TCR](#pattern-3-agent-loop-with-tcr)
- [Pattern 4: Human Tests, Agent Implements](#pattern-4-human-tests-agent-implements)
- [General-Purpose Script: Usage](#general-purpose-script-usage)
- [General-Purpose Script: Modes](#general-purpose-script-modes)

---

## The Original (Hard Revert)

```bash
./test.sh && git commit -am "working" || git reset --hard
```

Tests pass → commit. Tests fail → hard reset to HEAD. All changes lost,
including new tests.

**When to use:** Fully autonomous loops (Level 3–4) where the agent generates
both tests and implementation. The agent has no attachment to lost code and
benefits from the cleanest possible reset.

## The Relaxed (Partial Revert)

```bash
./build.sh && (./test.sh && git commit -am "working" || git checkout HEAD -- src/)
```

Build failure → nothing happens. Test failure → only production code (`src/`)
is reverted; test code is preserved. Test pass → commit.

**When to use:** Human-writes-tests, agent-writes-implementation workflows
(Level 2). The human's test investment is protected.

**Requires** clear directory separation between test and production code.

## The Gentle (Stash-Based Recovery)

```bash
./build.sh && (./test.sh && git commit -am "working" || (git stash push -m "failed-attempt" && git checkout HEAD -- .))
```

Same as hard revert, but failed code is stashed before reverting. Recoverable
via `git stash pop`.

**When to use:** Debugging agent failures — understanding *why* an attempt
failed before the next try. Use temporarily during debugging, not as a
permanent workflow. Stash accumulation becomes noisy.

## Other Variants

| Variant | Mechanism | Agent Relevance |
|---------|-----------|-----------------|
| **Build-First (BTCR)** | `build && (test && commit \|\| revert)` — compilation failure does nothing | Essential for compiled languages; prevents reverting code that simply doesn't compile yet |
| **The Buddy** | `while true; do tcr; done` — continuous loop | Natural fit for file-watcher agents that trigger on save |
| **The Watch Buddy** | `inotifywait` triggers TCR on file change | More efficient than polling; good for agents that edit files directly |
| **The Collaborator** | Adds `git pull --rebase && git push` loop | Multi-agent synchronization on a shared branch |
| **The Storyteller** | Replaces silent revert with explanatory messages | Could feed failure context back to an agent for better retries |

---

## Pattern 1: Minimal TCR Script

The simplest possible TCR wrapper. Suitable for any language and any agent.

```bash
#!/usr/bin/env bash
# tcr.sh — minimal TCR script
# Usage: ./tcr.sh <test-command>

set -euo pipefail

TEST_CMD="${1:?Usage: ./tcr.sh <test-command>}"

if eval "$TEST_CMD"; then
    git add -A && git commit -m "tcr: green"
    echo "✓ Tests passed — committed."
else
    git checkout .
    echo "✗ Tests failed — reverted."
fi
```

## Pattern 2: Relaxed TCR Script

Reverts only production code on failure. Requires separate source and test
directories.

```bash
#!/usr/bin/env bash
# tcr-relaxed.sh — revert production code only, preserve tests
# Usage: ./tcr-relaxed.sh <test-command> <source-dir>

set -euo pipefail

TEST_CMD="${1:?Usage: ./tcr-relaxed.sh <test-command> <source-dir>}"
SRC_DIR="${2:?Provide source directory (e.g., src/)}"

if eval "$TEST_CMD"; then
    git add -A && git commit -m "tcr: green"
    echo "✓ Tests passed — committed."
else
    git checkout HEAD -- "$SRC_DIR"
    echo "✗ Tests failed — reverted $SRC_DIR (tests preserved)."
fi
```

## Pattern 3: Agent Loop with TCR

A generic loop structure for an autonomous agent using TCR. Replace
`AGENT_GENERATE` with the agent's CLI invocation.

```bash
#!/usr/bin/env bash
# agent-tcr-loop.sh — autonomous agent loop with TCR guardrail

set -euo pipefail

TEST_CMD="npm test"
MAX_ATTEMPTS=10
FEATURE_SPEC="$1"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
    echo "--- Attempt $attempt/$MAX_ATTEMPTS ---"

    AGENT_GENERATE "$FEATURE_SPEC"

    if eval "$TEST_CMD"; then
        git add -A && git commit -m "tcr: $FEATURE_SPEC (attempt $attempt)"
        echo "✓ Committed on attempt $attempt."
        exit 0
    else
        git checkout .
        echo "✗ Reverted. Retrying..."
    fi
done

echo "✗ Failed after $MAX_ATTEMPTS attempts."
exit 1
```

## Pattern 4: Human Tests, Agent Implements

Inspired by sublayerapp/tcr_agent. The human writes tests; the agent examines
them and generates implementation.

**Workflow:**

1. Human writes a new test (or modifies an existing one).
2. Human triggers the agent (manual trigger — deliberate control is better
   than file-save triggering to avoid accidental reverts from partial saves).
3. The agent reads the test, reads the current implementation, and generates
   a modified implementation.
4. TCR runs: `test && commit || revert`.
5. If reverted, the human can refine the test (make it smaller, more specific)
   and trigger again.

---

## General-Purpose Script: Usage

The bundled `scripts/tcr.sh` supports all three revert strategies, retry
loops, and verbose output. See the full source with `cat scripts/tcr.sh`.

```
./tcr.sh <test-command> [options]

Options:
  --mode <hard|relaxed|gentle>   Revert strategy (default: hard)
  --src <dir>                    Source dir to revert in relaxed mode (required for relaxed)
  --max-retries <n>              Retry attempts before giving up (default: 1, no retry)
  --retry-delay <seconds>        Delay between retries (default: 0)
  --msg <prefix>                 Commit message prefix (default: "tcr")
  --verbose                      Print detailed output
```

## General-Purpose Script: Modes

**hard** (default): Revert all uncommitted changes on test failure. Cleanest
reset — use for autonomous agent loops.

**relaxed**: Revert only the `--src` directory on failure; other files
(including tests) are preserved. Requires `--src` flag. Use when test files
should survive a revert.

**gentle**: Stash failed changes before reverting. Recover with
`git stash list` and `git stash pop`. Use temporarily for debugging failed
agent attempts.
