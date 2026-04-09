# Design, Theming, and Visual Enrichment

## Table of Contents

- [Slide Design Principles](#slide-design-principles)
- [Built-in Themes](#built-in-themes)
- [Custom CSS Themes](#custom-css-themes)
- [Per-Slide Overrides](#per-slide-overrides)
- [Visual Enrichment Strategy](#visual-enrichment-strategy)
- [Free Image Sources](#free-image-sources)
- [Image Placement Example](#image-placement-example)
- [Diagrams with Mermaid](#diagrams-with-mermaid)

---

## Slide Design Principles

### One message per slide

Each slide communicates exactly one idea. If the point cannot be stated in a single
sentence, split it into two slides. This reduces cognitive load and makes the deck
scannable.

### Assertion-evidence structure

- **Title**: A complete sentence asserting the slide's key point
- **Body**: Visual or textual evidence supporting that assertion (chart, image, or
  2–4 concise bullets)

This structure improves audience retention compared to topic-label titles with dense
bullet lists.

### Progressive disclosure in narrative

Sequence slides so complexity builds incrementally:

1. Context and framing
2. Evidence and analysis
3. Implications and action

Enforce this arc during the outline stage.

### Less text, more signal

| Bad | Good |
|-----|------|
| 8 bullets with 20+ words each | 3–4 bullets, each under 12 words |
| Full sentences as bullets | Fragments that convey key data |
| Title: "Overview of Market Trends" | Title: "Market shifted to mobile-first in 2025" |

### Consistent visual language

Let the Marp theme handle fonts, colors, and spacing. Do not override styles inline on
individual slides unless absolutely necessary.

## Built-in Themes

Marp ships with three themes. Set in frontmatter:

```yaml
---
marp: true
theme: gaia
paginate: true
header: "Company Name"
footer: "Confidential"
---
```

- **default**: Clean, minimal — good for most presentations
- **gaia**: Bold colors, larger text — good for keynotes
- **uncover**: Understated — good for academic or technical content

Use `default` unless the user specifies otherwise.

## Custom CSS Themes

For brand consistency, create a custom CSS file (e.g., `brand.css`):

```css
/* @theme brand */
@import 'default';

:root {
  --color-background: #ffffff;
  --color-foreground: #1a1a2e;
  --color-highlight: #e94560;
}

section {
  font-family: 'Inter', 'Helvetica Neue', sans-serif;
  font-size: 28px;
}

h1 {
  color: var(--color-highlight);
  font-size: 36px;
}
```

Apply with Marp CLI:

```bash
marp slides.md --theme-set ./brand.css --pdf
```

The `/* @theme brand */` comment on line 1 registers the theme name. Reference it in
frontmatter as `theme: brand`.

## Per-Slide Overrides

Use Marp directives for occasional variation:

```markdown
<!-- _backgroundColor: #1a1a2e -->
<!-- _color: #ffffff -->

# Dark Slide for Emphasis
```

The underscore prefix (`_`) scopes the directive to the current slide only, preventing
it from affecting subsequent slides. Use sparingly.

## Visual Enrichment Strategy

Add images strategically but sparingly. During Stage 2, insert
`<!-- IMAGE: description -->` placeholders where a visual would strengthen the message.
During finalization, replace placeholders with actual images:

1. Use the placeholder description as a search query
2. Download the image locally
3. Reference it in Markdown using Marp image syntax (see SKILL.md)

## Free Image Sources

| Source | API | Attribution Required |
|--------|-----|---------------------|
| **Pexels** | pexels.com/api | No |
| **Unsplash** | unsplash.com/developers | Appreciated, not required |
| **Pixabay** | pixabay.com/api | No |

## Image Placement Example

Split-layout slide with an image on the right:

```markdown
![bg right:40%](./images/teamwork.jpg)

# Cross-Team Collaboration Drove Results

- Engineering and design shipped 3 weeks early
- Joint retros reduced handoff friction by 40%
```

For the full image syntax reference, see the "Marp image syntax" table in SKILL.md.

## Diagrams with Mermaid

For architecture diagrams, flowcharts, or process visualizations, generate Mermaid
syntax and render to an image:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.mmd -o diagram.png -b transparent
```

Include the rendered PNG in the slide Markdown. Marp does not natively render Mermaid
in slides — always pre-render to an image file.
