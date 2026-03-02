# Report Templates

## Table of Contents

- [Weekly Status Report Template](#weekly-status-report-template)
- [Monthly Executive Summary Template](#monthly-executive-summary-template)
- [Milestone / Ad-Hoc Report Template](#milestone--ad-hoc-report-template)
- [Software Sprint Status Addendum](#software-sprint-status-addendum)

---

Four templates covering the main report types. Use the weekly template as the default. Select the appropriate template based on cadence and audience.

## Weekly Status Report Template

```markdown
# [Project Name] — Weekly Status Report
**Period:** [Week of YYYY-MM-DD]
**Author:** [Name]
**Date:** [YYYY-MM-DD]

## Overall Status: 🟢 Green | 🟡 Amber | 🔴 Red
<!-- Delete the non-applicable indicators -->

**Summary:** [2–3 sentences: what was accomplished, what's at risk,
what needs attention.]

---

## Key Metrics

| Dimension     | Status | Detail                                      |
|---------------|--------|----------------------------------------------|
| Schedule      | 🟢     | On track for [milestone] by [date]           |
| Budget        | 🟢     | [X]% consumed at [Y]% completion             |
| Scope         | 🟡     | [Scope change description]                   |
| Resources     | 🟢     | Fully staffed                                |
| Risks         | 🟡     | [N] open risks; [N] require escalation       |

---

## Accomplishments This Period
- [Accomplishment 1 — linked to milestone or deliverable]
- [Accomplishment 2]

## Planned Next Period
- [Planned item 1 — owner]
- [Planned item 2 — owner]

## Risks & Blockers

| # | Risk / Blocker         | Impact       | Mitigation             | Owner   | Status    |
|---|------------------------|--------------|------------------------|---------|-----------|
| 1 | [Description]          | [H / M / L]  | [What's being done]    | [Name]  | [Open/Closed] |
| 2 | [Description]          | [H / M / L]  | [What's being done]    | [Name]  | [Open/Closed] |

## Decisions Needed

- **[Decision 1]:** [Context and options] — **Needed by [date]** — [Recommended option]
- **[Decision 2]:** [Context and options] — **Needed by [date]** — [Recommended option]

## Action Items

| Action                        | Owner    | Due Date   | Status      |
|-------------------------------|----------|------------|-------------|
| [Action description]          | [Name]   | [Date]     | [New/Done]  |
| [Action description]          | [Name]   | [Date]     | [New/Done]  |

---
*Supporting docs: [Link to project dashboard] | [Link to RAID log] | [Link to roadmap]*
```

## Monthly Executive Summary Template

```markdown
# [Project Name] — Monthly Executive Summary
**Period:** [Month YYYY]
**Author:** [Name]
**Date:** [YYYY-MM-DD]

## Overall Status: 🟢 Green | 🟡 Amber | 🔴 Red

**Executive Summary:**
[3–4 sentences: project health, key achievements this month, primary
risks, and any decisions or support needed from leadership.]

---

## Health Trend

| Month   | Schedule | Budget | Scope | Resources | Risks | Overall |
|---------|----------|--------|-------|-----------|-------|---------|
| [M-2]   | 🟢       | 🟢     | 🟢    | 🟢        | 🟢    | 🟢      |
| [M-1]   | 🟢       | 🟢     | 🟡    | 🟢        | 🟡    | 🟡      |
| Current | 🟡       | 🟢     | 🟡    | 🟢        | 🟡    | 🟡      |

**Trend narrative:** [1–2 sentences explaining any color changes.]

---

## Milestone Progress

| Milestone                  | Planned Date | Forecast Date | Status    |
|----------------------------|--------------|---------------|-----------|
| [Milestone 1]              | [Date]       | [Date]        | ✅ Complete |
| [Milestone 2]              | [Date]       | [Date]        | 🔄 In Progress |
| [Milestone 3]              | [Date]       | [Date]        | ⏳ Upcoming  |

**Schedule variance:** [+/- N days/weeks from baseline. Explanation if > 0.]

---

## Budget Summary

| Category       | Approved  | Spent to Date | Forecast Total | Variance |
|----------------|-----------|---------------|----------------|----------|
| [Category 1]   | $[X]      | $[Y]          | $[Z]           | [+/-]    |
| [Category 2]   | $[X]      | $[Y]          | $[Z]           | [+/-]    |
| **Total**      | **$[X]**  | **$[Y]**      | **$[Z]**       | **[+/-]**|

---

## Top Risks

| # | Risk                      | Likelihood | Impact | Mitigation                  | Owner   |
|---|---------------------------|------------|--------|-----------------------------|---------|
| 1 | [Description]             | [H/M/L]   | [H/M/L]| [Mitigation plan]          | [Name]  |
| 2 | [Description]             | [H/M/L]   | [H/M/L]| [Mitigation plan]          | [Name]  |
| 3 | [Description]             | [H/M/L]   | [H/M/L]| [Mitigation plan]          | [Name]  |

---

## Decisions & Escalations

- **[Decision/Escalation 1]:** [Context] — **Action needed by [date]**
- **[Decision/Escalation 2]:** [Context] — **Action needed by [date]**

## Outlook

[2–3 sentences: what to expect next month, key upcoming milestones,
known challenges on the horizon.]

---
*Appendix: [Link to detailed weekly reports] | [Link to RAID log]
| [Link to budget tracker] | [Link to roadmap]*
```

## Milestone / Ad-Hoc Report Template

```markdown
# [Project Name] — Milestone Report: [Milestone Name]
**Date:** [YYYY-MM-DD]
**Author:** [Name]

## Milestone Summary

| Attribute          | Detail                                  |
|--------------------|-----------------------------------------|
| Milestone          | [Name / description]                    |
| Planned Date       | [Date]                                  |
| Actual Date        | [Date]                                  |
| Variance           | [+/- N days]                            |
| Status             | ✅ Achieved | ⚠️ Partially achieved | ❌ Missed |

---

## Acceptance Criteria

| Criterion                          | Met?  | Notes                   |
|------------------------------------|-------|--------------------------|
| [Criterion 1]                      | ✅/❌ | [Explanation if not met] |
| [Criterion 2]                      | ✅/❌ | [Explanation if not met] |

---

## Impact Assessment

**Schedule impact:** [Effect on downstream milestones and final delivery date.]
**Budget impact:** [Any cost implications.]
**Scope impact:** [Any scope changes triggered by this milestone.]

## What Went Well
- [Item 1]
- [Item 2]

## What Needs Improvement
- [Item 1 — with proposed corrective action]
- [Item 2 — with proposed corrective action]

## Recommendations for Next Phase
- [Recommendation 1]
- [Recommendation 2]

## Decisions Needed
- **[Decision]:** [Context and options] — **Needed by [date]**

---
*Supporting docs: [Links]*
```

## Software Sprint Status Addendum

Append this section to the weekly template for software projects.

```markdown
## Sprint Status (Sprint [N] of [Total])

**Sprint Goal:** [One-sentence sprint goal]
**Goal Confidence:** 🟢 High | 🟡 Medium | 🔴 Low

| Metric                  | This Sprint | Previous Sprint | Trend |
|-------------------------|-------------|-----------------|-------|
| Velocity (points)       | [X]         | [Y]             | ↑/↓/→ |
| Cycle time (days)       | [X]         | [Y]             | ↑/↓/→ |
| Sprint goal met?        | [Yes/No]    | [Yes/No]        |       |
| Items carried over      | [N]         | [N]             |       |
| Deployment count        | [N]         | [N]             |       |
| Open incidents (P1/P2)  | [N]         | [N]             |       |

**Release notes:** [What shipped to production this sprint. Link to changelog.]
**Tech debt:** [Net change: +N added, -N resolved. Notable items.]
**Retro action items:** [Top 1–2 items from retrospective, with owners.]
```
