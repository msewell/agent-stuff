# Functional Programming in Kotlin: Type System
> Sections 5–7 of *Functional Programming in Kotlin: Modern Best Practices*
> Kotlin 2.0–2.2+ · No third-party libraries unless noted

---

## 5. Algebraic Data Types with Sealed Types

Sealed classes and sealed interfaces are Kotlin's mechanism for **algebraic data types (ADTs)** — types that have a fixed, known set of subtypes. The compiler guarantees that a `when` expression over a sealed type is exhaustive, which means you handle every case or the code does not compile.

### Sealed interface vs. sealed class

```kotlin
// Sealed interface — preferred when subtypes don't share state
sealed interface Shape {
    data class Circle(val radius: Double) : Shape
    data class Rectangle(val width: Double, val height: Double) : Shape
    data object Empty : Shape
}

// Sealed class — use when subtypes share common state
sealed class NetworkResult<out T>(val timestamp: Long = System.currentTimeMillis()) {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Failure(val error: String, val code: Int) : NetworkResult<Nothing>()
}
```

**Prefer `sealed interface`** unless your subtypes genuinely need to inherit common state. Sealed interfaces allow subtypes to extend other classes and are more flexible.

### Exhaustive `when`

```kotlin
fun area(shape: Shape): Double = when (shape) {
    is Shape.Circle -> Math.PI * shape.radius * shape.radius
    is Shape.Rectangle -> shape.width * shape.height
    Shape.Empty -> 0.0
    // No 'else' needed — compiler verifies all cases are covered
}
```

If you later add `Shape.Triangle`, every `when` expression over `Shape` will fail to compile until updated. This is a **compile-time safety net** that is lost if you add a catch-all `else` branch.

**Best practice:** Never add an `else` branch to a `when` over a sealed type. The whole point is to let the compiler enforce exhaustiveness.

### Nested sealed hierarchies

You can nest sealed types to model complex domains:

```kotlin
sealed interface PaymentResult {
    data class Completed(val transactionId: String) : PaymentResult

    sealed interface Failed : PaymentResult {
        data class InsufficientFunds(val deficit: BigDecimal) : Failed
        data class NetworkError(val cause: Throwable) : Failed
        data object Timeout : Failed
    }
}
```

This lets callers choose their level of granularity: match on `PaymentResult.Failed` to handle all failures uniformly, or match on specific failure subtypes when needed.

---

## 6. Value Classes for Type Safety at Zero Cost

Value classes (introduced via `@JvmInline`) wrap a single value with a distinct type but are erased to the underlying type at runtime, avoiding object allocation overhead. This is the **newtype pattern** — giving semantic meaning to primitive types at zero cost.

### Basic usage

```kotlin
@JvmInline
value class UserId(val value: Long)

@JvmInline
value class Email(val value: String) {
    init {
        require(value.contains("@")) { "Invalid email: $value" }
    }
}

@JvmInline
value class Meters(val value: Double) {
    operator fun plus(other: Meters): Meters = Meters(value + other.value)
    operator fun times(scalar: Double): Meters = Meters(value * scalar)
}
```

### Why this matters for functional programming

Without value classes, functions that accept multiple `Long` or `String` parameters are easy to call with arguments in the wrong order:

```kotlin
// ❌ Easy to swap userId and orderId — both are Long
fun cancelOrder(userId: Long, orderId: Long) { ... }

// ✅ Compiler prevents mixing up UserId and OrderId
fun cancelOrder(userId: UserId, orderId: OrderId) { ... }
```

### Best practices

- **Validate in the `init` block** to ensure invalid values can never be constructed (see the `Email` example above). This makes the type a "parse, don't validate" boundary.
- **Add domain operations** directly on the value class where they make sense (arithmetic, formatting).
- **Use value classes at API boundaries** — function parameters, return types, data class properties — to maximize type safety.
- **Limitations to be aware of:** value classes cannot extend other classes (they can implement interfaces), and boxing occurs when used as generic type arguments or nullable types.

---

## 7. Functional Error Handling

Kotlin provides multiple built-in mechanisms for handling errors functionally — without resorting to `try-catch` scattered throughout business logic.

### Nullable types as lightweight error handling

The simplest functional error pattern in Kotlin: return `null` to indicate absence or failure.

```kotlin
fun findUser(id: UserId): User? =
    database.queryOrNull("SELECT * FROM users WHERE id = ?", id.value)

// Caller uses safe-call and Elvis
val userName = findUser(id)?.name ?: "Unknown"
```

**When to use:** When the only information the caller needs is "it worked" or "it didn't" — no error details required.

### `Result` type and `runCatching`

Kotlin's built-in `Result<T>` wraps either a success value or a `Throwable`:

```kotlin
fun parseConfig(raw: String): Result<Config> = runCatching {
    val json = Json.decodeFromString<ConfigDto>(raw)
    json.toDomain()  // may throw
}

// Caller
parseConfig(text)
    .map { it.databaseUrl }
    .getOrElse { error ->
        logger.warn("Config parse failed: ${error.message}")
        Config.default().databaseUrl
    }
```

**Key `Result` methods:**
- `map` / `mapCatching` — transform the success value
- `recover` / `recoverCatching` — transform a failure into a success
- `getOrNull()` / `getOrDefault()` / `getOrElse { }` — extract the value
- `onSuccess { }` / `onFailure { }` — side-effect callbacks
- `fold(onSuccess, onFailure)` — handle both cases exhaustively

**Limitation:** `Result` always wraps a `Throwable`. It cannot represent domain-specific error types with rich data. For that, use sealed types.

### Sealed types for domain-specific errors

When you need to model multiple, distinct error cases with associated data:

```kotlin
sealed interface ValidationError {
    data class TooShort(val minLength: Int, val actual: Int) : ValidationError
    data class InvalidCharacters(val chars: Set<Char>) : ValidationError
    data class AlreadyTaken(val value: String) : ValidationError
}

fun validateUsername(input: String): Either<ValidationError, Username> {
    // ... validation logic
}
```

Here `Either` is a simple sealed type you can define yourself in ~15 lines — no library needed:

```kotlin
sealed interface Either<out L, out R> {
    data class Left<L>(val value: L) : Either<L, Nothing>
    data class Right<R>(val value: R) : Either<Nothing, R>
}

fun <L, R, T> Either<L, R>.map(f: (R) -> T): Either<L, T> = when (this) {
    is Either.Left -> this
    is Either.Right -> Either.Right(f(value))
}

fun <L, R, T> Either<L, R>.flatMap(f: (R) -> Either<L, T>): Either<L, T> = when (this) {
    is Either.Left -> this
    is Either.Right -> f(value)
}

fun <L, R, T> Either<L, R>.fold(onLeft: (L) -> T, onRight: (R) -> T): T = when (this) {
    is Either.Left -> onLeft(value)
    is Either.Right -> onRight(value)
}
```

### Comparison of error handling approaches

| Approach | Error info | Composability | Compile-time safety | Best for |
|---|---|---|---|---|
| Nullable (`T?`) | None | `?.` chains | Null-safe operators | Simple absence |
| `Result<T>` | `Throwable` | `map`/`recover` | Must call `getOrX` | Wrapping throwing APIs |
| Sealed hierarchy | Rich, typed | `when` + `map` | Exhaustive `when` | Domain error modeling |
| Exceptions | Stack trace | Poor (breaks flow) | None | Truly exceptional cases |

**Best practice:** Use exceptions only for programming errors and truly unexpected failures (out of memory, assertion failures). For expected domain failures (validation, not found, business rule violations), use typed returns.
