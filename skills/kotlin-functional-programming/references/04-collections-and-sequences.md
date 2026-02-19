# Functional Programming in Kotlin: Collections and Sequences
> Sections 12–13 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 12. Collections: Functional Pipelines

Kotlin's standard library provides a rich set of functional operations on collections. These operations compose into readable, declarative data transformation pipelines.

### Core operations

```kotlin
data class Order(val customer: String, val items: List<Item>, val status: Status)
data class Item(val name: String, val price: Double, val quantity: Int)

val orders: List<Order> = fetchOrders()

// Transformation pipeline
val report = orders
    .filter { it.status == Status.COMPLETED }
    .flatMap { it.items }
    .groupBy { it.name }
    .mapValues { (_, items) -> items.sumOf { it.price * it.quantity } }
    .entries
    .sortedByDescending { it.value }
    .take(10)
```

### Essential functional operations

| Operation | Purpose | Example |
|---|---|---|
| `map` | Transform each element | `names.map { it.uppercase() }` |
| `filter` | Keep elements matching predicate | `users.filter { it.isActive }` |
| `flatMap` | Map + flatten nested collections | `orders.flatMap { it.items }` |
| `fold` / `reduce` | Accumulate into single value | `prices.fold(0.0) { acc, p -> acc + p }` |
| `groupBy` | Group into map by key | `users.groupBy { it.department }` |
| `associateBy` | Create map with unique keys | `users.associateBy { it.id }` |
| `partition` | Split into two lists by predicate | `val (active, inactive) = users.partition { it.isActive }` |
| `zip` | Combine two lists pairwise | `names.zip(scores)` |
| `windowed` | Sliding window over elements | `temps.windowed(3) { it.average() }` |
| `chunked` | Split into fixed-size groups | `items.chunked(50)` |
| `any` / `all` / `none` | Boolean aggregates | `orders.any { it.total > 1000 }` |

### Destructuring with `partition` and `unzip`

```kotlin
// partition — split by predicate
val (passing, failing) = testResults.partition { it.score >= 60 }

// unzip — split list of pairs into two lists
val (names, ages) = people.map { it.name to it.age }.unzip()
```

### `associate` variants for building maps

```kotlin
// associateWith — keys are elements, values computed
val nameLengths = names.associateWith { it.length }

// associateBy — values are elements, keys computed
val userById = users.associateBy { it.id }

// associate — full control over key-value pairs
val lookup = entries.associate { it.key.lowercase() to it.value.trim() }
```

### Best practices

- **Prefer named operations over manual loops.** `list.filter { ... }.map { ... }` communicates intent better than a `for` loop with `if` and a mutable accumulator.
- **Use `fold` over `reduce`** when you need an initial value or when the result type differs from the element type. `reduce` throws on empty collections.
- **Avoid long chains without intermediate names.** If a pipeline exceeds 5-6 operations, break it up with named intermediate values for readability.
- **Watch for performance:** each operation creates an intermediate collection. For large datasets or many chained operations, consider Sequences (§13 below).

---

## 13. Sequences and Lazy Evaluation

Sequences evaluate elements lazily — operations are applied one element at a time, on demand, rather than creating intermediate collections at each step.

### When sequences help

```kotlin
// Eager — creates 3 intermediate lists
val result = hugeList
    .filter { it.isValid() }    // List 1
    .map { it.transform() }     // List 2
    .take(10)                   // List 3

// Lazy — processes elements one at a time, stops after 10 matches
val result = hugeList.asSequence()
    .filter { it.isValid() }
    .map { it.transform() }
    .take(10)
    .toList()  // Terminal operation triggers evaluation
```

### Creating sequences

```kotlin
// From existing collections
val seq = listOf(1, 2, 3).asSequence()

// Infinite sequences
val naturals = generateSequence(1) { it + 1 }
val fibs = sequence {
    var a = 0L
    var b = 1L
    while (true) {
        yield(a)
        val next = a + b
        a = b
        b = next
    }
}

fibs.take(10).toList()  // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Performance nuances

Benchmarks (notably by Chris Banes and others) show that **sequences are not always faster**:

- **Small to medium collections (< ~10,000 elements):** Eager collection operations can be faster because they benefit from CPU cache locality and avoid per-element function call overhead. The JIT compiler also optimizes tight loops over arrays very well.
- **Large collections with multiple chained operations:** Sequences win because they avoid allocating intermediate collections.
- **Operations with `take` / `first` / `find`:** Sequences can short-circuit — this is where they shine most, potentially skipping vast amounts of work.
- **Single operations (just one `map` or `filter`):** Sequences add overhead with no benefit. Use them only with chains of 2+ operations on large data.

### Best practices

- **Default to eager collections.** Only switch to sequences when you have profiling data showing it matters, or when dealing with large datasets + multiple operations.
- **Always end a sequence chain with a terminal operation** (`toList()`, `toSet()`, `first()`, `forEach()`, etc.). Sequences are lazy — nothing happens without a terminal.
- **Use `sequence { yield() }` for generator-style code** — it is clear, stack-safe, and can express complex iteration logic.
- **Don't use sequences for side effects.** Lazy evaluation means side effects may never execute if the terminal operation doesn't consume all elements.
