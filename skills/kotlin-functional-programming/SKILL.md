---
name: kotlin-functional-programming
description: Guides writing idiomatic, functional-style Kotlin code using built-in language features. Use when asked to write, review, or refactor Kotlin code for immutability, pure functions, sealed types, error handling, collections, coroutines, or functional architecture patterns.
---

# Kotlin Functional Programming

## Workflow
1. Read the relevant reference file(s) from `references/` before advising (see References section below for which file covers which topics).
2. Identify which principles apply to the user's code or question (see Summary of Principles in the reference).
3. Apply the relevant best practices; cite section numbers when explaining trade-offs.
4. Prefer Kotlin built-in features over third-party libraries unless the user explicitly asks otherwise.
5. Validate suggestions against the Kotlin 2.0–2.2+ feature set described in the reference.
6. When refactoring existing code, make the smallest change that moves toward the functional core, imperative shell architecture.

## Key Principles (quick reference)
- Default to `val`; treat `var` as a code smell requiring justification.
- Write pure functions for all domain logic; push I/O and mutation to the edges.
- Use `if`, `when`, `try` as expressions that return values assigned to `val`.
- Model variants with `sealed interface`; never add `else` to an exhaustive `when`.
- Wrap primitives in `@JvmInline value class` to prevent argument-order bugs at zero runtime cost.
- Handle expected failures with `T?`, `Result<T>`, or sealed error hierarchies — not exceptions.
- Compose behavior with higher-order functions; use `inline` on lambda-taking utilities to eliminate allocation overhead.
- Build data pipelines with collection operators (`map`, `filter`, `fold`, `flatMap`, …).
- Default to eager collections; switch to `Sequence` only for large datasets with multiple chained operations.
- Use `tailrec` for linear recursion, `DeepRecursiveFunction` for tree/graph recursion.
- Model async work with `suspend` functions and `Flow` pipelines; prefer `coroutineScope` over `GlobalScope`.
- Use context parameters (Kotlin 2.2+) sparingly for cross-cutting concerns (`Raise`, logging, transaction scope).

## Common Tasks

### Writing pure domain logic
Follow §2 (Pure Functions), §3 (Immutability), §17 (Functional Core, Imperative Shell).  
Pass all dependencies as parameters; return new values instead of mutating inputs.

### Modeling a domain with types
Follow §5 (Sealed Types), §6 (Value Classes).  
Prefer `sealed interface` over `sealed class` unless subtypes share state.  
Add validation in value class `init` blocks ("parse, don't validate").

### Error handling
Follow §7 (Functional Error Handling).  
- Absence/not-found → nullable `T?`
- Wrapping throwing APIs → `Result<T>` + `runCatching`
- Typed domain errors → custom sealed hierarchy + minimal `Either<L, R>`

### Collection pipelines
Follow §12 (Collections) and §13 (Sequences).  
Prefer named operations over manual loops.  
Use `fold` over `reduce` when an initial value is needed or the result type differs.

### Testing
Follow §18 (Testing).  
- Test pure core with direct assertions — no mocks needed.
- Test sealed branches exhaustively.
- Use Kotest `forAll` / `Arb` for property-based testing of validators and transformations.
- Reserve integration tests (MockK, Testcontainers) for the imperative shell.

## References
- [references/01-foundations.md](references/01-foundations.md) — §1–4: Why FP, Pure Functions, Immutability, Expressions
- [references/02-type-system.md](references/02-type-system.md) — §5–7: Sealed Types, Value Classes, Error Handling
- [references/03-functions-and-composition.md](references/03-functions-and-composition.md) — §8–11: HOFs, Inline, Extensions, Scope Functions
- [references/04-collections-and-sequences.md](references/04-collections-and-sequences.md) — §12–13: Collection Pipelines, Sequences
- [references/05-advanced-patterns.md](references/05-advanced-patterns.md) — §14–16: DSLs, Recursion, Coroutines
- [references/06-architecture-testing-context.md](references/06-architecture-testing-context.md) — §17–19: Architecture, Testing, Context Parameters
- [references/07-summary.md](references/07-summary.md) — §20: Summary of all 17 principles
