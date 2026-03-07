## Table of Contents

1. [Specification by Example: Given/When/Thens](#6-specification-by-example-givenwhenthens)
2. [Slices: The Unit of Work](#7-slices-the-unit-of-work)
3. [How to Run an Event Modeling Workshop](#8-how-to-run-an-event-modeling-workshop)

---

## 6. Specification by Example: Given/When/Thens

Event Modeling uses **Given/When/Then** (GWT) scenarios from Behavior-Driven Development to capture business rules precisely. These are not prose requirements -- they are concrete, example-driven specifications that translate directly into automated tests.

### Structure

**For State Changes (commands that produce events):**

```
GIVEN:  [a set of events that establish the system's current state]
WHEN:   [a command is executed]
THEN:   [the expected event(s) produced, OR an error]
```

**For State Views (read models that display data):**

```
GIVEN:  [a set of events]
THEN:   [the expected contents of the read model]
```

(No "When" -- there is no command. The read model is a passive projection of events.)

### Examples

**Happy path -- adding an item:**

```
GIVEN:  (empty cart)
WHEN:   Add Item {itemId: "abc", name: "Latte", price: 4.50}
THEN:   Item Added {itemId: "abc", name: "Latte", price: 4.50}
```

**Business rule -- maximum 3 items:**

```
GIVEN:  Item Added {itemId: "a", ...}
        Item Added {itemId: "b", ...}
        Item Added {itemId: "c", ...}
WHEN:   Add Item {itemId: "d", ...}
THEN:   ERROR: "Maximum 3 items per cart"
```

**Read model -- cart contents after add and remove:**

```
GIVEN:  Item Added {itemId: "a", name: "Latte", price: 4.50}
        Item Added {itemId: "b", name: "Espresso", price: 3.00}
        Item Removed {itemId: "a"}
THEN:   Cart Items = [{itemId: "b", name: "Espresso", price: 3.00}]
        totalPrice = 3.00
```

### Placement in the Event Model

GWT scenarios are placed **vertically below the slice they belong to**. This way, the model can still be read left-to-right for the high-level story, and you can "zoom in" vertically on any slice to see its detailed business rules.

```
  ──────── timeline (left to right) ────────▶

  [Screen] → [Command] → [Event]     ← the slice
         │
         ▼
  ┌─────────────────────────────┐
  │ GWT Scenario 1 (happy path)│     ← detail below
  ├─────────────────────────────┤
  │ GWT Scenario 2 (edge case) │
  ├─────────────────────────────┤
  │ GWT Scenario 3 (error case)│
  └─────────────────────────────┘
```

### Best Practices for GWTs

| Do | Don't |
|---|---|
| Use concrete example data ("Jane", "$4.50") | Use abstract placeholders ("a user", "some amount") |
| Define both happy and error paths | Only model the happy path |
| Write them collaboratively with business stakeholders | Let developers write them alone |
| Keep each GWT tied to exactly one slice | Write GWTs that span multiple slices |
| Aim for 3-10 GWTs per slice for complex rules | Skip GWTs for "obvious" slices (they're never as obvious as you think) |
| Include the GWT name/description as a title | Leave GWTs unnamed |

### From GWT to Test

GWTs translate almost mechanically into unit tests:

```kotlin
@Test
fun `adding a 4th item should fail`() {
    // GIVEN
    given(
        ItemAdded(itemId = "a", name = "Latte", price = 4.50),
        ItemAdded(itemId = "b", name = "Mocha", price = 5.00),
        ItemAdded(itemId = "c", name = "Espresso", price = 3.00),
    )
    // WHEN / THEN
    whenCommand(AddItem(itemId = "d", name = "Drip", price = 2.50))
        .expectException("Maximum 3 items per cart")
}
```

This direct mapping from model to test is one of Event Modeling's most powerful features. Some teams even generate test scaffolding directly from the event model.

---

## 7. Slices: The Unit of Work

A **slice** is the smallest unit of functionality in an event model. Each application of one of the four patterns produces one slice.

### What Is a Slice?

A slice is a complete, self-contained loop of behavior:

- A **State Change slice** = Screen → Command → Event (+ GWTs)
- A **State View slice** = Event(s) → Read Model → Screen (+ GTs)
- An **Automation slice** = Event → Read Model → Processor → Command → Event (+ GWTs)
- A **Translation slice** = External Event → Translator → Command → Event (+ GWTs)

### Why Slices Matter

**For estimation:** Each slice is roughly the same size. After implementing a handful, you can reliably estimate how long each new slice will take. This is the foundation of the constant cost curve (Section 9).

**For planning:** Slices are the atoms of your backlog. Each slice is an independent work item that can be assigned, implemented, tested, and deployed independently.

**For testing:** Each slice has its own set of GWT scenarios. Tests are scoped to a single slice and don't depend on the implementation of other slices.

**For onboarding:** A new developer can pick up any slice, read its GWTs, implement it, and ship it -- without needing to understand the entire system.

### Slice Independence

A critical property: **slices that share an event schema are independent.** The event schema is the shared contract between slices.

- A State Change slice produces events. Its tests assert on the events produced.
- A State View slice consumes events. Its tests use synthetic event fixtures.
- Neither slice needs the other to be implemented first.

This means slices can be built in any order, by any developer, without coordination overhead. No artificial dependency chains.

### Naming Slices

Give every slice a clear name that reflects the business action or view:

```
State Changes:          State Views:           Automations:
- "Add Item"            - "Cart Items"         - "Publish Cart"
- "Remove Item"         - "Order History"      - "Send Welcome Email"
- "Submit Cart"         - "Inventory Status"   - "Expire Todos"
- "Register Customer"   - "Customer Profile"   - "Fraud Check"
```

### Slices and Vertical Slice Architecture

In implementation, each slice typically maps to a self-contained code package containing everything it needs: command handler (or projector), business logic, tests, and any DTOs. This is the **Vertical Slice Architecture** pattern. Coupling is maximized within a slice and minimized between slices.

---

## 8. How to Run an Event Modeling Workshop

This section provides a step-by-step guide for facilitating an Event Modeling session, from preparation through to a complete model.

### Preparation

**Participants:**
- 4-15 people for brainstorming (more is better for discovery)
- 4-6 people for detailed modeling (smaller is better for depth)
- Must include at least one domain expert and at least one developer
- Product owners, UX designers, and testers are valuable additions

**Materials:**
- A large whiteboard or digital collaboration tool (Miro, Qlerify)
- Sticky notes in four colors: orange (events), blue (commands), green (read models), yellow (external events)
- White paper/cards for screen mockups
- Markers, coffee, water

**Time:** Plan for 2-4 hours for the initial brainstorming session. Detailed modeling sessions are typically 1-2 hours each, spread across multiple days.

### Step 1: Brainstorming Events (20-40 minutes)

**Goal:** Discover the facts of the system.

**Instruction to participants:**
> "Write down what could have happened in the system. Assume it already happened. Use past tense. One fact per sticky note."

**Facilitation tips:**
- Start by placing 2-3 example events yourself to set the tone: "Customer Registered," "Order Placed," "Payment Received."
- Encourage quantity over quality. Duplicates are fine. Chaos is expected.
- Don't debate or filter during this phase -- just collect.
- After ~20 minutes, most people are engaged and generating freely.
- Expect 30-100+ events for a moderately complex system.

**Example output:**
```
Item Added    |  Cart Submitted  |  Payment Failed  |  Order Confirmed
Item Removed  |  Voucher Applied |  Inventory Changed | Customer Registered
Cart Cleared  |  Price Changed   |  Email Sent       | Address Validated
```

### Step 2: Ordering the Timeline (20-30 minutes)

**Goal:** Arrange events into a chronological story.

**Process:**
1. Collectively arrange events from left to right in the order they would occur.
2. Remove obvious duplicates (keep the one with better wording).
3. Ask someone to read the story aloud from left to right.
4. Fill in gaps: "What must have happened between X and Y?"

**The story should make sense to everyone.** If a business stakeholder says "wait, that doesn't happen in that order," you've found valuable information.

**Tip:** This is a good point to end the first session. Let participants sleep on it. The brain is good at remembering stories, and people often come back with corrections and additions.

### Step 3: Adding Screen Mockups (30-60 minutes)

**Goal:** Ground the abstract events in concrete user interactions.

**Process:**
1. For each major event, sketch the screen that would trigger it or display its result.
2. Place screens at the top of the model, above the timeline.
3. Mark the data elements on each screen (fields, buttons, lists).
4. Use real example data, not placeholders.

**Facilitation tip:** People often resist this step ("it's too early for UI"). Push through. The mockups don't need to be pretty -- stick figures and boxes are fine. The goal is to surface data requirements and eliminate ambiguity.

### Step 4: Adding Commands and Read Models (30-60 minutes)

**Goal:** Complete the four-pattern structure.

**For each event, ask:**
> "What command must have been processed for this event to exist?"

This produces the blue command sticky notes.

**For each screen, ask:**
> "What data does this screen need, and which events provide that data?"

This produces the green read model sticky notes.

**Apply the Information Completeness Check** as you go. For every attribute on a read model, trace it back to a source event. For every attribute on a command, trace it forward to the resulting event.

### Step 5: Defining Swimlanes (15-30 minutes)

**Goal:** Group events into logical streams.

Draw horizontal swimlanes to separate different business capabilities or bounded contexts. All events in a swimlane form a cohesive narrative.

```
Cart swimlane:      Item Added → Item Removed → Cart Submitted
Inventory swimlane: Inventory Changed → Inventory Updated
Payment swimlane:   Payment Initiated → Payment Confirmed
```

**Validation trick:** Hide all swimlanes except one. Read the events left-to-right to a business person. Do they form a coherent story? If not, the boundaries are wrong.

### Step 6: Specification by Example (ongoing)

**Goal:** Capture business rules as GWT scenarios.

For each slice, define:
- The happy path GWT
- Edge cases and error conditions
- Business rule validations

This step often happens iteratively across multiple sessions. Don't try to capture every rule in one sitting. Rules emerge naturally during detailed discussions.

### Step 7: Identifying External Systems (15-30 minutes)

**Goal:** Map integrations.

For each event involving data from outside, add:
- Yellow sticky notes for external events
- Translation or automation patterns for data ingestion/export
- Note dependencies on external teams

**Tip from practitioners:** Identifying external system dependencies early surfaces cross-team coordination needs that would otherwise be discovered much later.

### Workshop Cadence for Real Projects

| Session | Duration | Participants | Focus |
|---|---|---|---|
| **Kickoff brainstorm** | 2-4 hours | 8-15 people | Steps 1-2: events and timeline |
| **Detailed modeling** (×3-5) | 1-2 hours each | 4-6 people | Steps 3-6: screens, commands, read models, GWTs |
| **Integration review** | 1-2 hours | 4-6 people | Step 7: external systems and boundaries |
| **Ongoing refinement** | 30-60 min per session | 2-4 people | New features, changed requirements |

**Total effort for initial model:** Typically 2-5 days of workshop time for a moderately complex system. This investment pays for itself many times over in avoided miscommunication, rework, and false assumptions.

---

