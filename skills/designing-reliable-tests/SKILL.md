---
name: designing-reliable-tests
description: Diagnoses slow or flaky automated tests, designs hermetic tests, and hardens required CI gates without weakening coverage. Produces root-cause findings, verified fixes, and adoption plans. Use when investigating test isolation, quarantining flaky tests, enforcing first-attempt CI verdicts, speeding up PR checks or sharding, configuring Playwright first-failure traces or HAR replay, or reviewing GitHub Actions merge queues and required PostgreSQL migration checks or mixed-version rollouts. Not for routine test authoring or product performance benchmarking alone.
category: Test Strategy & Reliability
---

# Designing Reliable Tests

## Inspect before changing

1. Identify the protected behavior, exact candidate, and checks that actually block merge. Inspect the relevant entry points, fixtures, workflow triggers, runner versions, and first-attempt results or timings. For a scenario without a repository, use the supplied facts; do not search the workspace for a project. Distinguish confirmed defects from plausible causes.
2. **Read the reference for the decision being made** before recommending changes. Start with one route below; add another only for a second decision. For example, a retry-policy review involving Playwright does not require browser debugging. Use repository tooling and verify version-specific commands before proposing them.
3. Leave files unchanged for reviews. For implementation, make the smallest reversible change that protects the same behavior. Report policy conflicts and propose a migration path; do not silently change required checks, branch protection, or release policy.

## Acceptance standard

- **Protect behavior at the cheapest layer that can fail for the right reason.** Give each required test an owner, stable ID, lane, declared dependencies and private writable state. Deny undeclared network access during execution. Control inputs and scheduling or assert an invariant valid for every allowed schedule. Wait for a meaningful condition, not a sleep.
- **Bound work and waiting separately.** Cap cases, fixture sizes and workers; use deadlines and a process-level watchdog. Do not promise a hosted-runner wall-clock bound or infer zero flakes from a clean streak.
- **A first assertion failure stays red.** Reject retry overrides before running required tests. Preserve test attempts separately from workflow attempts; a final JUnit report and exit code may both hide a failed attempt. An independently verified platform failure before a verdict is inconclusive, not green; only trusted policy may authorize a bounded fresh attempt.
- **No known flakes in required execution.** Record them in an observable, non-blocking quarantine lane with a stable ID, owner, issue, evidence and expiry. Replace required coverage before merge or keep the affected merge blocked. Never quarantine a product defect into a pass.
- **Schema migration verification always blocks the merge.** Where the project has migrations, keep the check present on the exact candidate. Use the real target engine for fresh install and upgrade from trusted deployed baselines; test rollout and operational risk before merge. Do not substitute lint, a nightly run, or quarantine. Compare fresh and upgraded semantics and assert the intended outcome directly.
- **Required green means verified and complete.** Reject missing, skipped, cancelled, unknown, or mismatched results. When deploying prebuilt artifacts, promote the exact tested digest, not another build from the same commit.

## Pick the workflow

| Task | What to do first | Load |
| --- | --- | --- |
| Design reliable tests or diagnose a flake | Choose the smallest faithful boundary; preserve first-failure evidence and vary one factor at a time. | [Test design and flake diagnosis](references/01-test-design-and-flakes.md). |
| Fix browser state, waits, request replay, or trace capture | Isolate server state, prove replay is closed, or preserve the first failure. | [Browser tests](references/02-browser-tests.md). |
| Speed up tests or CI | Measure the critical path; fix the largest measured cost before sharding or test selection. | [Latency and budgets](references/03-latency-and-budgets.md). |
| Harden retries, required checks, or artifact promotion | Define a valid green; test what happens when a verdict, lane, or candidate is wrong. | [Required CI gate](references/04-required-ci-gate.md). |
| Review database isolation or schema rollout | Decide which checks need the real engine, a deployed baseline, or multiple app versions. | [Database tests and migrations](references/05-database-and-migrations.md). |

## Verify and report

- **Test or gate change:** replay the trigger, show a negative control fails for the intended reason, and verify a clean control passes. **Speed change:** re-measure the same feedback path under comparable cold and warm conditions and verify coverage is intact.
- Lead with the decision, evidence, smallest corrective change, and verification. Separate checks actually run from checks still needed; do not certify behavior you could not exercise.

**Example:** A required Bun test fails, passes on retry, and emits green JUnit → block the merge. Reject the override in preflight; use a separate diagnostic run to prove the failed attempt survives a green report.
