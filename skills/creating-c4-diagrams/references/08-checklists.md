# C4 Quick Reference Checklists

## Diagram Review Checklist

Use this checklist before sharing any C4 diagram:

**Structure**
- [ ] Diagram has a clear title describing type and scope
- [ ] Key/legend is present and explains all visual conventions
- [ ] Diagram has 20 or fewer elements
- [ ] All acronyms and abbreviations are explained

**Elements**
- [ ] Every element has a name
- [ ] Every element has a type label (`[Person]`, `[Software System]`, `[Container]`, `[Component]`)
- [ ] Technology is specified for every container and component
- [ ] Every element has a short responsibility description
- [ ] Colors and shapes are explained in the legend

**Relationships**
- [ ] Every arrow is labeled with an action verb
- [ ] All arrows are unidirectional (no bidirectional arrows)
- [ ] Relationship labels match arrow direction
- [ ] Communication technology/protocol is specified for inter-process arrows
- [ ] Line styles and arrow heads are explained in the legend

**Scope**
- [ ] Only elements relevant to this diagram's scope are included
- [ ] External systems are shown as opaque boxes (no internal details)
- [ ] The diagram stands alone without requiring verbal explanation

## Which Diagram Should I Create?

| Question | Diagram |
|----------|---------|
| How does this system fit into the world? | System Context (Level 1) |
| What are the major technical building blocks? | Container (Level 2) |
| What is inside this container? | Component (Level 3) |
| How is this component implemented? | Code (Level 4) — auto-generate |
| How do multiple systems relate across the org? | System Landscape |
| What happens at runtime for this use case? | Dynamic |
| How is this deployed in production? | Deployment |

## Abstraction Decision Guide

| If you are describing... | It is a... |
|--------------------------|-----------|
| Something a team builds, owns, and deploys together | Software System |
| A separately deployed/running process or data store | Container |
| A module, package, or class group inside a container | Component |
| A class, interface, function, or data structure | Code element |
| A Docker host, VM, cloud instance, or execution env | Deployment Node |

## Tool Selection Quick Guide

| Situation | Recommended Tool |
|-----------|-----------------|
| Quick diagram in a README or PR | Mermaid |
| Long-lived architecture documentation | Structurizr DSL |
| Multi-team, enterprise-scale modeling | Structurizr DSL + Structurizr Cloud/On-Premises |
| Non-technical stakeholders need to create diagrams | IcePanel or Miro |
| Interactive architecture exploration | Structurizr, IcePanel, or Ilograph |

## Further Reading

- **Official C4 Model site**: c4model.com
- **Structurizr DSL documentation**: docs.structurizr.com/dsl
- **Mermaid C4 support**: mermaid.js.org
- **Simon Brown's O'Reilly book**: *The C4 Model: Visualizing Software Architecture* (July 2026)
- **GOTO 2024 talk**: "The C4 Model — Misconceptions, Misuses & Mistakes" by Simon Brown
