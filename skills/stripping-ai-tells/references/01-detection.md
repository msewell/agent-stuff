# Detection: Identifying AI Tells

## Table of Contents

- [High-Frequency AI Vocabulary](#high-frequency-ai-vocabulary)
- [Era-Specific Vocabulary](#era-specific-vocabulary)
- [Flagged Transitional and Filler Phrases](#flagged-transitional-and-filler-phrases)
- [Structural Tells](#structural-tells)
- [Punctuation and Formatting Tells](#punctuation-and-formatting-tells)
- [Tonal Tells](#tonal-tells)
- [Model-Specific Fingerprints](#model-specific-fingerprints)

---

## High-Frequency AI Vocabulary

| Word/Phrase | Why Flagged | Replacements |
|---|---|---|
| delve / delve into | 10x more common in AI vs. human text | explore, examine, look at, dig into |
| tapestry | Most famous AI metaphor tell | delete — say what you mean |
| landscape | "Digital landscape," "evolving landscape" — filler | field, area, world, situation |
| robust | Vague intensifier applied to everything | strong, solid, thorough, reliable |
| pivotal | AI calls everything pivotal | key, important, critical, decisive |
| nuanced / multifaceted | "Complex and multifaceted" 700x more common in AI text | complex, layered, detailed |
| meticulous(ly) | Sounds like a thesaurus, not a person | careful, thorough, precise |
| underscore | AI's favorite synonym for "emphasize" | highlight, show, reveal, stress |
| leverage (as verb) | Corporate-AI hybrid jargon | use, apply, take advantage of |
| foster / cultivate | AI gardening metaphors | build, encourage, grow, develop |
| embark | "Embark on a journey" for trivial activities | start, begin, launch |
| vibrant | AI finds everything vibrant | lively, active, energetic, colorful |
| intricate / intricacies | "Intricate interplay" 100x more common in AI text | complicated, detailed, complex |
| paramount | Inflated importance signaling | critical, essential, top priority |
| seamless | Applied indiscriminately | smooth, easy, frictionless |
| testament | "A testament to..." — formulaic importance framing | proof, evidence, sign |
| holistic | Buzzword masquerading as meaning | comprehensive, whole, complete |
| garner | Nobody talks like this | earn, get, attract, win |
| bolster(ed) | Formal stiffness | strengthen, support, reinforce |

## Era-Specific Vocabulary

Wikipedia's AI Cleanup project tracks which word clusters co-occur by model
generation. Use this for forensics — clustering reveals the source model.

| Era | Model | Characteristic Words |
|---|---|---|
| 2023 – mid-2024 | GPT-4 | delve, tapestry, testament, vibrant, meticulous, intricate, interplay, garner, enduring, boasts |
| Mid-2024 – mid-2025 | GPT-4o | align with, fostering, showcasing, highlighting, enhance, bolstered |
| 2024 – present | Claude | certainly, indeed, straightforward, I'd be happy to, nuanced, thoughtful |

If "delve" and "tapestry" cluster together, the text likely originates from
2023-era GPT-4 output.

## Flagged Transitional and Filler Phrases

These are often the first giveaway. Real people rarely write "Moreover" unless
drafting a legal brief.

| AI Filler Phrase | Action |
|---|---|
| Moreover / Furthermore / Additionally | Delete, or use "And," "Also," "Plus" |
| It's important to note that | Delete. If it were important, the sentence would carry itself. |
| It's worth noting / mentioning | Delete. Same problem. |
| In today's rapidly evolving [X] | Delete entirely. Throat-clearing. |
| In conclusion / In summary / Overall | Delete unless writing a 20+ page report. |
| Not only... but also | Restructure. Fine occasionally; AI uses it reflexively. |
| Due to the fact that | Replace with "because." |
| In order to | Replace with "to." |
| Plays a crucial role | Rewrite: say *what* it does, specifically. |
| At the forefront of | Delete or replace with "leading." |
| Harness the power of | Say "use." |
| Unlock the potential of | Say what you actually mean. |
| The future looks bright | Delete. Content-free sentence. |

## Structural Tells

### Tricolon Abuse (Rule of Three)

AI groups ideas in threes reflexively: "research, collaboration, and
problem-solving." One or two tricolons per piece is fine. Five or more is a
pattern.

**Fix:** Use two items, four, or pick the best one. "Creative, smart, and
funny" → "funny and sharp." Better yet, show the trait with an example.

### Synonym Cycling (Elegant Variation)

AI cycles through synonyms due to repetition penalties. A developer becomes a
"practitioner," then a "builder," then an "engineer" in one section.

**Fix:** Pick one term and stick with it. Repetition is clarity.

### Trailing Participles

AI tacks "-ing" clauses onto sentences for shallow analysis: "The company
released earnings, **highlighting its commitment to innovation**."

**Fix:** Make the trailing claim its own sentence with real substance, or
cut it.

### False Ranges

"From intimate gatherings to global movements." Implies a spectrum where none
exists — just two loosely related things.

**Fix:** Name the actual things. "She organized neighborhood meetups and
international conferences."

### Uniform Paragraph and Sentence Length

Human writing is spiky — some sentences are four words, others sprawl. AI
settles into metronomic 15–22-word sentences and 3–5-sentence paragraphs.

**Fix:** Vary deliberately. Follow long with short. Allow one-sentence
paragraphs.

### Template Introductions and Conclusions

AI throat-clears ("In today's fast-paced world...") and reflexively summarizes
("In conclusion...") even in short pieces.

**Fix:** Cut the first paragraph and check if the piece improves (it usually
does). Cut "In conclusion" if it just restates.

## Punctuation and Formatting Tells

### Em-Dash Overuse

Human writers use 2–3 em dashes per piece. AI uses 20+. More than 2–3 per
1000 words is suspicious.

**Fix:** For each em dash, try: (a) deleting it, (b) replacing with a comma,
colon, semicolon, or period, (c) splitting into two sentences.

### Excessive Bolding and Headers

ChatGPT bolds key terms and uses headers aggressively, turning prose into an
outline. Not every paragraph needs a subheader.

### Bullet Lists Where Prose Would Serve Better

ChatGPT defaults to bullet lists for everything. Bullets work for reference
material; they fail for argumentation, storytelling, or persuasion.

## Tonal Tells

### Sycophantic Openers

Claude: "Great question!" "Certainly!" ChatGPT: "Sure! Here's..." In written
content, this manifests as excessive agreeableness and relentless hollow
positivity.

### Hedging and Over-Qualification

"Arguably," "potentially," "it could be said that," "one might consider." One
hedge per section is fine. When every claim is wrapped in cotton wool, the
writing loses authority.

**Fix:** Pick a position. State it. Add one real caveat, not three vague ones.

### Importance Puffery

Everything becomes "a watershed moment," "a pivotal shift," "a landmark
achievement."

**Fix:** Delete grandiose framing. Let facts carry weight.

### Promotional Tone

"Vibrant community," "nestled in the heart of," "thriving ecosystem."
Travel-brochure copy applied to everything.

### Explanation Over Argument

AI summarizes all perspectives neutrally rather than taking a position. The
result is informative but inert — no thesis, no tension, no stakes.

## Model-Specific Fingerprints

| Pattern | ChatGPT | Claude |
|---|---|---|
| Default format | Bullet points, numbered lists, heavy structure | Full paragraphs, literary prose |
| Signature punctuation | Bold text, headers everywhere | Em dashes |
| Tone | Structured, versatile, can sound formulaic | Natural-sounding but overly eager, slightly literary |
| Sycophancy | "Sure! Here's..." | "Great question!" / "You're absolutely right!" |
| Weakness | Falls into clichés; over-structures | Over-explains; avoids firm positions; elegant variation |
| Vocabulary tells | delve, tapestry, landscape, pivotal, vibrant | certainly, indeed, straightforward, nuanced, thoughtful |
| Structural habit | Outlines disguised as prose | Long flowing sentences with appositives and em dashes |
