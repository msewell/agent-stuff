# Principles and Report Structure

## Table of Contents

- [Philosophy: Signal Over Noise](#philosophy-signal-over-noise)
  - [The 5-15 Standard](#the-5-15-standard)
  - [Exception-Based Reporting](#exception-based-reporting)
- [Core Principles](#core-principles)
  - [Lead with Health, Not History](#lead-with-health-not-history)
  - [Be Specific and Quantitative](#be-specific-and-quantitative)
  - [Separate Facts from Interpretation](#separate-facts-from-interpretation)
  - [Assign Every Action Item an Owner and a Date](#assign-every-action-item-an-owner-and-a-date)
  - [Link, Don't Inline](#link-dont-inline)
  - [Use a Consistent Template](#use-a-consistent-template)
  - [Optimize for Scanning](#optimize-for-scanning)
- [Anatomy of a High-Signal Status Report](#anatomy-of-a-high-signal-status-report)
- [The RAG Framework](#the-rag-framework)
  - [Define RAG Criteria Explicitly](#define-rag-criteria-explicitly)
  - [Apply RAG at Multiple Levels](#apply-rag-at-multiple-levels)
  - [RAG Transitions Matter](#rag-transitions-matter)

---

## Philosophy: Signal Over Noise

Every sentence in a status report must earn its place. The reader — typically a time-constrained executive — is asking exactly three questions:

1. **Are we on track?** (health)
2. **What do I need to worry about?** (risks and blockers)
3. **What do you need from me?** (decisions and escalations)

Everything else is context that supports those three answers. If a section doesn't serve one of them, cut it.

### The 5-15 Standard

Yvon Chouinard (founder of Patagonia) formalized this principle in the 1980s with the **5-15 report**: a status update that takes no more than **15 minutes to write** and **5 minutes to read**. This remains the gold standard for signal density. If your report takes longer than 5 minutes to read, it contains noise. If it takes longer than 15 minutes to write, your reporting process needs fixing — probably through better tooling or automation.

### Exception-Based Reporting

The highest-signal reports focus on **deviations from plan**, not on plan confirmation. If a workstream is green and progressing as expected, it needs one line — not a paragraph. Reserve detail for what's changed, what's at risk, and what needs action. This is exception-based reporting: report the exceptions, not the routine.

---

## Core Principles

### Lead with Health, Not History

Open with the project's overall status (RAG indicator) and a 2–3 sentence executive summary. Readers who only have 30 seconds should get the full picture from this alone. Detailed sections exist for those who choose to read further.

### Be Specific and Quantitative

Replace subjective assessments with measurable statements:

| Low Signal (Noise) | High Signal |
|---|---|
| "Good progress this week" | "4 of 6 milestones complete; on track for Mar 15 delivery" |
| "Some concerns about timeline" | "API integration delayed 5 days; revised ETA is Mar 20" |
| "Team is working hard" | "Velocity: 34 points (vs. 40-point target); capacity reduced by 1 engineer on leave" |
| "Budget is fine" | "72% of budget consumed at 68% project completion" |

### Separate Facts from Interpretation

State what happened (fact), then state what it means (interpretation), then state what should be done (recommendation). This lets readers form their own judgment while still getting yours.

### Assign Every Action Item an Owner and a Date

An action item without an owner is a wish. An action item without a date is a suggestion. Every item in the report that requires follow-up must have both. Use the format: **[Owner] — action — by [date]**.

### Link, Don't Inline

Reference supporting material (detailed specs, dashboards, RAID logs, meeting notes) via links rather than embedding them. This keeps the report lean while still providing depth for those who need it.

### Use a Consistent Template

Readers should always know where to find what they need. A standardized structure across all projects and all reporting periods reduces cognitive load and speeds up comprehension. Consistency also makes it easy to spot changes between periods.

### Optimize for Scanning

Use bullet points, bold key terms, tables, and whitespace. Avoid long paragraphs. Executives scan — they don't read linearly. Structure your report so the critical information is visible even during a 30-second scan.

---

## Anatomy of a High-Signal Status Report

A high-signal status report has five layers, ordered from most-glanceable to most-detailed:

```
┌─────────────────────────────────────────┐
│  1. RAG Indicator (1 second)            │  ← Glance
├─────────────────────────────────────────┤
│  2. Executive Summary (30 seconds)      │  ← Scan
├─────────────────────────────────────────┤
│  3. Key Metrics Snapshot (1 minute)     │  ← Review
├─────────────────────────────────────────┤
│  4. Risks, Blockers & Asks (2 minutes)  │  ← Engage
├─────────────────────────────────────────┤
│  5. Detailed Sections (5+ minutes)      │  ← Deep dive
└─────────────────────────────────────────┘
```

**Layer 1 — RAG Indicator:** A single color (or emoji/text equivalent) that communicates overall project health at a glance.

**Layer 2 — Executive Summary:** 2–3 sentences covering: what was accomplished, what's at risk, and what needs executive attention. This is the single most important section. If a reader stops here, they should still have an accurate picture.

**Layer 3 — Key Metrics Snapshot:** A small table or set of bullet points showing 4–6 quantitative indicators: schedule status, budget burn, milestone progress, resource utilization, and 1–2 domain-specific metrics.

**Layer 4 — Risks, Blockers, and Asks:** The actionable core of the report. Each risk or blocker includes: description, impact, mitigation plan, owner, and what's needed from the reader (decision, resource, escalation).

**Layer 5 — Detailed Sections:** Workstream-by-workstream progress, upcoming milestones, dependency status, and any other supporting detail. Most executives won't read this layer — it exists for project managers, team leads, and anyone who needs to drill down.

---

## The RAG Framework

RAG (Red / Amber / Green) is the most widely adopted project health indicator. Its power lies in simplicity, but that simplicity is easily undermined by vague or inconsistent definitions.

### Define RAG Criteria Explicitly

Every project should have **documented, quantitative thresholds** for each color. Without these, RAG becomes a subjective mood ring.

| Color | Meaning | Example Criteria |
|---|---|---|
| **🟢 Green** | On track. No intervention needed. | Schedule variance < 5%; budget within 5%; no critical risks |
| **🟡 Amber** | At risk. Issues identified; mitigation underway. | Schedule variance 5–15%; budget 5–10% over; risks with partial mitigation |
| **🔴 Red** | Off track. Requires executive intervention. | Schedule variance > 15%; budget > 10% over; critical unmitigated risks |

### Apply RAG at Multiple Levels

Don't just assign one RAG to the whole project. Break it down by dimension:

- **Schedule:** Are we hitting milestones on time?
- **Budget:** Are we within approved spend?
- **Scope:** Is scope stable, or is it creeping?
- **Resources:** Do we have the people and skills we need?
- **Risks:** Are identified risks being managed?

An overall project RAG is then derived from these component RAGs — typically taking the color of the worst-performing dimension, or applying a documented rollup rule.

### RAG Transitions Matter

The RAG color itself is less important than the **direction of change**. A project that moved from Green to Amber is a more urgent signal than one that has been Amber for three weeks. Always note transitions explicitly: "Schedule moved from 🟢 to 🟡 this period due to vendor delay."
