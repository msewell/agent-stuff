# agent-stuff

A collection of reusable agent artifacts — skills, prompts, and more.

## Installation

If you use [Vercel's npx skills](https://github.com/vercel-labs/skills), you can install individual skills like this:

```bash
npx skills add msewell/agent-stuff/skills/<skill-name>
```

## Index

<!-- INDEX:START -->
| Artifact | Description |
|----------|-------------|
| [api-first-best-practices](skills/api-first-best-practices) | Provides instructive best practices for API-first development — designing API contracts collaboratively with consumers before writing implementation code, enforcing contracts in CI/CD, and scaling adoption across teams. Use when advising on API design process, contract testing, mock-driven parallel development, API governance, OpenAPI specs, consumer-driven feedback, or designing APIs for AI-agent consumers. |
| [arazzo-specification](skills/arazzo-specification) | Guides writing, reviewing, and modifying Arazzo workflow specifications (OpenAPI Initiative standard for multi-step API workflows). Use when creating Arazzo documents from scratch, adding steps or workflows to existing specs, reviewing Arazzo files for correctness, or generating API workflow definitions. Covers document structure, runtime expressions, success criteria, control flow, data threading, reusable components, workflow composition, AI agent integration, and validation. |
| [kotlin-functional-programming](skills/kotlin-functional-programming) | Guides writing idiomatic, functional-style Kotlin code using built-in language features. Use when asked to write, review, or refactor Kotlin code for immutability, pure functions, sealed types, error handling, collections, coroutines, or functional architecture patterns. |
| [making-invalid-states-unrepresentable](skills/making-invalid-states-unrepresentable) | Analyzes existing code and guides new type design to make invalid states unrepresentable using type system techniques such as sum types, newtypes, typestate, branded types, and parse-don't-validate. Use when reviewing code for invalid-state bugs, refactoring types to eliminate impossible states, designing domain models, or applying compile-time correctness patterns. Language-agnostic. |
| [reducing-coupling](skills/reducing-coupling) | Analyzes a codebase scope for coupling issues, diagnoses coupling types using the Connascence framework, and proposes a comprehensive refactoring plan with concrete code changes. Use when asked to find coupling, reduce dependencies, decouple modules, or improve modularity in a codebase. |
| [toon-format](skills/toon-format) | Instructs an LLM agent when and how to use TOON (Token-Oriented Object Notation) for encoding and generating structured data. Use when injecting structured data into context, encoding tool results, preparing RAG documents, producing structured output, or advising on TOON integration. |
| [tweet-review](skills/tweet-review) | Reviews draft tweets and provides engagement optimization recommendations with improved alternatives. Use when the user has a draft tweet or thread and wants feedback on how to maximize reach, replies, and engagement on Twitter/X. Primarily niche-agnostic with additional guidance for tech Twitter. |
<!-- INDEX:END -->

<!-- Run `.scripts/gen-index.sh` to regenerate the index. -->
