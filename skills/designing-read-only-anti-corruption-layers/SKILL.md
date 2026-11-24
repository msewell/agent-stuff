---
name: designing-read-only-anti-corruption-layers
description: Designs and reviews read-only anti-corruption layers (ACLs) that translate legacy, database, file-export, or supplier API data into a consumer-owned domain model. Produces read contracts, rules for missing data, and release checks for privacy, revocation, and freshness. Use when an external read integration has different meanings for keys, statuses, absence, or access, or when reviewing a consumer-owned projection for safe reconciliation. Not for generic client adapters, write-side integration, or access-control lists.
category: System Architecture
---

# Design read-only anti-corruption layers

Use the same workflow for design and implementation review. For a design, use the supplied facts and mark assumptions. When asked to review existing artifacts, inspect only the relevant code, tests, and configuration. Cite the decision point and its enforcing dependency or caller; if that dependency is absent, do not infer its behavior from a stub or type. Do not edit code or probe live systems unless asked and authorized.

## 1. Establish the boundary

- Identify the consumer use case, independently meaningful sources, supported capabilities, data audiences, and source/field owners. Establish freshness for values, freshness for membership, and the effective revocation point separately. Flag any missing guarantee that blocks a decision; give a conservative interim behavior instead of inventing a guarantee.
- Define consumer-owned read ports in domain terms. Keep wire formats, upstream identifiers, endpoint selection, decoding, and evidence classification in adapters. Use a thin adapter if only transport or representation differs. Choose deployment separately: use modules by default; isolate a worker for connectivity, scheduling, or workload needs.
- Let the application decide precedence, authority by field, and behavior on partial results. Don’t assume one catalog can certify another source’s existence. Keep a usable independent source result when policy permits. Model a missing record separately from an absent optional field; don’t coerce omission to zero or false. Map source keys explicitly; preserve distinctions required by the source contract and verify returned identity and representation.

## 2. Write the evidence contract

Return `found` with an approved immutable projection and only the necessary freshness metadata, or `missing` with a stable reason. The names below are defaults; preserve the distinctions if the project uses different names.

| Protected port outcome | Evidence required |
| --- | --- |
| `found` | A validated live observation or a policy-eligible prior positive under current authorization. Label an expressly permitted stale positive and retain its original observation time. |
| `no-api` | Trusted capability configuration confirms there is no supported read for this scope or capability. Failure to load that configuration is not deliberate absence. |
| `unknown-key` | An entitled lookup established absence for the exact key, scope, and representation using authoritative, sufficiently fresh evidence. A partial, unverified, stale, or mismatched observation cannot establish absence. |
| `not-entitled` | A definitive denial for the caller or their applicable upstream grant. A shared service credential failure is not a caller denial. |
| `outage` | No usable observation and no authoritative absence or denial. Includes indeterminate authorization, invalid required data, unexpected route behavior, and local misses without valid membership evidence. |

Validate request shape at the entry point; invalid input is not a missing result. Authorize **before** checking capability, cache, or source. If the decision is unavailable or too old, withhold data. Apply disclosure policy at the outward edge: entitlement to a record does not imply entitlement to a field, source label, timestamp, or precise missing reason. Where absence and denial must be indistinguishable, align outward status, body, caching, and timing behavior. Keep source health separate from key evidence.

**Example:** The caller may read an internal part, but its supplier lifecycle lookup returns an undocumented 404. Return `catalog: found` and `supplier: missing(outage)` at the protected port; do not cache absence. If partial reads are permitted, return the approved catalog fields without asserting anything about the supplier’s lifecycle state or why it is unavailable.

## 3. Specify data flow and publication

- Choose the earliest permitted allowlist: restrict source columns or requested fields, then build a fresh projection from explicit, runtime-validated assignments. Check allowed values as well as names. Send, retain, and emit only what each trust zone permits. Raw responses, keys, staging, spools, diagnostics, and metadata are all in scope. Treat field withdrawal as a revision and purge/rebuild decision, not merely a serializer change.
- For published read models, record source identity, scope, mapping revision, observation point, and completion evidence. Keep observation time distinct from publication time. Publish only recoverable work; a durable checkpoint must never outrun visible data. Don’t promote incomplete work or interpret an untranslatable row as deletion.
- For any batch source, require an authoritative, compatible, complete and sufficiently fresh membership observation before certifying absence or retiring keys, including by replacing a generation. A file, short page, repeated partial result, local clock, or aggregate count/hash alone does not establish coverage or freshness. For an immutable export, agree on source-generated scope, observation and completion evidence; verify artifact integrity against it. Treat even an empty export as valid only with that evidence. Guard changes against newer local observations.
- If a batch cannot meet the publication contract, do not promote it or merge its rows into the served projection. Fall back only to already verified positives under current authorization and an explicit freshness or bounded stale-serving policy. Withhold the affected data when the hard age limit expires or if no verified observation exists. Schema validation does not verify a row’s freshness. Delivery and publication time are not substitutes for unknown source observation time, even when labeled as proxies.
- Partition cached data by effective grant, cache epoch, representation, and contract revision. Authorize cache hits and refreshes. A **cache epoch** controls entry eligibility, not **authorization freshness**. If policy requires a hard revocation point, verify both decision freshness and ordering of outward release and cache writes against revocation. Shorter TTLs, cache bypass, and a final recheck alone do not provide that ordering. Withhold protected results on paths without the guarantee.

Read only the references needed for the guarantees at issue:

- [SQL Server ingestion and reconciliation](references/01-sql-server.md) — for SQL Server `rowversion`, connector snapshots, or Availability Group secondaries. Use other engines’ own visibility and cursor semantics.
- [Supplier REST evidence and caching](references/02-supplier-rest.md) — for route binding, status classification, HTTP caching, or semantic probes.
- [Verification and operations](references/03-verification.md) — for evidence at the serialized edge, hard revocation, telemetry export, recoverable publication, or rollout.

## 4. Validate the decision and report it

Pair each material claim with a release check. Name the failure to induce, what must not happen, and where to test it. Check actual serialized output, not just the intended DTO. A mock can verify classification; it cannot verify source consistency or the deployed authorization topology. If an authorized check fails, narrow or correct the design, then rerun the affected checks before changing the release decision. Mark checks not run as proposed; distinguish what can be built from what is safe to enable. Keep affected behavior disabled or degraded while a release gate is open.

Use this default response shape. Lead with the decision; rank findings against the stated release requirements. Keep the findings and checks that could change the decision or protect those requirements. Do not reproduce the full reference checklist.

1. **Decision and scope:** what can proceed, what is blocked, and why.
2. **Read contract:** ownership, result evidence, and outward disclosure.
3. **Data flow and safeguards:** projection, publication/reuse, revocation, and fallback.
4. **Acceptance evidence:** prioritized checks with pass conditions, unresolved assumptions, and the owner or action that closes each blocker.
