# Lifecycle and Living Documentation

## Table of Contents

- [Core Principles](#core-principles)
- [SBE, BDD, ATDD, and TDD](#sbe-bdd-atdd-and-tdd)
- [The SBE Lifecycle: Seven Process Patterns](#the-sbe-lifecycle-seven-process-patterns)
- [Living Documentation](#living-documentation)

---

## Core Principles

Five principles guide all SBE work:

1. **Collaboration over documentation.** The primary artifact is **shared understanding** through structured conversation. Documents and automated checks are valuable by-products.
2. **Concrete over abstract.** "The system should be performant" invites conflicting interpretations. "A search returns results within 200ms for a 1M-item catalog" eliminates ambiguity.
3. **Business language over technical language.** Use ubiquitous language from the business domain. Specifications must remain accessible to all stakeholders.
4. **Living over static.** Specifications earn trust by being executable. When the system changes, the spec either stays green (compatible) or turns red (regression).
5. **Intent over implementation.** Specifications describe **what** and **why**, not **how**. This decouples specs from implementation, allowing free refactoring.

---

## SBE, BDD, ATDD, and TDD

These practices overlap heavily. The differences are in emphasis:

| Aspect | TDD | ATDD | BDD | SBE |
|---|---|---|---|---|
| **Primary question** | Does the code work? | Are we building the right thing? | Does the system behave correctly? | Do we share understanding? |
| **Typical scope** | Unit / function | User story / acceptance | Feature behavior | Feature behavior |
| **Language** | Code | Human-readable tests | Given-When-Then (Gherkin) | Natural language examples |
| **Primary audience** | Developers | Team + stakeholders | Team + stakeholders | Team + stakeholders |
| **Key artifact** | Unit tests | Acceptance tests | Executable scenarios | Living documentation |

**SBE** is the broadest umbrella. It encompasses collaborative specification, concrete examples, automation, and living documentation. BDD's Given-When-Then is the most common notation, but SBE also includes tables, decision matrices, and free-form examples.

In practice, effective teams use SBE/BDD at the acceptance level, TDD at the unit level, and treat both as complementary specification layers.

---

## The SBE Lifecycle: Seven Process Patterns

### 1. Deriving Scope from Goals

Start from a business goal (increase conversion by 5%, reduce support tickets). Features that do not serve the goal are deferred or dropped.

- Frame every feature in terms of a user problem or business outcome.
- Use Impact Mapping (Why → Who → How → What) to trace features back to measurable objectives.

### 2. Specifying Collaboratively

Specifications created in isolation invariably contain blind spots. Cross-functional collaboration is required: at minimum product, development, and testing (the Three Amigos).

- Never let one role write specifications alone.
- Time-box to 25–45 minutes per story. If a story takes longer, it is too large.

### 3. Illustrating Using Examples

The heart of SBE. Produce concrete scenarios that illustrate business rules. (The SKILL.md workflow has the operational checklist for this step.)

- Examples should be *illustrative*, not *exhaustive*. Exhaustive coverage belongs in lower-level tests.
- Ask "what else could happen?" until the group runs dry.

### 4. Refining the Specification

Raw workshop output needs cleanup. (The SKILL.md workflow steps 4 and 6 cover the specific refinement rules.)

- **Separate concerns.** Each example illustrates one rule. If it does double duty, split it.
- Refine within 24 hours of the workshop, while context is fresh.

### 5. Automating Validation Without Changing Specifications

The specification is the test. Automation connects the human-readable spec to the system under test through a thin translation layer — but must not alter the spec's language or structure.

- Keep automation code (step definitions, fixtures) separate from the specification text.
- Automate against the API or service layer where possible — faster and less brittle than UI automation.
- Treat automation code with the same care as production code.

### 6. Validating Frequently

Run the full specification suite in CI/CD on every commit, and ideally locally before pushing.

- Keep execution time short enough that developers actually run the suite.
- Treat a failing specification with the same urgency as a failing build.

### 7. Evolving a Documentation System

The most underachieved pattern. Use accumulated specifications as a living documentation system: a single source of truth about what the software does.

- Organize by domain concept, not by sprint or ticket.
- Remove or archive obsolete specifications.
- Schedule periodic gardening sessions to prune and restructure.

---

## Living Documentation

### What makes documentation "living"

1. **Executable.** Every example can be run as an automated check.
2. **Version-controlled.** Specifications live alongside the code in the same repository.
3. **Auto-validated.** CI/CD runs specifications on every change. Passing = green; failing = red.
4. **Curated.** The team actively maintains: removing obsolete specs, reorganizing for clarity, filling gaps.

### Organization

Organize by business capability or domain concept:

```
specs/
  accounts/
    registration.feature
    authentication.feature
    password-recovery.feature
  orders/
    cart-management.feature
    checkout.feature
    coupons.feature
  shipping/
    rate-calculation.feature
    tracking.feature
```

### The curation problem

Specifications decay when:

- No one is responsible for curation.
- Specs are written per ticket and never reorganized.
- Feature files accumulate hundreds of scenarios with no pruning.
- Business stakeholders stop reading them.

**Countermeasures:**

- Assign a rotating "documentation gardener" role.
- Schedule quarterly gardening sessions.
- Generate browsable HTML documentation from the spec suite and share it with stakeholders.
- Track: "What percentage of stakeholders read the living documentation at least once per sprint?"
