# Pitfalls, Guardrails, and Advanced Patterns

## Table of Contents

- [Pitfall 1: Slow Test Suites](#pitfall-1-slow-test-suites)
- [Pitfall 2: Git Log Pollution](#pitfall-2-git-log-pollution)
- [Pitfall 3: The Fix→Break→Fix Spiral](#pitfall-3-the-fixbreakfix-spiral)
- [Pitfall 4: Agents That Cheat the Tests](#pitfall-4-agents-that-cheat-the-tests)
- [Pitfall 5: Flaky Tests Cause Random Reverts](#pitfall-5-flaky-tests-cause-random-reverts)
- [Pitfall 6: Large Refactors Don't Fit TCR](#pitfall-6-large-refactors-dont-fit-tcr)
- [Pitfall 7: Compilation Failures Cause Premature Reverts](#pitfall-7-compilation-failures-cause-premature-reverts)
- [Guardrails for Autonomous Agent Loops](#guardrails-for-autonomous-agent-loops)
- [The Guardrail Ladder](#the-guardrail-ladder)
- [TCR with Checkpointing](#tcr-with-checkpointing)
- [TCR with Parallel Agents](#tcr-with-parallel-agents)
- [Progressive TCR (Ratcheting)](#progressive-tcr-ratcheting)
- [Self-Improving Agent Memory](#self-improving-agent-memory)
- [The Spec-Implement-Verify Loop](#the-spec-implement-verify-loop)

---

## Pitfall 1: Slow Test Suites

TCR needs fast feedback. If the test suite takes 30 seconds, every failed
attempt costs 30 seconds of dead time plus a revert. An autonomous loop
making 10 attempts per feature means 5 minutes of test execution.

**Solution:** Run only the relevant subset during the TCR loop. Use the full
suite as a final gate before pushing.

```bash
# Fast TCR loop with focused tests
./tcr.sh "pytest tests/unit/test_feature.py -x --tb=short"

# Full validation before push
pytest --tb=short
```

## Pitfall 2: Git Log Pollution

TCR generates many commits with messages like "tcr: green". This makes
`git log` useless for understanding project history.

**Solution:** Squash TCR commits before pushing:

```bash
git rebase -i $(git merge-base HEAD main)
# Or use squash merge
git merge --squash feature-branch
```

Generate a meaningful commit message for the final squashed commit based on
the accumulated changes.

## Pitfall 3: The Fix→Break→Fix Spiral

Without TCR, an agent that encounters a test failure often tries to "fix the
fix" — piling compensating changes on top of broken code. Each attempt adds
contradictory context, and the agent oscillates between solutions.

**Solution:** TCR breaks the spiral by design. A hard revert clears all
accumulated broken state, giving a clean starting point for each attempt.

## Pitfall 4: Agents That Cheat the Tests

An agent may make tests pass by weakening assertions, deleting test cases, or
adding special-case handling that technically passes but doesn't implement the
intended behavior.

**Solutions:**
- Use the relaxed variant — prevent the agent from modifying test files.
- Review the agent's changes before merging (always).
- Add mutation testing as an additional gate.
- Include invariant tests that are harder to game.

## Pitfall 5: Flaky Tests Cause Random Reverts

A flaky test that intermittently fails will randomly revert good work. The
agent can't distinguish "my code is wrong" from "the test is unreliable."

**Solution:** Fix flaky tests before adopting TCR. A flaky test in a TCR
workflow is worse than no test at all. Consider running the test suite twice
on failure before reverting:

```bash
if eval "$TEST_CMD"; then
    git add -A && git commit -m "tcr: green"
elif eval "$TEST_CMD"; then
    # Passed on retry — likely a flaky test, commit anyway
    git add -A && git commit -m "tcr: green (flaky retry)"
else
    git checkout .
    echo "✗ Failed twice — reverted."
fi
```

## Pitfall 6: Large Refactors Don't Fit TCR

Some changes are inherently large — renaming a widely-used function, changing
a data structure, migrating an API. These can't be done in a single small step
that passes all tests.

**Solution:** "Make the hard change easy, then make the easy change" (Kent
Beck). Refactor incrementally so each step passes tests. Break the refactor
into a sequence of small, independently-valid steps. Consider temporarily
relaxing TCR for mechanical refactors (find-and-replace renames) and
re-enabling it for behavioral changes.

## Pitfall 7: Compilation Failures Cause Premature Reverts

The original TCR script reverts on any failure, including compilation errors.

**Solution:** Use the build-first variant:

```bash
./build.sh && (./test.sh && git commit -am "tcr: green" || git checkout .)
```

Build failure → no action. Only test failure triggers a revert. Less of an
issue with agents (which typically generate complete, compilable code) but
still a useful guard for compiled languages.

---

## Guardrails for Autonomous Agent Loops

When running agents at Level 3–4 autonomy, additional guardrails beyond TCR
are necessary.

### Iteration limits

Never let an agent loop indefinitely. Set a maximum number of TCR cycles per
task (recommended: 10). If the agent can't produce passing code in N attempts,
it needs human guidance — not more attempts.

### Time limits

Set wall-clock limits in addition to iteration limits. An agent that spends
30 minutes on a task that should take 5 is stuck.

### Scope boundaries

Define what the agent is allowed to modify. TCR validates *correctness* (tests
pass), not *scope*. Use file-level restrictions:

```bash
ALLOWED_FILES="src/feature.py src/feature_test.py"
CHANGED_FILES=$(git diff --name-only)

for f in $CHANGED_FILES; do
    if ! echo "$ALLOWED_FILES" | grep -q "$f"; then
        echo "✗ Agent modified unauthorized file: $f"
        git checkout .
        exit 1
    fi
done
```

### Danger zones

Some files should never be modified by an agent: CI/CD configuration, database
migrations, authentication code, infrastructure-as-code. Enforce with
pre-commit hooks or `PreToolUse` hooks that hard-block edits to sensitive
paths.

### Deterministic tools over prompting

Do not prompt the agent to format code or follow style guides — use formatters
and linters as pipeline gates. Do not prompt it to run tests — wire tests into
the TCR script. Deterministic tools enforce rules mechanically. Prompts are
suggestions that models can drift from.

---

## The Guardrail Ladder

As autonomy increases, guardrails must increase proportionally:

| Autonomy Level | TCR Variant | Additional Guardrails |
|----------------|-------------|----------------------|
| Level 1 (Copilot) | Relaxed | Human review on every change |
| Level 2 (Chat) | Relaxed + Stash | Human reviews before commit; scope limits |
| Level 3 (Autonomous) | Hard revert | Iteration limits, time limits, scope boundaries, danger zones |
| Level 4 (Multi-agent) | Hard + Collaborator | All of the above + integration testing, branch isolation |

---

## TCR with Checkpointing

Combine git-based TCR with agent checkpoint systems for layered safety:

- **TCR (git):** Handles the commit/revert cycle mechanically.
- **Checkpoints (e.g., Claude Code):** Capture conversation state alongside
  code state, allowing rewind of the agent's *understanding* as well as its
  code.

When a TCR revert happens, the agent's conversation context still contains
the failed attempt — usually helpful for learning. But if the agent is stuck
in a loop, rewinding the conversation clears contradictory context and gives
a truly fresh start.

## TCR with Parallel Agents

Run multiple agents in parallel, each in its own git worktree with its own
TCR loop:

```bash
# Create isolated worktrees for parallel agents
git worktree add ../agent-1-worktree -b agent-1-feature
git worktree add ../agent-2-worktree -b agent-2-feature

# Each agent runs its own TCR loop in its worktree
# After both complete, merge and run integration TCR
git merge agent-1-feature agent-2-feature
./test.sh && git commit -m "integrated agent-1 + agent-2" || git reset --merge
```

## Progressive TCR (Ratcheting)

For complex features, use TCR as a ratchet. Define a sequence of tests
representing incremental milestones. Each committed milestone becomes the
new baseline.

```
Milestone 1: Basic API endpoint exists     → TCR until passing → commit
Milestone 2: Endpoint validates input      → TCR until passing → commit
Milestone 3: Endpoint writes to DB         → TCR until passing → commit
Milestone 4: Endpoint returns response     → TCR until passing → commit
```

Each milestone is its own TCR loop. Failure within a milestone does not lose
progress from prior milestones.

## Self-Improving Agent Memory

When a TCR attempt is reverted, log the failure:

```bash
if ! eval "$TEST_CMD"; then
    TEST_OUTPUT=$(eval "$TEST_CMD" 2>&1 || true)
    echo "Attempt $attempt failed: $TEST_OUTPUT" >> .agent-failures.log
    git checkout .
fi
```

Feed the failure log back to the agent on subsequent attempts. Over multiple
cycles, the agent accumulates knowledge about what *doesn't* work — a form
of compound learning that makes each attempt more informed.

## The Spec-Implement-Verify Loop

A formalization of the Level 2 workflow combining TDD and TCR:

1. **Spec:** Human writes a failing test (outside TCR — test files are exempt
   from revert).
2. **Implement:** Agent generates implementation (inside TCR — implementation
   files are subject to revert).
3. **Verify:** TCR runs. Pass → commit. Fail → revert implementation only.
4. **Iterate:** If reverted, refine the test to be more specific, or break it
   into smaller tests.
5. **Repeat** until the feature is complete.
