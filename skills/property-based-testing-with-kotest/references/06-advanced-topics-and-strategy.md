# Advanced Topics and Testing Strategy

- [Stateful / Model-Based Testing](#stateful--model-based-testing)
- [Metamorphic Testing](#metamorphic-testing)
- [Testing Concurrent Code](#testing-concurrent-code)
- [Custom Edge Cases](#custom-edge-cases)
- [CI/CD Strategies for PBT](#cicd-strategies-for-pbt)
- [Statistics and Coverage](#statistics-and-coverage)
- [PBT in Your Testing Strategy](#pbt-in-your-testing-strategy)

## Stateful / Model-Based Testing

Test stateful systems by maintaining a simplified model alongside the real system. Apply the same random operation sequence to both; assert their states remain consistent.

```kotlin
// Simplified model: a MutableMap
// System under test: your custom cache implementation

data class CacheOp(val type: OpType, val key: String, val value: String?)
enum class OpType { PUT, GET, DELETE }

val arbOps = Arb.list(arbitrary {
    CacheOp(
        type = Arb.enum<OpType>().bind(),
        key = Arb.string(1..10).bind(),
        value = Arb.string(1..50).orNull().bind()
    )
}, 1..100)

test("cache matches model under random operations") {
    checkAll(arbOps) { ops ->
        val model = mutableMapOf<String, String>()
        val cache = MyCache()

        ops.forEach { op ->
            when (op.type) {
                OpType.PUT -> {
                    op.value?.let {
                        model[op.key] = it
                        cache.put(op.key, it)
                    }
                }
                OpType.GET -> {
                    cache.get(op.key) shouldBe model[op.key]
                }
                OpType.DELETE -> {
                    model.remove(op.key)
                    cache.delete(op.key)
                }
            }
        }
    }
}
```

Model-based testing is powerful for databases, caches, state machines, and any system where you can describe correct behavior as a simple reference implementation.

## Metamorphic Testing

When you can't predict the correct output, test *relationships* between outputs under related inputs.

**Relation types:**

| Relation | Description | Example |
|----------|-------------|---------|
| Invariance | Minor input changes, same output | Adding irrelevant whitespace shouldn't change parse result |
| Monotonicity | Logical input change raises/lowers output | Higher salary => higher tax |
| Subset/Superset | Loosening constraints yields superset of results | Wider date range => more matching records |
| Equivalence | Different representations, same result | `sort(a + b) == sort(b + a)` |

```kotlin
// Metamorphic: search relevance
checkAll(Arb.string(1..20)) { query ->
    val exactResults = search(query, fuzzy = false)
    val fuzzyResults = search(query, fuzzy = true)
    exactResults.toSet() shouldBeSubsetOf fuzzyResults.toSet()
}
```

## Testing Concurrent Code

Generate random operation interleavings to find race conditions:

```kotlin
test("concurrent counter is thread-safe") {
    checkAll(Arb.int(1..100), Arb.int(2..8)) { increments, threads ->
        val counter = AtomicCounter()
        coroutineScope {
            repeat(threads) {
                launch(Dispatchers.Default) {
                    repeat(increments) { counter.increment() }
                }
            }
        }
        counter.value shouldBe increments * threads
    }
}
```

Shrinking is especially valuable here — race conditions are notoriously hard to reproduce, and a minimal counterexample pinpoints the exact conditions.

## Custom Edge Cases

Override default edge cases to target domain-specific boundaries:

```kotlin
val arbAge = arbitrary(listOf(0, 1, 17, 18, 21, 65, 120)) {
    Arb.int(0..120).bind()
}
```

The first parameter is a list of edge case values tested before random sampling begins.

## CI/CD Strategies for PBT

**Balancing thoroughness with speed:**

| Environment | Iterations | Rationale |
|-------------|-----------|-----------|
| Local dev | 100-1,000 | Fast feedback |
| PR CI | 1,000 | Reasonable coverage |
| Nightly build | 10,000-100,000 | Deep exploration |

```kotlin
val iterations = System.getenv("PBT_ITERATIONS")?.toIntOrNull() ?: 1_000

checkAll(PropTestConfig(iterations = iterations)) { s: String ->
    // ...
}
```

**Seed management in CI:**
- Enable `writeFailedSeed` locally for automatic regression.
- Set `failOnSeed = true` in CI to prevent accidentally committing seed files.
- When a CI run discovers a failure, capture the seed from the output and create a permanent regression test.

## Statistics and Coverage

Use Kotest's `collect` to understand the distribution of generated values:

```kotlin
checkAll<Int> { i ->
    collect(when {
        i < 0 -> "negative"
        i == 0 -> "zero"
        else -> "positive"
    })
    abs(i) shouldBeGreaterThanOrEqualTo 0
}
```

This prints a distribution summary after the test, helping you verify your generators cover the input space meaningfully.

---

## PBT in Your Testing Strategy

PBT occupies a specific niche in the testing pyramid:

| Layer | Purpose | PBT fit |
|-------|---------|---------|
| Example-based unit tests | Document specific behavior, regressions | Low — use for semantics |
| **Property-based tests** | **Explore input space, find edge cases** | **Core use case** |
| Integration tests | Verify component interactions | Medium — model-based PBT |
| End-to-end tests | Validate user workflows | Low |
| Fuzzing | Find crashes and security issues | Adjacent — PBT tests correctness, fuzzing tests robustness |

### Recommended workflow

1. **Write example-based tests** for documented behavior and known edge cases.
2. **Write property-based tests** for invariants, round-trips, and broad coverage.
3. **When PBT finds a failure**, add the minimal counterexample as a concrete regression test.
4. **Run PBT in CI** with 1,000 iterations. Run longer suites (10k+) in nightly builds.
5. **Use seeds** for reproducibility. Store failing seeds for regression.
6. **During code review**, ask: "Can this test be a property-based test?" Generalize repetitive example-based tests.

### Adoption strategy

Start small:
1. Pick one module with clear invariants (serialization, data transformation, validation).
2. Write 2-3 property tests alongside existing examples.
3. Run them for a week. Analyze any failures PBT discovers.
4. Gradually expand to more modules as the team builds familiarity.
