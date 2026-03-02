# Generator Design

- [Built-in generators](#built-in-generators)
- [Edge cases](#edge-cases)
- [Generator operations](#generator-operations)
- [Custom generators with `arbitrary`](#custom-generators-with-arbitrary)
- [Exhaustive generators](#exhaustive-generators)
- [Composing domain generators](#composing-domain-generators)
- [Key principle: constrain generators, don't filter](#key-principle-constrain-generators-dont-filter)

## Built-in generators

Kotest ships with 80+ generators. Key categories:

| Category | Examples |
|----------|----------|
| Numbers | `Arb.int()`, `Arb.long()`, `Arb.double()`, `Arb.positiveInt()`, `Arb.numericDouble()` |
| Strings | `Arb.string()`, `Arb.stringPattern("[a-z]+")`, `Arb.email()`, `Arb.uuid()` |
| Collections | `Arb.list()`, `Arb.set()`, `Arb.map()` |
| Dates | `Arb.localDate()`, `Arb.localDateTime()`, `Arb.instant()` (kotlinx) |
| Enums | `Arb.enum<T>()`, `Exhaustive.enum<T>()` |
| Combinatorics | `Arb.choice()`, `Arb.choose()`, `Arb.shuffle()`, `Arb.subsequence()` |
| Nullability | `arb.orNull()`, `arb.orNull(probability)` |
| Constants | `Arb.constant(value)`, `Arb.element(collection)` |

## Edge cases

Built-in Arbs automatically include boundary values:

- **Integers:** 0, 1, -1, `Int.MAX_VALUE`, `Int.MIN_VALUE`
- **Doubles:** 0.0, 1.0, -1.0, `Double.POSITIVE_INFINITY`, `Double.NEGATIVE_INFINITY`, `NaN`
- **Strings:** `""`, single character, lowest codepoint
- **Collections:** empty list, single element, duplicates

By default, ~2% of iterations use edge cases.

## Generator operations

```kotlin
// filter: subset of values
val evens = Arb.int().filter { it % 2 == 0 }

// map: transform type
val lengths: Arb<Int> = Arb.string().map { it.length }

// flatMap: dependent generators
val prefixed = Arb.element("user", "admin").flatMap { role ->
    Arb.int(1..1000).map { id -> "$role-$id" }
}

// merge: combine with equal probability
val mixed = Arb.positiveInt().merge(Arb.negativeInt())

// next: get a single value (useful in test setup)
val sample = Arb.string().next()
```

## Custom generators with `arbitrary`

```kotlin
data class Coordinate(val lat: Double, val lng: Double)

val arbCoordinate = arbitrary {
    Coordinate(
        lat = Arb.double(-90.0..90.0).bind(),
        lng = Arb.double(-180.0..180.0).bind()
    )
}
```

The `arbitrary` builder provides `ArbitraryBuilderSyntax` — use `.bind()` to compose existing Arbs. Always use the provided `RandomSource` (or `.bind()`) rather than `kotlin.random.Random` to maintain seed-based reproducibility.

## Exhaustive generators

For small, finite domains:

```kotlin
val singleDigitPrimes = listOf(2, 3, 5, 7).exhaustive()
val booleans = Exhaustive.boolean()
val suits = Exhaustive.enum<Suit>()
```

## Composing domain generators

```kotlin
data class Money(val amount: BigDecimal, val currency: Currency)
data class Order(val id: String, val items: List<LineItem>, val total: Money)
data class LineItem(val sku: String, val quantity: Int, val price: Money)

val arbCurrency = Arb.element(Currency.getInstance("USD"), Currency.getInstance("EUR"))

val arbMoney = arbitrary {
    Money(
        amount = Arb.bigDecimal(BigDecimal.ZERO, BigDecimal("99999.99")).bind(),
        currency = arbCurrency.bind()
    )
}

val arbLineItem = arbitrary {
    val price = arbMoney.bind()
    LineItem(
        sku = Arb.stringPattern("[A-Z]{3}-[0-9]{4}").bind(),
        quantity = Arb.int(1..50).bind(),
        price = price
    )
}
```

## Key principle: constrain generators, don't filter

```kotlin
// BAD: ~50% of generated values are discarded
val positives = Arb.int().filter { it > 0 }

// GOOD: generates only valid values
val positives = Arb.positiveInt()

// BAD: most random strings won't match
val emails = Arb.string().filter { it.matches(emailRegex) }

// GOOD: generates structurally valid emails
val emails = Arb.email()
```
