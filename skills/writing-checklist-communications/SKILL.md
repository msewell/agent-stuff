---
name: writing-checklist-communications
description: "Writes and improves checklist-based professional communications -- requests for action, handoffs, meeting agendas/follow-ups, and process runbooks. Applies structured templates, item-writing rules (verb + object + criteria), and anti-pattern checks to produce clear, actionable checklists. Use when drafting a request for action, creating a handoff document, preparing a meeting agenda, writing meeting follow-up notes, building a runbook, delegating work, asking for specific action by a deadline, or reviewing and improving an existing checklist-based communication."
category: Writing & Communication
---

# Writing Checklist Communications

## Workflow

1. **Identify the checklist type** from the user's request or existing draft:

   | Type | Use when |
   |---|---|
   | Request for Action | Asking someone for specific work by a deadline |
   | Handoff | Transferring ownership of work completely |
   | Meeting Agenda / Follow-Up | Making meetings produce decisions and actions |
   | Process Runbook | Enabling first-attempt execution of a repeatable process |

   If the type is ambiguous, default to Request for Action when the user needs something done.

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

- **Mixed-purpose message**: Split into separate checklists -- one per purpose. A handoff combined with a request buries the request.
- **Medium-specific formatting**: Slack -- 7 items max, one screen. Email -- headers, ask at top. Project tools (Jira, Linear) -- native subtasks, link to docs. Docs (Notion, Confluence) -- collapsible sections for FAQ and context.
- **Existing draft improvement**: Identify the type, check each item against the formula and rules, flag anti-patterns, rewrite failing items, restructure to match the template.

## Example

**Input:** "Draft a request for action to get production API credentials from the payments team by tomorrow so billing integration can start."

**Output:**

```
## Request: Production API credentials for billing integration

**Why this matters:** Billing integration cannot start without credentials; this blocks sprint scope.
**Deadline:** 2026-04-05 17:00

### What I need from you
- [ ] Provision production API credentials for Project Atlas -- @Priya -- by 2026-04-05
- [ ] Confirm credential delivery in #atlas-engineering -- @Priya -- by 2026-04-05

### Context (if needed)
Billing integration begins next sprint. Auth flow is already in production.

### What I've already done
Opened access request ticket #4221 and shared required scopes in the ticket.
```

## Reference material

- **Templates and guidance for all checklist types**: [references/01-checklist-types-and-templates.md](references/01-checklist-types-and-templates.md)
- **Anti-patterns and validation**: [references/02-anti-patterns-and-validation.md](references/02-anti-patterns-and-validation.md) -- 7 failure modes, meta-checklist for final validation
