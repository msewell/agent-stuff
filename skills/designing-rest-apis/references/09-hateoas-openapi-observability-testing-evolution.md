## 19. HATEOAS & Hypermedia

### What it is

HATEOAS (Hypermedia as the Engine of Application State) means API responses include
links that tell the client what actions are available *from the current state*.

```
GET /orders/7

HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 7,
  "status": "pending",
  "total": 42.00,
  "_links": {
    "self": { "href": "/orders/7" },
    "cancel": { "href": "/orders/7/cancellation", "method": "POST" },
    "pay": { "href": "/orders/7/payment", "method": "POST" },
    "customer": { "href": "/users/42" }
  }
}
```

After the order is paid, the response changes — `cancel` and `pay` links disappear,
and a `receipt` link appears. The client doesn't need hardcoded knowledge of which
transitions are valid; the API tells it.

### When to use HATEOAS

**Tradeoff:** HATEOAS adds payload size and implementation complexity. In practice,
most REST APIs do not implement full HATEOAS. It is most valuable when:

- The API has complex workflows with many state transitions.
- Clients are developed by external teams who cannot easily update when the API changes.
- You want to decouple client behavior from hardcoded URL patterns.

For simpler APIs or internal services where client and server are maintained by the
same team, HATEOAS is often overkill. At minimum, include a `self` link on every
resource — it's cheap and universally useful.

---

## 20. OpenAPI Documentation

### Design-first, not code-first

Write the OpenAPI specification *before* writing the implementation code. This
approach:

- Forces you to think about the consumer's experience before implementation details.
- Enables parallel workstreams — frontend and backend can develop against the spec
  simultaneously.
- Provides a machine-readable contract for code generation, testing, and validation.

### Use OpenAPI 3.1

OpenAPI 3.1 aligns fully with JSON Schema (2020-12), resolving years of
incompatibilities. It is the current standard.

### What to document

| Element | Notes |
|---------|-------|
| Every endpoint | Include method, path, summary, description |
| Request parameters | Type, format, required/optional, constraints, examples |
| Request bodies | Schema with required fields and example values |
| Response schemas | For every status code the endpoint can return (including errors) |
| Authentication | Security schemes (OAuth2, Bearer, API key) at global and per-operation levels |
| Error responses | Document every error type using RFC 9457 schema |
| Deprecation status | Mark deprecated endpoints and include migration notes |

### Spec hygiene

1. **Validate and lint your spec** — use tools like Spectral, Redocly CLI, or
   Vacuum to enforce naming conventions and completeness.
2. **Split large specs** — use `$ref` to break out schemas, paths, and parameters
   into separate files organized by resource.
3. **Keep examples realistic** — auto-generated placeholder values like `"string"`
   or `0` help no one. Use meaningful example data.
4. **Version the spec** — store the OpenAPI YAML in source control alongside the
   code. Review spec changes in pull requests.

---

## 21. Observability

### Correlation IDs

Generate a unique request ID for every incoming request. Propagate it across service
boundaries. Return it to the client:

```
HTTP/1.1 200 OK
X-Request-Id: req_a1b2c3d4e5
```

**Why:** When a client reports an issue, the `X-Request-Id` lets you trace the
request through logs, metrics, and traces across every service it touched.

### Structured logging

Log every request with structured fields:

```json
{
  "timestamp": "2026-02-28T14:23:01Z",
  "request_id": "req_a1b2c3d4e5",
  "method": "POST",
  "path": "/orders",
  "status": 201,
  "latency_ms": 47,
  "user_id": "usr_42",
  "ip": "203.0.113.1"
}
```

### Metrics to track

| Metric | Why |
|--------|-----|
| Request rate (by endpoint, method, status) | Traffic patterns and anomaly detection |
| Latency percentiles (p50, p95, p99) | Tail latency reveals problems that averages hide |
| Error rate (4xx and 5xx separately) | Client errors (4xx) suggest bad DX; server errors (5xx) are your bugs |
| Payload size | Detect unexpectedly large responses |
| Upstream dependency latency | Identify which downstream service is the bottleneck |

### Health check endpoints

```
GET /health         → 200 (basic liveness)
GET /health/ready   → 200 (readiness — all dependencies are connected)
```

