## Architectural Patterns for Reducing Coupling

### 1. Hexagonal Architecture (Ports and Adapters)

**Core Idea**: Isolate business logic from external concerns through well-defined interfaces (ports) and implementations (adapters).

**Structure:**
- **Domain Core**: Business logic, free from infrastructure concerns
- **Ports**: Interfaces defining how the core interacts with the outside world
- **Adapters**: Implementations of ports for specific technologies

**Benefits:**
- Business logic can be tested without infrastructure
- Easy to swap implementations (databases, APIs, etc.)
- Clear separation of concerns

**TypeScript Example:**

```typescript
// Domain Core - no infrastructure dependencies
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

interface PaymentGateway {
  charge(amount: Money, paymentMethod: PaymentMethod): Promise<PaymentResult>;
}

class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentGateway: PaymentGateway
  ) {}

  async placeOrder(order: Order): Promise<void> {
    const result = await this.paymentGateway.charge(
      order.total,
      order.paymentMethod
    );

    if (result.isSuccess) {
      order.markAsPaid();
      await this.orderRepo.save(order);
    }
  }
}

// Adapters - infrastructure implementations
class PostgresOrderRepository implements OrderRepository {
  async save(order: Order): Promise<void> {
    // PostgreSQL-specific implementation
  }

  async findById(id: string): Promise<Order | null> {
    // PostgreSQL-specific implementation
  }
}

class StripePaymentGateway implements PaymentGateway {
  async charge(amount: Money, method: PaymentMethod): Promise<PaymentResult> {
    // Stripe API calls
  }
}
```

**Kotlin Example:**

```kotlin
// Domain Core
interface OrderRepository {
    suspend fun save(order: Order)
    suspend fun findById(id: String): Order?
}

interface PaymentGateway {
    suspend fun charge(amount: Money, paymentMethod: PaymentMethod): PaymentResult
}

class OrderService(
    private val orderRepo: OrderRepository,
    private val paymentGateway: PaymentGateway
) {
    suspend fun placeOrder(order: Order) {
        val result = paymentGateway.charge(order.total, order.paymentMethod)

        if (result.isSuccess) {
            order.markAsPaid()
            orderRepo.save(order)
        }
    }
}

// Adapters
class PostgresOrderRepository : OrderRepository {
    override suspend fun save(order: Order) {
        // PostgreSQL implementation
    }

    override suspend fun findById(id: String): Order? {
        // PostgreSQL implementation
    }
}
```

### 2. Event-Driven Architecture

**Core Idea**: Components communicate through events rather than direct calls, decoupling producers from consumers.

**Benefits:**
- Producers don't know about consumers
- Easy to add new consumers without modifying producers
- Natural support for asynchronous processing
- Temporal decoupling - components don't need to be available simultaneously

**Patterns:**

**Event Notification**: Minimal data in events, consumers fetch details if needed.
```typescript
interface OrderPlacedEvent {
  orderId: string;
  timestamp: Date;
}
```

**Event-Carried State Transfer**: Events contain all necessary data.
```typescript
interface OrderPlacedEvent {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  total: Money;
  timestamp: Date;
}
```

**Event Sourcing**: Store events as the source of truth, derive state from events.

**Trade-offs:**
- ✅ Excellent decoupling
- ✅ Scalability and resilience
- ❌ Eventual consistency challenges
- ❌ Debugging complexity (distributed tracing needed)
- ❌ Event schema evolution requires careful versioning

### 3. CQRS (Command Query Responsibility Segregation)

**Core Idea**: Separate read and write models to optimize each independently.

**Benefits:**
- Read and write sides can scale independently
- Different data models for different use cases
- Simplified domain models (no read concerns in write model)

**TypeScript Example:**

