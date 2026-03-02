# Fundamentals and Core API

- [Why Property-Based Testing](#why-property-based-testing)
- [Getting Started](#getting-started)
- [Core API](#core-api)

## Why Property-Based Testing

Example-based tests verify behavior at specific points. Property-based tests verify behavior across the entire input space.

```kotlin
// Example-based: tests ONE case
@Test fun `concatenation length`() {
    ("ab" + "cde").length shouldBe 5
}

// Property-based: tests the RULE across thousands of random inputs
checkAll<String, String> { a, b ->
    (a + b).length shouldBe a.length + b.length
}
```

PBT feeds hundreds or thousands of randomly generated inputs into your code, testing invariants that should hold for *all* values. The framework automatically includes edge cases you might never think to test: empty strings, negative infinity, `Int.MAX_VALUE`, Unicode characters, `NaN`, and more.

### When PBT adds the most value

- **Serialization / parsing round-trips** — encode then decode, verify you get the original back.
- **Functions with broad input spaces** — anything accepting strings, numbers, or collections.
- **Code with clear invariants** — sorting preserves elements, map preserves length, etc.
- **Libraries with many configuration combinations** — too many parameter permutations for manual examples.
- **Strong abstractions with complex implementations** — the abstraction defines properties; PBT verifies them.

### When example-based tests are better

- **Documenting specific business scenarios** — "when a premium user places an order above $100, free shipping applies."
- **Regression pinning** — locking down the exact inputs that triggered a discovered bug.
- **Semantic correctness** — a function can satisfy mathematical properties while computing the wrong thing. Examples provide sanity checks.

**The consensus: use both.** Property tests explore breadth. Example tests verify specific semantics. When PBT discovers a failure, convert the minimal counterexample into a permanent example-based regression test.

---

## Getting Started

### Dependency

```kotlin
// build.gradle.kts
dependencies {
    testImplementation("io.kotest:kotest-property:$kotestVersion")
}
```

Kotest's property module is standalone — you can use it with JUnit, Kotest's test framework, or any other runner.

### Your first property test

```kotlin
class StringPropertyTest : FunSpec({
    test("reversed twice returns original") {
        checkAll<String> { s ->
            s.reversed().reversed() shouldBe s
        }
    }
})
```

Kotest generates 1,000 strings (including edge cases like `""` and non-ASCII characters), reversing each twice and asserting equality. If any input fails, the framework shrinks it to the smallest counterexample.

---

## Core API

### Test functions

| Function | Assertion style | Use when |
|----------|----------------|----------|
| `checkAll` | Uses Kotest matchers (`shouldBe`, etc.) | **Default choice.** Richer error messages. |
| `forAll` | Returns `Boolean` | Property is naturally a boolean expression. |

Both support up to 14 type parameters and default to 1,000 iterations.

```kotlin
// checkAll — assertion-based (preferred)
checkAll<Int, Int> { a, b ->
    (a + b) shouldBe (b + a)
}

// forAll — boolean-based
forAll<Int, Int> { a, b ->
    (a + b) == (b + a)
}

// Custom iteration count
checkAll<String>(10_000) { s ->
    s.length shouldBeGreaterThanOrEqualTo 0
}
```

### Passing explicit generators

When default generators are too broad, pass specific ones:

```kotlin
checkAll(Arb.int(1..100), Arb.int(1..100)) { a, b ->
    (a + b) shouldBeGreaterThan 0
}
```

### Generator types

Kotest provides two generator families:

- **`Arb<T>`** (Arbitrary) — infinite stream of random values plus built-in edge cases.
- **`Exhaustive<T>`** — deterministic enumeration of every value in a finite space.

```kotlin
// Arb: random with edge cases
checkAll(Arb.int()) { i -> /* 1000 random ints including 0, -1, 1, MAX, MIN */ }

// Exhaustive: every value
checkAll(Exhaustive.enum<DayOfWeek>()) { day -> /* tests all 7 days */ }
```

They can be mixed freely in the same test.
