# Tooling and Automation

## Table of Contents

- [commitlint](#commitlint)
- [Husky](#husky)
- [Commitizen](#commitizen)
- [semantic-release](#semantic-release)
- [Squash Merges and PR Titles](#squash-merges-and-pr-titles)
- [AI-Assisted Commit Messages](#ai-assisted-commit-messages)
- [Commit Templates](#commit-templates)

---

## commitlint

[commitlint](https://github.com/conventional-changelog/commitlint) lints
commit messages against a configurable rule set.

**Install:**

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

**Configure** (`commitlint.config.mjs`):

```js
export default { extends: ['@commitlint/config-conventional'] };
```

---

## Husky

[Husky](https://github.com/typicode/husky) manages Git hooks. Pair it with
commitlint to reject non-conforming messages at commit time.

**Install and configure:**

```bash
npm install -D husky
npx husky init
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

Now any `git commit` with a malformed message will be rejected locally before
it ever reaches the remote.

---

## Commitizen

[Commitizen](https://github.com/commitizen/cz-cli) provides an interactive
CLI wizard that walks developers through creating a well-structured message.

**Install:**

```bash
npm install -D commitizen cz-conventional-changelog
```

**Configure** (`package.json`):

```json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "scripts": {
    "commit": "cz"
  }
}
```

Run `npm run commit` instead of `git commit` to use the wizard.

---

## semantic-release

[semantic-release](https://github.com/semantic-release/semantic-release)
automates versioning and publishing based on commit types. It parses your
Conventional Commits history and:

1. Determines the next version number (MAJOR / MINOR / PATCH).
2. Generates release notes and a CHANGELOG.
3. Publishes the package.
4. Creates a Git tag and GitHub release.

**Install:**

```bash
npm install -D semantic-release
```

Configure it in your CI pipeline to run on merges to the main branch.

---

## Squash Merges and PR Titles

When using GitHub's "squash and merge" strategy, the **PR title becomes the
commit message** on the main branch. This means:

- Validate PR titles with the same Conventional Commits rules.
- Use a GitHub Action like
  [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request)
  to enforce this in CI.

---

## AI-Assisted Commit Messages

AI tools can draft commit messages from diffs. This is increasingly common
in modern workflows, but requires human oversight.

### GitHub Copilot

GitHub Copilot generates commit message suggestions in VS Code, Visual Studio,
IntelliJ IDEA, and on github.com. It analyzes the diff and proposes a subject
and body.

**Configuring Copilot for Conventional Commits** (VS Code `settings.json`):

```json
{
  "github.copilot.chat.commitMessageGeneration.instructions": [
    { "text": "Use conventional commit format: type(scope): description" },
    { "text": "Use imperative mood: 'Add feature' not 'Added feature'" },
    { "text": "Keep subject line under 50 characters" },
    { "text": "Use types: feat, fix, docs, style, refactor, perf, test, build, ci, chore" },
    { "text": "Include scope when relevant (e.g., api, ui, auth)" },
    { "text": "Reference issue numbers with # prefix when applicable" }
  ]
}
```

### Best Practices for AI-Generated Messages

1. **Always review before committing.** AI can misidentify the *purpose* of a
   change or use the wrong type prefix.
2. **Edit for "why".** AI describes *what* changed (it reads the diff) but
   rarely captures *why* — the business context, the bug report, the design
   decision. Add this yourself.
3. **Treat AI output as a draft**, not a final message.
4. **Combine with commitlint.** Even if the human doesn't catch a malformed
   AI-generated message, the linter will.

---

## Commit Templates

A `.gitmessage` template reminds you of the format every time you run
`git commit` (without `-m`).

**Create the template** (`~/.gitmessage`):

```

# Subject: imperative, ≤50 chars, no period
#   <type>(<scope>): <description>
# ---- 50 chars -----------------------------------|

# Body: explain *what* and *why*, wrap at 72 chars
# ---- 72 chars --------------------------------------------------------|

# Footer: issue refs, breaking changes, co-authors
#   Fixes #123
#   BREAKING CHANGE: description
#   Co-authored-by: Name <email>
```

**Activate it:**

```bash
# Global (all repos)
git config --global commit.template ~/.gitmessage

# Local (current repo only)
git config commit.template .gitmessage
```

Lines starting with `#` are stripped automatically (the default
`commit.cleanup = strip` setting handles this).
