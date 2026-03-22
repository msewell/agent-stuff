# Collaborative Techniques

## Table of Contents

- [Three Amigos](#three-amigos)
- [Example Mapping](#example-mapping)
- [Example Mapping Walkthrough](#example-mapping-walkthrough)
- [Feature Mapping](#feature-mapping)
- [Discovery Workshops](#discovery-workshops)
- [Facilitation Runbook](#facilitation-runbook)

---

## Three Amigos

A short meeting where three perspectives examine a piece of work:

| Role | Function | Typical questions |
|---|---|---|
| **Product** (PO / BA) | Defines the problem and business value | "What problem does this solve? For whom?" |
| **Development** | Proposes solutions, identifies technical constraints | "How might we implement this? What are the risks?" |
| **Testing** | Challenges assumptions, surfaces edge cases | "What if the input is empty? What if two users do this simultaneously?" |

The "protester" role (testing) is the secret weapon — testers reliably uncover missing requirements, unstated assumptions, and boundary conditions.

**Practical tips:**

- Time-box to 30–45 minutes. If the discussion overflows, the story is too large — split it.
- Run sessions shortly before development begins, not weeks in advance.
- Frequent short sessions outperform infrequent long ones.
- The output is a set of concrete examples, not a specification document. Formalization happens afterward.

---

## Example Mapping

Created by Matt Wynne. Uses four colors of cards to decompose a story into concrete, testable pieces:

| Color | Represents | Placement |
|---|---|---|
| **Yellow** | The **story** being discussed | Top of the table (one card) |
| **Blue** | **Rules** (business rules, acceptance criteria) | Row beneath the story |
| **Green** | **Examples** that illustrate a rule | Columns beneath each rule |
| **Red** | **Questions** that nobody can answer yet | Set aside |

**How it works:**

1. Write the story on a yellow card.
2. Write each known acceptance criterion on a blue card, placed in a row.
3. For each rule, brainstorm concrete examples on green cards, placed beneath the rule.
4. When a question arises that nobody can answer, capture it on a red card and move on.
5. Continue until the group is satisfied that the scope is clear, or time runs out.

**Reading the map (visual heuristics):**

- Many red cards → too much uncertainty; defer the story.
- Many blue cards → story is too large; consider slicing.
- A rule with many green cards → rule may be over-complex; consider simplifying.
- Few green cards overall → explore more; keep asking "what else?"

**Tips:**

- Avoid writing full Given-When-Then during the session. Name each example "The one where..." (e.g., "The one where the coupon is expired").
- Time-box to 25 minutes, one story per session.
- Bare minimum attendance: the three amigos. Add UX, ops, or domain experts when relevant.

---

## Example Mapping Walkthrough

**Story (yellow card):**

> As a subscriber, I can pause my subscription for up to 3 months so that I don't pay while I'm not using the service.

The PO adds context: "Subscribers have been requesting this for months. Churn spikes when people feel locked in."

**Rule 1 (blue card):** Pause duration must be between 1 and 3 months.

- **(green)** The one where the subscriber selects a 2-month pause — allowed; subscription resumes automatically after 2 months.
- **(green)** The one where the subscriber selects a 4-month pause — rejected; system shows the 3-month maximum.
- **(green)** The one where the subscriber selects 0 months — rejected; system requires a minimum of 1 month.

**Rule 2 (blue card):** A subscriber can pause only once per billing year.

- **(green)** The one where a subscriber pauses for the first time this billing year — allowed.
- **(green)** The one where a subscriber already paused in January and tries again in March — rejected with message explaining the once-per-year limit.

The tester asks: "What counts as the billing year — calendar year or subscription anniversary?" Nobody knows.

- **(red)** Does the billing year reset on the subscription anniversary or on January 1?

**Rule 3 (blue card):** Billing stops during the pause period.

- **(green)** The one where a subscriber on a $20/month plan pauses for 2 months — no charges for those 2 months; next charge occurs when the pause ends.
- **(green)** The one where the subscriber pauses mid-billing-cycle — current cycle is prorated.

The developer asks: "Do we prorate the current cycle, or does the pause start at the next billing date?" The PO says: "Prorate — customers expect immediate effect."

The tester follows up: "What about annual subscribers?" Nobody is sure.

- **(red)** How does pausing work for annual billing plans?

**Rule 4 (blue card):** Paused subscribers retain access to archived content but not new content.

- **(green)** The one where a paused subscriber tries to access a new article published during the pause — blocked with "your subscription is paused" message.
- **(green)** The one where a paused subscriber accesses an article they bookmarked before the pause — allowed.

**Reading the map:**

| Element | Count | Signal |
|---|---|---|
| Blue (rules) | 4 | Moderate scope — reasonable for one story |
| Green (examples) | 9 | Good coverage of the rules |
| Red (questions) | 2 | Two open questions must be answered before development |

The two red cards mean this story is **not ready** for development. The PO takes ownership of answering both questions. The team agrees to revisit in two days.

**After the session**, formalize the green cards into Given-When-Then:

```gherkin
Rule: Pause duration must be between 1 and 3 months

  Scenario: Subscriber selects a valid pause duration
    Given an active monthly subscriber
    When they request a 2-month pause
    Then the subscription is paused for 2 months
    And it resumes automatically after the pause period

  Scenario: Subscriber selects a duration exceeding the maximum
    Given an active monthly subscriber
    When they request a 4-month pause
    Then the request is rejected
    And they are informed the maximum pause is 3 months
```

This walkthrough demonstrates the full flow: story → rules → examples → questions → readiness decision → formalization.

---

## Feature Mapping

Developed by John Ferguson Smart. Extends Example Mapping for complex features with multiple actors or systems.

1. Define the feature and identify the **actors** involved.
2. Break the feature into **tasks** (the steps an actor takes).
3. For each task, identify **examples** that illustrate variants, edge cases, and outcomes.
4. Ask "But what if...?" and "What else could lead to this outcome?"

Feature Mapping produces a two-dimensional map: tasks flow left-to-right (the happy path), and variations stack vertically beneath each task. This structure makes it straightforward to slice the feature into smaller deliverable increments.

Use Feature Mapping when:

- The feature involves multiple actors or systems interacting.
- The team is exploring a new or poorly understood domain.
- Example Mapping feels too flat to capture the workflow.

---

## Discovery Workshops

Broader collaborative sessions for large, complex, or risky features that warrant more than a 25-minute conversation. The entire team (not just the three amigos) explores a feature's domain in depth.

A discovery workshop typically involves:

- Walking through a real-world scenario end-to-end on a whiteboard.
- Identifying business rules, edge cases, and open questions as they arise.
- Producing a comprehensive set of examples covering all significant scenarios.
- Agreeing on which examples are candidates for automation.

Duration: 1–2 hours, with breaks.

**Integration with backlog refinement:** For Scrum teams, run discovery workshops *as* Product Backlog Refinement — change the approach from "discuss and estimate" to "illustrate with examples and estimate."

---

## Facilitation Runbook

### Before the session (5 min prep)

- Read the story and pre-write the yellow card and any known blue (rule) cards.
- Confirm the PO can articulate the business goal in one sentence.
- Prepare materials: colored sticky notes/cards (physical) or digital board with colored card templates (remote).

### Opening (2 min)

Read the story aloud. The PO states the goal: "We're doing this because [business reason]." No slides.

### Diverge — explore rules and examples (15 min)

For each rule:

1. Ask: "Can you give me a concrete example?"
2. Write the example. Use "The one where..." naming.
3. Ask: "What else could happen?" Repeat until dry.
4. Unanswerable questions → red card, move on immediately. Do not speculate for more than 30 seconds.
5. New rule emerges → write a blue card, explore it.

### Converge — review the map (5 min)

- Read back each rule and its examples. Ask: "Is anything missing?"
- Review red cards — can any be answered now?
- Check visual balance: too many reds? Too many blues? Excessive greens on one rule?

### Close — decide readiness (3 min)

- **Ready:** Few or no red cards, manageable scope → formalize and proceed.
- **Needs answers:** Red cards remain → assign owner and deadline, reconvene.
- **Needs slicing:** Too many blue cards → identify rules that form independent stories.

### Common facilitation traps

| Trap | Response |
|---|---|
| **Solution-diving** (designing schemas/APIs) | "Let's capture *what* should happen first. We'll figure out *how* after." |
| **Scope creep** (new feature idea mid-discussion) | Write it on a separate yellow card: "Good catch — that's a different story." |
| **Silent participant** | Address by role: "Tester, what could go wrong with this rule?" |
| **Rat-holing** (2+ min debate, no resolution) | "Let's capture this as a red card and keep moving." |
| **Premature formalization** (writing full Given-When-Then) | "Let's stay at the 'one where...' level. We'll formalize after." |

### Remote adjustments

- Use a shared digital board (Miro, FigJam) with pre-built colored card templates.
- The facilitator should *not* be the one typing — focus on the conversation.
- Use a visible 25-minute timer.
- Ask participants to turn cameras on.
