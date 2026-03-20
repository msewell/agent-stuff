# Improvement Mechanics

## Table of Contents

- [The Compound Learning Loop](#the-compound-learning-loop)
- [Developer-Triggered Updates](#developer-triggered-updates)
- [Agent-Initiated Updates](#agent-initiated-updates)
- [End-of-Session Reflection](#end-of-session-reflection)
- [The Meta-Rules Block](#the-meta-rules-block)

---

## The Compound Learning Loop

Auto-improvement creates a feedback loop:

```
Session N: Agent makes mistake X
  → User corrects agent
  → Agent adds rule preventing X to AGENTS.md
  → Git commit captures the change

Session N+1: Agent reads AGENTS.md at startup
  → Rule prevents mistake X
  → Agent makes new mistake Y (higher-level)
  → Cycle repeats
```

Early sessions fix basic mistakes (wrong test commands, style violations).
Later sessions compound into architectural trade-offs and nuanced conventions.

---

## Developer-Triggered Updates

When the user corrects the agent and knows the rule is worth persisting:

> "Add to AGENTS.md under Conventions: always use named exports, never
> default exports."

Always specify *where* in the file to add the rule (which section), not
just *what*. This prevents the file from becoming an unstructured append
log.

For developer-triggered updates, the "second time" rule does not apply —
the user already knows the convention is real.

---

## Agent-Initiated Updates

With meta-rules in place, proactively propose updates when:

- Corrected and recognizing a pattern worth documenting
- Discovering an undocumented convention by reading the codebase
- Encountering the same ambiguity multiple times in a session

Always propose the update inline and wait for approval. AGENTS.md is in
git — changes are reviewed like any other code change.

---

## End-of-Session Reflection

After completing significant work, the user may trigger reflection:

> "Review this session. Identify corrections you received, conventions you
> discovered, or mistakes you made. Propose updates to AGENTS.md for each.
> Show me the diff before applying."

Targeted variant:

> "Search this session for any time I corrected you or you had to retry
> something. For each, propose a one-line rule for AGENTS.md that would
> have prevented the issue."

### Optimize reflection for

- **Pattern extraction:** Identify patterns across multiple corrections, not
  just individual mistakes.
- **Abstraction level:** Write "always use the V2 API for payments" not
  "use PaymentProcessorV2 in checkout.ts."
- **Deduplication:** Check every proposed rule against existing AGENTS.md content.

### Reflection frequency

- After any session where the user was corrected more than once
- After the agent's first session on a new codebase area
- Weekly for daily agent use on the same project
- Skip trivial sessions — not every interaction produces learnings worth
  persisting

---

## The Meta-Rules Block

The centerpiece of auto-improvement. Add this block to AGENTS.md to teach
the agent how to modify the file properly.

Copy the full `## Self-Improvement Meta-Rules` section from
[../assets/starter-agents.md](../assets/starter-agents.md). It contains
four subsections:

- **When to Add a Rule** — second-time rule, undocumented conventions, ambiguity
- **When NOT to Add a Rule** — inferable, linter-enforced, task-specific
- **How to Write Rules** — one bullet per rule, NEVER/ALWAYS, lead with action
- **Anti-Bloat Directives** — budget enforcement, capabilities over paths, placement
