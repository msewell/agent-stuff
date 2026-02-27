## 5. Logic Patterns

These patterns apply to pure business logic — code with no infrastructure dependencies.

### 5.1 Easily-Visible Behavior

**Intent**: Make logic behavior visible through return values and observable state.

**Problem**: When logic results are buried in side effects, private state, or callbacks, tests become complex and fragile.

**Solution**: Prefer designs where behavior is visible through:

1. **Return values** (best): Pure functions where output depends only on input.
2. **Observable state**: Objects with getters or state-query methods.
3. **Events**: Observable event emissions for asynchronous behavior.

```typescript
// Good: return value makes behavior visible
function calculateDiscount(order: Order): Money {
  if (order.total.isGreaterThan(Money.of(100))) {
    return order.total.multiply(0.1);
  }
  return Money.zero();
}

// Good: observable state
class ShoppingCart {
  private items: CartItem[] = [];

  add(item: CartItem): void {
    this.items.push(item);
  }

  get total(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.price),
      Money.zero()
    );
  }
}
```

**Avoid**: Code that depends on state deeper than one level in the dependency chain. If `A` needs to observe the state of `C` through `B`, consider refactoring so that `A` can observe the result directly.

### 5.2 Testable Libraries

**Intent**: Wrap third-party libraries in your own interfaces.

**Problem**: Third-party libraries have APIs designed for general use, not your application's specific needs. Their APIs change between versions. Tests that use library types directly become coupled to the library.

**Solution**: Create thin wrappers that expose only the operations your application needs, in terms your domain understands.

```typescript
// Wrapper around a date library
class Clock {
  now(): Timestamp {
    return Timestamp.fromDate(luxon.DateTime.now());
  }

  static createNull(options?: { now?: Timestamp }): Clock {
    // Returns a Clock that doesn't read the system clock
    return new NullClock(options?.now ?? Timestamp.of("2024-01-01T00:00:00Z"));
  }
}
```

This isolates the impact of upgrading or replacing the library. Only the wrapper changes — all application code and tests remain stable.

### 5.3 Collaborator-Based Isolation

**Intent**: Express test expectations in terms of collaborator behavior, not hardcoded values.

**Problem**: When tests hardcode expected values, they become fragile and obscure. If the collaborator's output format changes, tests break in confusing ways.

**Solution**: Use the collaborator's API in test assertions, making the relationship explicit:

```typescript
// Fragile: hardcoded value couples test to Rot13 internals
it("renders report with encoded name", () => {
  const report = createReport({ name: "Alice" });
  assert.equal(report.header, "Encoded: Nyvpr");
});

// Better: uses collaborator to express expected value
it("renders report with encoded name", () => {
  const name = "Alice";
  const report = createReport({ name });
  assert.equal(report.header, `Encoded: ${rot13.transform(name)}`);
});
```

The second test makes the *relationship* clear: the report header contains the ROT-13 encoding of the name. If `rot13.transform` changes, the test still passes (because it uses the real function), and the assertion still reads correctly.

---

## 6. Infrastructure Patterns

These patterns address code that talks to external systems — databases, HTTP services, file systems, environment variables.

### 6.1 Infrastructure Wrappers

**Intent**: Isolate every external system behind a single wrapper class.

**Problem**: When infrastructure concerns are spread throughout the codebase, testing requires mocking at many points, changes to an external API ripple across files, and the application is tightly coupled to specific technologies.

**Solution**: For each external system, create one wrapper class solely responsible for interfacing with that system. Design the wrapper to present a clean, application-friendly interface — translating between the external system's messy reality and your domain's clean abstractions.

```typescript
class OrderDatabase {
  private pool: ConnectionPool;

  private constructor(pool: ConnectionPool) {
    this.pool = pool;
  }

  static create(connectionString: string): OrderDatabase {
    return new OrderDatabase(new ConnectionPool(connectionString));
  }

  async save(order: Order): Promise<void> {
    await this.pool.query(
      "INSERT INTO orders (id, customer_id, total) VALUES ($1, $2, $3)",
      [order.id, order.customerId, order.total.toCents()]
    );
  }

  async fetchById(id: OrderId): Promise<Order | null> {
    const row = await this.pool.queryOne(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    );
    return row ? Order.fromRow(row) : null;
  }
}
```

**Guidelines**:
- One wrapper per external system (not one per endpoint or table).
- The wrapper translates between external formats and domain types.
- Keep a simple one-way dependency chain: high-level wrappers depend on low-level wrappers (never the reverse).
- Avoid complex webs of wrapper-to-wrapper dependencies.

### 6.2 Narrow Integration Tests

**Intent**: Test that infrastructure wrappers communicate correctly with real external systems.

**Problem**: Without integration tests, you can't be sure your SQL is correct, your HTTP requests are well-formed, or your file paths work on the target OS. Mocking these interactions gives false confidence.

**Solution**: Write narrow integration tests that exercise real external communication against real (but test-isolated) services. Use local instances where possible.

```typescript
describe("OrderDatabase (integration)", () => {
  let db: OrderDatabase;

  beforeAll(async () => {
    db = OrderDatabase.create(TEST_DATABASE_URL);
    await db.migrate();
  });

  afterEach(async () => {
    await db.truncate("orders");
  });

  it("saves and retrieves an order", async () => {
    const order = Order.createTestInstance({ id: OrderId.of("ord-1") });

    await db.save(order);
    const retrieved = await db.fetchById(order.id);

    assert.deepEqual(retrieved, order);
  });

  it("returns null for non-existent order", async () => {
    const retrieved = await db.fetchById(OrderId.of("nonexistent"));
    assert.equal(retrieved, null);
  });
});
```

**Key points**:
- Use real databases, real file systems, real HTTP services — but local and test-isolated.
- These tests are slow by design. Run them less frequently (e.g., only in CI or on explicit request).
- They validate the *correctness of the wire protocol*, not the business logic.
- For multi-level external systems, low-level wrappers get integration tests; high-level wrappers use [Fake It Once You Make It](#76-fake-it-once-you-make-it).

### 6.3 Paranoic Telemetry

**Intent**: Ensure every external failure is detected and reported at runtime.

**Problem**: External systems fail in unpredictable ways — API changes, timeouts, corrupted responses. If your code silently swallows these failures, bugs become invisible.

**Solution**: For every external interaction, test that:
1. Success cases produce correct results.
2. Every known failure case either logs an alert or throws a catchable exception.
3. Timeout and hanging scenarios are handled.

```typescript
describe("PaymentGateway", () => {
  it("logs alert on unexpected response format", async () => {
    const gateway = PaymentGateway.createNull({
      response: { status: 200, body: "not json" },
    });
    const alerts = gateway.trackAlerts();

    await gateway.charge(Money.of(50));

    assert.deepEqual(alerts.data, [
      { level: "error", message: "Unexpected payment response format" },
    ]);
  });

  it("throws on timeout", async () => {
    const gateway = PaymentGateway.createNull({ timeout: true });

    await assert.rejects(
      () => gateway.charge(Money.of(50)),
      PaymentTimeoutError
    );
  });
});
```

Use **Contract Tests** as a supplementary technique: tests that run against the real service to validate that your understanding of its behavior is still correct. Run these periodically (not on every build) to detect API changes.

---

