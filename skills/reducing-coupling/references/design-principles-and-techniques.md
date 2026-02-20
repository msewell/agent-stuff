## Design Principles and SOLID

### Single Responsibility Principle (SRP)

**Principle**: A class should have only one reason to change.

**Impact on Coupling**: Classes with multiple responsibilities create coupling between unrelated concerns.

**Example:**

```typescript
// VIOLATION - Multiple responsibilities
class UserManager {
  saveUser(user: User): void {
    // Database logic
    const sql = 'INSERT INTO users...';
    this.db.execute(sql);
  }

  sendWelcomeEmail(user: User): void {
    // Email logic
    const smtp = new SmtpClient();
    smtp.send(user.email, 'Welcome!');
  }

  validateUser(user: User): boolean {
    // Validation logic
    return user.email.includes('@');
  }
}

// BETTER - Single responsibilities
class UserRepository {
  save(user: User): void {
    // Only database concerns
  }
}

class EmailService {
  sendWelcomeEmail(user: User): void {
    // Only email concerns
  }
}

class UserValidator {
  validate(user: User): ValidationResult {
    // Only validation concerns
  }
}
```

### Interface Segregation Principle (ISP)

**Principle**: Clients should not be forced to depend on interfaces they don't use.

**Impact on Coupling**: Fat interfaces create unnecessary coupling.

**Example:**

```typescript
// VIOLATION - Fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  getPaid(): void;
}

class Robot implements Worker {
  work(): void { /* ... */ }
  eat(): void { throw new Error('Robots don\'t eat'); }
  sleep(): void { throw new Error('Robots don\'t sleep'); }
  getPaid(): void { throw new Error('Robots don\'t get paid'); }
}

// BETTER - Segregated interfaces
interface Workable {
  work(): void;
}

interface Biological {
  eat(): void;
  sleep(): void;
}

interface Payable {
  getPaid(): void;
}

class Human implements Workable, Biological, Payable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  getPaid(): void { /* ... */ }
}

class Robot implements Workable {
  work(): void { /* ... */ }
}
```

### Open/Closed Principle (OCP)

**Principle**: Software entities should be open for extension but closed for modification.

**Impact on Coupling**: Reduces coupling by allowing behavior changes without modifying existing code.

**Example using Strategy Pattern:**

```typescript
// Closed for modification, open for extension
interface PricingStrategy {
  calculatePrice(basePrice: number): number;
}

class RegularPricing implements PricingStrategy {
  calculatePrice(basePrice: number): number {
    return basePrice;
  }
}

class SeasonalDiscount implements PricingStrategy {
  calculatePrice(basePrice: number): number {
    return basePrice * 0.8; // 20% off
  }
}

class VIPPricing implements PricingStrategy {
  calculatePrice(basePrice: number): number {
    return basePrice * 0.7; // 30% off
  }
}

class PriceCalculator {
  constructor(private strategy: PricingStrategy) {}

  calculate(basePrice: number): number {
    return this.strategy.calculatePrice(basePrice);
  }
}

// Add new pricing strategies without modifying existing code
class FlashSale implements PricingStrategy {
  calculatePrice(basePrice: number): number {
    return basePrice * 0.5; // 50% off
  }
}
```

---

## Implementation Techniques

### 1. Dependency Injection

**Core Idea**: Dependencies are provided to a component rather than created by it.

**Benefits:**
- Decouples components from their dependencies
- Enables testing with mock implementations
- Makes dependencies explicit

**Constructor Injection (Preferred):**

```typescript
class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly emailService: EmailService
  ) {}
}

// Dependencies injected at construction
const orderService = new OrderService(
  new PostgresOrderRepository(),
  new StripePaymentGateway(),
  new SendGridEmailService()
);
```

**Kotlin with Dependency Injection:**

```kotlin
class OrderService(
    private val orderRepo: OrderRepository,
    private val paymentGateway: PaymentGateway,
    private val emailService: EmailService
) {
    // Dependencies injected via constructor
}

// Using a DI framework like Koin
val appModule = module {
    single<OrderRepository> { PostgresOrderRepository() }
    single<PaymentGateway> { StripePaymentGateway() }
    single<EmailService> { SendGridEmailService() }
    single { OrderService(get(), get(), get()) }
}
```

