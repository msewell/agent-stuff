---
name: writing-project-status-reports
description: "Writes and reviews high-signal project status reports using RAG indicators, layered structure, and exception-based reporting. Produces weekly, monthly, milestone, and sprint status reports in Markdown. Use when drafting a project status report, reviewing an existing status report for quality, creating executive summaries, setting up RAG health indicators, or advising on reporting cadence and format."
category: Writing & Communication
---

# Writing Project Status Reports

## Workflow: Writing a report

1. **Determine report type.** Default to weekly. Use monthly for executive audiences, milestone for phase gates or major events. See [references/02-process-and-culture.md](references/02-process-and-culture.md) for cadence selection guidance.
2. **Select template.** Load the matching template from [references/04-templates.md](references/04-templates.md). For software projects, append the Sprint Status Addendum to the weekly template.
3. **Set the RAG indicator.** Assign RAG per dimension (schedule, budget, scope, resources, risks). Derive overall RAG from the worst-performing dimension. Use quantitative thresholds — not gut feel. Note any transitions from last period.
4. **Write the executive summary.** 2–3 sentences answering: Are we on track? What's at risk? What's needed from the reader? If a reader stops here, they must have an accurate picture.
5. **Fill key metrics.** 4–6 quantitative indicators. Replace vague assessments with numbers:
   - ❌ "Good progress this week"
   - ✅ "4 of 6 milestones complete; on track for Mar 15 delivery"
6. **Document risks, blockers, and asks.** Each item needs: description, impact (H/M/L), mitigation, owner, and a specific ask. Use the fact → impact → mitigation → ask structure for bad news.
7. **Assign owners and dates to every action item.** An action without an owner is a wish. An action without a date is a suggestion.
8. **Apply exception-based reporting.** Green workstreams get one line. Reserve detail for deviations, risks, and decisions. Aim for ≤5 minutes to read (the 5-15 standard).
9. **Handle quiet periods.** If RAG is unchanged, no new risks, no milestones hit or missed, and no decisions needed — send a one-liner: `[Project] — Week of [Date]: No material changes. Next milestone: [name] on [date].` Never use this for more than two consecutive periods.

## Workflow: Reviewing a report

1. **Check structure.** Verify the five-layer anatomy exists: RAG indicator → executive summary → key metrics → risks/blockers/asks → detailed sections.
2. **Check signal density.** Flag these anti-patterns:
   - **Activity report** — lists tasks done without connecting to outcomes
   - **The novel** — dense paragraphs exceeding one page
   - **Optimism report** — everything green with no risks acknowledged
   - **Changelog** — chronological events without synthesis
   - **Copy-paste** — stale risks and recycled language from prior periods
3. **Check specificity.** Every claim should be quantified. Flag subjective language ("good progress", "some concerns", "team is working hard").
4. **Check action items.** Every item must have an owner AND a date.
5. **Check RAG integrity.** Are thresholds defined? Are they applied consistently? Are transitions called out? Watch for watermelon reporting (green surface, red underneath).
6. **Suggest concrete fixes.** For each issue found, provide a before/after rewrite.

See [references/02-process-and-culture.md](references/02-process-and-culture.md) for the full anti-patterns list and honest reporting culture guidance.

## Key rules

- **Lead with health, not history.** RAG and executive summary come first. Always.
- **Quantify everything.** Numbers over adjectives. Percentages over feelings.
- **Separate fact → impact → mitigation → ask.** This is the structure for all bad news.
- **Link, don't inline.** Reference dashboards, RAID logs, and specs via links.
- **Optimize for scanning.** Bullets, bold, tables, whitespace. No long paragraphs.
- **Tailor depth to audience.** Executives get layers 1–4. Team leads get all five.

## Reference material

- **Principles and report structure**: [references/01-principles-and-structure.md](references/01-principles-and-structure.md) — philosophy, core principles, five-layer anatomy, RAG framework
- **Process, culture, and anti-patterns**: [references/02-process-and-culture.md](references/02-process-and-culture.md) — cadence guide, honest reporting, watermelon problem, anti-patterns
- **Specialized guidance**: [references/03-specialized-guidance.md](references/03-specialized-guidance.md) — software development metrics, quiet periods, report archiving
- **Templates**: [references/04-templates.md](references/04-templates.md) — weekly, monthly, milestone, and sprint status report templates
