# Page Layout and Structure

## Table of Contents

- [Maxims of Page Layout](#maxims-of-page-layout)
- [Page Margins](#page-margins)
- [Headings](#headings)
- [Hierarchical Headings](#hierarchical-headings)
- [Space Above and Below](#space-above-and-below)
- [Tables](#tables)
- [Grids and Grids of Numbers](#grids-and-grids-of-numbers)
- [Columns](#columns)
- [Rules and Borders](#rules-and-borders)
- [Bulleted and Numbered Lists](#bulleted-and-numbered-lists)
- [Block Quotations](#block-quotations)
- [Tabs and Tab Stops](#tabs-and-tab-stops)
- [Hard Line Breaks](#hard-line-breaks)
- [Carriage Returns](#carriage-returns)
- [Hard Page Breaks and Page Break Before](#hard-page-breaks-and-page-break-before)
- [Keep Lines Together and Keep with Next Paragraph](#keep-lines-together-and-keep-with-next-paragraph)
- [Widow and Orphan Control](#widow-and-orphan-control)
- [Signature Lines](#signature-lines)
- [Web and Email Addresses](#web-and-email-addresses)

---

## Maxims of Page Layout

1. Design the page around the body text, not the other way around. Set body
   text first, then fit other elements around it.
2. Divide the page into foreground (most important content) and background
   (everything else). Give the foreground visual priority.
3. Be consistent. The same type of element should look the same everywhere.
4. White space is not wasted space. It helps readers focus on content.

## Page Margins

Default one-inch margins are too small for proportional fonts. At 12 point,
use 1.5–2.0″ left/right margins on 8.5″ × 11″ paper for comfortable line
length (45–90 characters). Smaller point sizes need larger margins.

On the web, prevent text from filling the full browser width. Focus on line
length—the margins will take care of themselves.

Fear of white space is unfounded. No professionally typeset book or magazine
uses 8.5″ × 11″ paper with one-inch margins and a single text block. Bigger
margins improve readability without sacrificing words per page (because
smaller point size and tighter line spacing compensate).

Top and bottom margins need not equal left/right. To fit more text, reduce
top/bottom. Make the bottom margin ~0.25″ larger than the top to prevent the
text block from looking like it sags.

## Headings

**Structural rule:** Limit to two or three levels. More than three levels
becomes hopelessly confusing for readers.

**Typographic rules:**
1. Do not use all caps for headings. Do not use Title Case.
2. Do not underline.
3. Do not center (except for major section titles like "Introduction").
4. Best emphasis: space above and below the heading.
5. Use bold (not italic) if you want weight—but non-bold headings work too.
6. Increase point size minimally. If body is 12pt, try 12.5 or 13pt.
7. Use at most two levels of indenting.
8. Suppress hyphenation in headings.
9. Use keep-lines-together and keep-with-next-paragraph.

## Hierarchical Headings

Avoid traditional Roman numeral / letter / numeral hierarchies (I, A, 1, a,
i)—they are ambiguous and hard to read. Use tiered decimal numbers instead
(1, 1.1, 1.1.1). Every word processor supports automatic tiered numbering.

## Space Above and Below

The subtlest and most elegant form of emphasis. White space around a heading
works like a dramatic pause. Prefer it over heavy formatting like all caps or
large point sizes.

Semantically, headings relate to following text—put more space above than
below to visually connect the heading to what follows. If using space between
paragraphs, heading space should be larger to create distinction.

## Tables

Tables are the best tool for gridded or complex layouts. Use consistent
formatting across all cells. Add adequate cell padding (white space inside
cells) for readability. Minimize rules (lines)—use horizontal rules only,
and sparingly. Align numbers on the decimal point. Use tabular figures in
numeric columns.

## Grids and Grids of Numbers

A grid is an underlying alignment structure. Use it as a guide, not a rigid
constraint—typography should still look right to the eye.

For grids of numbers: vertical alignment is the key. Use tabular (monospaced-
width) figures so digits line up in columns. Right-align integer columns.
Decimal-align columns with fractional values.

## Columns

Fine in print (especially for long lines that would otherwise exceed optimal
line length). Not recommended on the web—horizontal scrolling between columns
is disruptive. On the web, use a single column with proper margins.

## Rules and Borders

Use sparingly. A rule (horizontal or vertical line) should separate content
only when white space alone is insufficient. Prefer a thin rule (0.5–1 point)
over a thick one. Color the rule lighter than the text to keep it subtle.

## Bulleted and Numbered Lists

Do not type bullets or numbers manually. Use the list function in your word
processor or HTML `<ul>` / `<ol>` tags.

Use a hanging indent so the bullet/number dangles outside the text block and
the text aligns in a clean rectangle.

## Block Quotations

Indent both sides of the text block (not just the left). Do not make block
quotations excessively long—if a quote runs more than a few lines, consider
paraphrasing parts.

## Tabs and Tab Stops

Use tabs for horizontal whitespace in the middle of a line. Set explicit tab
stops rather than relying on defaults. Types: left, right, center, decimal.

Do not use multiple tabs to approximate alignment—set the correct tab stop.

## Hard Line Breaks

Use a hard line break (Shift+Enter / `<br>`) to start a new line within the
same paragraph. Useful for controlling line breaks in headings and centered
text. Do not use carriage returns for this purpose.

## Carriage Returns

Use only when starting a new paragraph. Do not use multiple carriage returns
to create vertical space—use space-before/space-after paragraph settings or
hard page breaks instead.

## Hard Page Breaks and Page Break Before

Use a hard page break (Ctrl+Enter) to move to the top of the next page. Do
not approximate with multiple carriage returns.

Page-break-before is a paragraph-level style attribute that automatically
starts the paragraph on a new page. Useful for chapter openings.

## Keep Lines Together and Keep with Next Paragraph

**Keep lines together:** Prevents a paragraph from splitting across pages.
Always use on headings and short critical paragraphs.

**Keep with next paragraph:** Prevents a page break between this paragraph
and the next. Always use on headings to prevent them from appearing at the
bottom of a page with no following text.

## Widow and Orphan Control

A *widow* is the last line of a paragraph stranded at the top of a new page.
An *orphan* is the first line of a paragraph stranded at the bottom of a
page. Most word processors have an option to prevent both. Whether to enable
it is your call—some typographers accept single-line widows.

## Signature Lines

Type a sequence of underscores for signature lines. Set them at a consistent
length. Do not use the space bar or tabs to create the line.

## Web and Email Addresses

Do not hyphenate URLs or email addresses—hyphenation makes it ambiguous
whether the hyphen is part of the address. Use a nonbreaking space or
zero-width space if you need to control line breaking within an address.
