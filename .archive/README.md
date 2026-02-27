# Archive

Skills I no longer find useful.

| Skill | Reason |
|-------|--------|
| [testing-with-nullables](skills/testing-with-nullables) | The Nullables pattern requires embedding stubs, configurable responses, and output trackers inside production classes. The resulting production code is messier — littered with test-support infrastructure (`createNull()` factories, `NullXxx` stubs, `trackXxx()` methods, event emitters) that exists solely to enable testing. The refactoring-resilience benefit didn't justify the cost of polluting production code. |
