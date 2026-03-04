---
name: arazzo-specification
description: Guides writing, reviewing, and modifying Arazzo workflow specifications (OpenAPI Initiative standard for multi-step API workflows). Use when creating Arazzo documents from scratch, adding steps or workflows to existing specs, reviewing Arazzo files for correctness, or generating API workflow definitions. Covers document structure, runtime expressions, success criteria, control flow, data threading, reusable components, workflow composition, AI agent integration, and validation.
category: Software Engineering
---

# Arazzo Specification

Write, review, and modify Arazzo workflow specifications that describe deterministic, multi-step API workflows on top of OpenAPI.

## Workflow

### Authoring a New Arazzo Document
1. Identify the business outcome the workflow achieves.
2. Collect the OpenAPI spec(s) involved and note the `operationId`s needed.
3. Read `references/01-overview-and-structure.md` for document skeleton and naming.
4. Read `references/02-core-constructs.md` for source descriptions, steps, parameters, request bodies, and runtime expressions.
5. Draft the document using the skeleton below.
6. Define each step: choose `operationId` (preferred), `operationPath`, or `workflowId`.
7. Thread data between steps using runtime expressions and step outputs.
8. Add success criteria to every step — read `references/03-criteria-flow-outputs.md`.
9. Add failure/success actions for known failure modes (rate limits, auth expiry) — same reference.
10. Extract repeated elements into `components` — read `references/04-reuse-and-composition.md`.
11. For sub-workflow composition, read `references/04-reuse-and-composition.md`.
12. Validate with the checklist below and recommend linting tools from `references/06-ai-agents-validation-practices.md`.

### Reviewing an Existing Arazzo Document
1. Validate structure against the skeleton below.
2. Check every item in the best practices checklist below.
3. Read `references/07-pitfalls-tooling-resources.md` and scan for common pitfalls.
4. Verify all `operationId` references exist in the source OpenAPI document(s).
5. Verify all runtime expressions reference steps that precede them in sequence.
6. Suggest linting integration (Spectral, Redocly CLI).

### For AI Agent / MCP Integration
- Read `references/06-ai-agents-validation-practices.md` for patterns on exposing Arazzo workflows as MCP tools and reducing LLM token consumption.

## Document Skeleton

```yaml
arazzo: "1.0.1"
info:
  title: Workflow Title
  version: "1.0.0"
  description: What this workflow achieves.

sourceDescriptions:
  - name: myApi          # Descriptive name, used as operationId prefix
    url: ./openapi.yaml
    type: openapi

workflows:
  - workflowId: my-workflow
    summary: One-line purpose.
    inputs:
      type: object
      properties:
        param_name:
          type: string
    steps:
      - stepId: first-step
        description: What this step does and why.
        operationId: myApi.someOperation
        parameters:
          - name: paramName
            in: query
            value: $inputs.param_name
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          result_id: $response.body#/id

      - stepId: second-step
        operationId: myApi.anotherOperation
        parameters:
          - name: id
            in: path
            value: $steps.first-step.outputs.result_id
        successCriteria:
          - condition: $statusCode == 200
    outputs:
      workflow_result: $steps.first-step.outputs.result_id

components:
  parameters: {}
  inputs: {}
  successActions: {}
  failureActions: {}
```

## Runtime Expression Quick Reference

| Expression | Resolves To |
|---|---|
| `$inputs.fieldName` | Workflow input value |
| `$steps.stepId.outputs.name` | Output from a previous step |
| `$statusCode` | HTTP response status code |
| `$response.body` | Full response body |
| `$response.body#/json/pointer` | Specific field via JSON Pointer (RFC 6901) |
| `$response.header.name` | Response header value |
| `$request.body#/json/pointer` | Specific field in request body |
| `$workflows.workflowId.outputs.name` | Output from another workflow |
| `$components.parameters.name` | Reusable parameter from components |
| `$url` / `$method` | Request URL / HTTP method |

