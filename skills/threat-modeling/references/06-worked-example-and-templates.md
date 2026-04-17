# Worked Example and Templates

## Table of Contents

- [CommentHub: System Description](#commenthub-system-description)
- [CommentHub: Level-1 DFD](#commenthub-level-1-dfd)
- [CommentHub: Assets](#commenthub-assets)
- [CommentHub: STRIDE Walkthrough](#commenthub-stride-walkthrough)
- [CommentHub: Highest-Priority Threats](#commenthub-highest-priority-threats)
- [CommentHub: Mitigations](#commenthub-mitigations)
- [CommentHub: Validation](#commenthub-validation)
- [User-Story Threat Modeling Micro-Template](#user-story-threat-modeling-micro-template)
- [STRIDE Elicitation Checklist](#stride-elicitation-checklist)
- [AI/LLM Threat Checklist](#aillm-threat-checklist)
- [Validation Checklist](#validation-checklist)

---

## CommentHub: System Description

Multi-tenant SaaS where end users post comments on articles. Premium tenants can call a `/summarize` endpoint that passes comment threads through an LLM to produce a summary.

---

## CommentHub: Level-1 DFD

```
   ┄┄┄┄ Internet ┄┄┄┄
       │
   ┌───┴────┐       ┌──────────────┐
   │  User  ├──────►│ Edge (CDN +  │
   └────────┘ HTTPS │    WAF)      │
                    └──────┬───────┘
                           │
                ┄┄┄┄ App Boundary ┄┄┄┄
                           │
                    ⬭ Web Frontend ⬭
                           │
                     gRPC (mTLS)
                           ▼
                    ⬭ API Service ⬭
                     │        │
                     │        │     ┄┄┄┄ Vendor Boundary ┄┄┄┄
                     │        └─────► ⬭ LLM Provider ⬭
                     │
                     ▼
                ▭▭ Postgres ▭▭ (tenant-scoped rows)
                     │
                     ▼
                ▭▭ Audit Log ▭▭ (append-only, WORM)
```

---

## CommentHub: Assets

| Asset | C | I | A |
|---|---|---|---|
| Comment content | Med | High | Med |
| User account & session | High | High | High |
| Tenant isolation | High | High | Med |
| Audit log | Med | Critical | High |
| API keys to LLM provider | High | High | Med |
| Generated summaries | — | High (correctness) | Med |

---

## CommentHub: STRIDE Walkthrough

**User → Edge (HTTPS)**

| STRIDE | Threat | Mitigation |
|---|---|---|
| S | Session hijack | MFA, short TTL tokens, binding |
| T | MITM | HSTS preload, cert pinning for mobile |
| I | Token in URL/logs | `POST` bodies, log scrubbers |
| D | Volumetric flood | CDN + WAF rate limits |

**API → Postgres (TLS/PG)**

| STRIDE | Threat | Mitigation |
|---|---|---|
| S | Stolen DB creds | Short-lived IAM DB auth |
| T | SQL injection | Parameterized queries, ORM; least-privileged DB role |
| R | Admin wipes logs | Audit log on separate account, WORM storage |
| I | Cross-tenant read (missing `WHERE tenant_id`) | Row-level security, integration test for tenant filter |
| D | Expensive query | Statement timeouts, connection pool limits |
| E | Privilege escalation via stored procs | Strict `GRANT`; no `SUPERUSER` |

**API → LLM Provider (vendor trust boundary)**

| STRIDE | Threat | Mitigation |
|---|---|---|
| S | Provider API key theft | Per-tenant keys, KMS, rotation |
| T | MITM alters prompt/response | TLS pinning, response signing |
| R | No provenance on summary | Log prompt + model + version + response hash |
| I | Indirect prompt injection via comment content (LLM01) | Instruction/data separation, output schema validation, strip markdown links |
| I | System prompt leakage (LLM07) | Prompt-hardening, refusal tests in CI |
| D | Unbounded consumption (LLM10) | Per-tenant cost caps, rate limit, max-tokens |
| E | Confused deputy — summarizer produces phishing | Disable tool use; content safety filter; abuse monitoring |

---

## CommentHub: Highest-Priority Threats

| # | Threat | L | I | Tier | Owner |
|---|---|---|---|---|---|
| 1 | Missing tenant filter → cross-tenant read | Med | Severe | Critical | Backend lead |
| 2 | Indirect prompt injection exfiltrating data via summary | High | High | Critical | AI lead |
| 3 | Audit log tampering / deletion | Low | Severe | High | Infra lead |
| 4 | LLM provider API key leak | Med | High | High | Security |
| 5 | Volumetric DoS against `/summarize` | High | Med | High | SRE |
| 6 | Session hijack via XSS | Low | High | Med | Frontend lead |

---

## CommentHub: Mitigations

- **#1**: Postgres row-level security + CI test rule rejecting SQL lacking `tenant_id`.
- **#2**: Output schema via function-calling; no markdown rendering of LLM output; red-team suite in CI; block responses containing URLs to untrusted domains.
- **#3**: Audit log in separate cloud account with write-once object lock and asymmetric signing.
- **#4**: KMS-backed secret storage; per-tenant keys; 30-day rotation; off-hours usage alerts.
- **#5**: Per-tenant token bucket + cost cap; 429 with `Retry-After`.
- **#6**: CSP `default-src 'self'`; `HttpOnly + Secure + SameSite=Lax` cookies; DOM-purify rich text.

---

## CommentHub: Validation

- Each mitigation has a test (unit, integration, or red-team eval) in CI.
- Pen test scoped from the threat model's top 10 before GA.
- Quarterly review on the calendar; owner attached to each risk.
- Threat model lives at `/threatmodel/tm.py`; PR template asks whether the PR changes it.

---

## User-Story Threat Modeling Micro-Template

Add to Jira/GitHub story templates:

```markdown
### Security impact (threat modeling)
- New trust boundaries introduced? (y/n, details)
- New data classes handled? (y/n, which)
- New external dependencies? (y/n, which)
- STRIDE quick-check:
  - Spoofing? _
  - Tampering? _
  - Repudiation? _
  - Info disclosure? _
  - DoS? _
  - Elevation of privilege? _
- New AI/agent capability? (y/n; run OWASP LLM Top 10 check)
- Does this change the threat model at `/threatmodel/…`? (y/n; if y, attach update)
```

---

## STRIDE Elicitation Checklist

Use as prompts during threat identification.

**Spoofing:** Can an attacker forge the identity used here? Can tokens/cookies be stolen or replayed? Is mutual auth enforced between services?

**Tampering:** Is input validated on trust-boundary crossings? Is data at rest integrity-protected? Can upstream config or code be tampered with? For AI: can training data or RAG content be poisoned?

**Repudiation:** Can a user plausibly deny an action? Are audit logs complete, append-only, and reviewed? Are admin actions separately logged?

**Info disclosure:** Is data classified and minimized? Are errors/logs free of secrets? Are cross-tenant or cross-user leaks possible? For AI: can the system prompt or training data be extracted?

**DoS:** Are rate limits and quotas in place? What happens under 10× expected load? Are there algorithmic hotspots? For AI: is context length and cost bounded?

**Elevation of privilege:** Is authz checked server-side on every request? Are admin paths isolated and MFA-gated? Can an agent/tool exceed its intended scope?

---

## AI/LLM Threat Checklist

- [ ] Direct prompt injection (LLM01)
- [ ] Indirect prompt injection — via RAG, tool output, email, URL content
- [ ] Sensitive info disclosure (LLM02)
- [ ] Supply chain (LLM03) — model, adapter, data provenance
- [ ] Data/model poisoning (LLM04)
- [ ] Improper output handling (LLM05) — downstream XSS/SQLi from model output
- [ ] Excessive agency (LLM06) — tools, permissions, side effects
- [ ] System prompt leakage (LLM07)
- [ ] Vector/embedding weaknesses (LLM08)
- [ ] Misinformation / hallucination (LLM09)
- [ ] Unbounded consumption (LLM10)
- [ ] Memory poisoning — write path, TTL, per-user isolation
- [ ] Multi-agent impersonation / collusion
- [ ] Confused deputy on tool calls
- [ ] Observability — can we reconstruct what the agent did and why?
- [ ] Human-in-the-loop for high-blast-radius actions

---

## Validation Checklist

- [ ] Every Critical/High threat has a mitigation or a documented, owned acceptance.
- [ ] Every mitigation has a test or monitoring signal.
- [ ] DFD is current as of the last significant change.
- [ ] Trust boundaries are explicit.
- [ ] Review cadence is on the calendar.
- [ ] Stakeholders (eng, security, product, ops) have seen the latest version.
- [ ] Incidents since last review are reflected as new threats or lessons.
- [ ] The model lives next to the code and is updated via PRs.
