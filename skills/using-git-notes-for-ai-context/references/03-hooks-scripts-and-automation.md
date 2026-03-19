# Hooks, Scripts, and Automation

## Table of Contents

- [Post-Commit Hook: Auto-Record AI Context](#post-commit-hook-auto-record-ai-context)
- [Prepare-Commit-Msg Hook: Auto-Add Trailers](#prepare-commit-msg-hook-auto-add-trailers)
- [Pre-Push Hook: Auto-Push Notes](#pre-push-hook-auto-push-notes)
- [GitHub Actions: Attach Build Metadata](#github-actions-attach-build-metadata)
- [Shell Aliases](#shell-aliases)
- [Context Harvest Script](#context-harvest-script)

---

## Post-Commit Hook: Auto-Record AI Context

Create `.git/hooks/post-commit` (make executable with `chmod +x`):

```bash
#!/usr/bin/env bash
# Attach AI agent context to commits automatically

COMMIT_SHA=$(git rev-parse HEAD)

# Detect AI agent session via environment variables
if [ -n "$CLAUDE_SESSION_ID" ]; then
    AGENT="claude-code"
    SESSION="$CLAUDE_SESSION_ID"
    MODEL="${CLAUDE_MODEL:-unknown}"
elif [ -n "$CURSOR_SESSION_ID" ]; then
    AGENT="cursor"
    SESSION="$CURSOR_SESSION_ID"
    MODEL="${CURSOR_MODEL:-unknown}"
else
    exit 0  # Not an AI agent session
fi

NOTE=$(cat <<EOF
{"schema":"ai-context/1.0","agent":{"tool":"${AGENT}","model":"${MODEL}","session":"${SESSION}"},"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF
)

git notes --ref=ai/attribution append -m "$NOTE" "$COMMIT_SHA"
```

## Prepare-Commit-Msg Hook: Auto-Add Trailers

Create `.git/hooks/prepare-commit-msg` (make executable):

```bash
#!/usr/bin/env bash
# Add AI-Agent trailer when committing from an AI session

COMMIT_MSG_FILE="$1"
COMMIT_SOURCE="$2"

# Skip merge and squash commits
if [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
    exit 0
fi

if [ -n "$CLAUDE_SESSION_ID" ]; then
    git interpret-trailers \
        --trailer "AI-Agent: claude-code/${CLAUDE_MODEL:-unknown}" \
        --in-place "$COMMIT_MSG_FILE"
fi
```

## Pre-Push Hook: Auto-Push Notes

Create `.git/hooks/pre-push` (make executable):

```bash
#!/usr/bin/env bash
# Push AI-related notes alongside code

REMOTE="$1"

for ref in $(git for-each-ref --format='%(refname)' refs/notes/ai/); do
    git push "$REMOTE" "$ref" 2>/dev/null || true
done
```

## GitHub Actions: Attach Build Metadata

```yaml
name: Attach AI Metadata
on: [push]

jobs:
  annotate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Fetch existing notes
        run: git fetch origin 'refs/notes/*:refs/notes/*' || true

      - name: Attach build metadata
        run: |
          git notes --ref=ci/builds add -m "{
            \"build_id\": \"${{ github.run_id }}\",
            \"workflow\": \"${{ github.workflow }}\",
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
            \"status\": \"success\"
          }" ${{ github.sha }}

      - name: Push notes
        run: git push origin 'refs/notes/*'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Shell Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    # Show AI notes alongside log
    ai-log = log --show-notes=ai/attribution --oneline

    # Show all notes for a commit
    ai-show = notes --ref=ai/attribution show

    # Quick AI attribution note
    ai-note = "!f() { git notes --ref=ai/attribution add -m \"$1\" ${2:-HEAD}; }; f"

    # Show decision context (trailers) for a file
    ai-context = "!f() { git log --format='%h %s%n%(trailers:key=Constraint,key=Directive,key=Rejected,separator=%x0a)%n' -- \"$1\" | head -50; }; f"

    # Find all AI-authored commits
    ai-commits = log --all --format='%(trailers:key=AI-Agent)' --grep='AI-Agent'

[notes]
    # Always display these namespaces in git log
    displayRef = refs/notes/ai/attribution
    displayRef = refs/notes/ai/decisions
```

## Context Harvest Script

Gather all AI context for a file before modifying it — useful as an agent
workflow step:

```bash
#!/usr/bin/env bash
# ai-context-harvest.sh <file-path>

FILE="$1"
echo "=== Active Constraints ==="
git log --format='%(trailers:key=Constraint)' -- "$FILE" | grep -v '^$'

echo ""
echo "=== Directives ==="
git log --format='%(trailers:key=Directive)' -- "$FILE" | grep -v '^$'

echo ""
echo "=== Rejected Approaches ==="
git log --format='%(trailers:key=Rejected)' -- "$FILE" | grep -v '^$'

echo ""
echo "=== AI Attribution Notes ==="
for sha in $(git log --format='%H' -- "$FILE"); do
    NOTE=$(git notes --ref=ai/attribution show "$sha" 2>/dev/null)
    if [ -n "$NOTE" ]; then
        echo "--- Commit: $(git log -1 --format='%h %s' $sha) ---"
        echo "$NOTE"
        echo ""
    fi
done
```
