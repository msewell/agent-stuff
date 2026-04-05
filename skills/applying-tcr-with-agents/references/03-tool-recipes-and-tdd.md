# Tool-Specific Recipes and TDD

## Table of Contents

- [Claude Code](#claude-code)
- [Aider](#aider)
- [Generic Bash (Any Agent)](#generic-bash-any-agent)
- [TDD vs TCR: Resolving the Conflict](#tdd-vs-tcr-resolving-the-conflict)
- [The Tests-as-Specs Paradigm](#the-tests-as-specs-paradigm)

---

## Claude Code

Claude Code's architecture already mirrors TCR: gather context, take action,
verify results, iterate. Adding explicit TCR tightens this loop.

### PostToolUse hook for TCR

Fire a TCR cycle after every file modification:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "bash -c './tcr.sh \"npm test\" || exit 0'"
      }
    ]
  }
}
```

The `|| exit 0` prevents the hook from blocking the execution loop. The agent
sees the test output and reacts to failures. For a harder guardrail, omit
`|| exit 0` — a non-zero exit surfaces feedback but does not block the tool.

### PreToolUse hook to block manual reverts

Prevent the agent from bypassing TCR with manual git commands:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash -c 'echo \"$CLAUDE_TOOL_INPUT\" | grep -qE \"git reset --hard|git checkout \\.\" && echo \"BLOCKED: Use the TCR script instead of manual reverts.\" && exit 2 || exit 0'"
      }
    ]
  }
}
```

### Built-in checkpoints

Claude Code automatically checkpoints before each edit. If a TCR revert feels
too aggressive, `/rewind` restores a previous state more selectively —
restoring code, conversation, or both independently. Checkpoints persist for
30 days and work alongside (not as a replacement for) git-based TCR.

### Project-level agent instructions

Add TCR behavioral rules to `AGENTS.md`, `CLAUDE.md`, or equivalent
project-level agent configuration:

```markdown
## Workflow: TCR Discipline

- After every code change, run the test suite before proceeding.
- If tests fail, revert your changes and try a smaller step.
- Never build on top of failing tests.
- Commit after every green test run.
- Keep changes small enough to pass on the first attempt.
```

This provides behavioral guidance that aligns with TCR principles, even
without the mechanical automation.

---

## Aider

Aider has mature built-in support for TCR-adjacent workflows.

### Configuration (`.aider.conf.yml`)

```yaml
# Auto-commit after every successful edit
auto-commits: true

# Run linter after every change
auto-lint: true
lint-cmd: "python: flake8 --select=E,W"

# Run tests after every change
auto-test: true
test-cmd: "pytest -x --tb=short"
```

With `auto-commits: true` and `auto-test: true`, Aider implements a form of
TCR: generate code, run tests, commit on success. The missing piece is
automatic *revert* on failure — Aider instead attempts to fix failing tests
by analyzing error output.

### Adding hard TCR revert to Aider

Wrap Aider in a script that reverts if tests fail after Aider's changes:

```bash
#!/usr/bin/env bash
# aider-tcr.sh — run Aider with TCR revert on failure

aider --auto-test --test-cmd "pytest -x" --message "$1"

# After Aider exits, verify tests pass
if ! pytest -x; then
    git reset --hard HEAD~1  # Undo Aider's commit
    echo "✗ Aider's changes failed tests — reverted."
fi
```

Aider's `/undo` command reverts the last commit and informs Aider — a manual
TCR revert for interactive sessions.

---

## Generic Bash (Any Agent)

For agents that edit files directly (via CLI, API, or file system), wrap the
agent invocation in a TCR script:

```bash
#!/usr/bin/env bash
# generic-agent-tcr.sh

set -euo pipefail

AGENT_CMD="$1"       # e.g., "claude --message 'implement X'"
TEST_CMD="$2"        # e.g., "pytest -x"
MAX_RETRIES="${3:-5}"

for i in $(seq 1 "$MAX_RETRIES"); do
    eval "$AGENT_CMD"

    if eval "$TEST_CMD"; then
        git add -A && git commit -m "tcr: green (attempt $i)"
        echo "✓ Committed."
        exit 0
    else
        git checkout .
        echo "✗ Attempt $i failed — reverted."
    fi
done

echo "✗ All $MAX_RETRIES attempts failed."
exit 1
```

---

## TDD vs TCR: Resolving the Conflict

In classical TDD (red-green-refactor), step 1 writes a failing test. In TCR,
a failing test triggers a revert — destroying the test itself. There is no
"red" phase.

### Resolution for autonomous agents

The agent writes a test *and* the implementation to pass it in a single
atomic change:

1. Write the test and implementation together.
2. TCR runs on the combined change.
3. If both pass all existing tests plus the new one → commit.
4. If anything fails → revert the whole thing and try a smaller step.

This forces coherent, self-contained increments — exactly the discipline TCR
was designed to teach.

### Alternative: separation of concerns

If tests come from a human (Level 2 workflow):

1. Human writes tests (outside the TCR loop or using relaxed mode).
2. Agent writes implementation (inside the TCR loop).
3. TCR mediates: implementation passes the tests (commit) or doesn't (revert
   implementation only).

This is TDD from the human's perspective and TCR from the agent's.

---

## The Tests-as-Specs Paradigm

As agents become more capable, the human's role shifts from writing code to
writing specifications. Tests are the most rigorous form of specification —
executable, unambiguous, and automatically verifiable.

TCR formalizes this: **write the spec (test), the agent writes the
implementation, and TCR enforces the contract.**
