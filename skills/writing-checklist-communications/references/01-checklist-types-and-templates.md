# Checklist Types and Templates

## Table of Contents

- [Request for Action](#request-for-action)
- [Handoff](#handoff)
- [Meeting Agenda and Follow-Up](#meeting-agenda-and-follow-up)
- [Process Runbook](#process-runbook)

---

## Request for Action

**Purpose:** Tell someone exactly what is needed, by when, and why -- in one message that requires zero follow-up.

**When to use:** Cross-functional asks, delegation, vendor requests, any time creating work for someone else.

**Principle:** Reduce the number of touches to one. Every round-trip email is a failure of the original message.

### Template

```
## Request: [Short description]

**Why this matters:** [One sentence -- what breaks or stalls if this doesn't happen]
**Deadline:** [Date and time]

### What I need from you
- [ ] [Specific action] -- @owner -- by [date]
- [ ] [Specific action] -- @owner -- by [date]
- [ ] [Specific action] -- @owner -- by [date]

### Context (if needed)
[2-3 sentences max. Link to docs rather than inlining detail.]

### What I've already done
[So they don't duplicate effort or ask questions already answered.]
```

### Guidance

- **Put the ask above the context.** Lead with what is needed; provide context below for those who want it.
- **Number the asks.** This lets the recipient respond "Done with 1 and 3, need clarification on 2" instead of writing a paragraph.
- **"What I've already done" prevents the most common reply.** The number one response to any request is "Did you already try X?" Preempt it.
- **One message, one request type.** Do not combine a handoff with a request for action. The request gets lost.
- **If the email thread hits 3 replies without resolution, switch to a call.** The checklist failed. Escalate the medium.

---

## Handoff

**Purpose:** Transfer ownership of work so completely that the receiving party never needs to come back and ask "wait, what about...?"

**When to use:** Project transitions, shift changes, role transitions, cross-team transfers, going on leave.

**Principle:** Own the handoff. When you are step 3 of 10, behave like step 10 depends on you -- because it does.

### Template

```
## Handoff: [What's being transferred]

**From:** @[name] -- **To:** @[name]
**Effective:** [Date]

### Current State
- Status: [On Track / At Risk / Blocked]
- [One-line summary of where things stand]

### What's Complete
- [x] [Item]
- [x] [Item]

### What's Outstanding
- [ ] [Item] -- Owner: @[name] -- Due: [date] -- Notes: [context]
- [ ] [Item] -- Owner: @[name] -- Due: [date] -- Notes: [context]

### Known Risks
- [Risk] -- Mitigation: [what's in place or needed]

### Key Contacts
| Role | Person | When to contact |
|------|--------|-----------------|
| [Technical lead] | @[name] | [Specific scenario] |
| [Stakeholder] | @[name] | [Specific scenario] |

### Where Things Live
- Repo: [link]
- Docs: [link]
- Dashboard: [link]
- Relevant tickets: [link]
```

### Guidance

- **30% of critical information fails to transfer in handoffs.** The checklist exists to beat that baseline.
- **"Where Things Live" is mandatory.** The number one time sink after a handoff is hunting for links, repos, and docs. Centralize them.
- **Known Risks separates good handoffs from great ones.** Naming the landmines -- things that are not problems yet but will be if ignored -- protects the person after you.
- **Transfer the "why," not just the "what."** For each outstanding item, include enough context that the new owner can make judgment calls without coming back. A handoff that generates three clarifying questions in the first week was incomplete.
- **Both parties sign off.** The sender confirms the handoff is complete. The receiver confirms they have what they need. This two-way confirmation catches gaps that one-directional communication misses.

---

## Meeting Agenda and Follow-Up

**Purpose:** Make meetings produce decisions and actions -- not more meetings.

**When to use:** Any recurring or one-off meeting. Especially cross-functional meetings where alignment is the goal.

**Principle:** Preempt the next two questions. If someone leaves wondering "what did we decide?" or "what am I supposed to do?" -- the follow-up failed.

### Template: Agenda (sent before)

```
## [Meeting Name] -- [Date, Time, Duration]

**Goal:** [One sentence -- what must be true when this meeting ends]

### Pre-reads
- [Link] -- [one-line description of what to look for]

### Agenda
| Time | Topic | Owner | Goal |
|------|-------|-------|------|
| 5 min | [Topic] | @[name] | Inform |
| 15 min | [Topic] | @[name] | Decide |
| 10 min | [Topic] | @[name] | Align |
```

### Template: Follow-Up (sent after)

```
## Follow-Up: [Meeting Name] -- [Date]

### Decisions Made
- [Decision and rationale -- one line each]

### Action Items
- [ ] [Action] -- @owner -- by [date]
- [ ] [Action] -- @owner -- by [date]

### Open Questions (parked for next time)
- [Question] -- Owner to investigate: @[name]
```

### Guidance

- **The agenda is a contract.** It tells attendees what to prepare, what will be discussed, and what kind of participation is expected (inform, decide, align).
- **Every agenda item has an owner and a goal type.** "Discuss the roadmap" is not an agenda item. "Decide Q3 priority order -- @PM -- 15 min" is.
- **Send the follow-up within 2 hours.** Same-day. The longer the wait, the more versions of what was decided will exist in people's heads.
- **Decisions Made is the most important section of the follow-up.** Actions without decisions lack context. Decisions without actions lack teeth. Lead with decisions.
- **If a meeting does not produce decisions or actions, question whether it needed to happen.** A purely informational meeting should have been async.

---

## Process Runbook

**Purpose:** Enable someone to execute a repeatable process correctly on the first attempt, without asking for help.

**When to use:** Deployments, onboarding steps, incident response, release processes, any recurring multi-step procedure.

**Principle:** A good runbook turns a 30-minute "let me find someone who knows how" into a 5-minute execution.

### Template

```
## Runbook: [Process Name]

**Last updated:** [Date] -- **Owner:** @[name]
**Type:** READ-DO / DO-CONFIRM

### Prerequisites
- [ ] [Condition that must be true before starting]
- [ ] [Access, permissions, or tools required]

### Steps
1. [ ] [Action verb] + [specific object] + [expected result]
2. [ ] [Action verb] + [specific object] + [expected result]
3. [ ] [Action verb] + [specific object] + [expected result]

### Verification
- [ ] [How to confirm the process completed successfully]

### Rollback
- [ ] [What to do if something goes wrong at step N]

### FAQ / Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| [What you see] | [Why] | [What to do] |
```

### Guidance

- **Label it READ-DO or DO-CONFIRM.** This tells the reader whether to follow step-by-step or use it as a verification pass. A READ-DO runbook for an experienced operator wastes their time; a DO-CONFIRM runbook for a newcomer leaves them stranded.
- **Include expected results.** After "Run the migration script," add "Expected: output shows 0 errors, 847 rows migrated." Without this, the user cannot distinguish success from silent failure.
- **Rollback is not optional.** If the process can fail, the runbook must cover recovery. Leaving this out guarantees escalation when an error hits at 2 AM.
- **Runbooks decay.** Set a review cadence (quarterly minimum). An outdated runbook is worse than no runbook -- it creates false confidence. Put the "Last updated" date at the top so staleness is visible.
- **The FAQ section captures tribal knowledge.** Every time someone hits an unexpected issue running this process, add it to the table. This stops the same question from being answered twice.
