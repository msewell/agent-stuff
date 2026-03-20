# Bootstrapping and Structure

## Table of Contents

- [Bootstrapping Strategies](#bootstrapping-strategies)
- [What Belongs in AGENTS.md](#what-belongs-in-agentsmd)
- [What to Exclude](#what-to-exclude)
- [The Instruction Budget](#the-instruction-budget)
- [Recommended Skeleton](#recommended-skeleton)
- [Scaling to Hierarchy](#scaling-to-hierarchy)

---

## Bootstrapping Strategies

### Minimal start (recommended)

Start with commands, empty sections, and basic boundaries. The file fills
organically through corrections and discoveries. Use the starter template
at [../assets/starter-agents.md](../assets/starter-agents.md).

### Agent-generated draft

Ask the agent to study the repo and draft initial rules. Then prune
ruthlessly — keep only what would surprise a competent developer reading
the codebase for the first time.

Expect agent-generated drafts to be bloated with inferable content.
Never commit without heavy pruning.

---

## What Belongs in AGENTS.md

Every rule must pass at least one test:

**Ambiguity test:** Multiple valid approaches exist in the codebase, and
the code alone doesn't indicate the preference.

- Pass: "Use V2 PaymentProcessor for all new payment flows; V1 is legacy-only."
- Fail: "This project uses TypeScript." (Agent sees `tsconfig.json`.)

**Cost test:** An agent would need significant exploration (multiple file
reads, git history, cross-module tracing) to figure this out reliably.

- Pass: "Run `make proto` after modifying any `.proto` file."
- Fail: "The test directory is `tests/`." (A single `ls` reveals this.)

### High-value content categories

| Category | Example |
|---|---|
| Canonical patterns | "Use Zod for runtime validation, not io-ts" |
| Migration boundaries | "Auth V1 only for /legacy/* endpoints; new code uses Auth V2" |
| Non-obvious commands | "After editing schemas: `pnpm db:generate && pnpm db:push`" |
| Social conventions | "Prefix WIP commits with `wip:` — CI skips them" |
| Boundary rules | "Never modify `migrations/` directly; use the generator" |
| Error-prone areas | "The `config/` loader is order-sensitive; `base.ts` must load first" |

---

## What to Exclude

Remove content that adds tokens without adding decisions:

- **Directory structure** — agents run `ls` or `tree`
- **README content** — already in the repo
- **Linter-enforced rules** — never send an LLM to do a linter's job
- **Architecture narratives** — prose describing what code structure shows
- **Code snippets** — go stale; use "see `src/auth/middleware.ts` for the pattern"
- **Task-specific instructions** — belong in the prompt, not persistent context
- **Obvious facts** — "This is a React app" when `package.json` lists React

### The staleness rule

Remove stale rules immediately. A stale rule has *negative* value —
agents follow outdated instructions with the same confidence as current
ones. A rule saying "use X library" when X has been replaced by Z actively
produces wrong code.

---

## The Instruction Budget

Frontier reasoning models reliably follow ~150–200 instructions. Smaller
models follow fewer. This is a hard ceiling.

- **Unbounded accumulation degrades performance.** Past the threshold, the
  model ignores or confuses instructions.
- **Every new rule competes with existing rules.** A low-value rule dilutes
  high-value rules.
- **Meta-rules must enforce the ceiling:** "If this file exceeds 150 rules,
  propose consolidations or removals before adding new ones."

### Measuring the budget

Count rules, not lines (a multi-line code block is one rule). Above 150,
audit ruthlessly:

- Can two rules merge into one?
- Are there rules the agent no longer violates? (May be safe to remove.)
- Do any rules duplicate linter/formatter behavior?
- Do any rules describe inferable information?

---

## Recommended Skeleton

```markdown
# AGENTS.md

## Commands
- Install: `<command>`
- Dev server: `<command>`
- Test (unit): `<command>`
- Test (integration): `<command>`
- Lint: `<command>`
- Build: `<command>`
- Type check: `<command>`

## Conventions
- (Code style, patterns, and preferences not enforced by tooling)

## Architecture Decisions
- (Canonical patterns, migration boundaries, "use X not Y" rules)

## Boundaries
- (NEVER/ALWAYS rules for destructive or irreversible actions)

## Gotchas
- (Non-obvious behaviors, order-sensitive operations, common mistakes)

## Self-Improvement Meta-Rules
- (The meta-rules block — see 02-improvement-mechanics.md)
```

### Section routing for new rules

Map corrections and discoveries to sections:

- Learned a build command → Commands
- Corrected on a code pattern → Conventions
- Discovered a deprecated module → Architecture Decisions
- Made a destructive mistake → Boundaries
- Hit a non-obvious bug → Gotchas

Without clear sections, the file devolves into a chronological append log.

---

## Scaling to Hierarchy

When root AGENTS.md approaches 150 rules despite pruning, split into
per-directory files:

```
project/
  AGENTS.md              # Universal rules, commands, boundaries
  frontend/
    AGENTS.md            # React patterns, component conventions
  backend/
    AGENTS.md            # API patterns, database conventions
  infrastructure/
    AGENTS.md            # Deployment, CI/CD rules
```

### How it works

Agents read the nearest AGENTS.md to the file being edited. A file at
`frontend/src/Button.tsx` loads `frontend/AGENTS.md`. Most tools also
load parent AGENTS.md files, giving a cascading effect like `.gitignore`.

### Placement rule

Place each rule in the most specific applicable file:

- Project-wide rules → root AGENTS.md
- Subsystem-specific rules → that subsystem's AGENTS.md

### Linking for deep context

For detailed context that doesn't fit in AGENTS.md, link to dedicated docs:

```markdown
## Architecture Decisions
- Payment flow follows the saga pattern; see `docs/payment-architecture.md`
- Auth uses JWT with refresh tokens; see `docs/auth-flow.md`
```

Link rather than inline — the agent reads linked files only when working
in the relevant area.
