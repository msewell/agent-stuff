# Functional Programming in Kotlin: Foundations
> Sections 1–4 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 1. Why Functional Programming in Kotlin

Kotlin is a multi-paradigm language. It does not force a purely functional style, but it provides first-class support for functional programming patterns that, when applied deliberately, produce code that is:

- **Easier to reason about** — pure functions with immutable data have no hidden interactions.
- **Easier to test** — functions that depend only on their inputs need no mocks or setup.
- **Easier to compose** — small, focused functions combine into larger behaviors.
- **Safer in concurrent contexts** — immutable data eliminates data races by construction.

The goal is not to write Haskell in Kotlin. The goal is to use the functional features Kotlin provides — `val`, `data class`, sealed hierarchies, higher-order functions, expression-oriented syntax — to write code that is simpler, safer, and more maintainable.

### When to prefer a functional style

| Situation | Functional approach helps because… |
|---|---|
| Domain logic / business rules | Pure functions make rules explicit and testable |
| Data transformation pipelines | Collection operators compose naturally |
| Error handling across layers | Typed returns make failure explicit in signatures |
| Concurrent / parallel code | Immutable data eliminates shared-mutable-state bugs |
| Configuration and validation | Builders and DSLs express intent declaratively |

### When to be pragmatic

Kotlin runs on the JVM (and other targets). Some patterns from purely functional languages (monad transformers, higher-kinded types) do not translate well. Prefer Kotlin's idiomatic constructs over porting abstractions from Haskell or Scala wholesale.

---

## 2. Pure Functions and Referential Transparency

A **pure function** has two properties:

1. Its return value is determined entirely by its input arguments.
2. It produces no observable side effects (no I/O, no mutation of external state).

A pure function is **referentially transparent**: you can replace any call with its return value without changing the program's behavior.



### Recognizing pure vs. impure functions

```kotlin
// ✅ Pure — depends only on input, no side effects
fun discount(price: Double, rate: Double): Double = price * (1 - rate)

// ❌ Impure — reads external mutable state
var taxRate = 0.19
fun withTax(price: Double): Double = price * (1 + taxRate)

// ❌ Impure — performs I/O
fun logAndReturn(value: Int): Int {
    println("Value: $value")  // side effect
    return value
}
```

### Best practices

- **Default to pure functions** for all domain logic. Push I/O and mutation to the edges of your system (see `06-architecture-testing-context.md`).
- **Avoid `var` in function bodies** when possible. If you need local mutation for performance (e.g., building a collection), confine it with `buildList` / `buildMap` so the result is still immutable.
- **Make dependencies explicit.** Pass everything a function needs as parameters rather than reaching into global or class-level mutable state.
- **Prefer returning new values** over mutating inputs. Instead of `list.sort()`, use `list.sorted()`.

---

## 3. Immutability as the Default

Immutability is the single most impactful functional programming practice you can adopt in Kotlin.

### `val` over `var`

```kotlin
val name = "Alice"       // ✅ Immutable reference
var counter = 0          // ❌ Mutable — use only when truly necessary
```

The Kotlin style guide and IntelliJ inspections both encourage `val` by default. Treat every `var` as a code smell that requires justification.

### `data class` for immutable value types

```kotlin
data class Money(val amount: BigDecimal, val currency: Currency)

// Update via copy — returns a new instance, original is untouched
val price = Money(BigDecimal("9.99"), Currency.EUR)
val discounted = price.copy(amount = price.amount * BigDecimal("0.9"))
```

**Key rules for data classes:**
- Declare all properties as `val`.
- Keep data classes shallow — avoid nesting mutable collections inside them.
- Use `copy()` for updates. For deeply nested structures, consider writing focused update functions or look into optics libraries.

### Read-only collections ≠ immutable collections

This is a critical distinction that trips up many Kotlin developers:

```kotlin
val list: List<Int> = mutableListOf(1, 2, 3)
// list.add(4)  // Compile error — List has no add()

// But the underlying object IS mutable:
(list as MutableList<Int>).add(4)  // Succeeds at runtime!
```

Kotlin's `List`, `Set`, and `Map` are **read-only interfaces**, not truly immutable types. The underlying implementation may still be a `MutableList`. This matters for:

- **Thread safety:** passing a "read-only" list to another thread is not safe if the original mutable reference is still accessible.
- **Defensive coding:** if you receive a `List` from external code, you cannot assume it won't change.

**Mitigation strategies:**

1. **Use `toList()` / `toSet()` / `toMap()`** to create defensive copies at API boundaries.
2. **Use `buildList` / `buildSet` / `buildMap`** (Kotlin 1.6+) to construct collections with confined mutability:

```kotlin
val config: Map<String, String> = buildMap {
    put("host", "localhost")
    put("port", "8080")
    // Mutation is confined to this block; result is read-only
}
```

3. **Consider `kotlinx.collections.immutable`** for truly persistent, immutable collections when thread safety is critical. This is a JetBrains-maintained library that provides `PersistentList`, `PersistentMap`, etc. with structural sharing for efficient updates.

---

## 4. Expressions Over Statements

Kotlin makes `if`, `when`, and `try` expressions that return values. This is a key enabler of functional style — it lets you write code that computes values rather than executing sequences of mutations.

### `if` as an expression

```kotlin
// ❌ Statement style — requires var
var label: String
if (score >= 90) label = "A" else label = "B"

// ✅ Expression style — val, no mutation
val label = if (score >= 90) "A" else "B"
```

### `when` as an expression

```kotlin
val httpStatus = when (code) {
    in 200..299 -> "Success"
    in 400..499 -> "Client Error"
    in 500..599 -> "Server Error"
    else -> "Unknown"
}
```

### `try` as an expression

```kotlin
val port: Int = try {
    config["port"]?.toInt() ?: 8080
} catch (_: NumberFormatException) {
    8080
}
```

### Single-expression functions

When a function body is a single expression, use the `=` syntax:

```kotlin
fun isEligible(age: Int): Boolean = age >= 18

fun greet(name: String): String = "Hello, $name!"
```

**Best practices:**
- Use single-expression functions for short, pure transformations. For longer logic, use a block body — readability trumps brevity.
- Prefer `when` over chains of `if-else if` — it is more readable and the compiler can check exhaustiveness when used with sealed types or enums.
- Avoid deeply nested expressions. Extract intermediate values with descriptive names.
