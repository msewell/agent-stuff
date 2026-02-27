## Nullability Patterns (Advanced)

### 7.5 Output Tracking

**Intent**: Observe what infrastructure code sends to the outside world.

**Problem**: State-based tests need to assert on *what was written*. But the writes go to stdout, an HTTP service, or a database — not to a return value.

**Solution**: Provide `trackXxx()` methods that record behavior-level writes. The tracker uses an event-emitting pattern that works regardless of whether the object is Nulled or real.

```typescript
class CommandLine {
  private emitter: EventEmitter = new EventEmitter();

  write(text: string): void {
    this.stdout.write(text);
    this.emitter.emit("write", text); // Emit regardless of null state
  }

  trackOutput(): OutputTracker {
    const tracker = new OutputTracker();
    this.emitter.on("write", (data) => tracker.add(data));
    return tracker;
  }
}

class OutputTracker {
  readonly data: string[] = [];

  add(entry: string): void {
    this.data.push(entry);
  }
}

// In tests
it("writes transformed output", () => {
  const commandLine = CommandLine.createNull({ args: ["hello"] });
  const output = commandLine.trackOutput();

  app.run();

  assert.deepEqual(output.data, ["uryyb\n"]);
});
```

**Key point**: Output Tracking works on *both* real and Nulled instances. You can use it in production for monitoring, auditing, or debugging — it's not a test-only facility.

### 7.6 Fake It Once You Make It

**Intent**: For high-level code, delegate to Nullable dependencies instead of writing new stubs.

**Problem**: Once low-level infrastructure wrappers are Nullable, you might think you need to write stubs for every higher-level class too. This duplicates effort and defeats the purpose.

**Solution**: When making application-layer or high-level infrastructure code Nullable, simply create Nulled versions of its dependencies. Decompose [Configurable Responses](#74-configurable-responses) from the high-level format to the format expected by each dependency.

```typescript
class App {
  private commandLine: CommandLine;
  private rot13: Rot13;

  static createNull(options?: { args?: string[] }): App {
    // Delegate to Nullable dependencies — no new stubs needed
    return new App(
      CommandLine.createNull({ args: options?.args }),
      Rot13.create() // Pure logic — no null needed
    );
  }

  run(): void {
    const input = this.commandLine.args()[0] ?? "";
    const output = this.rot13.transform(input);
    this.commandLine.write(output + "\n");
  }

  trackOutput(): OutputTracker {
    return this.commandLine.trackOutput();
  }
}
```

This is the pattern that makes Nullables **composable**: "It's Nullables all the way down." You only write Embedded Stubs at the very bottom (third-party boundaries). Everything above composes Nullable dependencies.

### 7.7 Behavior Simulation

**Intent**: Simulate external events like incoming HTTP requests, messages, or timer ticks.

**Problem**: Some tests need to trigger behavior that normally comes from the outside world — a client sends a POST request, a message arrives on a queue, a timer fires.

**Solution**: Add methods to infrastructure wrappers that simulate these events. Share the event-handling code path between the real event handler and the simulation method.

```typescript
class HttpServer {
  private handlers: Map<string, RequestHandler> = new Map();

  onPost(path: string, handler: RequestHandler): void {
    this.handlers.set(`POST:${path}`, handler);
  }

  // Behavior Simulation — triggers the same handler
  async simulatePost(
    path: string,
    body: unknown
  ): Promise<HttpResponse> {
    const handler = this.handlers.get(`POST:${path}`);
    if (!handler) throw new Error(`No handler for POST ${path}`);
    return handler(body);
  }

  static createNull(): HttpServer {
    return new HttpServer(/* null network layer */);
  }
}

// In tests
it("processes POST /api/orders", async () => {
  const server = HttpServer.createNull();
  const app = App.createNull({ server });
  app.start(); // Registers handlers

  const response = await server.simulatePost("/api/orders", {
    item: "widget",
    quantity: 3,
  });

  assert.equal(response.status, 201);
});
```

**Important**: The simulation method must invoke the same code path as a real request. Use a shared `#handleXxx()` private method that both the real listener and the simulation method call.

---

