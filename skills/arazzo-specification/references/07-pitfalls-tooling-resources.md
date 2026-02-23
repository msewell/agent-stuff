## 19. Common Pitfalls

### 1. Forgetting Case Sensitivity

All Arazzo field names are case-sensitive. `successCriteria` works; `SuccessCriteria` does not. The one exception is HTTP header names, which are case-insensitive per RFC 9110.

### 2. Mixing Up `$ref` and `reference`

- **`$ref`** is for JSON Schema references (used in `inputs` schemas).
- **`reference`** is for Arazzo's own Reusable Object (used in parameter arrays, action arrays).

Using `$ref` where `reference` is expected (or vice versa) is a common source of validation errors.

### 3. Referencing a Non-Existent `operationId`

If the `operationId` doesn't exist in the source OpenAPI document, the workflow is invalid. This often happens after API refactoring. Lint in CI to catch this.

### 4. Stale Server URLs

If your Arazzo document (or the OpenAPI spec it references) contains hardcoded server URLs that point to stale or incorrect hosts, workflow execution will fail. Keep server entries up to date, or use relative references.

### 5. Over-Collecting Outputs

Extracting every response field as an output turns the workflow into a data model duplicate. Only output what subsequent steps or the caller actually needs.

### 6. Circular Workflow References

A workflow that invokes itself (directly or indirectly) creates an infinite loop. The spec doesn't explicitly prohibit this, so tooling may not catch it. Be deliberate about composition.

### 7. Assuming Arazzo Handles Security

Arazzo does not enforce authentication or authorization. Security is delegated to the OpenAPI spec's security schemes and the runtime implementation. Use HTTPS for all workflow communication, and pass auth tokens via parameters.

### 8. Ignoring `dependsOn`

The `dependsOn` field declares prerequisite workflows but doesn't invoke them. If a workflow depends on `authenticate-user`, the caller is responsible for ensuring that workflow has run. Tooling uses `dependsOn` for ordering, not automatic execution.

### 9. Using `operationPath` When `operationId` Is Available

`operationPath` uses JSON Pointers, which break if the API path changes. `operationId` is stable across path refactoring. Only use `operationPath` for third-party APIs where you can't control the operation IDs.

### 10. Not Validating Early

Writing a large Arazzo document without validation leads to cascading errors. Lint early, lint often, and lint in CI.

---

## 20. Tooling Ecosystem

The Arazzo tooling ecosystem is growing. Here is the current landscape:

### Authoring & Validation

