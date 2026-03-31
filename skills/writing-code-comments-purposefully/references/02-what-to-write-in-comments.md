# 02 — What to Write in High-Signal Comments

## Table of Contents
- [Purpose](#purpose)
- [Content model by comment type](#content-model-by-comment-type)
- [Interface documentation pattern](#interface-documentation-pattern)
- [Implementation comment pattern](#implementation-comment-pattern)
- [Cross-module note pattern](#cross-module-note-pattern)
- [High-value phrasing patterns](#high-value-phrasing-patterns)
- [Weak phrasing to remove](#weak-phrasing-to-remove)
- [Risk-area comment guidance](#risk-area-comment-guidance)
- [Before/after rewrites](#beforeafter-rewrites)
- [Template bank](#template-bank)

---

## Purpose
Use this guide after deciding a comment is needed.
Goal: write the smallest comment that preserves crucial context for safe edits.

---

## Content model by comment type

### Interface docs (caller-facing)
Include:
- summary of guarantee
- input constraints (ranges, units, allowed combinations)
- return semantics (success, empty, partial, not-found)
- error categories and trigger conditions
- side effects and state mutation
- concurrency/thread-safety semantics
- retry/idempotency/ordering/timeout semantics when relevant
- minimal usage example for ambiguous behavior

Exclude:
- internal algorithm details likely to churn

### Implementation comments (maintainer-facing)
Include:
- why this shape was chosen
- invariant that must remain true
- assumptions about external modules/systems
- failure handling details (retry, rollback, compensation)
- safety constraints (lock ordering, re-entry hazards)

Exclude:
- line-by-line narration

### Design notes (cross-module)
Include:
- problem statement
- options considered
- chosen decision
- consequences and tradeoffs
- migration/rollback considerations

Exclude:
- low-level local implementation details

---

## Interface documentation pattern
Write interface docs so a caller can answer:
1. What behavior is guaranteed?
2. How can this fail?
3. What side effects occur?
4. What happens under retry, timeout, and cancellation?
5. Is usage safe under concurrency?

### Minimal interface doc example
```text
Fetches account snapshot from cache or upstream service.

Inputs:
- accountId: UUID string
- maxAgeMs: 0..60000, cache freshness budget in milliseconds

Returns:
- latest snapshot when available
- null when account does not exist

Errors:
- TimeoutError when total call budget exceeds 1500ms
- AuthError when caller credentials are invalid

Semantics:
- idempotent for same inputs
- no persistent state mutation
- safe for concurrent calls
```

---

## Implementation comment pattern
Implementation comments should make hidden constraints explicit.

### Minimal implementation comment example
```text
// Why: We checkpoint before ack so replay can recover after crash.
// Invariant: checkpointOffset <= ackedOffset at all times.
// Coupling: Upstream may resend duplicate events after reconnect.
// Failure: On checkpoint failure, do not ack; retry with backoff.
```
This pattern helps maintainers reason about edits without reverse-engineering assumptions.

---

## Cross-module note pattern
When behavior spans boundaries, keep short local comments and link a design note.
Suggested note sections:
- Context
- Decision
- Alternatives considered
- Consequences
- Operational impact
- Migration/rollback

Local code comments should summarize and link, not duplicate the full note.

---

## High-value phrasing patterns
Use explicit markers for scanability:
- `Invariant:`
- `Warning:`
- `Assumption:`
- `Failure mode:`
- `Caller must:`

Prefer concrete wording:
- "Retries network failures up to 3 times with 200ms linear backoff"
- "Must not be called while holding `sessionLock`"
- "Interprets timeout in milliseconds"

Keep one concern per bullet or sentence cluster.

---

## Weak phrasing to remove
Remove or rewrite:
- "probably"
- "might"
- "should work"
- "temporary" (without condition)
- "hack" (without rationale)
- "magic" (without source)
- "just" / "simply" when complexity exists

Weak phrasing hides uncertainty. Replace with verifiable behavior.

---

## Risk-area comment guidance

### Concurrency
Document:
- thread-safety level
- required lock discipline
- re-entry restrictions
- ownership transfer rules

### Error handling
Document:
- retryable vs terminal failures
- backoff and retry caps
- fallback behavior
- compensation/rollback

### Side effects
Document:
- external writes and irreversible operations
- mutation boundaries
- audit/logging implications

### Performance-sensitive code
Document only caller-impacting constraints:
- complexity bounds that affect usage
- memory growth expectations
- batching/windowing behavior

### Security/privacy boundaries
Document:
- trust boundaries
- validation assumptions
- sensitive fields handling

---

## Before/after rewrites

### Narration -> rationale
Before:
```text
// Sort list
items.sort()
```
After:
```text
// Sort by stable key so pagination tokens remain deterministic across retries.
items.sort()
```

### Tautological docstring -> contract docstring
Before:
```text
"""Updates order."""
```
After:
```text
"""Updates mutable order fields only.
Rejects state transitions from SHIPPED -> PENDING.
Returns updated order or raises ValidationError."""
```

### Ambiguous TODO -> actionable TODO
Before:
```text
// TODO improve this
```
After:
```text
// TODO(ENG-4821, owner: payments): Replace polling with webhook callback
// when provider v3 rollout reaches 100%.
```

---

## Template bank

### Interface doc template
```text
Summary:
Inputs:
Returns:
Errors:
Semantics:
Example:
```

### Implementation comment template
```text
Why:
Invariant:
Assumption:
Failure mode:
```

### Cross-module link template
```text
// Rationale and tradeoffs: docs/architecture/<decision-file>.md
// Local invariant retained here: <invariant sentence>
```

Use the shortest template that still prevents misunderstanding.
