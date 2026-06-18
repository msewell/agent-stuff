# Coupling Decision Model

## Core thesis

Coupling is not a defect by itself; it is the substance of integration. The goal is to put the right kind of coupling in the right place and remove the kind that makes change expensive.

Two failure modes matter:

- **Global complexity:** distant components share too much volatile knowledge, so a change ripples widely.
- **Local complexity:** speculative indirection scatters a simple feature across too many files.

## Definitions

- **Coupling:** how much one component must know about another, and how much a change in one forces a change in the other.
- **Cohesion:** how strongly elements inside a module belong together.
- **Loosely coupled outcome:** a change to one component's design, implementation, or behavior does not force a change in the other.

## The balance test

Evaluate every dependency across three dimensions:

1. **Strength:** how much knowledge is shared?
   - Strongest: private implementation details, shared tables, internal object graphs.
   - Strong: duplicated business rules or shared rich domain models across a boundary.
   - Weak: narrow, purpose-built contracts with minimal fields and stable semantics.
2. **Distance:** how far apart are the two sides?
   - Same function/class/module is close.
   - Different modules, services, release cadences, teams, or vendors are far.
3. **Volatility:** how often does the shared knowledge change?
   - Stable dependencies can tolerate stronger coupling.
   - Volatile dependencies need weaker contracts or shorter distance.

Act when coupling is **strong + distant + volatile**. If any one of those is false, decoupling may be unnecessary or lower priority.

## Connascence vocabulary

Use connascence to name why a change must be coordinated.

### Static forms

From weaker to stronger:

1. **Name:** both sides agree on a name.
2. **Type:** both sides agree on a type or shape.
3. **Meaning:** both sides share an implicit convention, such as magic numbers or string codes.
4. **Position:** both sides rely on argument or field ordering.
5. **Algorithm:** both sides must implement the same algorithm.

### Dynamic forms

Usually higher risk because they appear at runtime:

1. **Execution:** order of operations matters.
2. **Timing:** timing or concurrency behavior matters.
3. **Value:** related values must change together.
4. **Identity:** multiple components must reference the same object or resource instance.

## Prioritization rules

- Strong connascence inside a small cohesive module is usually acceptable.
- Strong connascence across a module, service, or ownership boundary is a refactoring target.
- Convert stronger forms to weaker forms: position → name, meaning → named type/constant, duplicated algorithm → single owner or shared contract.
- Reduce degree: fewer dependents lowers blast radius.
- Shorten distance: put things that change together in the same module.
- Document assumptions when tolerating strong coupling to stable dependencies.

## When not to decouple

Resist decoupling when:

- The dependency is stable and mature.
- The two sides always change together.
- The coupling is strong but local and well encapsulated.
- There is no concrete second implementation, boundary, volatility, or testability pressure.
- The proposed indirection would make a simple behavior harder to trace.

The senior move is asymmetric judgment: be ruthless about strong, distant, volatile coupling, and equally ruthless about deleting indirection that has not earned its keep.