| Tool | Type | Notes |
|---|---|---|
| [Spectral](https://github.com/stoplightio/spectral) | Linter | Flexible rulesets, VS Code extension, custom rules |
| [Redocly CLI](https://github.com/Redocly/redocly-cli) | Linter + validator | Built-in Arazzo rules, CI/CD integration, Respect (contract testing) |
| [Speakeasy CLI](https://github.com/speakeasy-api/openapi) | Validator | Go-based, programmatic validation |
| [Vacuum (pb33f)](https://quobix.com/vacuum/) | Linter | High-performance, OpenAPI Doctor integration |

### Visualization

| Tool | Type | Notes |
|---|---|---|
| [API Flows Studio](https://github.com/api-flows/api-flows-studio) | Web visualizer | Renders Arazzo workflows as visual diagrams |

### Execution

| Tool | Type | Notes |
|---|---|---|
| [Jentic Arazzo Runner](https://jentic.com) | Workflow runner | Executes Arazzo workflows, Apache 2.0 licensed |
| [Redocly Respect](https://redocly.com) | Contract tester | Sends real HTTP requests, validates against Arazzo workflows |
| [Specmatic](https://specmatic.io) | Mock + test | Visual workflow mocking and contract testing |

### Generation

| Tool | Type | Notes |
|---|---|---|
| [Jentic Arazzo Generator](https://jentic.com) | AI-assisted generator | Proposes workflows from OpenAPI specs using LLMs |
| [Arazzo Specification GPT](https://github.com/frankkilcommins/describing-api-workflows-with-arazzo) | GPT-based assistant | Helps author Arazzo documents interactively |

### IDE Support

- **Spectral VS Code Extension** — Real-time linting with custom ruleset support.
- **Redocly VS Code Extension** — Autocomplete and validation for Arazzo documents.

---

## 21. Resources

### Official Specifications
- [Arazzo Specification v1.0.1](https://spec.openapis.org/arazzo/latest.html) — The authoritative specification.
- [Arazzo GitHub Repository](https://github.com/OAI/Arazzo-Specification) — Source, examples, and discussions.
- [OpenAPI Initiative — Arazzo](https://www.openapis.org/arazzo-specification) — Project overview and roadmap.

### Official Examples
- [BNPL Workflow](https://github.com/OAI/Arazzo-Specification/blob/main/examples/1.0.0/bnpl-arazzo.yaml) — Multi-API buy-now-pay-later checkout.
- [Pet Coupons Workflow](https://github.com/OAI/Arazzo-Specification/blob/main/examples/1.0.0/pet-coupons.arazzo.yaml) — Workflow composition and parameter reuse.
- [More Examples](https://github.com/OAI/Arazzo-Specification/tree/main/examples/) — Additional community examples.
- [frankkilcommins/arazzo-examples](https://github.com/frankkilcommins/arazzo-examples) — Examples spanning OpenAPI and AsyncAPI.

### Tutorials & Guides
- [Redocly — Arazzo Basics: Structure and Syntax](https://redocly.com/learn/arazzo/arazzo-basics) — Step-by-step tutorial.
- [Redocly — Learn Arazzo by Example](https://redocly.com/learn/arazzo/arazzo-walkthrough) — Walkthrough with working examples.
- [Speakeasy — Arazzo in OpenAPI Best Practices](https://www.speakeasy.com/openapi/arazzo) — Comprehensive reference.
- [Apidog — Arazzo Practical Guide](https://apidog.com/blog/arazzo-specification/) — Practical authoring guide.
- [Workflows.guru — What is Arazzo](https://www.workflows.guru/blogs/what-is-arazzo) — Deep structural walkthrough with validation guide.

### Deep Dives & Analysis
- [Swagger.io — The Arazzo Specification: A Deep Dive](https://swagger.io/blog/the-arazzo-specification-a-deep-dive/) — Comprehensive technical overview.
- [Marmelab — Arazzo: The Missing Piece for AI-Assisted API Consumption](https://marmelab.com/blog/2026/02/02/arazzo-a-documentation-helper-for-generating-client-code-using-ai.html) — AI code generation with Arazzo.
- [Bump.sh — OpenAPI Won't Make Your APIs AI-Ready. But Arazzo Can.](https://bump.sh/blog/make-your-apis-ai-ready/) — Arazzo for AI agent readiness.
- [Tyk — Arazzo and AI Agents: Your Essential Starter Guide](https://tyk.io/blog/arazzo-and-ai-agents-your-essential-starter-guide/) — Arazzo in the AI agent ecosystem.
- [SmartBear — From Endpoints to Intent: Agent API Workflows with Arazzo and MCP](https://smartbear.com/blog/from-endpoints-to-intent-rethinking-agent-api-workflows-with-arazzo/) — MCP integration patterns.
- [Nordic APIs — How Arazzo Could Help MCP Servers Orchestrate APIs](https://nordicapis.com/how-arazzo-could-help-mcp-servers-orchestrate-apis-for-ai-consumers/) — MCP server orchestration.
- [The New Stack — The Rise of AI Agents: How Arazzo Is Defining the Future](https://thenewstack.io/the-rise-of-ai-agents-how-arazzo-is-defining-the-future-of-api-workflows/) — Industry perspective.
- [Jentic — Building Reliable API Workflows with Arazzo](https://jentic.com/blog/building-reliable-api-workflows-with-arazzo) — Practical reliability patterns.

### Linting & Validation
- [Redocly — Lint Arazzo with Redocly CLI](https://redocly.com/docs/cli/guides/lint-arazzo) — Setup and configuration.
- [Redocly — Linting Arazzo Workflows](https://redocly.com/learn/arazzo/linting-arazzo-workflows) — Ruleset guide.
- [Spectral GitHub](https://github.com/stoplightio/spectral) — Custom rulesets for Arazzo.
