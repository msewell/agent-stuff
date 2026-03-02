# Specialized Guidance

## Table of Contents

- [Software Development Adaptations](#software-development-adaptations)
  - [Delivery Metrics](#delivery-metrics)
  - [Technical Health Signals](#technical-health-signals)
  - [Sprint / Iteration Integration](#sprint--iteration-integration)
  - [Architecture and Security](#architecture-and-security)
- [Handling Quiet Periods](#handling-quiet-periods)
  - [The "No Material Change" Signal](#the-no-material-change-signal)
  - [When to Use It](#when-to-use-it)
  - [When Not to Use It](#when-not-to-use-it)
- [Report Archiving and Retrospective Value](#report-archiving-and-retrospective-value)
  - [Why Archive](#why-archive)
  - [How to Archive Effectively](#how-to-archive-effectively)

---

## Software Development Adaptations

While the core principles are domain-agnostic, software projects have specific signals worth including.

### Delivery Metrics

- **Velocity / throughput:** Story points completed (or tasks completed) vs. plan. Useful as a trend, not a snapshot — show the last 4–6 sprints.
- **Sprint goal completion rate:** Did the team achieve its stated sprint goal? A binary yes/no that's more meaningful than raw velocity.
- **Cycle time:** Average time from "in progress" to "done." Rising cycle times signal process problems.
- **Release status:** What shipped, what's queued, what's blocked from shipping.

### Technical Health Signals

- **Incidents / outages:** Count, severity, MTTR (mean time to recovery). Trend matters more than absolutes.
- **Tech debt trajectory:** Is the team accruing or paying down tech debt? Quantify where possible (e.g., "resolved 3 high-priority tech debt items; 7 remain").
- **Test coverage direction:** Not the absolute number, but the trend — are new features being shipped with tests?
- **Deployment frequency:** How often the team ships to production. A proxy for delivery health.

### Sprint / Iteration Integration

For Agile teams, the weekly status report should align with the sprint cycle:

- **Mid-sprint:** Focus on sprint goal confidence, emerging blockers, and scope changes.
- **End-of-sprint:** Focus on what was delivered vs. committed, carry-over items, and retrospective insights.
- Avoid duplicating the sprint review or retrospective — reference them, don't reproduce them.

### Architecture and Security

For projects with significant architectural or security dimensions, include a line item for:

- **Architecture decisions made** (link to ADRs — Architecture Decision Records)
- **Security review status** (pending, in progress, complete, findings)
- **Dependency / vulnerability status** (new CVEs, patch status)

---

## Handling Quiet Periods

Not every reporting period has material news. But silence is ambiguous — did the author forget? Is something wrong? Did the project stall? Skipping a report forces readers to guess.

At the same time, sending a full report when nothing changed is pure noise. It trains readers to stop paying attention, which means they'll also skim past the report that actually matters.

### The "No Material Change" Signal

When nothing meaningful has changed, send a one-liner instead of a full report:

> **[Project Name] — Week of [Date]: No material changes.** All items tracking as previously reported. Next milestone: [name] on [date].

This accomplishes three things:

1. **Confirms the author is paying attention.** The report exists, so the project is being actively monitored.
2. **Confirms the last report is still accurate.** Readers can rely on the previous report's content without wondering if it's stale.
3. **Respects the reader's time.** No cognitive load, no scanning, no wasted minutes.

### When to Use It

Use the no-material-change format when **all** of the following are true:

- RAG status is unchanged from last period
- No new risks, blockers, or issues have emerged
- No milestones were completed or missed
- No decisions are needed from the reader
- No action items have changed status

If even one of these conditions is false, send a standard report — even if the change seems minor. A risk that quietly appeared and quietly disappeared still deserves a line.

### When Not to Use It

Never use "no material change" for more than two consecutive periods without adding a brief narrative. Three or more quiet weeks in a row may itself be a signal — either the project is in a healthy cruise phase (worth confirming) or progress has silently stalled (worth investigating). After two consecutive quiet reports, add a sentence: *"Project remains in [phase]. Expected to resume active reporting when [trigger]."*

---

## Report Archiving and Retrospective Value

Status reports are written for the present, but their greatest untapped value is in the past tense. A well-maintained archive of status reports is one of the most useful inputs to project retrospectives, post-mortems, and future project planning.

### Why Archive

- **Retrospectives and post-mortems.** The status report archive provides a week-by-week factual record of what was known, what risks were flagged, what decisions were made, and when. This is far more reliable than anyone's memory.
- **Pattern recognition.** Reviewing archived reports across multiple projects reveals recurring risks, common estimation errors, and systemic blockers. "We always underestimate API integration by 2x" is the kind of insight that only emerges from historical data.
- **Onboarding.** A new team member or stakeholder can read the last 4–6 reports to get up to speed on a project faster than any briefing meeting.
- **Audit and compliance.** For regulated industries, archived status reports provide evidence of governance, risk management, and decision-making processes.

### How to Archive Effectively

**1. Store reports in a single, searchable location.** A shared drive folder, a wiki/Confluence space, or a project management tool's document section — not scattered across email inboxes. One canonical location per project.

**2. Use consistent file naming.** Follow a convention that sorts chronologically: `YYYY-MM-DD_project-name_weekly.md` or equivalent. This makes it trivial to find the report from any given week.

**3. Never edit a published report retroactively.** If a correction is needed, add an addendum or note it in the next report. The archive should reflect what was known and communicated at the time, not a revisionist version. This honesty is what makes the archive valuable for retrospectives.

**4. Tag or flag significant reports.** Mark reports that contain major decisions, RAG transitions, or milestone completions. This lets future readers quickly find the turning points without reading every weekly update.

**5. Review the archive during retrospectives.** Make it a standard retrospective practice to walk through the status report timeline. Ask: *"When did we first flag this risk? How long between flagging and resolution? Were our RAG assessments accurate in hindsight?"*
