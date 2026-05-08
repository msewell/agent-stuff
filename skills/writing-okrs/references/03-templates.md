# OKR Templates

Keep one Objective per document, page, or top-level heading. Don't cram multiple Objectives into a single dense table — the whitespace is part of the discipline.

## Table of Contents

- [Blank template](#blank-template)
- [Worked example](#worked-example)

---

## Blank template

```markdown
# Objective: <one short, qualitative, motivating sentence>

**Cycle:** Q_ 20__
**Owner:** <single accountable human>
**Type:** [ ] Committed   [ ] Aspirational
**Parent OKR:** <link to the higher-level OKR this supports, or "Company-level">
**Co-owners / dependent teams:** <names or "none">

## Why this matters
<2–3 sentences. What changes in the world if we hit this? Who notices?
What's the cost of not doing it this quarter?>

## Key Results

### KR1: <metric name> from <baseline> to <target> by <date>
- **Metric definition:** <exactly how this is measured, including cohort and window —
  e.g., "trial-to-paid conversion measured at 14 days post-signup, organic + paid search">
- **Baseline (as of <date>):** <number>
- **Target:** <number>
- **Type:** [ ] Committed   [ ] Aspirational
- **Confidence (1–10 or R/Y/G):** <updated weekly>
- **Owner:** <single name>

### KR2: ...
### KR3: ...

## Initiatives believed to move these KRs
<NOT Key Results. These are the projects and bets running this quarter
that are believed to cause the KRs to move. Each needs an owner and week.>

- [ ] <Initiative> — owner: <name>, target: week <N>
- [ ] <Initiative> — owner: <name>, target: week <N>

## Risks and dependencies
- **We depend on:** <other team / system / external factor>
- **Others depend on us for:** <downstream KRs that need this to land>
- **Top risk to delivery:** <one sentence>

## End-of-cycle review
*(filled in at closeout)*
- **KR1 final:** <number> (score: <0.0–1.0>)
- **KR2 final:** <number> (score: <0.0–1.0>)
- **KR3 final:** <number> (score: <0.0–1.0>)
- **Objective score (avg):** <0.0–1.0>
- **Self-assessment (3–5 sentences):** What worked? What didn't? Was this
  the right goal? What would we do differently next cycle?
```

---

## Worked example

```markdown
# Objective: Make the first-run experience so good that new users tell their friends

**Cycle:** Q3 2026
**Owner:** Priya (Head of Product)
**Type:** [x] Aspirational
**Parent OKR:** Company — "Reach default-alive growth by year-end"
**Co-owners / dependent teams:** Engineering (Marco), Growth (Lin)

## Why this matters
Activation is currently 38% — almost two-thirds of signups never reach their
first "aha" moment. Until that's fixed, every dollar of paid acquisition leaks.
Hitting this Objective unlocks both organic referral and paid-channel ROI.

## Key Results

### KR1: Activation rate from 38% to 55% by Sep 30
- **Metric definition:** % of signups who create their first project AND invite
  at least one teammate within 7 days of signup
- **Baseline (as of Jul 1):** 38%
- **Target:** 55%
- **Type:** [x] Aspirational
- **Confidence:** 6/10
- **Owner:** Priya

### KR2: NPS among newly-activated users from 22 to 40 by Sep 30
- **Metric definition:** NPS survey shown 14 days post-activation
- **Baseline:** 22 (n=180, Q2)
- **Target:** 40
- **Type:** [x] Aspirational
- **Confidence:** 5/10
- **Owner:** Priya

### KR3: Organic referral signups from 60/mo to 200/mo by Sep 30
- **Metric definition:** Signups whose first touchpoint is a teammate-invite link
- **Baseline:** 60/month (Jun)
- **Target:** 200/month
- **Type:** [x] Aspirational
- **Confidence:** 4/10
- **Owner:** Lin

## Initiatives believed to move these KRs
- [ ] Redesigned 5-step onboarding flow — owner: Marco, target: week 4
- [ ] In-app prompts for teammate invites — owner: Lin, target: week 6
- [ ] First-project templates (3 use cases) — owner: Priya, target: week 5
- [ ] NPS survey + qualitative follow-up interviews — owner: Priya, target: week 8

## Risks and dependencies
- **We depend on:** Engineering capacity for onboarding refactor (60% of
  Marco's pod, weeks 1–6)
- **Others depend on us for:** Growth team's paid-acquisition KR assumes
  activation lifts to at least 50%
- **Top risk:** If the onboarding refactor slips past week 6, KR3 becomes
  unrecoverable this cycle.
```
