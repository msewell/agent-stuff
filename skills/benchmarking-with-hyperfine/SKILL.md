---
name: benchmarking-with-hyperfine
description: Designs, runs, interprets, and reports trustworthy command-line benchmarks using hyperfine. Chooses warmups, run counts, lifecycle hooks, shell control, parameter sweeps, exports, noise controls, and CI/Bencher integration. Use when benchmarking CLI commands or builds, comparing implementations, checking performance regressions, tuning hyperfine flags, or interpreting hyperfine JSON/Markdown results.
category: Agent Tooling
compatibility: Requires hyperfine; guidance assumes hyperfine v1.20.x semantics on Linux or macOS.
---

# Benchmarking with Hyperfine

## Default workflow

1. Clarify the benchmark question before running anything:
   - Comparing alternatives? Use the same input, cache story, and environment for all commands.
   - Checking a regression? Lock the baseline with `--reference` unless parameter sweeps require listing the baseline as a normal command.
   - Measuring I/O? Decide whether the user needs warm-cache, cold-cache, or both.
   - Measuring a build? Decide whether clean-build time or incremental-build time matters.
2. Verify the tool: run `hyperfine --version`. If it is older than the flags needed, ask to install or pin a newer release.
3. Start from the closest recipe, then adapt only what the task needs:
   - Compare commands: `hyperfine --warmup 3 'cmd-a' 'cmd-b'`
   - Very fast command: `hyperfine -N --warmup 5 --min-runs 200 './bin'`
   - Clean build: `hyperfine --prepare 'make clean' 'make -j8'`
   - Numeric sweep: `hyperfine -P threads 1 16 'make -j {threads}'`
   - List sweep: `hyperfine -L compiler gcc,clang '{compiler} -O2 main.c'`
   - Named commands: `hyperfine -n old './old' -n new './new'`
   - Locked baseline: `hyperfine --reference './main' './candidate'`
   - Export: `hyperfine --export-json r.json --export-markdown r.md 'cmd'`
4. Control noise before trusting results:
   - Close heavy background processes.
   - Use `--warmup 3` for normal warm-cache timings.
   - Use `--prepare` to reset state before every run when measuring cold-cache or clean-state behavior.
   - Run `sudo -v` before benchmarks whose hooks use `sudo`.
   - Avoid `--show-output` except while debugging.
   - Re-run the same benchmark twice; if medians differ by more than about 1%, reduce noise before claiming an A/B result.
5. Keep execution claims honest:
   - If you have not actually run the benchmark in the current environment, provide a benchmark plan only.
   - Do not say `hyperfine` is installed, available, or at a specific version unless you ran `hyperfine --version` or the user supplied that fact.
   - Do not invent environment details, timing tables, artifact paths, warnings, or hyperfine output.
   - Report results only from observed command output, user-supplied data, or files you actually read.
6. Export machine-readable evidence for non-trivial results:
   ```bash
   hyperfine --warmup 3 --min-runs 30 \
     --export-json bench.json --export-markdown bench.md \
     'cmd-a' 'cmd-b'
   ```
7. Interpret conservatively:
   - Prefer median in write-ups when timings are skewed or outliers are visible.
   - Treat a speedup as inconclusive if the reported relative-error band crosses `1.0x`.
   - Increase `--min-runs` when trying to detect small effects.
   - Investigate outlier warnings; do not suppress them as cosmetic noise.
8. Report enough context to reproduce the result: machine/OS, hyperfine version, command labels, cache state, run count, warmups, relevant hooks, and exported artifact paths.

## Read references when needed

- For exact flag semantics, hook lifecycle, output modes, parameterization, and version gotchas, read [references/01-flag-reference.md](references/01-flag-reference.md).
- For cache state, shell overhead, CPU/power management, process isolation, and repeatability checks, read [references/02-noise-control.md](references/02-noise-control.md).
- For medians vs means, confidence, baseline comparisons, JSON shape, visualization, and result write-ups, read [references/03-interpretation-and-reporting.md](references/03-interpretation-and-reporting.md).
- For GitHub Actions gates, PR comments, Bencher, and CI caveats, read [references/04-ci-integration.md](references/04-ci-integration.md).
- For ready-to-adapt benchmark commands, read [references/05-recipes.md](references/05-recipes.md).

## Guardrails

- Put one-shot work in `--setup`; put per-run state reset in `--prepare`. `--prepare` runs before warmup iterations too.
- Use `-N` only when the command can be executed without shell features. No globbing, `~`, redirection, pipes, `&&`, shell builtins, or aliases.
- Remember that JSON and CSV exports are always seconds, regardless of `--time-unit`.
- With `-n`, each name labels the immediately following command. Do not both label commands and append duplicate unnamed commands later.
- Do not use `--reference` for a parameterized baseline; the reference command does not participate in `-L` or `-P` sweeps.
- For speedups at every parameter value, either run a small loop with `--reference` once per parameter value, or export a combined sweep and compute main-vs-candidate ratios from JSON grouped by `parameters`. Do not claim the first command is the baseline in a sweep.
- Welch's t-test needs two independent JSON exports (`a.json b.json`); do not pass one combined export unless you have verified the script supports that mode.
- Do not gate merges on tiny absolute thresholds in noisy hosted CI. Use generous smoke budgets, self-hosted hardware, or Bencher-style statistical thresholds.

## Output templates

When giving commands without running them, use this plan format:

```markdown
## Benchmark plan

Question: [what will be compared]
Method: [warm/cold cache, warmups, runs/min-runs, hooks, exports]
Commands:
[exact hyperfine command]
How to interpret:
[decision rules]
Caveats:
[noise, cache state, CI limits]
```

Use this result format only after actually running a benchmark or receiving results:

```markdown
## Benchmark result

Question: [what was being compared]
Environment: [OS, CPU if known, hyperfine version]
Method: [warm/cold cache, warmups, runs/min-runs, hooks, exports]
Commands:
- [label]: `[command]`

Result:
[short summary; include median/mean and whether difference is distinguishable]

Artifacts:
- JSON: `[path]`
- Markdown: `[path]`

Caveats:
- [noise, CI runner limits, cache state, inconclusive intervals]
```
