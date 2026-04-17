# Risk Scoring and Mitigations

## Table of Contents

- [Scoring Rubrics](#scoring-rubrics)
- [Recommended Scoring Workflow](#recommended-scoring-workflow)
- [Mitigation Principles](#mitigation-principles)
- [LINDDUN Privacy Mitigations](#linddun-privacy-mitigations)
- [Mitigation Source Catalogs](#mitigation-source-catalogs)
- [Threat Profile After Mitigation](#threat-profile-after-mitigation)
- [Integrating MITRE ATT&CK and D3FEND](#integrating-mitre-attck-and-defend)

---

## Scoring Rubrics

### DREAD (legacy, quick internal ranking)

Score each 1–10, average or sum. Subjective and rarely calibrated — use only for internal, consistent relative ranking.

- **D**amage potential
- **R**eproducibility
- **E**xploitability
- **A**ffected users
- **D**iscoverability

### CVSS (Common Vulnerability Scoring System)

Industry standard (FIRST). Base + Temporal + Environmental → 0–10 severity. Best for known CVEs; weaker for early-design speculative threats.

### OWASP Risk Rating (recommended for threat modeling)

Explicitly business-aware:

```
Likelihood = avg( Threat Agent Factors, Vulnerability Factors )
Impact     = avg( Technical Impact, Business Impact )
Risk       = Likelihood × Impact → Low/Med/High/Critical matrix
```

- Threat-agent factors: skill, motive, opportunity, size.
- Vulnerability factors: ease of discovery, ease of exploit, awareness, intrusion detection.
- Technical impact: loss of C, I, A, accountability.
- Business impact: financial, reputation, non-compliance, privacy violation.

---

## Recommended Scoring Workflow

Use CVSS where a CVE exists. For design-time threats without a CVE, go straight to OWASP Risk Rating. CVSS tells you how bad it is *in the abstract*; OWASP tells you how bad it is *for you*.

---

## Mitigation Principles

- **Concrete** — a specific control or design change, not "improve security."
- **Testable** — verifiable that it works.
- **Layered** — defense in depth; multiple independent controls for high-impact threats.
- **Attached** — recorded against the specific threat, not a generic checklist.
- **Owned** — one person or team accountable for implementation and ongoing operation.

---

## LINDDUN Privacy Mitigations

Pseudonymization, anonymization, differential privacy, purpose limitation, data minimization, deletion workflows, transparency dashboards, user-consent UX.

---

## Mitigation Source Catalogs

- **OWASP ASVS** — verification requirements by level.
- **OWASP Cheat Sheet Series** — pragmatic control patterns.
- **MITRE CWE** — weakness catalog (what to avoid writing).
- **MITRE CAPEC** — attack patterns (what adversaries do).
- **MITRE D3FEND** — defensive countermeasures linked to ATT&CK.
- **NIST SP 800-53** — catalog of security controls.
- **CIS Benchmarks** — hardening configs by technology.

---

## Threat Profile After Mitigation

Every threat ends up in one of three buckets:

- **Fully mitigated** — acceptable residual risk; document and move on.
- **Partially mitigated** — compensating controls; track residual risk with an owner.
- **Not mitigated** — a vulnerability. Decide: accept, transfer, eliminate, or schedule mitigation.

---

## Integrating MITRE ATT&CK and D3FEND

### Why integrate

Theoretical threat modeling ("what *could* go wrong") is incomplete. Cyber threat intel describes what adversaries *actually* do. Overlaying them tightens prioritization.

### Integration pattern

1. Build your STRIDE threat list (theoretical).
2. **Map threats to ATT&CK techniques** — typical mappings:
   - Spoofing → Initial Access (T1078 Valid Accounts), Credential Access (T1110)
   - Tampering → Persistence (T1546), Impact (T1485)
   - Info disclosure → Exfiltration (T1041, T1567)
   - DoS → Impact (T1498, T1499)
   - Elevation → Privilege Escalation (T1068), Lateral Movement
3. **Enrich** — add ATT&CK techniques you didn't anticipate (e.g., T1556 MFA bypass).
4. **Map to D3FEND defenses** — each ATT&CK technique links to countermeasure families.
5. **Score with real-world context** — techniques in active campaigns against your sector rate higher.

### For AI systems

Use **MITRE ATLAS** — the ATT&CK analog for adversarial ML. Techniques include ML Model Access (AML.TA0000), Poisoning (AML.T0020), Prompt Injection (AML.T0051), Evasion, and Extraction.

### Balance

- Too theoretical → model attacks that never happen while real ones pass.
- Too evidence-driven → only model what you've seen, missing novel threats.

Combine both: STRIDE for breadth, ATT&CK for evidence-based prioritization.
