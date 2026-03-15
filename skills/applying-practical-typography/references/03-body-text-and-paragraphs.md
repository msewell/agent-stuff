# Body Text and Paragraphs

## Table of Contents

- [Body Text Priorities](#body-text-priorities)
- [Point Size](#point-size)
- [Line Spacing](#line-spacing)
- [Line Length](#line-length)
- [First-Line Indents](#first-line-indents)
- [Space Between Paragraphs](#space-between-paragraphs)
- [Justified Text and Hyphenation](#justified-text-and-hyphenation)
- [Optional Hyphens](#optional-hyphens)
- [Paragraph and Character Styles](#paragraph-and-character-styles)

---

## Body Text Priorities

Body text is the most common element in a document. Its appearance determines
the overall look. Always set up body text first, then worry about headings
and other elements.

The four most important choices for body text: font, point size, line spacing,
and line length. Get these right and the document will look professional.

For print body text, default to a serif font. On screen, serif and sans serif
work equally well on modern high-resolution displays.

## Point Size

**In print:** 10–12 point for body text. Do not default to 12 point—try
10, 10.5, or 11.5. Half-point differences are meaningful at this scale.
Different fonts appear different sizes at the same point size—adjust
visually, not just numerically.

**On the web:** 15–25 pixels for body text. Screens are read from farther
away than print. Do not use tiny fonts (the '90s web habit is over).

**For emphasis via size:** use the smallest increment needed. If body text is
11 point, try 11.5 or 12 before jumping to 14.

Point size can go down to 6–8 point for business cards and fine print. At
these sizes, all caps and lowercase are equally legible.

## Line Spacing

Optimal line spacing: 120–145% of the point size.

| Spacing   | Appearance |
|-----------|-----------|
| < 120%    | Too tight  |
| 120–145%  | Optimal    |
| > 145%    | Too loose  |

**Word:** Right-click → Paragraph → Line spacing → "Exactly" (enter fixed
measurement). Do not use "Single" (~117%), "1.5 lines" (~175%), or "Double"
(~233%)—these miss the target. If using "Multiple", enter 1.03–1.24 (not
1.20–1.45, due to Word's peculiar math). Never use "At least."

**Pages:** Format → Style → Spacing → "Exactly."

**CSS:** `line-height` property, preferably unitless (e.g., `1.3` for 130%).

Line spacing affects document length more than point size. Adjust line spacing
first when fitting content to pages.

## Line Length

Optimal: 45–90 characters per line (including spaces).

Quick test: 2–3 lowercase alphabets should fit on one line:
`abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefgh`

**Measuring:** Use word count to check characters per line. Word: Review →
Word Count. Pages: View → Show Word Count → switch to Characters With Spaces.

Adjust line length primarily via page margins. On standard 8.5″ × 11″ paper
at 12 point, use 1.5–2.0″ left/right margins (not the default 1″). On the
web, prevent text from flowing to browser edges—use `max-width` on the
text container.

If planning to use indentation for subsections, start with long enough lines
that indented parts still fall within the 45–90 character range.

## First-Line Indents

Default to space between paragraphs for most documents (shorter, screen-
oriented, or mixed content). Use first-line indents instead for book-like
long-form text. The two are mutually exclusive—use one, not both. First-line
indent on the first paragraph of a section is optional.

Size: 1–4× the point size. At 12 point, that's 12–48 points (0.17–0.67″).
Narrow text blocks need smaller indents; wider blocks need larger.

Do not use word spaces or tabs to create first-line indents. Use the
paragraph-formatting controls.

**Word:** Right-click → Paragraph → Indentation → Special → "First line."

**CSS:** `text-indent` property.

## Space Between Paragraphs

Alternative to first-line indents. Use 50–100% of the body text point size
(4–10 points at typical sizes).

Do not insert extra carriage returns between paragraphs—use the paragraph
spacing control.

**Word:** Right-click → Paragraph → Spacing → After.

**CSS:** `margin-top` and `margin-bottom` properties.

## Justified Text and Hyphenation

Default to left-aligned text (ragged right edge)—it works well in all
contexts and requires no additional setup. Justified text (even left and
right edges) is also acceptable, but **if using justified text, always turn
on hyphenation.** Without it, justified text produces uneven word spacing and
ugly gaps. Hyphenation is optional for left-aligned text but can improve
appearance.

**Word:** Page Layout → Hyphenation → Automatic.

**CSS:** `hyphens: auto` (with `lang` attribute set on the element).

## Optional Hyphens

For words that break awkwardly with automatic hyphenation, insert an optional
hyphen to mark a preferred break point. Optional hyphens are invisible unless
the word actually breaks at that location.

**Word:** Ctrl+Hyphen (Cmd+Hyphen on Mac).

**HTML:** `&shy;` entity.

## Paragraph and Character Styles

Use styles to control typography efficiently across a document. Benefits:

1. **Define formatting sets** applied together (font + size + spacing).
2. **Change formatting globally** by updating the style definition.
3. **Inherit formatting** from parent styles for layered automation.

Name styles by function (e.g., "Block Quotation"), not appearance (e.g.,
"Caslon Bold 11.5"). Modify built-in styles when possible rather than
creating new ones.

Any time two elements should look identical, use a style. Include kerning,
letterspacing, and cap settings in style definitions.
