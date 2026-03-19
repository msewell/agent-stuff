# Use Cases and Tools

## Table of Contents

- [Decision Context: The Lore Protocol](#decision-context-the-lore-protocol)
- [Agent Session Metadata](#agent-session-metadata)
- [CI/CD Integration](#cicd-integration)
- [Tool Ecosystem](#tool-ecosystem)
- [Tool Comparison](#tool-comparison)

---

## Decision Context: The Lore Protocol

The [Lore protocol](https://arxiv.org/abs/2603.15566) (March 2026) encodes
decision records directly in commit messages using git trailers.

Use repository commit conventions for subject/body text; the example below is
illustrative of trailer fields and decision content:

```
Migrate session store from Redis to PostgreSQL

Redis cluster hit memory ceiling at 64GB; sessions now exceed
cache-appropriate lifetimes (7-day refresh tokens).

Constraint: Zero-downtime migration required — dual-write for 2 weeks
Constraint: Must support atomic session invalidation across devices
Rejected: DynamoDB — latency p99 exceeded 200ms in load test
Rejected: Memcached — no native TTL precision below 1 second
Confidence: high
Scope-risk: wide
Reversibility: migration-needed
Directive: Do not remove Redis client until monitoring confirms zero reads
Directive: Session schema is append-only — never remove columns
Tested: Dual-write consistency verified over 72h soak test
Not-tested: Failover behavior under network partition
Related: a1b2c3d
```

**Lore trailer fields:**

| Trailer | Purpose |
|---------|---------|
| `Constraint:` | Active rules shaping the decision |
| `Rejected:` | Dismissed alternatives with reasoning |
| `Confidence:` | `low` / `medium` / `high` |
| `Scope-risk:` | `narrow` / `moderate` / `wide` |
| `Reversibility:` | `clean` / `migration-needed` / `irreversible` |
| `Directive:` | Forward-looking instructions for future modifiers |
| `Tested:` | What was verified and how |
| `Not-tested:` | What was not verified and why |
| `Related:` | References to related commits |

**Querying Lore context for a file:**

```bash
# Active constraints
git log --format='%(trailers:key=Constraint)' -- src/auth/session.rs

# Rejected approaches (avoid repeating dead ends)
git log --format='%(trailers:key=Rejected)' -- src/auth/session.rs

# Directives from prior authors
git log --format='%(trailers:key=Directive)' -- src/auth/session.rs
```

## Agent Session Metadata

Store conversation context and session identifiers as notes:

```bash
git notes --ref=ai/prompts add -F- HEAD <<'EOF'
## Session: sess_abc123
**Agent:** Claude Code (claude-opus-4-6)
**Task:** "Fix the race condition in session handler"
**Key decisions:**
- Used parking_lot::Mutex instead of std::sync::Mutex for poisoning semantics
- Moved null check inside lock scope after reviewing concurrent access patterns
**Conversation length:** 12 turns
EOF
```

## CI/CD Integration

Attach build and test results directly to commits:

```bash
# Store test results
git notes --ref=ci/tests add -F test-results.json HEAD

# Store SBOM
git notes --ref=ci/sbom add -F sbom.spdx.json HEAD

# Store deployment record
git notes --ref=deployments append -m \
  "Deployed to production by $USER at $(date -u +%Y-%m-%dT%H:%M:%SZ)" HEAD

# Push CI notes to remote
git push origin refs/notes/ci/tests refs/notes/ci/sbom
```

## Tool Ecosystem

### Git AI

Automatically tracks AI-generated code at line-level granularity. Stores
attribution in `refs/notes/ai` using the
[Git AI Standard v3.0.0](https://github.com/git-ai-project/git-ai/blob/main/specs/git_ai_standard_v3.0.0.md).

- **Agents:** Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI,
  OpenCode, Continue, Droid, Junie, Rovo Dev, Amp, Windsurf (12+)
- **Key command:** `git ai blame` — drop-in `git blame` replacement with AI
  attribution per line
- **Rebase survival:** Handles rebase, merge, squash, cherry-pick, amend
  transparently
- **Setup:** `curl -sSL https://usegitai.com/install.sh | bash && git ai init`

Storage format — two-section authorship log in git notes:

```
src/auth/session.rs
  a1b2c3d4e5f6g7h8 42-87,90-95
---
{
  "schema_version": "authorship/3.0.0",
  "base_commit_sha": "abc1234...",
  "prompts": {
    "a1b2c3d4e5f6g7h8": {
      "agent_id": {"tool": "claude-code", "model": "claude-opus-4-6"},
      "total_additions": 46,
      "accepted_lines": 44,
      "overridden_lines": 2
    }
  }
}
```

### Whogitit

Line-level attribution with prompt preservation and three-way diff analysis.
Uses `refs/notes/whogitit`.

- **Key commands:** `whogitit blame <file>`, `whogitit prompt src/main.rs:42`
- **Features:** Three-way diff (pure AI vs. human-modified AI), automatic
  redaction of secrets, Claude Code hooks integration
- **Setup:** `curl -sSL https://github.com/dotsetlabs/whogitit/releases/latest/download/install.sh | sh && whogitit init`

### Blameprompt

Records which AI prompt generated which code — file, line range, model, and
cost. Includes security scanning (10 CWE patterns, prompt injection detection,
secret rotation flagging). Zero files added to working tree.

### Lore CLI

Interactive commit builder and query tool for the Lore protocol.

- `lore context <path>` — full decision summary for a code region
- `lore constraints <path>` — active constraints
- `lore rejected <path>` — previously dismissed alternatives
- `lore directives <path>` — forward-looking warnings
- `lore commit` — interactive Lore-formatted commit builder

### Agent Trace (Cursor)

Open, vendor-neutral standard for recording AI code attribution.
Storage-agnostic (git notes, databases, or files). Model identifiers follow
`provider/model-name` convention.
Spec: [github.com/cursor/agent-trace](https://github.com/cursor/agent-trace)

## Tool Comparison

| Feature | Git AI | Whogitit | Blameprompt | Lore | Agent Trace |
|---------|--------|----------|-------------|------|-------------|
| Storage | Git notes | Git notes | Git notes | Trailers | Agnostic |
| Line-level attribution | Yes | Yes | Yes | No | Yes (spec) |
| Prompt preservation | Yes | Yes | Yes | No | No |
| Decision context | No | No | No | Yes | No |
| Rebase survival | Yes | Partial | Partial | N/A | N/A |
| Security scanning | No | No | Yes | No | No |
| Multi-agent support | 12+ | Claude Code | Manual | Any | Any |
| Open standard | v3.0.0 | No | No | Protocol | v0.1.0 |
