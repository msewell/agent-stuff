# ADR Integration and Risk Modeling with C4

## Architecture Decision Records (ADR) Integration

Architecture diagrams show the **outcomes** of decisions. Architecture Decision Records document the **reasoning** behind those decisions. Together, they answer both *"what does our architecture look like?"* and *"why does it look this way?"*

### What Are ADRs?

ADRs are short, structured documents that capture a single architectural decision — the context, the decision itself, the alternatives considered, and the consequences.

A typical ADR follows this structure:

```markdown
# 3. Use PostgreSQL for order storage

Date: 2025-09-15

## Status

Accepted

## Context

The order service needs a relational database that supports ACID transactions
for payment processing. We considered PostgreSQL, MySQL, and DynamoDB.

## Decision

We will use PostgreSQL for order storage.

## Consequences

- Strong ACID guarantees for payment-related writes
- Team has existing PostgreSQL expertise
- Requires managed hosting (AWS RDS) for production reliability
- Schema migrations needed as the order model evolves
```

### Structurizr's `!adrs` Directive

Structurizr can import ADRs directly into the workspace:

```
!adrs <path> [format]
```

**Supported formats:** adr-tools (default), MADR, Log4brains.

**Attachment points** — ADRs can be scoped to different levels:

```
workspace "PageTurn" {
    !adrs decisions/

    model {
        pageturn = softwareSystem "PageTurn" {
            !adrs decisions/pageturn/

            orderApi = container "Order API" "Go" {
                !adrs decisions/pageturn/order-api/
            }
        }
    }
}
```

### Recommended Directory Structure

```
project-root/
├── src/
├── docs/
│   ├── architecture/
│   │   ├── workspace.dsl
│   │   └── decisions/
│   │       ├── 0001-record-architecture-decisions.md
│   │       ├── 0002-use-microservices-architecture.md
│   │       ├── pageturn/
│   │       │   ├── 0001-use-react-for-storefront.md
│   │       │   └── order-api/
│   │       │       ├── 0001-use-hexagonal-architecture.md
│   │       │       └── 0002-use-postgresql-for-orders.md
```

### Cross-Referencing ADRs to Diagram Elements

In ADRs, add a "Relates to" section:

```markdown
## Relates to

- **Container**: Order API
- **Container**: Order DB
- **Diagram**: Level 2 Container Diagram
```

In Structurizr DSL, reference ADRs in element descriptions:

```
orderApi = container "Order API" "Handles order lifecycle. See ADR-0002, ADR-0005." "Go"
```

### When to Write an ADR

Write an ADR when a decision:
- Is **hard to reverse** (choice of database, communication protocol, language/framework)
- Has **significant consequences** (affects multiple teams, changes data flow)
- Was **actively debated** (multiple viable alternatives existed)
- **Surprised someone** (if people ask "why did we do it this way?")

Do NOT write an ADR for trivial or easily reversible decisions.

---

## Risk-Storming with C4

Risk-storming is a collaborative, visual technique created by Simon Brown for identifying architectural risks using C4 diagrams as the canvas.

### The Four Steps

**Step 1: Prepare the diagrams.**
Print or display your C4 diagrams (typically Level 1 and Level 2). Use diagrams that show what you are *planning to build or change*.

**Step 2: Identify risks individually (10 minutes, silent).**
Each participant writes risks on color-coded sticky notes:

| Color | Priority | Probability × Impact | Examples |
|-------|----------|---------------------|----------|
| **Red** | High (6–9) | High × High | Single point of failure in payment flow |
| **Amber** | Medium (3–4) | Mixed | Unproven technology choice; team skill gap |
| **Green** | Low (1–2) | Low × Low | Minor UI performance issue |

**Step 3: Converge onto the diagrams.**
Place sticky notes onto C4 diagrams near the relevant element. Visual clustering reveals hotspots.

**Step 4: Review and create a risk register.**
Pay attention to: risks only one person identified, priority disagreements, and element clusters.

### Risk Categories

| Category | What to look for |
|----------|-----------------|
| **Technology** | Unproven tech, scalability limits, single points of failure |
| **People** | Skill gaps, key-person dependencies |
| **Process** | Missing runbooks, undefined incident response |
| **External** | Vendor lock-in, third-party API reliability |

---

## STRIDE Threat Modeling with C4

STRIDE maps naturally onto C4 container and deployment diagrams.

### The STRIDE Categories

| Threat | Description | C4 Elements to Examine |
|--------|-------------|----------------------|
| **S**poofing | Pretending to be someone else | Person→Container relationships, authentication flows |
| **T**ampering | Modifying data in transit/at rest | Container→Container relationships, databases, queues |
| **R**epudiation | Denying an action occurred | Financial transaction containers, audit-sensitive operations |
| **I**nformation Disclosure | Exposing data to unauthorized parties | Databases, external integrations, caches |
| **D**enial of Service | Making a system unavailable | Public-facing containers, API endpoints |
| **E**levation of Privilege | Gaining unauthorized access | User API, admin interfaces, authorization |

### Applying STRIDE to a Container Diagram

1. **External boundary crossings**: evaluate Spoofing and Information Disclosure.
2. **Inter-container relationships**: evaluate Tampering and Information Disclosure.
3. **Data stores**: evaluate Tampering, Information Disclosure, and Denial of Service.
4. **Public-facing containers**: evaluate Denial of Service and Spoofing.
5. **Sensitive operations**: evaluate Repudiation and Elevation of Privilege.

### Annotating Diagrams with Threats

In Structurizr DSL:

```
orderApi = container "Order API" "Handles order lifecycle." "Go" {
    tags "STRIDE:S,T,R,E"
    properties {
        "Threat: Spoofing" "Mitigated by JWT validation at API Gateway"
        "Threat: Tampering" "Input validation on all endpoints; TLS in transit"
        "Threat: Repudiation" "All state changes logged to audit trail"
        "Threat: Elevation" "Role-based access control enforced per endpoint"
    }
}
```

### Combining Risk-Storming and STRIDE

1. **Start with risk-storming** to identify broad architectural risks.
2. **Follow up with STRIDE** on high-risk containers and relationships.
3. **Document findings** as properties on C4 elements and as ADRs for mitigation decisions.
