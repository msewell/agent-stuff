# Functional Programming in Kotlin: Architecture, Testing, and Context Parameters
> Sections 17–19 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 17. Architecture: Functional Core, Imperative Shell

The most impactful architectural pattern from functional programming is **Functional Core, Imperative Shell** (also called "Ports and Adapters" or "Hexagonal Architecture" when combined with dependency inversion). The idea is simple: keep your domain logic pure, and push all side effects to the outer edges.

### The pattern

```
┌─────────────────────────────────────────┐
│         Imperative Shell                │
│  (HTTP handlers, DB access, messaging)  │
│                                         │
│    ┌─────────────────────────────┐      │
│    │     Functional Core         │      │
│    │  (domain logic, validation, │      │
│    │   transformations, rules)   │      │
│    │                             │      │
│    │  Pure functions only.       │      │
│    │  No I/O, no mutation.       │      │
│    └─────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

### Example structure

```kotlin
// === Functional Core ===
// Pure — no I/O, no dependencies on frameworks, fully testable

data class Order(val items: List<LineItem>, val coupon: Coupon?)
data class LineItem(val product: ProductId, val quantity: Int, val unitPrice: Money)

fun calculateTotal(order: Order): Money =
    order.items
        .map { it.unitPrice * it.quantity }
        .reduce { a, b -> a + b }

fun applyCoupon(total: Money, coupon: Coupon?): Money = when (coupon) {
    is Coupon.Percentage -> total * (1.0 - coupon.rate)
    is Coupon.FixedAmount -> (total - coupon.amount).coerceAtLeast(Money.ZERO)
    null -> total
}

fun validateOrder(order: Order): Either<OrderError, Order> = when {
    order.items.isEmpty() -> Either.Left(OrderError.EmptyOrder)
    order.items.any { it.quantity <= 0 } -> Either.Left(OrderError.InvalidQuantity)
    else -> Either.Right(order)
}

// === Imperative Shell ===
// Handles I/O, calls into the pure core

class OrderService(
    private val orderRepo: OrderRepository,
    private val couponRepo: CouponRepository,
    private val paymentGateway: PaymentGateway,
) {
    suspend fun placeOrder(request: PlaceOrderRequest): OrderResult {
        val order = request.toDomain()

        return validateOrder(order).fold(
            onLeft = { OrderResult.ValidationFailed(it) },
            onRight = { validOrder ->
                val coupon = couponRepo.findByCode(request.couponCode)
                val total = applyCoupon(calculateTotal(validOrder), coupon)

                when (val payment = paymentGateway.charge(total)) {
                    is PaymentResult.Success -> {
                        orderRepo.save(validOrder)
                        OrderResult.Placed(validOrder, payment.transactionId)
                    }
                    is PaymentResult.Failed -> OrderResult.PaymentFailed(payment.reason)
                }
            }
        )
    }
}
```

### Benefits

| Benefit | How |
|---|---|
| **Testability** | Core functions test with simple assertions — no mocks needed |
| **Readability** | Business rules are explicit, not buried in framework code |
| **Portability** | Core has no framework dependencies — easy to reuse or migrate |
| **Reliability** | Pure functions have no hidden interactions — fewer bugs |

### Best practices

- **Start with the core.** Write your domain logic as pure functions first, then wrap them with I/O.
- **Pass data, not services, into the core.** The core should not depend on interfaces like `UserRepository` — pass the `User` directly.
- **Keep the shell thin.** It should only orchestrate: fetch data, call core functions, persist results.
- **Use dependency injection in the shell** — but the core needs no DI because it has no dependencies.

---

## 18. Testing Functional Kotlin Code

Functional code is inherently easier to test because pure functions are deterministic and have no hidden dependencies. Here is how to leverage that.

### Testing pure functions — no mocks needed

```kotlin
class PricingTest {
    @Test
    fun `calculateTotal sums line items`() {
        val order = Order(
            items = listOf(
                LineItem(ProductId(1), quantity = 2, unitPrice = Money(10.0)),
                LineItem(ProductId(2), quantity = 1, unitPrice = Money(25.0)),
            ),
            coupon = null
        )

        assertEquals(Money(45.0), calculateTotal(order))
    }

    @Test
    fun `applyCoupon applies percentage discount`() {
        val total = Money(100.0)
        val coupon = Coupon.Percentage(rate = 0.20)

        assertEquals(Money(80.0), applyCoupon(total, coupon))
    }
}
```

No mocks, no test doubles, no setup/teardown. This is the payoff of the functional core — tests are simple function calls with assertions.

### Testing sealed type exhaustiveness

When testing functions that return sealed types, verify all branches:

```kotlin
@Test
fun `validateOrder rejects empty orders`() {
    val result = validateOrder(Order(items = emptyList(), coupon = null))
    assertTrue(result is Either.Left)
    assertEquals(OrderError.EmptyOrder, (result as Either.Left).value)
}

