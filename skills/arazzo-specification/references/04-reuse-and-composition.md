## 13. Reusable Components

The `components` section lets you define elements once and reference them across workflows, reducing duplication.

```yaml
components:
  inputs:
    pagination:
      type: object
      properties:
        page:
          type: integer
          default: 1
        pageSize:
          type: integer
          default: 20

  parameters:
    authHeader:
      name: Authorization
      in: header
      value: Bearer {$steps.auth.outputs.token}
    page:
      name: page
      in: query
      value: 1
    pageSize:
      name: pageSize
      in: query
      value: 100

  successActions:
    retryOnRateLimit:
      name: retry-on-rate-limit
      type: retry
      retryAfter: 2
      retryLimit: 3
      criteria:
        - condition: $statusCode == 429

  failureActions:
    abortOnServerError:
      name: abort-on-server-error
      type: end
      criteria:
        - condition: $statusCode >= 500
```

### Referencing Components

Use the `reference` keyword (not `$ref` — that's for JSON Schema only):

```yaml
steps:
  - stepId: list-items
    operationId: api.listItems
    parameters:
      - reference: $components.parameters.authHeader
      - reference: $components.parameters.page
        value: 2    # Override the default value
      - reference: $components.parameters.pageSize
```

The `value` field on a reference overrides the component's default value.

### When to Use Components

- **Parameters used by multiple steps** (auth headers, pagination).
- **Common failure actions** (retry-on-429, abort-on-500).
- **Input schemas shared across workflows** (pagination, filtering).

---

## 14. Composing Workflows

Workflows can invoke other workflows as sub-steps, enabling modular design.

### Local Workflow Composition

Reference another workflow in the same document by its `workflowId`:

```yaml
workflows:
  - workflowId: checkout
    steps:
      - stepId: find-product
        operationId: catalog.searchProducts
        # ...
        outputs:
          product_id: $response.body#/0/id

      - stepId: place-order
        workflowId: place-order    # Invokes the workflow below
        parameters:
          - name: product_id
            value: $steps.find-product.outputs.product_id
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          order_id: $outputs.order_id    # From the sub-workflow's outputs

  - workflowId: place-order
    summary: Reusable order placement workflow.
    inputs:
      type: object
      properties:
        product_id:
          type: integer
    steps:
      - stepId: submit
        operationId: orders.createOrder
        requestBody:
          contentType: application/json
          payload:
            productId: $inputs.product_id
            status: placed
        successCriteria:
          - condition: $statusCode == 201
        outputs:
          order_id: $response.body#/id
    outputs:
      order_id: $steps.submit.outputs.order_id
```

### Cross-Document Workflow Composition

Reference a workflow from another Arazzo document:

```yaml
sourceDescriptions:
  - name: shared
    url: ./common-workflows.arazzo.yaml
    type: arazzo

workflows:
  - workflowId: full-checkout
    steps:
      - stepId: authenticate
        workflowId: $sourceDescriptions.shared.authenticate-user
        # ...
```

### Workflow Dependencies

Use `dependsOn` to declare that a workflow requires another to complete first:

```yaml
workflows:
  - workflowId: place-order
    dependsOn:
      - authenticate-user
    steps:
      # ...
```

This is a declaration of prerequisite ordering, not an invocation. Tooling uses `dependsOn` to determine execution order or to validate that prerequisites are satisfied.

---

