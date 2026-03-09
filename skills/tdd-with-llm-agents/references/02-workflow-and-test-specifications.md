# Workflow and Test Specifications

## Table of Contents

- [The Workflow: Red/Green/Refactor](#the-workflow-redgreenrefactor)
  - [Phase 0: Session Start](#phase-0-session-start--first-run-the-tests)
  - [Phase 1: RED](#phase-1-red--write-a-failing-test)
  - [Phase 2: GREEN](#phase-2-green--minimal-implementation)
  - [Phase 3: REFACTOR](#phase-3-refactor--clean-up-under-green)
  - [Phase 4: REPEAT](#phase-4-repeat)
  - [Workflow Diagram](#workflow-diagram)
- [Tests as Specifications](#tests-as-specifications)
  - [What makes a good test-specification](#what-makes-a-good-test-specification)
  - [Example: Evolving a feature through tests](#example-evolving-a-feature-through-tests)
  - [Generating a TDD plan](#generating-a-tdd-plan)

---

## The Workflow: Red/Green/Refactor

### Phase 0: Session Start — "First, Run the Tests"

Begin every session against an existing project by running the full test suite first.

This serves multiple purposes simultaneously:
- Discover the test suite and learn how to run it
- Get a rough sense of project size and complexity via test counts
- Establish a clean baseline — confirm everything is green before starting
- Enter a "testing mindset" from the very first action

### Phase 1: RED — Write a Failing Test

Write exactly **one** test that describes the next piece of behavior. Use a descriptive, behavior-focused name:

```
Write a FAILING test for: when a user submits an empty form,
the submit button should remain disabled and display a validation message.
Do NOT write any implementation code yet.
```

**Run the test and confirm it fails.** If the test passes without implementation, it is wrong — it is not testing new behavior.

Critical constraints during this phase:
- One test only — not a batch
- No implementation code whatsoever
- Use descriptive test names — the clearer the name, the better the subsequent implementation
- Follow the AAA pattern (Arrange-Act-Assert) for test structure

### Phase 2: GREEN — Minimal Implementation

Write the minimum code to make the failing test pass:

```
Now write the minimum implementation to make this test pass.
Do not add any functionality beyond what the test requires.
Do not modify the test.
```

Run all tests again. All tests (including previous ones) must pass.

Critical constraints during this phase:
- Only implementation files may be modified — test files are off-limits
- "Minimum" means minimum — no extra methods, no anticipated features
- If a previous test breaks, fix the implementation, not the old test
- If tempted to modify a test to make it pass, **stop — fix the implementation instead**

### Phase 3: REFACTOR — Clean Up Under Green

Once all tests are green, refactor:

```
All tests pass. Refactor the implementation for clarity and
reduce duplication. Keep all tests green. Do not change behavior.
```

This is the only phase where structural changes to implementation code are appropriate. The passing test suite is the safety net that ensures refactoring doesn't change behavior.

Critical constraints during this phase:
- All tests must remain green throughout
- No new behavior — only structural improvements
- Test improvements (better names, reduced duplication in test setup) are acceptable but do not change test assertions

### Phase 4: REPEAT

Return to Phase 1 with the next piece of behavior. The cycle continues until the feature is complete.

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  SESSION START: "First, run the tests"                  │
│  Establish baseline. All green? Proceed.                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  RED: Write ONE failing │◄──────────────────┐
         │  test. Run it. See it   │                   │
         │  fail.                  │                   │
         └────────────┬────────────┘                   │
                      │                                │
                      ▼                                │
         ┌─────────────────────────┐                   │
         │  GREEN: Write minimum   │                   │
         │  implementation. Run    │                   │
         │  all tests. All green.  │                   │
         └────────────┬────────────┘                   │
                      │                                │
                      ▼                                │
         ┌─────────────────────────┐                   │
         │  REFACTOR: Clean up     │                   │
         │  under green. No new    │                   │
         │  behavior.              │                   │
         └────────────┬────────────┘                   │
                      │                                │
                      ▼                                │
              ┌───────────────┐                        │
              │ More behavior │── Yes ─────────────────┘
              │  needed?      │
              └───────┬───────┘
                      │ No
                      ▼
                    Done
```

---

## Tests as Specifications

A failing test is the most precise specification possible. The quality of the test directly determines the quality of the generated implementation.

### What makes a good test-specification

| Property | Why it matters |
|---|---|
| **Descriptive name** | The test name is essentially a natural language instruction. `it('should reject emails without @ symbol')` is far more useful than `it('test case 3')`. |
| **Single behavior** | One assertion (or one cohesive group of assertions) per test. This gives a single, unambiguous target. |
| **Concrete examples** | Use specific input/output values, not abstract descriptions. `expect(calculateTax(100, 'CA')).toBe(7.25)` is clearer than "it should calculate tax correctly." |
| **Independent setup** | Each test must be self-contained. Understanding other tests should not be necessary to implement this one. |
| **Behavior-focused, not implementation-focused** | Test what the code does, not how it does it internally. This preserves freedom to choose the best implementation. |

### Example: Evolving a feature through tests

Instead of "build a password validator," drive the feature through incremental test specifications:

```
Cycle 1: "Write a test: passwords shorter than 8 characters are rejected"
Cycle 2: "Write a test: passwords without uppercase letters are rejected"
Cycle 3: "Write a test: passwords without numbers are rejected"
Cycle 4: "Write a test: passwords meeting all criteria are accepted"
Cycle 5: "Write a test: the error message specifies which rules failed"
```

Each cycle produces one test, one minimal implementation, and one refactor. The feature emerges incrementally, fully tested at every step.

### Generating a TDD plan

For larger features, generate a TDD plan before starting the cycle:

```
Generate a TDD plan for implementing a shopping cart with
the following business rules:
- Users can add/remove items
- Quantity must be positive
- Subtotal updates automatically
- Discount codes apply percentage off
- Tax is calculated per jurisdiction

Structure it as a numbered checklist of test descriptions,
ordered from simplest behavior to most complex.
One behavior per test. Do not write any code yet.
```

This produces a roadmap. Review and adjust it, then execute one test at a time via the red/green/refactor cycle.
