# Functional Programming in Kotlin: Functions and Composition
> Sections 8–11 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 8. Higher-Order Functions and Lambdas

A higher-order function either takes a function as a parameter, returns a function, or both. This is the backbone of functional composition in Kotlin.

### Functions as parameters

```kotlin
fun <T> List<T>.filterWith(predicate: (T) -> Boolean): List<T> = buildList {
    for (item in this@filterWith) {
        if (predicate(item)) add(item)
    }
}

val adults = users.filterWith { it.age >= 18 }
```

### Functions as return values

```kotlin
fun greaterThan(threshold: Int): (Int) -> Boolean = { it > threshold }

val isPositive = greaterThan(0)
val positiveNumbers = listOf(-1, 0, 3, 7, -2).filter(isPositive)
// [3, 7]
```

### Composing functions

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C = { a -> f(g(a)) }

val trimAndUpperCase = compose(String::uppercase, String::trim)
trimAndUpperCase("  hello  ") // "HELLO"
```

### Trailing lambda and SAM conversions

Kotlin's trailing lambda syntax makes higher-order functions read naturally:

```kotlin
// Trailing lambda — last parameter can go outside parentheses
users.sortedBy { it.lastName }

// SAM conversion — single-abstract-method Java interfaces
executor.submit { println("Running in thread pool") }
```

### Best practices

- **Keep lambdas short.** If a lambda exceeds ~5 lines, extract it into a named function for readability.
- **Use function references** (`::functionName`) when passing existing functions — they are more readable than wrapping in a lambda.
- **Name parameters in complex function types** for documentation: `(predicate: (User) -> Boolean)` is clearer than `((User) -> Boolean)`.
- **Avoid deeply nested lambdas.** Flatten with intermediate variables or extract functions.

---

## 9. Inline Functions: Eliminating Abstraction Cost

Kotlin's `inline` keyword tells the compiler to copy the function body (and its lambda arguments) directly into the call site, eliminating the overhead of function calls and lambda object allocation.

### Why it matters

Every non-inline lambda in Kotlin creates an anonymous class instance. For hot loops or frequently called utilities, this can be significant. `inline` removes that overhead entirely.

```kotlin
// Without inline: creates a Function1 object for the lambda at each call
fun <T> measure(block: () -> T): T { ... }

// With inline: lambda body is inlined at the call site — no object allocation
inline fun <T> measure(block: () -> T): T {
    val start = System.nanoTime()
    val result = block()
    println("Took ${System.nanoTime() - start}ns")
    return result
}
```

### `crossinline` and `noinline`

```kotlin
inline fun transaction(
    crossinline body: () -> Unit,  // Inlined, but cannot use non-local return
    noinline onError: (Exception) -> Unit  // Not inlined — can be stored/passed around
) {
    try {
        begin()
        body()
        commit()
    } catch (e: Exception) {
        rollback()
        onError(e)
    }
}
```

- `crossinline` — the lambda will be inlined, but you disallow non-local `return` (needed when the lambda is called from a different execution context, like inside another lambda).
- `noinline` — this particular lambda parameter should not be inlined (needed when you want to store it in a variable or pass it to another function).

### Reified type parameters

`inline` functions can use `reified` type parameters, which preserve generic type information at runtime:

```kotlin
inline fun <reified T> String.parseAs(): T = when (T::class) {
    Int::class -> toInt() as T
    Double::class -> toDouble() as T
    Boolean::class -> toBoolean() as T
    else -> throw IllegalArgumentException("Unsupported type: ${T::class}")
}

val port = "8080".parseAs<Int>()  // 8080
```

Without `inline` + `reified`, you would need to pass `KClass<T>` explicitly.

### Best practices

- **Inline functions that take lambdas** — this is the primary use case. The stdlib's `let`, `run`, `apply`, `also`, `with`, `map`, `filter`, etc. are all inline.
- **Don't inline large function bodies** that don't take lambdas — inlining just bloats the bytecode with no benefit.
- **Use `reified` for type-safe utilities** like serialization, logging, and service locators.
- **Be aware of non-local returns:** an inlined lambda can `return` from the enclosing function, not just the lambda. This is powerful but can be surprising.

---

## 10. Extension Functions for Composition

Extension functions let you add behavior to existing types without inheritance or wrapper classes. From a functional programming perspective, they enable **method-chaining composition** on any type.

### Pure extension functions

```kotlin
fun String.toSlug(): String =
    this.trim()
        .lowercase()
        .replace(Regex("[^a-z0-9\\s-]"), "")
        .replace(Regex("[\\s-]+"), "-")

"  Hello, World!  ".toSlug()  // "hello-world"
```

### Chaining for pipelines

Extension functions compose naturally through chaining:

```kotlin
fun Money.applyDiscount(rate: Double): Money =
    copy(amount = amount * BigDecimal(1 - rate))

fun Money.applyTax(taxRate: Double): Money =
    copy(amount = amount * BigDecimal(1 + taxRate))

fun Money.roundToNearest(unit: BigDecimal): Money =
    copy(amount = (amount / unit).setScale(0, RoundingMode.HALF_UP) * unit)

// Clean pipeline — reads top to bottom
val finalPrice = originalPrice
    .applyDiscount(0.10)
    .applyTax(0.19)
    .roundToNearest(BigDecimal("0.01"))
```

### Best practices

- **Keep extension functions pure** — they should depend only on the receiver and parameters, not on external mutable state.
- **Don't use extension functions to simulate adding state to a class.** They cannot access private members of the receiver class (unless defined in the same file).
- **Prefer extension functions over utility classes.** `"hello".capitalize()` is more readable than `StringUtils.capitalize("hello")`.
- **Use extensions on interfaces** for maximum reusability — e.g., an extension on `Comparable<T>` works for any comparable type.
- **Beware shadowing:** if a class already has a member function with the same signature, the member always wins. The extension function will never be called.

---

## 11. Scope Functions as Functional Idioms

Kotlin's five scope functions — `let`, `run`, `with`, `apply`, `also` — provide concise, expression-oriented ways to operate on objects. They are all `inline` (zero overhead) and differ in how they reference the context object and what they return.

### Quick reference

| Function | Context object | Return value | Use case |
|---|---|---|---|
| `let` | `it` | Lambda result | Null-safe chains, transformations |
| `run` | `this` | Lambda result | Object configuration + compute |
| `with` | `this` | Lambda result | Grouping calls on an object |
| `apply` | `this` | Context object | Object initialization / builder |
| `also` | `it` | Context object | Side effects (logging, debugging) |

### Idiomatic patterns

```kotlin
// let — transform nullable value
val length = name?.let { it.trim().length }

// run — compute a result using an object's members
val fullAddress = address.run { "$street, $city, $zip" }

// apply — configure an object
val request = HttpRequest().apply {
    url = "https://api.example.com/users"
    method = "GET"
    headers["Accept"] = "application/json"
}

// also — attach a side effect without modifying the chain
val user = findUser(id)
    .also { logger.debug("Found user: $it") }
    ?.also { analytics.trackUserAccess(it.id) }
```

### Anti-patterns to avoid

- **Nesting scope functions deeply.** `user.let { it.address.let { it.city.let { ... } } }` is unreadable. Use safe-call chains instead: `user?.address?.city`.
- **Using scope functions when a simple `val` would suffice.** Don't use `let` just because you can — use it when it improves clarity (especially for null-safe transformations).
- **Mixing `this`-based and `it`-based scope functions** in a nested context — the implicit `this` can shadow the outer receiver, causing confusion.
