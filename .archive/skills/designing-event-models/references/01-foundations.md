# The Comprehensive Guide to Event Modeling

A primer, reference, playbook, and tutorial for designing information systems using Event Modeling.

---

## Table of Contents

1. [What is Event Modeling?](#1-what-is-event-modeling)
2. [Origins and Philosophy](#2-origins-and-philosophy)
3. [The Building Blocks](#3-the-building-blocks)
13. [Relationship to DDD, CQRS, and Event Sourcing](#13-relationship-to-ddd-cqrs-and-event-sourcing)
14. [Tooling](#14-tooling)
15. [When to Use Event Modeling](#15-when-to-use-event-modeling)
16. [Further Resources](#16-further-resources)

---

## 1. What is Event Modeling?

Event Modeling is a method of describing information systems using examples of how information changes within them over time. It produces a single visual artifact -- the **event model** -- that serves as a blueprint for an entire system: its requirements, its design, its documentation, and its test specification, all in one place.

Think of it as a storyboard. Just as a film storyboard shows scene-by-scene what happens in a movie, an event model shows step-by-step how data flows through a system, from left to right along a timeline. You can read "what happens in this system" like a story.

The methodology uses **3 building blocks**, arranged into **4 patterns**, based on **2 fundamental ideas**:

1. State (information stored in the system) is the result of events that have occurred.
2. Every interaction with a system either changes state or views state.

It takes a few minutes to explain. The rest of the learning is done in practice.

### What Makes It Different

- **Visual and concrete.** No abstract boxes-and-arrows diagrams. Every element on the board is tied to real example data.
- **Technology-agnostic.** An event model describes *what* a system does, not *how* it is implemented. It works whether you're building a monolith, microservices, or legacy CRUD.
- **Universally readable.** Business stakeholders, developers, testers, and UX designers all read the same artifact and understand it immediately.
- **Specification, not just documentation.** The model contains precise behavioral descriptions (Given/When/Then scenarios) that translate directly into executable tests.

### The Core Insight

> "It's the developers' understanding, not your business knowledge, that becomes software."
> -- Alberto Brandolini

Event Modeling attacks this problem head-on. Instead of relying on written requirements that require subjective interpretation, it provides a visual language where ambiguity is structurally impossible -- every piece of data on every screen is traced back to the event that produced it.

---

## 2. Origins and Philosophy

Event Modeling was created by **Adam Dymitruk**, founder of Adaptech Group. It synthesizes ideas from several established practices:

| Influence | What It Contributed |
|---|---|
| **Event Sourcing** (Greg Young) | The idea of recording state changes as immutable events on a timeline |
| **Event Storming** (Alberto Brandolini) | Collaborative sticky-note workshops for domain discovery |
| **Domain-Driven Design** (Eric Evans) | Ubiquitous language, bounded contexts, aggregates |
| **Specification by Example** (Gojko Adzic) | Concrete examples as the basis for specifications and tests |
| **UX/UI storyboarding** | Screen mockups to ground abstract data flows in user experience |

Dymitruk's key realization was that long-running process specifications (from CQRS/ES systems), when laid out on a timeline with wireframes and example data, became immediately understandable to non-technical stakeholders. What had been an engineering artifact became a universal communication tool.

### Design Principles

1. **Simplicity over completeness.** Event Modeling uses the fewest possible concepts. If you can't explain it in minutes, it's too complicated.
2. **Examples over abstractions.** Real sample data on every element. Never a generic "User" -- always "Jane Doe, jane@example.com."
3. **Data flow over control flow.** Focus on what information exists and how it transforms, not on branching logic or conditional execution.
4. **Model-first development.** The event model is the single source of truth. Code is derived from the model, not the other way around.
5. **Defer decisions.** The model captures *what* the system does without committing to *how*. Technology choices can be made later, with more knowledge.

---

## 3. The Building Blocks

Event Modeling uses exactly three types of elements, plus wireframes/screen mockups. Each is represented by a distinctly colored sticky note.

### Events (Orange)

```
┌─────────────────────┐
│   Item Added        │  ← orange sticky note
│                     │
│  itemId: "abc-123"  │
│  name: "Latte"      │
│  price: 4.50        │
└─────────────────────┘
```

An **event** is a fact that has occurred in the system. Events are:

- **Written in past tense.** "Item Added," not "Add Item." The thing already happened.
- **Immutable.** You cannot change the past. Once recorded, an event is permanent.
- **The system's memory.** Events are what remain when the system is powered off and on again. They are the source of truth.

Events are not a technical concept tied to a specific architecture. They represent that *data has been persisted* -- whether that's in an event store, a relational table, or a flat file.

**Key rule:** If there is no event, it didn't happen. Every meaningful state change in the system must be recorded as an event.

### Commands (Blue)

```
┌─────────────────────┐
│   Add Item          │  ← blue sticky note
│                     │
│  itemId: "abc-123"  │
│  name: "Latte"      │
│  price: 4.50        │
└─────────────────────┘
```

A **command** is an instruction to the system to carry out an action. Commands:

- **Are written in imperative form.** "Add Item," "Submit Cart," "Register Customer."
- **Describe intent.** They express what *should* happen, not what *has* happened.
- **Can be rejected.** Unlike events (which are facts), commands can fail if business rules are violated.
- **Must provide all data** necessary to produce the resulting event(s).

The relationship is: **Commands describe what should happen; events describe what actually happened.**

### Read Models / Views (Green)

```
┌─────────────────────┐
│   Cart Items        │  ← green sticky note
│                     │
│  items: [...]       │
│  totalPrice: 13.50  │
│  itemCount: 3       │
└─────────────────────┘
```

A **read model** (also called a view or query) represents structured data that is read from the system. Read models:

- **Are derived from events.** They can only contain data that has been previously stored via events.
- **Are purpose-built.** Each read model is tailored to a specific use case (a screen, a report, an API response).
- **Can take many forms.** A database table, a search index, a CSV export, a JSON API response -- the implementation doesn't matter at the modeling stage.

**Key rule:** A read model must never contain data that cannot be traced back to an existing event. This is the foundation of the Information Completeness Check.

### Screen Mockups / Wireframes (White)

```
┌──────────────────────────────────────┐
│  Shopping Cart                       │
│  ┌──────┬──────────┬───────┬──────┐  │
│  │ Image│ Name     │ Price │      │  │
│  ├──────┼──────────┼───────┼──────┤  │
│  │ ☕   │ Latte    │ $4.50 │  [x] │  │
│  │ ☕   │ Espresso │ $3.00 │  [x] │  │
│  └──────┴──────────┴───────┴──────┘  │
│                                      │
│  Total: $7.50      [Submit Order]    │
└──────────────────────────────────────┘
```

**Screen mockups** are rough UI sketches placed at the top of the event model. They are:

- **Low-fidelity on purpose.** Stick figures and boxes, not pixel-perfect designs. The point is data flow, not aesthetics.
- **Data-driven.** Each field on a screen must map to a read model (for display) or a command (for user input).
- **Essential, not optional.** Screens eliminate ambiguity. Two people arguing about an abstract concept will immediately agree (or discover their disagreement) when they see a screen.

A common objection: "Should we really design screens this early?" **Yes.** The level of detail is minimal. The focus is not on how the screens look but on what data they show and what actions they enable.

### External Events (Yellow)

```
┌─────────────────────────┐
│   Inventory Changed     │  ← yellow sticky note
│                         │
│  productId: "abc-123"   │
│  inventory: 42          │
└─────────────────────────┘
```

**External events** represent data that comes from outside the system boundary. This can be an API call, a Kafka message, a CSV file import, or a webhook. They are visually distinguished from internal events (often yellow instead of orange) to make system boundaries explicit.

---

