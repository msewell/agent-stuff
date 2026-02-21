# TOON Format: Best Practices for Agent Harnesses and LLM Workflows

*Current-day best practices for Token-Oriented Object Notation — optimized for engineers building agentic systems*

*Last Updated: February 2026 | Based on TOON Spec v3.0 (2025-11-24)*

---

## Table of Contents

1. [What TOON Is and Why It Matters for Agents](#what-toon-is-and-why-it-matters-for-agents)
2. [When to Use TOON vs Alternatives](#when-to-use-toon-vs-alternatives)
3. [Core Syntax Internalized](#core-syntax-internalized)
4. [Integration Patterns for Agentic Workflows](#integration-patterns-for-agentic-workflows)
5. [Prompting Models to Use TOON](#prompting-models-to-use-toon)
6. [Validating Model-Generated TOON](#validating-model-generated-toon)
7. [Advanced Optimization](#advanced-optimization)
8. [TypeScript SDK Reference](#typescript-sdk-reference)
9. [CLI Workflow](#cli-workflow)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
11. [Sources](#sources)

---

## What TOON Is and Why It Matters for Agents

**TOON (Token-Oriented Object Notation)** is a compact, human-readable encoding of the JSON data model designed for LLM inputs. It combines YAML-style indentation for nested objects with CSV-style tabular rows for uniform arrays.

The key numbers:
- **~40% fewer tokens** than JSON on mixed-structure benchmarks
- **74% accuracy** vs JSON's 70% on LLM data-retrieval tasks across Claude, GPT, Gemini, and Grok

For agentic harnesses, token efficiency compounds across every dimension simultaneously: multi-turn conversation history, RAG document injection, tool call results, few-shot examples, and chain-of-thought context all consume context window. A format that is 40% smaller means:

- **2x the retrieved documents** in a RAG window for the same cost
- **Fewer truncation events** in long-running agents
- **Lower per-step costs** over hundreds of agent turns
- **More room for tool schemas** and system prompts without squeezing user data

TOON is not a replacement for JSON in your code — you still work with JSON programmatically. TOON is the **wire format between your harness and the model**.

---

## When to Use TOON vs Alternatives

TOON is not universally optimal. Choose based on your data shape:

| Scenario | Recommended Format | Rationale |
|---|---|---|
| Uniform array of objects (same keys, primitive values) | **TOON** | Maximum savings; tabular format collapses identical field declarations |
| Semi-uniform arrays (≥60% tabular eligibility) | **TOON** | Still net positive; mixed rows fall back to list format |
| Deeply nested, non-uniform JSON (≤40% tabular) | **JSON compact** | TOON may be larger; brace nesting is already tight |
| Flat homogeneous rows, no LLM parsing needed | **CSV** | CSV is 5–10% smaller than TOON; use TOON only when structure aids the model |
| Config/settings objects with few keys | **TOON or YAML** | Minor savings; choose based on model familiarity |
| Latency-sensitive on local/quantized models | **Benchmark both** | Token count ≠ decode speed on all runtimes |

**The sweet spot**: tool call results, retrieved document chunks, database query results, API response payloads, and log records — anywhere you have repeated structure.

---

## Core Syntax Internalized

You don't need to write TOON by hand; the SDK handles it. But reading it fluently is essential for prompt design and debugging.

### Objects

```toon
user:
  id: 123
  name: Ada Lovelace
  active: true
```

Uses `key: value` with 2-space indentation. No braces.

### Primitive Arrays (inline)

```toon
tags[3]: admin,ops,dev
```

Always declares count `[N]`. Comma-separated on one line.

### Tabular Arrays (the key feature)

```toon
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,engineer
  3,Carol,viewer
```

Field names declared once in `{fields}` header. Values stream as rows. This is where the savings come from.

### List Arrays (non-uniform)

```toon
events[2]:
  - type: login
    ts: 1700000000
  - type: error
    ts: 1700000042
    code: 503
```

Hyphen-prefixed, YAML-style. Used when objects have different key sets.

### Nested Objects

```toon
response:
  status: 200
  data:
    items[2]{id,score}:
      a1,0.92
      a2,0.87
  meta:
    total: 2
```

Nesting follows indentation depth.

### Quoting Rules

Strings are quoted **only when necessary**: when they contain delimiters, colons, leading/trailing whitespace, reserved words (`true`, `false`, `null`), or are empty. This is the primary source of token savings vs JSON.

---

## Integration Patterns for Agentic Workflows

### Pattern 1: RAG Document Injection

The most impactful use case. When injecting retrieved chunks into context, encode document metadata and content as TOON to maximize the number of chunks that fit in the window.

```typescript
import { encode } from '@toon-format/toon'

const retrievedDocs = await vectorStore.query(userQuery, { topK: 20 })

const contextPayload = encode({
  documents: retrievedDocs.map(doc => ({
    id: doc.id,
    score: doc.score,
    source: doc.source,
    content: doc.content
  }))
})

const messages = [
  { role: 'system', content: systemPrompt },
  {
    role: 'user',
    content: `Retrieved context:\n\`\`\`toon\n${contextPayload}\n\`\`\`\n\nQuery: ${userQuery}`
  }
]
```

With 40% savings, a 100k-token context window that previously fit 15 documents can now fit ~25 at the same token cost.

### Pattern 2: Tool Call Result Encoding

When an agent calls a tool (database query, API call, file read) and receives structured data, encode the result before injecting it into the next turn rather than pasting raw JSON.

```typescript
async function runToolAndEncode(toolName: string, args: unknown): Promise<string> {
  const result = await dispatchTool(toolName, args)
  // Return TOON for structured results; plain text for prose
  if (typeof result === 'object' && result !== null) {
    return encode(result)
  }
  return String(result)
}

// In your agent loop:
const toolResult = await runToolAndEncode(call.name, call.arguments)
messages.push({
  role: 'tool',
  tool_call_id: call.id,
  content: toolResult
})
```

This is especially valuable when tools return large arrays (search results, database rows, file listings).

### Pattern 3: Few-Shot Examples in Prompts

TOON's token savings let you pack more few-shot examples into the same budget.

```typescript
const fewShotExamples = encode({
  examples: [
    { input: 'extract invoice fields', output: 'vendor,amount,date,due_date' },
    { input: 'summarize meeting notes', output: 'attendees,decisions,action_items' }
  ]
})
```

Models trained on YAML/CSV naturally parse TOON without explicit instruction — the structure is self-documenting.

### Pattern 4: Streaming Large Datasets

For datasets too large to encode in memory (thousands of records), use `encodeLines()` to stream:

```typescript
import { encodeLines } from '@toon-format/toon'

const stream = encodeLines(largeRecordIterator)
for await (const line of stream) {
  contextBuffer.append(line)
  if (contextBuffer.tokenCount > limit) break
}
```

---

## Prompting Models to Use TOON

When you need the **model to generate TOON** (not just consume it), use a template-first approach: show the expected header and let the model fill rows.

### Show the header, not just instructions

```
Generate the following data as TOON. Use this exact header:

```toon
results[N]{id,title,confidence,reasoning}:
```

Fill N with the actual count. Use 2-space indent, no trailing spaces.
```

This is more reliable than asking the model to produce the full structure from scratch. Providing the header anchors the model to the correct field set and forces it to count rows correctly.

### Include a 2–3 row example

For one-shot guidance, append a short demo after the header:

```
Here is an example with 2 results:
```toon
results[2]{id,title,confidence}:
  r1,Refactor auth module,0.91
  r2,Add rate limiting,0.87
```

Now produce the actual results.
```

Models read TOON like YAML/CSV and require no special training. Two to five rows are enough — larger examples waste tokens without improving accuracy.

### State formatting constraints explicitly

In your system prompt or just before the output instruction, add:

```
Format rules: 2-space indent, no trailing whitespace, [N] must match row count exactly, quote strings only when they contain commas or colons.
```

This prevents the two most common model errors: incorrect counts and unnecessary quoting.

---

## Validating Model-Generated TOON

Always decode with strict mode (the default). Do not assume model output is well-formed.

```typescript
import { decode } from '@toon-format/toon'

function parseModelToon<T>(raw: string): T {
  // Extract from code fence if present
  const fenced = raw.match(/```(?:toon)?\n([\s\S]*?)```/)
  const toonStr = fenced ? fenced[1] : raw.trim()

  // Strict mode (default) validates counts, indentation, escaping
  return decode(toonStr) as T
}

// In your agent loop:
try {
  const structured = parseModelToon<ResultSet>(modelOutput)
  // proceed with structured data
} catch (err) {
  // Log, retry, or fall back to JSON parsing
  console.error('TOON parse error:', err.message)
  const fallback = attemptJsonParse(modelOutput)
}
```

Strict mode catches:
- Array count mismatches (`[N]` declared vs rows present — indicates truncation)
- Indentation violations
- Missing or extra field columns in tabular rows
- Escaping errors in string values

**Truncation detection** is particularly valuable in agentic loops: if the model hit a stop sequence or token limit mid-output, the count mismatch surfaces immediately rather than silently returning partial data.

---

## Advanced Optimization

### Delimiter Selection

TOON supports three delimiters per array, declared in the header:

| Delimiter | Header syntax | Best for |
|---|---|---|
| Comma (default) | `items[N]{a,b,c}:` | General use; strings rarely contain commas |
| Tab | `items[N\t]{a,b,c}:` | Numeric-heavy data; fewer quotes needed |
| Pipe | `items[N\|]{a,b,c}:` | Data with frequent commas in strings |

Tab delimiters often tokenize more efficiently, particularly for tabular data with few quoted strings. Benchmark on your actual payload:

```typescript
import { encode } from '@toon-format/toon'

const comma = encode(data, { delimiter: ',' })
const tab   = encode(data, { delimiter: '\t' })

console.log(`Comma: ${comma.length} chars, Tab: ${tab.length} chars`)
```

### Key Folding for Deeply Nested Data

Key folding collapses single-key wrapper chains into dotted paths, reducing indentation overhead:

**Without folding:**
```toon
response:
  data:
    metadata:
      items[2]: a,b
```

**With `keyFolding: 'safe'`:**
```toon
response.data.metadata.items[2]: a,b
```

```typescript
const folded = encode(data, { keyFolding: 'safe' })

// Decode with path expansion to reconstruct nesting
const restored = decode(folded, { expandPaths: 'safe' })
```

Use folding when your API responses or config objects have deep single-key wrappers. Disable it when multiple sibling keys share a level (folding only applies to unambiguous chains) or when structural clarity for the model matters more than token savings.

### Token Estimation Before Sending

Use the CLI `--stats` flag during development to quantify savings before committing to TOON in a pipeline:

```bash
npx @toon-format/cli input.json --stats
# Output: ~15,145 (JSON) → ~8,745 (TOON) — saving ~6,400 tokens (-42.3%)
```

---

## TypeScript SDK Reference

```bash
npm install @toon-format/toon
```

### Core API

```typescript
import { encode, decode, encodeLines } from '@toon-format/toon'

// Encode JSON to TOON string
const toon = encode(data)
const toonTab = encode(data, { delimiter: '\t' })
const toonFolded = encode(data, { keyFolding: 'safe' })

// Decode TOON string back to JSON (strict by default)
const json = decode(toon)
const jsonLenient = decode(toon, { strict: false })
const jsonExpanded = decode(toonFolded, { expandPaths: 'safe' })

// Stream large datasets
for await (const line of encodeLines(asyncIterable)) {
  buffer.write(line)
}
```

### Round-Trip Guarantee

`decode(encode(x))` equals `x` for all valid JSON values. This is a spec guarantee — use it in tests to validate your integration:

```typescript
import assert from 'assert'
assert.deepStrictEqual(decode(encode(testPayload)), testPayload)
```

---

## CLI Workflow

```bash
# Install globally or use npx
npm install -g @toon-format/cli

# Encode JSON → TOON (auto-detected from extension)
toon data.json -o data.toon

# Decode TOON → JSON
toon data.toon -o data.json

# Force mode explicitly
toon data.json --encode --delimiter "\t" --stats

# Pipe from curl
curl -s https://api.example.com/data | toon -e --stats

# Key folding + tab delimiter + stats in one pass
toon data.json --keyFolding safe --delimiter "\t" --stats -o output.toon

# Decode with path expansion (to restore nested structure from folded keys)
toon output.toon --decode --expandPaths safe
```

The `--stats` flag prints a before/after token estimate — useful for calibrating whether TOON is worth the added encoding step for a given payload type.

---

## Anti-Patterns to Avoid

**Using TOON for deeply nested, irregular data.** When tabular eligibility drops below ~40%, TOON offers no savings and may be larger than JSON compact. Profile before committing.

**Describing TOON syntax in the prompt instead of showing it.** Models infer TOON from examples far more reliably than from rule descriptions. Always show, don't tell.

**Skipping strict-mode decoding.** In agentic loops, silent data loss from truncated arrays is worse than a caught error. Keep strict mode on and handle parse errors explicitly.

**Using oversized few-shot examples.** A 50-row example uses most of the token budget you were trying to save. Keep examples at 2–5 rows.

**Assuming TOON is always faster to process.** Token count affects API cost and context length, but local/quantized models may decode compact JSON faster. Benchmark latency separately from token count.

**Not quoting ambiguous values.** If a string value looks like a number, boolean, or `null`, TOON requires it to be quoted (`"null"`, `"true"`, `"123"`). Unquoted, the decoder will coerce it. This is a common source of type corruption when encoding heterogeneous data.

**Forgetting to handle code-fence extraction.** Models frequently wrap TOON output in ` ```toon ``` ` blocks. Your decoder must strip the fence before parsing, or the leading ` ``` ` will cause an immediate parse error.

---

## Sources

- [TOON Official Documentation](https://toonformat.dev/)
- [Using TOON with LLMs — toonformat.dev](https://toonformat.dev/guide/llm-prompts)
- [Format Overview — toonformat.dev](https://toonformat.dev/guide/format-overview)
- [Getting Started — toonformat.dev](https://toonformat.dev/guide/getting-started)
- [Specification v3.0 — toonformat.dev](https://toonformat.dev/reference/spec)
- [CLI Reference — toonformat.dev](https://toonformat.dev/cli/)
- [GitHub: toon-format/toon](https://github.com/toon-format/toon)
- [TOON for LLM Prompts 2025 — jsontotable.org](https://jsontotable.org/blog/toon/toon-for-llm-prompts)
- [The Rise of TOON — Medium](https://medium.com/@cenghanbayram35/the-rise-of-toon-token-oriented-object-notation-for-efficient-large-language-model-llm-workflows-95c4fd9f5689)
- [What the TOON Format Is — openapi.com](https://openapi.com/blog/what-the-toon-format-is-token-oriented-object-notation)