**Avoid Service Locator Pattern:**

```typescript
// ANTI-PATTERN - Service Locator hides dependencies
class OrderService {
  process(): void {
    const repo = ServiceLocator.get<OrderRepository>('OrderRepository');
    const gateway = ServiceLocator.get<PaymentGateway>('PaymentGateway');
    // Hidden dependencies, hard to test, runtime errors
  }
}

// BETTER - Explicit dependencies
class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly gateway: PaymentGateway
  ) {}

  process(): void {
    // Dependencies are clear
  }
}
```

### 2. Adapter Pattern

**Core Idea**: Convert one interface to another, isolating clients from external dependencies.

**Example:**

```typescript
// External library with incompatible interface
class ThirdPartyEmailClient {
  sendMail(to: string[], subject: string, body: string, options: any): void {
    // Complex third-party API
  }
}

// Our domain interface
interface EmailService {
  send(email: Email): Promise<void>;
}

// Adapter isolates our code from third-party library
class ThirdPartyEmailAdapter implements EmailService {
  constructor(private client: ThirdPartyEmailClient) {}

  async send(email: Email): Promise<void> {
    this.client.sendMail(
      [email.recipient],
      email.subject,
      email.body,
      { html: true }
    );
  }
}

// Our code depends only on our interface
class UserService {
  constructor(private emailService: EmailService) {}

  async registerUser(user: User): Promise<void> {
    await this.emailService.send({
      recipient: user.email,
      subject: 'Welcome!',
      body: 'Thanks for registering'
    });
  }
}
```

### 3. Anti-Corruption Layer (ACL)

**Core Idea**: Protect your domain model from external systems' models, especially legacy systems.

**When to use:**
- Integrating with legacy systems
- Consuming third-party APIs
- Preventing external changes from rippling through your system

**Example:**

```typescript
// Legacy system's model
interface LegacyCustomerData {
  cust_id: string;
  f_name: string;
  l_name: string;
  addr_line_1: string;
  addr_line_2: string;
  // ... 50 more fields
}

// Our domain model
class Customer {
  constructor(
    public readonly id: CustomerId,
    public readonly name: FullName,
    public readonly address: Address
  ) {}
}

// Anti-Corruption Layer translates between models
class LegacyCustomerAdapter {
  toDomain(legacy: LegacyCustomerData): Customer {
    return new Customer(
      new CustomerId(legacy.cust_id),
      new FullName(legacy.f_name, legacy.l_name),
      new Address(legacy.addr_line_1, legacy.addr_line_2)
    );
  }

  toLegacy(customer: Customer): LegacyCustomerData {
    return {
      cust_id: customer.id.value,
      f_name: customer.name.firstName,
      l_name: customer.name.lastName,
      addr_line_1: customer.address.line1,
      addr_line_2: customer.address.line2,
      // ... map other fields
    };
  }
}
```

### 4. Strangler Fig Pattern

**Core Idea**: Gradually replace a legacy system by incrementally building a new system around it.

**Process:**
1. Identify a piece of functionality to migrate
2. Build new implementation alongside old
3. Route traffic to new implementation
4. Remove old implementation once validated
5. Repeat

**Example with Feature Flags:**

```typescript
interface OrderProcessor {
  process(order: Order): Promise<void>;
}

class LegacyOrderProcessor implements OrderProcessor {
  async process(order: Order): Promise<void> {
    // Old, complex, tightly-coupled logic
  }
}

class ModernOrderProcessor implements OrderProcessor {
  async process(order: Order): Promise<void> {
    // New, clean, decoupled logic
  }
}

// Strangler facade routes between old and new
class OrderProcessorFacade implements OrderProcessor {
  constructor(
    private readonly legacy: LegacyOrderProcessor,
    private readonly modern: ModernOrderProcessor,
    private readonly featureFlags: FeatureFlags
  ) {}

  async process(order: Order): Promise<void> {
    if (this.featureFlags.isEnabled('use-modern-order-processor')) {
      return this.modern.process(order);
    } else {
      return this.legacy.process(order);
    }
  }
}
```

---

