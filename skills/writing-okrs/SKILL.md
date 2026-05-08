---
name: writing-okrs
description: Writes, refines, and evaluates Objectives and Key Results (OKRs) for any team or org size. Applies a structured quality rubric (6 Objective dimensions, 8 Key Result dimensions), enforces committed vs. aspirational tagging, catches the necessary-but-not-sufficient trap, detects 20 named anti-patterns by severity, and produces complete OKR documents with baselines, targets, metric definitions, and initiative separation. Use when drafting new OKRs, improving or refining draft OKRs, scoring OKRs against a quality rubric, auditing an OKR program for anti-patterns, running planning-week reviews, or when the user mentions OKRs, key results, quarterly goals, objectives, Q1/Q2/Q3/Q4 goal-setting, or OKR planning.
category: Product & Planning
---

# Writing OKRs

## Route by task

| User intent | Workflow |
|---|---|
| Draft new OKRs from provided context | [Write workflow](#write-workflow) |
| Improve existing draft OKRs | [Refine workflow](#refine-workflow) |
| Score or audit existing OKRs | [Evaluate workflow](#evaluate-workflow) |

---

## Write workflow

1. **Structure the output using the template.** Load [references/03-templates.md](references/03-templates.md) and fill every field. Never omit `Parent OKR`, `Type`, or `Why this matters`.

2. **Draft Objectives.** Each must be qualitative (no numbers), directional, and pass the "Who Cares?" test: *if we 1.0'd this, would a customer, investor, or employee notice?* If not, reword or cut.

3. **Draft Key Results using the 4-part formula:**
   ```
   [metric name] from [baseline] to [target] by [date]
   ```
   If a baseline is unknown, use an explicit ⚠️ placeholder — never silently omit it. Format: `⚠️ [replace with actual — e.g., 88%]`. A KR with an unfilled baseline cannot be scored at mid-cycle.

4. **Apply the two litmus tests to every KR:**
   - **Output vs. outcome:** Can the KR be checked off without a metric moving? If yes, it's a task — rewrite as an outcome.
   - **Necessary but not sufficient:** If the team scored 1.0 on every KR, is it possible the Objective still wasn't achieved? If yes, the KR set is insufficient — add or rewrite KRs until their collective success guarantees the Objective.

5. **Tag every OKR as committed or aspirational** (see [Committed vs. aspirational](#committed-vs-aspirational)). An untagged OKR is a rubric hard fail.

6. **Separate initiatives from Key Results.** List initiatives (the projects and bets believed to move the KRs) in the `Initiatives` section — not in the KR list. If initiatives appear in KR slots, move them.

7. **Final rubric pass.** Run [references/01-rubric.md](references/01-rubric.md) on every Objective and KR. Include a compact rubric summary table in the output (dimension → score → pass/fail per Objective and per KR) so the quality check is transparent. Fix anything below threshold before finalizing.

---

## Refine workflow

1. Read the draft OKRs in full.
2. Apply the two litmus tests (output vs. outcome; necessary but not sufficient) to every KR.
3. Check that every KR has all 4 formula parts: metric, baseline, target, date.
4. Check that every Objective passes the "Who Cares?" test and contains no numbers.
5. Check committed/aspirational tagging on every OKR.
6. Run [references/01-rubric.md](references/01-rubric.md) on each Objective and KR.
7. **Produce per-OKR output:**
   - Compact rubric score table (dimension → score → pass/fail)
   - Narrative critique and concrete rewrite suggestion for every failing dimension
   - Clearly distinguish hard fails (any 0 on K1, K2, K8, or any Objective dimension) from point deductions

---

## Evaluate workflow

For program-level audits, planning-week reviews, or end-of-cycle retrospectives.

1. Score each Objective on all 6 dimensions from [references/01-rubric.md](references/01-rubric.md). Flag any 0 as a hard fail.
2. Score each KR on all 8 dimensions. Flag any 0 on K1, K2, or K8 as a hard fail.
3. Run the two OKR-as-a-whole checks: type tagging and initiative separation.
4. Check for anti-patterns using [references/02-anti-patterns.md](references/02-anti-patterns.md).
5. **Produce:**
   - Rubric score table per OKR
   - Narrative per failing dimension with specific rewrite suggestions
   - Anti-pattern findings, grouped by severity
   - Health verdict: **healthy** (0 critical, ≤2 high) / **needs work** (0 critical, 3–5 high) / **at risk** (any critical, or ≥6 high)
   - Top 3 prioritized fixes

---

## Committed vs. aspirational

Every OKR must be explicitly tagged. Mislabeling has predictable failure modes: treating an aspirational OKR as committed drives sandbagging; treating a committed OKR as aspirational signals it's optional.

| Type | Expected score | Miss signal | Use for |
|---|---|---|---|
| **Committed** | 1.0 | Anything < 1.0 is a miss | Regulatory deadlines, fundraising milestones, contractual deliverables |
| **Aspirational** | 0.6–0.7 | Consistent 1.0 means sandbagging | Growth targets, new markets, ambitious technical bets |

Reasonable starting mix: two-thirds aspirational, one-third committed. Too many committed OKRs turns the program into a delivery contract.

---

## Key constraints

- **3–5 Objectives, 2–4 KRs each.** Start by drafting, then cut. Teams capping at 1–3 Objectives complete significantly more KRs than those juggling five or more.
- **No numbers in Objectives.** Numbers belong in KRs.
- **KPIs are not OKRs.** A KPI is a vital sign monitored continuously. A KR is a deliberate campaign to move a KPI from X to Y by date Z. A KPI becomes a KR when you commit to acting on it.
- **Initiatives belong in the roadmap**, not the KR list. Conflating them is the silent killer of most OKR rollouts.
- **Binary KRs are task KRs in disguise.** "Ship X" is binary: done or not done. Reframe as the outcome the ship is intended to cause.

---

## Alignment

Every OKR should answer: *what bigger thing does this support?* Record it in the `Parent OKR` field.

- Use **lineage** (family tree) over strict cascading. Children can be proposed bottom-up; leadership doesn't pre-assign them.
- For cross-functional outcomes, use a **shared Objective with joint ownership** rather than splitting the outcome across team OKRs that pretend to be independent.
- Cap alignment depth at **2 levels** (company → team) for most orgs. Three levels only when the org genuinely needs an intermediate layer.
- Healthy top-down/bottom-up mix: ~60% from leadership direction, ~40% from the team's own knowledge of the work.

---

## Quick anti-pattern scan

Before finalizing any OKR set, check these four critical failures first:

| Anti-pattern | Signal |
|---|---|
| Tasks as KRs | Any KR can be checked off without a metric moving |
| Comp coupling | OKR scores affect bonuses, raises, or promotion decisions |
| Set-and-forget | No weekly check-in cadence established alongside the OKRs |
| Leadership exempt | CEO/founder has no visible OKRs on the same cadence as the team |

Full 20-item checklist with severity ratings and standard fixes: [references/02-anti-patterns.md](references/02-anti-patterns.md)
