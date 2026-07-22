# Text formatting and titles

## Table of contents

- [Text formatting and titles](#text-formatting-and-titles)
  - [Table of contents](#table-of-contents)
  - [Emphasis](#emphasis)
  - [Titles of works](#titles-of-works)
  - [Quotations and typographic conformity](#quotations-and-typographic-conformity)
  - [Code examples](#code-examples)

## Emphasis

Use emphasis only when a reader needs to distinguish a word, phrase, contrast, or term. In strict Markdown, use italics with single asterisks:

```markdown
The change was *not* reversible.
```

Do not use bold, all capitals, quotation marks, underlining, color, large type, or extra spacing as a substitute for emphasis. Overuse weakens emphasis and makes a page harder to scan. Rewrite a sentence when it needs repeated emphasis to carry its meaning.

Italicize only the text that needs emphasis. Do not italicize adjacent punctuation unless the punctuation itself belongs to an italicized title or quoted source. Do not use italics merely because a statement is a quotation.

Use bold only for a clearly defined structural purpose that strict Markdown can express and that local practice supplies. Do not use it to decorate lead sentences, headings, names, warnings, or ordinary list items.

## Titles of works

Italicize the titles of substantial, self-contained works: books, films, television series, albums, games, exhibitions, long poems, periodicals, and artworks. Use double quotation marks for parts of larger works: articles, chapters, essays, papers, short stories, songs, episodes, and individual broadcasts.

```markdown
*The Example Book* includes the chapter “A Short Example”.
```

Use the title's original spelling and capitalization. Do not add italics or quotation marks to a title merely because it is important. Do not italicize a title that ordinary usage treats as a sacred text, legal document, software command, or web page unless supplied local practice requires it.

Use italics for a word or phrase mentioned as language rather than used for its meaning: “The word *archive* derives from…”. Use quotation marks for a full sentence discussed as text or when italics would cause confusion.

Use code formatting, not italics, for literal identifiers, commands, file names, parameter names, and syntax. Do not use code formatting for ordinary English terms or emphasis.

## Quotations and typographic conformity

A quotation is not a facsimile. Preserve the words, spelling, dialect, capitalization where it affects meaning, and meaningful emphasis. Normalize decorative typography only when doing so does not change meaning or obscure intent.

Do not preserve unusual spacing, decorative capitalization, color, typeface, or branding style merely because it appears in a source. Do not add scare quotes to reproduce a source's styling preference. Preserve a title's identifying form and a proper name's spelling.

When a quotation contains a quotation, use the page's established nesting style. When no style is established, use double quotation marks for the outer quotation and single quotation marks for the inner one. Attribute an inserted clarification or added emphasis where the distinction matters.

## Code examples

Use fenced code blocks for multi-line literal text. Give a language label only when it is a plain identifier accepted by the renderer and helps readers; `text` is the safe default.

````markdown
```text
example command
```
````

Keep code examples separate from prose and explain their purpose. Do not use a code block for a quotation, a list, or an indented paragraph. Do not depend on syntax highlighting, line numbers, tabs, or a fixed-width layout to convey essential meaning.
