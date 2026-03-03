# Rules and Format

## Table of Contents

- [Why Commit Messages Matter](#why-commit-messages-matter)
- [The Anatomy of a Commit Message](#the-anatomy-of-a-commit-message)
- [The Seven Fundamental Rules](#the-seven-fundamental-rules)

---

## Why Commit Messages Matter

A git log is the long-term memory of a codebase. Poor commit messages create a
subtle form of technical debt: they slow down code reviews, complicate rollbacks,
obscure the project's evolution, and force future developers to re-read diffs
to understand intent. A clean, well-written history is a strategic asset.

Good commit messages:

- Let reviewers understand changes **before** reading the diff.
- Make `git log --oneline` tell a readable story.
- Enable automated changelog generation and semantic versioning.
- Simplify `git bisect`, `git blame`, and `git revert` workflows.

---

## The Anatomy of a Commit Message

Every commit message has two logical parts separated by a blank line:

```
<subject line>
                          ← blank line
<optional body>
                          ← blank line
<optional footer(s)>
```

**Subject line** — a concise summary of what the commit does. This is what
appears in `git log --oneline`, GitHub PR merge commits, and email subject
lines.

**Body** — an optional longer explanation providing context: *what* changed,
*why* it changed, and how it differs from the previous behavior.

**Footer(s)** — optional metadata: issue references, breaking change notices,
co-authors, sign-offs.

---

## The Seven Fundamental Rules

These rules are broadly accepted across the industry, independent of any
specific structured convention.

### 1. Separate the subject from the body with a blank line

Git treats the first line as the summary. Many tools — `git log --oneline`,
`git shortlog`, GitHub's commit list — display only this line. Without the
blank separator, the body bleeds into the subject.

### 2. Limit the subject line to 50 characters

50 characters forces conciseness and signals a well-scoped commit. GitHub
truncates subjects beyond 72 characters. If you struggle to summarize in 50
characters, the commit likely contains too many changes.

### 3. Capitalize the subject line

Write `Fix null pointer in user validation`, not `fix null pointer in user
validation`. This is a simple consistency rule.

> **Note:** When using Conventional Commits, the *type prefix* is lowercase
> (`fix:`, `feat:`), but the *description* after the colon may be either
> capitalized or lowercase — pick one and be consistent.

### 4. Do not end the subject line with a period

Trailing punctuation wastes precious characters in a length-limited line.

```
# Good
Open the pod bay doors

# Bad
Open the pod bay doors.
```

### 5. Use the imperative mood in the subject line

Write the subject as a **command**: "Add", "Fix", "Remove", "Refactor" — not
"Added", "Fixes", "Removing", or "Refactored".

This matches Git's own conventions (`Merge branch 'feature-x'`,
`Revert "Add widget"`). Use this mental test:

> *If applied, this commit will **\<your subject line\>**.*

- "If applied, this commit will **Refactor user authentication service**" ✓
- "If applied, this commit will **Fixed bug with Y**" ✗

### 6. Wrap the body at 72 characters

Git never wraps text automatically. Hard-wrap the body at 72 characters so
that `git log` output (which indents 4 spaces) fits within 80 columns.

### 7. Use the body to explain *what* and *why*, not *how*

The diff shows *how*. The body should answer:

- What was the motivation for this change?
- How does the new behavior differ from the old?
- Why was this approach chosen over alternatives?

**Good body example:**

```
Increase API timeout from 30s to 60s

Customer support reported timeout errors during peak hours. Analysis
showed 95% of requests complete within 45 seconds, but the slowest 5%
need up to 55 seconds. Setting the timeout to 60s provides headroom
without masking genuinely hung requests.
```

**Bad body example:**

```
Iterated through the config hash and changed the timeout value from 30
to 60 in the YAML file.
```
