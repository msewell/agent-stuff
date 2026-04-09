---
name: generating-marp-slides
description: "Generates professional slide decks as Marp Markdown from source material (memos, documents, notes, bullet points). Produces assertion-titled, visually consistent presentations with speaker notes, exportable to PDF, PPTX, and HTML via Marp CLI. Use when creating presentations, generating slides, building a slide deck, making a pitch deck, converting a document to a presentation, or when the user mentions Marp, slides, or slide decks."
category: Writing & Communication
compatibility: "Requires Node.js and @marp-team/marp-cli. Install: npm install -g @marp-team/marp-cli"
---

# Generating Marp Slides

## Workflow

Generate slides in two stages. Complete Stage 1 before Stage 2.

### Stage 1: Outline

Given source material, produce a numbered slide outline — not full content.

Rules:
- Target 8–12 slides (adjust based on content density)
- Write each title as an **assertion** — a complete statement, not a topic label
  - Good: "Revenue grew 34% YoY"
  - Bad: "Revenue Overview"
- First slide: title slide. Last slide: summary or call-to-action
- Format: slide number, assertion title, one-sentence content description

Present the outline for approval before proceeding.

### Stage 2: Full Marp Markdown

Convert the approved outline into a complete Marp Markdown file:

````markdown
---
marp: true
theme: default
paginate: true
---

# Assertion Title

- Bullet (max 12 words)
- Another bullet
- Supporting evidence

<!-- Speaker notes for the presenter -->

---

# Next Slide Assertion Title
````

Rules:
- YAML frontmatter: `marp: true`, `theme: default`, `paginate: true`
- Separate slides with `---` on its own line
- `#` for slide titles (assertion titles from the outline)
- Maximum **4 bullets** per slide, each **under 12 words**
- `**bold**` for key terms only
- `<!-- Speaker notes -->` on every slide
- Where a visual would help: `<!-- IMAGE: description -->`
- Never invent data not in the source material

### Self-review

After drafting, verify before delivering:
- [ ] Every number, name, and claim matches the source material
- [ ] Each slide makes exactly one point
- [ ] No bullet exceeds ~12 words
- [ ] Titles read in sequence tell a coherent story
- [ ] Every slide has speaker notes

Fix all issues inline.

## Design rules

1. **One message per slide.** If the point needs more than one sentence to state, split into two slides.
2. **Assertion-evidence structure.** Title = complete sentence asserting the key point. Body = evidence supporting it.
3. **Less text, more signal.** Fragments that convey key data, not full sentences.
4. **Progressive narrative.** Sequence: context → evidence → implications → action.

## Marp image syntax

| Syntax | Effect |
|--------|--------|
| `![bg](image.jpg)` | Full background |
| `![bg right:40%](image.jpg)` | Image right 40%, text left |
| `![bg left:50%](image.jpg)` | Image left 50%, text right |
| `![bg contain](image.jpg)` | Contained, no crop |
| `![bg cover](image.jpg)` | Cover, may crop |
| `![bg blur:5px](image.jpg)` | Blurred background |
| `![w:300](image.jpg)` | Inline, 300px wide |

## Export

```bash
marp slides.md --pdf                      # PDF (best for sharing)
marp slides.md --pptx                     # PowerPoint
marp slides.md --html                     # HTML
marp slides.md --pdf --allow-local-files  # PDF with local images
```

## Edge cases

- **Very short source material** (3–4 sentences): Reduce to 4–5 slides. Skip the outline stage — draft directly.
- **Very long source material** (>2000 words): Summarize first, then generate slides from the summary.
- **User needs executable code or LaTeX in slides**: Use Quarto + Reveal.js instead of Marp (see [references/03-quality-export-example.md](references/03-quality-export-example.md#alternative-formats)).
- **User needs native PowerPoint without Marp**: Use SlideDeck AI (see [references/03-quality-export-example.md](references/03-quality-export-example.md#alternative-formats)).

## Reference material

- **Toolchain, detailed workflow, content generation principles**: [references/01-workflow-and-content-generation.md](references/01-workflow-and-content-generation.md)
- **Design principles, theming, visual enrichment**: [references/02-design-theming-visuals.md](references/02-design-theming-visuals.md)
- **Export options, worked example, alternative formats**: [references/03-quality-export-example.md](references/03-quality-export-example.md)
