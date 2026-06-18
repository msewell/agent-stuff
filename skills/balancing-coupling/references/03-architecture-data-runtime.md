# Architecture, Data, and Runtime Coupling

## Table of Contents

- [Default architecture stance](#default-architecture-stance)
- [Bounded contexts](#bounded-contexts)
- [Event-driven coordination](#event-driven-coordination)
- [Choreography vs. orchestration](#choreography-vs-orchestration)
- [Data ownership](#data-ownership)
- [Outbox and CDC](#outbox-and-cdc)
- [Contract evolution](#contract-evolution)
- [Temporal and runtime coupling](#temporal-and-runtime-coupling)
- [Legacy decoupling](#legacy-decoupling)

Use this reference when coupling crosses module, service, database, deployment, or runtime boundaries.

## Default architecture stance

Default to a modular monolith unless independent scaling, deployment, ownership, or reliability needs justify distribution.

Good modular monoliths:

- group code by cohesive business capability;
- hide internals behind published module contracts;
- avoid cross-module reads of private data structures;
- keep logical boundaries clean even when deployed as one unit.

Extract a service only when a module demonstrably needs independent scaling, deployment, failure isolation, or ownership. Clean module seams make later extraction cheaper.

## Bounded contexts

A bounded context is a boundary where a domain model has a consistent meaning. Do not force one shared model across contexts when the same word has different meaning in each context. Give each context its own model and translate at the boundary.

## Event-driven coordination

Events decouple producers from consumers, but only when event contracts, failure handling, and observability are designed deliberately.

Useful event patterns:

| Pattern | Payload | Coupling tradeoff |
|---|---|---|
| Event notification | Fact plus identifier | Weak payload; may require callback or lookup |
| Event-carried state transfer | Snapshot of changed state | Consumers avoid synchronous lookup but duplicate state |
| Event sourcing | Event log is source of truth | Powerful but high commitment |
| CQRS | Separate read/write models | Useful for specific asymmetry; costly as a default architecture |

Start with simple publish/subscribe. Add event sourcing, CQRS, sagas, and outbox processing only for concrete needs.

## Choreography vs. orchestration

For multi-step distributed workflows:

- **Choreography:** services react to each other's events. It is looser and scalable, but logic is distributed and harder to trace.
- **Orchestration:** one coordinator tells each participant what to do. It is more explicit and easier to reason about, but the coordinator knows the workflow.

Use choreography for small/simple flows. Use orchestration when the workflow has many steps, compensations, or operational visibility requirements.

Both require idempotent consumers, explicit compensation, dead-letter handling, tracing, and replay/failure strategy.

## Data ownership

Shared databases are often hidden coupling. Multiple modules/services reading and writing the same tables communicate through an implicit table contract.

Prefer:

1. one owner per dataset;
2. other components access data through APIs, events, projections, or exported read models;
3. schema changes are governed like public contract changes;
4. cross-boundary reads are explicit and observable.

A shared database can be acceptable when components deploy together, change together, and the added synchronization machinery would cost more than the split. Document that tradeoff.

## Outbox and CDC

When a service changes state and publishes an event, avoid dual writes.

Use the outbox pattern:

1. In one database transaction, write business state and an outbox row.
2. A relay publishes pending outbox rows.
3. Consumers process events idempotently.

At higher scale, Change Data Capture can stream outbox rows from the database log instead of polling.

## Contract evolution

APIs and events are contracts. Protect independent deployment by requiring:

- additive changes first;
- explicit versions when semantics change;
- deprecation windows;
- schema compatibility checks in CI for events;
- contract tests for high-value integrations.

Do not silently reshape payloads used across service or ownership boundaries.

## Temporal and runtime coupling

A synchronous operation depends on every service it calls. Availability multiplies across the chain. Three services at 99.9% availability in a critical synchronous path produce about 99.7% availability for the whole path before accounting for network behavior.

Reduce runtime coupling by:

- removing synchronous calls from critical paths;
- using asynchronous messaging;
- keeping local read replicas for data needed during command handling;
- applying timeouts, retries with backoff and jitter, circuit breakers, bulkheads, and graceful degradation when synchronous calls remain.

Make synchronous runtime coupling deliberate and bound the blast radius.

## Legacy decoupling

Use incremental, reversible migration patterns:

- **Strangler Fig:** route selected capabilities through a façade to new implementation while old behavior remains available.
- **Branch by Abstraction:** introduce a stable interface around a deep component, run old and new implementations behind it, then switch gradually.
- **Feature flags:** ship the new path inactive, enable by slice, monitor, and roll back quickly.

Finish the migration by deleting old code and removing flags. Otherwise the system keeps two behaviors forever and coupling increases.
