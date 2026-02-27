---
name: testing-with-nullables
description: "Guides writing fast, reliable, refactoring-friendly tests using the Nullables pattern language (James Shore's 'Testing Without Mocks'). Produces narrow, sociable, state-based tests with production code that has an infrastructure 'off switch' — no mock frameworks needed. Use when writing tests, replacing mocks with Nullables, making infrastructure code testable, adding createNull() factories, implementing output tracking, wrapping external dependencies, or adopting testing-without-mocks patterns. Covers embedded stubs, configurable responses, behavior simulation, A-Frame architecture, and incremental migration from mock-based test suites."
---

# Testing With Nullables

## Core concept

Nullables are production classes with an infrastructure "off switch." Each infrastructure class provides two factories:

- `create()` — production instance with real I/O
- `createNull()` — same class, same code paths, but I/O suppressed at the third-party boundary

Tests exercise real production code. Only the lowest-level third-party calls are stubbed.

```typescript
class CommandLine {
  private constructor(private stdout: WritableStream, private _args: string[]) {}

  static create(): CommandLine {
    return new CommandLine(process.stdout, process.argv.slice(2));
  }

  static createNull(options?: { args?: string[] }): CommandLine {
    return new CommandLine(new NullWritableStream(), options?.args ?? []);
  }

  write(text: string): void { this.stdout.write(text); }
  args(): string[] { return this._args; }
}
```

## Workflow: Making a dependency testable with Nullables

1. **Identify the infrastructure boundary.** Find the class that talks to an external system (HTTP, file system, database, stdout).
2. **Create an Infrastructure Wrapper** if one doesn't exist. One wrapper per external system. Translate between external formats and domain types.
3. **Add an Embedded Stub.** Stub the *third-party code* (not yours) with a minimal implementation covering only the methods your code calls. Keep it in the same file.
4. **Add `createNull()`** factory that injects the embedded stub instead of the real third-party dependency. Both factories return the same class.
5. **Add Configurable Responses** to `createNull()` so tests can control what the dependency returns. Name parameters by *behavior* (`verificationStatus`), not implementation (`httpResponseBody`).
6. **Add Output Tracking** via `trackXxx()` methods that record writes using an event emitter. This enables state-based assertions on side effects.
7. **Compose upward.** Higher-level classes call `createNull()` on their dependencies — no new stubs needed (Fake It Once You Make It).

## Workflow: Writing tests in the Nullables style

1. **Write narrow tests.** One test file per module/class. Each test has a single reason to fail.
2. **Make tests sociable.** Exercise real dependencies — don't mock them. If `App` uses `Rot13`, tests run the real `Rot13`.
3. **Assert on state, not interactions.** Check return values, object state, or tracked output. Never assert on whether methods were called or in what order.
4. **Use signature shielding.** Create test helper functions that wrap `createNull()` calls. When the factory signature changes, update one helper instead of every test.
5. **Write narrow integration tests** for each infrastructure wrapper against real (but local/test-isolated) external systems. Run these in CI, not on every save.
6. **Add smoke tests sparingly.** One or two end-to-end tests as a safety net. If you need many, your narrow tests have gaps.

## Workflow: Migrating from mocks to Nullables

1. Pick the most-mocked dependency.
2. Make it Nullable (follow the workflow above).
3. Replace its mocks with `createNull()` in tests — keep other mocks unchanged.
4. Run tests. They should still pass.
5. Repeat for the next most-mocked dependency.

Nullables coexist with mocks. No big-bang rewrite needed.

## Key rules

- **Stub third-party code, not your code.** Your production code runs in full during tests.
- **`create()` and `createNull()` return the same class** — not a subclass, not a fake.
- **Constructors do no work** (Zero-Impact Instantiation). Defer connections, servers, and I/O to explicit methods.
- **Pure logic classes don't need Nullables.** Only infrastructure wrappers need `createNull()`.
- **Output Tracking works on both real and Nulled instances.** It's useful in production too (monitoring, auditing).
- **Design configurable responses from the consumer's perspective**, not the implementation's.

## Architecture recommendation

Use A-Frame Architecture for maximum testability:

```
      Application / UI
       /          \
    Logic    Infrastructure
       \          /
        Values (shared)
```

- **Application layer**: Coordinates logic and infrastructure via Logic Sandwich (read → process → write). No business logic, no I/O details.
- **Logic layer**: Pure business rules. Depends only on values. Test with simple state-based assertions.
- **Infrastructure layer**: Wraps external systems. One wrapper per system. Made testable via Nullables.

## Edge cases

- **Languages requiring interfaces (Java, C#)**: Use Thin Wrapper pattern — define a custom interface covering only methods you use, with real and null implementations. See [references/nullability-core.md](references/nullability-core.md).
- **Event-driven applications**: Use Behavior Simulation — add `simulateXxx()` methods to infrastructure wrappers that trigger the same handler as real events. See [references/nullability-advanced.md](references/nullability-advanced.md).
- **Complex stateful protocols**: For deeply stateful interactions (multi-step auth, transaction sequences), interaction-based testing may be more natural. Combine Nullables for most infrastructure with mocks for interaction-heavy boundaries. See [references/comparison-and-tradeoffs.md](references/comparison-and-tradeoffs.md).
- **Legacy codebases**: Start from outside in (Descend the Ladder) or inside out (Climb the Ladder). See [references/legacy-and-adoption.md](references/legacy-and-adoption.md).

## Reference material

Consult these for detailed patterns, code examples, and guidance:

- **Philosophy and foundational patterns**: [references/philosophy-and-foundations.md](references/philosophy-and-foundations.md) — core philosophy (sociable, state-based, production code), narrow tests, overlapping sociable tests, smoke tests, zero-impact instantiation, parameterless instantiation, signature shielding
- **Architecture patterns**: [references/architecture.md](references/architecture.md) — A-Frame architecture, logic sandwich, traffic cop, grow evolutionary seeds
- **Logic and infrastructure patterns**: [references/logic-and-infrastructure.md](references/logic-and-infrastructure.md) — easily-visible behavior, testable libraries, collaborator-based isolation, infrastructure wrappers, narrow integration tests, paranoic telemetry
- **Nullability core patterns**: [references/nullability-core.md](references/nullability-core.md) — Nullables, embedded stub, thin wrapper, configurable responses
- **Nullability advanced patterns**: [references/nullability-advanced.md](references/nullability-advanced.md) — output tracking, fake it once you make it, behavior simulation
- **Legacy migration and adoption**: [references/legacy-and-adoption.md](references/legacy-and-adoption.md) — descend/climb the ladder, replace mocks incrementally, throwaway stubs, step-by-step adoption guide
- **Comparison and tradeoffs**: [references/comparison-and-tradeoffs.md](references/comparison-and-tradeoffs.md) — Nullables vs. mocks tables, when each approach fits, common objections and responses
