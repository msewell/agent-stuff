---
name: making-invalid-states-unrepresentable
description: Analyzes existing code and guides new type design to make invalid states unrepresentable using type system techniques such as sum types, newtypes, typestate, branded types, and parse-don't-validate. Use when reviewing code for invalid-state bugs, refactoring types to eliminate impossible states, designing domain models, or applying compile-time correctness patterns. Language-agnostic.
---

# Making Invalid States Unrepresentable

## Workflow A: Review Existing Code

1. Identify the scope (module, file, type, or function under review).
2. Read the code and enumerate the types, fields, and state representations.
3. Detect anti-patterns (see checklist below).
4. For each finding, propose a concrete refactoring using the appropriate technique from `references/`.
5. Assess tradeoffs — see `references/advanced-topics.md` § Tradeoffs.
6. Present findings as a prioritized list: high-value (core domain, security, APIs) first.

## Workflow B: Design New Types

1. Collect domain requirements: valid states, invalid states, transitions.
2. Choose modeling techniques — read `references/core-and-parse.md` for foundational approach.
3. Model with types: sum types for alternatives, product types for combinations, phantom/branded types for compile-time tags.
4. Push validation to boundaries: parse external input immediately into precise types.
5. Validate the design: confirm invalid states cannot be constructed.
6. Iterate as domain understanding deepens.

## Anti-Pattern Detection Checklist

Flag code that exhibits any of these — see `references/anti-patterns-and-examples.md` for details and fixes:

- [ ] **Primitive obsession** — raw strings/ints used for domain concepts (IDs, emails, money)
- [ ] **Boolean blindness** — booleans that lose context about what was verified
- [ ] **Optional property proliferation** — many optional fields instead of a union type
- [ ] **Stringly-typed code** — open strings where a closed set of literals applies
- [ ] **Shotgun parsing** — same validation repeated in multiple call sites
- [ ] **Boolean soup** — multiple booleans encoding what should be a state machine
- [ ] **Unguarded constructors** — types with invariants that can be constructed without validation

## Technique Selection Guide

| Situation | Technique | Reference |
|-----------|-----------|-----------|
| Mutually exclusive states | Sum types / discriminated unions | `references/techniques-structural.md` § 1 |
| Domain-constrained primitives | Newtype + smart constructor | `references/techniques-structural.md` § 2 |
| State machine / workflow | Typestate pattern | `references/techniques-structural.md` § 3 |
| Collection must be non-empty | NonEmpty collection | `references/techniques-structural.md` § 4 |
| Prevent argument swaps | Branded / opaque types | `references/techniques-type-level.md` § 5 |
| Compile-time state tagging | Phantom types | `references/techniques-type-level.md` § 6 |
| Required fields enforcement | Type-safe builder | `references/techniques-type-level.md` § 7 |
| Complex numeric/range invariants | Refinement types | `references/techniques-type-level.md` § 8 |

## Core Principle (Summary)

Design types so invalid states **cannot be constructed**. Let the compiler enforce correctness. Parse at boundaries, trust types internally. See `references/core-and-parse.md`.

## Output Format

When reviewing code, present each finding as:

1. **Location** — file, line, type/function
2. **Anti-pattern** — which pattern from the checklist
3. **Risk** — what invalid state is possible
4. **Recommendation** — specific technique and refactored type signature
5. **Priority** — high (core domain/security/API), medium, low

When designing types, present:

1. **Domain states** — enumerated valid and invalid states
2. **Type definitions** — concrete code in the user's language
3. **Boundary parsers** — constructors/factories that validate at entry points
4. **Tradeoff notes** — where pragmatism overrides purity

## References

- `references/core-and-parse.md` — Core principle and parse-don't-validate pattern
- `references/techniques-structural.md` — Sum types, newtypes, typestate, NonEmpty
- `references/techniques-type-level.md` — Branded types, phantom types, builders, refinement types
- `references/anti-patterns-and-examples.md` — Anti-patterns to detect and real-world examples
- `references/implementation-guide.md` — Step-by-step process, code review checklist, language support, related principles
- `references/advanced-topics.md` — Advanced techniques, modern applications, industry trends, tradeoffs, resources
