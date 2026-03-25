# Phases 1–2: Discovery, Architecture Review, Interviews, and Database Scalability

## Table of Contents

- [Phase 1 Goals](#phase-1-goals)
- [Stakeholder Interview Plan](#stakeholder-interview-plan)
- [Interview Guides by Role](#interview-guides-by-role)
- [Interview Red Flags](#interview-red-flags)
- [Architecture Classification](#architecture-classification)
- [Architecture Risk Mapping](#architecture-risk-mapping)
- [Dependency Graph Analysis](#dependency-graph-analysis)
- [Phase 2 Goals](#phase-2-goals)
- [Data Growth Analysis](#data-growth-analysis)
- [Schema and Data Model Evaluation](#schema-and-data-model-evaluation)
- [Query Performance Analysis](#query-performance-analysis)
- [Replication and Failover Assessment](#replication-and-failover-assessment)
- [Partitioning and Sharding Readiness](#partitioning-and-sharding-readiness)
- [Connection and Pooling Management](#connection-and-pooling-management)
- [Caching Layer Assessment](#caching-layer-assessment)
- [Phase 1–2 Evidence Checklist](#phase-12-evidence-checklist)

---

## Phase 1 Goals

Use Phase 1 to build an accurate system map before deeper technical analysis.

Core objectives:

- Map end-to-end architecture and critical request paths
- Identify scaling dimensions (users, transactions, data, compute)
- Surface single points of failure and hidden coupling
- Gather operational context from key stakeholders
- Establish architecture risk hypotheses for validation

## Stakeholder Interview Plan

Run 60–90 minute interviews with:

- Engineering leadership
- Principal architect(s)
- SRE/operations owner
- Database and data-platform owner

Interview rules:

- Ask for concrete examples, not general statements
- Require artifacts when possible (dashboard, diagram, query sample)
- Track disagreements across stakeholders for follow-up

## Interview Guides by Role

### Engineering leadership

Focus areas:

- Growth targets and business-critical scale events
- Risk tolerance (availability, latency, cost)
- Technical debt prioritization discipline
- Budget and staffing constraints
- Lessons from major incidents

### Architecture owner

Focus areas:

- Service boundary strategy and reasons for current structure
- Known scaling limits and first-failure expectations
- Data ownership model and cross-service coupling
- Third-party dependency constraints and fallback mechanisms

### SRE / operations owner

Focus areas:

- Capacity headroom and exhaustion forecasting
- Common incident patterns and recurrence
- Alert quality and escalation effectiveness
- Rollback speed and change safety
- Degree of automation in scaling and recovery

### Database / data-platform owner

Focus areas:

- Fastest-growing datasets and retention pressure
- Slowest and highest-frequency queries
- Replication topology, lag behavior, failover readiness
- Backup/recovery test maturity and objectives
- Data pipeline bottlenecks affecting production systems

## Interview Red Flags

Escalate investigation if any of these appear:

- Contradictory architecture narratives across roles
- Core operation knowledge concentrated in one person
- No tested failover for primary data path
- Unclear ownership for critical services
- No explicit growth assumptions
- No agreed scaling threshold for critical resources

## Architecture Classification

Classify architecture to calibrate expected failure modes.

### Monolith

Typical constraints:

- Coarse-grained scaling
- Shared resource contention
- Release coupling across unrelated features

### Modular monolith

Typical constraints:

- Shared deployment constraints remain
- Better extraction potential if module boundaries are real

### Microservices

Typical constraints:

- Inter-service latency accumulation
- Operational complexity and ownership overhead
- Data consistency and contract drift risks

### Serverless and managed-service-heavy

Typical constraints:

- Cold starts and service quotas
- Event ordering and state transition complexity
- Cost volatility at high throughput

### Hybrid or legacy-integrated

Typical constraints:

- Legacy bottlenecks dominate overall behavior
- Integration boundaries become fragility points

## Architecture Risk Mapping

Create a risk map with at least these categories:

- **Availability risk**: where failure can take down critical flows
- **Latency risk**: where queueing, fan-out, or remote dependencies dominate
- **Throughput risk**: where component saturation is likely under growth
- **Operational risk**: where manual intervention is required for recovery
- **Change risk**: where deployment coupling can amplify incident blast radius

## Dependency Graph Analysis

Map dependencies by critical flow and mark:

- Hard dependencies vs optional dependencies
- Rate-limited or low-SLA dependencies
- Retries, circuit breakers, and fallback paths
- Synchronous call chains longer than three hops

Prioritize any critical flow with:

- Single dependency failure that causes user-visible outage
- No timeout or retry policy
- Tight coupling to a low-observability component

## Phase 2 Goals

Use Phase 2 to determine whether the data layer can support projected growth.

Core objectives:

- Identify query and schema bottlenecks
- Validate replication and failover readiness
- Evaluate partitioning or sharding runway
- Assess connection management under high concurrency
- Determine cache effectiveness and invalidation safety

## Data Growth Analysis

Analyze:

- Largest tables and growth rate trends
- Write/read ratio per workload segment
- Retention and archival policy maturity
- Historical growth seasonality and spikes

Produce:

- Time-to-capacity estimate for critical storage and I/O constraints
- Early warning thresholds with owners

## Schema and Data Model Evaluation

Review:

- Primary and secondary key strategy
- Hot partition risk (if partitioned)
- Tenant-distribution properties (if multi-tenant)
- Referential integrity and cascade risk

Flag patterns that often block scaling:

- Overloaded tables with mixed transactional and analytical access
- Weak indexing on high-frequency query paths
- Large mutable rows driving lock contention

## Query Performance Analysis

Review top slow and frequent queries using explain plans and runtime stats.

Minimum analysis set:

- Top 20 by cumulative runtime
- Top 20 by frequency
- Top 20 by worst p95 latency

Focus checks:

- Full scans where index lookup is expected
- N+1 access patterns in application code
- Expensive joins on high-cardinality columns
- Unbounded queries on hot paths

## Replication and Failover Assessment

Validate:

- Replication topology and lag behavior under load
- Failover automation and tested runbooks
- Read-after-write consistency expectations
- Recovery point and recovery time objectives

Evidence requirement:

- At least one recent failover test result or documented simulation

## Partitioning and Sharding Readiness

Assess readiness before recommending sharding:

- Candidate partition/shard key quality
- Key distribution and hotspot risk
- Cross-partition query frequency
- Operational tooling for routing and rebalance

Decision guidance:

- Prioritize query optimization, indexing, and replicas first
- Recommend sharding only when simpler measures cannot meet growth targets

## Connection and Pooling Management

Validate:

- Pool size and timeout configuration by workload
- Max connection saturation behavior under spikes
- Connection leak detection and controls

Risk indicators:

- Frequent connection pool exhaustion
- High connection churn from short-lived clients
- No backpressure when pool limits are reached

## Caching Layer Assessment

Evaluate:

- Cache hit rate and key distribution
- Invalidation strategy and correctness guarantees
- Protection against stampedes and thundering herd effects
- Cache dependency for critical correctness paths

Target outcomes:

- High hit rate on hot read paths
- Predictable invalidation behavior during high write periods

## Phase 1–2 Evidence Checklist

- [ ] Architecture diagrams reflect current deployment reality
- [ ] Critical path dependencies are mapped
- [ ] Interview notes include concrete evidence references
- [ ] Largest data entities have growth forecasts
- [ ] Query performance baseline includes p50/p95/p99
- [ ] Replication lag and failover behavior are measurable
- [ ] Connection pool behavior is validated under concurrent load
- [ ] Cache performance and invalidation behavior are measured
- [ ] Key risks include business impact and confidence level