Keep health checks lightweight — they should not trigger expensive database queries.

---

## 22. Testing Strategies

### Contract testing with Pact

Contract testing verifies that a consumer and provider can communicate correctly by
checking each side in isolation against a shared contract. This replaces expensive,
brittle end-to-end integration tests.

**How it works:**

1. **Consumer generates a contract (pact):** The consumer's test suite records the
   HTTP interactions it expects (request shape, expected response).
2. **Provider verifies the contract:** The provider replays the recorded interactions
   against its real implementation and confirms it meets the consumer's expectations.
3. **Contract broker mediates:** A broker (e.g., PactFlow) stores contracts, manages
   versions, and reports verification results.

```
# Consumer pact example (conceptual):
# "When I GET /users/42, I expect a 200 with { id, name, email }"

# Provider verification:
# Replay GET /users/42 against the real provider → confirm 200 with matching schema
```

**Why contract testing over integration testing:** Integration tests require all
services running simultaneously, are slow, flaky, and expensive to maintain. Contract
tests run in isolation, are fast, and catch the exact class of bugs that matter —
incompatible interface changes between services.

### OpenAPI spec conformance

Validate that your running API actually conforms to its published OpenAPI
specification. Spec drift — where the implementation diverges from the documentation —
is one of the most common sources of integration bugs.

**Tools and approach:**

| Tool | What it does |
|------|-------------|
| **Spectral** | Lints the OpenAPI spec itself for style, completeness, and best practices |
| **Redocly CLI** | Validates spec structure, resolves `$ref`s, bundles multi-file specs |
| **Prism** (Stoplight) | Mock server + validation proxy — intercepts live traffic and flags spec violations |
| **Schemathesis** | Generates test cases from the OpenAPI spec and fires them at the live API, finding crashes and spec violations |

**Integrate into CI:** Run spec linting and conformance checks on every pull request.
Treat spec violations as build failures — if the spec says a field is required and
the implementation returns it as optional, that's a bug.

### Backward compatibility testing

Automated checks that prevent new versions from breaking existing consumers.

**What to verify:**

| Check | Breaking if violated |
|-------|---------------------|
| No required fields removed from responses | Yes — consumers relying on that field will break |
| No required fields added to requests | Yes — existing consumers don't send the new field |
| No field type changes | Yes — `"id": 42` → `"id": "42"` breaks typed clients |
| No endpoint removals | Yes — consumers still calling the endpoint get `404` |
| No semantic behavior changes | Yes — same input producing different output is invisible but breaking |
| New optional response fields | Safe — consumers following Postel's Law ignore unknown fields |
| New optional request fields | Safe — existing consumers simply don't send them |

**How to automate:**

1. **OpenAPI diff tools** — tools like `oasdiff` or `openapi-diff` compare two
   versions of an OpenAPI spec and report breaking changes. Integrate into CI to
   block PRs that introduce breaking changes without a version bump.
2. **Pact's "can-i-deploy"** — queries the contract broker to determine whether a
   provider version is compatible with all deployed consumer versions. Gate your
   deployment pipeline on this check.
3. **Schema evolution tests** — maintain a suite of "golden" request/response pairs
   from prior versions and verify they still pass against the current implementation.

### Bi-directional contract testing

Combines consumer-driven Pact contracts with provider-side OpenAPI specs. The consumer
publishes a pact; the provider publishes its OpenAPI spec. A broker (PactFlow)
cross-references them to verify compatibility *without the provider needing to run
Pact verification tests*. This is especially useful when the provider team already
has comprehensive OpenAPI coverage and doesn't want to maintain a separate Pact
verification suite.

### Best practices

| Practice | Rationale |
|----------|-----------|
| Run spec linting in CI on every PR | Catches spec drift and style violations early |
| Run breaking-change detection before merge | Prevents accidental consumer breakage |
| Use contract tests for inter-service boundaries | Faster and more reliable than integration tests |
| Keep a "compatibility test suite" of golden examples | Verifies real payloads from prior versions still work |
| Gate deployments on contract verification | "Can I deploy?" should be answered by tooling, not hope |

---

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
2. **Monitor** — track usage of deprecated endpoints. Reach out to high-usage
   consumers directly.
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

