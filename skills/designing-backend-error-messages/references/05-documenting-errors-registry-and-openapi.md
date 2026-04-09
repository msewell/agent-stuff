# Backend Error Messages Guide — Part 5: Documenting Errors, Registry, and OpenAPI

_Adapted from the source gist and reorganized for progressive disclosure in the skill._

## Table of Contents

- [14. Documenting errors](#14-documenting-errors)

---
## 14. Documenting errors

An error code is part of your public API. Treat it that way. The guidance below assumes a single source of truth — a checked-in `errors.yaml` registry — from which your server code, OpenAPI spec, docs site, runbooks, and alerts are all generated. Drift between "code the server emits" and "code documented to clients" becomes structurally impossible when they're derived from the same file.

### What to publish

- **A dedicated "Errors" page** in your API reference, organized by status code or domain, listing every code your API can return.
- **Per-code detail page**. For each code: what triggers it, what to do, whether it's transient, example response. This is what `help_url` points to.
- **Copy-pasteable examples**. Every documented code should have an example request and the exact error response.
- **Change log for errors**. Announce new codes; announce deprecations early. Never rename.

### The error registry (`errors.yaml`)

A single checked-in file defining every error code the service can emit. It is the source of truth consumed by the server's error serializer (§11), the OpenAPI spec, the docs site, the runbook scaffolder, and the SLO burn-rate alert generator (§10).

```yaml
# errors.yaml
version: 1
domain: billing.example.com
defaults:
  help_url_base: https://docs.example.com/errors/
  is_transient: false
  exclude_from_slo: false

errors:
  - code: billing.card_declined
    http_status: 402
    grpc_code: FAILED_PRECONDITION
    title: "Card declined"
    detail_template: "Your card was declined: {reason}."
    is_transient: false
    exclude_from_slo: true          # user-caused — doesn't burn SLO budget
    owner: billing-team
    introduced_in: v2025.11
    runbook: runbooks/billing/card_declined.md
    description: |
      The issuer refused the charge. The `reason` metadata field carries the
      issuer decline code when available (e.g. "insufficient_funds",
      "lost_card", "do_not_honor").
    remediation: |
      Ask the customer to use a different payment method or to contact their
      bank if they believe the decline is in error.

  - code: billing.processor_unavailable
    http_status: 503
    grpc_code: UNAVAILABLE
    title: "Payment processor unavailable"
    detail_template: "We couldn't reach our payment processor. Please retry."
    is_transient: true
    exclude_from_slo: false         # our fault — burns SLO budget
    retry_after_ms_default: 5000
    owner: billing-team
    introduced_in: v2025.11
    runbook: runbooks/billing/processor_unavailable.md
    description: |
      The upstream payment processor returned 5xx or timed out. Treated as
      transient; clients should retry with exponential backoff.
    remediation: |
      Retry with backoff. If failures persist past 60 seconds, the runbook has
      the processor failover procedure.

  - code: validation.failed
    http_status: 422
    grpc_code: INVALID_ARGUMENT
    title: "Validation failed"
    is_transient: false
    exclude_from_slo: true          # caller bug — doesn't burn SLO budget
    owner: platform-team
    introduced_in: v2025.01
    description: |
      One or more fields in the request body failed semantic validation.
      Field-level details are returned in the `errors[]` array.

  # ... one entry per code in the catalog (§16)
```

**Required fields:** `code`, `http_status`, `title`, `owner`.
**Strongly recommended:** `grpc_code`, `is_transient`, `exclude_from_slo`, `description`, `remediation`, `runbook`, `introduced_in`.

**Consumers of `errors.yaml`:**

| Consumer              | Reads                                    | Produces                                          |
| --------------------- | ---------------------------------------- | ------------------------------------------------- |
| Server code generator | Every entry                              | `errors.go` / `errors.py` / `errors.ts` constants |
| Error serializer      | `http_status`, `title`, `is_transient`   | The wire error body (§3, §11)                     |
| OpenAPI generator     | `code`, `http_status`, `description`     | `x-error-codes` per operation + schemas           |
| gRPC / protobuf       | `grpc_code`, `code`                      | `ErrorInfo.reason` enum values                    |
| Docs site             | `description`, `remediation`, `help_url` | One page per code                                 |
| Runbook scaffolder    | `runbook`, `owner`                       | Stub runbook if missing                           |
| Alert generator       | `exclude_from_slo`, per-code SLO         | Prometheus / Datadog burn-rate rules (§10)        |
| CI lint               | Entire file                              | Fails build if server emits an unregistered code  |

**CI invariants worth enforcing:**

- Every `emitError("...")` / equivalent call in the server source references a code defined in `errors.yaml`. Grep the source; diff against the file.
- Every code has a `help_url` that resolves (link-check in CI).
- Every code with `runbook:` set points to a file that exists.
- Editing `errors.yaml` requires a docs-team reviewer (CODEOWNERS).
- A new entry MUST include `owner`, `introduced_in`, and `description`.

**Evolving the registry safely:**

- **Adding a code** is non-breaking. Ship any time.
- **Renaming a code** is breaking. Don't. Add a new one and deprecate the old.
- **Deprecating a code** follows the same versioning rules as any public API surface: announce in the changelog, keep emitting it for at least one deprecation window, then remove.
- **Changing `http_status` or `grpc_code`** is breaking. Clients branch on status.
- **Changing `is_transient`** is breaking. Clients branch on retry semantics.

### OpenAPI fragment

Define the Problem Details schema and the standard error responses once, then `$ref` them from every operation. Generate the specific-per-operation bits (`x-error-codes`) from `errors.yaml`.

```yaml
# openapi.yaml (fragment)
components:
  schemas:
    Problem:
      type: object
      description: |
        RFC 9457 Problem Details + extensions. Returned for every non-2xx
        response from this API.
      required: [type, title, status, code, trace_id]
      properties:
        type:
          type: string
          format: uri
          description: Stable URI identifying the problem type.
          example: https://api.example.com/errors/validation-failed
        title:
          type: string
          description: Short human summary; stable for a given `type`.
          example: Validation failed
        status:
          type: integer
          format: int32
          minimum: 400
          maximum: 599
        code:
          type: string
          description: Stable, namespaced, machine-readable error code.
          pattern: '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$'
          example: validation.failed
        detail:
          type: string
          description: Human explanation specific to this occurrence.
        instance:
          type: string
          format: uri-reference
        trace_id:
          type: string
          description: Correlation ID; paste into the observability UI.
        help_url:
          type: string
          format: uri
        is_transient:
          type: boolean
          description: True iff a retry with backoff may succeed unchanged.
        retry_after_ms:
          type: integer
          minimum: 0
        errors:
          type: array
          items: { $ref: '#/components/schemas/FieldError' }

    FieldError:
      type: object
      required: [pointer, code, message]
      properties:
        pointer:
          type: string
          description: JSON Pointer to the offending field.
          example: '#/items/0/quantity'
        code:
          type: string
          example: validation.quantity.out_of_range
        message:
          type: string
        value: {}
        constraint:
          type: object
          additionalProperties: true

  responses:
    BadRequest:
      description: Malformed or unparseable request.
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    Unauthorized:
      description: Missing or invalid credentials.
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    Forbidden:
      description: Authenticated but not allowed.
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    NotFound:
      description: Resource does not exist or is not visible.
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    Conflict:
      description: State conflict (optimistic concurrency, unique constraint).
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    ValidationFailed:
      description: Request parsed but failed semantic validation.
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    RateLimited:
      description: Rate limit exceeded.
      headers:
        Retry-After:
          schema: { type: integer }
          description: Seconds to wait before retrying.
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
    ServiceUnavailable:
      description: Service or upstream dependency unavailable.
      headers:
        Retry-After:
          schema: { type: integer }
      content:
        application/problem+json:
          schema: { $ref: '#/components/schemas/Problem' }
```

Using it from an operation — reference the reusable responses and list the specific codes this operation can emit via the `x-error-codes` extension:

```yaml
paths:
  /v1/charges:
    post:
      summary: Create a charge
      responses:
        '201':
          description: Charge created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Charge' }
        '400': { $ref: '#/components/responses/BadRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '422': { $ref: '#/components/responses/ValidationFailed' }
        '429': { $ref: '#/components/responses/RateLimited' }
        '503': { $ref: '#/components/responses/ServiceUnavailable' }
      x-error-codes:
        - validation.failed
        - billing.card_declined
        - billing.processor_unavailable
        - rate_limit.per_user_exceeded
```

**Why `x-error-codes`?** The response schemas only say _what shape_ to expect. The code list says _which specific failure modes_ this operation can produce — which is what clients need for branch logic and what SDK generators turn into typed exceptions per language. Generate this list from `errors.yaml` (filtered by which operations each code's owning handler is wired into); do not maintain it by hand.
