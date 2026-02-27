## 9. Nullables vs. Mocks: A Detailed Comparison

Understanding the distinction between Nullables and traditional mocks is essential for evaluating whether this approach suits your context.

### What You Replace

| Aspect | Mocks | Nullables |
|---|---|---|
| **What's replaced** | Your classes/interfaces | Third-party I/O code only |
| **Who writes it** | Test code (or mock framework) | Production class itself |
| **Where it lives** | Test files | Production files |
| **What runs in tests** | Mock implementations | Your real code |

### How Tests Work

| Aspect | Mocks | Nullables |
|---|---|---|
| **Assertion style** | Interaction-based (was X called?) | State-based (what was the result?) |
| **Dependency handling** | Isolated (each dep mocked) | Sociable (real deps execute) |
| **Refactoring impact** | Tests break on internal changes | Tests survive if behavior unchanged |
| **Bug detection** | Misses boundary bugs | Catches integration issues |

### Practical Tradeoffs

| Aspect | Mocks | Nullables |
|---|---|---|
| **Setup complexity** | Mock framework + config per test | One-time `createNull()` per class |
| **Production impact** | None (test-only) | Embedded stubs in production code |
| **Framework needed** | Yes (Jest, Sinon, Mockito, etc.) | No framework needed |
| **Test speed** | Fast | Fast (reported 2–3 orders of magnitude faster than mock frameworks) |
| **Learning curve** | Low (familiar pattern) | Medium (new concepts) |
| **Legacy compatibility** | N/A (status quo) | Full side-by-side compatibility |

### When Mocks May Still Be Appropriate

Nullables are not universally superior. Mocks may be preferred when:
- You're testing complex distributed systems where sequencing and back-and-forth interactions matter more than state.
- The team is deeply invested in a mock-based workflow and the migration cost is high.
- The external system's behavior is genuinely too complex to stub minimally.

### When Nullables Shine

- Codebases with heavy refactoring activity (Nullables don't break on restructuring).
- Teams tired of maintaining mock setup that mirrors implementation details.
- Projects where integration bugs repeatedly slip through mock-based tests.
- Applications with deep dependency chains where mock setup is verbose.

---


---

## 12. Tradeoffs and When to Use Nullables

### The Core Tradeoff

**Embedded stubs live in production code.** This is the primary cost. Your production artifacts contain code that only exists to support testing. The benefits:

- Tests run production code, catching real bugs.
- All interface knowledge is centralized.
- No mock framework dependency.
- Tests survive refactoring.

Whether this tradeoff is worthwhile depends on your context.

### Good Fit

- **Greenfield projects** where you control the architecture from the start.
- **Codebases with frequent refactoring** where mock-based tests are a constant maintenance burden.
- **Teams experiencing integration bugs** that slip through mock-based test suites.
- **Applications with well-defined infrastructure boundaries** (microservices, CLI tools, web apps with clear I/O layers).
- **Projects that value test readability** — state-based assertions are generally easier to understand than mock verifications.

### Poor Fit

- **Complex distributed systems** where interaction sequencing between services is the primary concern.
- **Codebases with minimal infrastructure** (pure libraries, computation engines) where there's nothing to Null.
- **Teams with strong investment in existing mock patterns** where the migration cost exceeds the benefit.
- **Throwaway or short-lived code** where test maintenance isn't a long-term concern.

### Common Objections and Responses

**"Isn't this just another kind of mock?"**
No. Mocks replace *your code* with test doubles. Nullables replace *third-party I/O* while running your actual production code. The distinction matters because your code is what changes during refactoring.

**"Production code shouldn't contain test infrastructure."**
This is the central philosophical disagreement. Shore argues the cost is modest (small stubs at the third-party boundary) and the benefit is large (tests exercise production code paths). Many practitioners find the tradeoff worthwhile.

**"Sociable tests produce cascading failures."**
True. When a low-level bug is introduced, multiple tests fail. But this is a feature: the failures show you which code paths are affected. In contrast, solitary mock-based tests *hide* the cascade — the bug exists but only one test catches it (if any).

**"This doesn't work for complex stateful interactions."**
Partially true. For deeply stateful protocols (multi-step authentication flows, complex transaction sequences), interaction-based testing may be more natural. The patterns can be combined: use Nullables for most infrastructure and mocks for the few truly interaction-heavy boundaries.

---