**Embedding in strings:** Use curly braces — `"Bearer {$steps.auth.outputs.token}"`. When the entire value is an expression, no braces needed: `value: $inputs.pet_id`.

**JSON Pointer:** `#/0/id` = first array element's `id`. `#/data/customer/email` = nested field. Escape `/` as `~1`, `~` as `~0`.

## Operation Reference Rules

Use exactly one per step (mutually exclusive):

| Field | When to Use |
|---|---|
| `operationId` | **Preferred.** Stable across path changes. Format: `sourceName.operationId`. |
| `operationPath` | Third-party APIs without `operationId`. Format: `sourceName.{jsonPointer}`. |
| `workflowId` | Invoke sub-workflow. Local: `workflowId`. External: `$sourceDescriptions.name.workflowId`. |

## Key Syntax Rules

- **`$ref`** is for JSON Schema references (in `inputs` schemas only).
- **`reference`** is for Arazzo's Reusable Object (in parameter/action arrays). Supports `value` override.
- **Success criteria** in an array are AND-ed. For OR, combine in one expression: `$statusCode == 200 || $statusCode == 201`.
- **`dependsOn`** declares prerequisites but does not invoke them.
- **Failure action types:** `end`, `goto`, `retry` (with `retryAfter` and `retryLimit`).
- **All field names** are case-sensitive (except HTTP header names).

## Best Practices Checklist

### Structure
- [ ] File named `arazzo.yaml` or `arazzo.json`.
- [ ] `arazzo` version field set to `"1.0.1"`.
- [ ] `summary` and `description` on info, workflows, and steps.

### Naming
- [ ] `workflowId`s reflect business outcomes: `apply-coupon`, not `workflow1`.
- [ ] `stepId`s reflect actions: `search-pets`, not `step1`.
- [ ] `sourceDescription` names are descriptive: `payments`, not `api2`.
- [ ] All IDs match `[A-Za-z0-9_\-]+`.

### Operations & Data Flow
- [ ] `operationId` preferred over `operationPath`.
- [ ] Every `operationId` exists in the source OpenAPI document.
- [ ] Exactly one of `operationId` / `operationPath` / `workflowId` per step.
- [ ] Workflow inputs typed with JSON Schema.
- [ ] Outputs are minimal — only values consumed downstream.
- [ ] Every runtime expression references a preceding step.

### Robustness
- [ ] `successCriteria` defined on every step.
- [ ] `onFailure` actions for rate limits (429), auth expiry (401).
- [ ] Reasonable `retryAfter` and `retryLimit` values.
- [ ] Workflow-level `failureActions` as defaults; step-level overrides where needed.

### Reusability
- [ ] Repeated parameters (auth, pagination) in `components/parameters`.
- [ ] Shared input schemas in `components/inputs`.
- [ ] Common actions in `components/successActions` and `components/failureActions`.
- [ ] Multi-step reusable sequences as sub-workflows.

### Maintenance
- [ ] Arazzo versioned alongside OpenAPI specs — single documentation unit.
- [ ] Linting in CI (Spectral or Redocly CLI).

## References

- `references/01-overview-and-structure.md` — What Arazzo is, ecosystem context, document structure, first document walkthrough.
- `references/02-core-constructs.md` — Source descriptions, workflows, steps, parameters, request bodies, runtime expressions.
- `references/03-criteria-flow-outputs.md` — Success criteria, control flow (success/failure actions), outputs and data threading.
- `references/04-reuse-and-composition.md` — Reusable components and workflow composition (local and cross-document).
- `references/05-complete-example.md` — End-to-end e-commerce checkout example demonstrating all features together.
- `references/06-ai-agents-validation-practices.md` — AI agent and MCP integration patterns, validation/linting tools, best practices checklist.
- `references/07-pitfalls-tooling-resources.md` — Common pitfalls, tooling ecosystem, and learning resources.
