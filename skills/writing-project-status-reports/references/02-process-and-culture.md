# Process, Culture, and Anti-Patterns

## Table of Contents

- [Cadence Guide](#cadence-guide)
  - [Weekly Status Report](#weekly-status-report)
  - [Monthly Executive Summary](#monthly-executive-summary)
  - [Milestone / Ad-Hoc Report](#milestone--ad-hoc-report)
  - [Choosing the Right Cadence](#choosing-the-right-cadence)
- [The Culture of Honest Reporting](#the-culture-of-honest-reporting)
  - [The Watermelon Problem](#the-watermelon-problem)
  - [Prerequisites for Honest Reporting](#prerequisites-for-honest-reporting)
  - [Framing Bad News Constructively](#framing-bad-news-constructively)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Cadence Guide

Different cadences serve different purposes. Most organizations need at least two.

### Weekly Status Report

**Purpose:** Keep stakeholders informed of near-term progress, surface blockers early, and maintain momentum.

**Audience:** Project sponsors, steering committee, direct stakeholders.

**Length:** 1 page (strict). Aim for 15 minutes to write, 5 minutes to read.

**Content focus:**
- What changed this week (accomplishments, completions, key decisions made)
- What's planned for next week
- Blockers and risks that need attention now
- Action items with owners and due dates

**When to use:** Active projects with weekly progress cadence. Most projects should have this as their baseline.

### Monthly Executive Summary

**Purpose:** Provide strategic-level visibility into project health, trajectory, and alignment with business objectives.

**Audience:** C-suite, portfolio leadership, board members.

**Length:** 1–2 pages, plus optional appendix with supporting data.

**Content focus:**
- Overall health (RAG) with trend over past months
- Progress against key milestones (% complete, variance)
- Budget status (planned vs. actual, forecast to complete)
- Top 3 risks with mitigation status
- Strategic decisions needed or made
- Outlook for next period

**When to use:** All projects that have executive sponsors or portfolio oversight. Monthly cadence smooths out week-to-week noise and surfaces genuine trends.

### Milestone / Ad-Hoc Report

**Purpose:** Mark significant project events — phase completions, go/no-go decisions, major incidents, or scope changes.

**Audience:** Decision-makers relevant to the specific milestone.

**Length:** Variable; as long as needed, no longer.

**Content focus:**
- What milestone was reached (or missed, and why)
- Acceptance criteria and whether they were met
- Impact on downstream schedule and budget
- Recommendations for next phase or corrective action
- Lessons learned (for phase-gate reports)

**When to use:** At predefined phase gates, after significant incidents, or when a material change to scope/timeline/budget occurs. These are event-driven, not calendar-driven.

### Choosing the Right Cadence

| Situation | Recommended Cadence |
|---|---|
| Active project, regular progress | Weekly |
| Executive portfolio review | Monthly |
| Phase completion or gate review | Milestone |
| Crisis or major blocker | Ad-hoc (immediately) |
| Maintenance / low-activity project | Biweekly or monthly |

---

## The Culture of Honest Reporting

The best template in the world is worthless if the organization punishes honesty. The most dangerous failure mode in status reporting isn't a bad format — it's **systemic dishonesty**.

### The Watermelon Problem

"Watermelon reporting" describes projects that appear green on the surface but are red underneath. This happens when:

- PMs are penalized (formally or socially) for reporting Amber or Red
- Leadership reacts to bad news with blame rather than support
- Escalation is seen as failure rather than responsible risk management
- There's no clear mechanism for a PM to say "I need help" without it being career-damaging

The result: leadership makes decisions based on false confidence, problems compound silently, and projects fail suddenly rather than gradually — often when it's too late to intervene.

### Prerequisites for Honest Reporting

**1. Psychological safety.** Reporting Red must be treated as an act of professional responsibility, not a confession of failure. Leaders must visibly and consistently reward early transparency and punish concealment.

**2. Separate the reporter from the problem.** A PM who reports a Red status is surfacing a problem — they are not necessarily the cause of it. If leadership conflates the messenger with the message, messengers will stop delivering bad news.

**3. Define "what happens when it's Red."** If there's no documented escalation path — no playbook for what leadership does when something is Red — then Red has no purpose. Teams need to know that raising a Red flag triggers help, not just scrutiny.

**4. Celebrate Amber-to-Green recoveries.** When a team identifies a risk early (Amber), mitigates it, and returns to Green, that's the system working exactly as intended. Highlight these as success stories, not near-misses to be anxious about.

**5. Ask better questions in reviews.** Instead of "Why is this Red?", ask "What do you need to get this back to Green?" Instead of "Who's responsible for this delay?", ask "What's the fastest path to recovery and how can I help?"

### Framing Bad News Constructively

When reporting risks or delays, use this structure:

1. **State the fact** — what happened, quantified
2. **State the impact** — what it means for schedule, budget, or scope
3. **State the mitigation** — what's being done about it
4. **State the ask** — what you need from the reader

Example: "The vendor API delivery is 10 days late (fact). This pushes our integration milestone from Mar 15 to Mar 25 (impact). We've started parallel development using a mock API to minimize downstream delay (mitigation). We need executive escalation to the vendor's account manager to expedite delivery (ask)."

This structure communicates bad news without panic, demonstrates ownership, and gives leadership a clear action to take.

---

## Anti-Patterns to Avoid

### The Activity Report

**Symptom:** The report lists everything the team did ("held 3 meetings, wrote 12 tickets, reviewed 5 PRs") without connecting activity to outcomes.
**Fix:** Report outcomes and progress toward milestones, not activities. "Completed user authentication module (milestone 3 of 7)" beats "worked on auth this week."

### The Novel

**Symptom:** Multi-page reports with dense paragraphs that no one reads.
**Fix:** Apply the 5-15 standard. If you can't fit it in one page, you're including too much detail. Link to supporting docs instead of inlining them.

### PowerPoint Engineering

**Symptom:** More time is spent formatting slides than analyzing project health.
**Fix:** Use a plain-text or Markdown template. Beauty is not the goal — clarity is. A well-structured text document beats a polished but slow-to-produce deck.

### The Changelog

**Symptom:** The report is a chronological list of events with no synthesis or interpretation.
**Fix:** Group information by theme (schedule, budget, risks), not by date. Provide analysis: what does this mean, and what should we do about it?

### The Optimism Report

**Symptom:** Everything is always green. Risks are minimized. "Challenges" are described as "opportunities."
**Fix:** Establish clear RAG thresholds and enforce them. If leadership is surprised by a project failure, the reporting system has failed.

### Copy-Paste Syndrome

**Symptom:** This week's report is last week's report with minor edits. Stale risks, unchanged action items, and recycled language.
**Fix:** Start each report fresh from the template. Explicitly address what changed since last period. If nothing changed on a risk or action item, that itself is a signal worth noting ("Risk #3 — vendor delay — no progress on mitigation; escalating").

### The One-Size-Fits-All

**Symptom:** The same report goes to executives, team leads, and individual contributors.
**Fix:** Tailor depth to audience. Executives get Layers 1–4. Team leads get all five layers. ICs get a different format entirely (e.g., sprint review, standup).

### The Meeting Replacement

**Symptom:** A report is sent, but then the same content is presented in a meeting, or vice versa.
**Fix:** A report should eliminate the need for a status meeting, not duplicate it. If you send the report in advance, the meeting (if needed) should focus only on discussion, decisions, and unresolved questions — never on reading the report aloud.
