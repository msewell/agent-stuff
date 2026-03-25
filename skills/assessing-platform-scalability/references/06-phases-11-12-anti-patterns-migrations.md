# Phases 11–12: Capacity, Cost, Organizational Maturity, Anti-Patterns, and Migration Playbooks

## Table of Contents

- [Phase 11 Goals](#phase-11-goals)
- [Capacity Planning Maturity](#capacity-planning-maturity)
- [Capacity Assessment Questions](#capacity-assessment-questions)
- [Capacity Forecast Template](#capacity-forecast-template)
- [Cost Modeling Worksheet](#cost-modeling-worksheet)
- [Cost Red Flags](#cost-red-flags)
- [Phase 12 Goals](#phase-12-goals)
- [Team Structure and Ownership](#team-structure-and-ownership)
- [Incident Management Maturity](#incident-management-maturity)
- [Change Management and Delivery Quality](#change-management-and-delivery-quality)
- [Knowledge Distribution and Bus Factor](#knowledge-distribution-and-bus-factor)
- [Scalability Anti-Patterns](#scalability-anti-patterns)
- [Migration Playbook: Monolith to Modular Services](#migration-playbook-monolith-to-modular-services)
- [Migration Playbook: Single Database to Distributed Data Layer](#migration-playbook-single-database-to-distributed-data-layer)
- [Migration Playbook: Single Region to Multi-Region](#migration-playbook-single-region-to-multi-region)
- [Migration Playbook: On-Premise to Cloud](#migration-playbook-on-premise-to-cloud)
- [Phase 11–12 Evidence Checklist](#phase-1112-evidence-checklist)

---

## Phase 11 Goals

Assess whether capacity and cost practices support growth sustainably.

Core objectives:

- Forecast infrastructure and platform capacity needs
- Model cost behavior under growth scenarios
- Identify cost risks that can block scaling
- Ensure planning cadence is operationally usable

## Capacity Planning Maturity

Evaluate maturity level:

- **Reactive**: capacity changes happen after incidents
- **Periodic**: forecasts exist but are infrequent and coarse
- **Operational**: forecasts are updated regularly with scenario analysis
- **Integrated**: planning informs roadmap and release governance

## Capacity Assessment Questions

Use these questions to test planning quality:

- What is current headroom for each critical resource?
- Which resource is expected to saturate first and when?
- What assumptions drive the forecast?
- How are burst and seasonality modeled?
- What lead time is required to add capacity?
- Which capacity actions are automated versus manual?

## Capacity Forecast Template

Use this structure for each critical resource category:

| Field | Description |
|---|---|
| Resource | Compute, database, storage, queue, network |
| Current utilization | Current baseline and trend |
| Growth assumption | Driver and expected growth rate |
| Saturation threshold | Technical or business threshold |
| Time-to-threshold | Estimated runway |
| Mitigation options | Scale-out, optimization, architecture changes |
| Owner | Accountable team |

## Cost Modeling Worksheet

### Current baseline

Track by major category:

- Compute
- Databases
- Storage
- Data transfer
- Managed platform services
- Security and compliance tooling
- Observability stack

### Scenario projections

Model at least three scenarios:

- Conservative growth
- Expected growth
- Aggressive growth

For each scenario, estimate:

- Total cost
- Cost per active user or transaction
- Margin impact (if applicable)

### Optimization levers

Include concrete levers:

- Rightsizing and workload placement
- Caching and data access optimization
- Reserved/committed usage where appropriate
- Architectural changes to reduce expensive hot paths

## Cost Red Flags

- Cost growth materially outpaces demand growth
- No owner for high-variance cost domains
- No cost allocation by product/tenant/service
- Critical path depends on premium tiers without fallback
- Optimization work deferred indefinitely despite known issues

## Phase 12 Goals

Assess whether organizational processes support stable scaling.

Core objectives:

- Validate clear ownership for all critical components
- Evaluate incident and change management effectiveness
- Measure delivery reliability and recovery behavior
- Assess knowledge distribution and maintainability

## Team Structure and Ownership

Verify:

- Every critical service has an owning team
- Ownership includes runtime support obligations
- Escalation paths are clear and tested
- Cross-team dependency contracts are explicit

Risk indicators:

- Shared ownership with unclear accountability
- Critical services with no active maintainers

## Incident Management Maturity

Evaluate:

- Incident classification and escalation consistency
- On-call readiness and handoff quality
- Post-incident review discipline
- Action item closure rates

Healthy pattern:

- Repeated incidents decline over time due to closed-loop remediation.

## Change Management and Delivery Quality

Assess delivery performance trends:

- Deployment frequency
- Lead time for change
- Change failure rate
- Mean time to recovery

Decision guidance:

- If change failure rate is high and rollback is slow, prioritize release safety before architecture expansion.

## Knowledge Distribution and Bus Factor

Evaluate:

- Runbook quality and accessibility
- Decision records for architecture trade-offs
- Cross-training coverage for critical systems

Escalate if:

- Any critical area has bus factor of one
- Incident response depends on unavailable individual experts

## Scalability Anti-Patterns

Common anti-patterns to flag clearly:

### Architecture anti-patterns

- Distributed monolith with tight runtime coupling
- Single shared database for all domains with no ownership boundaries
- Synchronous fan-out on user-facing requests

### Database anti-patterns

- Ignoring query plans while adding compute
- Unbounded growth tables without retention or partition strategy
- Sharding introduced before fixing basic query and indexing issues

### Operational anti-patterns

- Manual scaling as primary strategy
- No production-like validation prior to major releases
- Alert noise overwhelming responder capacity

### Premature optimization warning

- Avoid complex distributed upgrades when measured data does not justify them.

## Migration Playbook: Monolith to Modular Services

When to use:

- Monolith scaling ceiling is reached
- Deployment coupling blocks independent scaling
- Team growth requires clearer ownership boundaries

Phased pattern:

1. Modularize internal boundaries first
2. Extract one low-risk bounded capability
3. Separate data ownership for extracted domains
4. Repeat extraction by business and scaling priority

Validation criteria:

- Independent scaling behavior for extracted capability
- No regression in latency/error profile
- Ownership and observability established before expansion

## Migration Playbook: Single Database to Distributed Data Layer

When to use:

- Primary data tier is sustained bottleneck
- Read throughput and write contention exceed practical optimization runway

Phased pattern:

1. Add read scaling and routing controls
2. Optimize highest-impact queries and indexes
3. Partition large datasets where natural partition keys exist
4. Introduce sharding only when simpler measures are insufficient

Validation criteria:

- Reduced bottleneck pressure on primary
- Predictable consistency behavior
- Cross-partition/shard query risk understood and bounded

## Migration Playbook: Single Region to Multi-Region

When to use:

- Global latency issues for remote users
- Disaster recovery requirements exceed single-region design
- Residency constraints require regional placement

Phased pattern:

1. Active-passive failover baseline
2. Read-local optimization
3. Active-active only when justified by requirements

Validation criteria:

- Tested failover objectives met
- Data consistency model explicit and acceptable
- Cost and operational overhead accepted by stakeholders

## Migration Playbook: On-Premise to Cloud

When to use:

- Capacity lead times are too long
- Elastic scaling and managed services are required
- Regional expansion is blocked by physical constraints

Phased pattern:

1. Inventory and classify workloads
2. Build secure cloud landing zone and automation baseline
3. Migrate non-critical environments first
4. Migrate production with rollback-ready cutover plan
5. Optimize cost and reliability post-migration

Validation criteria:

- Performance parity or improvement for critical flows
- Reproducible infrastructure via automation
- Controlled cost profile after stabilization period

## Phase 11–12 Evidence Checklist

- [ ] Capacity forecasts exist for all critical resources
- [ ] Forecast assumptions and confidence levels are explicit
- [ ] Cost model includes conservative, expected, and aggressive scenarios
- [ ] Unit economics trend is included in scaling decisions
- [ ] Every critical component has clear ownership
- [ ] Incident reviews produce measurable corrective actions
- [ ] Delivery metrics are tracked and used for improvement
- [ ] Critical knowledge is documented and distributed
- [ ] Anti-pattern findings include concrete impact descriptions
- [ ] Migration recommendations include readiness criteria and phased rollout
