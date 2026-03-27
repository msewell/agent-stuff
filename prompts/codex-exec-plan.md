---
description: Create a plan using codex_exec_plans guidance and installed skills. Accepts optional user arguments via $@.
---
Follow `curl https://developers.openai.com/cookbook/articles/codex_exec_plans | html2text` to create a plan.

Treat user arguments as planning constraints (scope, targets, non-goals, deadlines, risk tolerance, and quality bar).
If no user arguments are provided, infer constraints from the user’s latest request and the current repository context, and state assumptions explicitly.

Before writing the plan, also check your installed skills to find appropriate skills for what you will be building.

(User arguments: $@)
