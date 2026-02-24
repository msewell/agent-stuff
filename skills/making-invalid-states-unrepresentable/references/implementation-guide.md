# Practical Implementation Guide

## Step-by-Step Process

**1. Identify the domain**
- What are the valid states?
- What are the invalid states?
- What transitions are allowed?

**2. Model with types**
- Use sum types for alternatives
- Use product types for combinations
- Use phantom types for compile-time state

**3. Push validation to boundaries**
- Parse external input immediately
- Return precise types from parsers
- Propagate type information through the call chain

**4. Refactor incrementally**
- Start with one function
- Update callers (compiler guides you)
- Continue until you reach the boundary

**5. Test the edges**
- Verify invalid states truly can't be constructed
- Test boundary parsing logic
- Document invariants that can't be encoded

## Code Review Checklist

- [ ] Are optional fields truly optional, or do they represent a sum type?
- [ ] Can this boolean be replaced with a more precise type?
- [ ] Are validation results preserved in types?
- [ ] Is data parsed at system boundaries?
- [ ] Are error cases handled exhaustively?
- [ ] Could invalid states be made unrepresentable?
- [ ] Are smart constructors used for types with invariants?
- [ ] Is denormalized data properly encapsulated?

## Where to Apply: Heuristics

| Scenario | Recommendation |
|----------|----------------|
| Core domain logic | Strongly apply |
| API boundaries | Strongly apply |
| State machines / workflows | Strongly apply |
| ID types, money, quantities | Strongly apply |
| Internal utilities | Apply selectively |
| Prototyping | Apply lightly, refine later |
| Scripts / one-offs | Often overkill |
| External data | Parse at boundary, use refined types internally |

---

# Language-Specific Implementations

## Languages with Native Sum Types

| Language | Feature | Example |
|----------|---------|---------|
| Rust | `enum` | `enum Option<T> { Some(T), None }` |
| F# | Discriminated Union | `type Result = Ok of int \| Error of string` |
| Haskell | Algebraic Data Types | `data Maybe a = Nothing \| Just a` |
| Scala | `sealed trait` + `case class` | `sealed trait Shape; case class Circle(r: Double) extends Shape` |
| Swift | `enum` with associated values | `enum Result<T> { case success(T), failure(Error) }` |
| Kotlin | `sealed class/interface` | `sealed class Result { data class Success(val v: Int): Result() }` |
| OCaml | Variant types | `type color = Red \| Green \| Blue of int` |
| Elm | Custom types | `type Msg = Click \| Input String` |

## TypeScript (2020–2026)

**Strengths:** Discriminated unions with exhaustiveness checking, literal types as tags, structural typing with branded types, conditional types for advanced constraints, `never` type for exhaustiveness.

**Limitations:** No true nominal types (workaround: branded types), limited refinement types, runtime overhead for some patterns.

## Rust (2015–2026)

**Strengths:** Zero-cost abstractions, powerful enum types, typestate pattern via PhantomData, ownership system prevents additional invalid states, const generics (2024).

## Haskell (1990–2026)

**Strengths:** Most mature type system, GADTs (Generalized Algebraic Data Types), type families, Liquid Haskell for refinement types, singletons library.

## F# (2013–2026)

**Strengths:** Native discriminated unions, pattern matching exhaustiveness, units of measure for dimensional analysis, type providers.

## Elm (2016–2026)

**Philosophy:** "Make impossible states impossible" (Richard Feldman). "No runtime exceptions" guarantee. Excellent error messages.

## Java (15+)

**Recent additions:** Sealed classes/interfaces (`sealed`, `permits`), records for immutable value types, pattern matching in `switch`.

---

# Related Principles

## Type-Driven Development

1. Write types first
2. Let types guide implementation
3. Compiler tells you what's missing

Types serve as executable specifications. Refactoring is safer. Documentation can't go out of sync.

## Domain-Driven Design (DDD)

Use types to model domain concepts precisely and encode workflows in function signatures:

```fsharp
type UnvalidatedOrder = { (* ... *) }
type ValidatedOrder = { (* ... *) }
type PricedOrder = { (* ... *) }

let validateOrder: UnvalidatedOrder -> Result<ValidatedOrder, ValidationError>
let priceOrder: ValidatedOrder -> PricedOrder
let placeOrder: PricedOrder -> Result<PlacedOrder, PlacementError>
```

> "The database is not your domain model — it is the storage representation of your domain model on disk."

## Fail-Fast Principle

Parse at system boundaries, fail immediately on invalid input. Synergy with "Parse, Don't Validate."

## Principle of Least Privilege

Types grant only necessary capabilities:

```rust
fn analyze(data: &Data) { /* read-only access */ }
fn modify(data: &mut Data) { /* mutable access */ }
fn consume(data: Data) { /* ownership transfer */ }
```
