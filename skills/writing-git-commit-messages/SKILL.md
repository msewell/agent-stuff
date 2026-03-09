---
name: writing-git-commit-messages
description: "Writes and reviews git commit messages following Conventional Commits and the seven fundamental rules. Produces well-formatted, atomic, automation-friendly commit messages. Use when writing a commit message, reviewing commit messages, committing code changes, or when the user mentions git commits, commit messages, or changelogs."
category: Writing & Communication
---

# Writing Git Commit Messages

## Workflow

1. **Detect project convention.** Check for `commitlint.config.*`, `.czrc`,
   `.commitlintrc.*`, or commit conventions in `CONTRIBUTING.md`. If found,
   follow that convention. Otherwise, default to Conventional Commits.
2. **Analyze the change.** Read the diff (or context) to understand the scope
   and purpose. Identify whether it's a single logical change or should be
   split into multiple commits.
3. **Choose the type.** Pick the most accurate type: `feat`, `fix`, `docs`,
   `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
4. **Choose the scope** (optional). Use a short noun for the affected area
   (e.g., `auth`, `api`, `parser`). Omit if the change is cross-cutting.
5. **Write the subject line.** Follow the format `type(scope): description`:
   - Imperative mood ("Add", not "Added")
   - ≤50 characters total
   - No trailing period
   - **Lowercase** description after the colon (Conventional Commits standard);
     if the project omits a type prefix, capitalize the first word instead
6. **Write the body** (for non-trivial changes). Explain *what* changed and
   *why* — not *how*. Wrap at 72 characters.
7. **Add footers** as needed: `Fixes #123`, `BREAKING CHANGE: ...`,
   `Co-authored-by: ...`.
8. **When executing `git commit` from the shell, use this method only**
   (to guarantee real newlines and avoid literal `\\n` in history):

   ```bash
   git commit -F- <<'EOF'
   <type>(<scope>): <description>

   <body wrapped at 72 chars>

   <optional footer(s)>
   EOF
   ```

## Format

```
<type>(<scope>): <description>

[body — what & why, wrapped at 72 chars]

[footer(s)]
```

## Breaking changes

Indicate with `!` after the type/scope OR a `BREAKING CHANGE:` footer:

```
feat(api)!: change response format for /users

BREAKING CHANGE: The `email` field is now nested under `contact`.
```

## Common mistakes

- **Vague subjects** (`fix stuff`, `update code`, `WIP`) — always state what
  the commit does.
- **"and" in the subject** — split into separate atomic commits.
- **Wrong type** — don't use `fix` for refactors, `feat` for tests, or
  `chore` as a catch-all.
- **Missing "why"** — the diff shows *how*; the body must explain *why*.
- **Secrets in messages** — never include credentials; git history is permanent.

## Examples

**Simple feature:**
```
feat(parser): add support for nested arrays
```

**Bug fix with context:**
```
fix(auth): prevent session fixation on login

The session ID was not regenerated after successful authentication,
allowing an attacker with a known session ID to hijack the session.

Fixes #1234
```

**Breaking change:**
```
refactor!: drop support for Node 14

BREAKING CHANGE: Node 14 reached EOL in April 2023. The minimum
supported version is now Node 18.
```

## Reference material

- **Fundamental rules & message anatomy**: [references/01-rules-and-format.md](references/01-rules-and-format.md)
- **Conventional Commits spec, types, alternatives & anti-patterns**: [references/02-conventional-commits-and-alternatives.md](references/02-conventional-commits-and-alternatives.md)
- **Enforcement tooling, AI-assisted messages & templates**: [references/03-tooling-and-automation.md](references/03-tooling-and-automation.md)
- **Signed commits, DCO & quick reference**: [references/04-signing-and-dco.md](references/04-signing-and-dco.md)
