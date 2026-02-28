## 10. Bulk & Batch Operations

### When to use bulk operations

Bulk endpoints are appropriate when clients routinely need to create, update, or
delete multiple resources in a single logical action — for example, a "Save All" from
a grid UI, a CSV import, or synchronizing data between systems. Before adding bulk
support, verify that the overhead of individual requests is actually the bottleneck;
HTTP/2 multiplexing and pipelining may be sufficient.

### Endpoint design

Use a dedicated sub-path to distinguish bulk operations from single-resource endpoints:

```
POST /users/bulk
Content-Type: application/json

{
  "operations": [
    { "method": "create", "body": { "name": "Alice", "email": "alice@example.com" } },
    { "method": "create", "body": { "name": "Bob", "email": "bob@example.com" } },
    { "method": "create", "body": { "name": "Carol", "email": "invalid" } }
  ]
}
```

**Why a separate endpoint:** It allows different validation rules, rate limits,
timeout settings, and authorization policies than the single-resource endpoint.
Avoid overloading `POST /users` to accept both a single object and an array — this
creates ambiguous contracts and complicates client code generation.

### Atomicity: all-or-nothing vs. partial success

**Choose one and document it clearly.** Both are valid, but they serve different needs.

#### Atomic (all-or-nothing)

The entire batch succeeds or the entire batch fails. No partial state.

```
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/batch-validation-failed",
  "title": "Batch Validation Failed",
  "status": 400,
  "detail": "Item at index 2 has an invalid email. No items were created."
}
```

**When to use:** Financial transactions, any batch where partial completion leaves
the system in an inconsistent state. Simpler to reason about and implement.

#### Partial success (207 Multi-Status)

Each item in the batch is processed independently. The response reports per-item
status.

```
HTTP/1.1 207 Multi-Status
Content-Type: application/json

{
  "results": [
    { "index": 0, "status": 201, "body": { "id": "usr_1", "name": "Alice" } },
    { "index": 1, "status": 201, "body": { "id": "usr_2", "name": "Bob" } },
    { "index": 2, "status": 422, "error": {
        "type": "https://api.example.com/errors/validation-failed",
        "title": "Validation Failed",
        "detail": "email: Must be a valid email address."
      }
    }
  ]
}
```

**When to use:** Large imports where failing 1 of 1,000 items should not roll back
the other 999. Used by Salesforce, Zendesk, and AWS (SQS `SendMessageBatch`).

### Best practices

| Practice | Rationale |
|----------|-----------|
| Set a maximum batch size (e.g., 100 items) | Prevents unbounded memory/time consumption; return `413` if exceeded |
| Include the item index in every result | Clients must be able to correlate each result to its input |
| Use RFC 9457 for per-item errors | Consistent error format whether the error comes from a single endpoint or a batch |
| Validate all items before processing any (atomic) | Fail fast — don't create 50 records then fail on the 51st |
| Return `202 Accepted` for very large batches | Process asynchronously; provide a status polling endpoint (see Section 11) |
| Support idempotency keys per batch request | Prevents duplicate processing on retry (see Section 17) |

---

## 11. Asynchronous & Long-Running Operations

### When to go async

Use asynchronous processing when the operation exceeds a reasonable HTTP timeout
(typically 5–30 seconds): report generation, video transcoding, large data imports,
external system integrations, or any workflow involving human approval.

### The core pattern: 202 Accepted + status polling

**Step 1 — Submit the request:**

```
POST /reports
Content-Type: application/json

{ "type": "monthly_sales", "month": "2026-01" }

HTTP/1.1 202 Accepted
Location: /reports/jobs/rpt_abc123
Retry-After: 5
Content-Type: application/json

{
  "jobId": "rpt_abc123",
  "status": "pending",
  "statusUrl": "/reports/jobs/rpt_abc123"
}
```

**Step 2 — Poll for status:**

```
GET /reports/jobs/rpt_abc123

HTTP/1.1 200 OK
Retry-After: 5

{
  "jobId": "rpt_abc123",
  "status": "processing",
  "progress": 65,
  "createdAt": "2026-02-28T14:23:01Z"
}
```

**Step 3 — Completion (redirect to result):**

```
GET /reports/jobs/rpt_abc123

HTTP/1.1 303 See Other
Location: /reports/rpt_abc123
```

The client follows the redirect to `GET /reports/rpt_abc123` and receives the
completed resource.

### Status codes for async operations

| Code | When to use |
|------|-------------|
| `202 Accepted` | Initial submission — "your request has been accepted for processing" |
| `200 OK` | Status polling while job is in progress (body contains status details) |
| `303 See Other` | Job complete — redirect the client to the final resource |
| `200 OK` with final body | Alternative to 303 when the result is embedded in the status response |
| `410 Gone` | Job status has expired / been cleaned up |

### Webhooks as an alternative to polling

For server-to-server integrations, push-based notifications avoid polling overhead:

```
POST /reports
Content-Type: application/json

{
  "type": "monthly_sales",
  "month": "2026-01",
  "callbackUrl": "https://client.example.com/webhooks/reports"
}

HTTP/1.1 202 Accepted
```

When the job completes, the server sends:

```
POST https://client.example.com/webhooks/reports
Content-Type: application/json
X-Webhook-Signature: sha256=abc123...

{
  "event": "report.completed",
  "jobId": "rpt_abc123",
  "resourceUrl": "/reports/rpt_abc123"
}
```

### Polling vs. webhooks

| Aspect | Polling | Webhooks |
|--------|---------|----------|
| Implementation complexity | Lower — client just GETs a URL | Higher — client must expose an endpoint, verify signatures |
| Efficiency | Wastes requests while waiting | Push-based, no wasted calls |
| Reliability | Simple — client controls retry | Must handle delivery failures, retries, ordering |
| Best for | Browser clients, mobile apps | Server-to-server, event-driven architectures |

### Best practices

| Practice | Rationale |
|----------|-----------|
| Always return a `Location` header with the status URL | Clients need a reliable way to track the job |
| Include `Retry-After` header | Prevents aggressive polling; tells the client when to check back |
| Support cancellation (`DELETE /jobs/{id}`) | Lets clients abort long-running work |
| Set a TTL on job status records | Don't store job metadata forever — return `410 Gone` after expiry |
| Sign webhook payloads (HMAC-SHA256) | Clients must verify the callback is authentic |
| Webhook delivery: retry with exponential backoff | Handle transient failures on the client's endpoint |

---

