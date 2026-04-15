# Progressive Disclosure

## Table of Contents

- [Three-Level Loading System](#three-level-loading-system)
- [Pattern: High-Level Guide with References](#pattern-high-level-guide-with-references)
- [Pattern: Domain-Specific Organization](#pattern-domain-specific-organization)
- [Pattern: Conditional Details](#pattern-conditional-details)
- [Pattern: Framework/Variant Selection](#pattern-frameworkvariant-selection)
- [Rules for File References](#rules-for-file-references)

---

Skills use a three-level loading system to manage context efficiently:

| Level    | When loaded       | Target size      | Contains                        |
| -------- | ----------------- | ---------------- | ------------------------------- |
| Metadata | Always (startup)  | ~100 tokens      | `name` + `description`          |
| Body     | On skill activation | < 5000 tokens  | Full `SKILL.md` body            |
| Resources| On demand          | Unlimited*       | `scripts/`, `references/`, `assets/` |

\* Scripts can be *executed* without loading their contents into context. Only
the script's output consumes tokens.

## Pattern: High-Level Guide with References

````markdown
---
name: pdf-processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick start

Extract text with pdfplumber:

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

- **Form filling**: See [FORMS.md](FORMS.md) for the complete guide
- **API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

The agent loads `FORMS.md`, `REFERENCE.md`, or `EXAMPLES.md` only when needed.

## Pattern: Domain-Specific Organization

For skills with multiple domains, organize by domain so the agent loads only
relevant context:

```
bigquery-analysis/
├── SKILL.md
└── reference/
    ├── finance.md
    ├── sales.md
    ├── product.md
    └── marketing.md
```

````markdown
# BigQuery Data Analysis

## Available datasets

- **Finance**: Revenue, ARR, billing → See [reference/finance.md](reference/finance.md)
- **Sales**: Opportunities, pipeline → See [reference/sales.md](reference/sales.md)
- **Product**: API usage, features → See [reference/product.md](reference/product.md)
- **Marketing**: Campaigns, attribution → See [reference/marketing.md](reference/marketing.md)

## Quick search

Find specific metrics:

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
```
````

When a user asks about revenue, the agent reads only `reference/finance.md`.

## Pattern: Conditional Details

```markdown
# DOCX Processing

## Creating documents
Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents
For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

## Pattern: Framework/Variant Selection

When a skill supports multiple frameworks or providers:

```
cloud-deploy/
├── SKILL.md
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

The `SKILL.md` body contains the selection logic; variant-specific details
live in reference files.

## Rules for File References

1. **Keep references one level deep from `SKILL.md`.** All reference files
   should link directly from `SKILL.md`. Avoid chains where `a.md` references
   `b.md` which references `c.md` — agents may partially read deeply nested
   files.

2. **Use relative paths from the skill root:**
   ```markdown
   See `reference-guide.md` for details.
   Run: scripts/extract.py
   ```

3. **Add a table of contents to reference files longer than 100 lines** so the
   agent can see the full scope even when previewing.

4. **Name files descriptively:**
   - Good: `form_validation_rules.md`, `finance.md`
   - Bad: `doc2.md`, `file1.md`

5. **For very large reference files (>10k words)**, include grep search
   patterns in `SKILL.md` so the agent can search efficiently:
   ```markdown
   To find specific metrics, use:
   grep -i "your_metric" reference/schemas.md
   ```
