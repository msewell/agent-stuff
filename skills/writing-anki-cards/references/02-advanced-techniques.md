# Advanced Techniques

## Table of Contents

- [Principle 10: Write Cards That Go Beyond Rote Facts](#principle-10-write-cards-that-go-beyond-rote-facts)
- [Principle 11: Use Imagery and Mnemonics](#principle-11-use-imagery-and-mnemonics)
- [Principle 12: Personalize Relentlessly](#principle-12-personalize-relentlessly)
- [Principle 13: Edit Continuously, Delete Freely](#principle-13-edit-continuously-delete-freely)
- [Principle 14: Card Density Calibration](#principle-14-card-density-calibration)
- [Principle 15: Apply the Emotional Litmus Test](#principle-15-apply-the-emotional-litmus-test)
- [Principle 16: Leverage Strategic Redundancy](#principle-16-leverage-strategic-redundancy)
- [Principle 17: Decompose Procedural Knowledge](#principle-17-decompose-procedural-knowledge)
- [Principle 18: Use Salience Prompts for Creative Application](#principle-18-use-salience-prompts-for-creative-application)
- [Principle 19: Date-Stamp Volatile Knowledge](#principle-19-date-stamp-volatile-knowledge)
- [Quick-Reference Checklist](#quick-reference-checklist)

## Principle 10: Write Cards That Go Beyond Rote Facts

The most durable and useful cards test *understanding*, not just recall of isolated facts. Use these conceptual lenses to generate deeper cards from the same material:

- **Attributes**: "What's always/sometimes/never true about X?"
- **Similarities/differences**: "How does X differ from Y?"
- **Parts/wholes**: "X is a sub-type of what broader category?"
- **Causes/effects**: "What does X cause?" / "What conditions lead to X?"
- **Significance/application**: "Why does X matter in context Z?"

**Example**: Source material states that TCP uses a three-way handshake.

Rote fact card:

> Q: How many steps are in the TCP handshake?
> A: Three (SYN, SYN-ACK, ACK).

Deeper cards from the same material:

> Q: Why does TCP need a three-way handshake rather than a two-way one?
> A: Both sides must confirm they can send *and* receive. Two steps would only confirm one direction.

> Q: What would happen if a TCP connection used only SYN → SYN-ACK (no final ACK)?
> A: The server couldn't confirm the client received its sequence number, leaving the connection half-open and vulnerable to SYN flood attacks.

The rote card is fine to include. But the deeper cards transform memorization into understanding.

## Principle 11: Use Imagery and Mnemonics

Visual associations and mnemonic devices reduce learning time dramatically and combat interference. Especially valuable for:

- Arbitrary facts with no inherent logical structure (dates, names, constants).
- Sets of similar items that interfere with each other.
- Anything that resists vanilla retrieval after multiple reviews.

Do not force a mnemonic for everything. But when a card isn't sticking, creating a vivid mental image or silly association is almost always the right fix. Add it to the `Extra` field so it's available during review.

## Principle 12: Personalize Relentlessly

The self-reference effect means information linked to personal experience is remembered far better than abstract facts. When possible, ground cards in personal context:

- "What is a divan?" → fine.
- "What is a divan? *(like the one in Grandma's living room)*" → significantly stickier.

Not every card needs a personal note. But for stubborn cards or abstract concepts, adding a parenthetical personal connection is one of the highest-leverage edits available.

## Principle 13: Edit Continuously, Delete Freely

Cards are not sacred text. A collection is a living system requiring ongoing curation:

- **Edit during review**. When a card feels ambiguous, too hard, or poorly worded — fix it immediately.
- **Flag for batch revision**. Use Anki's "mark" feature for cards needing research before editing. Review `tag:marked` regularly.
- **Delete without guilt**. A card no longer cared about is pure drag. A bad card kept in review is actively harmful — it trains bad retrievals. Heuristic: if a card isn't worth 10 minutes of total lifetime review, delete it.
- **Rewrite leeches, don't grind through them**. A leech (8+ lapses) is a symptom of a formulation problem. Diagnose: ambiguous? Too complex? Interference? Missing prerequisites? Fix the root cause.

## Principle 14: Card Density Calibration

Card density is a diagnostic signal. Heuristic: a well-studied paper or chapter typically yields 5–20 high-quality cards.

- **Fewer than 5 cards** from a substantial source suggests shallow engagement — the material hasn't been decomposed deeply enough.
- **More than 50 cards** from a single source in one pass suggests atomicity violations, poor filtering, or attempting to memorize material not yet fully understood.

Treat outliers in either direction as a signal to revisit the source material or the card formulations.

## Principle 15: Apply the Emotional Litmus Test

A drop in the pleasure of review is a signal of a formulation problem. When a card triggers an internal sigh or dread, investigate — the card is almost certainly ambiguous, too complex, testing something not worth knowing, or suffering from interference.

The highest-performing collections are ones where review feels clean and even mildly satisfying. When reviewing existing cards, flag any that feel like a grind — the problem is the card, not the user's discipline.

## Principle 16: Leverage Strategic Redundancy

Redundancy does not contradict atomicity. Multiple cards encoding the same knowledge from different angles — each individually atomic — build richer, more interconnected retrieval paths. A single card creates a single memory trace; several complementary cards create a web.

Forms of productive redundancy:

- **"What" + "Why" + "When" triads.** One card for the definition, one for the mechanism/rationale, one for the application context. Each is atomic, but together they make knowledge genuinely usable.
- **Active + passive voice.** "What does X cause?" and "What causes Y?" are different retrieval paths to the same relationship. Both are worth having when the relationship matters.
- **Abstract definition + concrete example.** One card for the general principle, another asking to recognize or classify a specific instance.

**Before** (single overloaded card):

> Q: What is the observer effect in quantum mechanics, why does it happen, and what's an example?
> A: Measuring a quantum system disturbs it because the measurement apparatus interacts with the system. Example: measuring an electron's position with photons changes its momentum.

**After** (three atomic cards, strategically redundant):

> Q: *Quantum mechanics*: What is the observer effect?
> A: The act of measuring a quantum system inevitably disturbs the system's state.

> Q: Why does measurement disturb a quantum system (observer effect)?
> A: The measurement apparatus must physically interact with the system (e.g., photons striking electrons), transferring energy/momentum.

> Q: *Quantum mechanics*: Firing photons at an electron to measure its position changes its momentum. This illustrates the {{c1::observer effect}}.

The key constraint: each redundant card must test a *different retrieval path*. Two cards asking the same question with different wording are waste — they train recognizing paraphrases of the same prompt.

## Principle 17: Decompose Procedural Knowledge

Processes, algorithms, and workflows require different decomposition strategies than declarative facts. Listing steps sequentially recreates the enumeration problem. Instead:

- **Extract decision points and conditions.** The interesting part of a procedure is the branching: *when* to do X, *what triggers* a transition, *how* to recognize you've gone wrong.
- **Isolate critical steps.** Focus on steps easy to forget or get wrong. Routine connective steps don't need cards.
- **Add "heads-up" cards.** Cards that prime for what to expect: "After step X, what should you observe before proceeding?" These test monitoring ability, not rote step recall.
- **Include rationale cards.** "Why is step X done before step Y?" prevents cargo-cult execution and makes the procedure reconstructable from understanding.

**Example**: Decomposing a protocol for restarting a database cluster.

Weak (step enumeration):

> Q: What are the steps to restart the DB cluster?
> A: 1. Drain connections, 2. Verify replication lag < 1s, 3. Stop secondary, 4. Stop primary, 5. Start primary, 6. Verify primary health, 7. Start secondary, 8. Re-enable connections.

Stronger (individual cards):

> Q: Before stopping any node in a DB cluster restart, what must you verify?
> A: Replication lag is below threshold (< 1s) — ensures the secondary is caught up.

> Q: In a DB cluster restart, why must you stop the secondary *before* the primary?
> A: Stopping the primary first would leave the secondary receiving no replication stream, potentially causing it to assume primary role or trigger a failover.

> Q: After restarting the primary in a DB cluster restart, what should you observe before starting the secondary?
> A: Primary health checks pass (accepting connections, replaying WAL). Starting the secondary against an unhealthy primary cascades the failure.

Each card isolates one judgment call or one piece of reasoning.

## Principle 18: Use Salience Prompts for Creative Application

Not all cards need to test factual recall. *Salience prompts* use the spaced repetition schedule to keep an idea top-of-mind so users notice opportunities to apply it.

These cards don't have a single correct answer. They prompt open-ended reflection:

> Q: What's a situation in your current project where the principle of least privilege might reduce risk?

> Q: Where have you recently seen an instance of survivorship bias in a decision?

Guidelines:

- Use sparingly. These are cognitively heavier and don't benefit from the "one right answer" feedback loop.
- Best for high-level principles, mental models, and strategic ideas — where *noticing the opportunity to apply them* is the bottleneck.
- If the same answer keeps emerging, the prompt has calcified into a rote card. Rewrite or delete it.

## Principle 19: Date-Stamp Volatile Knowledge

Some facts change: population figures, API behavior, library best practices, medical guidelines, pricing. Stamp these cards with the date (or version, or source edition) so the user knows when to distrust them.

**Before:**

> Q: What is the population of Tokyo?
> A: ~13.96 million.

**After:**

> Q: What is the population of Tokyo? *(2024 estimate)*
> A: ~13.96 million.

For software-related knowledge, version numbers serve the same purpose:

> Q: In Python {{c1::3.10}}+, what syntax enables structural pattern matching?
> A: `match`/`case` statements.

When encountering a date-stamped card with potentially outdated information, update it immediately — or delete it if the current value can't be verified.

## Quick-Reference Checklist

Before adding a card, verify:

- [ ] **Atomic**: tests exactly one thing
- [ ] **Precise**: admits exactly one answer
- [ ] **Understood**: the answer can be explained without the card
- [ ] **Context-free**: comprehensible in isolation from the prompt alone (assume no deck/tag visibility), with topic cues if needed
- [ ] **Trim**: no unnecessary words
- [ ] **Appropriate type**: cloze for contextual facts, Q/A for "why/how," reversed only when bidirectional recall is needed
- [ ] **Not a list**: if it enumerates, it's been decomposed or given a mnemonic
- [ ] **Not yes/no**: if binary, reframed to retrieve specific information
- [ ] **Stamped**: volatile facts include a date or version
- [ ] **Worth it**: the user will genuinely benefit from remembering this in a year
