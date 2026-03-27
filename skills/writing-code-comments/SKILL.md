---
name: writing-code-comments
description: "Writes and reviews code comments using a four-type taxonomy (interface, data structure, implementation, cross-module), precision checklist, and anti-pattern detection. Produces comments that capture intent, contracts, and rationale — not restatements of code. Use when writing code that needs comments, reviewing or improving existing comments, auditing comment quality, documenting interfaces or APIs, or when the user mentions code comments, documentation, commenting, or docstrings."
category: "Writing & Communication"
---

# Writing Code Comments

Comments describe things not obvious from the code. Judge "obvious" from the perspective of someone encountering the code for the first time, not the author.

## Workflow

1. **Start with interface comments.** When writing new code, draft them before implementing — if you cannot describe the contract simply, the interface may be too complex. When reviewing existing code, check that every public interface (class, function, method, module) has one.
2. **Check every field and non-trivial variable** for a data structure comment.
3. **Scan method bodies.** Flag non-obvious logic, workarounds, performance choices, and multi-step blocks that need implementation comments.
4. **Check for cross-cutting concerns.** If a design decision spans multiple modules, ensure one central doc exists with references from each affected module.
5. **Apply the precision checklist** to every interface and data structure comment (see below).
6. **Delete anti-pattern comments** — restated code, stale comments, mumbling, commented-out code, boilerplate, journal entries, closing-brace markers, over-commenting.
7. **Check every TODO/FIXME/HACK** for a ticket reference and ownership. Add them or convert to tracked issues.

## Four comment types

### Interface comments

Placed before a class, function, or method declaration. Describe the **contract from the caller's perspective** — purpose, parameters, return value, side effects, exceptions, thread safety, and performance characteristics when relevant. Must be complete: everything a caller needs to use the thing correctly.

**Critical rule:** Never describe implementation details in interface comments. The interface shields users from the implementation. If you must describe the algorithm to explain the interface, the abstraction is leaking.

**Bad** — leaks implementation:
```
/**
 * Sorts the list using a three-way quicksort with median-of-three
 * pivot selection. Falls back to insertion sort for partitions
 * smaller than 16 elements. Allocates a temporary buffer of n/2
 * elements on the heap.
 */
void sort(List items);
```

**Good** — describes the contract:
```
/**
 * Sorts the list in ascending order according to the elements'
 * natural ordering. The sort is stable: equal elements retain
 * their relative order. Runs in O(n log n) time and O(n) space
 * in the worst case.
 */
void sort(List items);
```

### Data structure comments

Placed next to field, instance variable, or important local variable declarations. Describe **what the variable represents**, not how it is used.

```
// The number of currently active connections, including those in
// the process of being closed. Always >= 0. Updated atomically.
int activeConnectionCount;
```

Document every class/struct field and every method parameter. For locals in short methods, document only when the meaning is non-obvious.

### Implementation comments

Placed inside method bodies. Describe **how the code works and why it works that way**. Unnecessary for short, straightforward methods.

Use for:
- Major blocks — one-line higher-level description of what a section accomplishes
- Tricky or non-obvious logic — what's happening and why
- Dependencies — "if you change X, you must also change Y"
- Performance reasoning — why a less obvious approach was chosen
- Workarounds — what external bug or constraint this works around, with issue reference

### Cross-module comments

For design decisions spanning multiple modules (protocols, consistency models, failover strategies):

1. Create a central design doc (e.g., `docs/design-notes.md`) with tagged sections.
2. In each affected module, add a short reference:
   ```
   // See "Leader Election Protocol" in docs/design-notes.md
   ```

This keeps authoritative documentation in one place while ensuring discoverability from any affected module.

## Precision checklist

Apply to every interface and data structure comment:

- **Units** — seconds, milliseconds, bytes, pixels?
- **Boundary conditions** — inclusive or exclusive? Last element or one past?
- **Null/zero/empty semantics** — is null allowed? What does empty mean — "no results" or "not yet loaded"?
- **Ownership and lifecycle** — who frees/closes dynamically allocated resources?
- **Invariants** — what must always be true? Always sorted? Always non-negative?
- **Valid ranges** — what values are legal? What happens with out-of-range input?

## Anti-patterns — delete on sight

- **Restating the code** — `i = i + 1; // increment i` adds nothing; delete it
- **Rotting comments** — stale comments that contradict the code; fix or delete
- **Mumbling** — `// I think this might work` communicates nothing useful; make it precise or delete
- **Commented-out code** — version control exists; delete dead code
- **Mandatory boilerplate** — empty doc templates, verbose license headers; minimize to one-line reference
- **Journal comments** — changelogs in code; `git log` and `git blame` serve this purpose
- **Closing-brace markers** — `} // end if` signals the method is too long; refactor instead
- **Over-commenting** — commenting every line trains readers to skip all comments including important ones

## TODO/FIXME/HACK rules

- Always attach a ticket reference: `// TODO(JIRA-4521): Replace with batch API once v2 ships.`
- Include ownership — who should resolve it.
- Never ship a bare TODO/FIXME without a corresponding tracked issue.
- Do not use TODO to defer known-bad code (race conditions, security issues) — fix before merging.
