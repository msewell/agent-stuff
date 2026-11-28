---
name: reviewing-pull-requests
description: "Reviews GitHub pull requests end-to-end using gh CLI. Gathers PR metadata, diff, linked issues, and CI status. Analyzes code for bugs, security risks, performance issues, and goal alignment against repo conventions. Runs available lint, type-check, and test commands locally. Produces a prioritized report with severity-classified feedback (blocking, suggestion, nit, praise) and an approve/request-changes verdict. Optionally posts the review to GitHub after user confirmation. Use when asked to review a PR, check a pull request, audit code changes, evaluate if a PR is ready to merge, provide code review feedback, assess PR quality, or when the user says review PR #N, is this PR ready, look at this pull request, or code review."
category: Software Engineering
compatibility: Requires gh CLI authenticated with repo access
---

# Reviewing Pull Requests

Follow these phases in order. The user provides a PR number, URL, or
`owner/repo#number`. The repo must be cloned locally and `gh` must be
authenticated.

**Not this skill:** Creating PRs, resolving review feedback, fixing CI
failures, or merging. This skill only *reviews* code changes.

## Phase 1 — Gather context

1. **PR metadata:**
   ```bash
   gh pr view <PR> --json title,body,baseRefName,headRefName,state,labels,author,additions,deletions,changedFiles,reviewRequests,reviews
   ```

2. **Diff:**
   ```bash
   gh pr diff <PR>
   ```
   If diff exceeds 50 changed files (too large to process as a single
   diff without truncation), list files first with
   `gh pr diff <PR> --name-only` and read high-risk files individually.

3. **Linked issues** — parse PR body for `Fixes #N`, `Closes #N`,
   `Resolves #N`, `Related to #N`. For each:
   ```bash
   gh issue view <N> --json title,body,labels,state
   ```

4. **Existing review comments** — fetch both PR-level and inline:
   ```bash
   REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
   gh api --paginate repos/$REPO/issues/<PR>/comments \
     --jq '.[] | {body, user: .user.login}'
   gh api --paginate repos/$REPO/pulls/<PR>/comments \
     --jq '.[] | {path, line, body, user: .user.login}'
   ```

5. **CI status:**
   ```bash
   gh pr checks <PR>
   ```
   If checks failed: `gh run view <RUN_ID> --log-failed`

## Phase 2 — Understand repo conventions

Read each file if it exists (skip silently if absent):

- `CONTRIBUTING.md`, `CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`
- `AGENTS.md` or `CLAUDE.md`
- Linter/formatter configs (`.eslintrc*`, `biome.json`, `.prettierrc*`,
  `pyproject.toml`, `ruff.toml`, `.rubocop.yml`, `.golangci.yml`)
- CI workflows (`.github/workflows/*.yml`) — understand what automated
  checks already exist

Judge the PR against **project conventions**, not abstract ideals.

## Phase 3 — Analyze code changes

Summarize the PR's intent in one sentence before proceeding. If you
cannot, note the unclear intent as the first finding.

Review the diff against these priorities (highest first). See
[references/01-review-checklist.md](references/01-review-checklist.md) for
detailed checks and false-positive guidance per category.

1. **Goal alignment** — Does the PR achieve what linked issue(s) describe?
2. **Bugs and logic errors** — Start with added or modified behavior; trace its effects on unchanged consumers and artifacts.
3. **Security** — HIGH-confidence findings only. Trace data flow from
   source to sink before reporting.
4. **Codebase consistency** — Compare against surrounding code, not
   abstract ideals.
5. **Test coverage** — Are the riskiest new code paths tested?
6. **Performance** — Flag only concrete, demonstrable findings.
7. **Documentation** — Are public APIs and breaking changes documented? Does the change make maintained documentation or diagrams stale?

**Rules:**

- Review the effects of the change, not unrelated pre-existing debt. Cite the changed input and the affected artifact when the artifact itself is unchanged. For example, a routing configuration change can invalidate an untouched architecture diagram.
- Never block on style when a linter or formatter is configured.
- If the author left comments explaining a non-obvious choice, acknowledge
  their reasoning before suggesting alternatives.
- If nothing significant is found, say so — do not invent findings.

