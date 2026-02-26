# Templates, Frontmatter, and Daily Notes

## Table of Contents

- [Properties and Frontmatter Conventions](#properties-and-frontmatter-conventions)
- [Templates](#templates)
- [Daily Notes and Periodic Reviews](#daily-notes-and-periodic-reviews)

---

## Properties and Frontmatter Conventions

Properties (YAML frontmatter) are structured metadata at the top of each note. They power search, Dataview queries, and Bases.

### Recommended Property Schema

```yaml
---
tags:
  - type/meeting
  - project/auth-redesign
  - lang/typescript
created: 2026-02-26
updated: 2026-02-26
status: active
---
```

### Rules

1. **Keep frontmatter flat.** Obsidian doesn't natively support nested YAML. Use flat key-value pairs.
2. **Use namespaced tags.** Prefix tags with a category: `type/`, `project/`, `lang/`, `topic/`. This prevents tag soup and enables scoped filtering. Always pluralize leaf values (`tools` not `tool`).
3. **Always include `created` and `updated` dates** in `YYYY-MM-DD` format. Templater can auto-populate these.
4. **Use `status` for actionable notes.** Values: `active`, `paused`, `completed`, `archived`. Enables Dataview queries.
5. **Quote wikilinks in YAML.** If you use links as property values, wrap them in quotes: `related: "[[Other Note]]"`. Or use the Properties UI and set the type to "Link."
6. **Don't over-engineer metadata.** If you're spending more time on frontmatter than on the note content, you've gone too far. Add properties you'll actually query.

---

## Templates

### Daily Note Template

Save as `_templates/daily.md`:

```markdown
---
tags:
  - type/daily
created: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.date.now("dddd, MMMM D, YYYY") %>

## Focus

- [ ]
- [ ]
- [ ]

## Notes

## Tasks Completed

## End-of-Day Reflection

> What went well? What would I do differently?

```

### Meeting Note Template

Save as `_templates/meeting.md`:

```markdown
---
tags:
  - type/meeting
created: <% tp.date.now("YYYY-MM-DD") %>
participants:
project:
---

# Meeting: <% tp.file.cursor(0) %>

**Date:** <% tp.date.now("YYYY-MM-DD") %>
**Participants:**
**Project:**

## Agenda

-

## Notes

## Action Items

- [ ]

## Decisions

-
```

### Project Note Template

Save as `_templates/project.md`:

```markdown
---
tags:
  - type/project
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
status: active
priority:
deadline:
---

# Project: <% tp.file.cursor(0) %>

## Overview

> One-paragraph summary of goals, scope, and constraints.

## Key Links

- Repo:
- Docs:
- Tracker:

## Architecture / Design

## Open Questions

- [ ]

## Log

### <% tp.date.now("YYYY-MM-DD") %>

-
```

### Technical Reference Template

Save as `_templates/reference.md`:

```markdown
---
tags:
  - type/reference
created: <% tp.date.now("YYYY-MM-DD") %>
source:
---

# <% tp.file.cursor(0) %>

## Summary

## Key Takeaways

-

## Notes

## Related

-
```

### Templater Configuration

In Settings → Templater:

- **Template folder location:** `_templates`
- **Enable Folder Templates:** On — map `daily/` → `_templates/daily.md`, `meetings/` → `_templates/meeting.md`
- **Trigger Templater on new file creation:** On

This way, every file created in the `daily/` folder automatically uses the daily template.

---

## Daily Notes and Periodic Reviews

### Daily Notes Configuration

Configure in Settings → Daily Notes:

- **Date format:** `YYYY-MM-DD`
- **New file location:** `daily/`
- **Template file location:** `_templates/daily.md`
- **Open daily note on startup:** On (recommended — forces the habit)

**The habit matters more than the format.** Open Obsidian every day. Log one thing. Over time, this compounds into a searchable record of your work.

### Weekly Reviews

Create a weekly note every Friday or Monday. Use the Periodic Notes plugin to automate this. Lightweight weekly template:

```markdown
---
tags:
  - type/weekly
created: <% tp.date.now("YYYY-MM-DD") %>
week: <% tp.date.now("YYYY-[W]ww") %>
---

# Week of <% tp.date.now("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]ww") %>

## Wins

-

## Challenges

-

## Next Week's Priorities

- [ ]

## Notes & Observations

```

### Periodic Vault Maintenance

Every few months:

1. **Random revisit.** Hit "Open random note." Read old notes. Add links to things you've learned since.
2. **Orphan cleanup.** Use Graph View to find unlinked notes. Either link them or archive them.
3. **Plugin audit.** Disable any community plugins you haven't used in 3 months.
4. **Tag review.** Search for similar or misspelled tags and consolidate.
