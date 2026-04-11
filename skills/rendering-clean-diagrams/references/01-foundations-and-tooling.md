# Foundations and Tooling for Clean LLM Diagram Rendering

## Table of Contents

- [Core Principle](#core-principle)
- [Two-Layer Architecture](#two-layer-architecture)
- [Tool Comparison for Agent Workflows](#tool-comparison-for-agent-workflows)
  - [Mermaid](#mermaid)
  - [D2](#d2)
  - [Graphviz DOT](#graphviz-dot)
  - [PlantUML](#plantuml)
  - [Summary Matrix](#summary-matrix)
- [Layout Algorithm Families](#layout-algorithm-families)
  - [Hierarchical (Layered)](#hierarchical-layered)
  - [Force-Directed](#force-directed)
  - [Orthogonal Routing](#orthogonal-routing)
  - [Mapping Layout Family to Diagram Type](#mapping-layout-family-to-diagram-type)
- [Practical Selection Rules](#practical-selection-rules)

---

## Core Principle

Use the LLM to describe **structure**, not coordinates.

- Let the LLM define nodes, relationships, labels, and groups.
- Let the rendering engine place nodes and route edges.
- Avoid raw SVG coordinate generation unless the task explicitly requires manual vector editing.

> Golden rule: never let the LLM compute layout coordinates for normal diagrams.

This single rule prevents most arrow spaghetti and misalignment issues.

---

## Two-Layer Architecture

Use this architecture for reliable outputs:

1. **Layer 1: LLM generation**
   - Produce DSL source (Mermaid, D2, DOT, PlantUML).
   - Choose diagram type and scope.
   - Keep content concise.

2. **Layer 2: Rendering engine**
   - Parse source.
   - Run layout algorithm.
   - Output SVG/PNG.

```text
LLM (diagram DSL source) -> Renderer (layout + routing) -> SVG/PNG
```

Assign responsibilities strictly:

- LLM: meaning and structure
- Engine: geometry and visual arrangement

---

## Tool Comparison for Agent Workflows

### Mermaid

Best when diagrams must render natively in GitHub Markdown.

**Strengths**
- Most familiar syntax for LLMs due to training data volume.
- Native GitHub/GitLab Markdown integration.
- Broad support for flowcharts, sequence, state, ER, class, and more.

**Weaknesses**
- Default layout (Dagre) is weaker on complex graphs.
- Parser is sensitive to label characters and quoting mistakes.
- Styling and layout control are limited compared with D2/Graphviz.
- ELK layout support is not available in all hosts.

**Use Mermaid when**
- Native Markdown rendering is mandatory.
- Diagram size is small and readability is acceptable with Dagre.

### D2

Best default for non-GitHub rendered outputs.

**Strengths**
- Cleaner, forgiving syntax.
- Strong container/grouping semantics for architecture diagrams.
- Multiple layout engines available in one tool.
- Clean standards-compliant SVG output.

**Weaknesses**
- Not rendered natively by GitHub Markdown.
- Smaller ecosystem than Mermaid.

**Use D2 when**
- You control the render pipeline.
- You need maintainable syntax and crisp SVG artifacts.

### Graphviz DOT

Best when layout control and hierarchical quality are primary.

**Strengths**
- Mature, deterministic layout engines.
- Excellent `dot` engine for directed dependency flows.
- Fine-grained layout hints (ranks, edge weights, groups, invisible edges).

**Weaknesses**
- Verbose syntax; easier for LLMs to make small errors.
- Less modern default aesthetics.
- No first-class sequence/UML syntax.

**Use Graphviz when**
- Crossing minimization and ranking precision are critical.
- You are rendering dependency/state/call graphs.

### PlantUML

Best for UML-standard diagram families.

**Strengths**
- Strong support for sequence, component, deployment, class, and activity diagrams.
- Broad enterprise tooling support.

**Weaknesses**
- Requires Java runtime.
- Layout tuning can be opaque.
- Syntax can be verbose and mode-specific.

**Use PlantUML when**
- UML fidelity matters more than minimalist syntax.
- Sequence diagram expressiveness (groups, loops, alternatives) is needed.

### Summary Matrix

| Criterion | Mermaid | D2 | Graphviz | PlantUML |
|---|---|---|---|---|
| LLM syntax reliability | High | High | Medium | Medium |
| Default layout quality | Low-Medium | Medium | High (`dot`) | Medium |
| Native GitHub Markdown | Yes | No | No | No |
| Diagram type breadth | High | Medium | Medium | Very high |
| SVG quality | Medium | High | Medium | Medium |
| Best default use | GitHub-native docs | General rendered outputs | Directed/dependency graphs | UML-heavy diagrams |

---

## Layout Algorithm Families

### Hierarchical (Layered)

Use for directional flow.

How it works (conceptually):
1. Remove cycles (or temporarily reverse selected edges).
2. Assign layers.
3. Reorder nodes to reduce crossings.
4. Position nodes with spacing constraints.
5. Route edges.

Common engines:
- Graphviz `dot`
- Dagre
- ELK layered

Best for:
- Flowcharts
- Pipelines
- Dependency graphs
- State transitions

### Force-Directed

Use for non-directional relational graphs.

How it works:
- Nodes repel each other.
- Edges act like springs.
- Iterations minimize an energy function.

Common engines:
- Graphviz `neato`, `fdp`, `sfdp`

Best for:
- Knowledge graphs
- Social/network maps
- Concept clustering

Avoid force-directed when process direction is important.

### Orthogonal Routing

Use when right-angle edges improve legibility.

Characteristics:
- Horizontal/vertical segments
- Grid-like structure
- Emphasis on minimizing bends and crossings

Best for:
- ER diagrams
- Class diagrams
- Schematic box-and-connector views

### Mapping Layout Family to Diagram Type

| Diagram Type | Preferred Layout Family | Reason |
|---|---|---|
| Flowchart | Hierarchical | Primary information is directional process flow |
| Sequence | Purpose-built timeline | Interaction order matters more than generic graph layout |
| Architecture (non-C4 level modeling) | Hierarchical | Layer boundaries and service tiers are key |
| ERD | Orthogonal | Right-angle links improve table/entity readability |
| State machine | Hierarchical | Transitions have directional semantics |
| Dependency graph | Hierarchical | "Depends on" is directional |
| Mindmap | Radial/tree | Centered hierarchy |
| Knowledge graph | Force-directed | Cluster discovery without strict direction |

---

## Practical Selection Rules

Apply these defaults unless the user asks otherwise:

1. Need native GitHub Markdown rendering -> Mermaid.
2. Need clean rendered artifacts in controlled pipeline -> D2.
3. Need UML-heavy sequence semantics -> PlantUML.
4. Need strict hierarchical quality and crossing control -> Graphviz `dot`.

If requirements conflict:

- Produce two artifacts:
  - Mermaid source for native GitHub rendering.
  - High-quality rendered SVG from D2/Graphviz for publication.

This dual-artifact approach preserves portability and readability.
