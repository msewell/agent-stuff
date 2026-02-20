---
name: reducing-coupling
description: Analyzes a codebase scope for coupling issues, diagnoses coupling types using the Connascence framework, and proposes a comprehensive refactoring plan with concrete code changes. Use when asked to find coupling, reduce dependencies, decouple modules, or improve modularity in a codebase.
---

# Reducing Coupling

## Workflow

1. Clarify scope and goals.
2. Read reference files relevant to the scope.
3. Analyze the code for coupling.
4. Classify and prioritize findings.
5. Produce a refactoring plan.
6. Present the plan for approval.
7. Execute approved refactorings.

## Step 1 — Clarify Scope and Goals

Interpret the user's prompt to determine:

- **Target scope**: which files, directories, modules, or layers to analyze.
- **Concern**: general coupling audit, or a specific pain point (e.g., "hard to test", "can't deploy independently", "changing X breaks Y").
- **Constraints**: anything off-limits for modification (public APIs, shared contracts, third-party code).

If the prompt is ambiguous, ask one focused clarifying question before proceeding.

## Step 2 — Read Reference Material

Load only the reference files relevant to the analysis context:

| When you need … | Read |
|---|---|
| Coupling vocabulary, taxonomy, Connascence definitions | references/coupling-taxonomy-and-connascence.md |
| Architectural decoupling patterns (Hex, EDA, CQRS, Modular Monolith, DIP) | references/architectural-patterns.md |
| SOLID principles, DI, Adapter, ACL, Strangler Fig | references/design-principles-and-techniques.md |
| Microservices, frontend, or database coupling | references/context-specific-strategies.md |
| Modern trends, common anti-patterns | references/modern-trends-and-anti-patterns.md |
| Decision framework, measurement, refactoring strategy, testing | references/practical-guidelines.md |

Always load `coupling-taxonomy-and-connascence.md` — it provides the shared vocabulary for the analysis.
Load additional files based on the architectural context you discover.

## Step 3 — Analyze the Code

Read the files within the target scope. For each file and across files, look for:

### Structural Indicators
- Direct instantiation of concrete dependencies (no DI).
- Imports/references that cross module or layer boundaries.
- Shared mutable state or global variables.
- God classes/modules with many responsibilities.
- Fat interfaces that force clients to depend on methods they don't use.
- Circular dependencies between modules or packages.

### Connascence Indicators
- **Connascence of Meaning**: magic numbers, stringly-typed status codes, implicit conventions.
- **Connascence of Position**: long positional parameter lists.
- **Connascence of Algorithm**: duplicated encoding/hashing/serialization logic.
- **Connascence of Execution**: required call ordering not enforced by types.
- **Connascence of Timing**: race conditions, hidden sequencing requirements.
- **Connascence of Identity**: multiple components referencing the same mutable instance.

### Architectural Indicators
- Shared database access across module boundaries.
- Synchronous call chains spanning multiple services or modules.
- Anemic domain models with business logic in service layers.
- Tight coupling to frameworks, platforms, or third-party libraries without adapters.
- No separation between domain logic and infrastructure concerns.

## Step 4 — Classify and Prioritize

For each coupling issue found, record:

1. **Location**: file(s) and line range(s).
2. **Coupling type**: use Connascence taxonomy or structural category.
3. **Boundary**: whether it is within a module (lower priority) or across modules/layers/services (higher priority).
4. **Severity**: rate as high / medium / low based on:
   - Strength of connascence (stronger = worse).
   - Degree (how many elements are coupled).
   - Locality (cross-boundary = worse).
   - Change frequency of the coupled area (frequently-changed = worse).

Sort findings by severity descending.

## Step 5 — Produce the Refactoring Plan

For each finding (or group of related findings), propose a concrete refactoring:

### Plan Format

Present the plan as a numbered list. For each item include:

```
### <N>. <Short title>

**Problem**: <1–2 sentence description of the coupling issue>
**Location**: <file paths and line ranges>
**Coupling type**: <Connascence type or structural category>
**Severity**: high | medium | low

**Proposed refactoring**:
<Description of the change, naming the pattern used (e.g., Extract Interface + DI,
Adapter, ACL, Event-Driven, etc.)>

**Before** (sketch):
<Relevant code excerpt showing the current state>

**After** (sketch):
<Concrete code showing the proposed result>

**Trade-offs**:
- <benefit>
- <cost or risk>
```

### Plan Guidelines

- Propose incremental refactorings — each should be independently shippable.
- Prefer converting strong connascence to weaker forms over eliminating coupling entirely.
- Flag when decoupling would be premature (components always change together, abstraction not yet justified).
- Suggest tests to add before or alongside each refactoring to preserve behavior.
- Keep the plan ordered by priority: highest-severity items first.

## Step 6 — Present for Approval

Present the complete refactoring plan to the user. Ask which items to execute, or whether to revise any proposals. Do not modify code until the user approves specific items.

If the user approves all items, confirm the execution order (highest priority first).

## Step 7 — Execute Approved Refactorings

For each approved item, in priority order:

1. Make the code changes as described in the plan.
2. After each item, briefly summarize what was changed and which files were modified.
3. If a refactoring reveals new coupling issues, note them but do not add unplanned changes — propose them as follow-up items instead.

## References

- references/coupling-taxonomy-and-connascence.md
- references/architectural-patterns.md
- references/design-principles-and-techniques.md
- references/context-specific-strategies.md
- references/modern-trends-and-anti-patterns.md
- references/practical-guidelines.md
