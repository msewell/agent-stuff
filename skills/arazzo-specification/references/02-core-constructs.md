## 5. Source Descriptions

Source descriptions are the references to the APIs your workflows interact with. They serve as the namespace layer connecting Arazzo steps to real API operations.

```yaml
sourceDescriptions:
  - name: payments
    url: https://api.example.com/payments/openapi.yaml
    type: openapi

  - name: shipping
    url: https://api.example.com/shipping/openapi.yaml
    type: openapi

  - name: shared-workflows
    url: ./common-workflows.arazzo.yaml
    type: arazzo
```

### Fixed Fields

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Unique identifier matching `[A-Za-z0-9_\-]+`. Used as prefix when referencing operations. |
| `url` | Yes | URI or relative reference to an OpenAPI or Arazzo document. |
| `type` | No | `"openapi"` or `"arazzo"`. Helps tooling, but can be inferred. |

### Best Practices

- **Use descriptive names.** `payments` is better than `api1`. The name appears in every `operationId` reference throughout your workflows.
- **Prefer relative URLs** for co-located specs (`./openapi.yaml`). Use absolute URLs for third-party APIs.
- **You can reference other Arazzo documents** (type `arazzo`) to compose workflows across specification boundaries.
- **At least one source description is required.** If your workflow doesn't reference any API operations (unusual), you still need a source.

---

## 6. Workflows and Steps

### Workflow Object

A workflow is a named sequence of steps that accomplishes a specific goal.

```yaml
workflows:
  - workflowId: place-order
    summary: Place an order for a pet.
    description: |
      Complete checkout by placing an order with optional coupon.
      Returns the order ID on success.
    inputs:
      type: object
      properties:
        pet_id:
          type: integer
          format: int64
          description: The ID of the pet to order.
        coupon_code:
          type: string
          description: Optional coupon code to apply.
    dependsOn:
      - authenticate-user
    steps:
      # ... (see below)
    outputs:
      order_id: $steps.submit-order.outputs.order_id
```

| Field | Required | Description |
|---|---|---|
| `workflowId` | Yes | Unique ID matching `[A-Za-z0-9_\-]+`. |
| `steps` | Yes | Ordered array of Step objects (minimum 1). |
| `summary` | No | One-line purpose statement. |
| `description` | No | Detailed explanation (CommonMark supported). |
| `inputs` | No | JSON Schema defining the workflow's parameters. |
| `dependsOn` | No | Array of `workflowId`s that must complete first. |
| `parameters` | No | Default parameters applied to all steps. |
| `successActions` | No | Default success handling for all steps. |
| `failureActions` | No | Default failure handling for all steps. |
| `outputs` | No | Map of named values produced by the workflow. |

### Step Object

Each step represents a single API call or a sub-workflow invocation.

```yaml
steps:
  - stepId: submit-order
    description: Submit the order to the API.
    operationId: petstore.placeOrder
    parameters:
      - name: Authorization
        in: header
        value: Bearer {$inputs.token}
    requestBody:
      contentType: application/json
      payload:
        petId: $inputs.pet_id
        quantity: 1
        couponCode: $inputs.coupon_code
        status: placed
        complete: false
    successCriteria:
      - condition: $statusCode == 200
    outputs:
      order_id: $response.body#/id
```

**Referencing operations — three mutually exclusive options:**

| Field | When to Use |
|---|---|
| `operationId` | Reference by the operation's `operationId` from the source OpenAPI. **Preferred** — stable across path changes. Format: `sourceName.operationId`. |
| `operationPath` | Reference by JSON Pointer to a specific path+method. Use for third-party APIs where you don't control `operationId`. Format: `sourceName.{jsonPointer}`. |
| `workflowId` | Invoke another workflow as a sub-step. Format: `$sourceDescriptions.sourceName.workflowId` for external, or just the `workflowId` for local. |

You must use exactly one of these three per step.

### Best Practices for Steps

