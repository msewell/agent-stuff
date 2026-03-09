---
name: tdd-with-llm-agents
description: "Enforces strict red/green/refactor TDD discipline when writing code. Guides the agent through one-test-at-a-time cycles, prevents test subversion, and ensures minimal implementation. Use when writing code with TDD, doing test-driven development, implementing features test-first, or when the user mentions red/green TDD, failing tests first, or test-driven workflow."
category: "Software Engineering"
---

# Test-Driven Development with LLM Agents

## Session start

Run the full test suite before any new work. Report the baseline (total tests,
pass/fail counts). If any tests fail, fix those first.

## Workflow: red/green/refactor

Execute one cycle at a time. Never batch.

### RED — write one failing test

1. Write exactly **one** test for the next behavior.
2. Use a descriptive, behavior-focused name
   (`should reject emails without @ symbol`, not `test case 3`).
3. Follow AAA: Arrange, Act, Assert.
4. Run the test. **Confirm it fails.** If it passes, the test is wrong — it
   is not exercising new behavior.
5. Do NOT write any implementation code in this phase.

### GREEN — minimal implementation

1. Write the **minimum** code to make the failing test pass.
2. Do NOT modify, delete, or skip any test. Test files are read-only.
3. Do NOT add functionality beyond what the current test requires.
4. Run **all** tests. All must pass.
5. If a previously passing test breaks, fix the implementation — never the test.

### REFACTOR — clean up under green

1. Improve structure: remove duplication, improve naming, simplify logic.
2. Do NOT add new behavior.
3. Run tests after every change. All must stay green.
4. Refactor implementation first (tests are the fixed reference), then
   optionally refactor tests (implementation is the fixed reference). Never
   both simultaneously.

### Repeat

Return to RED with the next behavior. Continue until the feature is complete.

## Hard constraints

- NEVER modify or delete a test to make it pass.
- NEVER write implementation without a corresponding failing test.
- NEVER skip the red phase (running the test to see it fail).
- NEVER add functionality beyond what the current test requires.
- NEVER proceed to the next test until the current cycle is complete.
- If you believe a test is wrong, explain why — but do not change it without
  explicit approval.

## Test quality

- Test the public interface, not implementation details.
- One behavior per test — single, unambiguous target.
- Use concrete input/output values, not abstract descriptions.
- Each test must be independent and self-contained.
- Start with happy-path behavior, then add edge cases in later cycles.

## Generating a TDD plan

For larger features, generate a plan before starting cycles:

1. Produce a numbered checklist of test descriptions, ordered simplest to most
   complex. One behavior per item.
2. Do not write any code yet.
3. Get approval, then execute one test at a time via red/green/refactor.

## Recovering from mistakes

- **Agent wrote implementation before test:** Stop. Delete the implementation.
  Write the failing test first.
- **Agent modified a test to pass:** Revert the test change. Fix the
  implementation instead.
- **Test passes unexpectedly (no red):** The test does not exercise new
  behavior. Rewrite or discard it.
- **Context window getting large:** Summarize completed work. Re-run the full
  test suite to re-anchor.

## Reference material

- **Principles and context**: [references/01-principles-and-context.md](references/01-principles-and-context.md) — why TDD fits agents, structural biases, foundational principles
- **Workflow and test specifications**: [references/02-workflow-and-test-specifications.md](references/02-workflow-and-test-specifications.md) — detailed phase descriptions, tests-as-prompts patterns, TDD plan generation
- **Prompt templates and enforcement**: [references/03-prompt-templates-and-enforcement.md](references/03-prompt-templates-and-enforcement.md) — AGENTS.md rules template, prompt templates, hooks, guards, git safety nets
- **Anti-patterns and pitfalls**: [references/04-anti-patterns-and-pitfalls.md](references/04-anti-patterns-and-pitfalls.md) — ten common failure modes and their fixes
