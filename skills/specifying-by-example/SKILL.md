---
name: specifying-by-example
description: "Writes, reviews, and refines Specification by Example (SBE) artifacts — Gherkin scenarios, example mappings, rule-example tables, and scenario outlines. Produces declarative, single-behavior specifications using ubiquitous language. Use when writing acceptance criteria, Given-When-Then scenarios, feature files, BDD specifications, or executable specifications, when reviewing Gherkin for anti-patterns, when running Example Mapping or Three Amigos sessions, or when the user mentions SBE, BDD, specification by example, or spec-driven development."
category: Software Engineering
---

# Specifying by Example

## Workflow: Writing SBE specifications

1. **Clarify the business goal.** Ask what problem the feature solves and for whom. If the user provides a user story, extract the goal. If they provide raw requirements, ask "why are we building this?"

2. **Identify rules.** Extract the distinct business rules from the requirements. Each rule is a constraint or behavior the system must enforce. Name each rule explicitly.

3. **Generate examples for each rule.** For every rule, produce:
   - The **happy path** (main success scenario).
   - **Key boundary conditions** (edges where behavior changes).
   - **Important negative cases** (what the system should refuse).
   Use realistic data (real names, plausible amounts), not "foo"/"bar."

4. **Write Gherkin scenarios.** Convert each example into a Given-When-Then scenario following these rules:
   - **Declarative, not imperative.** Describe *what* happens, not UI steps. No CSS selectors, button names, or page navigation.
   - **One behavior per scenario.** Each scenario has exactly one When-Then pair.
   - **Essential data only.** Include only data that illustrates the rule. Omit incidental details (user IDs, timestamps, irrelevant fields).
   - **Ubiquitous language.** Use the same terms the business uses. No `user_id`, `POST /api/orders`, or `status = 2`.
   - **Name the rule.** Group scenarios under a `Rule:` keyword in Gherkin.

5. **Use Scenario Outlines for boundary tables.** When a rule has many input-output combinations, use a parameterized `Scenario Outline` with an `Examples` table instead of repeating similar scenarios.

6. **Check for specification gaps.** Are there rules with no examples? Examples with no clear rule? Unanswered questions? Surface these explicitly.

7. **Organize by domain concept.** Group feature files by business capability (e.g., `specs/pricing/`, `specs/accounts/`), not by sprint or ticket number.

## Workflow: Reviewing SBE specifications

1. Read all scenarios in the feature file or specification document.
2. Check each scenario against these anti-patterns:

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Imperative scripts | Steps say "click," "type," "navigate" | Rewrite in declarative style |
| Multi-behavior scenarios | Multiple When-Then pairs | Split into one scenario per behavior |
| Incidental detail overload | Irrelevant data (user IDs, timestamps) | Strip to essential data only |
| Technical leakage | Steps reference APIs, HTTP codes, DB tables | Replace with business-language equivalents |
| Inconsistent vocabulary | Same concept called different names | Pick one term and use it everywhere |
| Scenario proliferation | Hundreds of trivially different scenarios | Use Scenario Outlines; push combinatorics to unit tests |
| Too abstract | "Given sufficient funds / When they withdraw / Then it succeeds" | Add concrete amounts and expected outcomes |
| UI-coupled specs | Scenarios break when the UI is redesigned | Automate against the API/service layer; use declarative language |

3. Verify the specification covers happy path, boundaries, and negative cases for each rule.
4. Propose specific fixes with before/after Gherkin.

## Quick example

**Input:** "Users get free shipping on orders over $75, otherwise $5.95 flat rate."

**Output:**

```gherkin
Feature: Shipping cost calculation

  Rule: Shipping is free for orders over $75; otherwise $5.95 flat rate

    Scenario Outline: Shipping cost based on order total
      Given an order with a subtotal of <subtotal>
      When the shopper proceeds to checkout
      Then the shipping charge is <shipping>

      Examples:
        | subtotal | shipping |
        | $50.00   | $5.95    |
        | $74.99   | $5.95    |
        | $75.00   | $0.00    |
        | $75.01   | $0.00    |
        | $150.00  | $0.00    |
```

The boundary ($75.00) is tested from both sides. The rule is stated in prose above the scenarios.

## When NOT to apply SBE

Ask two questions before reaching for SBE:

1. **Will a non-developer ever need to read or validate this specification?** If only developers will care, use standard test frameworks.
2. **Is there genuine ambiguity about what the system should do?** If everyone already agrees, write a test and move on.

Skip SBE for: trivial CRUD, pure infrastructure/DevOps, throwaway prototypes, unit-level logic, algorithmically complex internals, and highly exploratory work.

A healthy ratio: SBE scenarios cover 10–20% of the test suite (high-value acceptance layer); unit and integration tests cover the remaining 80–90%.

## Reference material

- **Collaborative techniques**: [references/01-collaborative-techniques.md](references/01-collaborative-techniques.md) — Three Amigos, Example Mapping (with full walkthrough), Feature Mapping, discovery workshops, facilitation runbook
- **Writing effective examples**: [references/02-writing-effective-examples.md](references/02-writing-effective-examples.md) — declarative style, single-behavior rule, detail calibration, ubiquitous language, worked examples
- **Lifecycle and living documentation**: [references/03-lifecycle-and-living-documentation.md](references/03-lifecycle-and-living-documentation.md) — core principles, the seven process patterns, living documentation curation
- **Adoption, failure modes, and measurement**: [references/04-adoption-and-measurement.md](references/04-adoption-and-measurement.md) — adoption failure modes, maturity model, story slicing with examples, spec-driven development, success metrics
- **Glossary**: [references/05-glossary.md](references/05-glossary.md) — SBE terminology reference
