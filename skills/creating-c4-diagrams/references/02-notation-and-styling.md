# C4 Notation and Styling Guidelines

C4 is notation-independent — there are no mandatory shapes, colors, or visual conventions. However, these guidelines ensure your diagrams are clear and unambiguous.

## Every Diagram Must Have

| Element | Details |
|---------|---------|
| **Title** | Describes diagram type and scope: *"Container Diagram for Online Bookstore"* |
| **Key/Legend** | Explains all shapes, colors, line styles, border styles, and icons used |
| **Explained acronyms** | Every abbreviation defined either inline or in the legend |

## Every Element Must Have

| Element | Details |
|---------|---------|
| **Name** | Clear, descriptive name |
| **Type label** | Explicitly shown: `[Person]`, `[Software System]`, `[Container]`, `[Component]` |
| **Technology** | For containers and components: `[Container: Spring Boot]`, `[Component: React Hook]` |
| **Short description** | One sentence explaining the element's responsibility |

## Every Relationship (Arrow) Must Have

| Element | Details |
|---------|---------|
| **Direction** | Always **unidirectional**. Never use bidirectional arrows. |
| **Label** | An action verb describing the relationship: *"Sends orders to"*, *"Reads from"*, *"Authenticates via"* |
| **Technology** | For inter-process communication: *"HTTPS/JSON"*, *"gRPC"*, *"AMQP"*, *"SQL/TCP"* |

## Visual Constraints

- **Maximum ~20 elements per diagram.** Beyond this, split into multiple focused diagrams.
- **Do not rely on color alone** to convey meaning. Always use text. Colors should supplement, not replace, textual descriptions. Consider accessibility (color blindness, black-and-white printing).
- **Do not remove type metadata** from elements. Stripping `[Container]` or `[Software System]` labels introduces ambiguity.
- **Be specific in relationship labels.** Avoid generic labels like "Uses" or "Calls." Prefer *"Sends order confirmation email via"* or *"Queries customer records from."*

## Relationship Labels: A Pattern Library

Generic labels like "Uses" or "Calls" waste diagram space without conveying information. Use specific action verbs that describe *what* is happening and *why*.

### Synchronous API Calls (REST, gRPC, GraphQL)

| Bad Label | Good Label | Technology Annotation |
|-----------|-----------|----------------------|
| Uses | Submits purchase orders to | HTTPS/JSON |
| Calls | Queries product availability from | gRPC |
| Connects to | Fetches customer profile from | GraphQL |
| Sends data to | Uploads document attachments to | HTTPS multipart |
| Talks to | Requests fraud risk score from | HTTPS/JSON |

### Asynchronous Messaging (Queues, Topics, Events)

| Bad Label | Good Label | Technology Annotation |
|-----------|-----------|----------------------|
| Sends events to | Publishes OrderCreated events to | orders.created topic |
| Reads from | Consumes PaymentProcessed events from | payments.processed queue |
| Uses | Emits InventoryReserved events to | AMQP / inventory.reserved |
| Connects to | Subscribes to PriceChanged notifications from | SNS / price-updates topic |
| Sends messages to | Enqueues shipping label generation requests to | SQS / shipping-jobs queue |

### Database and Data Store Access

| Bad Label | Good Label | Technology Annotation |
|-----------|-----------|----------------------|
| Uses | Reads customer records from | SQL/TCP |
| Stores data in | Persists order history to | SQL/TCP |
| Accesses | Caches product catalog responses in | Redis protocol |
| Connects to | Indexes book metadata into | HTTPS/JSON (Elasticsearch) |
| Reads/writes | Stores uploaded cover images in | S3 API / HTTPS |

### Authentication and Authorization

| Bad Label | Good Label | Technology Annotation |
|-----------|-----------|----------------------|
| Authenticates with | Validates JWT tokens via | HTTPS/JSON |
| Uses | Requests OAuth2 access tokens from | HTTPS / OAuth2 |
| Calls | Checks user permissions against | LDAP/TCP |
| Connects to | Verifies API keys with | HTTPS/JSON |
| Talks to | Federates identity via SAML assertions to | HTTPS/SAML |

### External Service Integrations

| Bad Label | Good Label | Technology Annotation |
|-----------|-----------|----------------------|
| Uses | Processes credit card payments via | HTTPS/JSON |
| Sends to | Delivers transactional emails via | SMTP / HTTPS API |
| Calls | Geocodes shipping addresses via | HTTPS/JSON |
| Integrates with | Syncs inventory levels to | HTTPS/JSON (webhook) |
| Connects to | Reports application errors to | HTTPS/JSON |

### File and Batch Operations

| Bad Label | Good Label | Technology Annotation |
|-----------|-----------|----------------------|
| Uses | Exports daily sales reports to | SFTP / CSV |
| Reads from | Imports product catalog updates from | S3 / CSV |
| Sends data to | Streams clickstream events to | Kinesis / JSON |
| Writes to | Appends audit log entries to | Filesystem / JSON |

### Composition Pattern

Effective relationship labels follow the pattern:

**`[Action verb] + [what] + [preposition]`**

Examples:
- *"Sends order confirmation emails via"* → `[Sends] + [order confirmation emails] + [via]`
- *"Reads customer profile from"* → `[Reads] + [customer profile] + [from]`
- *"Publishes InventoryReserved events to"* → `[Publishes] + [InventoryReserved events] + [to]`

**Strong action verbs**: Sends, Reads, Writes, Persists, Queries, Fetches, Submits, Publishes, Consumes, Subscribes, Validates, Caches, Indexes, Exports, Imports, Syncs, Delivers, Enqueues, Streams, Forwards, Delegates, Authenticates, Authorizes.

**Weak verbs to avoid**: Uses, Calls, Connects, Talks, Accesses, Interacts, Communicates.
