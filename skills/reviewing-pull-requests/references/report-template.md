# Report Template

Use this structure for every review report. Omit sections that have zero
items (except Summary and Verdict, which are always required).

## Table of Contents

- [Template](#template)
- [Example: Good Findings](#example-good-findings)
- [Example: Bad Findings](#example-bad-findings-avoid-these-patterns)
- [Verdict Decision Guide](#verdict-decision-guide)

---

## Template

```markdown
## PR Review: #<number> — <title>

**Author:** <login> | **Base:** <base> ← <head> | **Changed:** <N> files (+<add>/-<del>)

### Summary

<One or two sentences: what the PR does and whether it achieves its goal.>

### Verdict: <✅ APPROVE | ⚠️ APPROVE WITH COMMENTS | ❌ REQUEST CHANGES>

<One sentence justifying the verdict.>

### Blocking Findings

<If none, omit this section entirely.>

1. **[B] <Title>** — `<file>:<line>`
   - **Problem:** <What's wrong>
   - **Impact:** <Why it matters>
   - **Fix:** <Concrete suggestion or code example>

### Suggestions

1. **[S] <Title>** — `<file>:<line>`
   <What to change and why it's better.>

### Nits

- **[N]** `<file>:<line>` — <One sentence.>

### Praise

- **[P]** `<file>:<line>` — <What's good and why.>

### Local Checks

| Check | Command | Result |
|-------|---------|--------|
| Lint | `<command>` | ✅ Pass / ❌ Fail / ⏭️ Skipped |
| Type-check | `<command>` | ✅ Pass / ❌ Fail / ⏭️ Skipped |
| Tests | `<command>` | ✅ Pass / ❌ Fail / ⏭️ Skipped |

### CI Status

| Check | Status |
|-------|--------|
| <name> | ✅ / ❌ / ⏳ |

### Context

- **Linked issues:** #<N> <title>, ...
- **Existing reviews:** <N> approvals, <N> change requests
- **PR template compliance:** <Yes/No — did the author fill in the template?>
```

---

## Example: Good Findings

```markdown
### Blocking Findings

1. **[B] SQL injection in user search** — `src/api/users.ts:47`
   - **Problem:** User-supplied `query` parameter is interpolated directly
     into the SQL string via template literal.
   - **Impact:** An attacker can extract or modify arbitrary database
     records.
   - **Fix:** Use a parameterized query:
     ```typescript
     db.query('SELECT * FROM users WHERE name LIKE $1', [`%${query}%`])
     ```

### Suggestions

1. **[S] Missing error handling on file upload** — `src/upload.ts:82`
   The `writeFile` call has no try/catch. If the disk is full or the path
   is invalid, the request will hang. Wrap in try/catch and return a 500
   with an actionable error message.

### Nits

- **[N]** `src/utils/format.ts:12` — `formatDate` is unused after the
  refactor in this PR. Consider removing it.

### Praise

- **[P]** `src/api/auth.ts:30-55` — Clean separation of token validation
  from session management. The guard clause pattern makes the happy path
  easy to follow.
```

---

## Example: Bad Findings (avoid these patterns)

```markdown
### BAD — Vague finding without location
1. **[B] Security issue**
   There might be a security problem in the authentication code.

### BAD — Flagging style when linter exists
1. **[S] Use single quotes** — `src/index.ts:5`
   The project should use single quotes instead of double quotes.
   (Note: Prettier is configured — this is the linter's job.)

### BAD — Flagging code outside the diff
1. **[S] Legacy function is poorly named** — `src/legacy/old.ts:200`
   This function was not changed in the PR.

### BAD — Inventing findings when the code is fine
1. **[S] Consider using a different algorithm**
   The current approach works correctly but a different algorithm might
   be theoretically faster. (No evidence of a performance problem.)
```

---

## Verdict Decision Guide

| Situation | Verdict |
|-----------|---------|
| No findings, code is clean | ✅ Approve |
| Only nits and/or praise | ✅ Approve |
| Suggestions but no blockers | ⚠️ Approve with comments |
| One or more blocking findings | ❌ Request changes |
| CI is failing on changed code | ❌ Request changes |
| PR description is empty (only finding) | ⚠️ Approve with comments |
| PR is a draft | Use the appropriate verdict — draft status does not change the bar |
