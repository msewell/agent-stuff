## 7. Versioning

### Choose a strategy

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URI path** | `/v1/users` | Simple, explicit, excellent cacheability | Violates URI-as-resource-identifier; breaking changes require new endpoints |
| **Query parameter** | `/users?version=1` | Easy to implement, optional | Caching complications, easy to forget |
| **Custom header** | `Api-Version: 1` | Keeps URLs clean | Less discoverable, harder to test in a browser |
| **Content negotiation** | `Accept: application/vnd.example.v1+json` | Most RESTful, per-resource granularity | Hardest to test and discover |

**Recommendation:** URI path versioning (`/v1/`) is the most widely adopted strategy
(used by Stripe, GitHub, Google, Twitter, Airbnb). Its discoverability and caching
benefits outweigh the theoretical purity of header-based approaches.

### Versioning rules

1. **Only bump major versions for breaking changes.** Adding a new optional field is
   not a breaking change. Removing a field, changing a type, or altering behavior is.
2. **Use integer versions** (`v1`, `v2`), not semver in the URL. Reserve semver for
   your OpenAPI spec and changelogs.
3. **Support at least one prior version.** Give consumers a migration window —
   typically 6–12 months. Communicate timelines via deprecation headers and
   changelogs.
4. **Design for extensibility.** Prefer additive changes: new optional fields, new
   endpoints, new enum values. Clients that ignore unknown fields won't break.

### Deprecation signaling

```
HTTP/1.1 200 OK
Deprecation: Sun, 01 Sep 2026 00:00:00 GMT
Sunset: Sun, 01 Dec 2026 00:00:00 GMT
Link: <https://api.example.com/v2/users>; rel="successor-version"
```

Use the `Deprecation` header (RFC draft) and `Sunset` header (RFC 8594) to
programmatically inform clients of upcoming removals.

---

## 8. Pagination

### Never return unbounded collections

Every list endpoint must paginate. Set a reasonable default (e.g., 20) and a maximum
(e.g., 100) page size.

### Cursor-based pagination (recommended for most cases)

```
GET /orders?limit=20&cursor=eyJpZCI6MTAwfQ==

HTTP/1.1 200 OK
Link: <https://api.example.com/orders?limit=20&cursor=eyJpZCI6MTIwfQ==>; rel="next"

{
  "data": [ ... ],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ==",
    "has_more": true
  }
}
```

**Why cursor-based:** Offset pagination degrades on large datasets because the
database still scans `offset + limit` rows. Cursors use indexed lookups with constant
performance regardless of depth. They also prevent skipped/duplicate rows when data
changes between pages.

### When to use offset pagination

Offset pagination is acceptable when:
- The dataset is small and mostly static.
- The UI requires jump-to-page navigation (page numbers).
- You need a quick prototype.

```
GET /users?limit=20&offset=40

{
  "data": [ ... ],
  "pagination": {
    "total": 523,
    "limit": 20,
    "offset": 40
  }
}
```

### Pagination best practices

| Practice | Rationale |
|----------|-----------|
| Make cursors opaque (Base64-encode) | Hides implementation; prevents clients from constructing invalid cursors |
| Include `has_more` or `next` link | Clients shouldn't guess whether more pages exist |
| Use `Link` headers (RFC 8288) | Standard mechanism, usable before parsing the body |
| Return `400` for invalid cursors | Clear error, not a silent empty result |

---

## 9. Filtering, Sorting & Field Selection

### Filtering

Use query parameters with the field name as key:

```
GET /orders?status=shipped&created_after=2026-01-01
```

For complex filters, consider a structured syntax:

```
GET /orders?filter[status]=shipped&filter[total][gte]=100
```

**Why:** Query parameters are cacheable, bookmarkable, and visible in logs.
Avoid encoding filters in the request body of a GET — many proxies and caches do not
forward GET bodies.

### Sorting

```
GET /users?sort=created_at       # ascending (default)
GET /users?sort=-created_at      # descending (prefix with -)
GET /users?sort=-priority,name   # multi-field sort
```

This convention (used by JSON:API and many major APIs) is compact and readable.

### Field selection (sparse fieldsets)

```
GET /users/42?fields=name,email
```

**Why:** Reduces payload size and processing cost. Particularly valuable on mobile
clients or when resources have many fields. This pattern is sometimes called "partial
responses" (Google APIs use `?fields=`).

---

