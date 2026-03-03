# Signed Commits and DCO

## Table of Contents

- [Commit Signing (GPG / SSH)](#commit-signing-gpg--ssh)
- [Developer Certificate of Origin (DCO)](#developer-certificate-of-origin-dco)
- [When to Use What](#when-to-use-what)
- [Quick Reference](#quick-reference)

---

## Commit Signing (GPG / SSH)

By default, Git does not verify that a commit was actually authored by the
person named in the `Author` field — anyone can set an arbitrary name and
email. Cryptographic signing solves this by attaching a verifiable signature
to each commit. GitHub, GitLab, and Bitbucket display a "Verified" badge next
to signed commits.

Two signing methods are widely supported:

| Method | Pros | Cons |
| ------ | ---- | ---- |
| **GPG** | Universally supported; strong encryption; granular identity control | Setup can be complex; key management across machines is cumbersome |
| **SSH** | Simple setup if you already use SSH keys for auth; built into Git 2.34+ | Newer — less tooling support in older environments |

**GPG setup:**

```bash
# Generate a key (RSA-4096 minimum for GitHub)
gpg --full-generate-key

# Find your key ID
gpg --list-secret-keys --keyid-format LONG
# Output: sec   rsa4096/3AA5C34371567BD2 ...
#                       ^^^^^^^^^^^^^^^^ this is the key ID

# Configure Git
git config --global user.signingkey 3AA5C34371567BD2
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# Export the public key and add it to GitHub → Settings → SSH and GPG keys
gpg --armor --export 3AA5C34371567BD2
```

**SSH setup** (Git 2.34+):

```bash
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
```

When adding the key to GitHub, select **Signing Key** (not Authentication Key)
from the key type dropdown.

**Verify it works:**

```bash
git commit --allow-empty -S -m "Test signed commit"
git log --show-signature -1
```

**Tip:** Enable
[Vigilant Mode](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
in GitHub settings (Settings → SSH and GPG keys) to flag all *unsigned* commits
as "Unverified", making spoofed commits easy to spot.

---

## Developer Certificate of Origin (DCO)

The [DCO](https://developercertificate.org/) is a lightweight legal mechanism
used by many open-source projects — including the Linux kernel and GitLab — to
certify that a contributor has the right to submit their code under the
project's license. It is not a Contributor License Agreement (CLA); it requires
no separate legal document, just a per-commit attestation.

A contributor signs off by adding a `Signed-off-by` trailer to the commit
message:

```
fix(parser): handle escaped quotes in strings

The parser was dropping backslash-escaped quotes inside string
literals, causing malformed AST nodes.

Signed-off-by: Jane Doe <jane@example.com>
```

Git automates this with the `-s` (or `--signoff`) flag:

```bash
git commit -s -m "fix(parser): handle escaped quotes in strings"
```

This appends `Signed-off-by: Your Name <your@email.com>` using the
values from `user.name` and `user.email` in your Git config.

**Important distinction:** Sign-off (`-s`) and signing (`-S`) are different
things:

| Flag | What it does |
| ---- | ------------ |
| `-s` / `--signoff` | Appends a `Signed-off-by` trailer (DCO attestation) |
| `-S` / `--gpg-sign` | Cryptographically signs the commit (identity verification) |

You can use both together: `git commit -s -S -m "your message"`.

**Fixing a missing sign-off on the last commit:**

```bash
git commit --amend --no-edit --signoff
```

**Enforcement:** Projects typically use a CI check (such as the
[DCO GitHub App](https://probot.github.io/apps/dco/)) that rejects pull
requests containing any commit without a valid `Signed-off-by` line matching
the commit author.

---

## When to Use What

| Scenario | Signing | DCO |
| -------- | ------- | --- |
| Open-source project accepting external contributions | Recommended | Often required |
| Regulated industry (finance, healthcare, government) | Required | Recommended |
| Internal team / private repo | Nice to have | Rarely needed |
| Personal projects | Optional | Unnecessary |

---

## Quick Reference

```
<type>(<scope>): <description>     ← ≤50 chars, imperative, no period
                                    ← blank line
[body]                              ← wrap at 72 chars, explain what & why
                                    ← blank line
[footer(s)]                         ← issue refs, BREAKING CHANGE, etc.
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` ·
`build` · `ci` · `chore`

**Checklist:**

- [ ] Subject is in imperative mood ("Add", not "Added")
- [ ] Subject is ≤ 50 characters
- [ ] Subject does not end with a period
- [ ] Subject is capitalized (after the type prefix, if using one)
- [ ] Blank line separates subject from body
- [ ] Body wraps at 72 characters
- [ ] Body explains *what* and *why*, not *how*
- [ ] Breaking changes are marked with `!` or `BREAKING CHANGE:` footer
- [ ] Related issues are referenced in the body or footer
- [ ] Commit is atomic — one logical change per commit
- [ ] No secrets in the message


