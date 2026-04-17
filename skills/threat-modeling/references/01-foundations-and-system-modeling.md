# Foundations and System Modeling

## Table of Contents

- [The Threat Modeling Manifesto](#the-threat-modeling-manifesto)
- [The Four-Question Framework](#the-four-question-framework)
- [When and How Often to Threat Model](#when-and-how-often-to-threat-model)
- [DFD Levels of Abstraction](#dfd-levels-of-abstraction)
- [Asset Inventory](#asset-inventory)
- [Example Level-1 DFD](#example-level-1-dfd)

---

## The Threat Modeling Manifesto

### Values (prefer the left over the right)

| Prefer… | Over… |
|---|---|
| Finding and fixing design issues | Checkbox compliance |
| People and collaboration | Processes, methodologies, and tools |
| A journey of understanding | A security or privacy snapshot |
| Doing threat modeling | Talking about it |
| Continuous refinement | A single delivery |

### Principles

- Improve security and privacy through early and frequent analysis.
- Align with the organization's development practices; iterate on manageable portions.
- Outcomes must be of value to stakeholders.
- Dialog is key; artifacts support understanding.

### Patterns and anti-patterns

**Do:** Systematic approach, informed creativity, varied viewpoints, useful toolkit, theory into practice.

**Avoid:** Hero Threat Modeler (one-expert dependency), Admiration for the Problem (analysis without mitigations), Tendency to Overfocus (one component while the rest is unexamined), Perfect Representation (flawless diagram over useful insight).

---

## The Four-Question Framework

Every methodology maps to these four questions (Shostack):

1. **What are we working on?** → Model the system
2. **What can go wrong?** → Identify threats
3. **What are we going to do about it?** → Mitigate
4. **Did we do a good enough job?** → Validate

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  MODEL the  │──▶│  IDENTIFY   │──▶│  MITIGATE   │──▶│  VALIDATE   │
│   system    │   │   threats   │   │ (or accept) │   │  & iterate  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
       ▲                                                      │
       └──────────────────────────────────────────────────────┘
```

---

## When and How Often to Threat Model

### SDLC placement

| Phase | Activity |
|---|---|
| **Concept / Planning** | High-level threat model; feeds requirements |
| **Design** | Detailed model of components, data flows, trust boundaries |
| **Implementation** | Per-feature model for significant stories; revisit on arch changes |
| **Testing** | Scope pen tests and abuse-case tests from the threat model |
| **Deployment** | Validate operational threats (runtime, supply chain, infra) |
| **Operations** | Review after incidents; re-model on major changes |

### Triggers for re-modeling

- New trust boundary (service, third party, auth scope)
- New data classification (PII, PHI, payment, secrets)
- Threat landscape shift (new CVE class, new adversary TTPs)
- Significant architectural refactor
- Post-incident — always
- Regulatory change

### Cadence

- **Continuous / agile** — threat model significant stories during sprint planning.
- **Release-based** — pre-release review for high-risk changes.
- **Quarterly refresh** — revisit system-wide model.

**"Little and often" beats "big and rare."**

---

## DFD Levels of Abstraction

- **Level 0 (Context)** — single process with external entities around it.
- **Level 1 (System)** — top-level processes and data stores.
- **Level 2+ (Component)** — decomposition of individual processes.

A Level-1 DFD is almost always enough for a first pass. DFD element symbols and trust boundary checklists are in the SKILL.md workflow.

---

## Asset Inventory

List what you are protecting. Go beyond databases and credentials:

- **Data assets**: PII, PHI, financial, secrets, IP, source code, training data.
- **System assets**: availability, integrity of computations, correctness of outputs.
- **Trust assets**: user trust, brand reputation, regulator trust.
- **AI-specific**: model weights, embeddings, prompts/context, tool permissions, memory state.

For each asset, rate: *confidentiality, integrity, availability* — plus *authenticity* and *accountability* for AI systems.

---

## Example Level-1 DFD

```
                   ┄┄┄┄ Internet Trust Boundary ┄┄┄┄
  ┌────────┐                      │
  │  User  │──── HTTPS ──────────►│
  └────────┘                      │
                                  ▼
                         ⬭ Web Frontend ⬭
                                  │
                   ┄┄┄┄ App Trust Boundary ┄┄┄┄
                                  │
                        gRPC/JWT  ▼
                         ⬭ API Service ⬭
                          │            │
                          ▼            ▼
                    ▭▭ Postgres ▭▭   ⬭ Auth Service ⬭
                                       │
                                       ▼
                                 ▭▭ Secrets Store ▭▭
```

Every line crossing a `┄┄┄` dashed boundary is a place to focus threat identification.
