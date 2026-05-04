# Hyperfine Flag Reference

## Run count and warmup

- `-r, --runs N`: exactly `N` timed runs. Overrides min/max.
- `-m, --min-runs N`: at least `N` timed runs. Raise for fast or noisy commands.
- `-M, --max-runs N`: cap timed runs. Useful in CI.
- `-w, --warmup N`: `N` untimed runs before timing. Use for warm-cache, JIT, and steady-state measurements.

Hyperfine auto-determines runs with at least 10 runs and about 3 seconds of total wall time unless overridden.

## Lifecycle hooks

Execution order per command:

```text
--setup once
  repeat warmups:
    --prepare
    command untimed
    --conclude
  repeat timed runs:
    --prepare
    command timed
    --conclude
--cleanup once
```

Use:

- `--setup CMD`: one-shot setup per command, before all warmups and timed runs. Use for compilation, fixtures, or starting services.
- `--prepare CMD`: before every warmup and timed run. Use for dropping caches, resetting DB state, or recreating temp inputs.
- `--conclude CMD`: after every warmup and timed run. Use for per-run artifacts or killing helpers.
- `--cleanup CMD`: one-shot teardown per command. Use for stopping services or removing artifacts.

Hook strings support `{param}` interpolation. The environment variable `HYPERFINE_ITERATION` is available to hooks and commands.

## Shell control

- `--shell SHELL`: use a specific shell.
- `-N`, `--shell=none`: execute the binary directly. Use for commands under about 5 ms.

With `-N`, shell features do not work: no globbing, `~`, redirection, pipes, `&&`, `||`, shell builtins, functions, or aliases. Wrap complex command lines in a script if direct execution is still needed.

## Output and input

- `--show-output`: inherit stdout/stderr. Use only for debugging because output handling perturbs timing.
- `--output null`: discard stdout; this is the default and best for measurement.
- `--output pipe`, `--output inherit`, `--output FILE`: use only when output behavior is part of the benchmark question.
- `--input null` or `--input FILE`: control stdin.
- `--ignore-failure` or `--ignore-failure=1,2`: tolerate non-zero exits when failure is expected or intentionally benchmarked.

## Command names and baseline

- `-n, --command-name NAME`: label the immediately following command. Use labels for readable Markdown/JSON exports. In JSON, `command` is the label when a label is supplied. Pattern: `hyperfine -n old './old' -n new './new'`, with no duplicate commands appended later.
- `--reference CMD`: fix a baseline command for relative speed reporting.
- `--reference-name NAME`: label the reference.
- `--sort mean-time`, `--sort command`, `--sort auto`: control summary order.
- `--time-unit microsecond|millisecond|second`: affects display-oriented output, not JSON/CSV units.

`--reference` does not participate in `-L` or `-P` parameter sweeps. For parameterized baselines, list the baseline as a regular command and compute ratios from JSON per parameter value, or run one `hyperfine --reference` invocation per parameter value in a shell loop.

## Parameterization

- `-P, --parameter-scan VAR MIN MAX`: numeric sweep. Decimals are allowed.
- `-D, --parameter-step-size DELTA`: step size for `-P`; default is `1`.
- `-L, --parameter-list VAR a,b,c`: categorical sweep.

Multiple parameter flags multiply into a command matrix. Use `{VAR}` in commands and hooks.

Examples:

```bash
hyperfine -P threads 1 16 'make -j {threads}'
hyperfine -P delay 0.1 1.0 -D 0.1 'sleep {delay}'
hyperfine -L compiler gcc,clang -L opt 0,2,3 '{compiler} -O{opt} main.c'
```

## Export formats

- `--export-json FILE`: summary stats plus per-iteration timings, exit codes, parameters, and seconds-based values.
- `--export-csv FILE`: summary stats only, in seconds.
- `--export-markdown FILE`: summary stats; honors `--time-unit`.
- `--export-asciidoc FILE`: summary stats; honors `--time-unit`.
- `--export-orgmode FILE`: summary stats; honors `--time-unit`.

Pass `-` as the file path to write an export to stdout.

## Version gotchas

- The guidance assumes hyperfine v1.20.x.
- `--prepare` runs during warmups and timed runs since v1.9.
- The `-s` short flag means `--setup` in modern hyperfine; old scripts may have used it for style.
- Per-command `--output` and `--conclude` require newer hyperfine versions.
- `--ignore-failure=1,2,127` style exit-code lists require v1.20+.
