## 8. Legacy Code Patterns

These patterns enable incremental adoption of Nullables in existing codebases without requiring a rewrite.

### 8.1 Descend the Ladder

**Intent**: Convert existing code from the outside in — starting with the highest-level tests.

**Problem**: You have an existing codebase with mock-based tests. You want to adopt Nullables but can't rewrite everything at once.

**Solution**: Start with the outermost layer (application/UI tests):

1. Identify the test with the most mocks.
2. Extract an interface from the code under test.
3. Implement the real version delegating to the original code.
4. Implement the Nullable version using `createNull()`.
5. Replace the mocks with the Nullable.
6. Run tests. They should still pass.
7. Move to the next layer down and repeat.

This approach lets you see the benefits immediately (at the test level where mock complexity is highest) while gradually building Nullable infrastructure downward.

### 8.2 Climb the Ladder

**Intent**: Build Nullable infrastructure from the bottom up.

**Problem**: Sometimes it's easier (or necessary) to start with low-level infrastructure and work upward.

**Solution**: Start at the lowest level — the third-party boundary:

1. Create an Infrastructure Wrapper for one external system.
2. Add an Embedded Stub to make it Nullable.
3. Write Narrow Integration Tests for the real version.
4. Build or refactor the high-level wrapper to use the new Nullable via Fake It Once You Make It.
5. Update application-level tests to use the Nullable chain.
6. Remove the corresponding mocks.

### 8.3 Replace Mocks with Nullables

**Intent**: Migrate from mock libraries one mock at a time.

**Problem**: Your test suite uses a mock library extensively. You want to migrate but can't justify a big-bang rewrite.

**Solution**: Nullables coexist with mocks. In any test:

1. Pick one mock to replace.
2. Make the corresponding dependency Nullable.
3. Replace the mock with the Nullable.
4. Keep all other mocks unchanged.
5. Run the tests. They should pass.
6. Repeat for the next mock.

```typescript
// Before: multiple mocks
it("processes order", () => {
  const dbMock = mock(OrderDatabase);
  const emailMock = mock(EmailService);
  const logMock = mock(Logger);
  // ... setup all mocks
});

// After: one mock replaced with Nullable, others unchanged
it("processes order", () => {
  const db = OrderDatabase.createNull({ orders: [testOrder] });
  const emailMock = mock(EmailService);  // Still a mock — migrate later
  const logMock = mock(Logger);          // Still a mock — migrate later
  // ...
});
```

This is one of the most powerful properties of the pattern language: **total compatibility with existing code**. No architectural rewrite needed.

### 8.4 Throwaway Stub

**Intent**: Get tests passing quickly with a temporary stub.

**Problem**: While converting code to use Nullables, you sometimes need a quick-and-dirty stub to keep tests green while you work on the proper Nullable implementation.

**Solution**: Create a simple inline stub — a plain object or class that satisfies the type but doesn't follow the full Nullable patterns. Mark it clearly as temporary.

```typescript
// TEMPORARY — replace with proper Nullable
const throwawayDb = {
  fetchOrders: async () => [testOrder],
  save: async () => {},
} as unknown as OrderDatabase;
```

**Important**: Replace throwaway stubs with proper Nullables before committing. They're a scaffolding tool, not a destination. If you find throwaway stubs accumulating, it's a sign you need to prioritize building the Nullable infrastructure.

---


---

## 11. Getting Started: Incremental Adoption

### Step 1: Identify a Candidate

Choose a class with heavy mock usage in its tests — ideally one that wraps a single external system (HTTP client, database, file system).

### Step 2: Create the Infrastructure Wrapper

If the class doesn't already wrap a single external system cleanly, refactor it into an Infrastructure Wrapper:

```typescript
class EmailService {
  private transport: nodemailer.Transporter;

  private constructor(transport: nodemailer.Transporter) {
    this.transport = transport;
  }

  static create(config: SmtpConfig): EmailService {
    return new EmailService(nodemailer.createTransport(config));
  }

  async send(email: Email): Promise<void> {
    await this.transport.sendMail({
      from: email.from,
      to: email.to,
      subject: email.subject,
      html: email.body,
    });
  }
}
```

### Step 3: Add an Embedded Stub

Create a minimal stub for the third-party dependency:

```typescript
class NullTransport {
  async sendMail(_options: unknown): Promise<void> {
    // Do nothing — suppress the side effect
  }
}
```

### Step 4: Add `createNull()` with Configurable Responses

```typescript
class EmailService {
  // ... existing code ...

  static createNull(): EmailService {
    return new EmailService(new NullTransport() as any);
  }
}
```

### Step 5: Add Output Tracking

```typescript
class EmailService {
  private emitter = new EventEmitter();

  async send(email: Email): Promise<void> {
    await this.transport.sendMail({ /* ... */ });
    this.emitter.emit("send", email);
  }

  trackSentEmails(): OutputTracker<Email> {
    const tracker = new OutputTracker<Email>();
    this.emitter.on("send", (email) => tracker.add(email));
    return tracker;
  }
}
```

### Step 6: Replace Mocks in Tests

```typescript
// Before
it("sends confirmation email", async () => {
  const emailMock = mock(EmailService);
  const app = new App(emailMock);
  await app.processOrder(order);
  expect(emailMock.send).toHaveBeenCalledWith(
    expect.objectContaining({ to: "user@example.com" })
  );
});

// After
it("sends confirmation email", async () => {
  const emailService = EmailService.createNull();
  const sentEmails = emailService.trackSentEmails();
  const app = new App(emailService);

  await app.processOrder(order);

  assert.equal(sentEmails.data.length, 1);
  assert.equal(sentEmails.data[0].to, "user@example.com");
});
```

### Step 7: Write a Narrow Integration Test

```typescript
describe("EmailService (integration)", () => {
  it("sends email via SMTP", async () => {
    // Uses a local SMTP server like MailHog
    const service = EmailService.create(TEST_SMTP_CONFIG);
    await service.send(Email.createTestInstance());

    const received = await mailhog.getLastEmail();
    assert.equal(received.to, "test@example.com");
  });
});
```

### Step 8: Repeat

Move to the next most-mocked dependency. Over time, the mock count decreases and the Nullable count increases. At no point is the test suite broken.

---

