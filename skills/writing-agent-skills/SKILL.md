---
name: writing-agent-skills
description: Creates, reviews, and iterates on Agent Skills (the open, cross-platform format for extending AI agents). Scaffolds new skill directories, writes SKILL.md files with proper frontmatter and body structure, applies progressive disclosure, reviews existing skills for anti-patterns, and guides testing workflows. Use when the user asks to create a skill, write a SKILL.md, review or improve an existing skill, or structure agent instructions.
category: Agent Tooling
---

# Writing Agent Skills

## Workflow: Creating a new skill

1. **Clarify scope.** Ask what task the skill should teach an agent to perform.
   Identify what context an agent lacks — that gap is the skill's content.
2. **Choose a name.** Lowercase, hyphens only, 1–64 chars. Prefer gerund form
   (e.g., `processing-pdfs` over `pdf-processor`). Must match directory name.
3. **Write the description.** This is the most important text in the skill —
   it controls when the skill activates. Write in third person. State both
   what the skill does AND when to use it. Include keywords matching how
   users phrase requests. Max 1024 chars.
4. **Write the body.** Use imperative form. Include only what the agent cannot
   already know. Keep under 500 lines (~5000 tokens).
5. **Apply progressive disclosure.** If content exceeds 500 lines, move
   detailed information into `references/` files. Link from `SKILL.md` — keep
   all references one level deep (no chains).
6. **Add scripts only if needed.** Include bundled scripts when the same code
   is rewritten repeatedly or deterministic reliability matters.
7. **Validate.** Check against the pre-ship checklist in
   [references/organizing-and-checklist.md](references/organizing-and-checklist.md).

## Workflow: Reviewing an existing skill

1. Read the skill's `SKILL.md` and all bundled files.
2. Check for these common problems:
   - **Weak description** — vague, missing keywords, wrong point-of-view
   - **Kitchen sink** — body over 500 lines without progressive disclosure
   - **Teaching known things** — explaining what the agent already knows
   - **Too many options** — listing alternatives without picking a default
   - **Nested references** — chains deeper than one level from `SKILL.md`
   - **Extraneous files** — README.md, CHANGELOG.md, etc.
   - **Inconsistent terminology** — mixing synonyms for the same concept
3. Propose specific fixes with before/after examples.

## Key rules

- **The context window is a public good.** Every token competes with
  conversation history. Only include what the agent cannot already know.
- **Make choices for the agent.** Pick a default approach; offer alternatives
  only for specific edge cases.
- **Set appropriate degrees of freedom.** Fragile operations need exact
  instructions; open-ended tasks need general direction.
- **Description drives discovery.** "When to use" belongs in the `description`
  frontmatter, not in the body.
- **No extraneous files.** No README, CHANGELOG, INSTALLATION_GUIDE, or
  QUICK_REFERENCE inside a skill.

## Starter template

````markdown
---
name: my-skill-name
description: "[What it does]. [What it produces or transforms]. Use when [specific triggers and contexts]."
---

# [Skill Name]

## Workflow

1. [First step]
2. [Second step]
3. [Third step]

## Examples

**Input:** [example input]
**Output:** [example output]

## Edge cases

- [Edge case 1]: [How to handle it]
- [Edge case 2]: [How to handle it]
````

## Reference material

Consult these for detailed guidance on specific topics:

- **Format & specification**: [references/overview-and-format.md](references/overview-and-format.md)
- **Core principles**: [references/core-principles.md](references/core-principles.md) — context window economy, degrees of freedom, making choices
- **Metadata & body structure**: [references/metadata-and-structure.md](references/metadata-and-structure.md) — name/description rules, body sections, terminology
- **Progressive disclosure**: [references/progressive-disclosure.md](references/progressive-disclosure.md) — three-level loading, reference patterns
- **Bundled resources**: [references/bundled-resources.md](references/bundled-resources.md) — scripts, references, assets guidance
- **Design patterns**: [references/design-patterns.md](references/design-patterns.md) — template, workflow, feedback loop, routing patterns
- **Anti-patterns & testing**: [references/anti-patterns-and-testing.md](references/anti-patterns-and-testing.md) — common mistakes, evaluation-driven development, two-instance workflow
- **Organizing & checklist**: [references/organizing-and-checklist.md](references/organizing-and-checklist.md) — scaling skills, pre-ship checklist, quick-start template
