# Tools and Architecture

## Table of Contents

- [The Core Problem](#the-core-problem)
- [The Two-Layer Architecture](#the-two-layer-architecture)
- [Mermaid](#mermaid)
- [D2](#d2)
- [Graphviz (DOT)](#graphviz-dot)
- [PlantUML](#plantuml)
- [Tool Comparison Matrix](#tool-comparison-matrix)
- [Layout Algorithm Families](#layout-algorithm-families)
- [Layout Family by Diagram Type](#layout-family-by-diagram-type)

---

## The Core Problem

LLM-generated diagram code frequently suffers from arrow spaghetti, poor node placement, syntax errors, wrong diagram type choice, and over-specification. The root cause: **the LLM decides *what* to draw, but a layout engine decides *where* to place it.** When the LLM tries to control layout directly (e.g., raw SVG with hardcoded coordinates), results degrade. When it delegates layout to a proper engine via a text-to-diagram DSL, results improve dramatically.

## The Two-Layer Architecture

```
┌──────────────────────────────────────────────┐
│  Layer 1: LLM Agent                          │
│  Generates a textual description of the      │
│  diagram in a DSL (Mermaid, D2, DOT, etc.)   │
└──────────────┬───────────────────────────────┘
               │ text (e.g., Mermaid syntax)
               ▼
┌──────────────────────────────────────────────┐
│  Layer 2: Rendering Engine                   │
│  Parses the DSL, runs a layout algorithm,    │
│  and produces SVG/PNG output                 │
└──────────────────────────────────────────────┘
```

**Layer 1 (LLM):** Choose diagram type, define nodes/edges/labels/groupings, keep diagrams focused and minimal.

**Layer 2 (engine):** Node placement, edge routing, spacing, alignment.

The choice of **DSL** and **layout engine** are the two most impactful decisions.

---

## Mermaid

**Layout engine:** Dagre (default, unmaintained since 2018), ELK (opt-in via `@mermaid-js/layout-elk`).

**Strengths:** Highest LLM syntax reliability due to training data volume. Native GitHub/GitLab Markdown rendering. Broad diagram type support (flowcharts, sequence, class, state, ER, Gantt, mindmaps, git graphs). ELK dramatically improves layout over Dagre.

**Weaknesses:** Dagre produces mediocre layouts beyond trivial graphs. ELK not available in GitHub, Obsidian, or many renderers. Non-conforming SVG (browser-only). Limited styling and layout tuning. Many edge-case syntax pitfalls with special characters.

**Verdict:** Default choice when output must render natively in GitHub Markdown. For everything else, prefer D2 or Graphviz.

## D2

**Layout engines:** Dagre (default, bundled), ELK (bundled).

**Strengths:** Cleaner, more forgiving syntax than Mermaid. First-class container/grouping support (critical for architecture diagrams). Multiple layout engines switchable per diagram. Clean, standards-compliant SVG. Supports embedded Markdown, code snippets, and LaTeX in nodes. Sketch mode for hand-drawn aesthetic.

**Weaknesses:** No native GitHub/GitLab rendering (requires CLI or Kroki). Smaller ecosystem than Mermaid.

**Verdict:** Best overall tool when the rendering pipeline is controlled (not GitHub/GitLab native). Superior syntax and SVG quality.

## Graphviz (DOT)

**Layout engines:** `dot` (hierarchical), `neato` (force-directed), `fdp` (force-directed), `circo` (circular), `twopi` (radial), `sfdp` (scalable force-directed), `osage` (clustered).

**Strengths:** Most mature, battle-tested layout. `dot` produces excellent hierarchical layouts. Seven layout algorithms for different graph types. Fine-grained control via edge weights, grouping, rank constraints, port positions. Excellent for dependency graphs, call graphs, state machines, network topologies.

**Weaknesses:** More verbose, error-prone syntax for LLMs. Output aesthetics are functional but dated. No sequence diagram or UML support. Requires system-level install.

**Verdict:** Best layout quality for directed/hierarchical graphs. Choose when graph structure is the priority.

## PlantUML

**Layout engines:** Graphviz `dot` internally for many diagram types, plus custom engines for sequence/activity diagrams.

**Strengths:** Broadest UML diagram coverage (class, sequence, activity, component, deployment, object, use case, timing). Purpose-built syntax per UML type — sequence diagrams are excellent. Mature, widely supported (Kroki, IDE plugins, wikis).

**Weaknesses:** Layout is a black box with limited tunability. Requires Java runtime. GPL license. Verbose syntax, LLMs occasionally produce invalid constructs.

**Verdict:** Best for UML-standard diagrams, especially sequence diagrams.

## Tool Comparison Matrix

| Criterion | Mermaid | D2 | Graphviz | PlantUML |
|---|---|---|---|---|
| LLM syntax reliability | ★★★★★ | ★★★★ | ★★★ | ★★★ |
| Default layout quality | ★★ | ★★★ | ★★★★ | ★★★ |
| Layout quality with ELK | ★★★★ | ★★★★ | N/A | N/A |
| GitHub Markdown rendering | ✅ | ❌ | ❌ | ❌ |
| Diagram type breadth | ★★★★ | ★★★ | ★★ | ★★★★★ |
| SVG output quality | ★★ | ★★★★★ | ★★★ | ★★★ |
| Syntax forgiveness | ★★★ | ★★★★ | ★★ | ★★★ |
| Styling/theming control | ★★ | ★★★★ | ★★★ | ★★ |

---

## Layout Algorithm Families

### Hierarchical (Layered / Sugiyama)

Assigns nodes to layers, reorders to minimize edge crossings. Edges flow in one dominant direction (top-to-bottom or left-to-right). Even with 3–5 nodes, makes flow direction instantly obvious — unlike force-directed, which loses directionality.

**Used by:** Graphviz `dot`, Dagre, ELK Layered, D2 default.

**Best for:** Flowcharts, dependency graphs, call graphs, pipelines — anything with directional flow.

### Force-Directed (Spring / Energy-Based)

Models nodes as repelling particles and edges as springs. Iteratively minimizes system energy to find a balanced arrangement. Does not encode directionality — wrong choice for diagrams with meaningful flow direction.

**Used by:** Graphviz `neato`/`fdp`/`sfdp`, D3.js, Cytoscape.js.

**Best for:** Undirected graphs, network topologies, knowledge graphs — where revealing clusters and symmetry matters.

### Orthogonal

Routes all edges as horizontal/vertical segments (right angles only). Nodes on a grid. Produces the cleanest-looking edges for box-and-arrow diagrams.

**Used by:** ELK (orthogonal mode), Graphviz `dot` (with orthogonal splines).

**Best for:** ER diagrams, circuit schematics, database schemas, UML class diagrams.

## Layout Family by Diagram Type

| Diagram Type | Layout Family | Reason |
|---|---|---|
| Flowchart | Hierarchical | Direction of flow is primary information |
| Sequence diagram | Custom (timeline) | Purpose-built engines in Mermaid/PlantUML |
| Architecture / C4 | Hierarchical | Layer boundaries are key |
| Entity-relationship | Orthogonal | Clean right-angle connections |
| State machine | Hierarchical | Transitions have directional semantics |
| Knowledge graph | Force-directed | Reveals clusters; no inherent direction |
| Dependency graph | Hierarchical | "A depends on B" is directional |
| Mindmap | Tree (radial) | Radial spread from central concept |
