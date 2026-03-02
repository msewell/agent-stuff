# The Seven Property Patterns

- [Roundtrip](#roundtrip--there-and-back-again)
- [Invariants](#invariants--some-things-never-change)
- [Commutativity](#commutativity--different-paths-same-destination)
- [Idempotence](#idempotence--applying-twice-changes-nothing)
- [Induction](#induction--solve-a-smaller-problem-first)
- [Hard to Prove, Easy to Verify](#hard-to-prove-easy-to-verify)
- [Test Oracle](#test-oracle--compare-against-a-reference)
- [Metamorphic Properties](#beyond-the-seven-metamorphic-properties)

The hardest part of PBT is identifying *what* to test. These seven patterns, originally described by Scott Wlaschin, provide a systematic framework.

## Roundtrip — "There and Back Again"

An operation paired with its inverse returns the original value.

```kotlin
checkAll(Arb.string()) { original ->
    val encoded = Base64.getEncoder().encodeToString(original.toByteArray())
    val decoded = String(Base64.getDecoder().decode(encoded))
    decoded shouldBe original
}
```

**Common roundtrip pairs:** `serialize`/`deserialize`, `compress`/`decompress`, `encrypt`/`decrypt`, `parse`/`format`, `insert`/`lookup`.

**Caveat:** The conversion must be lossless. If `toFloat()` loses precision, `toFloat().toDouble()` won't round-trip.

## Invariants — "Some Things Never Change"

A transformation preserves a measurable property of the input.

```kotlin
checkAll(Arb.list(Arb.int())) { list ->
    list.sorted().size shouldBe list.size        // size preserved
    list.sorted().toSet() shouldBe list.toSet()  // elements preserved
}
```

**Common invariants:** collection size after `map`, element membership after `sort`, tree balance after insert/delete, total sum after redistribution.

## Commutativity — "Different Paths, Same Destination"

Applying operations in different orders yields the same result.

```kotlin
checkAll(Arb.list(Arb.int()), Arb.int()) { list, n ->
    list.map { it + n }.sorted() shouldBe list.sorted().map { it + n }
}
```

This works because adding a constant is a monotonic transformation that preserves sort order.

## Idempotence — "Applying Twice Changes Nothing"

Performing an operation twice produces the same result as once.

```kotlin
checkAll(Arb.list(Arb.int())) { list ->
    list.distinct() shouldBe list.distinct().distinct()
}

checkAll(Arb.string()) { s ->
    s.trim() shouldBe s.trim().trim()
}
```

**High practical value** for distributed systems: HTTP PUT, database upserts, message deduplication, and cache population should all be idempotent.

## Induction — "Solve a Smaller Problem First"

If a property holds for the base case and is preserved by the recursive step, it holds for all inputs.

```kotlin
checkAll(Arb.list(Arb.int(), 1..100)) { list ->
    val head = list.first()
    val tail = list.drop(1)
    list.sum() shouldBe head + tail.sum()
}
```

Especially useful for recursive data structures (trees, nested containers) and recursive algorithms.

## Hard to Prove, Easy to Verify

Computing the answer is complex; checking it is trivial.

```kotlin
checkAll(Arb.int(2..10_000)) { n ->
    val factors = primeFactors(n)
    factors.reduce { acc, f -> acc * f } shouldBe n   // easy to verify
    factors.forEach { it.isPrime() shouldBe true }     // each factor is prime
}
```

**Other examples:** path-finding (verify the path is connected and valid), optimization (verify constraints are satisfied), tokenization (concatenating tokens reproduces the input).

## Test Oracle — "Compare Against a Reference"

Verify your optimized implementation against a simple, obviously-correct one.

```kotlin
checkAll(Arb.list(Arb.int())) { list ->
    fastCustomSort(list) shouldBe list.sorted()  // stdlib is the oracle
}
```

**Powerful for:** performance-optimized code with a slow-but-correct reference, concurrent vs. sequential implementations, new code replacing legacy code.

## Beyond the Seven: Metamorphic Properties

When you can't check the output directly, check *relationships* between outputs under related inputs.

```kotlin
checkAll(Arb.list(Arb.string(), 1..50)) { queries ->
    val strict = search(queries, maxResults = 5)
    val relaxed = search(queries, maxResults = 10)
    strict.size shouldBeLessThanOrEqualTo relaxed.size  // more capacity => more results
}
```

Metamorphic testing is particularly valuable for machine learning models, search engines, and numerical algorithms where the "correct" output is unknown.
