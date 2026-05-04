# Interpreting and Reporting Hyperfine Results

## Table of Contents

- [What to trust first](#what-to-trust-first)
- [Deciding whether a difference is real](#deciding-whether-a-difference-is-real)
- [Baselines](#baselines)
- [JSON shape](#json-shape)
- [Visualization](#visualization)
- [Result write-up checklist](#result-write-up-checklist)

## What to trust first

Hyperfine reports mean, standard deviation, min, max, median, and relative comparisons. Command runtime distributions are often right-skewed, so rare pauses can inflate the mean.

Use these defaults:

- Report median for human-facing performance claims when outliers or skew are visible.
- Include mean and standard deviation when comparing with tools that expect them.
- Increase `--min-runs` when detecting small effects.
- Treat outlier warnings as a prompt to investigate environment noise.

If `mean - median` is larger than about one standard deviation, prefer the median in prose and mention skew.

## Deciding whether a difference is real

Hyperfine's relative summary includes an uncertainty band. If the band crosses `1.0x`, do not claim a win or regression.

For more defensible comparisons, run two independent exports and compare them:

```bash
hyperfine --export-json a.json -r 50 './bin-a'
hyperfine --export-json b.json -r 50 './bin-b'
python /path/to/hyperfine/scripts/welch_ttest.py a.json b.json
```

Use Welch's t-test from the hyperfine repository when available. It expects two JSON export paths in this workflow; do not pass a single combined export unless you have verified the script supports that mode. If it is not available, state that the result is based on hyperfine's displayed confidence/relative intervals only.

## Baselines

Use `--reference` when the question is regression-oriented:

```bash
hyperfine --reference './bin-main' \
  --reference-name 'main' \
  './bin-pr'
```

Do not use `--reference` for parameterized baselines. It runs once verbatim while parameterized commands run once per parameter value. Instead, list the baseline as a normal command with the same `-L` or `-P` interpolation.

## JSON shape

`--export-json` produces `results[]`, one entry per command/parameter combination. If `-n` or `--reference-name` is used, `command` contains that label rather than the raw command. Common fields:

```json
{
  "command": "./target/release/simd",
  "parameters": { "impl": "simd" },
  "mean": 0.0123,
  "stddev": 0.0004,
  "median": 0.0122,
  "min": 0.0118,
  "max": 0.0135,
  "user": 0.011,
  "system": 0.001,
  "times": [0.0122, 0.0124],
  "exit_codes": [0, 0]
}
```

JSON and CSV values are in seconds regardless of `--time-unit`. Do not double-convert downstream.

## Visualization

Use hyperfine repository scripts with JSON exports when diagnosing distributions or parameter sweeps:

```bash
hyperfine --warmup 3 --export-json r.json 'cmd-a' 'cmd-b' 'cmd-c'
python /path/to/hyperfine/scripts/plot_whisker.py r.json -o whisker.png
python /path/to/hyperfine/scripts/plot_histogram.py r.json --bins 40 --log-count -o hist.png
python /path/to/hyperfine/scripts/plot_progression.py r.json -o progression.png
```

Use `plot_progression.py` for drift and interference:

- Slow upward drift suggests thermal throttling.
- Step changes suggest competing background work.
- Large isolated spikes suggest scheduler, GC, paging, or system interrupts.

Use `plot_parameter_breakdown.py` for `-P` and `-L` sweeps.

## Result write-up checklist

Before writing a result, confirm that the benchmark output came from a command you actually ran, user-supplied data, or a file you read. If you only designed the benchmark, write a plan instead of a result. Never fabricate timing tables, artifact paths, warnings, or environment details.

Include:

- The benchmark question.
- OS, CPU if known, and `hyperfine --version`.
- Full commands or command labels plus raw commands.
- Cache state: warm-cache, cold-cache, or both.
- Warmup and run-count settings.
- Hooks: `--setup`, `--prepare`, `--conclude`, `--cleanup`.
- Export paths.
- Result summary with uncertainty and caveats.

Avoid overclaiming:

- Say "inconclusive" when uncertainty overlaps.
- Say "on this machine" unless the benchmark covers multiple environments.
- Say "warm-cache" or "cold-cache" explicitly for I/O-bound tools.
