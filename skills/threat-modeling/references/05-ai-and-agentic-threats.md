# AI and Agentic Threats

## Table of Contents

- [Why Traditional Threat Modeling Falls Short for AI](#why-traditional-threat-modeling-falls-short-for-ai)
- [Attack Surfaces in an AI System](#attack-surfaces-in-an-ai-system)
- [OWASP Top 10 for LLM Applications (2025)](#owasp-top-10-for-llm-applications-2025)
- [MAESTRO Framework](#maestro-framework)
- [Cross-Layer Attack Chains](#cross-layer-attack-chains)
- [Concrete AI Threats to Always Consider](#concrete-ai-threats-to-always-consider)
- [AI-Specific Mitigations](#ai-specific-mitigations)
- [Process for AI Threat Modeling](#process-for-ai-threat-modeling)

---

## Why Traditional Threat Modeling Falls Short for AI

Classical threats assume deterministic code paths, untrusted input isolated from instructions, stable failure modes, and clear component boundaries. AI systems violate all of these:

- **Nondeterminism** — same input → different output.
- **Instruction-following bias** — models are trained to be helpful; prompt injection exploits this.
- **Data-as-instructions** — text in any context (RAG doc, tool output, memory, image) can be interpreted as a command.
- **System expansion** — agents invoke tools, persist state, and chain actions autonomously; failures compound.
- **No trust boundary inside the context window** — system prompt, user input, tool output, and retrieved documents are blended.

---

## Attack Surfaces in an AI System

| Layer | What lives there | Characteristic threats |
|---|---|---|
| **Input/Output** | Prompt, user text, images, audio, API | Prompt injection (direct & indirect), jailbreak, output exfiltration |
| **Retrieval (RAG)** | Vector DB, embeddings, chunker | Vector poisoning, cross-tenant leakage, embedding inversion |
| **Model** | Weights, fine-tunes, adapters | Model theft, inference cost attacks, training-data extraction |
| **Agent / orchestration** | Planner, tool router, memory | Goal hijack, confused deputy, rogue tool, loop abuse |
| **Tool / action** | Functions, APIs, file/DB access | Over-privileged tools, unauthorized actions, data exfiltration |
| **Memory / state** | Session, long-term, cross-session | Memory poisoning, persistent jailbreak, cross-session leakage |
| **Infrastructure** | Inference runtime, containers, GPUs | Side-channel, model-weight exfil, resource DoS |

---

## OWASP Top 10 for LLM Applications (2025)

Combine with STRIDE during threat identification:

1. **LLM01 — Prompt Injection** (direct & indirect)
2. **LLM02 — Sensitive Information Disclosure**
3. **LLM03 — Supply Chain**
4. **LLM04 — Data and Model Poisoning**
5. **LLM05 — Improper Output Handling**
6. **LLM06 — Excessive Agency**
7. **LLM07 — System Prompt Leakage**
8. **LLM08 — Vector and Embedding Weaknesses**
9. **LLM09 — Misinformation**
10. **LLM10 — Unbounded Consumption**

---

## MAESTRO Framework

Cloud Security Alliance's MAESTRO (**M**ulti-**A**gent **E**nvironment, **S**ecurity, **T**hreat, **R**isk, **O**utcome) organizes threats across a seven-layer architecture:

1. **Foundation Models** — the underlying LLM(s).
2. **Data Operations** — training data, embeddings, feature stores.
3. **Agent Frameworks** — LangChain, LangGraph, AutoGen, orchestrator APIs.
4. **Deployment & Infrastructure** — containers, cloud hosting, inference servers.
5. **Evaluation & Observability** — eval harnesses, tracing, telemetry.
6. **Security & Compliance** — access control, privacy, regulatory.
7. **Agent Ecosystem** — multi-agent collaboration, marketplaces, tool ecosystems.

For each layer, ask both:
- **Traditional threats** applicable to that layer's tech (e.g., container escape at L4).
- **Agentic threats** from non-determinism, autonomy, and absent trust boundaries.

---

## Cross-Layer Attack Chains

The most dangerous threats span layers. Example:

> RAG poisoning (L2) → retrieved text alters agent reasoning (L1) → agent calls privileged tool with attacker-chosen arguments (L3/L7) → data exfil (L4) → persistent memory entry locks the attack in for next session (L3).

When modeling, **draw the chain** — a single-layer view hides the worst failures.

---

## Concrete AI Threats to Always Consider

- **Direct prompt injection** — attacker-crafted user input.
- **Indirect prompt injection** — attacker content in a retrieved doc, email, webpage, tool output.
- **System prompt leakage** — attacker elicits system prompt, exposing instructions/secrets.
- **Excessive agency** — agent has tool permissions far exceeding its job.
- **Confused deputy** — agent tricked into using its privileges on behalf of the attacker.
- **Tool schema poisoning** — attacker controls a tool's function-call description.
- **Rogue / malicious MCP server** — a plugged-in tool provider is adversarial.
- **Memory poisoning** — attacker writes facts into long-term memory that distort future sessions.
- **Multi-agent collusion / impersonation** — one compromised agent corrupts peers.
- **Training data extraction** — model memorization leaks PII or copyrighted text.
- **Unbounded consumption** — cost or context-window exhaustion.
- **Hallucination as a security issue** — confidently-wrong output causes user harm.
- **Overreliance / automation bias** — user defers to the model where they should verify.

---

## AI-Specific Mitigations

- **Treat all model input as untrusted** — including RAG, tool outputs, memory, images, audio.
- **Separate trust zones in the context window** — label system prompt, user content, retrieved content, and tool output distinctly; validate tool calls against user intent.
- **Least-privilege tools** — narrow scopes, per-call authorization, human-in-the-loop for high-blast-radius actions.
- **Output filtering / structured outputs** — constrain to schemas, block markdown rendering of untrusted content, strip links.
- **Input/output content safety** — moderation, PII detection, injection classifiers.
- **Retrieval hardening** — source provenance, tenant scoping, chunk-level attribution, re-ranking suspicious content.
- **Memory hygiene** — whitelisted writers, TTLs, per-user isolation, human review of memory additions.
- **Guard the planner** — policy checks on agent plans before execution; tool-call authorization.
- **AI red teaming** — adversarial eval suites in CI (e.g., Microsoft PyRIT, HarmBench).
- **Observability** — structured tracing of prompts, retrievals, tool calls; anomaly detection on action patterns.
- **Compliance linkages** — map to NIST AI RMF, ISO/IEC 42001, EU AI Act obligations.

---

## Process for AI Threat Modeling

1. Draw the system with the **seven MAESTRO layers** in mind; mark every data source flowing into the context window.
2. Enumerate **assets** — including trust, correctness, and safety.
3. Run **STRIDE on each component**; re-interpret categories for AI (e.g., "Tampering" includes training-data poisoning and RAG injection).
4. Run the **OWASP LLM Top 10** as a checklist across the whole system.
5. Walk **MAESTRO per-layer** for agent-specific threats.
6. **Draw cross-layer chains** for the top risks.
7. Plan mitigations with **defense in depth**, explicit human-in-the-loop points, and a **blast-radius budget** per tool.
8. Wire **AI red teaming** into CI; findings update the model.
9. Map to **MITRE ATLAS** techniques for evidence-based prioritization.
