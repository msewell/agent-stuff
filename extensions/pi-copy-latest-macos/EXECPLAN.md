# Deliver a Minimal macOS `/copy` Pi Extension Package

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This repository does not currently contain a checked-in `PLANS.md`, so this document is self-contained and must be maintained as the single source of execution guidance.

## Purpose / Big Picture

The goal is to provide one reliable user behavior: in pi, running `/copy` copies the latest assistant output to the macOS clipboard via `pbcopy`. After this work, users no longer need terminal selection to copy the assistant’s most recent answer. The package remains intentionally minimal: no picker, no shortcut, no non-macOS support, and no third-party runtime dependencies.

## Skill Check (installed skills reviewed)

Before authoring this plan, installed skills available to this agent session were reviewed. The available set includes many skills (not only two), including implementation-relevant ones such as `tdd-with-llm-agents`, `commenting-code`, and `writing-git-commit-messages`.

For this task, the most relevant skills are:

- `tdd-with-llm-agents`: to keep implementation test-first and incremental.
- `writing-git-commit-messages`: to ensure clean Conventional Commit style once work is complete.

No specialized pi-extension-construction skill is required because the repository is small and first-party pi extension docs cover needed APIs.

## Progress

- [x] (2026-04-02 00:00Z) Retrieved and reviewed ExecPlan guidance from the Codex cookbook article.
- [x] (2026-04-02 00:05Z) Reviewed installed skills and selected relevant implementation skills.
- [x] (2026-04-02 00:10Z) Inspected current repository contents at `~/Developer/pi-copy-latest-macos`.
- [x] (2026-04-02 00:18Z) Reconciled repository state; kept existing scaffold because it already matched required scope.
- [x] (2026-04-02 00:19Z) Confirmed `/copy` implementation is macOS-only, no picker/shortcut, silent no-op when no text.
- [x] (2026-04-02 00:20Z) Executed local validation: `npm test` and `npm run coverage` passing.
- [x] (2026-04-02 00:21Z) Executed `npm pack --dry-run` and verified publish payload.
- [ ] Commit final state with this updated ExecPlan and implementation history note.

## Surprises & Discoveries

- Observation: The active agent session exposes a broad installed-skill catalog; the earlier statement that only two installed skills were present was incorrect.
  Evidence: Session skill inventory includes many entries such as `tdd-with-llm-agents`, `writing-git-commit-messages`, `designing-rest-apis`, `writing-agent-skills`, and others.

- Observation: A full scaffold for this package already exists in `~/Developer/pi-copy-latest-macos`.
  Evidence: Existing files include `extensions/index.ts`, `src/core.ts`, `test/core.test.ts`, and `package.json`.

## Decision Log

- Decision: Keep scope strict to one command, `/copy`, with no picker and no shortcut.
  Rationale: This is the user’s explicit requirement and keeps maintenance cost low.
  Date/Author: 2026-04-02 / Agent

- Decision: Treat non-macOS as unsupported and fail in clipboard helper with a clear error.
  Rationale: Prevents ambiguous behavior and aligns with macOS-only requirement.
  Date/Author: 2026-04-02 / Agent

- Decision: Use `spawn("pbcopy")` instead of shelling with `exec`.
  Rationale: Avoids shell parsing and reduces injection risk.
  Date/Author: 2026-04-02 / Agent

- Decision: Use line coverage threshold only (`>=80%`) for local gate.
  Rationale: Meets requirement with least additional configuration overhead.
  Date/Author: 2026-04-02 / Agent

## Outcomes & Retrospective

Implementation is complete and behavior is working as intended for the defined scope.

- `/copy` is the only command exposed by the extension.
- Clipboard copy is macOS-only via `pbcopy` with `spawn`, with no shell interpolation.
- When no assistant text exists, the command returns silently.
- Local tests pass (`8/8`) and line coverage is `100%` (threshold required: `>=80%`).
- Package dry-run output is clean and minimal (5 files in tarball).

Gaps intentionally left out by design:

- No picker UI.
- No keyboard shortcut.
- No Linux/Windows clipboard support.

Lesson learned: for very small pi extensions, keeping extraction/copy logic in pure helpers plus injected process dependencies provides high testability with minimal code.

## Context and Orientation

Repository root: `~/Developer/pi-copy-latest-macos`.

