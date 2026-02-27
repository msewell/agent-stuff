## 4. Architectural Patterns

These patterns define the recommended application structure. They are *optional* — Nullables work with any architecture — but they maximize testability.

### 4.1 A-Frame Architecture

**Intent**: Structure the application so infrastructure and logic are peers, not a dependency chain.

**Problem**: In typical layered architectures, infrastructure sits at the bottom of the dependency chain. Every layer above depends on infrastructure, making it impossible to test business logic without dealing with databases, HTTP clients, and file systems.

**Solution**: Organize the application into three layers where infrastructure and logic are independent peers coordinated by the application layer:

```
      Application / UI
       /          \
    Logic    Infrastructure
       \          /
        Values (shared)
```

- **Application layer**: Coordinates between logic and infrastructure. Contains no business logic and no I/O details.
- **Logic layer**: Pure business rules. Depends only on values. Has no awareness of infrastructure.
- **Infrastructure layer**: Wraps external systems (HTTP, file system, databases). Has no awareness of business logic.
- **Values**: Immutable data structures shared across layers.

This is similar to "Functional Core, Imperative Shell" or "Hexagonal Architecture" but specifically addresses how to *test infrastructure code* — the major gap in Functional Core approaches.

### 4.2 Logic Sandwich

**Intent**: Coordinate logic and infrastructure through sequential read-process-write steps.

**Problem**: The application layer needs to orchestrate data flow between infrastructure (which reads/writes external systems) and logic (which processes data) without coupling them.

**Solution**: Structure application methods as sequential steps: read from infrastructure, process with logic, write to infrastructure.

```typescript
class App {
  async handleRequest(): Promise<void> {
    // Read
    const rawData = await this.database.fetchOrders();

    // Process
    const report = this.reportGenerator.generate(rawData);

    // Write
    await this.emailService.send(report);
  }
}
```

Repeat the pattern for multi-step workflows:

```typescript
async processCheckout(): Promise<void> {
  const cart = await this.cartDb.fetch(userId);        // Read
  const order = this.orderLogic.createOrder(cart);      // Process
  await this.orderDb.save(order);                       // Write
  const receipt = this.receiptLogic.generate(order);    // Process
  await this.emailService.send(receipt);                // Write
}
```

### 4.3 Traffic Cop

**Intent**: Use the observer pattern for event-driven coordination.

**Problem**: Some applications are event-driven — web servers handle requests, message queues trigger processing. The Logic Sandwich's sequential model doesn't fit naturally.

**Solution**: The application layer registers event handlers on infrastructure, implementing a Logic Sandwich within each handler.

```typescript
class App {
  start(): void {
    this.server.onPost("/api/orders", async (requestData) => {
      // Logic Sandwich inside event handler
      const order = this.orderLogic.validate(requestData);  // Process
      await this.orderDb.save(order);                        // Write
      return { status: 201, body: order };
    });

    this.messageQueue.onMessage("payment.received", async (event) => {
      const fulfillment = this.fulfillLogic.process(event);  // Process
      await this.warehouse.dispatch(fulfillment);             // Write
    });
  }
}
```

### 4.4 Grow Evolutionary Seeds

**Intent**: Build applications incrementally from simple, working seeds.

**Problem**: Designing an entire application architecture upfront leads to speculative abstractions that don't fit real requirements.

**Solution**: Start with the simplest possible working version and evolve:

1. **Seed**: Hardcode the core behavior. No infrastructure, no configuration.
2. **Add low-level infrastructure**: Wrap external I/O in Infrastructure Wrappers with Nullables.
3. **Add high-level infrastructure**: Build application-level wrappers on top.
4. **Add UI/API infrastructure**: Wire up the entry point.
5. **Evolve**: Refactor toward A-Frame Architecture as complexity warrants.

At every step, you have a working application with a complete test suite. This is essentially a walking skeleton approach with built-in testability.

---

