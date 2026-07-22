# Links, images, and accessibility

## Table of contents

- [Links, images, and accessibility](#links-images-and-accessibility)
  - [Table of contents](#table-of-contents)
  - [Links](#links)
  - [Images](#images)
  - [Accessible text and structure](#accessible-text-and-structure)

## Links

Make links only where they are relevant and helpful in context. A link should help a reader understand an unfamiliar term, follow a necessary connection, verify a supplied external source, or reach genuinely useful further material. Excessive links distract readers and make maintenance harder.

Use descriptive link text that identifies the destination or its purpose. Do not write “click here”, “this”, or a bare URL when meaningful text is available.

```markdown
Read the [migration guide](https://example.com/migration-guide).
```

Link a term at its first useful occurrence, not every repetition. Do not link ordinary words that a general reader understands, a page's own title in its lead, or a destination that adds no relevant information. Do not link solely because a term is potentially controversial or because a page might exist.

Check that a link reaches the intended destination. Use a section fragment only when the target heading is stable and specific enough to help the reader. Do not invent a destination, source URL, or anchor. If the supplied material does not establish a link, omit it.

Keep external resources selective. Put a short list of directly useful external links after the explanatory body when the host permits it. Identify each resource and its relevance; do not assemble a directory, advertise a service, or repeat material already covered by an inline source link.

## Images

Use an image only when it helps readers understand the subject. Do not use a decorative image as a substitute for explanation. Place an image near the prose it supports when the host's rendering order is known; otherwise make the surrounding text understandable without relying on placement.

Use Markdown image syntax:

```markdown
![A map showing the route between the two cities](route-map.png)
```

Write alternative text for what the image conveys in context. Describe the relevant information, not the file name, its dimensions, its decorative style, or a statement such as “image of”. If an image is purely decorative, omit it rather than adding empty or misleading text.

Do not refer to an image as “above”, “below”, “left”, or “right”. Placement changes by screen size, reader settings, and assistive technology. Refer to the subject or information instead.

Provide important text, labels, numbers, and conclusions in ordinary page text. Do not place essential content only in an image. Avoid images consisting mostly of text; readers cannot reliably search, copy, resize, translate, or have that text read aloud.

Strict Markdown provides no portable caption, gallery, size, alignment, or alternate-source syntax. Do not add those features with raw HTML or an extension.

## Accessible text and structure

Use real headings to express structure. Do not use bold text, font size, color, indentation, or blank space as a heading substitute. Keep levels sequential so readers can navigate the page hierarchy with assistive technology.

Do not convey a distinction through color, position, shape, or font alone. State the distinction in words. Do not rely on hover text, a script, a particular screen width, or an interaction that keyboard and screen-reader users may not have.

Write link text that remains understandable when read out of context. Avoid a run of adjacent links with no explanatory prose. Do not put a link inside a heading when a plain heading and a link in the following prose are clearer.

Use a list only for an actual collection of related items. Do not use indentation to simulate a list or create visual spacing. Do not use a block quote for non-quoted text merely to indent it.

Keep markup simple. Simple Markdown is easier to read, edit, translate, reuse, and render predictably. If a visual effect is not expressible in strict Markdown, omit it or express its meaning in ordinary prose.

For inline code and fenced code blocks, use the Markdown syntax reference.
