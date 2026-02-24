# Type-Level Techniques

## 5. Branded/Opaque Types

Create distinct types from primitives to prevent accidental mixing.

### The Problem

```typescript
function transferFunds(
  fromAccountId: string,
  toAccountId: string,
  amount: number
) { /* ... */ }

// Easy to swap arguments accidentally!
transferFunds(toId, fromId, 100);  // Compiles but wrong
```

### TypeScript Branded Types

```typescript
type Brand<K, T> = K & { __brand: T };

type AccountId = Brand<string, 'AccountId'>;
type TransactionId = Brand<string, 'TransactionId'>;
type USD = Brand<number, 'USD'>;

function createAccountId(id: string): AccountId {
  // Validation here
  return id as AccountId;
}

function transferFunds(from: AccountId, to: AccountId, amount: USD) {
  /* ... */
}

const accountA = createAccountId("acc-123");
const accountB = createAccountId("acc-456");
const txnId: TransactionId = "txn-789" as TransactionId;

transferFunds(accountA, accountB, 100 as USD);  // OK
transferFunds(accountA, txnId, 100 as USD);     // ERROR: TransactionId not assignable
```

The `__brand` property exists only at the type level — no runtime overhead.

## 6. Phantom Types

Add compile-time information without runtime overhead. Similar to branded types but used primarily for encoding state or capability information.

### Rust: Validated Email

```rust
struct Validated;
struct Unvalidated;

struct Email<State> {
    value: String,
    _phantom: PhantomData<State>,
}

impl Email<Unvalidated> {
    fn validate(self) -> Result<Email<Validated>, Error> {
        // validation logic
    }
}

// Only validated emails can be sent
fn send_email(email: Email<Validated>) { /* ... */ }
```

### TypeScript: Currency Safety

```typescript
type USD = { _brand: 'USD' };
type EUR = { _brand: 'EUR' };

type Money<Currency> = {
  amount: number;
  currency: Currency;
};

// Compiler prevents: add(usd, eur)
function add<C>(a: Money<C>, b: Money<C>): Money<C> {
  return { amount: a.amount + b.amount, currency: a.currency };
}
```

## 7. Type-Safe Builder Pattern

Ensure all required fields are set before construction using the type system.

### Scala Phantom Types Builder

```scala
sealed trait HasFirstName
sealed trait HasLastName
sealed trait HasEmail

class PersonBuilder[State](
  firstName: Option[String] = None,
  lastName: Option[String] = None,
  email: Option[String] = None
) {
  def withFirstName(name: String): PersonBuilder[State with HasFirstName] =
    new PersonBuilder(Some(name), lastName, email)

  def withLastName(name: String): PersonBuilder[State with HasLastName] =
    new PersonBuilder(firstName, Some(name), email)

  def withEmail(e: String): PersonBuilder[State with HasEmail] =
    new PersonBuilder(firstName, lastName, Some(e))
}

// Only available when all required fields are set
implicit class BuildOps(
  builder: PersonBuilder[HasFirstName with HasLastName with HasEmail]
) {
  def build(): Person = Person(
    builder.firstName.get,
    builder.lastName.get,
    builder.email.get
  )
}

// Usage:
val person = new PersonBuilder()
  .withFirstName("John")
  .withLastName("Doe")
  .withEmail("john@example.com")
  .build()  // Only compiles if all three are set
```

## 8. Refinement Types and Dependent Types

Advanced techniques for expressing more complex invariants.

```haskell
-- Liquid Haskell example
{-@ type Pos = {v:Int | v > 0} @-}
{-@ divide :: Int -> Pos -> Int @-}
divide :: Int -> Int -> Int
divide n d = n `div` d
```

**Refinement types** add logical predicates to existing types, enabling:
- Range constraints (e.g., integers between 1–100)
- Length constraints (e.g., non-empty lists)
- Relational constraints (e.g., sorted arrays)
