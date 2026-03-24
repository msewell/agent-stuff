# PBI Quality Characteristics and Description

## Table of Contents

- [Quality Characteristics](#quality-characteristics)
- [Resolving Conflicts Between Characteristics](#resolving-conflicts-between-characteristics)
- [Relationship to INVEST and FIRST](#relationship-to-invest-and-first)
- [PBI Description Requirements](#pbi-description-requirements)
- [Writing Effective Acceptance Criteria](#writing-effective-acceptance-criteria)
- [The "Three Amigos" Refinement](#the-three-amigos-refinement)

---

## Quality Characteristics

Well-formed PBIs share six characteristics, listed in priority order — when characteristics conflict, higher-ranked ones take precedence.

### 1. Valuable

The PBI delivers measurable value to stakeholders. Every item on the backlog exists because someone needs the outcome it produces. If a PBI cannot be connected to a stakeholder need, it does not belong on the backlog.

Value is the non-negotiable filter. A technically elegant PBI that delivers no stakeholder value is waste. When splitting, every resulting piece must retain demonstrable value — splits that resemble developer tasks without a visible stakeholder outcome fail this test.

### 2. Completable

The PBI can be realistically, objectively, and unambiguously completed. There is a clear finish line. Anyone looking at the item can determine whether it is done or not, without relying on subjective judgment.

This replaces the traditional "Testable" criterion with a stronger requirement: not only must the item be verifiable, but the verification must be unambiguous and the scope of work must be realistic. A PBI that is technically testable but practically unbounded (e.g., "improve performance") fails this criterion. Rewrite it with a concrete threshold (e.g., "reduce p95 latency of endpoint X below 200ms").

### 3. Negotiable

PBIs are not contracts. They capture intent, not implementation. The description should communicate the problem and desired outcome clearly enough that the team can discuss and negotiate the best approach.

The sweet spot: enough context to have a meaningful discussion, enough flexibility that the team can choose how to deliver.

### 4. Independent

The PBI is self-contained. It can be moved to any position on the backlog, individually released, and does not require another PBI to be completed first.

Full independence is an ideal — in practice, some coupling is unavoidable. When dependencies exist, make them explicit and group dependent items under a shared parent in the hierarchy. The goal is to minimize mandatory ordering constraints so that the product owner retains maximum flexibility in prioritization.

### 5. Commensurate

The total effort required to complete the PBI is approximately the same as that of other PBIs in the backlog. Items are roughly uniform in size.

This replaces "Estimable" from traditional frameworks. When all items are approximately the same size, expert estimation becomes unnecessary. Throughput — the count of items completed per unit of time — becomes a reliable forecasting metric.

Commensurate does not mean identical. It means items fall within a narrow band. If one PBI would take half a day and another two weeks, they are not commensurate and the larger one needs further splitting.

### 6. Small

The PBI cannot be broken down further without violating the characteristics above. It can be completed within a single sprint or iteration.

Smallness is listed last because it is bounded by the other characteristics. Splitting a PBI into pieces so small that each piece loses its value, becomes ambiguous to complete, or creates tight coupling between the pieces is counterproductive. The right size is the smallest size that preserves value, completability, negotiability, independence, and commensurateness.

A practical heuristic: a single PBI should represent no more than one-fifth to one-tenth of the team's capacity for a sprint.

---

## Resolving Conflicts Between Characteristics

| Conflict | Resolution |
|---|---|
| **Valuable vs. Small** | Prefer value. If further splitting would destroy the item's value, stop splitting. |
| **Independent vs. Small** | Prefer independence. If a smaller split creates a hard dependency on another item, keep the items together or group them under a parent. |
| **Commensurate vs. Valuable** | Prefer value. A high-value PBI that is somewhat larger than average is better than splitting it into pieces where some lack clear value. Offset by splitting other large items more aggressively. |
| **Completable vs. Negotiable** | Prefer completability. Acceptance criteria must be unambiguous even if the implementation approach remains open for discussion. |

---

## Relationship to INVEST and FIRST

This framework diverges from **INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable) in two ways: "Estimable" is replaced by "Commensurate" (target uniform sizing instead of asking whether an item *can* be estimated), and "Testable" is replaced by "Completable" (a stricter criterion that subsumes testability). Additionally, characteristics are explicitly priority-ordered rather than presented as a flat list.

**FIRST** (Fast, Independent, Repeatable, Self-validating, Timely) focuses on flow and speed. It works well for Kanban contexts but can lead teams to optimize throughput of low-value items. This framework places value explicitly at the top of the priority stack to prevent that failure mode.

---

## PBI Description Requirements

PBI descriptions can take any format. The format is irrelevant. What matters is that the description covers these concerns:

| Section | Purpose | Guidance |
|---|---|---|
| **Problem** | What stakeholder need or pain point does this address? | Be specific. Name the affected user segment and the observable symptom. Avoid solutioning in this section. |
| **Proposed Solution** | What change will address the problem? | Describe the intended approach at an appropriate level of abstraction. Leave room for the team to negotiate implementation details. |
| **Expected Impact** | What measurable outcome will result? | Connect the solution to a stakeholder metric or qualitative improvement. This is how the product owner justifies the item's position on the backlog. |
| **Timelines** | Are there external deadlines, release windows, or time-sensitivity factors? | Only include when applicable. Not every PBI has a deadline. When one exists, state it explicitly. |
| **Dependencies** | Does this item depend on or block other items? | List any items that must be completed first, or any items waiting on this one. Reference them by identifier. If there are no dependencies, omit this section. |
| **Acceptance Criteria** | How will we know this is done? | Define the conditions under which the PBI is considered complete. These must be objectively verifiable — a binary pass/fail, not a judgment call. |

---

## Writing Effective Acceptance Criteria

Good acceptance criteria share these properties:

- **Binary.** Each criterion passes or fails. There is no partial credit.
- **Independently verifiable.** Each criterion can be checked on its own, without requiring other criteria to be true.
- **Behavior-focused.** Describe what the system does in response to a trigger, not how it is implemented internally.
- **Bounded.** Aim for 1–3 acceptance criteria per PBI. 4 or more indicates the PBI is likely too large and should be split.

Any format works: plain-language checklists, Given/When/Then (Gherkin) scenarios, decision tables, or visual specifications. Choose the format that communicates most clearly with the team.

When using Given/When/Then:

- **Given** states the precondition — the system's starting state.
- **When** states the trigger — the action or event.
- **Then** states the expected outcome.

Keep each scenario atomic: one behavior per scenario. If a single scenario needs multiple When/Then pairs, it is testing more than one behavior and should be split.

---

## The "Three Amigos" Refinement

Acceptance criteria are most effective when written collaboratively by at least three perspectives: someone who understands the business need, someone who will build the solution, and someone who will verify it. This "three amigos" practice surfaces ambiguity, missing edge cases, and implementation risks before work begins.

The same pattern applies to splitting — the product owner brings the value perspective, developers bring the technical perspective, and testers bring the edge-case perspective.
