# Control Flow and Notes

## Table of Contents

- [Control Flow Blocks](#control-flow-blocks)
- [Notes](#notes)
- [Participant Grouping with box](#participant-grouping-with-box)
- [Advanced Lifecycle Features](#advanced-lifecycle-features)

## Control Flow Blocks

### Conditionals: alt / else

Model branching logic with `alt` and `else`:

```mermaid
sequenceDiagram
    Client->>+API: POST /login
    API->>+DB: Lookup user
    DB-->>-API: User record

    alt Valid credentials
        API-->>Client: 200 OK + JWT
    else Invalid credentials
        API-->>Client: 401 Unauthorized
    else Account locked
        API-->>-Client: 403 Forbidden
    end
```

### Optional: opt

Use `opt` for paths that may or may not execute (if-without-else):

```mermaid
sequenceDiagram
    Client->>API: GET /profile
    opt Cache hit
        API-->>Client: 200 OK (cached)
    end
    API->>DB: Query profile
    DB-->>API: Profile data
    API-->>Client: 200 OK
```

### Loops: loop

```mermaid
sequenceDiagram
    participant Poller as Health Check
    participant Svc as Service

    loop Every 30 seconds
        Poller->>Svc: GET /health
        Svc-->>Poller: 200 OK
    end
```

### Parallel Execution: par / and

Show concurrent actions:

```mermaid
sequenceDiagram
    participant API
    participant Cache
    participant DB
    participant Logger

    API->>+Cache: Check cache
    par Write audit log
        API-)Logger: Log request
    and Prefetch related data
        API->>DB: Query related records
    end
    Cache-->>-API: Cache result
```

Parallel blocks can be nested for complex concurrency patterns.

### Critical Sections: critical / option

Model operations that must complete atomically, with fallback handling:

```mermaid
sequenceDiagram
    participant API
    participant Payment
    participant DB

    critical Process payment
        API->>Payment: Charge card
        Payment-->>API: Confirmation
        API->>DB: Update order status
    option Payment declined
        API->>DB: Mark order failed
        API-->>Client: 402 Payment Required
    option Service unavailable
        API->>DB: Queue for retry
        API-->>Client: 503 Retry Later
    end
```

### Break

Exit early from a sequence:

```mermaid
sequenceDiagram
    Client->>API: Request
    API->>Auth: Validate token
    break Token expired
        Auth-->>API: 401
        API-->>Client: 401 Unauthorized
    end
    Auth-->>API: Valid
    API-->>Client: 200 OK
```

### Background Highlighting: rect

Use `rect` to visually group related messages without altering control flow:

```mermaid
sequenceDiagram
    rect rgb(200, 220, 255)
        Note over Client, API: Authentication Phase
        Client->>API: POST /auth
        API-->>Client: Token
    end
    rect rgb(220, 255, 220)
        Note over Client, API: Data Phase
        Client->>API: GET /data
        API-->>Client: Payload
    end
```

Supports `rgb()` and `rgba()` values.

## Notes

Notes provide context without adding message arrows.

### Positioning

```mermaid
sequenceDiagram
    participant A as Service A
    participant B as Service B

    Note left of A: Initiates request
    Note right of B: Processes async
    Note over A: Internal validation
    Note over A, B: Shared protocol: gRPC
```

### Line Breaks in Notes

Use `<br/>` for multi-line notes:

```
Note over API: Validates JWT<br/>Checks permissions<br/>Rate-limits request
```

### When to Use Notes

- Explain **why** something happens, not just what.
- Annotate protocol details, SLA requirements, or assumptions.
- Section large diagrams into logical phases (combine with `rect`).

## Sequence Numbers

Enable automatic numbering to make diagrams easier to reference in discussions:

```mermaid
sequenceDiagram
    autonumber
    Client->>API: POST /order
    API->>Inventory: Reserve stock
    Inventory-->>API: Confirmed
    API->>Payment: Charge card
    Payment-->>API: Success
    API-->>Client: 201 Created
```

Use `autonumber` when a diagram has 5+ messages. It makes it easy to say "look at step 4" in code reviews or incident discussions.

## Grouping with Boxes

Group related participants into named, optionally colored boxes:

```mermaid
sequenceDiagram
    box rgb(200, 220, 255) Frontend
        actor U as User
        participant UI as Web App
    end
    box rgb(255, 220, 200) Backend
        participant API as API Server
        participant Auth as Auth Service
    end
    box rgb(220, 255, 220) Data Layer
        participant DB as PostgreSQL
        participant Cache as Redis
    end

    U->>UI: Login
    UI->>API: POST /auth
    API->>Auth: Validate
    Auth->>DB: Query
    DB-->>Auth: User record
    Auth-->>API: Token
    API->>Cache: Store session
    API-->>UI: 200 OK
    UI-->>U: Dashboard
```

- Always provide a descriptive label for each box.
- Use colors sparingly and ensure legibility in both light and dark modes.
- Consider colorblind accessibility (avoid relying solely on red/green distinctions).

## Creating and Destroying Participants

Model participants that come into existence or are removed during a flow (v10.3.0+):

```mermaid
sequenceDiagram
    participant Client
    participant API

    Client->>API: POST /sessions
    create participant Session
    API->>Session: Initialize
    Session-->>API: Ready
    API-->>Client: Session ID

    Client->>API: DELETE /sessions/123
    API->>Session: Terminate
    destroy Session
    Session-->>API: Destroyed
    API-->>Client: 204 No Content
```

Rules:
- Only the **recipient** of a message can be created.
- Either sender or recipient can be destroyed.
