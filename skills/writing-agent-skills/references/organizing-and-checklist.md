# Organizing Skills at Scale and Pre-Ship Checklist

## Table of Contents

- [Company-Wide vs. Team-Wide Skills](#company-wide-vs-team-wide-skills)
- [When to Write a Skill](#when-to-write-a-skill)
- [Start Small](#start-small)
- [Unit Testing Skills](#unit-testing-skills)
- [Maintainer Responsibilities](#maintainer-responsibilities)
- [Checklist Before You Ship](#checklist-before-you-ship)

---

## Company-Wide vs. Team-Wide Skills

Separate skills by scope to avoid the agent activating irrelevant skills:

```
skills/
├── company/          # Shared across the org
│   ├── code-review/
│   ├── commit-messages/
│   └── incident-response/
└── team/             # Team-specific
    ├── billing-queries/
    ├── deploy-staging/
    └── onboard-new-hire/
```

Team-wide skills may benefit from having model invocation disabled (requiring
explicit invocation via slash commands), reducing the risk of accidental
activation.

---

## When to Write a Skill

**Good candidates:**

- Processes needing company-specific standards (commit messages, code review
  checklists, documentation style)
- Repetitive tasks involving external resources (querying dashboards, internal
  APIs, specific databases)
- Investigations requiring specialized domain knowledge
- Workflows you want to optimize and standardize

**Avoid writing skills for:**

- Tasks agents already handle accurately without additional context
- Features that should live in the agent's system prompt
- Deterministic checks better implemented as automated tests or linters

---

## Start Small

Start by writing the simplest possible skill that is worth using:

1. Look at what you did in the past week.
2. Identify documents you repeatedly write or review, processes that could be
   done more accurately with explicit instructions.
3. Start with a single `SKILL.md` — no scripts, no references, just
   instructions.
4. Add bundled resources only when you observe the need.

---

## Unit Testing Skills

To enforce that skills follow your organization's conventions, write unit tests:

```python
def test_skill_has_valid_name():
    """Name must be lowercase with hyphens only."""
    assert re.match(r'^[a-z][a-z0-9-]*[a-z0-9]$', skill.name)

def test_skill_description_length():
    """Description must be between 50 and 1024 characters."""
    assert 50 <= len(skill.description) <= 1024

def test_skill_body_under_500_lines():
    """SKILL.md body must be under 500 lines."""
    body_lines = skill.body.split('\n')
    assert len(body_lines) < 500

def test_no_extraneous_files():
    """Skill should not contain README, CHANGELOG, etc."""
    forbidden = {'README.md', 'CHANGELOG.md', 'INSTALLATION_GUIDE.md'}
    assert not forbidden.intersection(skill.files)
```

---

## Maintainer Responsibilities

If you're a skills maintainer for your team:

- **Triage invocation issues**: Is the problem with naming, descriptions, or
  model behavior?
- **Identify anti-patterns**: Watch for skills that are too verbose, too vague,
  or poorly structured.
- **Direct complaints to owners**: Skill-specific issues should go to the skill
  author.
- **Query usage data**: Iterate based on how skills are actually used, not how
  you imagine they'll be used.

---

## Checklist Before You Ship

### Core Quality

- [ ] `name` follows conventions (lowercase, hyphens, 1–64 chars, matches
      directory)
- [ ] `description` is specific, includes key terms, and states both what the
      skill does and when to use it
- [ ] `description` is written in third person
- [ ] `SKILL.md` body is under 500 lines
- [ ] Additional details are in separate reference files (if needed)
- [ ] No time-sensitive information
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep
- [ ] Progressive disclosure used appropriately
- [ ] Workflows have clear sequential steps
- [ ] No extraneous files (`README.md`, `CHANGELOG.md`, etc.)

### Scripts and Code

- [ ] Scripts handle errors explicitly with helpful messages
- [ ] No magic numbers — all constants are documented
- [ ] Required packages are listed with install commands
- [ ] Scripts are tested by actually running them
- [ ] Execution vs. reading intent is clear in instructions
- [ ] All file paths use forward slashes
- [ ] Validation/verification steps exist for critical operations
- [ ] Feedback loops included for quality-critical tasks

### Testing

- [ ] At least three evaluation scenarios created
- [ ] Tested with real usage scenarios (not just test cases)
- [ ] Tested with all target models (Haiku, Sonnet, Opus, etc.)
- [ ] Validated with `skills-ref validate`
- [ ] Team feedback incorporated (if applicable)

---

## Quick-Start Template

Copy this to get started:

````markdown
---
name: my-skill-name
description: >-
  [What it does]. [What it produces or transforms].
  Use when [specific triggers and contexts].
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

Then iterate based on real usage.
