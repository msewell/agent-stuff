# Contract and mapping changes

## Publish only the shared fact

Specify the producer, intended consumers, assertion trigger, grain, identifiers and issuers, and what the contract does **not** assert. Define relevant units, absent and unknown values, business time versus recording time, and correction behavior. Include one valid example and one excluded case. State only the operational promises consumers rely on, such as freshness, replay, ordering scope, and version support.

Keep the integration contract separate from private types. Translate to a consumer-owned type at ingress; keep authorization and decisions in the context that owns them. If several consumers need the same assertion, reuse the narrow published contract, not the internal model. For an asynchronous state change, use a transactional outbox if state and publication intent must commit together; design for repeat delivery rather than promising exactly once.

## Review changed meaning

1. Compare trigger, grain, units, time basis, authority, and exclusions. An unchanged field name or type is not evidence of semantic compatibility.
2. Run old and proposed logic on one distinguishing input with the same knowledge cutoff. Show expected and observed per-record results (and relevant totals). A closure occurring before local midnight but recorded after it distinguishes occurrence-based from recording-based grouping. Get sign-off from the domain owner and verify what changes for affected consumers.
3. Keep the old promise intact. For a new fact, add a distinctly named field or contract if current consumers tolerate it; otherwise publish a new version and overlap supported versions. Exercise representative old/new pairs and retained payloads. Retire only with evidence consumers no longer need the old version.
4. Gate both structure and behavior. A backward check exercises new readers on old data; a forward check exercises old readers on new data. Verify declared semantics with the distinguishing fixture and verify relevant consumer versions in the target environment. Don’t rely on a schema registry or checklist alone.

## Make consequential mappings visible

Record direction, source and target namespaces, cardinality, loss, and the decision for missing or conflicting input. Don’t turn unknown, inapplicable, or redacted into one default that a consumer will treat as a real fact. For a mapping shared across jobs or subject to audit, release a crosswalk with an owner, purpose, version, and effective dates. Pin the release used, check for overlapping intervals when uniqueness is promised, and test the exact handover and a missing key. Route gaps to the owner rather than guessing.
