# Hierarchy, Vertical Slicing, and Splitting Techniques

## Table of Contents

- [Hierarchy and Grouping](#hierarchy-and-grouping)
  - [The Principle](#the-principle)
  - [When to Use Sub-items](#when-to-use-sub-items)
  - [When to Use Epics](#when-to-use-epics)
  - [Handling Dependencies in the Hierarchy](#handling-dependencies-in-the-hierarchy)
- [Vertical Slicing](#vertical-slicing)
  - [The Core Concept](#the-core-concept)
  - [Why Vertical Slicing Matters](#why-vertical-slicing-matters)
  - [Thin Slices, Not Skeletons](#thin-slices-not-skeletons)
- [Splitting Techniques](#splitting-techniques)
  - [Specific Splitting Patterns](#specific-splitting-patterns)
  - [Choosing a Pattern](#choosing-a-pattern)

---

## Hierarchy and Grouping

### The Principle

Dependent items are grouped under an item of the next-higher hierarchy level. The typical hierarchy has three levels:

```text
Epic
└── Work Item (story, task, feature — terminology varies)
    └── Sub-item (subtask, child issue)
```

| Level | Purpose | Lifecycle |
|---|---|---|
| **Epic** | Groups related work items that collectively deliver a larger capability or outcome. | Spans multiple sprints. Closed when all child items are done or the epic's goal is met. |
| **Work Item** | A single PBI that satisfies all six quality characteristics. This is the primary unit of planning, prioritization, and delivery. | Completed within a single sprint. |
| **Sub-item** | A decomposition of a work item into execution steps for the team's internal coordination. | Completed within a single sprint, often within days. Not independently valuable or releasable. |

### When to Use Sub-items

Sub-items are optional. Use them when a work item involves multiple disciplines (e.g., frontend, backend, infrastructure) and the team needs to coordinate handoffs or parallel work within the sprint.

Do not use sub-items as a substitute for splitting. If a "sub-item" has its own acceptance criteria, could be independently released, and delivers value on its own, it should be a work item — not a sub-item.

A practical test: if the sub-item count exceeds 5–7 for a single work item, the work item is too large. Split the work item instead of adding more sub-items.

### When to Use Epics

Epics exist to provide context and grouping, not to be "completed" in the traditional sense. An epic is well-formed when:

- It articulates a clear outcome or capability (not just a topic label).
- Its child work items collectively deliver that outcome.
- It has an explicit completion condition (all children done, or a measurable goal met).

Avoid using epics as permanent categories or project labels. Epics should be closable.

### Handling Dependencies in the Hierarchy

When two work items have a hard dependency (A must be done before B), prefer one of these strategies in order:

1. **Eliminate the dependency.** Restructure the items so each is self-contained. This is the best outcome.
2. **Merge the items.** If both are small and tightly coupled, combine them into a single work item.
3. **Group under a parent.** Place both items under the same epic and document the ordering constraint explicitly. The dependency is visible in the hierarchy.
4. **Link explicitly.** If the items belong to different epics, use a dependency link (e.g., "blocked by," "depends on") and ensure both teams are aware.

---

## Vertical Slicing

### The Core Concept

A vertical slice cuts through all layers of the system that must change to deliver the PBI's outcome. A horizontally sliced item changes only one layer (e.g., "build the API endpoint" or "create the database schema"). A vertically sliced item changes every layer necessary to deliver observable value to a stakeholder.

```text
Horizontal slicing:              Vertical slicing:

┌──────────────────────┐         ┌─────┬─────┬──────┐
│       UI Layer       │         │  S  │  S  │  S   │
├──────────────────────┤         │  l  │  l  │  l   │
│    Business Logic    │         │  i  │  i  │  i   │
├──────────────────────┤         │  c  │  c  │  c   │
│    Data / Storage    │         │  e  │  e  │  e   │
└──────────────────────┘         │  1  │  2  │  3   │
                                 └─────┴─────┴──────┘
Each row = one PBI               Each column = one PBI
No PBI is independently          Each PBI is independently
releasable until all             releasable and delivers
layers are assembled.            end-to-end value.
```

### Why Vertical Slicing Matters

- **Independent releasability.** Each slice can be deployed, demonstrated, and validated on its own.
- **Earlier feedback.** Stakeholders see working functionality sooner. Course corrections are cheaper.
- **Reduced integration risk.** Integration happens with every slice, not at the end. Issues surface incrementally.
- **Clearer value signal.** Each slice either delivers value or it does not. Horizontal layers provide no signal until assembly.

### Thin Slices, Not Skeletons

The goal is a thin slice of value, not a skeletal implementation. A thin slice:

- Handles one scenario end-to-end, with production-quality behavior for that scenario.
- May use simplified UI, handle only one data variation, or support only the happy path — but what it does, it does completely.
- Meets the team's Definition of Done.

A skeleton, by contrast, touches every layer but does nothing completely. Walking skeletons have their place (early architecture validation), but they are spikes — not deliverable PBIs.

---

## Splitting Techniques

Apply the splitting meta-pattern from the main skill instructions, then choose a pattern below based on the dominant source of variation.

### Specific Splitting Patterns

Each pattern reduces one type of variation to a single instance for the first slice.

**By Workflow Steps:** When a PBI describes a multi-step process, split by steps. Deliver the beginning and end first (they carry the most value and risk), then enhance with intermediate steps.
*Example:* "User submits and tracks an expense report" → (1) User submits a report with a single line item, (2) Manager approves/rejects, (3) User adds multiple line items, (4) User tracks status.

**By Business Rule Variations:** When behavior changes based on conditions, split by rule. Deliver the most common or highest-value rule first.
*Example:* "System calculates shipping cost" → (1) Domestic standard, (2) Domestic express, (3) International, (4) Free shipping over threshold.

**By Data Variations:** When a PBI handles multiple data types or formats, split by data variation.
*Example:* "Import contacts from file" → (1) CSV, (2) vCard, (3) Excel.

**By User Role or Persona:** When different user groups interact differently, split by role.
*Example:* "Dashboard displays metrics" → (1) Operations team (real-time throughput), (2) Executives (weekly trends).

**By Interface or Platform:** When a feature must work across multiple interfaces, split by interface. Deliver the highest-traffic interface first.
*Example:* "User resets password" → (1) Web, (2) Mobile app.

**By Happy Path / Edge Cases:** Deliver the happy path first. Add error handling and edge cases as subsequent slices.
*Example:* "User uploads a profile photo" → (1) Valid JPEG under 5MB, (2) Invalid file types with error, (3) Oversized files with compression or rejection.

**By CRUD Operations:** When a PBI involves full lifecycle management, split by operation.
*Example:* "Manage notification preferences" → (1) View, (2) Update, (3) Reset to defaults.

**By Major Effort / Minor Effort:** When one aspect represents the bulk of the work, split it off as the first slice.
*Example:* "Integrate with payment provider" → (1) Process a single credit-card payment, (2) Saved payment methods, (3) Refunds.

**Spike / Implementation Split:** When uncertainty is the blocker, split into a time-boxed spike (research) and subsequent implementation.
*Example:* "Migrate from PostgreSQL to CockroachDB" → (1) Spike: benchmark with production-representative workload (2 days), (2) Migrate read-heavy tables, (3) Migrate write-heavy tables.

### Choosing a Pattern

Start with the meta-pattern. Ask: "What are the variations?" Then pick the splitting pattern that addresses the dominant source of variation. If the PBI has multiple sources of variation, apply patterns iteratively — split once, then evaluate whether the resulting pieces need further splitting.

When multiple patterns could apply, prefer the one that:

1. Produces slices where the first slice carries the most value and risk.
2. Leaves clearly low-value slices that can be deprioritized or dropped.
3. Produces the most independent slices (fewest dependencies between them).
