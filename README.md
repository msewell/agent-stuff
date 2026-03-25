# agent-stuff

A collection of reusable agent artifacts — skills, prompts, and more.

For the love of [Bob](https://en.wikipedia.org/wiki/J._R._%22Bob%22_Dobbs), if you use any of this stuff, use [pi](https://pi.dev/), not Claude Code.


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

Just ask your clanker to install whichever of these skills cater to your needs.

Or, if you use [Vercel's npx skills](https://github.com/vercel-labs/skills), you can install individual skills like this:

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
| [property-based-testing-with-kotest](skills/property-based-testing-with-kotest) | Writes property-based tests using Kotest's kotest-property module. Identifies testable properties, designs generators, and configures PBT for Kotlin/JVM projects. Use when writing property-based tests, creating custom Arb generators, choosing property patterns (roundtrip, invariant, idempotence, oracle), debugging shrunk counterexamples, or integrating PBT into a Kotlin test suite alongside example-based tests. |
| [reviewing-pull-requests](skills/reviewing-pull-requests) | Reviews GitHub pull requests end-to-end using gh CLI. Gathers PR metadata, diff, linked issues, and CI status. Analyzes code for bugs, security risks, performance issues, and goal alignment against repo conventions. Runs available lint, type-check, and test commands locally. Produces a prioritized report with severity-classified feedback (blocking, suggestion, nit, praise) and an approve/request-changes verdict. Optionally posts the review to GitHub after user confirmation. Use when asked to review a PR, check a pull request, audit code changes, evaluate if a PR is ready to merge, provide code review feedback, assess PR quality, or when the user says review PR #N, is this PR ready, look at this pull request, or code review. |
| [slicing-pbis](skills/slicing-pbis) | Slices, reviews, and writes product backlog items (PBIs) using priority-ordered quality characteristics (Valuable > Completable > Negotiable > Independent > Commensurate > Small), vertical slicing, and the splitting meta-pattern. Produces well-formed, commensurately sized PBIs with binary acceptance criteria. Use when splitting large PBIs or user stories, reviewing backlog items for quality, writing new PBIs from requirements, refining a product backlog, decomposing epics into stories, or when the user mentions PBI slicing, story splitting, backlog refinement, or vertical slices. |
| [specifying-by-example](skills/specifying-by-example) | Writes, reviews, and refines Specification by Example (SBE) artifacts — Gherkin scenarios, example mappings, rule-example tables, and scenario outlines. Produces declarative, single-behavior specifications using ubiquitous language. Use when writing acceptance criteria, Given-When-Then scenarios, feature files, BDD specifications, or executable specifications, when reviewing Gherkin for anti-patterns, when running Example Mapping or Three Amigos sessions, or when the user mentions SBE, BDD, specification by example, or spec-driven development. |
| [tdd-with-llm-agents](skills/tdd-with-llm-agents) | Enforces strict red/green/refactor TDD discipline when writing code. Guides the agent through one-test-at-a-time cycles, prevents test subversion, and ensures minimal implementation. Use when writing code with TDD, doing test-driven development, implementing features test-first, or when the user mentions red/green TDD, failing tests first, or test-driven workflow. |

### Writing & Communication

| Artifact | Description |
|----------|-------------|
| [applying-practical-typography](skills/applying-practical-typography) | Applies and reviews professional typography rules based on Butterick's Practical Typography. Covers characters and symbols (curly quotes, dashes, ellipses, nonbreaking spaces), text formatting (bold/italic, caps, kerning, letterspacing, color), body text settings (point size, line spacing, line length, indents, hyphenation), page layout (margins, headings, tables, lists, columns), font selection (professional vs system fonts, mixing, alternate figures), and document-specific guidance (emails, presentations, résumés, research papers, business cards, letterhead, websites). Use when generating or reviewing text for documents, web pages, presentations, or any formatted output, when the user asks about typography rules, when checking for common typography mistakes (straight quotes, double spaces, bad fonts, improper dashes), or when setting up document styles and layouts. |
| [generating-marp-slides](skills/generating-marp-slides) | Generates professional slide decks as Marp Markdown from source material (memos, documents, notes, bullet points). Produces assertion-titled, visually consistent presentations with speaker notes, exportable to PDF, PPTX, and HTML via Marp CLI. Use when creating presentations, generating slides, building a slide deck, making a pitch deck, converting a document to a presentation, or when the user mentions Marp, slides, or slide decks. |
| [stripping-ai-tells](skills/stripping-ai-tells) | Detects and removes AI writing tells (ChatGPT-isms, Claude-isms) from text using a three-pass editing workflow: vocabulary sweep, structural cleanup, and voice/tone adjustment. Identifies flagged words (delve, tapestry, robust, pivotal), structural patterns (tricolon abuse, synonym cycling, trailing participles, em-dash overuse), and tonal issues (sycophancy, hedging, importance puffery). Use when the user asks to remove AI tells, humanize AI text, make writing sound less like AI, edit for ChatGPT-isms or Claude-isms, strip AI language, clean up AI-generated content, or review text for machine-generated patterns. |
| [tweet-review](skills/tweet-review) | Reviews draft tweets and provides engagement optimization recommendations with improved alternatives. Use when the user has a draft tweet or thread and wants feedback on how to maximize reach, replies, and engagement on Twitter/X. Primarily niche-agnostic with additional guidance for tech Twitter. |
| [writing-anki-cards](skills/writing-anki-cards) | Generates and reviews Anki flashcards following spaced-repetition best practices, then pushes them directly into Anki via AnkiConnect. Produces atomic, precisely-worded cloze and Q/A cards from source material. Reviews existing cards for formulation problems and updates them in place. Use when the user asks to create Anki cards, flashcards, or spaced-repetition prompts from text, notes, articles, or documentation, or when asked to review, improve, or fix existing Anki cards. |
| [writing-git-commit-messages](skills/writing-git-commit-messages) | Writes and reviews git commit messages following Conventional Commits and the seven fundamental rules. Produces well-formatted, atomic, automation-friendly commit messages. Use when writing a commit message, reviewing commit messages, committing code changes, or when the user mentions git commits, commit messages, or changelogs. |
| [writing-persuasive-documents](skills/writing-persuasive-documents) | Writes and reviews persuasive professional documents — reports, proposals, memos, briefs, articles, and recommendations — using reader-centered principles: value-first openings, problem framing, tension language, cost of inaction, argument over explanation, and evidence building. Produces documents that change what readers think rather than showing what the writer knows. Use when drafting proposals, executive summaries, recommendations, business cases, or position papers, when reviewing or improving drafts for persuasiveness and impact, when restructuring a document to lead with the problem and stakes, or when the user mentions persuasive writing, making a case, or influencing a decision. |
| [writing-project-status-reports](skills/writing-project-status-reports) | Writes and reviews high-signal project status reports using RAG indicators, layered structure, and exception-based reporting. Produces weekly, monthly, milestone, and sprint status reports in Markdown. Use when drafting a project status report, reviewing an existing status report for quality, creating executive summaries, setting up RAG health indicators, or advising on reporting cadence and format. |

### Agent Tooling

| Artifact | Description |
|----------|-------------|
| [auto-improving-agents-md](skills/auto-improving-agents-md) | Sets up, structures, and auto-improves AGENTS.md files for coding agent projects. Bootstraps new AGENTS.md with self-improvement meta-rules, structures sections for clean rule placement, audits and prunes existing files against an instruction budget, performs end-of-session reflection to capture learnings, and proactively proposes AGENTS.md updates when corrections or conventions are discovered mid-session. Use when setting up AGENTS.md, adding auto-improvement to an existing AGENTS.md, pruning or auditing AGENTS.md, performing end-of-session reflection, or when the user mentions auto-improving, self-improving, or maintaining agent instructions. |
| [obsidian-best-practices](skills/obsidian-best-practices) | Guides setting up, configuring, and organizing Obsidian vaults for software engineers — folder structure, plugins, templates, Git backup, Dataview queries, and AI integrations. Also creates and edits Obsidian vault files following best practices for frontmatter schemas, wikilinks, Templater syntax, Dataview code blocks, and Canvas JSON. Use when setting up a new vault, recommending plugins, creating note templates, writing Dataview queries, configuring Git sync, advising on vault organization, or generating Obsidian-compatible Markdown files. |
| [toon-format](skills/toon-format) | Instructs an LLM agent when and how to use TOON (Token-Oriented Object Notation) for encoding and generating structured data. Use when injecting structured data into context, encoding tool results, preparing RAG documents, producing structured output, or advising on TOON integration. |
| [using-git-notes-for-ai-context](skills/using-git-notes-for-ai-context) | Reads, writes, and configures git notes and trailers for AI agent context — attribution, decision reasoning, prompts, and CI/CD metadata. Sets up namespace conventions, hook automation, team sync, and compliance. Use when storing AI attribution in git, setting up git notes for AI tracking, querying constraints or directives before modifying code, configuring notes sync for a team, choosing between git notes and trailers, or when the user mentions git notes, git trailers, AI attribution, AI provenance, Lore protocol, or decision context in commits. |
| [writing-agent-skills](skills/writing-agent-skills) | Creates, reviews, and iterates on Agent Skills (the open, cross-platform format for extending AI agents). Scaffolds new skill directories, writes SKILL.md files with proper frontmatter and body structure, applies progressive disclosure, reviews existing skills for anti-patterns, and guides testing workflows. Use when the user asks to create a skill, write a SKILL.md, review or improve an existing skill, or structure agent instructions. |

### System Architecture

| Artifact | Description |
|----------|-------------|
| [applying-vertical-slice-architecture](skills/applying-vertical-slice-architecture) | Designs, reviews, and migrates codebases using Vertical Slice Architecture (VSA) — organizing by business capability instead of technical layer. Produces slice boundaries, folder structures, sharing strategies, and migration plans. Use when designing a new VSA codebase, reviewing an existing VSA codebase for anti-patterns, migrating from layered architecture to vertical slices, deciding slice granularity or folder organization, handling shared code across slices, or when the user mentions vertical slices, feature folders, or organizing by use case. |
| [assessing-platform-scalability](skills/assessing-platform-scalability) | Performs end-to-end platform scalability assessments using a phased methodology, maturity scoring model, risk classification, and prioritized remediation planning. Produces structured scalability reports with evidence, scorecards, and actionable roadmaps, plus optional executive summaries and incident runbook drafts. Use when evaluating whether a system can handle growth, diagnosing scaling bottlenecks, preparing technical due diligence, designing load or resilience validation plans, or building a scalability improvement strategy. |
| [creating-c4-diagrams](skills/creating-c4-diagrams) | Creates, reviews, and interprets C4 software architecture diagrams (System Context, Container, Component, Dynamic, Deployment). Produces Structurizr DSL or Mermaid diagram code following C4 model best practices. Use when creating architecture diagrams for a system, reviewing existing C4 diagrams for correctness and anti-patterns, generating Structurizr DSL workspaces, producing Mermaid C4 diagrams for READMEs, or using C4 diagrams as context for design decisions, code generation, risk analysis, or onboarding. |
| [designing-deep-modules](skills/designing-deep-modules) | Guides designing, reviewing, and refactoring modules for depth — maximizing functionality hidden behind minimal interfaces. Analyzes module boundaries, identifies shallow modules and classitis, applies deep module heuristics (pull complexity downward, define errors out of existence, design for the common case), and produces refactoring plans. Covers information hiding, leaky abstractions, and abstraction boundaries based on Ousterhout's A Philosophy of Software Design. Use when designing module interfaces, reviewing code for shallow abstractions, refactoring pass-through layers, evaluating API surface area, reducing interface complexity, or applying deep module principles at any scale (functions, classes, packages, services, APIs). |
| [mermaid-sequence-diagrams](skills/mermaid-sequence-diagrams) | Generates, reviews, and fixes Mermaid sequence diagrams following syntax rules and best practices. Use when creating sequence diagrams from system descriptions, reviewing existing Mermaid sequence diagrams for correctness, fixing parse errors, or refactoring large diagrams into focused sub-diagrams. Covers participants, arrows, activations, control flow, notes, styling, and common anti-patterns. |
| [reducing-coupling](skills/reducing-coupling) | Analyzes a codebase scope for coupling issues, diagnoses coupling types using the Connascence framework, and proposes a comprehensive refactoring plan with concrete code changes. Use when asked to find coupling, reduce dependencies, decouple modules, or improve modularity in a codebase. |
<!-- SKILLS:END -->

## Prompts

<!-- PROMPTS:START -->
| Name | Description |
|------|-------------|
| [codex-exec-plan](prompts/codex-exec-plan.md) | Create a plan using codex_exec_plans guidance and installed skills. |
| [reflect](prompts/reflect.md) | Reflect on session learnings and propose AGENTS.md updates |
| [review-maintainability](prompts/review-maintainability.md) | Review code for long-term maintainability, simplicity, and removal opportunities |
<!-- PROMPTS:END -->

<!-- Run `.scripts/gen-index.sh` to regenerate the index. -->
