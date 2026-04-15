# 02 ADTs, Composition Patterns, and Frontend Composition

## Table of Contents

1. [Use This Reference](#use-this-reference)
2. [ADT as the Closed-Variant Option](#adt-as-the-closed-variant-option)
3. [ADT vs Composition](#adt-vs-composition)
4. [Composition Pattern Catalog](#composition-pattern-catalog)
5. [Dependency Injection as Composition Wiring](#dependency-injection-as-composition-wiring)
6. [Frontend Guidance](#frontend-guidance)
7. [Pattern Selection Heuristics](#pattern-selection-heuristics)
8. [Anti-Patterns](#anti-patterns)
9. [Deliverable Templates](#deliverable-templates)

---

## Use This Reference

Use this file when you need to:

- select Strategy, Decorator, Adapter, Delegation/Facade, or DI patterns,
- decide between ADT modeling and strategy polymorphism,
- review React/frontend composition decisions.

---

## ADT as the Closed-Variant Option

Use an ADT (sealed class/interface, discriminated union, enum with payloads) when:

1. the variant set is intentionally closed,
2. variants carry different data shapes,
3. callers should branch exhaustively by variant,
4. compile-time completeness checks are required.

Prefer ADT over inheritance when modeling domain states or command/event variants.

### Examples of ADT-worthy domains

- payment outcomes (`success`, `declined`, `error`),
- workflow states (`draft`, `submitted`, `approved`, `rejected`),
- protocol messages with fixed variants,
- AST node families in compilers and analyzers.

### ADT implementation requirements

- Add explicit tags/discriminants where language tooling needs them.
- Seal/finalize the variant root whenever supported.
- Require exhaustive matching in core business handlers.

---

## ADT vs Composition

Use this comparison:

- **ADT**: stable variant set, evolving operations.
- **Composition**: stable operations/contracts, evolving implementations.

Choose based on what changes more often:

- New operations frequently added on fixed variants → ADT is usually cleaner.
- New implementations frequently added behind fixed operations → composition is usually cleaner.

Combine both when needed:

- model boundary inputs as ADTs,
- implement processing services with composed collaborators.

---

## Composition Pattern Catalog

### Strategy

Use when one algorithm role needs interchangeable implementations.

Steps:

1. Extract variation to a focused interface.
2. Create one class per algorithm.
3. Inject interface into context service.
4. Select implementation in composition root.

Choose Strategy when variation is business behavior, not data shape.

### Decorator

Use when you must layer cross-cutting behavior around a stable contract.

Typical layers:

- caching,
- metrics,
- logging,
- retries,
- authorization checks.

Rules:

- keep decorator stacks shallow (target ≤3),
- preserve contract semantics across all layers,
- avoid duplicate side effects across layers.

### Adapter

Use when integrating incompatible interfaces.

Rules:

- prefer object adapters over class adapters,
- keep adapted dependencies private,
- expose one stable interface to callers.

### Delegation / Facade

Use when a high-level use case touches many collaborators.

Rules:

- hide orchestration complexity behind one cohesive API,
- keep façade operations aligned to business tasks,
- avoid leaking low-level collaborator APIs through the façade.

---

## Dependency Injection as Composition Wiring

Use DI as the mechanism that assembles composed objects.

Default rules:

1. Use constructor injection for required dependencies.
2. Inject interfaces/protocols, not concrete infrastructure classes.
3. Keep wiring in one composition root per application layer.
4. Do not resolve dependencies from service locators inside business classes.

When dependency count grows too large (>5), split responsibilities first; do not hide complexity behind an oversized constructor.

---

## Frontend Guidance

Treat composition as default in modern frontend architecture.

### UI composition

- Compose reusable shells via children/slots.
- Specialize behavior by passing collaborators (callbacks, policy objects, renderers).
- Avoid inheritance trees of visual components.

### Logic composition

- Compose behavior with hooks/functions.
- Keep hooks cohesive and narrow.
- Return focused contracts; split hooks that expose too many concerns.

### State and dependency flow

- Use context/providers for scoped cross-cutting dependencies.
- Avoid prop drilling across deep trees when data is cross-cutting.
- Keep provider stacks understandable; collapse redundant providers.

---

## Pattern Selection Heuristics

Use this quick map:

- one algorithm role, many implementations → Strategy,
- one stable contract, layered behavior → Decorator,
- incompatible external API → Adapter,
- many collaborators behind one use case API → Facade/Delegation,
- finite variant state model → ADT.

Use one primary pattern per change axis. If multiple patterns appear in one class, separate concerns and isolate each axis.

---

## Anti-Patterns

- Nullable-field pseudo-unions instead of real ADTs.
- Open hierarchies where closed variants are required.
- Decorator chains used to mask unclear ownership.
- Hooks returning large mixed bags of unrelated state/actions.
- “Composition” implemented via hidden service locator access.
- Adapters that leak source API concepts into target contracts.

---

## Deliverable Templates

### Pattern recommendation

```markdown
## Chosen pattern
[Strategy | Decorator | Adapter | Facade | ADT]

## Why
- Change axis:
- Coupling impact:
- Runtime flexibility need:
- Testing implications:

## Implementation sketch
- Interface(s):
- Concrete implementations:
- Composition root wiring:

## Risks
- Primary risk:
- Mitigation:
```

### Frontend recommendation

```markdown
## Composition plan
- UI composition approach:
- Logic composition approach:
- State/dependency delivery:

## Smells to prevent
- Wrapper/provider depth limit:
- Hook surface constraints:
- Contract boundaries:
```
