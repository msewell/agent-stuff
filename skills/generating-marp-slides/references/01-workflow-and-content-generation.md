# Workflow and Content Generation

## Table of Contents

- [Toolchain Prerequisites](#toolchain-prerequisites)
- [Stage 1: Outline — Detail](#stage-1-outline--detail)
- [Stage 2: Draft — Detail](#stage-2-draft--detail)
- [Content Generation Principles](#content-generation-principles)

---

## Toolchain Prerequisites

Marp CLI must be installed to render slides:

```bash
npm install -g @marp-team/marp-cli
marp --version
```

Verify with a test render:

```bash
echo -e "---\nmarp: true\n---\n# Hello World" > test.md
marp test.md --pdf
```

Optional tools:
- **Mermaid CLI** for diagrams: `npm install -g @mermaid-js/mermaid-cli`
- **Pexels / Unsplash API** for free stock images (see
  [02-design-theming-visuals.md](02-design-theming-visuals.md#free-image-sources))

## Stage 1: Outline — Detail

Produce a structured outline only — not full slide content. Generating a full deck
before agreeing on the story arc risks going off-track. An outline is cheap to revise.

Output format:

```
1. "Assertion Title" — What goes on this slide
2. "Assertion Title" — What goes on this slide
...
```

Guidelines:
- Target 8–12 slides unless content demands more or fewer
- Each title is a complete assertion statement
- First slide: title slide with topic and date/context
- Last slide: summary, call-to-action, or next steps
- One idea per slide — if a slide needs two points, split it

Present the outline for user approval before proceeding to Stage 2.

## Stage 2: Draft — Detail

Generate the full Marp Markdown using the approved outline.

### Marp Markdown structure

````markdown
---
marp: true
theme: default
paginate: true
footer: "Optional footer text"
---

# Title Slide Assertion

**Subtitle or date**

<!-- Speaker notes: context for the presenter -->

---

# Second Slide Assertion

- Key point one with **bold** emphasis
- Key point two with supporting data
- Key point three

<!-- IMAGE: description of a relevant visual -->
<!-- Speaker notes: what to say about this slide -->

---
````

### Formatting rules

- YAML frontmatter is required — `marp: true` enables Marp rendering
- `---` on its own line separates slides
- `#` (h1) for slide titles — always assertion titles
- Maximum 4 bullets per slide, each under 12 words
- `**bold**` sparingly — only key terms or numbers
- `<!-- Speaker notes: ... -->` on every slide
- `<!-- IMAGE: description -->` where a visual would strengthen the message
- Never fabricate data, statistics, or claims not in the source material
- Sentence fragments for bullets, not full sentences

### Optional frontmatter fields

| Field | Purpose | Example |
|-------|---------|---------|
| `theme` | Visual theme | `default`, `gaia`, `uncover` |
| `paginate` | Page numbers | `true` |
| `header` | Header text | `"Company Name"` |
| `footer` | Footer text | `"Confidential"` |
| `size` | Slide dimensions | `16:9` (default), `4:3` |

## Content Generation Principles

### Assertion titles over topic labels

Every slide title must be a complete statement that carries the message:

| Topic label (bad) | Assertion title (good) |
|---|---|
| "Revenue Overview" | "Revenue grew 34% YoY" |
| "Market Trends" | "Market shifted to mobile-first in 2025" |
| "Customer Feedback" | "NPS jumped from 32 to 47 since beta" |

The body provides supporting evidence; the title delivers the takeaway.

### Enforce brevity

Without deliberate restraint, bullets become paragraph-length and destroy readability:

- Maximum 4 bullets per slide
- Each bullet under 12 words
- Fragments, not full sentences

| Too verbose | Concise |
|---|---|
| "Our team successfully completed the migration of all customer data to the new platform ahead of schedule" | "Data migration completed 2 weeks early" |

### Separate outline from draft

Always generate the outline first, then the full Markdown. A two-pass approach produces
significantly better narrative structure than generating the whole deck in one pass.

### Iterate per slide, not per deck

When a slide needs improvement, regenerate just that slide. Regenerating the entire deck
loses refinements already made to other slides.

### Source material fidelity

Include all context from the source material when generating. More context produces
better output. If the source is very long, summarize it first, then generate slides from
the summary.
