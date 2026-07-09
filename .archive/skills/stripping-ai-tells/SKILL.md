---
name: stripping-ai-tells
description: "Detects and removes AI writing tells (ChatGPT-isms, Claude-isms) from text using a three-pass editing workflow: vocabulary sweep, structural cleanup, and voice/tone adjustment. Identifies flagged words (delve, tapestry, robust, pivotal), structural patterns (tricolon abuse, synonym cycling, trailing participles, em-dash overuse), and tonal issues (sycophancy, hedging, importance puffery). Use when the user asks to remove AI tells, humanize AI text, make writing sound less like AI, edit for ChatGPT-isms or Claude-isms, strip AI language, clean up AI-generated content, or review text for machine-generated patterns."
category: Writing & Communication
---

# Stripping AI Tells

## Workflow: Three-Pass Edit

Apply these three passes in order to any text.

Calibrate edit intensity from user intent. If the user asks for a light polish,
make minimal edits. If they ask to fully humanize or aggressively strip AI
language, rewrite more deeply while preserving meaning.

If the user specifies explicit format constraints (template, required bullets,
required headings, word count, or tone), keep those constraints and edit within
them.

### Pass 1: Vocabulary Sweep

Scan for flagged AI words and phrases. For each hit: delete if possible,
replace with a simpler or more specific word, or check whether the sentence
survives without it.

**Top offenders:** delve, tapestry, landscape (as metaphor), robust, pivotal,
nuanced, multifaceted, meticulous, underscore, leverage, foster, embark,
vibrant, intricate, paramount, seamless, testament, holistic, garner, bolster.

**Filler phrases — delete or simplify:**

- "Moreover" / "Furthermore" / "Additionally" → delete, or use "And," "Also"
- "It's important to note that" / "It's worth noting" → delete
- "In today's rapidly evolving [X]" → delete (throat-clearing)
- "In conclusion" / "In summary" → delete unless 20+ page document
- "Due to the fact that" → "because"
- "In order to" → "to"
- "Plays a crucial role" → say what it actually does
- "Harness the power of" / "Unlock the potential of" → "use"

For complete vocabulary tables with replacements and era-specific markers, see
[references/01-detection.md](references/01-detection.md).

### Pass 2: Structural Cleanup

Check for and fix these patterns:

- **Tricolon abuse** — three-item lists used reflexively. Use two items, four,
  or pick the best one.
- **Synonym cycling** — same concept renamed every paragraph. Pick one term,
  stick with it.
- **Trailing participles** — sentences ending in "-ing" clauses that add vague
  significance ("highlighting its commitment to innovation"). Cut or
  substantiate.
- **False ranges** — "From X to Y" where X and Y don't form a real spectrum.
  Name the actual things instead.
- **Uniform paragraph/sentence length** — vary deliberately. Follow long
  sentences with short ones. Allow one-sentence paragraphs.
- **Template intro/conclusion** — cut throat-clearing openers and reflexive
  summaries.
- **Em-dash overuse** — more than 2–3 per 1000 words is suspicious. Replace
  with commas, colons, periods, or split into two sentences.
- **Bullet lists as default** — convert to prose where argumentation or
  narrative would serve better, unless the user explicitly requires list
  format.

For detailed explanations and detection techniques, see
[references/01-detection.md](references/01-detection.md).

### Pass 3: Voice and Tone

- Cut sycophantic or over-eager phrasing ("Great question!", "Certainly!")
- Remove excessive hedging — allow one caveat per claim, not three
  ("arguably," "potentially," "it could be said that")
- Deflate importance puffery — delete "watershed moment," "pivotal shift,"
  "landmark achievement" unless backed by evidence
- Add specific examples, anecdotes, or concrete details where the text makes
  abstract claims
- Preserve the author's intended stance — remove faux-neutral filler, but do
  not invent stronger claims than the source supports
- Check for rhythm uniformity — if three consecutive paragraphs have similar
  sentence lengths and cadence, vary them

For before/after examples and the Top 10 tells summary, see
[references/02-editing-and-quick-reference.md](references/02-editing-and-quick-reference.md).

## Quick smell test

Read the first and last paragraphs. If the first can be deleted without losing
anything, and the last restates what was already said — AI structure. If
neither contains a specific fact, name, number, or opinion — AI tone.

## Edge cases

- **Formal writing is not an AI tell.** Legal, academic, and medical writing
  is naturally formal. Do not strip legitimate register.
- **Em dashes in moderation are fine.** Writers have used them for centuries.
  Only flag density (3+ per 1000 words).
- **"However" and "therefore" are normal.** Standard academic and professional
  transitions — not AI tells.
- **Oxford commas are a style choice,** not an AI tell.
- **Structured documents need structure.** Reports and proposals *should* have
  headers and sections — do not flatten them.
- **Explicit format requirements come first.** If the user requires bullets,
  section headers, or a specific template, preserve that structure and strip AI
  tells inside it.
- **Pattern density is the real signal.** Any single tell is meaningless. A
  piece with "delve," three tricolons, six em dashes, a throat-clearing intro,
  and uniform paragraph length is almost certainly AI-assisted. A piece with
  one em dash and the word "robust" is probably fine.
- **Overcorrection erodes voice.** Strip patterns, not personality. Preserve
  the author's intentional style choices.
