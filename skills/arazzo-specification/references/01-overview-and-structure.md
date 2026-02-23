## 1. What Arazzo Is (and Isn't)

**Arazzo is** a specification for describing sequences of API calls — the steps, their ordering, the data dependencies between them, and the criteria that determine success or failure. It is both human-readable and machine-readable.

**Arazzo is not** a replacement for OpenAPI. OpenAPI describes the surface area of a single API (paths, operations, schemas, security). Arazzo sits on top, composing those operations into end-to-end flows that achieve a business objective.

Think of it this way:

| Concern | Specification |
|---|---|
| "What endpoints exist?" | OpenAPI |
| "How do I chain them to book a flight?" | **Arazzo** |
| "How do I transform the spec for a specific audience?" | Overlay |

Arazzo was released by the OpenAPI Initiative in May 2024 (v1.0.0), with a patch update to v1.0.1 in January 2025. It is a community-driven open specification under the Linux Foundation.

---

## 2. Where Arazzo Fits in the OpenAPI Ecosystem

The OpenAPI Initiative now maintains three complementary specifications:

- **OpenAPI Specification (OAS)** — Describes a single API's surface: endpoints, schemas, security, etc.
- **Arazzo Specification** — Describes workflows across one or more APIs: step sequences, data flow, success criteria.
- **Overlay Specification** — Describes repeatable transformations applied to OpenAPI documents.

Together, they provide a complete, machine-readable description of your API behaviors — from individual operations (OAS), to how they compose into user journeys (Arazzo), to how the specs themselves can be customized for different consumers (Overlay).

---

## 3. Document Structure

Every valid Arazzo document has four required top-level fields and one optional field:

```yaml
arazzo: "1.0.1"          # Required — spec version

info:                      # Required — metadata
  title: My Workflow
  version: "1.0.0"

sourceDescriptions:        # Required — at least one API reference
  - name: myApi
    url: ./openapi.yaml
    type: openapi

workflows:                 # Required — at least one workflow
  - workflowId: my-workflow
    steps:
      - stepId: first-step
        operationId: myApi.someOperation
        successCriteria:
          - condition: $statusCode == 200

components:                # Optional — reusable definitions
  parameters: {}
  inputs: {}
  successActions: {}
  failureActions: {}
```

**Naming convention:** Name the entry document `arazzo.yaml` or `arazzo.json` (recommended by the spec).

**Format:** YAML or JSON. YAML 1.2 is recommended for round-trip compatibility with JSON.

**Case sensitivity:** All field names are case-sensitive. Header field names are the one exception (case-insensitive per RFC 9110).

---

## 4. Your First Arazzo Document

Here is a minimal but complete Arazzo document. It describes a single workflow: search for a pet by status, then retrieve its details by ID.

```yaml
arazzo: "1.0.1"
info:
  title: Find a Pet
  version: "1.0.0"
  description: >-
    Search for available pets and retrieve details for the first match.

sourceDescriptions:
  - name: petstore
    url: https://petstore3.swagger.io/api/v3/openapi.json
    type: openapi

workflows:
  - workflowId: find-pet-by-status
    summary: Find an available pet and get its details.
    inputs:
      type: object
      properties:
        status:
          type: string
          description: Pet status to filter by.
          enum: [available, pending, sold]
    steps:
      - stepId: search-pets
        description: Search for pets by status.
        operationId: petstore.findPetsByStatus
        parameters:
          - name: status
            in: query
            value: $inputs.status
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          first_pet_id: $response.body#/0/id

      - stepId: get-pet-details
        description: Retrieve full details for the first matching pet.
        operationId: petstore.getPetById
        parameters:
          - name: petId
            in: path
            value: $steps.search-pets.outputs.first_pet_id
        successCriteria:
          - condition: $statusCode == 200
        outputs:
          pet_name: $response.body#/name
          pet_status: $response.body#/status

    outputs:
      pet_id: $steps.search-pets.outputs.first_pet_id
      pet_name: $steps.get-pet-details.outputs.pet_name
      pet_status: $steps.get-pet-details.outputs.pet_status
```

Key things to notice:

- **`sourceDescriptions`** links to the Petstore OpenAPI spec. The `name` field (`petstore`) becomes the namespace prefix for referencing operations.
- **`operationId`** references are prefixed with the source name: `petstore.findPetsByStatus`.
- **`$inputs.status`** is a runtime expression that injects the workflow's input into the step's query parameter.
- **`$steps.search-pets.outputs.first_pet_id`** threads the pet ID from the first step's output into the second step's path parameter.
- **`$response.body#/0/id`** uses a JSON Pointer to extract the `id` field from the first element of the response array.

---

