# Export Options and Worked Example

## Table of Contents

- [Export Format Selection](#export-format-selection)
- [PDF Export Options](#pdf-export-options)
- [HTML Hosting](#html-hosting)
- [Worked Example](#worked-example)
- [Alternative Formats](#alternative-formats)

---

## Export Format Selection

| Format | Best for | Command |
|--------|----------|---------|
| **PDF** | Sharing via email, archival, printing | `marp slides.md --pdf` |
| **PPTX** | Further editing in PowerPoint | `marp slides.md --pptx` |
| **HTML** | Web hosting, interactive presentations | `marp slides.md --html` |

Default to PDF unless the user specifies otherwise.

## PDF Export Options

```bash
# Standard 16:9 PDF
marp slides.md --pdf

# 4:3 aspect ratio
marp slides.md --pdf --html --size 4:3

# Allow local file access (required when slides reference local images)
marp slides.md --pdf --allow-local-files
```

## HTML Hosting

For web-hosted presentations:

```bash
# Self-contained HTML file
marp slides.md --html --allow-local-files

# Live server during development
marp slides.md --server
```

## Worked Example

### Input: project update memo

```
Project Phoenix launched on Feb 15. User signups reached 12,000 in the first two weeks,
exceeding our 8,000 target by 50%. Mobile accounted for 73% of signups. The onboarding
flow had a 68% completion rate — below our 80% target. Top drop-off point was step 3
(payment setup). Engineering is shipping a simplified payment flow by March 1. Customer
satisfaction (NPS) is 47, up from 32 in the beta period.
```

### Stage 1 output: outline

```
1. "Project Phoenix Exceeded Signup Targets in Two Weeks" — Title slide with launch date
2. "12,000 Signups in 14 Days — 50% Above Target" — Signup numbers vs. target
3. "Mobile Dominated at 73% of All Signups" — Channel breakdown
4. "Onboarding Completion Fell Short at 68%" — Completion rate vs. 80% target
5. "Payment Setup Is the Key Drop-Off Point" — Step 3 analysis
6. "Simplified Payment Flow Shipping March 1" — Engineering fix and timeline
7. "NPS Jumped From 32 to 47 Since Beta" — Customer satisfaction trend
8. "Next Steps: Fix Onboarding, Double Down on Mobile" — Summary and actions
```

### Stage 2 output: Marp Markdown

```markdown
---
marp: true
theme: default
paginate: true
footer: "Project Phoenix — March 2026"
---

# Project Phoenix Exceeded Signup Targets in Two Weeks

**Launch date:** February 15, 2026

<!-- Speaker notes: Quick update on Phoenix, two weeks post-launch. -->

---

# 12,000 Signups in 14 Days — 50% Above Target

- Target was 8,000 in first two weeks
- Actual: **12,000** — exceeded by **50%**
- Fastest adoption of any launch this year

<!-- IMAGE: upward trending graph or growth chart -->
<!-- Speaker notes: Signups ramped quickly from day one. -->

---

# Mobile Dominated at 73% of All Signups

- **73%** of signups from mobile devices
- Desktop accounted for remaining 27%
- Validates mobile-first design investment

<!-- IMAGE: mobile phone with app interface -->
<!-- Speaker notes: Confirms the mobile-first bet from Q2 last year. -->

---

# Onboarding Completion Fell Short at 68%

- Target: **80%** completion rate
- Actual: **68%** — 12-point gap
- Users drop off mid-flow

<!-- Speaker notes: This needs immediate attention. -->

---

# Payment Setup Is the Key Drop-Off Point

- **Step 3 (payment setup)** has highest abandonment
- Users cite "too many fields" in feedback
- Other steps perform at or above target

<!-- Speaker notes: Step 3 is clearly the bottleneck. -->

---

# Simplified Payment Flow Shipping March 1

- Reducing payment fields from 8 to 3
- Adding Apple Pay and Google Pay
- Expected to lift completion to **80%+**

<!-- Speaker notes: Fix is scoped and on track. -->

---

# NPS Jumped From 32 to 47 Since Beta

- Beta NPS: **32** (below average)
- Post-launch NPS: **47** (above average)
- Biggest drivers: speed, design, reliability

<!-- Speaker notes: 15-point NPS jump is significant. -->

---

# Next Steps: Fix Onboarding, Double Down on Mobile

- **March 1**: Ship simplified payment flow
- **March 15**: Reassess onboarding completion
- **Ongoing**: Invest in mobile-specific features
- **Goal**: 25,000 signups by end of Q1

<!-- Speaker notes: Two priorities: fix onboarding gap, lean into mobile. -->
```

### Render

```bash
marp phoenix-update.md --pdf --allow-local-files
```

Result: 8-slide PDF with consistent styling, assertion titles, concise bullets, and
speaker notes.

## Alternative Formats

### Quarto + Reveal.js

Best for data-heavy or academic presentations needing executable code blocks, LaTeX
math, or citation management.

```bash
quarto render slides.qmd --to revealjs
```

Quarto files use Markdown with YAML frontmatter (same as Marp), so the same generation
workflow applies. Key difference: Quarto can execute R/Python code chunks inline,
embedding live charts.

Use when the user explicitly needs executable code in slides or academic formatting.

### SlideDeck AI

An open-source Streamlit app (github.com/barun-saha/slide-deck-ai) that generates
`.pptx` files directly using python-pptx with JSON as an intermediate format. Supports
multiple LLM providers including local models via Ollama.

Use when native PowerPoint output is required without the Marp-to-PPTX export step.
