---
name: applying-practical-typography
description: "Applies and reviews professional typography rules based on Butterick's Practical Typography. Covers characters and symbols (curly quotes, dashes, ellipses, nonbreaking spaces), text formatting (bold/italic, caps, kerning, letterspacing, color), body text settings (point size, line spacing, line length, indents, hyphenation), page layout (margins, headings, tables, lists, columns), font selection (professional vs system fonts, mixing, alternate figures), and document-specific guidance (emails, presentations, résumés, research papers, business cards, letterhead, websites). Use when generating or reviewing text for documents, web pages, presentations, or any formatted output, when the user asks about typography rules, when checking for common typography mistakes (straight quotes, double spaces, bad fonts, improper dashes), or when setting up document styles and layouts."
category: Writing & Communication
---

# Applying Practical Typography

Prioritize readability over aesthetics. Choose what reinforces the meaning
of the text, not what looks prettiest in isolation.

## Workflow: Applying typography rules

1. **Set up body text first.** Choose font, point size (10–12pt print,
   15–25px web), line spacing (120–145%), and line length (45–90 chars).
2. **Use correct characters.** Curly quotes (not straight), proper dashes
   (not hyphens), real ellipses, proper symbols (©, ™, ×).
3. **Format with restraint.** Bold or italic (not both). No underlining in
   print. All caps only for short runs, with 5–12% extra letterspacing.
   One exclamation point per document. One space between sentences.
4. **Configure layout.** Margins large enough for proper line length.
   Headings: max 3 levels, bold preferred, space above/below for emphasis.
   First-line indents or paragraph spacing (not both).
5. **Use styles.** Define paragraph and character styles for consistency
   and efficient global changes.

## Workflow: Reviewing text for typography issues

Check for these common problems (in priority order):

1. **Straight quotes** instead of curly quotes or apostrophes.
2. **Double spaces** between sentences.
3. **Hyphens** used where en dashes (ranges, pairs) or em dashes (breaks)
   belong.
4. **Bad fonts** — Arial, Comic Sans, Papyrus, Copperplate, Times New Roman.
5. **Underlining** used for emphasis (print context).
6. **Missing letterspacing** on all caps or small caps text.
7. **Line length** too long (>90 chars) or too short (<45 chars).
8. **Point size** too large (12pt is often too big for print body text).
9. **Fake small caps** (shrunken capitals instead of real small caps).
10. **Alphabetic approximations** for symbols ((c), (TM), --, ...).

## Key rules (summary)

| Rule | Correct | Wrong |
|------|---------|-------|
| Quotes | "curly" 'quotes' | "straight" 'quotes' |
| Apostrophes | '70s, rock 'n' roll | '70s, rock 'n' roll |
| Em dash | word—word | word--word |
| En dash | 1980–2020 | 1980-2020 |
| Ellipsis | word… | word... or word . . . |
| Sentence spacing | one space | two  spaces |
| Trademark | MegaCorp™ | MegaCorp(TM) |
| Copyright | © 2026 | (c) 2026 |
| Multiplication | 8.5″ × 14″ | 8.5" x 14" |
| Ordinals | 1st, 2nd | 1<sup>st</sup>, 2<sup>nd</sup> |

## Reference material

Consult these for detailed guidance on specific topics:

- **Characters and symbols** (quotes, dashes, ellipses, spaces, accents,
  math symbols, trademark/copyright): [references/01-characters-and-symbols.md](references/01-characters-and-symbols.md)
- **Text formatting** (bold/italic, caps, small caps, underlining, color,
  kerning, letterspacing, ligatures, OpenType): [references/02-text-formatting.md](references/02-text-formatting.md)
- **Body text and paragraphs** (point size, line spacing, line length,
  indents, paragraph spacing, hyphenation, styles): [references/03-body-text-and-paragraphs.md](references/03-body-text-and-paragraphs.md)
- **Page layout and structure** (margins, headings, tables, grids, columns,
  lists, page breaks, widow/orphan control): [references/04-page-layout-and-structure.md](references/04-page-layout-and-structure.md)
- **Font selection** (professional vs system fonts, bad fonts, mixing,
  monospaced, alternate figures): [references/05-font-selection.md](references/05-font-selection.md)
- **Document types** (emails, presentations, résumés, research papers,
  business cards, letterhead, websites, responsive design): [references/06-document-types.md](references/06-document-types.md)

To search for a specific topic across all references:
```bash
grep -i "your_topic" references/*.md
```

## When NOT to use this skill

- Code formatting, Markdown syntax, or technical documentation conventions
  (those follow different rules)
- Plain-text-only contexts where typographic characters are unavailable
  (e.g., terminal output, log files)
