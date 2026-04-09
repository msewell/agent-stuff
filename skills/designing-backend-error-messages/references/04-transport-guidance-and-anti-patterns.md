# Backend Error Messages Guide — Part 4: Transport Guidance and Anti-Patterns

_Adapted from the source gist and reorganized for progressive disclosure in the skill._

## Table of Contents

- [12. Transport-specific guidance](#12-transport-specific-guidance)
- [13. Anti-patterns to avoid](#13-anti-patterns-to-avoid)

---
## 12. Transport-specific guidance

### 12.1 REST / HTTP (RFC 9457 Problem Details)

RFC 9457 (published July 2023, obsoletes RFC 7807) is the modern IETF standard for HTTP API error bodies. If you're building a REST API today, start here.

**Wire format**: `Content-Type: application/problem+json`

**Standard fields**:

| Field      | Type               | Meaning                                                               |
| ---------- | ------------------ | --------------------------------------------------------------------- |
| `type`     | URI reference      | Identifies the problem _type_. Stable, dereferenceable, documented.   |
| `title`    | short string       | Short human summary, same for every instance of this type.            |
| `status`   | integer (optional) | Advisory HTTP status; MUST match the actual HTTP response.            |
| `detail`   | string (optional)  | Human explanation specific to this occurrence.                        |
| `instance` | URI reference      | Identifies this specific occurrence.                                  |

**Extensions** are allowed and encouraged. Clients MUST ignore unknown extensions, so you can evolve forward safely. Recommended extensions:

- `code` — your stable namespaced machine code
- `trace_id` — the correlation ID
- `help_url` — link to documentation
- `errors[]` — array of field-level errors (see §7)
- `is_transient` — boolean retry hint
- `retry_after_ms` — mirror of `Retry-After` header, in ms

**Full example**:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Content-Language: en
Retry-After: 24
X-Request-Id: 7f3c9a12-1b4e-4a9f-9a0d-4f4b6f90e1a1

{
  "type":     "https://api.example.com/errors/rate-limit-exceeded",
  "title":    "Rate limit exceeded",
  "status":   429,
  "code":     "rate_limit.per_user_exceeded",
  "detail":   "You may make at most 100 requests per minute; you made 143.",
  "instance": "/v1/charges/req/7f3c9a12",
  "trace_id": "7f3c9a12-1b4e-4a9f-9a0d-4f4b6f90e1a1",
  "help_url": "https://docs.example.com/errors/rate-limit-exceeded",
  "is_transient": true,
  "retry_after_ms": 24000,
  "limit": { "requests": 100, "window_s": 60 }
}
```

**Framework support**: Spring Boot 3 (`ProblemDetail`), .NET Core (`ProblemDetails`), FastAPI (via middleware), Express (via packages), and Go (several libraries) all ship RFC 9457 support. Use the framework's support rather than hand-rolling.

### 12.2 gRPC

gRPC's basic error model is `(code, message)`. The richer model — `google.rpc.Status` with `details` — is what you want for production.

**Minimum**: Return one of the 16 canonical status codes (see §4) plus a clear, English, developer-facing message. The message is for _developers_, not end users — use `LocalizedMessage` for user-facing copy.

**Better**: Include `details` with at least an `ErrorInfo` payload. AIP-193 requires this.

```text
status.Code        = INVALID_ARGUMENT
status.Message     = "quantity must be between 1 and 100; got 143"
status.Details     = [
  ErrorInfo {
    reason   = "QUANTITY_OUT_OF_RANGE"
    domain   = "orders.example.com"
    metadata = { "min": "1", "max": "100", "given": "143" }
  },
  BadRequest {
    field_violations = [
      { field: "items[0].quantity", description: "Must be between 1 and 100." }
    ]
  },
  LocalizedMessage {
    locale  = "en-US"
    message = "Quantity must be between 1 and 100."
  },
  Help {
    links = [
      { description: "Docs", url: "https://docs.example.com/errors/quantity-out-of-range" }
    ]
  }
]
```

**Standard payload types** (from `google/rpc/error_details.proto`), pick the ones that match your error:

| Payload              | Use for                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `ErrorInfo`          | **Always.** Machine-readable identifier + domain + metadata.      |
| `BadRequest`         | Field-level validation failures.                                  |
| `PreconditionFailure`| System state prerequisites not met.                               |
| `QuotaFailure`       | Quota/rate-limit violations with per-quota detail.                |
| `RetryInfo`          | Tell the client how long to wait before retrying.                 |
| `LocalizedMessage`   | Human-readable, localizable message for end users.                |
| `Help`               | Links to docs / support / consoles.                               |
| `DebugInfo`          | Stack traces and detail — **only** in non-prod.                   |
| `ResourceInfo`       | Identifies the resource (type, name, owner) at fault.             |
| `RequestInfo`        | Echo of request ID + serving data — useful for support.           |

**Trade-offs to know**:

- Each detail type should appear at most once per response.
- Standard HTTP proxies and loggers don't understand the details — they see only the status code and message. Make sure your metrics layer parses `ErrorInfo.reason` for dashboarding.
- Adding many details inflates HTTP/2 trailers and hurts header compression. Be deliberate.

**Retryability in gRPC**:

- Configure a retry policy in the service config (`methodConfig.retryPolicy`) — `maxAttempts`, `initialBackoff`, `maxBackoff`, `backoffMultiplier`, `retryableStatusCodes`.
- Common `retryableStatusCodes`: `UNAVAILABLE`, sometimes `DEADLINE_EXCEEDED`, sometimes `RESOURCE_EXHAUSTED` (respect `RetryInfo`).
- Never include `INVALID_ARGUMENT`, `PERMISSION_DENIED`, `UNAUTHENTICATED`, `NOT_FOUND` in `retryableStatusCodes`.
- Use retry _throttling_ (token-bucket) to prevent retry storms.
- gRPC's jitter is ±20% by default. Keep it.

### 12.3 GraphQL

GraphQL is the odd one out: the transport response is (almost) always `200 OK`, and errors live in the top-level `errors` array. The principles above still apply — they just look different on the wire.

**Two kinds of errors**:

1. **Transport/schema errors** — parse failures, unknown operations, HTTP 400 (or 500) with a minimal body. These _can_ use non-200 status.
2. **Execution errors** — resolver failed. Respond `200 OK` with `{ data, errors }` where `errors[]` contains the problem(s) and `data` contains any fields that resolved successfully.

**Execution error shape** (following the GraphQL spec + the de facto Apollo convention):

```json
{
  "data": {
    "order": {
      "id": "ord_123",
      "customer": null
    }
  },
  "errors": [
    {
      "message": "You don't have permission to see this customer.",
      "path": ["order", "customer"],
      "locations": [{ "line": 4, "column": 5 }],
      "extensions": {
        "code": "auth.permission_denied",
        "type": "https://api.example.com/errors/permission-denied",
        "trace_id": "7f3c9a12",
        "help_url": "https://docs.example.com/errors/permission-denied",
        "is_transient": false
      }
    }
  ]
}
```

**Conventions to adopt**:

- **`extensions.code`** is the equivalent of your stable machine code. Apollo Server ships this convention; adopt it.
- **`extensions.trace_id`** is the correlation ID.
- **Never** put stack traces in `extensions` in production. Apollo's default includes `exception.stacktrace` — turn that off outside dev.
- **Partial success is a feature, not a bug.** If 3 of 5 requested fields succeed and 2 fail, return both `data` (the 3) and `errors` (the 2). This is one of GraphQL's big advantages over REST.
- **HTTP status for schema-level problems**: `200` for execution errors, `400` for bad query, `401`/`403` for auth at the transport layer, `500` only for truly unhandled exceptions.
- **Transport vs. execution errors matter for clients**: make sure your client library (Apollo Client, urql, Relay) is configured to surface both properly. A 200 with errors is easy to silently drop if you aren't careful.

### 12.4 Async / event-driven

Message-based systems add a new wrinkle: there's no client waiting for a response. "Error messages" here are the metadata attached to failed-to-process messages, and the taxonomy governs whether a message is retried, dead-lettered, or dropped.

**The three destinations for a failed message**:

1. **Retry queue (or back to the main queue with backoff)** — for transient errors.
2. **Dead-letter queue (DLQ)** — for permanent errors, or transient errors that exceeded their retry budget.
3. **Parking lot** (optional intermediate) — for messages that need human inspection before a DLQ decision.

**The metadata every failure should carry**:

```json
{
  "original_message_id":  "msg_7f3c9a12",
  "first_failed_at":      "2026-04-07T10:44:12Z",
  "last_failed_at":       "2026-04-07T10:52:08Z",
  "attempts":             4,
  "error": {
    "code":         "upstream.timeout",
    "message":      "Billing service did not respond within 8s",
    "is_transient": true,
    "cause":        "stripe.api_timeout"
  },
  "trace_id":             "7f3c9a12-…"
}
```

Attach this metadata to the message headers (Kafka/RabbitMQ) or as a wrapping envelope, so the message can be inspected without deserializing the payload.

**The taxonomy**:

| State               | Meaning                                                            | Next step                         |
| ------------------- | ------------------------------------------------------------------ | --------------------------------- |
| `PENDING`           | Initial; not yet attempted                                         | Consumer picks it up              |
| `IN_FLIGHT`         | Currently being processed                                          | —                                 |
| `RETRYABLE_ERROR`   | Transient failure; within retry budget                             | Re-enqueue with backoff           |
| `FATAL_ERROR`       | Permanent failure (bad schema, validation)                         | Immediate DLQ                     |
| `DEAD_LETTER`       | Terminal state after max retries or fatal error                    | Alert; human triage               |
| `SYNCED`            | Successfully processed                                             | Delete                            |

The key move: **`FATAL_ERROR` goes straight to DLQ; no retry loop.** A 413 on a message that's too large should _never_ be retried — the system is "confidently doing the wrong thing" if it does. This is where the `is_transient` flag on the error is load-bearing.

**Poison messages**: a message that crashes the consumer itself (not just fails validation) must be detected and quarantined. Most frameworks support this via an increment-on-dequeue counter or explicit `delivery_count`.

**Dead-letter hygiene**:

- DLQs need alerting. A silent growing DLQ is worse than a crashing service.
- DLQs need a runbook. Engineers should know how to inspect, replay, or discard DLQ messages.
- DLQ entries need the _full original message plus the failure metadata_. Without the metadata, replay is a guess.

---

## 13. Anti-patterns to avoid

A quick tour of the most common ways to ship bad errors:

### Shape anti-patterns

- **"Something went wrong."** No code, no context, no action. The worst-possible error.
- **`{ "error": "…" }` as a single string.** Impossible to parse reliably; no place to attach a code or trace_id.
- **Inconsistent shapes across endpoints.** `/v1/users` returns `{ error: "…" }`; `/v1/orders` returns `{ message: "…", code: "…" }`. Forces clients to implement N parsers.
- **Nested error objects that differ by endpoint.** Pick one shape and enforce it via a shared library.
- **Different response shapes between success and error at the same endpoint.** Clients should know from the status code alone whether the body follows the success schema or the error schema.

### Status-code anti-patterns

- **`200 OK` with `{ success: false }`.** Breaks caches, proxies, metrics, and any client library that uses status codes. The only acceptable "success-false-at-200" is GraphQL's partial-error convention.
- **`500` for everything.** Hides the failure domain. Client can't tell their-fault from your-fault.
- **`400` for auth failures.** Use `401` / `403`.
- **`401` for forbidden.** Use `403`. Conversely, using `403` when the user isn't authenticated at all leaks the existence of protected resources.
- **`404` as a grab-bag.** A `404` should mean "this path doesn't exist or isn't visible to you," not "we threw an exception."
- **`429` without `Retry-After`.** Tells the client to back off without telling them how long.

### Content anti-patterns

- **Stack traces in production.** CWE-550. Instant vulnerability.
- **SQL errors forwarded verbatim.** `ERROR: duplicate key value violates unique constraint "users_email_key"` — useful internally, disastrous publicly.
- **Raw upstream error messages.** Wrap them. The fact that your payment provider speaks ISO-8583 is not your client's problem.
- **Internal codes without external meaning.** `ERR_42`, `XK_99`. If a number is the entire code, it's a lookup barrier.
- **Error codes that change over time.** Breaking.
- **Localized machine codes.** `erreur.carte_refusée` is a code no client can parse. Localize the message, not the code.

### Retry anti-patterns

- **Blind retry on `500`.** Most 500s are bugs; retrying just amplifies them.
- **Retry without backoff.** Retry storms, cascading failures.
- **Retry on non-idempotent operations without an idempotency key.** Double-charges, duplicate rows, duplicated emails.
- **Stacking retries at every layer** (SDK + gateway + service mesh). Coordinate the budget; otherwise the total retry load can be 30× the original.
- **No maximum retry count.** Infinite loops when the error is permanent but classified as transient.

### Observability anti-patterns

- **No correlation ID.** Debugging distributed errors becomes archaeology.
- **Logging full request bodies.** PII leaks, cost blowups, and compliance risk.
- **`catch (e) { log.error(e); return null; }`** — swallowing errors without classification, losing the stack, hiding bugs.
- **Logging at `info` for every failed validation.** Noise. Drown out the real signal.

---
