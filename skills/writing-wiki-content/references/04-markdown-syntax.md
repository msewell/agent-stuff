# Markdown syntax

Prefer the simplest Markdown form that expresses the content. Do not use raw HTML or extension syntax, even if
a particular renderer accepts it.

## Headings and paragraphs

Use ATX headings with `#` characters. Leave a blank line before and
after a heading when practical. Do not skip heading levels.

``` markdown
# Page title

## Main section

A paragraph contains one or more related sentences.
```

Separate paragraphs with one blank line. Do not add multiple blank lines
to create visual spacing. Do not indent ordinary paragraphs.

## Emphasis and strong emphasis

Use `*text*` for limited emphasis, sparingly, and `**text**` for strong emphasis, even more sparingly, if at all. Do
not use underscores as a styling convention when an asterisk avoids
ambiguity in technical text. Do not use emphasis to simulate a heading
or make ordinary prose more dramatic.

``` markdown
The result was *not* reproducible.

This is **important** only when the distinction matters.
```

## Lists

Use `-` for unordered lists and `1.` for ordered lists. Keep items
parallel. Use a blank line before and after a list when it follows a
paragraph.

``` markdown
- First related item
- Second related item

1. First step
2. Second step
```

Do not use task-list checkboxes, definition-list syntax, or a table-like
arrangement made from spaces and punctuation.

## Links and images

Use inline links and images. Use meaningful link text and alternative
text.

``` markdown
[Reader guide](https://example.com/guide)

![Diagram of the process](process.png)
```

Do not use reference-style links if they make a short page harder to
read. Do not use autolinked bare URLs when descriptive link text is
available.

## Quotations and code

Use `>` only for a direct quotation. Use fenced code blocks with three
backticks and an optional plain language label.

```` markdown
> A quoted passage appears here.

```text
literal example
```
````

Use inline code for short literal strings: `` `config.yml` ``. Do not
use indentation to create a code block, because accidental leading
spaces are difficult to see and maintain.

## Allowed and excluded features

Use paragraphs, headings, thematic breaks, block quotes, lists,
emphasis, strong emphasis, links, images, inline code, and fenced code
blocks.

Do not use tables, footnotes, frontmatter, heading identifiers,
attributes, transclusion, callouts, task lists, strikethrough,
definition lists, syntax highlighting extensions, embedded media, HTML
tags, CSS, or scripts. If the information requires one of these
features, express it as prose, a list, a link, an image with alternative
text, or a code block—or omit it.
