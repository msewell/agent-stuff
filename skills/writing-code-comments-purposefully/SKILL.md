---
name: writing-code-comments-purposefully
description: Decides when comments are necessary and writes high-signal comments that document intent, invariants, contracts, and failure behavior without restating code. Produces interface docs, implementation rationale comments, and review-ready documentation updates. Use when adding, revising, or reviewing inline comments, docstrings, API docs, or design notes, especially around edge cases, side effects, concurrency, and error handling.
category: Writing & Communication
---

# Writing Code Comments Purposefully

## Quick start

1. Improve names and structure first; do not comment around unclear code.
2. Add comments only where readers need intent, constraints, or safety context.
3. Place the information at the correct layer:
   - API surface: contract and usage semantics
   - Implementation: rationale, invariants, non-obvious behavior
   - Cross-module: architecture decision note
4. Use the templates below.
5. Validate comments in review with the checklist below.

## Default operating mode

- Do not ask clarifying questions by default.
- Infer reasonable assumptions from code and request context.
- If an assumption can materially change behavior, state it in one line and proceed.
- Prefer shipping a concrete draft over requesting more input.

## Workflow

### 1) Decide whether a comment is needed

Add a comment only if at least one condition is true:

- A future maintainer could misinterpret behavior.
- An invariant or safety constraint must remain true.
- Failure, retry, timeout, or ordering behavior is non-obvious.
- Side effects, concurrency, or state mutation are easy to miss.
- External system quirks force a surprising implementation choice.

Do **not** add a comment when:

- It restates obvious code steps.
- Better naming/extraction would remove the need.
- It duplicates volatile details likely to drift.

### 2) Choose the right documentation layer

- **Interface docs (public API/docstring):** what callers can rely on.
- **Implementation comment (inside code):** why this shape exists and what must stay true.
- **Design note (cross-module):** decision, tradeoffs, consequences across boundaries.

### 3) Write the smallest high-signal comment

- Lead with the most important fact.
- Be concrete: include units, thresholds, ordering, and error semantics.
- Keep to one concern per comment block.
- Prefer stable intent over volatile implementation narration.

### 4) Run quality checks before finishing

Reject or rewrite comments that are:

- Tautological (`Increment i`, `Set value`)
- Hedged (`probably`, `might`, `should work`)
- Ownerless TODOs/FIXMEs
- Contradictory with actual behavior

### 5) Keep docs synchronized with code changes

- Update comments/docs in the same change as behavior changes.
- Treat stale comments as correctness defects.
- If behavior changed, check nearby docs for drift.

## Output templates

### Template: public API contract doc

```text
Summary:
- One sentence: what this guarantees.

Inputs:
- param: range/units/constraints

Returns:
- success semantics
- edge semantics (empty/not found/partial)

Errors:
- failure categories and when they occur

Semantics:
- idempotency/retry/ordering/timeout/cancellation
- side effects and state mutation
- concurrency/thread-safety guarantee

Example:
- minimal valid call
```

### Template: implementation rationale comment

```text
Why:
- chosen approach and short tradeoff

Invariant:
- condition that must always hold

Coupling:
- assumption about external behavior

Failure handling:
- retry/re-entry/partial-failure behavior
```

### Template: PR documentation review checklist

```text
Blocking:
- Contract changed but interface docs not updated
- Comment contradicts behavior
- Failure/concurrency semantics changed without doc update

Strong suggestion:
- Replace narration comments with naming/extraction
- Add rationale where tradeoff is non-obvious
- Add usage example for confusing API flows

Nit:
- Remove hedging
- Tighten wording and terminology consistency
```

## Examples

### Example A: narration comment -> rationale comment

Bad:
```text
// Increment retry count
retryCount++
```

Good:
```text
// Count only network retries; validation failures are terminal.
retryCount++
```

### Example B: vague docstring -> contract docstring

Bad:
```text
"""Gets user data."""
```

Good:
```text
"""Returns cached profile when fresh; otherwise fetches from upstream.
Raises TimeoutError after 2s total budget.
Thread-safe for concurrent reads."""
```

## Progressive disclosure references

Use these references when you need deeper guidance:

- Decision rules and layer placement: [references/01-when-to-comment.md](references/01-when-to-comment.md)
- Comment content patterns and examples: [references/02-what-to-write-in-comments.md](references/02-what-to-write-in-comments.md)
- Review, maintenance, CI, and rollout: [references/03-review-and-maintenance-playbook.md](references/03-review-and-maintenance-playbook.md)
