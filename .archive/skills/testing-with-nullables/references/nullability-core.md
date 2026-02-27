## 7. Nullability Patterns

These are the core patterns that define the Nullables technique. This is the heart of the pattern language.

### 7.1 Nullables

**Intent**: Create production code with an infrastructure "off switch."

**Problem**: Code that talks to external systems is hard to test. The traditional solutions — mocks, stubs, fakes — replace your production code with test doubles that may not behave identically. Bugs at the boundary between your code and the double go undetected.

**Solution**: Make infrastructure classes "Nullable" by providing a `createNull()` factory method that returns an instance configured to suppress external communication while running all other code identically.

```typescript
class CommandLine {
  private stdout: WritableStream;
  private args: string[];

  private constructor(stdout: WritableStream, args: string[]) {
    this.stdout = stdout;
    this.args = args;
  }

  // Production factory
  static create(): CommandLine {
    return new CommandLine(process.stdout, process.argv.slice(2));
  }

  // Nullable factory — same class, different plumbing
  static createNull(options?: { args?: string[] }): CommandLine {
    const nullStdout = new NullWritableStream(); // Writes go nowhere
    return new CommandLine(nullStdout, options?.args ?? []);
  }

  write(text: string): void {
    // Same code runs in both production and test
    this.stdout.write(text);
  }

  args(): string[] {
    return this.args;
  }
}
```

**Key properties**:
- `create()` and `createNull()` return the *same class* — not a subclass, not a fake.
- The only difference is the lowest-level I/O plumbing (the embedded stub).
- Tests exercise the exact code path that production uses.
- Nullables can be used in production too (dry-run modes, cache warming, etc.).

Some people call Nullables **"production doubles"** — in contrast to mocks, stubs, and fakes, which are *test doubles*.

### 7.2 Embedded Stub

**Intent**: Stub third-party code (not your code) inside production classes.

**Problem**: To make a class Nullable, you need to suppress external I/O at the lowest level. But you don't want to create a separate test-only class or introduce a mock framework.

**Solution**: Embed a minimal stub of the third-party library inside the production class (or in an adjacent file). The stub implements only the methods your code actually calls, with the simplest possible behavior.

```typescript
// production_http_client.ts

import * as http from "node:http";

// Embedded stub — replaces Node's http module
class NullHttp {
  request(
    _url: string,
    _options: http.RequestOptions,
    callback: (res: IncomingMessage) => void
  ): ClientRequest {
    // Return a minimal simulated response
    const res = new NullIncomingMessage(200, "");
    setTimeout(() => callback(res), 0);
    return new NullClientRequest();
  }
}

class HttpClient {
  private http: typeof http | NullHttp;

  private constructor(httpModule: typeof http | NullHttp) {
    this.http = httpModule;
  }

  static create(): HttpClient {
    return new HttpClient(http); // Real Node http
  }

  static createNull(options?: { responses?: HttpResponse[] }): HttpClient {
    return new HttpClient(new NullHttp(options?.responses));
  }

  async get(url: string): Promise<string> {
    // This code is identical in production and test
    return new Promise((resolve) => {
      this.http.request(url, {}, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      });
    });
  }
}
```

**Guidelines**:
- Stub the *third-party code*, not your code. Your code runs for real.
- Implement the bare minimum needed. Don't simulate the full library API.
- Keep the stub in the same file as the production class for easy maintenance.
- Validate the stub's behavior with [Narrow Integration Tests](#62-narrow-integration-tests) that document the real library's behavior.
- Drive the stub's implementation through the public interface using TDD — don't write the stub in isolation.

### 7.3 Thin Wrapper

**Intent**: Provide a seam for languages that require interface-based polymorphism.

**Problem**: In languages like Java or C#, you can't easily swap a concrete third-party class for a stub without an interface. Creating an interface for the entire third-party API is wasteful and fragile.

**Solution**: Define a custom interface covering only the methods your code uses. Provide two implementations: one that delegates to the real library and one that is the embedded stub.

```typescript
// Only needed when Embedded Stub can't directly replace the dependency
// (e.g., the dependency is a class you can't instantiate differently)

interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
}

class RealFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    return fs.promises.readFile(path, "utf-8");
  }
  async writeFile(path: string, content: string): Promise<void> {
    await fs.promises.writeFile(path, content, "utf-8");
  }
}

class NullFileSystem implements FileSystem {
  private files: Map<string, string>;

  constructor(files?: Record<string, string>) {
    this.files = new Map(Object.entries(files ?? {}));
  }

  async readFile(path: string): Promise<string> {
    return this.files.get(path) ?? "";
  }
  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }
}
```

In TypeScript and other dynamically-typed or structurally-typed languages, Embedded Stub is usually sufficient and Thin Wrapper is not needed.

### 7.4 Configurable Responses

**Intent**: Allow tests to control what Nulled dependencies return.

**Problem**: Tests need to verify behavior under different conditions — what happens when the database returns no results, when the API returns an error, when the user provides specific input.

**Solution**: The `createNull()` factory accepts optional parameters that configure responses. **Design these parameters from the perspective of the dependency's externally-visible behavior, not its implementation.**

```typescript
class UserService {
  static createNull(options?: {
    user?: User | null;         // What fetchUser returns
    verificationStatus?: boolean; // Whether user is verified
  }): UserService {
    return new UserService(
      UserDatabase.createNull({
        users: options?.user ? [options.user] : [],
      }),
      VerificationApi.createNull({
        status: options?.verificationStatus ?? true,
      })
    );
  }
}

// In tests — configure from the perspective of behavior, not HTTP
it("rejects unverified users", async () => {
  const service = UserService.createNull({
    user: User.createTestInstance(),
    verificationStatus: false,
  });

  const result = await service.processOrder(orderId);

  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "User not verified");
});
```

**Guidelines**:
- Use behavior-level names (`verificationStatus`) not implementation-level names (`httpResponseBody`).
- Support single values (repeat the same response) and arrays (return sequential values).
- Decompose configurable responses to the format expected by the next-level dependency.
- If a dependency has multiple configurable aspects, give each its own named parameter.