@Test
fun `validateOrder accepts valid orders`() {
    val result = validateOrder(validOrder)
    assertTrue(result is Either.Right)
}
```

### Property-based testing with Kotest

Property-based testing is particularly natural for functional code. Instead of writing individual test cases, you define **properties** that should hold for all inputs, and the framework generates hundreds of random inputs:

```kotlin
class SlugPropertyTest : StringSpec({
    "slug contains only lowercase alphanumeric chars and hyphens" {
        forAll(Arb.string(1..100)) { input ->
            val slug = input.toSlug()
            slug.all { it in 'a'..'z' || it in '0'..'9' || it == '-' }
        }
    }

    "slug never starts or ends with a hyphen" {
        forAll(Arb.string(1..100).filter { it.isNotBlank() }) { input ->
            val slug = input.toSlug()
            slug.isEmpty() || (!slug.startsWith("-") && !slug.endsWith("-"))
        }
    }

    "applying discount then tax is the same as the composed operation" {
        forAll(Arb.double(1.0..1000.0), Arb.double(0.0..0.5), Arb.double(0.0..0.3)) { price, discount, tax ->
            val step = Money(price).applyDiscount(discount).applyTax(tax)
            val direct = Money(price * (1 - discount) * (1 + tax))
            abs(step.amount - direct.amount) < 0.01
        }
    }
})
```

### Testing strategies for functional Kotlin

| What to test | Approach | Tools |
|---|---|---|
| Pure domain functions | Direct assertions | JUnit, Kotest assertions |
| Sealed type branches | Exhaustive case testing | `is` checks, `when` |
| Transformation pipelines | Input → output equality | Standard assertions |
| Invariants / properties | Property-based testing | Kotest `forAll`, `Arb` |
| Imperative shell (I/O) | Integration tests + mocks | MockK, Testcontainers |
| Coroutine/Flow code | `runTest`, Turbine | `kotlinx-coroutines-test` |

### Best practices

- **Test the functional core extensively with unit tests** — they are fast, reliable, and cheap.
- **Test the imperative shell sparingly with integration tests** — they are slower but verify real I/O.
- **Use property-based testing** for functions with wide input domains (parsers, validators, math).
- **Avoid testing implementation details.** Test behavior (given this input, expect this output), not how the function internally computes it.

---

## 19. Context Parameters (Kotlin 2.2+)

Context parameters are a new Kotlin feature (preview in Kotlin 2.1, stable in 2.2) that replaces the earlier experimental "context receivers." They allow you to declare that a function requires certain capabilities to be in scope, without passing them explicitly as parameters.

### The problem they solve

Many functional patterns require threading context through call chains — error-handling context, logging, transaction scope. Without context parameters, you either:
1. Pass these explicitly through every function call (tedious, noisy).
2. Use global state or dependency injection (impure, hidden).

### Basic syntax

```kotlin
// Declaration: this function requires a Logger to be in scope
context(logger: Logger)
fun processOrder(order: Order) {
    logger.info("Processing order ${order.id}")
    // ...
}

// Call site: provide the context
with(ConsoleLogger()) {
    processOrder(myOrder)  // Logger is implicitly available
}
```

### Typed error handling without libraries

Context parameters enable a powerful pattern for typed error handling that was previously only available via Arrow's `Raise`:

```kotlin
// Define a "raise" interface for a specific error type
interface Raise<E> {
    fun raise(error: E): Nothing
}

// Functions declare what errors they can raise
context(raise: Raise<ValidationError>)
fun validateAge(age: Int): ValidAge {
    if (age < 0) raise.raise(ValidationError.Negative)
    if (age > 150) raise.raise(ValidationError.Unrealistic)
    return ValidAge(age)
}

context(raise: Raise<ValidationError>)
fun validateName(name: String): ValidName {
    if (name.isBlank()) raise.raise(ValidationError.Blank)
    return ValidName(name.trim())
}

// Compose — errors propagate automatically
context(raise: Raise<ValidationError>)
fun validatePerson(name: String, age: Int): Person =
    Person(validateName(name), validateAge(age))

// Run with error handling
fun <E, A> either(block: context(Raise<E>) () -> A): Either<E, A> =
    try {
        Either.Right(block(object : Raise<E> {
            override fun raise(error: E): Nothing = throw RaiseException(error)
        }))
    } catch (e: RaiseException<*>) {
        @Suppress("UNCHECKED_CAST")
        Either.Left(e.error as E)
    }

// Usage
val result: Either<ValidationError, Person> = either {
    validatePerson("Alice", 30)
}
```

### When to use context parameters

- **Cross-cutting concerns:** logging, tracing, transaction scope, authorization.
- **Typed error propagation:** the `Raise` pattern shown above.
- **Capability-based design:** functions declare what they need, callers provide it.

### Best practices

- **Use sparingly.** Context parameters are powerful but can make code harder to follow if overused. Reserve them for genuinely cross-cutting concerns.
- **Prefer explicit parameters** for domain data. Context parameters are for capabilities and infrastructure, not for business data.
- **Name your context parameters.** The `context(logger: Logger)` syntax with a name is clearer than anonymous context.
- **This is a new feature.** As of early 2026, tooling support (IDE refactoring, debugging) is still maturing. Adopt incrementally.
