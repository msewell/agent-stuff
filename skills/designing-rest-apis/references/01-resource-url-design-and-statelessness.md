## 1. Resource & URL Design

### Use nouns, not verbs

URLs identify *resources*. Use HTTP methods to express the action.

```
# Bad
POST /createUser
GET  /getUserById?id=42

# Good
POST /users
GET  /users/42
```

**Why:** Verb-based URLs couple the endpoint to a single action and make it impossible
to leverage the uniform interface that HTTP methods already provide. Noun-based URLs
also enable better HTTP caching — caches key on the URI, and a stable URI scheme means
higher cache hit rates (benchmarks show ~15% faster responses due to caching alone).

### Use plural nouns for collections

```
GET /users          # collection
GET /users/42       # single resource
```

**Why:** Consistency. A singular `/user/42` implies the collection is at `/user`, which
reads awkwardly and creates ambiguity about whether `/user` returns one or many.

### Express relationships with sub-resources (max 2–3 levels deep)

```
GET /users/42/orders          # orders belonging to user 42
GET /users/42/orders/7        # order 7 of user 42
```

Avoid deep nesting:

```
# Bad — too deeply nested, hard to discover and cache
GET /users/42/orders/7/items/3/reviews

# Better — promote the resource
GET /order-items/3/reviews
```

**Why:** Deep nesting creates long, brittle URLs and implies tight coupling. Beyond
two levels, promote the sub-resource to a top-level resource and use query parameters
or links to express the relationship.

### URL conventions

| Rule | Example |
|---|---|
| Lowercase only | `/order-items` not `/OrderItems` |
| Hyphens to separate words | `/order-items` not `/order_items` |
| No trailing slashes | `/users` not `/users/` |
| No file extensions | `/users/42` not `/users/42.json` |
| No CRUD function names | `DELETE /users/42` not `POST /users/42/delete` |

---

## 2. Statelessness

### The constraint

Every request from client to server must contain **all information** necessary to
understand and process that request. The server does not store any session context
between requests. Each request is treated as if it were the first.

This is not optional REST style — it is one of the six architectural constraints
defined by Fielding. Violating it forfeits the scalability, reliability, and
cacheability guarantees that REST provides.

### Why it matters

| Benefit | Mechanism |
|---------|-----------|
| **Horizontal scalability** | Any server instance can handle any request — no sticky sessions, no state synchronization. Add servers behind a load balancer with zero coordination overhead. |
| **Fault tolerance** | If a server crashes, clients simply retry against another instance. No session data is lost because none was stored. |
| **Cacheability** | A cache can decide whether to store a response by examining that single request in isolation — no ambiguity from hidden session context. |
| **Simplified server design** | No session storage, no session expiry, no session replication between nodes. |
| **Cloud-native compatibility** | Stateless workloads are trivial to containerize (Docker), orchestrate (Kubernetes), and autoscale. Serverless platforms (Lambda, Cloud Functions) *require* statelessness. |

### Application state vs. resource state

This distinction is the most common source of confusion. "Stateless" does **not** mean
the server stores nothing at all.

| | **Application state** | **Resource state** |
|---|---|---|
| **What** | Session context, interaction history, "where the user is" in a workflow | Persistent data about domain objects |
| **Where it lives** | Must live on the **client** | Lives on the **server** (database, file store) |
| **Lifespan** | Duration of a session or interaction | Beyond any single session |
| **Examples** | Current page number, auth token, shopping cart step, selected filters | A user profile, an uploaded image, an order record |
| **REST says** | Server must **not** store this | Server **does** store this — it's the entire point of the API |

The server absolutely stores and manages *resource state* — that's what your database
is for. What it must not do is store *application state* (session context that ties a
particular client to a particular server instance).

### Practical implementation

**Pass all context in the request itself:**

```
# Auth context → Authorization header
GET /orders/42
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

# Pagination context → query parameters
GET /orders?limit=20&cursor=eyJpZCI6MTAwfQ==

# Locale/preference context → headers
GET /products/42
Accept-Language: fr-FR
```

**Use self-contained tokens instead of server sessions:**

```
# Anti-pattern: server-side session
POST /login  →  Set-Cookie: SESSIONID=abc123
# Server stores { abc123: { user_id: 42, role: "admin" } } in memory
# Client sends cookie; server looks up session — this is stateful

# Correct: self-contained JWT
POST /auth/token  →  { "access_token": "eyJhbG..." }
# Token carries claims (user_id, role, exp) inside it
# Server validates the signature — no session lookup needed
```

**Handle multi-step workflows at the resource level:**

```
# Don't: track "step 2 of checkout" in server memory

# Do: model the workflow as resource state
POST /orders          →  201 { "id": 7, "status": "draft" }
PUT  /orders/7/items  →  200 { "status": "items_added" }
POST /orders/7/payment →  201 { "status": "paid" }
# Each request is self-contained; the workflow state is the resource state
```

### Anti-patterns

| Anti-pattern | Why it breaks statelessness | What to do instead |
|---|---|---|
| **Server-side session objects** | Ties clients to specific server instances; breaks horizontal scaling; session loss on crash | Use JWTs or OAuth 2.0 tokens that carry claims within the token itself |
| **Sticky sessions / session affinity** | Load balancer must route a client to the same server; prevents elastic scaling and complicates failover | Eliminate server-side sessions so any instance can serve any request |
| **Storing user objects in memory after login** | In-memory state is lost on restart or scale-out; forces session replication across nodes | Validate the token on each request; load user data from the database or a shared cache |
| **Cookies as session keys** | A cookie containing a key to server-side state (e.g., `SESSIONID=abc123`) is functionally a session — the server must look it up | Cookies containing a *self-contained* token (validated without server state) are acceptable; cookies referencing server-side storage are not |
| **Passing server-generated hidden state back through clients** | Sometimes servers embed opaque state blobs in responses for clients to echo back — this is a disguised session and is vulnerable to replay/tampering attacks | Model the state as a proper server-side resource with an ID, or use signed/encrypted tokens if the state must travel with the client |

### When statelessness is hard

Some domains have inherently stateful interactions (e.g., WebSocket connections,
long-running uploads, collaborative editing). In these cases:

1. **Externalize state** — store it in a shared, durable store (Redis, a database)
   rather than in-process memory. The server remains stateless; the *store* holds
   the state.
2. **Separate stateful components** — isolate the stateful parts (e.g., a WebSocket
   gateway) into dedicated services while keeping the REST API itself stateless.
3. **Use temporary resources** — model the workflow as a server-side resource with
   an explicit lifecycle (`POST /uploads` → poll `GET /uploads/abc` → final state).

### The bottom line

> *Statelessness is not a suggestion — it is the architectural property that makes
> REST APIs horizontally scalable, fault-tolerant, and cacheable. Every departure
> from it must be a conscious, justified decision with compensating mechanisms.*

---

