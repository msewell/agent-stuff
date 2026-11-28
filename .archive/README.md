# Archive

Retired skills and prompts, kept for reference.

## Skills

| Skill | Reason |
|-------|--------|
| [testing-with-nullables](skills/testing-with-nullables) | The Nullables pattern requires embedding stubs, configurable responses, and output trackers inside production classes. The resulting production code is messier — littered with test-support infrastructure (`createNull()` factories, `NullXxx` stubs, `trackXxx()` methods, event emitters) that exists solely to enable testing. The refactoring-resilience benefit didn't justify the cost of polluting production code. |
| [designing-event-models](skills/designing-event-models) | Event modeling is primarily a human collaboration method and not useful as an agent skill in this repository. |
| [generating-marp-slides](skills/generating-marp-slides) | The outputted slides are too opinionated and low-value. |
| [applying-tcr-with-agents](skills/applying-tcr-with-agents) | It clashes with the TDD skill, which is better. |
| [stripping-ai-tells](skills/stripping-ai-tells) | Superseded by [humanizing-prose](../skills/humanizing-prose). That skill covers AI-tell removal as part of a fuller rewrite workflow, with stricter fact-preservation rules and voice-matching support. |
| [toon-format](skills/toon-format) | It hasn't proven useful even once. |

## Prompts

| Prompt | Reason |
|--------|--------|
| [reflect](prompts/reflect.md) | Superseded by [retro](../prompts/retro.md), which uses session evidence to recommend the smallest useful change rather than defaulting to instruction-file edits. |
