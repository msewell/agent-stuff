## 1. Introduction

### The Problem

Most test suites suffer from one of two failure modes:

1. **Broad integration tests** are automated versions of manual tests. They're slow, flaky, and expensive to maintain. A single broken service can cascade into hundreds of failures.
2. **Mock-heavy unit tests** are fast and isolated but tightly coupled to implementation details. They break on every refactoring, even when behavior is preserved. They give false confidence by verifying *how* code calls dependencies rather than *whether the system actually works*.

Both approaches create test suites that developers distrust, skip, or fight against rather than lean on.

### The Alternative

James Shore's "Testing Without Mocks" pattern language proposes a third path: **narrow, sociable, state-based tests** combined with a novel infrastructure technique called **Nullables**. The approach delivers the speed and reliability of unit tests with the integration confidence of end-to-end tests — without mocks, without broad tests, and without requiring an architectural rewrite.

Nullables are production code with an infrastructure "off switch." They run your real code in every way except that they don't actually talk to stdout, make HTTP calls, or touch the file system. The tests exercise the same code paths that production uses, catching real integration bugs that mocks hide.

### What This Guide Covers

This guide is a comprehensive reference to all named patterns in the pattern language, organized into eight categories:

| Category | Patterns | Purpose |
|---|---|---|
| Foundational | 7 patterns | Test structure and design principles |
| Architectural | 4 patterns | Application structure enabling testability |
| Logic | 3 patterns | Testing pure business logic |
| Infrastructure | 3 patterns | Testing external system interactions |
| Nullability | 7 patterns | The core Nullable technique |
| Legacy Code | 4 patterns | Migrating existing codebases |

Each pattern includes its intent, the problem it solves, how it works, and a TypeScript example where applicable.

---

## 2. Core Philosophy

The pattern language rests on three philosophical pillars:

### Sociable Over Solitary

Tests exercise real dependencies rather than replacing them with mocks. When you test `App.run()`, it calls the real `Rot13.transform()` and the real `CommandLine.write()`. Each dependency has its own narrow tests, creating overlapping chains of coverage that catch boundary bugs.

### State-Based Over Interaction-Based

Tests assert on **outputs and state changes**, not on whether specific methods were called with specific arguments. This means:

- Refactoring internals doesn't break tests (as long as behavior is preserved).
- Tests read as specifications of *what* the code does, not *how* it does it.
- No `.toHaveBeenCalledWith()`, no call-order verification, no spy setup.

### Production Code, Not Test Doubles

Nullables are not mocks, stubs, or fakes in the traditional sense. They are the actual production classes configured to suppress side effects. The `CommandLine` class has both `create()` (real) and `createNull()` (nulled) factories, but both execute the same code paths — the difference is only at the lowest level, where third-party I/O calls are stubbed.

This means your tests run the code that ships to production. When a dependency's behavior changes, the tests catch it immediately.

---

## 3. Foundational Patterns

These patterns define the testing style used throughout the pattern language. They apply regardless of whether you adopt Nullables.

### 3.1 Narrow Tests

**Intent**: Focus each test on a specific class, function, or concept.

**Problem**: Broad tests that exercise the entire system are slow, flaky, and produce confusing failure messages. When a broad test fails, it's unclear which component broke.

