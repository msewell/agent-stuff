---
name: designing-event-models
description: "Designs and reviews Event Models — the visual blueprint for information systems using events, commands, read models, and screens. Produces structured YAML artifacts (swimlanes, slices, events, commands, read models, Given/When/Then specifications). Use when designing a new system or feature with Event Modeling, reviewing an existing event model for anti-patterns or completeness gaps, defining slices and GWT scenarios, or creating an event model from a system description."
category: Software Engineering
---

# Designing Event Models

## Workflow: Design an Event Model

1. **Clarify scope.** Ask what system or feature to model. Identify actors, key business processes, and external systems.
2. **Brainstorm events.** List all domain events. Group into swimlanes by business capability.
3. **Build the timeline.** Order events chronologically within each swimlane.
4. **Apply the four patterns** to each step:
   - **State Change:** Screen → Command → Event
   - **State View:** Event(s) → Read Model → Screen
   - **Automation:** Event → Read Model → ⚙️ → Command → Event
   - **Translation:** External Event → ⚙️ → Command → Event
5. **Define slices.** Each pattern application = one slice. Name it after the business action or view.
6. **Write GWTs** (Given/When/Then scenarios) for each slice. Minimum: one happy path + one error/edge case. Use concrete example data ("Jane Doe", "$4.50"), never abstract placeholders.
7. **Run the Information Completeness Check.** For every field in every read model, trace it to a source event. For every command field, trace it to user input or a prior event. Flag gaps.
8. **Output the model as YAML** using the format below.

## Workflow: Review an Event Model

1. **Check completeness.** Every read model field must trace to a source event. Flag orphan data.
2. **Check anti-patterns:**
   - Events in present tense (should be past tense)
   - God slice (>10 GWTs in one slice — decompose)
   - Horizontal over-orchestration (UI firing sequential commands — use automations)
   - Logic on the board (if/else branching — belongs in code, not model)
   - Technology references (no "Kafka topic" or "PostgreSQL table" — model is tech-agnostic)
   - Missing screens (every command and read model should connect to a screen)
3. **Check GWT quality.** Concrete data? Both happy and error paths? Named scenarios?
4. **Propose fixes** with before/after.

## YAML Output Format

```yaml
event_model:
  name: "Shopping Cart"
  swimlanes:
    - name: "Cart"
      slices:
        - name: "Add Item"
          pattern: state_change
          screen: "Product Page — [Add to Cart] button"
          command:
            name: AddItem
            fields: {itemId: "abc-123", name: "Latte", price: 4.50}
          event:
            name: ItemAdded
            fields: {itemId: "abc-123", name: "Latte", price: 4.50, addedAt: "2024-07-01T10:00:00Z"}
          gwts:
            - name: "Happy path — add first item"
              given: []
              when: {command: AddItem, fields: {itemId: "abc-123", name: "Latte", price: 4.50}}
              then: {event: ItemAdded, fields: {itemId: "abc-123", name: "Latte", price: 4.50}}
            - name: "Error — max 3 items"
              given:
                - {event: ItemAdded, fields: {itemId: "a"}}
                - {event: ItemAdded, fields: {itemId: "b"}}
                - {event: ItemAdded, fields: {itemId: "c"}}
              when: {command: AddItem, fields: {itemId: "d"}}
              then: {error: "Maximum 3 items per cart"}

        - name: "Cart Items"
          pattern: state_view
          events_consumed: [ItemAdded, ItemRemoved]
          read_model:
            name: CartItems
            fields: {items: [{itemId: "abc-123", name: "Latte", price: 4.50}], totalPrice: 4.50}
          screen: "Cart Page — item list with totals"
          gwts:
            - name: "Shows remaining items after removal"
              given:
                - {event: ItemAdded, fields: {itemId: "a", name: "Latte", price: 4.50}}
                - {event: ItemAdded, fields: {itemId: "b", name: "Espresso", price: 3.00}}
                - {event: ItemRemoved, fields: {itemId: "a"}}
              then: {read_model: CartItems, fields: {items: [{itemId: "b", name: "Espresso", price: 3.00}], totalPrice: 3.00}}

        - name: "Send Confirmation Email"
          pattern: automation
          trigger_event: CartSubmitted
          read_model: {name: SubmittedCartData, fields: {email: "jane@co.com", items: ["..."]}}
          command: {name: SendConfirmationEmail, fields: {to: "jane@co.com", body: "..."}}
          result_event: {name: ConfirmationEmailSent, fields: {to: "jane@co.com", sentAt: "..."}}

        - name: "Inventory Sync"
          pattern: translation
          external_event: {name: InventoryChanged, source: "Warehouse API", fields: {sku: "abc-123", qty: 42}}
          command: {name: UpdateInventory, fields: {productId: "abc-123", quantity: 42}}
          event: {name: InventoryUpdated, fields: {productId: "abc-123", quantity: 42}}
```

## Key Rules

- **Events are past tense.** "Item Added", never "Add Item." Commands are imperative: "Add Item", "Submit Cart."
- **Always use concrete example data** in every field — names, prices, IDs, timestamps. Never abstract placeholders.
- **One slice = one pattern application.** If a slice has >10 GWTs, decompose it.
- **The model is technology-agnostic.** No databases, frameworks, or protocols.
- **Information Completeness Check is mandatory.** Every read model field must trace to an event. No exceptions.

## Edge Cases

- **System has no UI (API only):** Replace screen mockups with API endpoint descriptions (e.g., "POST /cart/items — request body: {name, price}"). The pattern structure stays the same.
- **CRUD-heavy areas with no business rules:** Model as simple state change slices with minimal GWTs. Note that if there are truly no rules, Event Modeling may be overkill for that area.
- **External system integration:** Use the Translation pattern. Always model the translator as a separate slice even if the mapping seems trivial — it makes system boundaries explicit.

## Reference Material

Detailed guidance on all Event Modeling concepts:

- **Foundations** — what Event Modeling is, origins, building blocks (events, commands, read models, screens): [references/01-foundations.md](references/01-foundations.md)
- **Four patterns & completeness check** — state change, state view, automation, translation, and the information completeness invariant: [references/02-patterns-and-completeness.md](references/02-patterns-and-completeness.md)
- **Specifications, slices & workshops** — GWT scenarios, slice structure, and how to run modeling workshops: [references/03-specifications-slices-workshops.md](references/03-specifications-slices-workshops.md)
- **Anti-patterns & best practices** — constant cost curve, event modeling vs event storming, common mistakes, playbook: [references/04-anti-patterns-and-best-practices.md](references/04-anti-patterns-and-best-practices.md)
- **DDD/CQRS/ES context & tooling** — relationship to related methodologies, tooling, when to use Event Modeling: [references/05-context-and-tooling.md](references/05-context-and-tooling.md)
