## 16. Arazzo for AI Agents and MCP

One of the most significant emerging use cases for Arazzo is enabling AI agents to consume APIs deterministically. This section covers the why, the how, and the current state of the ecosystem.

### The Problem: AI Agents Struggle with Raw OpenAPI

An OpenAPI spec tells an AI agent *what endpoints exist*, but not *how to chain them together*. Given a booking API, an agent might try to call `/book` before `/search` — it has no workflow context. Prompt engineering can fill this gap, but it is:

- **Fragile** — prompts drift as APIs evolve.
- **Non-standard** — every team reinvents the same instructions.
- **Non-deterministic** — LLMs may interpret the same prompt differently across runs.

### The Solution: Arazzo as the Instruction Layer

Arazzo provides a machine-readable, standardized description of *how* to use an API:

- **Step ordering** — the agent knows to search before booking.
- **Data dependencies** — the agent knows to pass the `tripId` from the search response into the booking request.
- **Success criteria** — the agent knows when a step has succeeded and can proceed.
- **Failure handling** — the agent knows to retry on 429 or refresh a token on 401.

This shifts orchestration from the LLM's reasoning loop (where it is "inherently fragile") into a protocol-defined layer where it is deterministic and verifiable.

### Arazzo + MCP (Model Context Protocol)

MCP allows AI clients and agents to discover and use tools. Arazzo fits into this architecture as the workflow definition that MCP tools execute:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  AI Agent    │────▶│  MCP Server │────▶│  Arazzo Workflow  │
│  (Claude,    │     │  (tool host)│     │  (step sequence)  │
│   GPT, etc.) │     │             │     │                   │
└─────────────┘     └─────────────┘     └──────┬───────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │  OpenAPI Operations  │
                                    │  (actual HTTP calls) │
                                    └─────────────────────┘
```

Instead of exposing every API endpoint as a separate MCP tool (which creates context sprawl and decision fatigue for the LLM), you expose Arazzo *workflows* as tools. The agent invokes "book a trip" rather than reasoning about five separate endpoints.

**Benefits of this pattern:**

- **Reduced token consumption** — the agent makes one tool call instead of reasoning through five.
- **Deterministic execution** — the workflow engine handles step sequencing, not the LLM.
- **Lower hallucination risk** — the agent doesn't need to guess call order or data dependencies.
- **Interoperability** — the same Arazzo spec works across different LLM platforms.

### AI Code Generation with Arazzo

When an AI coding assistant has access to both the OpenAPI spec and the Arazzo workflow, it can generate working client code that correctly:

- Sequences the API calls in the right order.
- Threads data between calls (IDs, tokens, etc.).
- Implements retry logic for steps that can fail transiently.
- Handles conditional branching (e.g., skip eligibility check for existing customers).

This has been demonstrated in practice: an AI assistant generated TypeScript code that included retry logic for a background check step because the Arazzo spec's `onFailure` action declared it as retryable.

### Practical Recommendations for API Providers

If you publish APIs and want to make them AI-ready:

1. **Ship Arazzo workflows alongside your OpenAPI spec.** Cover the primary user journeys — the 3-5 most common things developers do with your API.
2. **Define success criteria explicitly.** Don't rely on status codes alone. Validate response body fields that indicate business-level success.
3. **Declare failure actions.** Specify which failures are retryable and which are terminal. AI agents (and humans) benefit from this clarity equally.
4. **Keep workflows focused.** One workflow per business outcome. Don't create a single monolithic workflow that covers every possible path.
5. **Use descriptive names.** AI agents parse `workflowId`, `stepId`, `summary`, and `description` fields for context. Make them meaningful.
6. **Version your Arazzo docs alongside your API.** Every time the API evolves, update both the OpenAPI spec and the Arazzo workflows. Treat them as a single unit of documentation.

### Current Limitations

- **Tooling is still emerging.** There is no widely adopted tool that automatically generates client code from Arazzo specs. AI assistants can do it given the specs, but dedicated tooling is limited.
- **Execution engines are early-stage.** Projects like the Jentic Arazzo Runner exist, but the ecosystem is not yet mature.
- **AsyncAPI support is coming in v1.1.0**, which will allow workflows to span synchronous HTTP and event-driven protocols (WebSockets, webhooks).

---

## 17. Validation and Linting

Validate your Arazzo documents early and often. Two primary tools are available:

### Spectral (by Stoplight)

A flexible JSON/YAML linter with built-in Arazzo ruleset support.

```bash
# Install
npm install -g @stoplight/spectral-cli

