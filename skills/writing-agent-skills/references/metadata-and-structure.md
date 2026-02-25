# Metadata and Body Structure

## Table of Contents

- [The name Field](#the-name-field)
- [The description Field](#the-description-field)
- [The compatibility Field](#the-compatibility-field)
- [Structuring the SKILL.md Body](#structuring-the-skillmd-body)

---

## The `name` Field

The name must be lowercase, use hyphens for separators, and match the parent
directory name.

**Naming conventions:**

Prefer the **gerund form** (verb + -ing) for clarity:

| Good (gerund)             | Also acceptable (noun phrase) |
| ------------------------- | ----------------------------- |
| `processing-pdfs`         | `pdf-processing`              |
| `analyzing-spreadsheets`  | `spreadsheet-analysis`        |
| `managing-databases`      | `database-management`         |
| `testing-code`            | `code-testing`                |
| `writing-documentation`   | `documentation-writer`        |

**Avoid:**

- Vague names: `helper`, `utils`, `tools`
- Overly generic: `documents`, `data`, `files`
- Reserved words: `anthropic-*`, `claude-*` (some platforms prohibit these)

---

## The `description` Field

The description is the **primary triggering mechanism** for your skill. Agents
use it to decide whether to activate the skill from potentially hundreds of
candidates. This is the single most important piece of text in your entire
skill.

**Rules:**

1. **Always write in third person.** The description is injected into the
   system prompt. Inconsistent point-of-view causes discovery problems.
   - Good: "Processes Excel files and generates reports"
   - Bad: "I can help you process Excel files"
   - Bad: "You can use this to process Excel files"

2. **Include both what it does AND when to use it.** The body is loaded only
   *after* triggering, so "When to Use" sections in the body don't help with
   discovery.

3. **Include specific keywords** that match how users phrase requests.

4. **Be comprehensive but not wasteful** — you have 1024 characters.

**Good descriptions:**

```yaml
description: >-
  Extract text and tables from PDF files, fill forms, merge documents.
  Use when working with PDF files or when the user mentions PDFs, forms,
  or document extraction.
```

```yaml
description: >-
  Analyze Excel spreadsheets, create pivot tables, generate charts.
  Use when analyzing Excel files, spreadsheets, tabular data,
  or .xlsx files.
```

```yaml
description: >-
  Generate descriptive commit messages by analyzing git diffs.
  Use when the user asks for help writing commit messages or
  reviewing staged changes.
```

**Bad descriptions:**

```yaml
description: Helps with documents.
```

```yaml
description: Processes data.
```

```yaml
description: Does stuff with files.
```

---

## The `compatibility` Field

Most skills don't need this. Include it only when your skill has genuine
environment requirements:

```yaml
compatibility: Requires git, docker, jq, and access to the internet
```

```yaml
compatibility: Designed for Claude Code (or similar filesystem-based agents)
```

---

## Structuring the SKILL.md Body

### Use Imperative Form

Write instructions in imperative/infinitive form. Give commands to an agent,
not documentation for a human reader.

- Good: "Extract the text using pdfplumber"
- Bad: "The text can be extracted using pdfplumber"
- Bad: "You should extract the text using pdfplumber"

### Recommended Sections

While there are no format restrictions, effective skills tend to include:

```markdown
# Skill Name

## Quick start
[The most common use case with a minimal example]

## Workflow
[Step-by-step instructions for the core process]

## Edge cases
[Specific situations that require different handling]

## Examples
[Input/output pairs showing expected behavior]
```

### Keep It Under 500 Lines

The body should stay under 500 lines (~5000 tokens recommended). If your
content exceeds this, split it into separate reference files using progressive
disclosure patterns.

### Put "When to Use" in the Description, Not the Body

A common mistake: writing a "When to Use This Skill" section in the body. By
the time the agent reads the body, it has already decided to activate the
skill. Move all triggering information into the `description` frontmatter
field.

### Use Consistent Terminology

Pick one term and use it everywhere:

| Consistent (good)         | Inconsistent (bad)                           |
| ------------------------- | -------------------------------------------- |
| Always "API endpoint"     | Mix of "URL", "API route", "path", "endpoint"|
| Always "field"            | Mix of "field", "box", "element", "control"  |
| Always "extract"          | Mix of "extract", "pull", "get", "retrieve"  |
