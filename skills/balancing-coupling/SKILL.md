---
name: balancing-coupling
description: Analyzes codebases and software designs for unbalanced coupling, classifies coupling by strength, distance, volatility, and connascence, identifies when not to decouple, and produces prioritized refactoring or enforcement plans. Use when reviewing coupling, decoupling modules, reducing dependencies, improving modularity, setting module or service boundaries, untangling legacy systems, addressing shared databases, synchronous call chains, circular dependencies, or adding TypeScript/JavaScript dependency-boundary checks.
category: System Architecture
---

# Balancing Coupling

## Quick start

Use the balance test before proposing decoupling:

> Strong coupling across a large distance to volatile knowledge is the problem. Weak, local, stable, or cohesive coupling is usually acceptable.

Default output: a coupling assessment plus a prioritized refactoring plan. Do not modify code until the user approves specific changes. Never mention skill or reference-file loading to the user.

Hard stops:

- If the user gives a design/snippet but no paths, analyze the supplied context; do not inspect the filesystem.
- If the user asks for config edits but the target project files or directories do not exist, stop and ask before creating them.
- Do not create source scaffolding, placeholder modules, docs, package files, or CI files unless the user explicitly asks to scaffold a project.
- Do not install packages solely to validate example configs without user approval.

Use only the terminology in this skill and its references. Prefer neutral terms such as contracts, interfaces, boundaries, integrations, implementations, wrappers, and composition root. Do not introduce external architecture labels, named principle labels, or jargon absent from these files.

## Workflow

1. **Clarify scope.** Identify whether the user supplied enough code/design context, named repo paths to inspect, or asked for concrete edits. If the prompt describes a design or snippet without paths, analyze that supplied context directly; do not browse the filesystem.
2. **Load only needed references silently.** Always read [references/01-coupling-decision-model.md](references/01-coupling-decision-model.md). Then read:
   - [references/02-code-refactoring-patterns.md](references/02-code-refactoring-patterns.md) for code-level TypeScript/JavaScript refactoring.
   - [references/03-architecture-data-runtime.md](references/03-architecture-data-runtime.md) for module, service, data, or runtime coupling.
   - [references/04-enforcement-typescript.md](references/04-enforcement-typescript.md) when adding automated boundary checks.
3. **Investigate change pressure.** Determine what changes often, what must deploy together, what crosses module/service/team boundaries, and where callers depend on implementation details.
4. **Classify findings.** For each issue, record strength, distance, volatility, connascence type when useful, and whether the dependency crosses a meaningful boundary.
5. **Prioritize.** Fix strong + distant + volatile coupling first. Leave local cohesive coupling alone unless it blocks a stated goal.
6. **Plan incrementally.** Prefer small, independently shippable refactorings: narrow contracts, moved behavior, extracted shared contracts, dependency injection, event publication, data ownership changes, or CI guardrails.
7. **Ask before editing.** Present the plan and wait for approval before making code/config changes unless the user explicitly requested edits to an existing repo scope. If target files, package manager, or project layout are missing or ambiguous, provide snippets and ask; never invent a repo structure.
8. **Verify.** After approved changes, run relevant tests, type checks, lint, cycle checks, or dependency-boundary checks.

## Assessment format

Use this structure by default:

```markdown
# Coupling Assessment

## Summary
[One paragraph: highest-risk coupling and recommended first move.]

## Findings

### 1. [Short title]
**Severity:** high | medium | low
**Location:** [files, symbols, or boundaries]
**Why it matters:** [strength + distance + volatility]
**Coupling type:** [connascence type or structural category]
**Recommendation:** [concrete refactoring]
**Tradeoff:** [cost/risk of the recommendation]

## Refactoring plan
1. [Smallest safe first step]
2. [Next step]
3. [Enforcement or follow-up]

## Do not change
- [Areas where decoupling would add ceremony or split cohesive code]
```

## Review heuristics

- Ask: **“If this changes, what else must change, and why?”**
- Prefer weakening coupling over eliminating it.
- Prefer moving tightly coupled code closer together when it changes together.
- Prefer explicit contracts over shared internals, implicit conventions, or shared tables.
- Avoid speculative indirection when there is no concrete volatility, boundary, testability, or replacement pressure.
- Treat dynamic coupling, synchronous chains, shared databases, and circular imports as high-risk when they cross boundaries.

## Example finding

**Input:** `OrderService` constructs a payment client directly and checkout fails if billing is unavailable.

**Output:** High severity: strong runtime and implementation coupling crosses a volatile service boundary. Introduce a narrow billing contract, inject the concrete implementation at startup, add timeout/circuit-breaker behavior for the synchronous authorization path, and move non-critical billing work behind an event.

## Reference map

- [references/01-coupling-decision-model.md](references/01-coupling-decision-model.md) — balanced coupling model, connascence vocabulary, prioritization rules.
- [references/02-code-refactoring-patterns.md](references/02-code-refactoring-patterns.md) — TypeScript/JavaScript code-level refactorings and smells.
- [references/03-architecture-data-runtime.md](references/03-architecture-data-runtime.md) — modular monoliths, events, data ownership, legacy migration, runtime coupling.
- [references/04-enforcement-typescript.md](references/04-enforcement-typescript.md) — dependency-cruiser, ESLint, Nx, madge, and CI ratchets.
