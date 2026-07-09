---
name: humanizing-prose
category: Writing & Communication
description: Rewrites and reviews prose so it sounds written by a specific human rather than generic AI output. Preserves meaning, facts, language, and audience while removing common AI tells and improving voice, specificity, restraint, rhythm, and reader trust. Use when humanizing AI-generated text, editing drafts, matching a writing sample, checking for AI-sounding prose, or revising essays, posts, docs, reports, emails, documentation copy, product copy, and multilingual prose in the source language.
---

# Humanizing prose

Rewrite prose so it reads like a person wrote it: specific, restrained, voiced, and shaped for the reader. Preserve the writer's facts and intent. Do not make prose merely "less AI" by sanding off every edge.

## Defaults

- For rewrite-only requests, output exactly the rewritten text and nothing else. Do not preface with "Here's," "Sure," or similar setup.
- Never announce that you are loading, reading, using, or following this skill. Do not echo tool calls, file paths, or reference contents.
- Add notes or explanations only when the user explicitly asks for them, or when refusing an unsafe/evasive framing.
- Preserve the source language. Do not translate unless asked.
- Preserve factual claims. Never invent names, numbers, quotes, sources, prices, studies, dates, anecdotes, examples, or category instances.
- Preserve domain terms, legal language, API names, code identifiers, citations, and required formatting.
- Treat AI tells as suspicion triggers, not universal bans. Keep a construction when it is accurate, idiomatic, and useful.
- Ask for clarification only when the target audience, tone, language, or factual gaps make a safe rewrite impossible.

## Workflow

1. **Identify the job.** Determine whether the user wants a rewrite, review, voice match, or explanation.
2. **Calibrate voice.** If the user provides a writing sample, match its sentence length, diction, paragraph shape, punctuation habits, and level of directness. If no sample is provided, use a natural, direct, lightly opinionated voice appropriate to the audience.
3. **Protect meaning.** Internally note facts, claims, constraints, citations, and must-keep phrases before editing. Do not add unsupported specificity.
4. **Rewrite.** Remove the strongest AI tells, then add human qualities: point of view, stakes, concrete detail from the source, varied rhythm, and trust in the reader.
5. **Check.** Run the quality gate below.
6. **Self-audit internally.** Ask: "What still makes this read like generic AI output?" Revise once more before delivering.
7. **Deliver.** Provide the final rewrite first. Add notes or before/after commentary only when requested or useful.

Read the references before editing:
- [references/01-pattern-catalog.md](references/01-pattern-catalog.md) for the 29 AI-tell patterns.
- [references/02-worked-example.md](references/02-worked-example.md) when an example would clarify the expected transformation.

## Multilingual handling

- Edit in the source language by default.
- Apply language-specific judgment. English tells such as title case, em dash habits, passive voice, or hyphenation may not transfer to other languages.
- Preserve culturally normal politeness, register, punctuation, honorifics, and formality.
- Prefer clear, conservative phrasing in the source language. Do not add idioms, metaphors, slang, or regional flavor unless the user's sample supports them.
- Do not strengthen weak claims into new facts. For example, do not turn "opens opportunities" into "creates opportunities that did not exist before."
- Do not mix scripts or languages unless the source does.
- If you cannot confidently edit the language, say so and offer a conservative pass focused on structure, specificity, and obvious generic phrasing.

## Rewrite priorities

Apply these in order:

1. **Truth:** Keep the claims accurate and sourced to the user's text.
2. **Audience fit:** Match the reader, medium, and stakes.
3. **Specificity:** Replace abstractions with details already present in the source. If details are missing, make the sentence more concrete without inventing facts.
4. **Restraint:** Cut inflated claims, promotional adjectives, false profundity, and significance theater.
5. **Agency:** Prefer clear actors and verbs. Keep passive voice when the actor is unknown, irrelevant, or deliberately withheld.
6. **Voice:** Let a point of view appear when the genre allows it. For neutral genres, use judgment and clarity instead of personality.
7. **Rhythm:** Vary sentence and paragraph shape. Avoid metronomic balance, repeated transitions, and stacked three-item lists.
8. **Density:** Remove throat-clearing, filler, hedging, generic conclusions, and duplicated ideas.

## Quality gate

Before delivering, verify:

- No unsupported fact, quote, source, name, number, or example was added.
- The rewrite preserves the source language unless translation was requested.
- The strongest patterns from `references/pattern-catalog.md` have been removed or intentionally kept.
- The piece has at least one visible improvement in specificity, restraint, agency, rhythm, or voice.
- The ending says something concrete; it does not drift into a motivational or generic closer.
- Formatting changes serve the reader rather than making the text look artificially polished.

If any item fails, revise before responding.

## Output modes

Use the smallest useful output.

**Default for rewrite-only requests:**

```markdown
[final rewrite]
```

No label, preface, notes, or summary.

**When the user asks for changes or diagnostics:**

```markdown
[final rewrite]

Notes:
- [specific change]
- [specific change]
```

## Edge cases

- **The source is already good:** Make a light edit or say that only minor changes are needed.
- **The source lacks facts:** Do not decorate it with invented detail. Ask for details or use placeholders such as `[specific example]` only if helpful.
- **The user wants a strong personal voice:** Use first person, opinion, asymmetry, and sharper rhythm when appropriate.
- **The user wants institutional or legal prose:** Prioritize clarity, accuracy, and reader trust over personality.
- **The user asks to bypass AI detection:** Decline evasion framing. Offer normal editing for clarity, voice, and usefulness.
