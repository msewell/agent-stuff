## 16. Caching

### Cache-Control

```
# Immutable asset (versioned URL)
Cache-Control: public, max-age=31536000, immutable

# Frequently changing data — cache briefly, revalidate
Cache-Control: private, max-age=60

# Never cache (sensitive data)
Cache-Control: no-store
```

| Directive | Meaning |
|-----------|---------|
| `public` | Any cache (CDN, proxy) may store the response |
| `private` | Only the end client may cache (used when response contains user-specific data) |
| `max-age=N` | Fresh for N seconds without revalidation |
| `s-maxage=N` | Overrides `max-age` for shared caches (CDN/proxy) |
| `no-cache` | Cache may store but must revalidate before every use |
| `no-store` | Never store the response anywhere |
| `immutable` | Response will never change — no revalidation needed |

### ETags and conditional requests

ETags act as a "fingerprint" for a resource version. Combine with `Cache-Control` for
efficient revalidation:

```
# First request
GET /products/42

HTTP/1.1 200 OK
ETag: "a1b2c3d4"
Cache-Control: private, max-age=300

{ "id": 42, "name": "Widget", "price": 9.99 }
```

```
# Subsequent request (after max-age expires) — conditional
GET /products/42
If-None-Match: "a1b2c3d4"

HTTP/1.1 304 Not Modified
ETag: "a1b2c3d4"
```

The `304` response has no body, saving bandwidth and server processing.

### Optimistic concurrency with ETags

Use `If-Match` to prevent lost updates:

```
PUT /products/42
If-Match: "a1b2c3d4"
Content-Type: application/json

{ "id": 42, "name": "Widget", "price": 12.99 }
```

If the resource has been modified since the ETag was issued:

```
HTTP/1.1 412 Precondition Failed
```

This prevents two clients from silently overwriting each other's changes.

### Caching strategy by resource type

| Resource type | Strategy |
|---------------|----------|
| Static config / reference data | `public, max-age=86400` + ETag |
| User-specific data | `private, max-age=60` + ETag |
| Real-time data (prices, inventory) | `no-cache` + ETag (revalidate every time) |
| Sensitive data (tokens, PII) | `no-store` |

---

## 17. Idempotency

### Why it matters

Networks are unreliable. Clients *will* retry requests. Without idempotency
guarantees, retries can create duplicate records, double charges, or inconsistent
state.

### HTTP method idempotency

GET, PUT, and DELETE are idempotent by specification. The challenge is **POST**, which
creates a new resource each time by default.

### Idempotency keys (for POST and non-idempotent operations)

The client generates a unique key (UUID v4) per logical operation and sends it in a
header:

```
POST /payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "amount": 5000,
  "currency": "usd",
  "customer_id": "cust_123"
}
```

**Server behavior:**

1. **First request:** Process normally. Store the idempotency key, request fingerprint,
   and response in a durable store (Redis, DynamoDB). Return `201 Created`.
2. **Retry (same key, same body):** Return the stored response without re-processing.
3. **Retry (same key, different body):** Return `422 Unprocessable Content` — this
   prevents accidental misuse.

### Implementation best practices

| Practice | Rationale |
|----------|-----------|
| Store keys with a TTL (24–72 hours) | Prevents unbounded storage growth |
| Only cache successful responses (2xx) | Don't replay transient failures — a `500` today may succeed tomorrow |
| Use database-level locking or CAS | Prevents race conditions from concurrent retries |
| Validate the request fingerprint | Catches misuse where the same key is reused for different operations |

This pattern is battle-tested at Stripe, AWS, and PayPal.

---

## 18. Content Negotiation

### Request format

Clients specify desired format via the `Accept` header:

```
GET /users/42
Accept: application/json
```

The server responds with the matching format and declares it:

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

If the server cannot produce the requested format:

```
HTTP/1.1 406 Not Acceptable
```

### Compression

Support content encoding to reduce payload size:

```
GET /users
Accept-Encoding: br, gzip

HTTP/1.1 200 OK
Content-Encoding: br
```

**Prefer Brotli (`br`)** over gzip when clients support it — Brotli achieves 15–25%
better compression ratios for JSON payloads.

### Language and locale

```
GET /products/42
Accept-Language: fr-FR, en;q=0.5
```

Use the `Content-Language` response header to confirm the language served.

---