# Create a ruleset that includes Arazzo rules
echo 'extends: ["spectral:arazzo"]' > .spectral.yaml

# Lint your document
spectral lint arazzo.yaml
```

Spectral supports custom rulesets, so you can add organization-specific rules on top of the built-in Arazzo validation. A VS Code extension is available for real-time linting as you type.

### Redocly CLI

A batteries-included CLI with native Arazzo support (v1.18+).

```bash
# Install
npm install -g @redocly/cli

# Lint — no configuration needed for basic validation
redocly lint arazzo.yaml
```

Redocly includes built-in rules for Arazzo structural validation. It supports CI/CD integration with a `github-actions` output format that annotates pull requests directly.

### Speakeasy (Go-based)

Speakeasy provides a Go package for programmatic Arazzo document validation:

```bash
# Validate using Speakeasy CLI
speakeasy validate arazzo -s arazzo.yaml
```

### CI/CD Integration

Add linting to your CI pipeline to catch problems before they reach production:

```yaml
# Example GitHub Actions step
- name: Lint Arazzo
  run: |
    npx @redocly/cli lint arazzo.yaml --format=github-actions
```

---

## 18. Best Practices Checklist

### Document Structure
- [ ] Name entry documents `arazzo.yaml` or `arazzo.json`.
- [ ] Use YAML 1.2 for round-trip JSON compatibility.
- [ ] Always specify the `arazzo` version field (`"1.0.1"`).
- [ ] Add `summary` and `description` to info, workflows, and steps.

### Naming
- [ ] Use descriptive `workflowId`s that reflect the business outcome: `apply-coupon`, not `workflow1`.
- [ ] Use descriptive `stepId`s that reflect the action: `search-pets`, not `step1`.
- [ ] Use descriptive `sourceDescription` names: `payments`, not `api2`.
- [ ] Stick to `[A-Za-z0-9_\-]+` for all IDs and names.

### Operations
- [ ] Prefer `operationId` over `operationPath` for referencing operations.
- [ ] Ensure every `operationId` reference actually exists in the source OpenAPI document.
- [ ] Use exactly one of `operationId`, `operationPath`, or `workflowId` per step.

### Data Flow
- [ ] Type and document all workflow inputs using JSON Schema.
- [ ] Only collect outputs that downstream steps or the calling workflow consume.
- [ ] Verify that every runtime expression references a step that precedes it in the sequence.

### Robustness
- [ ] Define `successCriteria` on every step — don't leave success/failure implicit.
- [ ] Use `onFailure` actions for known failure modes (rate limiting, auth expiry).
- [ ] Set reasonable `retryAfter` and `retryLimit` values for retry actions.
- [ ] Define workflow-level `failureActions` as defaults; override at the step level where needed.

### Reusability
- [ ] Extract repeated parameters (auth headers, pagination) into `components/parameters`.
- [ ] Extract shared input schemas into `components/inputs`.
- [ ] Extract common actions into `components/successActions` and `components/failureActions`.
- [ ] Use sub-workflows for reusable multi-step sequences.

### Maintenance
- [ ] Keep Arazzo documents versioned alongside the OpenAPI specs they reference.
- [ ] Update both when the API changes — treat them as a single documentation unit.
- [ ] Lint in CI to prevent structural regressions.
- [ ] Don't lock tooling to a specific patch version — all patches are backward-compatible.

---

