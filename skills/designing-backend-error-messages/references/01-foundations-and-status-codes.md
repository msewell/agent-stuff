# Backend Error Messages Guide — Part 1: Foundations and Status Codes

_Adapted from the source gist and reorganized for progressive disclosure in the skill._

## Table of Contents

- [1. Why error messages matter](#1-why-error-messages-matter)
- [2. Two audiences, one correlation ID](#2-two-audiences-one-correlation-id)
- [3. Anatomy of a helpful error response](#3-anatomy-of-a-helpful-error-response)
- [4. Choosing the right status code](#4-choosing-the-right-status-code)

---
_How to design, shape, word, and ship error responses that are actually helpful — to external clients, to the developers integrating against your API, and to the on-call engineers debugging them at 3 a.m._

> Audience: backend engineers, API designers, tech leads, and SREs. The guidance below applies whether you ship REST, gRPC, GraphQL, or an async/event-driven service. Recommendations are opinionated but every rule is followed by the reasoning so teams can adapt.

---

## 1. Why error messages matter

Error responses are a UX surface. They are often the _only_ thing a client developer sees when something goes wrong, and they are the primary signal an on-call engineer pivots on when a system misbehaves. Bad errors cost real money:

- **Developer time.** Every "Something went wrong" forces a client to guess, retry blindly, or open a support ticket. Time-to-first-successful-call and time-to-debug-a-failure are the two most common benchmarks developers use to judge an API.
- **Support load.** Ambiguous errors drive tickets. Specific, linkable errors let developers self-serve.
- **Reliability.** If clients can't tell transient from permanent errors, they either retry nothing (availability suffers) or retry everything (you get retry storms and cascading failures).
- **Security.** A verbose stack trace is a gift to attackers — library versions, file paths, ORM internals, and sometimes credentials all leak through "helpful" errors.
- **Incident response.** An error body without a correlation ID makes post-mortem forensics dramatically slower.

The guide's north star: **every error should be classifiable, actionable, safe to display, and traceable — in that order.**

---

## 2. Two audiences, one correlation ID

Error messages have to serve two very different readers at the same time:

| Dimension         | External / client-facing                          | Internal / ops-facing                                      |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| Reader            | Integrator, end user, AI agent                    | On-call engineer, SRE, auditor                             |
| Format            | Stable wire contract (JSON)                       | Structured log + trace + metric                            |
| Content           | What happened + what to do next                   | Stack trace, variables, request context, user/tenant, SQL  |
| Sensitive data    | Never                                             | Still never (PII/secrets redacted — "even internally")     |
| Freedom to evolve | Governed by versioning; changes break clients     | Can change any time                                        |
| Language level    | 7th–8th-grade reading level; no jargon            | Whatever the engineer needs                                |

**Bridge them with a single correlation ID.** Every error response carries a `trace_id` (or `request_id`). That ID is the pivot point:

- A user pastes it into a support ticket.
- An engineer pastes it into the observability platform.
- A structured log entry with that ID contains the rich context: stack trace, query that failed, tenant, feature flags in effect, upstream error from a dependency.

```text
User sees:                         Engineer looks up:
┌──────────────────────────┐       ┌───────────────────────────────┐
│ Couldn't charge card.    │       │ trace_id: 7f3c…               │
│ Retry in a moment.       │       │ err: stripe.card_declined     │
│ Ref: 7f3c…               │◀──────│ stack: [...]                  │
└──────────────────────────┘       │ tenant: acme                  │
                                   │ upstream: lnk-4 took 8.2s     │
                                   └───────────────────────────────┘
```

**Rule of thumb.** If it would embarrass you to show a customer, it doesn't go on the wire. If it would help an engineer debug faster, it goes in the structured log _keyed by the same trace ID_.

---

## 3. Anatomy of a helpful error response

Regardless of transport, a well-formed error has seven parts. Name them however your wire format prefers — the _slots_ are what matter.

| Slot                 | Purpose                                                          | Audience       | Example                                                    |
| -------------------- | ---------------------------------------------------------------- | -------------- | ---------------------------------------------------------- |
| **Status**           | Coarse category the client's stack can branch on                 | Machine        | `HTTP 422`, `gRPC INVALID_ARGUMENT`                        |
| **Type / URI**       | Stable, documented identifier for this _kind_ of problem         | Machine + docs | `https://api.example.com/errors/validation-failed`         |
| **Code**             | Fine-grained, stable, namespaced machine code                    | Machine        | `validation.email.invalid_format`                          |
| **Title**            | Short human summary of the problem _type_ (doesn't vary by call) | Human          | "Validation failed"                                        |
| **Detail**           | Human explanation specific to _this_ occurrence                  | Human          | "email must be a valid RFC 5321 address; got `a@@b.com`"   |
| **Instance / trace** | Unique identifier tying this response to server-side telemetry   | Both           | `trace_id: 7f3c…`                                          |
| **Extensions**       | Everything else: field errors, retry hints, doc URL, metadata    | Both           | `retry_after_ms`, `errors[]`, `help_url`, `is_transient`   |

### The canonical REST example (RFC 9457 Problem Details)

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json
Content-Language: en

{
  "type":     "https://api.example.com/errors/validation-failed",
  "title":    "Validation failed",
  "status":   422,
  "code":     "validation.failed",
  "detail":   "The request body failed validation on 2 fields.",
  "instance": "/orders/create/req/7f3c9a12",
  "trace_id": "7f3c9a12-1b4e-4a9f-9a0d-4f4b6f90e1a1",
  "help_url": "https://docs.example.com/errors/validation-failed",
  "errors": [
    {
      "field":   "email",
      "code":    "validation.email.invalid_format",
      "message": "Must be a valid email address.",
      "pointer": "#/email"
    },
    {
      "field":   "quantity",
      "code":    "validation.quantity.out_of_range",
      "message": "Must be between 1 and 100.",
      "pointer": "#/items/0/quantity",
      "constraint": { "min": 1, "max": 100 }
    }
  ]
}
```

Notice what is _and isn't_ in that response:

- No stack trace. No database name. No hostname. No library version.
- `type` and `code` are stable strings — they're a public contract.
- `detail` is specific to this occurrence; `title` would be identical for any validation failure.
- `trace_id` lets the server correlate this exact response with a rich internal log.
- `help_url` gives developers a self-serve path before they open a ticket.

### Pseudocode: constructing an error response

```text
function makeErrorResponse(err, req):
    trace_id = req.trace_id                      # propagated from inbound header
    base = {
        type:     docsBase + "/errors/" + err.kind,
        title:    titleFor(err.kind),            # stable per kind
        status:   httpStatusFor(err.kind),
        code:     err.code,                      # e.g. "billing.card_declined"
        detail:   err.publicDetail(),            # sanitized, specific to this call
        instance: req.path + "/req/" + shortId(trace_id),
        trace_id: trace_id,
        help_url: docsBase + "/errors/" + err.code,
    }

    if err.isValidation():
        base.errors = err.fieldErrors()          # see §7

    if err.isTransient():
        base.is_transient = true
        if err.retryAfter is not null:
            base.retry_after_ms = err.retryAfter.millis()

    # Rich context goes to logs, NOT to the wire:
    log.error("request_failed", {
        trace_id: trace_id,
        code:     err.code,
        stack:    err.stack(),
        user_id:  req.user?.id,
        tenant:   req.tenant,
        upstream: err.upstream(),
        cause:    err.cause(),
    })

    return httpResponse(base.status, "application/problem+json", base)
```

Key invariant: **the client response and the log record are built from the same error object but contain disjoint-ish information.** The wire response has the public contract; the log has the forensics.

---

## 4. Choosing the right status code

Status codes are coarse. They exist so that:

- Middleboxes, load balancers, and CDNs can behave correctly.
- Client libraries can branch on broad categories (retryable? authn? validation?).
- Metrics dashboards can separate client errors from server errors.

Status codes are _not_ how clients distinguish between specific problems — that's what the stable `code` field is for (see §5).

### HTTP — the essential set

| Code  | Meaning                 | Use when…                                                                      | Don't use for…                                             |
| ----- | ----------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `400` | Bad Request             | Malformed syntax, un-parseable body                                            | Semantic validation of parseable input (use `422`)         |
| `401` | Unauthorized            | Missing or invalid credentials                                                 | Authenticated-but-forbidden (use `403`)                    |
| `403` | Forbidden               | Authenticated but not allowed                                                  | Missing auth (use `401`)                                   |
| `404` | Not Found               | Resource doesn't exist _or_ caller can't see it (hide existence)               | "Wrong method on existing resource" (use `405`)            |
| `405` | Method Not Allowed      | Path exists, verb doesn't. MUST include `Allow:` header                        | Permission issues                                          |
| `409` | Conflict                | State conflict, optimistic concurrency failure, unique-constraint violation    | Generic "something's wrong"                                |
| `410` | Gone                    | Resource permanently removed — differentiates from transient 404s              | Temporarily unavailable                                    |
| `412` | Precondition Failed     | `If-Match`/`If-Unmodified-Since` failed                                        | Non-conditional validation                                 |
| `413` | Content Too Large       | Payload exceeds limit                                                          | URL too long (use `414`)                                   |
| `415` | Unsupported Media Type  | Wrong `Content-Type`                                                           | JSON schema issues (use `422`)                             |
| `422` | Unprocessable Content   | Parseable but semantically invalid (business rule failures)                    | Syntax errors (use `400`)                                  |
| `423` | Locked                  | Resource locked by another operation                                           | Generic conflicts                                          |
| `428` | Precondition Required   | You require conditional requests but the client didn't send one                | Use sparingly                                              |
| `429` | Too Many Requests       | Rate limit exceeded. MUST include `Retry-After`                                | Quota exhaustion that's permanent (use `402`/`403`)        |
| `500` | Internal Server Error   | Unhandled exception, bug, invariant violation                                  | _Anything_ the client caused (use 4xx)                     |
| `502` | Bad Gateway             | Upstream returned garbage                                                      | Your own service bug                                       |
| `503` | Service Unavailable     | Planned maintenance or known degradation. Include `Retry-After`                | Transient upstream failure (use `502`/`504`)               |
| `504` | Gateway Timeout         | Upstream didn't respond in time                                                | Your own timeout                                           |
| `507` | Insufficient Storage    | Quota/disk exhausted                                                           | Generic capacity issues                                    |

**Sharper choices to make explicitly:**

- **`400` vs `422`.** If the body couldn't be parsed as JSON, that's `400`. If it parsed fine but `quantity = -1`, that's `422`. Teams that conflate these force clients to guess whether they need to fix syntax or logic.
- **`401` vs `403`.** Missing/invalid auth is `401`; authenticated-but-forbidden is `403`. Don't reveal _which_ permission is missing in the body (see §11).
- **`404` as a disclosure shield.** When a caller shouldn't know a resource exists, return `404` instead of `403`. Google's AIP-193 prescribes this; it prevents attackers from enumerating private IDs.
- **`409` vs `412`.** `412` specifically signals that a conditional header (`If-Match`, ETag, version) didn't match. `409` is the broader conflict bucket.
- **`500` is a confession.** A `500` means "we have a bug." If the cause is a client mistake, upgrade to the correct 4xx. If the cause is upstream, prefer `502`/`503`/`504` so dashboards and SLOs can distinguish failure domains.

### gRPC — the canonical codes

gRPC has 16 canonical status codes. Don't map HTTP 1:1 — the semantics differ.

| gRPC code            | HTTP analogue | When to use                                                                 | Generally retryable?                    |
| -------------------- | ------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| `OK`                 | 200           | Success                                                                     | n/a                                     |
| `CANCELLED`          | 499           | Client cancelled                                                            | No (client's choice)                    |
| `UNKNOWN`            | 500           | Last-resort; you don't know what happened                                   | No                                      |
| `INVALID_ARGUMENT`   | 400           | Caller specified bad input regardless of system state                       | No                                      |
| `DEADLINE_EXCEEDED`  | 504           | Deadline elapsed before completion                                          | Yes, with backoff (if idempotent)       |
| `NOT_FOUND`          | 404           | Requested entity not found                                                  | No                                      |
| `ALREADY_EXISTS`     | 409           | Entity already exists (e.g. create collision)                               | No                                      |
| `PERMISSION_DENIED`  | 403           | Authorization denied                                                        | No                                      |
| `RESOURCE_EXHAUSTED` | 429           | Quota/rate limit exhausted                                                  | Yes, respect retry hint                 |
| `FAILED_PRECONDITION`| 412/409       | System is in the wrong state; caller should _not_ retry without acting     | No                                      |
| `ABORTED`            | 409           | Operation aborted (concurrency conflict, transaction abort)                 | Yes, at a higher abstraction level      |
| `OUT_OF_RANGE`       | 400           | Input out of valid range (distinct from `INVALID_ARGUMENT` when iterating)  | No (until caller adjusts)               |
| `UNIMPLEMENTED`      | 501           | Method not implemented / not supported                                      | No                                      |
| `INTERNAL`           | 500           | Internal invariant broken                                                   | No                                      |
| `UNAVAILABLE`        | 503           | Service unavailable; most common transient error                            | Yes, with backoff                       |
| `DATA_LOSS`          | 500           | Unrecoverable data loss or corruption                                       | No                                      |
| `UNAUTHENTICATED`    | 401           | Missing/invalid credentials                                                 | Only after refreshing credentials       |

**Critical gRPC subtleties:**

- `FAILED_PRECONDITION` vs `ABORTED` vs `UNAVAILABLE`: if the client can fix it and retry → `FAILED_PRECONDITION`. If a higher-level retry (from a fresh read) will likely succeed → `ABORTED`. If a blind retry with backoff will probably succeed → `UNAVAILABLE`. The canonical gRPC docs enshrine this ordering.
- Don't overuse `UNKNOWN` or `INTERNAL`. They're client-handling dead-ends.
- For rich error details, use `google.rpc.Status.details` with the standard payloads (`ErrorInfo`, `BadRequest`, `PreconditionFailure`, `QuotaFailure`, `RetryInfo`, `LocalizedMessage`, `Help`, `DebugInfo`). See §12.2.

---
