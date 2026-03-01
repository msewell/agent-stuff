## 23. Evolution & Deprecation

### Non-breaking changes (safe to make without a new version)

- Adding a new optional field to a response
- Adding a new endpoint
- Adding a new optional query parameter
- Adding a new enum value (if clients handle unknown values gracefully)
- Relaxing a constraint (e.g., increasing a max length)

### Breaking changes (require a new version)

- Removing or renaming a field
- Changing a field's type
- Making a previously optional field required
- Changing the URL structure of an existing endpoint
- Altering the semantic behavior of an existing endpoint

### Deprecation lifecycle

1. **Announce** — add `Deprecation` and `Sunset` headers; update documentation and
   changelogs.
2. **Monitor** — track usage of deprecated endpoints. Reach out directly to
   high-usage consumers — don't rely solely on automated notifications.
3. **Provide migration guides** — document exactly what changed and how to update
   client code.
4. **Enforce** — after the sunset date, return `410 Gone` with a body pointing to
   the successor.

### Robustness principle

> *Be conservative in what you send, be liberal in what you accept.* — Postel's Law

Design clients to ignore unknown fields. Design servers to accept optional fields
being absent. This principle is the single most important factor in making APIs
evolvable without breakage.

---

## 24. API-First Design Process

### What API-First Means

API-first is a single idea: **the API contract is designed, agreed upon, and reviewed
before anyone writes implementation code.** The API is a deliberate product of
cross-team collaboration — not a side effect of the backend's data model.

- The contract is written by talking to the people who will consume it, not by
  reverse-engineering the database schema.
- Frontend, mobile, and third-party teams have input into the API shape *before* the
  backend team starts building.
- Implementation on both sides begins in parallel — consumers build against mocks
  from the agreed spec; backend builds against the same spec.
- **The spec is the source of truth.** If the implementation diverges from the spec,
  the implementation is wrong.

When frontend discovers the API doesn't return what they need, the feature is
half-built on both sides and the fix is expensive. Design-first catches this at the
whiteboard stage.

### Common Anti-Patterns

**Backend builds first, client adapts.** The backend designs the API around their
data model and implementation convenience. Frontend discovers mismatches during
integration — too late and too expensive. Root cause: the people who consume the API
were not in the room when it was designed.

**Spec written after the fact.** The team generates a spec from finished code. This
spec documents what was built, not what was agreed upon. It was never reviewed by
consumers and never used to generate mocks.

**API designed in isolation.** A single team writes the spec and sends it out for
"review," interpreting silence as approval. Disagreements surface weeks later during
integration.

**Spec exists but nobody enforces it.** The implementation drifts from the spec with
no automated checks. The spec becomes a historical artifact.

**Endless design phase.** The team spends weeks perfecting the spec before writing a
line of code. Treat the spec as "good enough to start building against," not
"perfect." It's a living document that evolves through feedback.

**Versioning by accident.** The API evolves through ad-hoc changes with no explicit
breaking-change rules and no process for communicating changes to consumers before
they ship.

### Collaboration Process

**Who needs to be in the room:**
- **Consumers** — frontend, mobile, third-party integrators — define what they need.
- **Producers** — backend engineers — define what is feasible and identify constraints.
- **A facilitator** — drives alignment when consumers and producers have conflicting
  needs.

If only one side designs the API, it will be optimized for that side at the expense
of the other.

**Design session structure:**
1. Start with the consumer's workflow, not the data model. Ask: "What does the UI
   need to render this screen?" Work backward from there.
2. Sketch endpoints and payloads informally (whiteboard or shared doc) before writing
   YAML.
3. Name disagreements explicitly — if something is expensive to implement or awkward
   to consume, surface it immediately.
4. Agree on error shapes and pagination patterns up front.
5. Time-box it: 1–2 hours per API surface area. Aim for "good enough to start," not
   "perfect."

The output is a draft OpenAPI spec that goes through the spec-review-as-pull-request
process (see `09-openapi-observability-and-testing.md` §20) before becoming the
governing contract.

### Mock-Driven Parallel Development

Once the contract is agreed upon, a mock server can be generated from it immediately:

1. Team agrees on the OpenAPI spec.
2. Generate a mock server (Prism, Postman Mock Server, WireMock). The mock returns
   example responses from the spec and validates incoming requests.
3. Consumers build against the mock — no dependency on the backend being finished.
4. Backend builds against the same spec.
5. When the backend is ready, consumers switch the URL. If both sides followed the
   contract, integration is a non-event.

Mocks are not a substitute for real integration testing — they validate contract
conformance but not backend behavior correctness.

### Consumer-Driven Feedback Loops

The contract is not a decree from the backend. Feedback must flow in both directions
throughout development.

**During development:** Consumers report friction early — awkward response shapes,
excessive round-trips, ambiguous error codes. Producers flag feasibility issues
immediately rather than silently diverging.

**After launch:** Track how the API is actually used. Which endpoints see the most
traffic? Which are never called? Collect feedback via developer surveys, support
tickets, and post-integration retrospectives. Use usage data to drive evolution.

Consumer-driven contract testing (CDC) formalizes this feedback loop: consumers write
contracts describing their expectations; a provider change that breaks any consumer
contract fails the build before it ships. See `09-openapi-observability-and-testing.md`
§22 for implementation details.

---

## 25. Governance

### API Catalog

Maintain a central registry of all APIs. For every API, track:

- Name, description, and owning team.
- Link to the OpenAPI spec.
- Lifecycle stage: **draft** → **active** → **deprecated** → **retired**.
- Known consumers.

Tools: Backstage, SwaggerHub, Postman API catalog, or a well-maintained shared doc.
Without a catalog, no one knows how many APIs the organization has, who owns them, or
whether they're still in use.

### Design Review Gate

Before implementation starts, every new API or breaking change passes through:

1. Automated linting passes (Spectral, Redocly CLI).
2. At least one consumer reviews and explicitly signs off.
3. Security review for endpoints handling sensitive data.

This is a lightweight gate — automated checks handle style; human review focuses on
"does this contract actually serve the consumers?"

### Metrics Worth Tracking

| Metric | Why |
|--------|-----|
| Spec-to-implementation conformance | What % of endpoints pass schema validation? Anything below 100% means the contract is drifting. |
| Breaking changes caught in CI | How many were blocked before reaching production? |
| Time to first integration | How long does it take a new consumer to make their first successful call? Measures practical contract quality. |
| Consumer satisfaction | Survey or retro feedback. Are APIs usable, well-documented, and stable? |

---

