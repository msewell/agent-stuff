---
name: preparing-pull-requests-for-review
description: "Drafts author-side pull request and merge request handoffs with a focused review question and revision-matched evidence. Use when preparing a PR for review, polishing a PR or MR description, showing before-and-after evidence, or drafting a re-review request. Not for independent code review, merge verdicts, or CI policy design."
category: Software Engineering
---

# Preparing Pull Requests for Review

Return a paste-ready draft in chat. Do not write files, change revisions, push, upload, post, or send a review request unless explicitly asked. Before making a handoff visible, verify the exact text, links, attachments, and destination against current repository and channel policy. A request to post does not waive required clearance for that payload. If a required check or clearance cannot be verified, keep the draft private and say what is missing. Run checks only within the user's authorization; leave approval and policy decisions to the team.

## 1. Establish scope

- **Supplied notes only:** Read applicable skill references for procedure. Use only the supplied material for case facts; do not inspect the repository, browse, or run commands.
- **Repository in scope:** Read repository instructions and any PR template. Review the requested diff; default to committed head and label any working-copy evidence separately. For local Git, read the head with `git rev-parse HEAD` and the comparison base with `git merge-base TARGET HEAD` (use the stack parent as target for a stacked layer). Do not substitute the target tip or a file ID for the comparison base. For committed content, use `git show HEAD:PATH` if the working copy differs. Mention local edits only as a reason not to run a check; do not quote them. If Git or the repository is unavailable, use supplied revisions and leave unknowns blank rather than guessing.

## 2. Identify the review decision

Keep the behavior and its test together and preserve invariants that would be unsafe to split. Suggest separating mechanical churn or independent rollout steps only when each piece is correct on its own. For a coherent but large diff, give a short path through the important decisions rather than splitting by line count. Lead with the intended user or operator outcome and ask one concrete question at a file, symbol, or hunk. Flag a consequential behavior change outside the stated intent rather than implying the stated intent covers the diff.

## 3. Match evidence to the claim

Select the smallest check that distinguishes the proposed behavior, including an adverse path if it could change the decision. For a regression, prefer the same check on the comparison base and head; a head pass does not establish a base failure. Read the relevant [reference](#choose-a-reference) for specialized evidence.

Before executing, verify the repo-defined command, authorized revision, test inputs, and possible writes or network access. Preserve the documented flags. If anything is outside scope, mark the check **Not run**. A modified input prevents testing committed `HEAD` in that checkout; don't stash, switch, or reconstruct code to work around the limit. Don't run untrusted code with credentials or run migrations against shared databases.

Use explicit evidence states; put the status before any command so the result can't be misread:

- **Ran here:** Use only for a check you actually executed in this session. Name the actual command, revision, and observed outcome. No execution means no “Ran here” line.
- **Reported:** Attribute supplied outcomes to their source and revision; don't use “Ran here” for these, even in an author-voice draft. Reproduction steps aren't outcomes. Mark stale results with their original revision and don't count them for the current one.
- **Not run / not recorded:** Distinguish a known skipped check from an unknown status. Put the status before the command; give one proposed check with the expected product behavior. Delete predictions such as “all tests should pass” or “this test fails on base” when no run was recorded. Keep proposals separate from policy-required checks. Report a missing required result as missing. A PR-head, local, or nightly pass does not satisfy a required result on a different merge candidate.

## 4. Draft and verify

Use the repo template when available; otherwise use **Title and intent**, **Review focus**, and **Verification and evidence**. Give revision IDs and brief reproduction steps or a link when known. Use one evidence section. Return only the draft, without process notes or extra offers.

Add **Rollout and recovery** only when it affects the decision. Include only confirmed constraints. If both order and rollback are unknown, use: “Deploy order and rollback boundary are not established. Confirm order with the deploy owner and rehearse rollback in isolation.” Omit the unknown sequence or boundary entirely, even as a suggestion. For material AI assistance, follow project disclosure policy; keep a human owner accountable and distinguish independent verification from tool-generated claims.

Check the draft against the diff, tool output, or supplied notes before returning. Revise anything unsupported: a test that exists wasn't necessarily added by this diff; a visible control isn't necessarily clickable; a passing check covers only what's asserted. Label inferences **by inspection**, not as run results. Mark old evidence superseded when it no longer applies.

## Re-request after revisions

Give the last reviewed and current head, intended semantic delta, revision-labeled evidence or explicit gaps, and one question to revisit. Don't imply the author ran checks beyond those supplied or that the rest of the diff is unchanged. After a rebase or squash, use both old and new base/head pairs, and note if the old commits remain reachable. Include both copyable commands with the actual revisions when known, as results only if run:

- Compare patch series: `git range-diff OLD_BASE..OLD_HEAD NEW_BASE..NEW_HEAD`.
- Inspect final file differences between the new base and head: `git diff NEW_BASE NEW_HEAD`.

For a rewritten stack, use each comparison's own parent. The final diff is relative to the new parent. Even unchanged child patches don't prove unchanged behavior after a parent change; say whether affected assumptions were rechecked. Mark old evidence superseded, not merely “available.”

## Example: a check you cannot run

**Input:** Committed head `abc123` aims to hide retry on an empty cart. Local edits affect the check. Repo command: `make test-retry`. No run at either revision.

**Evidence line:** “**Not run** — local edits affect the check's inputs. From a clean checkout of `abc123`, run `make test-retry`; an empty cart should not offer retry after a decline. No base run is recorded.”

## Choose a reference

- Read [UI evidence](references/01-ui-evidence.md) for screenshots, clips, previews, or interaction claims.
- Read [Evidence by change type](references/02-change-evidence.md) for non-visual evidence that needs more than a focused test.
- Read [GitHub mechanics](references/03-github.md) if acquiring GitHub metadata or interpreting checks from a merge queue.

Source: [Make pull requests easier to review](https://gist.githubusercontent.com/msewell/6e80cb2ddef46cc3319539ab972218a6/raw/cef0e173446c1d1beb414f2e6cb22bd8983c9c1f/pull-request-review-quality-of-life.md).