```typescript
// Write Model (Commands)
interface PlaceOrderCommand {
  customerId: string;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
}

class OrderCommandHandler {
  async handle(command: PlaceOrderCommand): Promise<void> {
    const order = Order.create(command);
    await this.orderRepo.save(order);
    await this.eventBus.publish(new OrderPlacedEvent(order));
  }
}

// Read Model (Queries)
interface OrderSummaryQuery {
  customerId: string;
  startDate: Date;
  endDate: Date;
}

class OrderQueryHandler {
  async handle(query: OrderSummaryQuery): Promise<OrderSummary[]> {
    // Query optimized read database (could be different from write DB)
    return this.readDb.query(
      'SELECT * FROM order_summaries WHERE customer_id = ? AND ...',
      [query.customerId]
    );
  }
}
```

**When to use:**
- Complex domains with different read/write patterns
- High read-to-write ratios
- Need for different consistency models

**When to avoid:**
- Simple CRUD applications
- Small teams without experience in distributed systems
- When eventual consistency is unacceptable

### 4. Modular Monolith with Bounded Contexts

**Core Idea**: Structure a monolith as loosely coupled modules based on Domain-Driven Design bounded contexts.

**Benefits:**
- Simpler deployment than microservices
- Clear module boundaries prevent coupling
- Can evolve to microservices if needed
- Single codebase, easier debugging

**Structure:**
- Each module has its own domain model
- Modules communicate through well-defined interfaces
- No direct database access across modules
- Shared kernel kept minimal

**TypeScript Example:**

```typescript
// Modules are organized by bounded context
// /src/modules/orders/
// /src/modules/inventory/
// /src/modules/shipping/

// Orders module exposes public API
export interface OrdersModule {
  placeOrder(command: PlaceOrderCommand): Promise<OrderId>;
  getOrderStatus(orderId: OrderId): Promise<OrderStatus>;
}

// Internal implementation is hidden
class OrdersModuleImpl implements OrdersModule {
  // Private - other modules cannot access
  private readonly orderRepo: OrderRepository;
  private readonly eventBus: EventBus;

  async placeOrder(command: PlaceOrderCommand): Promise<OrderId> {
    // Implementation
  }
}

// Inventory module subscribes to order events
class InventoryModule {
  constructor(eventBus: EventBus) {
    eventBus.subscribe(OrderPlacedEvent, this.handleOrderPlaced);
  }

  private async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    // Reserve inventory
  }
}
```

**Key Practices:**
- Enforce module boundaries with linting rules or architecture tests
- Use events for cross-module communication
- Each module can have its own database schema (logical separation)
- Avoid shared mutable state between modules

### 5. Dependency Inversion Principle (DIP)

**Core Idea**: Depend on abstractions, not concretions. High-level modules should not depend on low-level modules.

**Traditional Layered Architecture (Problematic):**
```
UI Layer → Business Logic → Data Access → Database
```
Business logic depends on data access implementation.

**Dependency Inversion:**
```
UI Layer → Business Logic ← Data Access Adapter
              ↓
         Interfaces
```
Business logic defines interfaces; data access implements them.

**TypeScript Example:**

```typescript
// Business logic defines what it needs
interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async registerUser(email: string, password: string): Promise<void> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error('User already exists');

    const user = new User(email, hashPassword(password));
    await this.userRepo.save(user);
  }
}

// Infrastructure implements the interface
class MongoUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // MongoDB implementation
  }

  async save(user: User): Promise<void> {
    // MongoDB implementation
  }
}

// Easy to swap implementations
class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values())
      .find(u => u.email === email) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}
```

**Kotlin Example:**

```kotlin
// Domain defines interface
interface UserRepository {
    suspend fun findByEmail(email: String): User?
    suspend fun save(user: User)
}

class UserService(private val userRepo: UserRepository) {
    suspend fun registerUser(email: String, password: String) {
        val existing = userRepo.findByEmail(email)
        require(existing == null) { "User already exists" }

        val user = User(email, hashPassword(password))
        userRepo.save(user)
    }
}

// Infrastructure implements
class MongoUserRepository : UserRepository {
    override suspend fun findByEmail(email: String): User? {
        // MongoDB implementation
    }

    override suspend fun save(user: User) {
        // MongoDB implementation
    }
}
```

---

