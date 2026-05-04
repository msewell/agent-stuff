# Hyperfine Noise Control

## Choose a cache story

Warm-cache and cold-cache numbers answer different questions. Do not mix them in one comparison.

Warm-cache steady-state default:

```bash
hyperfine --warmup 3 'cmd-a' 'cmd-b'
```

Cold-cache Linux:

```bash
sudo -v
hyperfine --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches' \
  'rg --no-ignore TODO ~/src' \
  'grep -r TODO ~/src'
```

Cold-cache macOS:

```bash
sudo -v
hyperfine --prepare 'sync && sudo purge' \
  'rg --no-ignore TODO ~/src' \
  'grep -r TODO ~/src'
```

Run `sudo -v` first so an authentication prompt cannot interrupt a benchmark run.

## Handle fast commands

For commands under about 5 ms, shell calibration variance can dominate. Use direct execution and many runs:

```bash
hyperfine -N --warmup 5 --min-runs 200 './bin --version'
```

If the command needs shell syntax, wrap it in a script and benchmark the script or accept that shell overhead is part of what is being measured.

For sub-millisecond operations, prefer a language-native microbenchmark harness or benchmark an inner loop that repeats the operation many times.

## Reduce CPU and power-management noise

Linux:

```bash
sudo cpupower frequency-set -g performance
# run benchmarks
sudo cpupower frequency-set -g schedutil
```

For maximum reproducibility, consider disabling Turbo Boost when that matches the benchmark goal.

macOS:

- Plug in AC power.
- Disable Low Power Mode.
- Keep thermal conditions consistent.
- Consider disabling Spotlight indexing during disk-heavy runs: `sudo mdutil -a -i off`; restore with `sudo mdutil -a -i on`.

## Isolate the process

Close avoidable background work: browsers, chat apps, Docker/containers, IDE file watchers, backup jobs, antivirus, and indexing.

Linux CPU pinning:

```bash
hyperfine 'taskset -c 2,3 ./bin'
```

For stricter Linux isolation, use cgroups or `systemd-run --scope` with CPU affinity. macOS has no `taskset` equivalent; `nice` may help priority but is not isolation.

## Avoid output artifacts

- Use default output suppression for measurements.
- Use `--show-output` only to debug correctness.
- Avoid benchmarking from environments where terminal redraw overhead matters. If in doubt, keep `--output null`.

## Repeatability check

Before reporting an optimization, run the same benchmark twice on the same machine. If medians are not stable within about 1%, treat the environment as too noisy for fine-grained claims.

When outlier warnings appear, look for cache effects, thermal drift, GC, scheduler interference, or neighboring processes. Do not hide warnings unless the cause is understood and irrelevant to the benchmark question.
