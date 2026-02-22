---
name: api-first-best-practices
description: Provides instructive best practices for API-first development — designing API contracts collaboratively with consumers before writing implementation code, enforcing contracts in CI/CD, and scaling adoption across teams. Use when advising on API design process, contract testing, mock-driven parallel development, API governance, OpenAPI specs, consumer-driven feedback, or designing APIs for AI-agent consumers.
---

# API-First Best Practices

## Purpose
Provide practical, instructive guidance for adopting and sustaining API-first development — where the API contract is designed, agreed upon, and reviewed before implementation begins.

## Workflow
1. Identify the user's goal: API design process, contract enforcement, governance, tooling selection, AI-agent readiness, or organizational adoption.
2. Assess current maturity: is the team backend-first, spec-after-the-fact, or partially API-first?
3. Diagnose anti-patterns: backend builds first, spec written after the fact, design in isolation, no enforcement, endless design phase, or accidental versioning.
4. Recommend concrete practices from the relevant domain (see below).
5. Provide tradeoffs, adoption path, and validation criteria.
6. Reference specific tooling options where appropriate, without prescribing a single vendor.

## Operating Principles
- The API contract precedes implementation. If the implementation diverges from the spec, the implementation is wrong.
- Consumers and producers design the contract together. One-sided design optimizes for one side at the expense of the other.
- Enforce the contract with automation, not good intentions. If CI doesn't catch drift, the contract is aspirational.
- Start with the consumer's workflow, not the data model. Work backward from what the UI or caller needs.
- Treat the spec as a living document that evolves through feedback, not a final decree.
- Governance should be lightweight and automated — guardrails, not bureaucracy.

## Guidance Domains

### 1) Collaboration Process
- Include consumers, producers, and a facilitator in design sessions.
- Start from the consumer's workflow, not the data model.
- Sketch endpoints and payloads informally before writing YAML.
- Surface disagreements and constraints immediately.
- Time-box design sessions; aim for "good enough to start," not "perfect."

### 2) The Contract as Artifact
- Write formal specs in OpenAPI (REST), AsyncAPI (event-driven), or Protocol Buffers (gRPC).
- Include every endpoint, data types with constraints, error schemas (RFC 9457), auth requirements, examples, and descriptions.
- Review specs via pull request with automated linting, consumer sign-off, security review, and breaking change detection.
- Maintain an organizational API style guide enforced by linting.
- Change the spec first, then the implementation — never the reverse.

### 3) Mock-Driven Parallel Development
- Generate mock servers from the agreed spec immediately after design.
- Consumers build against mocks; producers build against the same spec.
- Integration becomes a non-event when both sides follow the contract.
- Mocks validate contract conformance but do not replace real integration testing.

### 4) Consumer-Driven Feedback Loops
- Consumers report friction early — awkward response shapes, excessive calls, missing fields.
- Producers flag feasibility issues immediately rather than silently diverging.
- After launch, track actual usage patterns and collect consumer feedback systematically.
- Use consumer-driven contract testing (CDC) to formalize expectations.

### 5) CI/CD Enforcement
- Lint specs on every PR (Spectral, Redocly CLI).
- Detect breaking changes via spec diffing (oasdiff, Optic); require version bumps.
- Validate implementation responses against the spec (Schemathesis, Dredd, Specmatic).
- Run consumer contract tests (Pact, Spring Cloud Contract) on every provider PR.
- Goal: no PR merges that violate the style guide, introduce unversioned breaking changes, drift from the spec, or break a consumer contract.

### 6) Contract Testing
- Provider-side verification (spec conformance) is the non-negotiable baseline for every API.
- Consumer-driven contracts (CDC) add value when multiple teams depend on the same API.
- CDC flips the power dynamic: consumers declare dependencies, producers must satisfy them.

### 7) Governance
- Maintain an API catalog: name, owner, spec link, lifecycle stage (draft/active/deprecated/retired), known consumers.
- Use a lightweight design review gate: automated linting → consumer review → security review → merge.
- Follow a visible deprecation process: mark deprecated, publish migration guide, monitor usage, notify consumers, retire after sunset date.
- Track metrics: spec conformance, breaking changes caught in CI, time to first integration, consumer satisfaction.

### 8) Designing for AI-Agent Consumers
- Write description fields as if explaining to a non-expert — agents use these to decide when to call an operation.
- Provide example values for every field.
- Use clear operationId values (these become tool names in MCP and similar protocols).
- Be ruthlessly consistent in naming, casing, pagination, and error shapes.
- Prefer flat, predictable JSON structures over deeply nested objects.
- Return structured errors using RFC 9457 with stable type URIs.
- A complete, well-described OpenAPI spec is nearly MCP-compatible for free.

### 9) Organizational Adoption
- Start with one new API as a pilot; do not attempt a full rewrite.
- Address resistance directly: API-first shifts work earlier (cheaper), not later (expensive).
- For exploratory work, build a spike first, then extract and formalize the contract.
- Render specs visually for non-YAML audiences (Stoplight, SwaggerHub, Redoc).
- Automate guardrails so the process survives deadline pressure.
- Expand adoption based on demonstrated value, not mandates.

## Response Contract
When asked for recommendations, provide:
1. **Assessment**: current state, maturity level, and key risks.
2. **Anti-patterns**: which failure modes are present or likely.
3. **Recommendation**: prioritized actions with rationale.
4. **Tradeoffs**: what improves, what becomes harder, and why.
5. **Implementation guidance**: concrete steps, tooling options, and guardrails.
6. **Validation**: how to verify success.

## Constraints
- Do not prescribe a single tooling vendor; present options with tradeoffs.
- Do not recommend skipping consumer involvement in API design.
- Do not treat the spec as optional documentation — it is the governing artifact.
- Do not recommend process without automated enforcement.
- Do not conflate mock testing with integration testing.

## References
- references/process-and-collaboration.md — Sections 1–6: what API-first means, anti-patterns, collaboration process, the contract artifact, mock-driven development, consumer feedback loops.
- references/enforcement-and-adoption.md — Sections 7–13: CI/CD enforcement, contract testing, governance, AI-agent consumers, organizational adoption, tooling reference, sources.
