## 15. Complete Example: E-Commerce Checkout with Coupons

This end-to-end example demonstrates most Arazzo features working together. It models a pet store where a customer finds a pet, discovers available coupons, and places an order with the coupon applied.

```yaml
arazzo: "1.0.1"
info:
  title: Petstore - Apply Coupons
  version: "1.0.0"
  description: >-
    Find a pet by tags, discover applicable coupons, and place an order
    with the coupon applied. Demonstrates workflow composition, parameter
    reuse, and data threading across steps and sub-workflows.

sourceDescriptions:
  - name: petstore
    url: ./pet-coupons.openapi.yaml
    type: openapi

workflows:
  # ── Main workflow: find a pet, find a coupon, order with discount ──
  - workflowId: apply-coupon
    summary: Apply a coupon to a pet order.
    description: >-
      Find a pet matching the given tags, discover an applicable coupon,
      and place an order with the coupon applied. Outputs the order ID.
    inputs:
      $ref: "#/components/inputs/apply_coupon_input"
    steps:
      - stepId: find-pet
        description: Search for pets matching the desired tags.
        operationId: petstore.findPetsByTags
        parameters:
          - name: pet_tags
            in: query
            value: $inputs.my_pet_tags
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          my_pet_id: $response.body#/0/id

      - stepId: find-coupons
        description: Look up coupons available for the selected pet.
        operationId: petstore.getPetCoupons
        parameters:
          - name: pet_id
            in: path
            value: $steps.find-pet.outputs.my_pet_id
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          my_coupon_code: $response.body#/couponCode

      - stepId: place-order
        description: Place the order using the sub-workflow.
        workflowId: place-order
        parameters:
          - name: pet_id
            value: $steps.find-pet.outputs.my_pet_id
          - name: coupon_code
            value: $steps.find-coupons.outputs.my_coupon_code
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          my_order_id: $outputs.workflow_order_id

    outputs:
      apply_coupon_pet_order_id: $steps.place-order.outputs.my_order_id

  # ── Alternative workflow: buy the first available pet (no coupon) ──
  - workflowId: buy-available-pet
    summary: Buy an available pet if one exists.
    description: >-
      Demonstrates reuse of the place-order sub-workflow and component
      parameters for pagination.
    inputs:
      $ref: "#/components/inputs/buy_available_pet_input"
    steps:
      - stepId: find-pet
        description: Find a pet that is currently available.
        operationId: petstore.findPetsByStatus
        parameters:
          - name: status
            in: query
            value: "available"
          - reference: $components.parameters.page
            value: 1
          - reference: $components.parameters.pageSize
            value: 10
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          my_pet_id: $response.body#/0/id

      - stepId: place-order
        description: Place an order for the first available pet.
        workflowId: place-order
        parameters:
          - name: pet_id
            value: $steps.find-pet.outputs.my_pet_id
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          my_order_id: $outputs.workflow_order_id

    outputs:
      buy_pet_order_id: $steps.place-order.outputs.my_order_id

  # ── Reusable sub-workflow: place an order ──
  - workflowId: place-order
    summary: Place an order for a pet (reusable).
    description: >-
      Accepts a pet ID, optional quantity, and optional coupon code.
      Can be invoked by any parent workflow as the final purchase step.
    inputs:
      type: object
      properties:
        pet_id:
          type: integer
          format: int64
          description: The ID of the pet to order.
        quantity:
          type: integer
          format: int32
          description: Number of pets to order.
        coupon_code:
          type: string
          description: Coupon code to apply to the order.
    steps:
      - stepId: place-order
        description: Submit the order to the API.
        operationId: petstore.placeOrder
        requestBody:
          contentType: application/json
          payload:
            petId: $inputs.pet_id
            quantity: $inputs.quantity
            couponCode: $inputs.coupon_code
            status: placed
            complete: false
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          step_order_id: $response.body#/id

    outputs:
      workflow_order_id: $steps.place-order.outputs.step_order_id

# ── Reusable components ──
components:
  inputs:
    apply_coupon_input:
      type: object
      properties:
        my_pet_tags:
          type: array
          items:
            type: string
          description: >-
            Tags to search for (e.g. ["puppy", "dalmatian"]).

    buy_available_pet_input:
      type: object
      properties:
        store_id:
          $ref: "#/components/inputs/store_id"

    store_id:
      type: string
      description: >-
        The store domain (e.g. "pets.example.com").

  parameters:
    page:
      name: page
      in: query
      value: 1
    pageSize:
      name: pageSize
      in: query
      value: 100
```

### What This Example Demonstrates

| Feature | Where |
|---|---|
| Multiple workflows in one document | `apply-coupon`, `buy-available-pet`, `place-order` |
| Workflow composition (sub-workflows) | `place-order` step invokes the `place-order` workflow |
| Runtime expressions for data threading | `$steps.find-pet.outputs.my_pet_id` |
| Component parameter reuse with overrides | `$components.parameters.page` with `value: 1` override |
| Component input schemas with `$ref` | `$ref: "#/components/inputs/apply_coupon_input"` |
| Request body with dynamic payload | `petId: $inputs.pet_id` in the `place-order` workflow |
| Sub-workflow output bubbling | `$outputs.workflow_order_id` |

---

