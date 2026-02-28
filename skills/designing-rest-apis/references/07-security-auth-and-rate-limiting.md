## 13. Security

### OWASP API Security Top 10 (2023 — current)

Every API engineer should understand these risks:

| # | Risk | Key mitigation |
|---|------|----------------|
| API1 | **Broken Object Level Authorization** | Check ownership/permissions on every data access, not just at the endpoint level |
| API2 | **Broken Authentication** | Use proven auth frameworks; enforce token expiry; never roll your own crypto |
| API3 | **Broken Object Property Level Authorization** | Whitelist returned fields; don't expose internal properties |
| API4 | **Unrestricted Resource Consumption** | Rate limiting, payload size limits, query complexity limits |
| API5 | **Broken Function Level Authorization** | Enforce role checks per operation, not just per resource |
| API6 | **Unrestricted Access to Sensitive Business Flows** | Bot detection, CAPTCHA, workflow state validation |
| API7 | **Server-Side Request Forgery (SSRF)** | Validate and sanitize URLs; restrict outbound requests |
| API8 | **Security Misconfiguration** | Disable debug modes; enforce CORS; remove default credentials |
| API9 | **Improper Inventory Management** | Maintain an API inventory; sunset old versions |
| API10 | **Unsafe Consumption of Third-Party APIs** | Treat third-party data as untrusted input; validate and sanitize |

### Foundational security practices

1. **HTTPS only** — never serve APIs over plain HTTP. Use HSTS headers. Consider
   mutual TLS (mTLS) for service-to-service communication.
2. **Input validation** — validate types, ranges, lengths, and formats on every
   parameter. Reject unexpected fields. Use allowlists, not blocklists.
3. **Output encoding** — even in JSON APIs, sanitize output that could end up
   rendered in HTML contexts.
4. **Request size limits** — return `413 Content Too Large` for oversized payloads.
5. **Security headers:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'
```

---

## 14. Authentication & Authorization

### Token-based auth (recommended)

```
GET /users/42
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

| Pattern | Best for | Notes |
|---------|----------|-------|
| **OAuth 2.0 + PKCE** | Third-party integrations, SPAs, mobile | Industry standard for delegated access |
| **JWT access tokens** | Stateless auth between services | Use RS256 or ES256; set short TTLs (15–30 min) |
| **API keys** | Server-to-server, simple integrations | Treat as secrets; transmit only in headers, never in URLs |
| **mTLS** | Service mesh, high-security environments | Strongest machine-to-machine auth |

### JWT best practices

1. **Sign with asymmetric algorithms** (RS256, ES256) — allows verification without
   sharing the signing key.
2. **Set short expiration** — 15–30 minutes for access tokens. Use refresh tokens
   (stored securely) for longer sessions.
3. **Validate all claims** — issuer (`iss`), audience (`aud`), expiration (`exp`),
   and signature on every request.
4. **Never store sensitive data in the payload** — JWTs are signed, not encrypted.
   Anyone can decode the payload.

### Authorization

Enforce authorization at the *data* level, not just at the endpoint level:

```
# Both requests hit the same endpoint, but user A must not see user B's orders
GET /orders/99   → 200 (if caller owns order 99)
GET /orders/99   → 403 (if caller does NOT own order 99)
```

### CORS

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

**Never** use `Access-Control-Allow-Origin: *` on authenticated endpoints. Whitelist
specific origins.

---

## 15. Rate Limiting

### Why rate limit

Rate limiting protects against abuse, prevents resource exhaustion, and ensures fair
usage across consumers.

### Algorithms

| Algorithm | Behavior | Best for |
|-----------|----------|----------|
| **Token bucket** | Allows bursts up to bucket size, refills at a steady rate | Most APIs — balances burst tolerance with steady-state control |
| **Sliding window** | Counts requests in a rolling time window | Smooth rate enforcement |
| **Fixed window** | Counts requests in fixed time intervals | Simple to implement but allows bursts at window boundaries |
| **Leaky bucket** | Processes requests at a fixed rate, queuing excess | Strict rate enforcement |

### Response headers

Use the standardized `RateLimit` header (IETF draft RFC 9110 extension):

```
HTTP/1.1 200 OK
RateLimit: limit=100, remaining=47, reset=28
RateLimit-Policy: 100;w=60
```

When the limit is exceeded:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit: limit=100, remaining=0, reset=30
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "You have exceeded 100 requests per minute. Retry after 30 seconds."
}
```

### Best practices

1. **Communicate limits clearly** — document limits and return them in headers on
   every response, not just `429` responses.
2. **Use tiered limits** — different limits per plan/role (free vs. paid).
3. **Consider dynamic rate limiting** — adapt limits based on server load and
   response times.
4. **Clients: implement exponential backoff with jitter** — prevents thundering herd
   on retry.

---

