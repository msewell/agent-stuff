# Backend Error Messages Guide — Part 2: Error Codes, Messages, Validation, and Retryability

_Adapted from the source gist and reorganized for progressive disclosure in the skill._

## Table of Contents

- [5. Stable, machine-readable error codes](#5-stable-machine-readable-error-codes)
- [6. Writing the human-readable message](#6-writing-the-human-readable-message)
- [7. Field-level and validation errors](#7-field-level-and-validation-errors)
- [8. Error taxonomy: transient vs. permanent](#8-error-taxonomy-transient-vs-permanent)

---
## 5. Stable, machine-readable error codes

Status codes are too coarse. Human strings are too fragile (they change with copy edits; they're localized). You need a third identifier: a **stable, namespaced, machine-readable error code** that clients can branch on without parsing English.

### Naming conventions

- **Namespace by domain.** `billing.card_declined`, `auth.token_expired`, `validation.email.invalid_format`. Dots or underscores are fine; pick one and stick with it.
- **`snake_case` or `SCREAMING_SNAKE_CASE`.** Not `camelCase`, not `kebab-case`. Codes are identifiers, not URLs.
- **Verb-object or noun-adjective.** `card_declined`, `token_expired`, `quota_exhausted`. Avoid generic words like `error` or `fail` in the code itself — that's what the field _is_.
- **Stable forever.** Once a code is published, renaming it is a breaking change. Add new codes; never rename.
- **Specific, not generic.** `user_not_found` is better than `not_found`. Callers frequently need to distinguish `user_not_found` from `organization_not_found`.

### Good vs. bad

| Good                                  | Bad                          | Why                                                                                  |
| ------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `billing.card_declined`               | `card error`                 | Machine-parseable, namespaced, specific                                              |
| `auth.token_expired`                  | `unauthorized`               | Distinguishes expired-token from wrong-token without leaking _which_                 |
| `validation.email.invalid_format`     | `VALIDATION`                 | Identifies the field, the kind of violation                                          |
| `rate_limit.exceeded`                 | `429`                        | The status code isn't the error code                                                 |
| `inventory.item.out_of_stock`         | `out of stock`               | Snake case, namespaced                                                               |

### Layering: status + code + type

```text
status 429   ─────┐
code   rate_limit.per_user_exceeded  ─────┐
type   https://api.example.com/errors/rate-limit-per-user
title  "Rate limit exceeded"
detail "You may make at most 100 requests per minute; got 143."
retry_after_ms 24000
```

The status code classifies the _category_. The code classifies the _specific problem_. The type gives a URL where developers can read more. All three are stable; all three are part of your API contract.

### A note on `ErrorInfo` (Google AIP-193)

If you ship gRPC or care about interop with Google-style tooling, also emit an `ErrorInfo` payload inside `details`:

```text
ErrorInfo {
  reason:   "CARD_DECLINED"          // ≈ your error code, SCREAMING_SNAKE_CASE
  domain:   "billing.example.com"     // who owns this error
  metadata: {
    "last4":        "4242",
    "decline_code": "insufficient_funds"
  }
}
```

`ErrorInfo.reason` is the stable identifier; `domain` scopes it; `metadata` carries any dynamic values that appeared in the human message. AIP-193 is explicit: **every dynamic value in the message must also appear in `metadata`**, so clients don't have to parse English to extract them.

---

## 6. Writing the human-readable message

Jakob Nielsen's usability heuristic #9 — "Help users recognize, diagnose, and recover from errors" — applies to API error copy too. An error message should follow these rules:

### The four writing principles

1. **Describe what happened, in the user's terms.** "Card declined" not "Payment processor returned ISO-8583 code 05."
2. **Explain how to fix it.** "Use a different card or contact your bank" — or, when there's nothing the user can do, say so honestly ("This is a temporary problem on our end; please retry in a moment").
3. **Don't blame the user.** "Invalid email" is fine; "You entered a bad email" is not.
4. **Be specific but concise.** A single sentence per slot (`title`, `detail`) is usually enough. Reserve depth for the linked documentation.

### Voice and style

- **Reading level ≈ 7th–8th grade** (Flesch–Kincaid). Aim for active voice, short sentences, no jargon.
- **Preserve the caller's input when echoing.** If you reject `quantity = -3`, include `-3` in the detail so the client can match the error to the offending field. But never echo secrets, tokens, or PII that the client might not want logged.
- **No system-speak.** Avoid "null", "undefined", "exception", "handler", "middleware", "transaction rolled back".
- **Titles are stable; details are specific.** `title` ("Validation failed") should be identical for every validation failure. `detail` changes with each occurrence.
- **Localize detail, stabilize code.** If you localize, localize the human `title`/`detail`; keep the machine `code` ASCII and unchanged. Use `Content-Language` or a `locale` extension.

### Good vs. bad messages

| Bad                             | Good                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------- |
| "Something went wrong."         | "Couldn't reach the payment processor. Please retry in a moment."             |
| "Error."                        | "Your session expired. Sign in again to continue."                            |
| "Invalid input."                | "`quantity` must be between 1 and 100; got 143."                              |
| "Access denied."                | "You don't have permission to edit this project."                             |
| "500 Internal Server Error"     | "We hit an unexpected problem. Our team has been notified. Ref: 7f3c…"        |
| "NullPointerException at …"     | (never shown to clients — that goes in the log only)                          |

### The "fix-it" test

Before shipping any error, ask: **if I were the developer or user who received this, would I know what to do next?** If the answer is "no" or "open a support ticket", rewrite.

There are three acceptable "what to do next" answers:

1. **Fix your request** — include enough detail that the fix is unambiguous.
2. **Retry** — say whether with backoff, and how long to wait.
3. **Contact support** — only when nothing else works, and always include the `trace_id`.

---

## 7. Field-level and validation errors

Validation is where bad error design hurts the most. A request with 5 bad fields that returns only the first error forces 5 round trips. Don't do that.

### Rules

- **Return _all_ failing fields in one response.** It's a nicer dev experience and cheaper for your server.
- **Identify the field with a JSON Pointer** (`#/items/0/quantity`), not a free-form string. Pointers are machine-parseable and survive nested structures.
- **Each field error gets its own code.** `validation.email.invalid_format` is different from `validation.email.disposable_not_allowed`.
- **Include the constraint that failed**, when available: `{ "min": 1, "max": 100 }`.
- **Distinguish field errors from global errors.** A missing required field is a field error; "request signature doesn't match" is a global error.

### Shape

```json
{
  "type":   "https://api.example.com/errors/validation-failed",
  "title":  "Validation failed",
  "status": 422,
  "code":   "validation.failed",
  "detail": "The request contains 2 validation errors.",
  "trace_id": "7f3c…",
  "errors": [
    {
      "pointer": "#/email",
      "code":    "validation.email.invalid_format",
      "message": "Must be a valid email address.",
      "value":   "a@@b.com"
    },
    {
      "pointer":    "#/items/0/quantity",
      "code":       "validation.quantity.out_of_range",
      "message":    "Must be between 1 and 100.",
      "value":      143,
      "constraint": { "min": 1, "max": 100 }
    }
  ]
}
```

### Special cases

- **Multiple errors on the same field.** Allow it. Return both, distinguished by `code`.
- **Cross-field validation.** Use a pointer that points to the common ancestor (`#/address`) and a code like `validation.address.zip_city_mismatch`.
- **Schema-level errors** (e.g. JSON Schema `additionalProperties` violations). Point to the offending key and use a code like `validation.unknown_field`.

### Pseudocode: collecting field errors

```text
errors = []
if not isEmail(req.email):
    errors.append(fieldError("#/email", "validation.email.invalid_format",
                             "Must be a valid email address.", req.email))
if not (1 <= req.quantity <= 100):
    errors.append(fieldError("#/quantity", "validation.quantity.out_of_range",
                             "Must be between 1 and 100.", req.quantity,
                             constraint={ min: 1, max: 100 }))
if errors.length > 0:
    throw ValidationError(errors)   # single throw, all errors captured
```

Don't short-circuit at the first failure. Collect; then throw.

---

## 8. Error taxonomy: transient vs. permanent

The single most important property of an error — from the client's perspective — is whether retrying it has any chance of succeeding. Every error in your system should be classifiable as one of:

| Class                 | Example                            | Retry?                                    |
| --------------------- | ---------------------------------- | ----------------------------------------- |
| **Permanent**         | `validation.email.invalid_format`  | No — retry will fail the same way         |
| **Transient**         | `upstream.timeout`                 | Yes, with backoff + jitter                |
| **Conditionally transient** | `conflict.version_mismatch`  | Yes, after re-reading + re-computing      |
| **Rate-limited**      | `rate_limit.per_user_exceeded`     | Yes, after `Retry-After`                  |

### Signalling retryability to clients

You have three tools:

1. **Status code as a hint.** `408`, `429`, `502`, `503`, `504`, and gRPC `UNAVAILABLE`/`DEADLINE_EXCEEDED`/`RESOURCE_EXHAUSTED` are conventionally transient. But this is _only a hint_ — a `500` may be a genuine bug that will never recover.
2. **Explicit `is_transient` flag.** The most reliable signal. Include `"is_transient": true|false` in the error body. Clients with retry logic should look at this flag first and status code second. (Brandur Leach's Stripe-style pattern.)
3. **`Retry-After` header (HTTP) or `RetryInfo` detail (gRPC).** When you know how long to wait — quota reset time, scheduled maintenance window — tell the client explicitly. Prefer seconds for HTTP; use `google.protobuf.Duration` for gRPC.

### The client-side retry contract

Document this contract _once_, publicly, and link it from your docs:

> **Retry contract.** Retry any response where `is_transient: true`, using exponential backoff starting at 100 ms, doubled each attempt, with ±20% jitter, capped at the value in `Retry-After` if present, up to a maximum of 5 attempts. Never retry responses where `is_transient: false` without changing the request. Never retry non-idempotent operations without an idempotency key (see §9).

### Pseudocode: a client's error classifier

```text
function isRetryable(resp):
    if resp.body.is_transient is not null:
        return resp.body.is_transient       # explicit signal wins
    return resp.status in [408, 425, 429, 500, 502, 503, 504]

function retryDelay(resp, attempt):
    if resp.headers["Retry-After"] is not null:
        return parseRetryAfter(resp.headers["Retry-After"])
    base = min(100ms * 2 ** attempt, 30s)
    return base * uniform(0.8, 1.2)          # ±20% jitter
```

### Special cases for retry classification

- **502 vs 504 vs 503.** These encode _where_ the failure is. `502` = upstream returned garbage; `504` = upstream timed out; `503` = we're knowingly degraded. Keep them distinct so dashboards can split failure domains.
- **429 without `Retry-After` is user-hostile.** Always include the header.
- **Idempotent retries only.** For `POST`/`PATCH`, a blind retry is not safe — see §9.
- **Retry budgets.** Even transient errors shouldn't be retried infinitely. Document a retry-budget limit in your client SDK and in your server's rate limiter so both sides agree on the ceiling.

---
