---
name: property-based-testing-with-kotest
description: "Writes property-based tests using Kotest's kotest-property module. Identifies testable properties, designs generators, and configures PBT for Kotlin/JVM projects. Use when writing property-based tests, creating custom Arb generators, choosing property patterns (roundtrip, invariant, idempotence, oracle), debugging shrunk counterexamples, or integrating PBT into a Kotlin test suite alongside example-based tests."
category: Software Engineering
---

# Property-Based Testing with Kotest

## Workflow: Writing a property-based test

1. **Decide if PBT fits.** Use PBT for functions with broad input spaces, clear
   invariants, round-trip operations, or many parameter combinations. Keep
   example-based tests for specific business scenarios and regression pinning.
2. **Identify properties.** Pick from these patterns (most to least common):
   - **Roundtrip** — `decode(encode(x)) == x`. For serialize/parse/compress pairs.
   - **Invariant** — a measurable property is preserved (e.g., `sort` preserves size and elements).
   - **Idempotence** — `f(f(x)) == f(x)`. For trim, distinct, upsert, PUT.
   - **Oracle** — compare optimized implementation against a simple correct one.
   - **Hard to prove, easy to verify** — check output validity (e.g., prime factors multiply back).
   - **Commutativity** — different operation orders yield same result.
   - **Induction** — base case + recursive step.
   - **Metamorphic** — when correct output is unknown, test relationships between outputs under related inputs.
   Always identify **at least two** complementary properties per function under test.
3. **Design generators.** Use `Arb` for random+edge-case generation (default),
   `Exhaustive` for small finite domains. Constrain generators at construction
   — don't rely on `filter()` or `assume()` (keep discard rate under 10%).
   For domain types, compose with `arbitrary { ... }` using `.bind()`.
4. **Write the test.** Use `checkAll` with Kotest matchers (preferred over
   `forAll` with booleans). Default: 1,000 iterations.
5. **Handle failures.** Analyze the shrunk counterexample. Convert it into a
   permanent example-based regression test. Keep the property test running to
   find future failures.

## Dependency

```kotlin
// build.gradle.kts
dependencies {
    testImplementation("io.kotest:kotest-property:$kotestVersion")
}
```

## Key decisions

- **`checkAll` vs `forAll`:** Use `checkAll` — richer error messages via matchers.
- **`Arb` vs `Exhaustive`:** Use `Arb` unless the domain is small and finite (enums, boolean).
- **Iteration count:** 1,000 (default) for local/CI. Use env var for nightly builds (10k+).
- **Shrinking:** Leave at default `Bounded(1000)`. Use `Unbounded` only when debugging.
- **Custom generators:** Always use `.bind()` inside `arbitrary {}`, never `kotlin.random.Random`.
- **Custom shrinkers:** Must preserve domain invariants. Invalid shrunk values cause false failures.
- **Seeds:** Let Kotest auto-persist failed seeds. Convert discovered failures to regression tests.

## Edge cases

- **Lossy conversions:** Roundtrip pattern fails if conversion loses precision (e.g., `Float`→`Double`). Verify losslessness or test a weaker property.
- **Cross-variable constraints:** Use `assume()` only when the constraint can't be expressed in the generator. Prefer restructuring (e.g., `val (larger, smaller) = if (a > b) a to b else b to a`).
- **Slow generators:** Don't reduce iteration count. Optimize the generator, split suites, or run long suites in nightly builds.
- **Non-determinism in SUT:** Pin seeds for debugging, but keep the main property test with random seeds.

## Reference material

- **Fundamentals and core API**: [references/01-fundamentals-and-core-api.md](references/01-fundamentals-and-core-api.md) — when to use PBT, `checkAll`/`forAll`, `Arb` vs `Exhaustive`
- **Property patterns**: [references/02-property-patterns.md](references/02-property-patterns.md) — the seven patterns with Kotlin examples
- **Generator design**: [references/03-generator-design.md](references/03-generator-design.md) — built-in Arbs, operations, `arbitrary {}`, domain composition
- **Shrinking, seeds, assumptions**: [references/04-shrinking-seeds-assumptions.md](references/04-shrinking-seeds-assumptions.md) — shrinking modes, custom shrinkers, seed persistence, `assume()`
- **Configuration and anti-patterns**: [references/05-configuration-and-anti-patterns.md](references/05-configuration-and-anti-patterns.md) — `PropTestConfig`, global settings, common mistakes
- **Advanced topics and strategy**: [references/06-advanced-topics-and-strategy.md](references/06-advanced-topics-and-strategy.md) — stateful/model-based, metamorphic, concurrency, CI/CD, adoption
- **Quick reference**: [references/07-quick-reference.md](references/07-quick-reference.md) — API cheat sheet, sources
