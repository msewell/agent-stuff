# agent-stuff

A collection of reusable agent artifacts — skills, prompts, and more.

## Skills

### Installation

If you use [Vercel's npx skills](https://github.com/vercel-labs/skills), you can install individual skills like this:

```bash
npx skills add msewell/agent-stuff/skills/<skill-name>
```

<!-- SKILLS:START -->
| Artifact | Description |
|----------|-------------|
| [api-first-best-practices](skills/api-first-best-practices) | Provides instructive best practices for API-first development — designing API contracts collaboratively with consumers before writing implementation code, enforcing contracts in CI/CD, and scaling adoption across teams. Use when advising on API design process, contract testing, mock-driven parallel development, API governance, OpenAPI specs, consumer-driven feedback, or designing APIs for AI-agent consumers. |
| [arazzo-specification](skills/arazzo-specification) | Guides writing, reviewing, and modifying Arazzo workflow specifications (OpenAPI Initiative standard for multi-step API workflows). Use when creating Arazzo documents from scratch, adding steps or workflows to existing specs, reviewing Arazzo files for correctness, or generating API workflow definitions. Covers document structure, runtime expressions, success criteria, control flow, data threading, reusable components, workflow composition, AI agent integration, and validation. |
| [kotlin-functional-programming](skills/kotlin-functional-programming) | Guides writing idiomatic, functional-style Kotlin code using built-in language features. Use when asked to write, review, or refactor Kotlin code for immutability, pure functions, sealed types, error handling, collections, coroutines, or functional architecture patterns. |
| [making-invalid-states-unrepresentable](skills/making-invalid-states-unrepresentable) | Analyzes existing code and guides new type design to make invalid states unrepresentable using type system techniques such as sum types, newtypes, typestate, branded types, and parse-don't-validate. Use when reviewing code for invalid-state bugs, refactoring types to eliminate impossible states, designing domain models, or applying compile-time correctness patterns. Language-agnostic. |
| [mermaid-sequence-diagrams](skills/mermaid-sequence-diagrams) | Generates, reviews, and fixes Mermaid sequence diagrams following syntax rules and best practices. Use when creating sequence diagrams from system descriptions, reviewing existing Mermaid sequence diagrams for correctness, fixing parse errors, or refactoring large diagrams into focused sub-diagrams. Covers participants, arrows, activations, control flow, notes, styling, and common anti-patterns. |
| [obsidian-best-practices](skills/obsidian-best-practices) | Guides setting up, configuring, and organizing Obsidian vaults for software engineers — folder structure, plugins, templates, Git backup, Dataview queries, and AI integrations. Also creates and edits Obsidian vault files following best practices for frontmatter schemas, wikilinks, Templater syntax, Dataview code blocks, and Canvas JSON. Use when setting up a new vault, recommending plugins, creating note templates, writing Dataview queries, configuring Git sync, advising on vault organization, or generating Obsidian-compatible Markdown files. |
| [reducing-coupling](skills/reducing-coupling) | Analyzes a codebase scope for coupling issues, diagnoses coupling types using the Connascence framework, and proposes a comprehensive refactoring plan with concrete code changes. Use when asked to find coupling, reduce dependencies, decouple modules, or improve modularity in a codebase. |
| [testing-with-nullables](skills/testing-with-nullables) | "Guides writing fast, reliable, refactoring-friendly tests using the Nullables pattern language (James Shore's 'Testing Without Mocks'). Produces narrow, sociable, state-based tests with production code that has an infrastructure 'off switch' — no mock frameworks needed. Use when writing tests, replacing mocks with Nullables, making infrastructure code testable, adding createNull() factories, implementing output tracking, wrapping external dependencies, or adopting testing-without-mocks patterns. Covers embedded stubs, configurable responses, behavior simulation, A-Frame architecture, and incremental migration from mock-based test suites." |
| [toon-format](skills/toon-format) | Instructs an LLM agent when and how to use TOON (Token-Oriented Object Notation) for encoding and generating structured data. Use when injecting structured data into context, encoding tool results, preparing RAG documents, producing structured output, or advising on TOON integration. |
| [tweet-review](skills/tweet-review) | Reviews draft tweets and provides engagement optimization recommendations with improved alternatives. Use when the user has a draft tweet or thread and wants feedback on how to maximize reach, replies, and engagement on Twitter/X. Primarily niche-agnostic with additional guidance for tech Twitter. |
| [writing-agent-skills](skills/writing-agent-skills) | Creates, reviews, and iterates on Agent Skills (the open, cross-platform format for extending AI agents). Scaffolds new skill directories, writes SKILL.md files with proper frontmatter and body structure, applies progressive disclosure, reviews existing skills for anti-patterns, and guides testing workflows. Use when the user asks to create a skill, write a SKILL.md, review or improve an existing skill, or structure agent instructions. |
<!-- SKILLS:END -->

## Prompts

<!-- PROMPTS:START -->
| Name | Description |
|------|-------------|
| [review-scope](prompts/review-scope.md) | Review changes within a scope for long-term maintainability |
<!-- PROMPTS:END -->

<!-- Run `.scripts/gen-index.sh` to regenerate the index. -->
