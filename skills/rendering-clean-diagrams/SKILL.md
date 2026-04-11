---
name: rendering-clean-diagrams
description: "Generates clean, readable general-purpose diagrams from text DSLs (Mermaid, D2, Graphviz, PlantUML), chooses suitable layout engines, and runs validation/render loops to produce embeddable SVG/PNG/Markdown outputs. Use when a user asks for a flowchart, ERD, state machine, dependency graph, mindmap, network graph, architecture sketch, or basic sequence diagram that must render reliably. Not for explicit C4 modeling or deep Mermaid sequence-specific syntax work."
category: Diagramming & Visualization
compatibility: "Requires at least one renderer (Mermaid CLI, D2, Graphviz, or PlantUML with Java). Optional: Kroki API access for unified rendering."
---

# Rendering Clean Diagrams

## Scope boundaries

**In scope**
- General-purpose diagram rendering across Mermaid, D2, Graphviz, and PlantUML.
- Flowcharts, ERDs, state diagrams, dependency/network graphs, mindmaps, and non-C4 architecture sketches.
- Basic sequence diagrams (short, straightforward message timelines).

**Out of scope**
- Explicit C4 modeling requests (Context/Container/Component/Dynamic/Deployment).
- Deep Mermaid sequence specialization (advanced control flow semantics, activation audits, Mermaid-only syntax surgery).

## Quick start

1. Choose the diagram type from the user intent (flowchart, basic sequence, ERD, state, architecture sketch, dependency, mindmap, network).
2. Apply the default tool choice:
   - **GitHub-native Markdown rendering required:** Mermaid
   - **Standalone SVG/PNG or docs pipeline:** D2
   - **UML-style basic sequence diagram requested:** PlantUML
   - **Highest control for directed/dependency graphs:** Graphviz (`dot`)
3. Generate diagram code with a strict node budget (usually 3-5 nodes unless the user asks otherwise).
4. Render immediately and fix errors in a generate → validate → fix loop.
5. Deliver both source diagram code and rendered output path/link.

## Workflow

1. **Classify the diagram problem before writing code.**
   - Time-ordered interactions → basic sequence diagram
   - Decision/process logic → flowchart
   - Data entities and cardinality → ERD
   - State transitions → state diagram
   - Layered components/services → architecture diagram
   - Non-directional concept clusters → network/knowledge graph

2. **Select a layout family that matches meaning.**
   - Hierarchical/layered for directional flow
   - Orthogonal for box-and-connector clarity (ER/class-style)
   - Force-directed only when directional flow is not primary

3. **Generate minimal structure-first DSL.**
   - Define nodes, edges, labels, and groups.
   - Do not hardcode coordinates.
   - Keep labels short and parser-safe.

4. **Apply tool-specific defaults.**
   - Mermaid: set `TB` or `LR`; keep syntax strict.
   - D2: set `direction: down` unless another direction is clearer.
   - Graphviz: choose engine explicitly (`dot`, `neato`, `fdp`, etc.).
   - PlantUML: use the correct diagram block syntax and delimiters.

5. **Run validation loop before final output.**
   - Render with the selected CLI/API.
   - If render fails, feed exact error text back into regeneration.
   - Repeat until render succeeds.

6. **Perform readability pass.**
   - Remove unnecessary nodes/edges.
   - Ensure one dominant reading direction.
   - Split into multiple diagrams if clutter appears.

## Defaults and escape hatches

- Default to **Mermaid** only when native GitHub rendering is required.
- Default to **D2** for most generated diagrams in controlled pipelines.
- Use **PlantUML** for UML-style sequence notation needs.
- Use **Graphviz dot** when edge-crossing minimization and ranking control matter more than syntax simplicity.
- If a tool is unavailable, switch to the nearest equivalent and preserve diagram semantics.

## Validation commands

Use exactly one command family that matches the chosen tool:

```bash
# Mermaid
mmdc -i input.mmd -o output.svg

# D2
d2 input.d2 output.svg

# Graphviz
dot -Tsvg input.dot -o output.svg

# PlantUML
java -jar plantuml.jar -tsvg input.puml
```

If command stderr reports parsing/layout errors, regenerate code and rerun.

## Output contract

Return:

1. Chosen diagram type and tool (with one-sentence reason)
2. Diagram source code block
3. Render command used
4. Output location or embedded Markdown image reference
5. Any simplifications made (if scope was reduced for clarity)

## Edge cases

- **Too many nodes requested:** Propose a primary diagram plus follow-up sub-diagrams.
- **Conflicting requirements (native GitHub + advanced layout):** Provide Mermaid-for-GitHub and rendered SVG from D2/Graphviz as an alternative artifact.
- **Parser breaks on labels:** Quote labels or remove special characters.
- **Unclear directionality:** Ask whether the user wants process flow, structure, or interaction timeline before generating.
- **Request is explicitly C4-level architecture modeling:** Reframe to a non-C4 architecture sketch or ask for a C4-specific deliverable outside this skill’s scope.
- **Request needs advanced Mermaid sequence semantics:** Limit this skill to a basic sequence diagram and state the advanced scope gap explicitly.

## References

Use these on demand for detailed guidance.

- Foundations, tool comparison, and layout families:
  [references/01-foundations-and-tooling.md](references/01-foundations-and-tooling.md)
- Diagram-specific patterns and examples:
  [references/02-diagram-patterns-by-type.md](references/02-diagram-patterns-by-type.md)
- Prompting, validation loops, rendering pipelines, and pitfalls:
  [references/03-generation-validation-and-operations.md](references/03-generation-validation-and-operations.md)
