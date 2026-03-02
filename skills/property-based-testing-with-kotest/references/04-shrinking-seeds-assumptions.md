# Shrinking, Seeds, and Assumptions

- [Shrinking](#shrinking)
- [Seeds and Reproducibility](#seeds-and-reproducibility)
- [Assumptions and Constraints](#assumptions-and-constraints)

## Shrinking

When a test fails, Kotest automatically *shrinks* the failing input — simplifying it to the smallest counterexample that still triggers the failure. This transforms a confusing input like `"x\u0000\uFFFF🎄abc"` into `"a"`.

### How it works

1. A generated value causes a test failure.
2. The shrinker produces candidate simplifications (e.g., shorter strings, smaller numbers).
3. Kotest tests each candidate. If it still fails, it becomes the new "best" counterexample.
4. Repeat until no simpler failing value is found.

### Shrinking modes

| Mode | Behavior | Use when |
|------|----------|----------|
| `Bounded(n)` | Up to `n` shrink steps (default: 1,000) | **Default. Good for most cases.** |
| `Unbounded` | Shrinks until fully minimized | Debugging complex failures where minimal case matters. |
| `Off` | No shrinking | Performance-sensitive tests or when shrinking is counterproductive. |

```kotlin
checkAll(PropTestConfig(shrinkingMode = ShrinkingMode.Unbounded)) { s: String ->
    // ...
}
```

### Custom shrinkers

When you create domain-specific generators, provide a shrinker so failures shrink to meaningful minimal cases:

```kotlin
data class DateRange(val start: LocalDate, val end: LocalDate)

val dateRangeShrinker = Shrinker<DateRange> { range ->
    listOf(
        DateRange(range.start, range.start),                          // collapse to single day
        DateRange(range.start, range.start.plusDays(1)),              // minimal range
        DateRange(range.start.plusDays(1), range.end),               // shrink from start
        DateRange(range.start, range.end.minusDays(1)),              // shrink from end
    ).filter { it.start <= it.end }  // preserve domain invariant
}

val arbDateRange = arbitrary(dateRangeShrinker) {
    val start = Arb.localDate().bind()
    val end = Arb.localDate(minDate = start).bind()
    DateRange(start, end)
}
```

**Critical rule:** custom shrinkers must preserve domain invariants. A shrinker that produces invalid values causes false failures and erodes trust in the test suite.

### Integrated shrinking

Kotest uses *integrated* (internal) shrinking — shrinking operates on the random choices that produced the value, not on the value's type alone. This means shrunk values always satisfy the generator's constraints, unlike older "type-based" shrinking approaches.

---

## Seeds and Reproducibility

Every property test run uses a random seed. Kotest provides several mechanisms to control and leverage this.

### Failed seed persistence

When a test fails, Kotest:
1. Prints the seed that caused the failure.
2. Writes it to `~/.kotest/seeds/<spec>/<testname>`.
3. On subsequent runs, replays that seed *first* — creating an automatic regression test.
4. Once the test passes with the persisted seed, the seed file is removed.

### Manual seeds

Pin a seed for debugging or permanent regression:

```kotlin
checkAll(PropTestConfig(seed = 127305235)) { s: String ->
    myFunction(s) shouldBe expected
}
```

### Best practice: capture failing seeds as regression tests

```kotlin
// Discovered by PBT with seed 127305235: empty string causes crash
test("empty string edge case (regression)") {
    myFunction("") shouldBe ""
}

// Original property test continues finding new failures
test("myFunction preserves length") {
    checkAll<String> { s -> myFunction(s).length shouldBe s.length }
}
```

### CI/CD seed management

Prevent accidentally committing seed files to version control:

```kotlin
// In kotest config or system property:
// kotest.proptest.seed.fail-if-set=true  // fail CI if seed files exist
```

Or disable seed persistence entirely:

```kotlin
PropertyTesting.writeFailedSeed = false
```

---

## Assumptions and Constraints

Assumptions filter generated values mid-test, skipping iterations that don't meet cross-variable preconditions.

### `assume()` — inline style

```kotlin
checkAll<String, String> { a, b ->
    assume(a != b)
    levenshtein(a, b) shouldBeGreaterThan 0
}
```

### `withAssumptions` — block style with matchers

```kotlin
checkAll<String, String> { a, b ->
    withAssumptions({
        a shouldNotBe b
        a shouldHaveLength b.length
    }) {
        a.compareTo(b) shouldNotBe 0
    }
}
```

### Max discard percentage

Kotest tracks how many iterations are discarded by assumptions. If the discard rate exceeds 10% (default), the test fails.

```kotlin
checkAll(PropTestConfig(maxDiscardPercentage = 25)) { a: Int, b: Int ->
    assume(a > b)
    // ~50% discard rate — this will fail with default 10% limit
}
```

**Better approach:** constrain the generators instead:

```kotlin
checkAll(Arb.int(), Arb.int()) { a, b ->
    val (larger, smaller) = if (a > b) a to b else b to a
    // No assumptions needed, no discards
}
```

**Rule of thumb:** use `assume()` for cross-variable constraints that can't be expressed in generators. Use `filter()` or constrained generators for single-variable constraints.
