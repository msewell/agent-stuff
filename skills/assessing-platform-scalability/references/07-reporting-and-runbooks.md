# Reporting Deliverables and Post-Assessment Runbooks

## Table of Contents

- [Reporting Objectives](#reporting-objectives)
- [Default Technical Report Structure](#default-technical-report-structure)
- [Risk Classification Model](#risk-classification-model)
- [Recommendation Prioritization Framework](#recommendation-prioritization-framework)
- [Executive Presentation Template](#executive-presentation-template)
- [Narrative Style Guidance](#narrative-style-guidance)
- [Runbook Maturity Evaluation](#runbook-maturity-evaluation)
- [Runbook Template: Traffic Spike Response](#runbook-template-traffic-spike-response)
- [Runbook Template: Database Failover](#runbook-template-database-failover)
- [Runbook Template: Emergency Capacity Expansion](#runbook-template-emergency-capacity-expansion)
- [Handoff Checklist](#handoff-checklist)

---

## Reporting Objectives

Produce outputs that support decision-making, not just documentation.

Every report should help stakeholders decide:

- What must be fixed now
- What can be sequenced later
- What investment level is required
- What risk remains after planned remediation

## Default Technical Report Structure

Use this structure unless the user asks for a different format.

### 1) Executive summary

Include:

- Overall maturity score
- Whether projected growth is supportable and under what conditions
- Top risks and recommended immediate actions

### 2) Maturity scorecard

Include:

- D1–D10 scores with justification
- Confidence level per dimension
- Weighted overall score and interpretation

### 3) Findings by phase

For each included phase:

- Current state
- Strengths
- Risks and gaps
- Evidence references
- Recommendation summary

### 4) Risk register

For each risk:

- Severity
- Likelihood
- Business impact
- Trigger conditions
- Recommended mitigation
- Owner

### 5) Recommendation roadmap

Organize by timeline:

- Immediate (0–3 months)
- Short term (3–6 months)
- Medium term (6–12 months)
- Long term (12+ months)

### 6) Validation plan

Include:

- How each major recommendation will be validated
- Metrics that indicate successful remediation
- Review cadence and responsible owners

### 7) Cost and capacity implications

Include:

- Capacity runway summary
- Cost-at-scale scenarios
- Trade-off notes for major recommendations

### 8) Optional appendices

- Detailed checklists
- Raw test result summaries
- Runbook drafts

## Risk Classification Model

Use this severity model consistently.

| Severity | Definition |
|---|---|
| Critical | Likely to cause severe outage, data loss, or hard scaling stop in near-term trajectory |
| High | Likely to produce serious degradation or repeated incidents under expected growth |
| Medium | Limits efficiency or increases risk/cost but not immediate existential risk |
| Low | Improvement opportunity with minor short-term risk impact |

For each risk, include:

- Likelihood (low/medium/high)
- Confidence (low/medium/high)
- Earliest expected impact window

## Recommendation Prioritization Framework

Score each recommendation using:

- **Impact (1–5)**: expected improvement in scalability/reliability/cost
- **Effort (1–5)**: implementation complexity and organizational load

Use resulting classes:

| Class | Profile | Action |
|---|---|---|
| Quick win | High impact, low effort | Execute immediately |
| Strategic investment | High impact, high effort | Plan as funded initiative |
| Incremental improvement | Low impact, low effort | Bundle into normal delivery |
| Deprioritized | Low impact, high effort | Defer unless context changes |

## Executive Presentation Template

Use 10–12 slides for leadership audiences.

Suggested slide flow:

1. Engagement scope and objective
2. Scalability verdict
3. Overall maturity and key dimensions
4. Top risks in business terms
5. Risk timeline and urgency
6. Capacity outlook and first-exhaustion resource
7. Cost-at-scale projection
8. Prioritized recommendation map
9. Investment request and expected outcomes
10. Next steps and ownership model

## Narrative Style Guidance

Keep reporting language:

- Evidence-led
- Action-oriented
- Explicit about uncertainty
- Clear on business impact

Avoid:

- Tool-specific evangelism
- Unbounded technical detail in executive outputs
- Recommendation lists without sequencing

## Runbook Maturity Evaluation

Assess existing runbooks before delivering new templates.

Score each criterion 1–5:

- Coverage of critical scenarios
- Currency and update discipline
- Actionability (step precision)
- Accessibility during incidents
- Validation/testing frequency
- Ownership clarity

If average score <3, include runbook uplift work in near-term roadmap.

## Runbook Template: Traffic Spike Response

```text
RUNBOOK: Traffic Spike Response
Owner: [TEAM]
Review cadence: [MONTHLY/QUARTERLY]

Trigger:
- Request rate exceeds [THRESHOLD] for [DURATION]
- p95 latency exceeds [THRESHOLD]
- Error rate exceeds [THRESHOLD]

Immediate steps (first 15 minutes):
1) Confirm signal is real (not telemetry anomaly)
2) Check autoscaling status and convergence
3) Verify bottleneck tier (app, DB, cache, queue, dependency)
4) Apply pre-approved capacity action if thresholds are met
5) Post incident update in designated communication channel

Escalation:
- If unresolved after [X minutes], page [ROLE]
- If dependency issue dominates, engage [TEAM/VENDOR]

Closure:
- Confirm metrics stabilized for [WINDOW]
- Create follow-up tasks for threshold and policy tuning
```

## Runbook Template: Database Failover

```text
RUNBOOK: Database Failover
Owner: [TEAM]
Review cadence: [MONTHLY/QUARTERLY]

Trigger:
- Primary unavailable for > [DURATION]
- Replication lag above [THRESHOLD]
- Error rate from DB operations above [THRESHOLD]

Pre-checks:
1) Verify outage scope from multiple vantage points
2) Validate replica health and lag status
3) Confirm acceptable recovery point trade-off

Execution:
1) Promote designated replica (or verify auto-failover)
2) Redirect application connection target
3) Validate write/read path health
4) Monitor error rate and latency post-switchover

Post-failover:
- Re-establish redundancy
- Document timeline and outcome
- Schedule failback test if required
```

## Runbook Template: Emergency Capacity Expansion

```text
RUNBOOK: Emergency Capacity Expansion
Owner: [TEAM]
Review cadence: [MONTHLY/QUARTERLY]

Trigger:
- Capacity runway below [THRESHOLD WINDOW]
- Growth event exceeds planned envelope
- Incident reveals insufficient headroom

Assessment:
1) Identify constrained resource category
2) Confirm mitigation options and lead times
3) Select pre-approved expansion path

Execution:
- Compute: adjust autoscaling limits or instance class
- Database: expand read capacity or upgrade tier
- Storage: provision additional capacity / enable auto-grow
- Queue/stream: scale consumers and partition capacity

Validation:
- Confirm throughput and latency improvement
- Validate stability for [OBSERVATION WINDOW]

Follow-up:
- Update forecast and cost model
- Convert emergency action into durable plan
```

## Handoff Checklist

- [ ] Technical report includes evidence-backed findings
- [ ] Risk register includes severity, likelihood, confidence, and owner
- [ ] Recommendations are prioritized and sequenced
- [ ] Validation plan is explicit for high-impact changes
- [ ] Executive summary is understandable without deep technical context
- [ ] Runbook updates are assigned to owning teams
- [ ] Review cadence and governance are documented
