# Maintenance and Anti-Patterns

## Table of Contents

- [Two-Pass Audit](#two-pass-audit)
- [Agent-Assisted Pruning](#agent-assisted-pruning)
- [Consolidation Patterns](#consolidation-patterns)
- [Pruning Checklist](#pruning-checklist)
- [Anti-Patterns](#anti-patterns)
- [Tool Compatibility](#tool-compatibility)

---

## Two-Pass Audit

**Pass 1 — Relevance:** Read each rule. Ask: "If I deleted this, would the
agent make a mistake?" If no, delete it.

**Pass 2 — Compression:** For surviving rules: "Can this be said in fewer
words?" Rewrite verbose rules into tight one-liners.

---

## Agent-Assisted Pruning

Delegate the audit:

> "Review the current AGENTS.md. Identify rules that are (1) inferable
> from the codebase, (2) duplicated by linter/formatter config, or
> (3) no longer relevant. Propose removals."

Review proposals before accepting — the agent may misjudge which rules
are still needed.

---

## Consolidation Patterns

Before:

```markdown
- Always use named exports
- Never use default exports
- When creating a new module, use named exports
```

After:

```markdown
- ALWAYS use named exports; NEVER default exports
```

---

## Pruning Checklist

For each rule in AGENTS.md, ask these questions. A "yes" to questions 1–5
means **remove or rewrite**.

| # | Question | Action |
|---|---|---|
| 1 | Can the agent infer this from config files? | Remove. |
| 2 | Does a linter/formatter/type checker enforce this? | Remove. |
| 3 | Does this reference a file path that may have moved? | Rewrite to describe the capability, not the path. |
| 4 | Does this describe a state that no longer exists? | Remove immediately. Stale rules produce wrong code. |
| 5 | Has the agent stopped making this mistake without the rule? | Remove. The model may have internalized the pattern. |
| 6 | Can this merge with another near-duplicate rule? | Consolidate into one bullet. |
| 7 | Is this rule more than one sentence? | Compress to one line, or link to a doc. |
| 8 | Would a competent developer figure this out in 30 seconds? | Remove. |
| 9 | Is there only one valid way to do what this rule describes? | Remove. Rules resolve ambiguity. |
| 10 | Is this specific to a single task, not a recurring pattern? | Remove. Task instructions belong in the prompt. |
| 11 | Does a code example in the repo already show this pattern? | Remove. Add a "see X for the pattern" pointer at most. |
| 12 | After all removals, is the file under 150 rules? | If not, repeat with stricter judgment. |

To delegate: "Run through each rule in AGENTS.md against this checklist
and propose removals. For each, state which question it fails and why."

---

## Anti-Patterns

### 1. Auto-generating and committing without pruning

Agent-generated files prioritize comprehensiveness over signal. Most
content is inferable from code.

**Fix:** Bootstrap with a minimal skeleton and grow organically, or
generate a draft and prune to only non-obvious, non-inferable rules.

### 2. Appending without structure

Telling the agent "add this to AGENTS.md" without specifying a section
produces a chronological log.

**Fix:** Always specify the section: "Add this under Conventions." Include
a meta-rule requiring section placement.

### 3. Encoding hasty lessons

Not every correction deserves a rule. One-off or context-specific
corrections pollute the file.

**Fix:** Apply the "second time" rule for agent-initiated additions. Add a
rule only when the same category of mistake appears twice.

### 4. Unbounded growth

A 500-line AGENTS.md is worse than a 50-line one. Past ~150 rules, each
addition degrades all other rules.

**Fix:** Enforce the budget. Include a meta-rule requiring removals when
approaching the limit.

### 5. Documenting file paths

`"Auth logic is in src/auth/handlers.ts"` becomes a lie when the file
moves. Agents follow stale paths confidently.

**Fix:** Describe capabilities: `"Auth uses JWT middleware with refresh
token rotation."` The agent finds the implementation with a search.

### 6. Duplicating linter/formatter rules

Encoding style rules that `eslint` or `prettier` enforce wastes tokens
and creates contradictions when configs change.

**Fix:** Deterministic tools handle deterministic rules. AGENTS.md is for
judgment calls.

### 7. Never reviewing agent-written rules

Agent additions are code changes. Unreviewed additions accumulate
incorrect or low-value rules.

**Fix:** Review AGENTS.md changes in the normal git workflow. `git diff`
the file.

---

## Tool Compatibility

AGENTS.md is natively supported by 20+ tools including GitHub Copilot,
Cursor, Windsurf, Zed, OpenAI Codex CLI, Google Jules, and Gemini CLI.

For tools using their own format (e.g., Claude Code reads `CLAUDE.md`,
Cursor reads `.cursorrules`), create a minimal wrapper that imports
AGENTS.md. Example: a `CLAUDE.md` containing `@AGENTS.md`. Check the
tool's docs for import syntax.
