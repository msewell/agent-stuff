## 3. Naming Conventions & Schema Design

### JSON field naming: use camelCase

```json
{
  "userId": 42,
  "firstName": "Alice",
  "emailAddress": "alice@example.com",
  "createdAt": "2026-02-28T14:23:01Z",
  "orderStatus": "SHIPPED"
}
```

**Why camelCase:** It is the convention mandated by the Google JSON Style Guide and
aligns natively with JavaScript/TypeScript — the most common API consumer environment.
JSON itself originated from JavaScript, making camelCase the natural fit.

**snake_case is equally valid** if your ecosystem is Python- or Ruby-centric (Stripe,
Twitter, and GitHub v3 all use snake_case). The critical rule is **consistency** — pick
one convention and enforce it across every endpoint, request, and response. Never mix
conventions within the same API.

| Context | Convention | Example |
|---------|-----------|---------|
| JSON field names | camelCase | `firstName`, `createdAt` |
| URL paths | kebab-case | `/order-items`, `/user-profiles` |
| Query parameters | camelCase or snake_case (match your JSON) | `?sortBy=createdAt` |
| Enum values | UPPER_SNAKE_CASE | `"PENDING"`, `"IN_PROGRESS"` |
| HTTP headers | Train-Case (standard) | `Content-Type`, `X-Request-Id` |

### Date and time: use RFC 3339 (ISO 8601 profile) in UTC

```json
{
  "createdAt": "2026-02-28T14:23:01Z",
  "updatedAt": "2026-02-28T15:10:45.123Z",
  "scheduledDate": "2026-03-15"
}
```

| Rule | Rationale |
|------|-----------|
| Always use RFC 3339 format | Unambiguous, human-readable, parseable by every language's standard library |
| Default to UTC (the `Z` suffix) | Eliminates timezone confusion across distributed systems |
| Truncate to milliseconds (`.sss`) | Java supports nanoseconds, JavaScript only milliseconds — truncate to the lowest common denominator for cross-platform safety |
| Use `_at` / `At` suffix for timestamps | `createdAt`, `updatedAt`, `deletedAt` — clearly signals "point in time" vs. a date like `birthDate` |
| Use date-only format when time is irrelevant | `"2026-03-15"` for a due date, not `"2026-03-15T00:00:00Z"` |

**Why not Unix timestamps?** They are not human-readable. A developer debugging a
response cannot instantly interpret `1740751381` — they must convert it. ISO 8601 is
self-documenting. The performance difference is negligible.

### Null vs. omitted fields

These have different semantic meanings. Do not conflate them.

| Scenario | What to do | Example |
|----------|-----------|---------|
| Field has no value and was not provided | **Omit the field** entirely | `{}` (no `middleName` key) |
| Field is intentionally being cleared | **Send `null`** explicitly | `{ "middleName": null }` |
| PATCH: field should not be changed | **Omit the field** | `{ "email": "new@example.com" }` — only email changes |
| PATCH: field should be cleared | **Send `null`** | `{ "nickname": null }` — nickname is removed |

**Never use `""` (empty string) as a substitute for `null`.** An empty string is a
valid value; `null` means "no value." Conflating them creates bugs that are painful
to debug.

**Document nullable fields explicitly** in your OpenAPI spec. A field can be both
`required` (the key must be present) and `nullable` (its value may be `null`).

### Boolean fields: avoid nullable booleans

A boolean has two values: `true` and `false`. If a third state (unknown/unset) is
meaningful, **replace the boolean with a string enum**.

```json
// Bad — what does null mean? Unknown? Not yet decided? Default?
{ "isVerified": null }

// Good — explicit three-state enum
{ "verificationStatus": "PENDING" }   // or "VERIFIED", "UNVERIFIED"
```

**Why:** Nullable booleans cause problems across strongly typed languages (Go, Java,
Swift). `Optional<Boolean>` or `*bool` is awkward, poorly supported by many
serialization libraries, and semantically unclear. A named enum is self-documenting.

### Enum design

```json
{ "orderStatus": "IN_PROGRESS" }
```

| Practice | Rationale |
|----------|-----------|
| Use strings, not integers | `"SHIPPED"` is self-documenting; `3` means nothing without a lookup table |
| Use UPPER_SNAKE_CASE | Visually distinct from field names; consistent across languages |
| Prefer open enums | Clients should handle unknown enum values gracefully (e.g., fall back to a default). Adding new values should not be a breaking change |
| Document every value | Include descriptions in the OpenAPI spec for each enum member |

### Resource representation conventions

| Convention | Recommendation |
|------------|---------------|
| **Resource IDs** | Use string type even for numeric IDs — avoids JavaScript integer overflow (`Number.MAX_SAFE_INTEGER` is 2^53) and allows future migration to UUIDs |
| **Money / currency** | Use the smallest currency unit (cents, not dollars) as an integer, plus a currency code: `{ "amount": 5000, "currency": "USD" }`. Avoids floating-point precision errors |
| **Collections** | Wrap in a named key (`"data": [...]`) rather than returning a bare array — allows adding pagination metadata without a breaking change |
| **Empty collections** | Return `{ "data": [] }`, never `null` or `404` — an empty list is a valid result |

---

## 4. HTTP Methods

Use methods according to their defined semantics in RFC 9110.

| Method | Semantics | Idempotent | Safe | Typical Status |
|--------|-----------|-----------|------|---------------|
| `GET` | Retrieve a resource | Yes | Yes | `200` |
| `POST` | Create a resource or trigger a process | **No** | No | `201` |
| `PUT` | Full replacement of a resource | Yes | No | `200` or `204` |
| `PATCH` | Partial update of a resource | **No**\* | No | `200` |
| `DELETE` | Remove a resource | Yes | No | `204` |

\* `PATCH` is not inherently idempotent, but *can* be made idempotent by design (e.g.,
JSON Merge Patch). Prefer idempotent PATCH operations when possible.

### PUT vs. PATCH

```
# PUT — full replacement (client sends the entire resource)
PUT /users/42
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}

# PATCH — partial update (client sends only the changed fields)
PATCH /users/42
Content-Type: application/merge-patch+json

{
  "role": "admin"
}
```

**Why the distinction matters:** PUT is idempotent by definition — sending the same
full representation twice produces the same state. PATCH is more bandwidth-efficient
but requires careful design to avoid conflicts. Use JSON Merge Patch (RFC 7396) for
simple cases and JSON Patch (RFC 6902) when you need atomic operations on arrays or
conditional updates.

### POST for non-CRUD operations

When an action doesn't map cleanly to CRUD, use POST with a clear resource name:

```
POST /users/42/password-reset
POST /orders/7/cancellation
```

This preserves REST's resource-oriented style while supporting process-oriented actions.

---

