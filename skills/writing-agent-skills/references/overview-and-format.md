# Overview and Format

## Table of Contents

- [What Are Agent Skills?](#what-are-agent-skills)
- [Why Skills Exist](#why-skills-exist)
- [Skills vs. MCP](#skills-vs-mcp)
- [The Value Proposition](#the-value-proposition)
- [The Format at a Glance](#the-format-at-a-glance)
- [Frontmatter Fields](#frontmatter-fields)

---

## What Are Agent Skills?

Agent Skills are a lightweight, open format for extending AI agent capabilities
with specialized knowledge and workflows. Originally developed by Anthropic and
released as an open standard in December 2025, they are now supported by 30+
agent products — including Claude Code, OpenAI Codex, Gemini CLI, Cursor,
VS Code Copilot, GitHub Copilot, Amp, Goose, Roo Code, and many more.

At its core, a skill is a **folder containing a `SKILL.md` file**. This file
includes metadata (name and description) and instructions that tell an agent how
to perform a specific task. Skills can also bundle scripts, templates, and
reference materials.

### Why Skills Exist

Agents are increasingly capable, but they lack the context needed for real work:

- **Domain expertise** your organization has accumulated over years.
- **Procedural knowledge** for multi-step workflows that must be followed
  precisely.
- **Tool-specific context** like API schemas, database tables, or internal CLI
  usage patterns.

Skills solve this by giving agents access to on-demand procedural knowledge and
company-, team-, and user-specific context. Agents with skills can extend their
capabilities based on the task at hand.

### Skills vs. MCP

A common point of confusion: **MCP (Model Context Protocol) gives your agent
access to external tools and data. Skills teach your agent what to do with those
tools and data.** They are complementary, not competing.

### The Value Proposition

| Stakeholder        | Benefit                                                          |
| ------------------- | ---------------------------------------------------------------- |
| **Skill authors**   | Build once, deploy across 30+ agent products.                   |
| **Agent builders**  | Support for skills lets users extend capabilities out of the box.|
| **Teams / orgs**    | Capture organizational knowledge in version-controlled packages. |

---

## The Format at a Glance

### Minimal Viable Skill

```
my-skill/
└── SKILL.md
```

The `SKILL.md` file has two parts: YAML frontmatter and Markdown body.

```markdown
---
name: my-skill
description: Does X when Y happens. Use when the user mentions Z.
---

# My Skill

## Step 1
Do this thing.

## Step 2
Then do this other thing.
```

That's it. A skill can be this simple.

### Full Directory Structure

```
my-skill/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation loaded on demand
└── assets/           # Optional: templates, images, data files
```

### Frontmatter Fields

| Field           | Required | Constraints                                                                |
| --------------- | -------- | -------------------------------------------------------------------------- |
| `name`          | Yes      | 1–64 chars. Lowercase `a-z`, numbers, hyphens. No leading/trailing/double hyphens. Must match directory name. |
| `description`   | Yes      | 1–1024 chars. Non-empty. Describes what the skill does AND when to use it. |
| `license`       | No       | License name or reference to a bundled license file.                       |
| `compatibility` | No       | 1–500 chars. Environment requirements (product, packages, network, etc.). |
| `metadata`      | No       | Arbitrary key-value map (string → string) for custom properties.           |
| `allowed-tools` | No       | Space-delimited list of pre-approved tools. (Experimental)                 |

### Body Content

The Markdown body after the frontmatter contains the skill instructions. There
are **no format restrictions** — write whatever helps agents perform the task
effectively.
