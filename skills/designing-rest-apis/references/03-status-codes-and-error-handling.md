## 5. Status Codes

Return the most specific status code that accurately describes the outcome.

### Success codes

| Code | Meaning | When to use |
|------|---------|-------------|
| `200 OK` | Request succeeded | GET, PUT, PATCH with a response body |
| `201 Created` | Resource created | POST. Include a `Location` header pointing to the new resource |
| `202 Accepted` | Request accepted for async processing | Long-running operations |
| `204 No Content` | Success with no response body | DELETE, PUT/PATCH when no body is returned |
| `207 Multi-Status` | Mixed results for batch operations | Bulk endpoints where individual items may succeed or fail independently |

### Client error codes

| Code | Meaning | When to use |
|------|---------|-------------|
| `400 Bad Request` | Malformed request syntax or invalid payload | Validation failures, unparsable JSON |
| `401 Unauthorized` | Missing or invalid authentication | No token, expired token |
| `403 Forbidden` | Authenticated but not authorized | Valid token, insufficient permissions |
| `404 Not Found` | Resource does not exist | Also use when you want to hide existence from unauthorized users |
| `405 Method Not Allowed` | HTTP method not supported on this resource | Include `Allow` header listing valid methods |
| `409 Conflict` | Request conflicts with current state | Duplicate creation, concurrent modification |
| `410 Gone` | Resource previously existed but has been removed | Useful for deprecated endpoints |
| `413 Content Too Large` | Request body exceeds the limit | File uploads, large payloads |
| `415 Unsupported Media Type` | Content-Type not supported | Client sent XML when only JSON is accepted |
| `422 Unprocessable Content` | Well-formed but semantically invalid | Business rule violations |
| `429 Too Many Requests` | Rate limit exceeded | Include `Retry-After` header |

### Server error codes

| Code | Meaning |
|------|---------|
| `500 Internal Server Error` | Unexpected server failure |
| `502 Bad Gateway` | Upstream service returned an invalid response |
| `503 Service Unavailable` | Server temporarily overloaded or in maintenance. Include `Retry-After` |
| `504 Gateway Timeout` | Upstream service did not respond in time |

**Anti-pattern:** Never return `200 OK` with an error body. This breaks every HTTP
tool, proxy, and cache that relies on status codes for correct behavior.

---

## 6. Error Handling

### Use RFC 9457 (Problem Details for HTTP APIs)

Rather than inventing a custom error format, use the standard.

```
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The request body contains 2 validation errors.",
  "instance": "/users/42",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address.",
      "rejected_value": "not-an-email"
    },
    {
      "field": "age",
      "message": "Must be between 0 and 150.",
      "rejected_value": -5
    }
  ]
}
```

**Key fields:**

| Field | Required | Purpose |
|-------|----------|---------|
| `type` | Yes | A URI reference identifying the error type. Dereferenceable for documentation. |
| `title` | Yes | Short human-readable summary (stable across occurrences). |
| `status` | Yes | The HTTP status code (duplicated for convenience when body is parsed separately). |
| `detail` | Yes | Human-readable explanation specific to *this* occurrence. |
| `instance` | No | URI identifying the specific resource or request. |

**Why RFC 9457:** It's an IETF standard adopted by Azure, Spring, Zalando, and
others. It gives clients a machine-readable `type` URI they can switch on, while
`detail` remains a human-readable message. Custom extensions (like the `errors`
array above) are allowed and encouraged for validation details.

### Rules for error messages

1. **Return all validation errors at once** — don't force clients to fix one field per round-trip.
2. **Include machine-readable error codes** — the `type` URI or a stable string code, not just prose.
3. **Never leak internals** — no stack traces, SQL queries, or internal service names in production.
4. **Use `request_id`** — include a correlation ID so the client can reference it in support requests.

---

