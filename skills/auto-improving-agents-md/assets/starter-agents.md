# AGENTS.md

## Commands
- Install: `<package-manager> install`
- Dev server: `<dev-command>`
- Test (unit): `<test-command>`
- Test (all): `<full-test-command>`
- Lint: `<lint-command>`
- Type check: `<typecheck-command>`
- Build: `<build-command>`

## Conventions
<!-- Rules added here by corrections and discoveries. Seed examples below. -->
<!-- Delete the examples once you have real rules.                          -->
- Prefer named exports; NEVER use default exports
- Use function declarations for top-level functions, not arrow functions

## Architecture Decisions
<!-- Canonical patterns, migration boundaries, "use X not Y" rules. -->

## Boundaries
- NEVER commit without explicit instruction
- NEVER run destructive database operations (DROP, TRUNCATE, DELETE without WHERE)
- NEVER modify CI/CD pipeline files without asking
- NEVER force-push
- Ask before installing or removing dependencies

## Gotchas
<!-- Non-obvious behaviors, order-sensitive operations, footguns. -->

## Self-Improvement Meta-Rules

You are encouraged to update this AGENTS.md file when you discover new conventions,
receive corrections, or identify recurring patterns.

### When to Add a Rule
- When corrected for the same kind of mistake twice
- When you discover a convention not yet documented here
- When an ambiguity could lead future sessions astray

### When NOT to Add a Rule
- When the information is trivially inferable from the code (package.json, tsconfig, etc.)
- When a linter or formatter already enforces it
- When the rule is specific to a single task, not a recurring pattern

### How to Write Rules
- One bullet per rule. No paragraphs.
- NEVER/ALWAYS for hard constraints: "NEVER use default exports"
- "Prefer X over Y" for soft preferences: "Prefer composition over inheritance"
- Lead with the action, not the explanation
- Include the actual command or code pattern, not a description of it
- Place in the appropriate existing section; create a new section only if none fits

### Anti-Bloat Directives
- Don't add rules inferable from project config files
- Don't add negative examples for obvious rules
- Don't expand a one-line rule into multiple lines "for clarity"
- If this file exceeds 150 rules, propose consolidations or removals first
- Describe capabilities ("auth uses JWT"), not file paths ("auth is in src/auth/index.ts")
- Place rules in the AGENTS.md closest to the code they apply to;
  only add to the root file if the rule is truly project-wide
