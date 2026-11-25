# View contracts and interpretation

Pick the smallest portfolio that answers recurring questions. For a single system, start with a system context view (actors and external dependencies) and a logical container or module view (where responsibilities live). Add a deployment view for placement and failure domains, a runtime scenario for ordered interactions and failure branches, or a data-flow and trust-boundary view for sensitive transitions. Add internal detail or a migration view only for a named concern. A logical C4 container is an application or data store, not a runtime pod. Keep external identities stable across zoom levels.

## Contract and evidence record

Use the local schema if it preserves this information. Put reader-facing state, scope, and evidence links next to the diagram; keep checkable fields in versioned source. Use stable IDs, not display names, for views, entities, and material edges. Give an edge its own identity or key it by endpoints plus relation kind and interface; the same endpoints can carry different claims.

```yaml
id: inventory-production-writes
owner: inventory-platform
question: Where does the production reservation worker write?
audience: [inventory-on-call]
viewpoint: integration
state: deployed
scope:
  environment: production
  includes: configured writes by the reservation worker
  excludes: downstream processing and observed traffic
source_revision: "<model commit>"
deployment_revision: "<serving release>"
evidence:
  - claim: reservation-write-route
    authority: effective routing inventory
    revision: "<serving release>"
    verified_at: "<timestamp>"
    coverage: "<scope and known gaps>"
    ref: "<versioned evidence link>"
related_views: [inventory-context]
```

Record unknown fields as unknown; don't invent an owner or evidence. Keep the view's source revision, the serving release, and the verification time distinct. Justify omissions relative to the question and link to the view carrying any needed detail. Keep a canonical entry point and editable, versioned source. Use the existing authoring tools unless repeated facts across views are demonstrably difficult to keep consistent; then consider a shared structured model.

| Claim | Prefer | Do not infer |
| --- | --- | --- |
| Intended boundary or permitted dependency | Accepted decision, policy, or reviewed model | Current implementation or deployment |
| Module membership or static relationship | Build or package graph, imports, or bytecode | Dynamic discovery or actual calls |
| Interface shape or declared interaction | API/event contract plus producer or consumer configuration | All consumers from a provider contract alone |
| Desired configuration | Rendered infrastructure or GitOps input | Effective workload state, admission changes, or rollout |
| Deployed placement, permissions, or route | Read-only effective inventory and release records | Traffic, intent, or anything outside scope |
| Traffic | Traces, flow records, broker observations, or controlled evidence | Absence from missing spans, uninstrumented regions, or an idle window |
| Ownership | Catalog or registry confirmed with the accountable team | Current ownership from an old label alone |

Assign authority per fact. When sources conflict, record the discrepancy and use documented precedence or ask the relevant owner; don't silently overwrite the model. Distinguish declared edges, roll-ups derived from lower-level edges, and observed candidates. Preserve logical and physical identities separately where a proxy or shared infrastructure changes the meaning.

## State and interpretation

- **Proposed:** Unaccepted design; link the proposal and baseline. **Approved target:** Accepted direction; link the decision and milestone. Neither is deployment evidence.
- **Deployed:** Known running configuration for a named environment and revision or set of serving revisions. Record verification time and rollout exceptions. Keep the known deployed snapshot separate from the candidate.
- **Observed:** Evidence from a stated interval and population; give sampling, coverage, and collection gaps. **Historical:** Preserve what the old view described, its timestamp, immutable link, and superseding view.

Assess six separate qualities: **complete** for the declared question and required portfolio; **correct** for the stated state and revision; **current** for the user's decision; **consistent** in shared identities and meanings; **clear** in the intended rendering; and **comprehensible** on a representative reader task. Build, schema validation, independent comparison, implementation fitness checks, and reader tasks verify different things.

Use an explicit arrow convention and a verb where direction matters: the requester can call the provider while data flows back. Give complex views short alt text and a longer text equivalent covering material paths and exceptions. Encode critical meaning with a label or line style as well as color. Inspect the page at supported sizes and themes, including controls needed to navigate it. Ask the intended reader a question with a known answer (e.g., “Which downstream write is at risk if this broker is unavailable?”). Record their first answer before coaching; fix plausible misreadings and retest.
