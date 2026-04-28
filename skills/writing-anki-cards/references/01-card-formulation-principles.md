# Card Formulation Principles

## Table of Contents

- [The Core Mental Model](#the-core-mental-model)
- [Principle 1: One Atomic Fact Per Card](#principle-1-one-atomic-fact-per-card)
- [Principle 2: Demand Exactly One Answer](#principle-2-demand-exactly-one-answer)
- [Principle 3: Never Memorize What You Don't Understand](#principle-3-never-memorize-what-you-dont-understand)
- [Principle 4: Avoid Sets and Enumerations](#principle-4-avoid-sets-and-enumerations)
- [Principle 5: Avoid Yes/No Questions](#principle-5-avoid-yesno-questions)
- [Principle 6: Make Cards Context-Free](#principle-6-make-cards-context-free)
- [Principle 7: Optimize Wording Ruthlessly](#principle-7-optimize-wording-ruthlessly)
- [Principle 8: Combat Interference Proactively](#principle-8-combat-interference-proactively)
- [Principle 9: Use Cloze Deletions as Your Default](#principle-9-use-cloze-deletions-as-your-default)

## The Core Mental Model

Card design is task design. Every card assigns the user a recurring cognitive task — potentially thousands of times over years. A well-formulated card makes each repetition a clean, sub-10-second retrieval that strengthens a useful memory trace. A poorly formulated card burns that same time reinforcing noise: pattern-matching against phrasing, recalling what a specific card "wants," or grinding through ambiguous retrievals that never solidify.

Spaced repetition is a garbage-in, garbage-out system. The algorithm is the easy part. Card formulation is where the leverage is.

## Principle 1: One Atomic Fact Per Card

The minimum information principle is the single most impactful rule. A card should ask about exactly one thing. Complex cards with multi-part answers create several failure modes:

- Forgetting one sub-item fails the whole card, dragging well-known sub-items back to short intervals.
- Remembering "most of it" and passing dishonestly, never solidifying the weak sub-item.
- Each sub-item can't be scheduled at its own natural interval.

**Before:**

> Q: Describe the Dead Sea.
> A: The Dead Sea borders Israel, Jordan, and Palestine. It lies 430m below sea level, making it the lowest point on Earth. Its salinity is 34.2%, roughly 9.6x saltier than the ocean. Its high density lets swimmers float effortlessly. It's called "Dead" because almost no macroscopic organisms can survive in it.

**After** (five separate cards):

> Q: What is the lowest land elevation on Earth?
> A: The shore of the Dead Sea, at ~430m below sea level.

> Q: The Dead Sea's salinity is roughly how many times that of the ocean?
> A: ~9.6x (34.2% vs ~3.5%).

> Q: Why can swimmers float effortlessly in the Dead Sea?
> A: Extreme salinity creates high water density, providing buoyancy greater than body weight.

Each card isolates one retrievable fact. The art is in the decomposition.

## Principle 2: Demand Exactly One Answer

Every card should be precise enough that the same answer emerges on every review. Ambiguous prompts create interference: the user learns to recognize what a particular card "wants" rather than learning the underlying knowledge.

### Trap: Under-constrained cloze deletions

**Before:**

> The Articles of Confederation had no power to regulate {{c1::commerce}}.

This admits infinite correct completions — *taxation*, *the military*, *interstate disputes*. The user memorizes "what goes in this blank" rather than the actual relationship.

**After:**

> Economic relations between states were chaotic under the Articles of Confederation because they granted no power to {{c1::regulate interstate commerce}}.

The surrounding context constrains the answer to a single valid completion.

### Trap: "Give an example" cards

**Before:**

> Q: What's an example of a non-combinatorial circuit?
> A: Memory.

This memorizes two things: the concept *and* the specific example this card demands. Invert the direction:

**After:**

> In digital electronics, a memory circuit is an example of a {{c1::non-combinatorial (sequential)}} circuit.

Recognizing examples is more practically useful than generating them on command, and the retrieval is unambiguous.

### Trap: Unclear desired specificity

**Before:**

> Q: Why is Earth's rotation slowing down?
> A: Tidal deceleration.

Does this want the term? The mechanism? The gravitational explanation? The card trains guessing its expectations.

**After:**

> Q: What is the name for the gravitational effect that causes Earth's rotation to slow over time?
> A: Tidal deceleration.

If understanding the mechanism is also needed, write a separate card for that.

## Principle 3: Never Memorize What You Don't Understand

If the user can't explain the answer in their own words without the card, they don't understand it — and the card will become a leech.

The litmus test: could you explain *why* the answer is what it is to someone else? If not, prerequisite cards are needed, or the source material needs revisiting.

Corollary: **learn before you memorize**. Cards are for *retention* of understood material, not for initial acquisition. If the source material is unclear, flag it rather than generating cards from it.

## Principle 4: Avoid Sets and Enumerations

Unordered sets are nearly impossible to memorize as single cards. Ordered enumerations are only slightly easier and still violate atomicity. To handle lists:

1. **Create individual understanding cards** for each list member — what it is, why it matters, how it relates to the others.
2. **Create a mnemonic card** if ordering matters — one card for the mnemonic itself, one card to expand the mnemonic into the full list.

**Before:**

> Q: What are the five stages of grief?
> A: Denial, Anger, Bargaining, Depression, Acceptance.

**After:**

> Q: What mnemonic encodes the Kubler-Ross stages of grief?
> A: DABDA — Denial, Anger, Bargaining, Depression, Acceptance.

> Q: Expand DABDA (Kubler-Ross grief stages).
> A: Denial, Anger, Bargaining, Depression, Acceptance.

Plus individual cards for each stage if understanding their characteristics matters.

Before memorizing any list, ask: is recalling this as an ordered sequence actually needed, or is understanding each element sufficient?

## Principle 5: Avoid Yes/No Questions

Binary answers are harder to remember and less useful than specific retrievals. They waste the answer's information-carrying capacity.

**Before:**

> Q: Is segmentation used on modern x86-64 processors?
> A: No, it was removed starting with the x86-64 architecture.

Only "No" is retrieved — the valuable context about which architecture removed it never gets actively recalled.

**After:**

> Segmentation was common on older x86 processors but was removed in {{c1::x86-64}}.

Now the specific, useful fact is retrieved.

## Principle 6: Make Cards Context-Free

Every card must be fully comprehensible in isolation — as if a stranger found it on the ground.

Assume Anki review is effectively **front-only**: the reviewer may not see deck name, tags, or source metadata while answering. The prompt itself must carry enough topic context to disambiguate what domain the card is about.

### Missing topic context

When reviewing interleaved subjects, a card like "Memory is an example of a {{non-combinatorial}} circuit" could confuse someone also studying cognitive science. If the prompt could plausibly belong to multiple domains, add topic context directly to the card:

> *Electronics*: Memory is an example of a {{c1::non-combinatorial (sequential)}} circuit.

A prefix, a field label, or context woven into the sentence all work. The goal is instant disambiguation from the prompt alone.

### Source-dependent phrasing

**Before:**

> Q: One of the textbook's key focuses in Ch.1 is measuring {{what you don't know}}.

This references a specific book the user may not remember in two years. It asks about the *source*, not the *idea*.

**After:**

> Q: Statistics encompasses not just describing known quantities but contextualizing them within {{c1::what remains unknown (uncertainty)}}.

Ask about ideas, not about where they were read.

## Principle 7: Optimize Wording Ruthlessly

Every unnecessary word is friction multiplied by hundreds of future reviews. Trim aggressively. The question should trigger the target memory as directly as possible.

**Before:**

> Q: The Aldus Corporation developed a program called PageMaker that was one of the first desktop publishing applications, but it eventually started losing market share to a competing product. What was that product?
> A: QuarkXPress.

**After:**

> Q: Which competitor overtook Aldus PageMaker in desktop publishing?
> A: QuarkXPress.

Same retrieval, a quarter of the reading time. Over hundreds of reviews, this compounds enormously.

## Principle 8: Combat Interference Proactively

Interference — confusing similar items — is the dominant cause of forgetting in mature collections. The failure mode isn't "I forgot" but "I retrieved the wrong similar thing."

Strategies:

- **Add distinguishing context** to each interfering card so the retrieval paths diverge.
- **Create explicit comparison cards**: "How does X differ from Y?" forces the brain to encode the distinction rather than just the two items independently.
- **Use vivid personal associations**. Link each item to a different personal memory, image, or emotional experience. Interference shrinks dramatically when items have distinct associative contexts.
- **Suspend one, master the other**. When two new cards interfere, suspend one until the other is firmly learned, then reintroduce it.
- **If a card becomes a leech**, it's almost always an interference or formulation problem — not a discipline problem. Rewrite the card.

## Principle 9: Use Cloze Deletions as Your Default

Cloze deletions provide built-in context (the surrounding sentence), constrain answers naturally, and are faster to create than Q/A pairs. For most factual and conceptual knowledge, a well-crafted cloze is the superior card type.

Guidelines for effective cloze use:

- **Keep the deletion short and specific**. Deleting half a sentence recreates the "complex answer" problem.
- **One cloze per card** (one `c1` deletion, or multiple `c1` deletions that together form a single coherent piece). Multiple `c1`/`c2`/`c3` on one note creates multiple cards — ensure each stands alone.
- **Provide enough surrounding context** to constrain the answer to one valid completion, but not so much that the answer is trivially inferable without retrieval.

Reserve **Basic Q/A** for when a question can't be naturally embedded in a declarative sentence — "why" and "how" questions are often better as explicit Q/A pairs.

**Choose retrieval direction deliberately.** Bidirectional cards (Basic and Reversed) earn their doubled review cost only when both recognition and production are genuinely needed — foreign language vocabulary, symbol-to-name mappings, abbreviation-to-expansion pairs. For most conceptual knowledge, stick with unidirectional. "What does X cause?" and "What is caused by Y?" are pedagogically different questions; if both are needed, write two deliberately distinct cards rather than relying on auto-reversal, which tends to produce one natural card and one awkward one.
