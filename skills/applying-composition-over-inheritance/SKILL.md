---
name: applying-composition-over-inheritance
description: Evaluates object-oriented designs to choose composition, inheritance, or algebraic data types. Produces decision rationales, refactoring plans, and review guardrails that reduce fragile base classes and subclass explosion. Use when reviewing class hierarchies, deciding between extends vs interfaces, refactoring inheritance-heavy code, introducing dependency-injected collaborators, or defining team conventions for object modeling.
category: System Architecture
---

# Applying Composition Over Inheritance

## Quick start

1. Identify the variation axis: data variant, algorithm, cross-cutting behavior, or framework constraint.
2. Default to composition unless inheritance is explicitly justified by substitutability and stability.
3. If the variant set is closed and data-shaped, prefer an ADT/sealed type over open inheritance.
4. Produce a concrete migration plan with tests, rollout order, and review checkpoints.

## Reference routing (progressive disclosure)

Read only the file needed for the current task:

- **Foundations and mechanism choice** → [references/01-foundations-and-decision-making.md](references/01-foundations-and-decision-making.md)
- **ADTs, composition patterns, frontend composition** → [references/02-adts-patterns-and-frontend-composition.md](references/02-adts-patterns-and-frontend-composition.md)
- **Step-by-step migration and code review checks** → [references/03-refactoring-and-review-checklist.md](references/03-refactoring-and-review-checklist.md)
- **CI metrics, custom static checks, team adoption** → [references/04-metrics-and-adoption.md](references/04-metrics-and-adoption.md)

## Default workflow

1. **Assess the current model**
   - List base classes, subclass count, hierarchy depth, and known pain points.
   - Mark each variation as one of: data variant, behavior strategy, or infrastructure concern.

2. **Choose mechanism (default-first)**
   - Choose **composition** for behavior variation, runtime swapping, or multi-axis change.
   - Choose **ADT/sealed type** for closed, data-carrying variants requiring exhaustive handling.
   - Choose **inheritance** only when all conditions hold: true is-a relation, Liskov-safe substitutability, and stable hierarchy.

3. **Design the target shape**
   - Define minimal collaborator interfaces.
   - Use constructor injection for required collaborators.
   - Keep inheritance depth shallow (target ≤2 below unavoidable framework bases).

4. **Plan migration incrementally**
   - Add characterization tests first.
   - Introduce a seam (interface/facade) before replacing internals.
   - Migrate one subclass path at a time.
   - Remove dead hierarchy pieces only after parity checks pass.

5. **Validate and guardrail**
   - Run checklist-driven review.
   - Add CI metrics/checks for DIT, override ratio, and decorator depth.
   - Capture explicit waivers for framework-required inheritance.

## Non-negotiable defaults

- Prefer composition by default.
- Do not introduce inheritance purely for code reuse.
- Keep collaborator interfaces narrow.
- Avoid service locator patterns; dependencies must be explicit.
- Treat deep decorator stacks (>3) and wide inheritance trees as design smells.

## Output contract

When asked for guidance, return these sections in order:

1. **Decision**: composition, ADT, or inheritance.
2. **Why**: coupling, change axis, runtime needs, and testability implications.
3. **Design sketch**: target interfaces/types and composition root.
4. **Migration steps**: small reversible steps with validation points.
5. **Review/CI checks**: checklist items and measurable thresholds.

## Edge cases

- **Framework-mandated inheritance**: keep inheritance at the boundary; compose internally.
- **Language lacks delegation sugar**: use small helper generators/templates for forwarding.
- **Performance-critical paths**: measure dispatch overhead before adding indirection.
- **Tiny stable domains**: sealed inheritance may be acceptable when exhaustiveness is required.

## Example

**Input:** “We have `BaseReport` with 12 subclasses and every new format adds another subclass. What should we do?”

**Output (shape):**
- Decision: Replace hierarchy with composition (Strategy + optional Decorator).
- Why: multi-axis variation and override-heavy subclasses indicate taxonomy drift.
- Design sketch: `ReportRenderer`, `HeaderPolicy`, `FooterPolicy`, `OutputFormatter` interfaces composed in one `ReportService`.
- Migration: characterization tests → strategy extraction → per-subclass migration → subclass deletion.
- Guardrails: DIT warn >3, override ratio warn >0.5, decorator depth warn >3.
