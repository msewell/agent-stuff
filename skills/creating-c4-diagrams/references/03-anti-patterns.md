# C4 Anti-Patterns and Common Mistakes

## Table of Contents

- [Abstraction Errors](#abstraction-errors)
- [Boundary and Scope Errors](#boundary-and-scope-errors)
- [Notation and Communication Errors](#notation-and-communication-errors)

Based on Simon Brown's GOTO 2024 talk *"The C4 Model — Misconceptions, Misuses & Mistakes"* and extensive community analysis.

## Abstraction Errors

### Confusing Containers and Components

**Mistake**: Modeling a class library, module, or package as a container.

**Why it's wrong**: Containers are **separately deployable/runnable** units. A shared library is compiled into a container, not deployed alongside it. A NuGet package or Maven dependency is a component, not a container.

**Fix**: Ask yourself: *"Does this thing need to be running for the system to work?"* If yes, it is a container. If no, it is a component within a container.

### Inventing Extra Abstraction Levels

**Mistake**: Adding "subsystems," "subcomponents," "modules," "layers," or other ad-hoc levels between the four defined levels.

**Why it's wrong**: The power of C4 lies in its fixed, named, hierarchical abstractions. Introducing undefined levels reintroduces the chaos C4 exists to prevent.

**Fix**: If you feel four levels are insufficient, you likely have a misunderstanding about what belongs at each level. Revisit the abstraction definitions.

### Treating the Message Broker as a Single Container

**Mistake**: Modeling "Kafka" or "RabbitMQ" as a single container with all services connecting to it hub-and-spoke style.

**Why it's wrong**: This hides the actual coupling between services. You cannot see which service produces to which topic or consumes from which queue.

**Fix**: Model individual topics/queues as separate containers. Alternatively, annotate relationship arrows with the queue/topic name (e.g., *"Publishes OrderCreated events via [orders topic]"*).

### Modeling Shared Libraries as Containers

**Mistake**: Representing a shared utility library or SDK as its own container in the container diagram.

**Why it's wrong**: Shared libraries are not separately deployed or running. They are compiled into the containers that use them.

**Fix**: Show the library as a component within the containers that use it. Alternatively, omit it entirely if it is not architecturally significant.

## Boundary and Scope Errors

### Detailing External System Internals

**Mistake**: Showing the internal containers or components of an external system your team does not own.

**Why it's wrong**: You should not know or document how external systems are built internally. Their internals are volatile, outside your control, and create false coupling in your diagrams.

**Fix**: Represent external systems as opaque boxes. Show only the interface you interact with (e.g., *"Stripe Payment API [External System]"*), not Stripe's internal databases or microservices.

### Misaligning Contexts with Organizational Structure

**Mistake**: Drawing system boundaries that do not match how your organization actually divides ownership and responsibility.

**Fix**: Software system boundaries should reflect team ownership. One team, one system. If multiple teams each own a service independently, promote those services to separate software systems.

## Diagram Quality Errors

### Using Bidirectional Arrows

**Mistake**: Drawing two-headed arrows between elements.

**Why it's wrong**: C4 has no concept of a bidirectional arrow. A two-headed arrow is ambiguous — does it mean "A calls B and B calls A?" Or "data flows in both directions within a single call?"

**Fix**: Use two separate unidirectional arrows, each with its own label.

### Removing Element Type Metadata

**Mistake**: Stripping `[Container: PostgreSQL]` or `[Software System]` labels from elements to make diagrams "cleaner."

**Fix**: Always show the element type. If the diagram feels cluttered, reduce the number of elements rather than removing metadata.

### Using Color as the Primary Differentiator

**Mistake**: Relying on color coding alone to distinguish element types, teams, or domains.

**Fix**: Use text labels as the primary differentiator. Colors are supplementary. Always document color meanings in the legend.

### Vague Relationship Labels

**Mistake**: Labeling arrows with generic text like "Uses," "Connects to," or "Calls."

**Fix**: Be specific: *"Sends order placement request via"*, *"Reads customer profile from"*, *"Publishes InventoryUpdated events to."*

## Conceptual Misconceptions

### Thinking C4 Replaces UML

C4 was designed for teams that had abandoned UML but were still drawing ad-hoc boxes-and-lines diagrams. UML and C4 are complementary — you can use UML notation within C4 diagrams.

### Using Diagrams to Document Decisions

Architecture diagrams show **outcomes** of decisions, not the decision-making process. Document the *why* in Architecture Decision Records (ADRs), and link to them from your diagrams.

### One Diagram to Rule Them All

**Mistake**: Trying to show the entire architecture in a single diagram with 30+ elements.

**Fix**: Split complex architectures into multiple focused diagrams. Create views by: domain/bounded context, team ownership, specific feature/capability, or deployment environment.

### Assuming C4 Implies a Team Structure

C4 is a descriptive tool, not an organizational framework. Any team can create diagrams at any level. The level you choose depends on the story you need to tell, not your org chart position.
