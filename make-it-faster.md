---
description: Make software measurably faster without changing behavior
argument-hint: "[scope, workload, metric, target, budget, or allowed tradeoffs]"
---

Make this software measurably faster for the workload that matters, without changing what it does or lowering output quality.

Optimization brief: ${@:-No specifics supplied. Infer what you can from the repository and ask only if an unresolved choice would materially change the work.}

1. **Define what “faster” means.** Read the repository guidance and inspect the relevant code, tests, and benchmarks. If the scope, workload, or metric is unspecified, infer it from the project and state your assumptions. Ask only if an unresolved choice would materially change the work—for example, startup latency versus steady-state throughput. If no numeric target is given, look for a reproducible gain large enough to matter to users and justify the change.

2. **Establish a baseline before editing the implementation.** Use the project’s existing benchmarks when they represent the workload; otherwise, create a minimal benchmark and run it on the unchanged code first. Measure the user-visible path where feasible. Use microbenchmarks to isolate bottlenecks, not as a substitute for end-to-end evidence. Include representative inputs at relevant sizes and conditions, plus cases likely to expose regressions. Record the baseline revision or working-tree state, commands, environment, and run conditions so the comparison is reproducible.

3. **Optimize autonomously within scope.** Profile or instrument the workload to find where time goes. Start with high-impact hypotheses, change one thing at a time where practical, and reprofile when the bottleneck moves. You may change algorithms, dependencies, build settings, or rewrite substantial code without asking. Prefer the simplest change that delivers a worthwhile gain. Preserve public behavior, output quality, supported platforms, and safety guarantees unless the task explicitly allows a tradeoff. Leave unrelated user changes untouched.

4. **Prove the gain.** Compare before and after on equivalent inputs and conditions, with the same measurement boundaries and required work. Use repeated runs and appropriate warmup, cache state, and load; don’t run competing benchmarks concurrently. If a build or configuration change is itself the optimization, identify it explicitly and keep other conditions comparable. Don’t game the benchmark: no special-casing fixtures, reducing work or precision, silently changing defaults, or moving required work outside the measured path. If the benchmark needs correction, rerun both versions with the corrected benchmark. Run relevant correctness checks and verify output quality directly where tests don’t cover it. Check for material regressions on other important workloads and in relevant resource use, such as peak memory.

5. **Keep only verified improvements.** Honor any effort budget. Continue past the target while there are clear, worthwhile wins; stop when credible remaining ideas are unlikely to pay off, the gains you can measure are within noise, or further gains would violate a constraint. If you miss the target, keep any worthwhile, verified improvement that meets the constraints and report the shortfall. If you can’t establish a trustworthy baseline or verify a candidate, don’t leave unverified optimization edits applied. Report the blocker and the exact check needed to proceed.

Report what changed and why, the benchmark commands and conditions, and a before/after table for all measured workloads. Include absolute values, relative changes, and any regressions or inconclusive results. State which correctness checks passed, what remains unverified, and whether the target was met.
