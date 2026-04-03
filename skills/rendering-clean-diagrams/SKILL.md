---
name: rendering-clean-diagrams
description: "Generates clean, well-laid-out diagrams using text-to-diagram DSLs (Mermaid, D2, Graphviz, PlantUML). Selects the right tool and diagram type, produces focused diagram code, validates output via CLI rendering, and embeds results in Markdown or standalone SVG/PNG. Use when creating flowcharts, sequence diagrams, architecture diagrams, ER diagrams, state machines, mindmaps, dependency graphs, knowledge graphs, or any visual diagram, when embedding diagrams in GitHub Markdown or documentation, or when the user asks for a diagram, graph, chart, or visualization of a system, process, workflow, or data model."
category: System Architecture
compatibility: "Requires at least one diagram CLI: @mermaid-js/mermaid-cli (npm), d2 (brew), graphviz (brew/apt), or plantuml (Java JAR). Kroki (Docker) as universal alternative."
---

# Rendering Clean Diagrams

## Golden rule

Never compute coordinates or generate raw SVG. Describe structure and relationships in a diagram DSL and let a layout engine handle positioning.

## Tool selection

| Where it will be viewed | Diagram type | Tool |
|---|---|---|
| GitHub/GitLab Markdown | Any Mermaid-supported | **Mermaid** (renders natively) |
| Docs / PDF / standalone SVG | Flowchart, state, ER | **D2** (cleanest SVG, single binary) |
| Docs / PDF / standalone SVG | Sequence diagram | **PlantUML** (best sequence support) |
| Docs / PDF / standalone SVG | Architecture / containers | **D2** (best container support) |
| Docs / PDF / standalone SVG | Directed / dependency graph | **Graphviz `dot`** (best hierarchical layout) |
| Docs / PDF / standalone SVG | Network / knowledge graph | **Graphviz `neato` or `fdp`** |
| Mixed toolchain | Multiple types | **Kroki** (unified API, 20+ languages) |

When using Mermaid and better layout is needed, enable ELK if the renderer supports it:

```
---
config:
  layout: elk
---
flowchart TB
    A --> B --> C
```

> **Note:** GitHub renders Mermaid with Dagre only (no ELK). To get ELK layout on GitHub, render locally and commit the SVG.

For detailed tool comparisons and layout algorithm guidance, see [references/01-tools-and-architecture.md](references/01-tools-and-architecture.md).

## Workflow

1. **Select tool** from the table above.
2. **Generate diagram code** following these rules:
   - Specify direction explicitly: `TB`/`LR` (Mermaid), `direction: down` (D2), `rankdir=TB` (Graphviz).
   - **Budget 3–5 nodes.** Decompose larger diagrams into multiple focused diagrams.
   - Label all edges.
   - Group related nodes into subgraphs or containers.
   - Avoid bare special characters in labels (`: ; ( ) [ ] { } # &`) — wrap labels in double quotes.
   - Use structural hints for positioning ("database at lowest dependency layer"), never coordinates.
   - For flowcharts, avoid bidirectional arrows and limit merge points to one per 5 nodes.
3. **Render and validate** with the CLI:
   ```bash
   # Mermaid
   npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.svg 2>&1
   # D2
   d2 diagram.d2 diagram.svg 2>&1
   # Graphviz
   dot -Tsvg diagram.dot -o diagram.svg 2>&1
   # PlantUML
   java -jar plantuml.jar -tsvg diagram.puml 2>&1
   ```
4. **Fix on failure** — feed stderr back and correct the syntax. Converges in 1–2 iterations.
5. **Visual check** (optional) — if vision is available, render to PNG and verify readability and accuracy.

## Syntax pitfalls by tool

**Mermaid:**
- `:` or `()` in labels without quotes → write `A["Step: one"]` not `A[Step: one]`
- Missing `end` after subgraph blocks
- Mixing `---` (thick link) with `-->` (arrow)

**D2:**
- Reserved words as node IDs (`class`, `style`, `shape`) — rename or quote
- `-->` does not exist — use `->` for connections
- Incorrect container nesting syntax

**Graphviz:**
- `->` in undirected `graph` — use `--`; `->` is for `digraph` only
- Unquoted multi-word labels — always quote: `label="My Label"`

**PlantUML:**
- Missing `@startuml` / `@enduml` delimiters
- Mixing syntax from different diagram types in one block
- Arrow style matters: `->`, `-->`, `->>` have different semantics

## Diagram type guidance

For per-type best practices with code examples (flowcharts, sequence, architecture, ER, state machines, mindmaps, knowledge graphs), see [references/02-best-practices-by-diagram-type.md](references/02-best-practices-by-diagram-type.md).

## Rendering pipelines and decision tree

For rendering options (CLI, Kroki, GitHub Markdown, ELK, CI/CD), the full tool-selection decision tree, common pitfalls, and further reading, see [references/03-techniques-rendering-and-pitfalls.md](references/03-techniques-rendering-and-pitfalls.md).
