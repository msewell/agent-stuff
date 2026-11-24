# Verification and operations

## Make each guarantee falsifiable

| Claim | Evidence to ask for or produce |
| --- | --- |
| New supplier fields are inert | Add arbitrary extra upstream fields in a property test; assert unchanged projection and storage. Reject unknown required codes and wrong identities with deterministic fixtures. |
| Only approved data crosses the outward boundary | Compare outbound field paths to the versioned field inventory for each audience, independently of compatibility diffs. Validate actual serialized responses against closed schemas, including nested and error shapes. To exercise both checks, inject an extra field into serialization, then allow it in the schema alone; the inventory check must still reject it. Check content in allowed fields, including free text. |
| Missing reasons reflect evidence and preserve privacy | Exercise the evidence matrix, then compare authorized outcomes and public responses for missing vs. protected inputs, cold and warm. Assert withheld fields/reasons and no unauthorized route, cache, or source read. |
| Publication is recoverable | Crash before publication, lose an acknowledgment after commit, deliver duplicate pages, and race a stale publisher. Assert readers see one committed generation, rejected rows do not become false absence, and the checkpoint never outruns recoverable work. |
| Retained data obeys the policy | Inspect projections, cache, staging, spools, crash reports, and diagnostic stores for excluded values and verify removal/purge of incompatible revisions. |

## Prove revocation over the actual serving topology

Keep the minimum acceptable authorization decision revision separate from the cache epoch. If supported, take the revision from trusted server-side state for the same grant and require a decision at least that recent. Otherwise use a path whose verified consistency satisfies the agreed enforcement point. A propagation interval is acceptable only if the policy explicitly permits it. If grant revision and application metadata update across stores, default to a transition guard: mark the grant pending in trusted state before processing the change and withhold reads while pending. Publish the new cache epoch and minimum authorization revision only after confirming the change. Do not move the policy’s enforcement point without approval.

Authorize before reads, and recheck as close as possible to releasing or persisting an in-flight observation. A definitive denial yields `not-entitled`; a stale, pending, or unavailable decision yields `outage`. Both withhold data. Discard results fetched under a revoked or changed grant. If access must end at acknowledged revocation, a best-effort recheck still leaves a check-to-release race. Define and verify a release fence or acknowledgment barrier that orders both outward release and eligible cache writes against revocation, including on cache hits, across replicas, and during background refresh. A cache-only compare-and-swap does not fence an outward response. Verify the actual caller-facing handoff; ordering an internal return or building the response is not sufficient. If ordering cannot be proved, withhold affected data; bypassing the cache still leaves the race. An epoch only prevents reuse when the serving path selects it using current trusted grant state.

In staging using the deployed authorization topology, warm both cache and projection under the old grant, pause a fetch, revoke via the actual administration path, then release the fetch. Inject delayed replica decisions and pause between final check and release to exercise the ordering guarantee. Across all serving replicas and refresh paths assert that no protected data reaches the caller or eligible cache after the effective point. Then regrant and show the old cache entry cannot become eligible again.

## Test the telemetry export, not just instrumentation

Keep source-side minimization and apply a separate exporter or collector allowlist where supported. In staging, route production-equivalent telemetry to an isolated receiver. Emit distinct synthetic markers via excluded values, URL or SQL parameters, and exceptions; exercise successful, supplier-failure and connector-failure paths. Inspect decoded traces, logs and metrics plus collector diagnostics: attributes are only one surface. Check span names, resource attributes, log bodies, exception events, URLs, metric exemplars and encoded marker forms. Require the expected safe signals to arrive and a separate positive control to prove the detector works. A silent pipeline cannot pass. If a surface cannot be safely filtered, omit it at instrumentation or disable its export.

## Operate and change the boundary

Track value age, membership age and revocation enforcement separately from endpoint availability. Split outcome counters by bounded evidence class; do not use raw keys as metric dimensions. Alert on oldest stalled scope, unusual removal volume and unexpected changes in absence vs. outage. On suspected supplier drift, stop sharing suspect negatives and verify pinned known-present probes. On mass SQL removal, hold removals and verify scope, permissions, and source freshness.

For revisions, compare old and candidate mappers on the same approved observation; inspect the projected output and missing reasons, not raw payload diffs. Isolate cached results by contract revision. A changed key, scope, or membership rule may require a new scoped baseline. Verify cleanup and rollback against current privacy rules before rollout.
