# DevSecOps and Cloud-Native

## Table of Contents

- [Threat Modeling as Code (TMaC)](#threat-modeling-as-code-tmac)
- [OWASP pytm Example](#owasp-pytm-example)
- [CI/CD Integration](#cicd-integration)
- [Other TMaC Tools](#other-tmac-tools)
- [Shift-Left Patterns](#shift-left-patterns)
- [TMaC Caveats](#tmac-caveats)
- [Cloud-Native Trust Boundaries](#cloud-native-trust-boundaries)
- [Cloud-Native Threat Classes](#cloud-native-threat-classes)
- [Reference Frameworks](#reference-frameworks)
- [Policy as Code](#policy-as-code)

---

## Threat Modeling as Code (TMaC)

Benefits of expressing threat models in code:

- **Version control** — diff, review, and blame the threat model like code.
- **CI integration** — regenerate diagrams and reports on every change.
- **Reuse** — share threat libraries across projects.
- **Drift detection** — fail the build when architecture diverges from the model.

---

## OWASP pytm Example

```python
#!/usr/bin/env python3
from pytm import TM, Server, Datastore, Dataflow, Boundary, Actor

tm = TM("CommentHub")
tm.description = "User-generated comment system"

internet = Boundary("Internet")
app = Boundary("App Network")

user = Actor("End User")
user.inBoundary = internet

web = Server("Web Frontend")
web.OS = "Linux"
web.isHardened = True
web.inBoundary = app

api = Server("API Service")
api.inBoundary = app

db = Datastore("Postgres")
db.isSQL = True
db.inBoundary = app
db.storesSensitiveData = True

f1 = Dataflow(user, web, "HTTPS request")
f1.protocol = "HTTPS"
f1.dstPort = 443
f1.data = "comment payload"

f2 = Dataflow(web, api, "gRPC call")
f2.protocol = "gRPC"
f2.isEncrypted = True

f3 = Dataflow(api, db, "SQL write")
f3.protocol = "TLS/PG"
f3.data = "comment + user_id"

tm.process()
```

Run:

```bash
./tm.py --dfd | dot -Tpng -o dfd.png
./tm.py --report template.md > threat-model.md
```

---

## CI/CD Integration

GitHub Actions example:

```yaml
name: threat-model
on:
  pull_request:
    paths: ['threatmodel/**', 'src/**']

jobs:
  tm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: sudo apt-get install -y graphviz plantuml
      - run: pip install pytm
      - name: Regenerate threat model
        run: |
          ./threatmodel/tm.py --dfd | dot -Tpng -o docs/dfd.png
          ./threatmodel/tm.py --report threatmodel/template.md > docs/threat-model.md
      - name: Fail if outputs drift
        run: git diff --exit-code docs/
      - name: Comment on PR with changed threats
        if: failure()
        run: echo "Threat model out of date. Run tm.py locally and commit outputs."
```

---

## Other TMaC Tools

- **Threagile** — YAML-defined models, risk rules in Go.
- **TicTaaC** — minimal Java, CI-friendly.
- **OWASP Threat Dragon** — GUI + JSON format; model-as-file.
- **IriusRisk / SD Elements** — commercial, questionnaire-driven, high automation.
- **STRIDE-GPT, AWS Threat Designer, Agent Wiz** — LLM-assisted model generation.

---

## Shift-Left Patterns

- **Story-level threat questions** in the user story template.
- **Pre-commit hooks** regenerating the model when `threatmodel/` changes.
- **PR template** asking "What does this change mean for the threat model?"
- **Risk-gated deploys** — block promotion to prod when new High/Critical threats are unmitigated.
- **ADRs** link to the threats they address or introduce.

---

## TMaC Caveats

- TMaC is not a substitute for the conversation. Code generates diagrams and report skeletons; humans identify creative threats.
- LLM-generated threat models hallucinate and under-surface business-specific risks. Treat output as a first draft, not a deliverable.

---

## Cloud-Native Trust Boundaries

Classical STRIDE on a monolith misses cloud-native risks. Additional boundaries:

- **Shared responsibility** — provider vs. customer; know which controls are yours.
- **Control plane vs. data plane** — IAM, management APIs, metadata services (IMDSv2 required).
- **Service mesh** — sidecar trust, mTLS, policy engines.
- **Container ↔ host** — capabilities, seccomp, read-only rootfs.
- **Serverless** — cold start secrets, trigger abuse, retry storms.
- **Multi-tenant data stores** — tenant isolation, row-level security, per-tenant keys.
- **IaC** — Terraform/CloudFormation as attack surface (drift, backdoored modules).

---

## Cloud-Native Threat Classes

- **Metadata service abuse** (SSRF → IAM role theft).
- **Cross-account role assumption** via mis-scoped trust policies.
- **Overly permissive service principals / managed identities.**
- **Secret sprawl** across env vars, repos, images, state files.
- **Storage bucket misconfig** — public ACLs, insecure CORS.
- **Supply-chain** — base images, dependency confusion, typosquatting, SBOM gaps.
- **Lateral east-west traffic** — flat networks give attackers free reign post-breach.

---

## Reference Frameworks

- **AWS Well-Architected — Security Pillar**
- **CIS Kubernetes / Docker / Cloud Benchmarks**
- **NIST SP 800-204 / 800-207** (microservices & zero trust)
- **MITRE ATT&CK for Containers / Cloud / Kubernetes**

---

## Policy as Code

Add a policy-as-code layer (OPA/Rego, Checkov, tfsec, Trivy) wired into the threat model. Each policy rule is a mitigation for a specific threat — link them.
