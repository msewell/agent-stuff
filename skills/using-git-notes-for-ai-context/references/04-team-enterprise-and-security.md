# Team, Enterprise, and Security

## Table of Contents

- [Remote Sync Configuration](#remote-sync-configuration)
- [Team Onboarding Script](#team-onboarding-script)
- [Merge Strategies](#merge-strategies)
- [Namespace Governance](#namespace-governance)
- [Enterprise Compliance](#enterprise-compliance)
- [Generating Compliance Reports](#generating-compliance-reports)
- [Retention Policies](#retention-policies)
- [Redaction Before Storage](#redaction-before-storage)
- [Cryptographic Signing](#cryptographic-signing)
- [Prompt Injection in Notes](#prompt-injection-in-notes)
- [Limitations and Workarounds](#limitations-and-workarounds)

---

## Remote Sync Configuration

Notes are invisible to `git push` and `git fetch` by default. Configure
the repository to sync them.

**Per-repository** (`.git/config`):

```ini
[remote "origin"]
    url = git@github.com:org/repo.git
    fetch = +refs/heads/*:refs/remotes/origin/*
    fetch = +refs/notes/*:refs/notes/*
    push = +refs/notes/*:refs/notes/*
```

**Via commands:**

```bash
git config --add remote.origin.fetch '+refs/notes/*:refs/notes/*'
git config --add remote.origin.push '+refs/notes/*:refs/notes/*'
```

**Global** (`~/.gitconfig`): display all notes in `git log`:

```ini
[notes]
    displayRef = refs/notes/*
```

## Team Onboarding Script

Include in the repository root as `setup-git-notes.sh`:

```bash
#!/usr/bin/env bash
# Run once after cloning

echo "Configuring git notes sync..."
git config --add remote.origin.fetch '+refs/notes/*:refs/notes/*'
git config --add remote.origin.push '+refs/notes/*:refs/notes/*'

echo "Fetching existing notes..."
git fetch origin 'refs/notes/*:refs/notes/*' 2>/dev/null || echo "(no remote notes found)"

echo "Configuring note display..."
git config --add notes.displayRef 'refs/notes/ai/attribution'
git config --add notes.displayRef 'refs/notes/ai/decisions'

echo "Configuring rebase survival..."
git config --add notes.rewriteRef 'refs/notes/ai/attribution'
git config --add notes.rewriteRef 'refs/notes/ai/prompts'
git config --add notes.rewriteRef 'refs/notes/ai/decisions'
git config notes.rewrite.rebase true
git config notes.rewrite.amend true

echo "Done. AI context notes will now sync and survive rebases."
```

## Merge Strategies

When multiple team members or CI jobs add notes to the same commits, configure
a merge strategy per namespace:

```bash
git config notes.mergeStrategy cat_sort_uniq                    # Global default
git config notes.ai/attribution.mergeStrategy cat_sort_uniq     # Deduplicate
git config notes.ci/tests.mergeStrategy theirs                  # Latest wins
git config notes.deployments.mergeStrategy union                # Keep all
```

| Strategy | Behavior | Best for |
|----------|----------|----------|
| `manual` | Conflict resolution prompt | Critical metadata |
| `ours` | Local version wins | Local is authoritative |
| `theirs` | Remote version wins | CI results (latest wins) |
| `union` | Concatenate both | Append-only logs |
| `cat_sort_uniq` | Concat, sort, deduplicate | Line-based metadata |

**Handling concurrent CI note pushes** (retry loop):

```bash
MAX_RETRIES=3
for i in $(seq 1 $MAX_RETRIES); do
    git fetch origin refs/notes/ci/tests:refs/notes/ci/tests 2>/dev/null
    git notes --ref=ci/tests merge --strategy=theirs origin/refs/notes/ci/tests 2>/dev/null
    git notes --ref=ci/tests add -f -F test-results.json HEAD
    git push origin refs/notes/ci/tests && break
    sleep 1
done
```

## Namespace Governance

Document conventions in `CONTRIBUTING.md` or `docs/git-notes-conventions.md`:

```markdown
## Git Notes Conventions

| Namespace | Owner | Format | Merge Strategy |
|-----------|-------|--------|---------------|
| `ai/attribution` | AI tooling (automated) | JSON (ai-context/1.0) | cat_sort_uniq |
| `ai/prompts` | Developers (manual) | Markdown | union |
| `ci/tests` | CI pipeline | JSON | theirs |
| `deployments` | Deploy pipeline | Plain text | union |

Do not create ad-hoc namespaces. Propose new ones via team RFC.
```

## Enterprise Compliance

The EU AI Act (fully enforceable August 2026) requires data provenance,
immutable audit trails, versioned technical documentation, and transparency
for AI-generated content. Non-compliance penalties reach **€35M or 7% of
global turnover**.

Git notes provide a natural compliance mechanism: versioned, immutable
(append-only in practice), auditable records tied directly to code artifacts.

Map note namespaces to compliance requirements:

| Requirement | Git mechanism |
|-------------|--------------|
| AI attribution / provenance | `refs/notes/ai/attribution` |
| Prompt records | `refs/notes/ai/prompts` |
| Test evidence | `refs/notes/ci/tests` |
| Software bill of materials | `refs/notes/ci/sbom` |
| Deployment records | `refs/notes/deployments` |
| Decision trails | Commit trailers (Lore protocol) |

## Generating Compliance Reports

```bash
#!/usr/bin/env bash
# ai-audit-report.sh — AI authorship summary

echo "# AI Code Authorship Report"
echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

TOTAL_COMMITS=$(git rev-list --count HEAD)
AI_COMMITS=0

for sha in $(git rev-list HEAD); do
    if git notes --ref=ai/attribution show "$sha" 2>/dev/null | grep -q '"tool"'; then
        AI_COMMITS=$((AI_COMMITS + 1))
    fi
done

echo "Total commits: $TOTAL_COMMITS"
echo "Commits with AI attribution: $AI_COMMITS"
if [ "$TOTAL_COMMITS" -gt 0 ]; then
    echo "AI involvement: $(( AI_COMMITS * 100 / TOTAL_COMMITS ))%"
fi
echo ""

echo "## Models Used"
for sha in $(git rev-list HEAD); do
    git notes --ref=ai/attribution show "$sha" 2>/dev/null
done | grep -o '"model":"[^"]*"' | sort | uniq -c | sort -rn

echo ""
echo "## Agents Used"
for sha in $(git rev-list HEAD); do
    git notes --ref=ai/attribution show "$sha" 2>/dev/null
done | grep -o '"tool":"[^"]*"' | sort | uniq -c | sort -rn
```

## Retention Policies

Retain attribution notes (`ai/attribution`) indefinitely for audit. Purge
verbose prompt logs (`ai/prompts`) per data retention policy:

```bash
#!/usr/bin/env bash
# Purge prompt notes older than retention period (default: 2 years)
RETENTION_DAYS="${1:-730}"
CUTOFF=$(date -v-${RETENTION_DAYS}d +%s 2>/dev/null || \
         date -d "-${RETENTION_DAYS} days" +%s)

for sha in $(git rev-list HEAD); do
    COMMIT_DATE=$(git log -1 --format='%ct' "$sha")
    if [ "$COMMIT_DATE" -lt "$CUTOFF" ]; then
        git notes --ref=ai/prompts remove "$sha" 2>/dev/null
    fi
done
echo "Purged prompt notes older than $RETENTION_DAYS days."
```

## Redaction Before Storage

**Always redact before writing notes, not after.** Once pushed, data exists in
every clone and reflog.

```bash
#!/usr/bin/env bash
# redact-prompt.sh — Strip sensitive patterns before storing as git note

sed -E \
    -e 's/[A-Za-z0-9+\/]{40,}=[=]?/[REDACTED_KEY]/g' \
    -e 's/sk-[A-Za-z0-9]{20,}/[REDACTED_API_KEY]/g' \
    -e 's/ghp_[A-Za-z0-9]{36,}/[REDACTED_GH_TOKEN]/g' \
    -e 's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/[REDACTED_EMAIL]/g' \
    -e 's/[0-9]{3}-[0-9]{2}-[0-9]{4}/[REDACTED_SSN]/g' \
    -e 's/password[":= ]+[^ ,"]+/password=[REDACTED]/gi' \
    ${1:+"$1"}
```

Use in hooks: `REDACTED=$(echo "$PROMPT_TEXT" | ./scripts/redact-prompt.sh)`

Tools with built-in redaction: **Whogitit** (configurable patterns in
`.whogitit.toml`), **Blameprompt** (secret rotation flagging).

## Cryptographic Signing

Git notes commits are **unsigned** even with `commit.gpgsign = true`. For
tamper-evident audit trails, sign the note payload before storing, using SSH
keys (simpler than GPG, natively supported since Git 2.34+):

1. Generate a signing key: `ssh-keygen -t ed25519 -f ~/.ssh/git-notes-signing -N ""`
2. Collect public keys into a shared `allowed-signers` file in the repo
3. Sign payloads in the post-commit hook before writing to notes
4. Verify with `ssh-keygen -Y verify`

**Signed note format:**

```
{"schema":"ai-context/1.0","agent":{"tool":"claude-code"},...}
--- SIGNATURE ---
-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTk...
-----END SSH SIGNATURE-----
```

## Prompt Injection in Notes

If agents consume git notes as context, adversarial notes could contain prompt
injection. Mitigations:

- Treat note content as **untrusted input** when feeding to agents
- Validate note schema before consumption
- Wrap note content in explicit delimiters in agent prompts
- Monitor for anomalous note content in CI

## Limitations and Workarounds

| Limitation | Workaround |
|-----------|-----------|
| Not synced by default | Add fetch/push refspecs (see §Remote Sync) |
| No GitHub/GitLab UI display | Use CLI tooling and aliases |
| One note per namespace per object | Use `append` or sub-namespaces |
| Orphaned on rebase | Configure `notes.rewriteRef` + `notes.rewrite.rebase true` |
| No access control beyond repo | Separate sensitive data into restricted repos |
| Merge conflicts under concurrency | Merge strategy + retry loop (see §Merge Strategies) |
| 1MB note limit on GitHub | Compress, summarize, or split across namespaces |
| No IDE support | Use CLI aliases |
| Ref name conflicts | Always use sub-paths, never bare parent names |

**Rebase survival** is the most common pain point. The built-in fix:

```bash
git config --add notes.rewriteRef "refs/notes/ai/attribution"
git config --add notes.rewriteRef "refs/notes/ai/prompts"
git config notes.rewrite.rebase true
git config notes.rewrite.amend true
```

Git AI handles this transparently for attribution notes. Trailers don't have
this problem — they travel with the commit through rebases.
