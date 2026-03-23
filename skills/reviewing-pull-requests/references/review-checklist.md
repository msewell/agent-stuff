# Review Checklist

Detailed checks organized by the priority order from Phase 3. Use this as
a reference during analysis — not every section applies to every PR.

## Table of Contents

- [Goal Alignment](#goal-alignment)
- [Bugs and Logic Errors](#bugs-and-logic-errors)
- [Security](#security)
- [Codebase Consistency](#codebase-consistency)
- [Test Coverage](#test-coverage)
- [Performance](#performance)
- [Documentation](#documentation)
- [Escalation Signals](#escalation-signals)

---

## Goal Alignment

Compare the diff against linked issues and the PR description:

- Does every requirement in the issue have a corresponding code change?
- Are there code changes that don't map to any stated requirement (scope
  creep)?
- Does the PR title accurately describe what changed?
- If the issue specifies acceptance criteria, are they met?

If no issue is linked, verify the PR description alone explains the "why"
clearly enough to evaluate correctness.

## Bugs and Logic Errors

Focus on added and modified lines. Check for:

- **Null/undefined paths** — Is every value checked before use? Look for
  optional chaining, null guards, or assertion patterns the codebase uses.
- **Off-by-one** — Loop bounds, array indexing, pagination offsets, string
  slicing.
- **Error handling** — Are new error paths caught? Do catch blocks swallow
  errors silently? Are error messages actionable?
- **Race conditions** — Concurrent access to shared state, async
  operations with missing awaits, TOCTOU patterns.
- **State management** — Is state mutated in place when it shouldn't be?
  Are there stale closures?
- **Type mismatches** — Implicit coercions, wrong enum values, string
  where number expected.
- **Resource leaks** — Opened file handles, database connections, or event
  listeners without cleanup.
- **Backwards compatibility** — Changed function signatures, removed
  exports, altered return types, renamed fields in serialized data.

## Security

Report only HIGH-confidence findings. For each, trace the full data flow
from source (user input, external data) to sink (database query, HTML
render, file system operation, command execution).

**Check for:**

- Unsanitized user input reaching SQL queries, shell commands, or HTML
  output
- Hardcoded secrets, API keys, or tokens in source code
- Missing authentication or authorization checks on new endpoints
- Exposed internal errors or stack traces to end users
- Insecure deserialization of untrusted data
- New dependencies with known vulnerabilities (check if lockfile changed)
- Overly permissive CORS, CSP, or file permissions

**Common false positives to avoid:**

- Flagging parameterized queries as SQL injection
- Flagging template literals that don't contain user input
- Marking server-side-only code as XSS-vulnerable
- Flagging test fixtures that contain fake secrets
- Reporting "missing input validation" on internal-only functions that
  receive validated data from callers

When uncertain, phrase as a question: "Is this value sanitized before
reaching line N?" rather than asserting a vulnerability.

## Codebase Consistency

Do not impose external standards. Instead, compare the PR against the
existing codebase:

- **Naming** — Do new names follow the patterns in surrounding files?
  (camelCase vs snake_case, verb prefixes, abbreviation conventions)
- **File organization** — Are new files placed where similar files live?
  Does the directory structure make sense?
- **Import patterns** — Relative vs absolute imports, barrel files,
  import ordering
- **Error handling style** — Does the codebase use exceptions, result
  types, error codes? Does the PR match?
- **Architectural patterns** — If the codebase uses a layered
  architecture, does the PR respect layer boundaries?

If the project has linter/formatter configs, do NOT flag anything those
tools would catch. Note: "The project has ESLint configured — style findings
are deferred to the linter."

## Test Coverage

- **New code paths** — Are new branches, functions, and error handlers
  covered by tests?
- **Updated tests** — If behavior changed, were existing tests updated to
  match?
- **Edge cases** — Empty inputs, boundary values, error conditions,
  concurrent access
- **Test quality** — Do tests assert behavior (what it does) or
  implementation (how it does it)? Implementation-coupled tests are
  fragile.
- **Missing tests** — If the PR adds a public API endpoint or a function
  with branching logic and has zero test changes, flag it.

Do not demand 100% coverage. Focus on whether the riskiest new code paths
have at least one test.

## Performance

Flag only concrete, demonstrable findings:

- **N+1 queries** — Database queries inside loops. Look for ORM calls
  (`.filter()`, `.get()`, `.find()`) inside `for`/`map`/`forEach`.
- **Unbounded operations** — Loops or queries without limits on
  user-controlled input. Missing pagination on list endpoints.
- **Large allocations** — Loading entire datasets into memory when
  streaming or pagination would work.
- **Missing indexes** — New query patterns on columns without indexes
  (check migration files).
- **Redundant computation** — Recalculating the same value in a loop.
  Missing memoization for expensive operations.

Do not flag micro-optimizations (e.g., `for` vs `forEach` performance)
unless the code is in a proven hot path.

## Documentation

- **Public APIs** — Are new endpoints, functions, or types documented?
  At minimum: what it does, parameters, return value.
- **Complex logic** — Is non-obvious business logic explained with
  comments?
- **Breaking changes** — Are they noted in the PR description? Does the
  project have a changelog that needs updating?
- **Config changes** — Are new environment variables or config options
  documented?

## Escalation Signals

Flag these for the user's attention even if you can review them — they
carry higher risk and often benefit from a second human reviewer:

- Database schema modifications (migrations)
- Authentication/authorization changes
- API contract changes (request/response shapes, status codes)
- New external dependencies or framework adoption
- Changes to CI/CD pipeline or deployment configuration
- Cryptographic code changes
- Changes to financial or billing logic
