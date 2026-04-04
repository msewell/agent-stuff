---
name: writing-checklist-communications
description: "Writes and improves checklist-based professional communications -- status updates, requests for action, decision briefs, handoffs, meeting agendas, and process runbooks. Applies structured templates, item-writing rules (verb + object + criteria), and anti-pattern checks to produce clear, actionable checklists. Use when writing a status update, weekly update, or sprint update, drafting a handoff document, creating a decision brief, preparing a meeting agenda, meeting notes, or follow-up, building a runbook, delegating or requesting action from someone, reviewing or improving an existing checklist, or when the user mentions checklists, status reports, meeting minutes, handoff docs, or action items."
category: Writing & Communication
---

# Writing Checklist Communications

## Workflow

1. **Identify the checklist type** from the user's request or existing draft:

   | Type | Use when |
   |---|---|
   | Status Update | Reporting progress, blockers, decisions needed |
   | Request for Action | Asking someone for specific work by a deadline |
   | Decision Brief | Presenting options and a recommendation for sign-off |
   | Handoff | Transferring ownership of work completely |
   | Meeting Agenda / Follow-Up | Making meetings produce decisions and actions |
   | Process Runbook | Enabling first-attempt execution of a repeatable process |

   If the type is ambiguous, default to Request for Action when the user needs something done, or Status Update when reporting.

2. **Read the template and guidance** for that type in [references/01-checklist-types-and-templates.md](references/01-checklist-types-and-templates.md).

3. **Produce the checklist communication.** Write from scratch using user-provided context, or rewrite an existing draft to match the template. Apply the item-writing rules below to every checklist item.

4. **Validate the output** against the anti-patterns and meta-checklist in [references/02-anti-patterns-and-validation.md](references/02-anti-patterns-and-validation.md). Fix any issues before presenting.

## READ-DO vs DO-CONFIRM

| Type | How it works | When to use |
|---|---|---|
| **READ-DO** | Read each item, then perform it immediately. | Unfamiliar processes, new team members, high-stakes sequential procedures. |
| **DO-CONFIRM** | Perform from memory, then verify with the checklist. | Experienced practitioners, routine tasks, post-completion verification. |

Most professional communication checklists are DO-CONFIRM. Label the type explicitly in runbooks and process checklists.

## Item-writing rules

Every checklist item follows this formula:

```
[Action verb] + [specific object] + [completion criteria or destination]
```

Nine rules for every item:

1. **One item = one action.** Never combine two tasks on one line.
2. **Start with an imperative verb.** Verify, Send, Confirm, Draft, Review, Update.
3. **Name an owner** (a person, not a team) **and a deadline** (a date, not "soon").
4. **5-9 items per section.** Working memory holds 7 plus or minus 2.
5. **State what "done" looks like** -- an observable outcome, not a vague activity.
6. **Front-load what the reader must do.** First line, not buried at the bottom.
7. **Cut anything that doesn't earn its line.** Every item added dilutes every other item.
8. **Use parallel structure.** If item one starts with a verb, every item starts with a verb.
9. **Frame positively.** "Update the tracker after each milestone" -- not "Don't forget to update the tracker."

**"Done" definitions -- weak to strong:**

| Vague | Concrete |
|---|---|
| "Prepare for launch" | "Post launch checklist to #ops and get sign-off from @lead" |
| "Coordinate with design" | "Send final specs to @designer and confirm delivery date" |
| "Look into the bug" | "Reproduce the bug locally and post root cause to the ticket" |

## Edge cases

- **Mixed-purpose message**: Split into separate checklists -- one per purpose. A status update combined with a request buries the request.
- **Medium-specific formatting**: Slack -- 7 items max, one screen. Email -- headers, ask at top. Project tools (Jira, Linear) -- native subtasks, link to docs. Docs (Notion, Confluence) -- collapsible sections for FAQ and context.
- **Existing draft improvement**: Identify the type, check each item against the formula and rules, flag anti-patterns, rewrite failing items, restructure to match the template.

## Example

**Input:** "Write a status update for Project Atlas. We shipped the auth flow to prod and fixed the rate limiter bug. Next sprint we're starting the billing integration. We're blocked on the API credentials from the payments team."

**Output:**

```
## Status Update -- Project Atlas -- 2026-04-03

**Overall: At Risk**

### Done
- [x] Ship auth flow to prod
- [x] Fix rate limiter bug (#422)

### Next
- [ ] Start billing integration -- @Jordan -- by 2026-04-10

### Blockers
- [ ] Obtain API credentials from payments team -- Impact: blocks billing integration -- Need: @Priya to provision credentials by 2026-04-04
```

## Reference material

- **Templates and guidance for all 6 types**: [references/01-checklist-types-and-templates.md](references/01-checklist-types-and-templates.md)
- **Anti-patterns and validation**: [references/02-anti-patterns-and-validation.md](references/02-anti-patterns-and-validation.md) -- 7 failure modes, meta-checklist for final validation
