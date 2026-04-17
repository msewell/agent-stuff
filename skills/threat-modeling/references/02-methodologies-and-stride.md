# Methodologies and STRIDE

## Table of Contents

- [Methodology Decision Matrix](#methodology-decision-matrix)
- [STRIDE — The Six Categories](#stride--the-six-categories)
- [STRIDE-per-Element Mapping](#stride-per-element-mapping)
- [Running a STRIDE Session](#running-a-stride-session)
- [STRIDE Worked Mini-Example](#stride-worked-mini-example)
- [STRIDE Pitfalls](#stride-pitfalls)
- [Hybrid Approaches](#hybrid-approaches)
- [PASTA](#pasta)
- [LINDDUN (Privacy Threats)](#linddun-privacy-threats)
- [VAST](#vast)
- [Attack Trees](#attack-trees)
- [OCTAVE and Trike](#octave-and-trike)

---

## Methodology Decision Matrix

Default to **STRIDE on a DFD**. Use this matrix when the system warrants a different approach:

| Situation | Start with |
|---|---|
| General software; small team; web/API | **STRIDE** on a DFD |
| Fintech/healthcare; business-aligned risk needed | **PASTA** (STRIDE within PASTA for enumeration) |
| Personal data; GDPR/CCPA/HIPAA | **LINDDUN** alongside STRIDE |
| Hundreds of systems; need scale + ops/dev split | **VAST** on a threat modeling platform |
| Single crown-jewel asset; need depth | **Attack Trees** + STRIDE per node |
| LLM/agent system | **MAESTRO** + STRIDE + OWASP LLM Top 10 |
| Security-requirements driven | **Trike** |
| Leadership needs business-level risk | **OCTAVE Allegro** |

### Major methodologies at a glance

| Methodology | Focus | Best for | Complexity |
|---|---|---|---|
| **STRIDE** | Threat categories per component | General software; new-to-TM teams | Low–Medium |
| **PASTA** | Attacker-goal & business-risk driven | Regulated industries | High |
| **LINDDUN** | Privacy threats | GDPR / personal data | Medium |
| **VAST** | Scalable two-model (app + ops) | Large orgs | Medium–High |
| **Attack Trees** | Goal-decomposition diagrams | High-value targets | Medium |
| **OCTAVE** | Org-level operational risk | Enterprise risk mgmt | High |
| **Trike** | Requirements / auto-generation | Security-requirements-driven | Medium |
| **MAESTRO** | Agentic AI, 7-layer | LLM agents, tool-using AI | Medium |

---

## STRIDE — The Six Categories

| Letter | Threat | Violates | Examples |
|---|---|---|---|
| **S** | Spoofing identity | Authenticity | Stolen creds, forged JWTs, DNS poisoning, impersonated service |
| **T** | Tampering with data | Integrity | SQL injection, parameter tampering, MITM edit, training-data poisoning |
| **R** | Repudiation | Non-repudiability | User denies action; no audit log; log deletion |
| **I** | Information disclosure | Confidentiality | Data leak, IDOR, verbose errors, log exposure, prompt leakage |
| **D** | Denial of service | Availability | Flooding, resource exhaustion, poison message, algorithmic DoS |
| **E** | Elevation of privilege | Authorization | Privilege escalation, sandbox escape, auth bypass, confused deputy |

---

## STRIDE-per-Element Mapping

| Element | S | T | R | I | D | E |
|---|---|---|---|---|---|---|
| External entity | ✔ | | ✔ | | | |
| Process | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Data store | | ✔ | ✔* | ✔ | ✔ | |
| Data flow | | ✔ | | ✔ | ✔ | |

\* Only if the store serves as an audit log.

---

## Running a STRIDE Session

1. **Pick an element or flow** on the DFD, starting at trust boundary crossings.
2. **Walk STRIDE** — for each letter, ask: "How could this happen here?"
3. **Record each credible threat** as: asset, adversary, method, consequence.
4. **Propose a mitigation** (control, design change, accept/transfer).
5. **Move on** — don't perfect one component before surveying all.

---

## STRIDE Worked Mini-Example

**Data flow: User → Web Frontend (HTTPS)**

| STRIDE | Threat | Mitigation |
|---|---|---|
| S | Attacker impersonates user with stolen session token | TLS 1.3, short-lived tokens, token binding, MFA |
| T | MITM modifies request in transit | HTTPS (HSTS preload), request signing for sensitive endpoints |
| R | User denies posting a comment | Append-only audit log with user ID + IP + timestamp |
| I | Session cookie leaked via XSS | `HttpOnly`, `Secure`, `SameSite=Lax`, strict CSP |
| D | Request flood overwhelms frontend | Rate limiting, WAF, CDN, autoscaling |
| E | Attacker upgrades session to admin via role parameter | Server-side authz on every request; never trust client-supplied role |

---

## STRIDE Pitfalls

- **Treating it as a checklist** — STRIDE is a *prompt*, not an enumeration. Think past generic examples.
- **Skipping R** — teams consistently under-model repudiation; it matters for fraud, legal, and incident response.
- **Ignoring chained threats** — an I can enable an E can enable a T. Track chains.

---

## Hybrid Approaches

Common in practice:

- **STRIDE within PASTA** — PASTA for framing and business alignment; STRIDE for per-component enumeration.
- **STRIDE + LINDDUN on one DFD** — covers security and privacy without duplicated modeling.
- **MAESTRO + STRIDE + LINDDUN** — for AI systems that also handle personal data.
- **Attack Trees + MITRE ATT&CK** — theoretical decomposition, evidence-based TTPs on the nodes.

---

## PASTA

Process for Attack Simulation and Threat Analysis. Seven stages:

1. **Define Objectives** — business objectives, compliance, impact tolerance.
2. **Define Technical Scope** — boundaries, dependencies, data flows.
3. **Application Decomposition** — DFDs, use/abuse cases, actors.
4. **Threat Analysis** — map threat intel (TTPs, current campaigns).
5. **Vulnerability & Weakness Analysis** — CWE/CVE mapping.
6. **Attack Modeling** — attack trees, simulated adversary paths.
7. **Risk & Impact Analysis** — business impact, residual risk, treatments.

**When to use:** high-value targets, regulated industries, mature security programs. High cost — requires dedicated expertise.

---

## LINDDUN (Privacy Threats)

Mirror of STRIDE for privacy. Apply alongside STRIDE on the same DFD:

| Letter | Threat |
|---|---|
| **L** | **Linking** — correlating records across sources to re-identify individuals |
| **I** | **Identifying** — unintended identification of a person |
| **N** | **Non-repudiation** — inability for subject to deny an action (privacy-harming) |
| **D** | **Detecting** — inferring user involvement from observable signals |
| **D** | **Data disclosure** — exposure beyond intended purpose |
| **U** | **Unawareness** — subject cannot exercise rights (access, erasure, portability) |
| **N** | **Non-compliance** — violation of data-protection principles |

Directly supports GDPR, CCPA, HIPAA, and privacy-by-design. Variants: LINDDUN GO (lightweight workshop), LINDDUN PRO (formal).

---

## VAST

Visual, Agile, Simple Threat modeling. Two parallel models:

- **Application threat models** — developer perspective (process-flow diagrams).
- **Operational threat models** — attacker perspective (DFDs).

Scales to thousands of systems. Most often used with the ThreatModeler platform.

---

## Attack Trees

Goal-oriented tree decomposition:

- **Root** — attacker goal (e.g., "Exfiltrate customer PII").
- **Branches** — sub-goals or required steps (AND / OR nodes).
- **Leaves** — concrete attacker actions.

Each node can be annotated with cost, likelihood, skill required.

```
         [Exfiltrate customer PII]
                    │
      ┌─────────────┼─────────────────┐
      │             │                 │
  [SQL inj      [Compromise       [Abuse legit
   via search]   admin creds]     export API]
```

Attack trees pair well with MITRE ATT&CK TTPs at the leaves.

---

## OCTAVE and Trike

**OCTAVE / OCTAVE Allegro** — Organization-level operational risk from SEI/CERT. Asset and threat identification via workshops with non-technical stakeholders. Good for board-level risk conversations; poor for detailed software design.

**Trike** — Requirements-driven. Starts from an actor-asset-action matrix defining allowed behavior; derives threats as deviations from policy. Strongest with explicit security requirements.
