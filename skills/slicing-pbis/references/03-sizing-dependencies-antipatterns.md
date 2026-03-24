# Sizing, Dependencies, Anti-Patterns, and Checklists

## Table of Contents

- [Commensurate Sizing and Throughput Forecasting](#commensurate-sizing-and-throughput-forecasting)
  - [Why Commensurate Sizing Matters](#why-commensurate-sizing-matters)
  - [The Throughput Forecasting Model](#the-throughput-forecasting-model)
  - [When Items Are Not Commensurate](#when-items-are-not-commensurate)
  - [Flow Metrics](#flow-metrics)
- [Managing Dependencies](#managing-dependencies)
  - [Types of Dependencies](#types-of-dependencies)
  - [Strategies for Reducing Dependencies](#strategies-for-reducing-dependencies)
  - [Making Dependencies Visible](#making-dependencies-visible)
- [Anti-Patterns](#anti-patterns)
- [Refinement Checklists](#refinement-checklists)
  - [A. Is This PBI Well-Formed?](#a-is-this-pbi-well-formed)
  - [B. Should This PBI Be Split?](#b-should-this-pbi-be-split)
  - [C. Is This PBI Ready for Sprint?](#c-is-this-pbi-ready-for-sprint)

---

## Commensurate Sizing and Throughput Forecasting

### Why Commensurate Sizing Matters

Traditional agile estimation asks: "How big is this item?" (in story points, hours, or T-shirt sizes). This requires the team to assess complexity, uncertainty, and effort for each item — a practice that is time-consuming, frequently inaccurate, and fraught with cognitive biases.

Commensurate sizing asks a different question: "Is this item roughly the same size as the others?" This is a cheaper question to answer, requires less expertise, and produces a more useful outcome: a backlog where items are approximately uniform.

### The Throughput Forecasting Model

When items are approximately the same size, counting them becomes a valid forecasting method:

1. **Measure throughput.** Track the number of PBIs completed per sprint (or per week, or per day).
2. **Count remaining items.** Count the PBIs remaining in the backlog for a given scope.
3. **Forecast.** Divide remaining items by throughput to project a completion date.

**Example:** A team completes an average of 8 PBIs per sprint. There are 32 PBIs remaining for a release. Forecast: 4 sprints.

For greater confidence, apply probabilistic forecasting (e.g., Monte Carlo simulation) using historical throughput data. This yields a range: "There is an 85% probability of completing these 32 items within 5 sprints."

### When Items Are Not Commensurate

If some items are consistently much larger or smaller than others, the throughput metric loses reliability. Symptoms:

- High variance in sprint completion counts (e.g., 3 items one sprint, 12 the next).
- Frequent spillover of items across sprint boundaries.
- Forecasts that consistently miss by wide margins.

The remedy is to split the outliers. An item twice the typical size should be split in two. An item half the typical size may be a sub-item masquerading as a work item — absorb it into its parent or merge it with a related item.

Commensurate sizing is aligned with the #NoEstimates philosophy: rather than spending time producing estimates that decay quickly, invest that time in splitting items to a uniform size and let empirical throughput data do the forecasting.

### Flow Metrics

Throughput is the primary metric, but it works best alongside other flow metrics:

| Metric | What It Measures | Why It Matters |
|---|---|---|
| **Throughput** | PBIs completed per time period | Forecasting delivery dates |
| **Cycle Time** | Time from work started to work completed for a single PBI | Identifying bottlenecks and setting expectations for individual items |
| **Work In Progress (WIP)** | Number of items currently being worked on | Controlling overload; Little's Law relates WIP, throughput, and cycle time |
| **Work Item Age** | Time since an in-progress item was started | Early warning for items that are stalling |

---

## Managing Dependencies

### Types of Dependencies

| Type | Description | Example |
|---|---|---|
| **Functional** | PBI B requires functionality delivered by PBI A. | "Display order history" depends on "Store order records." |
| **Technical** | PBI B requires infrastructure or architecture established by PBI A. | "Deploy to Kubernetes" depends on "Set up cluster." |
| **Cross-team** | PBI B requires work from a different team. | "Mobile app displays notifications" depends on another team's "Notification service API." |
| **External** | PBI B requires input from outside the organization. | "Integrate tax calculation" depends on a third-party API becoming available. |

### Strategies for Reducing Dependencies

Listed in order of preference:

1. **Eliminate by restructuring.** Rewrite PBIs so each is self-contained. Always attempt this first. Often, a PBI that appears dependent can be split differently to remove the coupling.
2. **Absorb by merging.** If two PBIs are small and tightly coupled, merge them into one.
3. **Decouple with interfaces.** Define a contract (API, data format, interface) between the dependent items. Each team builds to the contract independently.
4. **Stub or mock.** Build PBI B against a stub of PBI A's functionality. Replace the stub when PBI A is delivered.
5. **Sequence explicitly.** Make the ordering constraint explicit. Place both items under the same parent in the hierarchy and document which must come first.
6. **Timebox with a spike.** When the dependency is caused by uncertainty, create a time-boxed spike to resolve it.

### Making Dependencies Visible

Dependencies that exist only in someone's head are the most dangerous kind. Make them visible:

- Use explicit link types in the tracking tool (e.g., "blocked by," "depends on").
- Surface dependencies during refinement, not during the sprint.
- For cross-team dependencies, designate an ambassador from each team responsible for coordination.
- Review the dependency graph regularly. If the graph is getting denser over time, the architecture may need attention.

---

## Anti-Patterns

### Horizontal Slicing

**What it looks like:** PBIs split by technical layer — "Build the API," "Build the UI," "Create the database schema."

**Why it fails:** No individual PBI delivers end-to-end value. The feature only works when all layers are assembled, creating an implicit dependency chain.

**Fix:** Split vertically. Each PBI changes every layer necessary to deliver one complete scenario.

### Tasks Disguised as Stories

**What it looks like:** Technical work items written in story format but lacking stakeholder value. "As a developer, I want to refactor the authentication module so that the code is cleaner."

**Why it fails:** The system is not a user. The developer is not the stakeholder. These fail the "Valuable" criterion.

**Fix:** Technical tasks are legitimate work — but they belong as sub-items under a PBI that delivers stakeholder value, or as part of the team's Definition of Done. If technical work stands alone, write it as a task with a clear problem/solution/impact — without pretending it is a user-facing story.

### Over-Splitting

**What it looks like:** A PBI split into 10+ sub-items or micro-stories, each representing a few hours of work. The pieces cannot be independently released or demonstrated.

**Why it fails:** The overhead of managing many tiny items exceeds the value of the granularity. Items fail the "Valuable" and "Independent" criteria.

**Fix:** Apply the "Small" criterion last. Stop splitting when further division would break value, completability, or independence. Use sub-items or a checklist for internal task tracking rather than creating separate PBIs.

### Splitting Without Involving the Whole Team

**What it looks like:** The product owner splits items alone, or developers split without product-owner input.

**Why it fails:** Product owners splitting alone produce splits that sound valuable but are technically impractical. Developers splitting alone produce technically clean splits that fragment stakeholder value.

**Fix:** Treat splitting as a collaborative activity during refinement using the "three amigos" pattern.

### Premature Splitting

**What it looks like:** Items deep in the backlog (months away from being worked on) are split into fine-grained PBIs.

**Why it fails:** Requirements shift, priorities evolve. Items split months in advance accumulate drift and must be re-refined.

**Fix:** Split just-in-time. Items near the top of the backlog (candidates for the next 1–2 sprints) should be fully split and refined. Items further down should remain at a coarser granularity.

### Gold-Plating the First Slice

**What it looks like:** The first vertical slice includes all edge cases, full error handling, polished UI, and complete documentation.

**Why it fails:** The purpose of the first slice is to deliver core value and learn from it. Loading it with every refinement eliminates the benefit of incremental delivery.

**Fix:** The first slice should be the thinnest possible end-to-end path that delivers value: one happy-path scenario, minimal but functional UI, basic error handling. Subsequent slices add polish.

### Confusing Epics with Categories

**What it looks like:** Epics used as permanent labels (e.g., "Frontend," "Infrastructure," "Technical Debt") that are never closed.

**Why it fails:** Epics that never close provide no signal about progress. They become dumping grounds.

**Fix:** Epics should have a clear outcome and a completion condition. "Reduce page load time below 2 seconds" is an epic. "Performance" is a label.

---

## Refinement Checklists

### A. Is This PBI Well-Formed?

Run through this checklist for every PBI under active refinement.

- [ ] **Valuable:** Can a stakeholder observe the value this delivers?
  (If not, it may be a task disguised as a PBI)
- [ ] **Completable:** Is there a binary pass/fail condition that determines whether this is done?
  (Ambiguous completion criteria lead to scope creep and disagreements at review)
- [ ] **Negotiable:** Is the implementation approach open for the team to discuss and adjust?
  (Over-specified PBIs prevent the team from finding simpler solutions)
- [ ] **Independent:** Can this PBI be released without waiting for another PBI to finish first?
  (If not, make the dependency explicit and consider merging or restructuring)
- [ ] **Commensurate:** Is this PBI roughly the same size as the other PBIs in the backlog?
  (Outliers undermine throughput-based forecasting)
- [ ] **Small:** Can this PBI be completed within a single sprint?
  (If not, apply a splitting pattern)
- [ ] **Problem stated:** Does the description identify the stakeholder need or pain point?
- [ ] **Solution proposed:** Does the description outline the intended approach at an appropriate abstraction level?
- [ ] **Impact articulated:** Does the description connect the solution to a measurable outcome?
- [ ] **Acceptance criteria defined:** Are there 1–3 binary, independently verifiable acceptance criteria?
  (More than 3 suggests the PBI should be split)

### B. Should This PBI Be Split?

If any of the following are true, the PBI is a candidate for further splitting.

- [ ] **Exceeds sprint capacity:** The PBI represents more than one-fifth of the team's sprint capacity.
- [ ] **Multiple acceptance criteria:** The PBI has 4 or more acceptance criteria.
- [ ] **Multiple user roles:** The PBI serves more than one user role with different needs.
- [ ] **Multiple business rules:** The PBI's behavior branches based on conditions or rules.
- [ ] **Multi-step workflow:** The PBI describes a process with more than two sequential steps.
- [ ] **Multiple data formats or platforms:** The PBI must handle several data types, file formats, or interfaces.
- [ ] **High uncertainty:** The team cannot confidently describe how they would implement this.
- [ ] **Size outlier:** This PBI is noticeably larger than the typical PBI in the backlog.

### C. Is This PBI Ready for Sprint?

Run this checklist before pulling a PBI into a sprint. All items in Checklist A should already pass.

- [ ] **Checklist A passes:** The PBI satisfies all well-formedness checks.
- [ ] **No unresolved dependencies:** All blocking items are either complete, explicitly sequenced, or decoupled via stubs/interfaces.
- [ ] **Team has discussed it:** At least the three amigos (business, build, verify) have reviewed the PBI together.
- [ ] **Acceptance criteria are stable:** The acceptance criteria have not changed since the last refinement session.
- [ ] **Timelines are clear:** If the PBI has an external deadline, it is stated in the description and the team is aware.
- [ ] **Vertically sliced:** The PBI delivers end-to-end value through all necessary system layers, not just one layer.
