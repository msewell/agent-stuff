# Core Concepts and Namespaces

## Table of Contents

- [Git Notes](#git-notes)
- [Git Trailers](#git-trailers)
- [Namespace Scheme](#namespace-scheme)
- [Structured Content Format](#structured-content-format)

---

## Git Notes

Notes are metadata blobs attached to git objects (usually commits) without
modifying them. Each note ref (e.g., `refs/notes/commits`) points to a commit
whose tree maps annotated object SHAs to blob content.

```bash
# Add a note to HEAD
git notes add -m "AI-generated via Claude Code" HEAD

# Add a note under a namespace
git notes --ref=ai/attribution add -m '{"agent":"claude-code"}' HEAD

# Add note from file
git notes --ref=ai/attribution add -F attribution.json HEAD

# Append to existing note (instead of replacing)
git notes --ref=ai/attribution append -m "additional context" HEAD

# View a note
git notes --ref=ai/attribution show HEAD

# View notes in log
git log --show-notes=ai/attribution

# Show ALL notes in log
git log --show-notes='*'

# Remove a note
git notes --ref=ai/attribution remove HEAD
```

**Key properties:**

- Each object has **one note per namespace** — use `append` to add more, or
  use separate namespaces for different metadata types.
- Notes are stored as standard git objects and participate in GC and packing.
- Notes are **not pushed or fetched by default** — require explicit refspec
  configuration.
- Notes can contain arbitrary content: plain text, JSON, YAML, or binary data.

## Git Trailers

Trailers are structured key-value pairs at the end of commit messages,
separated from the body by a blank line:

```
Fix race condition in session handler

The mutex was acquired after the null check, allowing a window
where concurrent requests could both pass the guard.

Constraint: Must remain backward-compatible with v2 API clients
Rejected: Lock-free approach — benchmarked 3x slower under contention
Confidence: high
Directive: If modifying this lock, re-run bench/session_contention.sh
AI-Agent: claude-code/claude-opus-4-6
```

```bash
# Add trailers at commit time
git commit -m "Fix race condition" --trailer "AI-Agent: claude-code/claude-opus-4-6"

# Parse trailers from a commit
git log -1 --format='%(trailers)' HEAD

# Filter by specific trailer key
git log --format='%(trailers:key=AI-Agent)' --all

# Parse trailers via pipe
git log -1 --format=%B HEAD | git interpret-trailers --parse

# Configure custom trailer behavior
git config trailer.ai-agent.key "AI-Agent"
git config trailer.ai-agent.ifExists "addIfDifferent"
```

**Key properties:**

- Trailers are **part of the commit** — they change the SHA if modified after
  the fact.
- Natively parseable via `git log --format='%(trailers)'` and
  `git interpret-trailers`.
- Work with every git tool and hosting platform.
- Additive: unknown keys are ignored, so new trailers can be introduced
  without breaking compatibility.

## Namespace Scheme

Use separate namespaces to isolate metadata types. The `--ref` flag specifies
the namespace, mapping to `refs/notes/<name>`.

| Namespace | Ref | Purpose |
|-----------|-----|---------|
| `ai/attribution` | `refs/notes/ai/attribution` | AI authorship metadata |
| `ai/prompts` | `refs/notes/ai/prompts` | Prompts and conversation excerpts |
| `ai/decisions` | `refs/notes/ai/decisions` | Decision context and reasoning |
| `ai/reviews` | `refs/notes/ai/reviews` | AI-assisted code review annotations |
| `ci/tests` | `refs/notes/ci/tests` | Test results and coverage data |
| `ci/builds` | `refs/notes/ci/builds` | Build metadata |
| `ci/sbom` | `refs/notes/ci/sbom` | Software bill of materials |
| `deployments` | `refs/notes/deployments` | Deployment records |

**Namespace conflict warning:** Git refs cannot be both a leaf and a directory.
A bare `refs/notes/ai` ref **cannot coexist** with `refs/notes/ai/prompts`.
Always use sub-paths (e.g., `ai/attribution`) rather than a bare parent name
when planning nested namespaces. **Note:** Git AI uses the bare
`refs/notes/ai` ref. When using Git AI, replace the `ai/` prefix with a
non-conflicting prefix (e.g., `dev/prompts`, `dev/decisions`).

## Structured Content Format

Use JSON for machine-readable notes, with a schema version for forward
compatibility:

```json
{
  "schema": "ai-context/1.0",
  "agent": {
    "tool": "claude-code",
    "model": "claude-opus-4-6",
    "session_id": "sess_abc123"
  },
  "attribution": {
    "type": "ai",
    "human_author": "developer@example.com",
    "confidence": "high"
  },
  "files": [
    {
      "path": "src/auth/session.rs",
      "lines": "42-87",
      "contributor": "ai"
    },
    {
      "path": "src/auth/session.rs",
      "lines": "88-95",
      "contributor": "mixed"
    }
  ],
  "prompt_summary": "Fix race condition in session handler mutex acquisition"
}
```

Always include `schema` with a version string so parsers can handle format
evolution.

**Contributor types** (per the Agent Trace spec):

| Type | Meaning |
|------|---------|
| `human` | Direct human authorship |
| `ai` | AI-generated code |
| `mixed` | Human-edited AI output or AI-edited human code |
| `unknown` | Indeterminate origin |
