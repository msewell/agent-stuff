# 01 Foundations and Decision-Making

## Table of Contents

1. [Use This Reference](#use-this-reference)
2. [Core Principle](#core-principle)
3. [Why Composition Is the Default](#why-composition-is-the-default)
4. [When Inheritance Is Legitimate](#when-inheritance-is-legitimate)
5. [Decision Matrix](#decision-matrix)
6. [Decision Flow](#decision-flow)
7. [Language-Specific Guidance](#language-specific-guidance)
8. [Common Misdiagnoses](#common-misdiagnoses)
9. [Deliverable Template](#deliverable-template)

---

## Use This Reference

Use this file when deciding between composition, inheritance, and sealed hierarchies.

Do the following in order:

1. Identify the variation axis.
2. Classify whether the axis is open or closed.
3. Choose the least-coupled mechanism that still preserves clarity.
4. Document the tradeoff explicitly.

---

## Core Principle

Apply this default:

- Prefer **composition** for behavior reuse and variability.
- Use **inheritance** only for true subtyping with stable semantics.
- Use **ADT/sealed types** for closed variant sets requiring exhaustive handling.

Model the design choice as coupling scope:

- Inheritance couples a child to parent implementation details.
- Composition couples a consumer to collaborator contracts.
- Sealed ADTs couple operations to an explicit finite variant set.

Choose the smallest coupling scope that satisfies the requirement.

---

## Why Composition Is the Default

### 1) It constrains coupling

Composition depends on an interface boundary instead of a superclass surface.
Superclass internals can change safely when callers depend on contracts, not inheritance hooks.

### 2) It supports runtime variation

Swap collaborators by configuration, environment, or feature flag.
Avoid recompiling taxonomy decisions into type hierarchies.

### 3) It avoids combinatorial subclass growth

When behavior varies along multiple axes, represent each axis with a collaborator.
Compose axes orthogonally instead of encoding every combination as a subclass.

### 4) It improves test isolation

Inject fake collaborators and verify contracts directly.
Avoid tests that must instantiate hierarchy internals to control behavior.

### 5) It delays irreversible taxonomy choices

Domain understanding changes over time.
Composition keeps changes local and reversible.

---

## When Inheritance Is Legitimate

Accept inheritance only if all items below are true:

1. **Substitutability holds**: the subtype can be used anywhere the parent is expected.
2. **Semantic stability holds**: expected subtype behavior is unlikely to churn.
3. **Single variation axis**: hierarchy is not encoding orthogonal concerns.
4. **Hierarchy remains shallow**: practical target is depth ≤2 below unavoidable framework bases.
5. **Public surface remains coherent**: no inherited methods that violate subtype meaning.

Treat these as gates, not suggestions.

### Framework boundary exception

If a framework requires subclassing:

- Keep inheritance at the integration boundary.
- Compose internal business behavior behind that boundary.
- Do not propagate framework inheritance into domain types.

---

## Decision Matrix

| Concern | Composition | Inheritance | ADT / Sealed Type |
|---|---|---|---|
| Coupling | Contract-level | Implementation-level | Variant-set + match sites |
| Runtime swapping | Strong | Weak | N/A for dispatch strategy |
| Multi-axis variability | Strong | Weak | Medium |
| Exhaustive case handling | Weak by default | Weak unless sealed | Strong |
| Boilerplate risk | Forwarding boilerplate | Lower upfront | Match boilerplate |
| Refactor reversibility | High | Low | Medium |
| Test isolation | Strong | Medium/weak | Strong for pure operations |

Use this interpretation:

- Need runtime replaceability → composition.
- Need finite, compiler-checked variants → ADT/sealed.
- Need strict behavioral subtyping with stable shape → inheritance.

---

## Decision Flow

Apply this exact flow:

1. Is the variation a closed data variant set?
   - Yes → choose ADT/sealed type.
   - No → continue.

2. Do callers need to swap behavior at runtime/config time?
   - Yes → choose composition.
   - No → continue.

3. Is there a provable is-a relationship with Liskov-safe behavior?
   - No → choose composition.
   - Yes → continue.

4. Is the hierarchy expected to stay small and stable?
   - No → choose composition.
   - Yes → inheritance is acceptable.

5. If inheritance is chosen, enforce sealing/finality by default and document why extension is open.

---

## Language-Specific Guidance

### Java / Kotlin

- Prefer interfaces with default methods over abstract base classes for behavior sharing.
- Use sealed classes/interfaces for closed variants.
- Use Kotlin delegation (`by`) to reduce forwarding boilerplate.

### C# / .NET

- Prefer constructor-injected interfaces and records for behavior/data separation.
- Use interface default implementations selectively for shared behavior.
- Avoid inheritance-driven service composition in application services.

### Python

- Prefer protocol-based structural contracts for composed collaborators.
- Treat mixins as specialized tools with explicit MRO awareness.
- Prefer dataclasses + composition over base-class reuse.

### TypeScript / JavaScript

- Prefer structural interfaces and injected collaborators.
- Use discriminated unions for finite variant models.
- Avoid class hierarchy growth when function or object composition suffices.

### Go

- Use interface composition and struct embedding for behavior assembly.
- Keep interfaces small and consumer-defined.
- Avoid pseudo-inheritance naming patterns.

### Rust

- Use trait + struct composition as default architecture.
- Use enums for closed variant sets and exhaustive matching.
- Keep dynamic dispatch (`dyn Trait`) explicit and intentional.

---

## Common Misdiagnoses

- “We want reuse” does not justify inheritance.
- “We already have a base class” does not justify adding subclasses.
- “This is polymorphism” does not imply subtype inheritance; strategy polymorphism is composition.
- “This hierarchy is readable” is not enough; evaluate change behavior and failure modes.

---

## Deliverable Template

Use this response shape when asked to decide:

```markdown
## Decision
[Composition | ADT/sealed | Inheritance]

## Rationale
- Variation axis:
- Openness of variant set:
- Runtime swapping need:
- Coupling impact:
- Testability impact:

## Constraints
- Framework constraints:
- Language constraints:

## Consequences
- Short-term cost:
- Long-term maintainability:
- Risks and mitigations:
```
