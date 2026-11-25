# Delivery checks and drift

## Evidence and check design

Treat implementation, routes, flags, deployment, data classification, interface, ownership, and decommissioning changes as possible architecture impact. Use changed paths to route review, not as the sole test for relevance. For every affected view, record **updated**, **no impact with reason**, or **approved exception**; include the state and environment, semantic diff, rendered preview where available, appropriate evidence, and affected owners. Record the linked changes and integration milestone if changes cross repositories.

Start with inexpensive schema, identity, coverage, reference, and render checks. Add independent comparison for a few consequential claims. A validator can prove the model is internally consistent; an implementation fitness test can prove a constraint holds. Neither alone proves every depicted fact, and comparing a projection to its source model only verifies projection.

Use the same scoped inputs on candidate and evidence sides. Normalize IDs, relation kind, and interface or stable relationship ID; reject malformed, duplicate, ambiguous, or out-of-scope evidence before comparing. Keep the evidence producer separate from the diagram. For a **complete** configured destination inventory:

- `configured − drawn` finds configured routes missing from the view.
- `drawn − configured` finds unsupported arrows.
- Compare relevant attributes on retained edge IDs; a protocol change need not change the endpoints.
- Exercise both mismatch directions with isolated fixtures and exercise the matching case. Print the view, edge or rule, expected and actual, candidate and evidence revisions, and owner. Keep layout jitter out of the semantic diff.

If dynamic routes can bypass the export, narrow the claim or add another extractor; exact set equality would imply coverage the check doesn't have.

## Enforce the result where it matters

Run the required check on the candidate the platform will actually merge. On GitHub Actions, a top-level path filter can leave a required status pending on a configuration-only change. Run the workflow on `pull_request` and, if the merge queue is enabled, `merge_group`. Return a stable successful no-op from the diagram conformance check only after establishing that the candidate cannot affect any claim in its scope. If impact is unknown, verify it rather than returning green. The no-op neither satisfies nor waives another required check. Verify protection with a controlled failing PR and a queued candidate where authorized. A diagram-file owner rule doesn't catch a change touching only infrastructure or configuration. Protect checker, mapping, baseline, and workflow changes with accountable review; ensure approvals apply to the revision being merged. Render previews with read-only rights and no production credentials.

To roll out a check, select a question that matters in a frequently changing system and pilot one independent comparison as advisory. Measure false positives and establish that the seeded cases are caught before requiring it. If legacy findings cannot all be resolved at once, baseline individual findings with owners and expiry, block new violations, and remove entries when fixed. Track verification lag, evidence coverage at the right revision, and resolution time for confirmed drift, separately from raw alert count; monitor collection health so a quiet broken detector doesn't look like progress. Retire views that no longer answer a useful question, and preserve history and redirects.

## Drift dispositions and exceptions

Normalize observations with environment, timestamp or window, revision, collection health, identity mapping, and coverage. Preserve an observed physical hop while resolving a logical identity. Check both release mix and data scope before classifying **matched**, **unexpected**, **missing with evidence that supports absence**, **changed**, **ambiguous**, or **unverified**. With incomplete data, keep the last good snapshot and surface staleness. Corroborate surprises independently; a proxy, alias, or feature flag can explain an apparent edge. Don't make an observed edge an approved dependency by importing it.

Deduplicate and route findings with expected claim, observation, evidence limitations, owner, due date, risk, and closure criteria. Close with a passing comparison, verified correction or retirement, or an evidence-backed reclassification. An exception is a temporary, authorized decision: record the precise rule and object, risk, approver, compensating measure, expiry, and repair owner or ticket. On expiry, reopen the obligation or fail the applicable scoped gate.
