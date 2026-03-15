# Characters and Symbols

## Table of Contents

- [Straight and Curly Quotes](#straight-and-curly-quotes)
- [Apostrophes](#apostrophes)
- [Hyphens and Dashes](#hyphens-and-dashes)
- [Ellipses](#ellipses)
- [Foot and Inch Marks](#foot-and-inch-marks)
- [Nonbreaking Spaces](#nonbreaking-spaces)
- [Word Spaces](#word-spaces)
- [One Space Between Sentences](#one-space-between-sentences)
- [White-Space Characters](#white-space-characters)
- [Math Symbols](#math-symbols)
- [Trademark and Copyright Symbols](#trademark-and-copyright-symbols)
- [Paragraph and Section Marks](#paragraph-and-section-marks)
- [Parentheses, Brackets, and Braces](#parentheses-brackets-and-braces)
- [Ampersands](#ampersands)
- [Exclamation Points](#exclamation-points)
- [Ordinals](#ordinals)
- [Accented Characters](#accented-characters)

---

## Straight and Curly Quotes

Use curly quotes, not straight quotes. Straight quotes are a typewriter habit.

| Mark | Windows  | Mac OS                  | HTML      |
|------|----------|-------------------------|-----------|
| "    | alt 0147 | option + [              | `&ldquo;` |
| "    | alt 0148 | option + shift + [      | `&rdquo;` |
| '    | alt 0145 | option + ]              | `&lsquo;` |
| '    | alt 0146 | option + shift + ]      | `&rsquo;` |

Turn on the smart-quotes feature in your word processor. In HTML, use the
explicit entities or a smart-quote library (e.g., smartypants).

## Apostrophes

Apostrophes always point downward (same shape as closing single quote).
Common error: leading apostrophes in contractions ('70s, rock 'n' roll) often
render as opening single quotes (pointing upward). Fix by typing two single
quotes and deleting the first, or by inserting the apostrophe character
directly.

In Hawaiian words, the okina (glottal stop) points upward—use an opening
single quote for okinas (Hawai'i), not an apostrophe.

## Hyphens and Dashes

| Mark | Name    | Windows  | Mac OS                  | HTML      |
|------|---------|----------|-------------------------|-----------|
| -    | hyphen  | -        | -                       | -         |
| –    | en dash | alt 0150 | option + hyphen         | `&ndash;` |
| —    | em dash | alt 0151 | option + shift + hyphen | `&mdash;` |

**Hyphen** uses: end-of-line word breaks (automatic), compound words
(cost-effective), phrasal adjectives (listener-supported radio). No hyphen
after adverbs ending in -ly (closely held company). No hyphen in most
prefixes (nonprofit, not non-profit).

**En dash** uses: ranges (1880–1912, pages 330–39), connections between word
pairs (conservative–liberal split, Sarbanes–Oxley Act). If opened with
"from", pair with "to" instead (from 1880 to 1912). Do not use a slash where
an en dash is correct.

**Em dash** uses: breaks between parts of a sentence—when a comma is too weak
but a colon or parentheses too strong. Do not approximate with two or three
hyphens. Set flush against surrounding text; add word spaces if the em dash
looks crushed.

## Ellipses

Use the ellipsis character (…), not three periods with or without spaces.

| Mark | Windows  | Mac OS             | HTML       |
|------|----------|--------------------|------------|
| …    | alt 0133 | option + semicolon | `&hellip;` |

Use nonbreaking spaces around or within ellipses to prevent line-break
separation.

## Foot and Inch Marks

Use straight quotes (′ ″) for foot and inch marks, not curly quotes. Override
smart quotes: type the mark, then Undo to revert curly to straight. In HTML,
use `&#39;` and `&#34;`.

## Nonbreaking Spaces

Use a nonbreaking space before numeric or alphabetic references (§ 1782,
¶ 49, Ex. A, Fig. 23), after honorifics (Sgt. Rock), and after trademark/
copyright symbols. Prevents awkward line breaks.

| Context | Windows                            | Mac OS         | HTML      |
|---------|------------------------------------|----------------|-----------|
| nbsp    | control + shift + space (or option) | option + space | `&nbsp;`  |

In HTML source, prefer `&nbsp;` over the invisible character for readability.

## Word Spaces

Use exactly one word space at a time. Do not use multiple word spaces for
alignment—use tabs, indents, or CSS instead.

## One Space Between Sentences

Always one space after terminal punctuation. Never two. This is the
settled custom of professional typographers. No exceptions (unless forced by
an authority figure).

## White-Space Characters

Six important white-space characters, each with a distinct function: word
space, nonbreaking space, tab, hard line break, carriage return, hard page
break. Use the right one for the job—do not approximate one with another.

To display invisible characters: Word → ¶ button (Ctrl+Shift+8); Pages →
View → Show Invisibles (⌘+Shift+I).

## Math Symbols

Use real math symbols for multiplication (×), minus (−), and division (÷).
Do not use x, -, or /. The en dash (–) is acceptable as a minus sign.
Multiplication symbol is also correct in dimensional notations (8.5″ × 14″).

In HTML: `&minus;` `&times;` `&divide;`

## Trademark and Copyright Symbols

| Mark | Windows  | Mac OS     | HTML      |
|------|----------|------------|-----------|
| ™    | alt 0153 | option + 2 | `&trade;` |
| ®    | alt 0174 | option + r | `&reg;`   |
| ©    | alt 0169 | option + g | `&copy;`  |

Do not use alphabetic approximations like (TM) or (c). Trademark symbols are
superscripted; no space between text and symbol. Copyright symbols appear
inline; use a nonbreaking space between © and the year. "Copyright © 2026"
is redundant—use one or the other.

## Paragraph and Section Marks

¶ (paragraph mark / pilcrow): option+7 / `&para;`
§ (section mark): option+6 / `&sect;`

Always follow with a nonbreaking space. At the start of a sentence, spell out
the word. For multiple references, double the mark (¶¶, §§).

## Parentheses, Brackets, and Braces

Do not apply bold or italic formatting to parentheses/brackets—keep them
roman even if the content inside is bold or italic. Exception: italicize
parentheses when needed to prevent visual collision with adjacent italic
characters.

## Ampersands

Correct in proper names (Fromage & Cracotte LLP). Otherwise, the more formal
the document, the fewer ampersands.

## Exclamation Points

Budget one exclamation point per document longer than three pages. Never use
multiple exclamation points in a row.

## Ordinals

Do not superscript ordinals (1st, 2nd, 304th). Turn off automatic
superscripting in your word processor. In HTML, do not use `<sup>` tags for
ordinals.

## Accented Characters

Accented characters in proper names must always appear accurately (it's a
misspelling otherwise). For loanwords, check a dictionary—some are
naturalized (naive) and some are not (cause célèbre).
