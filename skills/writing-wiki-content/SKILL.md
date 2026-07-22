---
name: writing-wiki-content
description: Drafts, rewrites, copy-edits, and reviews English-language wiki content. Produces clear, neutral, accessible prose and concrete recommendations for structure, language, punctuation, dates, links, lists, quotations, and formatting. Use when writing or reviewing a wiki article, knowledge-base page, Markdown wiki page, or documentation page.
category: Writing & Communication
---

# Writing wiki content

Write reader-facing knowledge pages in clear, formal English.

## Workflow

1. Determine whether the request is a draft, rewrite, or review. Read the supplied page and local guidance before changing prose.
2. Infer the page's established English variety, spelling, date format, capitalization, punctuation, terminology, heading style, and link form. Preserve coherent existing choices. When no choice is inferable, write plain international English and use American spelling only when a spelling choice is unavoidable.
3. Start every whole-page draft or review with [page structure and lists](references/01-page-structure-and-lists.md), [prose, tone, and quotations](references/02-prose-tone-and-quotations.md), [consistency and editorial process](references/03-consistency-and-editorial-process.md), and [Markdown syntax](references/04-markdown-syntax.md).

   Read additional references when the task needs it:
   - [Grammar and usage](references/05-grammar-and-usage.md) for sentence construction, pronouns, agreement, or technical language.
   - [English variety and names](references/06-language-names-and-formatting.md) for spelling, proper names, or historical names.
   - [Capitalization and abbreviations](references/07-capitalization-and-abbreviations.md) for capitals, acronyms, symbols, or short forms.
   - [Text formatting and titles](references/08-text-formatting-and-titles.md) for emphasis, titles of works, or literal text.
   - [Pronunciation and non-English text](references/09-pronunciation-and-non-english-text.md) for IPA, translations, romanization, or diacritics.
   - [Punctuation](references/10-punctuation.md) for quotation marks, apostrophes, dashes, brackets, or sentence punctuation.
   - [Dates, numbers, and units](references/11-dates-numbers-and-units.md) for dates, times, ranges, measurements, currencies, or quantities.
   - [Links, images, and accessibility](references/12-links-images-and-accessibility.md) for links, alternative text, accessible structure, or code examples.
4. Review the page in this order: purpose and scope; lead and section structure; factual clarity and neutral tone; quotations and attribution; terminology and consistency; punctuation, dates, and numbers; links and images; then Markdown validity.
5. Treat a request that supplies facts as a closed fact set unless it explicitly permits research or inference. State only supplied facts and necessary logical relationships. Do not add likely uses, causes, effects, audience roles, history, motives, or recommendations that the material does not state.
6. Make the smallest change that resolves each issue. Preserve facts, source meaning, proper names, titles of works, and the spelling or dialect of direct quotations. Do not invent links, sources, dates, facts, terminology, or specialized conventions.
7. Validate the result. Confirm that headings are sequential, lists have a clear purpose and parallel grammar, quotations retain their meaning, links have useful destinations, and images have useful alternative text. If a check fails, revise the page and validate it again. Return only after every check passes.

## Output

### Draft or rewrite

Return the completed page in the response. Do not create, edit, or save a file unless the user explicitly asks. Follow the page only with unresolved findings that prevent a sound draft. Pair each finding with a concrete action.

In the page, do not address the reader as *you* or *your*. When the page identifies an audience, describe the audience directly: “Stable suits teams that need predictable deployments”, not “Choose Stable if you need predictable deployments”.

### Review

Return only findings and concrete recommendations. Order them by impact:

1. **Blocking:** The content is inaccessible, misleading, structurally broken, or invalid Markdown.
2. **High impact:** The page has an unclear scope, missing context, non-neutral tone, inconsistent conventions, or unhelpful links.
3. **Polish:** The page needs more concise wording, less repetition, or corrections to punctuation, capitalization, or emphasis.

For every finding, identify the affected text, explain the reader impact in one sentence, and give a specific replacement or action. Do not return inferred local conventions separately.

## Boundaries

Apply the guidance to reader-facing prose, headings, lists, block quotations, links, images, and code examples. Follow supplied local policy for source selection and citation requirements. Preserve quotation integrity, use hyperlinks, and never invent a source. Prefer prose to a list when a passage reads easily as paragraphs; prefer a rewrite to excessive emphasis, abbreviations, parentheticals, or punctuation.
