---
name: commenting-code
description: Writes and reviews code comments that preserve non-obvious intent, contracts, invariants, and failure semantics without narrating the code. Uses clear layer placement (interface, implementation, cross-module) and lightweight review checks to keep comments accurate over time. Use when adding or reviewing inline comments, docstrings, API docs, or design notes for behavior that could be misunderstood.
category: Writing & Communication
---

# Commenting Code

## Core principles

- Improve naming and structure first; do not comment around unclear code.
- Add comments only when they prevent a likely misunderstanding.
- Prefer stable intent over volatile implementation narration.
- Keep comments concise, concrete, and testable.

## Workflow

1. **Decide whether a comment is needed.**
   Add a comment when behavior could be misread and lead to defects (for example: invariants, ordering constraints, concurrency assumptions, retries/timeouts, side effects, or error semantics).
2. **Choose the right layer.**
   - **Interface docs**: caller-visible contract and usage semantics.
   - **Implementation comments**: maintainer-facing rationale and invariants.
   - **Cross-module notes**: decisions that span module boundaries.
3. **Write the smallest high-signal comment.**
   Lead with the most important fact. Include concrete details (units, bounds, ordering, failure behavior) when relevant.
4. **Remove low-value comments.**
   Delete tautologies, stale comments, hedging, and commented-out code.
5. **Keep docs synchronized with behavior.**
   If behavior changes, update comments/docs in the same change.

## What to include

### Interface docs (caller-facing)

Document what callers can rely on:
- behavior guarantee
- input constraints and units
- return semantics (including edge cases)
- error/failure semantics
- side effects and mutation behavior
- concurrency or idempotency semantics when relevant

### Implementation comments (maintainer-facing)

Document what maintainers must preserve:
- why this approach exists
- invariants and assumptions
- non-obvious failure/retry behavior
- coupling constraints that can break correctness

### Cross-module notes

For decisions spanning modules, keep one central design note and add a short local pointer from affected modules.

## Precision checklist

Apply this to interface and non-trivial implementation comments:

- Are units explicit (ms, bytes, etc.)?
- Are bounds/ranges clear (inclusive vs exclusive)?
- Are null/empty/zero semantics explicit?
- Are ownership/lifecycle expectations clear?
- Are invariants stated precisely?
- Are failure and retry semantics unambiguous?

## Anti-patterns to remove

- Restating obvious code steps
- Stale comments that contradict behavior
- Hedging language (for example: "might", "probably", "should work")
- Ownerless TODO/FIXME notes
- Commented-out code and journal-style history notes
- Over-commenting that buries important context

## Minimal templates

### Interface doc template

```text
Summary:
Inputs:
Returns:
Errors:
Semantics:
```

### Implementation comment template

```text
Why:
Invariant:
Assumption:
Failure mode:
```

## Review bar

Treat documentation correctness like code correctness:
- block changes when contract-relevant behavior changed but docs did not
- block comments that contradict actual behavior
- request cleanup when narration can be replaced by clearer naming
