# Structural Techniques

## 1. Sum Types / Discriminated Unions

Sum types represent mutually exclusive states. A value can be **exactly one** of the defined variants.

### The Classic Contact Example (F#)

**Problem**: "A contact must have an email or postal address."

```fsharp
// BAD: Allows invalid state (both None)
type Contact = {
    Email: EmailAddress option
    PostalAddress: PostalAddress option
}

// GOOD: Only valid states are representable
type ContactInfo =
    | EmailOnly of EmailContactInfo
    | PostOnly of PostalContactInfo
    | EmailAndPost of EmailContactInfo * PostalContactInfo

// Compiler ensures all cases handled
let describe = function
    | EmailOnly email -> sprintf "Email: %s" email
    | PostOnly postal -> sprintf "Address: %s" postal
    | EmailAndPost (email, postal) -> sprintf "Both: %s, %s" email postal
```

The union type explicitly represents the three valid states while making the invalid state (no contact info) **impossible to construct**.

### TypeScript Tagged Unions

```typescript
type PaymentMethod =
  | { type: 'creditCard'; cardNumber: string; expiry: string }
  | { type: 'paypal'; email: string }
  | { type: 'bankTransfer'; iban: string };

function processPayment(payment: PaymentMethod) {
  switch (payment.type) {
    case 'creditCard':
      // TypeScript knows cardNumber and expiry exist
      break;
    case 'paypal':
      // TypeScript knows email exists
      break;
    case 'bankTransfer':
      // TypeScript knows iban exists
      break;
    // Exhaustiveness checked by compiler
  }
}
```

### Rust Enums

```rust
enum HttpResult<T> {
    Success(T),
    ClientError { code: u16, message: String },
    ServerError { code: u16, retry_after: Option<Duration> },
}

// Compiler forces handling both cases
match result {
    Ok(value) => process(value),
    Err(e) => handle_error(e),
}
```

## 2. Newtype Pattern with Smart Constructors

Wrap primitive types to add domain-specific constraints while preventing direct construction.

### Rust Implementation

```rust
mod user {
    pub struct Username(String);  // Tuple struct with private field

    impl Username {
        pub fn new(username: String) -> Result<Self, &'static str> {
            if username.is_empty() {
                return Err("Username cannot be empty");
            }
            if username.len() > 50 {
                return Err("Username too long");
            }
            if !username.chars().all(|c| c.is_alphanumeric() || c == '_') {
                return Err("Username contains invalid characters");
            }
            Ok(Self(username))
        }

        pub fn as_str(&self) -> &str {
            &self.0
        }
    }
}
```

The private field ensures the **only way** to create a `Username` is through the validated `new` function.

### Haskell Smart Constructor

```haskell
module Email (Email, mkEmail, emailToText) where

newtype Email = Email Text  -- Constructor not exported

mkEmail :: Text -> Maybe Email
mkEmail t
  | isValidEmail t = Just (Email t)
  | otherwise = Nothing

emailToText :: Email -> Text
emailToText (Email t) = t
```

### Haskell Newtype for Type Discrimination

```haskell
newtype UserId = UserId Int
newtype ProductId = ProductId Int

-- Compiler prevents: getUser (ProductId 123)
getUser :: UserId -> IO User
```

## 3. Typestate Pattern

Encode state machine states into the type system, making invalid transitions impossible.

**Core concepts:**
1. Each state is a **unique type**
2. State transitions are methods available **only** for the corresponding state type
3. Transitions **consume** the old state and return the new state type
4. Old states become invalid after transition

### Rust: Blog Post Workflow

```rust
use std::marker::PhantomData;

// State markers (zero-sized types)
struct Draft;
struct PendingReview;
struct Published;

struct BlogPost<State> {
    content: String,
    _state: PhantomData<State>,
}

impl BlogPost<Draft> {
    fn new(content: String) -> Self {
        BlogPost { content, _state: PhantomData }
    }

    fn submit_for_review(self) -> BlogPost<PendingReview> {
        BlogPost { content: self.content, _state: PhantomData }
    }
}

impl BlogPost<PendingReview> {
    fn approve(self) -> BlogPost<Published> {
        BlogPost { content: self.content, _state: PhantomData }
    }

    fn reject(self) -> BlogPost<Draft> {
        BlogPost { content: self.content, _state: PhantomData }
    }
}

impl BlogPost<Published> {
    fn view(&self) -> &str {
        &self.content
    }
}

// Usage:
let post = BlogPost::new("Hello".to_string());
// post.view();  // ERROR: view() doesn't exist on Draft
let post = post.submit_for_review();
let post = post.approve();
post.view();  // OK: view() exists on Published
```

### Rust: Payment Processing

```rust
struct Pending;
struct Authorized;
struct Captured;
struct Refunded;

struct Payment<State> {
    id: PaymentId,
    amount: Money,
    _state: PhantomData<State>,
}

impl Payment<Pending> {
    fn authorize(self) -> Result<Payment<Authorized>, Error> { /* ... */ }
}

impl Payment<Authorized> {
    fn capture(self) -> Result<Payment<Captured>, Error> { /* ... */ }
    fn void(self) -> Result<Payment<Pending>, Error> { /* ... */ }
}

impl Payment<Captured> {
    fn refund(self) -> Result<Payment<Refunded>, Error> { /* ... */ }
}

// Compiler prevents: pending_payment.refund()
```

### Use Cases

- **Network connections**: Prevent writing to closed connections
- **File handles**: Ensure files are opened before reading
- **Authentication flows**: Require login before accessing protected resources
- **Payment processing**: Enforce state progression (cart → checkout → payment → confirmation)

## 4. NonEmpty Collections

Guarantee collections have at least one element, eliminating partial functions.

### The Problem

```haskell
-- Partial function (can crash)
head :: [a] -> a
```

```typescript
function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  // Division by zero if numbers is empty!
}
```

### The Solution

```typescript
interface NonEmptyArray<T> {
  readonly head: T;
  readonly tail: readonly T[];
}

function average(numbers: NonEmptyArray<number>): number {
  const all = [numbers.head, ...numbers.tail];
  return all.reduce((a, b) => a + b, 0) / all.length;
  // Safe: always at least one element
}

function fromArray<T>(arr: T[]): NonEmptyArray<T> | null {
  if (arr.length === 0) return null;
  const [head, ...tail] = arr;
  return { head, tail };
}
```

```haskell
-- Total function (always safe)
head :: NonEmpty a -> a
```
