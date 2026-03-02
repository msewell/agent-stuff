# Quick Reference

## Test functions

```kotlin
checkAll<A, B> { a, b -> /* assertions */ }              // assertion-based
forAll<A, B> { a, b -> /* Boolean */ }                    // boolean-based
checkAll(arbA, arbB) { a, b -> /* assertions */ }         // explicit generators
checkAll(PropTestConfig(iterations = 5000)) { a: A -> }   // custom config
```

## Generator operations

```kotlin
arb.filter { predicate }       // subset
arb.map { transform }          // transform type
arb.flatMap { dependentArb }   // dependent generation
arb.merge(otherArb)            // combine 50/50
arb.orNull()                   // nullable variant
arb.next()                     // single value
Arb.bind(arbA, arbB) { a, b -> result }  // combine N arbs
```

## Custom generators

```kotlin
val myArb = arbitrary {
    MyType(
        field1 = Arb.string().bind(),
        field2 = Arb.int().bind()
    )
}

val myExhaustive = listOf("a", "b", "c").exhaustive()
```

## Configuration

```kotlin
PropTestConfig(
    iterations = 1000,
    seed = 42L,
    shrinkingMode = ShrinkingMode.Bounded(1000),
    maxFailure = 0,
    maxDiscardPercentage = 10
)
```

## Assumptions

```kotlin
assume(condition)                          // skip if false
assume { a shouldNotBe b }                 // skip if assertion fails
withAssumptions({ assertions }) { body }   // block style
```

## Sources

- [Kotest Property-Based Testing Documentation](https://kotest.io/docs/proptest/property-based-testing.html)
- [Choosing Properties for PBT — Scott Wlaschin](https://fsharpforfunandprofit.com/posts/property-based-testing-2/)
- [Property-Based Testing Patterns — Sanjiv Sahayam](https://blog.ssanj.net/posts/2016-06-26-property-based-testing-patterns.html)
- [In Praise of Property-Based Testing — Increment](https://increment.com/testing/in-praise-of-property-based-testing/)
- [Example-Based and Property-Based Tests Are Best Friends — Andrea Leopardi](https://andrealeopardi.com/posts/example-based-tests-and-property-based-tests-are-best-friends/)
- [Property-Based Testing in Kotlin — Johannes Link](https://johanneslink.net/property-based-testing-in-kotlin/)
- [Property-Based Testing in Practice — ICSE 2024](https://dl.acm.org/doi/10.1145/3597503.3639581)
- [Integrated Shrinking — Hypothesis](https://hypothesis.works/articles/integrated-shrinking/)
