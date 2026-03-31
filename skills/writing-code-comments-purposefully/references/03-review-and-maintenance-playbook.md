# 03 — Review and Maintenance Playbook

## Table of Contents

- [Purpose](#purpose)
- [PR review standards](#pr-review-standards)
- [Blocking issues](#blocking-issues)
- [Strong suggestions](#strong-suggestions)
- [Nits](#nits)
- [CI and automation](#ci-and-automation)
- [Stale-comment heuristics](#stale-comment-heuristics)
- [AI-assisted documentation guardrails](#ai-assisted-documentation-guardrails)
- [Metrics that matter](#metrics-that-matter)
- [Adoption roadmap](#adoption-roadmap)
- [Team operating defaults](#team-operating-defaults)

---

## Purpose

Use this guide to keep comments and docs accurate over time.

Documentation quality is a maintenance discipline, not a one-time writing task.

---

## PR review standards

Review documentation with the same correctness bar as code.

In every change, check:

- Did behavior change?
- Did contract semantics change?
- Did concurrency, ordering, retry, timeout, or failure behavior change?
- If yes, were comments/docs updated in the same PR?

If documentation lags behavior, treat it as a defect.

---

## Blocking issues

Request changes when any condition is true:

- Public API behavior changed without interface doc update.
- Comment contradicts observable behavior.
- Failure semantics changed without documentation update.
- Side effects changed but docs still claim purity/no mutation.
- Concurrency assumptions changed without explicit note.

---

## Strong suggestions

Recommend improvements when:

- narration comments can be replaced by better naming
- non-obvious tradeoff lacks rationale comment
- confusing API flow lacks a minimal usage example
- cross-module coupling increased but no design note exists
- TODO/FIXME lacks owner, condition, or issue link

---

## Nits

Apply as lightweight polish:

- remove hedging words
- make units explicit
- align terminology with domain model
- split overloaded comment blocks into one concern each
- improve scanability using `Invariant:` and `Warning:` markers

---

## CI and automation

Automate syntax and structural checks first; keep semantic checks human-led.

### Baseline CI checks

- lint docstring/comment format where tooling supports it
- validate structured API docs where available
- enforce doc presence for public APIs when practical
- run spelling/style checks with curated dictionaries

### Enforcement rollout

1. advisory mode for new checks
2. fail fast for syntax and required-doc presence
3. selective enforcement for high-risk repositories

---

## Stale-comment heuristics

Use heuristics to flag likely drift:

- exported symbol changed with no nearby doc update
- timeout/retry/unit constants changed but comments untouched
- error category changed but docs unchanged
- large logic rewrite with no design-note touch

Treat heuristic findings as review prompts, not automatic truth.

---

## AI-assisted documentation guardrails

Use AI to draft and suggest, never as final authority.

Required policy:

1. assign a human owner for final text
2. verify generated claims against actual behavior
3. remove unsupported guarantees
4. forbid fabricated issues/incidents/links
5. apply same review bar to AI-authored and human-authored comments

Accept AI speed; enforce human accountability.

---

## Metrics that matter

Track outcomes tied to safety and maintainability:

- share of public APIs with meaningful contract docs
- count of PRs where behavior changed without doc update
- incidents/postmortems citing misleading comments
- onboarding time to first non-trivial contribution
- review feedback volume on documentation correctness

Avoid vanity metrics such as raw comment count.

---

## Adoption roadmap

### Phase 1: reduce immediate risk

- fix contradictory comments in critical paths
- target concurrency, retries, money flow, and security code first
- add PR checklist items for documentation correctness

### Phase 2: establish baseline

- define minimum interface-doc standard
- standardize implementation comment template
- add CI checks for syntax and required-doc presence

### Phase 3: scale discipline

- add stale-comment heuristics
- introduce AI-assisted advisory checks
- regularly prune outdated TODO/FIXME backlog

Roll out in increments to avoid process overhead spikes.

---

## Team operating defaults

Adopt these defaults:

1. design caller contract early for new APIs
2. update code and docs in the same change
3. review docs for correctness, not grammar only
4. automate easy checks; reserve semantics for reviewers
5. capture cross-module tradeoffs in concise design notes
6. treat stale comments as correctness debt

These defaults keep documentation lean and trustworthy.
