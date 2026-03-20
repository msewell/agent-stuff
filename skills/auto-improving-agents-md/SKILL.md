---
name: auto-improving-agents-md
description: "Sets up, structures, and auto-improves AGENTS.md files for coding agent projects. Bootstraps new AGENTS.md with self-improvement meta-rules, structures sections for clean rule placement, audits and prunes existing files against an instruction budget, performs end-of-session reflection to capture learnings, and proactively proposes AGENTS.md updates when corrections or conventions are discovered mid-session. Use when setting up AGENTS.md, adding auto-improvement to an existing AGENTS.md, pruning or auditing AGENTS.md, performing end-of-session reflection, or when the user mentions auto-improving, self-improving, or maintaining agent instructions."
category: Agent Tooling
---

# Auto-Improving AGENTS.md

## Two modes of operation

**Setup mode:** The user asks to create, structure, or audit an AGENTS.md file. Follow the setup workflows below.

**Session mode:** The user wants ongoing auto-improvement during the current session. Follow the behavioral directives below — propose AGENTS.md updates when corrected or when discovering undocumented conventions.

## Workflow: Bootstrap a new AGENTS.md

1. Ask for (or discover) the project's build, test, and lint commands.
2. Copy the starter template from [assets/starter-agents.md](assets/starter-agents.md) into the project root as `AGENTS.md`.
3. Fill in the command placeholders.
4. Delete the seed examples under Conventions.
5. Leave all other sections with their comment placeholders — they fill organically.
6. Commit the file.

Do NOT write a comprehensive AGENTS.md upfront.

**Alternative bootstrap:** Study the repo and draft initial rules, then ruthlessly prune — keep only what would surprise a competent developer reading the codebase for the first time.

## Workflow: Add auto-improvement to an existing AGENTS.md

1. Verify the file has clearly named sections (Commands, Conventions, Architecture Decisions, Boundaries, Gotchas). If not, restructure first — see [references/01-bootstrapping-and-structure.md](references/01-bootstrapping-and-structure.md).
2. Append the Self-Improvement Meta-Rules block from [assets/starter-agents.md](assets/starter-agents.md).
3. Verify the file is under 150 rules. If over, prune first.

## Workflow: Prune and audit

1. Count rules (not lines — a multi-line code block is one rule).
2. For each rule, apply the pruning checklist in [references/03-maintenance-and-anti-patterns.md](references/03-maintenance-and-anti-patterns.md).
3. Consolidate near-duplicate rules into single bullets.
4. Compress any multi-sentence rule to one line. If it resists compression, link to a doc instead.
5. Confirm the file is under 150 rules after all removals. If still over, repeat from step 2 with stricter criteria.

**Pruning cadence:** monthly for active projects, on major refactors, or whenever adding a rule would push past 150.

## Behavioral directives: Real-time auto-improvement

### When corrected by the user

1. Apply the correction to the current task.
2. Assess whether the correction reflects a recurring pattern (not a one-off).
3. If recurring, propose a one-line rule for AGENTS.md. Specify the target section.
4. Wait for user approval before writing.

### When discovering undocumented conventions

Propose adding a convention only if it passes the **ambiguity test**: multiple valid approaches exist in the codebase and the code alone doesn't indicate the preference.

### Rule writing format

- One bullet per rule. No paragraphs.
- NEVER/ALWAYS for hard constraints: `"NEVER use default exports"`
- "Prefer X over Y" for soft preferences: `"Prefer composition over inheritance"`
- Lead with the action, not the explanation.
- Include the actual command or code pattern, not a description of it.
- Place in the appropriate existing section. Create a new section only if none fits.

## Behavioral directives: End-of-session reflection

When the user requests reflection (or after completing significant work):

1. Review the session for corrections received, conventions discovered, and retries or mistakes.
2. For each, draft a one-line rule that would have prevented the issue.
3. Check each proposed rule against existing AGENTS.md for duplication.
4. Present the diff before applying.

## Edge cases

- **No clear sections in existing file:** Restructure into the recommended skeleton before adding meta-rules. See [references/01-bootstrapping-and-structure.md](references/01-bootstrapping-and-structure.md).
- **File exceeds 150 rules:** Prune before adding any new rules.
- **Tool doesn't read AGENTS.md natively:** Create a minimal wrapper file that imports it (e.g., `CLAUDE.md` containing `@AGENTS.md`). Check the tool's docs for import syntax.
- **Rule conflicts with linter/formatter:** Remove the AGENTS.md rule. Deterministic tools always win.
- **Root file at 150 despite pruning:** Split into per-directory hierarchy. See [references/01-bootstrapping-and-structure.md](references/01-bootstrapping-and-structure.md).

## Reference material

- **Bootstrapping, structure, and hierarchy:** [references/01-bootstrapping-and-structure.md](references/01-bootstrapping-and-structure.md)
- **Auto-improvement mechanics and meta-rules:** [references/02-improvement-mechanics.md](references/02-improvement-mechanics.md)
- **Maintenance, pruning checklist, and anti-patterns:** [references/03-maintenance-and-anti-patterns.md](references/03-maintenance-and-anti-patterns.md)
- **Starter template:** [assets/starter-agents.md](assets/starter-agents.md)
