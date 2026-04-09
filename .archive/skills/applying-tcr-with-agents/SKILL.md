---
name: applying-tcr-with-agents
description: "Applies TCR (test && commit || revert) discipline as a workflow and guardrail for AI-assisted software development. Sets up TCR scripts, selects revert strategies, integrates with tool-specific hooks, and configures guardrails for autonomous agent loops. Use when implementing test-and-commit-or-revert workflows, adding automatic revert on test failure, setting up agent coding loops with safety nets, enforcing small steps via automatic commit on green and revert on red, or when the user mentions TCR, test && commit || revert, automatic revert on failing tests, or coding loop guardrails."
category: Agent Tooling
---

# Applying TCR with Agents

TCR automatically commits when tests pass and reverts when they fail. Every
surviving change keeps the system green. Broken code never persists.

## Setup

1. Copy `scripts/tcr.sh` from this skill into the project root.
2. Make it executable: `chmod +x tcr.sh`.
3. Add `.agent-failures.log` to `.gitignore` (prevents failure logs from
   being committed by `git add -A`).
4. Verify the project has at least one git commit and a working test command.

## Incompatibility with classical TDD red-phase discipline

In classical TDD, a lone failing test is written first and confirmed to fail
before any implementation is written. **TCR makes that impossible:** a
failing test triggers a full revert, destroying the test itself. There is no
stable red phase.

When using TCR, replace the red/green/refactor cycle with the rule in step 3
below: test and implementation are written together as one coherent atomic
change. This is TCR's substitute for the red phase — the discipline comes
from keeping the unit as small as possible, not from a separate failing-test
step. Do not apply a red-first TDD workflow alongside mechanical TCR
automation.

## Workflow

Work in small, atomic steps. Each step includes both a test and the
implementation to pass it, committed as a single unit.

1. **Reset the failure log:** `> .agent-failures.log`
2. **Identify the smallest next increment.** Pick one behavior that can be
   tested and implemented together.
3. **Write the test and implementation in one atomic change.** Both must be
   coherent — the new test must pass alongside all existing tests.
4. **Run TCR:**
   ```bash
   ./tcr.sh "<test-command>"
   ```
5. **If committed (tests passed):** proceed to the next increment.
6. **If reverted (tests failed):** log what failed, then try a smaller step:
   ```bash
   # After revert, record the failure for future attempts
   echo "Attempt N: <what was tried and why it failed>" >> .agent-failures.log
   ```
   Consult `.agent-failures.log` before each new attempt to avoid repeating
   the same mistake. Do not attempt to "fix the fix" — start fresh from
   the clean state.
7. **Repeat** until the feature is complete.
8. **Squash before pushing.** TCR auto-commits (`tcr: green`, `tcr: green
   (attempt 3)`) are ephemeral bookkeeping — they are not project history.
   Squash them into one meaningful commit before pushing:
   ```bash
   git rebase -i $(git merge-base HEAD main)
   ```
   Mark all TCR commits as `squash` (or `s`) except the first, then write
   a single commit message that describes *what* changed and *why* — not
   how many TCR attempts it took. Format: imperative mood, ≤50 character
   subject, body for non-trivial changes. The TCR commits are evidence of
   process; the squashed commit is the record of intent.

### Guardrails

- **Iteration limit:** Stop after 10 failed attempts on the same task.
  Report the failure to the user and include the contents of
  `.agent-failures.log`. The task needs decomposition or human guidance.
- **Never build on broken code.** TCR enforces this mechanically — after a
  revert, the working tree is clean. Do not circumvent this with manual
  `git stash pop` or similar recovery.
- **Never weaken tests to make them pass.** Do not delete assertions, loosen
  expected values, or add special-case handling that technically passes but
  does not implement the intended behavior.
- **Scope boundaries:** Only modify files relevant to the current task.

### Persisting TCR rules in the project

If the user wants TCR as a permanent project convention, add to the project's
`AGENTS.md`, `CLAUDE.md`, or equivalent:

```markdown
## Workflow: TCR Discipline

- After every code change, run the test suite before proceeding.
- If tests fail, revert your changes and try a smaller step.
- Never build on top of failing tests.
- Commit after every green test run.
- Keep changes small enough to pass on the first attempt.
```

## Example

Task: add a `square` function to a Python math module.

**Attempt 1 (too large — add function + type hints + error handling + docstring):**
```
./tcr.sh "pytest -x"
✗ Tests failed — reverted all changes.
```
Log: "Attempt 1: added square() with validation, type hints, docstring.
TypeError in validation logic."

**Attempt 2 (smaller — just the function and one test):**
```
./tcr.sh "pytest -x"
✓ Tests passed — committed.
```

**Attempt 3 (add input validation on top of working code):**
```
./tcr.sh "pytest -x"
✓ Tests passed — committed.
```

Each committed step is a ratchet. The agent never risks prior progress.

## TCR script quick reference

| Command | Effect |
|---------|--------|
| `./tcr.sh "pytest -x"` | Hard revert on failure |
| `./tcr.sh "npm test" --mode relaxed --src src/` | Revert only `src/`, preserve other files |
| `./tcr.sh "go test ./..." --mode gentle` | Stash failed code, then revert |
| `./tcr.sh "make test" --max-retries 5 --verbose` | Retry up to 5 times with logging |

Default mode is `hard` (revert everything). See
[references/02-variants-and-implementation.md](references/02-variants-and-implementation.md)
for all modes and options.

## Complex features: progressive ratcheting

For features that require multiple increments, define milestones. Each
committed milestone becomes the new baseline — failure within a later
milestone does not lose earlier progress:

```
Milestone 1: Basic endpoint exists       → TCR until passing → commit
Milestone 2: Endpoint validates input     → TCR until passing → commit
Milestone 3: Endpoint writes to DB        → TCR until passing → commit
```

See [references/04-pitfalls-guardrails-advanced.md](references/04-pitfalls-guardrails-advanced.md)
for the full progressive TCR pattern.

## Slow test suites

Run only the relevant subset during the TCR loop. Use the full suite as a
final gate before pushing:

```bash
# Fast TCR loop with focused tests
./tcr.sh "pytest tests/unit/test_feature.py -x --tb=short"

# Full validation before push
pytest --tb=short && git push
```

## Reference material

- **TCR foundations and autonomy levels:**
  [references/01-foundations-and-autonomy.md](references/01-foundations-and-autonomy.md)
  — what TCR is, why it fits AI agents, autonomy level framework
- **TCR variants, implementation patterns, and script reference:**
  [references/02-variants-and-implementation.md](references/02-variants-and-implementation.md)
  — hard/relaxed/gentle modes, minimal scripts, agent loop patterns, script
  usage and options
- **Tool-specific recipes and TDD:**
  [references/03-tool-recipes-and-tdd.md](references/03-tool-recipes-and-tdd.md)
  — Claude Code hooks, Aider config, generic bash wrappers, TDD vs TCR
- **Pitfalls, guardrails, and advanced patterns:**
  [references/04-pitfalls-guardrails-advanced.md](references/04-pitfalls-guardrails-advanced.md)
  — common failure modes, guardrail ladder, parallel agents, progressive ratcheting
