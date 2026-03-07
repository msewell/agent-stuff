## Table of Contents

1. [The Four Patterns](#4-the-four-patterns)
2. [The Information Completeness Check](#5-the-information-completeness-check)

---

## 4. The Four Patterns

Every information system, no matter how complex, can be described using exactly four patterns. These patterns are like LEGO bricks: simple individually, but capable of building arbitrarily complex structures when combined.

### Pattern 1: State Change

The only way to modify information in the system.

```
  ┌──────────┐     ┌──────────┐     ┌──────────────┐
  │  Screen  │────▶│ Command  │────▶│    Event     │
  │  (white) │     │  (blue)  │     │   (orange)   │
  └──────────┘     └──────────┘     └──────────────┘

  User clicks   ──▶  Add Item   ──▶  Item Added
  "Add to Cart"     {name, price}    {name, price, ts}
```

**How it works:**
1. A user interacts with a screen (clicks a button, submits a form).
2. This triggers a command with the necessary input data.
3. The system validates the command against business rules.
4. If valid, the system records an event -- a permanent fact.

**What it captures:** "How does data enter the system?"

**Example:**

| Element | Value |
|---|---|
| Screen | "Register" form with name, email, password fields |
| Command | `Register Customer` {name: "Jane", email: "jane@co.com"} |
| Event | `Customer Registered` {customerId: "c-42", name: "Jane", email: "jane@co.com", registeredAt: "2024-07-01"} |

### Pattern 2: State View

The only way to read information from the system.

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────┐
  │    Event     │────▶│  Read Model  │────▶│  Screen  │
  │   (orange)   │     │   (green)    │     │  (white) │
  └──────────────┘     └──────────────┘     └──────────┘

  Item Added     ──▶   Cart Items     ──▶  Shopping Cart
  {name, price}       {items[], total}      page
```

**How it works:**
1. Previously stored events feed into a read model.
2. The read model aggregates/transforms the event data into a purpose-built view.
3. A screen (or another process) consumes the read model to display information.

**What it captures:** "How does the system present information?"

**Key insight:** The read model can only show data that comes from existing events. If a screen needs to display an email address, there must be an event somewhere upstream that contains that email address. This is enforced by the Information Completeness Check.

### Pattern 3: Automation

A background process triggered by events, not by direct user interaction.

```
  ┌──────────────┐     ┌──────────────┐     ┌──┐     ┌──────────┐     ┌──────────────┐
  │    Event     │────▶│  Read Model  │────▶│⚙️│────▶│ Command  │────▶│    Event     │
  │   (orange)   │     │   (green)    │     └──┘     │  (blue)  │     │   (orange)   │
  └──────────────┘     └──────────────┘   Processor   └──────────┘     └──────────────┘

  Cart Submitted ──▶  Submitted Cart  ──▶  ⚙️  ──▶ Publish Cart ──▶ Cart Published
                        Data                          {items, total}
```

**How it works:**
1. An event occurs in the system (e.g., "Cart Submitted").
2. A read model provides the data needed for the automation.
3. A processor (the gear symbol ⚙️) runs in the background, reads the data, and decides what to do.
4. The processor issues a command, which produces a new event.

**What it captures:** "What happens automatically without user intervention?"

An automation is structurally just a State View followed by a State Change, connected by an automated processor instead of a human user. Common examples:
- Sending a confirmation email after registration
- Publishing events to an external system
- Expiring items after a timeout
- Triggering fraud checks after a payment

### Pattern 4: Translation

Receiving and incorporating data from an external system.

```
  ┌──────────────┐     ┌──┐     ┌──────────┐     ┌──────────────┐
  │  External    │────▶│⚙️│────▶│ Command  │────▶│    Event     │
  │   Event      │     └──┘     │  (blue)  │     │   (orange)   │
  │  (yellow)    │   Translator  └──────────┘     └──────────────┘
  └──────────────┘

  Inventory Changed ──▶ ⚙️ ──▶ Update Inventory ──▶ Inventory Updated
  {productId, qty}              {productId, qty}     {productId, qty, ts}
```

**How it works:**
1. An external system sends data (API call, message, file).
2. A translator process converts the external data format into the internal domain language.
3. The translator issues a command to store the translated data as an internal event.

**What it captures:** "How does external data enter our system?"

**Variation:** If the external data maps directly to internal data without transformation, you can simplify by treating the external event as a read model that feeds directly into a screen. Use the full pattern when translation logic is involved.

### Patterns Summary Table

| Pattern | Purpose | Direction | Trigger | Building Blocks |
|---|---|---|---|---|
| **State Change** | Modify system state | Data in | User action | Screen → Command → Event |
| **State View** | Read system state | Data out | User request | Event → Read Model → Screen |
| **Automation** | Background process | Internal | System event | Event → Read Model → ⚙️ → Command → Event |
| **Translation** | Ingest external data | Data in | External system | External Event → ⚙️ → Command → Event |

### The Wave Structure

When you lay out these patterns along a timeline from left to right, a natural "wave" structure emerges. Each action triggers a reaction: a state change produces events that feed read models that are consumed by screens that trigger new commands. This rhythmic cadence -- UI → Command → Event → View → UI -- is the heartbeat of the system.

```
     ┌───┐      ┌───┐      ┌───┐      ┌───┐
     │ UI│      │ UI│      │ UI│      │ UI│
    ╱    ╲    ╱    ╲    ╱    ╲    ╱    ╲
   ╱  cmd ╲  ╱  cmd ╲  ╱  cmd ╲  ╱  cmd ╲
──▶────▶────▶────▶────▶────▶────▶────▶────▶──  timeline
   ╲ event╱  ╲ event╱  ╲ event╱  ╲ event╱
    ╲    ╱    ╲    ╱    ╲    ╱    ╲    ╱
     └───┘      └───┘      └───┘      └───┘
      view       view       view       view
```

This predictability is what makes Event Modeling so powerful for estimation and planning.

---

## 5. The Information Completeness Check

The Information Completeness Check is not a "step" in the process. It is an **invariant** that must hold at all times: **every piece of data on every screen must be traceable to a source event.**

### How It Works

For every attribute in a **read model**, ask:
> "Which event delivers this data?"

If the answer is "none," you have found a gap. You cannot proceed until the gap is filled -- either by discovering a missing event or by realizing the data comes from a different part of the system.

The check works in both directions:

**Forward (Event → Read Model → Screen):**
- Event contains `{name, price}`.
- Read model shows `{name, price, totalPrice}`.
- `totalPrice` is derived from `price` -- acceptable.
- If read model showed `{name, price, stockLevel}` but no event contains `stockLevel` → **gap found**.

**Backward (Screen → Command → Event):**
- Screen has a "Remove" button that needs to identify *which* item to remove.
- Command requires `{itemId}`.
- Where does `itemId` come from? Trace it back: it must have been stored in a previous event (e.g., `Item Added` contains `{itemId}`).

### Why It Matters

The #1 reason software projects get delayed is false assumptions about data availability. Teams assume data is available, only to discover during implementation that it isn't. The Information Completeness Check forces you to verify every data dependency *before writing a single line of code*.

It is automatically enforced by the visual structure of the event model. Red arrows (or missing connections) between elements are immediately visible on the board.

### Quick Reference: The Data Trail

For any piece of data visible to a user, you must be able to answer this chain:

```
Screen field  ←  Read Model attribute  ←  Event attribute  ←  Command attribute  ←  User input or prior event
```

If any link in this chain is broken, the model is incomplete.

---

