# Text Formatting

## Table of Contents

- [Bold or Italic](#bold-or-italic)
- [All Caps](#all-caps)
- [Small Caps](#small-caps)
- [Underlining](#underlining)
- [Centered Text](#centered-text)
- [Color](#color)
- [Kerning](#kerning)
- [Letterspacing](#letterspacing)
- [Ligatures](#ligatures)
- [OpenType Features](#opentype-features)

---

## Bold or Italic

Use bold or italic to emphasize text. Do not use both together. Do not use
either one frequently—if everything is emphasized, nothing is. Reserve for
key terms, titles, and truly important words.

**Bold** is for strong, decisive emphasis. It creates contrast through
weight (dark vs. light). Bold is preferred for headings because it stands
out better on the page.

**Italic** is for gentle emphasis, foreign words, titles of works, and
technical terms on first use. Italic creates contrast through shape (slanted
vs. upright). Use italic for document titles, case names, and species names.

## All Caps

Fine for less than one line of text (e.g., headings, labels, acronyms).
Never for whole paragraphs—all caps are harder to read in bulk because
they eliminate the ascender/descender variation that aids word recognition.

Always add 5–12% extra letterspacing to all caps text. Without it, caps
look too tight.

## Small Caps

Use real small caps (designed at the proper optical weight), not fake ones
(which are just shrunken capitals and look too thin). If your font lacks real
small caps, do not use them at all—fake small caps are worse than no small
caps.

Always add 5–12% letterspacing to small caps, just like all caps.

**Word:** Right-click → Font → check Small caps (only works well with
OpenType-capable fonts).

**CSS:** `font-variant: small-caps` (or the OpenType feature `smcp`).

## Underlining

Never underline in print. It was a typewriter-era substitute for italic
(typewriters had no italic). On the web, underlining is acceptable for
hyperlinks; avoid using it for non-clickable text to prevent confusion.

## Centered Text

Use sparingly. Acceptable for short phrases: titles, headings, business card
names. Never center whole text blocks—centering makes blocks difficult to
read because both edges are uneven, and harder to align with other page
elements.

If centering, use hard line breaks to control where lines break.

## Color

**In print:** Body text must always be black. At body-text point sizes, color
is not effective for emphasis. Professionally printed items (letterhead,
business cards) can use color judiciously—prefer multiple shades of one
color over multiple contrasting colors.

**On screen:** Consider dark gray text instead of pure black—screens project
light, so dark gray is often more comfortable. Color remains idiomatic for
hyperlinks. Avoid colored non-clickable text that could be confused for links.

**In PDFs:** If the PDF might be printed, use black body text.

**In presentations:** Use color with restraint—prefer pale shades over bright
ones. See document-types reference for more.

## Kerning

Kerning adjusts specific letter pairs to improve spacing. Always turn it on.

**Word:** Right-click → Font → Advanced → check "Kerning for fonts 8 Points
and above."

**Pages:** On by default.

**CSS:** `text-rendering: optimizeLegibility` and enable OpenType feature
`kern`.

## Letterspacing

Letterspacing (tracking) adjusts horizontal space between all letters. Do not
letterspace lowercase body text. Do add 5–12% extra letterspacing to all
caps and small caps text—especially at small sizes.

**Word:** Right-click → Font → Advanced → Spacing box. Use 0.6–1.4 points
per 12 points of text.

**CSS:** `letter-spacing: 0.05em` to `0.12em`.

Include letterspacing in paragraph/character style definitions for caps styles.

## Ligatures

Ligatures combine two characters that would otherwise collide. They are
mandatory only when f and i (or similar combinations) visually overlap—check
in bold and italic too. Beyond that, ligatures are a stylistic choice.

**Word:** Right-click → Font → Advanced → Ligatures → Standard Only.

**CSS:** OpenType feature `liga`, or `text-rendering: optimizeLegibility`.

Do not insert ligatures manually—they confuse spell-checkers, hyphenation
engines, and search indexers.

## OpenType Features

OpenType features (alternate figures, small caps, ligatures, fractions) require
support from both the font and the application. Not all fonts include them;
not all apps support them.

**Word (≥2010/Win, ≥2011/Mac):** Supports ligatures, alternate figures, and
stylistic sets. Excel and PowerPoint do not support any.

**Pages:** Font panel → gear icon → Typography.

**CSS:** `font-feature-settings` property.

Check font specimen sheets to see which features are available.
