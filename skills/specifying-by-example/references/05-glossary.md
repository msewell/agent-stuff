# SBE Glossary

| Term | Definition |
|---|---|
| **Acceptance criteria** | Conditions a story must satisfy to be considered done. In SBE, expressed as concrete examples. |
| **ATDD** | Acceptance Test-Driven Development. Acceptance tests defined collaboratively before development begins. |
| **Background** | Gherkin keyword for shared Given steps that apply to every scenario in a feature file. |
| **BDD** | Behavior-Driven Development. Uses structured natural language (Given-When-Then) to describe system behavior. Coined by Dan North. |
| **Bounded context** | A DDD boundary within which a particular domain model and ubiquitous language apply consistently. Useful for organizing spec suites. |
| **Declarative style** | Scenarios that describe *what* the system does (behavior) rather than *how* (UI steps). Preferred over imperative style. |
| **Discovery workshop** | Collaborative session where the team explores a feature's domain using examples before development. |
| **Example Mapping** | Technique using four colored cards (story, rules, examples, questions) to decompose a story. Created by Matt Wynne. |
| **Executable specification** | A specification in structured format that can be automatically validated against the running system. The specification *is* the test. |
| **Feature file** | A plain-text `.feature` file containing Gherkin scenarios. Stored in version control alongside source code. |
| **Feature Mapping** | Discovery technique extending Example Mapping with actors and task flows. Created by John Ferguson Smart. |
| **Gherkin** | Structured natural-language syntax using keywords (Feature, Rule, Scenario, Given, When, Then, And, But) for executable specifications. |
| **Given-When-Then** | Three-part scenario structure: Given (precondition), When (action), Then (expected outcome). |
| **Impact Mapping** | Strategic planning connecting business goals to deliverables through actors and behavioral changes. Designed by Gojko Adzic. |
| **Living documentation** | Specifications that stay current because they are continuously validated against the running system. |
| **Scenario** | A single concrete example of system behavior as a Given-When-Then sequence. Each scenario tests one behavior. |
| **Scenario Outline** | Gherkin construct for parameterized scenarios. A template combined with an Examples table generates multiple test cases. |
| **SBE** | Specification by Example. Collaborative method for specifying requirements using concrete, realistic examples. Popularized by Gojko Adzic. |
| **Spec-driven development** | Using well-crafted specifications as structured prompts for AI/LLM code generation. |
| **Step definition** | Automation code connecting a Gherkin step to system interactions. Part of the automation layer, separate from the specification. |
| **Three Amigos** | Meeting format where product (request), development (suggest), and testing (protest) examine a piece of work collaboratively. |
| **Ubiquitous language** | Shared vocabulary between business and technical stakeholders, used consistently in conversation, code, and specifications. From DDD. |
