# Anti-Patterns to Avoid

## 1. Primitive Obsession

Using raw primitives instead of domain types.

```typescript
// BAD: Easy to confuse parameters
function createOrder(customerId: number, productId: number, quantity: number)

// GOOD: Types prevent confusion
function createOrder(customerId: CustomerId, productId: ProductId, quantity: Quantity)
```

## 2. Stringly-Typed Code

Over-reliance on strings to represent structured data.

```typescript
// BAD
type Status = string;  // "pending" | "active" | "cancelled" | ...anything

// GOOD
type Status = "pending" | "active" | "cancelled";
```

## 3. Boolean Blindness

Using booleans that lose context about what was checked.

```typescript
// BAD
function processUser(user: User, isAdmin: boolean) {
  if (isAdmin) {
    // How do we know isAdmin was actually checked?
  }
}

// GOOD
type AdminUser = User & { __adminVerified: true };
function processAdmin(admin: AdminUser) {
  // Type guarantees admin status was verified
}
```

## 4. Optional Property Proliferation

Using many optional properties instead of unions.

```typescript
// BAD: Many invalid combinations possible
interface Payment {
  type: "card" | "paypal" | "bank";
  cardNumber?: string;
  cardExpiry?: string;
  paypalEmail?: string;
  bankIban?: string;
}

// GOOD: Only valid combinations representable
type Payment =
  | { type: "card"; cardNumber: string; cardExpiry: string }
  | { type: "paypal"; email: string }
  | { type: "bank"; iban: string };
```

## 5. Shotgun Parsing

Scattering validation throughout the codebase instead of parsing once at boundaries.

```typescript
// BAD: Validation repeated everywhere
function sendEmail(email: string) {
  if (!isValid(email)) throw new Error();
  // ...
}
function saveEmail(email: string) {
  if (!isValid(email)) throw new Error();
  // ...
}

// GOOD: Validate once, trust the type
function sendEmail(email: Email) { /* trust email is valid */ }
function saveEmail(email: Email) { /* trust email is valid */ }
```

---

# Real-World Examples

## User Registration Flow

**Problem:** Multi-step process with complex state.

```typescript
// BAD: Boolean soup
type User = {
  email: string;
  isEmailVerified: boolean;
  hasPassword: boolean;
  isActive: boolean;
};

// GOOD: Explicit states
type User =
  | { state: 'pending'; email: string; verificationToken: string }
  | { state: 'verified'; email: string; passwordHash: string }
  | { state: 'active'; email: string; passwordHash: string; sessionToken: string }
  | { state: 'suspended'; email: string; reason: string };

// Only active users can perform actions
function performAction(user: User & { state: 'active' }) {
  // TypeScript ensures user is active
}
```

## Configuration Validation

**Problem:** Configuration has interdependent fields.

```haskell
-- BAD: Runtime validation
data Config = Config
  { useCache :: Bool
  , cacheSize :: Maybe Int  -- Should be Just when useCache is True
  }

-- GOOD: Invalid states unrepresentable
data CacheConfig = CacheConfig { cacheSize :: Int }
data Config = Config
  { caching :: Maybe CacheConfig
  }
```

## Security and Authorization

**Capabilities encoded in types:**

```rust
struct Authenticated;
struct Unauthenticated;

struct User<Auth> {
    id: UserId,
    _auth: PhantomData<Auth>,
}

// Only authenticated users can access sensitive data
fn get_sensitive_data(user: User<Authenticated>) -> Data {
    // ...
}
```
