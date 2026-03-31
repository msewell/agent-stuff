# 01 — Deciding When to Write a Comment

## Table of Contents

- [Purpose](#purpose)
- [Core rule: code clarity first](#core-rule-code-clarity-first)
- [Decision tree](#decision-tree)
- [High-value situations that require comments](#high-value-situations-that-require-comments)
- [Situations where comments are usually noise](#situations-where-comments-are-usually-noise)
- [Pick the right documentation layer](#pick-the-right-documentation-layer)
- [Risk-based trigger checklist](#risk-based-trigger-checklist)
- [Rewrite vs comment heuristics](#rewrite-vs-comment-heuristics)
- [Quick triage matrix](#quick-triage-matrix)
- [Exit checklist before submitting](#exit-checklist-before-submitting)

---

## Purpose

Use this guide to decide whether a comment should exist at all.

A useful comment prevents a real misunderstanding. A noisy comment adds reading
cost without reducing risk.

---

## Core rule: code clarity first

Before adding a comment:

1. Rename vague identifiers.
2. Extract a helper for mixed concerns.
3. Remove dead branches and confusing structure.

If the code is still easy to misunderstand, add a comment.

Commenting around weak naming is a temporary patch, not a durable fix.

---

## Decision tree

1. **Can refactoring remove the ambiguity?**
   - Yes -> refactor first.
   - No -> continue.
2. **Could a maintainer make a harmful change without context?**
   - Yes -> add comment.
   - No -> skip comment.
3. **Is the context stable (intent/constraint) rather than volatile syntax?**
   - Stable -> keep comment.
   - Volatile -> move detail to tests or simplify code.
4. **Who needs this information?**
   - Caller -> interface docs.
   - Maintainer -> implementation comment.
   - Multiple modules/teams -> design note.

---

## High-value situations that require comments

Write comments when any of these are true:

- **Invariants** must hold across operations.
- **Ordering constraints** are mandatory for correctness.
- **Concurrency rules** are non-obvious.
- **Error semantics** depend on nuanced classification.
- **Retry/timeout behavior** has strict operational impact.
- **Idempotency rules** affect external callers.
- **External quirks** force unusual logic.
- **Security/privacy boundaries** rely on assumptions.
- **Performance tradeoffs** are intentional and surprising.
- **Partial failure recovery** logic is not obvious from control flow.

These comments reduce defect risk by preserving context that code alone cannot
carry compactly.

---

## Situations where comments are usually noise

Avoid comments that merely narrate code:

- `// increment counter`
- `// loop over items`
- `// call API`

Avoid comments that should be solved by naming:

- `// x is user id` when variable can be renamed to `userId`

Avoid comments that decay quickly:

- Step-by-step notes tied to fragile implementation details
- Time-sensitive notes without update conditions

Avoid low-accountability notes:

- `TODO` without owner or trigger condition
- `FIXME` without issue link or completion criteria

---

## Pick the right documentation layer

Use this placement model:

### Interface docs

Document what callers can rely on:

- behavior contract
- input constraints and units
- return semantics
- error/failure model
- side effects
- concurrency guarantees

### Implementation comments

Document what maintainers must preserve:

- why this approach exists
- invariant and assumptions
- coupling to external behavior
- non-obvious failure/retry logic

### Design notes

Document cross-cutting decisions:

- problem and forces
- options considered
- chosen tradeoff
- operational consequences

Misplacing details creates drift. Keep each detail at the layer where readers
expect it.

---

## Risk-based trigger checklist

If any answer is **yes**, comment is likely warranted:

- Could changing this ordering break correctness?
- Could lock/callback interaction deadlock or re-enter?
- Could caller misuse this API without explicit contract semantics?
- Could a retry policy duplicate side effects?
- Could a timeout budget be misinterpreted without units?
- Could an external dependency violate expected guarantees?
- Could omission of rationale lead to accidental "optimization" that breaks SLA?

If all answers are **no**, skip the comment unless there is strong local reason.

---

## Rewrite vs comment heuristics

Prefer **rewrite** when:

- a clearer function name would remove uncertainty
- one function performs multiple unrelated tasks
- nested conditionals hide intent

Prefer **comment** when:

- design intent is historical/operational and cannot be encoded as syntax
- invariant spans multiple lines or modules
- external behavior is surprising but stable

Use both when needed: first rewrite for readability, then add concise context.

---

## Quick triage matrix

| Situation | Action |
|---|---|
| Obvious code step | No comment |
| Non-obvious constraint | Add implementation comment |
| Caller-facing guarantee | Add/update interface docs |
| Multi-module tradeoff | Add design note and link |
| Volatile implementation detail | Avoid comment; prefer test/refactor |
| Risky TODO without owner | Convert to tracked issue + short note |

---

## Exit checklist before submitting

- Comment explains intent/constraint, not syntax.
- Comment is placed at correct layer.
- Comment survives likely refactors.
- Terminology matches code and domain language.
- Any TODO/FIXME includes owner + condition or issue link.
- Nearby docs updated if behavior changed.

If this checklist does not pass, revise before commit.
