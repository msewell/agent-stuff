# Adoption, Failure Modes, and Measurement

## Table of Contents

- [Failure Modes in Adoption](#failure-modes-in-adoption)
- [Adoption Maturity Model](#adoption-maturity-model)
- [Story Slicing with Examples](#story-slicing-with-examples)
- [SBE in the AI Era: Spec-Driven Development](#sbe-in-the-ai-era-spec-driven-development)
- [Measuring Success](#measuring-success)

---

## Failure Modes in Adoption

| Failure mode | Root cause | Mitigation |
|---|---|---|
| **"BDD is just a testing tool"** | Team skips collaboration; only QA writes Gherkin | Reinforce that shared understanding is the goal; mandate cross-role participation |
| **No discovery phase** | Team jumps to writing scenarios without a workshop | Introduce Example Mapping as a lightweight entry point |
| **Analyst writes specs alone** | Product owner creates specs in isolation | Require Three Amigos sign-off before a story enters development |
| **Feature files nobody reads** | Stakeholders never look at specs | Generate browsable documentation; actively share it; measure readership |
| **Chronic red specs** | Failing specs are ignored, eroding trust | Treat failing specs like a broken build; fix or delete within 24 hours |
| **Trying everything at once** | Simultaneous adoption of SBE, BDD tooling, CI/CD changes, and new testing practices | Start with collaboration only; add automation gradually |
| **Forcing it on resistant teams** | Top-down mandate without coaching or buy-in | Start with a willing pilot team; let success create pull; provide coaching |
| **Over-applying BDD** | Every test (including unit and integration) is written in Gherkin | Use SBE/BDD at the acceptance level only; use standard test frameworks for unit and integration tests |

**The cardinal sin:** treating SBE as test automation while skipping the collaboration. When only testers write Gherkin, the practice degenerates into a verbose, hard-to-maintain test suite with none of the communication benefits.

---

## Adoption Maturity Model

### Level 0: Ad Hoc

Requirements via conversations, emails, or tickets with no consistent structure. Acceptance criteria are vague.

→ **Action:** Introduce concrete examples into backlog refinement. Ask "can you give me an example?" whenever a requirement is stated abstractly.

### Level 1: Structured Examples

Team uses concrete examples as acceptance criteria for some stories, captured in tickets. No automation, informal workshops.

→ **Action:** Formalize collaboration. Introduce 25-minute Example Mapping sessions. Ensure three roles participate.

### Level 2: Collaborative Specification

Cross-functional workshops are regular. Examples are written in a consistent format. Business stakeholders participate. Not yet automated.

→ **Action:** Automate a small number of high-value specifications. Pick one feature end-to-end and connect specs to the system. Run in CI.

### Level 3: Automated Validation

Specifications are executable and run in CI/CD. Failures are build-breaking. Clear separation between spec language and automation code.

→ **Action:** Reorganize specs by business domain. Generate browsable documentation. Share with stakeholders. Establish a curation cadence.

### Level 4: Living Documentation

The specification suite is the single source of truth. Organized by domain, curated regularly, actively used by stakeholders for onboarding and change-impact analysis. Trusted because it is always green.

### Adoption tips

- Start with one willing team, not an org-wide rollout.
- Focus on collaboration first, tools second.
- Get a coach with facilitation skills.
- Expect an initial velocity dip — payoff comes as rework drops.
- Do not mandate Gherkin. Tables, bullet-point examples, and plain prose all qualify.

---

## Story Slicing with Examples

Examples discovered during specification directly suggest how to slice a large story into thin, independently deliverable increments. Each **blue card (rule)** from an Example Mapping session is a candidate for its own story slice.

### Slicing heuristics

| Heuristic | How it works | Example |
|---|---|---|
| **Happy path first** | Implement the most common-case rule first. Edge-case rules become follow-up stories. | "Subscriber can pause for 1–3 months" first; "limit to one pause per year" follows. |
| **Rule complexity** | Complex rules with many examples get their own story. | A pricing rule with many discount tiers → its own story. |
| **Red cards as blockers** | Rules with unanswered questions get deferred. Ship the fully understood rules. | Defer "archived content access" (blocked by red card); ship the billing rules. |
| **Dependency order** | Slice along the dependency chain. | "Apply coupon" before "Stack multiple coupons." |

### Worked example — pause subscription

From the Example Mapping walkthrough, the team identified 4 rules and 2 open questions:

| Slice | Rules included | Examples | Status |
|---|---|---|---|
| Story 1: "Pause for 1–3 months" | Rule 1 (duration limits) + Rule 3 (billing stops) | 6 examples | Ready — no red cards |
| Story 2: "Once per billing year" | Rule 2 (frequency limit) | 2 examples | Blocked — red card |
| Story 3: "Content access during pause" | Rule 4 (archived vs. new content) | 2 examples | Blocked — red card |

Story 1 enters development immediately. Stories 2 and 3 wait for red-card resolution. Each slice is independently valuable, testable, and deployable.

Slicing along *rules backed by examples* guarantees each slice has clear acceptance criteria, is demonstrably complete (all examples pass), and delivers a coherent piece of business value.

---

## SBE in the AI Era: Spec-Driven Development

**Spec-driven development (SDD)** uses well-crafted specifications as structured prompts for AI code generation.

### The spec-test-code workflow

1. **Specification.** Define requirements in structured natural language — scenarios, rules, examples, constraints. Use ubiquitous language and Given-When-Then structure.
2. **Test generation and review.** Feed the specification to an LLM to generate test suites. Review the tests — this step frequently reveals gaps in the specification.
3. **Code generation and validation.** The LLM generates implementation guided by both the spec and the tests. The code must pass all generated tests. Review for architecture, security, and maintainability.

### What changes, what stays the same

| Aspect | Classic SBE | SBE + AI |
|---|---|---|
| Collaboration workshops | Essential | Still essential — AI cannot replace the Three Amigos conversation |
| Specification authorship | Human | Human, optionally AI-assisted for drafting |
| Specification review | Human | Human — non-negotiable |
| Test generation | Human writes automation | AI generates tests; human reviews |
| Implementation | Human writes code | AI generates code; human reviews |
| CI/CD validation | Automated | Automated — even more critical with non-deterministic AI output |

### Caveats

- AI-generated code is non-deterministic. Tests are the stabilizing anchor.
- Over-formalized specs can slow feedback. Not every feature needs a 200-line spec.
- A specification written by one person and fed to an LLM skips shared understanding. The code may be technically correct but solve the wrong problem.

---

## Measuring Success

Measure **outcomes**, not activity. Counting scenarios tells you nothing about whether the practice is working.

### Leading indicators

| Indicator | What it reveals | Target |
|---|---|---|
| Workshop participation rate | Is collaboration happening? | 3+ roles in every session |
| Stakeholder readership | Do business people use the specs? | ≥1 non-developer reads each feature's specs per sprint |
| Red-spec response time | Does the team trust the suite? | Fixed or removed within 24 hours |
| Questions surfaced per session | Are workshops discovering unknowns? | 1–2 red cards per Example Mapping session |

### Lagging indicators

| Indicator | Target direction |
|---|---|
| Escaped defect rate | Decreasing |
| Rework ratio | Decreasing |
| Lead time (idea to production) | Decreasing |
| Onboarding time | Decreasing |
| Specification suite health | >95% green; <5% stale |

### What not to measure

- **Number of scenarios written.** More is not better. A bloated suite is a liability.
- **Code coverage from acceptance tests.** Acceptance tests cover business behavior, not code paths.
- **Individual productivity.** SBE is a team practice.
