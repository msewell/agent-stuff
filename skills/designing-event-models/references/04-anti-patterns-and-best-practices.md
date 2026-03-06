## Table of Contents

1. [The Constant Cost Curve](#9-the-constant-cost-curve)
2. [Event Modeling vs. Event Storming](#10-event-modeling-vs-event-storming)
3. [Anti-Patterns](#11-anti-patterns)
4. [Best Practices Playbook](#12-best-practices-playbook)

---

## 9. The Constant Cost Curve

One of Event Modeling's most profound implications is the **constant cost curve**: the cost of implementing each feature (slice) remains roughly constant regardless of when in the project it is built.

### Why Traditional Projects Have Rising Costs

In traditional development, the cost of adding features increases over time:

```
Cost per feature
     ▲
     │            ╱
     │          ╱
     │        ╱
     │      ╱
     │    ╱
     │  ╱
     │╱
     └──────────────▶ Time
     Traditional development
```

This happens because each new feature touches existing code, introduces coupling, and requires understanding an ever-growing codebase. Moving features around in the schedule changes the cost because the order of implementation matters.

### Why Event Modeling Enables Constant Cost

With Event Modeling and properly isolated slices:

```
Cost per feature
     ▲
     │
     │  ─────────────────
     │
     │
     │
     └──────────────────▶ Time
     Event Modeling + slices
```

This works because:

1. **Slices are independent.** Implementing slice A does not require changes to slice B, and vice versa.
2. **The event schema is the contract.** Slices communicate through events, not through shared code.
3. **No feature ordering dependency.** Features can be implemented in any order without affecting cost.
4. **Reprioritization is free.** Moving a feature from sprint 3 to sprint 7 doesn't change its cost.

### Implications for Project Management

- **Reliable velocity.** After implementing 5-10 slices, you have a statistically meaningful velocity that holds for the rest of the project.
- **Fixed-cost projects.** Because each slice costs roughly the same, you can multiply slice count by average slice cost to get a reliable total.
- **Agile reprioritization.** The business can reorder the backlog at any time without invalidating estimates.
- **No estimates debate.** You measure velocity empirically from actual slices delivered, not from subjective estimation sessions.

### Prerequisites for Constant Cost

The constant cost curve is not automatic. It requires:

1. A well-defined event model where slices are truly independent.
2. Disciplined slice isolation in the implementation (vertical slice architecture).
3. Event schemas as the only coupling point between slices.
4. Tests defined at slice boundaries (GWTs), not coupled to implementation internals.

---

## 10. Event Modeling vs. Event Storming

Event Modeling and Event Storming are complementary but distinct methodologies. They are frequently confused because they share terminology (events, sticky notes) and can be used together.

### Comparison

| Aspect | Event Storming | Event Modeling |
|---|---|---|
| **Created by** | Alberto Brandolini (2012) | Adam Dymitruk (~2018) |
| **Purpose** | Explore and discover the problem space | Design a blueprint for the solution |
| **Output** | Domain events, hotspots, bounded contexts | Complete system blueprint with data flows |
| **Nature** | Exploratory brainstorming | Structured specification |
| **Participants** | Large groups (up to 25-30) | Smaller focused groups (4-8) |
| **Duration** | Typically a one-off workshop (hours to 1-2 days) | Ongoing, iterative sessions |
| **Screens/UI** | Not part of the core method | Central element |
| **Commands** | Discovered during the session | Explicitly modeled with data attributes |
| **Read Models** | Not part of the core method | Explicitly modeled with data attributes |
| **Data flow** | Implicit | Explicit and verified (completeness check) |
| **Testing** | Not addressed | GWT scenarios are built into the model |
| **Implementation** | Gap between model and code | Direct translation to code and tests |
| **Best for** | Understanding a domain you don't know well | Designing a system you're about to build |
| **Maturity of domain knowledge** | Low (discovery phase) | Moderate to high (design phase) |

### How They Work Together

A powerful workflow is:

1. **Event Storming** first: explore the domain, discover events, find hotspots, identify bounded contexts.
2. **Event Modeling** next: take the discovered events and formalize them into a structured blueprint with screens, commands, read models, GWTs, and data flows.

Event Storming is the brainstorming tool. Event Modeling is the engineering tool.

### When to Use Which

**Use Event Storming when:**
- You're entering an unfamiliar domain
- You need to discover what the system *should* do
- You want to involve a large number of stakeholders for broad discovery
- You're looking for "hotspots" (areas of contention or complexity)

**Use Event Modeling when:**
- You know roughly what the system should do and need to design *how*
- You need a specification that developers can implement from
- You want testable behavioral descriptions
- You need reliable estimation and planning

**Use both when:**
- Starting a greenfield project in an unfamiliar domain
- Modernizing a legacy system (storming to understand, modeling to redesign)

---

## 11. Anti-Patterns

These are diagnostic signals that something has gone wrong in your event model. Recognizing them early saves significant rework.

### "The Bed" -- Horizontal Over-Orchestration

**Symptom:** A single UI component fires multiple commands in sequence, stretching the slice flat and wide along the timeline.

**Problem:** Too much orchestration from the front end. The UI is trying to manage a multi-step process instead of letting the system's natural event flow handle sequencing.

**Fix:** Break the sequence into separate slices. Let events trigger subsequent steps via automations. Each slice should represent one decision, one action.

### "The God Slice"

**Symptom:** One slice has dozens of GWT scenarios and contains all the interesting business logic. Every other slice is anemic -- just shuffling data around.

**Problem:** This is a god-object in visual form. All intelligence is concentrated in one place, making it fragile, hard to test, and impossible to parallelize development.

**Fix:** Decompose the god slice into smaller, focused slices. Each slice should enforce a small, cohesive set of business rules. If a slice has more than 10 GWTs, it's probably doing too much.

### Missing the Information Completeness Check

**Symptom:** Read models contain data attributes that can't be traced to any event. Screens show information whose origin is hand-waved as "oh, we'll figure that out later."

**Problem:** This is the #1 source of implementation surprises. Data gaps discovered during coding cause delays, rework, and scope creep.

**Fix:** Enforce the check rigorously. For every attribute on every read model, draw the arrow back to its source event. No exceptions. No "we'll figure it out later."

### Modeling Logic Instead of State

**Symptom:** The event model contains branching paths, if/else decision diamonds, or flowchart-style control flow.

**Problem:** Event Modeling focuses on *state* (what data exists) not *logic* (how decisions are made). Control flow belongs in the code, not on the board.

**Fix:** Replace branching with separate slices for each outcome. Model the different paths as different scenarios (GWTs) under the same slice. The model shows what data exists at each step, not the algorithmic path taken to get there.

### Premature Technical Detail

**Symptom:** The event model contains references to specific technologies: "REST endpoint," "Kafka topic," "PostgreSQL table," "Redis cache."

**Problem:** The model should describe *what* the system does, not *how* it does it. Mixing in technology details creates false constraints and distracts from the data flow.

**Fix:** Remove all technology references. A read model is "Cart Items," not "cart_items table in PostgreSQL." An external event is "Inventory Changed," not "Kafka record from inventory-topic."

### Skipping Screens

**Symptom:** The model has commands, events, and read models but no wireframes.

**Problem:** Without screens, discussions remain abstract. Two people will interpret "Customer Profile" differently until they see a concrete mockup.

**Fix:** Add screens, even rough ones. Boxes, labels, and arrows are sufficient. The point is not aesthetics but forcing explicit decisions about what data is shown and how users interact with it.

### Event Naming in Present Tense

**Symptom:** Events named "Add Item," "Submit Cart," "Process Payment."

**Problem:** These are commands, not events. Events are facts about the past. Present-tense naming blurs the line between intent and fact.

**Fix:** Always use past tense: "Item Added," "Cart Submitted," "Payment Processed."

---

## 12. Best Practices Playbook

### Starting a New Project

1. **Start with brainstorming**, not architecture. Gather all stakeholders. Discover events. Build the timeline.
2. **Model breadth first, depth second.** Get the full story end-to-end before diving deep into any one area.
3. **Spend 60-70% of initial effort on the model.** Every minute spent refining the model saves costly development time later.
4. **Defer technology decisions.** The event model doesn't need to know about databases, frameworks, or deployment topology.
5. **Work with examples.** Never model in the abstract. Always use concrete data: "Jane Doe," "$4.50," "order-789."

### During Modeling Sessions

6. **One decision, one event, one slice.** Trust the simplicity. Go one step at a time.
7. **Ask backwards.** "What command must have been processed for this event to exist?" "What event delivers the data for this read model?" Backwards thinking focuses on outcomes.
8. **Don't save on GWTs.** They are the real treasury of the event model. More scenarios = fewer assumptions = fewer bugs.
9. **Copy elements to improve readability.** If a read model or event is reused, duplicate it on the board rather than drawing long arrows. Use linking indicators to show they're the same element.
10. **Mark screen elements in color** to show exactly which data is being discussed at any moment.

### During Implementation

11. **Implement slices independently.** Each slice is a standalone work item. No dependencies between slices in the backlog.
12. **Translate GWTs directly into tests.** The mapping is mechanical. Given = setup events. When = execute command. Then = assert result.
13. **Always start with the model.** When a change is needed, update the event model first, then update the code. Model-first development keeps the model as the source of truth.
14. **Keep slices to about one day of work.** If a slice takes longer, it's probably too big. Decompose it.
15. **Favor rewriting a slice over refactoring it.** Slices are small enough that rewriting from scratch is often faster and safer than complex refactoring.

### Team Dynamics

16. **Involve business stakeholders in GWT definition.** They know the rules. Developers know the technology. GWTs are the meeting point.
17. **Use the event model for onboarding.** New team members can read the model to understand the entire system without reading code or stale documentation.
18. **Eliminate stand-ups for status.** The event model contains independent units of work (slices). Progress is visible by which slices are implemented and passing their GWTs.
19. **No merge conflicts.** When slices are truly independent, developers don't work in the same files. Merge conflicts become rare to nonexistent.

### Modeling Existing Systems

20. **You can model any system with Event Modeling**, regardless of its architecture. The system doesn't need to be event-driven or event-sourced. "Event" in the model just means "data was persisted."
21. **Model the system as it is first**, then model the system as it should be. Don't try to redesign and document at the same time.
22. **Use the model for faster onboarding.** An event model of an existing system replaces hundreds of pages of stale Confluence documentation.

### Common Pitfalls to Avoid

23. **Don't start with technology.** No UML, no database schemas, no REST API design before the event model is complete.
24. **Don't model control flow.** The event model shows data states, not algorithmic logic.
25. **Don't skip the Information Completeness Check.** It's the most valuable quality gate in the process.
26. **Don't let developers model alone.** The value of Event Modeling comes from collaboration. A model built by developers alone will miss business context.
27. **Don't aim for perfection.** The model will evolve. Start with something good enough and iterate. You will get things wrong -- that's expected and acceptable.

---

