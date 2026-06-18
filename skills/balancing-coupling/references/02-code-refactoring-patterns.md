# Code Refactoring Patterns

## Table of Contents

- [Depend on narrow contracts](#depend-on-narrow-contracts)
- [Use structural typing deliberately](#use-structural-typing-deliberately)
- [Split broad interfaces by consumer role](#split-broad-interfaces-by-consumer-role)
- [Replace positional and implicit conventions](#replace-positional-and-implicit-conventions)
- [Move behavior to the data owner](#move-behavior-to-the-data-owner)
- [Use events only when they earn their cost](#use-events-only-when-they-earn-their-cost)
- [Quarantine foreign models](#quarantine-foreign-models)
- [Smell catalog](#smell-catalog)

Use these patterns when a codebase has strong coupling across files, modules, layers, or volatile dependencies. TypeScript/JavaScript is the default context, but the judgment applies generally.

## Depend on narrow contracts

When business logic imports volatile vendor, framework, network, persistence, or filesystem code directly, define the minimal shape the business logic actually needs and inject an implementation from the outside.

```typescript
interface Mailer {
  send(message: { to: string; subject: string; body: string }): Promise<void>;
}

class OrderService {
  constructor(private readonly mailer: Mailer) {}

  async confirm(order: Order) {
    await this.mailer.send({
      to: order.email,
      subject: "Order confirmed",
      body: "Thanks!",
    });
  }
}
```

Default to constructor injection and assemble concrete dependencies in one composition root such as `main.ts` or `composition-root.ts`.

## Use structural typing deliberately

Let consumers define the smallest shape they need locally:

```typescript
interface HasId { id: string }
function audit(entity: HasId) { log(entity.id); }
```

This avoids importing broad shared types. If two values have the same shape but different meaning, use branded types to prevent false compatibility:

```typescript
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };
```

## Split broad interfaces by consumer role

A consumer should not depend on methods it does not use.

```typescript
interface UserReader { findById(id: string): Promise<User>; }
interface UserWriter { save(user: User): Promise<void>; delete(id: string): Promise<void>; }
```

This reduces degree: each caller depends on fewer operations and fewer reasons to change.

## Replace positional and implicit conventions

- Long positional arguments → named options object.
- Magic numbers/strings → named constants, literal unions, or enums.
- Duplicated algorithms → one owner, shared library, or contract test.
- Required call order → a single method that enforces ordering, or types that represent allowed states.

```typescript
// Before: connascence of position
createUser("Ada", "ada@example.com", false, true);

// After: connascence of name
createUser({ name: "Ada", email: "ada@example.com", isAdmin: false, isActive: true });
```

## Move behavior to the data owner

Train-wreck access couples callers to an object graph:

```typescript
// Before
const code = order.customer.address.country.dialingCode;

// After
const code = order.dialingCode();
```

Do not wrap immutable data reflexively. Deep reads of immutable value objects are lower risk than mutation of exposed internals.

## Use events only when they earn their cost

In-process or distributed events reduce direct references from publishers to consumers, but they introduce dynamic coupling and reduce static traceability.

Use events when:

- many independent reactions follow one fact;
- consumers should be added without editing the publisher;
- asynchronous processing improves resilience or latency;
- cross-module coordination should not block the initiating operation.

Prefer a direct call when there is one obvious callee and tracing clarity matters more than extension.

## Quarantine foreign models

When integrating with a messy legacy system or third-party API, keep foreign names and shapes at the edge. Translate into local concepts before business logic sees them.

```typescript
class CrmCustomerGateway implements CustomerDirectory {
  constructor(private readonly crm: LegacyCrmClient) {}

  async findCustomer(id: string): Promise<Customer> {
    const raw = await this.crm.GetCustRec(id);
    return { id: raw.CUST_ID, name: raw.FULL_NM, tier: mapTier(raw.LVL) };
  }
}
```

Use this when the foreign model is volatile, hostile, or likely to contaminate local naming and rules.

## Smell catalog

| Smell | Coupling created | Typical refactoring |
|---|---|---|
| God class/module | Many callers depend on one concrete hub | Split by responsibility; extract role-specific contracts |
| Circular imports | Initialization order and hidden dependency cycles | Pull shared contracts up; use type-only imports; remove internal barrel imports |
| Train wreck | Caller depends on internal object graph | Move behavior to the owning object/module |
| Magic numbers/strings | Connascence of meaning | Named constants or explicit types |
| Long positional args | Connascence of position | Options object |
| Fat interface | Callers depend on unused methods | Split by role |
| Direct vendor import in business logic | Volatile implementation detail crosses boundary | Narrow contract plus injected implementation |
| `new` inside constructors for dependencies | Hard-wired dependency graph | Inject dependencies from composition root |
| Speculative abstraction | Local complexity | Inline until volatility or a second implementation appears |
