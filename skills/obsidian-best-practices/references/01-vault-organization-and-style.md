# Vault Organization and Style Guide

## Table of Contents

- [Recommended Folder Structure](#recommended-folder-structure)
- [Key Principles](#key-principles)
- [Alternative Methods](#alternative-methods)
- [Personal Style Guide Template](#personal-style-guide-template)

---

## Recommended Folder Structure

Use a **pragmatic flat structure** — minimal folders organized by _note type_ (not topic), with links and tags handling semantic connections.

**Why:** Folders force a single hierarchy. Notes don't think in hierarchies — an architecture decision is simultaneously about a project, a technology, and a pattern. Links and tags let a note belong to many contexts. Fewer folders means less friction deciding where something goes.

```
vault/
├── _templates/          # Note templates (Templater + core Templates)
├── daily/               # Daily notes (auto-created)
├── meetings/            # Meeting notes
├── projects/            # Active project notes & specs
├── references/          # Book notes, article summaries, clippings
├── archive/             # Completed projects, old notes (move here, don't delete)
├── attachments/         # Images, PDFs, and other media
└── (everything else lives at the vault root)
```

## Key Principles

- **Flat by default.** Most notes (ideas, technical notes, people, concepts) live at the vault root. Don't create a folder until you have a clear, recurring need.
- **Folders for note types, not topics.** "meetings" is a type; "javascript" is a topic. Topics are tags.
- **Prefix system folders with `_`** so they sort to the top and stay out of the way.
- **Never nest deeper than one level.** `projects/auth-redesign/` is fine. `projects/2025/q1/auth-redesign/` is not.
- **Archive, don't delete.** Move completed or stale notes to `archive/`.

---

## Alternative Methods

| Method | When It Fits | Tradeoff |
|---|---|---|
| **PARA** (Projects, Areas, Resources, Archive) | Many concurrent responsibilities needing clear actionability boundaries. | Folder overhead; notes often span categories. |
| **Zettelkasten** (atomic, linked notes with IDs) | Deep research, writing papers, maximum serendipity in idea connections. | High discipline; poor for action-oriented workflows. |
| **LYT** (Linking Your Thinking — MOCs + Home note) | 1000+ notes needing navigational scaffolding. | Maintenance burden; index notes go stale. |
| **Multi-vault** | Hard separation needed (e.g., work vs. personal, or 30K+ notes on mobile). | Lose cross-vault linking; more to manage. |

Any of these can be layered onto the flat structure later.

---

## Personal Style Guide Template

Create a `Style Guide.md` at the vault root. Starter:

```markdown
# Vault Style Guide

## Naming
- Note titles: Sentence case ("Authentication middleware design")
- No special characters in filenames (breaks links on some OSes)
- Dates: YYYY-MM-DD everywhere (ISO 8601)

## Tags
- Always plural: #projects not #project (except in namespaced prefixes)
- Namespaced: type/, project/, lang/, topic/
- Max 2-4 tags per note. If you need more, you're cramming too much into one note.

## Links
- Use wikilinks: [[Note Title]] not [Note Title](Note%20Title.md)
- Link generously. When in doubt, link.
- Use aliases for readability: [[Authentication Middleware|auth middleware]]

## Frontmatter
- Every note gets: tags, created
- Actionable notes also get: status, priority
- Project notes also get: deadline

## Notes
- One idea per note (atomic notes) when possible
- Headings: use ## for top-level sections within a note (# is the note title)
- Use callouts for warnings, tips, and important context:
  > [!warning] This API is deprecated in v3
```

### Maps of Content (MOCs)

When you have 20+ notes on a topic, create a Map of Content — a curated index note that organizes and contextualizes links:

```markdown
# Distributed Systems MOC

## Consensus
- [[Raft Protocol]]
- [[Paxos Overview]]
- [[Consensus Comparison — Raft vs Paxos vs PBFT]]

## Data Replication
- [[CAP Theorem]]
- [[Eventual Consistency Patterns]]

## Observability
- [[Distributed Tracing with OpenTelemetry]]
- [[Log Aggregation Architecture]]
```

MOCs are not auto-generated — they're _authored_. The act of curating the links forces you to think about how ideas connect.

### Linking Strategies

- **Link to concepts, not just notes.** `[[Circuit Breaker Pattern]]` is more useful than `[[2026-01-15 meeting notes]]`.
- **Use block references** for precision: `[[Architecture Doc#^decision-rationale]]` links to a specific paragraph.
- **Create "hub" notes for people and teams.** `[[Platform Team]]` links to their projects, key decisions, and relevant meeting notes.
- **Unlinked mentions:** Check the "Unlinked mentions" section in Backlinks. Obsidian finds places you mentioned a note's title without linking — click to convert.
