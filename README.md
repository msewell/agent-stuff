# agent-stuff

A collection of reusable agent artifacts — skills, prompts, and more.

## Table of Contents

<!-- TOC:START -->
- [Skills](#skills)
  - [Installation](#installation)
  - [Software Engineering](#software-engineering)
  - [Writing & Communication](#writing--communication)
  - [Agent Tooling](#agent-tooling)
  - [System Architecture](#system-architecture)
- [Prompts](#prompts)
<!-- TOC:END -->

## Skills

### Installation

If you use [Vercel's npx skills](https://github.com/vercel-labs/skills), you can install individual skills like this:

```bash
npx skills add msewell/agent-stuff/skills/<skill-name>
```

<!-- SKILLS:START -->
### Software Engineering

| Artifact | Description |
|----------|-------------|
| [arazzo-specification](skills/arazzo-specification) | Guides writing, reviewing, and modifying Arazzo workflow specifications (OpenAPI Initiative standard for multi-step API workflows). Use when creating Arazzo documents from scratch, adding steps or workflows to existing specs, reviewing Arazzo files for correctness, or generating API workflow definitions. Covers document structure, runtime expressions, success criteria, control flow, data threading, reusable components, workflow composition, AI agent integration, and validation. |
| [building-tuning-panels](skills/building-tuning-panels) | Builds live parameter tuning panels as floating developer overlays with sliders, toggles, color pickers, dropdowns, and spring controls wired to app values for real-time visual exploration. Selects suitable panel libraries by stack (DialKit, Leva, Tweakpane, lil-gui, native HTML), maps hardcoded values to controls with sensible ranges, adds export/presets, and strips panel code from production builds. Use when users ask to add debug sliders, a variables panel, a tuning panel/GUI, or live tweak controls for animation, styling, layout, typography, color, physics, or chart parameters. |
| [designing-rest-apis](skills/designing-rest-apis) | Guides designing, reviewing, and governing RESTful APIs — resource modeling, URL structure, HTTP methods, status codes, error handling (RFC 9457), pagination, versioning, security, authentication, caching, idempotency, bulk operations, async patterns, file uploads, OpenAPI documentation, API-first process, and AI-agent consumers. Use when designing new REST API endpoints, reviewing existing API designs, adopting API-first development, running API design sessions, enforcing API contracts in CI/CD, governing an API program, choosing between REST patterns (cursor vs offset pagination, PUT vs PATCH, polling vs webhooks), writing OpenAPI specs, designing for AI-agent consumers (MCP), or making API evolution and deprecation decisions. |
| [kotlin-functional-programming](skills/kotlin-functional-programming) | Guides writing idiomatic, functional-style Kotlin code using built-in language features. Use when asked to write, review, or refactor Kotlin code for immutability, pure functions, sealed types, error handling, collections, coroutines, or functional architecture patterns. |
| [making-invalid-states-unrepresentable](skills/making-invalid-states-unrepresentable) | Analyzes existing code and guides new type design to make invalid states unrepresentable using type system techniques such as sum types, newtypes, typestate, branded types, and parse-don't-validate. Use when reviewing code for invalid-state bugs, refactoring types to eliminate impossible states, designing domain models, or applying compile-time correctness patterns. Language-agnostic. |
| [mermaid-sequence-diagrams](skills/mermaid-sequence-diagrams) | Generates, reviews, and fixes Mermaid sequence diagrams following syntax rules and best practices. Use when creating sequence diagrams from system descriptions, reviewing existing Mermaid sequence diagrams for correctness, fixing parse errors, or refactoring large diagrams into focused sub-diagrams. Covers participants, arrows, activations, control flow, notes, styling, and common anti-patterns. |
| [property-based-testing-with-kotest](skills/property-based-testing-with-kotest) | Writes property-based tests using Kotest's kotest-property module. Identifies testable properties, designs generators, and configures PBT for Kotlin/JVM projects. Use when writing property-based tests, creating custom Arb generators, choosing property patterns (roundtrip, invariant, idempotence, oracle), debugging shrunk counterexamples, or integrating PBT into a Kotlin test suite alongside example-based tests. |
| [tdd-with-llm-agents](skills/tdd-with-llm-agents) | Enforces strict red/green/refactor TDD discipline when writing code. Guides the agent through one-test-at-a-time cycles, prevents test subversion, and ensures minimal implementation. Use when writing code with TDD, doing test-driven development, implementing features test-first, or when the user mentions red/green TDD, failing tests first, or test-driven workflow. |

### Writing & Communication

| Artifact | Description |
|----------|-------------|
| [generating-marp-slides](skills/generating-marp-slides) | Generates professional slide decks as Marp Markdown from source material (memos, documents, notes, bullet points). Produces assertion-titled, visually consistent presentations with speaker notes, exportable to PDF, PPTX, and HTML via Marp CLI. Use when creating presentations, generating slides, building a slide deck, making a pitch deck, converting a document to a presentation, or when the user mentions Marp, slides, or slide decks. |
| [tweet-review](skills/tweet-review) | Reviews draft tweets and provides engagement optimization recommendations with improved alternatives. Use when the user has a draft tweet or thread and wants feedback on how to maximize reach, replies, and engagement on Twitter/X. Primarily niche-agnostic with additional guidance for tech Twitter. |
| [writing-git-commit-messages](skills/writing-git-commit-messages) | Writes and reviews git commit messages following Conventional Commits and the seven fundamental rules. Produces well-formatted, atomic, automation-friendly commit messages. Use when writing a commit message, reviewing commit messages, committing code changes, or when the user mentions git commits, commit messages, or changelogs. |
| [writing-persuasive-documents](skills/writing-persuasive-documents) | Writes and reviews persuasive professional documents — reports, proposals, memos, briefs, articles, and recommendations — using reader-centered principles: value-first openings, problem framing, tension language, cost of inaction, argument over explanation, and evidence building. Produces documents that change what readers think rather than showing what the writer knows. Use when drafting proposals, executive summaries, recommendations, business cases, or position papers, when reviewing or improving drafts for persuasiveness and impact, when restructuring a document to lead with the problem and stakes, or when the user mentions persuasive writing, making a case, or influencing a decision. |
| [writing-project-status-reports](skills/writing-project-status-reports) | Writes and reviews high-signal project status reports using RAG indicators, layered structure, and exception-based reporting. Produces weekly, monthly, milestone, and sprint status reports in Markdown. Use when drafting a project status report, reviewing an existing status report for quality, creating executive summaries, setting up RAG health indicators, or advising on reporting cadence and format. |

### Agent Tooling

| Artifact | Description |
|----------|-------------|
| [obsidian-best-practices](skills/obsidian-best-practices) | Guides setting up, configuring, and organizing Obsidian vaults for software engineers — folder structure, plugins, templates, Git backup, Dataview queries, and AI integrations. Also creates and edits Obsidian vault files following best practices for frontmatter schemas, wikilinks, Templater syntax, Dataview code blocks, and Canvas JSON. Use when setting up a new vault, recommending plugins, creating note templates, writing Dataview queries, configuring Git sync, advising on vault organization, or generating Obsidian-compatible Markdown files. |
| [toon-format](skills/toon-format) | Instructs an LLM agent when and how to use TOON (Token-Oriented Object Notation) for encoding and generating structured data. Use when injecting structured data into context, encoding tool results, preparing RAG documents, producing structured output, or advising on TOON integration. |
| [writing-agent-skills](skills/writing-agent-skills) | Creates, reviews, and iterates on Agent Skills (the open, cross-platform format for extending AI agents). Scaffolds new skill directories, writes SKILL.md files with proper frontmatter and body structure, applies progressive disclosure, reviews existing skills for anti-patterns, and guides testing workflows. Use when the user asks to create a skill, write a SKILL.md, review or improve an existing skill, or structure agent instructions. |

### System Architecture

| Artifact | Description |
|----------|-------------|
| [creating-c4-diagrams](skills/creating-c4-diagrams) | Creates, reviews, and interprets C4 software architecture diagrams (System Context, Container, Component, Dynamic, Deployment). Produces Structurizr DSL or Mermaid diagram code following C4 model best practices. Use when creating architecture diagrams for a system, reviewing existing C4 diagrams for correctness and anti-patterns, generating Structurizr DSL workspaces, producing Mermaid C4 diagrams for READMEs, or using C4 diagrams as context for design decisions, code generation, risk analysis, or onboarding. |
| [designing-deep-modules](skills/designing-deep-modules) | Guides designing, reviewing, and refactoring modules for depth — maximizing functionality hidden behind minimal interfaces. Analyzes module boundaries, identifies shallow modules and classitis, applies deep module heuristics (pull complexity downward, define errors out of existence, design for the common case), and produces refactoring plans. Covers information hiding, leaky abstractions, and abstraction boundaries based on Ousterhout's A Philosophy of Software Design. Use when designing module interfaces, reviewing code for shallow abstractions, refactoring pass-through layers, evaluating API surface area, reducing interface complexity, or applying deep module principles at any scale (functions, classes, packages, services, APIs). |
| [reducing-coupling](skills/reducing-coupling) | Analyzes a codebase scope for coupling issues, diagnoses coupling types using the Connascence framework, and proposes a comprehensive refactoring plan with concrete code changes. Use when asked to find coupling, reduce dependencies, decouple modules, or improve modularity in a codebase. |
<!-- SKILLS:END -->

## Prompts

<!-- PROMPTS:START -->
| Name | Description |
|------|-------------|
| [review-scope](prompts/review-scope.md) | Review changes within a scope for long-term maintainability |
<!-- PROMPTS:END -->

<!-- Run `.scripts/gen-index.sh` to regenerate the index. -->
