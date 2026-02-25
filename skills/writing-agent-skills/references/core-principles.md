# Core Principles

## Table of Contents

- [The Context Window Is a Public Good](#the-context-window-is-a-public-good)
- [Set Appropriate Degrees of Freedom](#set-appropriate-degrees-of-freedom)
- [Make Choices for the Agent](#make-choices-for-the-agent)
- [Only Include What the Agent Can't Know](#only-include-what-the-agent-cant-know)

---

## The Context Window Is a Public Good

Your skill shares the context window with everything else the agent needs:
system prompt, conversation history, other skills' metadata, and the user's
actual request.

Not every token has an immediate cost — at startup, only the name and
description from all skills is pre-loaded. The full `SKILL.md` body is loaded
only when the skill activates. But once loaded, **every token competes with
conversation history and other context**.

**Default assumption: the agent is already very smart.** Only add context the
agent doesn't already have. Before writing a paragraph, ask:

- "Does the agent really need this explanation?"
- "Can I assume the agent already knows this?"
- "Does this paragraph justify its token cost?"

**Concise** (~50 tokens):

````markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**Too verbose** (~150 tokens):

```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but
pdfplumber is recommended because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

The concise version assumes the agent knows what PDFs are and how libraries
work. It provides the one thing the agent doesn't have: which library to use
and the exact API call.

---

## Set Appropriate Degrees of Freedom

Match specificity to the task's fragility and variability.

**High freedom** — use when multiple approaches are valid:

```markdown
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**Medium freedom** — use when a preferred pattern exists but variation is OK:

````markdown
## Generate report

Use this template and customize as needed:

```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```
````

**Low freedom** — use when operations are fragile or consistency is critical:

````markdown
## Database migration

Run exactly this script:

```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
````

**Mental model:** Think of the agent navigating a path.
- **Narrow bridge with cliffs:** Only one safe way forward. Provide exact
  instructions and guardrails (low freedom).
- **Open field:** Many paths lead to success. Give general direction and trust
  the agent (high freedom).

---

## Make Choices for the Agent

Agents often struggle when presented with too many options. If you can
confidently make a choice, do so — you'll reduce the error rate.

Instead of:

```markdown
You can use pypdf, pdfplumber, PyMuPDF, pdf2image, or pdfminer...
```

Write:

````markdown
Use pdfplumber for text extraction:

```python
import pdfplumber
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead.
````

Provide a default with an escape hatch for edge cases.

---

## Only Include What the Agent Can't Know

The skill should contain only information an agent needs to do the job. It
should **not** contain:

- Auxiliary context about the process of creating the skill
- Setup and testing procedures for the skill itself
- User-facing documentation about the skill
- README files, changelogs, installation guides

If the agent already knows how to do something, don't re-teach it. Focus on
what's specific to your domain, your organization, or your workflow.
