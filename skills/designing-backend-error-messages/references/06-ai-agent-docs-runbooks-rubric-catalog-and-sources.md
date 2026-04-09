# Backend Error Messages Guide — Part 6: AI Agent Docs, Runbooks, Review Rubric, Catalog, and Sources

_Adapted from the source gist and reorganized for progressive disclosure in the skill._

## Table of Contents

- [14. Documenting errors (continued)](#14-documenting-errors-continued)
  - [For AI agents](#for-ai-agents)
  - [Runbook template](#runbook-template)
- [15. Review checklist / rubric](#15-review-checklist-rubric)
- [16. Example error catalog (starter set)](#16-example-error-catalog-starter-set)
- [17. Sources and further reading](#17-sources-and-further-reading)

---
## 14. Documenting errors (continued)

### For AI agents

APIs are increasingly consumed by AI agents. Three things help:

- **Serve `llms.txt` or `llms-full.txt`** with a digestible summary of your error taxonomy.
- **Keep error descriptions prose-parseable**: short sentences, no tables, no ASCII art in the documentation text.
- **List remediation steps explicitly**: "If you see this error, do X. If that doesn't work, do Y."

### Runbook template

For any error code that can fire in production and page an engineer, maintain an internal runbook. The scaffolder (driven by `errors.yaml`) creates a stub; the owning team fills it in. Link the runbook from the alert, not just the docs site.

    # Runbook: `<error.code>`

    **Owner:** <team>
    **Severity:** <sev1 | sev2 | sev3>
    **HTTP status:** <status>
    **gRPC code:** <code>
    **Transient:** <yes | no | conditional>
    **Counts toward SLO:** <yes | no>
    **Introduced:** <vYYYY.MM>
    **Last updated:** <YYYY-MM-DD>

    ## Symptoms

    What the user sees, what the client SDK raises, what the graphs show.

    - User-visible message: "..."
    - Client SDK exception: `<ErrorClass>` with `code = "<error.code>"`
    - Dashboard: <link to grafana panel filtered to this code>
    - Alert that pointed you here: <link to alert rule>

    ## Impact

    - Blast radius: single user | one tenant | cohort | global
    - Correlated metrics: <latency? queue depth? upstream saturation?>
    - SLO impact: <burns budget at X%/hour at current rate, or N/A>

    ## Diagnostic steps

    1. **Verify scope.** `<metric query filtering by code, tenant, region>`
    2. **Find a recent example.** `<log query for code:<error.code> in last 15m>`
    3. **Pull the trace.** Copy `trace_id` from the log entry → paste into
       <trace UI link>.
    4. **Check upstream health.** <upstream dashboard / status page>.
    5. **Check deploys.** Any changes to <owning service> in the last 2h?
    6. **Check feature flags.** Any recently flipped flags on this code path?

    ## Known causes

    | Cause                                  | Signal                              | Fix                         |
    | -------------------------------------- | ----------------------------------- | --------------------------- |
    | Upstream rate-limiting us              | `upstream_status:429` in logs       | Back off; contact vendor    |
    | Feature flag `x_enabled` rolled out    | Spike starts at flag-flip time      | Roll back flag              |
    | DB primary failover                    | `db.connection_reset` co-occurring  | Wait for failover; verify   |
    | Credential rotation misalignment       | Spike after rotation timestamp      | Re-run rotation playbook    |

    ## Mitigations

    - **Immediate:** <kill switch? flag flip? reroute traffic?>
    - **Short-term:** <scale up? degrade feature? raise timeout?>
    - **If nothing works:** Page <escalation>.

    ## Escalation

    1. On-call <team>: <pager link>
    2. Service owner: <slack channel>
    3. Executive: <only if sev1 and sustained>

    ## Post-incident checklist

    - [ ] File incident in <incident tracker>, tag with `error_code:<error.code>`
    - [ ] Update this runbook with any new learnings
    - [ ] Add new causes to "Known causes" above
    - [ ] If detection was slow, add or tune an alert
    - [ ] If the fix was manual, file an automation ticket
    - [ ] If the user-visible message was misleading, update it in `errors.yaml`

**Why a template instead of freeform?** Runbooks are written once under calm conditions and read many times under pressure. A consistent shape means the on-call engineer at 3 a.m. knows exactly where to find the thing they need without reading the whole page. The scaffolder enforces it; reviewers enforce that it's filled in before an error code with `exclude_from_slo: false` can ship.

---

## 15. Review checklist / rubric

Use this as a PR/code-review gate for every new or changed error path. Each item is binary.

### Response structure

- [ ] Response uses the service's canonical error shape (RFC 9457 / `google.rpc.Status` / GraphQL `extensions`).
- [ ] `status` (or gRPC code) is the most specific applicable.
- [ ] `code` is stable, namespaced, snake_case, documented.
- [ ] `title` is short, human, and stable for this code.
- [ ] `detail` is specific to this occurrence and contains no secrets/PII.
- [ ] `trace_id` is present.
- [ ] `help_url` points at a published doc page (not a 404 / TODO).

### Retry signalling

- [ ] `is_transient` is set correctly (`true` for retryable, `false` for permanent).
- [ ] `Retry-After` / `RetryInfo` is present for `429` / `503`.
- [ ] Clients are not expected to parse English to classify retryability.

### Validation

- [ ] If multiple fields are invalid, _all_ are returned in a single response.
- [ ] Each field error has a JSON Pointer and its own stable code.
- [ ] Constraints (min/max/pattern) are included where applicable.

### Security

- [ ] No stack traces on the wire.
- [ ] No SQL, no file paths, no hostnames, no library versions, no secrets.
- [ ] Auth errors don't reveal user existence.
- [ ] Private resources return `404`, not `403`, when the caller can't see them.
- [ ] Debug details are behind an environment flag, not in production.

### Observability

- [ ] `trace_id` is propagated from inbound headers or freshly generated.
- [ ] A structured log is emitted with the same `trace_id`, containing the stack and forensic context.
- [ ] The error increments a metric keyed by `code` (not just `status`).
- [ ] If this error is new, a runbook entry exists.

### Documentation

- [ ] The `code` is registered in the central error registry.
- [ ] The `code` is in the OpenAPI / proto docs for affected operations.
- [ ] The docs page for the `code` exists and is reachable from `help_url`.

### Scoring

- **Green** — all items pass. Ship it.
- **Yellow** — one or two items miss, none in Security. Fix in this PR.
- **Red** — any Security item misses. Block the PR.

---

## 16. Example error catalog (starter set)

A catalog like this, published and documented, is what turns an API from "a surface" into something developers actually want to integrate with.

| HTTP | Code                                  | Transient? | Triggered by                                                           |
| ---- | ------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 400  | `request.malformed`                   | No         | Body is not valid JSON / required content-type missing                 |
| 400  | `request.unknown_field`               | No         | Body contains a field the API doesn't recognize                        |
| 401  | `auth.credentials_missing`            | No         | No API key / bearer token supplied                                     |
| 401  | `auth.credentials_invalid`            | No         | Token doesn't parse or isn't signed correctly                          |
| 401  | `auth.token_expired`                  | No         | Signed correctly but past `exp`                                        |
| 403  | `auth.permission_denied`              | No         | Caller lacks the required scope/role                                   |
| 404  | `resource.not_found`                  | No         | Resource doesn't exist or caller can't see it                          |
| 405  | `request.method_not_allowed`          | No         | Path exists, verb doesn't                                              |
| 409  | `resource.already_exists`             | No         | Unique constraint violated on create                                   |
| 409  | `conflict.version_mismatch`           | Conditional| Optimistic concurrency failure; client should re-read and retry        |
| 410  | `resource.gone`                       | No         | Resource permanently deleted                                           |
| 412  | `precondition.if_match_failed`        | No         | `If-Match` didn't match current ETag                                   |
| 413  | `request.payload_too_large`           | No         | Body exceeds per-endpoint limit                                        |
| 415  | `request.unsupported_media_type`      | No         | `Content-Type` not supported                                           |
| 422  | `validation.failed`                   | No         | One or more fields failed semantic validation (see `errors[]`)         |
| 423  | `resource.locked`                     | Conditional| Another operation holds a lock                                         |
| 429  | `rate_limit.per_user_exceeded`        | Yes        | Caller exceeded per-user quota                                         |
| 429  | `rate_limit.global_exceeded`          | Yes        | System-wide throttle engaged                                           |
| 500  | `internal.unknown`                    | No         | Unhandled exception; bug                                               |
| 500  | `internal.invariant_violated`         | No         | A system invariant we assert was broken                                |
| 502  | `upstream.bad_response`                | Yes       | Upstream returned something un-parseable                               |
| 503  | `service.unavailable`                 | Yes        | Planned maintenance or degraded                                        |
| 504  | `upstream.timeout`                    | Yes        | Upstream didn't respond in time                                        |
| 507  | `storage.quota_exhausted`             | No         | Tenant or account out of storage                                       |

Each entry should have a docs page. Each entry should have a metric. Each of the permanent entries should have a "what to do" that is _not_ "contact support".

---

## 17. Sources and further reading

### Standards and specifications

- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) — the IETF standard that obsoletes RFC 7807.
- [RFC Editor: RFC 9457 info](https://www.rfc-editor.org/info/rfc9457)
- [Google AIP-193: Errors](https://google.aip.dev/193) — Google's opinionated error model for gRPC and HTTP.
- [Google Cloud API Design Guide](https://docs.cloud.google.com/apis/design) — broader API design context.
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — the `traceparent` / `tracestate` propagation spec.
- [CWE-550: Server-generated Error Message Containing Sensitive Information](https://cwe.mitre.org/data/definitions/550.html) — the classic vulnerability to avoid.

### gRPC

- [gRPC Core: Status codes and their use in gRPC](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)
- [gRPC: Error handling guide](https://grpc.io/docs/guides/error/)
- [gRPC: Retry guide](https://grpc.io/docs/guides/retry/)
- [Postman Blog: gRPC Error Codes Explained](https://blog.postman.com/grpc-error-codes/)
- [Baeldung: Error Handling in gRPC](https://www.baeldung.com/grpcs-error-handling)

### REST / HTTP practice

- [Speakeasy: Errors Best Practices in REST API Design](https://www.speakeasy.com/api-design/errors)
- [Zuplo: Best Practices for Consistent API Error Handling](https://zuplo.com/learning-center/best-practices-for-api-error-handling)
- [Postman Blog: Best Practices for API Error Handling](https://blog.postman.com/best-practices-for-api-error-handling/)
- [Fern: API Design Best Practices Guide](https://buildwithfern.com/post/api-design-best-practices-guide)
- [Swagger Blog: Problem Details (RFC 9457): Doing API Errors Well](https://swagger.io/blog/problem-details-rfc9457-doing-api-errors-well/)
- [Redocly: RFC 9457 — Better information for bad situations](https://redocly.com/blog/problem-details-9457)
- [WorkOS: The developer's guide to HTTP error codes](https://workos.com/blog/http-error-codes)
- [Microsoft Tech Community: API Error Handling — A Comprehensive Guide](https://techcommunity.microsoft.com/discussions/appsonazure/best-practices-for-api-error-handling-a-comprehensive-guide/4088121)
- [Baeldung: REST API Error Handling Best Practices](https://www.baeldung.com/rest-api-error-handling-best-practices)
- [PortSwigger Web Security Academy: Information disclosure in error messages](https://portswigger.net/web-security/information-disclosure/exploiting/lab-infoleak-in-error-messages)

### Stripe's error model

- [Stripe API Reference: Errors](https://docs.stripe.com/api/errors)
- [Stripe: Error codes](https://docs.stripe.com/error-codes)
- [Stripe: Error handling](https://docs.stripe.com/error-handling)
- [Stripe: Advanced error handling](https://docs.stripe.com/error-low-level)
- [Brandur Leach: The `is_transient` property](https://brandur.org/fragments/is-transient)

### Retries and idempotency

- [Adyen: API idempotency](https://docs.adyen.com/development-resources/api-idempotency)
- [Google Cloud Storage: Retry strategy](https://docs.cloud.google.com/storage/docs/retry-strategy)
- [Octave: Error Handling and Retry Logic for Production APIs](https://octavehq.com/post/error-handling-retry-logic-production-apis)
- [DEV: Offline-First Sync — Idempotency, Retry Storms, and Dead Letters](https://dev.to/salazarismo/the-hidden-problems-of-offline-first-sync-idempotency-retry-storms-and-dead-letters-1no8)
- [DEV: Transient Errors — Retry Wisely](https://dev.to/sezginege/transient-errors-retry-wisely-43fk)

### Observability references

- [Honeycomb: Logging Best Practices Checklist](https://www.honeycomb.io/blog/engineers-checklist-logging-best-practices)
- [IBM: Three Pillars of Observability](https://www.ibm.com/think/insights/observability-pillars)
- [Edge Delta: Distributed Systems Observability Guide](https://edgedelta.com/company/knowledge-center/distributed-systems-observability)
- [Railway: Using Logs, Metrics, Traces, and Alerts to Understand System Failures](https://blog.railway.com/p/using-logs-metrics-traces-and-alerts-to-understand-system-failures)

### UX writing for errors

- [Nielsen Norman Group: Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- [Nielsen Norman Group: An Error Messages Scoring Rubric](https://www.nngroup.com/articles/error-messages-scoring-rubric/)
- [Nielsen Norman Group: 10 Design Guidelines for Reporting Errors in Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- [Nielsen Norman Group: The 3 I's of Microcopy](https://www.nngroup.com/articles/3-is-of-microcopy/)

### Anti-patterns

- [caines.ca: 3 Terrible Anti-patterns for Error-Handling in REST APIs](https://caines.ca/posts/2014-06-02-3-terrible-anti-patterns-for-error-handling-in-rest-apis/)
- [Medium (Lakshmi Mishra): API Anti-Patterns](https://lakshmimishra.medium.com/api-anti-patterns-e2d02539d85a)
- [Specmatic: API Design Anti-patterns](https://specmatic.io/appearance/how-to-identify-avoid-api-design-anti-patterns/)

---

_This guide reflects RFC 9457, gRPC error model guidance, Google AIP-193, and Stripe/Brandur idempotency patterns._
