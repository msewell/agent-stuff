# Real-World Examples

## REST API: Authentication with JWT

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant UI as Web App
    participant API as Auth API
    participant DB as User Store
    participant Cache as Token Cache

    U->>UI: Enter credentials
    UI->>+API: POST /auth/login
    API->>+DB: SELECT user WHERE email = ?
    DB-->>-API: User record (hashed password)

    alt Password matches
        API->>API: Generate JWT + refresh token
        API->>Cache: Store refresh token (TTL: 7d)
        API-->>-UI: 200 OK {access_token, refresh_token}
        UI-->>U: Redirect to dashboard
    else Password mismatch
        API-->>UI: 401 Unauthorized
        UI-->>U: Show error message
    else Account locked
        API-->>UI: 403 Forbidden
        UI-->>U: Show lockout message
    end
```

## OAuth 2.0 Authorization Code Flow

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant App as Client App
    participant AuthZ as Authorization Server
    participant RS as Resource Server

    U->>App: Click "Login with Provider"
    App->>AuthZ: GET /authorize?response_type=code&client_id=...
    AuthZ-->>U: Show consent screen
    U->>AuthZ: Grant consent
    AuthZ-->>App: 302 Redirect with authorization code

    App->>+AuthZ: POST /token (code + client_secret)
    AuthZ-->>-App: {access_token, refresh_token}

    App->>+RS: GET /api/resource (Bearer token)
    RS-->>-App: 200 OK + resource data
    App-->>U: Display data
```

## Webhook Callback Pattern

```mermaid
sequenceDiagram
    autonumber
    participant API as Order API
    participant PG as Payment Gateway
    participant DB as Database
    participant WH as Webhook Handler

    API->>+PG: POST /charges {amount, callback_url}
    PG-->>-API: 202 Accepted {charge_id}
    API->>DB: Save order (status: pending)
    API-->>Client: 202 Accepted {order_id}

    Note over PG: Payment processes async<br/>(may take seconds to minutes)

    PG-)WH: POST /webhooks/payment {charge_id, status}
    activate WH
    WH->>WH: Verify webhook signature
    alt Payment succeeded
        WH->>DB: Update order (status: paid)
        WH-)API: Trigger fulfillment
    else Payment failed
        WH->>DB: Update order (status: failed)
        WH-)API: Notify customer
    end
    WH-->>PG: 200 OK
    deactivate WH
```

## Saga Pattern: Distributed Transaction

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Saga Orchestrator
    participant OMS as Order Service
    participant Inv as Inventory Service
    participant Pay as Payment Service
    participant Ship as Shipping Service

    Orch->>+OMS: Create order
    OMS-->>-Orch: Order created

    Orch->>+Inv: Reserve stock
    Inv-->>-Orch: Stock reserved

    Orch->>+Pay: Process payment
    Pay-->>-Orch: Payment confirmed

    Orch->>+Ship: Schedule shipment
    Ship-->>-Orch: Shipment scheduled

    Orch->>OMS: Confirm order

    Note over Orch: If any step fails,<br/>compensating transactions run

    break Payment failed
        Orch->>Inv: Release reserved stock
        Orch->>OMS: Cancel order
    end
```

## Event-Driven Microservices with Message Queue

```mermaid
sequenceDiagram
    autonumber
    participant API as API Gateway
    participant OS as Order Service
    participant Q as Message Broker
    participant IS as Inventory Service
    participant NS as Notification Service
    participant ES as Email Service

    API->>+OS: POST /orders
    OS->>OS: Validate and persist order
    OS-)Q: Publish OrderCreated event
    OS-->>-API: 201 Created

    par Process inventory
        Q-)IS: OrderCreated
        activate IS
        IS->>IS: Reserve stock
        IS-)Q: StockReserved event
        deactivate IS
    and Send notifications
        Q-)NS: OrderCreated
        activate NS
        NS->>+ES: Send confirmation email
        ES-->>-NS: Sent
        deactivate NS
    end
```

## Retry with Exponential Backoff

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant API as Unreliable API

    C->>+API: Request
    API--x-C: 503 Service Unavailable
    deactivate API

    Note over C: Wait 1s (attempt 1/3)

    C->>+API: Request (retry)
    API--x-C: 503 Service Unavailable
    deactivate API

    Note over C: Wait 2s (attempt 2/3)

    C->>+API: Request (retry)
    API-->>-C: 200 OK

    Note over C, API: Exponential backoff: 1s, 2s, 4s...
```

## Circuit Breaker Pattern

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant CB as Circuit Breaker
    participant Svc as External Service
    participant FB as Fallback

    rect rgb(220, 255, 220)
        Note over CB: State: CLOSED (healthy)
        C->>CB: Request
        CB->>+Svc: Forward request
        Svc-->>-CB: 200 OK
        CB-->>C: 200 OK
    end

    rect rgb(255, 220, 220)
        Note over CB: State: OPEN (failures exceeded threshold)
        C->>CB: Request
        CB->>+FB: Use fallback
        FB-->>-CB: Cached/default response
        CB-->>C: 200 OK (degraded)
    end

    rect rgb(255, 255, 200)
        Note over CB: State: HALF-OPEN (testing recovery)
        C->>CB: Request
        CB->>+Svc: Probe request
        Svc-->>-CB: 200 OK
        Note over CB: Reset to CLOSED
        CB-->>C: 200 OK
    end
```
