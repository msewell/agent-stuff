# Modern Architecture Patterns and Team Adoption

## Microservices

The C4 model handles microservices with two distinct approaches based on team ownership:

**Approach 1: Single-team ownership (implementation detail)**

When one team builds and owns all the microservices, all microservices are containers within a single software system boundary.

```
softwareSystem "E-Commerce Platform" {
    orderService = container "Order Service" "Manages orders." "Go"
    orderDb = container "Order DB" "Stores order data." "PostgreSQL"
    catalogService = container "Catalog Service" "Manages product catalog." "Go"
    catalogDb = container "Catalog DB" "Stores catalog data." "PostgreSQL"
}
```

The System Context diagram looks identical to a monolith from the outside. The decomposition is visible only at Level 2 (Container).

**Approach 2: Multi-team ownership (Conway's Law)**

When separate teams independently own, deploy, and operate individual services, promote each service to its own software system:

```
orderSystem = softwareSystem "Order Service" "Manages orders. Owned by Team Orders."
catalogSystem = softwareSystem "Catalog Service" "Manages product catalog. Owned by Team Catalog."
```

**Decision factor**: *"Is this service independently owned, deployed, and operated by a separate team?"* If yes → separate software system. If no → container within the owning team's system.

## Event-Driven Architectures

- Model individual **topics and queues as separate containers**, not the broker itself.
- Avoid hub-and-spoke diagrams where everything connects to a single "Kafka" box.
- Label relationships with event/message types: *"Publishes OrderCreated event to"*, *"Consumes PaymentProcessed events from."*
- Use the "via" annotation for cleaner diagrams:
  ```
  orderService -> paymentService "Notifies of new orders" "via orders.created topic"
  ```

## Serverless and Cloud-Native

- Serverless functions (Lambda, Cloud Functions) are containers — they are separately deployable and runnable.
- Managed services (RDS, DynamoDB, S3) → containers if you own the configuration, external systems if truly external.
- Use **deployment diagrams** to show how containers map to cloud infrastructure.
- Use cloud-provider themes/icons for intuitive deployment topology.

## Integration with Domain-Driven Design (DDD)

| DDD Concept | C4 Mapping |
|-------------|------------|
| Bounded Context | Software System or group of containers |
| Aggregate | Component |
| Domain Event | Relationship label or queue/topic container |
| Ubiquitous Language | Element names and descriptions |

Use DDD to inform your C4 boundaries. Use C4 to visualize the static structure that DDD defines.

---

## Team Adoption Playbook

### Phase 1: Foundation (Week 1–2)

1. **Educate the team.** Run a 1-hour session covering C4 concepts, the maps metaphor, and the four levels.
2. **Pick your tooling.** Developer-heavy teams: Structurizr DSL. Mixed teams: IcePanel or Miro with C4 templates.
3. **Create your first System Context diagram.** Do this collaboratively — whiteboard it together, then codify it.
4. **Create your first Container diagram.** Debate what the containers are, how they communicate, and what technologies they use.

### Phase 2: Establish Standards (Week 3–4)

5. **Document your conventions.** Agree on color schemes, line styles, tool choice, diagram storage location, naming conventions. Write in `ARCHITECTURE.md`.
6. **Store diagrams in version control** alongside code. Architecture changes reviewed in the same PR as code changes.
7. **Assign ownership.** Each diagram or model section should have a clear owner.

### Phase 3: Integrate (Month 2+)

8. **Use diagrams in onboarding.** New members start with System Context, then Container diagram.
9. **Reference diagrams in design discussions.** Pull up the container diagram during architecture reviews.
10. **Include diagram updates in your definition of done.** If a PR introduces a new container, update the diagrams in the same PR.
11. **Review periodically.** Quarterly review to ensure diagrams reflect reality.

### Common Adoption Pitfalls

- **Boiling the ocean**: Trying to model the entire organization at once. Start with one system.
- **Perfection paralysis**: Spending weeks debating notation instead of drawing diagrams.
- **Architect-only ownership**: If only architects maintain diagrams, developers will not use them.
- **Ignoring maintenance**: Creating diagrams once and never updating them.
