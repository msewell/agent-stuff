# Configuration and Anti-Patterns

- [Configuration Reference](#configuration-reference)
- [Anti-Patterns](#anti-patterns)

## Configuration Reference

### `PropTestConfig` options

| Option | Default | Description |
|--------|---------|-------------|
| `seed` | Random | Fixed seed for reproducibility |
| `iterations` | 1,000 | Number of test iterations |
| `maxFailure` | 0 | Tolerate up to N failures before failing |
| `shrinkingMode` | `Bounded(1000)` | `Bounded(n)`, `Unbounded`, or `Off` |
| `maxDiscardPercentage` | 10 | Max % of iterations discardable by assumptions |
| `listeners` | `[]` | `PropTestListener` instances for setup/teardown |
| `outputHexForUnprintableChars` | `false` | Show unprintable chars as `U+XXXX` |

### Per-test configuration

```kotlin
checkAll(PropTestConfig(iterations = 5000, seed = 42L)) { s: String ->
    // ...
}
```

### Global configuration

```kotlin
// In a ProjectConfig or test setup
PropertyTesting.defaultIterationCount = 5000
PropertyTesting.defaultShrinkingMode = ShrinkingMode.Bounded(500)
PropertyTesting.defaultSeed = null  // random each run
PropertyTesting.writeFailedSeed = true
```

### System properties

```
kotest.proptest.default.iteration.count=5000
kotest.proptest.default.shrinking.mode=bounded
kotest.proptest.default.shrinking.bound=500
kotest.proptest.arb.string.output-hex-for-unprintable-chars=true
```

### `PropTestListener` for per-iteration hooks

```kotlin
val listener = object : PropTestListener {
    override suspend fun beforeTest() { /* setup before each iteration */ }
    override suspend fun afterTest() { /* teardown after each iteration */ }
}

checkAll(PropTestConfig(listeners = listOf(listener))) { i: Int ->
    // ...
}
```

---

## Anti-Patterns

### 1. Re-implementing the production logic in the test

```kotlin
// BAD: the test mirrors the implementation — both will have the same bugs
checkAll<Int, Int> { a, b ->
    calculateTax(a, b) shouldBe (a * b * 0.15).roundToInt()
}

// GOOD: test a property, not the formula
checkAll(Arb.positiveInt(), Arb.positiveInt()) { price, quantity ->
    calculateTax(price, quantity) shouldBeGreaterThanOrEqualTo 0
    calculateTax(price, quantity) shouldBeLessThan price * quantity
}
```

### 2. Testing only one property

A single property provides weak assurance. A function that always returns `0` passes `result >= 0`. Identify multiple complementary properties.

### 3. Reducing iteration count to "fix" slow tests

This defeats the purpose of PBT. Instead: optimize generators, split test suites, run long PBT suites in nightly builds, or use `Exhaustive` for small domains.

### 4. Excessive `assume()` / `filter()` usage

If more than ~10% of generated values are discarded, your generator is poorly matched to the domain. Redesign it.

### 5. Ignoring shrunk counterexamples

The minimal counterexample is the most valuable output of a PBT failure. Always analyze it, understand the root cause, and convert it to a permanent regression test.

### 6. Testing trivial properties

`checkAll<Int> { it + 0 shouldBe it }` tests the language, not your code. Reserve PBT for code with meaningful business invariants.

### 7. Writing shrinkers that violate invariants

A shrinker for `PositiveInt` that can produce `0` or `-1` causes false failures. Always ensure shrunk values satisfy the generator's domain constraints.

### 8. Using `Random` instead of `RandomSource`

Inside custom generators, always use `RandomSource` (or `.bind()`) to maintain seed-based reproducibility. Using `kotlin.random.Random.Default` breaks deterministic replay.
