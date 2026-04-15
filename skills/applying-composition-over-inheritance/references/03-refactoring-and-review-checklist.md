# 03 Refactoring and Review Checklist

## Table of Contents

1. [Use This Reference](#use-this-reference)
2. [Migration Principles](#migration-principles)
3. [Recipe 1: Inheritance to Strategy](#recipe-1-inheritance-to-strategy)
4. [Recipe 2: Subclass Stack to Decorators](#recipe-2-subclass-stack-to-decorators)
5. [Recipe 3: Subclass Family to Data Configuration](#recipe-3-subclass-family-to-data-configuration)
6. [Recipe 4: Collapse and Seal](#recipe-4-collapse-and-seal)
7. [Recipe 5: Introduce a Seam Before Major Change](#recipe-5-introduce-a-seam-before-major-change)
8. [Code Review Checklist](#code-review-checklist)
9. [Test Plan Checklist](#test-plan-checklist)
10. [Refactor Output Template](#refactor-output-template)

---

## Use This Reference

Use this file when converting inheritance-heavy designs to composition safely.

Always preserve behavior first, then improve structure.

---

## Migration Principles

Apply these principles on every migration:

1. Write characterization tests before structural changes.
2. Move one variation axis at a time.
3. Keep each commit reversible.
4. Prefer introducing seams before deleting classes.
5. Delete dead hierarchy pieces only after parity is verified.

Use branch-level checkpoints:

- checkpoint A: behavior locked with tests,
- checkpoint B: seam introduced,
- checkpoint C: first composed path live,
- checkpoint D: hierarchy cleanup complete.

---

## Recipe 1: Inheritance to Strategy

### When to use

Use when subclasses override algorithmic hooks in a shared template flow.

### Steps

1. Identify overridden methods that represent policy/algorithm variation.
2. Define one focused strategy interface per variation role.
3. Move subclass-specific logic into strategy implementations.
4. Change the former base class into a concrete context class.
5. Inject strategy instances through constructor.
6. Remove replaced subclasses.

### Validation

- old and new implementations pass the same behavior tests,
- context class has no protected extension hooks,
- strategy contract remains small and purpose-specific.

---

## Recipe 2: Subclass Stack to Decorators

### When to use

Use when subclasses only add cross-cutting behavior around stable operations.

### Steps

1. Define/confirm one stable interface for the core capability.
2. Create one decorator per cross-cutting behavior.
3. Ensure each decorator calls inner exactly once per operation.
4. Assemble decorator chain in composition root.
5. Remove combinatorial subclasses.

### Validation

- side effects occur in expected order,
- no behavior duplication across decorators,
- decorator depth stays within team threshold.

---

## Recipe 3: Subclass Family to Data Configuration

### When to use

Use when subclasses differ only by constants or simple configuration fields.

### Steps

1. Enumerate all subclass-only fields/constants.
2. Create a single concrete class with explicit configuration input.
3. Replace subclasses with configuration objects/factories.
4. Remove class hierarchy once all call sites migrate.

### Validation

- behavior matrix is covered by parameterized tests,
- no subclass-specific control flow remains,
- object creation remains readable in call sites.

---

## Recipe 4: Collapse and Seal

### When to use

Use when a hierarchy has low-value subclasses and a small legitimate residual variant set.

### Steps

1. Inline trivial subclasses into parent logic where appropriate.
2. Identify remaining valid variants.
3. Convert remaining model to sealed hierarchy/ADT if closed.
4. Replace ad-hoc type checks with exhaustive matching.

### Validation

- all variant handlers are exhaustive,
- impossible states are eliminated,
- extension points are explicit and intentionally limited.

---

## Recipe 5: Introduce a Seam Before Major Change

### When to use

Use when hierarchy internals are tightly coupled and risky to replace directly.

### Steps

1. Define an interface matching caller-visible behavior.
2. Add a façade that callers depend on.
3. Keep old hierarchy behind façade initially.
4. Replace internals incrementally with composed implementations.
5. Migrate callers progressively to new paths.

### Validation

- callers depend only on seam contract,
- old and new paths can run in parallel if needed,
- rollback can be executed by switching binding only.

---

## Code Review Checklist

### For new inheritance

- [ ] Is this a true is-a relation rather than implementation reuse?
- [ ] Is Liskov substitutability demonstrated with concrete examples?
- [ ] Is hierarchy depth bounded and justified?
- [ ] Are parent methods semantically valid for every subtype?
- [ ] Is extension closed (`final`/`sealed`) unless explicit openness is required?

### For composition changes

- [ ] Are dependencies constructor-injected and explicit?
- [ ] Are collaborator interfaces minimal and role-focused?
- [ ] Is composition root centralized?
- [ ] Are decorator/provider/wrapper stacks within limits?
- [ ] Is the chosen pattern aligned to a single variation axis?

### Smells to flag

- [ ] Subclass overrides most parent methods.
- [ ] Subclass exists only to access helper methods.
- [ ] Multiple subclasses differ only by constants.
- [ ] New subclass count is growing faster than feature count.

---

## Test Plan Checklist

- [ ] Characterization tests cover current production behavior.
- [ ] Contract tests exist for each injected collaborator interface.
- [ ] Mutation/negative tests verify invalid subtype behavior is blocked.
- [ ] Migration tests compare legacy and new outputs for critical paths.
- [ ] Load/perf tests guard against indirection regressions in hot paths.

---

## Refactor Output Template

```markdown
## Current state
- Hierarchy summary:
- Known pain points:

## Target design
- Primary mechanism:
- Interfaces/types introduced:
- Composition root changes:

## Migration plan
1. [Step]
2. [Step]
3. [Step]

## Validation
- Tests to add/update:
- Metrics/checks to enforce:
- Rollback path:
```
