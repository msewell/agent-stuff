# Functional Programming in Kotlin: Advanced Patterns
> Sections 14–16 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 14. Type-Safe Builders and DSLs

Kotlin's **lambda with receiver** syntax lets you build domain-specific languages (DSLs) that are both type-safe and readable. This is a functional pattern: you configure a structure declaratively by composing functions.

### Lambda with receiver

A lambda with receiver has access to the members of a specified object as `this`:

```kotlin
fun buildString(action: StringBuilder.() -> Unit): String {
    val sb = StringBuilder()
    sb.action()
    return sb.toString()
}

val greeting = buildString {
    append("Hello, ")
    append("World!")
}
```

### Building a custom DSL

```kotlin
// Domain model
data class HtmlTag(val name: String, val children: List<HtmlTag>, val text: String?)

// DSL builder
class HtmlBuilder(private val name: String) {
    private val children = mutableListOf<HtmlTag>()
    private var text: String? = null

    fun text(value: String) { text = value }

    fun tag(name: String, init: HtmlBuilder.() -> Unit) {
        children.add(HtmlBuilder(name).apply(init).build())
    }

    fun build(): HtmlTag = HtmlTag(name, children.toList(), text)
}

fun html(init: HtmlBuilder.() -> Unit): HtmlTag =
    HtmlBuilder("html").apply(init).build()

// Usage — reads like a declarative structure
val page = html {
    tag("head") {
        tag("title") { text("My Page") }
    }
    tag("body") {
        tag("h1") { text("Hello!") }
        tag("p") { text("Welcome to my page.") }
    }
}
```

### `@DslMarker` — preventing scope leakage

Without `@DslMarker`, inner lambdas can accidentally access members of outer receivers:

```kotlin
@DslMarker
annotation class HtmlDsl

@HtmlDsl
class HtmlBuilder(private val name: String) { ... }
```

Now, inside a nested `tag { }` block, you can only access the immediate receiver. To access an outer receiver, you must use a labeled `this` (`this@html`). This prevents confusing scope leaks and makes DSLs safer.

### Best practices

- **Use `@DslMarker`** on all DSL builder classes to prevent accidental scope access.
- **Return immutable types from builders.** The builder itself can use mutation internally, but the result should be immutable.
- **Prefer `buildList` / `buildMap` / `buildString`** from the stdlib before writing custom builders — they cover many common cases.
- **Keep DSLs shallow.** Deeply nested DSLs become hard to read and maintain.

---

## 15. Recursion and Stack Safety

Functional programming often uses recursion instead of loops. Kotlin provides two mechanisms for safe recursion.

### `tailrec` — stack-safe tail recursion

The `tailrec` modifier tells the compiler to transform a tail-recursive function into a loop, eliminating stack overflow risk:

```kotlin
tailrec fun factorial(n: Long, acc: Long = 1): Long =
    if (n <= 1) acc
    else factorial(n - 1, n * acc)

factorial(50_000)  // Works — compiled to a loop
```

**Requirements for `tailrec`:**
- The recursive call must be the **last** operation in the function (tail position).
- No operations can be performed on the result of the recursive call.
- The compiler verifies this and warns if the call is not in tail position.

### Converting to tail-recursive form

Many recursive functions can be rewritten with an accumulator parameter:

```kotlin
// ❌ Not tail-recursive — multiplication happens AFTER the recursive call
fun badFactorial(n: Long): Long =
    if (n <= 1) 1 else n * badFactorial(n - 1)

// ✅ Tail-recursive — accumulator carries the running result
tailrec fun goodFactorial(n: Long, acc: Long = 1): Long =
    if (n <= 1) acc else goodFactorial(n - 1, n * acc)
```

### `DeepRecursiveFunction` — for non-tail-recursive algorithms

Some algorithms (like tree traversals) are inherently not tail-recursive. Kotlin provides `DeepRecursiveFunction` (since 1.7) that uses coroutine machinery to run recursion on the heap instead of the stack:

```kotlin
val depth = DeepRecursiveFunction<TreeNode?, Int> { node ->
    if (node == null) 0
    else maxOf(callRecursive(node.left), callRecursive(node.right)) + 1
}

val treeDepth = depth(rootNode)  // Safe even for trees with 100,000+ depth
```

### Best practices

- **Prefer `tailrec` for linear recursion** (single recursive call). The compiler enforces correctness.
- **Use `DeepRecursiveFunction` for tree/graph recursion** where tail-call elimination is impossible.
- **For simple iteration, just use loops or collection operations.** Don't force recursion where `fold` or `forEach` reads more naturally. Recursion is a tool, not a goal.

---

## 16. Coroutines Through a Functional Lens

Kotlin coroutines are not a functional programming feature per se, but they interact deeply with functional patterns. Understanding them through a functional lens helps you write cleaner concurrent code.

### Suspending functions and purity

A `suspend` function can be thought of as a function that returns a "description of a computation" rather than executing immediately. This is analogous to how pure functional languages treat IO:

```kotlin
// This function is "pure" in the sense that it describes what to do,
// but the actual I/O only happens when the coroutine is executed
suspend fun fetchUser(id: UserId): User =
    httpClient.get("https://api.example.com/users/${id.value}")
        .body()
```

While `suspend` functions are not pure in the strict sense (they perform side effects when executed), structuring them this way — as descriptions of effects — helps separate **what** to do from **when** to do it.

### `Flow` as a functional stream

`Flow` is Kotlin's cold, asynchronous stream. It follows functional patterns:

```kotlin
fun temperatureReadings(): Flow<Double> = flow {
    while (true) {
        emit(sensor.read())
        delay(1_000)
    }
}

// Functional pipeline on an asynchronous stream
temperatureReadings()
    .filter { it > 30.0 }
    .map { Alert(temperature = it, severity = Severity.HIGH) }
    .distinctUntilChanged()
    .collect { sendAlert(it) }
```

Key `Flow` operators mirror collection operators: `map`, `filter`, `flatMapConcat`, `flatMapMerge`, `fold`, `reduce`, `take`, `zip`, `combine`.

### Structured concurrency as a functional pattern

Structured concurrency ensures that coroutine lifetimes are bounded by scopes, similar to how functional languages scope resource lifetimes:

```kotlin
suspend fun fetchDashboard(userId: UserId): Dashboard = coroutineScope {
    // Concurrent but structured — if one fails, both are cancelled
    val profile = async { fetchProfile(userId) }
    val orders = async { fetchRecentOrders(userId) }

    Dashboard(profile.await(), orders.await())
}
```

### Best practices

- **Use `Flow` for reactive data pipelines** — it composes functionally and handles backpressure.
- **Prefer `coroutineScope` over `GlobalScope`** — structured concurrency bounds lifetimes and prevents leaks, similar to how functional patterns bound effects.
- **Keep suspending functions focused** — one effect per function. Compose them at a higher level.
- **Use `StateFlow` and `SharedFlow`** for state management — they provide immutable snapshots of state that observers consume functionally.
