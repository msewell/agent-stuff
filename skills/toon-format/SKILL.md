---
name: toon-format
description: Instructs an LLM agent when and how to use TOON (Token-Oriented Object Notation) for encoding and generating structured data. Use when injecting structured data into context, encoding tool results, preparing RAG documents, producing structured output, or advising on TOON integration.
---

# TOON Format

## What TOON Is
TOON (Token-Oriented Object Notation) is a compact, human-readable encoding of the JSON data model optimized for LLM context windows. It uses YAML-style indentation for objects and CSV-style tabular rows for uniform arrays. It achieves ~40% fewer tokens than JSON on mixed-structure data.

TOON is a **wire format between harness and model** — not a replacement for JSON in code.

## When to Use TOON

Use TOON when injecting structured data into context and the data has repeated structure:
- Tool call results that return arrays of objects (database rows, search results, file listings).
- RAG document metadata and chunks (maximize documents per context window).
- Few-shot examples with uniform shape.
- API response payloads with tabular data.

Do **not** use TOON when:
- Data is deeply nested and irregular (≤40% tabular eligibility) — JSON compact is smaller.
- Data is flat homogeneous rows with no LLM parsing needed — CSV is 5–10% smaller.
- The model or downstream consumer expects JSON explicitly.

**Decision rule**: if the data contains arrays of objects with mostly the same keys, use TOON. Otherwise, use JSON.

## How to Encode Data as TOON

### Encoding Tool Results
When a tool returns structured JSON, encode it as TOON before injecting into the conversation. Use the TypeScript SDK:

```typescript
import { encode } from '@toon-format/toon'

const toon = encode(toolResult)
```

Wrap in a `toon` code fence when embedding in a message:

````
```toon
<encoded content>
```
````

### Encoding RAG Context
Encode retrieved document metadata and content as TOON to fit more documents in the context window:

```typescript
const contextPayload = encode({
  documents: retrievedDocs.map(doc => ({
    id: doc.id, score: doc.score, source: doc.source, content: doc.content
  }))
})
```

### Encoding Few-Shot Examples
Use TOON for few-shot examples with uniform structure to save tokens:

```typescript
const examples = encode({
  examples: [
    { input: 'extract invoice fields', output: 'vendor,amount,date' },
    { input: 'summarize meeting notes', output: 'attendees,decisions,action_items' }
  ]
})
```

## How to Produce Valid TOON Output

When generating TOON yourself (not just consuming it), follow these rules:

1. **Show the header, let the model fill rows.** Provide the tabular header with field names:
   ```toon
   results[N]{id,title,confidence}:
   ```
   Replace `N` with the actual row count.

2. **Use 2-space indentation.** No tabs for nesting, no trailing whitespace.

3. **Match `[N]` to actual row count exactly.** A mismatch signals truncation.

4. **Quote strings only when necessary.** Quote only when the value contains commas, colons, leading/trailing whitespace, or is a reserved word (`true`, `false`, `null`), or is empty.

5. **Wrap output in a `toon` code fence** so consumers can extract it reliably.

### Core Syntax Quick Reference

**Objects** — `key: value` with 2-space indent, no braces:
```toon
user:
  id: 123
  name: Ada Lovelace
```

**Primitive arrays** — inline with count:
```toon
tags[3]: admin,ops,dev
```

**Tabular arrays** — field names declared once, values as rows:
```toon
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,engineer
  3,Carol,viewer
```

**List arrays** — for non-uniform objects (different key sets):
```toon
events[2]:
  - type: login
    ts: 1700000000
  - type: error
    ts: 1700000042
    code: 503
```

## Validating TOON

Always decode model-generated TOON with strict mode (the default):

```typescript
import { decode } from '@toon-format/toon'

const parsed = decode(toonString) // strict by default
```

Strip code fences before decoding. Handle parse errors explicitly — do not silently accept partial data.

Strict mode catches: array count mismatches (truncation), indentation violations, missing/extra columns, and escaping errors.

## Advanced Options

### Delimiter Selection
- **Comma** (default): general use.
- **Tab** (`\t`): numeric-heavy data, fewer quotes needed.
- **Pipe** (`|`): data with frequent commas in strings.

```typescript
const toon = encode(data, { delimiter: '\t' })
```

### Key Folding
Collapse single-key wrapper chains into dotted paths to reduce nesting overhead:

```typescript
const folded = encode(data, { keyFolding: 'safe' })
// response.data.metadata.items[2]: a,b
```

Use when API responses have deep single-key wrappers. Disable when structural clarity matters more than savings.

### Token Estimation
Use the CLI `--stats` flag to quantify savings before committing:

```bash
npx @toon-format/cli input.json --stats
```

## Anti-Patterns

- Do not use TOON for deeply nested, irregular data — it may be larger than JSON.
- Do not describe TOON syntax in prompts — show examples instead.
- Do not skip strict-mode decoding in agent loops.
- Do not use oversized few-shot examples (keep to 2–5 rows).
- Do not forget to quote ambiguous values (`"null"`, `"true"`, `"123"` when they are strings).
- Do not assume TOON is always faster to process — benchmark latency separately from token count.

## References
- references/toon-format-best-practices.md
