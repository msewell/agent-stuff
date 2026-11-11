# Dataview, Git Backup, and Knowledge Capture

## Table of Contents

- [Dataview for Project and Task Tracking](#dataview-for-project-and-task-tracking)
- [DataviewJS Advanced Queries](#dataviewjs-advanced-queries)
- [Combining Tasks + Dataview + Daily Notes](#combining-tasks--dataview--daily-notes)
- [Git-Based Backup and Sync](#git-based-backup-and-sync)
- [Knowledge Capture Pipeline](#knowledge-capture-pipeline)

---

## Dataview for Project and Task Tracking

[Dataview](https://github.com/blacksmithgu/obsidian-dataview) turns your vault into a queryable database. It reads YAML frontmatter and inline fields (`Key:: Value`) to generate dynamic tables, lists, and task views.

### Active Projects Dashboard

Create a note called `Dashboard.md`:

````markdown
## Active Projects

```dataview
TABLE status, priority, deadline
FROM #type/project
WHERE status = "active"
SORT priority ASC
```
````

### Tasks Due This Week

````markdown
## Due This Week

```dataview
TASK
WHERE due >= date(today) AND due <= date(today) + dur(7 days)
WHERE !completed
SORT due ASC
```
````

### Recent Meeting Notes

````markdown
## Recent Meetings

```dataview
TABLE participants, project
FROM #type/meeting
SORT created DESC
LIMIT 10
```
````

### Notes Updated This Month

````markdown
## Recently Updated

```dataview
LIST
WHERE updated >= date(today) - dur(30 days)
SORT updated DESC
LIMIT 20
```
````

### Inline Fields in Project Notes

Use inline fields in project notes for queryable status:

```markdown
### 2026-02-26

Status:: In Progress
Blocked:: waiting on API team

- Implemented auth middleware
- Need to add rate limiting
```

Then query across all projects:

````markdown
```dataview
TABLE Status, Blocked
FROM #type/project
WHERE Status = "In Progress"
```
````

---

## DataviewJS Advanced Queries

For more complex queries, use JavaScript:

````markdown
```dataviewjs
const pages = dv.pages('#type/project AND #status/active')
  .sort(p => p.priority, 'asc');

dv.table(
  ["Project", "Priority", "Deadline", "Days Left"],
  pages.map(p => [
    p.file.link,
    p.priority,
    p.deadline,
    p.deadline
      ? Math.round((new Date(p.deadline) - new Date()) / (1000*60*60*24))
      : "—"
  ])
);
```
````

The [Dataview Example Vault](https://github.com/s-blu/obsidian_dataview_example_vault) is the best learning resource — clone it, experiment, and adapt queries.

---

## Combining Tasks + Dataview + Daily Notes

Create tasks anywhere in your vault, aggregate them in your daily note:

In any note:
```markdown
- [ ] Deploy auth service to staging [due:: 2026-02-28] [project:: Auth Redesign]
```

In your daily note template, add:
````markdown
## Today's Tasks

```dataview
TASK
WHERE due = date(today) AND !completed
GROUP BY project
```
````

Every daily note automatically shows what's due, pulled from across the entire vault.

---

## Git-Based Backup and Sync

Your vault is Markdown files. Git gives you version history, diffing, branching, and off-site backup.

### Setup with Obsidian Git Plugin

1. Initialize a repo: `git init` in your vault folder.
2. Create a **private** repo on GitHub/GitLab.
3. Install the [Obsidian Git](https://github.com/Vinzent03/obsidian-git) community plugin.
4. Configure in plugin settings:
   - **Auto backup interval:** 10-30 minutes
   - **Auto pull on open:** On
   - **Auto push after commit:** On

### Recommended `.gitignore`

```gitignore
# Obsidian workspace and cache (device-specific)
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/cache
.obsidian/plugins/obsidian-git/

# OS files
.DS_Store
Thumbs.db
```

### Mobile Sync

The Obsidian Git plugin is unstable on mobile. For cross-device sync:

- **[Obsidian Sync](https://obsidian.md/sync)** (official, paid — most reliable)
- **iCloud / Google Drive** (free, but can cause sync conflicts)
- **[Remotely Save](https://github.com/remotely-save/remotely-save)** (community plugin, supports S3/Dropbox/OneDrive/WebDAV)

**Hybrid approach (recommended):** Use Obsidian Sync or a cloud drive for real-time multi-device sync, plus Git for versioned backup. Sync is for availability; Git is for history.

### Authentication

Use **SSH keys** or **fine-grained personal access tokens** (not classic tokens). Fine-grained tokens let you scope access to a single repository.

---

## Knowledge Capture Pipeline

### Obsidian Web Clipper

The [Obsidian Web Clipper](https://obsidian.md/clipper) browser extension saves web pages directly to your vault:

- Works in Chrome, Firefox, Safari, Edge, Brave, and Arc.
- Supports templates and variables for consistent formatting.
- The **Interpreter** feature uses AI to extract and transform content.

### Readwise + Obsidian

[Readwise](https://readwise.io) aggregates highlights. With the [official plugin](https://github.com/readwiseio/obsidian-readwise), highlights from Kindle, articles, podcasts, and PDFs auto-sync into your vault:

- Continuous auto-sync with customizable Jinja2 templates.
- Enriched metadata: cover images, source URLs, author names, tags.
- Pairs perfectly with Dataview — synced highlights become queryable.

### Recommended Capture Flow

```
Browser / Kindle / PDF → Readwise (aggregation + daily review)
                            ↓
                        Obsidian vault (auto-synced reference notes)
                            ↓
                        Your own notes (linked, tagged, processed)
```

Keep a `references/` folder for raw captures. Process them into your own notes over time. Unprocessed captures are still searchable — don't let "I haven't processed this yet" stop you from capturing.