**Solution**: Write tests that target a specific unit of behavior. Each test file corresponds to one module or class. The test scope is narrow but the test itself may execute real dependencies (see [Overlapping Sociable Tests](#34-overlapping-sociable-tests)).

**Guidelines**:
- One test file per module/class.
- Test names describe behavior, not implementation.
- Each test has a single reason to fail.
- Broad end-to-end tests are optional safety nets, not the primary test suite.

```typescript
// _rot13_test.ts — narrow test for the Rot13 logic module
import { assert, describe, it } from "./testing.js";
import { transform } from "./rot13.js";

describe("ROT-13", () => {
  it("transforms lowercase letters", () => {
    assert.equal(transform("hello"), "uryyb");
  });

  it("transforms uppercase letters", () => {
    assert.equal(transform("HELLO"), "URYYB");
  });

  it("leaves non-alphabetic characters unchanged", () => {
    assert.equal(transform("Hello, World!"), "Uryyb, Jbeyq!");
  });
});
```

### 3.2 State-Based Tests

**Intent**: Verify behavior by checking outputs and state, not method calls.

**Problem**: Interaction-based tests (those using mocks and spies) are coupled to implementation details. Renaming a helper method, reordering calls, or extracting a function all break tests — even when the observable behavior is identical.

**Solution**: Assert on return values, object state, or tracked output. Never assert on whether a method was called, what arguments it received, or what order calls happened in.

```typescript
// State-based: checks what happened
it("transforms input and writes output", () => {
  const { output } = run({ args: ["my input"] });
  assert.deepEqual(output.data, ["zl vachg\n"]);
});

// Interaction-based (AVOID): checks how it happened
it("calls rot13 and then writes", () => {
  const rot13Mock = mock(Rot13);
  const cmdMock = mock(CommandLine);
  app.run();
  expect(rot13Mock.transform).toHaveBeenCalledWith("my input");
  expect(cmdMock.write).toHaveBeenCalledWith("zl vachg\n");
});
```

The first test survives refactoring. The second breaks if you rename `transform`, extract it into a helper, or reorder the calls — none of which affect actual behavior.

### 3.3 Overlapping Sociable Tests

**Intent**: Create chains of overlapping test coverage that catch integration bugs without broad tests.

**Problem**: Solitary tests (with mocked dependencies) verify each component in isolation. Bugs at component boundaries — mismatched interfaces, incorrect assumptions about behavior — slip through because mocks don't enforce real contracts.

**Solution**: Tests exercise real dependencies rather than replacing them. `App` tests run the real `Rot13` and `CommandLine`. `Rot13` has its own narrow tests. Together, these overlapping scopes form a chain:

```
App tests ←→ Rot13 tests ←→ (Rot13 internals)
App tests ←→ CommandLine tests ←→ (I/O behavior)
```

If `Rot13.transform()` changes its return type, both `Rot13` tests *and* `App` tests fail — catching the bug at both levels without a single end-to-end test.

**Key rule**: Each dependency is thoroughly tested in its own narrow tests. The sociable test doesn't re-test the dependency's internals; it just exercises the integration path.

### 3.4 Smoke Tests

**Intent**: Provide a minimal safety net for startup and core workflows.

**Problem**: Even with excellent narrow tests, it's possible to misconfigure wiring — wrong dependency injected, missing initialization step, incorrect environment variable.

**Solution**: Write one or two end-to-end tests that verify the application starts and completes a common workflow. These are slow, fragile tests that you run infrequently. Their purpose is purely as a safety net. If a smoke test fails, it indicates a gap in your narrow tests that should be filled.

```typescript
describe("Smoke test", () => {
  it("starts the application and processes a request", async () => {
    const result = execSync("./run.sh 'hello'").toString();
    assert.equal(result.trim(), "uryyb");
  });
});
```

**Important**: Smoke tests are *not* the primary test suite. If you find yourself writing many broad tests, it's a sign that narrow test coverage has gaps.

### 3.5 Zero-Impact Instantiation

**Intent**: Constructors do no significant work.

**Problem**: When constructors open connections, start services, or perform calculations, creating objects in tests becomes slow and side-effect-laden. Tests need elaborate setup and teardown, and instantiation order matters.

**Solution**: Constructors only assign fields. All significant work — connecting to databases, starting servers, reading configuration — is deferred to explicit methods like `connect()`, `start()`, or `initialize()`.

```typescript
class HttpClient {
  private baseUrl: string;
  private connection?: Connection;

  constructor(baseUrl: string) {
    // Only assign fields. No network calls.
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<void> {
    // Significant work happens here, not in the constructor.
    this.connection = await createConnection(this.baseUrl);
  }
}
```

This enables [Parameterless Instantiation](#36-parameterless-instantiation) and makes tests fast and predictable.

### 3.6 Parameterless Instantiation

**Intent**: Every class can be instantiated with no arguments via a factory method.

**Problem**: Deep dependency chains require lengthy constructor argument lists. Tests become verbose, fragile, and coupled to the dependency graph. Adding a new dependency to `App` breaks every test that instantiates `App`.

**Solution**: Provide a static `create()` factory method that instantiates the class with production defaults. The class creates its own dependencies internally. For tests, provide `createNull()` (see [Nullables](#71-nullables)).

```typescript
class App {
  private commandLine: CommandLine;
  private rot13: Rot13;

  // Private constructor — use factory methods
  private constructor(commandLine: CommandLine, rot13: Rot13) {
    this.commandLine = commandLine;
    this.rot13 = rot13;
  }

  static create(): App {
    return new App(CommandLine.create(), Rot13.create());
  }

  static createNull(options?: { args?: string[] }): App {
    return new App(
      CommandLine.createNull(options),
      Rot13.create() // Pure logic — no need to null
    );
  }
}
```

For value objects or data structures that genuinely require parameters, provide a `createTestInstance()` factory with optional overridable defaults:

```typescript
class Address {
  static createTestInstance(overrides?: Partial<AddressProps>): Address {
    return new Address({
      street: "123 Test St",
      city: "Testville",
      zip: "00000",
      ...overrides,
    });
  }
}
```

### 3.7 Signature Shielding

**Intent**: Protect tests from breaking when method signatures change.

**Problem**: When you add a parameter to a method, every test calling that method breaks — even tests that don't care about the new parameter.

**Solution**: Use helper functions in tests that abstract away method signatures. Use optional parameters with sensible defaults.

```typescript
// Test helper — shields tests from signature changes
function run(options?: { args?: string[] }): { output: OutputTracker } {
  const app = App.createNull({ args: options?.args ?? ["default input"] });
  const output = app.trackOutput();
  app.run();
  return { output };
}

// Tests use the helper — don't call App.createNull directly
it("transforms input", () => {
  const { output } = run({ args: ["hello"] });
  assert.deepEqual(output.data, ["uryyb\n"]);
});

it("uses default input when none provided", () => {
  const { output } = run(); // No args needed
  assert.deepEqual(output.data, ["qrsnhyg vachg\n"]);
});
```

When `App.createNull()` gains a new parameter, you update the `run()` helper once instead of every test.

---

