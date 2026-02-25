---
description: Review changes within a scope for long-term maintainability
---
Scope: $@

Review the changes within the scope, under the assumption that you will have to maintain this repository long-term.

Identify any substantial improvement opportunities that could improve long-term maintainability, simplicity, signal-to-noise ratio, or reduce cognitive load without unreasonably bloating the scope of the changes.
Also aggressively suggest what (within the scope of the changes) should be removed or reduced.
Focus primarily on the changes within the specified scope, but reference surrounding code, relevant documentation, or other files when necessary to assess impact based on the nature of this repository and its apparent goals. Follow the YAGNI principle: when in doubt, leave it out.

When suggesting changes, explain your reasoning.

Write your output to a new temporary Markdown file in /tmp with the name `<scope>-SUGGESTIONS.md`.
The file should be structured for human review.
