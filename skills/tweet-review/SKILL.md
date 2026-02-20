---
name: tweet-review
description: Reviews draft tweets and provides engagement optimization recommendations with improved alternatives. Use when the user has a draft tweet or thread and wants feedback on how to maximize reach, replies, and engagement on Twitter/X. Primarily niche-agnostic with additional guidance for tech Twitter.
---

# Tweet Review

Reviews a user's draft tweet against data-driven Twitter/X engagement best practices, identifies strengths and weaknesses, and provides 2–3 improved alternatives.

## Workflow

1. Read all three reference files before analyzing:
   - [references/algorithm-mechanics.md](references/algorithm-mechanics.md) — algorithm weights, SimClusters, negative signals
   - [references/content-strategy-and-craft.md](references/content-strategy-and-craft.md) — strategy, E.H.A. framework, templates
   - [references/engagement-and-execution.md](references/engagement-and-execution.md) — threading, timing, common mistakes
2. Identify whether the draft is a single tweet or a thread.
3. Analyze the draft against the criteria below.
4. Present the review using the output format below.
5. Provide 2–3 rewritten alternatives that address the identified weaknesses while preserving the user's voice and intent.

## Analysis Criteria

Evaluate every draft against these dimensions. Reference specific algorithm weights and best practices from the reference files when explaining each point.

### Hook Strength
- Do the first ~40 characters stop the scroll?
- Does it use a proven hook type (contrarian, curiosity gap, specific number, direct address, confession)?
- Or is the opening generic, vague, or buried?

### Emotional Trigger
- Does the tweet evoke a high-arousal emotion (awe, excitement, humor, surprise, curiosity)?
- Or does it land in low-arousal territory (calm, contentment, generic)?

### Reply Potential
- Is there a reason for the reader to reply? (question, debatable opinion, invitation to share experience)
- Replies are weighted 9× by the algorithm — this is the single most important engagement signal.

### Content Tier
- Classify the tweet using the S/A/B/C tier system from the reference.
- If it falls in B or C tier, suggest how to elevate it.

### Content Bucket
- Identify which bucket the tweet falls into: Authority, Personality, or Shareable.
- Note this for the user's awareness of their content mix.

### Template Fit
- Does the draft align with one of the 12 proven templates?
- If not, suggest the closest template that could strengthen the tweet while keeping the same core message.

### Algorithmic Red Flags
- Check for: external links in the main tweet body, 3+ hashtags, engagement bait without substance, content that could trigger reports/mutes, off-topic drift from the user's niche.
- Flag any negative signals that could suppress reach.

### Length & Format
- Assess character count relative to the tweet's goal (short for shareability, longer for conversation, thread for authority).
- For threads: evaluate hook tweet, per-tweet completeness, padding, and closer/CTA.

### Tech Twitter Considerations
- When the draft is tech-related, apply the Tech Twitter notes from the references (SimCluster placement, practical value + social currency combination, code screenshots, etc.).
- When the draft is not tech-related, skip this dimension.

## Output Format

Structure the review as follows:

```
## Tweet Review

**Draft:** [quote the user's draft]

**Content Bucket:** Authority | Personality | Shareable
**Content Tier:** S | A | B | C
**Closest Template:** [template name, if applicable]

### Strengths
- [what works well, with specific reasons]

### Improvements
- [each weakness, why it matters (cite algorithm weight or best practice), and how to fix it]

### Algorithmic Flags
- [any red flags, or "None detected"]

### Suggested Alternatives

**Option 1:** [rewritten tweet]
↳ *Why this works:* [brief explanation]

**Option 2:** [rewritten tweet — different angle or template]
↳ *Why this works:* [brief explanation]

**Option 3 (optional):** [rewritten tweet — bolder variation]
↳ *Why this works:* [brief explanation]
```

## Rules

- Preserve the user's authentic voice. Rewrites must sound like the user, not like a marketing agency.
- Never add engagement bait ("Like if you agree!") without substantive content backing it.
- Never recommend tactics that risk reports, blocks, or mutes — the -20,000 penalty makes this non-negotiable.
- If the draft contains an external link, recommend moving it to a reply and explain why (0.1× weight).
- If the draft is a thread, review each tweet individually and the thread as a whole.
- Be direct and specific. "Your hook is weak" is useless — say "Your hook buries the insight. Lead with the surprising number instead."
- When suggesting a template, show the user how their specific content maps onto it — do not just name the template.
