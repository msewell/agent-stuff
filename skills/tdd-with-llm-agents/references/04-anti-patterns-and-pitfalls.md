# Anti-Patterns and Pitfalls

### Bulk test generation

**The problem:** Writing an entire test suite up front. This produces tests that validate imagined behavior, not observed behavior. Tests and implementation come from the same mental model, so they confirm each other's assumptions rather than catching real bugs.

**The fix:** One test at a time. Always.

### Testing existing code instead of specifying behavior

**The problem:** "Write tests for the existing `calculateTotal` function." This produces tests that describe what the code *currently does*, not what it *should do*. If the code has bugs, the tests codify those bugs.

**The fix:** Reframe: "Write tests for `calculateTotal` behavior, assuming the function doesn't exist yet. Then verify whether the existing implementation passes."

### Deleting or modifying tests to pass

**The problem:** Modifying or deleting a failing test instead of fixing the implementation. This is the most insidious anti-pattern because the test suite goes green, giving a false sense of correctness. Kent Beck has flagged this as a recurring issue even with the best agents.

**The fix:** Treat "NEVER modify tests to make them pass" as a hard constraint. Reinforce it in AGENTS.md and ideally enforce it with file-permission guards or pre-write hooks.

### Over-implementation

**The problem:** Writing more code than the current test requires — anticipating future tests, adding error handling for untested scenarios, or building abstractions for hypothetical future needs.

**The fix:** Write the MINIMUM implementation. If over-implementation happens, discard the excess and re-implement with the constraint. Enforcement tools like TDD Guard can also detect and block this.

### Skipping the red phase

**The problem:** Writing a test and immediately writing the implementation without running the test to confirm it fails first. This means there is no evidence the test is actually exercising new code — it might already pass due to existing logic.

**The fix:** Make "run the test and confirm failure" an explicit, mandatory step. Hooks that auto-run tests on file save help, but also inspect the output and confirm the test truly failed for the expected reason.

### Implementation leaking into tests

**The problem:** Writing tests that depend on implementation details — specific internal method names, private state, execution order of internal steps. These tests are brittle and break on any refactoring even when behavior is preserved.

**The fix:** Test the public interface only. "Test what the code does, not how it does it."

### The "green bar hypnosis" trap

**The problem:** All tests pass, so everything must be fine. But the tests themselves are trivial, tautological, or test the wrong thing. A common degenerate case: the implementation hardcodes return values that happen to match the test assertions.

**The fix:** After a green phase, critically review whether the test would fail if the implementation were wrong in a plausible way. Verification sub-agents can help with this. Adding a second test case with different inputs for the same behavior is a quick sanity check.

### Slow test suites becoming a bottleneck

**The problem:** TDD requires running tests many times per feature — at minimum once per red phase, once per green phase, and once per refactor. If the test suite takes 30 seconds, each TDD cycle costs two minutes just in test execution. This compounds quickly.

**The fix:** Run only the relevant subset of tests during active TDD cycles (`--testPathPattern`, `-k`, or similar filters). Run the full suite periodically (at the end of a feature, before commits, or via hooks on less frequent events).

### Refactoring tests and implementation simultaneously

**The problem:** During refactoring, changing both tests and implementation at the same time. This means neither serves as a fixed reference point, and subtle behavior changes can slip through undetected.

**The fix:** Refactor implementation first, with tests as the fixed reference. Only after implementation refactoring is complete (and tests are green) refactor tests — with the implementation as the fixed reference.

### Context window exhaustion

**The problem:** Long TDD sessions accumulate test output, implementation code, and conversation history that can exceed the context window. Earlier decisions, constraints, or even which tests exist get lost.

**The fix:** Keep TDD sessions focused on a single feature or module. Summarize completed work periodically. For long sessions, re-anchor by re-running the test suite and reviewing the current state.
