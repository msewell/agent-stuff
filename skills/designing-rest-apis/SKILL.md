---
name: designing-rest-apis
description: "Guides designing and reviewing RESTful APIs following industry best practices — resource modeling, URL structure, HTTP methods, status codes, error handling (RFC 9457), pagination, versioning, security, authentication, caching, idempotency, bulk operations, async patterns, file uploads, and OpenAPI documentation. Use when designing new REST API endpoints, reviewing existing API designs for issues, choosing between REST patterns (cursor vs offset pagination, PUT vs PATCH, polling vs webhooks), writing OpenAPI specs, or making API evolution and deprecation decisions."
---

# Designing REST APIs

## Workflow: Designing a new API

1. **Model resources as nouns.** Identify domain entities. Use plural nouns for collection URLs (`/orders`, not `/getOrders`). Express relationships with sub-resources, max 2–3 levels deep.
2. **Assign HTTP methods by semantics.** GET=read, POST=create, PUT=full replace, PATCH=partial update, DELETE=remove. For non-CRUD actions, use POST with a clear resource name (`POST /orders/7/cancellation`).
3. **Define request/response schemas.** Use camelCase for JSON fields, UPPER_SNAKE_CASE for enums, RFC 3339 for dates in UTC. Wrap collections in `{ "data": [...] }`. Use string type for IDs. Represent money as smallest currency unit + currency code.
4. **Select status codes.** Return the most specific code: `201` for creation (with `Location` header), `204` for no-content success, `409` for conflicts, `422` for business rule violations. Never return `200` with an error body.
5. **Design error responses using RFC 9457** (Problem Details). Include `type` (URI), `title`, `status`, `detail`. Return all validation errors at once. Never leak stack traces.
6. **Add pagination to every list endpoint.** Default: cursor-based pagination. Use offset pagination only for small/static datasets needing jump-to-page. Always include `has_more` or a `next` link.
7. **Plan versioning.** Use URI path versioning (`/v1/`). Only bump for breaking changes. Support at least one prior version with 6–12 month migration window. Signal deprecation via `Deprecation` and `Sunset` headers.
8. **Address cross-cutting concerns.** Add rate limiting headers on every response. Use `Cache-Control` + ETags. Require idempotency keys for POST endpoints with side effects. Use `Authorization: Bearer` for auth.
9. **Write the OpenAPI spec first** (design-first, not code-first). Use OpenAPI 3.1. Document every endpoint, every status code, every error type. Lint with Spectral or Redocly CLI.

## Workflow: Reviewing an existing API

1. **Check resource modeling.** Flag verb-based URLs, deep nesting (>3 levels), inconsistent pluralization, trailing slashes, or file extensions in URLs.
2. **Check HTTP method usage.** Flag GET with side effects, POST used for retrieval, PUT used for partial updates, missing `Location` header on `201` responses.
3. **Check error handling.** Flag custom error formats (should use RFC 9457), `200` with error bodies, leaked internals, one-error-at-a-time validation.
4. **Check pagination.** Flag unbounded list endpoints, offset pagination on large datasets, missing `has_more`/`next` indicators.
5. **Check security.** Verify HTTPS-only, object-level authorization (not just endpoint-level), input validation, rate limiting, CORS whitelist (no `*` on authenticated endpoints).
6. **Check naming consistency.** Flag mixed casing conventions, nullable booleans (should be enums), integer enum values (should be strings), bare array responses.
7. Report findings grouped by severity (breaking issues → best practice violations → suggestions).

## Key decisions (defaults with escape hatches)

| Decision | Default | Alternative (when) |
|----------|---------|-------------------|
| Pagination | Cursor-based | Offset — small/static data needing page numbers |
| Partial update | PATCH with JSON Merge Patch (RFC 7396) | JSON Patch (RFC 6902) — need array ops or conditional updates |
| Versioning | URI path (`/v1/`) | Content negotiation — per-resource granularity needed |
| Auth | OAuth 2.0 + JWT (RS256, 15–30 min TTL) | API keys — simple server-to-server; mTLS — service mesh |
| Async pattern | 202 Accepted + status polling | Webhooks — server-to-server event-driven |
| Upload method | Multipart form data (1–100 MB) | Presigned URLs — cloud-native; Resumable — >100 MB |
| Error format | RFC 9457 (Problem Details) | — (no alternative; this is the standard) |
| Rate limiting | Token bucket | Sliding window — smoother enforcement |
| JSON casing | camelCase | snake_case — Python/Ruby-centric ecosystem |

## Reference material

Consult these for detailed guidance, examples, and tradeoff analysis:

- [01 — Resource & URL design, Statelessness](references/01-resource-url-design-and-statelessness.md)
- [02 — Naming conventions, Schema design, HTTP methods](references/02-naming-schema-and-http-methods.md)
- [03 — Status codes, Error handling (RFC 9457)](references/03-status-codes-and-error-handling.md)
- [04 — Versioning, Pagination, Filtering & sorting](references/04-versioning-pagination-filtering.md)
- [05 — Bulk & batch operations, Async & long-running operations](references/05-bulk-and-async-operations.md)
- [06 — File uploads & binary data](references/06-file-uploads-and-binary-data.md)
- [07 — Security (OWASP Top 10), Authentication & authorization, Rate limiting](references/07-security-auth-and-rate-limiting.md)
- [08 — Caching (ETags, Cache-Control), Idempotency, Content negotiation](references/08-caching-idempotency-and-content-negotiation.md)
- [09 — HATEOAS, OpenAPI documentation, Observability, Testing, Evolution & deprecation](references/09-hateoas-openapi-observability-testing-evolution.md)

To find guidance on a specific topic, use:
```bash
grep -i "your_topic" references/*.md
```
