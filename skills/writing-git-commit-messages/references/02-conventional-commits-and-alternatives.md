# Conventional Commits and Alternatives

## Table of Contents

- [Conventional Commits (Recommended)](#conventional-commits-recommended)
  - [Format](#format)
  - [Core Types](#core-types)
  - [Scopes](#scopes)
  - [Breaking Changes](#breaking-changes)
  - [Examples](#examples)
  - [Why Conventional Commits?](#why-conventional-commits)
- [Alternative Conventions](#alternative-conventions)
  - [Freeform (Chris Beams' 7 Rules)](#freeform-chris-beams-7-rules)
  - [Gitmoji](#gitmoji)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Conventional Commits (Recommended)

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) is a
lightweight specification that adds a structured type prefix to the subject
line. It originated from the
[Angular contributing guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)
and has become the de facto standard, especially in the npm ecosystem where
~94% of popular packages use it.

### Format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Core Types

| Type       | Purpose                                            | SemVer Impact |
| ---------- | -------------------------------------------------- | ------------- |
| `feat`     | A new feature                                      | MINOR         |
| `fix`      | A bug fix                                          | PATCH         |
| `docs`     | Documentation-only changes                         | —             |
| `style`    | Formatting, whitespace, semicolons (no logic)      | —             |
| `refactor` | Code restructuring (neither fix nor feature)       | —             |
| `perf`     | Performance improvement                            | PATCH         |
| `test`     | Adding or correcting tests                         | —             |
| `build`    | Build system or external dependency changes        | —             |
| `ci`       | CI configuration and scripts                       | —             |
| `chore`    | Maintenance tasks (no production code change)      | —             |

### Scopes

A scope is an optional noun in parentheses that describes the section of the
codebase affected:

```
feat(auth): add Google OAuth2 integration
fix(api): resolve memory leak in user service
docs(readme): update installation instructions
```

Scopes are most useful in monorepos or larger projects. Document your valid
scopes in `CONTRIBUTING.md` and enforce them via tooling to prevent drift
(e.g., `auth` vs. `authentication` vs. `login`).

### Breaking Changes

Breaking changes MUST be indicated in one of two ways:

1. **Exclamation mark in the type/scope prefix:**
   ```
   feat(users)!: change user API response format
   ```

2. **`BREAKING CHANGE:` footer:**
   ```
   feat(users): change user API response format

   BREAKING CHANGE: The `email` field is now nested under `contact`.
   Consumers must update their parsers.
   ```

Both correlate with a **MAJOR** version bump in SemVer.

### Examples

```
feat(parser): add ability to parse arrays
```

```
fix(auth): prevent session fixation on login

The session ID was not regenerated after successful authentication,
allowing an attacker with a known session ID to hijack the session.

Fixes #1234
```

```
refactor!: drop support for Node 14

BREAKING CHANGE: Node 14 reached EOL in April 2023. The minimum
supported version is now Node 18.

Reviewed-by: Jane Doe
```

### Why Conventional Commits?

- **Automated changelogs** — tools parse commit types to generate CHANGELOG.md.
- **Semantic versioning** — `feat` → MINOR, `fix` → PATCH, `BREAKING CHANGE` → MAJOR.
- **Clearer communication** — teammates instantly see the nature of each commit.
- **CI/CD triggers** — pipelines can react to commit types (e.g., skip deploy for `docs`).
- **Easier onboarding** — a consistent format lowers the barrier for new contributors.

---

## Alternative Conventions

While Conventional Commits is recommended, two other conventions are worth
knowing about.

### Freeform (Chris Beams' 7 Rules)

The original
["How to Write a Git Commit Message"](https://cbea.ms/git-commit/) article by
Chris Beams. No structured type prefix — just the seven fundamental rules.

**When to use:** Small teams or personal projects where automation (changelog
generation, auto-versioning) is not needed and simplicity is preferred.

### Gitmoji

[Gitmoji](https://gitmoji.dev) prepends an emoji to categorize commits
visually:

```
🐛 Fix null pointer in user validation
✨ Add dark mode toggle
♻️ Refactor database connection pooling
```

**Pros:** Visually scannable in GitHub's UI; encourages atomic commits.
**Cons:** Harder to parse with automated tools; emoji rendering varies across
terminals; the full gitmoji list is large (~70 emojis) and has a learning
curve.

**When to use:** Teams that value visual flair and primarily browse history in
web UIs rather than terminals.

---

## Anti-Patterns to Avoid

### Vague messages

```
# Bad
fix stuff
update code
WIP
misc changes
```

Every commit should clearly state what it does. If you can't summarize the
change, the commit is likely too large.

### The word "and" in the subject

If you're writing "and" in the subject, you're probably bundling unrelated
changes. Split them into separate, atomic commits.

```
# Bad — two unrelated changes
Fix login bug and update footer styles

# Good — two separate commits
fix(auth): prevent redirect loop on expired session
style(footer): align copyright text to center
```

### Giant, unfocused commits

Apply the **Single Responsibility Principle** to commits. Each commit should
represent one logical change. This makes `git bisect`, `git revert`, and code
review dramatically easier.

### Overusing `git commit -m`

The `-m` flag discourages writing a body. For non-trivial changes, drop into
your editor (just run `git commit`) so you can write a proper subject and body.

### Wrong type labels

- Don't use `fix` for refactors — use `refactor`.
- Don't use `feat` for test additions — use `test`.
- Don't use `chore` as a catch-all — be precise.

### Secrets in commit messages

Never include passwords, API keys, tokens, or other credentials in commit
messages. Git history is permanent and often public.
