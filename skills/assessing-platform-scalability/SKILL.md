---
name: assessing-platform-scalability
description: Performs end-to-end platform scalability assessments using a phased methodology, maturity scoring model, risk classification, and prioritized remediation planning. Produces structured scalability reports with evidence, scorecards, and actionable roadmaps, plus optional executive summaries and incident runbook drafts. Use when evaluating whether a system can handle growth, diagnosing scaling bottlenecks, preparing technical due diligence, designing load or resilience validation plans, or building a scalability improvement strategy.
category: System Architecture
---

# Assessing Platform Scalability

## Quick start

1. Confirm the engagement objective, growth scenario, and target timeline.
2. Select scope using the phase map in [references/01-foundations-methodology-maturity.md](references/01-foundations-methodology-maturity.md).
3. Collect required evidence before scoring.
4. Run phased assessment activities and capture findings with evidence.
5. Compute the maturity score and classify risks.
6. Deliver a prioritized roadmap with immediate, short-term, and medium-term actions.

## Default output

Produce this by default unless the user asks for a different format:

1. Overall maturity score with dimension-level breakdown
2. Top risks (severity + business impact)
3. Prioritized recommendations (impact/effort)
4. Capacity and cost implications
5. Next-step implementation plan with owners and sequencing

If requested, also produce:

- Executive presentation outline
- Operational runbook drafts for high-risk scenarios

## Workflow

### 1) Frame the engagement

- Capture the target growth event (for example: 2x traffic, regional expansion, enterprise onboarding).
- Establish success criteria (latency, availability, throughput, cost envelope, compliance constraints).
- Identify whether a full-scope or targeted assessment is needed.
- Select phases and justify exclusions.

Use:

- [references/01-foundations-methodology-maturity.md](references/01-foundations-methodology-maturity.md) (scope, prerequisites, scoring model)

### 2) Build the evidence pack first

Collect concrete evidence before analysis:

- Architecture and dependency diagrams
- Database schema and query-performance data
- Infrastructure and deployment configuration
- Monitoring dashboards and alert definitions
- Incident history and operational runbooks
- Growth projections and cost trends
- Compliance and residency constraints

Reject unsupported claims. Mark them as assumptions until validated.

Use:

- [references/01-foundations-methodology-maturity.md](references/01-foundations-methodology-maturity.md) (pre-engagement checklist)

### 3) Execute phase assessments

Run only the phases needed for scope, but always evaluate architecture, database, and validation readiness.

- Phases 1–2: [references/02-phases-1-2-discovery-database.md](references/02-phases-1-2-discovery-database.md)
- Phases 3–4: [references/03-phases-3-4-application-and-data-pipelines.md](references/03-phases-3-4-application-and-data-pipelines.md)
- Phases 5–6: [references/04-phases-5-6-infrastructure-and-security.md](references/04-phases-5-6-infrastructure-and-security.md)
- Phases 7–10: [references/05-phases-7-10-compliance-testing-observability-resilience.md](references/05-phases-7-10-compliance-testing-observability-resilience.md)
- Phases 11–12 + anti-patterns + migration paths: [references/06-phases-11-12-anti-patterns-migrations.md](references/06-phases-11-12-anti-patterns-migrations.md)

For each phase, produce:

- Current state summary
- Strengths
- Gaps and risks
- Evidence references
- Recommended actions

### 4) Score maturity consistently

- Score each dimension D1–D10 on a 1–5 scale.
- Apply weights unless the client context requires adjusted weighting.
- Document evidence for every score.
- Avoid scoring based on opinion or aspiration.

Use:

- [references/01-foundations-methodology-maturity.md](references/01-foundations-methodology-maturity.md) (levels, dimensions, weighting)

### 5) Convert findings into decisions

- Classify risks by severity and likelihood.
- Prioritize recommendations by impact/effort.
- Separate urgent reliability fixes from longer-term architecture evolution.
- Include cost-of-inaction for high and critical risks.

Use:

- [references/07-reporting-and-runbooks.md](references/07-reporting-and-runbooks.md) (risk classification and prioritization)

### 6) Produce deliverables

Generate concise deliverables aligned to audience:

- Technical report for engineering leadership
- Executive summary for business stakeholders
- Optional runbooks for urgent operational scenarios

Use:

- [references/07-reporting-and-runbooks.md](references/07-reporting-and-runbooks.md) (report structure, executive template, runbooks)

## Phase routing map

Use this map to load only relevant reference material:

- Foundations, engagement method, maturity model: [references/01-foundations-methodology-maturity.md](references/01-foundations-methodology-maturity.md)
- Discovery + architecture + interviews + database: [references/02-phases-1-2-discovery-database.md](references/02-phases-1-2-discovery-database.md)
- Application layer, multi-tenancy, and data pipelines: [references/03-phases-3-4-application-and-data-pipelines.md](references/03-phases-3-4-application-and-data-pipelines.md)
- Infrastructure elasticity and security at scale: [references/04-phases-5-6-infrastructure-and-security.md](references/04-phases-5-6-infrastructure-and-security.md)
- Compliance, load validation, observability, resilience: [references/05-phases-7-10-compliance-testing-observability-resilience.md](references/05-phases-7-10-compliance-testing-observability-resilience.md)
- Capacity, cost, org/process, anti-patterns, migrations: [references/06-phases-11-12-anti-patterns-migrations.md](references/06-phases-11-12-anti-patterns-migrations.md)
- Reporting outputs and runbook templates: [references/07-reporting-and-runbooks.md](references/07-reporting-and-runbooks.md)
- Tooling options, benchmark calibration, assessment checklists: [references/08-tools-benchmarks-checklists.md](references/08-tools-benchmarks-checklists.md)

## Examples

**Input:** "Assess whether our B2B SaaS platform can handle 3x traffic in the next 9 months. We suspect the database and tenant isolation model are bottlenecks."

**Output:** A scoped assessment plan covering phases 1, 2, 3, 8, and 11, with evidence requirements, a D1–D10 scoring template, prioritized risks, and a sequenced recommendation roadmap.

**Input:** "Prepare a due-diligence-ready scalability evaluation for an acquisition target."

**Output:** A full-phase assessment outline, maturity scorecard structure, risk classification matrix, and executive-ready reporting package with optional runbook drafts.

## Quality gates

Before finalizing recommendations, verify all of the following:

- Every major conclusion cites direct evidence.
- All critical risks include concrete business impact.
- Maturity scores align with observed capability, not intent.
- Recommendations include owner, sequencing, and expected outcome.
- At least one validation method is defined for each high-impact recommendation.

## Edge cases

- **No production-like test environment:** Use controlled synthetic tests, conservative confidence levels, and explicit uncertainty notes.
- **Incomplete observability:** Add instrumentation gaps as first-order findings, not appendix notes.
- **No growth forecast available:** Produce scenario-based forecasts (conservative / expected / aggressive).
- **Strong disagreement among stakeholders:** Document conflicting claims and evaluate each against observed evidence.
- **Regulated context with limited testing freedom:** Emphasize architecture and controls analysis, then recommend compliant validation methods.

## Terminology

Use these terms consistently:

- **Scalability assessment** (overall engagement)
- **Dimension** (D1–D10 scoring area)
- **Phase** (method step)
- **Risk severity** (critical/high/medium/low)
- **Recommendation roadmap** (prioritized implementation plan)
