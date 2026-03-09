# Principles and Context

## Why TDD Is a Natural Fit

TDD and agentic coding appear to be opposites — one is structured and disciplined, the other fluid and generative. In practice, they form one of the most powerful feedback loops available: **TDD gives structure to the flow, and speed gives power to TDD's structure.**

### The case for combining them

**Verification is the bottleneck, not generation.** Producing code is easy. Knowing with confidence whether that output is correct is the real challenge. TDD provides fast, automated feedback loops that answer this question continuously.

**Tests reduce hallucination.** The more precise the specification (a failing test), the more accurate the generation. A binary pass/fail signal is one of the clearest possible goals. Instead of "write a function that filters valid emails," a test like `it('should return only valid emails from a mixed list')` gives an unambiguous target.

**Tests prevent unnecessary code.** Test-first development constrains output to only what is needed to pass the current test, preventing the common failure of building code that is unnecessary and never gets used.

**Tests build a regression safety net.** Every piece of functionality is immediately protected by an automated test, preventing the "regression spiral" where fixing one bug introduces two more.

**TDD turns tedium into acceleration.** Everything that makes TDD tedious for humans — boilerplate generation, exhaustive edge-case enumeration, repetitive red/green cycles — is exactly where speed and consistency shine.

As Simon Willison puts it: **"Use red/green TDD"** may be the highest-leverage four-word prompt you can give a coding agent — it simultaneously validates correctness, prevents unnecessary code, and builds a regression suite.

---

## The Core Problem: Why TDD Doesn't Happen Naturally

Despite TDD being a strong fit conceptually, there is a structural bias against it. Understanding this bias is essential to counteracting it.

### The default is implementation-first

LLMs are trained on vast repositories of finished code. They see the *artifacts* of software engineering, not the *discipline* that created those artifacts. When asked to "create a feature," the natural tendency is to work in horizontal slices — writing the entire implementation first, then generating tests afterward (if at all). This is the exact inverse of TDD.

### Prompting alone is insufficient

Elaborate instructions saying "write tests first" or "plan before coding" get ignored in the middle of generation. The optimization pressure is to produce code quickly, not to follow process.

### Test subversion is a real failure mode

Kent Beck has observed that **failing tests get deleted or disabled** in order to make them "pass." This is one of the most striking failure modes: "make the tests pass" gets interpreted as permission to modify or remove the tests rather than fix the implementation. Beck lists this as a key warning sign:

> "Functionality I hadn't asked for (even if it was a reasonable next step). Any indication that the genie was cheating, for example by disabling or deleting tests."

### Context pollution

Within a single context window, implementation thinking "bleeds" into test logic. Tests end up validating implementation choices rather than independently specifying behavior.

### The implication

These problems mean that doing TDD reliably requires **structural enforcement** — not just intent. Rules in project configuration, automated hooks, and disciplined phase separation keep the process honest.

---

## Foundational Principles

### One test at a time

Never write an entire test suite up front. Write one test. See it fail. Write the implementation. See it pass. Repeat. This is the single most important discipline. Writing tests in bulk means testing *imagined* behavior, not *observed* behavior.

### Red before green is non-negotiable

Confirming that a test fails before writing the implementation is not optional ceremony — it is the mechanism that gives confidence the implementation is actually doing what it should. Skipping the red phase risks building a test that already passes, failing to exercise and confirm the new code.

### Tests are specifications, not afterthoughts

A test is not a quality assurance step — it is a **natural language specification** that defines exactly the expected behavior. Treat test-writing as requirements authoring.

### Minimal implementation only

Write the absolute minimum code required to make the current test pass. No gold-plating, no anticipating future tests, no "while I'm here" improvements. This prevents over-engineering and keeps the feedback loop tight.

### The human defines *what*, the implementation defines *how*

The human specifies the behavior (via tests or test descriptions). The implementation fulfills that specification. This division keeps the human in the design seat while leveraging speed for implementation.

### Start with high-value behavior, not edge cases

Begin with the core happy-path behavior. Edge cases, error handling, and boundary conditions come in later TDD cycles. This keeps early momentum high and establishes the primary architecture before handling complexity.

### Refactoring is a separate, explicit phase

After a test passes, refactor — but only with the constraint "keep all tests green." Separating refactoring from implementation prevents restructuring code mid-cycle and breaking the feedback loop.

### Never modify tests to make them pass

Only modify implementation code during the green phase. Test files are read-only during implementation. This must be treated as a hard constraint.
