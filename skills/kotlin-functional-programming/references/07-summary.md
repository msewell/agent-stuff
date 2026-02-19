# Functional Programming in Kotlin: Summary of Principles
> Section 20 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 20. Summary of Principles

| # | Principle | Key takeaway |
|---|---|---|
| 1 | **Default to `val` and immutability** | Mutable state is the root of most bugs. Use `var` only when justified. |
| 2 | **Write pure functions** | Functions should depend only on their inputs and produce no side effects. |
| 3 | **Use expressions, not statements** | `if`, `when`, `try` return values. Assign results to `val` instead of mutating. |
| 4 | **Model with sealed types** | Use sealed interfaces for ADTs. Let the compiler enforce exhaustive handling. |
| 5 | **Wrap primitives in value classes** | `UserId(Long)` prevents bugs that `Long` cannot. Zero runtime cost. |
| 6 | **Handle errors with types, not exceptions** | Use `Result`, nullable returns, or sealed hierarchies for expected failures. |
| 7 | **Compose with higher-order functions** | Small functions that take and return functions compose into larger behaviors. |
| 8 | **Inline for zero-cost abstraction** | Use `inline` on functions taking lambdas to eliminate allocation overhead. |
| 9 | **Extend types with pure extensions** | Extension functions enable method-chaining pipelines on any type. |
| 10 | **Use collection pipelines** | `map`, `filter`, `fold` express intent better than manual loops. |
| 11 | **Prefer eager collections; use sequences when justified** | Sequences help for large data + many operations, but aren't always faster. |
| 12 | **Build DSLs with lambda-with-receiver** | Type-safe builders produce readable, declarative configuration code. |
| 13 | **Use `tailrec` and `DeepRecursiveFunction`** | Make recursion stack-safe with compiler support. |
| 14 | **Think of coroutines as effect descriptions** | `suspend` separates what from when. `Flow` is a functional reactive stream. |
| 15 | **Functional core, imperative shell** | Keep domain logic pure. Push I/O to the edges. Test the core with no mocks. |
| 16 | **Test with properties, not just examples** | Property-based testing catches edge cases you wouldn't think to write. |
| 17 | **Adopt context parameters incrementally** | Use for cross-cutting concerns and typed errors as the feature matures. |

---

*The goal is not to write Haskell in Kotlin. The goal is to use Kotlin's built-in functional features — deliberately and consistently — to write code that is simpler, safer, and easier to change.*
