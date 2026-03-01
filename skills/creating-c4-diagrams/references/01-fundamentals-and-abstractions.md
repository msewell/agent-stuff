# C4 Model Fundamentals and Abstractions

## What Is the C4 Model?

The C4 model is a lean, hierarchical approach to describing software architecture created by Simon Brown between 2006–2011. It provides:

- **Four hierarchical abstraction levels**: Context, Containers, Components, Code
- **Seven diagram types**: four core + three supplementary (landscape, dynamic, deployment)
- **Notation independence**: no prescribed shapes, colors, or visual conventions
- **Tool independence**: works with any diagramming or modeling tool

### The Maps Metaphor

Think of C4 like Google Maps. You can zoom out to see how a city (your system) sits within a country (the enterprise), then zoom in to see districts (containers), neighborhoods (components), and individual buildings (code). Each zoom level tells a different story to a different audience.

### What C4 Is Not

- **Not a replacement for UML** — it complements UML for teams that find UML too heavyweight
- **Not a design process** — it describes systems, it does not prescribe how to build them
- **Not a team structure model** — different teams do not "own" different levels
- **Not limited to monoliths** — works equally well for microservices, event-driven, and serverless architectures

---

## Core Abstractions

C4 uses four hierarchical abstractions. Each maps directly to how developers and architects think about software.

### Person

A human user of the software system. Can represent specific roles, personas, or actors.

### Software System

The highest-level abstraction. A software system delivers value to its users and is typically:

- Owned and built by a single team
- A single source code repository (or closely related set of repos)
- Deployed together as a unit

**A software system is NOT**: a product domain, a bounded context, a business capability, or a team name.

### Container

A **separately deployable/runnable** unit within a software system. A container needs to be running for the system to work.

Examples:
- Server-side web applications (Spring Boot, ASP.NET, Rails, Express)
- Single-page applications (React, Angular, Vue)
- Mobile applications (iOS, Android)
- Databases (PostgreSQL, MongoDB, Redis)
- Message queues/topics (Kafka topics, RabbitMQ queues)
- Serverless functions (AWS Lambda, Azure Functions)
- File/blob storage (S3, Azure Blob Storage)
- Shell scripts and batch processes

> **Critical distinction**: "Container" in C4 predates Docker. A C4 container is *not* a Docker container. It is any deployable unit — a Docker container, a VM, a managed cloud service, etc.

### Component

A grouping of related functionality encapsulated behind a well-defined interface, **within a single container**. Components are NOT separately deployable — the container is the deployment unit.

Examples:
- A Spring `@Controller` class (or group of related controllers)
- A service layer module
- A repository/data-access layer
- A message handler/consumer group

---

## The Four Diagram Levels

### Level 1: System Context Diagram

**Scope**: A single software system.
**Shows**: The system in scope, its users (people), and external system dependencies.
**Audience**: Everyone — technical and non-technical.
**Recommendation**: **Always create one.** This is the starting point for every project.

**Purpose**: Answer the question *"What is this system, and how does it fit into the world?"*

**Guidelines**:
- Focus on people, roles, and system interactions — not technologies
- Keep it high-level: no internal details of your system
- Show only direct dependencies, not transitive ones
- External systems should be labeled with what they provide, not how they are built internally

### Level 2: Container Diagram

**Scope**: A single software system, decomposed into its containers.
**Shows**: Containers within the system, their technologies, and how they communicate. Also shows external people and systems that interact with them.
**Audience**: Technical team members — developers, architects, DevOps.
**Recommendation**: **Always create one.** This is the most valuable diagram for technical teams.

**Purpose**: Answer the question *"What are the major technical building blocks, and how do they talk to each other?"*

**Guidelines**:
- Every container should have a name, technology, and short responsibility description
- Show communication protocols on the arrows (HTTPS, gRPC, AMQP, SQL, etc.)
- Include external managed services you depend on (S3, RDS, Stripe API) as containers or external systems depending on ownership
- Do NOT show deployment topology here (load balancers, replicas) — that goes in deployment diagrams

### Level 3: Component Diagram

**Scope**: A single container, decomposed into its components.
**Shows**: Components within the container and their interactions with each other and external containers/systems.
**Audience**: Developers working on or with that specific container.
**Recommendation**: **Optional.** Create only when it adds genuine value.

**Purpose**: Answer the question *"What are the major structural building blocks inside this container?"*

**Guidelines**:
- Use selectively — not every container warrants a component diagram
- For simple microservices, a component diagram may add no value
- Consider automating generation from code annotations or conventions
- This diagram changes frequently during active development; keep maintenance cost in mind

### Level 4: Code Diagram

**Scope**: A single component, showing its internal code structure.
**Shows**: Classes, interfaces, functions, and their relationships (essentially a UML class diagram).
**Audience**: Developers working within that specific codebase.
**Recommendation**: **Rarely create manually.** Use IDE-generated views on demand.

**Purpose**: Answer the question *"How is this component implemented at the code level?"*

**Guidelines**:
- Auto-generate from source code rather than maintaining by hand
- Only create manually for particularly complex or critical code structures
- These become outdated immediately after creation; treat as ephemeral
- Most teams should skip this level entirely

---

## Supplementary Diagrams

### System Landscape Diagram

**Scope**: An enterprise, organization, department, or domain.
**Shows**: All software systems and the people who use them within that scope.
**Purpose**: A system context diagram without a single-system focus — shows how multiple systems relate.
**When to use**: Larger organizations with multiple interacting systems. Bridges C4 to enterprise architecture.

### Dynamic Diagram

**Scope**: Any level (systems, containers, or components).
**Shows**: How elements collaborate at runtime to implement a specific use case, feature, or user story. Steps are numbered sequentially.
**Based on**: UML communication/sequence diagrams.
**When to use**: Sparingly — for complex interactions, critical flows, or non-obvious runtime behavior that is hard to infer from static diagrams.

**Tip**: For simpler flows, add numbered labels directly to arrows on a Level 2 container diagram instead of creating a separate dynamic diagram.

### Deployment Diagram

**Scope**: One or more software systems mapped to infrastructure.
**Shows**: How container instances are deployed onto infrastructure in a specific environment (production, staging, development).
**Key concepts**:
- **Deployment nodes**: Physical servers, VMs, cloud instances, Kubernetes pods, Docker hosts, execution environments. Can be nested.
- **Infrastructure nodes**: DNS services, load balancers, firewalls, CDNs.
**When to use**: **Recommended** for any system running in production. Create separate diagrams for each significant environment.
