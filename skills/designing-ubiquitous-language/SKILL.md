---
name: designing-ubiquitous-language
description: Designs and reviews ubiquitous language in domain-driven design (DDD). Traces disputed business terms and rules through bounded contexts, ownership, public contracts, consumer mappings, and executable examples. Use when mapping meanings such as customer, available, or sold; reviewing a change in contract or metric semantics; or migrating away from a shared enterprise canonical business model. Not a general architecture or pull-request review.
category: System Architecture
---

# Designing ubiquitous language

Start with one disputed term and one real workflow. Find the decision a person or system must make, who may make it, and one case where plausible meanings give different results. Follow the fact only as far as the consumers that use it.

## Workflow

1. **Trace the current decision.** When reviewing a repository, read its relevant instructions, Definition of Done, and existing enforcement. Follow the term from its actual use through the rule, tests, producer, and affected consumers. Ask for an ordinary case and a near miss, including an exception handled by an operator if it can change the boundary. Separate observed behavior, intended behavior, and unresolved questions. Don’t infer equal meaning from equal labels, schemas, or IDs.
2. **Locate semantic authority.** Name the bounded context that makes the decision and who may assert or correct its facts. Check what must hold atomically, what changes together, and where different answers are legitimate. Mark the grain and issuer of each consequential ID; for a company-scoped customer number, include the company in the key. Treat teams, services, and tables as evidence, not boundaries by definition. For a consequential handoff, record a context-map edge naming the producer, consumer, public interface, and translation owner.
3. **Make the distinction executable.** Write a decision predicate and a counterexample the domain owner can accept. Express it as Given/When/Then unless you can use an existing test harness; don’t invent scaffolding or call an unrun snippet verified. Carry the local term into the existing change surface (types, rules, tests, or user copy). Add a glossary entry only when it makes recurring usage easier: context-qualified stable ID, term, owner, meaning, and the distinguishing example. Keep the ID across a rename; review changes in meaning separately. Don’t create a second source of truth.
4. **Protect the seam.** Keep decisions and private types in the vertical slice that owns them. Publish the smallest fact consumers need under an owned contract; translate at the boundary instead of spreading upstream types or rules. Share technical primitives or presentation only when they do not carry another context’s business decisions. When semantically different models need the same spelling, qualify the term at cross-context surfaces rather than enforcing a global dictionary.
5. **Choose the smallest effective enforcement.** Prefer explicit domain states and transitions, opaque or scoped IDs, and compile-time dependency boundaries. Prefer plain values and pure functions for decisions; put I/O at the edges. Parse untrusted data once at the seam and use transactions, persistence constraints, or permissions for guarantees the compiler can’t provide. Prove material behavior with a distinguishing example; add a property test when a general rule matters across many cases. Don’t substitute tests for a type or access restriction that can prevent the invalid state. Prove a new gate rejects an intended violation; report any Definition of Done evidence that is missing.
6. **Return only what moves the work forward.** For a review, cite the decision path or file and line, describe the failing case, and recommend the smallest fix and proof; don’t invent findings or edit files. For design, draft only the needed artifact and flag owner decisions that are unresolved. Implement only when asked. If the current design makes the requested change awkward, first make the smallest behavior-preserving change that creates the seam, then change behavior. Remove superseded code, documentation, and gates when safe.

## Canonical-model policy

When the project has adopted the guide’s strict policy, reject new dependencies on enterprise-wide business types, even through a library, event schema, warehouse, or ontology. Allow purpose-specific published facts, identifier resolution, standards at the required boundary, and named reporting definitions: each must have an owner, purpose, consumers, lifecycle, and explicit local mapping. A central registry can index context-owned contracts without owning their meanings. Scope existing exceptions to an artifact and owner with expiry and verifiable exit criteria; prevent new debt.

If policy is unstated, ask before treating the ban as binding. In the meantime, assess the concrete coupling and semantic risks. Meaning can genuinely be shared for a named exchange. Prefer implementing a needed lookup or translation in an existing owner’s slice; don’t introduce a service, package, or model merely to name a boundary.

## Worked example

**Input:** Sales calls a deal sold after signature and delivery; Inventory uses sold for a stock movement. Inventory wants to import Sales’ deal type.

**Output:** Sales owns the closure assertion; Inventory owns disposition. Publish a narrow closure fact when both proofs exist, then translate it to an Inventory input. Inventory checks its own stock reference and rules before moving stock. Don’t import the Sales aggregate.

**Acceptance example:** Given a signed agreement and delivery scheduled for tomorrow, when Sales attempts to close the deal today, then no closure fact is emitted.

## Read only what the decision requires

- [Contract and mapping changes](references/01-contracts.md) — read for a public boundary, a change in meaning, or a reusable crosswalk.
- [Reporting and corrections](references/02-reporting.md) — read for shared metrics, reproducibility, or retroactive corrections.
- [Shared-model cutover](references/03-cutover.md) — read for migration, write-authority transfer, and retirement.

Source: [Ubiquitous language without an enterprise canonical data model](https://gist.githubusercontent.com/msewell/1a7a158a3bf7f4d317f36ee27ad0e822/raw/4e026cc7d3a6f1b4c7cef32a99b5d312eb72114a/ubiquitous-language-guide.md).
