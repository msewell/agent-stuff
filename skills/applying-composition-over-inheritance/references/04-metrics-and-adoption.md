# 04 Metrics and Adoption

## Table of Contents

1. [Use This Reference](#use-this-reference)
2. [CI Metrics Baseline](#ci-metrics-baseline)
3. [Metric Definitions and Thresholds](#metric-definitions-and-thresholds)
4. [Language-Specific Tooling Map](#language-specific-tooling-map)
5. [Custom Static Checks](#custom-static-checks)
6. [Reporting and Trend Management](#reporting-and-trend-management)
7. [Waiver Policy](#waiver-policy)
8. [Team Conventions](#team-conventions)
9. [Adoption Rollout Plan](#adoption-rollout-plan)
10. [Governance Deliverable Template](#governance-deliverable-template)

---

## Use This Reference

Use this file when setting objective guardrails so architecture does not regress.

Apply metrics as trend controls, not as one-time purity checks.

---

## CI Metrics Baseline

Track these metrics per touched module/package:

- depth of inheritance tree (DIT),
- number of direct children (NOC),
- override ratio by subclass,
- decorator stack depth,
- interface size for injected dependencies,
- constructor dependency count,
- coupling concentration on base classes.

Capture baseline before enforcing failure thresholds.

---

## Metric Definitions and Thresholds

Use these defaults unless local constraints require adjustment:

| Metric | Definition | Initial Threshold | Mature Threshold |
|---|---|---|---|
| DIT | Longest inheritance chain excluding framework roots | Warn >3, fail >5 | Warn >2, fail >4 |
| NOC | Direct subclasses per parent | Warn >7 | Warn >5 |
| Override ratio | Overridden methods / inherited methods | Warn >0.5 | Warn >0.4 |
| Decorator depth | Number of nested wrappers implementing same contract | Warn >3 | Warn >2 |
| Interface width | Method count of injected interface | Warn >10 | Warn >7 |
| Constructor dependency count | Required collaborators per class | Warn >5 | Warn >4 |
| Base class afferent coupling | Number of dependents on a base class | Track trend | Track trend |

Interpretation rules:

- prioritize trend increases on touched code,
- require justification for threshold exceptions,
- never block migrations that reduce long-term coupling with temporary local increases.

---

## Language-Specific Tooling Map

Use practical tooling already available in your stack.

### Python

- `radon` for cyclomatic complexity and maintainability trend.
- `lizard` for LOC/complexity thresholds.
- `pylint` rules for ancestry and abstract-method conformance.

### Java / Kotlin

- Sonar or equivalent for DIT and coupling checks.
- PMD/Checkstyle for class size and coupling indicators.
- Custom compiler plugin/rule for sealing-by-default if needed.

### C# / .NET

- Sonar analyzers for inheritance-depth and abstraction checks.
- Roslyn analyzers for custom “extends justification” rules.
- Optional architecture analyzers for dependency boundaries.

### TypeScript / JavaScript

- ESLint plus architecture linting for class overuse and dependency structure.
- SonarJS for inheritance and complexity guardrails.
- CI scripts to detect wrapper/provider depth in frontend modules.

### Go / Rust

- lints for interface bloat and complexity.
- package-level metrics scripts for type growth and coupling drift.
- custom checks for trait/interface width and constructor-like factory arguments.

---

## Custom Static Checks

Implement high-value checks early.

1. **New inheritance requires explicit justification**
   - Fail when new `extends` appears without an inline `is-a` rationale.

2. **Sealed/final by default**
   - Fail when newly introduced base types are left open without reason.

3. **Abstract with one implementation smell**
   - Warn when abstract roots have a single concrete subtype for extended periods.

4. **Overridden-majority smell**
   - Warn when subclasses override most inherited behavior.

5. **Decorator depth check**
   - Warn when wrapper chains exceed policy.

6. **Large injected interface check**
   - Warn when collaborators violate interface segregation.

7. **Service locator usage check**
   - Fail when business classes resolve dependencies from global containers.

---

## Reporting and Trend Management

Publish a weekly architecture report including:

- top modules by DIT growth,
- top base classes by NOC,
- largest override-ratio outliers,
- deepest decorator/provider stacks,
- number of waivers added and removed.

Prefer regression gating:

- fail on worsened metrics in touched files,
- allow unrelated historical debt to pass with visibility.

Use release checkpoints to tighten thresholds gradually.

---

## Waiver Policy

Allow waivers with strict structure.

Each waiver must include:

- metric/check being waived,
- affected module/class,
- reason (framework requirement, migration phase, performance evidence),
- expiration or review date,
- owner accountable for removal.

Reject permanent waivers without renewal review.

---

## Team Conventions

Adopt conventions that reduce ambiguity:

- default class openness: closed unless explicitly opened,
- one composition root per layer,
- constructor injection for required dependencies,
- narrow role-based interfaces,
- explicit inheritance rationale comments.

Add naming conventions that avoid accidental abstraction inflation:

- avoid `Abstract*` unless multiple stable implementations exist,
- favor role-based names (`PricingStrategy`, `AuditSink`, `Clock`).

---

## Adoption Rollout Plan

Use phased rollout:

1. **Phase 1: Visibility**
   - Collect metrics, no build failures.

2. **Phase 2: Soft enforcement**
   - Fail only on new severe regressions.

3. **Phase 3: Policy enforcement**
   - Apply mature thresholds to touched modules.

4. **Phase 4: Debt reduction**
   - Schedule backlog items for top offenders.

Tie rollout to team capacity; avoid all-at-once enforcement.

---

## Governance Deliverable Template

```markdown
## Baseline
- Date:
- Scope:
- Current metric snapshot:

## Policy
- Thresholds:
- Failing conditions:
- Waiver process:

## Tooling
- CI jobs:
- Static checks enabled:
- Reporting cadence:

## Adoption plan
- Current phase:
- Next phase trigger:
- Owners:

## Risks
- Expected false positives:
- Mitigations:
```
