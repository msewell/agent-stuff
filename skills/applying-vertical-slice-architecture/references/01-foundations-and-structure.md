# Foundations and Structure

## Table of Contents

- [Core Mental Model](#core-mental-model)
- [Decision Framework](#decision-framework)
- [Defining Slice Granularity](#defining-slice-granularity)
  - [Heuristics for Right-Sizing](#heuristics-for-right-sizing)
- [Folder Structure Strategies](#folder-structure-strategies)
  - [Option A: Single File Per Feature](#option-a-single-file-per-feature-start-here)
  - [Option B: Feature Folders with Internal Structure](#option-b-feature-folders-with-internal-structure)
  - [Option C: Module → Slice Nesting](#option-c-module--slice-nesting)
  - [The Screaming Architecture Test](#the-screaming-architecture-test)
- [Full-Stack Slice Co-location](#full-stack-slice-co-location)
- [Aggregate Boundaries vs. Slice Boundaries](#aggregate-boundaries-vs-slice-boundaries)
  - [Design Heuristics](#design-heuristics)
  - [Concurrency at the Aggregate Boundary](#concurrency-at-the-aggregate-boundary)

---

## Core Mental Model

A vertical slice encapsulates a single use case end-to-end — from the entry point (API endpoint, message handler, UI action) through business logic and down to persistence. Instead of organizing by technical layer (controllers, services, repositories), organize by business capability. Each slice owns its request model, validation, orchestration logic, and data access.

The critical insight: slices are not miniature layered architectures. They are **self-contained behaviors** that you can reason about, test, and replace independently.

---

## Decision Framework

**VSA excels when:**

- The system is naturally decomposed into distinct use cases (commands and queries)
- Requirements change per feature, not per layer — modifying one capability should not ripple across the codebase
- The team has the discipline to spot code smells and refactor proactively
- The architecture should support evolutionary design rather than big up-front abstraction

**VSA struggles when:**

- Core domain invariants must be enforced identically across many operations (a rich domain model may serve better as the primary organizing principle)
- The team is inexperienced with managing coupling — the freedom to implement each slice differently can lead to inconsistency without shared judgment
- The application is trivially small (a handful of CRUD endpoints) and the overhead of per-feature organization adds no value

**The false dichotomy:** VSA and Clean Architecture are not opposites. Clean Architecture governs the *direction of dependencies*; VSA governs the *axis of organization*. They are orthogonal. Apply dependency inversion within a slice when warranted — stop mandating it everywhere by default.

---

## Defining Slice Granularity

Two valid schools exist:

**Slice = individual request.** Each command or query is one slice. Maximum isolation. Slices are trivially rewritable — ideally a day of work at most. The risk is a flat sea of hundreds of tiny folders in a large system.

**Slice = business module containing handlers.** Group related use cases (e.g., `CreateOrder`, `ShipOrder`, `CancelOrder`) under a single `Orders` module. Handlers within the module are still independent, but the module boundary provides navigability.

**In practice, use both.** Individual handlers are slices; business-capability folders are modules. The module is the navigational unit; the slice is the unit of change.

### Heuristics for Right-Sizing

- **If a slice requires writes to more than one aggregate**, it may be too coarse. Split along aggregate boundaries.
- **If two slices always change together in response to the same requirement**, they may belong in the same slice — or they share a domain concept that should be extracted.
- **If a handler exceeds ~200 lines**, the use case is likely doing too much. Push logic into domain objects or split into finer-grained slices.
- **Apply the verb-noun test.** If you cannot name the slice with a clear verb-noun pair (`BookAppointment`, `GetInvoice`, `CancelReservation`), the boundary is probably wrong.
- **Align modules with bounded contexts.** At the macro level, modules should correspond to business subdomains. Enforce that modules communicate only through public APIs or events.

---

## Folder Structure Strategies

### Option A: Single File Per Feature (Start Here)

Each use case is one file containing its request/response models, validation, handler, and endpoint registration. Group related files under a business-capability folder.

```
src/
├── Scheduling/
│   ├── BookAppointment.cs     # request + handler + endpoint
│   ├── CancelAppointment.cs
│   ├── GetAppointments.cs
│   └── Shared/
│       └── AppointmentValidator.cs
├── Billing/
│   ├── ChargePatient.cs
│   └── GetInvoice.cs
└── Domain/
    ├── Appointment.cs
    └── Invoice.cs
```

**Trade-off:** Maximum co-location and low ceremony. Files grow unwieldy only if the use case itself is complex — at which point extract classes within the same feature folder.

### Option B: Feature Folders with Internal Structure

Each use case gets its own folder when it needs multiple collaborating files (handler, validator, mapper, response model).

```
src/
├── Orders/
│   ├── CreateOrder/
│   │   ├── CreateOrderEndpoint.cs
│   │   ├── CreateOrderHandler.cs
│   │   ├── CreateOrderValidator.cs
│   │   └── CreateOrderResponse.cs
│   ├── CancelOrder/
│   │   └── ...
│   └── Shared/
│       └── OrderPricingService.cs
```

**Trade-off:** More files, but each file is small and single-purpose. Works well at scale.

### Option C: Module → Slice Nesting

For larger systems, introduce a module boundary above slices. Each module represents a bounded context or business domain, and slices live within it.

```
src/
├── Modules/
│   ├── Reservations/
│   │   ├── ReserveRoom/
│   │   ├── ConfirmReservation/
│   │   ├── CancelReservation/
│   │   └── Shared/
│   └── Payments/
│       ├── ProcessPayment/
│       └── RefundPayment/
└── SharedKernel/
    ├── Result.cs
    └── DomainEvent.cs
```

**Trade-off:** Strongest boundary enforcement. Aligns with modular monolith patterns. Adds one level of indirection.

### The Screaming Architecture Test

Periodically check: can a new team member look at the top-level folder tree and understand *what the system does*? If they see `Controllers/`, `Services/`, `Repositories/`, the structure screams about technology. If they see `Scheduling/`, `Billing/`, `Reservations/`, it screams about business capabilities. Aim for the latter.

---

## Full-Stack Slice Co-location

VSA's co-location principle does not stop at the API layer. If the goal is to minimize coupling between features, the frontend should mirror the same slice boundaries.

**When frontend and backend share a language** (e.g., TypeScript across Next.js and Node, or Kotlin across Android and Spring), place frontend components directly within the corresponding slice package. A `BookAppointment` slice can contain its handler, endpoint, *and* its form component.

**When they don't share a language**, maintain parallel folder structures. The backend `Modules/Reservations/` maps to the frontend `features/reservations/`. A change to the reservation capability should touch files in the same conceptual location on both sides.

```
frontend/
├── features/
│   ├── reservations/
│   │   ├── ReserveRoomForm.tsx
│   │   ├── ReservationList.tsx
│   │   ├── useReservations.ts    # data fetching hook
│   │   └── types.ts
│   └── billing/
│       └── ...
└── shared/
    ├── ui/                       # design system components
    └── hooks/                    # generic utilities
```

On the frontend, **Feature-Sliced Design (FSD)** is the most mature methodology that mirrors VSA's principles — organizing code by business capability with explicit layer rules and public API boundaries per feature.

Differences in frontend tooling and framework conventions (e.g., Next.js App Router imposing its own folder structure) often make perfect mirroring impractical. The principle matters more than the exact layout — what changes together should live together.

---

## Aggregate Boundaries vs. Slice Boundaries

Multiple slices often write to the same aggregate (`CreateOrder`, `ShipOrder`, `CancelOrder` all target the `Order` aggregate root). The aggregate becomes a hidden coupling point that can undermine slice independence.

### Design Heuristics

- **Prefer small aggregates.** Vaughn Vernon's rule: make aggregates as small as possible while still protecting invariants. Fewer slices contending over a shared aggregate means less coupling.
- **Each slice should load and modify at most one aggregate.** If a slice needs to coordinate writes across multiple aggregates, that is either a sign the aggregate boundaries are wrong, or the operation requires a saga/process manager.
- **Use separate read models for queries.** Query slices should never load an aggregate. They read from projections or directly from the database. Only command slices interact with aggregates.
- **Split aggregates when slices diverge.** If `CreateOrder` and `FulfillOrder` have no shared invariants, they may not belong on the same aggregate. Consider splitting into `Order` (for placement) and `Fulfillment` (for shipping), linked by an order ID rather than a shared object graph.
- **Accept that aggregates are shared — manage the coupling explicitly.** The aggregate lives in the domain layer, shared by multiple slices. This is deliberate sharing through the domain model (Tier 2 sharing), not accidental coupling. The aggregate's public API is the contract between slices.

### Concurrency at the Aggregate Boundary

When multiple slices write to the same aggregate concurrently, use **optimistic concurrency control**: each aggregate carries a version number, and writes fail if the version has changed since the aggregate was loaded. The failed operation retries with fresh state. This is the standard approach across ORMs, document stores, and event stores (where the stream's expected version serves the same purpose). Pessimistic locking is rarely needed and introduces deadlock risk.
