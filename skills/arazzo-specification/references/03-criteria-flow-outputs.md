## 10. Success Criteria

Success criteria are assertions that determine whether a step completed successfully. If all criteria pass, the step is deemed successful. If any fail, the step is considered failed.

### Simple Conditions (Default)

```yaml
successCriteria:
  - condition: $statusCode == 200
  - condition: $response.body#/status == 'active'
  - condition: $response.body#/items.length > 0
```

**Supported operators:** `<`, `<=`, `>`, `>=`, `==`, `!=`, `!`, `&&`, `||`, `()`, `[]`, `.`

**Supported literals:**
- Booleans: `true`, `false`
- Null: `null`
- Numbers: any JSON Schema number
- Strings: single-quoted with `''` for escaped quotes

### Regex Conditions

```yaml
successCriteria:
  - context: $response.body#/email
    condition: "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"
    type: regex
```

The `context` field sets the value to test. The `condition` is the regex pattern.

### JSONPath Conditions

```yaml
successCriteria:
  - context: $response.body
    condition: "$[?(@.status == 'available')]"
    type:
      type: jsonpath
      version: draft-goessner-dispatch-jsonpath-00
```

For JSONPath and XPath, you must specify the `type` as a `CriterionExpressionType` object with explicit `type` and `version` fields.

### Combining Criteria

Multiple criteria in the array are AND-ed. To express OR logic, combine conditions within a single expression:

```yaml
successCriteria:
  - condition: $statusCode == 200 || $statusCode == 201
  - condition: $response.body#/status != 'error'
```

---

## 11. Control Flow: Success and Failure Actions

Actions determine what happens after a step succeeds or fails. They enable conditional branching, early termination, and retry logic.

### Success Actions

```yaml
onSuccess:
  - name: continue-to-payment
    type: goto
    stepId: process-payment
    criteria:
      - condition: $response.body#/eligible == true

  - name: skip-ineligible
    type: end
    criteria:
      - condition: $response.body#/eligible == false
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Unique action name within the array. |
| `type` | Yes | `"end"` (terminate workflow) or `"goto"` (jump to step/workflow). |
| `stepId` | No | Target step for `goto`. Mutually exclusive with `workflowId`. |
| `workflowId` | No | Target workflow for `goto`. Mutually exclusive with `stepId`. |
| `criteria` | No | Conditions that must be true for this action to trigger. |

### Failure Actions

```yaml
onFailure:
  - name: retry-on-rate-limit
    type: retry
    retryAfter: 2
    retryLimit: 3
    criteria:
      - condition: $statusCode == 429

  - name: refresh-token-on-401
    type: goto
    stepId: refresh-auth-token
    criteria:
      - condition: $statusCode == 401

  - name: abort-on-error
    type: end
```

Failure actions add a `retry` type:

| Field | Description |
|---|---|
| `retryAfter` | Seconds to wait before retrying. |
| `retryLimit` | Maximum number of retry attempts. |

### Workflow-Level Defaults

Define default success/failure actions on the workflow object. Individual steps can override them with `onSuccess`/`onFailure`:

```yaml
workflows:
  - workflowId: resilient-workflow
    failureActions:
      - name: default-retry
        type: retry
        retryAfter: 1
        retryLimit: 2
    steps:
      - stepId: step-one
        operationId: api.operation1
        successCriteria:
          - condition: $statusCode == 200
        # Inherits the workflow-level failureActions

      - stepId: step-two
        operationId: api.operation2
        successCriteria:
          - condition: $statusCode == 200
        onFailure:
          # Overrides the workflow default for this step only
          - name: abort-immediately
            type: end
```

---

## 12. Outputs and Data Threading

Outputs are how data flows between steps and between workflows. They extract specific values from API responses and make them available to downstream consumers.

### Step Outputs

```yaml
steps:
  - stepId: create-user
    operationId: api.createUser
    requestBody:
      contentType: application/json
      payload:
        name: $inputs.name
        email: $inputs.email
    successCriteria:
      - condition: $statusCode == 201
    outputs:
      user_id: $response.body#/id
      api_key: $response.body#/apiKey
```

### Workflow Outputs

Workflow outputs bubble step-level data up to the calling context:

```yaml
workflows:
  - workflowId: create-user
    steps:
      - stepId: register
        # ...
        outputs:
          user_id: $response.body#/id
    outputs:
      created_user_id: $steps.register.outputs.user_id
```

### Consuming Outputs in Downstream Steps

```yaml
- stepId: send-welcome-email
  operationId: notifications.sendEmail
  parameters:
    - name: userId
      in: path
      value: $steps.create-user.outputs.user_id
```

### Best Practice: Only Collect What You Need

Outputs should be minimal — only extract values that downstream steps or the calling workflow actually consume. Avoid turning outputs into a mirror of the full API response. Outputs are for data threading, not response documentation.

---

