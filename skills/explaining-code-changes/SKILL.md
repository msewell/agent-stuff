---
name: explaining-code-changes
description: Creates self-contained HTML learning walkthroughs of code changes with background, intuition, code walkthroughs, embedded diagrams, and a self-check quiz. Use when the user asks to explain a diff, branch, commit, pull request, PR, or code change for learning, onboarding, or handoff. Not for code review, approval/readiness verdicts, or merge decisions.
category: Writing & Communication
---

# Explaining Code Changes

## Workflow

1. Identify the change target: diff, commit range, branch, or PR. If the target is ambiguous, ask one clarifying question before generating the file.
2. Inspect the diff and read enough surrounding code to understand the relevant system behavior. Prefer source files, tests, schemas, routes, and UI entry points over generated or vendored files.
3. Build the explanation spine:
   - what existed before
   - what changed
   - why the change matters
   - how data or control flows through the system
   - which assumptions, invariants, edge cases, or tests are affected
4. Create one self-contained HTML file at `/tmp/YYYY-MM-DD-explanation-<slug>.html` unless the user specifies another path.
5. Validate the saved file before responding. If validation fails, fix the file and rerun the relevant checks.
6. Respond with only the file path and a brief summary of what it explains.

## HTML structure

Use one long responsive page with inline CSS and JavaScript. Include:

1. **Title and table of contents**: Link to each major section.
2. **Background**: Explain the relevant existing system. Start broad enough for newcomers, then narrow to the pieces needed for this change.
3. **Intuition**: Explain the core idea with concrete toy data, examples, and diagrams before detailed code.
4. **Code walkthrough**: Group changes by concept or execution path, not by raw file order. Connect each code detail to the behavior or design idea it supports.
5. **Self-check quiz**: Provide five medium-difficulty multiple-choice questions with immediate feedback for each answer. This quiz is for self-study inside the explanation artifact; it must not certify readiness to approve, merge, or review the change. Questions should test understanding of the change, not trivia or gotchas. Default to putting `data-correct` on each `.quiz-q` container and answer keys on its buttons; the JavaScript should read the correct key from the nearest question container.

## Writing style

Write in a clear, example-driven systems-explanation style:

- introduce concrete examples before abstractions
- explain causality and tradeoffs
- use smooth transitions between sections
- avoid hype, filler, and imitation of a living author's personal style
- distinguish confirmed facts from plausible interpretations

## Diagram and code rules

- Diagrams are illustrative and embedded in the explanation. Prefer inline HTML/CSS or SVG to keep the file self-contained. Do not produce standalone diagram source or rendered diagram artifacts unless the user explicitly asks for that as part of the explanation.
- Use simple HTML/CSS or inline SVG diagrams; do not use ASCII diagrams.
- Reuse a small number of diagram families when possible, such as simplified UI sketches or system/data-flow diagrams.
- Include realistic example data in system diagrams.
- Use `<pre>` tags for code blocks.
- Ensure code block CSS includes `white-space: pre` or `white-space: pre-wrap`.
- Preserve code fidelity: keep identifiers, field names, literals, and control flow exact except for explicit secret redactions.
- If adding syntax highlighting inside `<pre>`, escape the code text first and verify the visible code still matches the source.
- Use callouts for key concepts, definitions, risks, and edge cases.

## Safety rules

- Escape all code, filenames, commit messages, comments, and user-provided text before embedding them in HTML.
- Do not load external scripts, stylesheets, fonts, images, or CDN assets.
- Avoid `innerHTML` for quiz behavior unless inserted strings are trusted and escaped. Prefer static markup plus event listeners.
- Do not expose secrets found in diffs or surrounding files. Redact credentials, tokens, private keys, session cookies, and personal data.

## Validation checklist

Before responding, verify:

- the HTML file exists at the expected path and its filename ends in `.html`
- the file is self-contained and has no external resource references; internal `#anchor` links, inline SVG namespaces, and URLs shown as example text are allowed
- every code block uses `<pre>` and preserves whitespace via `white-space: pre` or `white-space: pre-wrap`
- code walkthrough snippets preserve original identifiers and field names
- the table of contents links point to existing section IDs
- the quiz has exactly five questions, each question has exactly one correct answer, and both correct and incorrect clicks display appropriate feedback
- generated, vendored, or minified files are summarized rather than over-explained unless central to the change

## Edge cases

- **Large diffs**: Explain the architectural spine first, then summarize repetitive or mechanical changes.
- **Pure refactors**: Focus on preserved behavior, changed structure, risk reduction, and tests that prove equivalence.
- **UI changes without screenshots**: Build simplified HTML/CSS sketches from the code and describe any uncertainty.
- **Missing base branch or PR metadata**: Ask for the target range instead of guessing.
- **Security-sensitive diffs**: Explain the design without reproducing exploitable details or secrets.
- **Explicit review, approval, or readiness request**: Do not issue approval verdicts, request-changes verdicts, or audit findings. Ask whether the user wants an explanatory walkthrough instead. If yes, frame risks and edge cases as teaching notes, not review findings.
- **Standalone quiz or approval-gating quiz request**: Do not create the HTML walkthrough unless the user asks for an explanatory artifact. Ask whether they want a self-contained explanation file with an embedded self-check quiz.

## Minimal response format

```text
Created: /tmp/YYYY-MM-DD-explanation-<slug>.html
Summary: <one sentence describing the explained change>
```
