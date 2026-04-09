# Backend Error Messages Guide — Part 3: Idempotency, Observability, and Security

_Adapted from the source gist and reorganized for progressive disclosure in the skill._

## Table of Contents

- [9. Idempotency and safe retries](#9-idempotency-and-safe-retries)
- [10. Correlation IDs and observability](#10-correlation-ids-and-observability)
- [11. Security: never leak what you don't have to](#11-security-never-leak-what-you-dont-have-to)

---
## 9. Idempotency and safe retries

Retries are only safe if the operation can be repeated without side effects. Get this wrong and you double-charge a customer.

### HTTP method semantics

- **GET, HEAD, OPTIONS, PUT, DELETE** are idempotent by spec. Safe to retry.
- **POST, PATCH** are _not_ idempotent by default. A blind retry may duplicate a charge, send a second email, or create two rows.

### Idempotency keys

The industry-standard solution: let the client send a unique key per logical request, and have the server cache the first response under that key.

```http
POST /v1/charges HTTP/1.1
Content-Type: application/json
Idempotency-Key: 7f3c9a12-1b4e-4a9f-9a0d-4f4b6f90e1a1

{ "amount": 1000, "currency": "USD", "source": "tok_visa" }
```

Server behavior:

1. First call with a new key: execute, cache `(status, body)` under the key, return.
2. Second call with the same key: return the cached `(status, body)` byte-for-byte.
3. The cached response applies whether the first call succeeded or failed — this is the whole point: a retry must see the same outcome, not a new attempt.

### Subtleties Stripe learned the hard way

- **Cache duration matters.** Typical is 24 hours. Clients must regenerate keys for "new" operations.
- **Rate-limited and auth-failed responses should not be cached.** `429` and `401` happen _before_ the idempotency layer; they can succeed later without violating idempotency. Always use a fresh key after these.
- **Conditional idempotency.** Some operations are idempotent only if they include `If-Match`/`If-None-Match`. Teach your SDK to only retry-by-default when the condition is present.
- **Request fingerprinting.** Some implementations hash the request body along with the key, to reject "same key, different body" as an error. This catches bugs where a client reuses a key across different requests.

### Pseudocode: server-side idempotency layer

```text
function handleRequest(req):
    key = req.headers["Idempotency-Key"]
    if key is not null:
        cached = idempotencyStore.get(key)
        if cached is not null:
            if fingerprint(req) != cached.fingerprint:
                return error(422, "idempotency.key_mismatch",
                             "This idempotency key was used with a different request body.")
            return cached.response

    resp = executeRequest(req)
    if key is not null and shouldCache(resp):
        idempotencyStore.put(key, {
            response: resp,
            fingerprint: fingerprint(req),
            ttl: 24h,
        })
    return resp

function shouldCache(resp):
    # Don't cache responses that will succeed on retry for non-idempotency reasons:
    if resp.status in [401, 429]: return false
    # Cache permanent errors; don't cache transient ones (client should retry fresh):
    if resp.body.is_transient == true: return false
    return true
```

### The dead-letter path

When a client exhausts its retries for a transient error, it should land the request in a dead-letter queue rather than dropping it silently. Your error response should make this easy by including enough information for the client to reconstruct the request (correlation ID, operation type, minimal metadata).

---

## 10. Correlation IDs and observability

Every error response must carry a stable identifier that ties it to server-side telemetry. Call it `trace_id`, `request_id`, or `x-correlation-id` — pick one name and use it _everywhere_.

### The propagation rules

- **Accept it inbound.** Honor `traceparent` (W3C Trace Context) or a custom `X-Request-Id` header. If the client sent one, reuse it. If not, generate one at the edge.
- **Log it with every record.** Structured log entries keyed by `trace_id` are what make distributed debugging tractable.
- **Pass it downstream.** Forward it to every internal RPC, database query, and queue message. A request that fans out to 12 services should have one `trace_id` visible in all 12.
- **Return it on the wire.** Every error response (and success response, ideally) includes the `trace_id`.
- **Spans, not just IDs.** If you have OpenTelemetry, include `trace_id` _and_ `span_id`. Tooling like Grafana, Datadog, Honeycomb can pivot from a log to the exact span.

### The observability triangle

Modern observability rests on three signals — metrics, logs, and traces — and errors flow through all three:

- **Metrics** ("is there a problem?"). Export error counts by `code`, `status`, and `route`. Alarms fire on rate-of-change of `code`-specific metrics, not "all 5xx".
- **Traces** ("where is the problem?"). Each span records the error code and marks itself as `error: true`. The trace highlights the exact service that failed.
- **Logs** ("why did it happen?"). Structured JSON entries, keyed by `trace_id`, carry the stack, variables, upstream response, feature flags, and anything else forensic.

**Practical rule:** a user reporting a problem should be able to paste their `trace_id` into a single internal UI and see the metric, the trace, and the logs that correspond to that exact failed request.

### Structured logging: what to include

```json
{
  "timestamp":  "2026-04-07T10:44:12.418Z",
  "level":      "error",
  "logger":     "billing.charge",
  "msg":        "request_failed",
  "trace_id":   "7f3c9a12-1b4e-4a9f-9a0d-4f4b6f90e1a1",
  "span_id":    "a1b2c3d4e5f60718",
  "code":       "billing.card_declined",
  "status":     402,
  "route":      "POST /v1/charges",
  "user_id":    "usr_123",
  "tenant":     "acme",
  "upstream":   "stripe",
  "upstream_status":  "402",
  "upstream_latency_ms": 842,
  "error": {
    "type":  "CardDeclinedError",
    "message": "card_declined: insufficient_funds",
    "stack": "CardDeclinedError: ...\n  at charge (billing.go:142)\n  ..."
  },
  "request_id_header": "X-Request-Id: 7f3c9a12",
  "deploy_version": "v2026.4.7-a1b2c3d"
}
```

### What to _not_ log

- **PII**, unless explicitly whitelisted by your data policy. Email, name, address, payment details.
- **Secrets**: API keys, tokens, passwords, session cookies.
- **Full request bodies** by default. Log field names and sizes, not contents.
- **Stack traces from expected errors** (e.g. validation). They just add noise.

### Cost control

Logs are the most expensive observability signal. More logs rarely means faster debugging — better logs do. Budget log volume per service, drop `debug` in production, and keep `error` logs rich and sampled `info`/`warn` low.

### Error-rate SLOs and burn alerts

A blanket "5xx rate < 1%" SLO is the observability equivalent of `500 for everything` — it hides the failure domain and alerts you on the wrong things. Tie SLOs to the `code` dimension instead, and drive the rules from the error registry (§14) so "what burns budget" has exactly one source of truth.

**Separate "user caused us to return an error" from "we failed".** A `422 validation.failed` is not a service failure — it's a caller bug or a typo. A `401 auth.credentials_invalid` when someone mistypes a password is the system working correctly. A `500 internal.unknown` is a service failure. So is a `503 upstream.timeout` that blew past its retry budget. Mark every code in `errors.yaml` with an `exclude_from_slo` flag and derive the SLI from that flag:

```text
SLI = (total_requests - server_faults) / total_requests

where server_faults = count of requests whose error code has
      exclude_from_slo: false
```

**Use multi-window, multi-burn-rate alerts.** A single "error rate > threshold" alert either pages too late (high threshold) or flaps (low threshold). The Google SRE workbook pattern: fire a page when the burn rate is fast _and_ has been sustained, and fire a ticket when the burn rate is slower _and_ has been sustained even longer. Each rule checks both a short window (catches the spike early) and a long window (suppresses flaps from one bad minute).

| Burn rate | Short window | Long window | Action | Rationale                                   |
| --------- | ------------ | ----------- | ------ | ------------------------------------------- |
| 14.4×     | 5m           | 1h          | Page   | 2% of a 30-day budget burned in 1h          |
| 6×        | 30m          | 6h          | Page   | 5% of a 30-day budget burned in 6h          |
| 3×        | 2h           | 1d          | Ticket | 10% of a 30-day budget burned in a day      |
| 1×        | 6h           | 3d          | Ticket | Exhausting budget at exactly the SLO rate   |

At 14.4× burn, a 30-day budget is gone in ~2 days — the "too fast to wait" line.

**PromQL sketch** — fast-burn page for a 99.9% SLO, derived from a per-code error metric that carries an `slo` label driven by `errors.yaml`:

```text
(
  sum(rate(http_errors_total{service="billing", slo="true"}[5m]))
    /
  sum(rate(http_requests_total{service="billing"}[5m]))
  > (14.4 * (1 - 0.999))
)
and
(
  sum(rate(http_errors_total{service="billing", slo="true"}[1h]))
    /
  sum(rate(http_requests_total{service="billing"}[1h]))
  > (14.4 * (1 - 0.999))
)
```

The `slo="true"` label is what `exclude_from_slo: false` translates into at emit time. A ticket-grade rule uses the same shape with longer windows and a smaller burn-rate constant.

**Drive alerts from the registry, not hand-written rules.** Each registry entry knows its SLO objective, window, and whether it burns budget. A small generator reads `errors.yaml` and emits the Prometheus / Datadog / Grafana rules at build time. When you add a code or reclassify one, the alerts update with the next deploy. Hand-written alerts drift; generated ones don't.

**Per-code alerts for the high-signal codes.** SLO burn is the backstop; individual codes can warrant their own alerts when they mean something specific. A spike in `billing.processor_unavailable` pages the billing team immediately regardless of overall burn. A spike in `auth.token_expired` probably means a credential-rotation bug somewhere. Wire each alert to the runbook linked from its registry entry (§14).

**Anti-patterns:**

- **Alerting on overall 5xx without code-level breakdown.** You chase the wrong service because you can't see where the failure lives.
- **Counting `validation.failed` or `auth.credentials_invalid` toward SLO burn.** The SLO becomes noisy and teams learn to ignore the alert.
- **Single-window alerts.** They flap on transient spikes or fire too late on slow burns. Always pair short and long windows.
- **Per-service burn-rate math invented by each team.** Standardize in the registry; generate the rules.
- **Alerts without linked runbooks.** The person paged at 3 a.m. shouldn't need to grep a wiki.

---

## 11. Security: never leak what you don't have to

Error messages are a well-known attack surface. CWE-550 — _Server-generated Error Message Containing Sensitive Information_ — has paid out in countless bug bounties. The rules:

### Never send to clients

- **Stack traces.** Reveal library versions, file structure, and sometimes inlined credentials.
- **SQL statements or fragments.** Reveal schema and hint at injection points.
- **Database names, table names, column names.** Same reason.
- **Internal hostnames, IPs, cloud provider IDs** (`i-0abc…`, pod names, Kubernetes namespaces).
- **Library/framework versions.** Attackers CVE-map these.
- **File paths.** Even `/home/ubuntu/app/src/…` tells an attacker your OS and layout.
- **Full upstream error text.** Wrap it in your own error with a generic reason.
- **Raw exception messages.** `NullPointerException at line 142` is a confession and a map.

### Be vague on purpose — sometimes

- **401 / 403 messages** should _not_ reveal whether the username or the password was wrong, or whether a user exists. Return a single opaque "Invalid credentials" with one status code.
- **404 vs 403 for private resources.** If the caller shouldn't know whether a resource exists, return `404` — not `403` — regardless of whether the resource is there. Google's AIP-193 prescribes this.
- **Rate-limit errors** should not reveal the exact internal counter or who else is on the same bucket. "Rate limit exceeded" + `Retry-After` is enough.

### Do send to clients

- A stable `code` that does not leak internals (`auth.invalid_credentials`, not `auth.password_mismatch_for_user_12345`).
- A short, human-readable message that explains what to do next without disclosing how the system works.
- A `trace_id` — which on its own reveals nothing but lets engineers find the full story.
- For validation errors, the offending field names and constraint values. These are _already_ public — they're in your API docs.

### Sanitization pipeline

Build a single error-serializer that transforms internal errors into wire errors, and apply it at the outermost HTTP/RPC layer. Never let an ad-hoc `throw new Error("user-facing text")` escape straight onto the wire.

```text
function toWireError(internal, req):
    public = PUBLIC_ERROR_REGISTRY[internal.code]
    if public is null:
        # Unknown error — treat as 500 and scrub everything
        log.error("unregistered_error", internal)
        return wireError(500, "internal.unknown",
                         "An unexpected error occurred. Our team has been notified.",
                         trace_id=req.trace_id)
    return wireError(public.status, internal.code, public.title,
                     detail=sanitize(internal.publicDetail()),
                     trace_id=req.trace_id,
                     is_transient=public.is_transient)
```

The registry approach gives you a single source of truth for every error the service can emit, and a safety net against leaks: if the code isn't in the registry, the serializer defaults to a generic 500.

### Debug mode — carefully

In dev/staging, you can emit an extra `debug` extension with stack traces and upstream error text. Guard it behind an environment flag or a signed header (`X-Debug-Mode`) from a trusted source. Never enable in production without an explicit deployment knob.

```json
{
  "code": "internal.unknown",
  "detail": "An unexpected error occurred.",
  "trace_id": "7f3c…",
  "debug": {
    "stack": "...",
    "upstream_error": "..."
  }
}
```

---
