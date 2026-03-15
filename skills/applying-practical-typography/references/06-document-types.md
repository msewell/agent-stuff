# Document Types

## Table of Contents

- [Emails](#emails)
- [Presentations](#presentations)
- [Résumés](#résumés)
- [Research Papers](#research-papers)
- [Business Cards](#business-cards)
- [Letterhead](#letterhead)
- [Websites](#websites)
- [Responsive Web Design](#responsive-web-design)

---

## Emails

Default to treating email as a typography-free zone. If formatting is
required, stick to common system fonts and do not rely on spacing tricks
specific to a font. Simpler is better.

Do not attach image scans of business cards. Use text so contact info can be
copied and pasted.

## Presentations

The biggest improvement: optimize slides for the audience's reading
environment, not your authoring environment.

**For darkened rooms:**
1. Start with a black background (not dark gray).
2. Use a thin sans serif font in 50% gray or lighter—brighten until legible.
3. Pick a base point size that fits 12–15 lines on screen. Keep this size
   consistent across all slides.
4. Use color with restraint—pale shades over bright ones.
5. Avoid centered text.
6. Turn off auto-resize of text to fit slides.

**For lit rooms:** Avoid pure black text on pure white. Make the background
light gray or the text dark gray to reduce contrast.

Do not use the default bright themes packaged with presentation software.
Confine layout to less than full screen width if the aspect ratio is
inconvenient for typography.

## Résumés

The biggest problem: uncomfortable density from the one-page myth. Unless
required, use two pages if needed—but put the most important info on page
one.

**Key fixes:**
1. Increase page margins; decrease line length.
2. Replace system fonts with professional fonts.
3. Reduce heading sizes relative to body text.
4. Make school/employer names immediately visible (they create credibility).
5. Use gentle list bullets, not heavy ones.

Production tips: use high-quality paper (off-white/ivory, wove not laid) for
print. For digital, ensure PDF formatting is correct. Do not use paper
marketed specifically for résumés.

Résumé is the correct spelling (with accents). Resumé is acceptable. Resume
(no accents) is common but wrong.

## Research Papers

The standard typewriter-era layout (1″ margins, 12pt, double-spaced) is not
optimally legible. If not required by an authority, fix it:

1. Increase page margins to 1.5–2″ for better line length (~65 chars/line).
2. Reduce point size to 10–11 point.
3. Reduce line spacing to 120–145% of point size (use "Exactly").
4. Use a professional font instead of Times New Roman.
5. One space between sentences.
6. Turn on hyphenation.
7. Use first-line indents (1–4× point size), not deep tab indents.
8. Do not underline headings.

The revised layout fits more words per page while improving readability.

## Business Cards

Guiding principles: remove anything nonessential, do not worry about small
text (there is not much of it), build the layout from the text outward.

**Avoid:**
- Goofy or bad fonts.
- Oversized names.
- Information pushed to all four corners (the "baseball-diamond" layout).
- Missing letterspacing on caps.

**Production:** Get cards professionally printed (offset or internet printer).
Do not use perforated laser-print sheets—they are flimsy. Choose paper stock
that feels substantial. Color is a nice touch if understated.

## Letterhead

Divide into foreground (letter text) and background (address block). The
address block should not dominate the page.

**Common problems:**
1. Address block dwarfs the letter text.
2. Foreground and background do not relate visually.
3. Screen-oriented system font used for a printed document.
4. Too much centered text.

**Fixes:** Make the letter text visually prominent. Reduce the address block.
Use a professional font. Start the letter near the top of the page. Avoid
centered text.

**Production options (best to cheapest):** Letterpress printing → offset
printing → internet offset printing → laser printing. For laser: use quality
paper (off-white cotton, wove finish), print the address in a subtle color
(not black), and use a professional font.

## Websites

Outgrown habits from the '90s web (now mostly retired): tiny body text, huge
headings, reliance on a few system fonts, edges crammed with navigation,
layouts built with large color blocks.

**Current guidance:**
1. Use professional fonts (webfonts), not just system fonts.
2. Body text: 15–25 pixels.
3. Heading sizes should be subtle increases, not 200% jumps.
4. Focus on line length (45–90 characters)—do not let text fill the full
   browser width.
5. Less color is more effective—when everything is emphasized, nothing is.
6. Infuse visual ideas from books, posters, art, and other design
   disciplines, not just other websites.

The screen-optimized system fonts of the '90s (Georgia, Verdana) no longer
have a special legibility advantage on modern high-resolution displays.

## Responsive Web Design

The rules of good typography do not change with screen size.

1. Maintain 45–90 character line length at all viewport sizes. Use `vw` units
   in CSS to scale point size and element width together.
2. Set `max-width` on text containers to bound line length.
3. Do not use the CSS `ch` unit for line length—it only measures the width
   of the zero character, not average character width.
4. Be careful with CSS media query breakpoints—large phones can trigger
   mobile layouts on reasonably sized desktop windows. Consider JavaScript
   detection for truly mobile-specific layouts.
