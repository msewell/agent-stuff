# Foundations, Engagement Methodology, and Maturity Scoring

## Table of Contents

- [Purpose](#purpose)
- [Scope](#scope)
- [How to Use This Reference](#how-to-use-this-reference)
- [Guiding Principles](#guiding-principles)
- [Engagement Phase Overview](#engagement-phase-overview)
- [Pre-Engagement Requirements](#pre-engagement-requirements)
- [Scoping Matrix](#scoping-matrix)
- [Scalability Maturity Model](#scalability-maturity-model)
- [Scoring Dimensions](#scoring-dimensions)
- [Weighting and Overall Score](#weighting-and-overall-score)
- [Score Interpretation](#score-interpretation)
- [Evidence Quality Rubric](#evidence-quality-rubric)
- [Assessment Cadence and Communication](#assessment-cadence-and-communication)

---

## Purpose

Use this framework to answer one question with evidence:

**Can the platform sustain projected growth without unacceptable reliability, performance, or cost degradation?**

The framework is designed for repeatable, external assessments and can also be used by internal architecture or platform teams.

## Scope

This methodology is intentionally architecture-agnostic and works for:

- Monoliths and modular monoliths
- Microservices ecosystems
- Event-driven and serverless platforms
- Hybrid environments with legacy dependencies

It also works across different database technologies by focusing on universal scaling principles.

## How to Use This Reference

- Use this file first to set scope and scoring rules.
- Use phase references to run detailed analyses.
- Use reporting references to package outcomes for technical and executive audiences.

Default execution pattern:

1. Scope
2. Evidence collection
3. Phase execution
4. Scoring
5. Prioritization
6. Deliverables

## Guiding Principles

1. **Evidence before conclusions**
   - Base findings on metrics, configuration, architecture, and test results.
   - Mark assumptions explicitly.
2. **Evaluate fitness to trajectory**
   - Judge scalability against expected growth and critical events.
3. **Separate present readiness from future potential**
   - Record both current limits and credible upgrade paths.
4. **Model risk, not just defects**
   - Prioritize by impact and likelihood.
5. **Treat cost and compliance as scaling constraints**
   - Technical scalability without economic or regulatory feasibility is insufficient.

## Engagement Phase Overview

| Phase | Name | Typical Output |
|---|---|---|
| 1 | Discovery, architecture review, stakeholder interviews | Current-state architecture map and risk map |
| 2 | Database scalability assessment | Database bottlenecks, replication and partitioning readiness |
| 3 | Application layer and multi-tenancy assessment | Service scalability profile and tenant-isolation risk profile |
| 4 | Data pipeline and analytics scalability | Pipeline throughput and reliability profile |
| 5 | Infrastructure and deployment assessment | Elasticity, automation, and deployment readiness findings |
| 6 | Security at scale | Security controls under growth pressure |
| 7 | Compliance and data residency | Regulatory constraints map and control gaps |
| 8 | Load testing and validation | Bottleneck evidence and scaling behavior under load |
| 9 | Observability and monitoring | Detection, diagnosis, and SLO maturity findings |
| 10 | Resilience and chaos validation | Failure-mode readiness profile |
| 11 | Capacity planning and cost modeling | Capacity runway and cost-at-scale projections |
| 12 | Organizational and process maturity | Team/process readiness for sustained scaling |

## Pre-Engagement Requirements

Gather these before scoring starts:

- Current architecture diagrams
- Infrastructure topology and deployment model
- Database schema documentation and query telemetry
- Traffic patterns (average, peak, and seasonal)
- Incident history and post-incident actions
- SLI/SLO definitions (if available)
- Growth projections for users, data, and transaction volume
- CI/CD pipeline documentation
- Monitoring and alerting configuration
- Access to a staging or test environment representative of production
- Stakeholder list with owners for architecture, operations, and data
- Compliance constraints and residency requirements
- Multi-tenant segmentation and usage patterns (if applicable)
- Historical infrastructure and platform cost data

## Scoping Matrix

Use this matrix for a fast phase selection decision:

| Primary concern | Recommended phases |
|---|---|
| Imminent growth event (2x–10x) | 1, 2, 3, 8, 11 |
| Repeated outages under load | 1, 2, 3, 8, 9, 10 |
| Full health check | 1–12 |
| Technical due diligence | 1–12 |
| Database bottleneck concerns | 1, 2, 8 |
| Investor architecture validation | 1, 3, 5, 11, 12 |
| Expansion into regulated markets | 1, 5, 6, 7 |
| Noisy-neighbor complaints in SaaS | 1, 2, 3, 8, 9 |
| Analytics or data-pipeline lag | 1, 2, 4, 8 |

## Scalability Maturity Model

Use a five-level model for each dimension:

| Level | Name | Characteristics |
|---|---|---|
| 1 | Ad hoc | Reactive scaling, no systematic validation, limited observability |
| 2 | Aware | Basic monitoring, manual interventions, partial scaling practices |
| 3 | Defined | Documented requirements, pre-release validation, baseline automation |
| 4 | Managed | Continuous validation, broad observability, data-driven planning |
| 5 | Optimized | Predictive controls, automated gates, sustained reliability discipline |

## Scoring Dimensions

Score each dimension 1–5:

- **D1 Architecture design**: boundaries, statelessness, independent scaling
- **D2 Database scalability**: query performance, replication, partitioning strategy
- **D3 Infrastructure elasticity**: scaling controls, automation, regional readiness
- **D4 Performance validation**: load and stress testing depth, release integration
- **D5 Observability**: metrics, logs, traces, SLI/SLO discipline
- **D6 Resilience**: fault handling, recovery behavior, validated failover
- **D7 Operational maturity**: deployment quality, incident response, ownership
- **D8 Security at scale**: auth overhead, rate limits, secrets hygiene under load
- **D9 Compliance readiness**: residency controls, auditability, policy enforcement
- **D10 Data pipeline scalability**: ingestion/processing throughput and isolation

## Weighting and Overall Score

Default weighting (adjust only with explicit rationale):

- D1: 15%
- D2: 15%
- D3: 8%
- D4: 12%
- D5: 8%
- D6: 8%
- D7: 12%
- D8: 8%
- D9: 6%
- D10: 8%

Overall score formula:

```text
Overall Maturity Score = Sum(Dimension Score × Dimension Weight)
```

Weighting adjustment guidance:

- Increase D8 and D9 for regulated or high-risk data environments.
- Increase D2 and D10 for data-intensive products.
- Increase D3 for globally distributed platforms.

## Score Interpretation

| Score band | Interpretation | Action stance |
|---|---|---|
| 1.0–1.9 | Critical fragility | Immediate stabilization plan |
| 2.0–2.9 | Significant constraints | Prioritized remediation roadmap |
| 3.0–3.9 | Viable foundation with gaps | Targeted optimization |
| 4.0–4.5 | Strong operational readiness | Continuous improvement |
| 4.6–5.0 | Advanced and resilient | Maintain discipline and evolve |

## Evidence Quality Rubric

Apply this rubric when scoring confidence in findings:

| Confidence | Evidence standard |
|---|---|
| High | Direct telemetry + config artifacts + validated tests |
| Medium | Two independent sources (for example, telemetry + interviews) |
| Low | Interview-only or partial evidence |

Rules:

- Do not mark a high-confidence finding without direct data evidence.
- Flag low-confidence findings as validation candidates, not facts.
- Include confidence level in final risk register.

## Assessment Cadence and Communication

Use a predictable cadence:

- Weekly checkpoint with technical leads
- Midpoint review for major hypothesis correction
- Final readout with technical and executive stakeholders

At each checkpoint, provide:

- What was analyzed
- What evidence was collected
- What changed in risk posture
- What decisions are needed next

Escalate immediately if any of these appear:

- Imminent capacity exhaustion
- Single point of failure on critical path
- Untested failover for critical data path
- Compliance violations that block target growth scenario