## Phase 4 — Verify checks

Identify repo-defined commands from `package.json` scripts, `Makefile`,
`pyproject.toml`, and CI workflow files. Run the checks below in order only
within the user's authorization for execution, revision, writes, and network
access. If the request is limited to inspection or supplied evidence, don't
execute checks. Report what ran, what didn't, and any resulting gaps.

1. **Lint** — e.g. `npm run lint`, `ruff check .`, `golangci-lint run`
2. **Type-check** — e.g. `npx tsc --noEmit`, `mypy .`, `pyright`
3. **Tests** — run relevant tests for local review evidence. Account for runtime
   dependencies, not just changed filenames. Widen the selection if impact is
   uncertain. A focused local pass does not certify a required CI check.
4. **Schema-affecting changes** — verify required fresh-install and upgrade
   results against the real target engine on the exact merge candidate (the
   merge-group commit when a queue is used). Check mixed-version compatibility
   when deployment versions overlap. A green PR-head check or nightly run is
   not a substitute for a required result on the merge candidate. If the
   required evidence is missing, report it as blocking.

**Guardrails:**

- Do not deploy, publish, use `--write` or `--fix`, or modify shared, persistent,
  or production state. Run migration or seed commands locally only against an
  explicitly disposable, isolated test database whose target you have verified.
  Otherwise inspect the recorded CI evidence and report what could not be verified.
- If unsure what a command does, skip it and note it in the report.
- If no checks are available, note this and proceed.

## Phase 5 — Produce the report

Classify every finding:

| Tag | Severity | Criteria |
|-----|----------|----------|
| `[B]` | Blocking | Must fix before merge — bugs, security, data loss, broken functionality. Include what's wrong, why it matters, and how to fix it. |
| `[S]` | Suggestion | Should fix — better approaches, missing edge cases, maintainability. Explain the alternative and why it's better. |
| `[N]` | Nit | Optional — style, minor naming. One sentence max. |
| `[P]` | Praise | Good work — be specific about what's well done. |

**Verdict:**

- **✅ Approve** — Zero blocking findings
- **⚠️ Approve with comments** — Zero blocking findings, but suggestions
  worth noting
- **❌ Request changes** — One or more blocking findings

These verdicts concern the code changes. They do not clear the review text for posting or authorize disclosure of linked material.

Every finding must cite a specific `file:line`. Rank blocking findings:
security > bugs > logic errors > breaking changes. Include at least one
praise if anything positive stands out.

Generate the report using
[references/02-report-template.md](references/02-report-template.md).

## Phase 6 — Post review to GitHub (only if user requests)

**Always confirm with the user before posting.** Show the exact review text,
links or attachments, review action, and target repository and PR. Verify that
current repository and channel policy permits this payload and that any
required disclosure clearance covers it. Neither confirmation nor code
approval waives these requirements. If any required check or clearance is
unverified, keep the draft private and report what is missing. If the payload
or destination changes, recheck it and obtain fresh confirmation.

```bash
# Approve
gh pr review <PR> --approve --body "<summary>"

# Request changes
gh pr review <PR> --request-changes --body "<report>"

# Comment only
gh pr review <PR> --comment --body "<report>"
```

## Edge cases

- **Empty PR description**: Flag as first finding — a PR without context
  is a review anti-pattern.
- **Large PR**: Treat size as a signal to look for reviewable boundaries, not
  a finding by itself. Recommend a split only if the pieces can be reviewed
  independently and remain safe without separating behavior from its tests.
  Otherwise, ask for a short path through the diff and review the highest-risk
  parts first.
- **Draft PR**: Review normally, note draft status in summary.
- **No linked issue**: Review as-is. Note missing link as a suggestion.
- **Failing CI on changed code**: Include as a blocking finding.
- **Bot PRs (Dependabot, Renovate)**: Focus on changelog/breaking changes
  and test results. Skip style review.
- **Author disagreement**: Focus on impact (why it matters), not authority.
  Yield on non-blocking items.

## References

- [references/01-review-checklist.md](references/01-review-checklist.md) —
  Detailed checks by category with false-positive guidance
- [references/02-report-template.md](references/02-report-template.md) —
  Report template with example findings