A pi extension is a TypeScript module exporting a default function that receives `ExtensionAPI`. Commands are registered through `pi.registerCommand(...)` in `extensions/index.ts`.

Conversation data is read from `ctx.sessionManager.getBranch()`, which returns session entries. Assistant text can be plain string content or arrays of content blocks. Only `type: "text"` blocks should be copied.

Primary files for this change:

- `extensions/index.ts`: command registration and command handler wiring.
- `src/core.ts`: text extraction and clipboard interaction.
- `test/core.test.ts`: behavior tests, including edge cases and clipboard process simulation.
- `README.md`: install and usage documentation.
- `package.json`: pi manifest, scripts, dependencies, and metadata.
- `LICENSE`: full `GPL-3.0-only` text.

## Plan of Work

Start by reconciling state: since scaffold files already exist, evaluate whether each file matches current requirements instead of blindly rewriting. If the current files already satisfy scope and quality bars, only make targeted corrections.

In `src/core.ts`, maintain pure helpers for extracting latest assistant text and for copying via `pbcopy`. The text-selection behavior must be deterministic: scan backward to the latest assistant message, skip aborted+empty assistant messages, extract text blocks only, trim outer whitespace, and return `undefined` if nothing copyable remains.

In `extensions/index.ts`, keep a single `/copy` command. The command should ignore arguments (least code path), return silently when no text is available, and notify only on clipboard failure.

In `test/core.test.ts`, ensure tests cover:

- text extraction from string and content arrays,
- latest assistant selection logic,
- aborted-empty skip behavior,
- non-macOS rejection,
- successful write path to pbcopy,
- non-zero pbcopy failure path.

Then validate with local commands and confirm package payload via dry run. Finally, commit with a concise conventional commit message.

## Concrete Steps

Run commands from the repository root.

    cd ~/Developer/pi-copy-latest-macos
    npm install

    npm test

Expected: all tests pass.

    npm run coverage

Expected: command succeeds and reports line coverage >= 80%.

    npm pack --dry-run

Expected: tarball shows only intended package files.

If changes were needed:

    git add .
    git commit -m "feat: finalize minimal macOS /copy pi extension"

## Validation and Acceptance

Acceptance is behavior-based.

Automated acceptance:

- `npm test` passes all tests.
- `npm run coverage` passes with line coverage >= 80%.

Manual acceptance in pi on macOS:

1. Install from local path:

       pi install ~/Developer/pi-copy-latest-macos

2. Start pi, generate an assistant response, run `/copy`, then paste into another app.
3. Pasted content matches the latest assistant output (text blocks only, trimmed outer whitespace).
4. If no assistant output exists, `/copy` is a silent no-op and pi remains stable.

## Idempotence and Recovery

All validation commands are safe to run repeatedly.

If working tree drifts unexpectedly:

    cd ~/Developer/pi-copy-latest-macos
    git status
    git restore .

If a full rollback is needed and commits exist:

    git reset --hard HEAD
    git clean -fd

No data migration is involved, so recovery is file-level only.

## Artifacts and Notes

Observed evidence from local execution:

    npm test
    ✔ ... (8 tests)
    ℹ pass 8
    ℹ fail 0

    npm run coverage
    All files | % Lines = 100

    npm pack --dry-run
    npm notice total files: 5
    npm notice Tarball Contents includes:
    - LICENSE
    - README.md
    - extensions/index.ts
    - package.json
    - src/core.ts

These artifacts confirm functional correctness, coverage gate success, and publish payload hygiene.

## Interfaces and Dependencies

Expected interfaces in `src/core.ts`:

- `extractAssistantText(content: unknown): string`
- `getLastAssistantText(entries: SessionEntryLike[]): string | undefined`
- `copyTextToPbcopy(text: string, deps?): Promise<void>`

Expected extension entry point in `extensions/index.ts`:

- default export function accepting `ExtensionAPI`
- registers `/copy` command only

Dependency policy:

- Runtime: Node built-ins only.
- Peer dependency: `@mariozechner/pi-coding-agent`.
- Dev dependencies (local tooling only): `typescript`, `tsx`, `c8`, `@types/node`.

Change note (2026-04-02): Corrected skill-inventory statement and rewrote plan as a repository `.md` file per request.

Change note (2026-04-02, implementation update): Reconciled existing scaffold, verified behavior against scope, ran test/coverage/package validation, and updated this plan to reflect executed results.
