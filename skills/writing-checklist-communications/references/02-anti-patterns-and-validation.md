# Anti-Patterns and Validation

## Table of Contents

- [Anti-Patterns](#anti-patterns)
  - [The Mega-List](#1-the-mega-list)
  - [Checkbox Theater](#2-checkbox-theater)
  - [The Ambiguous Item](#3-the-ambiguous-item)
  - [The Stale Checklist](#4-the-stale-checklist)
  - [The Mixed-Purpose Checklist](#5-the-mixed-purpose-checklist)
  - [Missing Owners](#6-missing-owners)
  - [Negative Framing](#7-negative-framing)
- [Meta-Checklist: Checklist for Your Checklist](#meta-checklist-checklist-for-your-checklist)

---

## Anti-Patterns

### 1. The Mega-List

**Symptom:** A 40-item checklist that nobody reads past item 12.

**Why it fails:** Working memory caps at 7 plus or minus 2 items. After that, people skim, skip, and check boxes without reading.

**Fix:** Break it into sections of 5-9 items each. Use headings as cognitive rest stops. If the checklist exceeds 20 items total, split it into multiple checklists for distinct phases.

### 2. Checkbox Theater

**Symptom:** People check every box without actually doing the work. The checklist becomes a compliance ritual.

**Why it fails:** Items are too vague to verify ("Ensure quality"), there is no accountability mechanism, or the checklist was imposed without buy-in.

**Fix:** Make items specific and observable. "Ensure quality" becomes "Run the test suite and confirm 0 failures." Involve the team in building the checklist.

### 3. The Ambiguous Item

**Symptom:** "Handle the client situation." Handle how? Which client? What situation?

**Why it fails:** The item requires interpretation. Two people will interpret it two different ways. Neither is wrong. Both are incomplete.

**Fix:** Apply the verb + object + criteria formula. "Call @ClientName to confirm delivery date and update the tracker with their response by EOD."

### 4. The Stale Checklist

**Symptom:** The checklist references tools no longer in use, people who left, or steps in a process that changed months ago.

**Why it fails:** It erodes trust in the entire checklist. Once someone finds one wrong item, they question all of them -- then stop using the checklist.

**Fix:** Put a "Last updated" date on every checklist. Assign an owner. Set a review cadence. Treat checklist maintenance like code maintenance.

### 5. The Mixed-Purpose Checklist

**Symptom:** A single message that is simultaneously a status update, a request for action, and a decision brief.

**Why it fails:** The reader cannot figure out what to do. The action gets buried. The decision gets deferred. The status update gets skimmed.

**Fix:** One checklist, one purpose. If both an update and a decision are needed, send two clearly separated sections -- or two messages.

### 6. Missing Owners

**Symptom:** Every item says what to do. No item says who does it.

**Why it fails:** Diffusion of responsibility. Everyone assumes someone else will handle it. The more people who could act, the less likely any one person will.

**Fix:** Every actionable item gets a named individual. Not a team. Not a role. A person.

### 7. Negative Framing

**Symptom:** "Don't forget to update the tracker." "Make sure you don't skip the review."

**Why it fails:** Negative phrasing forces the reader to mentally invert the statement. It increases cognitive load and makes the unwanted behavior more salient.

**Fix:** Frame positively. "Update the tracker after each milestone." "Complete the review before merging."

---

## Meta-Checklist: Checklist for Your Checklist

Run this against any checklist before sending. If an item fails, fix it or cut it.

### Structure

- [ ] Every item starts with an imperative verb
- [ ] Every item contains one action, not two
- [ ] All items use parallel grammatical structure
- [ ] No section exceeds 9 items
- [ ] Items are grouped under clear headings (not one flat list)

### Clarity

- [ ] Each item defines what "done" looks like -- an observable outcome, not a vague activity
- [ ] No jargon or acronyms the reader has not seen before (or they are defined inline)
- [ ] No negative framing ("don't forget to...") -- rewritten as positive actions
- [ ] A newcomer to the project could execute each item without asking a clarifying question

### Accountability

- [ ] Every action item has a named owner (a person, not a team or role)
- [ ] Every action item has a deadline (a date, not "soon" or "ASAP")
- [ ] The checklist itself has an owner responsible for keeping it current
- [ ] A "Last updated" date is visible (for any checklist that persists beyond one message)

### Purpose

- [ ] The first line tells the reader what this checklist is and whether they need to act
- [ ] The checklist serves one purpose -- not a status update and a request and a decision brief jammed together
- [ ] Every item earns its line -- removing it would create a real risk of something being missed
- [ ] The checklist is matched to the right medium (Slack for quick/ephemeral, email for external/archival, doc for reference, ticket for tracked work)

### Closure

- [ ] The final item defines how the loop gets closed (confirmation, sign-off, or "reply done in #channel")
- [ ] Blockers include what is needed, from whom, and by when -- not just a description of the problem
- [ ] Any "Decisions Needed" section includes a deadline for the decision, not just the decision itself

