# Anti-Patterns, Tooling, and Maturity

## Anti-Patterns

- **Hero Threat Modeler** — one person owns all models; nothing happens when they leave.
- **Admiration for the problem** — endless threat lists, no mitigations shipped.
- **The unread document** — a PDF on SharePoint no one opens. Keep models in the repo next to the code.
- **Perfect is the enemy of done** — waiting until the architecture stabilizes; it never does.
- **Stale models** — ship-and-forget. If not updated, it's actively misleading.
- **Generic threats** — "SQL injection" instead of "`/search` endpoint concatenates the `q` parameter into SQL."
- **Checklist myopia** — STRIDE used as the *only* source of ideas.
- **Ignoring insider and supply-chain threats** — among the costliest real-world breach categories.
- **Risk theater** — labelling everything "High" so nothing actually is.
- **Security-only participation** — devs need to be in the room; they know the code.
- **No owner, no date** — every threat needs "who fixes it by when, or who owns the acceptance."
- **AI exceptionalism** — treating an AI feature as just another microservice. It isn't.
- **Over-trusting LLM-generated threat models** — use them for drafting, not for sign-off.
- **Modeling only the happy path** — threats hide in error handlers, retries, timeouts, and admin paths.

---

## Tooling Landscape

### Free / open-source

| Tool | Strengths | Weaknesses |
|---|---|---|
| **Microsoft Threat Modeling Tool** | Mature, STRIDE-driven, threat generation from diagrams | Windows-only, dated UX |
| **OWASP Threat Dragon** | Cross-platform, web + desktop, STRIDE/LINDDUN | Smaller threat library |
| **OWASP pytm** | Model-as-code, CI-friendly, report generation | Learning curve |
| **Threagile** | YAML-defined, rich risk rules | Requires Go mental model |
| **TicTaaC** | Minimal, CI-first | Small ecosystem |
| **draw.io + pen** | Universal, zero setup | No threat automation |
| **CSA MAESTRO Analyzer** | Agentic AI-specific | Early-stage |
| **Agent Wiz (Repello)** | Static analysis of LangChain/LangGraph agents | Python orchestrators only |
| **STRIDE-GPT** | LLM-assisted drafting | Hallucinations; must human-review |

### Commercial

| Platform | Positioning |
|---|---|
| **IriusRisk** | Automated TM + control libraries; MAESTRO support |
| **SD Elements** | Questionnaire → generated tasks; Jira/GitHub integration |
| **ThreatModeler** | VAST-based; enterprise scale; CI/CD |
| **Devici** | Collaborative modeling; STRIDE/LINDDUN libraries |
| **Aikido** | Dev-friendly, unified AppSec + cloud |
| **AWS Threat Designer** | LLM-assisted; AWS-centric |

### Evaluation criteria

- **Fits your SDLC** — can it live in your repo and pipeline?
- **Threat library quality** — insight or noise?
- **Reporting** — will stakeholders read the output?
- **Integrations** — issue trackers, CI, SIEM.
- **Collaboration** — does it invite non-security people in?
- **AI coverage** — a real differentiator as of 2026.

---

## Metrics and Program Maturity

### Operational metrics

- **Coverage** — % of high-risk systems with an up-to-date threat model.
- **Freshness** — median age of models; % reviewed in last 90 days.
- **Time-to-mitigate** — by severity tier.
- **Accepted-risk hygiene** — % of accepted risks with owner + review date; overdue count.
- **Design-time catches** — threats found in design that would have been prod findings.

### Outcome metrics

- **Incidents traceable to unmodeled threats** — should trend down.
- **Cost of incidents** vs. investment in modeling.
- **Repeat findings across systems** — pattern library opportunity.

### Maturity model

| Level | Description |
|---|---|
| 1 — Ad hoc | Sporadic modeling by security for a few systems |
| 2 — Repeatable | Standard template; required for new high-risk systems |
| 3 — Defined | Part of every significant design; methodology explicit; training in place |
| 4 — Integrated | TMaC in CI; story-level checks; stakeholders participate; metrics tracked |
| 5 — Optimizing | Models update from telemetry & incidents; pattern libraries reused; AI coverage first-class |

### Signals of a healthy program

- Developers draw DFDs unprompted.
- Security is pulled *into* design, not chasing it after the fact.
- "What's our threat model for this?" is a routine question.
- Threat models drive test-plan and pen-test scope.
- Incident findings make it back into the model within one cycle.
