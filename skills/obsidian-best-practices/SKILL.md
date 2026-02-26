---
name: obsidian-best-practices
description: Guides setting up, configuring, and organizing Obsidian vaults for software engineers — folder structure, plugins, templates, Git backup, Dataview queries, and AI integrations. Also creates and edits Obsidian vault files following best practices for frontmatter schemas, wikilinks, Templater syntax, Dataview code blocks, and Canvas JSON. Use when setting up a new vault, recommending plugins, creating note templates, writing Dataview queries, configuring Git sync, advising on vault organization, or generating Obsidian-compatible Markdown files.
---

# Obsidian Best Practices

## Quick start — new vault setup

1. Create a vault folder (e.g., `~/vaults/brain`).
2. Create the folder structure:
   ```
   vault/
   ├── _templates/
   ├── daily/
   ├── meetings/
   ├── projects/
   ├── references/
   ├── archive/
   └── attachments/
   ```
3. Enable core plugins: Daily Notes, Templates, Backlinks, Outgoing Links, Tags, Graph View, Command Palette, Page Preview, Bookmarks, Canvas, Properties View.
4. Install Tier 1 community plugins: Dataview, Templater, Obsidian Git, Tasks, Calendar.
5. Create `_templates/daily.md`, `_templates/meeting.md`, `_templates/project.md`, `_templates/reference.md` using the templates in [references/templates-and-daily-notes.md](references/templates-and-daily-notes.md).
6. Configure Daily Notes: date format `YYYY-MM-DD`, location `daily/`, template `_templates/daily.md`, open on startup.
7. Configure Templater: template folder `_templates`, enable folder templates (`daily/` → `_templates/daily.md`, `meetings/` → `_templates/meeting.md`), trigger on new file creation.
8. Initialize Git: `git init`, create private remote, configure Obsidian Git plugin (auto backup every 10-30 min, auto pull on open, auto push after commit).

## Vault organization principles

- **Flat by default.** Most notes live at the vault root. Folders are for note _types_ (meetings, projects), not topics. Topics are tags.
- **Prefix system folders with `_`** (e.g., `_templates/`).
- **Never nest deeper than one level.**
- **Archive, don't delete.** Move stale notes to `archive/`.
- For alternative approaches (PARA, Zettelkasten, LYT), see [references/vault-organization-and-style.md](references/vault-organization-and-style.md).

## Frontmatter schema

Every note gets this minimum frontmatter:

```yaml
---
tags:
  - type/meeting
  - project/auth-redesign
created: 2026-02-26
---
```

Rules:
- **Flat YAML only** — Obsidian doesn't support nested properties.
- **Namespaced tags:** `type/`, `project/`, `lang/`, `topic/`. Pluralize leaf values.
- **`created` and `updated`** in `YYYY-MM-DD` format.
- **`status`** on actionable notes: `active`, `paused`, `completed`, `archived`.
- **Quote wikilinks in YAML:** `related: "[[Other Note]]"`.

## Creating Obsidian-compatible Markdown

When creating or editing `.md` files for an Obsidian vault:

- Use **wikilinks**: `[[Note Title]]`, not `[Note Title](Note%20Title.md)`.
- Use **aliases** for readability: `[[Authentication Middleware|auth middleware]]`.
- Use **block references** for precision: `[[Architecture Doc#^decision-rationale]]`.
- Use `##` for top-level sections (reserve `#` for the note title).
- Use **callouts** for emphasis:
  ```markdown
  > [!warning] This API is deprecated in v3
  > Use the new endpoint instead.
  ```
- Use **Templater syntax** (`<% tp.date.now("YYYY-MM-DD") %>`) in template files only.
- Use **inline fields** for Dataview: `Status:: In Progress`.

## Writing Dataview queries

Use `dataview` code blocks. Common patterns:

**Table from tagged notes:**
````markdown
```dataview
TABLE status, priority, deadline
FROM #type/project
WHERE status = "active"
SORT priority ASC
```
````

**Task aggregation:**
````markdown
```dataview
TASK
WHERE due >= date(today) AND due <= date(today) + dur(7 days)
WHERE !completed
SORT due ASC
```
````

**Recent notes list:**
````markdown
```dataview
LIST
WHERE updated >= date(today) - dur(30 days)
SORT updated DESC
LIMIT 20
```
````

For DataviewJS, inline fields, and advanced patterns, see [references/dataview-git-and-workflows.md](references/dataview-git-and-workflows.md).

## Canvas files

Canvas files (`.canvas`) use the [JSON Canvas](https://jsoncanvas.org) spec:
- Nodes: `text`, `file`, `link`, or `group`.
- Edges connect nodes with optional labels and colors.
- Coordinates can be negative — the canvas extends infinitely.
- Color-code by category: blue for people, yellow for events, green for decisions, red for blockers.

## Reference material

Consult these for detailed guidance:

- **Vault structure, style guide, MOCs, linking strategies:** [references/vault-organization-and-style.md](references/vault-organization-and-style.md)
- **Core and community plugins, keyboard shortcuts:** [references/plugins-and-configuration.md](references/plugins-and-configuration.md)
- **Templates, frontmatter conventions, daily/weekly notes:** [references/templates-and-daily-notes.md](references/templates-and-daily-notes.md)
- **Dataview queries, Git backup, knowledge capture pipeline:** [references/dataview-git-and-workflows.md](references/dataview-git-and-workflows.md)
- **AI plugins, MCP servers, agent skills, Canvas:** [references/ai-integrations-and-canvas.md](references/ai-integrations-and-canvas.md)
- **Curated external links and resources:** [references/resources-and-links.md](references/resources-and-links.md)
