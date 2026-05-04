# Hyperfine Recipes

## Table of Contents

- [Compare common alternatives](#compare-common-alternatives)
- [Very fast command](#very-fast-command)
- [Rust release vs debug vs cargo run](#rust-release-vs-debug-vs-cargo-run)
- [HTTP endpoint after service startup](#http-endpoint-after-service-startup)
- [Cold-cache file search on Linux](#cold-cache-file-search-on-linux)
- [Cold-cache file search on macOS](#cold-cache-file-search-on-macos)
- [Build-system thread sweep](#build-system-thread-sweep)
- [Compare implementations against main](#compare-implementations-against-main)
- [Compare implementations across parameterized baselines](#compare-implementations-across-parameterized-baselines)
- [Database benchmark with isolated state](#database-benchmark-with-isolated-state)
- [Track a CLI across recent git history](#track-a-cli-across-recent-git-history)

## Compare common alternatives

```bash
hyperfine --warmup 3 \
  -n 'candidate-a' 'cmd-a' \
  -n 'candidate-b' 'cmd-b' \
  --export-json bench.json \
  --export-markdown bench.md
```

## Very fast command

```bash
hyperfine -N --warmup 5 --min-runs 200 './bin --version'
```

Use `-N` only when no shell behavior is required.

## Rust release vs debug vs cargo run

```bash
hyperfine --warmup 2 \
  --setup 'cargo build --release && cargo build' \
  -n release './target/release/myapp' \
  -n debug './target/debug/myapp' \
  -n cargo-run 'cargo run --release -q'
```

## HTTP endpoint after service startup

```bash
hyperfine --setup './start-server.sh && sleep 1' \
  --cleanup './stop-server.sh' \
  --warmup 50 \
  --min-runs 200 \
  'curl -s http://localhost:8080/health > /dev/null'
```

Use high warmups for JVM, V8, Node, or other JIT-backed services.

## Cold-cache file search on Linux

```bash
sudo -v
hyperfine --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches' \
  --runs 20 \
  --export-json cold.json --export-markdown cold.md \
  -n 'rg'   'rg --no-ignore TODO ~/src' \
  -n 'fd'   'fd -tf -X grep TODO {} \; ~/src' \
  -n 'find' 'find ~/src -type f -exec grep -l TODO {} \;'
```

Pair with a warm-cache run without `--prepare` and report both.

## Cold-cache file search on macOS

```bash
sudo -v
hyperfine --prepare 'sync && sudo purge' \
  --runs 20 \
  --export-json cold.json --export-markdown cold.md \
  -n 'rg' 'rg --no-ignore TODO ~/src' \
  -n 'grep' 'grep -r TODO ~/src'
```

`purge` requires Xcode Command Line Tools.

## Build-system thread sweep

```bash
hyperfine --warmup 1 \
  --prepare 'make clean' \
  -P threads 1 16 \
  --export-json build-sweep.json \
  'make -j {threads}'
```

Visualize with hyperfine repository scripts when available:

```bash
python /path/to/hyperfine/scripts/plot_parameter_breakdown.py build-sweep.json -o sweep.png
```

## Compare implementations against main

```bash
hyperfine --warmup 3 --min-runs 50 \
  --reference './target/release/myapp-main' \
  --reference-name 'main' \
  './target/release/myapp-pr-a' \
  './target/release/myapp-pr-b' \
  --export-markdown pr-comparison.md \
  --export-json pr-comparison.json
```

## Compare implementations across parameterized baselines

For baseline-relative speedups at each parameter value, prefer a loop with one `--reference` run per value:

```bash
mkdir -p bench-by-thread
for threads in $(seq 1 16); do
  hyperfine --warmup 3 --min-runs 30 \
    --reference "./main --threads ${threads}" \
    --reference-name "main-${threads}" \
    -n "candidate-${threads}" "./candidate --threads ${threads}" \
    --export-json "bench-by-thread/${threads}.json" \
    --export-markdown "bench-by-thread/${threads}.md"
done
```

The JSON `command` field contains the command label when `-n` or `--reference-name` is used. To assemble a quick median-ratio table:

```bash
printf "%-8s %-12s %-12s %-10s\n" "Threads" "Main (s)" "Candidate (s)" "Speedup"
for threads in $(seq 1 16); do
  main_med=$(jq '.results[] | select(.command | test("main")) | .median' "bench-by-thread/${threads}.json")
  cand_med=$(jq '.results[] | select(.command | test("candidate")) | .median' "bench-by-thread/${threads}.json")
  speedup=$(awk -v main="$main_med" -v cand="$cand_med" 'BEGIN { printf "%.2f", main / cand }')
  printf "%-8d %-12s %-12s %-10s\n" "$threads" "$main_med" "$cand_med" "${speedup}x"
done
```

If wall time matters more than built-in relative summaries, run a combined sweep and compute ratios from JSON grouped by `parameters.threads`:

```bash
hyperfine --warmup 3 --min-runs 30 \
  -P threads 1 16 \
  --export-json thread-sweep.json \
  -n 'main' './main --threads {threads}' \
  -n 'candidate' './candidate --threads {threads}'
```

Do not add `--reference` to the combined sweep and do not assume the first command is used as the per-parameter baseline.

## Database benchmark with isolated state

```bash
hyperfine \
  --setup 'createdb bench && psql -d bench -f schema.sql' \
  --prepare 'psql -d bench -c "TRUNCATE foo CASCADE"; psql -d bench -f seed.sql' \
  --cleanup 'dropdb bench' \
  --warmup 3 --runs 30 \
  --export-json db.json \
  './target/release/queryapp'
```

Use `--prepare` for per-run database reset and `--setup`/`--cleanup` for database lifecycle.

## Track a CLI across recent git history

```bash
mkdir -p bench
current=$(git rev-parse --abbrev-ref HEAD)
for sha in $(git log --pretty=%h -n 30 origin/main); do
  git checkout "$sha" --quiet
  cargo build --release --quiet
  hyperfine --warmup 3 --export-json "bench/${sha}.json" \
    './target/release/myapp bench-input.json'
done
git checkout "$current" --quiet
python /path/to/hyperfine/scripts/plot_benchmarks.py bench/*.json -o history.png
```

Warn before running recipes that modify the working tree. Prefer a clean clone or worktree for historical benchmarks.