- **Use `operationId` over `operationPath`** when you control the OpenAPI spec. Operation IDs are stable across path refactoring; JSON Pointers break when paths change.
- **Write meaningful step descriptions.** Treat them like commit messages — one line explaining the *why*.
- **Keep step IDs short and descriptive.** `search-pets` is better than `step1`. They appear in runtime expressions throughout downstream steps.

---

## 7. Parameters

Parameters inject values into API operations. They map directly to OpenAPI parameter locations.

```yaml
parameters:
  - name: status
    in: query
    value: $inputs.status

  - name: petId
    in: path
    value: $steps.search-pets.outputs.first_pet_id

  - name: Authorization
    in: header
    value: Bearer {$steps.login.outputs.token}

  - name: session
    in: cookie
    value: $steps.login.outputs.session_id
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Parameter name (case-sensitive). Must match the name in the OpenAPI operation's parameter list. |
| `in` | Conditional | Location: `path`, `query`, `header`, or `cookie`. Required for operation parameters. Omit for workflow-level parameters. |
| `value` | Yes | Literal value or runtime expression. |

**Embedding expressions in strings:** Use curly braces — `Bearer {$steps.login.outputs.token}`. The braces tell the runtime to interpolate the expression within the surrounding literal text.

**Workflow-level parameters** (defined on the workflow object, not on steps) apply to all steps unless overridden. Step-level parameters take precedence.

---

## 8. Request Bodies

For operations that accept a body (POST, PUT, PATCH), use the `requestBody` field on a step.

### Object Payload (Recommended for Most Cases)

```yaml
requestBody:
  contentType: application/json
  payload:
    petId: $inputs.pet_id
    quantity: 1
    status: placed
```

Each value can be a literal or a runtime expression.

### String Template Payload

For more control over the exact JSON structure:

```yaml
requestBody:
  contentType: application/json
  payload: |
    {
      "petId": {$inputs.pet_id},
      "quantity": 1,
      "status": "placed"
    }
```

Note: String-embedded expressions use `{$expression}` syntax (with curly braces).

### Payload Replacements

For partial modifications to an existing payload template:

```yaml
requestBody:
  contentType: application/json
  payload:
    petId: 0
    quantity: 1
    status: placed
  replacements:
    - target: /petId
      value: $inputs.pet_id
```

The `target` field uses a JSON Pointer. This approach is useful when you have a base payload and want to override specific fields dynamically.

---

## 9. Runtime Expressions

Runtime expressions are Arazzo's mechanism for dynamic data access. They use a `$` prefix and resolve at execution time.

### Expression Reference

| Expression | Resolves To |
|---|---|
| `$url` | The full request URL |
| `$method` | The HTTP method (GET, POST, etc.) |
| `$statusCode` | The HTTP response status code |
| `$inputs.fieldName` | A workflow input value |
| `$steps.stepId.outputs.name` | An output from a previous step |
| `$request.header.name` | A request header value |
| `$request.query.name` | A request query parameter |
| `$request.path.name` | A request path parameter |
| `$request.body` | The full request body |
| `$request.body#/json/pointer` | A specific field in the request body |
| `$response.header.name` | A response header value |
| `$response.body` | The full response body |
| `$response.body#/json/pointer` | A specific field in the response body |
| `$workflows.workflowId.outputs.name` | An output from another workflow |
| `$sourceDescriptions.name` | Reference to a source description |
| `$components.parameters.name` | A reusable parameter from components |

### JSON Pointer Syntax

The `#/path/to/field` suffix follows RFC 6901 JSON Pointer syntax:

```yaml
# First element of an array
$response.body#/0/id

# Nested object field
$response.body#/data/customer/email

# Field with special characters (escaped)
$response.body#/some~1path    # matches "some/path"
$response.body#/some~0field   # matches "some~field"
```

### Embedding in Strings

When an expression is part of a larger string, wrap it in curly braces:

```yaml
value: "Bearer {$steps.auth.outputs.token}"
value: "/pets/{$inputs.pet_id}/photos"
```

When the entire value is an expression, no braces are needed:

```yaml
value: $inputs.pet_id
```

---

