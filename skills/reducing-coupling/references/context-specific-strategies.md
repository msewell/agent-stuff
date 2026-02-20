## Context-Specific Strategies

### Microservices Architecture

**Coupling Challenges:**
- Service-to-service dependencies
- Shared databases (anti-pattern)
- Distributed transactions
- API versioning

**Strategies:**

#### 1. Database Per Service

**Principle**: Each service owns its data; no shared databases.

**Benefits:**
- Services can evolve independently
- Different databases for different needs
- Clear ownership

**Challenges:**
- Data consistency across services
- Queries spanning multiple services
- Increased operational complexity

**Pattern: Saga for Distributed Transactions**

```typescript
// Choreography-based saga
class OrderService {
  async createOrder(order: Order): Promise<void> {
    await this.orderRepo.save(order);
    await this.eventBus.publish(new OrderCreatedEvent(order));
  }

  async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    const order = await this.orderRepo.findById(event.orderId);
    order.cancel();
    await this.orderRepo.save(order);
  }
}

class PaymentService {
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await this.processPayment(event.orderId, event.amount);
      await this.eventBus.publish(new PaymentSucceededEvent(event.orderId));
    } catch (error) {
      await this.eventBus.publish(new PaymentFailedEvent(event.orderId));
    }
  }
}
```

#### 2. API Versioning for Backward Compatibility

**Strategies:**

**URL Versioning:**
```typescript
// v1 API
app.get('/v1/orders/:id', (req, res) => {
  // Old format
});

// v2 API with breaking changes
app.get('/v2/orders/:id', (req, res) => {
  // New format
});
```

**Header Versioning:**
```typescript
app.get('/orders/:id', (req, res) => {
  const version = req.headers['api-version'] || 'v1';
  if (version === 'v2') {
    // New format
  } else {
    // Old format
  }
});
```

**Expand-Contract Pattern:**
1. **Expand**: Add new fields/endpoints while keeping old ones
2. **Migrate**: Update clients to use new version
3. **Contract**: Remove old fields/endpoints

#### 3. Consumer-Driven Contract Testing

**Core Idea**: Consumers define contracts that providers must satisfy.

**Benefits:**
- Providers know what consumers expect
- Breaking changes detected early
- Enables independent deployment

**Example with Pact:**

```typescript
// Consumer defines contract
describe('Order API', () => {
  it('should return order details', async () => {
    await provider.addInteraction({
      state: 'order 123 exists',
      uponReceiving: 'a request for order 123',
      withRequest: {
        method: 'GET',
        path: '/orders/123'
      },
      willRespondWith: {
        status: 200,
        body: {
          id: '123',
          status: 'PENDING',
          total: 99.99
        }
      }
    });

    const order = await orderClient.getOrder('123');
    expect(order.id).toBe('123');
  });
});

// Provider verifies it satisfies all consumer contracts
```

### Frontend Architecture

**Coupling Challenges:**
- Component dependencies
- Global state management
- Tight coupling to backend APIs
- UI framework lock-in

**Strategies:**

#### 1. Component Composition Over Inheritance

```typescript
// AVOID - Inheritance creates tight coupling
class BaseButton extends React.Component {
  // Shared logic
}

class PrimaryButton extends BaseButton {
  // Coupled to BaseButton implementation
}

// PREFER - Composition
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

#### 2. Custom Hooks for Logic Reuse

```typescript
// Decouple data fetching from UI
function useOrders(customerId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders(customerId).then(setOrders).finally(() => setLoading(false));
  }, [customerId]);

  return { orders, loading };
}

// Multiple components can use the same logic
function OrderList({ customerId }: Props) {
  const { orders, loading } = useOrders(customerId);

  if (loading) return <Spinner />;
  return <div>{orders.map(o => <OrderItem order={o} />)}</div>;
}
```

#### 3. Backend-for-Frontend (BFF) Pattern

**Core Idea**: Create a dedicated backend for each frontend, decoupling frontend from microservices.

```typescript
// BFF aggregates data from multiple services
class OrderBFF {
  constructor(
    private orderService: OrderServiceClient,
    private userService: UserServiceClient,
    private productService: ProductServiceClient
  ) {}

  async getOrderDetails(orderId: string): Promise<OrderDetailsDTO> {
    const order = await this.orderService.getOrder(orderId);
    const user = await this.userService.getUser(order.userId);
    const products = await Promise.all(
      order.items.map(item => this.productService.getProduct(item.productId))
    );

    // Return exactly what the frontend needs
    return {
      orderId: order.id,
      customerName: user.name,
      items: order.items.map((item, i) => ({
        productName: products[i].name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total
    };
  }
}
```

### Database Coupling

**Anti-Pattern: Shared Database Integration**

Multiple services/applications accessing the same database creates tight coupling.

**Problems:**
- Schema changes affect all consumers
- No clear ownership
- Difficult to optimize for different use cases
- Cannot use different database technologies

**Solutions:**

#### 1. Database Per Service (Microservices)

Each service has its own database.

#### 2. Separate Schemas (Modular Monolith)

```sql
-- Orders module schema
CREATE SCHEMA orders;
CREATE TABLE orders.orders (...);

-- Inventory module schema
CREATE SCHEMA inventory;
CREATE TABLE inventory.products (...);

-- Enforce: Orders module cannot access inventory.products directly
```

#### 3. Database Views for Read-Only Access

```sql
-- Inventory service owns the data
CREATE TABLE inventory.products (...);

-- Expose read-only view for other services
CREATE VIEW public.product_catalog AS
SELECT id, name, price FROM inventory.products;

GRANT SELECT ON public.product_catalog TO order_service;
```

#### 4. Change Data Capture (CDC) for Event Streaming

```typescript
// Inventory service publishes changes
class InventoryService {
  async updateProduct(product: Product): Promise<void> {
    await this.productRepo.save(product);

    // CDC automatically captures this change and publishes event
    // Other services subscribe to product change events
  }
}
```

---

