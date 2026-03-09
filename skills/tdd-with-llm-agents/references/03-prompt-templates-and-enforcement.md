# Prompt Templates and Enforcement Mechanisms

## Table of Contents

- [AGENTS.md TDD Rules Template](#agentsmd-tdd-rules-template)
- [Prompt Templates for Users](#prompt-templates-for-users)
- [Enforcement Mechanisms](#enforcement-mechanisms)
  - [Automated Test Execution via Hooks](#automated-test-execution-via-hooks)
  - [Pre-Write Guards](#pre-write-guards-blocking-non-tdd-actions)
  - [File-Permission Boundaries](#file-permission-boundaries)
  - [Test Reporter Integration](#test-reporter-integration)
  - [Verification Sub-Agents](#verification-sub-agents)
  - [Git-Based Safety Nets](#git-based-safety-nets)

---

## AGENTS.md TDD Rules Template

When a user asks to set up TDD rules for their project, generate a project-level agent instructions file (commonly `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, or equivalent) based on this template:

```markdown
## Test-Driven Development Rules

### Mandatory Process
- ALWAYS write a failing test BEFORE writing implementation code.
- Write ONE test at a time. Never batch multiple new tests.
- Run the test after writing it. Confirm it FAILS before proceeding.
- Write the MINIMUM implementation to make the failing test pass.
- Run ALL tests after implementation. ALL must pass.
- Only then consider refactoring — all tests must stay green.

### Hard Constraints
- NEVER modify, delete, or skip a test to make it pass.
- NEVER write implementation code without a corresponding failing test.
- NEVER add functionality beyond what the current test requires.
- NEVER proceed to the next test until the current cycle is complete
  (red → green → refactor).
- If a previously passing test breaks, fix the IMPLEMENTATION, not the test.
  The only exception is if the test itself has a genuine bug.

### Test Quality
- Test names must describe behavior:
  "should reject emails without @ symbol" not "test email validation"
- Use the AAA pattern: Arrange, Act, Assert.
- Each test should be independent and self-contained.
- Start with core happy-path behavior, then add edge cases.

### Session Protocol
- At the start of every session, run the full test suite first.
- Report the baseline: how many tests, how many pass/fail.
- If any tests are already failing, address those before new work.

### Refactoring Protocol
- Refactoring happens ONLY when all tests are green.
- During refactoring, do not change behavior — only improve structure.
- Run tests after every refactoring change.
```

---

## Prompt Templates for Users

When a user asks how to prompt for TDD, recommend these templates:

**Starting a TDD session:**
```
We are using strict red/green TDD. For each piece of behavior:
1. Write ONE failing test (red)
2. Confirm it fails
3. Write minimum code to pass it (green)
4. Confirm ALL tests pass
5. Refactor if needed (keep green)
6. Move to the next behavior

Start by running the existing test suite to establish a baseline.
```

**Requesting a new behavior (red phase):**
```
Write a failing test for: [describe behavior].
Do NOT write any implementation. Only the test.
Then run the test and show me the failure output.
```

**Requesting implementation (green phase):**
```
Write the minimum implementation to make the failing test pass.
Do not modify any test files. Do not add extra functionality.
Then run all tests and show results.
```

**Requesting refactor:**
```
All tests pass. Refactor the implementation:
- Remove duplication
- Improve naming
- Simplify logic
Keep all tests green. Do not add new behavior.
```

**Recovering from a test-subversion attempt:**
```
Do not modify the test. The test defines the required behavior.
Fix the implementation to match the test specification.
If you believe the test is wrong, explain why — but do not change it.
```

---

## Enforcement Mechanisms

Prompting and AGENTS.md rules set expectations, but violations still happen. Structural enforcement is the difference between TDD that works occasionally and TDD that works consistently.

### Automated Test Execution via Hooks

Most agent tools support hooks — shell commands that execute automatically in response to actions. Configure a hook to run the test suite after every file edit:

**Concept (tool-agnostic):**
```
On event: after any file write/edit
Run: <test runner command>
If tests fail: show failure output immediately
```

**Example for Claude Code (PostToolUse hook):**
```json
{
  "event": "PostToolUse",
  "matcher": "Write|Edit|MultiEdit",
  "command": "npm test 2>&1 | tail -20"
}
```

**Example for VS Code / Copilot:**
Configure "Run on Save" to execute the test suite on every file change for immediate test feedback.

This provides **instant feedback** without needing to remember to run tests. It also surfaces regressions the moment they happen, not after several more changes have piled on.

### Pre-Write Guards (Blocking Non-TDD Actions)

More aggressive than post-write feedback: block file modifications that violate TDD rules before they happen.

**TDD Guard** is an open-source tool specifically designed for this. It intercepts file write operations and validates TDD adherence by checking:

- **Test-first enforcement:** Blocks implementation changes if there is no corresponding failing test
- **Over-implementation prevention:** Prevents code beyond what current tests require
- **Multiple test detection:** Blocks adding multiple tests simultaneously

When a violation is detected, TDD Guard exits with an error code and provides an explanation of what to do instead. The write cannot proceed until the TDD process is followed.

**Configuration concept (tool-agnostic):**
```
On event: before any file write/edit
Run: tdd-guard check --file <modified_file>
If violation detected: block the write, show explanation
```

### File-Permission Boundaries

A simpler enforcement approach: during the green phase, make test files read-only (or configure the agent framework to deny writes to test directories). During the red phase, make implementation files read-only. This physically prevents writes to the wrong files during each phase.

Some agent frameworks support file-write allow/deny lists in their configuration. Leverage these per-phase when available.

### Test Reporter Integration

For enforcement tools to work, they need to know the current test state. Configure the test runner to output results in a machine-readable format (JSON, JUnit XML) to a known location:

```bash
# Example: Jest with JSON reporter
jest --json --outputFile=.agent/test-results.json

# Example: pytest with JUnit XML
pytest --junitxml=.agent/test-results.xml
```

Enforcement tools, hooks, and the TDD process itself can then read this file to determine whether tests are currently red or green.

### Verification Sub-Agents

Some agent frameworks support spawning sub-agents. A powerful pattern is to use a separate verification agent that independently reviews the implementation against the test specification:

```
After the implementation passes all tests, spawn a verification agent.
The verification agent should:
1. Read only the tests (not the implementation)
2. Independently assess whether the tests are comprehensive
3. Suggest additional edge-case tests if coverage gaps exist
4. Confirm the tests are not trivially satisfiable
```

This prevents "overfitting" — where the implementation technically passes tests but does so in a degenerate way (e.g., hardcoding return values).

### Git-Based Safety Nets

Use version control as a checkpoint mechanism:

- **Commit after every green phase.** Each passing cycle gets its own commit. If a later cycle goes off the rails, revert to the last known-good state without losing work.
- **Branch-per-feature.** Keep TDD work on a feature branch so the main branch is always stable.
- **Pre-commit hooks.** Run the full test suite before every commit. If tests fail, the commit is rejected.

```bash
# .git/hooks/pre-commit (simplified)
#!/bin/sh
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit rejected."
  exit 1
fi
```
